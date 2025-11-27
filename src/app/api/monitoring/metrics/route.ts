// src/app/api/monitoring/metrics/route.ts
/**
 * 📊 Monitoring Metrics API
 *
 * Provides real-time and historical metrics for workflow monitoring
 *
 * Endpoints:
 * - GET /api/monitoring/metrics - Get current metrics
 * - GET /api/monitoring/metrics?period=24h - Get metrics for time period
 *
 * @version 2.0.0
 * @divine-pattern API_QUANTUM_CONSCIOUSNESS
 */

import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";
import { trace, SpanStatusCode } from "@opentelemetry/api";

// ============================================================================
// Types
// ============================================================================

interface MetricsResponse {
  success: boolean;
  data?: MetricsData;
  error?: {
    code: string;
    message: string;
  };
  meta: {
    timestamp: string;
    period?: string;
    requestId?: string;
  };
}

interface MetricsData {
  summary: MetricsSummary;
  workflows: WorkflowMetrics[];
  system: SystemMetrics;
  trends: MetricsTrends;
  alerts: AlertMetrics;
}

interface MetricsSummary {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  averageDuration: number;
  totalDuration: number;
  activeWorkflows: number;
}

interface WorkflowMetrics {
  workflowName: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  lastExecution?: Date;
  lastStatus?: string;
}

interface SystemMetrics {
  healthStatus: "healthy" | "degraded" | "unhealthy";
  lastHealthCheck?: Date;
  uptime: number;
  activeAlerts: number;
  criticalAlerts: number;
}

interface MetricsTrends {
  executionTrend: "improving" | "stable" | "degrading";
  successRateTrend: "improving" | "stable" | "degrading";
  performanceTrend: "improving" | "stable" | "degrading";
  hourlyExecutions: Array<{ hour: number; count: number; successRate: number }>;
}

interface AlertMetrics {
  total: number;
  bySeverity: {
    info: number;
    warning: number;
    error: number;
    critical: number;
  };
  activeCount: number;
  recentAlerts: Array<{
    severity: string;
    message: string;
    timestamp: Date;
  }>;
}

// ============================================================================
// Helper Functions
// ============================================================================

function parsePeriod(period: string): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();

  const match = period.match(/^(\d+)([hdwm])$/);
  if (!match) {
    // Default to 24 hours
    startDate.setHours(startDate.getHours() - 24);
    return { startDate, endDate };
  }

  const [, amount, unit] = match;
  const value = parseInt(amount, 10);

  switch (unit) {
    case "h": // hours
      startDate.setHours(startDate.getHours() - value);
      break;
    case "d": // days
      startDate.setDate(startDate.getDate() - value);
      break;
    case "w": // weeks
      startDate.setDate(startDate.getDate() - value * 7);
      break;
    case "m": // months
      startDate.setMonth(startDate.getMonth() - value);
      break;
  }

  return { startDate, endDate };
}

function calculateTrend(
  current: number,
  previous: number,
): "improving" | "stable" | "degrading" {
  const changePercent = ((current - previous) / previous) * 100;

  if (Math.abs(changePercent) < 5) return "stable";
  return changePercent > 0 ? "improving" : "degrading";
}

// ============================================================================
// GET Handler
// ============================================================================

export async function GET(
  request: NextRequest,
): Promise<NextResponse<MetricsResponse>> {
  const tracer = trace.getTracer("monitoring-metrics-api");

  return await tracer.startActiveSpan(
    "GET /api/monitoring/metrics",
    async (span) => {
      const requestId = crypto.randomUUID();

      span.setAttributes({
        "http.method": "GET",
        "http.route": "/api/monitoring/metrics",
        "request.id": requestId,
      });

      try {
        // Parse query parameters
        const searchParams = request.nextUrl.searchParams;
        const period = searchParams.get("period") || "24h";

        const { startDate, endDate } = parsePeriod(period);

        span.setAttributes({
          "query.period": period,
          "query.start_date": startDate.toISOString(),
          "query.end_date": endDate.toISOString(),
        });

        // Fetch workflow executions
        const executions = await database.workflowExecution.findMany({
          where: {
            startedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: {
            startedAt: "desc",
          },
        });

        // Calculate summary metrics
        const summary: MetricsSummary = {
          totalExecutions: executions.length,
          successfulExecutions: executions.filter((e) => e.status === "success")
            .length,
          failedExecutions: executions.filter((e) => e.status === "failed")
            .length,
          successRate: 0,
          averageDuration: 0,
          totalDuration: executions.reduce(
            (sum, e) => sum + (e.durationMs || 0),
            0,
          ),
          activeWorkflows: new Set(executions.map((e) => e.workflowName)).size,
        };

        if (summary.totalExecutions > 0) {
          summary.successRate =
            (summary.successfulExecutions / summary.totalExecutions) * 100;
          summary.averageDuration =
            summary.totalDuration / summary.totalExecutions;
        }

        // Calculate per-workflow metrics
        const workflowMap = new Map<string, WorkflowMetrics>();

        executions.forEach((execution: any) => {
          const name = execution.workflowName;
          const existing = workflowMap.get(name) || {
            workflowName: name,
            executionCount: 0,
            successCount: 0,
            failureCount: 0,
            successRate: 0,
            averageDuration: 0,
            minDuration: Infinity,
            maxDuration: 0,
          };

          existing.executionCount++;
          if (execution.status === "success") {
            existing.successCount++;
          } else if (execution.status === "failed") {
            existing.failureCount++;
          }

          const duration = execution.durationMs || 0;
          existing.averageDuration =
            (existing.averageDuration * (existing.executionCount - 1) +
              duration) /
            existing.executionCount;
          existing.minDuration = Math.min(existing.minDuration, duration);
          existing.maxDuration = Math.max(existing.maxDuration, duration);

          workflowMap.set(name, existing);
        });

        // Calculate success rates for each workflow
        const workflows: WorkflowMetrics[] = Array.from(
          workflowMap.values(),
        ).map((w) => ({
          workflowName: w.workflowName,
          executionCount: w.executionCount,
          successCount: w.successCount,
          failureCount: w.failureCount,
          successRate:
            w.executionCount > 0
              ? (w.successCount / w.executionCount) * 100
              : 0,
          averageDuration: w.averageDuration,
          minDuration: w.minDuration === Infinity ? 0 : w.minDuration,
          maxDuration: w.maxDuration,
        }));

        // Fetch system health
        const latestHealthCheck = await database.systemHealthCheck.findFirst({
          orderBy: {
            checkedAt: "desc",
          },
        });

        const systemMetrics: SystemMetrics = {
          healthStatus: (latestHealthCheck?.status || "unknown") as
            | "healthy"
            | "degraded"
            | "unhealthy",
          lastHealthCheck: latestHealthCheck?.checkedAt,
          uptime: 0, // uptime not in schema
          activeAlerts: 0, // Will be populated from alerts engine
          criticalAlerts: 0,
        };

        // Calculate hourly trends
        const hourlyMap = new Map<
          number,
          { count: number; successes: number }
        >();

        executions.forEach((execution: any) => {
          const hour = new Date(execution.startedAt).getHours();
          const existing = hourlyMap.get(hour) || { count: 0, successes: 0 };
          existing.count++;
          if (execution.status === "success") {
            existing.successes++;
          }
          hourlyMap.set(hour, existing);
        });

        const hourlyExecutions = Array.from({ length: 24 }, (_, hour) => {
          const data = hourlyMap.get(hour) || { count: 0, successes: 0 };
          return {
            hour,
            count: data.count,
            successRate:
              data.count > 0 ? (data.successes / data.count) * 100 : 0,
          };
        });

        // Calculate trends (compare with previous period)
        const previousPeriodStart = new Date(startDate);
        previousPeriodStart.setTime(
          previousPeriodStart.getTime() -
            (endDate.getTime() - startDate.getTime()),
        );

        const previousExecutions = await database.workflowExecution.findMany({
          where: {
            startedAt: {
              gte: previousPeriodStart,
              lt: startDate,
            },
          },
        });

        const previousSuccessRate =
          previousExecutions.length > 0
            ? (previousExecutions.filter((e: any) => e.status === "success")
                .length /
                previousExecutions.length) *
              100
            : 0;

        const previousAvgDuration =
          previousExecutions.length > 0
            ? previousExecutions.reduce(
                (sum: any, e: any) => sum + (e.durationMs || 0),
                0,
              ) / previousExecutions.length
            : 0;

        const trends: MetricsTrends = {
          executionTrend: calculateTrend(
            executions.length,
            previousExecutions.length,
          ),
          successRateTrend: calculateTrend(
            summary.successRate,
            previousSuccessRate,
          ),
          performanceTrend:
            previousAvgDuration > 0
              ? summary.averageDuration < previousAvgDuration
                ? "improving"
                : summary.averageDuration > previousAvgDuration
                  ? "degrading"
                  : "stable"
              : "stable",
          hourlyExecutions,
        };

        // Fetch alert metrics (from notification logs)
        const recentAlerts = await database.notificationLog.findMany({
          where: {
            sentAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: {
            sentAt: "desc",
          },
          take: 10,
        });

        const alertMetrics: AlertMetrics = {
          total: recentAlerts.length,
          bySeverity: {
            info: recentAlerts.filter((a: any) => a.notificationType === "info")
              .length,
            warning: recentAlerts.filter(
              (a: any) => a.notificationType === "warning",
            ).length,
            error: recentAlerts.filter(
              (a: any) => a.notificationType === "error",
            ).length,
            critical: recentAlerts.filter(
              (a: any) => a.notificationType === "critical",
            ).length,
          },
          activeCount: recentAlerts.filter((a: any) => a.status === "PENDING")
            .length,
          recentAlerts: recentAlerts.slice(0, 5).map((a: any) => ({
            severity: a.notificationType || "info",
            message: a.message || "",
            timestamp: a.sentAt,
          })),
        };

        // Build response
        const metricsData: MetricsData = {
          summary,
          workflows,
          system: systemMetrics,
          trends,
          alerts: alertMetrics,
        };

        span.setStatus({ code: SpanStatusCode.OK });
        span.setAttributes({
          "metrics.total_executions": summary.totalExecutions,
          "metrics.success_rate": summary.successRate,
          "metrics.workflows_count": workflows.length,
        });

        return NextResponse.json<MetricsResponse>(
          {
            success: true,
            data: metricsData,
            meta: {
              timestamp: new Date().toISOString(),
              period,
              requestId,
            },
          },
          { status: 200 },
        );
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : String(error),
        });

        span.recordException(error as Error);

        console.error("Error fetching monitoring metrics:", error);

        return NextResponse.json<MetricsResponse>(
          {
            success: false,
            error: {
              code: "METRICS_FETCH_ERROR",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch metrics",
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId,
            },
          },
          { status: 500 },
        );
      } finally {
        span.end();
      }
    },
  );
}

// ============================================================================
// Export Route Config
// ============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
