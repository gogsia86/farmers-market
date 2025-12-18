/**
 * ⚡ API TYPE DEFINITIONS
 * TypeScript types for API operations with divine consciousness
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ApiMetadata;
}

/**
 * API error structure
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
  statusCode?: number;
}

/**
 * API metadata for responses
 */
export interface ApiMetadata {
  timestamp: string;
  requestId?: string;
  version?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Sort parameters
 */
export interface SortParams {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

/**
 * Filter params for queries
 */
export interface FilterParams {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Query parameters combining pagination, sorting, filtering
 */
export interface QueryParams
  extends Partial<PaginationParams>, Partial<SortParams> {
  filters?: FilterParams;
  search?: string;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

/**
 * Batch operation request
 */
export interface BatchRequest<T> {
  items: T[];
  operation: "create" | "update" | "delete";
}

/**
 * Batch operation response
 */
export interface BatchResponse<T> {
  successful: T[];
  failed: Array<{
    item: T;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * API request context
 */
export interface RequestContext {
  userId?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId: string;
  timestamp: Date;
}

/**
 * Agricultural API specific types
 */
export interface FarmApiParams extends QueryParams {
  region?: string;
  hasProducts?: boolean;
  organic?: boolean;
}

export interface ProductApiParams extends QueryParams {
  farmId?: string;
  category?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  organic?: boolean;
  seasonal?: boolean;
}

export interface OrderApiParams extends QueryParams {
  userId?: string;
  farmId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Webhook payload
 */
export interface WebhookPayload<T = unknown> {
  event: string;
  timestamp: string;
  data: T;
  signature?: string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    database: ServiceHealth;
    cache: ServiceHealth;
    external: Record<string, ServiceHealth>;
  };
  version: string;
  uptime: number;
}

export interface ServiceHealth {
  status: "up" | "down" | "degraded";
  latency?: number;
  message?: string;
}
