/**
 * 🔐 FORGOT PASSWORD API ENDPOINT
 * Handles password reset requests by sending reset emails
 *
 * POST /api/auth/forgot-password
 * Body: { email: string }
 *
 * Features:
 * - Email validation
 * - Password reset token generation
 * - Email sending via notification service
 * - Security: Returns success even if email not found (prevent user enumeration)
 */

import { database } from "@/lib/database";
import { emailService } from "@/lib/services/email.service";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { logger } from '@/lib/monitoring/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email format
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await database.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Security: Always return success to prevent user enumeration
    // Even if user doesn't exist, return 200 to avoid leaking info
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive password reset instructions.",
      });
    }

    // Generate password reset token (32 bytes = 64 hex characters)
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save reset token to database
    await database.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Generate reset URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      await emailService.sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        template: "password_reset",
        data: {
          userName: user.name || "there",
          resetUrl: resetUrl,
          expiryTime: "1 hour",
        },
      });

      logger.info(`Password reset email sent to: ${user.email}`);
    } catch (emailError) {
      logger.error("Failed to send password reset email", {
        error: emailError instanceof Error ? emailError.message : String(emailError)
      });
      // Still return success to user (they don't need to know email failed)
      // But log the error for admin monitoring
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive password reset instructions.",
    });
  } catch (error) {
    logger.error("Forgot password error", {
      error: error instanceof Error ? error.message : String(error)
    });
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
