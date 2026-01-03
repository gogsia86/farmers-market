/**
 * 🌟 Dashboard Metrics API Endpoint
 * Farmers Market Platform - Monitoring Dashboard
 *
 * GET /api/monitoring/dashboard/metrics
 *
 * Returns time-series performance metrics for charts and graphs
 *
 * Query Parameters:
 * - period: string (1h | 6h | 24h | 7d | 30d) default: 24h
 * - interval: string (1m | 5m | 15m | 1h | 1d) default: auto
 * - metric: string (responseTime | duration | throughput | successRate)
 */

import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("dashboard-metrics-api");

// ============================================================================
// TYPES
// ============================================================================

interface MetricsResponse {
  success: boolean;
  data?: {
    metrics: Array<{
      timestamp: string;
      responseTime: number | null;
      duration: number | null;
      successRate: number;
      throughput: number;
      executionCount: number;
    }>;
    summary: {
      avgResponseTime: number;
      avgDuration: number;
      avgSuccessRate: number;
      totalExecutions: number;
      peakThroughput: number;
    };
    period: {
      start: string;
      end: string;
      interval: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse query parameters
 */
function parseQueryParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const period = searchParams.get("period") || "24h";
  const interval = searchParams.get("interval") || "auto";
  const metric = searchParams.get("metric") || "all";

  return { period, interval, metric };
}

/**
 * Calculate time range based on period
 */
function getTimeRange(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "1h":
      start.setHours(start.getHours() - 1);
      break;
    case "6h":
      start.setHours(start.getHours() - 6);
      break;
    case "24h":
      start.setHours(start.getHours() - 24);
      break;
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      break;
    default:
      start.setHours(start.getHours() - 24);
  }

  return { start, end };
}

/**
 * Determine optimal interval based on period
 */
function getOptimalInterval(period: string, requestedInterval: string): string {
  if (requestedInterval !== "auto") {
    return requestedInterval;
  }

  switch (period) {
    case "1h":
      return "1m";
    case "6h":
      return "5m";
    case "24h":
      return "15m";
    case "7d":
      return "1h";
    case "30d":
      return "1d";
    default:
      return "15m";
  }
}

/**
 * Get interval duration in milliseconds
 */
function getIntervalDuration(interval: string): number {
  switch (interval) {
    case "1m":
      return 60 * 1000;
    case "5m":
      return 5 * 60 * 1000;
    case "15m":
      return 15 * 60 * 1000;
    case "1h":
      return 60 * 60 * 1000;
    case "1d":
      return 24 * 60 * 60 * 1000;
    default:
      return 15 * 60 * 1000;
  }
}

/**
 * Group executions into time buckets
 */
function groupExecutionsByInterval(
  executions: Array<{
    startedAt: Date;
    completedAt: Date | null;
    durationMs: number | null;
    status: string;
  }>,
  start: Date,
  end: Date,
  interval: string,
) {
  const intervalMs = getIntervalDuration(interval);
  const buckets = new Map<number, any>();

  // Initialize buckets
  for (let time = start.getTime(); time <= end.getTime(); time += intervalMs) {
    buckets.set(time, {
      timestamp: new Date(time),
      executions: [],
      successCount: 0,
      totalCount: 0,
    });
  }

  // Assign executions to buckets
  executions.forEach((execution) => {
    const executionTime = execution.startedAt.getTime();
    const bucketTime =
      Math.floor((executionTime - start.getTime()) / intervalMs) * intervalMs +
      start.getTime();

    if (buckets.has(bucketTime)) {
      const bucket = buckets.get(bucketTime);
      bucket.executions.push(execution);
      bucket.totalCount++;
      if (execution.status === "SUCCESS") {
        bucket.successCount++;
      }
    }
  });

  return Array.from(buckets.values());
}

/**
 * Calculate metrics for each bucket
 */
function calculateBucketMetrics(buckets: any[]) {
  return buckets.map((bucket) => {
    const executions = bucket.executions;
    const totalCount = bucket.totalCount;

    // Calculate average duration
    const avgDuration =
      executions.length > 0
        ? executions.reduce(
            (sum: number, e: any) => sum + (e.durationMs || 0),
            0,
          ) / executions.length
        : null;

    // Calculate success rate
    const successRate =
      totalCount > 0 ? (bucket.successCount / totalCount) * 100 : 100;

    // Calculate throughput (executions per minute)
    const throughput = totalCount; // Already per interval

    return {
      timestamp: bucket.timestamp.toISOString(),
      responseTime: avgDuration, // Using duration as response time proxy
      duration: avgDuration,
      successRate: parseFloat(successRate.toFixed(2)),
      throughput,
      executionCount: totalCount,
    };
  });
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function GET(
  request: NextRequest,
): Promise<NextResponse<MetricsResponse>> {
  try {
    // Parse query parameters
    const { period, interval: requestedInterval } = parseQueryParams(request);

    // Calculate time range
    const { start, end } = getTimeRange(period);
    const interval = getOptimalInterval(period, requestedInterval);

    // Fetch executions within time range
    const executions = await database.workflowExecution.findMany({
      where: {
        startedAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        startedAt: true,
        completedAt: true,
        durationMs: true,
        status: true,
      },
      orderBy: {
        startedAt: "asc",
      },
    });

    // Fetch health checks for response time
    const healthChecks = await database.systemHealthCheck.findMany({
      where: {
        checkedAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        checkedAt: true,
        responseTimeMs: true,
      },
      orderBy: {
        checkedAt: "asc",
      },
    });

    // Group executions into time buckets
    const buckets = groupExecutionsByInterval(executions, start, end, interval);

    // Calculate metrics for each bucket
    const metrics = calculateBucketMetrics(buckets);

    // Calculate summary statistics
    const totalExecutions = executions.length;
    const avgDuration =
      executions.length > 0
        ? executions.reduce((sum, e) => sum + (e.durationMs || 0), 0) /
          executions.length
        : 0;

    const avgResponseTime =
      healthChecks.length > 0
        ? healthChecks.reduce((sum, h) => sum + (h.responseTimeMs || 0), 0) /
          healthChecks.length
        : 0;

    const successfulExecutions = executions.filter(
      (e) => e.status === "SUCCESS",
    ).length;
    const avgSuccessRate =
      totalExecutions > 0
        ? (successfulExecutions / totalExecutions) * 100
        : 100;

    const peakThroughput = Math.max(...metrics.map((m) => m.throughput), 0);

    // Build response
    const response: MetricsResponse = {
      success: true,
      data: {
        metrics,
        summary: {
          avgResponseTime: Math.round(avgResponseTime),
          avgDuration: Math.round(avgDuration),
          avgSuccessRate: parseFloat(avgSuccessRate.toFixed(2)),
          totalExecutions,
          peakThroughput,
        },
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
          interval,
        },
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    logger.error("Dashboard metrics API error", error, {
      operation: "getDashboardMetrics",
    });

    const response: MetricsResponse = {
      success: false,
      error: {
        code: "DASHBOARD_METRICS_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard metrics",
      },
    };

    return NextResponse.json(response, {
      status: 500,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
}

// ============================================================================
// ROUTE CONFIG
// ============================================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;
