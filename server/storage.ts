import { type User, type InsertUser, type PortfolioEntry, type InsertPortfolioEntry } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser, customId?: string): Promise<User>;
  
  getPortfolioEntries(userId: string): Promise<PortfolioEntry[]>;
  createPortfolioEntry(userId: string, entry: InsertPortfolioEntry): Promise<PortfolioEntry>;
  
  getAllUsersPerformance(): Promise<{ userId: string; percentChange: number }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private portfolioEntries: Map<string, PortfolioEntry>;

  constructor() {
    this.users = new Map();
    this.portfolioEntries = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser, customId?: string): Promise<User> {
    const id = customId || randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getPortfolioEntries(userId: string): Promise<PortfolioEntry[]> {
    return Array.from(this.portfolioEntries.values())
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async createPortfolioEntry(userId: string, insertEntry: InsertPortfolioEntry): Promise<PortfolioEntry> {
    const id = randomUUID();
    const entry: PortfolioEntry = {
      id,
      userId,
      value: insertEntry.value,
      date: insertEntry.date,
      createdAt: new Date(),
    };
    this.portfolioEntries.set(id, entry);
    return entry;
  }

  async getAllUsersPerformance(): Promise<{ userId: string; percentChange: number }[]> {
    const userPerformances: { userId: string; percentChange: number }[] = [];
    const userIds = Array.from(this.users.keys());

    for (const userId of userIds) {
      const entries = await this.getPortfolioEntries(userId);
      if (entries.length >= 2) {
        const sortedEntries = [...entries].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const firstValue = parseFloat(sortedEntries[0].value);
        const lastValue = parseFloat(sortedEntries[sortedEntries.length - 1].value);
        const percentChange = ((lastValue - firstValue) / firstValue) * 100;
        userPerformances.push({ userId, percentChange });
      }
    }

    return userPerformances;
  }
}

export const storage = new MemStorage();
