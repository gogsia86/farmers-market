/**
 * DIVINE TRACING INSTRUMENTATION
 * OpenTelemetry setup with agricultural consciousness
 */

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

/**
 * Configure OTLP exporter for AI Toolkit
 */
const traceExporter = new OTLPTraceExporter({
  url:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    "http://localhost:4318/v1/traces",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Configure resource with agricultural metadata
 */
const resource = new Resource({
  [ATTR_SERVICE_NAME]: "farmers-market-divine",
  [ATTR_SERVICE_VERSION]: process.env.npm_package_version || "1.0.0",
  "agricultural.consciousness": "enabled",
  "deployment.environment": process.env.NODE_ENV || "development",
  "divine.patterns": "active",
});

/**
 * Initialize OpenTelemetry SDK with auto-instrumentation
 */
const sdk = new NodeSDK({
  resource,
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Enable comprehensive instrumentation
      "@opentelemetry/instrumentation-http": {
        enabled: true,
        ignoreIncomingRequestHook: (req) => {
          // Don't trace health checks and static assets
          const url = req.url || "";
          return (
            url.includes("/_next/static") ||
            url.includes("/api/health") ||
            url.includes("/favicon.ico")
          );
        },
      },
      "@opentelemetry/instrumentation-express": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-fs": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-dns": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-net": {
        enabled: true,
      },
    }),
  ],
});

/**
 * Start the SDK
 */
export function initializeTracing() {
  sdk.start();
  console.log("🌾 Divine Tracing initialized with agricultural consciousness");
  console.log(
    `📊 Traces sending to: ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces"}`,
  );
}

/**
 * Graceful shutdown
 */
export async function shutdownTracing() {
  try {
    await sdk.shutdown();
    console.log("🌾 Divine Tracing gracefully shut down");
  } catch (error) {
    console.error("Error shutting down tracing:", error);
  }
}

// Handle process termination
process.on("SIGTERM", async () => {
  await shutdownTracing();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await shutdownTracing();
  process.exit(0);
});
