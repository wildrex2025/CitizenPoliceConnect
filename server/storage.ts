import {
  users,
  complaints,
  firs,
  policeOfficers,
  trafficViolations,
  emergencyContacts,
  feedback,
  sosAlerts,
  type User,
  type InsertUser,
  type Complaint,
  type InsertComplaint,
  type Fir,
  type InsertFir,
  type PoliceOfficer,
  type TrafficViolation,
  type InsertTrafficViolation,
  type EmergencyContact,
  type Feedback,
  type InsertFeedback,
  type SosAlert,
  type InsertSosAlert,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Complaint operations
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  getComplaint(id: number): Promise<Complaint | undefined>;
  getComplaintsByUser(userId: number): Promise<Complaint[]>;
  getAllComplaints(): Promise<Complaint[]>;
  updateComplaintStatus(id: number, status: string): Promise<void>;
  
  // FIR operations
  createFir(fir: InsertFir): Promise<Fir>;
  getFirByNumber(firNumber: string): Promise<Fir | undefined>;
  getFir(id: number): Promise<Fir | undefined>;
  getFirsByUser(userId: number): Promise<Fir[]>;
  updateFirStatus(id: number, status: string): Promise<void>;
  
  // Police officer operations
  getAllOfficers(): Promise<PoliceOfficer[]>;
  getOfficersByBeat(beat: string): Promise<PoliceOfficer[]>;
  getOfficer(id: number): Promise<PoliceOfficer | undefined>;
  
  // Traffic violation operations
  createTrafficViolation(violation: InsertTrafficViolation): Promise<TrafficViolation>;
  getTrafficViolations(): Promise<TrafficViolation[]>;
  getTrafficViolationsByUser(userId: number): Promise<TrafficViolation[]>;
  
  // Emergency contacts
  getEmergencyContacts(): Promise<EmergencyContact[]>;
  
  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackByOfficer(officerId: number): Promise<Feedback[]>;
  
  // SOS operations
  createSosAlert(alert: InsertSosAlert): Promise<SosAlert>;
  getActiveSosAlerts(): Promise<SosAlert[]>;
  updateSosAlertStatus(id: number, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Complaint operations
  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    const [complaint] = await db
      .insert(complaints)
      .values(insertComplaint)
      .returning();
    return complaint;
  }

  async getComplaint(id: number): Promise<Complaint | undefined> {
    const [complaint] = await db.select().from(complaints).where(eq(complaints.id, id));
    return complaint || undefined;
  }

  async getComplaintsByUser(userId: number): Promise<Complaint[]> {
    return await db.select().from(complaints)
      .where(eq(complaints.complainantId, userId))
      .orderBy(desc(complaints.createdAt));
  }

  async getAllComplaints(): Promise<Complaint[]> {
    return await db.select().from(complaints).orderBy(desc(complaints.createdAt));
  }

  async updateComplaintStatus(id: number, status: string): Promise<void> {
    await db.update(complaints)
      .set({ status, updatedAt: new Date() })
      .where(eq(complaints.id, id));
  }

  // FIR operations
  async createFir(insertFir: InsertFir): Promise<Fir> {
    const [fir] = await db
      .insert(firs)
      .values(insertFir)
      .returning();
    return fir;
  }

  async getFirByNumber(firNumber: string): Promise<Fir | undefined> {
    const [fir] = await db.select().from(firs).where(eq(firs.firNumber, firNumber));
    return fir || undefined;
  }

  async getFir(id: number): Promise<Fir | undefined> {
    const [fir] = await db.select().from(firs).where(eq(firs.id, id));
    return fir || undefined;
  }

  async getFirsByUser(userId: number): Promise<Fir[]> {
    return await db.select().from(firs)
      .where(eq(firs.complainantId, userId))
      .orderBy(desc(firs.createdAt));
  }

  async updateFirStatus(id: number, status: string): Promise<void> {
    await db.update(firs)
      .set({ status, updatedAt: new Date() })
      .where(eq(firs.id, id));
  }

  // Police officer operations
  async getAllOfficers(): Promise<PoliceOfficer[]> {
    return await db.select().from(policeOfficers)
      .where(eq(policeOfficers.isActive, true));
  }

  async getOfficersByBeat(beat: string): Promise<PoliceOfficer[]> {
    return await db.select().from(policeOfficers)
      .where(and(eq(policeOfficers.beat, beat), eq(policeOfficers.isActive, true)));
  }

  async getOfficer(id: number): Promise<PoliceOfficer | undefined> {
    const [officer] = await db.select().from(policeOfficers).where(eq(policeOfficers.id, id));
    return officer || undefined;
  }

  // Traffic violation operations
  async createTrafficViolation(insertViolation: InsertTrafficViolation): Promise<TrafficViolation> {
    const [violation] = await db
      .insert(trafficViolations)
      .values(insertViolation)
      .returning();
    return violation;
  }

  async getTrafficViolations(): Promise<TrafficViolation[]> {
    return await db.select().from(trafficViolations).orderBy(desc(trafficViolations.createdAt));
  }

  async getTrafficViolationsByUser(userId: number): Promise<TrafficViolation[]> {
    return await db.select().from(trafficViolations)
      .where(eq(trafficViolations.reporterId, userId))
      .orderBy(desc(trafficViolations.createdAt));
  }

  // Emergency contacts
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return await db.select().from(emergencyContacts)
      .where(eq(emergencyContacts.isActive, true));
  }

  // Feedback operations
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedbackRecord] = await db
      .insert(feedback)
      .values(insertFeedback)
      .returning();
    return feedbackRecord;
  }

  async getFeedbackByOfficer(officerId: number): Promise<Feedback[]> {
    return await db.select().from(feedback)
      .where(eq(feedback.officerId, officerId))
      .orderBy(desc(feedback.createdAt));
  }

  // SOS operations
  async createSosAlert(insertAlert: InsertSosAlert): Promise<SosAlert> {
    const [alert] = await db
      .insert(sosAlerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async getActiveSosAlerts(): Promise<SosAlert[]> {
    return await db.select().from(sosAlerts)
      .where(eq(sosAlerts.status, 'active'))
      .orderBy(desc(sosAlerts.createdAt));
  }

  async updateSosAlertStatus(id: number, status: string): Promise<void> {
    await db.update(sosAlerts)
      .set({ status, respondedAt: new Date() })
      .where(eq(sosAlerts.id, id));
  }
}

export const storage = new DatabaseStorage();
