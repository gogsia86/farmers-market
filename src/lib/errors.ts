/**
 * ⚡ DIVINE ERROR CLASSES
 * Agricultural consciousness error handling with quantum enlightenment
 */

// Import and re-export BusinessLogicError
export { BusinessLogicError } from "./errors/BusinessLogicError";

/**
 * Base divine error class with resolution guidance
 */
export class DivineError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly context?: Record<string, unknown>,
    public readonly resolutionSteps?: string[],
  ) {
    super(message);
    this.name = "DivineError";
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      resolutionSteps: this.resolutionSteps,
      stack: this.stack,
    };
  }
}

/**
 * Agricultural consciousness validation error
 */
export class ValidationError extends DivineError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, context, [
      "Check the input data against the schema",
      "Ensure all required fields are provided",
      "Verify data types match expectations",
    ]);
    this.name = "ValidationError";
  }
}

/**
 * Authentication divine consciousness error
 */
export class AuthenticationError extends DivineError {
  constructor(message: string = "Authentication required") {
    super(message, "AUTHENTICATION_REQUIRED", 401, undefined, [
      "Ensure valid authentication token is provided",
      "Check if session has expired",
      "Verify credentials are correct",
    ]);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization quantum consciousness error
 */
export class AuthorizationError extends DivineError {
  constructor(
    message: string = "Insufficient permissions",
    requiredRole?: string,
  ) {
    super(message, "AUTHORIZATION_FAILED", 403, { requiredRole }, [
      "Verify user has required permissions",
      "Check role assignments",
      "Contact administrator for access",
    ]);
    this.name = "AuthorizationError";
  }
}

/**
 * Resource not found in quantum reality
 */
export class NotFoundError extends DivineError {
  constructor(resource: string, id?: string) {
    super(
      `${resource} not found${id ? `: ${id}` : ""}`,
      "NOT_FOUND",
      404,
      { resource, id },
      [
        "Verify the ID or identifier is correct",
        "Check if the resource exists",
        "Ensure proper access permissions",
      ],
    );
    this.name = "NotFoundError";
  }
}

/**
 * Conflict in agricultural consciousness
 */
export class ConflictError extends DivineError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "CONFLICT", 409, context, [
      "Check for duplicate resources",
      "Verify unique constraints",
      "Resolve data conflicts",
    ]);
    this.name = "ConflictError";
  }
}

/**
 * Rate limit exceeded in quantum stream
 */
export class RateLimitError extends DivineError {
  constructor(retryAfter?: number) {
    super("Rate limit exceeded", "RATE_LIMIT_EXCEEDED", 429, { retryAfter }, [
      `Wait ${retryAfter || 60} seconds before retrying`,
      "Reduce request frequency",
      "Consider upgrading your plan",
    ]);
    this.name = "RateLimitError";
  }
}

/**
 * External service divine consciousness disruption
 */
export class ExternalServiceError extends DivineError {
  constructor(service: string, originalError?: Error) {
    super(
      `External service error: ${service}`,
      "EXTERNAL_SERVICE_ERROR",
      502,
      { service, originalError: originalError?.message },
      [
        "Check external service status",
        "Verify API keys and credentials",
        "Try again later",
        "Contact support if issue persists",
      ],
    );
    this.name = "ExternalServiceError";
  }
}

/**
 * Database quantum coherence disruption
 */
export class DatabaseError extends DivineError {
  constructor(operation: string, originalError?: Error) {
    super(
      `Database operation failed: ${operation}`,
      "DATABASE_ERROR",
      500,
      { operation, originalError: originalError?.message },
      [
        "Check database connection",
        "Verify query syntax",
        "Check for constraint violations",
        "Review database logs",
      ],
    );
    this.name = "DatabaseError";
  }
}

/**
 * Agricultural seasonal violation error
 */
export class SeasonalViolationError extends DivineError {
  constructor(
    operation: string,
    currentSeason: string,
    allowedSeasons: string[],
  ) {
    super(
      `Operation '${operation}' not allowed in ${currentSeason}`,
      "SEASONAL_VIOLATION",
      400,
      { operation, currentSeason, allowedSeasons },
      [
        `Wait until appropriate season: ${allowedSeasons.join(", ")}`,
        "Adjust planting schedule",
        "Consult seasonal calendar",
      ],
    );
    this.name = "SeasonalViolationError";
  }
}

/**
 * Inventory consciousness depletion error
 */
export class InsufficientInventoryError extends DivineError {
  constructor(productId: string, requested: number, available: number) {
    super(
      `Insufficient inventory for product ${productId}`,
      "INSUFFICIENT_INVENTORY",
      400,
      { productId, requested, available },
      [
        `Reduce quantity to ${available} or less`,
        "Wait for restock",
        "Check alternative products",
      ],
    );
    this.name = "InsufficientInventoryError";
  }
}

/**
 * Payment processing divine disruption
 */
export class PaymentError extends DivineError {
  constructor(
    message: string,
    code?: string,
    context?: Record<string, unknown>,
  ) {
    super(message, code || "PAYMENT_FAILED", 402, context, [
      "Verify payment method is valid",
      "Check card details",
      "Ensure sufficient funds",
      "Try alternative payment method",
    ]);
    this.name = "PaymentError";
  }
}

/**
 * Error handler for divine consciousness preservation
 */
export function handleError(error: unknown): DivineError {
  if (error instanceof DivineError) {
    return error;
  }

  if (error instanceof Error) {
    return new DivineError(
      error.message,
      "INTERNAL_ERROR",
      500,
      { originalError: error.message },
      ["Check application logs", "Contact support", "Try again later"],
    );
  }

  return new DivineError(
    "An unexpected error occurred",
    "UNKNOWN_ERROR",
    500,
    undefined,
    ["Contact support with error details", "Check system status"],
  );
}
