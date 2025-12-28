/**
 * 💳 PAYMENT INTENT API ROUTE
 * Creates Stripe payment intents for orders
 *
 * @route POST /api/payments/intent
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { paymentService } from "@/lib/services/payment.service";
import { database } from "@/lib/database";

// ✅ DIVINE VALIDATION SCHEMA
const CreatePaymentIntentSchema = z.object({
  orderId: z.string().uuid({ message: "Invalid order ID format" }),
  currency: z
    .union([
      z.literal("usd"),
      z.literal("eur"),
      z.literal("gbp"),
      z.literal("cad"),
    ])
    .optional()
    .default("usd"),
  metadata: z.record(z.string(), z.string()).optional(),
});

// ✅ DIVINE API RESPONSE TYPE
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * POST /api/payments/intent
 * Create a payment intent for an order
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ✅ AUTHENTICATION CHECK
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to create payment intent",
          },
        },
        { status: 401 },
      );
    }

    // ✅ PARSE AND VALIDATE REQUEST BODY
    const body = await request.json();
    const validation = CreatePaymentIntentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validation.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const { orderId, currency, metadata } = validation.data;

    // ✅ FETCH ORDER WITH RELATIONS
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        farm: true,
        items: true,
      },
    });

    // ✅ VERIFY ORDER EXISTS
    if (!order) {
      return NextResponse.json<ApiResponse>(
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

    // ✅ AUTHORIZATION CHECK - Verify user owns order
    if (order.customerId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You are not authorized to create payment for this order",
            details: { orderId },
          },
        },
        { status: 403 },
      );
    }

    // ✅ VALIDATE ORDER STATE
    if (order.paymentStatus === "PAID") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "ORDER_ALREADY_PAID",
            message: "This order has already been paid",
            details: { orderId, paymentStatus: order.paymentStatus },
          },
        },
        { status: 400 },
      );
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "ORDER_CANCELLED",
            message: "Cannot create payment for cancelled order",
            details: { orderId },
          },
        },
        { status: 400 },
      );
    }

    // ✅ VALIDATE ORDER AMOUNT
    const orderTotal = Number(order.total);
    if (orderTotal <= 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "INVALID_ORDER_AMOUNT",
            message: "Order total must be greater than 0",
            details: { orderId, total: orderTotal },
          },
        },
        { status: 400 },
      );
    }

    // ✅ CREATE PAYMENT INTENT VIA SERVICE
    const paymentIntentResult = await paymentService.createPaymentIntent({
      orderId,
      amount: orderTotal,
      currency,
      metadata: {
        customerEmail: order.customer.email || "",
        customerName: order.customer.name || "",
        farmName: order.farm?.name || "",
        itemCount: order.items.length.toString(),
        ...metadata,
      },
    });

    // ✅ CHECK IF PAYMENT INTENT CREATION FAILED
    if (!paymentIntentResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: paymentIntentResult.error.code,
            message: paymentIntentResult.error.message,
            details: paymentIntentResult.error.details,
          },
        },
        { status: 500 },
      );
    }

    const paymentIntent = paymentIntentResult.data;

    // ✅ RETURN SUCCESSFUL RESPONSE
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          paymentIntent: {
            id: paymentIntent.id,
            clientSecret: paymentIntent.clientSecret,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
          },
          order: {
            id: order.id,
            total: orderTotal,
            status: order.status,
            paymentStatus: "PENDING",
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    // ✅ ERROR HANDLING
    console.error("Payment intent creation error:", error);

    // Handle payment service errors
    if (error && typeof error === "object" && "code" in error) {
      const serviceError = error as {
        code: string;
        message: string;
        details?: Record<string, any>;
      };

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: serviceError.code,
            message: serviceError.message,
            details: serviceError.details,
          },
        },
        { status: 500 },
      );
    }

    // Generic error
    return NextResponse.json<ApiResponse>(
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
      { status: 500 },
    );
  }
}

/**
 * GET /api/payments/intent?orderId=xxx
 * Retrieve existing payment intent for an order
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // ✅ AUTHENTICATION CHECK
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
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

    // ✅ GET ORDER ID FROM QUERY PARAMS
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "MISSING_ORDER_ID",
            message: "orderId query parameter is required",
          },
        },
        { status: 400 },
      );
    }

    // ✅ GET PAYMENT DETAILS
    const paymentDetailsResult =
      await paymentService.getPaymentDetails(orderId);

    // ✅ CHECK IF PAYMENT DETAILS RETRIEVAL FAILED
    if (!paymentDetailsResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: paymentDetailsResult.error.code,
            message: paymentDetailsResult.error.message,
            details: paymentDetailsResult.error.details,
          },
        },
        { status: 404 },
      );
    }

    const paymentDetails = paymentDetailsResult.data;

    // ✅ AUTHORIZATION CHECK
    if (paymentDetails.order.customerId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You are not authorized to view this payment",
          },
        },
        { status: 403 },
      );
    }

    // ✅ RETURN PAYMENT DETAILS
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        order: {
          id: paymentDetails.order.id,
          total: Number(paymentDetails.order.total),
          status: paymentDetails.order.status,
          paymentStatus: paymentDetails.order.paymentStatus,
          paymentIntentId: paymentDetails.order.paymentIntentId,
        },
        paymentIntent: paymentDetails.paymentIntent
          ? {
              id: paymentDetails.paymentIntent.id,
              amount: paymentDetails.paymentIntent.amount / 100,
              currency: paymentDetails.paymentIntent.currency,
              status: paymentDetails.paymentIntent.status,
              clientSecret: paymentDetails.paymentIntent.client_secret,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get payment intent error:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: "GET_PAYMENT_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to get payment",
        },
      },
      { status: 500 },
    );
  }
}
