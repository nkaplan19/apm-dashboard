import { type Application, type InsertApplication, type Metric, type InsertMetric, type Error, type InsertError, type Alert, type InsertAlert, applications, metrics, errors, alerts } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Applications
  getApplications(): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, updates: Partial<Application>): Promise<Application | undefined>;
  
  // Metrics
  getMetrics(applicationId?: string, limit?: number): Promise<Metric[]>;
  getMetricsByTimeRange(start: Date, end: Date, applicationId?: string): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;
  
  // Errors
  getErrors(applicationId?: string, limit?: number): Promise<Error[]>;
  createError(error: InsertError): Promise<Error>;
  
  // Alerts
  getAlerts(applicationId?: string, acknowledged?: boolean): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  acknowledgeAlert(id: string): Promise<Alert | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedData();
  }

  private async seedData() {
    // Check if we already have seeded data
    const existingApps = await db.select().from(applications);
    if (existingApps.length > 0) return;

    // Create sample applications
    await db.insert(applications).values([
      {
        name: "Web Portal",
        status: "healthy",
        uptime: 99.9,
        avgResponseTime: 156,
      },
      {
        name: "API Gateway",
        status: "warning",
        uptime: 98.2,
        avgResponseTime: 324,
      },
      {
        name: "User Service", 
        status: "healthy",
        uptime: 99.7,
        avgResponseTime: 189,
      },
      {
        name: "Payment Service",
        status: "critical", 
        uptime: 95.1,
        avgResponseTime: 892,
      }
    ]);
  }

  async getApplications(): Promise<Application[]> {
    return await db.select().from(applications).orderBy(applications.name);
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app || undefined;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [app] = await db.insert(applications).values(insertApplication).returning();
    return app;
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application | undefined> {
    const [app] = await db.update(applications)
      .set(updates)
      .where(eq(applications.id, id))
      .returning();
    return app || undefined;
  }

  async getMetrics(applicationId?: string, limit = 100): Promise<Metric[]> {
    const query = db.select().from(metrics);
    
    if (applicationId) {
      return await query
        .where(eq(metrics.applicationId, applicationId))
        .orderBy(desc(metrics.timestamp))
        .limit(limit);
    }
    
    return await query
      .orderBy(desc(metrics.timestamp))
      .limit(limit);
  }

  async getMetricsByTimeRange(start: Date, end: Date, applicationId?: string): Promise<Metric[]> {
    const query = db.select().from(metrics);
    const timeCondition = and(
      gte(metrics.timestamp, start),
      lte(metrics.timestamp, end)
    );
    
    if (applicationId) {
      return await query.where(
        and(eq(metrics.applicationId, applicationId), timeCondition)
      ).orderBy(desc(metrics.timestamp));
    }
    
    return await query.where(timeCondition).orderBy(desc(metrics.timestamp));
  }

  async createMetric(insertMetric: InsertMetric): Promise<Metric> {
    const [metric] = await db.insert(metrics).values(insertMetric).returning();
    return metric;
  }

  async getErrors(applicationId?: string, limit = 50): Promise<Error[]> {
    const query = db.select().from(errors);
    
    if (applicationId) {
      return await query
        .where(eq(errors.applicationId, applicationId))
        .orderBy(desc(errors.timestamp))
        .limit(limit);
    }
    
    return await query
      .orderBy(desc(errors.timestamp))
      .limit(limit);
  }

  async createError(insertError: InsertError): Promise<Error> {
    const [error] = await db.insert(errors).values(insertError).returning();
    return error;
  }

  async getAlerts(applicationId?: string, acknowledged?: boolean): Promise<Alert[]> {
    let conditions = [];
    
    if (applicationId) {
      conditions.push(eq(alerts.applicationId, applicationId));
    }
    
    if (acknowledged !== undefined) {
      conditions.push(eq(alerts.acknowledged, acknowledged));
    }
    
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
    
    return await db.select().from(alerts)
      .where(whereCondition)
      .orderBy(desc(alerts.timestamp));
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db.insert(alerts).values(insertAlert).returning();
    return alert;
  }

  async acknowledgeAlert(id: string): Promise<Alert | undefined> {
    const [alert] = await db.update(alerts)
      .set({ 
        acknowledged: true, 
        acknowledgedAt: new Date() 
      })
      .where(eq(alerts.id, id))
      .returning();
    return alert || undefined;
  }
}

export const storage = new DatabaseStorage();
