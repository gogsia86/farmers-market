/**
 * ╔════════════════════════════════════════════════════════════╗
 * ║ 🌾 ANALYTICS EVENT TRACKING API - DIVINE CONSCIOUSNESS    ║
 * ╠════════════════════════════════════════════════════════════╣
 * ║ POST /api/analytics/events/track - Track search events    ║
 * ╚════════════════════════════════════════════════════════════╝
 */

import { createLogger } from "@/lib/logger";
import type { TrackSearchEventRequest } from "@/lib/services/analytics.service";
import { analyticsService } from "@/lib/services/analytics.service";
import { Season } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("analytics-events-track-api");

// ============================================
// VALIDATION SCHEMA
// ============================================

const TrackSearchEventSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().min(1, "Session ID is required"),
  query: z.string().min(1, "Search query is required").max(500),
  filters: z.record(z.string(), z.any()).optional(),
  sortBy: z.string().optional(),
  categoryId: z.string().optional(),
  farmId: z.string().optional(),
  location: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      radius: z.number().optional(),
    })
    .optional(),
  priceRange: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
    })
    .optional(),
  seasonalFilter: z.nativeEnum(Season).optional(),
  resultsCount: z.number().int().min(0),
  responseTimeMs: z.number().int().min(0),
  clickedResultIds: z.array(z.string()).optional(),
  agriculturalContext: z
    .object({
      currentSeason: z.nativeEnum(Season),
      biodynamicPhase: z.string().optional(),
      lunarCycle: z.string().optional(),
      regionalConditions: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
  cacheHit: z.boolean().optional(),
  databaseTimeMs: z.number().int().optional(),
  renderTimeMs: z.number().int().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  referrer: z.string().optional(),
  deviceId: z.string().optional(),
});

// ============================================
// API HANDLERS
// ============================================

/**
 * 🔮 POST - Track search event with quantum precision
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request
    const validation = TrackSearchEventSchema.safeParse(body);
    if (!validation.success) {
      logger.warn("Invalid search event data", {
        errors: validation.error.issues,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid search event data",
            details: validation.error.issues,
          },
        },
        { status: 400 },
      );
    }

    const eventData = validation.data as TrackSearchEventRequest;

    // Enrich with request metadata if not provided
    if (!eventData.userAgent) {
      eventData.userAgent = request.headers.get("user-agent") || undefined;
    }
    if (!eventData.ipAddress) {
      eventData.ipAddress =
        request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("x-real-ip") ||
        undefined;
    }
    if (!eventData.referrer) {
      eventData.referrer = request.headers.get("referer") || undefined;
    }

    logger.debug("Tracking search event", {
      sessionId: eventData.sessionId,
      query: eventData.query,
      resultsCount: eventData.resultsCount,
    });

    // Track event
    const searchEvent = await analyticsService.trackSearchEvent(eventData);

    logger.info("Search event tracked successfully", {
      eventId: searchEvent.id,
      sessionId: searchEvent.sessionId,
      query: searchEvent.query,
      resultsCount: searchEvent.resultsCount,
      responseTime: searchEvent.responseTime,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: searchEvent.id,
          tracked: true,
          sessionId: searchEvent.sessionId,
          query: searchEvent.query,
          resultsCount: searchEvent.resultsCount,
          responseTime: searchEvent.responseTime,
          agriculturalConsciousness: {
            currentSeason: searchEvent.currentSeason,
            lunarPhase: searchEvent.lunarPhase,
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Search event tracking failed", error as Error, {
      endpoint: "POST /api/analytics/events/track",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "EVENT_TRACKING_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to track search event",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

/**
 * ⚙️ OPTIONS - CORS preflight
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  );
}
