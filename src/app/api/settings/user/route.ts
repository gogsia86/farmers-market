// ============================================
// USER SETTINGS API ENDPOINT
// ============================================
// Sprint 5: Settings & Configuration
// Provides GET and PATCH operations for user settings
// Following divine agricultural patterns with type safety

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import { settingsService } from "@/lib/services/settings.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("user-settings-api");

// ============================================
// VALIDATION SCHEMAS
// ============================================

const NotificationChannelSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(["immediate", "daily", "weekly", "never"]),
  quietHours: z
    .object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    })
    .optional(),
});

const PushNotificationSchema = NotificationChannelSchema.extend({
  sound: z.boolean(),
  badge: z.boolean(),
});

const UpdateUserSettingsSchema = z.object({
  notifications: z
    .object({
      email: NotificationChannelSchema.optional(),
      sms: NotificationChannelSchema.optional(),
      push: PushNotificationSchema.optional(),
      inApp: NotificationChannelSchema.optional(),
    })
    .optional(),
  display: z
    .object({
      theme: z.enum(["light", "dark", "system"]).optional(),
      language: z.string().min(2).max(5).optional(),
      timezone: z.string().optional(),
      distanceUnit: z.enum(["miles", "kilometers"]).optional(),
      currency: z.string().length(3).optional(),
    })
    .optional(),
  privacy: z
    .object({
      profileVisibility: z.enum(["public", "friends", "private"]).optional(),
      showEmail: z.boolean().optional(),
      showPhone: z.boolean().optional(),
      allowMessaging: z.boolean().optional(),
      dataSharing: z.boolean().optional(),
    })
    .optional(),
  contactMethod: z.enum(["email", "sms", "both"]).optional(),
  communicationFrequency: z.enum(["minimal", "normal", "all"]).optional(),
});

// ============================================
// GET /api/settings/user
// ============================================
/**
 * Retrieve current user's settings
 * @returns UserSettings with all preferences
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to access settings",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 },
      );
    }

    // Retrieve user settings (creates defaults if not exist)
    const settings = await settingsService.getUserSettings(session.user.id);

    return NextResponse.json(
      {
        success: true,
        data: settings,
        meta: {
          requestId: request.headers.get("x-request-id") || undefined,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to fetch user settings", error, {
      operation: "getUserSettings",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "USER_SETTINGS_FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch user settings",
          timestamp: new Date().toISOString(),
          requestId: request.headers.get("x-request-id") || undefined,
        },
      },
      { status: 500 },
    );
  }
}

// ============================================
// PATCH /api/settings/user
// ============================================
/**
 * Update current user's settings
 * @body Partial<UserSettings> - Settings to update
 * @returns Updated UserSettings
 */
export async function PATCH(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to update settings",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validation = UpdateUserSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid settings data provided",
            details: validation.error.errors,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    const updates = validation.data;

    // Update user settings with service-level validation
    const updatedSettings = await settingsService.updateUserSettings(
      session.user.id,
      updates,
    );

    return NextResponse.json(
      {
        success: true,
        data: updatedSettings,
        meta: {
          requestId: request.headers.get("x-request-id") || undefined,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to update user settings", error, {
      operation: "updateUserSettings",
    });

    // Handle validation errors from service layer
    if (error instanceof Error && error.message.includes("Validation failed")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SETTINGS_VALIDATION_ERROR",
            message: error.message,
            timestamp: new Date().toISOString(),
            requestId: request.headers.get("x-request-id") || undefined,
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "USER_SETTINGS_UPDATE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update user settings",
          timestamp: new Date().toISOString(),
          requestId: request.headers.get("x-request-id") || undefined,
        },
      },
      { status: 500 },
    );
  }
}
