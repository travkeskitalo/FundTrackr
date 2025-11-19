import { users, portfolioEntries, type User, type InsertUser, type PortfolioEntry, type InsertPortfolioEntry, type UpdateUserSettingsSchema } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  ensureUserExists(userId: string, email: string): Promise<User>;
  updateUserSettings(userId: string, settings: UpdateUserSettingsSchema): Promise<User>;
  removeUserFromLeaderboard(userId: string): Promise<void>;
  
  getPortfolioEntries(userId: string): Promise<PortfolioEntry[]>;
  createPortfolioEntry(userId: string, entry: InsertPortfolioEntry): Promise<PortfolioEntry>;
  deletePortfolioEntry(entryId: string, userId: string): Promise<void>;
  
  getAllUsersPerformance(): Promise<{ userId: string; percentChange: number }[]>;
  getPublicLeaderboard(): Promise<{ user: User; percentChange: number; currentValue: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: insertUser.id!,
        email: insertUser.email,
        displayName: insertUser.displayName || null,
        isPublic: insertUser.isPublic || false,
      })
      .returning();
    return user;
  }

  async ensureUserExists(userId: string, email: string): Promise<User> {
    let user = await this.getUser(userId);
    if (!user) {
      user = await this.createUser({ id: userId, email });
    }
    return user;
  }

  async updateUserSettings(userId: string, settings: UpdateUserSettingsSchema): Promise<User> {
    const [user] = await db
      .update(users)
      .set(settings)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async removeUserFromLeaderboard(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ isPublic: false })
      .where(eq(users.id, userId));
  }

  async getPortfolioEntries(userId: string): Promise<PortfolioEntry[]> {
    return await db
      .select()
      .from(portfolioEntries)
      .where(eq(portfolioEntries.userId, userId))
      .orderBy(portfolioEntries.date);
  }

  async createPortfolioEntry(userId: string, insertEntry: InsertPortfolioEntry): Promise<PortfolioEntry> {
    const [entry] = await db
      .insert(portfolioEntries)
      .values({
        userId,
        value: insertEntry.value,
        date: insertEntry.date,
      })
      .returning();
    return entry;
  }

  async deletePortfolioEntry(entryId: string, userId: string): Promise<void> {
    await db
      .delete(portfolioEntries)
      .where(and(eq(portfolioEntries.id, entryId), eq(portfolioEntries.userId, userId)));
  }

  async getAllUsersPerformance(): Promise<{ userId: string; percentChange: number }[]> {
    const allUsers = await db.select().from(users);
    const userPerformances: { userId: string; percentChange: number }[] = [];

    for (const user of allUsers) {
      const entries = await this.getPortfolioEntries(user.id);
      if (entries.length >= 2) {
        const sortedEntries = [...entries].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const firstValue = parseFloat(sortedEntries[0].value);
        const lastValue = parseFloat(sortedEntries[sortedEntries.length - 1].value);
        const percentChange = ((lastValue - firstValue) / firstValue) * 100;
        userPerformances.push({ userId: user.id, percentChange });
      }
    }

    return userPerformances;
  }

  async getPublicLeaderboard(): Promise<{ user: User; percentChange: number; currentValue: number }[]> {
    const publicUsers = await db.select().from(users).where(eq(users.isPublic, true));
    const leaderboardData: { user: User; percentChange: number; currentValue: number }[] = [];

    for (const user of publicUsers) {
      const entries = await this.getPortfolioEntries(user.id);
      if (entries.length >= 2) {
        const sortedEntries = [...entries].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const firstValue = parseFloat(sortedEntries[0].value);
        const lastValue = parseFloat(sortedEntries[sortedEntries.length - 1].value);
        const percentChange = ((lastValue - firstValue) / firstValue) * 100;
        leaderboardData.push({ user, percentChange, currentValue: lastValue });
      }
    }

    // Sort by percent change descending
    return leaderboardData.sort((a, b) => b.percentChange - a.percentChange);
  }
}

export const storage = new DatabaseStorage();
