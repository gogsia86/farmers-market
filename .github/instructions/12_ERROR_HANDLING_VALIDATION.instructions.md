---
applyTo: "**/*.{ts,tsx,js,jsx}"
description: "Enterprise error handling patterns, validation frameworks, structured logging, and observability systems for large-scale applications"
---

# 12 | ERROR HANDLING & VALIDATION MASTERY

**Enterprise-Grade Error Management & Validation Systems**

## 🔗 Related Divine Instructions

- **[11 | Kilo Scale Architecture](./11_KILO_SCALE_ARCHITECTURE.instructions.md)** - Architectural foundation
- **[01 | Divine Core Principles](./01_DIVINE_CORE_PRINCIPLES.instructions.md)** - Error as enlightenment
- **[05 | Testing Security Divinity](./05_TESTING_SECURITY_DIVINITY.instructions.md)** - Error testing strategies

---

## ⚡ UNIFIED ERROR HANDLING FRAMEWORK

### Divine Error Class Hierarchy

```typescript
/**
 * BASE APPLICATION ERROR
 * Foundation for all custom errors in the system
 */
export abstract class ApplicationError extends Error {
  public readonly code: string;
  public readonly details: Record<string, any>;
  public readonly timestamp: string;
  public readonly context: string;

  constructor(
    message: string,
    code: string,
    context: string = "UNKNOWN",
    details: Record<string, any> = {},
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * VALIDATION ERROR
 * For input validation failures
 */
export class ValidationError extends ApplicationError {
  public readonly field: string;
  public readonly value: any;

  constructor(
    field: string,
    message: string,
    value?: any,
    details: Record<string, any> = {},
  ) {
    super(
      `Validation failed for ${field}: ${message}`,
      "VALIDATION_ERROR",
      "VALIDATION",
      { field, value, ...details },
    );
    this.field = field;
    this.value = value;
  }
}

/**
 * AGGREGATE VALIDATION ERROR
 * For multiple validation failures
 */
export class AggregateValidationError extends ApplicationError {
  public readonly errors: ValidationError[];

  constructor(message: string, errors: ValidationError[]) {
    super(message, "AGGREGATE_VALIDATION_ERROR", "VALIDATION", {
      errorCount: errors.length,
      fields: errors.map((e) => e.field),
    });
    this.errors = errors;
  }
}

/**
 * BUSINESS LOGIC ERROR
 * For domain-specific business rule violations
 */
export class BusinessLogicError extends ApplicationError {
  constructor(
    message: string,
    operation: string,
    details: Record<string, any> = {},
  ) {
    super(message, "BUSINESS_LOGIC_ERROR", `BUSINESS.${operation}`, details);
  }
}

/**
 * RESOURCE NOT FOUND ERROR
 * For missing resources
 */
export class NotFoundError extends ApplicationError {
  public readonly resourceType: string;
  public readonly resourceId: string;

  constructor(resourceType: string, resourceId: string) {
    super(
      `${resourceType} with id ${resourceId} not found`,
      "NOT_FOUND_ERROR",
      "RESOURCE_ACCESS",
      { resourceType, resourceId },
    );
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * DATABASE ERROR
 * For database operation failures
 */
export class DatabaseError extends ApplicationError {
  public readonly operation: string;
  public readonly originalError: Error;

  constructor(
    operation: string,
    originalError: Error,
    details: Record<string, any> = {},
  ) {
    super(
      `Database operation failed: ${operation}`,
      "DATABASE_ERROR",
      "DATABASE",
      { operation, originalMessage: originalError.message, ...details },
    );
    this.operation = operation;
    this.originalError = originalError;
  }
}

/**
 * EXTERNAL SERVICE ERROR
 * For third-party service failures
 */
export class ExternalServiceError extends ApplicationError {
  public readonly service: string;
  public readonly statusCode?: number;

  constructor(
    service: string,
    message: string,
    statusCode?: number,
    details: Record<string, any> = {},
  ) {
    super(
      `External service ${service} error: ${message}`,
      "EXTERNAL_SERVICE_ERROR",
      `EXTERNAL.${service}`,
      { service, statusCode, ...details },
    );
    this.service = service;
    this.statusCode = statusCode;
  }
}
```

### Error Response Standardization

```typescript
/**
 * STANDARDIZED ERROR RESPONSE FORMAT
 * Consistent across all API endpoints
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    context: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId?: string;
  };
  debug?: {
    stack?: string;
    originalError?: any;
  };
}

/**
 * ERROR RESPONSE BUILDER
 * Creates consistent error responses
 */
export class ErrorResponseBuilder {
  static build(
    error: ApplicationError | Error,
    requestId?: string,
    includeDebug: boolean = false,
  ): ErrorResponse {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error instanceof ApplicationError ? error.code : "INTERNAL_ERROR",
        message: error.message,
        context: error instanceof ApplicationError ? error.context : "UNKNOWN",
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    if (error instanceof ApplicationError) {
      response.error.details = error.details;
    }

    if (includeDebug) {
      response.debug = {
        stack: error.stack,
        originalError:
          error instanceof ApplicationError ? error.details : error,
      };
    }

    return response;
  }

  static buildValidationError(
    errors: ValidationError[],
    requestId?: string,
  ): ErrorResponse {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR_AGGREGATE",
        message: `Validation failed for ${errors.length} field(s)`,
        context: "VALIDATION",
        details: {
          errors: errors.map((err) => ({
            field: err.field,
            message: err.message,
            value: err.value,
          })),
        },
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
  }
}
```

---

## 🛡️ VALIDATION FRAMEWORK MASTERY

### Input Validation Pipeline

```typescript
/**
 * VALIDATION PIPELINE
 * Comprehensive input validation with error aggregation
 */
export class ValidationPipeline<T> {
  private validators: Array<(data: any) => ValidationError[]> = [];

  constructor(private schema: z.ZodSchema<T>) {}

  addValidator(validator: (data: any) => ValidationError[]): this {
    this.validators.push(validator);
    return this;
  }

  validate(data: unknown): T {
    const errors: ValidationError[] = [];

    // Schema validation first
    const schemaResult = this.schema.safeParse(data);
    if (!schemaResult.success) {
      const schemaErrors = schemaResult.error.issues.map(
        (issue) =>
          new ValidationError(
            issue.path.join("."),
            issue.message,
            issue.code === "invalid_type" ? data : issue.received,
          ),
      );
      errors.push(...schemaErrors);
    }

    // Additional custom validators
    for (const validator of this.validators) {
      const validatorErrors = validator(data);
      errors.push(...validatorErrors);
    }

    if (errors.length > 0) {
      throw new AggregateValidationError("Validation failed", errors);
    }

    return schemaResult.data as T;
  }
}

/**
 * FARM VALIDATION EXAMPLE
 * Complete validation pipeline for farm creation
 */
const createFarmSchema = z.object({
  name: z
    .string()
    .min(1, "Farm name is required")
    .max(100, "Farm name too long"),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  ownerId: z.string().uuid("Invalid owner ID format"),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  certifications: z.array(z.string()).optional(),
});

export const farmValidationPipeline = new ValidationPipeline(
  createFarmSchema,
).addValidator((data: any) => {
  const errors: ValidationError[] = [];

  // Business rule: Farm name must be unique per owner
  if (data.name && data.ownerId) {
    // This would typically check against database
    // For now, just validate format
    if (!/^[a-zA-Z0-9\s-]+$/.test(data.name)) {
      errors.push(
        new ValidationError(
          "name",
          "Farm name can only contain letters, numbers, spaces, and hyphens",
          data.name,
        ),
      );
    }
  }

  // Business rule: Coordinates must be provided if address is international
  if (data.address && !data.address.includes("USA") && !data.coordinates) {
    errors.push(
      new ValidationError(
        "coordinates",
        "Coordinates are required for international addresses",
        null,
      ),
    );
  }

  return errors;
});

/**
 * VALIDATION IN SERVICE LAYER
 * Integration with business logic
 */
export class FarmService {
  async createFarm(rawData: unknown): Promise<Farm> {
    try {
      // Validate input data
      const validatedData = farmValidationPipeline.validate(rawData);

      // Additional business validation
      await this.validateBusinessRules(validatedData);

      // Create the farm
      return await this.farmRepository.create(validatedData);
    } catch (error) {
      if (error instanceof AggregateValidationError) {
        this.logger.warn("Farm creation validation failed", {
          errors: error.errors.map((e) => ({
            field: e.field,
            message: e.message,
          })),
        });
        throw error;
      }

      this.logger.error("Farm creation failed", { error });
      throw new BusinessLogicError("Failed to create farm", "CREATE_FARM", {
        error,
      });
    }
  }

  private async validateBusinessRules(data: CreateFarmRequest): Promise<void> {
    const errors: ValidationError[] = [];

    // Check if user can create farms
    const user = await this.userRepository.findById(data.ownerId);
    if (!user) {
      errors.push(
        new ValidationError("ownerId", "User not found", data.ownerId),
      );
    } else if (user.role !== "FARMER") {
      errors.push(
        new ValidationError(
          "ownerId",
          "Only farmers can create farms",
          data.ownerId,
        ),
      );
    }

    // Check for duplicate farm name
    const existingFarm = await this.farmRepository.findByNameAndOwner(
      data.name,
      data.ownerId,
    );
    if (existingFarm) {
      errors.push(
        new ValidationError(
          "name",
          "Farm name already exists for this owner",
          data.name,
        ),
      );
    }

    if (errors.length > 0) {
      throw new AggregateValidationError("Business validation failed", errors);
    }
  }
}
```

---

## 📊 STRUCTURED LOGGING EXCELLENCE

### Comprehensive Logging Framework

```typescript
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
    private environment: string = process.env.NODE_ENV || "development",
  ) {}

  debug(
    message: string,
    context: LogContext = {},
    metadata?: Record<string, any>,
  ): void {
    this.log("DEBUG", message, context, metadata);
  }

  info(
    message: string,
    context: LogContext = {},
    metadata?: Record<string, any>,
  ): void {
    this.log("INFO", message, context, metadata);
  }

  warn(
    message: string,
    context: LogContext = {},
    metadata?: Record<string, any>,
  ): void {
    this.log("WARN", message, context, metadata);
  }

  error(
    message: string,
    error?: Error,
    context: LogContext = {},
    metadata?: Record<string, any>,
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
      error?.stack,
    );
  }

  fatal(
    message: string,
    error?: Error,
    context: LogContext = {},
    metadata?: Record<string, any>,
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
      error?.stack,
    );
  }

  /**
   * PERFORMANCE LOGGING
   * Track operation duration and performance metrics
   */
  async measurePerformance<T>(
    operation: string,
    fn: () => Promise<T>,
    context: LogContext = {},
  ): Promise<T> {
    const startTime = Date.now();
    const operationContext = { ...context, operation };

    this.debug(`Starting ${operation}`, operationContext);

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      this.info(`Completed ${operation}`, operationContext, {
        duration,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.error(`Failed ${operation}`, error as Error, operationContext, {
        duration,
        success: false,
      });

      throw error;
    }
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
    metadata?: Record<string, any>,
  ): void {
    this.info(
      `Business Event: ${event}`,
      {
        ...context,
        eventType: "BUSINESS",
        entity,
        entityId,
      },
      metadata,
    );
  }

  /**
   * SECURITY EVENT LOGGING
   * Track security-related events
   */
  securityEvent(
    event: string,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    context: LogContext = {},
    metadata?: Record<string, any>,
  ): void {
    this.warn(
      `Security Event: ${event}`,
      {
        ...context,
        eventType: "SECURITY",
        severity,
      },
      metadata,
    );
  }

  private log(
    level: LogEntry["level"],
    message: string,
    context: LogContext,
    metadata?: Record<string, any>,
    stack?: string,
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
        this.environment === "development" ? 2 : undefined,
      ),
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
        stack,
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
    userId?: string,
  ): StructuredLogger {
    const baseLogger = this.getLogger("REQUEST");
    return baseLogger.child({ requestId, userId });
  }
}
```

### Logging Integration Examples

```typescript
/**
 * SERVICE WITH COMPREHENSIVE LOGGING
 * Integration of structured logging throughout service operations
 */
export class FarmService {
  private readonly logger: StructuredLogger;

  constructor(
    private farmRepository: FarmRepository,
    private userRepository: UserRepository,
  ) {
    this.logger = LoggerFactory.getLogger("FarmService");
  }

  async createFarm(
    farmData: CreateFarmRequest,
    requestId?: string,
  ): Promise<Farm> {
    const logger = requestId ? this.logger.child({ requestId }) : this.logger;
    const context = { operation: "createFarm", ownerId: farmData.ownerId };

    return await logger.measurePerformance("createFarm", async () => {
      logger.info("Creating farm", context, { farmName: farmData.name });

      try {
        // Validation
        await this.validateFarmCreation(farmData, logger, context);

        // Business logic
        const farm = await this.farmRepository.create(farmData);

        // Log business event
        logger.businessEvent("FARM_CREATED", "Farm", farm.id, context, {
          farmName: farm.name,
          ownerRole: "FARMER",
        });

        return farm;
      } catch (error) {
        logger.error("Farm creation failed", error as Error, context, {
          farmData: { ...farmData, coordinates: "***" }, // Mask sensitive data
        });
        throw error;
      }
    });
  }

  private async validateFarmCreation(
    farmData: CreateFarmRequest,
    logger: StructuredLogger,
    context: LogContext,
  ): Promise<void> {
    // Log validation start
    logger.debug("Starting farm validation", context);

    try {
      const user = await this.userRepository.findById(farmData.ownerId);

      if (!user) {
        logger.warn("Farm creation attempted with invalid user", context, {
          providedUserId: farmData.ownerId,
        });
        throw new ValidationError(
          "ownerId",
          "User not found",
          farmData.ownerId,
        );
      }

      if (user.role !== "FARMER") {
        logger.securityEvent("UNAUTHORIZED_FARM_CREATION", "MEDIUM", context, {
          userRole: user.role,
          requiredRole: "FARMER",
        });
        throw new ValidationError(
          "ownerId",
          "Only farmers can create farms",
          farmData.ownerId,
        );
      }

      logger.debug("Farm validation completed successfully", context);
    } catch (error) {
      logger.error("Farm validation failed", error as Error, context);
      throw error;
    }
  }
}
```

---

## 🎯 ERROR HANDLING BEST PRACTICES

### Controller Error Handling

```typescript
/**
 * CONTROLLER WITH COMPREHENSIVE ERROR HANDLING
 * Proper error boundaries and user-friendly responses
 */
export class FarmController {
  private readonly logger: StructuredLogger;

  constructor(private farmService: FarmService) {
    this.logger = LoggerFactory.getLogger("FarmController");
  }

  async createFarm(request: NextRequest): Promise<NextResponse> {
    const requestId =
      request.headers.get("x-request-id") || generateRequestId();
    const logger = this.logger.child({ requestId });

    try {
      // Parse and validate request
      const body = await request.json();
      logger.info("Farm creation request received", {
        operation: "createFarm",
      });

      // Delegate to service
      const farm = await this.farmService.createFarm(body, requestId);

      return NextResponse.json(
        {
          success: true,
          data: farm,
          requestId,
        },
        { status: 201 },
      );
    } catch (error) {
      return this.handleError(error, requestId, logger);
    }
  }

  private handleError(
    error: unknown,
    requestId: string,
    logger: StructuredLogger,
  ): NextResponse {
    // Log the error
    logger.error("Request failed", error as Error, { requestId });

    if (error instanceof AggregateValidationError) {
      return NextResponse.json(
        ErrorResponseBuilder.buildValidationError(error.errors, requestId),
        { status: 400 },
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        ErrorResponseBuilder.buildValidationError([error], requestId),
        { status: 400 },
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(ErrorResponseBuilder.build(error, requestId), {
        status: 404,
      });
    }

    if (error instanceof BusinessLogicError) {
      return NextResponse.json(ErrorResponseBuilder.build(error, requestId), {
        status: 422,
      });
    }

    if (error instanceof DatabaseError) {
      // Don't expose database errors to clients
      const safeError = new ApplicationError(
        "Internal server error",
        "INTERNAL_ERROR",
        "SERVER",
      );
      return NextResponse.json(
        ErrorResponseBuilder.build(safeError, requestId),
        { status: 500 },
      );
    }

    // Unknown error
    const unknownError = new ApplicationError(
      "An unexpected error occurred",
      "UNKNOWN_ERROR",
      "SERVER",
    );

    return NextResponse.json(
      ErrorResponseBuilder.build(unknownError, requestId),
      { status: 500 },
    );
  }
}
```

### Global Error Boundary

```typescript
/**
 * GLOBAL ERROR HANDLER
 * Catch-all for unhandled errors
 */
export function setupGlobalErrorHandling(): void {
  const logger = LoggerFactory.getLogger("GLOBAL");

  // Unhandled Promise Rejections
  process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    logger.fatal("Unhandled Promise Rejection", reason, {
      eventType: "UNHANDLED_REJECTION",
      promise: promise.toString(),
    });

    // Graceful shutdown in production
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  });

  // Uncaught Exceptions
  process.on("uncaughtException", (error: Error) => {
    logger.fatal("Uncaught Exception", error, {
      eventType: "UNCAUGHT_EXCEPTION",
    });

    // Force exit - the process is in an undefined state
    process.exit(1);
  });

  // Warning Events
  process.on("warning", (warning: Error) => {
    logger.warn(
      "Process Warning",
      {
        eventType: "PROCESS_WARNING",
      },
      {
        name: warning.name,
        message: warning.message,
        stack: warning.stack,
      },
    );
  });
}
```

---

## ✅ ERROR HANDLING IMPLEMENTATION CHECKLIST

### Error Class Implementation

- [ ] Custom error classes extend ApplicationError
- [ ] All errors include context and structured details
- [ ] Error codes are consistent and meaningful
- [ ] Stack traces are preserved properly
- [ ] Errors are JSON serializable

### Validation Framework

- [ ] Schema validation using Zod or similar
- [ ] Business rule validation separate from schema
- [ ] Error aggregation for multiple failures
- [ ] Validation pipeline with custom validators
- [ ] Proper error messages for end users

### Logging Implementation

- [ ] Structured logging with consistent format
- [ ] Request correlation IDs
- [ ] Performance measurement logging
- [ ] Business event tracking
- [ ] Security event logging
- [ ] Sensitive data masking
- [ ] Log levels properly configured
- [ ] Child loggers for context inheritance

### Controller Error Handling

- [ ] Try-catch blocks around all operations
- [ ] Proper HTTP status codes
- [ ] Consistent error response format
- [ ] No sensitive information in responses
- [ ] Request ID tracking
- [ ] User-friendly error messages

### Global Error Handling

- [ ] Unhandled rejection handling
- [ ] Uncaught exception handling
- [ ] Process warning monitoring
- [ ] Graceful shutdown procedures
- [ ] Error alerting and monitoring

---

**Remember**: Good error handling is invisible when things work, but saves the day when they don't. Invest in comprehensive error strategies early.

_"Errors are not just bugs to fix - they are opportunities to improve user experience and system reliability."_
