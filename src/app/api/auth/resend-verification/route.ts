/**
 * 🔐 Resend Verification Email API Route
 *
 * Handles resending email verification links
 *
 * Features:
 * - Rate limiting to prevent abuse
 * - Token regeneration
 * - Email sending via email service
 * - Security best practices
 *
 * @route POST /api/auth/resend-verification
 */

import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { emailService } from "@/lib/services";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Initialize logger for resend verification API
const logger = createLogger("api-auth-resend-verification");

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate secure verification token
 */
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Get token expiration time (24 hours from now)
 */
function getTokenExpiration(): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 24);
  return expiration;
}

/**
 * Check if user can request new verification (rate limiting)
 * Prevents abuse - allow max 1 request per 5 minutes
 */
async function canRequestVerification(userId: string): Promise<boolean> {
  // Check if user has recently requested verification
  const recentRequest = await database.user.findUnique({
    where: { id: userId },
    select: { updatedAt: true },
  });

  if (!recentRequest) return false;

  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

  return recentRequest.updatedAt < fiveMinutesAgo;
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * POST /api/auth/resend-verification
 *
 * Resend email verification link
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const validation = resendVerificationSchema.safeParse(body);

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
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        verificationToken: true,
        verificationExpiry: true,
      },
    });

    // Security: Always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      logger.info("Verification resend requested for non-existent email", { email });

      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, a verification link has been sent.",
      });
    }

    // 3. Check if email is already verified
    if (user.emailVerified) {
      logger.info("Verification resend requested for already verified email", {
        userId: user.id,
        email,
      });

      return NextResponse.json({
        success: true,
        message: "Your email is already verified. You can log in now.",
      });
    }

    // 4. Rate limiting check
    const canRequest = await canRequestVerification(user.id);
    if (!canRequest) {
      logger.warn("Rate limit exceeded for verification resend", {
        userId: user.id,
        email,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Please wait a few minutes before requesting another verification email.",
          },
        },
        { status: 429 },
      );
    }

    // 5. Generate new verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiration = getTokenExpiration();

    // 6. Update user with new token
    await database.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpiry: tokenExpiration,
        updatedAt: new Date(), // For rate limiting
      },
    });

    // 7. Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    // 8. Send verification email
    try {
      await emailService.sendEmailVerification({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        verificationToken,
        verificationUrl,
        expiresIn: "24 hours",
      });

      logger.info("Verification email resent successfully", {
        userId: user.id,
        email,
      });
    } catch (emailError) {
      logger.error("Failed to send verification email", emailError as Error, {
        userId: user.id,
        email,
      });

      // Don't clean up token if email fails - user might retry
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_ERROR",
            message: "Failed to send verification email. Please try again later.",
          },
        },
        { status: 500 },
      );
    }

    // 9. Return success response
    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully. Please check your inbox.",
      data: {
        email: user.email,
        expiresIn: "24 hours",
      },
    });
  } catch (error) {
    logger.error("Resend verification request failed", error as Error, {
      operation: "POST /api/auth/resend-verification",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while processing your request. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/auth/resend-verification
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
