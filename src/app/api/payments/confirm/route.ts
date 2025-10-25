// src/app/api/payments/confirm/route.ts
import { PaymentService } from "@/lib/services/payment.service";
import type { ConfirmPaymentInput } from "@/types/payment.types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ConfirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  paymentMethodId: z.string().optional(),
  orderId: z.string().min(1, "Order ID is required"),
});

/**
 * POST /api/payments/confirm
 * Confirm a payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = ConfirmPaymentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input: ConfirmPaymentInput = validation.data;

    // Confirm payment
    const result = await PaymentService.confirmPayment(input);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Payment confirmation failed",
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
    console.error("Payment confirmation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to confirm payment",
      },
      { status: 500 }
    );
  }
}
