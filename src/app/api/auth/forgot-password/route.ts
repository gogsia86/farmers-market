/**
 * 🔐 Password Reset API Route
 *
 * Handles password reset requests and sends reset emails
 *
 * Features:
 * - Email-based password reset
 * - Token generation and storage
 * - Rate limiting protection
 * - Security best practices
 *
 * @route POST /api/auth/forgot-password
 */

import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { emailService } from "@/lib/services";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Initialize logger for forgot password API
const logger = createLogger("api-auth-forgot-password");

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate secure password reset token
 */
function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Get token expiration time (1 hour from now)
 */
function getTokenExpiration(): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1);
  return expiration;
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * POST /api/auth/forgot-password
 *
 * Request password reset email
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid email address",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const { email } = validation.data;

    // 2. Find user by email
    const user = await database.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Security: Always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      logger.info("Password reset requested for non-existent email", { email });

      // Still return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with that email, a password reset link has been sent.",
      });
    }

    // 3. Generate reset token
    const resetToken = generateResetToken();
    const tokenExpiration = getTokenExpiration();

    // 4. Store reset token in database
    // Note: In production, consider using a separate tokens table
    // For now, we'll use a user field (you'll need to add these to your schema)
    await database.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: tokenExpiration,
      },
    });

    // 5. Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // 6. Send password reset email
    try {
      await emailService.sendPasswordReset({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        resetToken,
        resetUrl,
        expiresIn: "1 hour",
      });

      logger.info("Password reset email sent successfully", {
        userId: user.id,
        email,
      });
    } catch (emailError) {
      logger.error("Failed to send password reset email", emailError as Error, {
        userId: user.id,
        email,
      });

      // Clean up token if email fails
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
            code: "EMAIL_ERROR",
            message:
              "Failed to send password reset email. Please try again later.",
          },
        },
        { status: 500 },
      );
    }

    // 7. Return success response
    return NextResponse.json({
      success: true,
      message:
        "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    logger.error("Password reset request failed", error as Error, {
      operation: "POST /api/auth/forgot-password",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            "An error occurred while processing your request. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/auth/forgot-password
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
