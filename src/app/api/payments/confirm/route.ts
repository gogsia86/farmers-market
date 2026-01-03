/**
 * 💳 PAYMENT CONFIRMATION API ROUTE
 * Divine payment confirmation with 3D Secure authentication
 *
 * Features:
 * - Payment Intent confirmation with 3DS
 * - Authentication status handling
 * - Order status updates
 * - Comprehensive error handling
 * - Agricultural consciousness patterns
 *
 * @route POST /api/payments/confirm
 * @divine-pattern Quantum Security Consciousness
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { stripe3DSecureService } from "@/lib/payments/stripe/3d-secure.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("payments-confirm-api");

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const ConfirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment Intent ID is required"),
  paymentMethodId: z.string().min(1, "Payment Method ID is required"),
  orderId: z.string().uuid("Invalid order ID format"),
  returnUrl: z.string().url().optional(),
  savePaymentMethod: z.boolean().optional().default(false),
});

// ============================================================================
// TYPES
// ============================================================================

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
// CONFIRM PAYMENT ENDPOINT
// ============================================================================

/**
 * POST /api/payments/confirm
 * Confirm payment intent with 3D Secure authentication
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ✅ STEP 1: AUTHENTICATION CHECK
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to confirm payment",
          },
        },
        { status: 401 },
      );
    }

    // ✅ STEP 2: VALIDATE REQUEST BODY
    const body = await request.json();
    const validation = ConfirmPaymentSchema.safeParse(body);

    if (!validation.success) {
      logger.warn("Payment confirmation validation failed", {
        userId: session.user.id,
        errors: validation.error.flatten(),
      });

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

    const {
      paymentIntentId,
      paymentMethodId,
      orderId,
      returnUrl,
      savePaymentMethod,
    } = validation.data;

    logger.debug("Processing payment confirmation", {
      userId: session.user.id,
      orderId,
      paymentIntentId,
    });

    // ✅ STEP 3: VERIFY ORDER OWNERSHIP
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        farm: true,
      },
    });

    if (!order) {
      logger.warn("Order not found for payment confirmation", {
        userId: session.user.id,
        orderId,
      });

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

    // Authorization check
    if (order.customerId !== session.user.id) {
      logger.warn("Unauthorized payment confirmation attempt", {
        userId: session.user.id,
        orderId,
        orderCustomerId: order.customerId,
      });

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You are not authorized to confirm payment for this order",
            details: { orderId },
          },
        },
        { status: 403 },
      );
    }

    // ✅ STEP 4: VALIDATE ORDER STATE
    if (order.paymentStatus === "PAID") {
      logger.debug("Order already paid", {
        userId: session.user.id,
        orderId,
        paymentStatus: order.paymentStatus,
      });

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
            message: "Cannot confirm payment for cancelled order",
            details: { orderId },
          },
        },
        { status: 400 },
      );
    }

    // ✅ STEP 5: CONFIRM PAYMENT WITH 3D SECURE
    const confirmResult = await stripe3DSecureService.confirmWithAuthentication(
      {
        paymentIntentId,
        paymentMethodId,
        orderId,
        returnUrl,
        savePaymentMethod,
      },
    );

    if (!confirmResult.success) {
      logger.warn("Payment confirmation failed", {
        userId: session.user.id,
        orderId,
        paymentIntentId,
        errorCode: confirmResult.error?.code,
      });

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: confirmResult.error?.code || "PAYMENT_CONFIRMATION_FAILED",
            message:
              confirmResult.error?.message || "Payment confirmation failed",
            details: confirmResult.error?.details,
          },
        },
        { status: 400 },
      );
    }

    if (!confirmResult.data) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "PAYMENT_DATA_MISSING",
            message: "Payment confirmation data is missing",
          },
        },
        { status: 500 },
      );
    }

    const { paymentIntent, status, requiresAction, clientSecret, nextAction } =
      confirmResult.data;

    // ✅ STEP 6: HANDLE DIFFERENT PAYMENT STATUSES

    // Payment succeeded immediately (no 3DS required or already authenticated)
    if (status === "succeeded") {
      logger.info("Payment succeeded", {
        userId: session.user.id,
        orderId,
        paymentIntentId: paymentIntent.id,
      });

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          status: "SUCCEEDED",
          paymentIntentId: paymentIntent.id,
          orderId,
          message: "Payment completed successfully",
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            total: Number(order.total),
            paymentStatus: "PAID",
            status: "CONFIRMED",
          },
        },
      });
    }

    // Payment requires additional authentication (3D Secure challenge)
    if (status === "requires_action" && requiresAction) {
      logger.info("Payment requires 3D Secure action", {
        userId: session.user.id,
        orderId,
        paymentIntentId: paymentIntent.id,
        actionType: nextAction?.type,
      });

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          status: "REQUIRES_ACTION",
          paymentIntentId: paymentIntent.id,
          orderId,
          requiresAction: true,
          clientSecret,
          nextAction: {
            type: nextAction?.type,
            redirectUrl:
              nextAction?.type === "redirect_to_url"
                ? (nextAction as any).redirect_to_url?.url
                : undefined,
          },
          message:
            "Additional authentication required. Please complete 3D Secure verification.",
        },
      });
    }

    // Payment is processing
    if (status === "processing") {
      logger.info("Payment processing", {
        userId: session.user.id,
        orderId,
        paymentIntentId: paymentIntent.id,
      });

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          status: "PROCESSING",
          paymentIntentId: paymentIntent.id,
          orderId,
          message: "Payment is being processed. This may take a few moments.",
        },
      });
    }

    // Payment requires payment method (failed or cancelled)
    if (status === "requires_payment_method") {
      logger.warn("Payment failed - requires new payment method", {
        userId: session.user.id,
        orderId,
        paymentIntentId: paymentIntent.id,
        declineCode: paymentIntent.last_payment_error?.decline_code,
      });

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "PAYMENT_FAILED",
            message:
              paymentIntent.last_payment_error?.message ||
              "Payment failed. Please try again with a different payment method.",
            details: {
              paymentIntentId: paymentIntent.id,
              orderId,
              declineCode: paymentIntent.last_payment_error?.decline_code,
            },
          },
        },
        { status: 400 },
      );
    }

    // Unknown status
    logger.warn("Unknown payment status", {
      userId: session.user.id,
      orderId,
      paymentIntentId: paymentIntent.id,
      status,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: "UNKNOWN_PAYMENT_STATUS",
          message: `Unexpected payment status: ${status}`,
          details: {
            paymentIntentId: paymentIntent.id,
            status,
          },
        },
      },
      { status: 500 },
    );
  } catch (error) {
    logger.error("Payment confirmation error", error as Error, {
      endpoint: "POST /api/payments/confirm",
    });

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: "PAYMENT_CONFIRMATION_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to confirm payment",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// CHECK AUTHENTICATION STATUS ENDPOINT
// ============================================================================

/**
 * GET /api/payments/confirm?paymentIntentId=xxx
 * Check authentication status after 3D Secure redirect
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // ✅ AUTHENTICATION CHECK
    const session = await auth();
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

    // ✅ GET PAYMENT INTENT ID FROM QUERY
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("paymentIntentId");

    if (!paymentIntentId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "MISSING_PAYMENT_INTENT_ID",
            message: "paymentIntentId query parameter is required",
          },
        },
        { status: 400 },
      );
    }

    logger.debug("Checking authentication status", {
      userId: session.user.id,
      paymentIntentId,
    });

    // ✅ CHECK AUTHENTICATION STATUS
    const authResult =
      await stripe3DSecureService.check3DSecureStatus(paymentIntentId);

    if (!authResult.success) {
      logger.warn("Authentication check failed", {
        userId: session.user.id,
        paymentIntentId,
        errorCode: authResult.error?.code,
      });

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: authResult.error?.code || "AUTHENTICATION_CHECK_FAILED",
            message: authResult.error?.message || "Authentication check failed",
            details: authResult.error?.details,
          },
        },
        { status: 400 },
      );
    }

    if (!authResult.data) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_DATA_MISSING",
            message: "Authentication data is missing",
          },
        },
        { status: 500 },
      );
    }

    const { status, requiresAction, clientSecret, message } = authResult.data;

    // ✅ HANDLE AUTHENTICATION COMPLETION
    if (status === "AUTHENTICATED") {
      const completionResult =
        await stripe3DSecureService.handleAuthenticationComplete(
          paymentIntentId,
        );

      if (!completionResult.success) {
        logger.warn("Authentication completion failed", {
          userId: session.user.id,
          paymentIntentId,
          errorCode: completionResult.error?.code,
        });

        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code:
                completionResult.error?.code ||
                "AUTHENTICATION_COMPLETION_FAILED",
              message:
                completionResult.error?.message ||
                "Authentication completion failed",
              details: completionResult.error?.details,
            },
          },
          { status: 400 },
        );
      }

      logger.info("Payment authentication completed successfully", {
        userId: session.user.id,
        paymentIntentId,
      });

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          status: "AUTHENTICATED",
          paymentIntentId,
          message: "Payment authentication completed successfully",
        },
      });
    }

    // ✅ RETURN CURRENT STATUS
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        status,
        paymentIntentId,
        requiresAction,
        clientSecret,
        message,
      },
    });
  } catch (error) {
    logger.error("Authentication status check error", error as Error, {
      endpoint: "GET /api/payments/confirm",
    });

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: "AUTHENTICATION_CHECK_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to check authentication status",
        },
      },
      { status: 500 },
    );
  }
}
