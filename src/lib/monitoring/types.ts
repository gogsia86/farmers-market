/**
 * 🌟 Divine Workflow Monitoring Types
 * Farmers Market Platform - Automated Workflow Testing & Reporting
 * Version: 1.0.0
 */

import type { Page } from "@playwright/test";

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

export type WorkflowStatus = "PASSED" | "FAILED" | "WARNING" | "SKIPPED";
export type WorkflowType =
  | "USER_REGISTRATION"
  | "USER_LOGIN"
  | "FARM_CREATION"
  | "PRODUCT_LISTING"
  | "ORDER_PLACEMENT"
  | "PAYMENT_PROCESSING"
  | "SEARCH_FUNCTIONALITY"
  | "CART_MANAGEMENT"
  | "PROFILE_UPDATE"
  | "HEALTH_CHECK";

export type WorkflowPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type NotificationChannel =
  | "EMAIL"
  | "SLACK"
  | "DISCORD"
  | "WEBHOOK"
  | "ALL";

// ============================================================================
// WORKFLOW CONFIGURATION
// ============================================================================

export interface WorkflowConfig {
  id: string;
  name: string;
  type: WorkflowType;
  priority: WorkflowPriority;
  enabled: boolean;
  schedule?: {
    interval: number; // in minutes
    cron?: string; // optional cron expression
  };
  timeout: number; // in milliseconds
  retries: number;
  tags: string[];
  dependencies?: string[]; // other workflow IDs
  notifyOnFailure: boolean;
  notifyOnSuccess: boolean;
  agricultureAwareness?: {
    seasonal?: boolean;
    biodynamic?: boolean;
    checkSoilHealth?: boolean;
  };
}

// ============================================================================
// WORKFLOW STEP
// ============================================================================

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  execute: (context: WorkflowContext) => Promise<WorkflowStepResult>;
  timeout?: number;
  retries?: number;
  skipOnFailure?: boolean;
  agricultureMetadata?: Record<string, any>;
}

export interface WorkflowStepResult {
  success: boolean;
  duration: number;
  error?: Error;
  screenshot?: string;
  trace?: string;
  metrics?: Record<string, number>;
  logs: string[];
  agricultureData?: Record<string, any>;
}

// ============================================================================
// WORKFLOW CONTEXT
// ============================================================================

export interface WorkflowContext {
  workflowId: string;
  runId: string;
  page?: Page;
  baseUrl: string;
  config: WorkflowConfig;
  testData: Record<string, any>;
  state: Record<string, any>;
  season?: "SPRING" | "SUMMER" | "FALL" | "WINTER";
  startTime: Date;
  timeout: number;
}

// ============================================================================
// WORKFLOW RESULT
// ============================================================================

export interface WorkflowResult {
  workflowId: string;
  runId: string;
  name: string;
  type: WorkflowType;
  priority: WorkflowPriority;
  status: WorkflowStatus;
  startTime: Date;
  endTime: Date;
  duration: number;
  steps: WorkflowStepResult[];
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  skippedSteps: number;
  error?: string;
  screenshots: string[];
  traces: string[];
  metrics: WorkflowMetrics;
  agricultureConsciousness?: AgriculturalAnalysis;
  tags: string[];
}

// ============================================================================
// WORKFLOW METRICS
// ============================================================================

export interface WorkflowMetrics {
  totalDuration: number;
  apiResponseTime?: number;
  pageLoadTime?: number;
  databaseQueryTime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  networkRequests?: number;
  errors?: number;
  warnings?: number;
  performanceScore?: number;
  agricultureMetrics?: {
    seasonalComplianceScore?: number;
    biodynamicPatternMatch?: number;
    farmDataIntegrity?: number;
  };
}

// ============================================================================
// AGRICULTURAL ANALYSIS
// ============================================================================

export interface AgriculturalAnalysis {
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER";
  seasonalRelevance: number; // 0-100
  biodynamicAlignment: number; // 0-100
  farmHealthScore: number; // 0-100
  soilQualityCheck?: boolean;
  recommendations: string[];
  warnings: string[];
}

// ============================================================================
// MONITORING REPORT
// ============================================================================

export interface MonitoringReport {
  reportId: string;
  timestamp: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalWorkflows: number;
    passedWorkflows: number;
    failedWorkflows: number;
    warningWorkflows: number;
    skippedWorkflows: number;
    successRate: number;
    averageDuration: number;
    criticalIssues: number;
  };
  workflows: WorkflowResult[];
  trends: {
    successRateTrend: number; // percentage change
    performanceTrend: number; // percentage change
    errorRateTrend: number;
  };
  recommendations: string[];
  agricultureInsights?: {
    seasonalOptimization: string[];
    biodynamicSuggestions: string[];
    farmHealthTrends: string[];
  };
}

// ============================================================================
// NOTIFICATION
// ============================================================================

export interface NotificationConfig {
  channels: NotificationChannel[];
  email?: {
    to: string[];
    cc?: string[];
    from: string;
    subject: string;
  };
  slack?: {
    webhookUrl: string;
    channel?: string;
    username?: string;
  };
  discord?: {
    webhookUrl: string;
    username?: string;
    avatarUrl?: string;
  };
  webhook?: {
    url: string;
    method: "POST" | "PUT";
    headers?: Record<string, string>;
  };
  throttle?: {
    maxPerHour: number;
    maxPerDay: number;
  };
}

export interface Notification {
  id: string;
  timestamp: Date;
  channel: NotificationChannel;
  priority: WorkflowPriority;
  title: string;
  message: string;
  workflowResult?: WorkflowResult;
  report?: MonitoringReport;
  sent: boolean;
  error?: string;
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export interface HealthCheckResult {
  healthy: boolean;
  timestamp: Date;
  checks: {
    database: boolean;
    api: boolean;
    cache: boolean;
    externalServices: boolean;
  };
  details: Record<string, any>;
  responseTime: number;
}

// ============================================================================
// SCHEDULER
// ============================================================================

export interface SchedulerConfig {
  enabled: boolean;
  workflows: WorkflowSchedule[];
  concurrency: number;
  retryOnFailure: boolean;
  maxRetries: number;
  retryDelay: number;
}

export interface WorkflowSchedule {
  workflowId: string;
  cron: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  failureCount: number;
}

// ============================================================================
// DIVINE BOT CONFIGURATION
// ============================================================================

export interface DivineBotConfig {
  enabled: boolean;
  name: string;
  version: string;
  baseUrl: string;
  environments: {
    dev: string;
    staging?: string;
    production?: string;
  };
  workflows: WorkflowConfig[];
  scheduler: SchedulerConfig;
  notifications: NotificationConfig;
  storage: {
    type: "filesystem" | "database" | "s3";
    location: string;
    retention: {
      days: number;
      maxReports: number;
    };
  };
  agricultureConsciousness: {
    enabled: boolean;
    seasonalAwareness: boolean;
    biodynamicValidation: boolean;
    farmHealthMonitoring: boolean;
  };
  performance: {
    parallel: boolean;
    maxConcurrency: number;
    timeout: number;
    screenshotOnFailure: boolean;
    traceOnFailure: boolean;
  };
  logging: {
    level: "debug" | "info" | "warn" | "error";
    console: boolean;
    file: boolean;
    remote?: {
      url: string;
      apiKey: string;
    };
  };
}

// ============================================================================
// WORKFLOW EXECUTOR
// ============================================================================

export interface WorkflowExecutor {
  execute(
    workflow: WorkflowConfig,
    context: WorkflowContext,
  ): Promise<WorkflowResult>;
  retry(
    workflow: WorkflowConfig,
    context: WorkflowContext,
    attempt: number,
  ): Promise<WorkflowResult>;
  validate(workflow: WorkflowConfig): Promise<boolean>;
  getDependencies(workflowId: string): Promise<WorkflowConfig[]>;
}

// ============================================================================
// REPORTER
// ============================================================================

export interface Reporter {
  generateReport(
    results: WorkflowResult[],
    period: { start: Date; end: Date },
  ): Promise<MonitoringReport>;
  saveReport(report: MonitoringReport): Promise<void>;
  sendNotifications(report: MonitoringReport): Promise<Notification[]>;
  getReportHistory(limit?: number): Promise<MonitoringReport[]>;
}

// ============================================================================
// DIVINE PATTERNS
// ============================================================================

export interface QuantumWorkflowOrchestrator {
  manifestWorkflow(config: WorkflowConfig): Promise<WorkflowResult>;
  transcendTemporalLimitations(workflow: WorkflowConfig): Promise<void>;
  maintainCoherence(results: WorkflowResult[]): Promise<boolean>;
  achieveEnlightenment(): Promise<AgriculturalAnalysis>;
}

// ============================================================================
// EXPORT DEFAULT CONFIG
// ============================================================================

export const DEFAULT_WORKFLOW_TIMEOUT = 5 * 60 * 1000; // 5 minutes
export const DEFAULT_STEP_TIMEOUT = 30 * 1000; // 30 seconds
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_RETRY_DELAY = 5000; // 5 seconds
export const DEFAULT_CONCURRENCY = 5;
export const DEFAULT_RETENTION_DAYS = 30;
export const DEFAULT_MAX_REPORTS = 1000;
