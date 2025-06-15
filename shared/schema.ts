import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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
  alertType: varchar("alert_type", { length: 30 }).notNull().default('general'), // 'general', 'women_safety', 'child_emergency', 'medical', 'silent'
  isVoiceActivated: boolean("is_voice_activated").default(false),
  isSilentAlert: boolean("is_silent_alert").default(false),
  audioRecording: text("audio_recording"), // URL to audio file
  medicalInfo: json("medical_info"), // blood group, medical conditions
  respondingOfficerId: integer("responding_officer_id").references(() => policeOfficers.id),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Women Safety Module
export const womenSafetyReports = pgTable("women_safety_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => users.id),
  incidentType: varchar("incident_type", { length: 50 }).notNull(), // 'harassment', 'stalking', 'inappropriate_behavior', 'unsafe_area'
  location: json("location").notNull(),
  description: text("description").notNull(),
  timeOfIncident: timestamp("time_of_incident").notNull(),
  severityLevel: varchar("severity_level", { length: 20 }).notNull(), // 'low', 'medium', 'high', 'critical'
  status: varchar("status", { length: 20 }).notNull().default('reported'), // 'reported', 'investigating', 'resolved', 'closed'
  isAnonymous: boolean("is_anonymous").default(false),
  attachments: json("attachments").default([]),
  assignedOfficerId: integer("assigned_officer_id").references(() => policeOfficers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const safeRoutes = pgTable("safe_routes", {
  id: serial("id").primaryKey(),
  routeName: text("route_name").notNull(),
  startLocation: json("start_location").notNull(),
  endLocation: json("end_location").notNull(),
  waypoints: json("waypoints").default([]),
  safetyRating: integer("safety_rating").notNull(), // 1-5 scale
  timeOfDay: varchar("time_of_day", { length: 20 }).notNull(), // 'morning', 'afternoon', 'evening', 'night'
  features: json("features").default([]), // ['well_lit', 'cctv_coverage', 'police_patrol', 'crowded_area']
  lastUpdated: timestamp("last_updated").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Child Protection Module
export const childSafetyAlerts = pgTable("child_safety_alerts", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  parentId: integer("parent_id").references(() => users.id),
  childName: text("child_name").notNull(),
  childAge: integer("child_age").notNull(),
  alertType: varchar("alert_type", { length: 30 }).notNull(), // 'missing', 'route_deviation', 'cyber_bullying', 'unsafe_contact'
  location: json("location"),
  expectedLocation: json("expected_location"),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default('active'), // 'active', 'investigating', 'found', 'resolved'
  priority: varchar("priority", { length: 20 }).notNull().default('high'), // 'medium', 'high', 'critical'
  lastSeenAt: timestamp("last_seen_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const childRouteTracking = pgTable("child_route_tracking", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  parentId: integer("parent_id").references(() => users.id),
  routeName: text("route_name").notNull(), // 'school_to_home', 'home_to_tuition'
  expectedRoute: json("expected_route").notNull(),
  currentLocation: json("current_location"),
  isOnRoute: boolean("is_on_route").default(true),
  alertThreshold: integer("alert_threshold").default(100), // meters
  isActive: boolean("is_active").default(true),
  lastUpdate: timestamp("last_update").defaultNow(),
});

// Cyber Crime Module
export const cyberCrimeReports = pgTable("cyber_crime_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => users.id),
  crimeType: varchar("crime_type", { length: 50 }).notNull(), // 'phishing', 'online_fraud', 'identity_theft', 'cyberbullying', 'fake_news'
  platform: varchar("platform", { length: 50 }), // 'whatsapp', 'facebook', 'instagram', 'email', 'website'
  suspiciousUrl: text("suspicious_url"),
  description: text("description").notNull(),
  financialLoss: integer("financial_loss").default(0),
  evidence: json("evidence").default([]), // screenshots, chat logs, etc.
  status: varchar("status", { length: 20 }).notNull().default('reported'),
  priority: varchar("priority", { length: 20 }).notNull().default('medium'),
  assignedOfficerId: integer("assigned_officer_id").references(() => policeOfficers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community Policing
export const neighborhoodWatch = pgTable("neighborhood_watch", {
  id: serial("id").primaryKey(),
  groupName: text("group_name").notNull(),
  coordinatorId: integer("coordinator_id").references(() => users.id),
  area: json("area").notNull(), // polygon coordinates
  members: json("members").default([]), // array of user IDs
  description: text("description"),
  meetingSchedule: varchar("meeting_schedule", { length: 100 }),
  contactNumber: varchar("contact_number", { length: 15 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityReports = pgTable("community_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => users.id),
  watchGroupId: integer("watch_group_id").references(() => neighborhoodWatch.id),
  reportType: varchar("report_type", { length: 50 }).notNull(), // 'suspicious_activity', 'safety_concern', 'maintenance_issue'
  location: json("location").notNull(),
  description: text("description").notNull(),
  urgency: varchar("urgency", { length: 20 }).notNull().default('medium'), // 'low', 'medium', 'high'
  status: varchar("status", { length: 20 }).notNull().default('reported'),
  attachments: json("attachments").default([]),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertWomenSafetyReportSchema = createInsertSchema(womenSafetyReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  assignedOfficerId: true,
});

export const insertSafeRouteSchema = createInsertSchema(safeRoutes).omit({
  id: true,
  lastUpdated: true,
});

export const insertChildSafetyAlertSchema = createInsertSchema(childSafetyAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertChildRouteTrackingSchema = createInsertSchema(childRouteTracking).omit({
  id: true,
  lastUpdate: true,
});

export const insertCyberCrimeReportSchema = createInsertSchema(cyberCrimeReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  assignedOfficerId: true,
});

export const insertNeighborhoodWatchSchema = createInsertSchema(neighborhoodWatch).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityReportSchema = createInsertSchema(communityReports).omit({
  id: true,
  createdAt: true,
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

export type InsertWomenSafetyReport = z.infer<typeof insertWomenSafetyReportSchema>;
export type WomenSafetyReport = typeof womenSafetyReports.$inferSelect;

export type InsertSafeRoute = z.infer<typeof insertSafeRouteSchema>;
export type SafeRoute = typeof safeRoutes.$inferSelect;

export type InsertChildSafetyAlert = z.infer<typeof insertChildSafetyAlertSchema>;
export type ChildSafetyAlert = typeof childSafetyAlerts.$inferSelect;

export type InsertChildRouteTracking = z.infer<typeof insertChildRouteTrackingSchema>;
export type ChildRouteTracking = typeof childRouteTracking.$inferSelect;

export type InsertCyberCrimeReport = z.infer<typeof insertCyberCrimeReportSchema>;
export type CyberCrimeReport = typeof cyberCrimeReports.$inferSelect;

export type InsertNeighborhoodWatch = z.infer<typeof insertNeighborhoodWatchSchema>;
export type NeighborhoodWatch = typeof neighborhoodWatch.$inferSelect;

export type InsertCommunityReport = z.infer<typeof insertCommunityReportSchema>;
export type CommunityReport = typeof communityReports.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  complaints: many(complaints),
  firs: many(firs),
  trafficViolations: many(trafficViolations),
  feedback: many(feedback),
  sosAlerts: many(sosAlerts),
  womenSafetyReports: many(womenSafetyReports),
  childSafetyAlerts: many(childSafetyAlerts),
  childRouteTracking: many(childRouteTracking),
  cyberCrimeReports: many(cyberCrimeReports),
  neighborhoodWatch: many(neighborhoodWatch),
  communityReports: many(communityReports),
}));

export const complaintsRelations = relations(complaints, ({ one, many }) => ({
  complainant: one(users, {
    fields: [complaints.complainantId],
    references: [users.id],
  }),
  assignedOfficer: one(policeOfficers, {
    fields: [complaints.assignedOfficerId],
    references: [policeOfficers.id],
  }),
  firs: many(firs),
}));

export const firsRelations = relations(firs, ({ one }) => ({
  complaint: one(complaints, {
    fields: [firs.complaintId],
    references: [complaints.id],
  }),
  complainant: one(users, {
    fields: [firs.complainantId],
    references: [users.id],
  }),
  investigatingOfficer: one(policeOfficers, {
    fields: [firs.investigatingOfficerId],
    references: [policeOfficers.id],
  }),
}));

export const policeOfficersRelations = relations(policeOfficers, ({ many }) => ({
  assignedComplaints: many(complaints),
  investigatingFirs: many(firs),
  feedback: many(feedback),
  respondingSosAlerts: many(sosAlerts),
}));

export const trafficViolationsRelations = relations(trafficViolations, ({ one }) => ({
  reporter: one(users, {
    fields: [trafficViolations.reporterId],
    references: [users.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
  officer: one(policeOfficers, {
    fields: [feedback.officerId],
    references: [policeOfficers.id],
  }),
}));

export const sosAlertsRelations = relations(sosAlerts, ({ one }) => ({
  user: one(users, {
    fields: [sosAlerts.userId],
    references: [users.id],
  }),
  respondingOfficer: one(policeOfficers, {
    fields: [sosAlerts.respondingOfficerId],
    references: [policeOfficers.id],
  }),
}));

export const womenSafetyReportsRelations = relations(womenSafetyReports, ({ one }) => ({
  reporter: one(users, {
    fields: [womenSafetyReports.reporterId],
    references: [users.id],
  }),
  assignedOfficer: one(policeOfficers, {
    fields: [womenSafetyReports.assignedOfficerId],
    references: [policeOfficers.id],
  }),
}));

export const childSafetyAlertsRelations = relations(childSafetyAlerts, ({ one }) => ({
  parent: one(users, {
    fields: [childSafetyAlerts.parentId],
    references: [users.id],
  }),
}));

export const childRouteTrackingRelations = relations(childRouteTracking, ({ one }) => ({
  parent: one(users, {
    fields: [childRouteTracking.parentId],
    references: [users.id],
  }),
}));

export const cyberCrimeReportsRelations = relations(cyberCrimeReports, ({ one }) => ({
  reporter: one(users, {
    fields: [cyberCrimeReports.reporterId],
    references: [users.id],
  }),
  assignedOfficer: one(policeOfficers, {
    fields: [cyberCrimeReports.assignedOfficerId],
    references: [policeOfficers.id],
  }),
}));

export const neighborhoodWatchRelations = relations(neighborhoodWatch, ({ one, many }) => ({
  coordinator: one(users, {
    fields: [neighborhoodWatch.coordinatorId],
    references: [users.id],
  }),
  communityReports: many(communityReports),
}));

export const communityReportsRelations = relations(communityReports, ({ one }) => ({
  reporter: one(users, {
    fields: [communityReports.reporterId],
    references: [users.id],
  }),
  watchGroup: one(neighborhoodWatch, {
    fields: [communityReports.watchGroupId],
    references: [neighborhoodWatch.id],
  }),
}));
