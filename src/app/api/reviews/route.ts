import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

/**
 * GET /api/reviews
 *
 * Public endpoint to fetch reviews with optional filters
 * If authenticated, also returns user's pending reviews
 *
 * Query Parameters:
 * - productId?: string - Filter by product ID
 * - farmId?: string - Filter by farm ID
 * - limit?: number - Limit results (default: 20, max: 100)
 * - offset?: number - Offset for pagination (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const farmId = searchParams.get("farmId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Check if user is authenticated (optional)
    const session = await auth();

    // Build where clause for public reviews
    const where: any = {
      status: "APPROVED", // Only show approved reviews publicly
    };

    if (productId) {
      where.productId = productId;
    }

    if (farmId) {
      where.farmId = farmId;
    }

    // Fetch reviews with pagination
    const [reviews, total] = await Promise.all([
      database.review.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
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
        orderBy: {
          createdAt: "desc",
        },
      }),
      database.review.count({ where }),
    ]);

    // Format reviews
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.reviewText,
      customerName: (review as any).customer?.name || "Anonymous",
      customerImage: (review as any).customer?.avatar,
      farmId: review.farmId || undefined,
      farmName: (review as any).farm?.name || undefined,
      farmSlug: (review as any).farm?.slug || undefined,
      productId: review.productId || undefined,
      productName: (review as any).product?.name || undefined,
      productSlug: (review as any).product?.slug || undefined,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      helpful: review.helpfulCount || 0,
      notHelpful: review.unhelpfulCount || 0,
    }));

    // If authenticated, also fetch user's pending reviews
    let pendingReviews: any[] = [];
    if (session?.user?.id) {
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
        take: 10, // Limit pending reviews
      });

      // Filter orders without reviews
      pendingReviews = completedOrders
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
    }

    return NextResponse.json({
      success: true,
      data: formattedReviews,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      pending: pendingReviews.length > 0 ? pendingReviews : undefined,
    });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reviews",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
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
