/**
 * AI AGENT TRACING & OBSERVABILITY
 * Divine Monitoring Consciousness for AI Operations
 *
 * Tracks:
 * - Agent execution spans
 * - Model performance metrics
 * - Token usage and costs
 * - Error tracking
 * - Agricultural consciousness levels
 */

// ============================================
// TYPES & INTERFACES
// ============================================

export interface TraceSpan {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "running" | "success" | "error";
  attributes: Record<string, any>;
  events: TraceEvent[];
  children: TraceSpan[];
  parent?: TraceSpan;
}

export interface TraceEvent {
  timestamp: number;
  name: string;
  attributes: Record<string, any>;
}

export interface AgentTrace {
  traceId: string;
  sessionId?: string;
  agentName: string;
  startTime: number;
  endTime?: number;
  spans: TraceSpan[];
  metadata: {
    model?: string;
    totalTokens?: number;
    totalCost?: number;
    agriculturalRelevance?: number;
  };
}

export interface PerformanceMetrics {
  latency: number;
  tokensPerSecond: number;
  costPerToken: number;
  successRate: number;
}

// ============================================
// TRACER CLASS
// ============================================

export class AITracer {
  private traces: Map<string, AgentTrace> = new Map();
  private activeSpans: Map<string, TraceSpan> = new Map();

  /**
   * Start a new trace for an AI agent operation
   */
  startTrace(agentName: string, sessionId?: string): string {
    const traceId = this.generateTraceId();

    const trace: AgentTrace = {
      traceId,
      sessionId,
      agentName,
      startTime: Date.now(),
      spans: [],
      metadata: {},
    };

    this.traces.set(traceId, trace);

    console.log(`🔍 [Trace] Started trace ${traceId} for ${agentName}`);

    return traceId;
  }

  /**
   * Start a new span within a trace
   */
  startSpan(
    traceId: string,
    spanName: string,
    attributes: Record<string, any> = {},
    parentSpanId?: string
  ): string {
    const trace = this.traces.get(traceId);
    if (!trace) {
      throw new Error(`Trace ${traceId} not found`);
    }

    const spanId = this.generateSpanId();
    const parent = parentSpanId
      ? this.activeSpans.get(parentSpanId)
      : undefined;

    const span: TraceSpan = {
      id: spanId,
      name: spanName,
      startTime: Date.now(),
      status: "running",
      attributes,
      events: [],
      children: [],
      parent,
    };

    if (parent) {
      parent.children.push(span);
    } else {
      trace.spans.push(span);
    }

    this.activeSpans.set(spanId, span);

    console.log(`  📊 [Span] Started: ${spanName} (${spanId})`);

    return spanId;
  }

  /**
   * Add an event to a span
   */
  addEvent(
    spanId: string,
    eventName: string,
    attributes: Record<string, any> = {}
  ): void {
    const span = this.activeSpans.get(spanId);
    if (!span) {
      console.warn(`Span ${spanId} not found`);
      return;
    }

    span.events.push({
      timestamp: Date.now(),
      name: eventName,
      attributes,
    });

    console.log(`    📌 [Event] ${eventName}`);
  }

  /**
   * Set attributes on a span
   */
  setAttributes(spanId: string, attributes: Record<string, any>): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    Object.assign(span.attributes, attributes);
  }

  /**
   * End a span
   */
  endSpan(
    spanId: string,
    status: "success" | "error" = "success",
    error?: Error
  ): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;

    if (error) {
      span.attributes.error = {
        message: error.message,
        stack: error.stack,
      };
    }

    this.activeSpans.delete(spanId);

    console.log(
      `  ✅ [Span] Completed: ${span.name} (${span.duration}ms) - ${status}`
    );
  }

  /**
   * End a trace
   */
  endTrace(
    traceId: string,
    metadata: Partial<AgentTrace["metadata"]> = {}
  ): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;

    trace.endTime = Date.now();
    Object.assign(trace.metadata, metadata);

    console.log(`🎯 [Trace] Completed: ${trace.traceId}`);
    console.log(`   Duration: ${trace.endTime - trace.startTime}ms`);
    console.log(`   Spans: ${this.countSpans(trace.spans)}`);
    if (metadata.totalTokens) {
      console.log(`   Tokens: ${metadata.totalTokens}`);
    }
    if (metadata.totalCost) {
      console.log(`   Cost: $${metadata.totalCost.toFixed(4)}`);
    }
  }

  /**
   * Get trace data
   */
  getTrace(traceId: string): AgentTrace | undefined {
    return this.traces.get(traceId);
  }

  /**
   * Get all traces
   */
  getAllTraces(): AgentTrace[] {
    return Array.from(this.traces.values());
  }

  /**
   * Export trace data for analysis
   */
  exportTrace(traceId: string): string {
    const trace = this.traces.get(traceId);
    if (!trace) {
      throw new Error(`Trace ${traceId} not found`);
    }

    return JSON.stringify(trace, null, 2);
  }

  /**
   * Calculate performance metrics from traces
   */
  calculateMetrics(agentName?: string): PerformanceMetrics {
    const traces = agentName
      ? Array.from(this.traces.values()).filter(
          (t) => t.agentName === agentName
        )
      : Array.from(this.traces.values());

    if (traces.length === 0) {
      return {
        latency: 0,
        tokensPerSecond: 0,
        costPerToken: 0,
        successRate: 0,
      };
    }

    const totalLatency = traces.reduce((sum, t) => {
      return sum + ((t.endTime || Date.now()) - t.startTime);
    }, 0);

    const totalTokens = traces.reduce((sum, t) => {
      return sum + (t.metadata.totalTokens || 0);
    }, 0);

    const totalCost = traces.reduce((sum, t) => {
      return sum + (t.metadata.totalCost || 0);
    }, 0);

    const successCount = traces.filter((t) => {
      const hasError = t.spans.some((span) => span.status === "error");
      return !hasError;
    }).length;

    return {
      latency: totalLatency / traces.length,
      tokensPerSecond: totalTokens / (totalLatency / 1000),
      costPerToken: totalTokens > 0 ? totalCost / totalTokens : 0,
      successRate: (successCount / traces.length) * 100,
    };
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSpanId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private countSpans(spans: TraceSpan[]): number {
    let count = spans.length;
    for (const span of spans) {
      count += this.countSpans(span.children);
    }
    return count;
  }
}

// ============================================
// TRACED AI AGENT WRAPPER
// ============================================

/**
 * Wrapper to add tracing to AI agent operations
 */
export function withTracing<T extends (...args: any[]) => Promise<any>>(
  agentName: string,
  operation: T,
  tracer: AITracer = new AITracer()
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const traceId = tracer.startTrace(agentName);
    const spanId = tracer.startSpan(traceId, `${agentName}.execute`, {
      arguments: args,
    });

    try {
      tracer.addEvent(spanId, "operation.started");

      const result = await operation(...args);

      tracer.addEvent(spanId, "operation.completed", {
        resultType: typeof result,
      });

      tracer.endSpan(spanId, "success");
      tracer.endTrace(traceId);

      return result;
    } catch (error) {
      tracer.addEvent(spanId, "operation.failed", {
        error: error instanceof Error ? error.message : String(error),
      });

      tracer.endSpan(
        spanId,
        "error",
        error instanceof Error ? error : new Error(String(error))
      );
      tracer.endTrace(traceId);

      throw error;
    }
  }) as T;
}

// ============================================
// GLOBAL TRACER INSTANCE
// ============================================

export const globalTracer = new AITracer();

/**
 * Convenience function to trace an AI operation
 */
export async function traceAIOperation<T>(
  agentName: string,
  operationName: string,
  operation: () => Promise<T>,
  attributes: Record<string, any> = {}
): Promise<T> {
  const traceId = globalTracer.startTrace(agentName);
  const spanId = globalTracer.startSpan(traceId, operationName, attributes);

  try {
    const result = await operation();
    globalTracer.endSpan(spanId, "success");
    globalTracer.endTrace(traceId);
    return result;
  } catch (error) {
    globalTracer.endSpan(
      spanId,
      "error",
      error instanceof Error ? error : new Error(String(error))
    );
    globalTracer.endTrace(traceId);
    throw error;
  }
}
