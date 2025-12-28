/**
 * DIVINE TRACING INSTRUMENTATION
 * OpenTelemetry setup with agricultural consciousness
 *
 * Compatible with OpenTelemetry SDK 0.52.x / API 1.9.x / Resources 1.25.x
 *
 * @see https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/
 */

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

// Singleton to track initialization state
let sdk: NodeSDK | null = null;
let isInitialized = false;

/**
 * Configure OTLP exporter for trace collection
 * Supports Azure Application Insights, Jaeger, Zipkin, or any OTLP-compatible backend
 */
function createTraceExporter(): OTLPTraceExporter {
  const endpoint =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    "http://localhost:4318/v1/traces";

  return new OTLPTraceExporter({
    url: endpoint,
    headers: {
      "Content-Type": "application/json",
      // Add Azure Application Insights connection string if configured
      ...(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING && {
        "x-ms-instrumentation-key":
          process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
      }),
    },
  });
}

/**
 * Configure resource with agricultural metadata
 * This identifies our service in the tracing backend
 */
function createResource() {
  return resourceFromAttributes({
    [ATTR_SERVICE_NAME]:
      process.env.OTEL_SERVICE_NAME || "farmers-market-divine",
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version || "1.0.0",
    "deployment.environment": process.env.NODE_ENV || "development",
    // Custom agricultural consciousness attributes
    "agricultural.consciousness": "enabled",
    "divine.patterns": "active",
    "platform.type": "farmers-market",
  });
}

/**
 * Configure auto-instrumentations with sensible defaults
 */
function createInstrumentations() {
  return [
    getNodeAutoInstrumentations({
      // HTTP instrumentation
      "@opentelemetry/instrumentation-http": {
        enabled: true,
        ignoreIncomingRequestHook: (req: { url?: string }) => {
          // Don't trace health checks, static assets, and internal Next.js requests
          const url = req.url || "";
          return (
            url.includes("/_next/static") ||
            url.includes("/_next/image") ||
            url.includes("/api/health") ||
            url.includes("/favicon.ico") ||
            url.includes("/__nextjs")
          );
        },
      },
      // Express instrumentation (Next.js uses this internally)
      "@opentelemetry/instrumentation-express": {
        enabled: true,
      },
      // File system instrumentation (useful for debugging)
      "@opentelemetry/instrumentation-fs": {
        enabled: process.env.NODE_ENV === "development",
      },
      // DNS instrumentation
      "@opentelemetry/instrumentation-dns": {
        enabled: true,
      },
      // Net instrumentation
      "@opentelemetry/instrumentation-net": {
        enabled: true,
      },
      // Disable noisy instrumentations in production
      "@opentelemetry/instrumentation-pino": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-bunyan": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-winston": {
        enabled: false,
      },
    }),
  ];
}

/**
 * Initialize OpenTelemetry SDK with auto-instrumentation
 * Call this early in the application lifecycle (before any other imports if possible)
 */
export function initializeTracing(): void {
  // Prevent double initialization
  if (isInitialized) {
    console.log("🌾 Tracing already initialized, skipping...");
    return;
  }

  try {
    const traceExporter = createTraceExporter();
    const resource = createResource();
    const instrumentations = createInstrumentations();

    sdk = new NodeSDK({
      resource,
      traceExporter,
      instrumentations,
    });

    sdk.start();
    isInitialized = true;

    const endpoint =
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      "http://localhost:4318/v1/traces";
    console.log(
      "🌾 Divine Tracing initialized with agricultural consciousness",
    );
    console.log(`📊 Traces sending to: ${endpoint}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
  } catch (error) {
    console.error("❌ Failed to initialize tracing:", error);
    throw error;
  }
}

/**
 * Graceful shutdown of the tracing SDK
 * Call this when the application is shutting down
 */
export async function shutdownTracing(): Promise<void> {
  if (!sdk || !isInitialized) {
    console.log("🌾 Tracing not initialized, nothing to shut down");
    return;
  }

  try {
    await sdk.shutdown();
    isInitialized = false;
    sdk = null;
    console.log("🌾 Divine Tracing gracefully shut down");
  } catch (error) {
    console.error("❌ Error shutting down tracing:", error);
    throw error;
  }
}

/**
 * Check if tracing is currently active
 */
export function isTracingActive(): boolean {
  return isInitialized && sdk !== null;
}

// Handle process termination signals for graceful shutdown
if (typeof process !== "undefined") {
  const handleShutdown = async (signal: string) => {
    console.log(`\n📡 Received ${signal}, shutting down tracing...`);
    await shutdownTracing();
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
}
