// 💳 CREATE PAYMENT INTENT API ROUTE - Divine Payment Intent Creation
// API endpoint for creating Stripe payment intents with agricultural consciousness

import { checkoutService } from "@/lib/services/checkout.service";
import { stripeService } from "@/lib/services/stripe.service";
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/monitoring/logger";

// ============================================================================
// TYPES
// ============================================================================

interface CreatePaymentIntentRequest {
  checkoutSessionId: string;
  userId: string;
  customerEmail: string;
  customerName?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// ============================================================================
// POST - CREATE PAYMENT INTENT
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = (await request.json()) as CreatePaymentIntentRequest;
    const { checkoutSessionId, userId, customerEmail, customerName } = body;

    // Validate required fields
    if (!checkoutSessionId || !userId || !customerEmail) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_REQUIRED_FIELDS",
            message:
              "Missing required fields: checkoutSessionId, userId, customerEmail",
          },
        } as ApiResponse,
        { status: 400 },
      );
    }

    // Get checkout session
    const session = await checkoutService.getCheckoutSession(checkoutSessionId);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SESSION_NOT_FOUND",
            message: "Checkout session not found or expired",
          },
        } as ApiResponse,
        { status: 404 },
      );
    }

    // Verify session belongs to user
    if (session.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Checkout session does not belong to user",
          },
        } as ApiResponse,
        { status: 403 },
      );
    }

    // Calculate total amount
    const totalAmount = session.totals.total;

    // Validate amount
    if (totalAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_AMOUNT",
            message: "Total amount must be greater than 0",
          },
        } as ApiResponse,
        { status: 400 },
      );
    }

    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: totalAmount,
      currency: "usd",
      customerId: userId,
      customerEmail,
      description: `Farmers Market Order - ${session.farmOrders.length} farm(s)`,
      metadata: {
        checkoutSessionId,
        userId,
        customerEmail,
        customerName: customerName || "",
        farmCount: session.farmOrders.length.toString(),
        itemCount: session.items.length.toString(),
        fulfillmentMethod: session.fulfillmentMethod,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          paymentIntentId: paymentIntent.paymentIntentId,
          clientSecret: paymentIntent.clientSecret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          checkoutSession: {
            id: session.id,
            farmOrders: session.farmOrders.map((order: any) => ({
              farmId: order.farmId,
              farmName: order.farmName,
              subtotal: order.subtotal,
              total: order.total,
            })),
            totals: session.totals,
          },
        },
      } as ApiResponse,
      { status: 200 },
    );
  } catch (error) {
    logger.error("Create payment intent error:", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PAYMENT_INTENT_CREATION_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Failed to create payment intent",
        },
      } as ApiResponse,
      { status: 500 },
    );
  }
}

// ============================================================================
// OPTIONS - CORS PREFLIGHT
// ============================================================================

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  );
}
