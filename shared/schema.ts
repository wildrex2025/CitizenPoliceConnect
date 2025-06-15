import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 15 }).notNull().unique(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  complainantId: integer("complainant_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 'crime', 'traffic', 'corruption', 'other'
  priority: varchar("priority", { length: 20 }).notNull().default('medium'), // 'low', 'medium', 'high', 'urgent'
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'in_progress', 'resolved', 'closed'
  location: json("location"), // {lat: number, lng: number, address: string}
  isAnonymous: boolean("is_anonymous").default(false),
  attachments: json("attachments").default([]), // array of file URLs
  assignedOfficerId: integer("assigned_officer_id").references(() => policeOfficers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const firs = pgTable("firs", {
  id: serial("id").primaryKey(),
  firNumber: varchar("fir_number", { length: 50 }).notNull().unique(),
  complaintId: integer("complaint_id").references(() => complaints.id),
  complainantId: integer("complainant_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: json("location"),
  status: varchar("status", { length: 20 }).notNull().default('registered'), // 'registered', 'investigating', 'completed', 'closed'
  investigatingOfficerId: integer("investigating_officer_id").references(() => policeOfficers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const policeOfficers = pgTable("police_officers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rank: varchar("rank", { length: 50 }).notNull(),
  badgeNumber: varchar("badge_number", { length: 20 }).notNull().unique(),
  phone: varchar("phone", { length: 15 }).notNull(),
  email: varchar("email", { length: 255 }),
  station: varchar("station", { length: 100 }).notNull(),
  beat: varchar("beat", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trafficViolations = pgTable("traffic_violations", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => users.id),
  vehicleNumber: varchar("vehicle_number", { length: 20 }),
  violationType: varchar("violation_type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  location: json("location"),
  attachments: json("attachments").default([]),
  status: varchar("status", { length: 20 }).notNull().default('reported'), // 'reported', 'verified', 'processed', 'closed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  number: varchar("number", { length: 15 }).notNull(),
  type: varchar("type", { length: 30 }).notNull(), // 'police', 'ambulance', 'fire', 'women_helpline'
  isActive: boolean("is_active").default(true),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  officerId: integer("officer_id").references(() => policeOfficers.id),
  rating: integer("rating").notNull(), // 1-5 scale
  comment: text("comment"),
  category: varchar("category", { length: 50 }).notNull(), // 'service', 'behavior', 'response_time', 'general'
  createdAt: timestamp("created_at").defaultNow(),
});

export const sosAlerts = pgTable("sos_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  location: json("location").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('active'), // 'active', 'responded', 'false_alarm', 'resolved'
  respondingOfficerId: integer("responding_officer_id").references(() => policeOfficers.id),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  assignedOfficerId: true,
});

export const insertFirSchema = createInsertSchema(firs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrafficViolationSchema = createInsertSchema(trafficViolations).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const insertSosAlertSchema = createInsertSchema(sosAlerts).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
  respondingOfficerId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;

export type InsertFir = z.infer<typeof insertFirSchema>;
export type Fir = typeof firs.$inferSelect;

export type InsertTrafficViolation = z.infer<typeof insertTrafficViolationSchema>;
export type TrafficViolation = typeof trafficViolations.$inferSelect;

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

export type InsertSosAlert = z.infer<typeof insertSosAlertSchema>;
export type SosAlert = typeof sosAlerts.$inferSelect;

export type PoliceOfficer = typeof policeOfficers.$inferSelect;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
