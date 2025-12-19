/**
 * 🌾 DIVINE REAL-TIME RECOMMENDATIONS API
 *
 * REST API endpoints for the recommendation engine, providing personalized
 * product suggestions, trending items, and contextual recommendations.
 *
 * @route /api/recommendations
 * @version 2.0.0
 * @agricultural-consciousness MAXIMUM
 */

import { NextRequest, NextResponse } from "next/server";
import { recommendationEngine } from "@/lib/services/recommendation-engine.service";
import { recommendationEvents } from "@/lib/services/recommendation-events.service";
import type { RecommendationRequest } from "@/lib/services/recommendation-engine.service";

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 GET - GET PERSONALIZED RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get personalized recommendations for a user
 *
 * Query Parameters:
 * - userId: string (required)
 * - productId: string (optional) - for similar products
 * - category: string (optional) - filter by category
 * - limit: number (optional) - number of recommendations (default: 10)
 * - context: string (optional) - page context (HOME, PRODUCT_DETAIL, CART, CHECKOUT, SEARCH)
 *
 * @example
 * GET /api/recommendations?userId=user123&limit=10&context=HOME
 * GET /api/recommendations?userId=user123&productId=prod456&limit=6
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId") || undefined;
    const category = searchParams.get("category") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const contextType = searchParams.get("context") || "HOME";
    const excludeIds = searchParams.get("excludeIds")?.split(",") || undefined;
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");

    // Validate required parameters
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_USER_ID",
            message: "userId is required",
          },
        },
        { status: 400 }
      );
    }

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_LIMIT",
            message: "limit must be between 1 and 100",
          },
        },
        { status: 400 }
      );
    }

    // Build recommendation request
    const recommendationRequest: RecommendationRequest = {
      userId,
      productId,
      category,
      limit,
      excludeProductIds: excludeIds,
      location:
        latitude && longitude
          ? {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            }
          : undefined,
      context: {
        pageType: contextType as any,
      },
    };

    // Generate recommendations
    const recommendations = await recommendationEngine.getRecommendations(
      recommendationRequest
    );

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        data: recommendations,
        meta: {
          processingTime: duration,
          count: recommendations.recommendations.length,
          requestId: crypto.randomUUID(),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, max-age=60", // Cache for 1 minute
        },
      }
    );
  } catch (error) {
    console.error("[RecommendationsAPI] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RECOMMENDATION_ERROR",
          message: error instanceof Error ? error.message : "Failed to generate recommendations",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 POST - TRACK USER ACTION & GET RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Track user action and optionally get recommendations
 *
 * Request Body:
 * {
 *   userId: string (required)
 *   action: UserActionType (required)
 *   entityId?: string
 *   entityType?: string
 *   metadata?: Record<string, any>
 *   getRecommendations?: boolean (default: false)
 * }
 *
 * @example
 * POST /api/recommendations
 * {
 *   "userId": "user123",
 *   "action": "VIEW_PRODUCT",
 *   "entityId": "prod456",
 *   "entityType": "PRODUCT",
 *   "getRecommendations": true
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_USER_ID",
            message: "userId is required",
          },
        },
        { status: 400 }
      );
    }

    if (!body.action) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_ACTION",
            message: "action is required",
          },
        },
        { status: 400 }
      );
    }

    // Track user action
    const eventResult = await recommendationEvents.trackUserAction({
      userId: body.userId,
      action: body.action,
      entityId: body.entityId,
      entityType: body.entityType,
      metadata: body.metadata,
      timestamp: new Date(),
      sessionId: body.sessionId,
      deviceType: body.deviceType,
      location: body.location,
    });

    // Get recommendations if requested
    let recommendations = null;
    if (body.getRecommendations) {
      recommendations = await recommendationEngine.getRecommendations({
        userId: body.userId,
        productId: body.entityId,
        limit: body.limit || 10,
        context: body.context,
      });
    }

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        data: {
          eventProcessed: eventResult.success,
          recommendations: recommendations || undefined,
        },
        meta: {
          processingTime: duration,
          requestId: crypto.randomUUID(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[RecommendationsAPI] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "TRACKING_ERROR",
          message: error instanceof Error ? error.message : "Failed to track user action",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
