import { database } from "@/lib/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
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
