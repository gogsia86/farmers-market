/**
 * ============================================================================
 * BIODYNAMIC CALENDAR API - Divine Agricultural Consciousness
 * ============================================================================
 *
 * RESTful API for lunar cycle tracking and biodynamic farming recommendations
 *
 * Endpoints:
 * - GET: Retrieve biodynamic calendar data
 * - POST: Create/update calendar entries
 */

import { BiodynamicCalendarService } from "@/lib/services/biodynamic-calendar.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/agricultural/biodynamic-calendar
 *
 * Query params:
 * - farmId: string (required)
 * - date: ISO date string (optional, defaults to today)
 * - startDate: ISO date string (for range queries)
 * - endDate: ISO date string (for range queries)
 * - type: 'today' | 'range' | 'planting' | 'harvest'
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const farmId = searchParams.get("farmId");
    const type = searchParams.get("type") || "today";

    if (!farmId) {
      return NextResponse.json(
        { error: "farmId is required" },
        { status: 400 },
      );
    }

    switch (type) {
      case "today": {
        const guidance =
          await BiodynamicCalendarService.getTodaysGuidance(farmId);
        return NextResponse.json({ data: guidance });
      }

      case "range": {
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");

        if (!startDateParam || !endDateParam) {
          return NextResponse.json(
            { error: "startDate and endDate are required for range queries" },
            { status: 400 },
          );
        }

        const startDate = new Date(startDateParam);
        const endDate = new Date(endDateParam);

        const calendars = await BiodynamicCalendarService.getCalendarRange(
          farmId,
          startDate,
          endDate,
        );

        return NextResponse.json({ data: calendars });
      }

      case "planting": {
        const days = parseInt(searchParams.get("days") || "30");
        const optimalDates =
          await BiodynamicCalendarService.getOptimalPlantingDates(farmId, days);
        return NextResponse.json({ data: optimalDates });
      }

      case "harvest": {
        const days = parseInt(searchParams.get("days") || "30");
        const optimalDates =
          await BiodynamicCalendarService.getOptimalHarvestDates(farmId, days);
        return NextResponse.json({ data: optimalDates });
      }

      default:
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Biodynamic calendar GET error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/agricultural/biodynamic-calendar
 *
 * Create or update biodynamic calendar entry
 *
 * Body:
 * - farmId: string (required)
 * - date: ISO date string (required)
 * - userId: string (required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { farmId, date, userId } = body;

    if (!farmId || !date || !userId) {
      return NextResponse.json(
        { error: "farmId, date, and userId are required" },
        { status: 400 },
      );
    }

    const calendar = await BiodynamicCalendarService.createOrUpdateCalendar(
      farmId,
      new Date(date),
      userId,
    );

    return NextResponse.json(
      { data: calendar, message: "Biodynamic calendar updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Biodynamic calendar POST error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
