import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { twilioService } from "./services/twilioService";
import { aiService } from "./services/aiService";
import { trafficAIService } from "./services/trafficAIService";
import { 
  insertUserSchema, 
  insertComplaintSchema, 
  insertFirSchema,
  insertTrafficViolationSchema,
  insertFeedbackSchema,
  insertSosAlertSchema,
  insertWomenSafetyReportSchema,
  insertSafeRouteSchema,
  insertChildSafetyAlertSchema,
  insertCyberCrimeReportSchema,
  insertNeighborhoodWatchSchema,
  insertCommunityReportSchema,
  insertAdvancedTrafficViolationSchema
} from "@shared/schema";
import { z } from "zod";

// Push notification utility function
async function sendPushNotification(subscription: any, payload: any): Promise<void> {
  // In production, use web-push library with proper VAPID keys
  console.log('Push notification would be sent to:', subscription.endpoint);
  console.log('Payload:', payload);
  
  // Simulate successful push notification
  return Promise.resolve();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve service worker file directly
  app.get('/sw.js', (req, res) => {
    try {
      const path = require('path');
      const fs = require('fs');
      const swPath = path.resolve(process.cwd(), 'public', 'sw.js');
      
      if (fs.existsSync(swPath)) {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Service-Worker-Allowed', '/');
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(swPath);
      } else {
        res.status(404).send('Service worker not found');
      }
    } catch (error) {
      console.error('Error serving service worker:', error);
      res.status(500).send('Internal server error');
    }
  });

  // Serve manifest file
  app.get('/manifest.json', (req, res) => {
    try {
      const path = require('path');
      const fs = require('fs');
      const manifestPath = path.resolve(process.cwd(), 'public', 'manifest.json');
      
      if (fs.existsSync(manifestPath)) {
        res.setHeader('Content-Type', 'application/json');
        res.sendFile(manifestPath);
      } else {
        res.status(404).send('Manifest not found');
      }
    } catch (error) {
      console.error('Error serving manifest:', error);
      res.status(500).send('Internal server error');
    }
  });

  // Serve PWA icons
  app.get('/icons/:iconName', (req, res) => {
    try {
      const path = require('path');
      const fs = require('fs');
      const iconPath = path.resolve(process.cwd(), 'public', 'icons', req.params.iconName);
      
      if (fs.existsSync(iconPath)) {
        const ext = path.extname(iconPath).toLowerCase();
        const contentType = ext === '.svg' ? 'image/svg+xml' : 'image/png';
        res.setHeader('Content-Type', contentType);
        res.sendFile(iconPath);
      } else {
        res.status(404).send('Icon not found');
      }
    } catch (error) {
      console.error('Error serving icon:', error);
      res.status(500).send('Internal server error');
    }
  });

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
      
      // AI analysis of complaint
      const analysis = await aiService.analyzeComplaint(complaintData.description);
      
      // Create complaint with AI insights
      const enhancedComplaintData = {
        ...complaintData,
        category: analysis.category || complaintData.category,
        priority: analysis.priority || 'medium'
      };
      
      const complaint = await storage.createComplaint(enhancedComplaintData);
      
      // Send SMS confirmation if user phone available
      if (complaintData.complainantId) {
        const user = await storage.getUser(complaintData.complainantId);
        if (user?.phone) {
          await twilioService.sendComplaintConfirmation(
            user.phone, 
            complaint.id, 
            complaint.category
          );
        }
      }
      
      res.status(201).json({ complaint, analysis });
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
      
      // AI-powered fake emergency detection
      const fakeDetection = await aiService.detectFakeEmergency(alertData);
      
      // Create alert
      const alert = await storage.createSosAlert(alertData);
      
      // Send SMS alert if not detected as fake or low confidence
      if (!fakeDetection.isFake || fakeDetection.confidence < 70) {
        if (alertData.userId) {
          const user = await storage.getUser(alertData.userId);
          if (user?.phone) {
            await twilioService.sendEmergencyAlert(
              user.phone,
              alertData.location,
              alertData.alertType || 'general'
            );
          }
        }
      }
      
      res.status(201).json({ alert, fakeDetection });
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

  // Women Safety routes
  app.post("/api/women-safety/reports", async (req, res) => {
    try {
      const reportData = insertWomenSafetyReportSchema.parse(req.body);
      const report = await storage.createWomenSafetyReport(reportData);
      
      // Send SMS notification for women safety incidents
      if (reportData.reporterId) {
        const user = await storage.getUser(reportData.reporterId);
        if (user?.phone) {
          await twilioService.sendWomenSafetyAlert(
            user.phone,
            reportData.incidentType,
            reportData.location
          );
        }
      }
      
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating women safety report:", error);
      res.status(400).json({ message: "Invalid report data" });
    }
  });

  app.get("/api/women-safety/reports", async (req, res) => {
    try {
      const { userId } = req.query;
      let reports;
      if (userId) {
        reports = await storage.getWomenSafetyReportsByUser(parseInt(userId as string));
      } else {
        reports = await storage.getWomenSafetyReports();
      }
      res.json(reports);
    } catch (error) {
      console.error("Error fetching women safety reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.patch("/api/women-safety/reports/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      await storage.updateWomenSafetyReportStatus(id, status);
      res.json({ message: "Report status updated successfully" });
    } catch (error) {
      console.error("Error updating report status:", error);
      res.status(500).json({ message: "Failed to update report status" });
    }
  });

  // Safe Routes
  app.post("/api/safe-routes", async (req, res) => {
    try {
      const routeData = insertSafeRouteSchema.parse(req.body);
      const route = await storage.createSafeRoute(routeData);
      res.status(201).json(route);
    } catch (error) {
      console.error("Error creating safe route:", error);
      res.status(400).json({ message: "Invalid route data" });
    }
  });

  app.get("/api/safe-routes", async (req, res) => {
    try {
      const { timeOfDay, startLat, startLng, endLat, endLng } = req.query;
      const routes = await storage.getSafeRoutes(timeOfDay as string);
      
      // Generate AI-powered route recommendations if coordinates provided
      if (startLat && startLng && endLat && endLng) {
        const aiRecommendations = await aiService.generateSafeRouteRecommendations(
          { lat: parseFloat(startLat as string), lng: parseFloat(startLng as string) },
          { lat: parseFloat(endLat as string), lng: parseFloat(endLng as string) },
          timeOfDay as string || 'evening'
        );
        res.json({ routes, aiRecommendations });
      } else {
        res.json(routes);
      }
    } catch (error) {
      console.error("Error fetching safe routes:", error);
      res.status(500).json({ message: "Failed to fetch safe routes" });
    }
  });

  // Child Safety routes
  app.post("/api/child-safety/alerts", async (req, res) => {
    try {
      const alertData = insertChildSafetyAlertSchema.parse(req.body);
      const alert = await storage.createChildSafetyAlert(alertData);
      
      // Send SMS notification for child safety alerts
      if (alertData.parentId) {
        const parent = await storage.getUser(alertData.parentId);
        if (parent?.phone) {
          await twilioService.sendChildSafetyAlert(
            parent.phone,
            alertData.childName,
            alertData.alertType,
            alertData.location
          );
        }
      }
      
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating child safety alert:", error);
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  app.get("/api/child-safety/alerts", async (req, res) => {
    try {
      const { parentId } = req.query;
      let alerts;
      if (parentId) {
        alerts = await storage.getChildSafetyAlertsByParent(parseInt(parentId as string));
      } else {
        alerts = await storage.getActiveChildSafetyAlerts();
      }
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching child safety alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Cyber Crime routes
  app.post("/api/cyber-crime/reports", async (req, res) => {
    try {
      const reportData = insertCyberCrimeReportSchema.parse(req.body);
      
      // AI-powered cyber threat analysis
      const threatAnalysis = await aiService.detectCyberthreat(
        reportData.suspiciousUrl || '',
        reportData.description
      );
      
      // Enhanced report with AI analysis
      const enhancedReportData = {
        ...reportData,
        priority: threatAnalysis.isThreat ? 'high' : reportData.priority || 'medium'
      };
      
      const report = await storage.createCyberCrimeReport(enhancedReportData);
      
      res.status(201).json({ report, threatAnalysis });
    } catch (error) {
      console.error("Error creating cyber crime report:", error);
      res.status(400).json({ message: "Invalid report data" });
    }
  });

  app.get("/api/cyber-crime/reports", async (req, res) => {
    try {
      const { userId } = req.query;
      let reports;
      if (userId) {
        reports = await storage.getCyberCrimeReportsByUser(parseInt(userId as string));
      } else {
        reports = await storage.getCyberCrimeReports();
      }
      res.json(reports);
    } catch (error) {
      console.error("Error fetching cyber crime reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Community Policing routes
  app.post("/api/community/watch", async (req, res) => {
    try {
      const watchData = insertNeighborhoodWatchSchema.parse(req.body);
      const watch = await storage.createNeighborhoodWatch(watchData);
      res.status(201).json(watch);
    } catch (error) {
      console.error("Error creating neighborhood watch:", error);
      res.status(400).json({ message: "Invalid watch data" });
    }
  });

  app.get("/api/community/watch", async (req, res) => {
    try {
      const watchGroups = await storage.getNeighborhoodWatchGroups();
      res.json(watchGroups);
    } catch (error) {
      console.error("Error fetching neighborhood watch groups:", error);
      res.status(500).json({ message: "Failed to fetch watch groups" });
    }
  });

  app.post("/api/community/reports", async (req, res) => {
    try {
      const reportData = insertCommunityReportSchema.parse(req.body);
      const report = await storage.createCommunityReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating community report:", error);
      res.status(400).json({ message: "Invalid report data" });
    }
  });

  // Analytics and AI Dashboard routes
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const [complaints, womenSafetyReports, childAlerts, cyberReports, sosAlerts] = await Promise.all([
        storage.getAllComplaints(),
        storage.getWomenSafetyReports(),
        storage.getActiveChildSafetyAlerts(),
        storage.getCyberCrimeReports(),
        storage.getActiveSosAlerts()
      ]);

      const allIncidents = [
        ...complaints.map(c => ({ ...c, type: 'complaint' })),
        ...womenSafetyReports.map(w => ({ ...w, type: 'women_safety' })),
        ...childAlerts.map(ch => ({ ...ch, type: 'child_safety' })),
        ...cyberReports.map(cy => ({ ...cy, type: 'cyber_crime' })),
        ...sosAlerts.map(s => ({ ...s, type: 'emergency' }))
      ];

      // AI-powered crime pattern analysis
      const crimeAnalysis = await aiService.analyzeCrimePattern(allIncidents);
      
      // Generate incident summary
      const summary = await aiService.generateIncidentSummary(allIncidents);

      const dashboardData = {
        totalIncidents: allIncidents.length,
        activeEmergencies: sosAlerts.length,
        womenSafetyReports: womenSafetyReports.length,
        childSafetyAlerts: childAlerts.length,
        cyberCrimeReports: cyberReports.length,
        crimeAnalysis,
        summary,
        recentIncidents: allIncidents.slice(0, 10)
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  app.get("/api/analytics/crime-heatmap", async (req, res) => {
    try {
      const complaints = await storage.getAllComplaints();
      const womenReports = await storage.getWomenSafetyReports();
      
      const incidents = [...complaints, ...womenReports];
      const crimeAnalysis = await aiService.analyzeCrimePattern(incidents);
      
      res.json(crimeAnalysis.hotspots || []);
    } catch (error) {
      console.error("Error generating crime heatmap:", error);
      res.status(500).json({ message: "Failed to generate heatmap" });
    }
  });

  // Advanced Traffic Management - TrafficGuard Pro routes
  app.post("/api/traffic/violations", async (req, res) => {
    try {
      const violationData = insertAdvancedTrafficViolationSchema.parse(req.body);
      
      // AI-powered violation analysis
      let aiAnalysis = {};
      let rewardPoints = 0;
      
      if (violationData.evidencePhotos && violationData.evidencePhotos.length > 0) {
        aiAnalysis = await trafficAIService.analyzeTrafficViolation(
          violationData.evidencePhotos[0],
          violationData.description
        );
        
        // Calculate reward points based on AI confidence and violation type
        rewardPoints = Math.floor((aiAnalysis.confidence || 0) / 10);
      }
      
      const violation = {
        ...violationData,
        verificationScore: aiAnalysis.confidence || 0,
        aiAnalysis,
        rewardPoints
      };
      
      // Create violation record (simulated for demo)
      const violationRecord = { id: Date.now(), ...violation };
      
      // Send SMS notification if registration number provided
      if (violationData.registrationNumber) {
        await twilioService.sendSMS(
          "+919876543210", // Demo phone number
          `Traffic Violation Alert: Your vehicle ${violationData.registrationNumber} has been reported for traffic violation. Location: ${violationData.location?.address || 'Location captured'}. Please follow traffic rules. - Ahilyangara Police`
        );
      }
      
      res.status(201).json({ 
        violation: violationRecord, 
        aiAnalysis, 
        rewardPoints 
      });
    } catch (error) {
      console.error("Error creating traffic violation:", error);
      res.status(400).json({ message: "Invalid violation data" });
    }
  });

  app.get("/api/traffic/violations", async (req, res) => {
    try {
      // Simulated violation data for demo
      const violations = [
        {
          id: 1,
          violationType: "Mobile Phone Usage",
          registrationNumber: "MH12AB1234",
          description: "Driver using mobile phone while driving",
          timestamp: new Date().toISOString(),
          status: "verified",
          severityLevel: "medium",
          verificationScore: 85,
          rewardPoints: 8,
          location: { address: "Main Market, Ahilyangara" }
        },
        {
          id: 2,
          violationType: "No Helmet",
          registrationNumber: "MH14XY5678",
          description: "Two-wheeler rider without helmet",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: "pending",
          severityLevel: "high",
          verificationScore: 92,
          rewardPoints: 9,
          location: { address: "Highway Junction" }
        }
      ];
      
      res.json(violations);
    } catch (error) {
      console.error("Error fetching violations:", error);
      res.status(500).json({ message: "Failed to fetch violations" });
    }
  });

  app.get("/api/traffic/rewards/:userId", async (req, res) => {
    try {
      // Simulated rewards data for demo
      const rewards = {
        totalPoints: 127,
        currentLevel: "Silver",
        monthlyRank: 15,
        yearlyRank: 45,
        reportsSubmitted: 23,
        reportsVerified: 18,
        badges: ["First Reporter", "Safety Champion", "Monthly Hero"],
        rewardsRedeemed: []
      };
      
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  app.get("/api/traffic/violation-types", async (req, res) => {
    try {
      const violationTypes = [
        { id: 1, name: "Mobile Phone Usage", category: "standard", fineAmount: 1000, points: 10 },
        { id: 2, name: "No Helmet", category: "standard", fineAmount: 1000, points: 10 },
        { id: 3, name: "Signal Jumping", category: "standard", fineAmount: 1000, points: 15 },
        { id: 4, name: "Overspeeding", category: "standard", fineAmount: 2000, points: 20 },
        { id: 5, name: "Cattle on Highway", category: "rural_specific", fineAmount: 2000, points: 15 },
        { id: 6, name: "Tractor Violation", category: "rural_specific", fineAmount: 3000, points: 20 }
      ];
      
      res.json(violationTypes);
    } catch (error) {
      console.error("Error fetching violation types:", error);
      res.status(500).json({ message: "Failed to fetch violation types" });
    }
  });

  app.post("/api/traffic/accidents", async (req, res) => {
    try {
      const accidentData = req.body;
      
      // AI analysis for accident severity
      const severityAnalysis = await aiService.analyzeComplaint(accidentData.description);
      
      const accident = {
        id: Date.now(),
        ...accidentData,
        severityLevel: severityAnalysis.priority || 'medium',
        status: 'reported',
        createdAt: new Date().toISOString()
      };
      
      // Send emergency notifications
      if (accidentData.ambulanceRequired) {
        await twilioService.sendSMS(
          "+919876543210",
          `ACCIDENT ALERT: Medical assistance required at ${accidentData.location?.address}. Casualties: ${accidentData.casualties || 0}. Emergency services dispatched. - Ahilyangara Police`
        );
      }
      
      res.status(201).json(accident);
    } catch (error) {
      console.error("Error creating accident report:", error);
      res.status(400).json({ message: "Invalid accident data" });
    }
  });

  app.get("/api/traffic/hotspots", async (req, res) => {
    try {
      const hotspots = [
        {
          id: 1,
          areaName: "Main Market Square",
          location: { lat: 19.8762, lng: 75.3433, address: "Main Market, Ahilyangara" },
          violationType: "Illegal Parking",
          riskLevel: "high",
          violationCount: 45,
          timePattern: { peak: "10AM-12PM, 6PM-8PM" },
          recommendations: ["Deploy traffic wardens", "Install CCTV cameras"]
        },
        {
          id: 2,
          areaName: "Highway Junction",
          location: { lat: 19.8775, lng: 75.3445, address: "Highway Junction" },
          violationType: "Signal Jumping",
          riskLevel: "critical",
          violationCount: 78,
          timePattern: { peak: "8AM-10AM, 5PM-7PM" },
          recommendations: ["Install red light cameras", "Increase patrol timing"]
        }
      ];
      
      res.json(hotspots);
    } catch (error) {
      console.error("Error fetching traffic hotspots:", error);
      res.status(500).json({ message: "Failed to fetch hotspots" });
    }
  });

  // Real-time traffic monitoring routes
  app.get("/api/traffic/live-monitoring", async (req, res) => {
    try {
      const liveData = {
        areas: [
          { id: "market", name: "Market Square", vehicles: 145, violations: 3, density: "high" },
          { id: "highway", name: "Highway Junction", vehicles: 287, violations: 7, density: "congested" },
          { id: "station", name: "Railway Station", vehicles: 198, violations: 2, density: "medium" }
        ],
        recentViolations: [
          {
            id: 1,
            type: "Signal Jump",
            location: "Highway Junction",
            time: "2 mins ago",
            vehicle: "MH12AB1234",
            confidence: 94,
            status: "verified"
          }
        ]
      };
      res.json(liveData);
    } catch (error) {
      console.error("Error fetching live monitoring data:", error);
      res.status(500).json({ message: "Failed to fetch live data" });
    }
  });

  app.get("/api/traffic/camera-feeds", async (req, res) => {
    try {
      const feeds = [
        { id: 1, location: "Market Square", status: "online", aiActive: true },
        { id: 2, location: "Highway Junction", status: "online", aiActive: true },
        { id: 3, location: "Railway Station", status: "maintenance", aiActive: false }
      ];
      res.json(feeds);
    } catch (error) {
      console.error("Error fetching camera feeds:", error);
      res.status(500).json({ message: "Failed to fetch camera feeds" });
    }
  });

  app.get("/api/traffic/signals/status", async (req, res) => {
    try {
      const signals = [
        { name: "Market Square Signal", status: "operational", timing: "90s cycle" },
        { name: "Highway Junction", status: "maintenance", timing: "Manual override" },
        { name: "Railway Crossing", status: "operational", timing: "120s cycle" }
      ];
      res.json(signals);
    } catch (error) {
      console.error("Error fetching signal status:", error);
      res.status(500).json({ message: "Failed to fetch signal status" });
    }
  });

  // Vehicle tracking routes
  app.get("/api/vehicles/tracking", async (req, res) => {
    try {
      const vehicles = [
        {
          registrationNumber: "MH12AB1234",
          ownerName: "राज पाटील",
          vehicleType: "Car",
          model: "Maruti Swift",
          lastLocation: "Market Square, Ahilyangara",
          lastSeen: "5 mins ago",
          violationCount: 3,
          status: "active",
          insuranceStatus: "valid",
          pucStatus: "expired"
        }
      ];
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicle tracking data:", error);
      res.status(500).json({ message: "Failed to fetch vehicle data" });
    }
  });

  app.get("/api/vehicles/track/:regNumber", async (req, res) => {
    try {
      const { regNumber } = req.params;
      
      // Simulate vehicle tracking
      const vehicleData = {
        registrationNumber: regNumber,
        ownerName: "राज पाटील",
        vehicleType: "Car",
        model: "Maruti Swift",
        lastLocation: "Market Square, Ahilyangara",
        lastSeen: "5 mins ago",
        violationCount: 3,
        status: "active",
        insuranceStatus: "valid",
        pucStatus: "expired",
        coordinates: { lat: 19.8762, lng: 75.3433 }
      };
      
      res.json(vehicleData);
    } catch (error) {
      console.error("Error tracking vehicle:", error);
      res.status(404).json({ message: "Vehicle not found" });
    }
  });

  app.get("/api/vehicles/violations/:regNumber", async (req, res) => {
    try {
      const violations = [
        {
          date: "2024-01-15",
          type: "Signal Jumping",
          location: "Highway Junction",
          fine: 1000,
          status: "paid"
        },
        {
          date: "2024-01-10",
          type: "No Helmet",
          location: "Market Square",
          fine: 1000,
          status: "pending"
        }
      ];
      res.json(violations);
    } catch (error) {
      console.error("Error fetching vehicle violations:", error);
      res.status(500).json({ message: "Failed to fetch violations" });
    }
  });

  // PWA Push Notification Routes
  app.post("/api/push/subscribe", async (req, res) => {
    try {
      const subscription = req.body;
      
      // Store subscription in database (simulated)
      console.log("Push subscription received:", subscription.endpoint);
      
      // Send welcome notification
      await sendPushNotification(subscription, {
        title: "TrafficGuard Pro",
        body: "Push notifications enabled! You'll receive updates about violations and emergencies.",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        data: { url: "/" }
      });
      
      res.status(201).json({ message: "Subscription saved successfully" });
    } catch (error) {
      console.error("Error saving push subscription:", error);
      res.status(500).json({ message: "Failed to save subscription" });
    }
  });

  app.post("/api/push/send", async (req, res) => {
    try {
      const { title, body, data, type } = req.body;
      
      // Get all subscriptions (simulated)
      const subscriptions = []; // In production, fetch from database
      
      const notification = {
        title: title || "TrafficGuard Pro",
        body: body || "New notification",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        data: data || {},
        type: type || "general"
      };
      
      // Send to all subscribers
      const results = await Promise.allSettled(
        subscriptions.map(sub => sendPushNotification(sub, notification))
      );
      
      res.json({ 
        message: "Notifications sent",
        sent: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length
      });
    } catch (error) {
      console.error("Error sending push notifications:", error);
      res.status(500).json({ message: "Failed to send notifications" });
    }
  });

  // Emergency broadcast notification
  app.post("/api/push/emergency", async (req, res) => {
    try {
      const { message, location, type } = req.body;
      
      const emergencyNotification = {
        title: "🚨 Emergency Alert",
        body: message || "Emergency situation reported in your area",
        icon: "/icons/emergency-icon.png",
        badge: "/icons/icon-72x72.png",
        requireInteraction: true,
        tag: "emergency",
        data: {
          url: "/emergency",
          location,
          type: type || "general"
        },
        actions: [
          { action: "view", title: "View Details" },
          { action: "directions", title: "Get Directions" }
        ]
      };
      
      // Broadcast to all users in area (simulated)
      console.log("Emergency broadcast:", emergencyNotification);
      
      res.json({ message: "Emergency alert broadcasted" });
    } catch (error) {
      console.error("Error broadcasting emergency:", error);
      res.status(500).json({ message: "Failed to broadcast emergency" });
    }
  });

  // PWA offline sync routes
  app.post("/api/offline/sync", async (req, res) => {
    try {
      const { pendingData } = req.body;
      
      const syncResults = {
        violations: 0,
        emergencies: 0,
        reports: 0,
        failed: []
      };
      
      // Process pending offline data
      if (pendingData.violations) {
        for (const violation of pendingData.violations) {
          try {
            // Process violation report
            console.log("Syncing violation:", violation.id);
            syncResults.violations++;
          } catch (error) {
            syncResults.failed.push({ type: 'violation', id: violation.id, error: error.message });
          }
        }
      }
      
      if (pendingData.emergencies) {
        for (const emergency of pendingData.emergencies) {
          try {
            // Process emergency alert
            console.log("Syncing emergency:", emergency.id);
            syncResults.emergencies++;
          } catch (error) {
            syncResults.failed.push({ type: 'emergency', id: emergency.id, error: error.message });
          }
        }
      }
      
      res.json({
        message: "Offline data synced successfully",
        results: syncResults
      });
    } catch (error) {
      console.error("Error syncing offline data:", error);
      res.status(500).json({ message: "Failed to sync offline data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
