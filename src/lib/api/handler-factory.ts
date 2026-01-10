/**
 * 🏭 API HANDLER FACTORY - Divine API Route Generation
 *
 * Eliminates boilerplate and standardizes API route patterns
 * Provides consistent error handling, pagination, validation, and auth checks
 *
 * Features:
 * - Standardized request/response handling
 * - Built-in authentication & authorization
 * - Automatic pagination
 * - Consistent error responses
 * - Request validation with Zod
 * - Agricultural consciousness metadata
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 */

import { auth } from "@/lib/auth";
import { apiLogger } from "@/lib/utils/logger";
import type { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ApiHandlerOptions<T = unknown> {
  /** Require authentication for this endpoint */
  requireAuth?: boolean;
  /** Required roles for authorization */
  allowedRoles?: string[];
  /** Zod schema for request body validation */
  bodySchema?: ZodSchema<T>;
  /** Zod schema for query parameter validation */
  querySchema?: ZodSchema;
  /** Enable pagination support */
  paginated?: boolean;
  /** Default page size for pagination */
  defaultLimit?: number;
  /** Maximum page size for pagination */
  maxLimit?: number;
  /** Add agricultural metadata to response */
  agriculturalMetadata?: boolean;
  /** Custom rate limiting (requests per minute) */
  rateLimit?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    field?: string;
  };
  meta?: {
    pagination?: PaginationMeta;
    requestId?: string;
    timestamp?: string;
  };
  agricultural?: AgriculturalMetadata;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface AgriculturalMetadata {
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER";
  consciousness: "DIVINE" | "QUANTUM" | "STANDARD";
  harvestAlignment?: number;
}

export interface HandlerContext<TBody = unknown, TQuery = unknown> {
  /** The original request */
  request: NextRequest;
  /** Authenticated session (if requireAuth is true) */
  session?: Session | null;
  /** Current user from session */
  user?: Session["user"];
  /** Validated request body */
  body?: TBody;
  /** Validated query parameters */
  query?: TQuery;
  /** Pagination parameters */
  pagination?: PaginationParams;
  /** Request ID for tracing */
  requestId: string;
}

export type HandlerFunction<
  TBody = unknown,
  TQuery = unknown,
  TResponse = unknown,
> = (
  ctx: HandlerContext<TBody, TQuery>,
) => Promise<TResponse | ApiResponse<TResponse>>;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a unique request ID for tracing
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get current season based on date
 */
function getCurrentSeason(): AgriculturalMetadata["season"] {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "SUMMER";
  if (month >= 8 && month <= 10) return "FALL";
  return "WINTER";
}

/**
 * Extract pagination parameters from request
 */
function extractPaginationParams(
  request: NextRequest,
  options: ApiHandlerOptions,
): PaginationParams {
  const searchParams = request.nextUrl.searchParams;
  const defaultLimit = options.defaultLimit || 20;
  const maxLimit = options.maxLimit || 100;

  let page = parseInt(searchParams.get("page") || "1", 10);
  let limit = parseInt(searchParams.get("limit") || String(defaultLimit), 10);

  // Validate and clamp values
  page = Math.max(1, page);
  limit = Math.min(Math.max(1, limit), maxLimit);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

/**
 * Extract and parse query parameters
 */
function extractQueryParams(
  request: NextRequest,
): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    if (params[key]) {
      // Handle multiple values for same key
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });
  return params;
}

/**
 * Create agricultural metadata
 */
function createAgriculturalMetadata(): AgriculturalMetadata {
  return {
    season: getCurrentSeason(),
    consciousness: "DIVINE",
    harvestAlignment: Math.random() * 100,
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>,
  field?: string,
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
        field,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status },
  );
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  options: {
    status?: number;
    pagination?: PaginationMeta;
    requestId?: string;
    agricultural?: boolean;
  } = {},
): NextResponse<ApiResponse<T>> {
  const { status = 200, pagination, requestId, agricultural } = options;

  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        ...(pagination && { pagination }),
        ...(requestId && { requestId }),
        timestamp: new Date().toISOString(),
      },
      ...(agricultural && { agricultural: createAgriculturalMetadata() }),
    },
    { status },
  );
}

// ============================================
// API HANDLER FACTORY
// ============================================

/**
 * Creates a standardized API handler with built-in features
 *
 * @example
 * ```typescript
 * // Simple GET handler
 * export const GET = createApiHandler(
 *   async ({ pagination }) => {
 *     const products = await database.product.findMany({
 *       skip: pagination?.skip,
 *       take: pagination?.limit,
 *     });
 *     return products;
 *   },
 *   { paginated: true }
 * );
 *
 * // POST handler with validation and auth
 * export const POST = createApiHandler(
 *   async ({ body, user }) => {
 *     const product = await database.product.create({
 *       data: { ...body, createdBy: user.id },
 *     });
 *     return product;
 *   },
 *   {
 *     requireAuth: true,
 *     allowedRoles: ['FARMER', 'ADMIN'],
 *     bodySchema: CreateProductSchema,
 *   }
 * );
 * ```
 */
export function createApiHandler<
  TBody = unknown,
  TQuery = unknown,
  TResponse = unknown,
>(
  handler: HandlerFunction<TBody, TQuery, TResponse>,
  options: ApiHandlerOptions<TBody> = {},
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    const requestId = generateRequestId();

    try {
      // ========================================
      // AUTHENTICATION
      // ========================================
      let session: Session | null = null;

      if (options.requireAuth) {
        session = await auth();

        if (!session?.user) {
          return createErrorResponse(
            "UNAUTHORIZED",
            "Authentication required",
            401,
          );
        }

        // Authorization check
        if (options.allowedRoles && options.allowedRoles.length > 0) {
          const userRole = (session.user as any).role;
          if (!options.allowedRoles.includes(userRole)) {
            return createErrorResponse(
              "FORBIDDEN",
              "Insufficient permissions",
              403,
              { requiredRoles: options.allowedRoles, userRole },
            );
          }
        }
      }

      // ========================================
      // REQUEST BODY VALIDATION
      // ========================================
      let body: TBody | undefined;

      if (
        options.bodySchema &&
        ["POST", "PUT", "PATCH"].includes(request.method)
      ) {
        try {
          const rawBody = await request.json();
          const validationResult = options.bodySchema.safeParse(rawBody);

          if (!validationResult.success) {
            const firstError = validationResult.error.issues[0];
            return createErrorResponse(
              "VALIDATION_ERROR",
              firstError?.message || "Request validation failed",
              400,
              {
                errors: validationResult.error.issues.map((err: any) => ({
                  path: err.path.join("."),
                  message: err.message,
                })),
              },
              firstError?.path.join("."),
            );
          }

          body = validationResult.data;
        } catch (parseError) {
          return createErrorResponse(
            "INVALID_JSON",
            "Invalid JSON in request body",
            400,
          );
        }
      }

      // ========================================
      // QUERY PARAMETER VALIDATION
      // ========================================
      let query: TQuery | undefined;
      const rawQuery = extractQueryParams(request);

      if (options.querySchema) {
        const validationResult = options.querySchema.safeParse(rawQuery);

        if (!validationResult.success) {
          const firstError = validationResult.error.issues[0];
          return createErrorResponse(
            "QUERY_VALIDATION_ERROR",
            firstError?.message || "Query parameter validation failed",
            400,
            {
              errors: validationResult.error.issues.map((err: any) => ({
                path: err.path.join("."),
                message: err.message,
              })),
            },
          );
        }

        query = validationResult.data as TQuery;
      } else {
        query = rawQuery as TQuery;
      }

      // ========================================
      // PAGINATION
      // ========================================
      let pagination: PaginationParams | undefined;

      if (options.paginated) {
        pagination = extractPaginationParams(request, options);
      }

      // ========================================
      // EXECUTE HANDLER
      // ========================================
      const context: HandlerContext<TBody, TQuery> = {
        request,
        session,
        user: session?.user,
        body,
        query,
        pagination,
        requestId,
      };

      const result = await handler(context);

      // ========================================
      // FORMAT RESPONSE
      // ========================================
      // Check if result is already an ApiResponse
      if (
        result &&
        typeof result === "object" &&
        "success" in result &&
        typeof (result as any).success === "boolean"
      ) {
        return NextResponse.json(result);
      }

      // Wrap result in standard response
      return createSuccessResponse(result, {
        requestId,
        agricultural: options.agriculturalMetadata,
      });
    } catch (error) {
      apiLogger.error(`API Error`, {
        requestId,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });

      // Handle known error types
      if (error instanceof z.ZodError) {
        return createErrorResponse(
          "VALIDATION_ERROR",
          "Request validation failed",
          400,
          { errors: error.issues },
        );
      }

      // Generic error handling
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      const code =
        error instanceof Error && "code" in error
          ? String((error as any).code)
          : "INTERNAL_ERROR";

      return createErrorResponse(code, message, 500);
    }
  };
}

// ============================================
// SPECIALIZED HANDLER FACTORIES
// ============================================

/**
 * Create a GET handler with pagination
 */
export function createGetHandler<TQuery = unknown, TResponse = unknown>(
  handler: HandlerFunction<never, TQuery, TResponse>,
  options: Omit<ApiHandlerOptions<never>, "bodySchema"> = {},
): (request: NextRequest) => Promise<NextResponse> {
  return createApiHandler(handler, {
    ...options,
    paginated: options.paginated ?? true,
  });
}

/**
 * Create a POST handler with body validation
 */
export function createPostHandler<TBody, TResponse = unknown>(
  handler: HandlerFunction<TBody, unknown, TResponse>,
  bodySchema: ZodSchema<TBody>,
  options: Omit<ApiHandlerOptions<TBody>, "bodySchema"> = {},
): (request: NextRequest) => Promise<NextResponse> {
  return createApiHandler(handler, {
    ...options,
    bodySchema,
    requireAuth: options.requireAuth ?? true,
  });
}

/**
 * Create a PUT/PATCH handler with body validation
 */
export function createUpdateHandler<TBody, TResponse = unknown>(
  handler: HandlerFunction<TBody, unknown, TResponse>,
  bodySchema: ZodSchema<TBody>,
  options: Omit<ApiHandlerOptions<TBody>, "bodySchema"> = {},
): (request: NextRequest) => Promise<NextResponse> {
  return createApiHandler(handler, {
    ...options,
    bodySchema,
    requireAuth: options.requireAuth ?? true,
  });
}

/**
 * Create a DELETE handler
 */
export function createDeleteHandler<TResponse = unknown>(
  handler: HandlerFunction<never, unknown, TResponse>,
  options: Omit<ApiHandlerOptions<never>, "bodySchema"> = {},
): (request: NextRequest) => Promise<NextResponse> {
  return createApiHandler(handler, {
    ...options,
    requireAuth: options.requireAuth ?? true,
  });
}

// ============================================
// PAGINATION HELPERS
// ============================================

/**
 * Create pagination metadata from query results
 */
export function createPaginationMeta(
  params: PaginationParams,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / params.limit);

  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrevious: params.page > 1,
  };
}

/**
 * Helper to fetch paginated data with total count
 */
export async function fetchPaginatedData<T>(
  findMany: (args: { skip: number; take: number }) => Promise<T[]>,
  count: () => Promise<number>,
  pagination: PaginationParams,
): Promise<{ data: T[]; pagination: PaginationMeta }> {
  const [data, total] = await Promise.all([
    findMany({ skip: pagination.skip, take: pagination.limit }),
    count(),
  ]);

  return {
    data,
    pagination: createPaginationMeta(pagination, total),
  };
}

// ============================================
// EXPORTS
// ============================================

export default {
  createApiHandler,
  createGetHandler,
  createPostHandler,
  createUpdateHandler,
  createDeleteHandler,
  createErrorResponse,
  createSuccessResponse,
  createPaginationMeta,
  fetchPaginatedData,
};
