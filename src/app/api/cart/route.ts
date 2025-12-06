/**
 * 🛒 CART API ROUTES
 * GET: Fetch user's cart with full details
 * POST: Add item to cart
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cartService } from "@/lib/services/cart.service";
import { z } from "zod";

// ============================================================================
// GET /api/cart - Fetch user's cart
// ============================================================================

export async function GET() {
  try {
    // Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to view your cart",
          },
        },
        { status: 401 },
      );
    }

    // Fetch cart
    const cart = await cartService.getCart(session.user.id);

    return NextResponse.json({
      success: true,
      data: cart,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CART_FETCH_ERROR",
          message: "Failed to fetch cart",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST /api/cart - Add item to cart
// ============================================================================

const AddToCartRequestSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1").max(1000),
  fulfillmentMethod: z
    .enum(["DELIVERY", "FARM_PICKUP", "MARKET_PICKUP"])
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to add items to cart",
          },
        },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = AddToCartRequestSchema.safeParse(body);

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

    // Add to cart
    const result = await cartService.addToCart(
      session.user.id,
      validation.data,
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ADD_TO_CART_ERROR",
            message: result.error || "Failed to add item to cart",
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.cartItem,
        message: "Item added to cart successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ADD_TO_CART_ERROR",
          message: "Failed to add item to cart",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// DELETE /api/cart - Clear entire cart
// ============================================================================

export async function DELETE() {
  try {
    // Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to clear cart",
          },
        },
        { status: 401 },
      );
    }

    // Clear cart
    const result = await cartService.clearCart(session.user.id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CART_CLEAR_ERROR",
            message: result.error || "Failed to clear cart",
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CART_CLEAR_ERROR",
          message: "Failed to clear cart",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}
