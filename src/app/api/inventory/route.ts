/**
 * INVENTORY API ROUTES - List & Create
 * Divine REST endpoints for inventory management
 *
 * @divine-pattern Server-side API with agricultural consciousness
 * @reference .github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

import { InventoryService } from "@/lib/services/inventory.service";
import {
  CreateInventoryInput,
  InventoryListParams,
  QualityGrade,
  StorageCondition,
} from "@/types/inventory.types";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/inventory - List inventory items with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const params: InventoryListParams = {
      farmId: searchParams.get("farmId") || undefined,
      productId: searchParams.get("productId") || undefined,
      status: searchParams.get("status")?.split(",") as any,
      season: searchParams.get("season")?.split(",") as any,
      qualityGrade: searchParams
        .get("qualityGrade")
        ?.split(",") as QualityGrade[],
      storageCondition: searchParams
        .get("storageCondition")
        ?.split(",") as StorageCondition[],
      locationId: searchParams.get("locationId") || undefined,
      isOrganic: searchParams.get("isOrganic") === "true" ? true : undefined,
      lowStock: searchParams.get("lowStock") === "true",
      expiringWithinDays: searchParams.get("expiringWithinDays")
        ? Number(searchParams.get("expiringWithinDays"))
        : undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
      sortBy: (searchParams.get("sortBy") as any) || "updatedAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    const result = await InventoryService.listInventory(params);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Inventory list error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to list inventory",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory - Create new inventory item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "productId",
      "farmId",
      "quantity",
      "unit",
      "qualityGrade",
      "storageCondition",
      "locationId",
      "minimumStock",
      "reorderPoint",
      "costPerUnit",
      "pricePerUnit",
      "isOrganic",
    ];

    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    const input: CreateInventoryInput = {
      productId: body.productId,
      farmId: body.farmId,
      quantity: Number(body.quantity),
      unit: body.unit,
      batchId: body.batchId,
      harvestDate: body.harvestDate ? new Date(body.harvestDate) : undefined,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      qualityGrade: body.qualityGrade as QualityGrade,
      storageCondition: body.storageCondition as StorageCondition,
      locationId: body.locationId,
      minimumStock: Number(body.minimumStock),
      reorderPoint: Number(body.reorderPoint),
      costPerUnit: Number(body.costPerUnit),
      pricePerUnit: Number(body.pricePerUnit),
      isOrganic: Boolean(body.isOrganic),
      certifications: body.certifications || [],
      notes: body.notes,
    };

    const inventoryItem = await InventoryService.createInventoryItem(input);

    return NextResponse.json(
      {
        success: true,
        data: inventoryItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Inventory creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create inventory",
      },
      { status: 500 }
    );
  }
}
