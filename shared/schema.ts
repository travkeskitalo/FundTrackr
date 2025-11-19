import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  isPublic: boolean("is_public").default(false).notNull(),
  isMaster: boolean("is_master").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const portfolioEntries = pgTable("portfolio_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  isMaster: true, // Prevent users from setting isMaster
}).extend({
  email: z.string().email("Please enter a valid email address"),
});

// Separate schema for signup that includes password (used for Supabase auth, not stored in our DB)
export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertPortfolioEntrySchema = createInsertSchema(portfolioEntries).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  value: z.string().min(1, "Portfolio value is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    "Please enter a valid positive number"
  ),
  date: z.coerce.date(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPortfolioEntry = z.infer<typeof insertPortfolioEntrySchema>;
export type PortfolioEntry = typeof portfolioEntries.$inferSelect;

// API response types
export type AuthResponse = {
  user: User;
  message: string;
};

export type MarketIndexData = {
  symbol: string;
  name: string;
  data: { date: string; percentChange: number }[];
};

export type LeaderboardStats = {
  userPercentChange: number;
  averagePercentChange: number;
  userRank: string;
  totalUsers: number;
};

export type PublicLeaderboardEntry = {
  userId: string;
  displayName: string;
  email: string;
  percentChange: number;
  currentValue: number;
  rank: number;
};

export const updateUserSettingsSchema = z.object({
  displayName: z.string().max(50).optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateUserSettingsSchema = z.infer<typeof updateUserSettingsSchema>;
