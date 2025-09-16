import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  status: text("status").notNull(), // 'healthy', 'warning', 'critical'
  uptime: real("uptime").notNull().default(0), // percentage
  avgResponseTime: real("avg_response_time").notNull().default(0), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const metrics = pgTable("metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  responseTime: real("response_time").notNull(), // milliseconds
  throughput: real("throughput").notNull(), // requests per minute
  errorRate: real("error_rate").notNull(), // percentage
  successRate: real("success_rate").notNull(), // percentage
  cpuUsage: real("cpu_usage"), // percentage
  memoryUsage: real("memory_usage"), // percentage
});

export const errors = pgTable("errors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  errorType: text("error_type").notNull(),
  message: text("message").notNull(),
  stackTrace: text("stack_trace"),
  endpoint: text("endpoint"),
  count: integer("count").notNull().default(1),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  alertType: text("alert_type").notNull(), // 'high_response_time', 'cpu_usage', 'error_rate'
  severity: text("severity").notNull(), // 'warning', 'critical'
  message: text("message").notNull(),
  threshold: real("threshold").notNull(),
  currentValue: real("current_value").notNull(),
  acknowledged: boolean("acknowledged").notNull().default(false),
  acknowledgedAt: timestamp("acknowledged_at"),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
});

export const insertMetricSchema = createInsertSchema(metrics).omit({
  id: true,
  timestamp: true,
});

export const insertErrorSchema = createInsertSchema(errors).omit({
  id: true,
  timestamp: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  timestamp: true,
  acknowledgedAt: true,
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type Error = typeof errors.$inferSelect;
export type InsertError = z.infer<typeof insertErrorSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
