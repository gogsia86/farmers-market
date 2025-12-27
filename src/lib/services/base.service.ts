/**
 * 🌟 BASE SERVICE CLASS - DIVINE FOUNDATION
 *
 * Abstract base class for all service layer operations.
 * Provides standardized patterns for error handling, validation, caching,
 * logging, tracing, and transaction management.
 *
 * Divine Patterns Applied:
 * - Repository pattern integration
 * - Standardized error handling with enlightening messages
 * - Service-level caching with agricultural consciousness
 * - Structured logging with context
 * - OpenTelemetry tracing integration
 * - Transaction management
 * - Validation helpers
 * - Type-safe response builders
 *
 * Architecture:
 * All services extend this base class for consistency
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/12_ERROR_HANDLING_VALIDATION.instructions.md
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 */

import { Prisma } from "@prisma/client";
import { z } from "zod";
import { database } from "@/lib/database";
import type {
  ServiceResponse,
  ServiceSuccessResponse,
  ServiceErrorResponse,
  ServiceError,
  ResponseMetadata,
  PaginatedResponse,
  PaginationMetadata,
  AgriculturalMetadata,
} from "@/lib/types/service-response";
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  calculatePagination,
  ErrorCodes,
} from "@/lib/types/service-response";
import {
  DivineError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
} from "@/lib/errors";
import { logger, type Logger } from "@/lib/logger";
import {
  traceServiceOperation,
  addSpanEvent,
  setSpanAttributes,
} from "@/lib/tracing/service-tracer";

// ============================================================================
// BASE SERVICE CONFIGURATION
// ============================================================================

/**
 * Configuration options for BaseService
 */
export interface BaseServiceConfig {
  /** Service name (defaults to class name) */
  serviceName?: string;

  /** Cache TTL in seconds (default: 3600 = 1 hour) */
  cacheTTL?: number;

  /** Cache key prefix (default: lowercase service name) */
  cachePrefix?: string;

  /** Enable caching (default: true) */
  enableCaching?: boolean;

  /** Enable tracing (default: true) */
  enableTracing?: boolean;

  /** Enable agricultural consciousness (default: false) */
  enableAgriculturalConsciousness?: boolean;
}

// ============================================================================
// CACHE INTERFACE
// ============================================================================

/**
 * Cache interface (implement based on your cache solution)
 */
export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  invalidate(pattern: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Simple in-memory cache implementation (fallback)
 * Replace with Redis/Memcached in production
 */
class MemoryCache implements ICache {
  private store = new Map<string, { value: unknown; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set(key: string, value: unknown, ttl = 3600): Promise<void> {
    this.store.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace("*", ".*"));
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

// ============================================================================
// BASE SERVICE CLASS
// ============================================================================

/**
 * Abstract base service class
 * All domain services should extend this class
 *
 * @template TEntity - The primary entity type this service manages
 *
 * @example
 * ```typescript
 * export class FarmService extends BaseService<Farm> {
 *   protected readonly cacheTTL = 3600;
 *   protected readonly cachePrefix = "farm";
 *
 *   async createFarm(data: CreateFarmRequest): Promise<ServiceResponse<Farm>> {
 *     return await this.traced("createFarm", async () => {
 *       // Validate
 *       const validated = await this.validate(CreateFarmSchema, data);
 *
 *       // Business logic
 *       const farm = await this.repository.create(validated);
 *
 *       // Invalidate cache
 *       await this.invalidateCache();
 *
 *       return this.success(farm);
 *     });
 *   }
 * }
 * ```
 */
export abstract class BaseService<TEntity = unknown> {
  // ============================================================================
  // PROTECTED PROPERTIES
  // ============================================================================

  /** Database client (canonical singleton) */
  protected readonly database = database;

  /** Service-specific logger with context */
  protected readonly logger: Logger;

  /** Cache instance */
  protected readonly cache: ICache;

  /** Service name */
  protected readonly serviceName: string;

  /** Cache configuration */
  protected readonly cacheTTL: number;
  protected readonly cachePrefix: string;
  protected readonly enableCaching: boolean;

  /** Tracing configuration */
  protected readonly enableTracing: boolean;

  /** Agricultural consciousness */
  protected readonly enableAgriculturalConsciousness: boolean;

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(config: BaseServiceConfig = {}) {
    // Service name (defaults to class name)
    this.serviceName = config.serviceName || this.constructor.name;

    // Initialize logger with service context
    this.logger = logger.child({
      service: this.serviceName,
      layer: "service",
    });

    // Cache configuration
    this.cacheTTL = config.cacheTTL ?? 3600; // 1 hour default
    this.cachePrefix =
      config.cachePrefix ??
      this.serviceName.toLowerCase().replace("service", "");
    this.enableCaching = config.enableCaching ?? true;

    // Initialize cache
    this.cache = new MemoryCache(); // Replace with Redis in production

    // Tracing configuration
    this.enableTracing = config.enableTracing ?? true;

    // Agricultural consciousness
    this.enableAgriculturalConsciousness =
      config.enableAgriculturalConsciousness ?? false;

    this.logger.debug(
      `${this.serviceName} initialized with divine consciousness`,
      { config },
    );
  }

  // ============================================================================
  // RESPONSE BUILDERS
  // ============================================================================

  /**
   * Create a success response
   *
   * @param data - The success data
   * @param meta - Optional metadata
   * @returns Success response
   */
  protected success<T>(
    data: T,
    meta?: ResponseMetadata,
  ): ServiceSuccessResponse<T> {
    return createSuccessResponse(data, {
      timestamp: new Date().toISOString(),
      ...meta,
    });
  }

  /**
   * Create an error response
   *
   * @param code - Error code
   * @param message - Error message
   * @param details - Optional error details
   * @returns Error response
   */
  protected error(
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ): ServiceErrorResponse {
    this.logger.error("Service operation failed", undefined, {
      code,
      message,
      details,
    });

    const error: ServiceError = {
      code,
      message,
      details,
      ...(process.env.NODE_ENV === "development" && {
        stack: new Error().stack,
      }),
    };

    return createErrorResponse(error, {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Create a not found error response
   */
  protected notFound(
    resource: string,
    identifier?: string,
  ): ServiceErrorResponse {
    return this.error(
      ErrorCodes.RESOURCE_NOT_FOUND,
      `${resource} not found${identifier ? `: ${identifier}` : ""}`,
      { resource, identifier },
    );
  }

  /**
   * Create a validation error response
   */
  protected validationError(
    message: string,
    errors?: Array<{ field: string; message: string }>,
  ): ServiceErrorResponse {
    return this.error(ErrorCodes.VALIDATION_ERROR, message, {
      validationErrors: errors,
    });
  }

  /**
   * Create a paginated success response
   */
  protected paginated<T>(
    items: T[],
    page: number,
    limit: number,
    total: number,
    meta?: ResponseMetadata,
  ): ServiceSuccessResponse<{ items: T[]; pagination: PaginationMetadata }> {
    const pagination = calculatePagination(page, limit, total);

    return createPaginatedResponse(items, pagination, {
      timestamp: new Date().toISOString(),
      ...meta,
    });
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  /**
   * Validate data against a Zod schema
   *
   * @param schema - Zod schema
   * @param data - Data to validate
   * @returns Validated data
   * @throws ValidationError if validation fails
   */
  protected async validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
  ): Promise<T> {
    try {
      const result = await schema.safeParseAsync(data);

      if (!result.success) {
        const errors = result.error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
          value: (data as Record<string, unknown>)?.[err.path[0]],
        }));

        this.logger.warn("Validation failed", { errors });

        throw new ValidationError("Validation failed", {
          errors,
        });
      }

      return result.data;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      this.logger.error("Validation error", error);
      throw new ValidationError("Validation error", { originalError: error });
    }
  }

  /**
   * Validate multiple schemas (all must pass)
   */
  protected async validateAll<T extends Record<string, unknown>>(
    schemas: Record<keyof T, z.ZodSchema>,
    data: Record<keyof T, unknown>,
  ): Promise<T> {
    const validated: Record<string, unknown> = {};

    for (const [key, schema] of Object.entries(schemas)) {
      validated[key] = await this.validate(schema, data[key]);
    }

    return validated as T;
  }

  // ============================================================================
  // TRANSACTION MANAGEMENT
  // ============================================================================

  /**
   * Execute a callback within a database transaction
   *
   * @param callback - Async callback that receives transaction client
   * @returns Result of the callback
   */
  protected async withTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    this.logger.debug("Starting database transaction");

    try {
      const result = await this.database.$transaction(callback);

      this.logger.debug("Transaction completed successfully");

      return result;
    } catch (error) {
      this.logger.error("Transaction failed", error);
      throw error;
    }
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Get cached value or compute and cache it
   *
   * @param key - Cache key (will be prefixed)
   * @param fallback - Function to compute value if not cached
   * @param ttl - Optional TTL override
   * @returns Cached or computed value
   */
  protected async getCached<T>(
    key: string,
    fallback: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    if (!this.enableCaching) {
      return await fallback();
    }

    const cacheKey = this.buildCacheKey(key);

    // Try to get from cache
    const cached = await this.cache.get<T>(cacheKey);

    if (cached !== null) {
      this.logger.debug("Cache hit", { cacheKey });
      return cached;
    }

    this.logger.debug("Cache miss, executing fallback", { cacheKey });

    const value = await fallback();

    // Cache the computed value
    await this.cache.set(cacheKey, value, ttl ?? this.cacheTTL);

    return value;
  }

  /**
   * Set a value in the cache
   */
  protected async setCached<T>(
    key: string,
    value: T,
    ttl?: number,
  ): Promise<void> {
    if (!this.enableCaching) return;

    const cacheKey = this.buildCacheKey(key);
    await this.cache.set(cacheKey, value, ttl ?? this.cacheTTL);

    this.logger.debug("Value cached", { cacheKey });
  }

  /**
   * Delete a specific cache entry
   */
  protected async deleteCache(key: string): Promise<void> {
    if (!this.enableCaching) return;

    const cacheKey = this.buildCacheKey(key);
    await this.cache.delete(cacheKey);

    this.logger.debug("Cache entry deleted", { cacheKey });
  }

  /**
   * Invalidate cache entries matching a pattern
   *
   * @param pattern - Pattern to match (supports wildcards)
   */
  protected async invalidateCache(pattern: string = "*"): Promise<void> {
    if (!this.enableCaching) return;

    const cachePattern = this.buildCacheKey(pattern);
    await this.cache.invalidate(cachePattern);

    this.logger.debug("Cache invalidated", { cachePattern });
  }

  /**
   * Build a prefixed cache key
   */
  private buildCacheKey(key: string): string {
    return `${this.cachePrefix}:${key}`;
  }

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  /**
   * Handle errors and convert to appropriate DivineError types
   *
   * @param error - The error to handle
   * @param operation - Operation description for context
   * @returns Never (always throws)
   */
  protected handleError(error: unknown, operation: string): never {
    // Already a DivineError - re-throw
    if (error instanceof DivineError) {
      throw error;
    }

    // Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.error("Prisma error occurred", error, { code: error.code });

      switch (error.code) {
        case "P2002": // Unique constraint violation
          throw new ConflictError(
            `Resource already exists: ${error.meta?.target}`,
            { prismaCode: error.code, meta: error.meta },
          );

        case "P2025": // Record not found
          throw new NotFoundError(
            "Resource",
            error.meta?.cause as string | undefined,
          );

        default:
          throw new DivineError(
            `Database error during ${operation}`,
            ErrorCodes.DATABASE_ERROR,
            500,
            { prismaCode: error.code, meta: error.meta },
          );
      }
    }

    // Log unexpected error
    this.logger.error("Unexpected service error", error, { operation });

    // Generic service error
    throw new DivineError(
      `Failed to ${operation}`,
      ErrorCodes.SERVICE_ERROR,
      500,
      {
        originalError: error instanceof Error ? error.message : String(error),
      },
      [
        "Check the service logs for details",
        "Verify input data is correct",
        "Contact support if issue persists",
      ],
    );
  }

  /**
   * Safely execute an operation and convert errors to ServiceResponse
   */
  protected async safeExecute<T>(
    operation: string,
    callback: () => Promise<ServiceResponse<T>>,
  ): Promise<ServiceResponse<T>> {
    try {
      return await callback();
    } catch (error) {
      this.logger.error("Service operation failed", error, { operation });

      if (error instanceof DivineError) {
        return this.error(error.code, error.message, error.context);
      }

      return this.error(ErrorCodes.SERVICE_ERROR, `Failed to ${operation}`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // ============================================================================
  // TRACING HELPERS
  // ============================================================================

  /**
   * Execute an operation with tracing
   *
   * @param operationName - Name of the operation
   * @param callback - Async operation to trace
   * @returns Result of the operation
   */
  protected async traced<T>(
    operationName: string,
    callback: () => Promise<T>,
  ): Promise<T> {
    if (!this.enableTracing) {
      return await callback();
    }

    return await traceServiceOperation(
      this.serviceName,
      operationName,
      {},
      callback,
    );
  }

  /**
   * Add an event to the current span
   */
  protected addTraceEvent(
    name: string,
    attributes?: Record<string, unknown>,
  ): void {
    if (!this.enableTracing) return;
    addSpanEvent(
      name,
      attributes as Record<string, string | number | boolean> | undefined,
    );
  }

  /**
   * Set attributes on the current span
   */
  protected setTraceAttributes(attributes: Record<string, unknown>): void {
    if (!this.enableTracing) return;
    if (attributes) {
      setSpanAttributes(
        attributes as Record<string, string | number | boolean>,
      );
    }
  }

  // ============================================================================
  // AUTHORIZATION HELPERS
  // ============================================================================

  /**
   * Check if user has required permission
   * Override in subclasses for custom authorization logic
   */
  protected async checkAuthorization(
    userId: string,
    permission: string,
  ): Promise<void> {
    // Default implementation - override in subclasses
    // For now, just log the check
    this.logger.debug("Authorization check", { userId, permission });

    // In production, implement actual RBAC check:
    // const hasPermission = await rbac.check(userId, permission);
    // if (!hasPermission) {
    //   throw new AuthorizationError(`Missing permission: ${permission}`);
    // }
  }

  /**
   * Verify user owns a resource
   */
  protected async verifyOwnership(
    userId: string,
    resourceOwnerId: string,
  ): Promise<void> {
    if (userId !== resourceOwnerId) {
      throw new AuthorizationError("You don't own this resource");
    }
  }

  // ============================================================================
  // AGRICULTURAL CONSCIOUSNESS HELPERS
  // ============================================================================

  /**
   * Get agricultural metadata (if enabled)
   */
  protected getAgriculturalMetadata(): AgriculturalMetadata | undefined {
    if (!this.enableAgriculturalConsciousness) return undefined;

    // Calculate current season (Northern Hemisphere)
    const month = new Date().getMonth();
    let season: AgriculturalMetadata["season"];

    if (month >= 2 && month <= 4) season = "SPRING";
    else if (month >= 5 && month <= 7) season = "SUMMER";
    else if (month >= 8 && month <= 10) season = "FALL";
    else season = "WINTER";

    return {
      season,
      consciousness: "DIVINE",
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate a unique request ID
   */
  protected generateRequestId(): string {
    return `${this.serviceName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Measure operation duration
   */
  protected async measureDuration<T>(
    callback: () => Promise<T>,
  ): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await callback();
    const duration = Date.now() - start;

    return { result, duration };
  }

  /**
   * Sleep for specified milliseconds (useful for testing)
   */
  protected async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default BaseService;
