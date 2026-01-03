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

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import { checkoutService } from "@/lib/services/checkout.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Initialize logger for payment intent API
const logger = createLogger("api-payment-intent");

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
  let session;
  let body;
  let amount;

  try {
    // ⚡ AUTHENTICATION CHECK
    session = await auth();
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
    body = await request.json();
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

    amount = validation.data.amount;
    const { metadata } = validation.data;

    // ⚡ PREPARE METADATA WITH DEFAULTS AND TYPE CONVERSIONS
    const processedMetadata = {
      platform: "Farmers Market Platform",
      consciousness: "BIODYNAMIC",
      farmId: metadata?.farmId || "",
      farmName: metadata?.farmName || "",
      farmCount: String(metadata?.farmCount || 0),
      itemCount: String(metadata?.itemCount || 0),
      season: metadata?.season || "CURRENT",
    };

    // ⚡ CREATE PAYMENT INTENT VIA CHECKOUT SERVICE
    const result = await checkoutService.createPaymentIntent(
      session.user.id,
      amount,
      processedMetadata,
    );

    // Handle ServiceResponse pattern (discriminated union)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.message || "Failed to create payment intent",
        },
        { status: 500 },
      );
    }

    // ⚡ SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        paymentIntent: {
          id: result.data.id,
          clientSecret: result.data.clientSecret,
          amount: result.data.amount,
          currency: result.data.currency,
          status: result.data.status,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Payment intent creation failed", error as Error, {
      userId: session?.user?.id,
      amount,
    });

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
  let session;
  let paymentIntentId;

  try {
    // ⚡ AUTHENTICATION CHECK
    session = await auth();
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
    paymentIntentId = searchParams.get("paymentIntentId");

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
    logger.error("Payment intent retrieval failed", error as Error, {
      userId: session?.user?.id,
      paymentIntentId,
    });

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
