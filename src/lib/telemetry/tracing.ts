/**
 * 🎯 TRACING UTILITIES
 * Helper functions for distributed tracing in services
 */

import { trace, SpanStatusCode, Span } from "@opentelemetry/api";

const tracer = trace.getTracer("farmers-market-platform", "1.0.0");

/**
 * Create a traced function that automatically creates spans
 */
export function traced<T extends (...args: any[]) => any>(
  operationName: string,
  fn: T,
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return await tracer.startActiveSpan(operationName, async (span: Span) => {
      try {
        const result = await fn(...args);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Unknown error",
        });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  }) as T;
}

/**
 * Add attributes to the current span
 */
export function addSpanAttributes(attributes: Record<string, any>): void {
  const span = trace.getActiveSpan();
  if (span) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });
  }
}

/**
 * Add an event to the current span
 */
export function addSpanEvent(
  name: string,
  attributes?: Record<string, any>,
): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Record an error in the current span
 */
export function recordError(error: Error): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
  }
}

/**
 * Create a manual span for complex operations
 */
export async function withSpan<T>(
  operationName: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Record<string, any>,
): Promise<T> {
  return await tracer.startActiveSpan(operationName, async (span: Span) => {
    try {
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }

      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Trace a database query
 */
export async function traceQuery<T>(
  queryName: string,
  query: () => Promise<T>,
): Promise<T> {
  return await withSpan(
    `db.query.${queryName}`,
    async (span) => {
      const startTime = Date.now();
      try {
        const result = await query();
        const duration = Date.now() - startTime;
        span.setAttribute("db.duration_ms", duration);
        span.setAttribute("db.success", true);
        return result;
      } catch (error) {
        span.setAttribute("db.success", false);
        throw error;
      }
    },
    {
      "db.system": "postgresql",
      "db.operation": queryName,
    },
  );
}

/**
 * Trace an external API call
 */
export async function traceExternalCall<T>(
  serviceName: string,
  operation: string,
  call: () => Promise<T>,
): Promise<T> {
  return await withSpan(
    `external.${serviceName}.${operation}`,
    async (span) => {
      const startTime = Date.now();
      try {
        const result = await call();
        const duration = Date.now() - startTime;
        span.setAttribute("external.duration_ms", duration);
        span.setAttribute("external.success", true);
        return result;
      } catch (error) {
        span.setAttribute("external.success", false);
        throw error;
      }
    },
    {
      "external.service": serviceName,
      "external.operation": operation,
    },
  );
}
