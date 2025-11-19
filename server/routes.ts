import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPortfolioEntrySchema, updateUserSettingsSchema } from "@shared/schema";
import type { MarketIndexData, LeaderboardStats } from "@shared/schema";
import { authenticateUser } from "./middleware/auth";

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY || "";

// Cache for market data (refresh every 24 hours)
let marketDataCache: { data: MarketIndexData[]; timestamp: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function registerRoutes(app: Express): Promise<Server> {
  // Portfolio entry endpoints
  app.get("/api/portfolio/entries", authenticateUser, async (req, res) => {
    try {
      // In a real app, get userId from session/auth token
      // For this demo, we'll use a header or mock user
      const userId = req.headers["x-user-id"] as string;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const entries = await storage.getPortfolioEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching portfolio entries:", error);
      res.status(500).json({ error: "Failed to fetch portfolio entries" });
    }
  });

  app.post("/api/portfolio/entries", authenticateUser, async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Ensure user exists in storage (will be created with proper email from JWT if needed)
      // Note: In production, user creation should happen during signup
      // This is a fallback for existing Supabase users
      const userEmail = req.headers["x-user-email"] as string || `user-${userId}@placeholder.com`;
      await storage.ensureUserExists(userId, userEmail);

      // Validate request body
      const validationResult = insertPortfolioEntrySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationResult.error.errors 
        });
      }

      const entry = await storage.createPortfolioEntry(userId, validationResult.data);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating portfolio entry:", error);
      res.status(500).json({ error: "Failed to create portfolio entry" });
    }
  });

  // Market indices endpoint
  app.get("/api/market/indices", async (req, res) => {
    try {
      // Check cache first
      if (marketDataCache && Date.now() - marketDataCache.timestamp < CACHE_DURATION) {
        return res.json(marketDataCache.data);
      }

      // Fetch market data from Alpha Vantage
      const indices = [
        { symbol: "SPY", name: "S&P 500" },
      ];

      const marketData: MarketIndexData[] = [];

      for (const index of indices) {
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${index.symbol}&apikey=${ALPHA_VANTAGE_KEY}&outputsize=compact`
          );
          
          const data = await response.json();
          
          if (data["Time Series (Daily)"]) {
            const timeSeries = data["Time Series (Daily)"];
            const dates = Object.keys(timeSeries).slice(0, 90); // Last 90 days
            
            if (dates.length > 0) {
              const basePrice = parseFloat(timeSeries[dates[dates.length - 1]]["4. close"]);
              
              const percentChanges = dates.reverse().map((date) => {
                const closePrice = parseFloat(timeSeries[date]["4. close"]);
                const percentChange = ((closePrice - basePrice) / basePrice) * 100;
                return { date, percentChange };
              });

              marketData.push({
                symbol: index.symbol,
                name: index.name,
                data: percentChanges,
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching ${index.symbol} data:`, error);
          // Continue with other indices if one fails
        }
      }

      // Update cache
      marketDataCache = {
        data: marketData,
        timestamp: Date.now(),
      };

      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market indices:", error);
      res.status(500).json({ error: "Failed to fetch market indices" });
    }
  });

  // Get current user endpoint
  app.get("/api/user/settings", authenticateUser, async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ error: "Failed to fetch user settings" });
    }
  });

  // User settings endpoint
  app.patch("/api/user/settings", authenticateUser, async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Validate request body
      const validationResult = updateUserSettingsSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationResult.error.errors 
        });
      }

      const updatedUser = await storage.updateUserSettings(userId, validationResult.data);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Public leaderboard endpoint
  app.get("/api/leaderboard/public", async (req, res) => {
    try {
      const leaderboardData = await storage.getPublicLeaderboard();
      
      const publicLeaderboard = leaderboardData.map((entry, index) => ({
        userId: entry.user.id,
        displayName: entry.user.displayName || entry.user.email.split('@')[0],
        email: entry.user.email,
        percentChange: entry.percentChange,
        currentValue: entry.currentValue,
        rank: index + 1,
      }));

      res.json(publicLeaderboard);
    } catch (error) {
      console.error("Error fetching public leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch public leaderboard" });
    }
  });

  // Admin endpoint to remove user from leaderboard (master account only)
  app.post("/api/admin/remove-from-leaderboard", authenticateUser, async (req, res) => {
    try {
      const adminId = req.headers["x-user-id"] as string;

      // Check if user is master account
      const adminUser = await storage.getUser(adminId);
      if (!adminUser || !adminUser.isMaster) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      const { userId } = req.body;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: "Valid user ID required" });
      }

      await storage.removeUserFromLeaderboard(userId);
      res.json({ success: true, message: "User removed from leaderboard" });
    } catch (error) {
      console.error("Error removing user from leaderboard:", error);
      res.status(500).json({ error: "Failed to remove user" });
    }
  });

  // Leaderboard endpoint
  app.get("/api/leaderboard", authenticateUser, async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userEntries = await storage.getPortfolioEntries(userId);
      
      if (userEntries.length < 2) {
        return res.json({
          userPercentChange: 0,
          averagePercentChange: 0,
          userRank: "N/A",
          totalUsers: 0,
        });
      }

      // Calculate user's performance
      const sortedUserEntries = [...userEntries].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const userFirstValue = parseFloat(sortedUserEntries[0].value);
      const userLastValue = parseFloat(sortedUserEntries[sortedUserEntries.length - 1].value);
      const userPercentChange = ((userLastValue - userFirstValue) / userFirstValue) * 100;

      // Get all users' performance
      const allPerformances = await storage.getAllUsersPerformance();
      
      if (allPerformances.length === 0) {
        return res.json({
          userPercentChange,
          averagePercentChange: userPercentChange,
          userRank: "Top 100%",
          totalUsers: 1,
        });
      }

      // Calculate average
      const averagePercentChange = allPerformances.reduce(
        (sum, p) => sum + p.percentChange, 
        0
      ) / allPerformances.length;

      // Calculate user's rank
      const sortedPerformances = allPerformances.sort((a, b) => b.percentChange - a.percentChange);
      const userPosition = sortedPerformances.findIndex((p) => p.userId === userId) + 1;
      const totalUsers = allPerformances.length;
      const percentile = (userPosition / totalUsers) * 100;

      let userRank = "N/A";
      if (percentile <= 10) {
        userRank = "Top 10%";
      } else if (percentile <= 25) {
        userRank = "Top 25%";
      } else if (percentile <= 50) {
        userRank = "Top 50%";
      } else if (percentile <= 75) {
        userRank = "Top 75%";
      } else {
        userRank = "Bottom 25%";
      }

      const stats: LeaderboardStats = {
        userPercentChange,
        averagePercentChange,
        userRank,
        totalUsers,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
