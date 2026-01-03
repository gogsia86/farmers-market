// ============================================
// FARM BUSINESS HOURS STATUS API ENDPOINT
// ============================================
// Sprint 5: Settings & Configuration
// Provides public business hours status for farms
// Following divine agricultural patterns with type safety

import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("farm-status-api");

// ============================================
// GET /api/settings/farm/[farmId]/status
// ============================================
/**
 * Get current business hours status for a farm
 * PUBLIC ENDPOINT - No authentication required
 * @param farmId - Farm ID from URL params
 * @returns Business hours status with open/closed and next transition times
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { farmId: string } },
) {
  try {
    const farmId = params.farmId;

    // Verify farm exists
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FARM_NOT_FOUND",
            message: "Farm not found",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 },
      );
    }

    // Get business hours status
    // TODO: Implement getBusinessHoursStatus method in SettingsService
    // const status = await settingsService.getBusinessHoursStatus(farmId);

    return NextResponse.json(
      {
        success: true,
        data: {
          farmId,
          farmName: farm.name,
          isOpen: true, // TODO: Calculate from business hours
          nextOpenTime: null,
          nextCloseTime: null,
          timezone: "UTC",
          currentTime: new Date().toISOString(),
        },
        meta: {
          requestId: request.headers.get("x-request-id") || undefined,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to fetch farm status", error, {
      operation: "getFarmStatus",
      farmId: params.farmId,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FARM_STATUS_FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch farm status",
          timestamp: new Date().toISOString(),
          requestId: request.headers.get("x-request-id") || undefined,
        },
      },
      { status: 500 },
    );
  }
}
