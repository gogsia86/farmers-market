/**
 * Admin Webhook Monitoring API
 * Provides health checks, metrics, and management for webhook events
 * Protected route - requires admin authentication
 */

import { auth } from "@/lib/auth";
import { webhookMonitor } from "@/lib/monitoring/webhook-monitor";
import { webhookEventService } from "@/lib/services/webhook-event.service";
import { NextRequest, NextResponse } from "next/server";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// GET /api/admin/webhooks/monitor
// Get webhook health status and metrics
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const timeWindowMinutes = parseInt(searchParams.get("timeWindow") || "60");
    const includeReport = searchParams.get("report") === "true";

    // Generate health check or full report
    if (includeReport) {
      const report = await webhookMonitor.generateReport(timeWindowMinutes);
      return NextResponse.json({
        success: true,
        data: report,
      });
    } else {
      const health = await webhookMonitor.performHealthCheck(timeWindowMinutes);
      return NextResponse.json({
        success: true,
        data: health,
      });
    }
  } catch (error) {
    logger.error("Webhook monitoring error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve webhook monitoring data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/admin/webhooks/monitor
// Perform maintenance actions (cleanup, auto-remediate, retry)
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, params } = body;

    switch (action) {
      case "cleanup":
        {
          const olderThanDays = params?.olderThanDays || 90;
          const deletedCount = await webhookEventService.cleanupOldEvents(olderThanDays);
          return NextResponse.json({
            success: true,
            data: {
              action: "cleanup",
              deletedCount,
              olderThanDays,
            },
          });
        }

      case "auto-remediate":
        {
          const result = await webhookMonitor.autoRemediate();
          return NextResponse.json({
            success: true,
            data: {
              action: "auto-remediate",
              ...result,
            },
          });
        }

      case "retry-failed":
        {
          const maxAttempts = params?.maxAttempts || 5;
          const limit = params?.limit || 50;
          const failedEvents = await webhookEventService.getFailedEvents(maxAttempts, limit);

          return NextResponse.json({
            success: true,
            data: {
              action: "retry-failed",
              eventsFound: failedEvents.length,
              events: failedEvents.map((e) => ({
                eventId: e.eventId,
                provider: e.provider,
                eventType: e.eventType,
                attempts: e.attempts,
                error: e.error,
                createdAt: e.createdAt,
              })),
            },
          });
        }

      case "retry-event":
        {
          const { eventId } = params;
          if (!eventId) {
            return NextResponse.json(
              { success: false, error: "eventId is required" },
              { status: 400 }
            );
          }

          // Note: Actual retry would need the handler function
          // This endpoint returns the event details for manual retry
          const event = await webhookEventService.getEvent(eventId);
          if (!event) {
            return NextResponse.json(
              { success: false, error: "Event not found" },
              { status: 404 }
            );
          }

          return NextResponse.json({
            success: true,
            data: {
              action: "retry-event",
              event: {
                eventId: event.eventId,
                provider: event.provider,
                eventType: event.eventType,
                payload: event.payload,
                attempts: event.attempts,
                error: event.error,
                processed: event.processed,
              },
              message: "Event details retrieved. Use webhook replay endpoint to retry.",
            },
          });
        }

      case "mark-processed":
        {
          const { eventIds } = params;
          if (!Array.isArray(eventIds) || eventIds.length === 0) {
            return NextResponse.json(
              { success: false, error: "eventIds array is required" },
              { status: 400 }
            );
          }

          const count = await webhookEventService.bulkMarkAsProcessed(eventIds);
          return NextResponse.json({
            success: true,
            data: {
              action: "mark-processed",
              markedCount: count,
            },
          });
        }

      case "delete-event":
        {
          const { eventId } = params;
          if (!eventId) {
            return NextResponse.json(
              { success: false, error: "eventId is required" },
              { status: 400 }
            );
          }

          await webhookEventService.deleteEvent(eventId);
          return NextResponse.json({
            success: true,
            data: {
              action: "delete-event",
              eventId,
            },
          });
        }

      case "find-duplicates":
        {
          const provider = params?.provider;
          const duplicates = await webhookEventService.findDuplicates(provider);
          return NextResponse.json({
            success: true,
            data: {
              action: "find-duplicates",
              duplicates,
              totalDuplicates: duplicates.length,
            },
          });
        }

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            validActions: [
              "cleanup",
              "auto-remediate",
              "retry-failed",
              "retry-event",
              "mark-processed",
              "delete-event",
              "find-duplicates",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error("Webhook maintenance action error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform maintenance action",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
