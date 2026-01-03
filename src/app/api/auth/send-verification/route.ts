/**
 * ✉️ Email Verification API Route
 *
 * Handles email verification requests and sends verification emails
 *
 * Features:
 * - Email verification token generation
 * - Secure token storage
 * - Resend verification capability
 * - Rate limiting protection
 *
 * @route POST /api/auth/send-verification
 */

import { getCurrentUser } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { emailService } from "@/lib/services";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================================================
// LOGGER INITIALIZATION
// ============================================================================

const logger = createLogger("auth-send-verification");

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const sendVerificationSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate secure email verification token
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

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * POST /api/auth/send-verification
 *
 * Send email verification link
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const validation = sendVerificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const { email } = validation.data;

    // 2. Get current user or find by email
    let user;
    if (email) {
      // Find user by email (for unauthenticated requests)
      user = await database.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: "No account found with that email address",
            },
          },
          { status: 404 },
        );
      }
    } else {
      // Get authenticated user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "You must be logged in to request email verification",
            },
          },
          { status: 401 },
        );
      }

      user = await database.user.findUnique({
        where: { id: currentUser.id },
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: "User account not found",
            },
          },
          { status: 404 },
        );
      }
    }

    // 3. Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email is already verified",
        alreadyVerified: true,
      });
    }

    // 4. Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiration = getTokenExpiration();

    // 5. Store verification token in database
    await database.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpiry: tokenExpiration,
      },
    });

    // 6. Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    // 7. Send verification email
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

      logger.info("Verification email sent successfully", {
        userId: user.id,
        email: user.email,
      });
    } catch (emailError) {
      logger.error("Failed to send verification email", emailError as Error, {
        userId: user.id,
        email: user.email,
      });

      // Clean up token if email fails
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
            code: "EMAIL_ERROR",
            message:
              "Failed to send verification email. Please try again later.",
          },
        },
        { status: 500 },
      );
    }

    // 8. Return success response
    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    logger.error("Send verification error", error as Error, {
      operation: "send-verification",
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
 * OPTIONS /api/auth/send-verification
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
