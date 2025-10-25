// src/app/api/shipping/pickup-locations/[farmId]/route.ts
import { ShippingService } from "@/lib/services/shipping.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/shipping/pickup-locations/[farmId]
 * Get pickup locations for farm
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { farmId: string } }
) {
  try {
    const { farmId } = params;

    // Get pickup locations
    const locations = await ShippingService.getPickupLocations(farmId);

    return NextResponse.json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error("Get pickup locations error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get pickup locations",
      },
      { status: 500 }
    );
  }
}
