// src/app/api/payments/refund/route.ts
import { PaymentService } from "@/lib/services/payment.service";
import type { RefundInput } from "@/types/payment.types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RefundSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
  amount: z.number().positive().optional(),
  reason: z.string().min(1, "Refund reason is required"),
  requestedBy: z.string().min(1, "Requester ID is required"),
});

/**
 * POST /api/payments/refund
 * Refund a payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = RefundSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input: RefundInput = validation.data;

    // Process refund
    const result = await PaymentService.refundPayment(input);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Refund failed",
          result,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Refund processing error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process refund",
      },
      { status: 500 }
    );
  }
}
