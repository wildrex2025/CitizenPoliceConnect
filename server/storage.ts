import {
  users,
  complaints,
  firs,
  policeOfficers,
  trafficViolations,
  emergencyContacts,
  feedback,
  sosAlerts,
  womenSafetyReports,
  safeRoutes,
  childSafetyAlerts,
  childRouteTracking,
  cyberCrimeReports,
  neighborhoodWatch,
  communityReports,
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
  type WomenSafetyReport,
  type InsertWomenSafetyReport,
  type SafeRoute,
  type InsertSafeRoute,
  type ChildSafetyAlert,
  type InsertChildSafetyAlert,
  type ChildRouteTracking,
  type InsertChildRouteTracking,
  type CyberCrimeReport,
  type InsertCyberCrimeReport,
  type NeighborhoodWatch,
  type InsertNeighborhoodWatch,
  type CommunityReport,
  type InsertCommunityReport,
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
  
  // Women Safety operations
  createWomenSafetyReport(report: InsertWomenSafetyReport): Promise<WomenSafetyReport>;
  getWomenSafetyReports(): Promise<WomenSafetyReport[]>;
  getWomenSafetyReportsByUser(userId: number): Promise<WomenSafetyReport[]>;
  updateWomenSafetyReportStatus(id: number, status: string): Promise<void>;
  
  // Safe Routes operations
  createSafeRoute(route: InsertSafeRoute): Promise<SafeRoute>;
  getSafeRoutes(timeOfDay?: string): Promise<SafeRoute[]>;
  getSafeRoutesByLocation(startLat: number, startLng: number, endLat: number, endLng: number): Promise<SafeRoute[]>;
  updateSafeRouteRating(id: number, rating: number): Promise<void>;
  
  // Child Safety operations
  createChildSafetyAlert(alert: InsertChildSafetyAlert): Promise<ChildSafetyAlert>;
  getActiveChildSafetyAlerts(): Promise<ChildSafetyAlert[]>;
  getChildSafetyAlertsByParent(parentId: number): Promise<ChildSafetyAlert[]>;
  updateChildSafetyAlertStatus(id: number, status: string): Promise<void>;
  
  // Child Route Tracking operations
  createChildRouteTracking(tracking: InsertChildRouteTracking): Promise<ChildRouteTracking>;
  getChildRoutesByParent(parentId: number): Promise<ChildRouteTracking[]>;
  updateChildLocation(trackingId: number, location: any): Promise<void>;
  
  // Cyber Crime operations
  createCyberCrimeReport(report: InsertCyberCrimeReport): Promise<CyberCrimeReport>;
  getCyberCrimeReports(): Promise<CyberCrimeReport[]>;
  getCyberCrimeReportsByUser(userId: number): Promise<CyberCrimeReport[]>;
  updateCyberCrimeReportStatus(id: number, status: string): Promise<void>;
  
  // Community Policing operations
  createNeighborhoodWatch(watch: InsertNeighborhoodWatch): Promise<NeighborhoodWatch>;
  getNeighborhoodWatchGroups(): Promise<NeighborhoodWatch[]>;
  getNeighborhoodWatchByCoordinator(coordinatorId: number): Promise<NeighborhoodWatch[]>;
  joinNeighborhoodWatch(watchId: number, userId: number): Promise<void>;
  
  // Community Reports operations
  createCommunityReport(report: InsertCommunityReport): Promise<CommunityReport>;
  getCommunityReportsByWatch(watchId: number): Promise<CommunityReport[]>;
  getCommunityReportsByUser(userId: number): Promise<CommunityReport[]>;
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

  // Women Safety operations
  async createWomenSafetyReport(insertReport: InsertWomenSafetyReport): Promise<WomenSafetyReport> {
    const [report] = await db
      .insert(womenSafetyReports)
      .values(insertReport)
      .returning();
    return report;
  }

  async getWomenSafetyReports(): Promise<WomenSafetyReport[]> {
    return await db.select().from(womenSafetyReports).orderBy(desc(womenSafetyReports.createdAt));
  }

  async getWomenSafetyReportsByUser(userId: number): Promise<WomenSafetyReport[]> {
    return await db.select().from(womenSafetyReports)
      .where(eq(womenSafetyReports.reporterId, userId))
      .orderBy(desc(womenSafetyReports.createdAt));
  }

  async updateWomenSafetyReportStatus(id: number, status: string): Promise<void> {
    await db.update(womenSafetyReports)
      .set({ status, updatedAt: new Date() })
      .where(eq(womenSafetyReports.id, id));
  }

  // Safe Routes operations
  async createSafeRoute(insertRoute: InsertSafeRoute): Promise<SafeRoute> {
    const [route] = await db
      .insert(safeRoutes)
      .values(insertRoute)
      .returning();
    return route;
  }

  async getSafeRoutes(timeOfDay?: string): Promise<SafeRoute[]> {
    if (timeOfDay) {
      return await db.select().from(safeRoutes)
        .where(and(eq(safeRoutes.timeOfDay, timeOfDay), eq(safeRoutes.isActive, true)))
        .orderBy(desc(safeRoutes.safetyRating));
    }
    return await db.select().from(safeRoutes)
      .where(eq(safeRoutes.isActive, true))
      .orderBy(desc(safeRoutes.safetyRating));
  }

  async getSafeRoutesByLocation(startLat: number, startLng: number, endLat: number, endLng: number): Promise<SafeRoute[]> {
    // This would need proper geospatial queries in production
    return await db.select().from(safeRoutes)
      .where(eq(safeRoutes.isActive, true))
      .orderBy(desc(safeRoutes.safetyRating));
  }

  async updateSafeRouteRating(id: number, rating: number): Promise<void> {
    await db.update(safeRoutes)
      .set({ safetyRating: rating, lastUpdated: new Date() })
      .where(eq(safeRoutes.id, id));
  }

  // Child Safety operations
  async createChildSafetyAlert(insertAlert: InsertChildSafetyAlert): Promise<ChildSafetyAlert> {
    const [alert] = await db
      .insert(childSafetyAlerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async getActiveChildSafetyAlerts(): Promise<ChildSafetyAlert[]> {
    return await db.select().from(childSafetyAlerts)
      .where(eq(childSafetyAlerts.status, 'active'))
      .orderBy(desc(childSafetyAlerts.createdAt));
  }

  async getChildSafetyAlertsByParent(parentId: number): Promise<ChildSafetyAlert[]> {
    return await db.select().from(childSafetyAlerts)
      .where(eq(childSafetyAlerts.parentId, parentId))
      .orderBy(desc(childSafetyAlerts.createdAt));
  }

  async updateChildSafetyAlertStatus(id: number, status: string): Promise<void> {
    await db.update(childSafetyAlerts)
      .set({ status })
      .where(eq(childSafetyAlerts.id, id));
  }

  // Child Route Tracking operations
  async createChildRouteTracking(insertTracking: InsertChildRouteTracking): Promise<ChildRouteTracking> {
    const [tracking] = await db
      .insert(childRouteTracking)
      .values(insertTracking)
      .returning();
    return tracking;
  }

  async getChildRoutesByParent(parentId: number): Promise<ChildRouteTracking[]> {
    return await db.select().from(childRouteTracking)
      .where(eq(childRouteTracking.parentId, parentId))
      .orderBy(desc(childRouteTracking.lastUpdate));
  }

  async updateChildLocation(trackingId: number, location: any): Promise<void> {
    await db.update(childRouteTracking)
      .set({ currentLocation: location, lastUpdate: new Date() })
      .where(eq(childRouteTracking.id, trackingId));
  }

  // Cyber Crime operations
  async createCyberCrimeReport(insertReport: InsertCyberCrimeReport): Promise<CyberCrimeReport> {
    const [report] = await db
      .insert(cyberCrimeReports)
      .values(insertReport)
      .returning();
    return report;
  }

  async getCyberCrimeReports(): Promise<CyberCrimeReport[]> {
    return await db.select().from(cyberCrimeReports).orderBy(desc(cyberCrimeReports.createdAt));
  }

  async getCyberCrimeReportsByUser(userId: number): Promise<CyberCrimeReport[]> {
    return await db.select().from(cyberCrimeReports)
      .where(eq(cyberCrimeReports.reporterId, userId))
      .orderBy(desc(cyberCrimeReports.createdAt));
  }

  async updateCyberCrimeReportStatus(id: number, status: string): Promise<void> {
    await db.update(cyberCrimeReports)
      .set({ status, updatedAt: new Date() })
      .where(eq(cyberCrimeReports.id, id));
  }

  // Community Policing operations
  async createNeighborhoodWatch(insertWatch: InsertNeighborhoodWatch): Promise<NeighborhoodWatch> {
    const [watch] = await db
      .insert(neighborhoodWatch)
      .values(insertWatch)
      .returning();
    return watch;
  }

  async getNeighborhoodWatchGroups(): Promise<NeighborhoodWatch[]> {
    return await db.select().from(neighborhoodWatch)
      .where(eq(neighborhoodWatch.isActive, true))
      .orderBy(desc(neighborhoodWatch.createdAt));
  }

  async getNeighborhoodWatchByCoordinator(coordinatorId: number): Promise<NeighborhoodWatch[]> {
    return await db.select().from(neighborhoodWatch)
      .where(and(eq(neighborhoodWatch.coordinatorId, coordinatorId), eq(neighborhoodWatch.isActive, true)));
  }

  async joinNeighborhoodWatch(watchId: number, userId: number): Promise<void> {
    const [watch] = await db.select().from(neighborhoodWatch).where(eq(neighborhoodWatch.id, watchId));
    if (watch) {
      const currentMembers = watch.members as number[] || [];
      if (!currentMembers.includes(userId)) {
        currentMembers.push(userId);
        await db.update(neighborhoodWatch)
          .set({ members: currentMembers })
          .where(eq(neighborhoodWatch.id, watchId));
      }
    }
  }

  // Community Reports operations
  async createCommunityReport(insertReport: InsertCommunityReport): Promise<CommunityReport> {
    const [report] = await db
      .insert(communityReports)
      .values(insertReport)
      .returning();
    return report;
  }

  async getCommunityReportsByWatch(watchId: number): Promise<CommunityReport[]> {
    return await db.select().from(communityReports)
      .where(eq(communityReports.watchGroupId, watchId))
      .orderBy(desc(communityReports.createdAt));
  }

  async getCommunityReportsByUser(userId: number): Promise<CommunityReport[]> {
    return await db.select().from(communityReports)
      .where(eq(communityReports.reporterId, userId))
      .orderBy(desc(communityReports.createdAt));
  }
}

export const storage = new DatabaseStorage();
