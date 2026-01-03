/**
 * FARMING ADVICE API ROUTE
 * Smart Agricultural Advice with Perplexity Integration
 *
 * POST /api/farming/advice
 * - Provides real-time agricultural research for farmers
 * - Requires authentication
 * - Returns advice with citations and metadata
 */

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import { getFarmingAdvice } from "@/lib/services/perplexity-farming.service";
import type { FarmingAdviceRequest } from "@/types/farming-advice.types";
import { getCurrentSeason } from "@/types/farming-advice.types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("farming-advice-api");

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const FarmingAdviceSchema = z.object({
  question: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .max(500),
  category: z
    .enum([
      "CROP_MANAGEMENT",
      "PEST_CONTROL",
      "SOIL_HEALTH",
      "IRRIGATION",
      "HARVESTING",
      "ORGANIC_PRACTICES",
      "MARKET_TRENDS",
      "SEASONAL_PLANNING",
      "EQUIPMENT",
      "SUSTAINABILITY",
    ])
    .optional(),
  farmLocation: z.string().optional(),
  currentSeason: z.enum(["SPRING", "SUMMER", "FALL", "WINTER"]).optional(),
  depth: z.enum(["quick", "comprehensive", "expert"]).optional(),
  includeRelatedQuestions: z.boolean().optional(),
  recencyFilter: z.enum(["day", "week", "month", "year"]).optional(),
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
            message: "You must be logged in to get farming advice",
          },
        },
        { status: 401 },
      );
    }

    // 2. Parse and Validate Request Body
    const body = await request.json();
    const validation = FarmingAdviceSchema.safeParse(body);

    if (!validation.success) {
      logger.warn("Farming advice validation failed", {
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

    logger.debug("Processing farming advice request", {
      userId: session.user.id,
      category: validatedData.category,
      depth: validatedData.depth,
    });

    // 3. Build Request
    const adviceRequest: FarmingAdviceRequest = {
      question: validatedData.question,
      category: validatedData.category,
      farmLocation: validatedData.farmLocation,
      currentSeason: validatedData.currentSeason || getCurrentSeason(),
      depth: validatedData.depth || "comprehensive",
      includeRelatedQuestions: validatedData.includeRelatedQuestions ?? true,
      recencyFilter: validatedData.recencyFilter || "month",
      userId: session.user.id,
    };

    // 4. Get Farming Advice
    const result = await getFarmingAdvice(adviceRequest);

    // 5. Return Response
    if (result.success) {
      logger.info("Farming advice provided successfully", {
        userId: session.user.id,
        category: validatedData.category,
      });
      return NextResponse.json(result, { status: 200 });
    } else {
      logger.warn("Farming advice service returned failure", {
        userId: session.user.id,
        category: validatedData.category,
      });
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    logger.error("Farming Advice API error", error as Error, {
      endpoint: "POST /api/farming/advice",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to get farming advice",
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
    message: "Farming Advice API is operational",
    endpoints: {
      POST: "/api/farming/advice",
      description: "Get smart farming advice with AI-powered research",
    },
    example: {
      question: "How do I prepare my soil for spring planting?",
      category: "SOIL_HEALTH",
      depth: "comprehensive",
    },
  });
}
