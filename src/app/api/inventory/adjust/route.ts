/**
 * INVENTORY STOCK ADJUSTMENT API
 * Divine stock operations (adjust, reserve, release)
 *
 * @divine-pattern Transaction-based stock management
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 */

import { InventoryService } from "@/lib/services/inventory.service";
import {
  AdjustStockInput,
  createInventoryId,
  InsufficientStockError,
  InvalidQuantityError,
  ReleaseStockInput,
  ReserveStockInput,
  StockMovementType,
} from "@/types/inventory.types";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/inventory/adjust - Adjust stock quantity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { action } = body;

    switch (action) {
      case "adjust": {
        const input: AdjustStockInput = {
          inventoryItemId: createInventoryId(body.inventoryItemId),
          quantityChange: Number(body.quantityChange),
          type: body.type as StockMovementType,
          reason: body.reason,
          referenceId: body.referenceId,
          referenceType: body.referenceType,
          performedBy: body.performedBy,
          notes: body.notes,
        };

        const result = await InventoryService.adjustStock(input);

        return NextResponse.json({
          success: true,
          data: result,
          message: "Stock adjusted successfully",
        });
      }

      case "reserve": {
        const input: ReserveStockInput = {
          inventoryItemId: createInventoryId(body.inventoryItemId),
          quantity: Number(body.quantity),
          referenceId: body.referenceId,
          referenceType: "ORDER",
          performedBy: body.performedBy,
        };

        const result = await InventoryService.reserveStock(input);

        return NextResponse.json({
          success: true,
          data: result,
          message: "Stock reserved successfully",
        });
      }

      case "release": {
        const input: ReleaseStockInput = {
          inventoryItemId: createInventoryId(body.inventoryItemId),
          quantity: Number(body.quantity),
          referenceId: body.referenceId,
          performedBy: body.performedBy,
        };

        const result = await InventoryService.releaseStock(input);

        return NextResponse.json({
          success: true,
          data: result,
          message: "Stock released successfully",
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unknown action: ${action}. Valid actions: adjust, reserve, release`,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Stock adjustment error:", error);

    if (error instanceof InsufficientStockError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: {
            requested: error.requested,
            available: error.available,
            inventoryId: error.inventoryId,
          },
        },
        { status: 400 }
      );
    }

    if (error instanceof InvalidQuantityError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to adjust stock",
      },
      { status: 500 }
    );
  }
}
