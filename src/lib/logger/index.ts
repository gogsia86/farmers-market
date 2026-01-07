/**
 * 🌟 DIVINE LOGGING UTILITY
 * Farmers Market Platform - Structured Logging with OpenTelemetry
 *
 * Purpose: Replace console.log with production-grade structured logging
 * Features:
 * - OpenTelemetry integration for distributed tracing
 * - Structured JSON logs for production
 * - Human-readable logs for development
 * - Context-aware logging with metadata
 * - Type-safe logging interfaces
 *
 * Reference: 12_ERROR_HANDLING_VALIDATION.instructions.md
 * Version: 1.0
 */

import { trace } from "@opentelemetry/api";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

export interface LogContext {
  // Request/User context
  userId?: string;
  requestId?: string;
  sessionId?: string;

  // Agricultural domain context
  farmId?: string;
  farmName?: string;
  farmerId?: string;
  orderId?: string;
  productId?: string;
  customerId?: string;

  // Operation context
  service?: string;
  operation?: string;
  duration?: number;

  // Generic metadata
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  context?: LogContext;
  traceId?: string;
  spanId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

// ============================================================================
// LOGGER CLASS
// ============================================================================

export class Logger {
  private service: string;
  private defaultContext: LogContext;

  constructor(service: string, defaultContext: LogContext = {}) {
    this.service = service;
    this.defaultContext = defaultContext;
  }

  /**
   * Log debug information (development only)
   * Use for detailed debugging information
   */
  debug(message: string, context?: LogContext): void {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.LOG_LEVEL === "debug"
    ) {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  /**
   * Log informational messages
   * Use for normal operations, state changes, successful completions
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warnings
   * Use for unexpected but recoverable situations
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log errors with full context
   * Use for error conditions that need attention
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = this.buildErrorContext(error, context);
    this.log(LogLevel.ERROR, message, errorContext);
  }

  /**
   * Log fatal errors
   * Use for critical failures that may cause service interruption
   */
  fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = this.buildErrorContext(error, context);
    this.log(LogLevel.FATAL, message, errorContext);
  }

  /**
   * Create child logger with additional default context
   */
  child(additionalContext: LogContext): Logger {
    return new Logger(this.service, {
      ...this.defaultContext,
      ...additionalContext,
    });
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Build error context from Error object
   */
  private buildErrorContext(
    error: Error | unknown,
    context?: LogContext,
  ): LogContext {
    if (!error) {
      return context || {};
    }

    const errorObj = error instanceof Error ? error : new Error(String(error));

    return {
      ...context,
      error: {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack,
        code: (errorObj as any).code,
      },
    };
  }

  /**
   * Internal logging implementation with OpenTelemetry integration
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const span = trace.getActiveSpan();
    const timestamp = new Date().toISOString();

    // Merge contexts: default -> provided -> span
    const mergedContext = {
      ...this.defaultContext,
      ...context,
    };

    // Build structured log entry
    const logEntry: LogEntry = {
      timestamp,
      level,
      service: this.service,
      message,
      context: mergedContext,
      traceId: span?.spanContext().traceId,
      spanId: span?.spanContext().spanId,
    };

    // Add event to active span if exists
    if (span && span.isRecording()) {
      span.addEvent(message, {
        "log.level": level,
        "log.service": this.service,
        "log.message": message,
        ...this.flattenContext(mergedContext),
      });
    }

    // Output based on environment
    this.output(logEntry);
  }

  /**
   * Flatten nested context for OpenTelemetry attributes
   */
  private flattenContext(
    context: LogContext,
    prefix = "",
    visited = new WeakSet(),
  ): Record<string, any> {
    const flattened: Record<string, any> = {};

    for (const [key, value] of Object.entries(context)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined) {
        continue;
      }

      if (typeof value === "object" && !Array.isArray(value)) {
        // Prevent circular references
        if (visited.has(value)) {
          flattened[fullKey] = "[Circular]";
          continue;
        }
        visited.add(value);
        Object.assign(flattened, this.flattenContext(value, fullKey, visited));
      } else {
        flattened[fullKey] = value;
      }
    }

    return flattened;
  }

  /**
   * Output log entry based on environment
   */
  private output(logEntry: LogEntry): void {
    if (process.env.NODE_ENV === "production") {
      // Production: JSON structured logs for log aggregation systems
      this.outputProduction(logEntry);
    } else {
      // Development: Human-readable format with colors
      this.outputDevelopment(logEntry);
    }
  }

  /**
   * Production log output (JSON)
   */
  private outputProduction(logEntry: LogEntry): void {
    // Remove circular references and format for JSON
    const safeEntry = this.sanitizeForJson(logEntry);

    // Use console methods based on log level
    switch (logEntry.level) {
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        logger.error(JSON.stringify(safeEntry));
        break;
      case LogLevel.WARN:
        logger.warn(JSON.stringify(safeEntry));
        break;
      default:
        logger.info(JSON.stringify(safeEntry));
    }
  }

  /**
   * Development log output (Human-readable)
   */
  private outputDevelopment(logEntry: LogEntry): void {
    const emoji = this.getLogEmoji(logEntry.level);
    const color = this.getLogColor(logEntry.level);
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();

    // Header line
    logger.info(
      `${emoji} ${color}[${timestamp}] [${logEntry.service}] ${logEntry.message}\x1b[0m`);

    // Context (if present and not empty)
    if (logEntry.context && Object.keys(logEntry.context).length > 0) {
      logger.info("  Context: " + JSON.stringify(logEntry.context, null, 2));
    }

    // Trace info (if present)
    if (logEntry.traceId) {
      logger.info(`  🔗 Trace: ${logEntry.traceId?.substring(0, 16)}...`);
    }
  }

  /**
   * Get emoji for log level
   */
  private getLogEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return "🔍";
      case LogLevel.INFO:
        return "✅";
      case LogLevel.WARN:
        return "⚠️";
      case LogLevel.ERROR:
        return "❌";
      case LogLevel.FATAL:
        return "💀";
      default:
        return "📝";
    }
  }

  /**
   * Get ANSI color code for log level
   */
  private getLogColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return "\x1b[36m"; // Cyan
      case LogLevel.INFO:
        return "\x1b[32m"; // Green
      case LogLevel.WARN:
        return "\x1b[33m"; // Yellow
      case LogLevel.ERROR:
        return "\x1b[31m"; // Red
      case LogLevel.FATAL:
        return "\x1b[35m"; // Magenta
      default:
        return "\x1b[0m"; // Reset
    }
  }

  /**
   * Sanitize log entry for JSON serialization
   */
  private sanitizeForJson(obj: any): any {
    const seen = new WeakSet();

    const sanitize = (value: any): any => {
      if (value === null || value === undefined) {
        return value;
      }

      if (typeof value !== "object") {
        return value;
      }

      if (seen.has(value)) {
        return "[Circular]";
      }

      seen.add(value);

      if (Array.isArray(value)) {
        return value.map(sanitize);
      }

      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitize(val);
      }

      return sanitized;
    };

    return sanitize(obj);
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create logger instance for a service
 *
 * @param service - Service name (e.g., 'payment-service', 'geocoding-service')
 * @param defaultContext - Default context to include in all logs
 * @returns Logger instance
 *
 * @example
 * const logger = createLogger('payment-service');
 * logger.info('Payment processed', { orderId: '123' });
 */
export function createLogger(
  service: string,
  defaultContext?: LogContext,
): Logger {
  return new Logger(service, defaultContext);
}

/**
 * Default logger for general usage
 */
export const logger = createLogger("app");

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Time a function execution and log the duration
 *
 * @example
 * const result = await logTiming(
 *   'geocoding-operation',
 *   () => geocodingService.geocode(address),
 *   logger,
 *   { address }
 * );
 */
export async function logTiming<T>(
  operation: string,
  fn: () => Promise<T>,
  logger: Logger,
  context?: LogContext,
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    logger.info(`${operation} completed`, {
      ...context,
      operation,
      duration,
      success: true,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error(`${operation} failed`, error as Error, {
      ...context,
      operation,
      duration,
      success: false,
    });

    throw error;
  }
}

/**
 * Log function entry (useful for debugging)
 */
export function logEntry(
  functionName: string,
  args: any,
  logger: Logger,
): void {
  logger.debug(`Entering ${functionName}`, {
    function: functionName,
    arguments: args,
  });
}

/**
 * Log function exit (useful for debugging)
 */
export function logExit(
  functionName: string,
  result: any,
  logger: Logger,
): void {
  logger.debug(`Exiting ${functionName}`, {
    function: functionName,
    result,
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default Logger;
