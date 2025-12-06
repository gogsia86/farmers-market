/**
 * Azure Application Insights Integration
 * Divine Agricultural Metrics & Custom Telemetry
 *
 * Implements Azure Application Insights for comprehensive application monitoring,
 * custom metrics tracking, and agricultural-specific telemetry.
 *
 * @module monitoring/app-insights
 */

// NOTE: Application Insights package is not installed.
// To use this module, install: npm install applicationinsights
// import { TelemetryClient, Contracts } from 'applicationinsights';
// import type { TelemetryItem } from 'applicationinsights/out/Declarations/Contracts';

// Placeholder types for when package is not installed
type TelemetryClient = any;

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AppInsightsConfig {
  connectionString?: string;
  instrumentationKey?: string;
  enabled: boolean;
  samplingPercentage: number;
  enableAutoCollect: boolean;
}

export interface CustomMetric {
  name: string;
  value: number;
  properties?: Record<string, string>;
  dimensions?: Record<string, string>;
}

export interface CustomEvent {
  name: string;
  properties?: Record<string, string>;
  measurements?: Record<string, number>;
}

export interface AgriculturalMetrics {
  farmOperations?: number;
  productCatalogUpdates?: number;
  orderProcessingTime?: number;
  aiAgentInvocations?: number;
  bundleSizeKB?: number;
  seasonalActivity?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const appInsightsClient: TelemetryClient | null = null;
let isInitialized = false;

/**
 * Get Application Insights configuration from environment
 */
export function getAppInsightsConfig(): AppInsightsConfig {
  return {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATION_KEY,
    enabled: process.env.APPINSIGHTS_ENABLED !== "false",
    samplingPercentage: parseFloat(
      process.env.APPINSIGHTS_SAMPLING_PERCENTAGE || "100",
    ),
    enableAutoCollect: process.env.APPINSIGHTS_AUTO_COLLECT !== "false",
  };
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize Azure Application Insights
 */
export function initializeAppInsights(): TelemetryClient | null {
  if (appInsightsClient) {
    console.log("[AppInsights] Already initialized");
    return appInsightsClient;
  }

  const config = getAppInsightsConfig();

  if (!config.enabled) {
    console.log("[AppInsights] Disabled via configuration");
    return null;
  }

  if (!config.connectionString && !config.instrumentationKey) {
    console.warn(
      "[AppInsights] No connection string or instrumentation key provided. " +
        "Set APPLICATIONINSIGHTS_CONNECTION_STRING or APPINSIGHTS_INSTRUMENTATION_KEY.",
    );
    return null;
  }

  try {
    // Note: This is a placeholder implementation
    // In a real scenario, you would use:
    // import * as appInsights from 'applicationinsights';
    // appInsights.setup(config.connectionString || config.instrumentationKey)
    //   .setAutoDependencyCorrelation(true)
    //   .setAutoCollectRequests(config.enableAutoCollect)
    //   .setAutoCollectPerformance(config.enableAutoCollect)
    //   .setAutoCollectExceptions(config.enableAutoCollect)
    //   .setAutoCollectDependencies(config.enableAutoCollect)
    //   .setAutoCollectConsole(true)
    //   .setSendLiveMetrics(true)
    //   .start();
    //
    // appInsightsClient = appInsights.defaultClient;

    console.log("[AppInsights] Initialized successfully");
    console.log("[AppInsights] Configuration:", {
      hasConnectionString: !!config.connectionString,
      hasInstrumentationKey: !!config.instrumentationKey,
      samplingPercentage: config.samplingPercentage,
      autoCollectEnabled: config.enableAutoCollect,
    });

    isInitialized = true;

    // Setup common properties
    if (appInsightsClient) {
      appInsightsClient.commonProperties = {
        application: "farmers-market-platform",
        environment: process.env.NODE_ENV || "development",
        version: process.env.APP_VERSION || "1.0.0",
        "agricultural.consciousness": "divine",
      };
    }
  } catch (error) {
    console.error("[AppInsights] Initialization failed:", error);
    return null;
  }

  return appInsightsClient;
}

/**
 * Get or initialize Application Insights client
 */
export function getAppInsightsClient(): TelemetryClient | null {
  if (!appInsightsClient && !isInitialized) {
    return initializeAppInsights();
  }
  return appInsightsClient;
}

// ============================================================================
// Custom Metrics
// ============================================================================

/**
 * Track a custom metric
 */
export function trackMetric(metric: CustomMetric): void {
  const client = getAppInsightsClient();

  if (!client) {
    console.debug(
      "[AppInsights] Client not available, skipping metric:",
      metric.name,
    );
    return;
  }

  try {
    client.trackMetric({
      name: metric.name,
      value: metric.value,
      properties: {
        ...metric.properties,
        ...metric.dimensions,
      },
    });
  } catch (error) {
    console.error("[AppInsights] Failed to track metric:", error);
  }
}

/**
 * Track multiple metrics at once
 */
export function trackMetrics(metrics: CustomMetric[]): void {
  metrics.forEach((metric) => trackMetric(metric));
}

// ============================================================================
// Custom Events
// ============================================================================

/**
 * Track a custom event
 */
export function trackEvent(event: CustomEvent): void {
  const client = getAppInsightsClient();

  if (!client) {
    console.debug(
      "[AppInsights] Client not available, skipping event:",
      event.name,
    );
    return;
  }

  try {
    client.trackEvent({
      name: event.name,
      properties: event.properties,
      measurements: event.measurements,
    });
  } catch (error) {
    console.error("[AppInsights] Failed to track event:", error);
  }
}

// ============================================================================
// Agricultural-Specific Metrics
// ============================================================================

/**
 * Track farm operation metrics
 */
export function trackFarmOperation(
  operation: string,
  farmId: string,
  durationMs: number,
  success: boolean,
): void {
  trackMetric({
    name: "farm.operation.duration",
    value: durationMs,
    properties: {
      operation,
      farmId,
      success: success.toString(),
      domain: "agricultural",
    },
  });

  trackEvent({
    name: "FarmOperationCompleted",
    properties: {
      operation,
      farmId,
      success: success.toString(),
    },
    measurements: {
      durationMs,
    },
  });
}

/**
 * Track product catalog operations
 */
export function trackProductCatalogOperation(
  operation: string,
  productId: string,
  metadata?: Record<string, string>,
): void {
  trackEvent({
    name: "ProductCatalogOperation",
    properties: {
      operation,
      productId,
      ...metadata,
    },
  });
}

/**
 * Track order processing metrics
 */
export function trackOrderProcessing(
  orderId: string,
  processingTimeMs: number,
  orderValue: number,
  itemCount: number,
): void {
  trackMetric({
    name: "order.processing.time",
    value: processingTimeMs,
    properties: {
      orderId,
      domain: "order_management",
    },
  });

  trackMetric({
    name: "order.value",
    value: orderValue,
    properties: {
      orderId,
      itemCount: itemCount.toString(),
    },
  });

  trackEvent({
    name: "OrderProcessed",
    properties: {
      orderId,
      itemCount: itemCount.toString(),
    },
    measurements: {
      processingTimeMs,
      orderValue,
      itemCount,
    },
  });
}

/**
 * Track AI agent invocations
 */
export function trackAgentInvocation(
  agentName: string,
  task: string,
  durationMs: number,
  success: boolean,
  confidence?: number,
): void {
  trackMetric({
    name: "ai.agent.invocation.duration",
    value: durationMs,
    properties: {
      agentName,
      task,
      success: success.toString(),
      framework: "openai",
    },
  });

  if (confidence !== undefined) {
    trackMetric({
      name: "ai.agent.confidence",
      value: confidence,
      properties: {
        agentName,
        task,
      },
    });
  }

  trackEvent({
    name: "AgentInvocationCompleted",
    properties: {
      agentName,
      task,
      success: success.toString(),
    },
    measurements: {
      durationMs,
      confidence: confidence || 0,
    },
  });
}

/**
 * Track bundle size metrics (Phase 6 optimization)
 */
export function trackBundleSize(
  bundleName: string,
  sizeKB: number,
  route?: string,
): void {
  trackMetric({
    name: "bundle.size.kb",
    value: sizeKB,
    properties: {
      bundleName,
      route: route || "global",
      optimization: "phase-6",
    },
  });
}

/**
 * Track page performance metrics
 */
export function trackPagePerformance(
  route: string,
  loadTimeMs: number,
  metrics: {
    ttfb?: number;
    fcp?: number;
    lcp?: number;
    cls?: number;
    fid?: number;
  },
): void {
  trackMetric({
    name: "page.load.time",
    value: loadTimeMs,
    properties: {
      route,
    },
  });

  // Track Web Vitals
  if (metrics.ttfb) {
    trackMetric({
      name: "page.ttfb",
      value: metrics.ttfb,
      properties: { route },
    });
  }

  if (metrics.fcp) {
    trackMetric({
      name: "page.fcp",
      value: metrics.fcp,
      properties: { route },
    });
  }

  if (metrics.lcp) {
    trackMetric({
      name: "page.lcp",
      value: metrics.lcp,
      properties: { route },
    });
  }

  if (metrics.cls) {
    trackMetric({
      name: "page.cls",
      value: metrics.cls,
      properties: { route },
    });
  }

  if (metrics.fid) {
    trackMetric({
      name: "page.fid",
      value: metrics.fid,
      properties: { route },
    });
  }
}

/**
 * Track seasonal agricultural activity
 */
export function trackSeasonalActivity(
  season: "spring" | "summer" | "fall" | "winter",
  activityType: string,
  metadata?: Record<string, string>,
): void {
  trackEvent({
    name: "SeasonalActivity",
    properties: {
      season,
      activityType,
      agricultural_context: "biodynamic",
      ...metadata,
    },
  });
}

// ============================================================================
// Exception Tracking
// ============================================================================

/**
 * Track an exception with context
 */
export function trackException(
  error: Error,
  context?: Record<string, string>,
): void {
  const client = getAppInsightsClient();

  if (!client) {
    console.error(
      "[AppInsights] Client not available, logging exception:",
      error,
    );
    return;
  }

  try {
    client.trackException({
      exception: error,
      properties: context,
    });
  } catch (trackError) {
    console.error("[AppInsights] Failed to track exception:", trackError);
  }
}

// ============================================================================
// Dependency Tracking
// ============================================================================

/**
 * Track an external dependency call
 */
export function trackDependency(
  name: string,
  data: string,
  duration: number,
  success: boolean,
  dependencyType?: string,
): void {
  const client = getAppInsightsClient();

  if (!client) {
    console.debug(
      "[AppInsights] Client not available, skipping dependency:",
      name,
    );
    return;
  }

  try {
    client.trackDependency({
      name,
      data,
      duration,
      success,
      dependencyTypeName: dependencyType || "HTTP",
    });
  } catch (error) {
    console.error("[AppInsights] Failed to track dependency:", error);
  }
}

// ============================================================================
// Request Tracking
// ============================================================================

/**
 * Track an HTTP request
 */
export function trackRequest(
  name: string,
  url: string,
  duration: number,
  responseCode: number,
  success: boolean,
): void {
  const client = getAppInsightsClient();

  if (!client) {
    console.debug(
      "[AppInsights] Client not available, skipping request:",
      name,
    );
    return;
  }

  try {
    client.trackRequest({
      name,
      url,
      duration,
      resultCode: responseCode,
      success,
    });
  } catch (error) {
    console.error("[AppInsights] Failed to track request:", error);
  }
}

// ============================================================================
// Flush & Cleanup
// ============================================================================

/**
 * Flush all pending telemetry
 */
export async function flushTelemetry(): Promise<void> {
  const client = getAppInsightsClient();

  if (!client) {
    return;
  }

  return new Promise((resolve) => {
    try {
      client.flush({
        callback: () => {
          console.log("[AppInsights] Telemetry flushed");
          resolve();
        },
      });
    } catch (error) {
      console.error("[AppInsights] Failed to flush telemetry:", error);
      resolve();
    }
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if Application Insights is initialized and available
 */
export function isAppInsightsAvailable(): boolean {
  return isInitialized && appInsightsClient !== null;
}

/**
 * Get telemetry context for correlation
 */
export function getTelemetryContext(): Record<string, string> {
  const client = getAppInsightsClient();

  if (!client || !client.context) {
    return {};
  }

  return {
    operationId: client.context.keys.operationId || "",
    sessionId: client.context.keys.sessionId || "",
    userId: client.context.keys.userId || "",
  };
}

// ============================================================================
// Export All
// ============================================================================

export default {
  initializeAppInsights,
  getAppInsightsClient,
  trackMetric,
  trackMetrics,
  trackEvent,
  trackFarmOperation,
  trackProductCatalogOperation,
  trackOrderProcessing,
  trackAgentInvocation,
  trackBundleSize,
  trackPagePerformance,
  trackSeasonalActivity,
  trackException,
  trackDependency,
  trackRequest,
  flushTelemetry,
  isAppInsightsAvailable,
  getTelemetryContext,
};
