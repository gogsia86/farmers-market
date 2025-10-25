# 🚀 PHASE 3 - DAY 2: API ENDPOINTS

**Date**: October 26, 2025
**Status**: 🔥 **READY TO BUILD**
**Goal**: Create review API endpoints
**Time**: 2.5 hours

---

## 🎯 TODAY'S TASKS

### **TASK 1: Create Review API - POST /api/reviews** (1 hour)

Create a new API route for creating reviews:

```bash
# Create the API route file
code src/app/api/reviews/route.ts
```

**Add this code**:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { database } from "@/lib/database";
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
```

---

### **TASK 2: Create Helpful Endpoint - PATCH /api/reviews/[id]/helpful** (30 min)

```bash
code src/app/api/reviews/[id]/helpful/route.ts
```

```typescript
import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;

    // Increment helpful count
    const review = await database.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        helpfulCount: true,
        unhelpfulCount: true,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Update helpful error:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}
```

---

### **TASK 3: Farmer Response Endpoint - POST /api/reviews/[id]/response** (1 hour)

```bash
code src/app/api/reviews/[id]/response/route.ts
```

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { database } from "@/lib/database";
import { z } from "zod";

const ResponseSchema = z.object({
  response: z.string().min(10).max(500),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate farmer
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const reviewId = params.id;

    // 2. Get review and verify farm ownership
    const review = await database.review.findUnique({
      where: { id: reviewId },
      include: {
        farm: {
          select: { ownerId: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.farm.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only respond to reviews of your own farm" },
        { status: 403 }
      );
    }

    // 3. Validate response
    const body = await request.json();
    const validation = ResponseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid response", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // 4. Update review with farmer response
    const updatedReview = await database.review.update({
      where: { id: reviewId },
      data: {
        farmerResponse: validation.data.response,
        farmerRespondedAt: new Date(),
      },
      include: {
        customer: {
          select: { id: true, name: true, image: true },
        },
        product: {
          select: { id: true, name: true },
        },
        farm: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    console.error("Farmer response error:", error);
    return NextResponse.json(
      { error: "Failed to add response" },
      { status: 500 }
    );
  }
}
```

---

### **TASK 4: Test the APIs** (15 minutes)

Test with REST client or create a quick test file:

```typescript
// tests/api/reviews.test.ts
describe("Review API", () => {
  it("creates a review", async () => {
    const response = await fetch("http://localhost:3000/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: "test-product",
        farmId: "test-farm",
        rating: 5,
        reviewText: "Excellent organic tomatoes!",
      }),
    });

    expect(response.status).toBe(201);
  });
});
```

---

### **TASK 5: Commit Your Work** (15 minutes)

```bash
git add .
git commit -m "feat(reviews): add complete review API endpoints

- POST /api/reviews - Create review with validation
- GET /api/reviews - List reviews with filters
- PATCH /api/reviews/[id]/helpful - Mark review helpful
- POST /api/reviews/[id]/response - Farmer response
- Automatic farm rating statistics updates
- Verified purchase detection
- Divine error handling

Phase 3 Progress: Day 2 - 5/24 hours (20.8%)"

git push origin main
```

---

## ✅ COMPLETION CHECKLIST

- [ ] POST /api/reviews endpoint created
- [ ] GET /api/reviews endpoint with filters
- [ ] PATCH /api/reviews/[id]/helpful endpoint
- [ ] POST /api/reviews/[id]/response endpoint
- [ ] Farm rating auto-update logic
- [ ] Verified purchase detection
- [ ] Authentication checks
- [ ] Input validation with Zod
- [ ] Error handling
- [ ] Commit and push

---

## 📊 PROGRESS AFTER DAY 2

- **Hours**: 5/24 (20.8%)
- **Features**: Review API complete
- **Next**: Build review UI components

---

**STATUS**: Ready to execute Day 2! 🔥
**TIME NEEDED**: 2.5 hours
**LET'S BUILD!** ⚡
