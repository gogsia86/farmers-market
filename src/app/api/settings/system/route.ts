// ============================================
// SYSTEM SETTINGS API ENDPOINT
// ============================================
// Sprint 5: Settings & Configuration
// Provides GET operation for public system settings
// Following divine agricultural patterns with type safety

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import { settingsService } from "@/lib/services/settings.service";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("system-settings-api");

// ============================================
// GET /api/settings/system
// ============================================
/**
 * Retrieve public system settings
 * PUBLIC ENDPOINT - Returns only public settings without authentication
 * @returns Public system settings (non-sensitive configuration)
 */
export async function GET(request: NextRequest) {
  try {
    // Get public system settings (no authentication required)
    const settings = await settingsService.getPublicSystemSettings();

    // Transform array to object for easier consumption
    const settingsObject = settings.reduce(
      (acc: Record<string, any>, setting: { key: string; value: any }) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, any>,
    );

    return NextResponse.json(
      {
        success: true,
        data: settingsObject,
        meta: {
          count: settings.length,
          requestId: request.headers.get("x-request-id") || undefined,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to fetch system settings", error, {
      operation: "getSystemSettings",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SYSTEM_SETTINGS_FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch system settings",
          timestamp: new Date().toISOString(),
          requestId: request.headers.get("x-request-id") || undefined,
        },
      },
      { status: 500 },
    );
  }
}

// ============================================
// GET /api/settings/system?key=SETTING_KEY
// ============================================
/**
 * Retrieve a specific system setting by key
 * Supports query parameter: ?key=SETTING_KEY
 */
export async function GET_BY_KEY(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAMETER",
            message: "Setting key is required",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    // Get specific system setting
    const setting = await settingsService.getSystemSetting(key);

    if (!setting) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SETTING_NOT_FOUND",
            message: `System setting '${key}' not found`,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 },
      );
    }

    // Check if setting is public
    if (!setting.isPublic) {
      // Verify admin authentication for private settings
      const session = await auth();
      if (!session?.user?.role || session.user.role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTHORIZATION_ERROR",
              message: "This setting is not publicly accessible",
              timestamp: new Date().toISOString(),
            },
          },
          { status: 403 },
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          key: setting.key,
          value: setting.value,
          type: setting.type,
          category: setting.category,
        },
        meta: {
          requestId: request.headers.get("x-request-id") || undefined,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to fetch system setting", error, {
      operation: "getSystemSettingByKey",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SYSTEM_SETTING_FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch system setting",
          timestamp: new Date().toISOString(),
          requestId: request.headers.get("x-request-id") || undefined,
        },
      },
      { status: 500 },
    );
  }
}
