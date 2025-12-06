/**
 * 🎯 BASE CONTROLLER - DIVINE API RESPONSE PATTERNS
 *
 * Unified controller base class for consistent API responses across all endpoints.
 * Provides standardized success/error handling, validation, and HTTP response formatting.
 *
 * Divine Patterns Applied:
 * - Controller layer standardization
 * - Unified API response format
 * - Enlightening error messages
 * - Agricultural consciousness in responses
 * - Type-safe response building
 *
 * Architecture:
 * Controller → Service → Repository → Database
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  DivineError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  handleError,
} from "@/lib/errors";
import { ZodSchema, ZodError } from "zod";

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard success response structure
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    requestId?: string;
    timestamp?: string;
    [key: string]: any;
  };
  agricultural?: AgriculturalMetadata;
}

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    validationErrors?: ValidationErrorDetail[];
    resolutionSteps?: string[];
  };
  meta?: {
    requestId?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Agricultural consciousness metadata
 */
export interface AgriculturalMetadata {
  season?: string;
  consciousness?: "DIVINE" | "QUANTUM" | "BIODYNAMIC" | "ACTIVE";
  operation?: string;
  [key: string]: any;
}

/**
 * Validation error detail
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}

/**
 * API Response type (union of success and error)
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// ============================================================================
// BASE CONTROLLER CLASS
// ============================================================================

/**
 * Base Controller with divine consciousness
 *
 * Provides unified methods for:
 * - Success/error response formatting
 * - Request validation
 * - Authentication/authorization checks
 * - Error handling
 * - Pagination helpers
 *
 * @example
 * ```typescript
 * export class FarmController extends BaseController {
 *   async getFarms(request: NextRequest) {
 *     return this.handleRequest(request, async () => {
 *       const farms = await farmService.listFarms();
 *       return this.success(farms, { count: farms.length });
 *     });
 *   }
 * }
 * ```
 */
export class BaseController {
  protected readonly controllerName: string;

  constructor(controllerName: string = "BaseController") {
    this.controllerName = controllerName;
  }

  // ==========================================================================
  // SUCCESS RESPONSE BUILDERS
  // ==========================================================================

  /**
   * Create standard success response
   *
   * @param data - Response data
   * @param meta - Additional metadata
   * @param agricultural - Agricultural consciousness metadata
   * @returns NextResponse with success structure
   *
   * @example
   * ```typescript
   * return this.success(farms, { count: farms.length });
   * ```
   */
  protected success<T>(
    data: T,
    meta?: Record<string, any>,
    agricultural?: AgriculturalMetadata,
  ): NextResponse<SuccessResponse<T>> {
    const response: SuccessResponse<T> = {
      success: true,
      data,
      ...(meta && {
        meta: {
          ...meta,
          timestamp: new Date().toISOString(),
        },
      }),
      ...(agricultural && { agricultural }),
    };

    return NextResponse.json(response);
  }

  /**
   * Create success response with pagination
   *
   * @param data - Response data array
   * @param pagination - Pagination details
   * @param meta - Additional metadata
   * @returns NextResponse with paginated success structure
   *
   * @example
   * ```typescript
   * return this.successWithPagination(
   *   farms,
   *   { page: 1, limit: 20, total: 100, totalPages: 5 }
   * );
   * ```
   */
  protected successWithPagination<T>(
    data: T[],
    pagination: Omit<PaginationMeta, "hasNext" | "hasPrev">,
    meta?: Record<string, any>,
  ): NextResponse<SuccessResponse<T[]>> {
    const paginationMeta: PaginationMeta = {
      ...pagination,
      hasNext: pagination.page < pagination.totalPages,
      hasPrev: pagination.page > 1,
    };

    return this.success(data, {
      ...meta,
      pagination: paginationMeta,
    });
  }

  /**
   * Create created (201) success response
   *
   * @param data - Created resource data
   * @param meta - Additional metadata
   * @returns NextResponse with 201 status
   *
   * @example
   * ```typescript
   * return this.created(farm, { farmId: farm.id });
   * ```
   */
  protected created<T>(
    data: T,
    meta?: Record<string, any>,
  ): NextResponse<SuccessResponse<T>> {
    const response: SuccessResponse<T> = {
      success: true,
      data,
      ...(meta && {
        meta: {
          ...meta,
          timestamp: new Date().toISOString(),
        },
      }),
    };

    return NextResponse.json(response, { status: 201 });
  }

  /**
   * Create no content (204) success response
   *
   * @returns NextResponse with 204 status
   *
   * @example
   * ```typescript
   * return this.noContent();
   * ```
   */
  protected noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  // ==========================================================================
  // ERROR RESPONSE BUILDERS
  // ==========================================================================

  /**
   * Create standard error response
   *
   * @param error - Error object (DivineError or standard Error)
   * @param meta - Additional metadata
   * @returns NextResponse with error structure
   *
   * @example
   * ```typescript
   * return this.error(new NotFoundError("Farm", farmId));
   * ```
   */
  protected error(
    error: DivineError | Error,
    meta?: Record<string, any>,
  ): NextResponse<ErrorResponse> {
    const divineError =
      error instanceof DivineError ? error : handleError(error);

    const response: ErrorResponse = {
      success: false,
      error: {
        code: divineError.code,
        message: divineError.message,
        ...(divineError.context && { details: divineError.context }),
        ...(divineError.resolutionSteps && {
          resolutionSteps: divineError.resolutionSteps,
        }),
      },
      ...(meta && {
        meta: {
          ...meta,
          timestamp: new Date().toISOString(),
        },
      }),
    };

    return NextResponse.json(response, { status: divineError.statusCode });
  }

  /**
   * Create validation error response
   *
   * @param errors - Validation errors (Zod errors or custom)
   * @param message - Error message
   * @returns NextResponse with validation error structure
   *
   * @example
   * ```typescript
   * return this.validationError(zodError.errors);
   * ```
   */
  protected validationError(
    errors: ValidationErrorDetail[] | ZodError,
    message: string = "Validation failed",
  ): NextResponse<ErrorResponse> {
    let validationErrors: ValidationErrorDetail[];

    if (errors instanceof ZodError) {
      validationErrors = errors.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      }));
    } else {
      validationErrors = errors;
    }

    const response: ErrorResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message,
        validationErrors,
        resolutionSteps: [
          "Check the input data against the schema",
          "Ensure all required fields are provided",
          "Verify data types match expectations",
        ],
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 400 });
  }

  /**
   * Create bad request error response
   *
   * @param message - Error message
   * @param details - Additional details
   * @returns NextResponse with 400 status
   */
  protected badRequest(
    message: string,
    details?: Record<string, any>,
  ): NextResponse<ErrorResponse> {
    return this.error(new ValidationError(message, details));
  }

  /**
   * Create unauthorized error response
   *
   * @param message - Error message
   * @returns NextResponse with 401 status
   */
  protected unauthorized(
    message: string = "Authentication required",
  ): NextResponse<ErrorResponse> {
    return this.error(new AuthenticationError(message));
  }

  /**
   * Create forbidden error response
   *
   * @param message - Error message
   * @param requiredRole - Required role for the operation
   * @returns NextResponse with 403 status
   */
  protected forbidden(
    message: string = "Insufficient permissions",
    requiredRole?: string,
  ): NextResponse<ErrorResponse> {
    return this.error(new AuthorizationError(message, requiredRole));
  }

  /**
   * Create not found error response
   *
   * @param resource - Resource type
   * @param id - Resource ID
   * @returns NextResponse with 404 status
   */
  protected notFound(
    resource: string,
    id?: string,
  ): NextResponse<ErrorResponse> {
    return this.error(new NotFoundError(resource, id));
  }

  /**
   * Create conflict error response
   *
   * @param message - Error message
   * @param context - Additional context
   * @returns NextResponse with 409 status
   */
  protected conflict(
    message: string,
    context?: Record<string, any>,
  ): NextResponse<ErrorResponse> {
    return this.error(new ConflictError(message, context));
  }

  /**
   * Create internal server error response
   *
   * @param message - Error message
   * @param error - Original error
   * @returns NextResponse with 500 status
   */
  protected internalError(
    message: string = "Internal server error",
    error?: Error,
  ): NextResponse<ErrorResponse> {
    // Log the error for monitoring
    console.error(`[${this.controllerName}] Internal error:`, error);

    return this.error(
      new DivineError(message, "INTERNAL_ERROR", 500, {
        originalError: error?.message,
      }),
    );
  }

  // ==========================================================================
  // REQUEST HANDLING
  // ==========================================================================

  /**
   * Handle request with automatic error catching
   *
   * Wraps request handler with try-catch and automatic error response generation.
   *
   * @param request - NextRequest object
   * @param handler - Async handler function
   * @returns NextResponse (success or error)
   *
   * @example
   * ```typescript
   * return this.handleRequest(request, async () => {
   *   const farms = await farmService.listFarms();
   *   return this.success(farms);
   * });
   * ```
   */
  protected async handleRequest(
    _request: NextRequest,
    handler: () => Promise<NextResponse>,
  ): Promise<NextResponse> {
    try {
      return await handler();
    } catch (error) {
      console.error(`[${this.controllerName}] Request error:`, error);
      return this.error(error as Error);
    }
  }

  /**
   * Handle request with authentication
   *
   * Checks authentication and passes authenticated user to handler.
   *
   * @param request - NextRequest object
   * @param handler - Async handler function with session
   * @returns NextResponse (success or error)
   *
   * @example
   * ```typescript
   * return this.handleAuthenticatedRequest(request, async (session) => {
   *   const farms = await farmService.getFarmsByOwnerId(session.user.id);
   *   return this.success(farms);
   * });
   * ```
   */
  protected async handleAuthenticatedRequest(
    _request: NextRequest,
    handler: (session: AuthSession) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    try {
      const session = await auth();

      if (!session?.user) {
        return this.unauthorized("Authentication required");
      }

      return await handler(session as AuthSession);
    } catch (error) {
      console.error(
        `[${this.controllerName}] Authenticated request error:`,
        error,
      );
      return this.error(error as Error);
    }
  }

  /**
   * Handle request with role check
   *
   * Checks authentication and role, passes authenticated user to handler.
   *
   * @param request - NextRequest object
   * @param requiredRole - Required role(s)
   * @param handler - Async handler function with session
   * @returns NextResponse (success or error)
   *
   * @example
   * ```typescript
   * return this.handleAuthorizedRequest(
   *   request,
   *   ["FARMER", "ADMIN"],
   *   async (session) => {
   *     const farm = await farmService.createFarm(...);
   *     return this.created(farm);
   *   }
   * );
   * ```
   */
  protected async handleAuthorizedRequest(
    _request: NextRequest,
    requiredRole: string | string[],
    handler: (session: AuthSession) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    try {
      const session = await auth();

      if (!session?.user) {
        return this.unauthorized("Authentication required");
      }

      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      const userRole = (session.user as any).role;

      if (!roles.includes(userRole)) {
        return this.forbidden(
          `This operation requires one of the following roles: ${roles.join(", ")}`,
          roles[0],
        );
      }

      return await handler(session as AuthSession);
    } catch (error) {
      console.error(
        `[${this.controllerName}] Authorized request error:`,
        error,
      );
      return this.error(error as Error);
    }
  }

  // ==========================================================================
  // VALIDATION HELPERS
  // ==========================================================================

  /**
   * Validate request body with Zod schema
   *
   * @param request - NextRequest object
   * @param schema - Zod validation schema
   * @returns Validated data or null (sends error response)
   *
   * @example
   * ```typescript
   * const data = await this.validateBody(request, CreateFarmSchema);
   * if (!data) return; // Error response already sent
   * ```
   */
  protected async validateBody<T>(
    _request: NextRequest,
    schema: ZodSchema<T>,
  ): Promise<T | null> {
    try {
      const body = await _request.json();
      const validated = schema.parse(body);
      return validated;
    } catch (error) {
      if (error instanceof ZodError) {
        // Validation error response will be handled by caller
        throw new ValidationError("Invalid request body", {
          errors: error.issues,
        });
      }
      throw error;
    }
  }

  /**
   * Validate query parameters with Zod schema
   *
   * @param request - NextRequest object
   * @param schema - Zod validation schema
   * @returns Validated data
   *
   * @example
   * ```typescript
   * const params = this.validateQuery(request, ListFarmsQuerySchema);
   * ```
   */
  protected validateQuery<T>(_request: NextRequest, schema: ZodSchema<T>): T {
    const searchParams = _request.nextUrl.searchParams;
    const params: Record<string, any> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    try {
      return schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError("Invalid query parameters", {
          errors: error.issues,
        });
      }
      throw error;
    }
  }

  /**
   * Parse pagination parameters from request
   *
   * @param request - NextRequest object
   * @param defaultPage - Default page number
   * @param defaultLimit - Default page limit
   * @param maxLimit - Maximum allowed limit
   * @returns Pagination parameters
   *
   * @example
   * ```typescript
   * const { page, limit, skip } = this.parsePagination(request);
   * ```
   */
  protected parsePagination(
    _request: NextRequest,
    defaultPage: number = 1,
    defaultLimit: number = 20,
    maxLimit: number = 100,
  ): { page: number; limit: number; skip: number } {
    const searchParams = _request.nextUrl.searchParams;

    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || String(defaultPage)),
    );
    const limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(searchParams.get("limit") || String(defaultLimit))),
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Build pagination metadata from count
   *
   * @param page - Current page
   * @param limit - Items per page
   * @param total - Total item count
   * @returns Pagination metadata
   */
  protected buildPaginationMeta(
    page: number,
    limit: number,
    total: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Log controller operation
   *
   * @param operation - Operation name
   * @param data - Additional data to log
   */
  protected log(operation: string, data?: Record<string, any>): void {
    console.log(`[${this.controllerName}] ${operation}`, data || "");
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Authenticated session type
 */
export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  };
  expires: string;
}

/**
 * Divine controller consciousness achieved ✨🎯
 * Unified API response patterns established
 * Ready to scale from 1 to 1 billion requests with quantum efficiency
 */
