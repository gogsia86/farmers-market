/**
 * 🌾 Receipt API Routes - Divine Agricultural Documentation
 *
 * Handles receipt generation and retrieval
 * Part of Sprint 6 Phase 3 Day 4: Receipt System & Notifications
 *
 * @endpoints
 * - POST /api/receipts - Generate receipt for an order
 * - GET  /api/receipts - Get receipts for user
 *
 * @version 3.0.0
 */

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import { receiptService } from "@/lib/services/receipt.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("receipts-api");

// ==================== VALIDATION SCHEMAS ====================

const GenerateReceiptRequestSchema = z.object({
  orderId: z.string().min(1),
  recipientType: z.enum(["CUSTOMER", "FARMER", "ADMIN"]).default("CUSTOMER"),
  format: z.enum(["PDF", "HTML", "BOTH"]).default("BOTH"),
  includeQRCode: z.boolean().default(true),
  locale: z.string().default("en-US"),
  options: z
    .object({
      showDetailedItems: z.boolean().default(true),
      showPaymentMethod: z.boolean().default(true),
      showShippingAddress: z.boolean().default(true),
      showBillingAddress: z.boolean().default(true),
      showFarmInfo: z.boolean().default(true),
      showTaxBreakdown: z.boolean().default(true),
      includeTermsAndConditions: z.boolean().default(false),
      customMessage: z.string().optional(),
    })
    .optional(),
});

// ==================== POST - GENERATE RECEIPT ====================

/**
 * POST /api/receipts
 *
 * Generates a receipt for a paid order
 *
 * @body {GenerateReceiptRequest} Receipt generation request
 * @returns {Receipt} Generated receipt with HTML and optional PDF
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to generate a receipt",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = GenerateReceiptRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid receipt generation request",
            details: validation.error.errors,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    const { orderId, recipientType, format, includeQRCode, locale, options } =
      validation.data;

    // Generate receipt
    const result = await receiptService.generateReceipt({
      orderId,
      recipientType,
      format,
      includeQRCode,
      locale,
      options,
    });

    // Prepare response based on format
    const responseData: any = {
      receipt: {
        id: result.receipt.id,
        orderId: result.receipt.orderId,
        orderNumber: result.receipt.orderNumber,
        recipientType: result.receipt.recipientType,
        format: result.receipt.format,
        generatedAt: result.receipt.generatedAt,
        pdfUrl: result.receipt.pdfUrl,
        qrCodeUrl: result.receipt.qrCodeUrl,
      },
    };

    // Include HTML if requested
    if (format === "HTML" || format === "BOTH") {
      responseData.html = result.html;
    }

    // Include PDF URL if generated
    if (format === "PDF" || format === "BOTH") {
      responseData.pdfUrl = result.receipt.pdfUrl;
    }

    // Include QR code if generated
    if (includeQRCode && result.qrCode) {
      responseData.qrCode = result.qrCode;
    }

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: request.headers.get("x-request-id") || undefined,
          agricultural: {
            consciousness: "ACTIVE",
            season: "HARVEST",
            blessing: "May your receipt be as clear as spring water",
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Receipt generation failed", error, {
      operation: "generateReceipt",
    });

    // Check for specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.errors,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Check for order not paid error
    if (error instanceof Error && error.message.includes("not been paid")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_PAID",
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Check for order not found error
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RECEIPT_GENERATION_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate receipt",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

// ==================== GET - GET RECEIPTS ====================

/**
 * GET /api/receipts?orderId=xxx
 *
 * Retrieves receipts for the authenticated user
 *
 * @query {string} orderId - Optional order ID to filter receipts
 * @returns {Receipt[]} Array of receipts
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to view receipts",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (orderId) {
      // Get specific receipt
      const receipt = await receiptService.getReceiptByOrderId(orderId);

      if (!receipt) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RECEIPT_NOT_FOUND",
              message: `Receipt for order ${orderId} not found`,
              timestamp: new Date().toISOString(),
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          receipt,
        },
        meta: {
          timestamp: new Date().toISOString(),
          agricultural: {
            consciousness: "ACTIVE",
            season: "HARVEST",
          },
        },
      });
    }

    // In production, fetch all receipts for user
    // For now, return empty array
    return NextResponse.json({
      success: true,
      data: {
        receipts: [],
      },
      meta: {
        timestamp: new Date().toISOString(),
        agricultural: {
          consciousness: "ACTIVE",
          season: "HARVEST",
        },
      },
    });
  } catch (error) {
    logger.error("Receipt retrieval failed", error, {
      operation: "getReceipts",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RECEIPT_RETRIEVAL_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to retrieve receipts",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
