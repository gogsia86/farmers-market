/**
 * 🔍 SERVICE LAYER TRACING UTILITY
 * Divine observability with OpenTelemetry integration
 *
 * Provides convenient tracing helpers for service layer operations with
 * agricultural consciousness and quantum performance monitoring.
 *
 * Divine Patterns Applied:
 * - Distributed tracing with OpenTelemetry
 * - Automatic span management
 * - Error recording and context preservation
 * - Agricultural metadata enrichment
 * - Zero-overhead when tracing disabled
 *
 * @reference .github/instructions/06_AUTOMATION_INFRASTRUCTURE.instructions.md
 * @reference .github/instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md
 */

import { trace, Span, SpanStatusCode, Tracer } from "@opentelemetry/api";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Span attributes for agricultural operations
 */
export interface AgriculturalSpanAttributes {
  /** Service name (e.g., "FarmService", "ProductService") */
  "service.name"?: string;
  /** Operation name (e.g., "createFarm", "listProducts") */
  "operation.name"?: string;
  /** Entity ID being operated on */
  "entity.id"?: string;
  /** Entity type (e.g., "farm", "product", "order") */
  "entity.type"?: string;
  /** User ID performing the operation */
  "user.id"?: string;
  /** Agricultural season context */
  "agricultural.season"?: string;
  /** Biodynamic consciousness level */
  "agricultural.consciousness"?: string;
  /** Cache hit/miss indicator */
  "cache.hit"?: boolean;
  /** Database query indicator */
  "db.operation"?: string;
  /** Additional custom attributes */
  [key: string]: string | number | boolean | undefined;
}

/**
 * Tracing configuration options
 */
export interface TracingOptions {
  /** Whether to record exceptions in spans */
  recordExceptions?: boolean;
  /** Whether to add agricultural metadata */
  agriculturalAwareness?: boolean;
  /** Custom attributes to add to span */
  attributes?: AgriculturalSpanAttributes;
}

// ============================================================================
// TRACER CACHE
// ============================================================================

/**
 * Cache tracers by service name to avoid recreation
 */
const tracerCache = new Map<string, Tracer>();

/**
 * Get or create a tracer for a service
 *
 * @param serviceName - Name of the service
 * @returns OpenTelemetry tracer instance
 */
function getTracer(serviceName: string): Tracer {
  if (!tracerCache.has(serviceName)) {
    tracerCache.set(serviceName, trace.getTracer(serviceName));
  }
  return tracerCache.get(serviceName)!;
}

// ============================================================================
// TRACING HELPERS
// ============================================================================

/**
 * Trace a service operation with automatic span management
 *
 * Wraps an async operation in an OpenTelemetry span, automatically handling
 * success/error states and span lifecycle. Provides the span to the callback
 * for custom attribute addition.
 *
 * @template T - Return type of the traced operation
 * @param serviceName - Name of the service (e.g., "FarmService")
 * @param operationName - Name of the operation (e.g., "createFarm")
 * @param attributes - Initial span attributes
 * @param fn - Async function to execute within span
 * @returns Result of the function
 * @throws Re-throws any errors after recording in span
 *
 * @example
 * ```typescript
 * const farm = await traceServiceOperation(
 *   "FarmService",
 *   "createFarm",
 *   {
 *     "farm.name": farmData.name,
 *     "farm.city": farmData.city,
 *     "user.id": userId
 *   },
 *   async (span) => {
 *     const result = await this.repository.create(farmData);
 *     span.setAttribute("farm.id", result.id);
 *     span.addEvent("farm_created");
 *     return result;
 *   }
 * );
 * ```
 */
export async function traceServiceOperation<T>(
  serviceName: string,
  operationName: string,
  attributes: AgriculturalSpanAttributes,
  fn: (span: Span) => Promise<T>,
): Promise<T> {
  const tracer = getTracer(serviceName);

  return await tracer.startActiveSpan(operationName, async (span: Span) => {
    try {
      // Set initial attributes
      span.setAttributes(
        attributes as Record<string, string | number | boolean>,
      );

      // Add service metadata
      span.setAttribute("service.name", serviceName);
      span.setAttribute("operation.name", operationName);

      // Execute the operation
      const result = await fn(span);

      // Mark as successful
      span.setStatus({ code: SpanStatusCode.OK });

      return result;
    } catch (error) {
      // Record the error
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });

      // Add error attributes
      if (error instanceof Error) {
        span.setAttribute("error.type", error.name);
        span.setAttribute("error.message", error.message);
        if (error.stack) {
          span.setAttribute("error.stack", error.stack);
        }
      }

      // Re-throw to maintain error flow
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Trace a database operation with automatic metadata
 *
 * Specialized tracing for database operations, adding database-specific
 * attributes and events.
 *
 * @template T - Return type of the database operation
 * @param serviceName - Name of the service
 * @param operation - Database operation (e.g., "findUnique", "create", "update")
 * @param entity - Entity type being operated on (e.g., "farm", "product")
 * @param fn - Async function to execute
 * @returns Result of the database operation
 *
 * @example
 * ```typescript
 * const farm = await traceDatabaseOperation(
 *   "FarmService",
 *   "findUnique",
 *   "farm",
 *   async (span) => {
 *     span.setAttribute("farm.id", farmId);
 *     return await database.farm.findUnique({ where: { id: farmId } });
 *   }
 * );
 * ```
 */
export async function traceDatabaseOperation<T>(
  serviceName: string,
  operation: string,
  entity: string,
  fn: (span: Span) => Promise<T>,
): Promise<T> {
  return await traceServiceOperation(
    serviceName,
    `db.${operation}`,
    {
      "db.operation": operation,
      "entity.type": entity,
      "db.system": "postgresql",
      "db.name": "farmersmarket",
    },
    fn,
  );
}

/**
 * Trace a cache operation with hit/miss tracking
 *
 * Specialized tracing for cache operations, tracking hits, misses, and
 * cache efficiency.
 *
 * @template T - Return type of the cache operation
 * @param serviceName - Name of the service
 * @param operation - Cache operation (e.g., "get", "set", "invalidate")
 * @param cacheKey - The cache key being accessed
 * @param fn - Async function to execute
 * @returns Result of the cache operation
 *
 * @example
 * ```typescript
 * const cached = await traceCacheOperation(
 *   "FarmService",
 *   "get",
 *   `farm:${farmId}`,
 *   async (span) => {
 *     const result = await cache.get(key);
 *     span.setAttribute("cache.hit", result !== null);
 *     return result;
 *   }
 * );
 * ```
 */
export async function traceCacheOperation<T>(
  serviceName: string,
  operation: string,
  cacheKey: string,
  fn: (span: Span) => Promise<T>,
): Promise<T> {
  return await traceServiceOperation(
    serviceName,
    `cache.${operation}`,
    {
      "cache.operation": operation,
      "cache.key": cacheKey,
    },
    fn,
  );
}

/**
 * Create a child span within the current context
 *
 * Useful for tracing sub-operations or nested operations within a larger
 * traced operation. The child span will be linked to its parent automatically.
 *
 * @param serviceName - Name of the service
 * @param operationName - Name of the operation
 * @param attributes - Initial span attributes
 * @returns OpenTelemetry span instance (must call span.end() when done!)
 *
 * @example
 * ```typescript
 * const validationSpan = createChildSpan(
 *   "FarmService",
 *   "validateFarmData",
 *   { "farm.name": farmData.name }
 * );
 *
 * try {
 *   await validateData(farmData);
 *   validationSpan.setStatus({ code: SpanStatusCode.OK });
 * } catch (error) {
 *   validationSpan.recordException(error);
 *   validationSpan.setStatus({ code: SpanStatusCode.ERROR });
 *   throw error;
 * } finally {
 *   validationSpan.end();
 * }
 * ```
 */
export function createChildSpan(
  serviceName: string,
  operationName: string,
  attributes?: AgriculturalSpanAttributes,
): Span {
  const tracer = getTracer(serviceName);
  const span = tracer.startSpan(operationName);

  if (attributes) {
    span.setAttributes(attributes as Record<string, string | number | boolean>);
  }

  span.setAttribute("service.name", serviceName);
  span.setAttribute("operation.name", operationName);

  return span;
}

/**
 * Add agricultural consciousness metadata to the current span
 *
 * Enriches the current span with agricultural context such as season,
 * lunar phase, and biodynamic consciousness level.
 *
 * @param season - Current agricultural season
 * @param consciousness - Consciousness level (e.g., "DIVINE", "QUANTUM", "ACTIVE")
 * @param additionalMetadata - Additional agricultural metadata
 *
 * @example
 * ```typescript
 * await traceServiceOperation("FarmService", "createFarm", {}, async (span) => {
 *   addAgriculturalContext("SPRING", "DIVINE", {
 *     lunarPhase: "WAXING",
 *     plantingWindow: "OPTIMAL"
 *   });
 *
 *   const farm = await repository.create(farmData);
 *   return farm;
 * });
 * ```
 */
export function addAgriculturalContext(
  season?: string,
  consciousness?: string,
  additionalMetadata?: Record<string, string | number | boolean>,
): void {
  const span = trace.getActiveSpan();
  if (!span) return;

  if (season) {
    span.setAttribute("agricultural.season", season);
  }

  if (consciousness) {
    span.setAttribute("agricultural.consciousness", consciousness);
  }

  if (additionalMetadata) {
    Object.entries(additionalMetadata).forEach(([key, value]) => {
      span.setAttribute(`agricultural.${key}`, value);
    });
  }

  span.addEvent("agricultural_context_added", {
    season,
    consciousness,
  });
}

/**
 * Add a custom event to the current span
 *
 * Events mark significant moments in the span timeline and can include
 * additional context attributes.
 *
 * @param eventName - Name of the event (e.g., "validation_completed", "farm_created")
 * @param attributes - Event attributes
 *
 * @example
 * ```typescript
 * addSpanEvent("slug_generated", {
 *   slug: "divine-acres-seattle",
 *   attempts: 1
 * });
 * ```
 */
export function addSpanEvent(
  eventName: string,
  attributes?: Record<string, string | number | boolean>,
): void {
  const span = trace.getActiveSpan();
  if (!span) return;

  span.addEvent(eventName, attributes);
}

/**
 * Set custom attributes on the current span
 *
 * Adds or updates attributes on the currently active span. Useful for
 * adding context discovered during operation execution.
 *
 * @param attributes - Attributes to add/update
 *
 * @example
 * ```typescript
 * setSpanAttributes({
 *   "farm.id": createdFarm.id,
 *   "farm.slug": createdFarm.slug,
 *   "cache.invalidated": true
 * });
 * ```
 */
export function setSpanAttributes(
  attributes: Record<string, string | number | boolean>,
): void {
  const span = trace.getActiveSpan();
  if (!span) return;

  span.setAttributes(attributes);
}

/**
 * Record an exception in the current span
 *
 * Records an error/exception in the span without ending it or setting
 * error status. Useful for recording handled errors.
 *
 * @param error - Error to record
 * @param handled - Whether the error was handled (default: true)
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   recordSpanException(error, true);
 *   // Handle the error gracefully
 *   return defaultValue;
 * }
 * ```
 */
export function recordSpanException(
  error: Error,
  handled: boolean = true,
): void {
  const span = trace.getActiveSpan();
  if (!span) return;

  span.recordException(error);
  span.setAttribute("error.handled", handled);

  if (!handled) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
  }
}

// ============================================================================
// PERFORMANCE MEASUREMENT HELPERS
// ============================================================================

/**
 * Measure the duration of an operation
 *
 * Simple helper to measure and record operation duration in the span.
 *
 * @param operationName - Name of the operation to measure
 * @param fn - Function to measure
 * @returns Result of the function and duration in milliseconds
 *
 * @example
 * ```typescript
 * const { result, duration } = await measureOperation("database_query", async () => {
 *   return await database.farm.findMany();
 * });
 *
 * addSpanEvent("query_completed", { duration_ms: duration });
 * ```
 */
export async function measureOperation<T>(
  operationName: string,
  fn: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    addSpanEvent(`${operationName}_completed`, {
      duration_ms: duration,
    });

    return { result, duration };
  } catch (error) {
    const duration = Date.now() - startTime;

    addSpanEvent(`${operationName}_failed`, {
      duration_ms: duration,
    });

    throw error;
  }
}

/**
 * Divine service tracing established ✨
 * OpenTelemetry integration with agricultural consciousness
 * Zero-overhead when tracing disabled
 */
