/**
 * 💳 Order Payment API - Link Payment Intent to Order
 * Updates order with payment intent information after payment confirmation
 * Following: 11_KILO_SCALE_ARCHITECTURE & 05_TESTING_SECURITY_DIVINITY
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/monitoring/logger";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const UpdateOrderPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
});

// ============================================================================
// POST /api/orders/[orderId]/payment
// Link payment intent to order after successful payment
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } },
): Promise<NextResponse> {
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
        { status: 401 },
      );
    }

    // =========================================================================
    // VALIDATION
    // =========================================================================
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Order ID is required",
          },
        },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validation = UpdateOrderPaymentSchema.safeParse(body);

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
        { status: 400 },
      );
    }

    const { paymentIntentId } = validation.data;

    // =========================================================================
    // VERIFY ORDER OWNERSHIP
    // =========================================================================
    const order = await database.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        customerId: true,
        orderNumber: true,
        total: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Order not found",
          },
        },
        { status: 404 },
      );
    }

    // Verify user owns this order
    if (order.customerId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Access denied to this order",
          },
        },
        { status: 403 },
      );
    }

    // =========================================================================
    // CREATE OR UPDATE PAYMENT RECORD
    // =========================================================================

    // Check if payment record already exists
    const existingPayment = await database.payment.findUnique({
      where: { orderId: order.id },
    });

    let payment;

    if (existingPayment) {
      // Update existing payment record
      payment = await database.payment.update({
        where: { orderId: order.id },
        data: {
          stripePaymentIntentId: paymentIntentId,
          status: "PROCESSING",
        },
      });
    } else {
      // Create new payment record
      payment = await database.payment.create({
        data: {
          orderId: order.id,
          amount: order.total,
          currency: "usd",
          paymentMethod: "card",
          stripePaymentIntentId: paymentIntentId,
          status: "PROCESSING",
        },
      });
    }

    // =========================================================================
    // UPDATE ORDER WITH PAYMENT INFO
    // =========================================================================
    await database.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PROCESSING",
      },
    });

    // =========================================================================
    // RESPONSE
    // =========================================================================
    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentId: payment.id,
        paymentIntentId: payment.stripePaymentIntentId,
        status: payment.status,
      },
      meta: {
        timestamp: new Date().toISOString(),
        message: "Payment linked to order successfully",
      },
    });
  } catch (error) {
    logger.error("Order payment update error:", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PAYMENT_UPDATE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update order payment",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// GET /api/orders/[orderId]/payment
// Retrieve payment information for an order
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } },
): Promise<NextResponse> {
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
        { status: 401 },
      );
    }

    // =========================================================================
    // GET ORDER AND PAYMENT
    // =========================================================================
    const { orderId } = params;

    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        Payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Order not found",
          },
        },
        { status: 404 },
      );
    }

    // Verify user owns this order or is the farm owner
    const farm = await database.farm.findUnique({
      where: { id: order.farmId },
      select: { ownerId: true },
    });

    if (
      order.customerId !== session.user.id &&
      farm?.ownerId !== session.user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Access denied to this order",
          },
        },
        { status: 403 },
      );
    }

    // =========================================================================
    // RESPONSE
    // =========================================================================
    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        payment: order.Payment
          ? {
              id: order.Payment.id,
              amount: order.Payment.amount,
              currency: order.Payment.currency,
              status: order.Payment.status,
              paymentMethod: order.Payment.paymentMethod,
              stripePaymentIntentId: order.Payment.stripePaymentIntentId,
              paidAt: order.Payment.paidAt,
            }
          : null,
      },
    });
  } catch (error) {
    logger.error("Order payment retrieval error:", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PAYMENT_RETRIEVAL_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to retrieve payment information",
        },
      },
      { status: 500 },
    );
  }
}
