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

// ============================================================================
// AI ANALYSIS TYPES
// ============================================================================

export interface AIAnalysisResult {
  rootCause: string;
  remediationSteps: string[];
  preventionStrategy: string;
  relatedIssues: string[];
  confidence: number; // 0-100
  aiModel: string;
  timestamp: Date;
  estimatedFixTime?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface FailureAnalysis extends AIAnalysisResult {
  immediateFix: string[];
  longTermSolutions: string[];
  similarIncidents?: string[];
  documentationLinks?: string[];
}

export interface FailureRiskPrediction {
  workflowId: string;
  riskScore: number; // 0-100
  confidence: number; // 0-100
  predictedTimeToFailure?: string;
  contributingFactors: string[];
  recommendations: string[];
  mitigationSteps: string[];
  timestamp: Date;
}

export interface FailurePrediction {
  failureProbability: number;
  confidence: number;
  predictedTimeToFailure?: string;
  contributingFactors: string[];
  recommendation: string;
  preventiveActions?: string[];
}

// ============================================================================
// AGENT FRAMEWORK TYPES
// ============================================================================

export interface AgentConfig {
  name: string;
  role: "ANALYST" | "OPTIMIZER" | "AUDITOR" | "ADVISOR" | "HEALER";
  systemMessage: string;
  llmConfig: {
    model: string;
    provider: "openai" | "anthropic" | "azure";
    temperature: number;
    maxTokens?: number;
  };
  capabilities: string[];
  agriculturalAwareness?: boolean;
}

export interface AgentMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface AgentResponse {
  content: string;
  confidence: number;
  reasoning?: string;
  suggestions?: string[];
  metadata?: Record<string, any>;
}

export interface MultiAgentAnalysis {
  consensus: string;
  individualAnalyses: Array<{
    agent: string;
    analysis: string;
    confidence: number;
  }>;
  conflictingOpinions?: string[];
  finalRecommendation: string;
  votingResults?: Record<string, number>;
}

// ============================================================================
// TRACING TYPES
// ============================================================================

export interface TracingConfig {
  enabled: boolean;
  serviceName: string;
  serviceVersion: string;
  exporter: "console" | "otlp-http" | "otlp-grpc" | "azure-monitor";
  endpoint?: string;
  connectionString?: string;
  samplingRate?: number;
  attributes?: Record<string, string | number | boolean>;
}

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  attributes: Record<string, any>;
  events: TraceEvent[];
  status: "OK" | "ERROR" | "UNSET";
}

export interface TraceEvent {
  name: string;
  timestamp: Date;
  attributes?: Record<string, any>;
}

export interface SpanMetrics {
  duration: number;
  childSpans: number;
  errors: number;
  attributes: Record<string, any>;
}

// ============================================================================
// SELF-HEALING TYPES
// ============================================================================

export interface RemediationStrategy {
  id: string;
  name: string;
  description: string;
  applicableTo: string[]; // error codes/types
  execute: (context: HealingContext) => Promise<HealingResult>;
  safetyCheck: (context: HealingContext) => boolean;
  successRate: number;
  estimatedDuration?: number;
  requiresApproval?: boolean;
}

export interface HealingContext {
  workflowResult: WorkflowResult;
  aiAnalysis?: AIAnalysisResult;
  historicalData?: WorkflowResult[];
  systemState?: Record<string, any>;
}

export interface HealingResult {
  healed: boolean;
  strategyUsed?: string;
  actions: string[];
  duration: number;
  reason?: string;
  requiresManualIntervention: boolean;
  followUpRecommendations?: string[];
  verificationPassed?: boolean;
}

export interface HealingAttempt {
  id: string;
  timestamp: Date;
  workflowId: string;
  strategy: string;
  result: HealingResult;
  aiConfidence?: number;
}

// ============================================================================
// ML PREDICTION TYPES
// ============================================================================

export interface PredictionModel {
  id: string;
  name: string;
  version: string;
  type: "LSTM" | "RANDOM_FOREST" | "XG_BOOST" | "NEURAL_NETWORK";
  trainingDate: Date;
  accuracy: number;
  features: string[];
  targetVariable: string;
}

export interface ModelTrainingData {
  features: number[][];
  labels: number[];
  timestamps: Date[];
  metadata?: Record<string, any>;
}

export interface PredictionResult {
  prediction: number;
  confidence: number;
  timestamp: Date;
  model: string;
  features: Record<string, number>;
  explanation?: string;
}

export interface AnomalyDetection {
  isAnomaly: boolean;
  anomalyScore: number;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  context: string;
  recommendations: string[];
}

// ============================================================================
// PERFORMANCE OPTIMIZATION TYPES
// ============================================================================

export interface PerformanceOptimization {
  id: string;
  type: "TIMEOUT" | "CONCURRENCY" | "CACHING" | "QUERY" | "NETWORK";
  description: string;
  currentValue: any;
  suggestedValue: any;
  expectedImprovement: string;
  confidence: number;
  implementationDifficulty: "LOW" | "MEDIUM" | "HIGH";
  priority: WorkflowPriority;
}

export interface PerformanceAnalysis {
  workflowId: string;
  averageDuration: number;
  p50: number;
  p95: number;
  p99: number;
  bottlenecks: string[];
  optimizations: PerformanceOptimization[];
  trend: "IMPROVING" | "STABLE" | "DEGRADING";
  comparisonToPrevious: number; // percentage change
}

// ============================================================================
// ENHANCED MONITORING REPORT
// ============================================================================

export interface EnhancedMonitoringReport extends MonitoringReport {
  aiInsights?: {
    executiveSummary: string;
    keyFindings: string[];
    criticalActions: string[];
    predictedIssues: FailureRiskPrediction[];
    performanceOptimizations: PerformanceOptimization[];
  };
  healing?: {
    totalAttempts: number;
    successfulHeals: number;
    failedHeals: number;
    averageHealTime: number;
    savedDowntime: number;
  };
  mlPredictions?: {
    nextHourRisk: number;
    next6HourRisk: number;
    next24HourRisk: number;
    anomaliesDetected: AnomalyDetection[];
  };
  agentCollaboration?: {
    totalAgentInteractions: number;
    consensusRate: number;
    topRecommendations: string[];
  };
}

// ============================================================================
// CONFIGURATION EXTENSIONS
// ============================================================================

export interface AIConfig {
  enabled: boolean;
  providers: {
    openai?: {
      apiKey: string;
      model: string;
      temperature?: number;
    };
    anthropic?: {
      apiKey: string;
      model: string;
    };
    azure?: {
      apiKey: string;
      endpoint: string;
      deployment: string;
    };
  };
  features: {
    failureAnalysis: boolean;
    predictiveMonitoring: boolean;
    selfHealing: boolean;
    agentOrchestration: boolean;
    performanceOptimization: boolean;
  };
  agentFramework?: {
    maxAgents: number;
    collaborationMode: "SEQUENTIAL" | "PARALLEL" | "VOTING";
    consensusThreshold?: number;
  };
}

export interface EnhancedDivineBotConfig extends DivineBotConfig {
  ai?: AIConfig;
  tracing?: TracingConfig;
  selfHealing?: {
    enabled: boolean;
    autoApprove: boolean;
    maxAttemptsPerWorkflow: number;
    strategies: RemediationStrategy[];
  };
  ml?: {
    enabled: boolean;
    modelPath: string;
    trainingSchedule?: string;
    features: string[];
  };
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

// AI/ML Defaults
export const DEFAULT_AI_CONFIDENCE_THRESHOLD = 0.7;
export const DEFAULT_PREDICTION_WINDOW = 6 * 60 * 60 * 1000; // 6 hours
export const DEFAULT_ANOMALY_THRESHOLD = 2.5; // standard deviations
export const DEFAULT_HEALING_TIMEOUT = 5 * 60 * 1000; // 5 minutes
