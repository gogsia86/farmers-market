/**
 * 🌾 PAYPAL ORDER CREATION API ENDPOINT
 * Divine PayPal Express Checkout Initialization
 *
 * POST /api/payments/paypal/create
 * Creates a PayPal order for Express Checkout flow
 *
 * @divine-pattern API Route Handler with Agricultural Consciousness
 * @reference 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 * @reference 05_TESTING_SECURITY_DIVINITY.instructions.md
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { paypalService } from "@/lib/payments/paypal/paypal.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("paypal-create-api");

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const CreatePayPalOrderSchema = z.object({
  orderId: z.string().cuid(),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * POST /api/payments/paypal/create
 * Create PayPal order for Express Checkout
 */
export async function POST(request: NextRequest) {
  try {
    // ========================================================================
    // 1. AUTHENTICATION
    // ========================================================================

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Authentication required to create PayPal order",
          },
        },
        { status: 401 },
      );
    }

    // ========================================================================
    // 2. VALIDATION
    // ========================================================================

    const body = await request.json();
    const validation = CreatePayPalOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid request data",
            details: validation.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const { orderId, returnUrl, cancelUrl } = validation.data;

    // ========================================================================
    // 3. ORDER VERIFICATION
    // ========================================================================

    // Fetch order from database
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        farm: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "Order not found",
            details: { orderId },
          },
        },
        { status: 404 },
      );
    }

    // ========================================================================
    // 4. AUTHORIZATION CHECK
    // ========================================================================

    // Verify order belongs to authenticated user
    if (order.customerId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You are not authorized to access this order",
            details: { orderId },
          },
        },
        { status: 403 },
      );
    }

    // ========================================================================
    // 5. ORDER STATUS VALIDATION
    // ========================================================================

    // Check if order is in valid state for payment
    if (order.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ORDER_STATUS",
            message: `Order cannot be paid in ${order.status} status`,
            details: {
              orderId,
              currentStatus: order.status,
              allowedStatuses: ["PENDING"],
            },
          },
        },
        { status: 400 },
      );
    }

    // Check if order is already paid
    if (order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_ALREADY_PAID",
            message: "Order has already been paid",
            details: {
              orderId,
              paymentStatus: order.paymentStatus,
            },
          },
        },
        { status: 400 },
      );
    }

    // ========================================================================
    // 6. AMOUNT VALIDATION
    // ========================================================================

    const amount = Number(order.total);

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_AMOUNT",
            message: "Order total must be greater than zero",
            details: { amount },
          },
        },
        { status: 400 },
      );
    }

    // ========================================================================
    // 7. CREATE PAYPAL ORDER
    // ========================================================================

    const description = `Order #${order.orderNumber} from ${order.farm.name} - ${order.items.length} items`;

    const result = await paypalService.createOrder({
      orderId,
      amount,
      currency: "USD",
      description,
      returnUrl,
      cancelUrl,
      metadata: {
        orderNumber: order.orderNumber,
        farmId: order.farmId,
        customerId: order.customerId,
        itemCount: order.items.length,
      },
    });

    if (!result.success) {
      logger.error("PayPal order creation failed", result.error, {
        operation: "createPayPalOrder",
        orderId,
        orderNumber: order.orderNumber,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: result.error?.code || "PAYPAL_ORDER_CREATION_FAILED",
            message: result.error?.message || "Failed to create PayPal order",
            details: result.error?.details,
          },
        },
        { status: 500 },
      );
    }

    // ========================================================================
    // 8. SUCCESS RESPONSE
    // ========================================================================

    if (!result.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PAYPAL_ORDER_DATA_MISSING",
            message: "PayPal order data is missing",
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          paypalOrderId: result.data.id,
          approvalUrl: result.data.approvalUrl,
          orderId: result.data.orderId,
          amount: result.data.amount,
          currency: result.data.currency,
          status: result.data.status,
        },
        meta: {
          timestamp: new Date().toISOString(),
          provider: "PAYPAL",
          orderNumber: order.orderNumber,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Unexpected error in PayPal order creation", error, {
      operation: "createPayPalOrder",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while creating PayPal order",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/payments/paypal/create
 * CORS preflight handler
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
