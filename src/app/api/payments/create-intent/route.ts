// src/app/api/payments/create-intent/route.ts
import { PaymentService } from "@/lib/services/payment.service";
import type { CreatePaymentIntentInput } from "@/types/payment.types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreatePaymentIntentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().optional().default("usd"),
  paymentMethod: z.enum(["STRIPE", "PAYPAL", "CARD"]),
  customerId: z.string().optional(),
  savePaymentMethod: z.boolean().optional(),
});

/**
 * POST /api/payments/create-intent
 * Create a payment intent for an order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = CreatePaymentIntentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input: CreatePaymentIntentInput = validation.data;

    // Create payment intent
    const paymentIntent = await PaymentService.createPaymentIntent(input);

    return NextResponse.json({
      success: true,
      paymentIntent,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create payment intent",
      },
      { status: 500 }
    );
  }
}
