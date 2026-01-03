/**
 * 🛒 CART ITEM API ROUTES
 * PUT: Update cart item quantity
 * DELETE: Remove cart item
 */

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import { cartService } from "@/lib/services/cart.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Initialize structured logger
const logger = createLogger("cart-item-api");

// ============================================================================
// PUT /api/cart/[itemId] - Update cart item quantity
// ============================================================================

const UpdateCartItemSchema = z.object({
  quantity: z.number().min(0, "Quantity cannot be negative").max(1000),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } },
) {
  try {
    // Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to update cart items",
          },
        },
        { status: 401 },
      );
    }

    const { itemId } = params;

    if (!itemId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Cart item ID is required",
          },
        },
        { status: 400 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = UpdateCartItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validation.error.issues,
          },
        },
        { status: 400 },
      );
    }

    // Update cart item
    const result = await cartService.updateCartItem(
      session.user.id,
      itemId,
      validation.data,
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UPDATE_CART_ITEM_ERROR",
            message: result.error || "Failed to update cart item",
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cart item updated successfully",
    });
  } catch (error) {
    logger.error("Failed to update cart item", error as Error, {
      operation: "PUT /api/cart/[itemId]",
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_CART_ITEM_ERROR",
          message: "Failed to update cart item",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// DELETE /api/cart/[itemId] - Remove cart item
// ============================================================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { itemId: string } },
) {
  try {
    // Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to remove cart items",
          },
        },
        { status: 401 },
      );
    }

    const { itemId } = params;

    if (!itemId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Cart item ID is required",
          },
        },
        { status: 400 },
      );
    }

    // Remove cart item
    const result = await cartService.removeCartItem(session.user.id, itemId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REMOVE_CART_ITEM_ERROR",
            message: result.error || "Failed to remove cart item",
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cart item removed successfully",
    });
  } catch (error) {
    logger.error("Failed to remove cart item", error as Error, {
      operation: "DELETE /api/cart/[itemId]",
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REMOVE_CART_ITEM_ERROR",
          message: "Failed to remove cart item",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}
