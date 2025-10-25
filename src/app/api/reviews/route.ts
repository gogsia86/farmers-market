import { database } from "@/lib/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const CreateReviewSchema = z.object({
  productId: z.string().min(1),
  farmId: z.string().min(1),
  orderId: z.string().optional(),
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(10).max(500),
  photoUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = CreateReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, farmId, orderId, rating, reviewText, photoUrl } =
      validation.data;

    // 3. Check if user already reviewed this product
    const existingReview = await database.review.findFirst({
      where: {
        productId,
        customerId: session.user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // 4. Verify order if provided (for verified purchase badge)
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await database.order.findFirst({
        where: {
          id: orderId,
          customerId: session.user.id,
          status: "DELIVERED",
          items: {
            some: { productId },
          },
        },
      });
      isVerifiedPurchase = !!order;
    }

    // 5. Create review
    const review = await database.review.create({
      data: {
        farmId,
        productId,
        customerId: session.user.id,
        orderId: orderId || null,
        rating,
        reviewText,
        photoUrl: photoUrl || null,
        isVerifiedPurchase,
        status: "PENDING", // Moderation required
      },
      include: {
        customer: {
          select: { id: true, name: true, image: true },
        },
        product: {
          select: { id: true, name: true, images: true },
        },
        farm: {
          select: { id: true, name: true },
        },
      },
    });

    // 6. Update farm rating statistics (async, don't wait)
    updateFarmRatingStats(farmId).catch(console.error);

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

// Helper function to update farm rating statistics
async function updateFarmRatingStats(farmId: string) {
  const reviews = await database.review.findMany({
    where: { farmId, status: "APPROVED" },
    select: { rating: true },
  });

  if (reviews.length === 0) return;

  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  const ratingCounts = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  await database.farmRating.upsert({
    where: { farmId },
    create: {
      farmId,
      averageRating,
      totalReviews,
      fiveStarCount: ratingCounts[5],
      fourStarCount: ratingCounts[4],
      threeStarCount: ratingCounts[3],
      twoStarCount: ratingCounts[2],
      oneStarCount: ratingCounts[1],
    },
    update: {
      averageRating,
      totalReviews,
      fiveStarCount: ratingCounts[5],
      fourStarCount: ratingCounts[4],
      threeStarCount: ratingCounts[3],
      twoStarCount: ratingCounts[2],
      oneStarCount: ratingCounts[1],
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const productId = searchParams.get("productId");
    const farmId = searchParams.get("farmId");
    const userId = searchParams.get("userId");
    const verified = searchParams.get("verified") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: any = { status: "APPROVED" };
    if (productId) where.productId = productId;
    if (farmId) where.farmId = farmId;
    if (userId) where.customerId = userId;
    if (verified) where.isVerifiedPurchase = true;

    // Fetch reviews
    const [reviews, total] = await Promise.all([
      database.review.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, image: true },
          },
          product: {
            select: { id: true, name: true, images: true },
          },
          farm: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      database.review.count({ where }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Review fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
