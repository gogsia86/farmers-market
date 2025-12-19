/**
 * 🛒 FREQUENTLY BOUGHT TOGETHER API
 *
 * Get products that are frequently purchased together with a given product.
 * Uses collaborative filtering and order history analysis.
 *
 * @route /api/recommendations/frequently-bought-together
 * @version 2.0.0
 * @agricultural-consciousness MAXIMUM
 */

import { NextRequest, NextResponse } from "next/server";
import { recommendationEngine } from "@/lib/services/recommendation-engine.service";

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 GET - GET FREQUENTLY BOUGHT TOGETHER RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get products frequently bought together with the specified product
 *
 * Query Parameters:
 * - productId: string (required) - The product to find companions for
 * - limit: number (optional) - Number of recommendations (default: 5, max: 20)
 *
 * @example
 * GET /api/recommendations/frequently-bought-together?productId=prod123&limit=5
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    // Validate required parameters
    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PRODUCT_ID",
            message: "productId is required",
          },
        },
        { status: 400 },
      );
    }

    // Validate limit
    if (limit < 1 || limit > 20) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_LIMIT",
            message: "limit must be between 1 and 20",
          },
        },
        { status: 400 },
      );
    }

    // Get frequently bought together recommendations
    const recommendations =
      await recommendationEngine.getFrequentlyBoughtTogether(productId, limit);

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        data: {
          productId,
          recommendations: recommendations.recommendations,
          count: recommendations.recommendations.length,
        },
        meta: {
          processingTime: duration,
          algorithms: recommendations.algorithms,
          timestamp: recommendations.timestamp,
          requestId: crypto.randomUUID(),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300", // Cache for 5 minutes
        },
      },
    );
  } catch (error) {
    console.error("[FrequentlyBoughtTogetherAPI] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RECOMMENDATION_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to get frequently bought together recommendations",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
