import { 
  type User, 
  type InsertUser, 
  type Crop, 
  type InsertCrop, 
  type Donation, 
  type InsertDonation,
  users,
  crops,
  donations
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUserEmail(userId: string): Promise<User>;
  setUserVerificationCode(userId: string, code: string): Promise<User>;
  toggleUserVerification(userId: string): Promise<User>;
  
  // Crop methods
  getCrop(id: string): Promise<Crop | undefined>;
  getCropsByFarmer(farmerId: string): Promise<Crop[]>;
  getMarketplaceCrops(): Promise<Crop[]>;
  createCrop(crop: InsertCrop): Promise<Crop>;
  updateCrop(id: string, updates: Partial<Crop>): Promise<Crop | undefined>;
  
  // Donation methods
  getDonation(id: string): Promise<Donation | undefined>;
  getDonationRequests(): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonation(id: string, updates: Partial<Donation>): Promise<Donation | undefined>;
}

export class SqliteStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = db.select().from(users).where(eq(users.id, id)).get();
    return result;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = db.select().from(users).where(eq(users.email, email)).get();
    return result;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = {
      ...insertUser,
      id,
      location: insertUser.location || null,
      emailVerified: false,
      verificationCode,
    };
    db.insert(users).values(newUser).run();
    const created = db.select().from(users).where(eq(users.id, id)).get();
    if (!created) {
      throw new Error("Failed to create user");
    }
    return created;
  }

  async verifyUserEmail(userId: string): Promise<User> {
    db.update(users).set({ emailVerified: true }).where(eq(users.id, userId)).run();
    const updated = db.select().from(users).where(eq(users.id, userId)).get();
    if (!updated) {
      throw new Error("User not found");
    }
    return updated;
  }

  async setUserVerificationCode(userId: string, code: string): Promise<User> {
    db.update(users).set({ verificationCode: code }).where(eq(users.id, userId)).run();
    const updated = db.select().from(users).where(eq(users.id, userId)).get();
    if (!updated) {
      throw new Error("User not found");
    }
    return updated;
  }

  async toggleUserVerification(userId: string): Promise<User> {
    const current = await this.getUser(userId);
    if (!current) throw new Error("User not found");
    const newStatus = !current.emailVerified;
    db.update(users).set({ emailVerified: newStatus }).where(eq(users.id, userId)).run();
    return (await this.getUser(userId))!;
  }

  // Crop methods
  async getCrop(id: string): Promise<Crop | undefined> {
    const result = db.select().from(crops).where(eq(crops.id, id)).get();
    return result;
  }

  async getCropsByFarmer(farmerId: string): Promise<Crop[]> {
    return db.select().from(crops).where(eq(crops.farmerId, farmerId)).all();
  }

  async getMarketplaceCrops(): Promise<Crop[]> {
    return db
      .select()
      .from(crops)
      .where(and(eq(crops.donationFlag, false), eq(crops.status, "available")))
      .all();
  }

  async createCrop(insertCrop: InsertCrop): Promise<Crop> {
    const id = randomUUID();
    const newCrop = {
      ...insertCrop,
      id,
      status: "available",
      donationFlag: insertCrop.donationFlag || false,
    };
    db.insert(crops).values(newCrop).run();
    const created = db.select().from(crops).where(eq(crops.id, id)).get();
    if (!created) {
      throw new Error("Failed to create crop");
    }
    return created;
  }

  async updateCrop(id: string, updates: Partial<Crop>): Promise<Crop | undefined> {
    db.update(crops).set(updates).where(eq(crops.id, id)).run();
    return db.select().from(crops).where(eq(crops.id, id)).get();
  }

  // Donation methods
  async getDonation(id: string): Promise<Donation | undefined> {
    return db.select().from(donations).where(eq(donations.id, id)).get();
  }

  async getDonationRequests(): Promise<Donation[]> {
    return db.select().from(donations).all();
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = randomUUID();
    const newDonation = {
      ...insertDonation,
      id,
      status: "pending",
    };
    db.insert(donations).values(newDonation).run();
    const created = db.select().from(donations).where(eq(donations.id, id)).get();
    if (!created) {
      throw new Error("Failed to create donation");
    }
    return created;
  }

  async updateDonation(id: string, updates: Partial<Donation>): Promise<Donation | undefined> {
    db.update(donations).set(updates).where(eq(donations.id, id)).run();
    return db.select().from(donations).where(eq(donations.id, id)).get();
  }
}

export const storage = new SqliteStorage();
