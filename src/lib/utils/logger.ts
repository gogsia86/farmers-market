/**
 * ⚡ DIVINE LOGGER UTILITY
 * Environment-aware logging with agricultural consciousness
 *
 * Features:
 * - Environment-aware logging (dev vs production)
 * - Structured logging with metadata
 * - Log levels (debug, info, warn, error)
 * - Request tracing support
 * - Agricultural consciousness tracking
 *
 * @module Logger
 * @version 1.0.0
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogMetadata {
  [key: string]: unknown;
  requestId?: string;
  userId?: string;
  farmId?: string;
  orderId?: string;
  path?: string;
  method?: string;
  duration?: number;
  agricultural?: boolean;
  consciousness?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: LogMetadata;
  environment: string;
}

export interface LoggerConfig {
  /** Minimum log level to output */
  minLevel: LogLevel;
  /** Whether to include timestamps */
  timestamps: boolean;
  /** Whether to output structured JSON logs */
  structured: boolean;
  /** Application name for log prefixing */
  appName: string;
  /** Whether logging is enabled */
  enabled: boolean;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: process.env.NODE_ENV === "production" ? "info" : "debug",
  timestamps: true,
  structured: process.env.NODE_ENV === "production",
  appName: "FarmersMarket",
  enabled: true,
};

// Divine emoji prefixes for log levels
const LOG_EMOJI: Record<LogLevel, string> = {
  debug: "🔍",
  info: "ℹ️",
  warn: "⚠️",
  error: "❌",
};

// Agricultural consciousness emojis
const AGRICULTURAL_EMOJI = "🌾";
const DIVINE_EMOJI = "⚡";

// ============================================================================
// LOGGER CLASS
// ============================================================================

/**
 * 🌟 Divine Logger Class
 * Environment-aware logging with support for structured output
 */
export class Logger {
  private config: LoggerConfig;
  private context?: string;

  constructor(context?: string, config: Partial<LoggerConfig> = {}) {
    this.context = context;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Override with environment variables if present
    if (process.env.LOG_LEVEL) {
      this.config.minLevel = process.env.LOG_LEVEL as LogLevel;
    }

    if (process.env.LOG_ENABLED === "false") {
      this.config.enabled = false;
    }
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return (
      LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel]
    );
  }

  /**
   * Format a log entry for output
   */
  private formatEntry(entry: LogEntry): string {
    if (this.config.structured) {
      // JSON structured logging for production
      return JSON.stringify({
        ...entry,
        context: this.context,
        app: this.config.appName,
      });
    }

    // Human-readable format for development
    const parts: string[] = [];

    // Timestamp
    if (this.config.timestamps) {
      parts.push(`[${entry.timestamp}]`);
    }

    // Level with emoji
    parts.push(`${LOG_EMOJI[entry.level]} ${entry.level.toUpperCase()}`);

    // Context
    if (this.context) {
      parts.push(`[${this.context}]`);
    }

    // Agricultural consciousness indicator
    if (entry.metadata?.agricultural) {
      parts.push(AGRICULTURAL_EMOJI);
    }

    // Divine consciousness indicator
    if (entry.metadata?.consciousness === "divine") {
      parts.push(DIVINE_EMOJI);
    }

    // Message
    parts.push(entry.message);

    // Metadata (excluding special fields)
    if (entry.metadata) {
      const {
        agricultural: _agricultural,
        consciousness: _consciousness,
        ...rest
      } = entry.metadata;
      if (Object.keys(rest).length > 0) {
        parts.push(JSON.stringify(rest));
      }
    }

    return parts.join(" ");
  }

  /**
   * Create a log entry
   */
  private createEntry(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
      environment: process.env.NODE_ENV || "development",
    };
  }

  /**
   * Output a log entry
   */
  private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createEntry(level, message, metadata);
    const formatted = this.formatEntry(entry);

    switch (level) {
      case "debug":
        console.debug(formatted);
        break;
      case "info":
        console.info(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
    }
  }

  // ========================================
  // PUBLIC LOGGING METHODS
  // ========================================

  /**
   * Debug level logging (development only by default)
   */
  debug(message: string, metadata?: LogMetadata): void {
    this.log("debug", message, metadata);
  }

  /**
   * Info level logging
   */
  info(message: string, metadata?: LogMetadata): void {
    this.log("info", message, metadata);
  }

  /**
   * Warning level logging
   */
  warn(message: string, metadata?: LogMetadata): void {
    this.log("warn", message, metadata);
  }

  /**
   * Error level logging
   */
  error(message: string, metadata?: LogMetadata): void;
  error(message: string, error: Error, metadata?: LogMetadata): void;
  error(
    message: string,
    errorOrMetadata?: Error | LogMetadata,
    metadata?: LogMetadata,
  ): void {
    let finalMetadata: LogMetadata | undefined = metadata;

    if (errorOrMetadata instanceof Error) {
      finalMetadata = {
        ...metadata,
        errorName: errorOrMetadata.name,
        errorMessage: errorOrMetadata.message,
        errorStack:
          process.env.NODE_ENV !== "production"
            ? errorOrMetadata.stack
            : undefined,
      };
    } else if (errorOrMetadata) {
      finalMetadata = errorOrMetadata;
    }

    this.log("error", message, finalMetadata);
  }

  // ========================================
  // SPECIALIZED LOGGING METHODS
  // ========================================

  /**
   * Log authentication events
   */
  auth(
    action: "login" | "logout" | "signup" | "check" | "error",
    metadata: LogMetadata,
  ): void {
    const level: LogLevel = action === "error" ? "error" : "info";
    this.log(level, `Auth: ${action}`, { ...metadata, authAction: action });
  }

  /**
   * Log API request/response
   */
  api(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    metadata?: LogMetadata,
  ): void {
    const level: LogLevel =
      statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    this.log(level, `${method} ${path} ${statusCode} ${duration}ms`, {
      ...metadata,
      method,
      path,
      statusCode,
      duration,
    });
  }

  /**
   * Log agricultural operations
   */
  agricultural(message: string, metadata?: LogMetadata): void {
    this.log("info", message, { ...metadata, agricultural: true });
  }

  /**
   * Log divine operations (important business logic)
   */
  divine(message: string, metadata?: LogMetadata): void {
    this.log("info", message, { ...metadata, consciousness: "divine" });
  }

  /**
   * Log database operations
   */
  database(operation: string, duration: number, metadata?: LogMetadata): void {
    const level: LogLevel = duration > 1000 ? "warn" : "debug";
    this.log(level, `DB: ${operation} (${duration}ms)`, {
      ...metadata,
      dbOperation: operation,
      duration,
    });
  }

  /**
   * Log performance metrics
   */
  performance(
    metric: string,
    value: number,
    unit: string,
    metadata?: LogMetadata,
  ): void {
    this.log("info", `Performance: ${metric} = ${value}${unit}`, {
      ...metadata,
      metric,
      value,
      unit,
    });
  }

  // ========================================
  // FACTORY METHODS
  // ========================================

  /**
   * Create a child logger with additional context
   */
  child(context: string): Logger {
    const childContext = this.context ? `${this.context}:${context}` : context;
    return new Logger(childContext, this.config);
  }

  /**
   * Create a logger with request context
   */
  withRequest(requestId: string, metadata?: LogMetadata): RequestLogger {
    return new RequestLogger(this, requestId, metadata);
  }
}

// ============================================================================
// REQUEST LOGGER CLASS
// ============================================================================

/**
 * Request-scoped logger for tracking individual requests
 */
export class RequestLogger {
  private parent: Logger;
  private baseMetadata: LogMetadata;

  constructor(parent: Logger, requestId: string, metadata?: LogMetadata) {
    this.parent = parent;
    this.baseMetadata = { ...metadata, requestId };
  }

  private mergeMetadata(metadata?: LogMetadata): LogMetadata {
    return { ...this.baseMetadata, ...metadata };
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.parent.debug(message, this.mergeMetadata(metadata));
  }

  info(message: string, metadata?: LogMetadata): void {
    this.parent.info(message, this.mergeMetadata(metadata));
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.parent.warn(message, this.mergeMetadata(metadata));
  }

  error(message: string, metadata?: LogMetadata): void;
  error(message: string, error: Error, metadata?: LogMetadata): void;
  error(
    message: string,
    errorOrMetadata?: Error | LogMetadata,
    metadata?: LogMetadata,
  ): void {
    if (errorOrMetadata instanceof Error) {
      this.parent.error(message, errorOrMetadata, this.mergeMetadata(metadata));
    } else {
      this.parent.error(message, this.mergeMetadata(errorOrMetadata));
    }
  }
}

// ============================================================================
// SINGLETON INSTANCES & EXPORTS
// ============================================================================

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Create a context-specific logger
 */
export function createLogger(
  context: string,
  config?: Partial<LoggerConfig>,
): Logger {
  return new Logger(context, config);
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== "production";
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Conditional log - only in development
 */
export function devLog(message: string, ...args: unknown[]): void {
  if (isDevelopment()) {
    console.log(`[DEV] ${message}`, ...args);
  }
}

/**
 * Conditional warn - only in development
 */
export function devWarn(message: string, ...args: unknown[]): void {
  if (isDevelopment()) {
    console.warn(`[DEV] ${message}`, ...args);
  }
}

// ============================================================================
// PRE-CONFIGURED LOGGERS
// ============================================================================

/** Logger for authentication operations */
export const authLogger = createLogger("Auth");

/** Logger for API routes */
export const apiLogger = createLogger("API");

/** Logger for database operations */
export const dbLogger = createLogger("Database");

/** Logger for middleware operations */
export const middlewareLogger = createLogger("Middleware");

/** Logger for payment operations */
export const paymentLogger = createLogger("Payment");

/** Logger for order operations */
export const orderLogger = createLogger("Order");

/** Logger for farm operations */
export const farmLogger = createLogger("Farm");

/** Logger for cart operations */
export const cartLogger = createLogger("Cart");

/** Logger for agricultural operations */
export const agriculturalLogger = createLogger("Agricultural");
