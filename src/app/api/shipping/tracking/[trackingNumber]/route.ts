// src/app/api/shipping/tracking/[trackingNumber]/route.ts
import { ShippingService } from "@/lib/services/shipping.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/shipping/tracking/[trackingNumber]
 * Get tracking information for shipment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { trackingNumber: string } }
) {
  try {
    const { trackingNumber } = params;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Tracking number is required" },
        { status: 400 }
      );
    }

    // Get tracking info
    const tracking = await ShippingService.getTracking(trackingNumber);

    return NextResponse.json({
      success: true,
      tracking,
    });
  } catch (error) {
    console.error("Tracking retrieval error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve tracking",
      },
      { status: 500 }
    );
  }
}
