/**
 * INVENTORY METRICS API
 * Divine business intelligence and analytics
 *
 * @divine-pattern Quantum metrics aggregation
 * @reference .github/instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md
 */

import { InventoryService } from "@/lib/services/inventory.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/inventory/metrics - Get inventory analytics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const farmId = searchParams.get("farmId");

    if (!farmId) {
      return NextResponse.json(
        {
          success: false,
          error: "farmId is required",
        },
        { status: 400 }
      );
    }

    const metrics = await InventoryService.getInventoryMetrics(farmId);

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Inventory metrics error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch metrics",
      },
      { status: 500 }
    );
  }
}
