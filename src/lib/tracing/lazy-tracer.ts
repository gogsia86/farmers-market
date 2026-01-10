/**
 * ⚡ LAZY TRACER
 * Dynamic import wrapper for OpenTelemetry to reduce server bundle size
 *
 * WHY THIS EXISTS:
 * - OpenTelemetry SDK is ~50KB and was bundled in every traced API route
 * - Tracing is optional and only needed in dev/staging environments
 * - Lazy loading defers bundling until tracing is actually enabled
 *
 * USAGE:
 * Replace: import { traceAgriculturalOperation } from '@/lib/tracing/agricultural-tracer';
 * With:    import { traceIfEnabled } from '@/lib/tracing/lazy-tracer';
 *
 * PERFORMANCE:
 * - When tracing disabled: Near-zero overhead (simple function call)
 * - When tracing enabled (first call): +10-30ms (dynamic import overhead)
 * - Subsequent calls: Same as normal (module cached)
 * - Bundle savings: ~50KB per API route
 *
 * AGRICULTURAL CONSCIOUSNESS:
 * - Maintains biodynamic tracing patterns when enabled
 * - Gracefully degrades to simple timing when disabled
 * - Preserves quantum consciousness metadata
 */

import type { AgriculturalOperation } from "./agricultural-tracer";

/**
 * Trace attributes type
 */

import { logger } from '@/lib/monitoring/logger';

export type TraceAttributes = Record<string, string | number | boolean>;

/**
 * Trace options
 */
export interface TraceOptions {
  /** Enable tracing for this operation (defaults to env check) */
  enabled?: boolean;
  /** Span name override */
  spanName?: string;
  /** Additional attributes */
  attributes?: TraceAttributes;
}

/**
 * Simple timing result (used when tracing is disabled)
 */
export interface TimingResult<T> {
  result: T;
  durationMs: number;
  timestamp: string;
}

/**
 * Check if tracing is enabled in current environment
 */
function isTracingEnabled(): boolean {
  // Disable tracing in production by default to reduce bundle size
  if (process.env.NODE_ENV === "production") {
    return process.env.ENABLE_PRODUCTION_TRACING === "true";
  }

  // Enable in development by default
  return process.env.ENABLE_TRACING !== "false";
}

/**
 * LAZY TRACE: Execute function with optional OpenTelemetry tracing
 *
 * When tracing is disabled, this function:
 * - Executes fn() directly with minimal overhead
 * - Returns simple timing information (no OpenTelemetry)
 * - Keeps bundle size small
 *
 * When tracing is enabled, this function:
 * - Dynamically imports OpenTelemetry
 * - Creates proper spans with attributes
 * - Provides full distributed tracing
 *
 * @param operation Agricultural operation type
 * @param attributes Span attributes
 * @param fn Function to trace
 * @param options Trace options
 * @returns Promise with function result
 */
export async function traceIfEnabled<T>(
  operation: AgriculturalOperation | string,
  attributes: TraceAttributes,
  fn: () => Promise<T>,
  options?: TraceOptions,
): Promise<T> {
  const enabled = options?.enabled ?? isTracingEnabled();

  // Fast path: Skip tracing entirely when disabled
  if (!enabled) {
    return fn();
  }

  // Lazy load tracing infrastructure
  try {
    const { traceAgriculturalOperation } =
      await import("./agricultural-tracer");

    return await traceAgriculturalOperation(
      operation as AgriculturalOperation,
      attributes,
      fn,
    );
  } catch (error) {
    // Fallback: If tracing fails to load, execute without tracing
    logger.warn("Failed to load tracing infrastructure, executing without tracing:", {
        error: error instanceof Error ? error.message : String(error)
      });
    return fn();
  }
}

/**
 * LAZY TRACE WITH TIMING: Like traceIfEnabled but always returns timing info
 *
 * Use this when you want performance metrics even when full tracing is disabled.
 * This adds minimal overhead (~1ms) compared to full OpenTelemetry (~10-50ms).
 *
 * @param operation Agricultural operation type
 * @param attributes Span attributes
 * @param fn Function to trace
 * @param options Trace options
 * @returns Promise with result and timing
 */
export async function traceWithTiming<T>(
  operation: AgriculturalOperation | string,
  attributes: TraceAttributes,
  fn: () => Promise<T>,
  options?: TraceOptions,
): Promise<TimingResult<T>> {
  const enabled = options?.enabled ?? isTracingEnabled();
  const startTime = performance.now();
  const timestamp = new Date().toISOString();

  if (!enabled) {
    // Execute with simple timing
    const result = await fn();
    const durationMs = performance.now() - startTime;

    return {
      result,
      durationMs,
      timestamp,
    };
  }

  // Execute with full tracing
  try {
    const { traceAgriculturalOperation } =
      await import("./agricultural-tracer");

    const result = await traceAgriculturalOperation(
      operation as AgriculturalOperation,
      attributes,
      fn,
    );

    const durationMs = performance.now() - startTime;

    return {
      result,
      durationMs,
      timestamp,
    };
  } catch (error) {
    logger.warn("Tracing failed, falling back to simple timing:", {
        error: error instanceof Error ? error.message : String(error)
      });
    const result = await fn();
    const durationMs = performance.now() - startTime;

    return {
      result,
      durationMs,
      timestamp,
    };
  }
}

/**
 * CONDITIONAL SPAN: Create a span only if tracing is enabled
 *
 * Use this for more granular control over tracing.
 * Returns a span object if tracing is enabled, otherwise returns a no-op span.
 *
 * @param spanName Name of the span
 * @param attributes Initial span attributes
 * @returns Promise with span object
 */
export async function conditionalSpan(
  spanName: string,
  attributes?: TraceAttributes,
): Promise<ConditionalSpanObject> {
  const enabled = isTracingEnabled();

  if (!enabled) {
    // Return no-op span
    return createNoOpSpan();
  }

  // Lazy load tracing and create real span
  try {
    const { trace } = await import("@opentelemetry/api");
    const tracer = trace.getTracer("lazy-tracer", "1.0.0");

    const span = tracer.startSpan(spanName);

    if (attributes) {
      span.setAttributes(attributes);
    }

    return {
      setAttributes: (attrs: TraceAttributes) => span.setAttributes(attrs),
      addEvent: (name: string, attrs?: TraceAttributes) =>
        span.addEvent(name, attrs),
      setStatus: (status: { code: number; message?: string }) =>
        span.setStatus(status),
      recordException: (error: Error) => span.recordException(error),
      end: () => span.end(),
    };
  } catch (error) {
    logger.warn("Failed to create span:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return createNoOpSpan();
  }
}

/**
 * Conditional span object interface
 */
export interface ConditionalSpanObject {
  setAttributes: (attributes: TraceAttributes) => void;
  addEvent: (name: string, attributes?: TraceAttributes) => void;
  setStatus: (status: { code: number; message?: string }) => void;
  recordException: (error: Error) => void;
  end: () => void;
}

/**
 * Create a no-op span that does nothing
 */
function createNoOpSpan(): ConditionalSpanObject {
  return {
    setAttributes: () => {},
    addEvent: () => {},
    setStatus: () => {},
    recordException: () => {},
    end: () => {},
  };
}

/**
 * DIVINE PATTERN: Batch Tracing
 * Trace multiple operations efficiently with single dynamic import
 */
export async function traceBatchOperations<T>(
  operations: Array<{
    name: string;
    operation: AgriculturalOperation | string;
    attributes: TraceAttributes;
    fn: () => Promise<T>;
  }>,
): Promise<T[]> {
  const enabled = isTracingEnabled();

  if (!enabled) {
    // Execute all operations without tracing
    return Promise.all(operations.map((op: any) => op.fn()));
  }

  // Load tracing once for all operations
  const { traceAgriculturalOperation } = await import("./agricultural-tracer");

  return Promise.all(
    operations.map((op: any) =>
      traceAgriculturalOperation(
        op.operation as AgriculturalOperation,
        op.attributes,
        op.fn,
      ),
    ),
  );
}

/**
 * AGRICULTURAL CONSCIOUSNESS: Seasonal Operation Tracing
 * Automatically adds seasonal context to traces
 */
export async function traceSeasonalOperation<T>(
  operation: AgriculturalOperation | string,
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER",
  fn: () => Promise<T>,
): Promise<T> {
  return traceIfEnabled(
    operation,
    {
      "agricultural.season": season,
      "agricultural.consciousness": "active",
    },
    fn,
  );
}

/**
 * QUANTUM PATTERN: Auto-tracing decorator
 * Returns a traced version of any async function
 */
export function withLazyTracing<TArgs extends any[], TReturn>(
  operation: AgriculturalOperation | string,
  fn: (...args: TArgs) => Promise<TReturn>,
  getAttributes?: (...args: TArgs) => TraceAttributes,
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    const attributes = getAttributes ? getAttributes(...args) : {};

    return traceIfEnabled(operation, attributes, () => fn(...args));
  };
}

/**
 * TYPE EXPORTS
 * Re-export types for convenience
 */
export type { AgriculturalOperation } from "./agricultural-tracer";

/**
 * ENVIRONMENT CHECK UTILITIES
 */
export const tracingUtils = {
  /**
   * Check if tracing is enabled
   */
  isEnabled: isTracingEnabled,

  /**
   * Force enable tracing for current request
   */
  enable: () => {
    process.env.ENABLE_TRACING = "true";
  },

  /**
   * Force disable tracing for current request
   */
  disable: () => {
    process.env.ENABLE_TRACING = "false";
  },

  /**
   * Get tracing configuration
   */
  getConfig: () => ({
    enabled: isTracingEnabled(),
    environment: process.env.NODE_ENV,
    productionTracing: process.env.ENABLE_PRODUCTION_TRACING === "true",
  }),
};
