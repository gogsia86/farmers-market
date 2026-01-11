/**
 * 🌟 Divine Workflow Tracer with OpenTelemetry
 * Farmers Market Platform - Distributed Tracing for Workflow Monitoring
 * Version: 2.0.0
 *
 * Integrates OpenTelemetry tracing with Azure Application Insights for
 * comprehensive observability of workflow executions.
 */

import { trace, context, SpanStatusCode, Span } from "@opentelemetry/api";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter as OTLPHttpExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPTraceExporter as OTLPGrpcExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
// @ts-ignore - Azure module may not be available in all environments
import { AzureMonitorTraceExporter } from "@azure/monitor-opentelemetry-exporter";

import { logger } from "@/lib/monitoring/logger";

import type {
  WorkflowConfig,
  WorkflowResult,
  WorkflowStepResult,
  TracingConfig,
  TraceContext,
  SpanMetrics,
} from "../types";

// ============================================================================
// WORKFLOW TRACER
// ============================================================================

export class WorkflowTracer {
  private tracer;
  private provider: NodeTracerProvider | null = null;
  private config: TracingConfig;
  private initialized = false;

  constructor(config?: Partial<TracingConfig>) {
    this.config = {
      enabled: config?.enabled ?? true,
      serviceName: config?.serviceName ?? "farmers-market-monitoring-bot",
      serviceVersion: config?.serviceVersion ?? "2.0.0",
      exporter: config?.exporter ?? "console",
      samplingRate: config?.samplingRate ?? 1.0,
      endpoint: config?.endpoint,
      connectionString: config?.connectionString,
      attributes: config?.attributes ?? {},
    };

    if (this.config.enabled) {
      this.initialize();
    }

    this.tracer = trace.getTracer(
      this.config.serviceName,
      this.config.serviceVersion,
    );
  }

  /**
   * Initialize OpenTelemetry provider and exporters
   */
  private initialize(): void {
    if (this.initialized) return;

    // Create resource with service information
    const { Resource } = require("@opentelemetry/resources");
    const resource = Resource.default().merge(
      new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: this.config.serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]:
          this.config.serviceVersion,
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
          process.env.NODE_ENV || "development",
        ...this.config.attributes,
      }),
    );

    // Initialize provider
    this.provider = new NodeTracerProvider({
      resource,
    });

    // Configure exporter based on config
    const exporter = this.createExporter();

    if (exporter) {
      // @ts-ignore - addSpanProcessor exists at runtime, type conflicts with @sentry/nextjs
      this.provider.addSpanProcessor(
        // @ts-ignore - Type conflicts between @opentelemetry versions (via @sentry/nextjs)
        new BatchSpanProcessor(exporter, {
          maxQueueSize: 2048,
          maxExportBatchSize: 512,
          scheduledDelayMillis: 5000,
        }),
      );
    }

    // Register the provider
    this.provider.register();

    this.initialized = true;

    logger.info(
      `✅ OpenTelemetry tracing initialized with ${this.config.exporter} exporter`,
    );
  }

  /**
   * Create appropriate exporter based on configuration
   */
  private createExporter() {
    switch (this.config.exporter) {
      case "console":
        return new ConsoleSpanExporter();

      case "otlp-http":
        if (!this.config.endpoint) {
          logger.warn(
            "⚠️  OTLP HTTP endpoint not configured, falling back to console",
          );
          return new ConsoleSpanExporter();
        }
        return new OTLPHttpExporter({
          url: this.config.endpoint,
        });

      case "otlp-grpc":
        if (!this.config.endpoint) {
          logger.warn(
            "⚠️  OTLP gRPC endpoint not configured, falling back to console",
          );
          return new ConsoleSpanExporter();
        }
        return new OTLPGrpcExporter({
          url: this.config.endpoint,
        });

      case "azure-monitor":
        if (!this.config.connectionString) {
          logger.warn(
            "⚠️  Azure Monitor connection string not configured, falling back to console",
          );
          return new ConsoleSpanExporter();
        }
        return new AzureMonitorTraceExporter({
          connectionString: this.config.connectionString,
        });

      default:
        return new ConsoleSpanExporter();
    }
  }

  /**
   * ✅ TRACE WORKFLOW - Wrap workflow execution with tracing
   */
  async traceWorkflow<T extends WorkflowResult>(
    workflow: WorkflowConfig,
    execute: () => Promise<T>,
  ): Promise<T> {
    if (!this.config.enabled) {
      return await execute();
    }

    return await this.tracer.startActiveSpan(
      `workflow.${workflow.id}`,
      {
        kind: 1, // SPAN_KIND_INTERNAL
        attributes: {
          "workflow.id": workflow.id,
          "workflow.name": workflow.name,
          "workflow.type": workflow.type,
          "workflow.priority": workflow.priority,
          "workflow.timeout": workflow.timeout,
          "workflow.retries": workflow.retries,
          "workflow.tags": JSON.stringify(workflow.tags),
          "agricultural.season": this.getCurrentSeason(),
          environment: process.env.NODE_ENV || "development",
        },
      },
      async (span) => {
        const startTime = Date.now();

        try {
          // Execute the workflow
          const result = await execute();

          const duration = Date.now() - startTime;

          // Add result attributes
          span.setAttributes({
            "workflow.status": result.status,
            "workflow.duration": result.duration,
            "workflow.steps.total": result.totalSteps,
            "workflow.steps.passed": result.passedSteps,
            "workflow.steps.failed": result.failedSteps,
            "workflow.steps.skipped": result.skippedSteps,
            "workflow.screenshots.count": result.screenshots.length,
            "workflow.traces.count": result.traces.length,
            "performance.score": result.metrics.performanceScore || 0,
            "performance.page_load_time": result.metrics.pageLoadTime || 0,
            "performance.api_response_time":
              result.metrics.apiResponseTime || 0,
            "metrics.errors": result.metrics.errors || 0,
            "metrics.warnings": result.metrics.warnings || 0,
          });

          // Add agricultural metrics if available
          if (result.agricultureConsciousness) {
            span.setAttributes({
              "agricultural.seasonal_relevance":
                result.agricultureConsciousness.seasonalRelevance,
              "agricultural.biodynamic_alignment":
                result.agricultureConsciousness.biodynamicAlignment,
              "agricultural.farm_health_score":
                result.agricultureConsciousness.farmHealthScore,
            });
          }

          // Record events for key milestones
          span.addEvent("workflow.started", {
            timestamp: result.startTime.getTime(),
          });

          span.addEvent("workflow.completed", {
            timestamp: result.endTime.getTime(),
            duration,
          });

          // Set span status based on result
          if (result.status === "FAILED") {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: result.error || "Workflow failed",
            });

            // Record exception if error exists
            if (result.error) {
              span.recordException(new Error(result.error));
            }

            // Add failure event
            span.addEvent("workflow.failed", {
              error: result.error || "Unknown error",
              failed_steps: result.failedSteps,
            });
          } else if (result.status === "WARNING") {
            span.setStatus({
              code: SpanStatusCode.OK,
              message: "Workflow completed with warnings",
            });

            span.addEvent("workflow.warning", {
              warnings: result.metrics.warnings || 0,
            });
          } else {
            span.setStatus({ code: SpanStatusCode.OK });
          }

          return result;
        } catch (error) {
          const duration = Date.now() - startTime;

          // Handle exceptions
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          span.recordException(error as Error);

          span.addEvent("workflow.exception", {
            error_type: error instanceof Error ? error.name : "UnknownError",
            error_message:
              error instanceof Error ? error.message : String(error),
            duration,
          });

          throw error;
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * ✅ TRACE STEP - Wrap individual workflow step with tracing
   */
  async traceStep(
    stepName: string,
    stepId: string,
    execute: () => Promise<WorkflowStepResult>,
  ): Promise<WorkflowStepResult> {
    if (!this.config.enabled) {
      return await execute();
    }

    return await this.tracer.startActiveSpan(
      `workflow.step.${stepName}`,
      {
        attributes: {
          "step.id": stepId,
          "step.name": stepName,
        },
      },
      async (span) => {
        try {
          const result = await execute();

          span.setAttributes({
            "step.success": result.success,
            "step.duration": result.duration,
            "step.logs_count": result.logs.length,
          });

          if (result.screenshot) {
            span.setAttribute("step.screenshot", true);
          }

          if (result.trace) {
            span.setAttribute("step.trace", true);
          }

          if (result.metrics) {
            Object.entries(result.metrics).forEach(([key, value]) => {
              span.setAttribute(`step.metric.${key}`, value);
            });
          }

          if (!result.success && result.error) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: result.error.message,
            });
            span.recordException(result.error);
          } else {
            span.setStatus({ code: SpanStatusCode.OK });
          }

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
      },
    );
  }

  /**
   * ✅ TRACE CUSTOM OPERATION - Trace any custom operation
   */
  async traceOperation<T>(
    operationName: string,
    attributes: Record<string, any>,
    execute: (span: Span) => Promise<T>,
  ): Promise<T> {
    if (!this.config.enabled) {
      return await execute(null as any); // Pass null span if tracing disabled
    }

    return await this.tracer.startActiveSpan(
      operationName,
      { attributes },
      async (span) => {
        try {
          const result = await execute(span);
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
      },
    );
  }

  /**
   * ✅ GET TRACE CONTEXT - Get current trace context
   */
  getTraceContext(): TraceContext | null {
    if (!this.config.enabled) return null;

    const span = trace.getSpan(context.active());
    if (!span) return null;

    const spanContext = span.spanContext();

    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      parentSpanId: undefined, // Would need to track this separately
      attributes: {},
      events: [],
      status: "UNSET",
    };
  }

  /**
   * ✅ ADD EVENT - Add event to current span
   */
  addEvent(name: string, attributes?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const span = trace.getSpan(context.active());
    if (span) {
      span.addEvent(name, attributes);
    }
  }

  /**
   * ✅ SET ATTRIBUTE - Set attribute on current span
   */
  setAttribute(key: string, value: string | number | boolean): void {
    if (!this.config.enabled) return;

    const span = trace.getSpan(context.active());
    if (span) {
      span.setAttribute(key, value);
    }
  }

  /**
   * ✅ RECORD EXCEPTION - Record exception in current span
   */
  recordException(error: Error): void {
    if (!this.config.enabled) return;

    const span = trace.getSpan(context.active());
    if (span) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
    }
  }

  /**
   * ✅ GATHER METRICS - Collect span metrics for analysis
   */
  async gatherSpanMetrics(spanId: string): Promise<SpanMetrics | null> {
    // This would typically query the trace backend
    // For now, return null as it requires backend integration
    logger.info(`📊 Gathering metrics for span: ${spanId}`);
    return null;
  }

  /**
   * ✅ SHUTDOWN - Gracefully shutdown tracer
   */
  async shutdown(): Promise<void> {
    if (this.provider) {
      await this.provider.shutdown();
      logger.info("✅ OpenTelemetry tracer shutdown complete");
    }
  }

  /**
   * ✅ FORCE FLUSH - Force flush pending spans
   */
  async flush(): Promise<void> {
    if (this.provider) {
      await this.provider.forceFlush();
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  }

  /**
   * Check if tracing is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get tracer configuration
   */
  getConfig(): TracingConfig {
    return { ...this.config };
  }

  /**
   * Update tracer configuration (requires reinitialization)
   */
  updateConfig(updates: Partial<TracingConfig>): void {
    this.config = { ...this.config, ...updates };

    if (this.config.enabled && !this.initialized) {
      this.initialize();
    }
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a workflow tracer instance
 */
export function createWorkflowTracer(
  config?: Partial<TracingConfig>,
): WorkflowTracer {
  return new WorkflowTracer(config);
}

/**
 * Create tracer from environment variables
 */
export function createTracerFromEnv(): WorkflowTracer {
  const config: Partial<TracingConfig> = {
    enabled: process.env.TRACING_ENABLED !== "false",
    serviceName:
      process.env.TRACING_SERVICE_NAME || "farmers-market-monitoring-bot",
    serviceVersion: process.env.TRACING_SERVICE_VERSION || "2.0.0",
    exporter: (process.env.TRACING_EXPORTER as any) || "console",
    endpoint: process.env.TRACING_ENDPOINT,
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    samplingRate: process.env.TRACING_SAMPLING_RATE
      ? parseFloat(process.env.TRACING_SAMPLING_RATE)
      : 1.0,
  };

  return new WorkflowTracer(config);
}

// ============================================================================
// GLOBAL TRACER INSTANCE
// ============================================================================

let globalTracer: WorkflowTracer | null = null;

/**
 * Get or create global tracer instance
 */
export function getGlobalTracer(): WorkflowTracer {
  if (!globalTracer) {
    globalTracer = createTracerFromEnv();
  }
  return globalTracer;
}

/**
 * Set global tracer instance
 */
export function setGlobalTracer(tracer: WorkflowTracer): void {
  globalTracer = tracer;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick trace wrapper for async functions
 */
export async function traced<T>(
  operationName: string,
  attributes: Record<string, any>,
  fn: () => Promise<T>,
): Promise<T> {
  const tracer = getGlobalTracer();
  return await tracer.traceOperation(operationName, attributes, async () => {
    return await fn();
  });
}

/**
 * Create a child span in current context
 */
export function createSpan(name: string, attributes?: Record<string, any>) {
  const tracer = getGlobalTracer();
  const otelTracer = trace.getTracer(
    tracer.getConfig().serviceName,
    tracer.getConfig().serviceVersion,
  );

  return otelTracer.startSpan(name, { attributes });
}
