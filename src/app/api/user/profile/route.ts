/**
 * 👤 USER PROFILE API ENDPOINT - Divine User Management
 * Handles user profile operations with agricultural consciousness
 *
 * Routes:
 * - GET /api/user/profile - Get current user profile
 * - PATCH /api/user/profile - Update user profile
 *
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 11_KILO_SCALE_ARCHITECTURE
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from '@/lib/monitoring/logger';

/**
 * 🔍 GET - Retrieve Current User Profile
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to view profile",
          },
        },
        { status: 401 }
      );
    }

    // Get user with all relevant data
    const user = await database.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
        // Include addresses
        addresses: {
          orderBy: {
            createdAt: "desc",
          },
        },
        // Include farms if farmer
        farms: {
          where: {
            status: { not: "SUSPENDED" },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            verificationStatus: true,
            logoUrl: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        },
        { status: 404 }
      );
    }

    // Get user statistics
    const [orderCount, reviewCount, favoriteCount] = await Promise.all([
      database.order.count({
        where: {
          customerId: user.id,
        },
      }),
      database.review.count({
        where: {
          customerId: user.id,
        },
      }),
      database.favorite.count({
        where: {
          userId: user.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        user,
        statistics: {
          orderCount,
          reviewCount,
          favoriteCount,
        },
      },
      agricultural: {
        consciousness: "DIVINE",
        season: getCurrentSeason(),
      },
    });
  } catch (error) {
    logger.error("Profile retrieval error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PROFILE_FETCH_ERROR",
          message: error instanceof Error ? error.message : "Failed to retrieve profile",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * ✏️ PATCH - Update User Profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to update profile",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validation schema
    const UpdateProfileSchema = z.object({
      firstName: z.string().min(1).max(100).optional(),
      lastName: z.string().min(1).max(100).optional(),
      name: z.string().min(1).max(255).optional(),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional().nullable(),
      avatar: z.string().url().max(500).optional().nullable(),
      email: z.string().email().max(255).optional(),
      currentPassword: z.string().optional(),
      newPassword: z.string().min(8).max(100).optional(),
    }).refine(
      (data) => {
        // If changing password, current password is required
        if (data.newPassword && !data.currentPassword) {
          return false;
        }
        return true;
      },
      {
        message: "Current password is required to set a new password",
        path: ["currentPassword"],
      }
    );

    const validation = UpdateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid profile data",
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword, email, ...profileUpdates } = validation.data;

    // Get current user
    const currentUser = await database.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        },
        { status: 404 }
      );
    }

    const updates: any = { ...profileUpdates };

    // Handle password change
    if (newPassword && currentPassword) {
      if (!currentUser.password) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "PASSWORD_NOT_SET",
              message: "Cannot change password for OAuth accounts",
            },
          },
          { status: 400 }
        );
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        currentUser.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_PASSWORD",
              message: "Current password is incorrect",
            },
          },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.password = hashedPassword;
    }

    // Handle email change
    if (email && email !== currentUser.email) {
      // Check if email already exists
      const existingUser = await database.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "EMAIL_ALREADY_EXISTS",
              message: "This email is already in use",
            },
          },
          { status: 400 }
        );
      }

      updates.email = email;
      updates.emailVerified = null; // Require re-verification
    }

    // Update user profile
    const updatedUser = await database.user.update({
      where: { id: session.user.id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        message: "Profile updated successfully",
      },
      agricultural: {
        consciousness: "DIVINE",
        season: getCurrentSeason(),
      },
    });
  } catch (error) {
    logger.error("Profile update error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PROFILE_UPDATE_ERROR",
          message: error instanceof Error ? error.message : "Failed to update profile",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 🌾 Get current season helper
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "SUMMER";
  if (month >= 8 && month <= 10) return "FALL";
  return "WINTER";
}
