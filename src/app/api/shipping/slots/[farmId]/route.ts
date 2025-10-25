// src/app/api/shipping/slots/[farmId]/route.ts
import { ShippingService } from "@/lib/services/shipping.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/shipping/slots/[farmId]?start=...&end=...
 * Get available delivery slots for farm
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { farmId: string } }
) {
  try {
    const { farmId } = params;
    const { searchParams } = new URL(request.url);

    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: "Start and end dates are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(startParam);
    const endDate = new Date(endParam);

    // Get delivery slots
    const slots = await ShippingService.getDeliverySlots(
      farmId,
      startDate,
      endDate
    );

    return NextResponse.json({
      success: true,
      slots,
    });
  } catch (error) {
    console.error("Get delivery slots error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get delivery slots",
      },
      { status: 500 }
    );
  }
}
