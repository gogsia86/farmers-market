/**
 * 🌟 Dashboard Overview API Endpoint
 * Farmers Market Platform - Monitoring Dashboard
 *
 * GET /api/monitoring/dashboard/overview
 *
 * Returns comprehensive dashboard data including:
 * - System health status
 * - Workflow execution statistics
 * - Active alerts
 * - Performance metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

// ============================================================================
// TYPES
// ============================================================================

interface DashboardOverview {
  success: boolean;
  data?: {
    systemHealth: {
      status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
      lastCheck: string;
      checks: {
        database: boolean;
        api: boolean;
        cache: boolean;
        externalServices: boolean;
      };
    };
    workflows: {
      total: number;
      today: number;
      active: number;
      success_rate: number;
    };
    alerts: {
      critical: number;
      warning: number;
      info: number;
    };
    performance: {
      avgResponseTime: number;
      avgDuration: number;
      successRate: number;
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
 * Determine overall system health status
 */
function determineHealthStatus(
  healthChecks: Array<{ healthy: boolean; checkedAt: Date }>,
): "HEALTHY" | "DEGRADED" | "UNHEALTHY" {
  if (healthChecks.length === 0) return "UNHEALTHY";

  const recentChecks = healthChecks.slice(0, 5);
  const healthyCount = recentChecks.filter((c) => c.healthy).length;
  const healthPercentage = (healthyCount / recentChecks.length) * 100;

  if (healthPercentage >= 80) return "HEALTHY";
  if (healthPercentage >= 50) return "DEGRADED";
  return "UNHEALTHY";
}

/**
 * Parse health check details from JSON
 */
function parseHealthDetails(details: any): {
  database: boolean;
  api: boolean;
  cache: boolean;
  externalServices: boolean;
} {
  try {
    const parsed = typeof details === "string" ? JSON.parse(details) : details;
    return {
      database: parsed?.database?.healthy ?? false,
      api: parsed?.api?.healthy ?? false,
      cache: parsed?.cache?.healthy ?? false,
      externalServices: parsed?.externalServices?.healthy ?? false,
    };
  } catch {
    return {
      database: false,
      api: false,
      cache: false,
      externalServices: false,
    };
  }
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function GET(): Promise<NextResponse<DashboardOverview>> {
  try {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Parallel data fetching for optimal performance
    const [
      totalExecutions,
      todayExecutions,
      activeSchedules,
      executionStats,
      recentHealthChecks,
      criticalAlerts,
      warningAlerts,
      infoAlerts,
      recentExecutions,
    ] = await Promise.all([
      // Total executions count
      database.workflowExecution.count(),

      // Today's executions
      database.workflowExecution.count({
        where: {
          startedAt: {
            gte: todayStart,
          },
        },
      }),

      // Active workflow schedules
      database.workflowSchedule.count({
        where: {
          enabled: true,
        },
      }),

      // Execution stats (last 24 hours)
      database.workflowExecution.groupBy({
        by: ["status"],
        where: {
          startedAt: {
            gte: last24Hours,
          },
        },
        _count: {
          status: true,
        },
      }),

      // Recent health checks
      database.systemHealthCheck.findMany({
        take: 10,
        orderBy: {
          checkedAt: "desc",
        },
        select: {
          status: true,
          checkedAt: true,
          responseTimeMs: true,
          details: true,
        },
      }),

      // Alert counts by status (no priority field in schema)
      database.notificationLog.count({
        where: {
          status: "FAILED",
          sentAt: {
            gte: last24Hours,
          },
        },
      }),

      database.notificationLog.count({
        where: {
          status: "ERROR",
          sentAt: {
            gte: last24Hours,
          },
        },
      }),

      database.notificationLog.count({
        where: {
          status: "SUCCESS",
          sentAt: {
            gte: last24Hours,
          },
        },
      }),

      // Recent executions for performance metrics
      database.workflowExecution.findMany({
        take: 100,
        where: {
          startedAt: {
            gte: last24Hours,
          },
          completedAt: {
            not: null,
          },
        },
        select: {
          durationMs: true,
          status: true,
        },
      }),
    ]);

    // Calculate workflow success rate
    const total24hExecutions = executionStats.reduce(
      (sum, stat) => sum + stat._count.status,
      0,
    );
    const successfulExecutions =
      executionStats.find((s) => s.status === "SUCCESS")?._count.status || 0;
    const successRate =
      total24hExecutions > 0
        ? (successfulExecutions / total24hExecutions) * 100
        : 100;

    // Calculate performance metrics
    const avgDuration =
      recentExecutions.length > 0
        ? recentExecutions.reduce((sum, e) => sum + (e.durationMs || 0), 0) /
          recentExecutions.length
        : 0;

    const avgResponseTime =
      recentHealthChecks.length > 0
        ? recentHealthChecks.reduce(
            (sum, h) => sum + (h.responseTimeMs || 0),
            0,
          ) / recentHealthChecks.length
        : 0;

    const performanceSuccessRate =
      recentExecutions.length > 0
        ? (recentExecutions.filter((e) => e.status === "SUCCESS").length /
            recentExecutions.length) *
          100
        : 100;

    // Determine system health from status field
    const healthStatus = determineHealthStatus(
      recentHealthChecks.map((hc) => ({
        ...hc,
        healthy: hc.status === "HEALTHY" || hc.status === "SUCCESS",
      })),
    );
    const latestHealthCheck = recentHealthChecks[0];
    const healthDetails = latestHealthCheck
      ? parseHealthDetails(latestHealthCheck.details)
      : {
          database: false,
          api: false,
          cache: false,
          externalServices: false,
        };

    // Build response
    const response: DashboardOverview = {
      success: true,
      data: {
        systemHealth: {
          status: healthStatus,
          lastCheck:
            latestHealthCheck?.checkedAt.toISOString() ||
            new Date().toISOString(),
          checks: healthDetails,
        },
        workflows: {
          total: totalExecutions,
          today: todayExecutions,
          active: activeSchedules,
          success_rate: parseFloat(successRate.toFixed(2)),
        },
        alerts: {
          critical: criticalAlerts,
          warning: warningAlerts,
          info: infoAlerts,
        },
        performance: {
          avgResponseTime: Math.round(avgResponseTime),
          avgDuration: Math.round(avgDuration),
          successRate: parseFloat(performanceSuccessRate.toFixed(2)),
        },
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("❌ Dashboard overview API error:", error);

    const response: DashboardOverview = {
      success: false,
      error: {
        code: "DASHBOARD_OVERVIEW_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard overview",
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
