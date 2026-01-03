import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("user-password-api");

/**
 * PUT /api/users/password
 *
 * Change authenticated user's password
 * Requires: currentPassword, newPassword
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Current password and new password are required",
        },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "New password must be at least 8 characters",
        },
        { status: 400 },
      );
    }

    // Fetch user with password
    const user = await database.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Check if user has a password (OAuth users might not)
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Password change not available for social login accounts. Please contact support.",
        },
        { status: 400 },
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await database.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    logger.error("Password change failed", error, {
      operation: "changePassword",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to change password",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
