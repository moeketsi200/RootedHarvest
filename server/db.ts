import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";
import path from "path";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const dbPath = path.resolve(process.cwd(), "sqlite.db");
export const sqlite = new Database(dbPath);

// Enable WAL mode and foreign keys for better performance and integrity
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Initialize tables if they don't already exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    user_type TEXT NOT NULL,
    location TEXT,
    email_verified INTEGER DEFAULT 0,
    verification_code TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS crops (
    id TEXT PRIMARY KEY,
    farmer_id TEXT NOT NULL REFERENCES users(id),
    crop_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price TEXT NOT NULL,
    harvest_date TEXT NOT NULL,
    donation_flag INTEGER DEFAULT 0,
    status TEXT DEFAULT 'available',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    crop_id TEXT NOT NULL REFERENCES crops(id),
    community_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    requested_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Safe migration for existing SQLite databases
try {
  sqlite.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;");
} catch {
  // column already exists
}
try {
  sqlite.exec("ALTER TABLE users ADD COLUMN verification_code TEXT;");
} catch {
  // column already exists
}

// Make sure demo farmer and buyer are marked verified if they already exist
try {
  sqlite.prepare("UPDATE users SET email_verified = 1 WHERE email IN ('farmer@rooted.org', 'buyer@rooted.org')").run();
} catch {}

export const db = drizzle(sqlite, { schema });

// Seed initial South African data if database is empty
export function seedDatabase(force: boolean = false) {
  const userCount = sqlite.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0 || force) {
    if (force) {
      sqlite.exec("DELETE FROM donations; DELETE FROM crops; DELETE FROM users;");
    }

    console.log("Seeding SQLite database with South African demo accounts and crops...");

    const passwordHash = bcrypt.hashSync("password123", 10);
    const farmerId = randomUUID();
    const buyerId = randomUUID();
    const unverifiedFarmerId = randomUUID();

    // Insert demo South African farmer (Verified)
    sqlite.prepare(`
      INSERT INTO users (id, email, password, name, user_type, location, email_verified, verification_code)
      VALUES (?, ?, ?, ?, ?, ?, 1, NULL)
    `).run(
      farmerId,
      "farmer@rooted.org",
      passwordHash,
      "Sipho van der Merwe",
      "farmer",
      "Stellenbosch, Western Cape"
    );

    // Insert demo South African buyer (Verified)
    sqlite.prepare(`
      INSERT INTO users (id, email, password, name, user_type, location, email_verified, verification_code)
      VALUES (?, ?, ?, ?, ?, ?, 1, NULL)
    `).run(
      buyerId,
      "buyer@rooted.org",
      passwordHash,
      "Sarah Jenkins",
      "buyer",
      "Cape Town, Western Cape"
    );

    // Insert demo South African farmer (Unverified for testing email verification gate)
    sqlite.prepare(`
      INSERT INTO users (id, email, password, name, user_type, location, email_verified, verification_code)
      VALUES (?, ?, ?, ?, ?, ?, 0, '482910')
    `).run(
      unverifiedFarmerId,
      "unverified@rooted.org",
      passwordHash,
      "Lindiwe Khumalo",
      "farmer",
      "Paarl, Western Cape"
    );

    // Insert demo crops (quantities in kg, prices in ZAR per kg)
    const sampleCrops = [
      {
        id: randomUUID(),
        farmerId,
        cropName: "Organic Heirloom Tomatoes",
        quantity: 350, // kg
        price: "24.50", // R24.50/kg
        harvestDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        donationFlag: 0,
        status: "available",
      },
      {
        id: randomUUID(),
        farmerId,
        cropName: "Crisp Bell Peppers Mix",
        quantity: 200, // kg
        price: "32.00", // R32.00/kg
        harvestDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        donationFlag: 0,
        status: "available",
      },
      {
        id: randomUUID(),
        farmerId,
        cropName: "Fresh Baby Spinach",
        quantity: 80, // kg
        price: "38.50", // R38.50/kg
        harvestDate: new Date(Date.now() + 1 * 86400000).toISOString(),
        donationFlag: 0,
        status: "available",
      },
      {
        id: randomUUID(),
        farmerId,
        cropName: "Surplus Sweet Potatoes",
        quantity: 150, // kg
        price: "14.00", // R14.00/kg
        harvestDate: new Date().toISOString(),
        donationFlag: 1,
        status: "available",
      },
    ];

    for (const crop of sampleCrops) {
      sqlite.prepare(`
        INSERT INTO crops (id, farmer_id, crop_name, quantity, price, harvest_date, donation_flag, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        crop.id,
        crop.farmerId,
        crop.cropName,
        crop.quantity,
        crop.price,
        crop.harvestDate,
        crop.donationFlag,
        crop.status
      );
    }

    // Insert demo donation request
    sqlite.prepare(`
      INSERT INTO donations (id, crop_id, community_name, status)
      VALUES (?, ?, ?, ?)
    `).run(
      randomUUID(),
      sampleCrops[3].id,
      "Gift of the Givers Community Kitchen (Khayelitsha)",
      "pending"
    );

    console.log("South African database seeded successfully!");
  }
}

seedDatabase();
