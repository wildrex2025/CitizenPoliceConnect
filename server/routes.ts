import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertComplaintSchema, 
  insertFirSchema,
  insertTrafficViolationSchema,
  insertFeedbackSchema,
  insertSosAlertSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Complaint routes
  app.post("/api/complaints", async (req, res) => {
    try {
      const complaintData = insertComplaintSchema.parse(req.body);
      const complaint = await storage.createComplaint(complaintData);
      res.status(201).json(complaint);
    } catch (error) {
      console.error("Error creating complaint:", error);
      res.status(400).json({ message: "Invalid complaint data" });
    }
  });

  app.get("/api/complaints", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      let complaints;
      
      if (userId) {
        complaints = await storage.getComplaintsByUser(parseInt(userId));
      } else {
        complaints = await storage.getAllComplaints();
      }
      
      res.json(complaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });

  app.get("/api/complaints/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const complaint = await storage.getComplaint(id);
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      res.json(complaint);
    } catch (error) {
      console.error("Error fetching complaint:", error);
      res.status(500).json({ message: "Failed to fetch complaint" });
    }
  });

  app.patch("/api/complaints/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      await storage.updateComplaintStatus(id, status);
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      console.error("Error updating complaint status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // FIR routes
  app.post("/api/firs", async (req, res) => {
    try {
      const firData = insertFirSchema.parse(req.body);
      const fir = await storage.createFir(firData);
      res.status(201).json(fir);
    } catch (error) {
      console.error("Error creating FIR:", error);
      res.status(400).json({ message: "Invalid FIR data" });
    }
  });

  app.get("/api/firs/search", async (req, res) => {
    try {
      const firNumber = req.query.firNumber as string;
      if (!firNumber) {
        return res.status(400).json({ message: "FIR number is required" });
      }
      
      const fir = await storage.getFirByNumber(firNumber);
      if (!fir) {
        return res.status(404).json({ message: "FIR not found" });
      }
      
      res.json(fir);
    } catch (error) {
      console.error("Error searching FIR:", error);
      res.status(500).json({ message: "Failed to search FIR" });
    }
  });

  app.get("/api/firs", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const firs = await storage.getFirsByUser(parseInt(userId));
      res.json(firs);
    } catch (error) {
      console.error("Error fetching FIRs:", error);
      res.status(500).json({ message: "Failed to fetch FIRs" });
    }
  });

  // Police officer routes
  app.get("/api/officers", async (req, res) => {
    try {
      const beat = req.query.beat as string;
      let officers;
      
      if (beat) {
        officers = await storage.getOfficersByBeat(beat);
      } else {
        officers = await storage.getAllOfficers();
      }
      
      res.json(officers);
    } catch (error) {
      console.error("Error fetching officers:", error);
      res.status(500).json({ message: "Failed to fetch officers" });
    }
  });

  app.get("/api/officers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const officer = await storage.getOfficer(id);
      if (!officer) {
        return res.status(404).json({ message: "Officer not found" });
      }
      res.json(officer);
    } catch (error) {
      console.error("Error fetching officer:", error);
      res.status(500).json({ message: "Failed to fetch officer" });
    }
  });

  // Traffic violation routes
  app.post("/api/traffic-violations", async (req, res) => {
    try {
      const violationData = insertTrafficViolationSchema.parse(req.body);
      const violation = await storage.createTrafficViolation(violationData);
      res.status(201).json(violation);
    } catch (error) {
      console.error("Error creating traffic violation:", error);
      res.status(400).json({ message: "Invalid violation data" });
    }
  });

  app.get("/api/traffic-violations", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      let violations;
      
      if (userId) {
        violations = await storage.getTrafficViolationsByUser(parseInt(userId));
      } else {
        violations = await storage.getTrafficViolations();
      }
      
      res.json(violations);
    } catch (error) {
      console.error("Error fetching traffic violations:", error);
      res.status(500).json({ message: "Failed to fetch violations" });
    }
  });

  // Emergency contacts
  app.get("/api/emergency-contacts", async (req, res) => {
    try {
      const contacts = await storage.getEmergencyContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });

  // Feedback routes
  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse(req.body);
      const feedbackRecord = await storage.createFeedback(feedbackData);
      res.status(201).json(feedbackRecord);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(400).json({ message: "Invalid feedback data" });
    }
  });

  app.get("/api/feedback/officer/:officerId", async (req, res) => {
    try {
      const officerId = parseInt(req.params.officerId);
      const feedbackList = await storage.getFeedbackByOfficer(officerId);
      res.json(feedbackList);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // SOS alert routes
  app.post("/api/sos", async (req, res) => {
    try {
      const alertData = insertSosAlertSchema.parse(req.body);
      const alert = await storage.createSosAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating SOS alert:", error);
      res.status(400).json({ message: "Invalid SOS alert data" });
    }
  });

  app.get("/api/sos/active", async (req, res) => {
    try {
      const alerts = await storage.getActiveSosAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching active SOS alerts:", error);
      res.status(500).json({ message: "Failed to fetch SOS alerts" });
    }
  });

  app.patch("/api/sos/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      await storage.updateSosAlertStatus(id, status);
      res.json({ message: "SOS alert status updated successfully" });
    } catch (error) {
      console.error("Error updating SOS alert status:", error);
      res.status(500).json({ message: "Failed to update SOS alert status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
