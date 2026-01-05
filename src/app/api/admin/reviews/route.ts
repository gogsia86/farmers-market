/**
 * Admin Reviews Moderation API
 * GET: List pending reviews
 * PATCH: Approve/reject reviews
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { notificationService } from "@/lib/services/notification.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================================================
// Validation Schemas
// ============================================================================

const GetReviewsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["PENDING", "APPROVED", "FLAGGED", "REMOVED"]).default("PENDING"),
  farmId: z.string().cuid().optional(),
  productId: z.string().cuid().optional(),
  sortBy: z.enum(["createdAt", "rating"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const ModerateReviewSchema = z.object({
  reviewId: z.string().cuid(),
  action: z.enum(["APPROVE", "FLAG"]),
  reason: z.string().optional(),
});

// ============================================================================
// Helper Functions
// ============================================================================

async function isAdmin(userId: string): Promise<boolean> {
  const user = await database.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

async function logAdminAction(
  adminId: string,
  actionType: string,
  targetId: string,
  details?: Record<string, any>
): Promise<void> {
  await database.adminAction.create({
    data: {
      adminId,
      type: actionType as any,
      targetType: "REVIEW",
      targetId,
      description: `Admin action: ${actionType} on review ${targetId}`,
      metadata: details ? JSON.parse(JSON.stringify(details)) : null,
    },
  });
}

// ============================================================================
// GET /api/admin/reviews - List reviews for moderation
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    // Check admin permissions
    const adminCheck = await isAdmin(session.user.id);
    if (!adminCheck) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Admin access required",
          },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      farmId: searchParams.get("farmId"),
      productId: searchParams.get("productId"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    };

    const validation = GetReviewsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { page, limit, status, farmId, productId, sortBy, sortOrder } =
      validation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { status };
    if (farmId) where.farmId = farmId;
    if (productId) where.productId = productId;

    // Fetch reviews and total count
    const [reviews, total] = await Promise.all([
      database.review.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              farmId: true,
            },
          },
          farm: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip,
      }),
      database.review.count({ where }),
    ]);

    // Get statistics
    const [totalReviews, pendingCount, approvedCount, flaggedCount] =
      await Promise.all([
        database.review.count(),
        database.review.count({ where: { status: "PENDING" } }),
        database.review.count({ where: { status: "APPROVED" } }),
        database.review.count({ where: { status: "FLAGGED" } }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalReviews,
          pendingCount,
          approvedCount,
          flaggedCount,
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_REVIEWS_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch reviews",
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/admin/reviews - Moderate review (approve/reject)
// ============================================================================

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    // Check admin permissions
    const adminCheck = await isAdmin(session.user.id);
    if (!adminCheck) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Admin access required",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = ModerateReviewSchema.safeParse(body);

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

    const { reviewId, action, reason } = validation.data;

    // Get the review
    const review = await database.review.findUnique({
      where: { id: reviewId },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            farmId: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REVIEW_NOT_FOUND",
            message: "Review not found",
          },
        },
        { status: 404 }
      );
    }

    // Update review status
    const newStatus = action === "APPROVE" ? "APPROVED" : "FLAGGED";
    const updatedReview = await database.review.update({
      where: { id: reviewId },
      data: {
        status: newStatus,
        moderatedBy: session.user.id,
        moderatedAt: new Date(),
        ...(newStatus === "FLAGGED" && reason ? { flaggedReason: reason, flaggedAt: new Date() } : {}),
      },
    });

    // Log admin action
    await logAdminAction(session.user.id, "REVIEW_MODERATED", reviewId, {
      action,
      previousStatus: review.status,
      newStatus,
      reason,
    });

    // Send notification to review author
    if (review.customer) {
      const productName = review.product?.name || review.farm.name;
      const notificationTitle =
        action === "APPROVE"
          ? "Review approved"
          : "Review needs revision";
      const notificationBody =
        action === "APPROVE"
          ? `Your review for ${productName} has been approved.`
          : `Your review for ${productName} needs revision. ${reason || ""}`;

      await notificationService.createNotification({
        userId: review.customer.id,
        type: "REVIEW_RECEIVED",
        channels: ["IN_APP", "EMAIL"],
        title: notificationTitle,
        body: notificationBody,
        data: {
          reviewId: review.id,
          action,
          reason,
        },
      });
    }

    // If approved, notify farm owner
    if (action === "APPROVE" && review.farm.ownerId) {
      await notificationService.createNotification({
        userId: review.farm.ownerId,
        farmId: review.farmId,
        type: "REVIEW_RECEIVED",
        channels: ["IN_APP", "EMAIL"],
        title: "New review received",
        body: `You received a ${review.rating}-star review from ${review.customer?.name || "a customer"}.`,
        data: {
          reviewId: review.id,
          rating: review.rating,
          farmId: review.farmId,
          productId: review.productId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        review: updatedReview,
        action,
      },
    });
  } catch (error) {
    console.error("Failed to moderate review:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MODERATE_REVIEW_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to moderate review",
        },
      },
      { status: 500 }
    );
  }
}
