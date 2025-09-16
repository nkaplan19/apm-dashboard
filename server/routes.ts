import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertMetricSchema, insertErrorSchema, insertAlertSchema, insertApplicationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Applications endpoints
  app.get("/api/applications", async (req, res) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ error: "Invalid application data" });
    }
  });

  // Bulk ingestion endpoint for external applications
  app.post("/api/ingest/metrics/bulk", async (req, res) => {
    try {
      const { applicationId, metrics: metricsData } = req.body;
      
      if (!applicationId || !Array.isArray(metricsData)) {
        return res.status(400).json({ error: "applicationId and metrics array are required" });
      }
      
      // Validate application exists
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      // Validate and create metrics
      const createdMetrics = [];
      for (const metricData of metricsData) {
        try {
          const validatedData = insertMetricSchema.parse({ ...metricData, applicationId });
          const metric = await storage.createMetric(validatedData);
          createdMetrics.push(metric);
          broadcastMetric(metric);
        } catch (error) {
          console.error('Invalid metric data:', error);
        }
      }
      
      res.status(201).json({ 
        message: `Successfully ingested ${createdMetrics.length} metrics`,
        count: createdMetrics.length 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to ingest metrics" });
    }
  });
  
  // Enhanced single metric endpoint with application validation
  app.post("/api/ingest/metrics", async (req, res) => {
    try {
      const validatedData = insertMetricSchema.parse(req.body);
      
      // Validate application exists
      const application = await storage.getApplication(validatedData.applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      const metric = await storage.createMetric(validatedData);
      broadcastMetric(metric);
      res.status(201).json(metric);
    } catch (error) {
      res.status(400).json({ error: "Invalid metric data" });
    }
  });
  
  // Application registration endpoint for external apps
  app.post("/api/ingest/register", async (req, res) => {
    try {
      const { name, description, version, environment } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Application name is required" });
      }
      
      const applicationData = {
        name,
        status: "healthy",
        uptime: 100,
        avgResponseTime: 0
      };
      
      const application = await storage.createApplication(applicationData);
      res.status(201).json({ 
        applicationId: application.id,
        message: "Application registered successfully",
        application 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to register application" });
    }
  });

  // Metrics endpoints
  app.get("/api/metrics", async (req, res) => {
    try {
      const { applicationId, limit, start, end } = req.query;
      
      let metrics;
      if (start && end) {
        metrics = await storage.getMetricsByTimeRange(
          new Date(start as string),
          new Date(end as string),
          applicationId as string
        );
      } else {
        metrics = await storage.getMetrics(
          applicationId as string,
          limit ? parseInt(limit as string) : undefined
        );
      }
      
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  app.post("/api/metrics", async (req, res) => {
    try {
      const validatedData = insertMetricSchema.parse(req.body);
      const metric = await storage.createMetric(validatedData);
      
      // Broadcast to WebSocket clients
      broadcastMetric(metric);
      
      res.status(201).json(metric);
    } catch (error) {
      res.status(400).json({ error: "Invalid metric data" });
    }
  });

  // Errors endpoints
  app.get("/api/errors", async (req, res) => {
    try {
      const { applicationId, limit } = req.query;
      const errors = await storage.getErrors(
        applicationId as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(errors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch errors" });
    }
  });

  app.post("/api/errors", async (req, res) => {
    try {
      const validatedData = insertErrorSchema.parse(req.body);
      const errorRecord = await storage.createError(validatedData);
      
      // Broadcast to WebSocket clients
      broadcastError(errorRecord);
      
      res.status(201).json(errorRecord);
    } catch (error) {
      res.status(400).json({ error: "Invalid error data" });
    }
  });
  
  // Bulk error ingestion endpoint
  app.post("/api/ingest/errors/bulk", async (req, res) => {
    try {
      const { applicationId, errors: errorsData } = req.body;
      
      if (!applicationId || !Array.isArray(errorsData)) {
        return res.status(400).json({ error: "applicationId and errors array are required" });
      }
      
      // Validate application exists
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      // Validate and create errors
      const createdErrors = [];
      for (const errorData of errorsData) {
        try {
          const validatedData = insertErrorSchema.parse({ ...errorData, applicationId });
          const error = await storage.createError(validatedData);
          createdErrors.push(error);
          broadcastError(error);
        } catch (error) {
          console.error('Invalid error data:', error);
        }
      }
      
      res.status(201).json({ 
        message: `Successfully ingested ${createdErrors.length} errors`,
        count: createdErrors.length 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to ingest errors" });
    }
  });

  // Alerts endpoints
  app.get("/api/alerts", async (req, res) => {
    try {
      const { applicationId, acknowledged } = req.query;
      const alerts = await storage.getAlerts(
        applicationId as string,
        acknowledged ? acknowledged === 'true' : undefined
      );
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      
      // Broadcast to WebSocket clients
      broadcastAlert(alert);
      
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ error: "Invalid alert data" });
    }
  });

  app.patch("/api/alerts/:id/acknowledge", async (req, res) => {
    try {
      const { id } = req.params;
      const alert = await storage.acknowledgeAlert(id);
      
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      
      // Broadcast to WebSocket clients
      broadcastAlert(alert);
      
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to acknowledge alert" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    
    ws.on('close', () => {
      clients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast functions
  function broadcastMetric(metric: any) {
    broadcast({ type: 'metric', data: metric });
  }

  function broadcastError(error: any) {
    broadcast({ type: 'error', data: error });
  }

  function broadcastAlert(alert: any) {
    broadcast({ type: 'alert', data: alert });
  }

  function broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // Simulate real-time data generation
  setInterval(async () => {
    const applications = await storage.getApplications();
    
    for (const app of applications) {
      // Generate random metrics
      const metric = {
        applicationId: app.id,
        responseTime: Math.random() * 500 + 100,
        throughput: Math.random() * 2000 + 500,
        errorRate: Math.random() * 2,
        successRate: 100 - (Math.random() * 2),
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
      };
      
      const savedMetric = await storage.createMetric(metric);
      broadcastMetric(savedMetric);
      
      // Occasionally generate errors and alerts
      if (Math.random() < 0.1) {
        const errorTypes = ['NullPointerException', 'TimeoutException', 'DatabaseConnectionException', 'ValidationError'];
        const endpoints = ['/api/users', '/api/payments/process', '/api/auth/login', '/api/orders'];
        
        const error = {
          applicationId: app.id,
          errorType: errorTypes[Math.floor(Math.random() * errorTypes.length)],
          message: `Error occurred in ${app.name}`,
          endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
          stackTrace: 'at com.example.service.UserService.getUser(UserService.java:42)',
          count: 1,
        };
        
        const savedError = await storage.createError(error);
        broadcastError(savedError);
      }
      
      if (Math.random() < 0.05) {
        const alertTypes = ['high_response_time', 'cpu_usage', 'error_rate'];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        const alert = {
          applicationId: app.id,
          alertType,
          severity: metric.responseTime > 400 || metric.errorRate > 1 ? 'critical' : 'warning',
          message: `${alertType.replace('_', ' ')} threshold exceeded for ${app.name}`,
          threshold: alertType === 'high_response_time' ? 500 : alertType === 'cpu_usage' ? 80 : 1,
          currentValue: alertType === 'high_response_time' ? metric.responseTime : alertType === 'cpu_usage' ? metric.cpuUsage! : metric.errorRate,
          acknowledged: false,
        };
        
        const savedAlert = await storage.createAlert(alert);
        broadcastAlert(savedAlert);
      }
    }
  }, 10000); // Every 10 seconds

  return httpServer;
}
