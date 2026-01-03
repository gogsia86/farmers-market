/**
 * 💰 PAYOUT SCHEDULE API - Divine Agricultural Finance Management
 *
 * Manages farmer payout schedule configuration
 * GET: Retrieves current payout schedule
 * PUT: Updates payout schedule with validation
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("farmer-payout-schedule-api");

// ✅ VALIDATION SCHEMA - Divine Input Validation
const PayoutScheduleSchema = z.object({
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  minimumAmount: z.number().min(10).max(10000),
});

const GetRequestSchema = z.object({
  farmId: z.string().cuid(),
});

const PutRequestSchema = z.object({
  farmId: z.string().cuid(),
  schedule: PayoutScheduleSchema,
});

/**
 * GET /api/farmer/payout-schedule
 * Retrieves payout schedule for a farm
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Authentication required",
          },
        },
        { status: 401 },
      );
    }

    // Extract and validate farmId from query params
    const searchParams = request.nextUrl.searchParams;
    const farmId = searchParams.get("farmId");

    const validation = GetRequestSchema.safeParse({ farmId });
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid farm ID",
            details: validation.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    logger.debug("Fetching payout schedule", {
      userId: session.user.id,
      farmId: validation.data.farmId,
    });

    // Verify farm ownership
    const farm = await database.farm.findUnique({
      where: { id: validation.data.farmId },
      select: {
        id: true,
        ownerId: true,
        payoutSchedule: true,
      },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FARM_NOT_FOUND",
            message: "Farm not found",
          },
        },
        { status: 404 },
      );
    }

    if (farm.ownerId !== session.user.id) {
      logger.warn("Unauthorized payout schedule access attempt", {
        userId: session.user.id,
        farmId: validation.data.farmId,
        farmOwnerId: farm.ownerId,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_ERROR",
            message: "You do not have permission to access this farm",
          },
        },
        { status: 403 },
      );
    }

    logger.info("Payout schedule fetched successfully", {
      userId: session.user.id,
      farmId: farm.id,
      hasSchedule: !!farm.payoutSchedule,
    });

    // Return payout schedule
    return NextResponse.json({
      success: true,
      schedule: farm.payoutSchedule || null,
    });
  } catch (error) {
    logger.error("Error fetching payout schedule", error as Error, {
      endpoint: "GET /api/farmer/payout-schedule",
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch payout schedule",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/farmer/payout-schedule
 * Updates payout schedule for a farm
 */
export async function PUT(request: NextRequest) {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Authentication required",
          },
        },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = PutRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validation.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const { farmId, schedule } = validation.data;

    logger.debug("Updating payout schedule", {
      userId: session.user.id,
      farmId,
      frequency: schedule.frequency,
    });

    // Verify farm ownership
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      select: {
        id: true,
        ownerId: true,
      },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FARM_NOT_FOUND",
            message: "Farm not found",
          },
        },
        { status: 404 },
      );
    }

    if (farm.ownerId !== session.user.id) {
      logger.warn("Unauthorized payout schedule update attempt", {
        userId: session.user.id,
        farmId,
        farmOwnerId: farm.ownerId,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_ERROR",
            message: "You do not have permission to modify this farm",
          },
        },
        { status: 403 },
      );
    }

    // Additional validation based on frequency
    if (schedule.frequency === "WEEKLY" && !schedule.dayOfWeek) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "dayOfWeek is required for WEEKLY frequency",
          },
        },
        { status: 400 },
      );
    }

    if (schedule.frequency === "MONTHLY" && !schedule.dayOfMonth) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "dayOfMonth is required for MONTHLY frequency",
          },
        },
        { status: 400 },
      );
    }

    // Update farm with new payout schedule
    const updatedFarm = await database.farm.update({
      where: { id: farmId },
      data: {
        payoutSchedule: schedule as any,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        payoutSchedule: true,
      },
    });

    logger.info("Payout schedule updated successfully", {
      userId: session.user.id,
      farmId: updatedFarm.id,
      frequency: schedule.frequency,
      minimumAmount: schedule.minimumAmount,
    });

    return NextResponse.json({
      success: true,
      data: {
        farmId: updatedFarm.id,
        schedule: updatedFarm.payoutSchedule,
      },
      message: "Payout schedule updated successfully",
    });
  } catch (error) {
    logger.error("Error updating payout schedule", error as Error, {
      endpoint: "PUT /api/farmer/payout-schedule",
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update payout schedule",
        },
      },
      { status: 500 },
    );
  }
}
