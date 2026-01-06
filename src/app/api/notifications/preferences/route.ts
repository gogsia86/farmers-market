/**
 * Notification Preferences API
 * GET: Get user notification preferences
 * PATCH: Update user notification preferences
 */

import { auth } from "@/lib/auth";
import { notificationService } from "@/lib/services/notification.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// Validation Schemas
// ============================================================================

const UpdatePreferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  emailFrequency: z.enum(["immediate", "daily", "weekly", "never"]).optional(),
  pushEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  orderUpdates: z.boolean().optional(),
  reviewNotifications: z.boolean().optional(),
  promotions: z.boolean().optional(),
  systemAnnouncements: z.boolean().optional(),
});

// ============================================================================
// GET /api/notifications/preferences
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const preferences = await notificationService.getUserPreferences(
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    logger.error("Failed to fetch notification preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_PREFERENCES_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch notification preferences",
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/notifications/preferences
// ============================================================================

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = UpdatePreferencesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid preferences data",
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    await notificationService.updateUserPreferences(
      session.user.id,
      validation.data
    );

    const updatedPreferences = await notificationService.getUserPreferences(
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: updatedPreferences,
    });
  } catch (error) {
    logger.error("Failed to update notification preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_PREFERENCES_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update notification preferences",
        },
      },
      { status: 500 }
    );
  }
}
