/**
 * 🌟 SERVICE RESPONSE TYPES - DIVINE STANDARDIZATION
 *
 * Unified response types for all service layer operations.
 * Ensures consistency, type safety, and predictability across the entire platform.
 *
 * Divine Patterns Applied:
 * - Discriminated unions for type safety
 * - Generic type parameters for flexibility
 * - Comprehensive metadata support
 * - Agricultural consciousness integration
 * - Enlightening error structures
 *
 * Architecture:
 * All services return ServiceResponse<T> for consistent handling
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/12_ERROR_HANDLING_VALIDATION.instructions.md
 */

// ============================================================================
// CORE RESPONSE TYPES
// ============================================================================

/**
 * Universal service response type with discriminated union
 * Use this for ALL service layer operations
 *
 * @template T - The success data type
 *
 * @example
 * ```typescript
 * async function getFarm(id: string): Promise<ServiceResponse<Farm>> {
 *   const farm = await repository.findById(id);
 *   if (!farm) {
 *     return {
 *       success: false,
 *       error: {
 *         code: "FARM_NOT_FOUND",
 *         message: "Farm not found",
 *         details: { farmId: id }
 *       }
 *     };
 *   }
 *   return {
 *     success: true,
 *     data: farm,
 *     meta: { cached: false }
 *   };
 * }
 * ```
 */
export type ServiceResponse<T> =
  | ServiceSuccessResponse<T>
  | ServiceErrorResponse;

/**
 * Success response structure
 */
export interface ServiceSuccessResponse<T> {
  success: true;
  data: T;
  meta?: ResponseMetadata;
}

/**
 * Error response structure
 */
export interface ServiceErrorResponse {
  success: false;
  error: ServiceError;
  meta?: ResponseMetadata;
}

// ============================================================================
// ERROR STRUCTURES
// ============================================================================

/**
 * Standard error structure for service responses
 */
export interface ServiceError {
  /** Error code (uppercase, snake_case) */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Additional error context and details */
  details?: Record<string, unknown>;

  /** Stack trace (only in development) */
  stack?: string;

  /** Resolution steps for enlightening errors */
  resolutionSteps?: string[];

  /** Related error codes or documentation links */
  references?: string[];
}

/**
 * Validation error structure (specific case)
 */
export interface ValidationError extends ServiceError {
  code: "VALIDATION_ERROR";
  validationErrors: Array<{
    field: string;
    message: string;
    value?: unknown;
    constraint?: string;
  }>;
}

// ============================================================================
// METADATA STRUCTURES
// ============================================================================

/**
 * Response metadata for additional context
 */
export interface ResponseMetadata {
  /** Whether data was served from cache */
  cached?: boolean;

  /** Cache key used (if cached) */
  cacheKey?: string;

  /** Cache TTL in seconds (if cached) */
  cacheTTL?: number;

  /** Response timestamp */
  timestamp?: string;

  /** Unique request ID for tracing */
  requestId?: string;

  /** Operation duration in milliseconds */
  duration?: number;

  /** Pagination info (for list responses) */
  pagination?: PaginationMetadata;

  /** Agricultural consciousness metadata */
  agricultural?: AgriculturalMetadata;

  /** Additional custom metadata */
  [key: string]: unknown;
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMetadata {
  /** Current page number (1-indexed) */
  page: number;

  /** Items per page */
  limit: number;

  /** Total number of items */
  total: number;

  /** Total number of pages */
  totalPages: number;

  /** Whether there is a next page */
  hasNext: boolean;

  /** Whether there is a previous page */
  hasPrevious: boolean;

  /** First item index (0-indexed) */
  startIndex?: number;

  /** Last item index (0-indexed) */
  endIndex?: number;
}

/**
 * Agricultural consciousness metadata
 */
export interface AgriculturalMetadata {
  /** Current growing season */
  season?: "SPRING" | "SUMMER" | "FALL" | "WINTER";

  /** Lunar phase (for biodynamic operations) */
  lunarPhase?: "NEW_MOON" | "WAXING" | "FULL_MOON" | "WANING";

  /** Agricultural consciousness level */
  consciousness?: "DIVINE" | "QUANTUM" | "STANDARD";

  /** Seasonal appropriateness of operation */
  seasonallyAppropriate?: boolean;

  /** Biodynamic calendar compliance */
  biodynamicCompliant?: boolean;
}

// ============================================================================
// PAGINATED RESPONSE TYPES
// ============================================================================

/**
 * Paginated list response
 * Use for all list/collection endpoints
 *
 * @template T - The item type in the list
 */
export type PaginatedResponse<T> = ServiceResponse<{
  items: T[];
  pagination: PaginationMetadata;
}>;

/**
 * Helper to create paginated response data
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMetadata;
}

// ============================================================================
// COMMON ERROR CODES
// ============================================================================

/**
 * Standard error codes used across services
 * Extend this list as needed, but maintain consistency
 */
export const ErrorCodes = {
  // Validation Errors (400)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Authentication Errors (401)
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",

  // Authorization Errors (403)
  AUTHORIZATION_FAILED: "AUTHORIZATION_FAILED",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  FORBIDDEN_ACTION: "FORBIDDEN_ACTION",

  // Not Found Errors (404)
  NOT_FOUND: "NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

  // Conflict Errors (409)
  RESOURCE_EXISTS: "RESOURCE_EXISTS",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  CONSTRAINT_VIOLATION: "CONSTRAINT_VIOLATION",

  // Business Logic Errors (422)
  BUSINESS_LOGIC_ERROR: "BUSINESS_LOGIC_ERROR",
  INVALID_STATE_TRANSITION: "INVALID_STATE_TRANSITION",
  OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED",

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // Server Errors (500)
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  SERVICE_ERROR: "SERVICE_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",

  // Agricultural Errors (Custom)
  SEASONAL_VIOLATION: "SEASONAL_VIOLATION",
  BIODYNAMIC_VIOLATION: "BIODYNAMIC_VIOLATION",
  AGRICULTURAL_CONSTRAINT: "AGRICULTURAL_CONSTRAINT",
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if response is successful
 */
export function isSuccess<T>(
  response: ServiceResponse<T>
): response is ServiceSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isError<T>(
  response: ServiceResponse<T>
): response is ServiceErrorResponse {
  return response.success === false;
}

/**
 * Type guard to check if error is a validation error
 */
export function isValidationError(
  error: ServiceError
): error is ValidationError {
  return error.code === "VALIDATION_ERROR";
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract the data type from a ServiceResponse
 *
 * @example
 * ```typescript
 * type FarmData = ResponseData<ServiceResponse<Farm>>; // Farm
 * ```
 */
export type ResponseData<T> = T extends ServiceResponse<infer D> ? D : never;

/**
 * Unwrap ServiceResponse to get the data type
 * Useful for function return type inference
 */
export type Unwrap<T> = T extends ServiceResponse<infer U> ? U : T;

/**
 * Make a ServiceResponse from a data type
 */
export type MakeResponse<T> = ServiceResponse<T>;

// ============================================================================
// BUILDER HELPERS
// ============================================================================

/**
 * Helper functions to build responses (used by BaseService)
 * These are exported for testing but should not be used directly
 * in application code - use BaseService methods instead
 */

/**
 * Create a success response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: ResponseMetadata
): ServiceSuccessResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(
  error: ServiceError,
  meta?: ResponseMetadata
): ServiceErrorResponse {
  return {
    success: false,
    error,
    ...(meta && { meta }),
  };
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  pagination: PaginationMetadata,
  meta?: ResponseMetadata
): ServiceSuccessResponse<PaginatedData<T>> {
  return {
    success: true,
    data: {
      items,
      pagination,
    },
    meta,
  };
}

// ============================================================================
// PAGINATION HELPERS
// ============================================================================

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationMetadata {
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit - 1, total - 1);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
    startIndex,
    endIndex,
  };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  page: number,
  limit: number
): { valid: boolean; error?: string } {
  if (page < 1) {
    return { valid: false, error: "Page must be >= 1" };
  }
  if (limit < 1) {
    return { valid: false, error: "Limit must be >= 1" };
  }
  if (limit > 100) {
    return { valid: false, error: "Limit must be <= 100" };
  }
  return { valid: true };
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Re-export commonly used types for convenience
 */
export type {
  ServiceSuccessResponse as SuccessResponse,
  ServiceErrorResponse as ErrorResponse,
  ServiceError as Error,
};
