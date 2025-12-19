/**
 * ╔════════════════════════════════════════════════════════════╗
 * ║ 🎯 ANALYTICS INTERACTION TRACKING API - DIVINE PRECISION  ║
 * ╠════════════════════════════════════════════════════════════╣
 * ║ POST /api/analytics/interactions/track - Track actions    ║
 * ╚════════════════════════════════════════════════════════════╝
 */

import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/lib/services/analytics.service";
import type { TrackInteractionRequest } from "@/lib/services/analytics.service";
import { z } from "zod";
import { InteractionType } from "@prisma/client";

// ============================================
// VALIDATION SCHEMA
// ============================================

const TrackInteractionSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().min(1, "Session ID is required"),
  type: z.nativeEnum(InteractionType, {
    errorMap: () => ({ message: "Invalid interaction type" }),
  }),
  entityType: z.string().min(1, "Entity type is required").max(50),
  entityId: z.string().min(1, "Entity ID is required"),
  searchEventId: z.string().optional(),
  recommendationId: z.string().optional(),
  abTestId: z.string().optional(),
  abTestVariant: z.string().max(50).optional(),
  metadata: z.record(z.any()).optional(),
  durationMs: z.number().int().min(0).optional(),
  scrollDepth: z.number().min(0).max(100).optional(),
  clickPosition: z.number().int().min(0).optional(),
  agriculturalContext: z.record(z.any()).optional(),
  sessionDepth: z.number().int().min(1).optional(),
  timeInSession: z.number().int().min(0).optional(),
  userAgent: z.string().optional(),
  deviceId: z.string().optional(),
});

// ============================================
// API HANDLERS
// ============================================

/**
 * 🎯 POST - Track user interaction with quantum awareness
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request
    const validation = TrackInteractionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid interaction data",
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const interactionData = validation.data as TrackInteractionRequest;

    // Enrich with request metadata if not provided
    if (!interactionData.userAgent) {
      interactionData.userAgent =
        request.headers.get("user-agent") || undefined;
    }

    // Track interaction
    const interaction = await analyticsService.trackInteraction(
      interactionData
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          id: interaction.id,
          tracked: true,
          type: interaction.type,
          entityType: interaction.entityType,
          entityId: interaction.entityId,
          sessionId: interaction.sessionId,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Interaction tracking failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERACTION_TRACKING_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to track interaction",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
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
    }
  );
}
