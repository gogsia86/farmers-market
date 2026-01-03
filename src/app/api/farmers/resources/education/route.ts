/**
 * EDUCATIONAL CONTENT API ROUTE
 * Research-backed Farming Guides and Tutorials
 *
 * POST /api/farming/education
 * - Provides comprehensive educational content for farmers
 * - Requires authentication
 * - Returns structured guides with citations
 */

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import { getEducationalContent } from "@/lib/services/perplexity-farming.service";
import type { EducationalContentRequest } from "@/types/farming-advice.types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("farming-education-api");

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const EducationalContentSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(200),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  format: z.enum(["GUIDE", "TUTORIAL", "QUICK_TIP", "DEEP_DIVE"]).optional(),
  includeVisualGuidance: z.boolean().optional(),
  includeStepByStep: z.boolean().optional(),
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
            message: "You must be logged in to access educational content",
          },
        },
        { status: 401 },
      );
    }

    // 2. Parse and Validate Request Body
    const body = await request.json();
    const validation = EducationalContentSchema.safeParse(body);

    if (!validation.success) {
      logger.warn("Educational content validation failed", {
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

    logger.debug("Fetching educational content", {
      userId: session.user.id,
      topic: validatedData.topic,
      level: validatedData.level,
      format: validatedData.format,
    });

    // 3. Build Request
    const contentRequest: EducationalContentRequest = {
      topic: validatedData.topic,
      level: validatedData.level || "INTERMEDIATE",
      format: validatedData.format || "GUIDE",
      includeVisualGuidance: validatedData.includeVisualGuidance ?? false,
      includeStepByStep: validatedData.includeStepByStep ?? true,
    };

    // 4. Get Educational Content
    const result = await getEducationalContent(contentRequest);

    // 5. Return Response
    if (result.success) {
      logger.info("Educational content fetched successfully", {
        userId: session.user.id,
        topic: validatedData.topic,
        level: contentRequest.level,
        format: contentRequest.format,
      });
      return NextResponse.json(result, { status: 200 });
    } else {
      logger.warn("Educational content fetch returned unsuccessful", {
        userId: session.user.id,
        topic: validatedData.topic,
      });
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    logger.error("Educational Content API error", error as Error, {
      endpoint: "POST /api/farming/education",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to get educational content",
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
    message: "Educational Content API is operational",
    endpoints: {
      POST: "/api/farming/education",
      description: "Get research-backed farming guides and tutorials",
    },
    example: {
      topic: "Organic Pest Management for Vegetable Gardens",
      level: "INTERMEDIATE",
      format: "GUIDE",
      includeStepByStep: true,
    },
    availableLevels: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
    availableFormats: ["GUIDE", "TUTORIAL", "QUICK_TIP", "DEEP_DIVE"],
  });
}
