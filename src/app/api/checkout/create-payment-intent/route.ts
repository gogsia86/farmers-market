/**
 * ⚡ PAYMENT INTENT API ROUTE
 * Creates Stripe payment intents for checkout flow
 *
 * Features:
 * - Authenticated endpoint
 * - Real Stripe payment intent creation
 * - Agricultural metadata integration
 * - Error handling with enlightening messages
 * - Request validation with Zod
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkoutService } from "@/lib/services/checkout.service";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const CreatePaymentIntentSchema = z.object({
  amount: z.number().positive().max(999999.99),
  metadata: z
    .object({
      farmId: z.string().optional(),
      farmName: z.string().optional(),
      farmCount: z.number().optional(),
      itemCount: z.number().optional(),
      season: z.string().optional(),
    })
    .optional(),
});

// ============================================================================
// POST - CREATE PAYMENT INTENT
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // ⚡ AUTHENTICATION CHECK
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    // ⚡ PARSE AND VALIDATE REQUEST BODY
    const body = await request.json();
    const validation = CreatePaymentIntentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { amount, metadata } = validation.data;

    // ⚡ CREATE PAYMENT INTENT VIA CHECKOUT SERVICE
    const result = await checkoutService.createPaymentIntent(
      session.user.id,
      amount,
      {
        // Agricultural metadata
        platform: "Farmers Market Platform",
        consciousness: "BIODYNAMIC",
        farmCount: String(metadata?.farmCount || 0),
        itemCount: String(metadata?.itemCount || 0),
        season: metadata?.season || "CURRENT",
        farmId: metadata?.farmId || "",
        farmName: metadata?.farmName || "",
      },
    );

    if (!result.success || !result.paymentIntent) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to create payment intent",
        },
        { status: 500 },
      );
    }

    // ⚡ SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        paymentIntent: {
          id: result.paymentIntent.id,
          clientSecret: result.paymentIntent.clientSecret,
          amount: result.paymentIntent.amount,
          currency: result.paymentIntent.currency,
          status: result.paymentIntent.status,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("⚠️ Payment intent creation error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while creating payment intent",
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// GET - RETRIEVE PAYMENT INTENT STATUS
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // ⚡ AUTHENTICATION CHECK
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    // ⚡ GET PAYMENT INTENT ID FROM QUERY
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("paymentIntentId");

    if (!paymentIntentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment intent ID is required",
        },
        { status: 400 },
      );
    }

    // TODO: Implement payment intent retrieval from Stripe
    // For now, return a placeholder response
    return NextResponse.json(
      {
        success: true,
        paymentIntent: {
          id: paymentIntentId,
          status: "requires_payment_method",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("⚠️ Payment intent retrieval error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while retrieving payment intent",
      },
      { status: 500 },
    );
  }
}
