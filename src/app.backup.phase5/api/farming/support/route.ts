/**
 * AI-POWERED SUPPORT API ROUTE
 * Intelligent Farming Support with Perplexity Integration
 *
 * POST /api/farming/support
 * - Provides AI-powered support for farmer questions
 * - Maintains conversation history
 * - Returns answers with citations and suggested actions
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { handleSupportRequest } from "@/lib/services/perplexity-farming.service";
import type { SupportRequest } from "@/types/farming-advice.types";
import { getCurrentSeason } from "@/types/farming-advice.types";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const SupportRequestSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(5, "Message must be at least 5 characters").max(1000),
  context: z
    .object({
      farmId: z.string().optional(),
      currentSeason: z.enum(["SPRING", "SUMMER", "FALL", "WINTER"]).optional(),
      location: z.string().optional(),
      farmType: z.string().optional(),
    })
    .optional(),
  includeHistory: z.boolean().optional(),
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
            message: "You must be logged in to get support",
          },
        },
        { status: 401 },
      );
    }

    // 2. Parse and Validate Request Body
    const body = await request.json();
    const validation = SupportRequestSchema.safeParse(body);

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
        { status: 400 },
      );
    }

    const validatedData = validation.data;

    // 3. Build Support Request
    const supportRequest: SupportRequest = {
      conversationId: validatedData.conversationId,
      userId: session.user.id,
      message: validatedData.message,
      context: {
        ...validatedData.context,
        currentSeason:
          validatedData.context?.currentSeason || getCurrentSeason(),
      },
      includeHistory: validatedData.includeHistory ?? true,
    };

    // 4. Handle Support Request
    const result = await handleSupportRequest(supportRequest);

    // 5. Return Response
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Support API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to process support request",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// GET HANDLER (API Info)
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
    message: "AI-Powered Support API is operational",
    endpoints: {
      POST: "/api/farming/support",
      description:
        "Get AI-powered support with conversation history and suggested actions",
    },
    features: [
      "Real-time agricultural expertise",
      "Conversation history tracking",
      "Suggested actions and next steps",
      "Context-aware responses",
      "Citation-backed answers",
      "Automatic escalation detection",
    ],
    example: {
      message: "My tomato plants have yellow leaves. What should I do?",
      context: {
        currentSeason: "SUMMER",
        location: "California",
        farmType: "Organic vegetable farm",
      },
    },
  });
}
