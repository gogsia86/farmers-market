/**
 * PRODUCT RECOMMENDATIONS API ROUTE
 * Season-Aware Product Suggestions with AI Intelligence
 *
 * POST /api/farming/products/recommendations
 * - Provides season-aware product recommendations for farmers
 * - Requires authentication
 * - Returns recommendations with citations and seasonal insights
 */

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import { getProductRecommendations } from "@/lib/services/perplexity-farming.service";
import type { ProductRecommendationRequest } from "@/types/farming-advice.types";
import { getCurrentSeason } from "@/types/farming-advice.types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("farming-products-recommendations-api");

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
        { status: 401 },
      );
    }

    // 2. Parse and Validate Request Body
    const body = await request.json();
    const validation = ProductRecommendationSchema.safeParse(body);

    if (!validation.success) {
      logger.warn("Product recommendations validation failed", {
        userId: session.user.id,
        errors: validation.error.flatten(),
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validation.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const validatedData = validation.data;

    logger.debug("Processing product recommendations request", {
      userId: session.user.id,
      season: validatedData.season,
      location: validatedData.location,
      farmType: validatedData.farmType,
    });

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
      logger.info("Product recommendations fetched successfully", {
        userId: session.user.id,
        season: recommendationRequest.season,
        location: validatedData.location,
      });
      return NextResponse.json(result, { status: 200 });
    } else {
      logger.warn("Product recommendations service returned failure", {
        userId: session.user.id,
        season: recommendationRequest.season,
      });
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    logger.error("Product Recommendations API error", error as Error, {
      endpoint: "POST /api/farming/products/recommendations",
    });

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
      { status: 500 },
    );
  }
}

// ============================================================================
// GET HANDLER
// ============================================================================

export async function GET(_request: NextRequest) {
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
        { status: 401 },
      );
    }

    // Get current season recommendations
    const currentSeason = getCurrentSeason();

    logger.debug("Fetching current season product recommendations", {
      userId: session.user.id,
      season: currentSeason,
    });

    const result = await getProductRecommendations({
      season: currentSeason,
      includeReasoning: true,
    });

    if (result.success) {
      logger.info("Current season recommendations fetched successfully", {
        userId: session.user.id,
        season: currentSeason,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Product Recommendations GET error", error as Error, {
      endpoint: "GET /api/farming/products/recommendations",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get recommendations",
        },
      },
      { status: 500 },
    );
  }
}
