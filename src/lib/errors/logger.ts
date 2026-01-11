/**
 * 🌟 Error Logger - Divine Agricultural Error Tracing
 *
 * Comprehensive error logging with OpenTelemetry integration,
 * structured logging, and agricultural consciousness.
 *
 * @module lib/errors/logger
 */

import { context, SpanStatusCode, trace, type Span } from "@opentelemetry/api";
import type { AppError, ErrorMetadata } from "./types";
import { ErrorCategory, ErrorSeverity, isAppError, toAppError } from "./types";

// ============================================================================
// LOGGER CONFIGURATION
// ============================================================================

export interface LoggerConfig {
  /** Application name for tracing */
  serviceName: string;
  /** Environment (development, production, etc.) */
  environment: string;
  /** Enable console logging */
  enableConsole: boolean;
  /** Enable OpenTelemetry tracing */
  enableTracing: boolean;
  /** Minimum severity to log */
  minSeverity: ErrorSeverity;
  /** External logging service endpoint */
  externalEndpoint?: string;
}

const DEFAULT_CONFIG: LoggerConfig = {
  serviceName: "farmers-market-platform",
  environment: process.env.NODE_ENV || "development",
  enableConsole: true,
  enableTracing: true,
  minSeverity: ErrorSeverity.INFO,
};

let currentConfig = { ...DEFAULT_CONFIG };

/**
 * Configure the error logger
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

// ============================================================================
// ERROR LOGGING
// ============================================================================

/**
 * Log an error with full context
 */
export function logError(
  error: unknown,
  additionalContext?: Record<string, any>,
): void {
  const appError = isAppError(error) ? error : toAppError(error);

  // Check severity threshold
  if (shouldLog(appError.severity)) {
    // Console logging
    if (currentConfig.enableConsole) {
      logToConsole(appError, additionalContext);
    }

    // OpenTelemetry tracing
    if (currentConfig.enableTracing) {
      logToTracing(appError, additionalContext);
    }

    // External logging service
    if (currentConfig.externalEndpoint) {
      logToExternalService(appError, additionalContext).catch((err) => {
        console.error("Failed to send error to external service:", err);
      });
    }
  }
}

/**
 * Log error within an active span
 */
export function logErrorInSpan(
  error: unknown,
  span: Span,
  additionalContext?: Record<string, any>,
): void {
  const appError = isAppError(error) ? error : toAppError(error);

  // Set span status
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: appError.message,
  });

  // Record error event
  span.recordException(appError, Date.now());

  // Set additional attributes
  span.setAttributes({
    "error.id": appError.errorId,
    "error.code": appError.code,
    "error.severity": appError.severity,
    "error.category": appError.category,
    "error.retryable": appError.retryable,
  });

  // Also log normally
  logError(appError, additionalContext);
}

/**
 * Check if error should be logged based on severity
 */
function shouldLog(severity: ErrorSeverity): boolean {
  const severityOrder = [
    ErrorSeverity.INFO,
    ErrorSeverity.WARNING,
    ErrorSeverity.ERROR,
    ErrorSeverity.CRITICAL,
    ErrorSeverity.FATAL,
  ];

  const minIndex = severityOrder.indexOf(currentConfig.minSeverity);
  const errorIndex = severityOrder.indexOf(severity);

  return errorIndex >= minIndex;
}

// ============================================================================
// CONSOLE LOGGING
// ============================================================================

/**
 * Log error to console with formatting
 */
function logToConsole(
  error: AppError,
  additionalContext?: Record<string, any>,
): void {
  const logData = {
    errorId: error.errorId,
    timestamp: error.timestamp,
    severity: error.severity,
    category: error.category,
    code: error.code,
    message: error.message,
    metadata: error.metadata,
    userDetails: error.userDetails,
    recoveryStrategy: error.recoveryStrategy,
    retryable: error.retryable,
    additionalContext,
  };

  switch (error.severity) {
    case ErrorSeverity.FATAL:
    case ErrorSeverity.CRITICAL:
      console.error("🔴 [CRITICAL ERROR]", logData);
      if (error.stack) {
        console.error("Stack trace:", error.stack);
      }
      break;

    case ErrorSeverity.ERROR:
      console.error("🟠 [ERROR]", logData);
      break;

    case ErrorSeverity.WARNING:
      console.warn("🟡 [WARNING]", logData);
      break;

    case ErrorSeverity.INFO:
      console.info("🔵 [INFO]", logData);
      break;
  }
}

// ============================================================================
// OPENTELEMETRY TRACING
// ============================================================================

/**
 * Log error to OpenTelemetry tracing
 */
function logToTracing(
  error: AppError,
  additionalContext?: Record<string, any>,
): void {
  const tracer = trace.getTracer(currentConfig.serviceName);

  // Create a span for the error
  const span = tracer.startSpan("error.logged", {
    attributes: {
      "error.id": error.errorId,
      "error.code": error.code,
      "error.severity": error.severity,
      "error.category": error.category,
      "error.message": error.message,
      "error.retryable": error.retryable,
      "error.recovery_strategy": error.recoveryStrategy,
      "service.name": currentConfig.serviceName,
      "service.environment": currentConfig.environment,
      ...flattenContext(additionalContext),
    },
  });

  // Record the exception
  span.recordException(error);

  // Set span status
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: error.message,
  });

  // Add metadata as events
  if (error.metadata.context) {
    span.addEvent("error.context", flattenContext(error.metadata.context));
  }

  if (error.metadata.component) {
    span.setAttribute("code.component", error.metadata.component);
  }

  if (error.metadata.operation) {
    span.setAttribute("code.operation", error.metadata.operation);
  }

  // Agricultural consciousness
  if (error.category === ErrorCategory.SEASONAL) {
    span.addEvent("agricultural.seasonal_error", {
      category: "seasonal",
      consciousness: "divine",
    });
  }

  if (error.category === ErrorCategory.BIODYNAMIC) {
    span.addEvent("agricultural.biodynamic_error", {
      category: "biodynamic",
      consciousness: "divine",
    });
  }

  span.end();
}

/**
 * Flatten nested context for OpenTelemetry attributes
 */
function flattenContext(
  obj: Record<string, any> | undefined,
  prefix = "",
): Record<string, string | number | boolean> {
  if (!obj) return {};

  const flattened: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(obj)) {
    const flatKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      Object.assign(flattened, flattenContext(value, flatKey));
    } else if (Array.isArray(value)) {
      flattened[flatKey] = JSON.stringify(value);
    } else if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      flattened[flatKey] = value;
    } else {
      flattened[flatKey] = String(value);
    }
  }

  return flattened;
}

// ============================================================================
// EXTERNAL LOGGING SERVICE
// ============================================================================

/**
 * Send error to external logging service (e.g., Azure Application Insights)
 */
async function logToExternalService(
  error: AppError,
  additionalContext?: Record<string, any>,
): Promise<void> {
  if (!currentConfig.externalEndpoint) {
    return;
  }

  try {
    const payload = {
      errorId: error.errorId,
      timestamp: error.timestamp,
      severity: error.severity,
      category: error.category,
      code: error.code,
      message: error.message,
      metadata: error.metadata,
      serviceName: currentConfig.serviceName,
      environment: currentConfig.environment,
      additionalContext,
    };

    await fetch(currentConfig.externalEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Don't throw - logging should never break the application
    console.error("Failed to log to external service:", err);
  }
}

// ============================================================================
// STRUCTURED LOGGING
// ============================================================================

/**
 * Create structured log entry
 */
export interface StructuredLogEntry {
  timestamp: string;
  level: ErrorSeverity;
  message: string;
  errorId?: string;
  code?: string;
  category?: ErrorCategory;
  metadata?: ErrorMetadata;
  context?: Record<string, any>;
  serviceName: string;
  environment: string;
}

/**
 * Create a structured log entry from error
 */
export function createStructuredLog(
  error: AppError,
  additionalContext?: Record<string, any>,
): StructuredLogEntry {
  return {
    timestamp: error.timestamp,
    level: error.severity,
    message: error.message,
    errorId: error.errorId,
    code: error.code,
    category: error.category,
    metadata: error.metadata,
    context: additionalContext,
    serviceName: currentConfig.serviceName,
    environment: currentConfig.environment,
  };
}

// ============================================================================
// ERROR AGGREGATION
// ============================================================================

/**
 * Error aggregation for batch logging
 */
class ErrorAggregator {
  private errors: AppError[] = [];
  private maxSize = 100;
  private flushInterval = 30000; // 30 seconds
  private timer: NodeJS.Timeout | null = null;

  constructor(maxSize?: number, flushInterval?: number) {
    if (maxSize) this.maxSize = maxSize;
    if (flushInterval) this.flushInterval = flushInterval;
    this.startTimer();
  }

  add(error: AppError): void {
    this.errors.push(error);

    if (this.errors.length >= this.maxSize) {
      this.flush();
    }
  }

  flush(): void {
    if (this.errors.length === 0) return;

    const batch = [...this.errors];
    this.errors = [];

    // Log batch
    if (currentConfig.enableConsole) {
      console.info(
        `📦 [ERROR BATCH] Flushing ${batch.length} errors`,
        batch.map((e: any) => ({
          errorId: e.errorId,
          code: e.code,
          severity: e.severity,
        })),
      );
    }

    // Send to external service if configured
    if (currentConfig.externalEndpoint) {
      this.sendBatch(batch).catch((err) => {
        console.error("Failed to send error batch:", err);
      });
    }
  }

  private async sendBatch(errors: AppError[]): Promise<void> {
    if (!currentConfig.externalEndpoint) return;

    try {
      await fetch(currentConfig.externalEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batch: true,
          count: errors.length,
          errors: errors.map((e: any) => createStructuredLog(e)),
          serviceName: currentConfig.serviceName,
          environment: currentConfig.environment,
        }),
      });
    } catch (err) {
      console.error("Failed to send error batch:", err);
    }
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushInterval);

    // Prevent timer from keeping process alive
    if (this.timer.unref) {
      this.timer.unref();
    }
  }

  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
  }
}

// Singleton aggregator
let errorAggregator: ErrorAggregator | null = null;

/**
 * Enable error aggregation for batch logging
 */
export function enableErrorAggregation(
  maxSize?: number,
  flushInterval?: number,
): void {
  if (errorAggregator) {
    errorAggregator.destroy();
  }
  errorAggregator = new ErrorAggregator(maxSize, flushInterval);
}

/**
 * Add error to aggregator
 */
export function aggregateError(error: AppError): void {
  if (errorAggregator) {
    errorAggregator.add(error);
  } else {
    logError(error);
  }
}

/**
 * Flush aggregated errors
 */
export function flushAggregatedErrors(): void {
  if (errorAggregator) {
    errorAggregator.flush();
  }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Track error rate for monitoring
 */
class ErrorRateTracker {
  private errorCounts = new Map<string, number>();
  private windowSize = 60000; // 1 minute
  private timestamps: number[] = [];

  recordError(code: string): void {
    const now = Date.now();
    this.timestamps.push(now);

    // Update count
    const current = this.errorCounts.get(code) || 0;
    this.errorCounts.set(code, current + 1);

    // Clean old timestamps
    this.cleanOldTimestamps(now);

    // Check for high error rate
    if (this.timestamps.length > 100) {
      console.warn(
        `⚠️  High error rate detected: ${this.timestamps.length} errors in last minute`,
      );
    }
  }

  private cleanOldTimestamps(now: number): void {
    const cutoff = now - this.windowSize;
    this.timestamps = this.timestamps.filter((ts: any) => ts > cutoff);
  }

  getErrorRate(): number {
    return this.timestamps.length;
  }

  getErrorBreakdown(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  reset(): void {
    this.timestamps = [];
    this.errorCounts.clear();
  }
}

const errorRateTracker = new ErrorRateTracker();

/**
 * Get current error rate
 */
export function getErrorRate(): number {
  return errorRateTracker.getErrorRate();
}

/**
 * Get error breakdown by code
 */
export function getErrorBreakdown(): Record<string, number> {
  return errorRateTracker.getErrorBreakdown();
}

// ============================================================================
// CONTEXT-AWARE LOGGING
// ============================================================================

/**
 * Log error with current OpenTelemetry context
 */
export function logErrorWithContext(
  error: unknown,
  additionalContext?: Record<string, any>,
): void {
  const appError = isAppError(error) ? error : toAppError(error);
  const activeContext = context.active();
  const span = trace.getSpan(activeContext);

  if (span) {
    logErrorInSpan(appError, span, additionalContext);
  } else {
    logError(appError, additionalContext);
  }

  // Track error rate
  errorRateTracker.recordError(appError.code);
}

// ============================================================================
// DIVINE LOGGING (Agricultural Consciousness)
// ============================================================================

/**
 * Log with agricultural consciousness
 */
export function logDivineError(
  error: AppError,
  agriculturalContext?: {
    season?: string;
    farmId?: string;
    consciousness?: string;
  },
): void {
  const enhancedContext = {
    ...agriculturalContext,
    divine: true,
    consciousness: agriculturalContext?.consciousness || "DIVINE",
  };

  logError(error, enhancedContext);

  // Additional agricultural-specific logging
  if (currentConfig.enableConsole) {
    console.info("🌾 [AGRICULTURAL ERROR]", {
      errorId: error.errorId,
      category: error.category,
      ...enhancedContext,
    });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const logger = {
  error: logError,
  errorWithContext: logErrorWithContext,
  errorInSpan: logErrorInSpan,
  divineError: logDivineError,
  configure: configureLogger,
  createStructuredLog,
  enableAggregation: enableErrorAggregation,
  aggregateError,
  flushAggregated: flushAggregatedErrors,
  getErrorRate,
  getErrorBreakdown,
};

export default logger;
