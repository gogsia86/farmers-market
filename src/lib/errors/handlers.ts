/**
 * 🌟 Error Handlers - Divine Agricultural Error Processing
 *
 * Comprehensive error handling functions with retry logic, transformation,
 * and recovery strategies.
 *
 * @module lib/errors/handlers
 */

import { NextResponse } from "next/server";
import {
  ApiError,
  ApiErrorResponse,
  AppError,
  DatabaseError,
  ErrorCategory,
  ErrorSeverity,
  isAppError,
  NetworkError,
  PaymentError,
  RecoveryStrategy,
  toAppError,
  ValidationError,
  type ErrorMetadata,
  type ValidationErrorDetail,
} from "./types";

// ============================================================================
// ERROR TRANSFORMATION
// ============================================================================

/**
 * Transform error to API error response
 */
export function toApiErrorResponse(error: unknown): ApiErrorResponse {
  const appError = isAppError(error) ? error : toAppError(error);

  return {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      severity: appError.severity,
      category: appError.category,
      timestamp: appError.timestamp,
      errorId: appError.errorId,
      retryable: appError.retryable,
      details: appError.metadata.context,
      requestId: appError.metadata.requestId,
    },
    agricultural: {
      consciousness: "DIVINE",
    },
  };
}

/**
 * Transform error to NextResponse
 */
export function toErrorResponse(error: unknown, status?: number): NextResponse {
  const apiError = toApiErrorResponse(error);
  const statusCode = status || getHttpStatusCode(error);

  return NextResponse.json(apiError, { status: statusCode });
}

/**
 * Get appropriate HTTP status code for error
 */
export function getHttpStatusCode(error: unknown): number {
  if (!isAppError(error)) return 500;

  switch (error.category) {
    case ErrorCategory.VALIDATION:
      return 400;
    case ErrorCategory.AUTHENTICATION:
      return 401;
    case ErrorCategory.AUTHORIZATION:
      return 403;
    case ErrorCategory.NETWORK:
      return error instanceof NetworkError && error.statusCode
        ? error.statusCode
        : 503;
    case ErrorCategory.DATABASE:
      return 503;
    case ErrorCategory.API:
      return error instanceof ApiError ? error.statusCode : 502;
    case ErrorCategory.PAYMENT:
      return 402;
    case ErrorCategory.INVENTORY:
      return 409;
    case ErrorCategory.BUSINESS_LOGIC:
      return 422;
    case ErrorCategory.SEASONAL:
    case ErrorCategory.BIODYNAMIC:
    case ErrorCategory.AGRICULTURAL:
      return 422;
    default:
      return 500;
  }
}

// ============================================================================
// FETCH ERROR HANDLING
// ============================================================================

/**
 * Handle fetch errors and transform to AppError
 */
export async function handleFetchError(
  error: unknown,
  endpoint: string,
  metadata?: Partial<ErrorMetadata>,
): Promise<never> {
  if (error instanceof TypeError) {
    // Network error
    throw new NetworkError({
      message: "Network request failed",
      endpoint,
      metadata: {
        ...metadata,
        context: {
          originalError: error.message,
        },
      },
    });
  }

  if (error instanceof Response) {
    // HTTP error response
    const statusCode = error.status;
    const responseText = await error.text().catch(() => "");

    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    throw new ApiError({
      message: responseData.message || error.statusText || "API request failed",
      statusCode,
      endpoint,
      response: responseData,
      metadata,
    });
  }

  throw toAppError(error, ErrorCategory.API);
}

/**
 * Wrapped fetch with error handling
 */
export async function fetchWithErrorHandling<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
  metadata?: Partial<ErrorMetadata>,
): Promise<T> {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      await handleFetchError(response, input.toString(), metadata);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }
    await handleFetchError(error, input.toString(), metadata);
    throw error; // TypeScript needs this
  }
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts?: number;
  /** Initial delay in milliseconds */
  initialDelay?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Backoff multiplier */
  backoffMultiplier?: number;
  /** Function to determine if error is retryable */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Callback on each retry attempt */
  onRetry?: (error: unknown, attempt: number) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  shouldRetry: (error: unknown) => {
    if (isAppError(error)) {
      return error.retryable;
    }
    return false;
  },
  onRetry: () => {},
};

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt < opts.maxAttempts && opts.shouldRetry(error, attempt)) {
        opts.onRetry(error, attempt);

        // Wait before retrying
        await sleep(delay);

        // Exponential backoff
        delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
      } else {
        // No more retries or not retryable
        throw error;
      }
    }
  }

  throw lastError;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// VALIDATION ERROR HANDLING
// ============================================================================

/**
 * Create validation error from Zod error
 */
export function createValidationError(
  zodError: any,
  metadata?: Partial<ErrorMetadata>,
): ValidationError {
  const validationErrors: ValidationErrorDetail[] = zodError.errors.map(
    (err: any) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code,
      value: err.received,
    }),
  );

  return new ValidationError({
    message: "Validation failed",
    validationErrors,
    metadata,
  });
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: unknown): never {
  if (error && typeof error === "object" && "issues" in error) {
    throw createValidationError(error);
  }
  throw error;
}

// ============================================================================
// PRISMA ERROR HANDLING
// ============================================================================

/**
 * Handle Prisma errors and transform to AppError
 */
export function handlePrismaError(
  error: unknown,
  operation?: string,
  metadata?: Partial<ErrorMetadata>,
): never {
  // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string; meta?: any; message: string };

    switch (prismaError.code) {
      case "P2002":
        // Unique constraint violation
        throw new ValidationError({
          message: "A record with this value already exists",
          validationErrors: [
            {
              field: prismaError.meta?.target?.[0] || "unknown",
              message: "This value is already in use",
              code: "UNIQUE_CONSTRAINT",
            },
          ],
          metadata,
        });

      case "P2025":
        // Record not found
        throw new AppError({
          message: "Record not found",
          code: "RECORD_NOT_FOUND",
          severity: ErrorSeverity.WARNING,
          category: ErrorCategory.DATABASE,
          userDetails: {
            title: "Not Found",
            message: "The requested record could not be found",
            suggestions: ["Verify the ID", "Check if the record exists"],
          },
          recoveryStrategy: RecoveryStrategy.REDIRECT,
          metadata,
        });

      case "P2003":
        // Foreign key constraint violation
        throw new ValidationError({
          message: "Referenced record does not exist",
          validationErrors: [
            {
              field: prismaError.meta?.field_name || "unknown",
              message: "Referenced record not found",
              code: "FOREIGN_KEY_CONSTRAINT",
            },
          ],
          metadata,
        });

      default:
        // Generic database error
        throw new DatabaseError({
          message: prismaError.message || "Database operation failed",
          operation,
          metadata,
          originalError: error as unknown as Error,
        });
    }
  }

  throw new DatabaseError({
    message:
      error instanceof Error ? error.message : "Database operation failed",
    operation,
    metadata,
    originalError: error as Error,
  });
}

// ============================================================================
// STRIPE ERROR HANDLING
// ============================================================================

/**
 * Handle Stripe errors and transform to PaymentError
 */
export function handleStripeError(
  error: unknown,
  metadata?: Partial<ErrorMetadata>,
): never {
  if (error && typeof error === "object" && "type" in error) {
    const stripeError = error as {
      type: string;
      message: string;
      code?: string;
      decline_code?: string;
      payment_method?: any;
    };

    let userMessage = "Payment failed";
    const suggestions: string[] = [];

    switch (stripeError.type) {
      case "card_error":
        userMessage = stripeError.message || "Card payment failed";
        suggestions.push(
          "Try a different card",
          "Check your card details",
          "Contact your bank",
        );
        break;

      case "validation_error":
        userMessage = "Invalid payment information";
        suggestions.push(
          "Check your payment details",
          "Ensure all fields are filled",
        );
        break;

      case "rate_limit_error":
        userMessage = "Too many payment attempts";
        suggestions.push("Wait a moment and try again");
        break;

      case "api_error":
      case "api_connection_error":
        userMessage = "Payment service unavailable";
        suggestions.push("Try again in a few moments");
        break;

      default:
        userMessage = stripeError.message || "Payment processing error";
    }

    throw new PaymentError({
      message: userMessage,
      paymentMethod: stripeError.payment_method?.type,
      declineCode: stripeError.decline_code || stripeError.code,
      metadata: {
        ...metadata,
        context: {
          stripeErrorType: stripeError.type,
          stripeCode: stripeError.code,
        },
      },
    });
  }

  throw new PaymentError({
    message: error instanceof Error ? error.message : "Payment failed",
    metadata,
  });
}

// ============================================================================
// AGGREGATE ERROR HANDLING
// ============================================================================

/**
 * Handle multiple errors and combine them
 */
export function handleAggregateErrors(
  errors: unknown[],
  metadata?: Partial<ErrorMetadata>,
): AppError {
  if (errors.length === 0) {
    throw new Error("No errors to aggregate");
  }

  if (errors.length === 1) {
    return toAppError(errors[0]);
  }

  const appErrors = errors.map((e: any) => toAppError(e));
  const highestSeverity = appErrors.reduce(
    (max, err) =>
      Object.values(ErrorSeverity).indexOf(err.severity) >
      Object.values(ErrorSeverity).indexOf(max)
        ? err.severity
        : max,
    ErrorSeverity.INFO,
  );

  return new AppError({
    message: `Multiple errors occurred: ${appErrors.map((e: any) => e.message).join("; ")}`,
    code: "AGGREGATE_ERROR",
    severity: highestSeverity,
    category: ErrorCategory.SYSTEM,
    userDetails: {
      title: "Multiple Errors",
      message: "Several issues need attention",
      suggestions: [
        "Review all highlighted issues",
        "Fix each problem individually",
        "Contact support if needed",
      ],
    },
    recoveryStrategy: RecoveryStrategy.CONTINUE,
    retryable: false,
    metadata: {
      ...metadata,
      context: {
        errorCount: errors.length,
        errors: appErrors.map((e: any) => e.toJSON()),
      },
    },
  });
}

// ============================================================================
// SAFE ERROR EXECUTION
// ============================================================================

/**
 * Execute function safely with error handling
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  fallback: T,
  onError?: (error: AppError) => void,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const appError = toAppError(error);
    if (onError) {
      onError(appError);
    }
    return fallback;
  }
}

/**
 * Execute function safely and return result or error
 */
export async function safeExecuteWithError<T>(
  fn: () => Promise<T>,
): Promise<{ data: T; error: null } | { data: null; error: AppError }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: toAppError(error) };
  }
}

// ============================================================================
// ERROR CONTEXT EXTRACTION
// ============================================================================

/**
 * Extract error context from request
 */
export function extractErrorContext(request: Request): Partial<ErrorMetadata> {
  return {
    url: request.url,
    userAgent: request.headers.get("user-agent") || undefined,
    requestId: request.headers.get("x-request-id") || undefined,
    context: {
      method: request.method,
      headers: Object.fromEntries(
        Array.from(request.headers.entries()).filter(
          ([key]) =>
            !key.toLowerCase().includes("authorization") &&
            !key.toLowerCase().includes("cookie"),
        ),
      ),
    },
  };
}

// ============================================================================
// ERROR SANITIZATION
// ============================================================================

/**
 * Sanitize error for logging (remove sensitive data)
 */
export function sanitizeErrorForLogging(error: AppError): AppError {
  // Clone the error metadata to avoid mutating original
  const sanitizedMetadata = { ...error.metadata };

  // Remove sensitive fields from context
  if (sanitizedMetadata.context) {
    const { password, token, apiKey, secret, authorization, ...safeContext } =
      sanitizedMetadata.context;
    sanitizedMetadata.context = safeContext;
  }

  // Return new AppError instance with sanitized metadata
  return {
    ...error,
    metadata: sanitizedMetadata,
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        errorId: this.errorId,
        timestamp: this.timestamp,
        severity: this.severity,
        category: this.category,
        code: this.code,
        recoveryStrategy: this.recoveryStrategy,
        retryable: this.retryable,
        metadata: this.metadata,
        userDetails: this.userDetails,
      };
    },
  };
}

/**
 * Sanitize error for client display (minimal info)
 */
export function sanitizeErrorForClient(error: AppError): Partial<AppError> {
  return {
    errorId: error.errorId,
    code: error.code,
    message: error.userDetails.message,
    severity: error.severity,
    category: error.category,
    userDetails: error.userDetails,
    recoveryStrategy: error.recoveryStrategy,
    retryable: error.retryable,
  };
}
