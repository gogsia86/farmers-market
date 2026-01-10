/**
 * User Notifications Preferences API
 * GET: Fetch user notification preferences
 * PATCH: Update user notification preferences
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/monitoring/logger";

// ============================================================================
// Validation Schema
// ============================================================================

const NotificationsSchema = z.object({
  emailEnabled: z.boolean().optional(),
  emailFrequency: z.enum(["immediate", "daily", "weekly", "never"]).optional(),
  emailQuietHoursStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .optional(),
  emailQuietHoursEnd: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .optional(),
  smsEnabled: z.boolean().optional(),
  smsFrequency: z.enum(["immediate", "daily", "weekly", "never"]).optional(),
  smsQuietHoursStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .optional(),
  smsQuietHoursEnd: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .optional(),
  pushEnabled: z.boolean().optional(),
  pushFrequency: z.enum(["immediate", "daily", "weekly", "never"]).optional(),
  pushQuietHoursStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .optional(),
  pushQuietHoursEnd: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .optional(),
  inAppEnabled: z.boolean().optional(),
  inAppSound: z.boolean().optional(),
  inAppBadge: z.boolean().optional(),
});

type NotificationsInput = z.infer<typeof NotificationsSchema>;

// ============================================================================
// GET /api/user/notifications - Get user notification preferences
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
        { status: 401 },
      );
    }

    // Fetch user notification preferences from NotificationPreferencesV2
    const notificationPrefs =
      await database.notificationPreferencesV2.findUnique({
        where: { userId: session.user.id },
        select: {
          id: true,
          emailEnabled: true,
          emailFrequency: true,
          emailQuietHoursStart: true,
          emailQuietHoursEnd: true,
          smsEnabled: true,
          smsFrequency: true,
          smsQuietHoursStart: true,
          smsQuietHoursEnd: true,
          pushEnabled: true,
          pushFrequency: true,
          pushQuietHoursStart: true,
          pushQuietHoursEnd: true,
          inAppEnabled: true,
          inAppSound: true,
          inAppBadge: true,
        },
      });

    // If no preferences exist, create defaults
    if (!notificationPrefs) {
      const newPrefs = await database.notificationPreferencesV2.create({
        data: {
          userId: session.user.id,
          emailEnabled: true,
          emailFrequency: "immediate",
          smsEnabled: false,
          smsFrequency: "immediate",
          pushEnabled: true,
          pushFrequency: "immediate",
          inAppEnabled: true,
          inAppSound: true,
          inAppBadge: true,
        },
        select: {
          id: true,
          emailEnabled: true,
          emailFrequency: true,
          emailQuietHoursStart: true,
          emailQuietHoursEnd: true,
          smsEnabled: true,
          smsFrequency: true,
          smsQuietHoursStart: true,
          smsQuietHoursEnd: true,
          pushEnabled: true,
          pushFrequency: true,
          pushQuietHoursStart: true,
          pushQuietHoursEnd: true,
          inAppEnabled: true,
          inAppSound: true,
          inAppBadge: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: newPrefs,
      });
    }

    return NextResponse.json({
      success: true,
      data: notificationPrefs,
    });
  } catch (error) {
    logger.error("Failed to fetch notification preferences:", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_NOTIFICATIONS_ERROR",
          message: "Failed to fetch notification preferences",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// PATCH /api/user/notifications - Update user notification preferences
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
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = NotificationsSchema.parse(body);

    // Check if preferences exist
    const existingPrefs = await database.notificationPreferencesV2.findUnique({
      where: { userId: session.user.id },
    });

    let updatedPrefs;

    if (!existingPrefs) {
      // Create new preferences with defaults and provided data
      updatedPrefs = await database.notificationPreferencesV2.create({
        data: {
          userId: session.user.id,
          emailEnabled: validatedData.emailEnabled ?? true,
          emailFrequency: validatedData.emailFrequency || "immediate",
          emailQuietHoursStart: validatedData.emailQuietHoursStart ?? null,
          emailQuietHoursEnd: validatedData.emailQuietHoursEnd ?? null,
          smsEnabled: validatedData.smsEnabled ?? false,
          smsFrequency: validatedData.smsFrequency || "immediate",
          smsQuietHoursStart: validatedData.smsQuietHoursStart ?? null,
          smsQuietHoursEnd: validatedData.smsQuietHoursEnd ?? null,
          pushEnabled: validatedData.pushEnabled ?? true,
          pushFrequency: validatedData.pushFrequency || "immediate",
          pushQuietHoursStart: validatedData.pushQuietHoursStart ?? null,
          pushQuietHoursEnd: validatedData.pushQuietHoursEnd ?? null,
          inAppEnabled: validatedData.inAppEnabled ?? true,
          inAppSound: validatedData.inAppSound ?? true,
          inAppBadge: validatedData.inAppBadge ?? true,
        },
        select: {
          id: true,
          emailEnabled: true,
          emailFrequency: true,
          emailQuietHoursStart: true,
          emailQuietHoursEnd: true,
          smsEnabled: true,
          smsFrequency: true,
          smsQuietHoursStart: true,
          smsQuietHoursEnd: true,
          pushEnabled: true,
          pushFrequency: true,
          pushQuietHoursStart: true,
          pushQuietHoursEnd: true,
          inAppEnabled: true,
          inAppSound: true,
          inAppBadge: true,
        },
      });
    } else {
      // Update existing preferences (only provided fields)
      const updateData: any = {};

      if (validatedData.emailEnabled !== undefined)
        updateData.emailEnabled = validatedData.emailEnabled;
      if (validatedData.emailFrequency !== undefined)
        updateData.emailFrequency = validatedData.emailFrequency;
      if (validatedData.emailQuietHoursStart !== undefined)
        updateData.emailQuietHoursStart = validatedData.emailQuietHoursStart;
      if (validatedData.emailQuietHoursEnd !== undefined)
        updateData.emailQuietHoursEnd = validatedData.emailQuietHoursEnd;
      if (validatedData.smsEnabled !== undefined)
        updateData.smsEnabled = validatedData.smsEnabled;
      if (validatedData.smsFrequency !== undefined)
        updateData.smsFrequency = validatedData.smsFrequency;
      if (validatedData.smsQuietHoursStart !== undefined)
        updateData.smsQuietHoursStart = validatedData.smsQuietHoursStart;
      if (validatedData.smsQuietHoursEnd !== undefined)
        updateData.smsQuietHoursEnd = validatedData.smsQuietHoursEnd;
      if (validatedData.pushEnabled !== undefined)
        updateData.pushEnabled = validatedData.pushEnabled;
      if (validatedData.pushFrequency !== undefined)
        updateData.pushFrequency = validatedData.pushFrequency;
      if (validatedData.pushQuietHoursStart !== undefined)
        updateData.pushQuietHoursStart = validatedData.pushQuietHoursStart;
      if (validatedData.pushQuietHoursEnd !== undefined)
        updateData.pushQuietHoursEnd = validatedData.pushQuietHoursEnd;
      if (validatedData.inAppEnabled !== undefined)
        updateData.inAppEnabled = validatedData.inAppEnabled;
      if (validatedData.inAppSound !== undefined)
        updateData.inAppSound = validatedData.inAppSound;
      if (validatedData.inAppBadge !== undefined)
        updateData.inAppBadge = validatedData.inAppBadge;

      updatedPrefs = await database.notificationPreferencesV2.update({
        where: { userId: session.user.id },
        data: updateData,
        select: {
          id: true,
          emailEnabled: true,
          emailFrequency: true,
          emailQuietHoursStart: true,
          emailQuietHoursEnd: true,
          smsEnabled: true,
          smsFrequency: true,
          smsQuietHoursStart: true,
          smsQuietHoursEnd: true,
          pushEnabled: true,
          pushFrequency: true,
          pushQuietHoursStart: true,
          pushQuietHoursEnd: true,
          inAppEnabled: true,
          inAppSound: true,
          inAppBadge: true,
        },
      });
    }

    logger.info("User notification preferences updated", {
      userId: session.user.id,
      preferences: Object.keys(validatedData),
    });

    return NextResponse.json({
      success: true,
      data: updatedPrefs,
      message: "Notification preferences updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid notification preferences",
            details: error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    logger.error("Failed to update notification preferences:", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_NOTIFICATIONS_ERROR",
          message: "Failed to update notification preferences",
        },
      },
      { status: 500 },
    );
  }
}
