/**
 * 🔐 Email Verification API Route
 *
 * Handles email verification with token validation
 *
 * Features:
 * - Token validation and expiration checking
 * - User email verification status update
 * - Token cleanup after successful verification
 * - Security best practices
 *
 * @route POST /api/auth/verify-email
 */

import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Initialize logger for verify email API
const logger = createLogger("api-auth-verify-email");

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if token is expired
 */
function isTokenExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true;
  return new Date() > expiryDate;
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * POST /api/auth/verify-email
 *
 * Verify user email with token
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const validation = verifyEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid verification token",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const { token } = validation.data;

    // 2. Find user by verification token
    const user = await database.user.findUnique({
      where: { verificationToken: token },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        verificationToken: true,
        verificationExpiry: true,
      },
    });

    // Security: Don't reveal whether token exists
    if (!user) {
      logger.warn("Email verification attempted with invalid token", { token });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid or expired verification token. Please request a new verification email.",
          },
        },
        { status: 400 },
      );
    }

    // 3. Check if email is already verified
    if (user.emailVerified) {
      logger.info("Email verification attempted for already verified email", {
        userId: user.id,
        email: user.email,
      });

      // Clean up token
      await database.user.update({
        where: { id: user.id },
        data: {
          verificationToken: null,
          verificationExpiry: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Email is already verified. You can log in now.",
      });
    }

    // 4. Validate token expiration
    if (isTokenExpired(user.verificationExpiry)) {
      logger.warn("Email verification attempted with expired token", {
        userId: user.id,
        email: user.email,
        expiry: user.verificationExpiry,
      });

      // Clean up expired token
      await database.user.update({
        where: { id: user.id },
        data: {
          verificationToken: null,
          verificationExpiry: null,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOKEN_EXPIRED",
            message: "Verification token has expired. Please request a new verification email.",
          },
        },
        { status: 400 },
      );
    }

    // 5. Verify email and clear verification token
    await database.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
        updatedAt: new Date(),
      },
    });

    logger.info("Email verification successful", {
      userId: user.id,
      email: user.email,
    });

    // 6. Return success response
    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
      data: {
        email: user.email,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Email verification failed", error as Error, {
      operation: "POST /api/auth/verify-email",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while verifying your email. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/auth/verify-email
 *
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
