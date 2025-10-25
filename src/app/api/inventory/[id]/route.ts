/**
 * INVENTORY DETAIL API - Get, Update, Delete
 * Divine inventory item operations
 *
 * @divine-pattern RESTful CRUD operations
 * @reference .github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

import { InventoryService } from "@/lib/services/inventory.service";
import {
  InventoryStatus,
  QualityGrade,
  StorageCondition,
  UpdateInventoryInput,
  createInventoryId,
} from "@/types/inventory.types";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/inventory/[id] - Get inventory item by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const inventoryId = createInventoryId(params.id);
    const inventory = await InventoryService.getInventoryById(inventoryId);

    if (!inventory) {
      return NextResponse.json(
        {
          success: false,
          error: "Inventory item not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch inventory",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/inventory/[id] - Update inventory item
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const inventoryId = createInventoryId(params.id);

    const input: UpdateInventoryInput = {
      quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
      minimumStock:
        body.minimumStock !== undefined ? Number(body.minimumStock) : undefined,
      maximumStock:
        body.maximumStock !== undefined ? Number(body.maximumStock) : undefined,
      reorderPoint:
        body.reorderPoint !== undefined ? Number(body.reorderPoint) : undefined,
      qualityGrade: body.qualityGrade as QualityGrade | undefined,
      storageCondition: body.storageCondition as StorageCondition | undefined,
      locationId: body.locationId,
      costPerUnit:
        body.costPerUnit !== undefined ? Number(body.costPerUnit) : undefined,
      pricePerUnit:
        body.pricePerUnit !== undefined ? Number(body.pricePerUnit) : undefined,
      notes: body.notes,
      status: body.status as InventoryStatus | undefined,
    };

    const updated = await InventoryService.updateInventoryItem(
      inventoryId,
      input
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Inventory update error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update inventory",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/inventory/[id] - Delete inventory item
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const inventoryId = params.id;

    // In production, we'd use soft delete
    await database.inventory.delete({
      where: { id: inventoryId },
    });

    return NextResponse.json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Inventory deletion error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete inventory",
      },
      { status: 500 }
    );
  }
}
