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
import { notificationService } from "@/lib/services/notification.service";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

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
      console.log(`Password reset requested for non-existent email: ${email}`);
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
      await notificationService.sendEmail({
        to: user.email,
        subject: "Password Reset Request - Farmers Market Platform",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Reset Request</title>
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset Request</h1>
              </div>

              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hello ${user.name || "there"},</p>

                <p style="font-size: 16px; margin-bottom: 20px;">
                  We received a request to reset your password for your Farmers Market Platform account.
                </p>

                <p style="font-size: 16px; margin-bottom: 30px;">
                  Click the button below to reset your password. This link will expire in <strong>1 hour</strong>.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}"
                     style="display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                    Reset Password
                  </a>
                </div>

                <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="font-size: 12px; color: #10b981; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 5px;">
                  ${resetUrl}
                </p>

                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 30px; border-radius: 5px;">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">
                    <strong>⚠️ Didn't request this?</strong><br>
                    If you didn't request a password reset, please ignore this email or contact support if you have concerns. Your password will remain unchanged.
                  </p>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
                  <p style="margin: 5px 0;">🌾 Farmers Market Platform</p>
                  <p style="margin: 5px 0;">Connecting local farmers with communities</p>
                  <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} All rights reserved</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
Password Reset Request

Hello ${user.name || "there"},

We received a request to reset your password for your Farmers Market Platform account.

Click the link below to reset your password. This link will expire in 1 hour.

${resetUrl}

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

---
Farmers Market Platform
Connecting local farmers with communities
        `,
      });

      console.log(`Password reset email sent to: ${user.email}`);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Still return success to user (they don't need to know email failed)
      // But log the error for admin monitoring
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive password reset instructions.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
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
