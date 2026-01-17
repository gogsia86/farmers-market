/**
 * REVIEWS API - GET & POST ENDPOINTS
 * ===================================
 *
 * RESTful API endpoints for review management
 * - GET: Fetch reviews with filtering and pagination
 * - POST: Create new review
 *
 * @route /api/v1/reviews
 * @version 2.0.0
 */

import { getServerSession } from "@/lib/auth/config";
import { logger } from "@/lib/monitoring/logger";
import { reviewService } from "@/lib/services/review.service";
import {
  CreateReviewSchema,
  ReviewFiltersSchema,
} from "@/lib/validators/review.validator";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================================================
// GET /api/v1/reviews - Fetch reviews with filters
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const rawFilters = {
      farmId: searchParams.get("farmId") || undefined,
      productId: searchParams.get("productId") || undefined,
      customerId: searchParams.get("customerId") || undefined,
      rating: searchParams.get("rating")
        ? parseInt(searchParams.get("rating")!)
        : undefined,
      status: searchParams.get("status") || "APPROVED",
      isVerifiedPurchase: searchParams.get("isVerifiedPurchase")
        ? searchParams.get("isVerifiedPurchase") === "true"
        : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      pageSize: searchParams.get("pageSize")
        ? parseInt(searchParams.get("pageSize")!)
        : 20,
      sortBy:
        (searchParams.get("sortBy") as
          | "createdAt"
          | "rating"
          | "helpfulCount") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    // Validate filters
    const filters = ReviewFiltersSchema.parse(rawFilters);

    // Fetch reviews
    const result = await reviewService.getReviews(filters);

    return NextResponse.json({
      success: true,
      data: result.reviews,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch reviews", { error });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch reviews",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST /api/v1/reviews - Create new review
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = CreateReviewSchema.parse({
      ...body,
      customerId: session.user.id, // Override with authenticated user ID
    });

    // Create review
    const review = await reviewService.createReview(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: review,
        message: "Review submitted successfully and is pending approval",
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Failed to create review", { error });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid review data",
            details: error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      // Handle business logic errors
      if (error.message.includes("already reviewed")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DUPLICATE_REVIEW",
              message: error.message,
            },
          },
          { status: 409 },
        );
      }

      if (error.message.includes("Rating must be")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_RATING",
              message: error.message,
            },
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create review",
        },
      },
      { status: 500 },
    );
  }
}
