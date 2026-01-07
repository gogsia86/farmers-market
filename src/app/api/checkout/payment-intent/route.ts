/**
 * 💳 Payment Intent API - Divine Stripe Payment Processing
 * Creates Stripe Payment Intents for checkout flow
 * Following: 11_KILO_SCALE_ARCHITECTURE & 05_TESTING_SECURITY_DIVINITY
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { stripeService } from "@/lib/services/stripe.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const CreatePaymentIntentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().optional().default("usd"),
  orderId: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

type CreatePaymentIntentRequest = z.infer<typeof CreatePaymentIntentSchema>;

// ============================================================================
// POST /api/checkout/payment-intent
// Create a new payment intent for checkout
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // =========================================================================
    // AUTHENTICATION
    // =========================================================================
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    // =========================================================================
    // VALIDATION
    // =========================================================================
    const body = await request.json();
    const validation = CreatePaymentIntentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { amount, currency, orderId, metadata = {} } = validation.data;

    // =========================================================================
    // GET USER DATA
    // =========================================================================
    const user = await database.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user || !user.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found or missing email",
          },
        },
        { status: 404 }
      );
    }

    // =========================================================================
    // GET OR CREATE STRIPE CUSTOMER
    // =========================================================================
    // For now, create a new customer each time
    // TODO: Store stripeCustomerId in User model or use metadata lookup
    const stripeCustomerId = await stripeService.getOrCreateCustomer({
      email: user.email,
      name: user.name || undefined,
      userId: user.id,
    });

    // =========================================================================
    // CREATE PAYMENT INTENT
    // =========================================================================
    const paymentIntent = await stripeService.createPaymentIntent({
      amount,
      currency,
      customerId: stripeCustomerId,
      customerEmail: user.email,
      description: `Farmers Market Order${orderId ? ` #${orderId}` : ""}`,
      metadata: {
        userId: user.id,
        userEmail: user.email,
        ...(orderId && { orderId }),
        ...metadata,
      },
    });

    // =========================================================================
    // RESPONSE
    // =========================================================================
    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.paymentIntentId,
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });
  } catch (error) {
    logger.error("Payment intent creation error:", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PAYMENT_INTENT_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to create payment intent",
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/checkout/payment-intent?paymentIntentId=pi_xxx
// Retrieve payment intent status
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // =========================================================================
    // AUTHENTICATION
    // =========================================================================
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    // =========================================================================
    // GET PAYMENT INTENT ID
    // =========================================================================
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("paymentIntentId");

    if (!paymentIntentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "paymentIntentId is required",
          },
        },
        { status: 400 }
      );
    }

    // =========================================================================
    // GET PAYMENT INTENT STATUS
    // =========================================================================
    const paymentStatus = await stripeService.getPaymentStatus(paymentIntentId);

    // =========================================================================
    // VERIFY USER OWNS THIS PAYMENT INTENT
    // =========================================================================
    if (paymentStatus.metadata?.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Access denied to this payment intent",
          },
        },
        { status: 403 }
      );
    }

    // =========================================================================
    // RESPONSE
    // =========================================================================
    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: paymentStatus.paymentIntentId,
        status: paymentStatus.status,
        amount: paymentStatus.amount,
        currency: paymentStatus.currency,
        metadata: paymentStatus.metadata,
      },
    });
  } catch (error) {
    logger.error("Payment intent retrieval error:", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PAYMENT_INTENT_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to retrieve payment intent",
        },
      },
      { status: 500 }
    );
  }
}
