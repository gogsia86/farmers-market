/**
 * 🔭 OPENTELEMETRY CONFIGURATION
 * Distributed tracing and observability setup
 */

import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_SERVICE_INSTANCE_ID,
} from "@opentelemetry/semantic-conventions";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { AzureMonitorTraceExporter } from "@azure/monitor-opentelemetry-exporter";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

let sdk: NodeSDK | null = null;

/**
 * Initialize OpenTelemetry SDK with Azure Application Insights
 */
export function initializeTelemetry(): NodeSDK | null {
  // Only initialize in production
  if (process.env.NODE_ENV !== "production") {
    console.log("🔭 Telemetry: Skipping in development mode");
    return null;
  }

  // Skip if no connection string
  if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    console.warn("⚠️ Telemetry: APPLICATIONINSIGHTS_CONNECTION_STRING not set");
    return null;
  }

  // Skip if already initialized
  if (sdk) {
    console.log("🔭 Telemetry: Already initialized");
    return sdk;
  }

  try {
    // Create Azure Monitor exporter
    const traceExporter = new AzureMonitorTraceExporter({
      connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    });

    // Create resource with service metadata
    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: "farmers-market-platform",
      [ATTR_SERVICE_VERSION]: process.env.APP_VERSION || "1.0.0",
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]:
        process.env.NODE_ENV || "production",
      [SEMRESATTRS_SERVICE_INSTANCE_ID]: process.env.HOSTNAME || "unknown",
    });

    // Initialize SDK with instrumentations
    sdk = new NodeSDK({
      resource,
      spanProcessor: new BatchSpanProcessor(traceExporter),
      instrumentations: [
        new HttpInstrumentation({
          ignoreIncomingRequestHook: (req) => {
            const url = req.url || "";
            return (
              url.includes("/api/health") ||
              url.includes("/api/ready") ||
              url.includes("/_next")
            );
          },
        }),
        getNodeAutoInstrumentations({
          "@opentelemetry/instrumentation-fs": {
            enabled: false,
          },
          "@opentelemetry/instrumentation-http": {
            enabled: true,
          },
        }),
      ],
    });

    sdk.start();
    console.log("🔭 Telemetry: OpenTelemetry initialized successfully");

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("🔭 Telemetry: Shutting down gracefully...");
      try {
        await sdk?.shutdown();
        console.log("🔭 Telemetry: Shutdown complete");
      } catch (error) {
        console.error("🔭 Telemetry: Error during shutdown:", error);
      } finally {
        process.exit(0);
      }
    });

    return sdk;
  } catch (error) {
    console.error("🔭 Telemetry: Initialization failed:", error);
    return null;
  }
}

/**
 * Get or initialize the telemetry SDK
 */
export function getTelemetrySDK(): NodeSDK | null {
  if (!sdk) {
    return initializeTelemetry();
  }
  return sdk;
}

/**
 * Shutdown telemetry SDK
 */
export async function shutdownTelemetry(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    sdk = null;
    console.log("🔭 Telemetry: Shutdown complete");
  }
}

/**
 * Check if telemetry is enabled and initialized
 */
export function isTelemetryEnabled(): boolean {
  return (
    sdk !== null &&
    process.env.NODE_ENV === "production" &&
    !!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
  );
}
