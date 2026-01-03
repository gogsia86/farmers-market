/**
 * 🌾 Digital Wallet API Routes - Divine Agricultural Payment Integration
 *
 * Handles device detection, wallet capabilities, and payment intent creation
 * Part of Sprint 6 Phase 3 Day 3: Digital Wallets Integration
 *
 * @endpoints
 * - GET  /api/payment/wallet - Check wallet capabilities
 * - POST /api/payment/wallet - Create wallet payment intent
 *
 * @version 3.0.0
 */

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import { digitalWalletService } from "@/lib/services/digital-wallet.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("wallet-api");

// ==================== VALIDATION SCHEMAS ====================

const CreateWalletPaymentRequestSchema = z.object({
  orderId: z.string().min(1),
  walletType: z.enum(["APPLE_PAY", "GOOGLE_PAY", "PAYMENT_REQUEST"]),
  amount: z.number().positive(),
  currency: z.enum(["usd", "eur", "gbp", "cad"]).default("usd"),
  metadata: z.record(z.any()).optional(),
});

// ==================== GET - CHECK WALLET CAPABILITIES ====================

/**
 * GET /api/payment/wallet
 *
 * Detects device capabilities and returns available wallet types
 *
 * @returns {WalletCapabilities} Available wallets for the device
 */
export async function GET(request: NextRequest) {
  try {
    // Get user agent from headers
    const userAgent = request.headers.get("user-agent") || "";

    // Detect device capabilities
    const deviceInfo =
      await digitalWalletService.detectDeviceCapabilities(userAgent);

    // Get wallet capabilities
    const capabilities =
      await digitalWalletService.getWalletCapabilities(userAgent);

    // Validate wallet configuration
    const configValidation =
      await digitalWalletService.validateWalletConfiguration();

    return NextResponse.json({
      success: true,
      data: {
        deviceInfo,
        capabilities,
        configuration: {
          valid: configValidation.valid,
          missingConfig: configValidation.missingConfig,
        },
        availableWallets: deviceInfo.supportedWallets,
      },
      meta: {
        timestamp: new Date().toISOString(),
        agricultural: {
          consciousness: "ACTIVE",
          season: "DIGITAL_HARVEST",
        },
      },
    });
  } catch (error) {
    logger.error("Wallet capabilities check failed", error, {
      operation: "getWalletCapabilities",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "WALLET_CAPABILITIES_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to check wallet capabilities",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

// ==================== POST - CREATE WALLET PAYMENT INTENT ====================

/**
 * POST /api/payment/wallet
 *
 * Creates a payment intent for digital wallet payment
 *
 * @body {CreateWalletPaymentRequest} Payment creation request
 * @returns {WalletPaymentIntent} Payment intent with client secret
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
            message: "You must be logged in to create a wallet payment",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateWalletPaymentRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid wallet payment request",
            details: validation.error.errors,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    const { orderId, walletType, amount, currency, metadata } = validation.data;

    // Get user agent for wallet availability check
    const userAgent = request.headers.get("user-agent") || "";

    // Check if wallet is available on device
    const isAvailable = await digitalWalletService.isWalletAvailable(
      walletType,
      userAgent,
    );

    if (!isAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "WALLET_NOT_SUPPORTED",
            message: `${walletType} is not supported on this device`,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    // Create payment intent based on wallet type
    let paymentIntent;

    switch (walletType) {
      case "APPLE_PAY":
        paymentIntent = await digitalWalletService.createApplePayIntent({
          orderId,
          walletType,
          amount,
          currency,
          metadata: {
            ...metadata,
            userId: session.user.id,
            userEmail: session.user.email,
          },
        });
        break;

      case "GOOGLE_PAY":
        paymentIntent = await digitalWalletService.createGooglePayIntent({
          orderId,
          walletType,
          amount,
          currency,
          metadata: {
            ...metadata,
            userId: session.user.id,
            userEmail: session.user.email,
          },
        });
        break;

      case "PAYMENT_REQUEST":
        // Payment Request API uses generic card payment intent
        paymentIntent = await digitalWalletService.createGooglePayIntent({
          orderId,
          walletType: "PAYMENT_REQUEST",
          amount,
          currency,
          metadata: {
            ...metadata,
            userId: session.user.id,
            userEmail: session.user.email,
          },
        });
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_WALLET_TYPE",
              message: `Unknown wallet type: ${walletType}`,
              timestamp: new Date().toISOString(),
            },
          },
          { status: 400 },
        );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          paymentIntent,
          walletType,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: request.headers.get("x-request-id") || undefined,
          agricultural: {
            consciousness: "ACTIVE",
            season: "DIGITAL_HARVEST",
            blessing: "May your payment flow like water to fertile soil",
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Wallet payment intent creation failed", error, {
      operation: "createWalletPaymentIntent",
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
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "WALLET_PAYMENT_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to create wallet payment intent",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
