/**
 * OpenTelemetry Tracing Configuration
 * Divine Performance Monitoring & Distributed Tracing
 *
 * Implements comprehensive OpenTelemetry instrumentation for the
 * Farmers Market Platform with OTLP HTTP export capabilities.
 *
 * @module monitoring/telemetry
 */

import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from "@opentelemetry/semantic-conventions";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { trace, SpanStatusCode, Span, Tracer } from "@opentelemetry/api";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface TelemetryConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  otlpEndpoint: string;
  enabled: boolean;
  sampleRate: number;
}

export interface SpanAttributes {
  [key: string]: string | number | boolean | undefined;
}

export interface TraceContext {
  traceId?: string;
  spanId?: string;
  traceFlags?: number;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Get telemetry configuration from environment variables
 */
export function getTelemetryConfig(): TelemetryConfig {
  const environment = process.env.NODE_ENV || "development";

  return {
    serviceName: process.env.OTEL_SERVICE_NAME || "farmers-market-platform",
    serviceVersion: process.env.OTEL_SERVICE_VERSION || "1.0.0",
    environment,
    otlpEndpoint:
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      "http://localhost:4318/v1/traces",
    enabled: process.env.OTEL_ENABLED !== "false", // Enabled by default
    sampleRate: parseFloat(process.env.OTEL_SAMPLE_RATE || "1.0"), // 100% by default
  };
}

/**
 * Create resource with service information
 */
export function createResource(config: TelemetryConfig) {
  return resourceFromAttributes({
    [ATTR_SERVICE_NAME]: config.serviceName,
    [ATTR_SERVICE_VERSION]: config.serviceVersion,
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: config.environment,
    "service.namespace": "agricultural-platform",
    "service.instance.id": process.env.HOSTNAME || `instance-${Date.now()}`,
  });
}

// ============================================================================
// SDK Initialization
// ============================================================================

let sdkInstance: NodeSDK | null = null;
let isInitialized = false;

/**
 * Initialize OpenTelemetry SDK
 */
export function initializeTelemetry(): NodeSDK {
  if (sdkInstance) {
    logger.info("[Telemetry] SDK already initialized");
    return sdkInstance;
  }

  const config = getTelemetryConfig();

  if (!config.enabled) {
    logger.info("[Telemetry] Telemetry disabled via configuration");
    // Return minimal SDK that doesn't export
    sdkInstance = new NodeSDK({
      resource: createResource(config),
    });
    return sdkInstance;
  }

  logger.info("[Telemetry] Initializing with config", { otlpEndpoint: {
    serviceName: config.serviceName,
    environment: config.environment,
    endpoint: config.otlpEndpoint,
  } });

  try {
    // Create OTLP trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: config.otlpEndpoint,
      headers: {
        "Content-Type": "application/json",
        // Add authentication headers if needed
        ...(process.env.OTEL_EXPORTER_OTLP_HEADERS
          ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)
          : {}),
      },
      timeoutMillis: 15000, // 15 seconds
    });

    // Create span processor with batching
    const spanProcessor = new BatchSpanProcessor(traceExporter, {
      maxQueueSize: 2048,
      maxExportBatchSize: 512,
      scheduledDelayMillis: 5000, // Export every 5 seconds
      exportTimeoutMillis: 30000, // 30 seconds timeout
    });

    // Initialize SDK with auto-instrumentations
    sdkInstance = new NodeSDK({
      resource: createResource(config),
      spanProcessor,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Configure auto-instrumentations
          "@opentelemetry/instrumentation-http": {
            enabled: true,
            headersToSpanAttributes: {
              server: {
                requestHeaders: ["user-agent", "x-request-id"],
                responseHeaders: ["content-type"],
              },
            },
          },
          "@opentelemetry/instrumentation-express": {
            enabled: true,
          },
          // "@opentelemetry/instrumentation-prisma": {
          //   enabled: true,
          // },
          "@opentelemetry/instrumentation-pg": {
            enabled: true,
            enhancedDatabaseReporting: true,
          },
          "@opentelemetry/instrumentation-redis": {
            enabled: true,
          },
        }),
      ],
    });

    // Start the SDK
    sdkInstance.start();
    isInitialized = true;

    logger.info("[Telemetry] SDK initialized and started successfully");

    // Graceful shutdown handlers
    process.on("SIGTERM", async () => {
      logger.info("[Telemetry] Shutting down gracefully...");
      await shutdownTelemetry();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info("[Telemetry] Shutting down gracefully...");
      await shutdownTelemetry();
      process.exit(0);
    });
  } catch (error) {
    logger.error("[Telemetry] Failed to initialize SDK:", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  return sdkInstance;
}

/**
 * Shutdown OpenTelemetry SDK gracefully
 */
export async function shutdownTelemetry(): Promise<void> {
  if (!sdkInstance || !isInitialized) {
    logger.info("[Telemetry] SDK not initialized, { data: nothing to shutdown" });
    return;
  }

  try {
    logger.info("[Telemetry] Flushing remaining spans...");
    await sdkInstance.shutdown();
    isInitialized = false;
    logger.info("[Telemetry] SDK shutdown completed");
  } catch (error) {
    logger.error("[Telemetry] Error during shutdown:", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ============================================================================
// Tracer Access
// ============================================================================

/**
 * Get tracer for a specific component
 */
export function getTracer(name: string, version?: string): Tracer {
  return trace.getTracer(name, version);
}

/**
 * Get the active span from current context
 */
export function getActiveSpan(): Span | undefined {
  return trace.getActiveSpan();
}

// ============================================================================
// Tracing Utilities
// ============================================================================

/**
 * Create a span and execute a function within its context
 *
 * @example
 * ```typescript
 * const result = await withSpan('farmService.createFarm', async (span) => {
 *   span.setAttributes({ farmName: 'Sunshine Farm' });
 *   const farm = await database.farm.create({ ... });
 *   return farm;
 * });
 * ```
 */
export async function withSpan<T>(
  spanName: string,
  fn: (span: Span) => Promise<T>,
  attributes?: SpanAttributes,
): Promise<T> {
  const tracer = getTracer("farmers-market-platform");

  return tracer.startActiveSpan(spanName, async (span) => {
    try {
      // Set initial attributes
      if (attributes) {
        span.setAttributes(attributes);
      }

      // Execute function
      const result = await fn(span);

      // Mark span as successful
      span.setStatus({ code: SpanStatusCode.OK });

      return result;
    } catch (error) {
      // Record error in span
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    } finally {
      // Always end the span
      span.end();
    }
  });
}

/**
 * Trace a synchronous function
 */
export function traceSync<T>(
  spanName: string,
  fn: (span: Span) => T,
  attributes?: SpanAttributes,
): T {
  const tracer = getTracer("farmers-market-platform");

  return tracer.startActiveSpan(spanName, (span) => {
    try {
      if (attributes) {
        span.setAttributes(attributes);
      }

      const result = fn(span);
      span.setStatus({ code: SpanStatusCode.OK });

      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Add attributes to the current active span
 */
export function addSpanAttributes(attributes: SpanAttributes): void {
  const span = getActiveSpan();
  if (span) {
    span.setAttributes(attributes);
  }
}

/**
 * Record an event in the current active span
 */
export function recordSpanEvent(
  name: string,
  attributes?: SpanAttributes,
): void {
  const span = getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Set status for the current active span
 */
export function setSpanStatus(code: SpanStatusCode, message?: string): void {
  const span = getActiveSpan();
  if (span) {
    span.setStatus({ code, message });
  }
}

// ============================================================================
// Agricultural-Specific Tracing
// ============================================================================

/**
 * Trace a database operation with agricultural context
 */
export async function traceDatabaseOperation<T>(
  operation: string,
  entity: string,
  fn: (span: Span) => Promise<T>,
  additionalAttributes?: SpanAttributes,
): Promise<T> {
  return withSpan(`database.${operation}.${entity}`, fn, {
    "db.operation": operation,
    "db.entity": entity,
    "agricultural.context": true,
    ...additionalAttributes,
  });
}

/**
 * Trace an API route handler
 */
export async function traceApiRoute<T>(
  method: string,
  path: string,
  fn: (span: Span) => Promise<T>,
  additionalAttributes?: SpanAttributes,
): Promise<T> {
  return withSpan(`api.${method}.${path}`, fn, {
    "http.method": method,
    "http.route": path,
    "api.version": "v1",
    ...additionalAttributes,
  });
}

/**
 * Trace an AI agent invocation
 */
export async function traceAgentInvocation<T>(
  agentName: string,
  task: string,
  fn: (span: Span) => Promise<T>,
  additionalAttributes?: SpanAttributes,
): Promise<T> {
  return withSpan(`agent.${agentName}.invoke`, fn, {
    "agent.name": agentName,
    "agent.task": task,
    "ai.framework": "openai",
    ...additionalAttributes,
  });
}

/**
 * Trace a farm operation
 */
export async function traceFarmOperation<T>(
  operation: string,
  farmId: string,
  fn: (span: Span) => Promise<T>,
  additionalAttributes?: SpanAttributes,
): Promise<T> {
  return withSpan(`farm.${operation}`, fn, {
    "farm.id": farmId,
    "farm.operation": operation,
    "agricultural.domain": "farm_management",
    ...additionalAttributes,
  });
}

// ============================================================================
// Context Propagation
// ============================================================================

/**
 * Extract trace context from headers (for distributed tracing)
 */
export function extractTraceContext(
  headers: Record<string, string>,
): TraceContext {
  const traceparent = headers["traceparent"];

  if (!traceparent) {
    return {};
  }

  // Parse W3C Trace Context format: version-traceId-spanId-traceFlags
  const parts = traceparent.split("-");

  if (parts.length !== 4) {
    return {};
  }

  return {
    traceId: parts[1],
    spanId: parts[2],
    traceFlags: parts[3] ? parseInt(parts[3], 16) : 0,
  };
}

/**
 * Inject trace context into headers (for distributed tracing)
 */
export function injectTraceContext(
  headers: Record<string, string>,
): Record<string, string> {
  const span = getActiveSpan();

  if (!span) {
    return headers;
  }

  const spanContext = span.spanContext();

  if (!spanContext) {
    return headers;
  }

  // W3C Trace Context format
  const traceparent = `00-${spanContext.traceId}-${spanContext.spanId}-${spanContext.traceFlags.toString(16).padStart(2, "0")}`;

  return {
    ...headers,
    traceparent,
  };
}

// ============================================================================
// Export All
// ============================================================================

export default {
  initializeTelemetry,
  shutdownTelemetry,
  getTelemetryConfig,
  getTracer,
  getActiveSpan,
  withSpan,
  traceSync,
  addSpanAttributes,
  recordSpanEvent,
  setSpanStatus,
  traceDatabaseOperation,
  traceApiRoute,
  traceAgentInvocation,
  traceFarmOperation,
  extractTraceContext,
  injectTraceContext,
};
