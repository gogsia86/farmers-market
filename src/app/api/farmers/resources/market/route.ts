/**
 * MARKET INTELLIGENCE API ROUTE
 * Current Trends in Organic Farming and Local Markets
 *
 * POST /api/farming/market
 * - Provides market intelligence and trend analysis
 * - Requires authentication
 * - Returns trends, insights, and opportunities with citations
 */

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import { getMarketIntelligence } from "@/lib/services/perplexity-farming.service";
import type { MarketIntelligenceRequest } from "@/types/farming-advice.types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("farming-market-api");

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const MarketIntelligenceSchema = z.object({
  region: z.string().optional(),
  topics: z.array(z.string()).optional(),
  timeframe: z.enum(["day", "week", "month", "year"]).optional(),
  includeCompetitiveAnalysis: z.boolean().optional(),
  includePriceTrends: z.boolean().optional(),
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
            message: "You must be logged in to access market intelligence",
          },
        },
        { status: 401 },
      );
    }

    // 2. Parse and Validate Request Body
    const body = await request.json();
    const validation = MarketIntelligenceSchema.safeParse(body);

    if (!validation.success) {
      logger.warn("Market intelligence request validation failed", {
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

    logger.debug("Processing market intelligence request", {
      userId: session.user.id,
      region: validatedData.region,
      timeframe: validatedData.timeframe,
    });

    // 3. Build Request
    const intelligenceRequest: MarketIntelligenceRequest = {
      region: validatedData.region,
      topics: validatedData.topics,
      timeframe: validatedData.timeframe || "month",
      includeCompetitiveAnalysis:
        validatedData.includeCompetitiveAnalysis ?? true,
      includePriceTrends: validatedData.includePriceTrends ?? true,
    };

    // 4. Get Market Intelligence
    const result = await getMarketIntelligence(intelligenceRequest);

    // 5. Return Response
    if (result.success) {
      logger.info("Market intelligence retrieved successfully", {
        userId: session.user.id,
        region: validatedData.region,
        timeframe: validatedData.timeframe,
      });

      return NextResponse.json(result, { status: 200 });
    } else {
      logger.warn("Market intelligence retrieval returned unsuccessful", {
        userId: session.user.id,
        region: validatedData.region,
      });

      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    logger.error("Market Intelligence API error", error as Error, {
      endpoint: "POST /api/farming/market",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to get market intelligence",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// GET HANDLER (Optional - for testing)
// ============================================================================

export async function GET(_request: NextRequest) {
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

  return NextResponse.json({
    success: true,
    message: "Market Intelligence API is operational",
    endpoints: {
      POST: "/api/farming/market",
      description:
        "Get market intelligence, trends, and opportunities for organic farming",
    },
    example: {
      region: "Pacific Northwest",
      topics: ["organic vegetables", "local markets", "direct sales"],
      timeframe: "month",
      includeCompetitiveAnalysis: true,
      includePriceTrends: true,
    },
  });
}
