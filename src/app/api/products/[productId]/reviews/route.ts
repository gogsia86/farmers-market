/**
 * ⭐ Product Reviews API - Divine Review Management
 * Handles product reviews (create, list)
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import type { Review, ReviewStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/monitoring/logger";

/**
 * Create review validation schema
 */
const CreateReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(10).max(500).optional(),
  photoUrl: z.string().url().optional(),
  orderId: z.string().optional(),
});

interface ReviewListResponse {
  success: boolean;
  data?: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary?: {
      averageRating: number;
      totalReviews: number;
      ratingDistribution: Record<number, number>;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
  };
}

interface ReviewCreateResponse {
  success: boolean;
  data?: Review;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    message?: string;
  };
}

/**
 * GET /api/products/[productId]/reviews
 * Retrieve all reviews for a specific product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } },
): Promise<NextResponse<ReviewListResponse>> {
  try {
    const { productId } = params;

    // Verify product exists
    const product = await database.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        reviewCount: true,
        averageRating: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: `Product with ID ${productId} not found`,
          },
        },
        { status: 404 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    // Build where clause - only show approved reviews publicly
    const where: any = {
      productId: productId,
      status: "APPROVED" as ReviewStatus,
    };

    // Execute queries in parallel
    const [reviews, total, ratingCounts] = await Promise.all([
      database.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      database.review.count({ where }),
      // Get rating distribution
      database.review.groupBy({
        by: ["rating"],
        where,
        _count: {
          rating: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Build rating distribution object
    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratingCounts.forEach((item: any) => {
      ratingDistribution[item.rating] = item._count.rating;
    });

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews as unknown as Review[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        summary: {
          averageRating: product.averageRating
            ? parseFloat(product.averageRating.toString())
            : 0,
          totalReviews: product.reviewCount,
          ratingDistribution,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(`GET /api/products/[productId]/reviews error:`, {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REVIEW_FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch reviews",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/products/[productId]/reviews
 * Create a new review for a product
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } },
): Promise<NextResponse<ReviewCreateResponse>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to submit a review",
          },
        },
        { status: 401 },
      );
    }

    const user = session.user as any;

    // Only consumers can leave reviews
    if (user.role !== "CONSUMER") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_ERROR",
            message: "Only consumers can submit reviews",
          },
        },
        { status: 403 },
      );
    }

    const { productId } = params;

    // Verify product exists
    const product = await database.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        farmId: true,
        name: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: `Product with ID ${productId} not found`,
          },
        },
        { status: 404 },
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await database.review.findFirst({
      where: {
        productId: productId,
        customerId: user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_REVIEW",
            message: "You have already reviewed this product",
          },
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    // Validate request
    const validation = CreateReviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid review data",
            details: validation.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const reviewData = validation.data;

    // Check if this is a verified purchase
    let isVerifiedPurchase = false;
    let orderId: string | null = null;

    if (reviewData.orderId) {
      const order = await database.order.findFirst({
        where: {
          id: reviewData.orderId,
          customerId: user.id,
          status: "COMPLETED",
          items: {
            some: {
              productId: productId,
            },
          },
        },
      });

      if (order) {
        isVerifiedPurchase = true;
        orderId = order.id;
      }
    } else {
      // Check if user has ever purchased this product
      const purchaseOrder = await database.order.findFirst({
        where: {
          customerId: user.id,
          status: "COMPLETED",
          items: {
            some: {
              productId: productId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (purchaseOrder) {
        isVerifiedPurchase = true;
        orderId = purchaseOrder.id;
      }
    }

    // Create review in a transaction
    const review = await database.$transaction(async (tx: any) => {
      // Create the review
      const newReview = await tx.review.create({
        data: {
          productId: productId,
          farmId: product.farmId,
          customerId: user.id,
          orderId: orderId,
          rating: reviewData.rating,
          reviewText: reviewData.reviewText || null,
          photoUrl: reviewData.photoUrl || null,
          isVerifiedPurchase,
          status: "PENDING" as ReviewStatus, // Reviews require approval
        },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update product review count (will be approved later)
      // For now, we don't update averageRating until review is approved

      return newReview;
    });

    return NextResponse.json(
      {
        success: true,
        data: review as unknown as Review,
        meta: {
          timestamp: new Date().toISOString(),
          message: "Review submitted successfully and is pending approval",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error(`POST /api/products/[productId]/reviews error:`, {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REVIEW_CREATION_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to create review",
        },
      },
      { status: 500 },
    );
  }
}
