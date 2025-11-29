/**
 * PRODUCT RECOMMENDATIONS API ROUTE
 * Season-Aware Product Suggestions with AI Intelligence
 *
 * POST /api/farming/products/recommendations
 * - Provides season-aware product recommendations for farmers
 * - Requires authentication
 * - Returns recommendations with citations and seasonal insights
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getProductRecommendations } from "@/lib/services/perplexity-farming.service";
import type { ProductRecommendationRequest } from "@/types/farming-advice.types";
import { getCurrentSeason } from "@/types/farming-advice.types";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const ProductRecommendationSchema = z.object({
  season: z.enum(["SPRING", "SUMMER", "FALL", "WINTER"]).optional(),
  location: z.string().optional(),
  farmType: z.string().optional(),
  previousPurchases: z.array(z.string()).optional(),
  budget: z
    .object({
      min: z.number().positive().optional(),
      max: z.number().positive().optional(),
    })
    .optional(),
  includeReasoning: z.boolean().optional(),
});

// ============================================================================
// POST HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to get product recommendations",
          },
        },
        { status: 401 }
      );
    }

    // 2. Parse and Validate Request Body
    const body = await request.json();
    const validation = ProductRecommendationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // 3. Build Request
    const recommendationRequest: ProductRecommendationRequest = {
      season: validatedData.season || getCurrentSeason(),
      location: validatedData.location,
      farmType: validatedData.farmType,
      previousPurchases: validatedData.previousPurchases,
      budget: validatedData.budget,
      includeReasoning: validatedData.includeReasoning ?? true,
    };

    // 4. Get Product Recommendations
    const result = await getProductRecommendations(recommendationRequest);

    // 5. Return Response
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Product Recommendations API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to get product recommendations",
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    // Get current season recommendations
    const currentSeason = getCurrentSeason();

    const result = await getProductRecommendations({
      season: currentSeason,
      includeReasoning: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Product Recommendations GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get recommendations",
        },
      },
      { status: 500 }
    );
  }
}
