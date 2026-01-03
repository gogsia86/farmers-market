/**
 * 🌾 PAYPAL WEBHOOK API ENDPOINT
 * Divine PayPal Event Reception & Processing
 *
 * POST /api/payments/paypal/webhook
 * Receives and processes PayPal webhook events
 *
 * @divine-pattern API Route Handler with Agricultural Consciousness
 * @reference 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 * @reference 05_TESTING_SECURITY_DIVINITY.instructions.md
 */

import { createLogger } from "@/lib/logger";
import type { PayPalWebhookEvent } from "@/lib/payments/paypal/webhook.handler";
import { paypalWebhookHandler } from "@/lib/payments/paypal/webhook.handler";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("paypal-webhook-api");

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * POST /api/payments/paypal/webhook
 * Process PayPal webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // ========================================================================
    // 1. EXTRACT WEBHOOK DATA
    // ========================================================================

    const body = await request.text();
    let event: PayPalWebhookEvent;

    try {
      event = JSON.parse(body);
    } catch (error) {
      logger.error("Failed to parse webhook body", error, {
        operation: "parseWebhookBody",
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PAYLOAD",
            message: "Invalid JSON payload",
          },
        },
        { status: 400 },
      );
    }

    // ========================================================================
    // 2. EXTRACT HEADERS FOR SIGNATURE VERIFICATION
    // ========================================================================

    const headers: Record<string, string> = {
      "paypal-transmission-id":
        request.headers.get("paypal-transmission-id") || "",
      "paypal-transmission-time":
        request.headers.get("paypal-transmission-time") || "",
      "paypal-transmission-sig":
        request.headers.get("paypal-transmission-sig") || "",
      "paypal-auth-algo": request.headers.get("paypal-auth-algo") || "",
      "paypal-cert-url": request.headers.get("paypal-cert-url") || "",
    };

    // ========================================================================
    // 3. VALIDATE REQUIRED HEADERS
    // ========================================================================

    const requiredHeaders = [
      "paypal-transmission-id",
      "paypal-transmission-time",
      "paypal-transmission-sig",
    ];

    const missingHeaders = requiredHeaders.filter((header) => !headers[header]);

    if (missingHeaders.length > 0) {
      logger.warn("Missing webhook headers", {
        operation: "validateHeaders",
        missingHeaders,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_HEADERS",
            message: "Required webhook headers missing",
            details: { missingHeaders },
          },
        },
        { status: 400 },
      );
    }

    // ========================================================================
    // 4. LOG INCOMING WEBHOOK
    // ========================================================================

    logger.info("Incoming PayPal webhook received", {
      operation: "receiveWebhook",
      eventId: event.id,
      eventType: event.event_type,
      timestamp: event.create_time,
      transmissionId: headers["paypal-transmission-id"],
    });

    // ========================================================================
    // 5. PROCESS WEBHOOK EVENT
    // ========================================================================

    const result = await paypalWebhookHandler.processWebhook(event, headers);

    if (!result.success) {
      logger.error("Webhook processing failed", result.error, {
        operation: "processWebhook",
        eventId: event.id,
        eventType: event.event_type,
      });

      // Return 200 to prevent PayPal retries for invalid events
      if (
        result.error?.code === "WEBHOOK_VERIFICATION_FAILED" ||
        result.error?.code === "ORDER_ID_NOT_FOUND"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 200 }, // Don't retry
        );
      }

      // Return 500 for processing errors (PayPal will retry)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      );
    }

    // ========================================================================
    // 6. SUCCESS RESPONSE
    // ========================================================================

    logger.info("Webhook processed successfully", {
      operation: "processWebhook",
      eventId: event.id,
      eventType: event.event_type,
      action: result.data?.action,
      orderId: result.data?.orderId,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          eventId: result.data?.eventId,
          eventType: result.data?.eventType,
          processed: result.data?.processed,
          action: result.data?.action,
          message: result.data?.message,
        },
        meta: {
          timestamp: new Date().toISOString(),
          provider: "PAYPAL",
        },
        agricultural: {
          season: getCurrentSeason(),
          consciousness: "DIVINE",
          harvestBlessing: "Webhook processed with agricultural grace 🌾",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error in PayPal webhook endpoint", error, {
      operation: "webhookEndpoint",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while processing webhook",
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
 * GET /api/payments/paypal/webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: "PayPal webhook endpoint is operational",
      data: {
        endpoint: "/api/payments/paypal/webhook",
        method: "POST",
        provider: "PAYPAL",
        status: "ACTIVE",
      },
      agricultural: {
        consciousness: "DIVINE",
        message: "Webhook receiver standing ready 🌾",
      },
    },
    { status: 200 },
  );
}

/**
 * OPTIONS /api/payments/paypal/webhook
 * CORS preflight handler
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, PayPal-Transmission-*",
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
