/**
 * User Settings API
 * GET: Fetch user settings
 * PATCH: Update user settings
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/monitoring/logger";

// ============================================================================
// Validation Schema
// ============================================================================

const SettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  distanceUnit: z.enum(["miles", "kilometers"]).optional(),
  profileVisibility: z.enum(["public", "friends", "private"]).optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  allowMessaging: z.boolean().optional(),
  dataSharing: z.boolean().optional(),
  contactMethod: z.enum(["email", "sms", "both"]).optional(),
  communicationFrequency: z.enum(["minimal", "normal", "all"]).optional(),
});

type SettingsInput = z.infer<typeof SettingsSchema>;

// ============================================================================
// GET /api/user/settings - Get user settings
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

    // Fetch user with settings relation
    const userSettings = await database.userSettings.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        theme: true,
        language: true,
        timezone: true,
        currency: true,
        distanceUnit: true,
        profileVisibility: true,
        showEmail: true,
        showPhone: true,
        allowMessaging: true,
        dataSharing: true,
        contactMethod: true,
        communicationFrequency: true,
      },
    });

    // If no settings exist, create defaults
    if (!userSettings) {
      const newSettings = await database.userSettings.create({
        data: {
          userId: session.user.id,
          theme: "system",
          language: "en",
          timezone: "America/New_York",
          currency: "USD",
          distanceUnit: "miles",
          profileVisibility: "public",
          showEmail: false,
          showPhone: false,
          allowMessaging: true,
          dataSharing: false,
          contactMethod: "email",
          communicationFrequency: "normal",
        },
        select: {
          id: true,
          theme: true,
          language: true,
          timezone: true,
          currency: true,
          distanceUnit: true,
          profileVisibility: true,
          showEmail: true,
          showPhone: true,
          allowMessaging: true,
          dataSharing: true,
          contactMethod: true,
          communicationFrequency: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: newSettings,
      });
    }

    return NextResponse.json({
      success: true,
      data: userSettings,
    });
  } catch (error) {
    logger.error("Failed to fetch user settings:", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_SETTINGS_ERROR",
          message: "Failed to fetch settings",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// PATCH /api/user/settings - Update user settings
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
    const validatedData = SettingsSchema.parse(body);

    // Check if settings exist
    const existingSettings = await database.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    let updatedSettings;

    if (!existingSettings) {
      // Create new settings with defaults and provided data
      updatedSettings = await database.userSettings.create({
        data: {
          userId: session.user.id,
          theme: validatedData.theme || "system",
          language: validatedData.language || "en",
          timezone: validatedData.timezone || "America/New_York",
          currency: validatedData.currency || "USD",
          distanceUnit: validatedData.distanceUnit || "miles",
          profileVisibility: validatedData.profileVisibility || "public",
          showEmail: validatedData.showEmail ?? false,
          showPhone: validatedData.showPhone ?? false,
          allowMessaging: validatedData.allowMessaging ?? true,
          dataSharing: validatedData.dataSharing ?? false,
          contactMethod: validatedData.contactMethod || "email",
          communicationFrequency:
            validatedData.communicationFrequency || "normal",
        },
        select: {
          id: true,
          theme: true,
          language: true,
          timezone: true,
          currency: true,
          distanceUnit: true,
          profileVisibility: true,
          showEmail: true,
          showPhone: true,
          allowMessaging: true,
          dataSharing: true,
          contactMethod: true,
          communicationFrequency: true,
        },
      });
    } else {
      // Update existing settings
      updatedSettings = await database.userSettings.update({
        where: { userId: session.user.id },
        data: validatedData,
        select: {
          id: true,
          theme: true,
          language: true,
          timezone: true,
          currency: true,
          distanceUnit: true,
          profileVisibility: true,
          showEmail: true,
          showPhone: true,
          allowMessaging: true,
          dataSharing: true,
          contactMethod: true,
          communicationFrequency: true,
        },
      });
    }

    logger.info("User settings updated", {
      userId: session.user.id,
      settings: Object.keys(validatedData),
    });

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid settings data",
            details: error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    logger.error("Failed to update user settings:", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_SETTINGS_ERROR",
          message: "Failed to update settings",
        },
      },
      { status: 500 },
    );
  }
}
