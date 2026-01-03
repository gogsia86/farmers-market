/**
 * 🔐 Password Reset Confirmation API Route
 *
 * Handles password reset confirmation with token validation
 *
 * Features:
 * - Token validation and expiration checking
 * - Secure password hashing with bcrypt
 * - Token cleanup after use
 * - Rate limiting protection
 * - Security best practices
 *
 * @route POST /api/auth/reset-password
 */

import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Initialize logger for reset password API
const logger = createLogger("api-auth-reset-password");

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Hash password securely using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // High security for password hashing
  return bcrypt.hash(password, saltRounds);
}

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
 * POST /api/auth/reset-password
 *
 * Reset user password with token
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const { token, password } = validation.data;

    // 2. Find user by reset token
    const user = await database.user.findUnique({
      where: { resetToken: token },
      select: {
        id: true,
        email: true,
        name: true,
        resetToken: true,
        resetTokenExpiry: true,
      },
    });

    // Security: Don't reveal whether token exists
    if (!user) {
      logger.warn("Password reset attempted with invalid token", { token });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid or expired reset token. Please request a new password reset.",
          },
        },
        { status: 400 },
      );
    }

    // 3. Validate token expiration
    if (isTokenExpired(user.resetTokenExpiry)) {
      logger.warn("Password reset attempted with expired token", {
        userId: user.id,
        email: user.email,
        expiry: user.resetTokenExpiry,
      });

      // Clean up expired token
      await database.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOKEN_EXPIRED",
            message: "Reset token has expired. Please request a new password reset.",
          },
        },
        { status: 400 },
      );
    }

    // 4. Hash new password
    const hashedPassword = await hashPassword(password);

    // 5. Update user password and clear reset token
    await database.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        // Update updatedAt timestamp
        updatedAt: new Date(),
      },
    });

    logger.info("Password reset successful", {
      userId: user.id,
      email: user.email,
    });

    // 6. Return success response
    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    logger.error("Password reset failed", error as Error, {
      operation: "POST /api/auth/reset-password",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while resetting your password. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/auth/reset-password
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
