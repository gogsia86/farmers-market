import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

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
