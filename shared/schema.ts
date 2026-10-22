import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  userType: text("user_type").notNull(), // 'farmer' | 'buyer'
  location: text("location"),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  verificationCode: text("verification_code"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const crops = sqliteTable("crops", {
  id: text("id").primaryKey(),
  farmerId: text("farmer_id").notNull().references(() => users.id),
  cropName: text("crop_name").notNull(),
  quantity: integer("quantity").notNull(),
  price: text("price").notNull(),
  harvestDate: text("harvest_date").notNull(),
  donationFlag: integer("donation_flag", { mode: "boolean" }).default(false),
  status: text("status").default('available'), // 'available' | 'sold' | 'donated'
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const donations = sqliteTable("donations", {
  id: text("id").primaryKey(),
  cropId: text("crop_id").notNull().references(() => crops.id),
  communityName: text("community_name").notNull(),
  status: text("status").default('pending'), // 'pending' | 'accepted' | 'declined' | 'completed'
  requestedAt: text("requested_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCropSchema = createInsertSchema(crops)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    price: z.union([z.string(), z.number()]).transform((val) => String(val)),
    quantity: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  });

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  requestedAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCrop = z.infer<typeof insertCropSchema>;
export type Crop = typeof crops.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;
