/**
 * 📊 AZURE APPLICATION INSIGHTS - DIVINE TELEMETRY SERVICE
 *
 * Production observability with OpenTelemetry integration for:
 * - Error tracking and exception monitoring
 * - Performance metrics and tracing
 * - Rate limiting events
 * - CSP violation reporting
 * - Custom event tracking
 * - Agricultural consciousness telemetry
 *
 * Divine Patterns Applied:
 * - Singleton pattern for telemetry client
 * - Graceful degradation (no-op in development)
 * - Type-safe event tracking
 * - Performance Reality Bending (minimal overhead)
 * - Agricultural Quantum Mastery (domain-specific metrics)
 *
 * @reference .github/instructions/06_AUTOMATION_INFRASTRUCTURE.instructions.md
 * @reference .github/instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md
 * @module AzureTelemetryService
 */

import { trace, SpanStatusCode, context, Span } from "@opentelemetry/api";
import {

import { logger } from '@/lib/monitoring/logger';

  AzureMonitorOpenTelemetryOptions,
  useAzureMonitor,
} from "@azure/monitor-opentelemetry";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Telemetry event properties
 */
export interface TelemetryProperties {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Error context for exception tracking
 */
export interface ErrorContext {
  errorCode?: string;
  errorType?: string;
  statusCode?: number;
  userId?: string;
  requestId?: string;
  agricultural?: string | Record<string, any>;
  [key: string]:
    | string
    | number
    | boolean
    | undefined
    | null
    | Record<string, any>;
}

/**
 * Rate limit event data
 */
export interface RateLimitEvent {
  identifier: string;
  status: "allowed" | "blocked";
  limit: number;
  remaining: number;
  window: string;
  endpoint?: string;
}

/**
 * CSP violation event data
 */
export interface CSPViolation {
  documentUri: string;
  violatedDirective: string;
  effectiveDirective: string;
  originalPolicy: string;
  blockedUri?: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
}

/**
 * Agricultural consciousness telemetry context
 */
export interface AgriculturalTelemetryContext {
  season?: string;
  consciousness?: "DIVINE" | "QUANTUM" | "BIODYNAMIC" | "ACTIVE";
  operation?: string;
  farmId?: string;
  productId?: string;
  orderFlow?: string;
}

/**
 * Performance metric data
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: "ms" | "bytes" | "count" | "percent";
  properties?: TelemetryProperties;
}

// ============================================================================
// AZURE TELEMETRY SERVICE CLASS
// ============================================================================

/**
 * Azure Application Insights Telemetry Service
 *
 * Provides centralized telemetry tracking with OpenTelemetry integration.
 * Automatically disabled in development environment for clean console output.
 *
 * @example
 * ```typescript
 * // Track custom event
 * telemetryService.trackEvent("OrderCreated", {
 *   orderId: "123",
 *   total: 50.00,
 *   agricultural: { consciousness: "BIODYNAMIC" }
 * });
 *
 * // Track exception
 * telemetryService.trackException(error, {
 *   errorCode: "PAYMENT_FAILED",
 *   userId: "user-123"
 * });
 *
 * // Track performance metric
 * telemetryService.trackMetric({
 *   name: "CheckoutDuration",
 *   value: 1234,
 *   unit: "ms"
 * });
 * ```
 */
export class AzureTelemetryService {
  private tracer = trace.getTracer("farmers-market-platform", "1.0.0");
  private isEnabled: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Azure Application Insights
   * Only enabled in production with valid connection string
   */
  private initialize(): void {
    const connectionString = process.env.AZURE_APPINSIGHTS_CONNECTION_STRING;
    const isProduction = process.env.NODE_ENV === "production";

    if (!connectionString) {
      if (isProduction) {
        logger.warn(
          "⚠️  Azure Application Insights: Connection string not configured. Telemetry disabled.",
        );
      }
      return;
    }

    if (!isProduction) {
      logger.info(
        "ℹ️  Azure Application Insights: Disabled in development mode",
      );
      return;
    }

    try {
      // Configure Azure Monitor with OpenTelemetry
      const config: AzureMonitorOpenTelemetryOptions = {
        azureMonitorExporterOptions: {
          connectionString,
        },
        samplingRatio: 1.0, // Sample 100% in production
        enableLiveMetrics: true,
        enableStandardMetrics: true,
        enableTraceBasedSamplingForLogs: true,
      };

      useAzureMonitor(config);

      this.isEnabled = true;
      this.isInitialized = true;

      logger.info("✅ Azure Application Insights initialized successfully");
    } catch (error) {
      logger.error(
        "❌ Failed to initialize Azure Application Insights:",
        error,
      );
    }
  }

  /**
   * Track custom event
   *
   * @param name - Event name
   * @param properties - Event properties
   *
   * @example
   * ```typescript
   * telemetryService.trackEvent("FarmCreated", {
   *   farmId: "farm-123",
   *   farmName: "Green Valley Farm",
   *   agricultural: { consciousness: "BIODYNAMIC" }
   * });
   * ```
   */
  trackEvent(name: string, properties?: TelemetryProperties): void {
    if (!this.isEnabled) {
      this.logDevelopment("EVENT", name, properties);
      return;
    }

    const span = this.tracer.startSpan(name);

    if (properties) {
      Object.entries(properties).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          span.setAttribute(key, this.sanitizeValue(value));
        }
      });
    }

    span.end();
  }

  /**
   * Track exception/error
   *
   * @param error - Error object
   * @param context - Error context
   *
   * @example
   * ```typescript
   * telemetryService.trackException(error, {
   *   errorCode: "PAYMENT_FAILED",
   *   userId: "user-123",
   *   statusCode: 500
   * });
   * ```
   */
  trackException(error: Error, context?: ErrorContext): void {
    if (!this.isEnabled) {
      this.logDevelopment("EXCEPTION", error.message, {
        ...context,
        errorName: error.name,
        errorStack: error.stack,
      });
      return;
    }

    const span = this.tracer.startSpan("exception");

    // Record exception
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });

    // Add context attributes
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          span.setAttribute(key, this.sanitizeValue(value));
        }
      });
    }

    // Add error details
    span.setAttribute("error.name", error.name);
    span.setAttribute("error.message", error.message);
    if (error.stack) {
      span.setAttribute("error.stack", error.stack);
    }

    span.end();
  }

  /**
   * Track rate limit event
   *
   * @param event - Rate limit event data
   *
   * @example
   * ```typescript
   * telemetryService.trackRateLimitEvent({
   *   identifier: "user-123",
   *   status: "blocked",
   *   limit: 100,
   *   remaining: 0,
   *   window: "1h",
   *   endpoint: "/api/orders"
   * });
   * ```
   */
  trackRateLimitEvent(event: RateLimitEvent): void {
    if (!this.isEnabled) {
      this.logDevelopment("RATE_LIMIT", event.status.toUpperCase(), event);
      return;
    }

    const span = this.tracer.startSpan("RateLimitCheck");

    span.setAttribute("rateLimit.identifier", event.identifier);
    span.setAttribute("rateLimit.status", event.status);
    span.setAttribute("rateLimit.limit", event.limit);
    span.setAttribute("rateLimit.remaining", event.remaining);
    span.setAttribute("rateLimit.window", event.window);

    if (event.endpoint) {
      span.setAttribute("rateLimit.endpoint", event.endpoint);
    }

    // Set status based on result
    if (event.status === "blocked") {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: "Rate limit exceeded",
      });
    } else {
      span.setStatus({ code: SpanStatusCode.OK });
    }

    span.end();
  }

  /**
   * Track CSP violation
   *
   * @param violation - CSP violation data
   *
   * @example
   * ```typescript
   * telemetryService.trackCSPViolation({
   *   documentUri: "https://example.com",
   *   violatedDirective: "script-src",
   *   effectiveDirective: "script-src",
   *   blockedUri: "https://evil.com/script.js",
   *   originalPolicy: "..."
   * });
   * ```
   */
  trackCSPViolation(violation: CSPViolation): void {
    if (!this.isEnabled) {
      this.logDevelopment(
        "CSP_VIOLATION",
        violation.violatedDirective,
        violation,
      );
      return;
    }

    const span = this.tracer.startSpan("CSPViolation");

    span.setAttribute("csp.documentUri", violation.documentUri);
    span.setAttribute("csp.violatedDirective", violation.violatedDirective);
    span.setAttribute("csp.effectiveDirective", violation.effectiveDirective);

    if (violation.blockedUri) {
      span.setAttribute("csp.blockedUri", violation.blockedUri);
    }
    if (violation.sourceFile) {
      span.setAttribute("csp.sourceFile", violation.sourceFile);
    }
    if (violation.lineNumber) {
      span.setAttribute("csp.lineNumber", violation.lineNumber);
    }
    if (violation.columnNumber) {
      span.setAttribute("csp.columnNumber", violation.columnNumber);
    }

    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: "CSP Violation Detected",
    });

    span.end();
  }

  /**
   * Track performance metric
   *
   * @param metric - Performance metric data
   *
   * @example
   * ```typescript
   * telemetryService.trackMetric({
   *   name: "DatabaseQueryDuration",
   *   value: 123,
   *   unit: "ms",
   *   properties: { queryType: "SELECT" }
   * });
   * ```
   */
  trackMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) {
      this.logDevelopment("METRIC", metric.name, {
        value: `${metric.value}${metric.unit}`,
        ...metric.properties,
      });
      return;
    }

    const span = this.tracer.startSpan(`metric.${metric.name}`);

    span.setAttribute("metric.name", metric.name);
    span.setAttribute("metric.value", metric.value);
    span.setAttribute("metric.unit", metric.unit);

    if (metric.properties) {
      Object.entries(metric.properties).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          span.setAttribute(`metric.${key}`, this.sanitizeValue(value));
        }
      });
    }

    span.end();
  }

  /**
   * Track agricultural operation
   *
   * @param operation - Operation name
   * @param context - Agricultural context
   * @param properties - Additional properties
   *
   * @example
   * ```typescript
   * telemetryService.trackAgriculturalOperation("OrderHarvest", {
   *   consciousness: "BIODYNAMIC",
   *   farmId: "farm-123",
   *   season: "FALL"
   * });
   * ```
   */
  trackAgriculturalOperation(
    operation: string,
    context: AgriculturalTelemetryContext,
    properties?: TelemetryProperties,
  ): void {
    const eventProperties: TelemetryProperties = {
      operation,
      ...context,
      ...properties,
    };

    this.trackEvent(`Agricultural.${operation}`, eventProperties);
  }

  /**
   * Start traced operation
   * Returns a function to end the trace
   *
   * @param name - Operation name
   * @param attributes - Initial attributes
   * @returns Function to end the span
   *
   * @example
   * ```typescript
   * const endTrace = telemetryService.startTrace("ProcessPayment", {
   *   orderId: "123",
   *   amount: 50.00
   * });
   *
   * try {
   *   // ... payment processing
   *   endTrace({ status: "success" });
   * } catch (error) {
   *   endTrace({ status: "error", error: error.message });
   * }
   * ```
   */
  startTrace(
    name: string,
    attributes?: TelemetryProperties,
  ): (finalAttributes?: TelemetryProperties) => void {
    if (!this.isEnabled) {
      return () => {}; // No-op in development
    }

    const span = this.tracer.startSpan(name);

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          span.setAttribute(key, this.sanitizeValue(value));
        }
      });
    }

    return (finalAttributes?: TelemetryProperties) => {
      if (finalAttributes) {
        Object.entries(finalAttributes).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            span.setAttribute(key, this.sanitizeValue(value));
          }
        });
      }
      span.end();
    };
  }

  /**
   * Check if telemetry is enabled
   */
  get enabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Check if telemetry is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  /**
   * Sanitize value for OpenTelemetry attributes
   * Converts objects to JSON strings
   */
  private sanitizeValue(value: any): string | number | boolean {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return value;
    }

    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return "[Object]";
      }
    }

    return String(value);
  }

  /**
   * Log telemetry in development mode
   */
  private logDevelopment(
    type: string,
    name: string,
    data?: TelemetryProperties | any,
  ): void {
    if (
      process.env.NODE_ENV === "development" &&
      process.env.LOG_TELEMETRY === "true"
    ) {
      logger.info(
        `📊 [${type}] ${name}`,
        data ? JSON.stringify(data, null, 2) : "",
      );
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Singleton instance of Azure Telemetry Service
 * Automatically initialized with environment configuration
 */
export const telemetryService = new AzureTelemetryService();

/**
 * Export for testing and advanced usage
 */
export { AzureTelemetryService as TelemetryService };

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick event tracking shorthand
 */
export const trackEvent = (name: string, properties?: TelemetryProperties) =>
  telemetryService.trackEvent(name, properties);

/**
 * Quick exception tracking shorthand
 */
export const trackException = (error: Error, context?: ErrorContext) =>
  telemetryService.trackException(error, context);

/**
 * Quick metric tracking shorthand
 */
export const trackMetric = (metric: PerformanceMetric) =>
  telemetryService.trackMetric(metric);

/**
 * Quick rate limit event tracking shorthand
 */
export const trackRateLimitEvent = (event: RateLimitEvent) =>
  telemetryService.trackRateLimitEvent(event);

/**
 * Quick CSP violation tracking shorthand
 */
export const trackCSPViolation = (violation: CSPViolation) =>
  telemetryService.trackCSPViolation(violation);
