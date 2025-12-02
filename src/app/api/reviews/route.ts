import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

/**
 * GET /api/reviews
 *
 * Fetch authenticated user's reviews and pending reviews
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Fetch submitted reviews
    const reviews = await database.review.findMany({
      where: { customerId: session.user.id },
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
        order: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch completed orders without reviews for pending reviews
    const completedOrders = await database.order.findMany({
      where: {
        customerId: session.user.id,
        status: "COMPLETED",
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        reviews: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    // Filter orders that don't have reviews yet
    const pendingReviews = completedOrders
      .filter((order) => !order.reviews || order.reviews.length === 0)
      .map((order) => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        farmId: order.farm.id,
        farmName: order.farm.name,
        farmSlug: order.farm.slug,
        completedAt: order.updatedAt.toISOString(),
        items: order.items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productSlug: item.product.slug,
        })),
      }));

    // Format submitted reviews
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.reviewText,
      farmId: review.farmId || undefined,
      farmName: review.farm?.name || undefined,
      farmSlug: review.farm?.slug || undefined,
      productId: review.productId || undefined,
      productName: review.product?.name || undefined,
      productSlug: review.product?.slug || undefined,
      orderId: review.orderId || undefined,
      orderNumber: review.order?.orderNumber || undefined,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      helpful: review.helpfulCount || 0,
      notHelpful: review.unhelpfulCount || 0,
    }));

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      pending: pendingReviews,
      stats: {
        submitted: reviews.length,
        pending: pendingReviews.length,
        averageRating:
          reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0,
      },
    });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reviews",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/reviews
 *
 * Create a new review
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { rating, comment, farmId, productId, orderId } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Comment is required" },
        { status: 400 },
      );
    }

    if (!farmId && !productId) {
      return NextResponse.json(
        {
          success: false,
          error: "Either farmId or productId is required",
        },
        { status: 400 },
      );
    }

    // Verify order belongs to user if orderId provided
    if (orderId) {
      const order = await database.order.findUnique({
        where: { id: orderId },
      });

      if (!order || order.customerId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: "Invalid order" },
          { status: 400 },
        );
      }

      // Check if review already exists for this order
      const existingReview = await database.review.findFirst({
        where: {
          customerId: session.user.id,
          orderId,
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { success: false, error: "You have already reviewed this order" },
          { status: 400 },
        );
      }
    }

    // Create review
    const review = await database.review.create({
      data: {
        customerId: session.user.id,
        rating,
        reviewText: comment.trim(),
        farmId,
        productId: productId || undefined,
        orderId: orderId || undefined,
        status: "APPROVED", // Auto-approve for now
      },
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
      message: "Review submitted successfully",
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.reviewText,
        farmName: review.farm?.name || undefined,
        productName: review.product?.name || undefined,
        createdAt: review.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create review",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
