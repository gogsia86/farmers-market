/**
 * 🌾 PAYPAL CAPTURE API ENDPOINT
 * Divine PayPal Payment Capture & Order Completion
 *
 * POST /api/payments/paypal/capture
 * Captures PayPal payment after customer approval
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

const logger = createLogger("paypal-capture-api");

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const CapturePayPalOrderSchema = z.object({
  paypalOrderId: z.string().min(1, "PayPal order ID is required"),
  orderId: z.string().cuid(),
});

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * POST /api/payments/paypal/capture
 * Capture PayPal payment after customer approval
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
            message: "Authentication required to capture PayPal payment",
          },
        },
        { status: 401 },
      );
    }

    // ========================================================================
    // 2. VALIDATION
    // ========================================================================

    const body = await request.json();
    const validation = CapturePayPalOrderSchema.safeParse(body);

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

    const { paypalOrderId, orderId } = validation.data;

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
    // 5. PAYMENT STATUS VALIDATION
    // ========================================================================

    // Check if order is already paid
    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_ALREADY_PAID",
            message: "This order has already been paid",
            details: {
              orderId,
              paymentStatus: order.paymentStatus,
              paidAt: order.paidAt,
            },
          },
        },
        { status: 400 },
      );
    }

    // Check if order is refunded
    if (order.paymentStatus === "REFUNDED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_REFUNDED",
            message: "This order has been refunded and cannot be paid again",
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
    // 6. PAYPAL ORDER ID VERIFICATION
    // ========================================================================

    // Verify PayPal order ID matches order in database
    if (order.paymentIntentId && order.paymentIntentId !== paypalOrderId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PAYPAL_ORDER_MISMATCH",
            message: "PayPal order ID does not match order payment intent",
            details: {
              expected: order.paymentIntentId,
              provided: paypalOrderId,
            },
          },
        },
        { status: 400 },
      );
    }

    // ========================================================================
    // 7. VERIFY PAYPAL ORDER STATUS
    // ========================================================================

    // Get PayPal order details to verify it's approved
    const orderDetailsResult =
      await paypalService.getOrderDetails(paypalOrderId);

    if (!orderDetailsResult.success) {
      logger.error("Failed to get PayPal order details", orderDetailsResult.error, {
        operation: "getOrderDetails",
        paypalOrderId,
        orderId,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PAYPAL_ORDER_FETCH_FAILED",
            message: "Failed to verify PayPal order status",
            details: orderDetailsResult.error?.details,
          },
        },
        { status: 500 },
      );
    }

    if (!orderDetailsResult.data) {
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

    const paypalOrderStatus = orderDetailsResult.data.status;

    // Check if order is approved
    if (paypalOrderStatus !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PAYPAL_ORDER_NOT_APPROVED",
            message: `PayPal order is not approved. Current status: ${paypalOrderStatus}`,
            details: {
              paypalOrderId,
              status: paypalOrderStatus,
              expectedStatus: "APPROVED",
            },
          },
        },
        { status: 400 },
      );
    }

    // ========================================================================
    // 8. CAPTURE PAYPAL PAYMENT
    // ========================================================================

    const expectedAmount = Number(order.total);

    const captureResult = await paypalService.captureOrder({
      paypalOrderId,
      orderId,
      expectedAmount,
    });

    if (!captureResult.success) {
      logger.error("PayPal capture failed", captureResult.error, {
        operation: "captureOrder",
        paypalOrderId,
        orderId,
        expectedAmount,
      });

      // Update order status to failed
      await database.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "FAILED",
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: captureResult.error?.code || "PAYPAL_CAPTURE_FAILED",
            message:
              captureResult.error?.message ||
              "Failed to capture PayPal payment",
            details: captureResult.error?.details,
          },
        },
        { status: 500 },
      );
    }

    // ========================================================================
    // 9. LOG PAYMENT SUCCESS
    // ========================================================================

    if (!captureResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PAYPAL_CAPTURE_DATA_MISSING",
            message: "PayPal capture data is missing",
          },
        },
        { status: 500 },
      );
    }

    logger.info("PayPal payment captured successfully", {
      orderId,
      orderNumber: order.orderNumber,
      paypalOrderId,
      captureId: captureResult.data.captureId,
      amount: captureResult.data.amount,
      currency: captureResult.data.currency,
      customerId: order.customerId,
      farmId: order.farmId,
    });

    // ========================================================================
    // 10. SUCCESS RESPONSE
    // ========================================================================

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: captureResult.data.orderId,
          orderNumber: order.orderNumber,
          paypalOrderId: captureResult.data.id,
          captureId: captureResult.data.captureId,
          transactionId: captureResult.data.transactionId,
          status: captureResult.data.status,
          amount: captureResult.data.amount,
          currency: captureResult.data.currency,
          paymentMethod: "PAYPAL",
          payer: {
            email: captureResult.data.payerEmail,
            name: captureResult.data.payerName,
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          provider: "PAYPAL",
          farmName: order.farm.name,
        },
        agricultural: {
          season: getCurrentSeason(),
          consciousness: "DIVINE",
          harvestBlessing: "Payment captured with agricultural grace 🌾",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error in PayPal capture", error, {
      operation: "capturePayPalPayment",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            "An unexpected error occurred while capturing PayPal payment",
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
 * OPTIONS /api/payments/paypal/capture
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current agricultural season
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;

  if (month >= 3 && month <= 5) return "SPRING";
  if (month >= 6 && month <= 8) return "SUMMER";
  if (month >= 9 && month <= 11) return "FALL";
  return "WINTER";
}
