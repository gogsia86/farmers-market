import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

/**
 * PUT /api/reviews/[id]
 *
 * Update an existing review
 * Only the review author can update their review
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { rating, comment } = body;

    // Validation
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (comment !== undefined && comment.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    // Fetch existing review
    const existingReview = await database.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    // Authorization check - only review author can update
    if (existingReview.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only update your own reviews" },
        { status: 403 }
      );
    }

    // Update review
    const updateData: any = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment.trim();
    updateData.updatedAt = new Date();

    const updatedReview = await database.review.update({
      where: { id },
      data: updateData,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      review: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        farmName: updatedReview.farm?.name || undefined,
        productName: updatedReview.product?.name || undefined,
        updatedAt: updatedReview.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Review update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update review",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]
 *
 * Delete an existing review
 * Only the review author can delete their review
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Fetch existing review
    const existingReview = await database.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    // Authorization check - only review author can delete
    if (existingReview.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own reviews" },
        { status: 403 }
      );
    }

    // Delete review
    await database.review.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Review deletion error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete review",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
