// src/app/api/shipping/calculate/route.ts
import { ShippingService } from "@/lib/services/shipping.service";
import type { CalculateShippingInput } from "@/types/shipping.types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CalculateShippingSchema = z.object({
  farmId: z.string().min(1, "Farm ID is required"),
  deliveryZipCode: z.string().regex(/^\d{5}$/, "Invalid ZIP code format"),
  orderWeight: z.number().positive("Weight must be positive"),
  orderValue: z.number().positive("Order value must be positive"),
  deliveryMethod: z.enum([
    "STANDARD",
    "EXPRESS",
    "LOCAL_PICKUP",
    "FARM_PICKUP",
  ]),
});

/**
 * POST /api/shipping/calculate
 * Calculate shipping rates for order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = CalculateShippingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input: CalculateShippingInput = validation.data;

    // Calculate shipping rates
    const rates = await ShippingService.calculateRates(input);

    return NextResponse.json({
      success: true,
      rates,
    });
  } catch (error) {
    console.error("Shipping calculation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to calculate shipping",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/shipping/calculate?farmId=...&zipCode=...&weight=...&value=...
 * Get all available shipping methods
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const farmId = searchParams.get("farmId");
    const zipCode = searchParams.get("zipCode");
    const weight = Number(searchParams.get("weight"));
    const value = Number(searchParams.get("value"));

    if (!farmId || !zipCode || !weight || !value) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get available methods
    const methods = await ShippingService.getAvailableMethods(
      farmId,
      zipCode,
      weight,
      value
    );

    return NextResponse.json({
      success: true,
      methods,
    });
  } catch (error) {
    console.error("Get shipping methods error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get shipping methods",
      },
      { status: 500 }
    );
  }
}
