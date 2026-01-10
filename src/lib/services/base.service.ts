/**
 * 🌟 Base Service - Divine Foundation Layer
 * Provides transaction handling, error patterns, and common service utilities
 * Following: 01_DIVINE_CORE_PRINCIPLES & 11_KILO_SCALE_ARCHITECTURE
 */

import { database } from "@/lib/database";
import { SpanStatusCode, trace } from "@opentelemetry/api";

import { logger } from '@/lib/monitoring/logger';

import type { Prisma } from "@prisma/client";

/**
 * Base error class for all service errors
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends ServiceError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: any
  ) {
    super(message, "VALIDATION_ERROR", 400, { field, value });
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends ServiceError {
  constructor(
    resource: string,
    identifier: string | number,
    details?: Record<string, any>
  ) {
    super(
      `${resource} not found: ${identifier}`,
      "NOT_FOUND",
      404,
      details
    );
  }
}

/**
 * Authorization error for permission failures
 */
export class AuthorizationError extends ServiceError {
  constructor(message: string = "Unauthorized access", details?: Record<string, any>) {
    super(message, "AUTHORIZATION_ERROR", 403, details);
  }
}

/**
 * Conflict error for duplicate resources or state conflicts
 */
export class ConflictError extends ServiceError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "CONFLICT_ERROR", 409, details);
  }
}

/**
 * Divine quantum coherence error for state management
 */
export class QuantumCoherenceError extends ServiceError {
  constructor(
    message: string,
    public readonly currentState: any,
    public readonly expectedState: any,
    public readonly resolutionPath: string[]
  ) {
    const formattedMessage = `
╔════════════════════════════════════════════════════════════╗
║ ⚡ QUANTUM COHERENCE DISRUPTION DETECTED                   ║
╠════════════════════════════════════════════════════════════╣
║ 🔮 WHAT HAPPENED: ${message}
║
║ 🧬 CURRENT STATE: ${JSON.stringify(currentState, null, 2)}
║
║ 🎯 EXPECTED REALITY: ${JSON.stringify(expectedState, null, 2)}
║
║ 🛠️  PATH TO ENLIGHTENMENT:
║    ${resolutionPath.map((step: any, i: any) => `${i + 1}. ${step}`).join('\n║    ')}
╚════════════════════════════════════════════════════════════╝
    `;
    super(formattedMessage, "QUANTUM_COHERENCE_ERROR", 500, {
      currentState,
      expectedState,
      resolutionPath,
    });
  }
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  maxRetries?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

/**
 * Tracing options
 */
export interface TracingOptions {
  spanName: string;
  attributes?: Record<string, any>;
}

/**
 * 🌟 Base Service Class
 * Provides common functionality for all services
 */
export abstract class BaseService {
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Execute operation within a traced span
   */
  protected async withTracing<T>(
    spanName: string,
    operation: () => Promise<T>,
    attributes?: Record<string, any>
  ): Promise<T> {
    const tracer = trace.getTracer(this.serviceName);

    return await tracer.startActiveSpan(spanName, async (span) => {
      // Set attributes
      if (attributes) {
        span.setAttributes(attributes);
      }

      try {
        const result = await operation();
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Unknown error",
        });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Execute operation within a database transaction
   */
  protected async withTransaction<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    const maxRetries = options?.maxRetries ?? 3;
    const timeout = options?.timeout ?? 30000; // 30 seconds default
    const isolationLevel = options?.isolationLevel;

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await database.$transaction(operation, {
          timeout,
          isolationLevel,
        });
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable (deadlock, serialization failure, etc.)
        const isRetryable = this.isRetryableError(error);

        if (!isRetryable || attempt === maxRetries) {
          throw this.handleDatabaseError(error);
        }

        // Exponential backoff
        const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new ServiceError("Transaction failed", "TRANSACTION_ERROR");
  }

  /**
   * Divine quantum transaction wrapper
   */
  protected async withQuantumTransaction<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    return this.withTracing(
      "quantumTransaction",
      () => this.withTransaction(operation, options),
      { serviceName: this.serviceName }
    );
  }

  /**
   * Check if database error is retryable
   */
  private isRetryableError(error: any): boolean {
    const retryableCodes = [
      "P2034", // Transaction conflict
      "P2028", // Transaction API error
      "40001", // Serialization failure (PostgreSQL)
      "40P01", // Deadlock detected (PostgreSQL)
    ];

    const code = error?.code || error?.meta?.code;
    return retryableCodes.includes(code);
  }

  /**
   * Handle database errors and convert to service errors
   */
  protected handleDatabaseError(error: any): ServiceError {
    // Prisma error codes
    if (error?.code) {
      switch (error.code) {
        case "P2002": // Unique constraint violation
          return new ConflictError(
            `Resource already exists: ${error.meta?.target?.join(", ") || "unknown field"}`,
            { prismaError: error }
          );

        case "P2025": // Record not found
          return new NotFoundError(
            error.meta?.modelName || "Resource",
            error.meta?.cause || "unknown",
            { prismaError: error }
          );

        case "P2003": // Foreign key constraint violation
          return new ValidationError(
            `Invalid reference: ${error.meta?.field_name || "unknown field"}`,
            error.meta?.field_name
          );

        case "P2011": // Null constraint violation
          return new ValidationError(
            `Required field missing: ${error.meta?.target || "unknown field"}`,
            error.meta?.target
          );

        default:
          return new ServiceError(
            error.message || "Database operation failed",
            "DATABASE_ERROR",
            500,
            { prismaError: error }
          );
      }
    }

    // Generic error
    if (error instanceof ServiceError) {
      return error;
    }

    return new ServiceError(
      error?.message || "Unknown service error",
      "UNKNOWN_ERROR",
      500,
      { originalError: error }
    );
  }

  /**
   * Validate required fields
   */
  protected validateRequired<T>(
    data: T,
    requiredFields: (keyof T)[]
  ): void {
    for (const field of requiredFields) {
      const value = data[field];
      if (value === undefined || value === null || value === "") {
        throw new ValidationError(
          `${String(field)} is required`,
          String(field),
          value
        );
      }
    }
  }

  /**
   * Validate string length
   */
  protected validateLength(
    value: string,
    field: string,
    min?: number,
    max?: number
  ): void {
    if (min !== undefined && value.length < min) {
      throw new ValidationError(
        `${field} must be at least ${min} characters`,
        field,
        value
      );
    }

    if (max !== undefined && value.length > max) {
      throw new ValidationError(
        `${field} must be at most ${max} characters`,
        field,
        value
      );
    }
  }

  /**
   * Validate numeric range
   */
  protected validateRange(
    value: number,
    field: string,
    min?: number,
    max?: number
  ): void {
    if (min !== undefined && value < min) {
      throw new ValidationError(
        `${field} must be at least ${min}`,
        field,
        value
      );
    }

    if (max !== undefined && value > max) {
      throw new ValidationError(
        `${field} must be at most ${max}`,
        field,
        value
      );
    }
  }

  /**
   * Validate email format
   */
  protected validateEmail(email: string, field: string = "email"): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError(
        `${field} must be a valid email address`,
        field,
        email
      );
    }
  }

  /**
   * Validate URL format
   */
  protected validateUrl(url: string, field: string = "url"): void {
    try {
      new URL(url);
    } catch {
      throw new ValidationError(
        `${field} must be a valid URL`,
        field,
        url
      );
    }
  }

  /**
   * Validate enum value
   */
  protected validateEnum<T>(
    value: T,
    field: string,
    allowedValues: T[]
  ): void {
    if (!allowedValues.includes(value)) {
      throw new ValidationError(
        `${field} must be one of: ${allowedValues.join(", ")}`,
        field,
        value
      );
    }
  }

  /**
   * Safe Decimal to number conversion
   */
  protected toNumber(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }
    if (typeof value === "number") {
      return value;
    }
    if (typeof value.toNumber === "function") {
      return value.toNumber();
    }
    return Number(value);
  }

  /**
   * Safe Decimal conversion with null handling
   */
  protected toNumberOrNull(value: any): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    return this.toNumber(value);
  }

  /**
   * Generate pagination metadata
   */
  protected generatePaginationMeta(
    total: number,
    page: number,
    limit: number
  ) {
    const totalPages = Math.ceil(total / limit);
    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Log operation (can be extended with proper logger)
   */
  protected log(level: "info" | "warn" | "error", message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logData = { timestamp, service: this.serviceName, level, message, ...meta };

    if (level === "error") {
      logger.error(JSON.stringify(logData));
    } else if (level === "warn") {
      logger.warn(JSON.stringify(logData));
    } else {
      logger.info(JSON.stringify(logData));
    }
  }
}

/**
 * Helper function to handle async operations with error conversion
 */
export async function handleServiceOperation<T>(
  operation: () => Promise<T>,
  errorContext?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    throw new ServiceError(
      `${errorContext ? errorContext + ": " : ""}${error instanceof Error ? error.message : "Unknown error"}`,
      "OPERATION_ERROR",
      500,
      { originalError: error }
    );
  }
}

/**
 * Type guard for ServiceError
 */
export function isServiceError(error: any): error is ServiceError {
  return error instanceof ServiceError;
}

/**
 * Extract error response for API
 */
export function extractErrorResponse(error: any) {
  if (error instanceof ServiceError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
      statusCode: error.statusCode,
    };
  }

  return {
    success: false,
    error: {
      code: "UNKNOWN_ERROR",
      message: error instanceof Error ? error.message : "An unknown error occurred",
      timestamp: new Date().toISOString(),
    },
    statusCode: 500,
  };
}
