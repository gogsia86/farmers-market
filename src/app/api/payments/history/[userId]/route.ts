// src/app/api/payments/history/[userId]/route.ts
import { PaymentService } from "@/lib/services/payment.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/payments/history/[userId]
 * Get payment history for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get payment history
    const history = await PaymentService.getPaymentHistory(userId);

    return NextResponse.json({
      success: true,
      payments: history,
      count: history.length,
    });
  } catch (error) {
    console.error("Payment history retrieval error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve payment history",
      },
      { status: 500 }
    );
  }
}
