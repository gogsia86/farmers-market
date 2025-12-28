/**
 * 🚨 API ERROR HANDLER - CENTRALIZED ERROR MANAGEMENT
 *
 * Comprehensive error handling utility for API routes
 *
 * Features:
 * - Custom error classes
 * - Prisma error mapping
 * - Zod validation errors
 * - Consistent error responses
 * - Environment-aware logging
 * - Async handler wrapper
 *
 * @module ErrorHandler
 */

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { telemetryService } from "@/lib/telemetry/azure-insights";

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Base Application Error
 */
class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Validation Error
 */
class ValidationError extends AppError {
  constructor(message: string = "Validation failed", code?: string) {
    super(message, 400, true, code || "VALIDATION_ERROR");
  }
}

/**
 * 401 Unauthorized - Authentication Error
 */
class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required", code?: string) {
    super(message, 401, true, code || "AUTHENTICATION_ERROR");
  }
}

/**
 * 403 Forbidden - Authorization Error
 */
class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions", code?: string) {
    super(message, 403, true, code || "AUTHORIZATION_ERROR");
  }
}

/**
 * 404 Not Found - Resource Not Found
 */
class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", code?: string) {
    super(message, 404, true, code || "NOT_FOUND");
  }
}

/**
 * 409 Conflict - Resource Conflict
 */
class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", code?: string) {
    super(message, 409, true, code || "CONFLICT_ERROR");
  }
}

/**
 * 500 Internal Server Error
 */
class InternalServerError extends AppError {
  constructor(message: string = "Internal server error", code?: string) {
    super(message, 500, false, code || "INTERNAL_SERVER_ERROR");
  }
}

// ============================================================================
// ERROR RESPONSE INTERFACE
// ============================================================================

interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

// ============================================================================
// PRISMA ERROR MAPPER
// ============================================================================

/**
 * Map Prisma errors to appropriate AppError
 */
function mapPrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    // Unique constraint violation
    case "P2002": {
      const target = (error.meta?.target as string[]) || [];
      const field = target[0] || "field";
      return new ConflictError(
        `A record with this ${field} already exists`,
        "UNIQUE_CONSTRAINT_VIOLATION",
      );
    }

    // Record not found
    case "P2025":
      return new NotFoundError(
        "The requested record was not found",
        "RECORD_NOT_FOUND",
      );

    // Foreign key constraint violation
    case "P2003": {
      const field = (error.meta?.field_name as string) || "field";
      return new ValidationError(
        `Invalid reference: ${field}`,
        "FOREIGN_KEY_CONSTRAINT_VIOLATION",
      );
    }

    // Record to delete does not exist
    case "P2016":
      return new NotFoundError(
        "Record to delete does not exist",
        "DELETE_RECORD_NOT_FOUND",
      );

    // Required field missing
    case "P2011":
      return new ValidationError(
        "Required field is missing",
        "REQUIRED_FIELD_MISSING",
      );

    // Value too long for field
    case "P2000": {
      const field = (error.meta?.column_name as string) || "field";
      return new ValidationError(
        `Value too long for ${field}`,
        "VALUE_TOO_LONG",
      );
    }

    // Default case
    default:
      return new InternalServerError(
        "Database operation failed",
        "DATABASE_ERROR",
      );
  }
}

// ============================================================================
// ZOD ERROR FORMATTER
// ============================================================================

/**
 * Format Zod validation errors
 */
function formatZodError(error: ZodError): { message: string; details: any } {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  return {
    message: "Validation failed",
    details: errors,
  };
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Main error handler - converts all errors to NextResponse
 */
function handleError(
  error: unknown,
  path?: string,
): NextResponse<ErrorResponse> {
  // Log error (with stack trace in development)
  if (isDevelopment) {
    console.error("❌ [API Error]", {
      error,
      path,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Production logging (minimal, no sensitive data)
    console.error("[API Error]", {
      message: error instanceof Error ? error.message : "Unknown error",
      path,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle known AppError
  if (error instanceof AppError) {
    return NextResponse.json<ErrorResponse>(
      {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
        path,
      },
      { status: error.statusCode },
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formatted = formatZodError(error);
    return NextResponse.json<ErrorResponse>(
      {
        error: formatted.message,
        code: "VALIDATION_ERROR",
        details: formatted.details,
        timestamp: new Date().toISOString(),
        path,
      },
      { status: 400 },
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mappedError = mapPrismaError(error);
    return NextResponse.json<ErrorResponse>(
      {
        error: mappedError.message,
        code: mappedError.code,
        timestamp: new Date().toISOString(),
        path,
      },
      { status: mappedError.statusCode },
    );
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json<ErrorResponse>(
      {
        error: "Invalid data provided",
        code: "PRISMA_VALIDATION_ERROR",
        details: isDevelopment ? error.message : undefined,
        timestamp: new Date().toISOString(),
        path,
      },
      { status: 400 },
    );
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json<ErrorResponse>(
      {
        error: isDevelopment ? error.message : "An unexpected error occurred",
        code: "INTERNAL_SERVER_ERROR",
        details: isDevelopment ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        path,
      },
      { status: 500 },
    );
  }

  // Handle unknown errors
  return NextResponse.json<ErrorResponse>(
    {
      error: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      timestamp: new Date().toISOString(),
      path,
    },
    { status: 500 },
  );
}

// ============================================================================
// ASYNC HANDLER WRAPPER
// ============================================================================

type AsyncRouteHandler = (
  request: NextRequest,
  context?: any,
) => Promise<NextResponse | Response>;

/**
 * Wraps async route handlers with error handling
 *
 * Usage:
 * export const POST = asyncHandler(async (req) => {
 *   // Your code here
 * });
 */
function asyncHandler(handler: AsyncRouteHandler): AsyncRouteHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      const url = new URL(request.url);
      return handleError(error, url.pathname);
    }
  };
}

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

/**
 * Validate request data against Zod schema
 * Throws ValidationError if invalid
 */
function validateRequest<T>(
  schema: { parse: (data: unknown) => T },
  data: unknown,
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const formatted = formatZodError(error);
      throw new ValidationError(formatted.message);
    }
    throw error;
  }
}

// ============================================================================
// LOGGING HELPERS
// ============================================================================

/**
 * Log error for monitoring with Azure Application Insights integration
 */
function logError(error: unknown, context?: Record<string, any>): void {
  if (isDevelopment) {
    console.error("🔴 [Error Log]", {
      error,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // Send to Azure Application Insights in production
  if (process.env.NODE_ENV === "production" && telemetryService.enabled) {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    telemetryService.trackException(errorObj, {
      ...context,
      errorCode: error instanceof AppError ? error.code : "UNKNOWN_ERROR",
      statusCode: error instanceof AppError ? error.statusCode : 500,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Error classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  // Functions
  handleError,
  asyncHandler,
  validateRequest,
  logError,
};
