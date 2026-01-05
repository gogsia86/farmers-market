/**
 * 🌾 SERVICE RESPONSE TYPES
 * Divine Service Layer Type Definitions
 *
 * Standardized response patterns for all services
 *
 * @divine-pattern Type Safety & Consistency
 * @reference 01_DIVINE_CORE_PRINCIPLES.instructions.md
 */

// ============================================================================
// SERVICE RESPONSE TYPES
// ============================================================================

/**
 * Standard service response wrapper
 * Used by all service methods for consistent error handling
 */
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  meta?: ServiceMeta;
}

/**
 * Service error details
 */
export interface ServiceError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp?: string;
  requestId?: string;
}

/**
 * Service response metadata
 */
export interface ServiceMeta {
  timestamp?: string;
  requestId?: string;
  version?: string;
  [key: string]: any;
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated service response
 */
export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  error?: ServiceError;
}

// ============================================================================
// AGRICULTURAL CONSCIOUSNESS TYPES
// ============================================================================

/**
 * Agricultural metadata for responses
 */
export interface AgriculturalMetadata {
  season?: "SPRING" | "SUMMER" | "FALL" | "WINTER";
  consciousness?: "DIVINE" | "QUANTUM" | "BIODYNAMIC";
  harvestBlessing?: string;
  lunarPhase?: string;
  [key: string]: any;
}

/**
 * Service response with agricultural consciousness
 */
export interface AgriculturalServiceResponse<
  T = any,
> extends ServiceResponse<T> {
  agricultural?: AgriculturalMetadata;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create successful service response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: ServiceMeta,
): ServiceResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

/**
 * Create error service response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, any>,
): ServiceResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
  };
}

/**
 * Create agricultural service response
 */
export function createAgriculturalResponse<T>(
  data: T,
  agricultural: AgriculturalMetadata,
  meta?: ServiceMeta,
): AgriculturalServiceResponse<T> {
  return {
    success: true,
    data,
    agricultural,
    meta,
  };
}
