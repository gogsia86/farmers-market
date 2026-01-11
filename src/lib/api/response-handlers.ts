/**
 * 📡 API RESPONSE HANDLERS - STANDARDIZED WITH REQUEST TRACKING
 *
 * Centralized response handling for all API routes with agricultural consciousness
 *
 * Features:
 * - Standardized response format
 * - Request ID tracking (for debugging and tracing)
 * - Structured error responses
 * - Security-safe error messages (no sensitive data leakage)
 * - Performance metrics
 * - Type-safe responses
 *
 * @reference .cursorrules - Claude Sonnet 4.5 API Patterns
 */

import { logger } from "@/lib/monitoring/logger";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string; // Only in development
  timestamp: string;
  requestId: string;
}

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  duration?: number; // Response time in ms
  version: string; // API version
  pagination?: PaginationMeta;
  cached?: boolean;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================================================
// ERROR CODES
// ============================================================================

export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  CONFLICT: "CONFLICT",

  // Rate limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // Server errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",

  // Business logic errors
  BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  INVALID_OPERATION: "INVALID_OPERATION",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ============================================================================
// RESPONSE BUILDERS
// ============================================================================

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Build response metadata
 */
function buildMeta(
  requestId: string,
  startTime?: number,
  additionalMeta?: Partial<ResponseMeta>,
): ResponseMeta {
  const timestamp = new Date().toISOString();
  const duration = startTime ? Date.now() - startTime : undefined;

  return {
    requestId,
    timestamp,
    duration,
    version: "v1",
    ...additionalMeta,
  };
}

/**
 * SUCCESS RESPONSE
 * Returns successful API response with data
 */
export function successResponse<T>(
  data: T,
  options?: {
    requestId?: string;
    startTime?: number;
    meta?: Partial<ResponseMeta>;
    status?: number;
  },
): NextResponse<ApiResponse<T>> {
  const requestId = options?.requestId || generateRequestId();
  const meta = buildMeta(requestId, options?.startTime, options?.meta);

  const response: ApiResponse<T> = {
    success: true,
    data,
    meta,
  };

  // Log successful response
  if (meta.duration) {
    logger.debug("API response sent", {
      requestId,
      duration: meta.duration,
      status: options?.status || 200,
    });
  }

  return NextResponse.json(response, { status: options?.status || 200 });
}

/**
 * CREATED RESPONSE
 * Returns 201 Created response
 */
export function createdResponse<T>(
  data: T,
  options?: {
    requestId?: string;
    startTime?: number;
    meta?: Partial<ResponseMeta>;
  },
): NextResponse<ApiResponse<T>> {
  return successResponse(data, { ...options, status: 201 });
}

/**
 * NO CONTENT RESPONSE
 * Returns 204 No Content response
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

/**
 * ERROR RESPONSE
 * Returns standardized error response
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  options?: {
    details?: Record<string, unknown>;
    error?: Error;
    requestId?: string;
    startTime?: number;
    status?: number;
  },
): NextResponse<ApiResponse<never>> {
  const requestId = options?.requestId || generateRequestId();
  const isDevelopment = process.env.NODE_ENV === "development";
  const timestamp = new Date().toISOString();

  const apiError: ApiError = {
    code,
    message,
    details: options?.details,
    timestamp,
    requestId,
    // Only include stack trace in development
    stack: isDevelopment && options?.error ? options.error.stack : undefined,
  };

  const meta = buildMeta(requestId, options?.startTime);

  const response: ApiResponse<never> = {
    success: false,
    error: apiError,
    meta,
  };

  // Log error (with full details)
  logger.error(`API error: ${code}`, {
    requestId,
    code,
    message,
    details: options?.details,
    error: options?.error?.message,
    stack: options?.error?.stack,
  });

  return NextResponse.json(response, { status: options?.status || 500 });
}

/**
 * VALIDATION ERROR RESPONSE
 * Returns 400 Bad Request with validation errors
 */
export function validationErrorResponse(
  zodError: ZodError,
  options?: {
    requestId?: string;
    startTime?: number;
  },
): NextResponse<ApiResponse<never>> {
  const fieldErrors = zodError.flatten();

  return errorResponse(
    ErrorCodes.VALIDATION_ERROR,
    "Validation failed. Please check your input.",
    {
      details: {
        fieldErrors: fieldErrors.fieldErrors,
        formErrors: fieldErrors.formErrors,
      },
      requestId: options?.requestId,
      startTime: options?.startTime,
      status: 400,
    },
  );
}

/**
 * NOT FOUND RESPONSE
 * Returns 404 Not Found
 */
export function notFoundResponse(
  resourceType?: string,
  options?: {
    requestId?: string;
    startTime?: number;
  },
): NextResponse<ApiResponse<never>> {
  const message = resourceType
    ? `${resourceType} not found`
    : "Resource not found";

  return errorResponse(ErrorCodes.NOT_FOUND, message, {
    requestId: options?.requestId,
    startTime: options?.startTime,
    status: 404,
  });
}

/**
 * UNAUTHORIZED RESPONSE
 * Returns 401 Unauthorized
 */
export function unauthorizedResponse(
  message: string = "Authentication required",
  options?: {
    requestId?: string;
    startTime?: number;
  },
): NextResponse<ApiResponse<never>> {
  return errorResponse(ErrorCodes.UNAUTHORIZED, message, {
    requestId: options?.requestId,
    startTime: options?.startTime,
    status: 401,
  });
}

/**
 * FORBIDDEN RESPONSE
 * Returns 403 Forbidden
 */
export function forbiddenResponse(
  message: string = "You do not have permission to perform this action",
  options?: {
    requestId?: string;
    startTime?: number;
  },
): NextResponse<ApiResponse<never>> {
  return errorResponse(ErrorCodes.FORBIDDEN, message, {
    requestId: options?.requestId,
    startTime: options?.startTime,
    status: 403,
  });
}

/**
 * CONFLICT RESPONSE
 * Returns 409 Conflict
 */
export function conflictResponse(
  message: string,
  options?: {
    details?: Record<string, unknown>;
    requestId?: string;
    startTime?: number;
  },
): NextResponse<ApiResponse<never>> {
  return errorResponse(ErrorCodes.CONFLICT, message, {
    details: options?.details,
    requestId: options?.requestId,
    startTime: options?.startTime,
    status: 409,
  });
}

/**
 * RATE LIMIT RESPONSE
 * Returns 429 Too Many Requests
 */
export function rateLimitResponse(
  retryAfter: number,
  options?: {
    requestId?: string;
    startTime?: number;
  },
): NextResponse<ApiResponse<never>> {
  const response = errorResponse(
    ErrorCodes.RATE_LIMIT_EXCEEDED,
    "Rate limit exceeded. Please try again later.",
    {
      details: { retryAfter },
      requestId: options?.requestId,
      startTime: options?.startTime,
      status: 429,
    },
  );

  // Add Retry-After header
  response.headers.set("Retry-After", retryAfter.toString());

  return response;
}

/**
 * INTERNAL ERROR RESPONSE
 * Returns 500 Internal Server Error (safe, no sensitive data)
 */
export function internalErrorResponse(
  error?: Error,
  options?: {
    requestId?: string;
    startTime?: number;
  },
): NextResponse<ApiResponse<never>> {
  // Never expose internal error details in production
  const message =
    process.env.NODE_ENV === "development" && error
      ? error.message
      : "An unexpected error occurred. Please try again later.";

  return errorResponse(ErrorCodes.INTERNAL_ERROR, message, {
    error,
    requestId: options?.requestId,
    startTime: options?.startTime,
    status: 500,
  });
}

/**
 * SERVICE UNAVAILABLE RESPONSE
 * Returns 503 Service Unavailable
 */
export function serviceUnavailableResponse(
  message: string = "Service temporarily unavailable",
  options?: {
    requestId?: string;
    startTime?: number;
    retryAfter?: number;
  },
): NextResponse<ApiResponse<never>> {
  const response = errorResponse(ErrorCodes.SERVICE_UNAVAILABLE, message, {
    requestId: options?.requestId,
    startTime: options?.startTime,
    status: 503,
  });

  if (options?.retryAfter) {
    response.headers.set("Retry-After", options.retryAfter.toString());
  }

  return response;
}

// ============================================================================
// PAGINATED RESPONSE HELPER
// ============================================================================

/**
 * PAGINATED RESPONSE
 * Returns paginated data with metadata
 */
export function paginatedResponse<T>(
  items: T[],
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
  },
  options?: {
    requestId?: string;
    startTime?: number;
  },
): NextResponse<ApiResponse<T[]>> {
  const totalPages = Math.ceil(pagination.totalItems / pagination.pageSize);
  const hasNext = pagination.page < totalPages;
  const hasPrevious = pagination.page > 1;

  const paginationMeta: PaginationMeta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages,
    totalItems: pagination.totalItems,
    hasNext,
    hasPrevious,
  };

  return successResponse(items, {
    requestId: options?.requestId,
    startTime: options?.startTime,
    meta: {
      pagination: paginationMeta,
    },
  });
}

// ============================================================================
// ERROR HANDLER WRAPPER
// ============================================================================

/**
 * HANDLE API ERROR
 * Automatically converts common errors to appropriate responses
 */
export function handleApiError(
  error: unknown,
  options?: {
    requestId?: string;
    startTime?: number;
  },
): NextResponse<ApiResponse<never>> {
  const requestId = options?.requestId || generateRequestId();

  // Zod validation error
  if (error instanceof ZodError) {
    return validationErrorResponse(error, {
      requestId,
      startTime: options?.startTime,
    });
  }

  // Custom error with status code
  if (error instanceof Error && "statusCode" in error) {
    const statusCode = (error as any).statusCode;
    const errorCode =
      statusCode === 404
        ? ErrorCodes.NOT_FOUND
        : statusCode === 401
          ? ErrorCodes.UNAUTHORIZED
          : statusCode === 403
            ? ErrorCodes.FORBIDDEN
            : ErrorCodes.INTERNAL_ERROR;

    return errorResponse(errorCode, error.message, {
      error,
      requestId,
      startTime: options?.startTime,
      status: statusCode,
    });
  }

  // Standard Error
  if (error instanceof Error) {
    // Check for known error patterns
    if (error.message.toLowerCase().includes("not found")) {
      return notFoundResponse(undefined, {
        requestId,
        startTime: options?.startTime,
      });
    }

    if (error.message.toLowerCase().includes("unauthorized")) {
      return unauthorizedResponse(error.message, {
        requestId,
        startTime: options?.startTime,
      });
    }

    if (error.message.toLowerCase().includes("forbidden")) {
      return forbiddenResponse(error.message, {
        requestId,
        startTime: options?.startTime,
      });
    }

    // Default to internal error
    return internalErrorResponse(error, {
      requestId,
      startTime: options?.startTime,
    });
  }

  // Unknown error
  logger.error("Unknown error type in API handler", {
    requestId,
    error: String(error),
  });

  return internalErrorResponse(undefined, {
    requestId,
    startTime: options?.startTime,
  });
}

// ============================================================================
// REQUEST TRACKING MIDDLEWARE HELPER
// ============================================================================

/**
 * CREATE REQUEST CONTEXT
 * Creates context object with request ID and start time for tracking
 */
export function createRequestContext() {
  return {
    requestId: generateRequestId(),
    startTime: Date.now(),
  };
}

/**
 * Divine API response handling achieved ✨
 * Standardized responses across all endpoints
 * Request tracking enabled
 * Security-safe error messages
 * Type-safe and production-ready
 * Ready to scale from 1 to 1 billion requests
 */
