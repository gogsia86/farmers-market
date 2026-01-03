// ============================================
// FARM SETTINGS API ENDPOINT
// ============================================
// Sprint 5: Settings & Configuration
// Provides GET and PATCH operations for farm settings
// Following divine agricultural patterns with type safety

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { settingsService } from "@/lib/services/settings.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("farm-settings-api");

// ============================================
// VALIDATION SCHEMAS
// ============================================

const BusinessHoursSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  timezone: z.string(),
  isClosed: z.boolean(),
  effectiveFrom: z
    .union([z.string().datetime(), z.date()])
    .transform((val) => (typeof val === "string" ? new Date(val) : val))
    .optional(),
  effectiveTo: z
    .union([z.string().datetime(), z.date()])
    .transform((val) => (typeof val === "string" ? new Date(val) : val))
    .optional(),
});

const UpdateFarmSettingsSchema = z.object({
  businessHours: z.array(BusinessHoursSchema).optional(),
  deliveryAreas: z.array(z.string()).optional(),
  deliveryFee: z.number().min(0).optional(),
  minOrderValue: z.number().min(0).optional(),
  acceptedPaymentMethods: z
    .array(z.enum(["CASH", "CARD", "MOBILE", "BANK_TRANSFER"]))
    .optional(),
  requireDepositOnOrders: z.boolean().optional(),
  depositPercentage: z.number().min(0).max(100).optional(),
  policies: z
    .object({
      returnPolicy: z.string().optional(),
      cancellationPolicy: z.string().optional(),
      termsAndConditions: z.string().optional(),
    })
    .optional(),
  features: z
    .object({
      enablePreOrders: z.boolean().optional(),
      enableSubscriptions: z.boolean().optional(),
      enableGiftCards: z.boolean().optional(),
    })
    .optional(),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Verify farm ownership
 */
async function verifyFarmOwnership(
  farmId: string,
  userId: string,
): Promise<{ authorized: boolean; farm?: any }> {
  const farm = await database.farm.findUnique({
    where: { id: farmId },
    select: {
      id: true,
      name: true,
      ownerId: true,
    },
  });

  if (!farm) {
    return { authorized: false };
  }

  if (farm.ownerId !== userId) {
    return { authorized: false, farm };
  }

  return { authorized: true, farm };
}

// ============================================
// GET /api/settings/farm/[farmId]
// ============================================
/**
 * Retrieve farm settings
 * @param farmId - Farm ID from URL params
 * @returns FarmSettings with business hours, delivery, policies
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { farmId: string } },
) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to access farm settings",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 },
      );
    }

    const farmId = params.farmId;

    // Verify farm ownership
    const { authorized, farm } = await verifyFarmOwnership(
      farmId,
      session.user.id,
    );

    if (!authorized) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_ERROR",
            message: farm
              ? "You do not have permission to access this farm's settings"
              : "Farm not found",
            timestamp: new Date().toISOString(),
          },
        },
        { status: farm ? 403 : 404 },
      );
    }

    // Retrieve farm settings (creates defaults if not exist)
    const settings = await settingsService.getFarmSettings(farmId);

    return NextResponse.json(
      {
        success: true,
        data: settings,
        meta: {
          farmId,
          farmName: farm.name,
          requestId: request.headers.get("x-request-id") || undefined,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to fetch farm settings", error, {
      operation: "getFarmSettings",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FARM_SETTINGS_FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch farm settings",
          timestamp: new Date().toISOString(),
          requestId: request.headers.get("x-request-id") || undefined,
        },
      },
      { status: 500 },
    );
  }
}

// ============================================
// PATCH /api/settings/farm/[farmId]
// ============================================
/**
 * Update farm settings
 * @param farmId - Farm ID from URL params
 * @body Partial<FarmSettings> - Settings to update
 * @returns Updated FarmSettings
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { farmId: string } },
) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to update farm settings",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 },
      );
    }

    const farmId = params.farmId;

    // Verify farm ownership
    const { authorized, farm } = await verifyFarmOwnership(
      farmId,
      session.user.id,
    );

    if (!authorized) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_ERROR",
            message: farm
              ? "You do not have permission to update this farm's settings"
              : "Farm not found",
            timestamp: new Date().toISOString(),
          },
        },
        { status: farm ? 403 : 404 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validation = UpdateFarmSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid farm settings data provided",
            details: validation.error.errors,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    const updates = validation.data as any;

    // Update farm settings with service-level validation
    const updatedSettings = await settingsService.updateFarmSettings(
      farmId,
      updates,
    );

    return NextResponse.json(
      {
        success: true,
        data: updatedSettings,
        meta: {
          farmId,
          farmName: farm.name,
          requestId: request.headers.get("x-request-id") || undefined,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to update farm settings", error, {
      operation: "updateFarmSettings",
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
          code: "FARM_SETTINGS_UPDATE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update farm settings",
          timestamp: new Date().toISOString(),
          requestId: request.headers.get("x-request-id") || undefined,
        },
      },
      { status: 500 },
    );
  }
}
