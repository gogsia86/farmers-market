/**
 * 🌟 Dashboard Alerts API Endpoint
 * Farmers Market Platform - Monitoring Dashboard
 *
 * GET /api/monitoring/dashboard/alerts
 *
 * Returns active alerts and notifications with priority filtering
 *
 * Query Parameters:
 * - priority: string (CRITICAL | HIGH | MEDIUM | LOW)
 * - limit: number (default: 50, max: 100)
 * - status: string (ACTIVE | ACKNOWLEDGED | RESOLVED)
 * - hours: number (look back hours, default: 24)
 */

import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("dashboard-alerts-api");

// ============================================================================
// TYPES
// ============================================================================

interface AlertResponse {
  success: boolean;
  data?: {
    alerts: Array<{
      id: string;
      channel: string;
      notificationType: string;
      message: string;
      sentAt: string;
      status: string;
      metadata: Record<string, any> | null;
      subject: string | null;
    }>;
    summary: {
      total: number;
      failed: number;
      error: number;
      success: number;
      pending: number;
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
 * Parse query parameters
 */
function parseQueryParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const priority = searchParams.get("priority") || undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const hours = parseInt(searchParams.get("hours") || "24", 10);

  return { priority, limit, hours };
}

/**
 * Build where clause for alerts query
 */
function buildWhereClause(filters: { priority?: string; hours: number }) {
  const where: any = {
    sentAt: {
      gte: new Date(Date.now() - filters.hours * 60 * 60 * 1000),
    },
  };

  // Note: NotificationLog doesn't have priority field in schema
  // We filter by status instead
  if (filters.priority) {
    // Map priority to status
    if (filters.priority === "CRITICAL" || filters.priority === "HIGH") {
      where.status = { in: ["FAILED", "ERROR"] };
    }
  }

  return where;
}

/**
 * Parse metadata from JSON string or object
 */
function parseMetadata(metadata: any): Record<string, any> | null {
  try {
    if (typeof metadata === "string") {
      return JSON.parse(metadata);
    }
    return metadata;
  } catch {
    return null;
  }
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function GET(
  request: NextRequest,
): Promise<NextResponse<AlertResponse>> {
  try {
    // Parse query parameters
    const { priority, limit, hours } = parseQueryParams(request);

    // Build where clause
    const where = buildWhereClause({ priority, hours });

    // Fetch alerts and summary stats in parallel
    const [alerts, summaryStats] = await Promise.all([
      // Fetch recent alerts
      database.notificationLog.findMany({
        where,
        take: limit,
        orderBy: {
          sentAt: "desc",
        },
        select: {
          id: true,
          channel: true,
          notificationType: true,
          message: true,
          sentAt: true,
          status: true,
          metadata: true,
          subject: true,
        },
      }),

      // Fetch summary statistics
      database.notificationLog.groupBy({
        by: ["status"],
        where: {
          sentAt: {
            gte: new Date(Date.now() - hours * 60 * 60 * 1000),
          },
        },
        _count: {
          status: true,
        },
      }),
    ]);

    // Calculate summary metrics
    const totalAlerts = summaryStats.reduce(
      (sum, stat) => sum + (stat._count?.status || 0),
      0,
    );

    const failedCount =
      summaryStats.find((s) => s.status === "FAILED")?._count?.status || 0;
    const errorCount =
      summaryStats.find((s) => s.status === "ERROR")?._count?.status || 0;
    const successCount =
      summaryStats.find((s) => s.status === "SUCCESS")?._count?.status || 0;
    const pendingCount =
      summaryStats.find((s) => s.status === "PENDING")?._count?.status || 0;

    // Calculate success rate
    const successfulAlerts = alerts.filter(
      (a) => a.status === "SUCCESS",
    ).length;
    const successRate =
      alerts.length > 0 ? (successfulAlerts / alerts.length) * 100 : 100;

    // Format alerts
    const formattedAlerts = alerts.map((alert) => ({
      id: alert.id,
      channel: alert.channel,
      notificationType: alert.notificationType,
      message: alert.message,
      sentAt: alert.sentAt.toISOString(),
      status: alert.status,
      metadata: parseMetadata(alert.metadata),
      subject: alert.subject,
    }));

    // Build response
    const response: AlertResponse = {
      success: true,
      data: {
        alerts: formattedAlerts,
        summary: {
          total: totalAlerts,
          failed: failedCount,
          error: errorCount,
          success: successCount,
          pending: pendingCount,
          successRate: parseFloat(successRate.toFixed(2)),
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
    logger.error("Dashboard alerts API error", error, {
      operation: "getDashboardAlerts",
    });

    const response: AlertResponse = {
      success: false,
      error: {
        code: "DASHBOARD_ALERTS_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard alerts",
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
