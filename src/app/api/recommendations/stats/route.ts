/**
 * 📊 RECOMMENDATION SYSTEM STATS & MONITORING API
 *
 * Real-time monitoring endpoint for the recommendation system,
 * providing statistics, health checks, and performance metrics.
 *
 * @route /api/recommendations/stats
 * @version 2.0.0
 * @agricultural-consciousness MAXIMUM
 */

import { createLogger } from "@/lib/logger";
import { recommendationEvents } from "@/lib/services/recommendation-events.service";
import { recommendationWebSocket } from "@/lib/services/recommendation-websocket.service";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("recommendations-stats-api");

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 GET - GET RECOMMENDATION SYSTEM STATISTICS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get comprehensive recommendation system statistics
 *
 * Query Parameters:
 * - detailed: boolean (optional) - Include detailed breakdown
 *
 * @example
 * GET /api/recommendations/stats
 * GET /api/recommendations/stats?detailed=true
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get("detailed") === "true";

    // Get event processing statistics
    const eventStats = recommendationEvents.getStats();
    const processingStatus = recommendationEvents.getProcessingStatus();

    // Get WebSocket connection statistics
    const wsStats = recommendationWebSocket.getStats();

    // Build response
    const stats = {
      // Event processing metrics
      events: {
        total: eventStats.totalEvents,
        last24h: eventStats.eventsLast24h,
        lastHour: eventStats.eventsLastHour,
        byType: detailed ? eventStats.eventsByType : undefined,
        averageProcessingTime: `${eventStats.averageProcessingTime.toFixed(2)}ms`,
        queueSize: processingStatus.queueSize,
        isProcessing: processingStatus.isProcessing,
      },

      // Recommendation generation metrics
      recommendations: {
        totalTriggered: eventStats.recommendationsTriggers,
        successRate:
          eventStats.totalEvents > 0
            ? `${((eventStats.recommendationsTriggers / eventStats.totalEvents) * 100).toFixed(2)}%`
            : "N/A",
      },

      // WebSocket connection metrics
      websockets: {
        totalConnections: wsStats.totalConnections,
        activeConnections: wsStats.activeConnections,
        averageConnectionDuration: `${(wsStats.averageConnectionDuration / 1000).toFixed(2)}s`,
        subscriptionBreakdown: detailed
          ? wsStats.connectionsBySubscription
          : undefined,
      },

      // System health
      health: {
        status: processingStatus.queueSize < 100 ? "HEALTHY" : "DEGRADED",
        eventBacklog: processingStatus.queueSize,
        isProcessing: processingStatus.isProcessing,
        websocketServer: wsStats.activeConnections >= 0 ? "ONLINE" : "OFFLINE",
      },

      // Metadata
      meta: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        memoryUsage: {
          heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
          heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
        },
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    );
  } catch (error) {
    logger.error("Failed to retrieve recommendation statistics", error, {
      operation: "getStats",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "STATS_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to retrieve statistics",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 POST - RESET STATISTICS (ADMIN ONLY)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Reset recommendation system statistics
 *
 * Request Body:
 * {
 *   adminKey: string (required)
 *   resetType: "events" | "all" (optional, default: "events")
 * }
 *
 * @example
 * POST /api/recommendations/stats
 * {
 *   "adminKey": "admin-secret-key",
 *   "resetType": "all"
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate admin key (in production, use proper authentication)
    const adminKey = body.adminKey;
    if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid admin credentials",
          },
        },
        { status: 401 },
      );
    }

    const resetType = body.resetType || "events";

    // Reset statistics based on type
    if (resetType === "events" || resetType === "all") {
      recommendationEvents.resetStats();
    }

    if (resetType === "all") {
      recommendationEvents.clearQueue();
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message: `Statistics reset: ${resetType}`,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to reset recommendation statistics", error, {
      operation: "resetStats",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RESET_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to reset statistics",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 DELETE - CLEAR EVENT QUEUE (ADMIN ONLY)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Clear the event processing queue
 *
 * Query Parameters:
 * - adminKey: string (required)
 *
 * @example
 * DELETE /api/recommendations/stats?adminKey=admin-secret-key
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get("adminKey");

    // Validate admin key
    if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid admin credentials",
          },
        },
        { status: 401 },
      );
    }

    // Clear the event queue
    recommendationEvents.clearQueue();

    return NextResponse.json(
      {
        success: true,
        data: {
          message: "Event queue cleared successfully",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to clear recommendation event queue", error, {
      operation: "clearQueue",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CLEAR_QUEUE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to clear event queue",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
