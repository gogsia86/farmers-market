/**
 * STRUCTURED LOGGER
 * Enterprise-grade logging with context and metadata
 */

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  operation?: string;
  resource?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";
  timestamp: string;
  message: string;
  context: LogContext;
  metadata?: Record<string, any>;
  stack?: string;
  duration?: number;
}

export class StructuredLogger {
  constructor(
    private service: string,
    private environment: string = process.env.NODE_ENV || "development"
  ) {}

  debug(
    message: string,
    context: LogContext = {},
    metadata?: Record<string, any>
  ): void {
    this.log("DEBUG", message, context, metadata);
  }

  info(
    message: string,
    context: LogContext = {},
    metadata?: Record<string, any>
  ): void {
    this.log("INFO", message, context, metadata);
  }

  warn(
    message: string,
    context: LogContext = {},
    metadata?: Record<string, any>
  ): void {
    this.log("WARN", message, context, metadata);
  }

  error(
    message: string,
    error?: Error,
    context: LogContext = {},
    metadata?: Record<string, any>
  ): void {
    this.log(
      "ERROR",
      message,
      context,
      {
        ...metadata,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
      },
      error?.stack
    );
  }

  fatal(
    message: string,
    error?: Error,
    context: LogContext = {},
    metadata?: Record<string, any>
  ): void {
    this.log(
      "FATAL",
      message,
      context,
      {
        ...metadata,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
      },
      error?.stack
    );
  }

  /**
   * BUSINESS EVENT LOGGING
   * Track important business events
   */
  businessEvent(
    event: string,
    entity: string,
    entityId: string,
    context: LogContext = {},
    metadata?: Record<string, any>
  ): void {
    this.info(
      `Business Event: ${event}`,
      {
        ...context,
        eventType: "BUSINESS",
        entity,
        entityId,
      },
      metadata
    );
  }

  private log(
    level: LogEntry["level"],
    message: string,
    context: LogContext,
    metadata?: Record<string, any>,
    stack?: string
  ): void {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      context: {
        service: this.service,
        environment: this.environment,
        ...context,
      },
      metadata,
      stack,
    };

    // In production, you'd send this to your logging service
    console.log(
      JSON.stringify(
        entry,
        null,
        this.environment === "development" ? 2 : undefined
      )
    );
  }

  /**
   * CREATE CHILD LOGGER
   * Create logger with inherited context
   */
  child(additionalContext: LogContext): StructuredLogger {
    const childLogger = new StructuredLogger(this.service, this.environment);

    // Override log method to include additional context
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level, message, context, metadata, stack) => {
      originalLog(
        level,
        message,
        { ...additionalContext, ...context },
        metadata,
        stack
      );
    };

    return childLogger;
  }
}

/**
 * LOGGER FACTORY
 * Create loggers for different parts of the application
 */
export class LoggerFactory {
  private static loggers = new Map<string, StructuredLogger>();

  static getLogger(service: string): StructuredLogger {
    if (!this.loggers.has(service)) {
      this.loggers.set(service, new StructuredLogger(service));
    }
    return this.loggers.get(service)!;
  }

  static createRequestLogger(
    requestId: string,
    userId?: string
  ): StructuredLogger {
    const baseLogger = this.getLogger("REQUEST");
    return baseLogger.child({ requestId, userId });
  }
}
