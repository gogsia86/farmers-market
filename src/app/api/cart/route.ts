/**
 * 🛒 CART API ENDPOINT - Divine Shopping Cart Management
 * Handles cart operations with agricultural consciousness
 *
 * Routes:
 * - GET /api/cart - Get user's cart with all items
 * - POST /api/cart - Add item to cart
 * - PATCH /api/cart - Update cart item quantity
 * - DELETE /api/cart - Remove item from cart
 *
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 11_KILO_SCALE_ARCHITECTURE
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import type { FulfillmentMethod } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from '@/lib/monitoring/logger';

/**
 * 🔍 GET - Retrieve User's Cart
 */
export async function GET(request: NextRequest) {
  try {
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
        { status: 401 }
      );
    }

    // Get all cart items for user
    const cartItems = await database.cartItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: {
          include: {
            farm: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate cart totals
    const subtotal = cartItems.reduce((sum, item) => {
      const itemPrice = parseFloat(item.priceAtAdd.toString());
      const quantity = parseFloat(item.quantity.toString());
      return sum + itemPrice * quantity;
    }, 0);

    // Group by farm for delivery fee calculation
    const farmGroups = cartItems.reduce((groups, item) => {
      const farmId = item.farmId;
      if (!groups[farmId]) {
        groups[farmId] = {
          farmId,
          farmName: item.product.farm.name,
          items: [],
          subtotal: 0,
        };
      }
      groups[farmId].items.push(item);
      const itemTotal = parseFloat(item.priceAtAdd.toString()) * parseFloat(item.quantity.toString());
      groups[farmId].subtotal += itemTotal;
      return groups;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      data: {
        items: cartItems,
        itemCount: cartItems.length,
        subtotal,
        farmGroups: Object.values(farmGroups),
      },
      agricultural: {
        consciousness: "DIVINE",
        season: getCurrentSeason(),
      },
    });
  } catch (error) {
    logger.error("Cart retrieval error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CART_FETCH_ERROR",
          message: error instanceof Error ? error.message : "Failed to retrieve cart",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * ➕ POST - Add Item to Cart
 */
export async function POST(request: NextRequest) {
  try {
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
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validation schema
    const AddToCartSchema = z.object({
      productId: z.string().min(1),
      quantity: z.number().positive(),
      fulfillmentMethod: z.enum(["DELIVERY", "PICKUP", "SHIPPING"]).optional(),
    });

    const validation = AddToCartSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid cart item data",
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { productId, quantity, fulfillmentMethod } = validation.data;

    // Get product details
    const product = await database.product.findUnique({
      where: { id: productId },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product not found",
          },
        },
        { status: 404 }
      );
    }

    // Check product availability
    if (product.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PRODUCT_UNAVAILABLE",
            message: "This product is not currently available",
          },
        },
        { status: 400 }
      );
    }

    // Check farm status
    if (product.farm.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FARM_INACTIVE",
            message: "This farm is not currently active",
          },
        },
        { status: 400 }
      );
    }

    // Check inventory
    const availableQuantity = product.quantityAvailable
      ? parseFloat(product.quantityAvailable.toString())
      : 0;

    if (availableQuantity < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_INVENTORY",
            message: `Only ${availableQuantity} ${product.unit} available`,
          },
        },
        { status: 400 }
      );
    }

    // Check if item already in cart
    const existingCartItem = await database.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId: productId,
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update existing cart item
      const newQuantity = parseFloat(existingCartItem.quantity.toString()) + quantity;

      if (availableQuantity < newQuantity) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INSUFFICIENT_INVENTORY",
              message: `Cannot add more. Only ${availableQuantity} ${product.unit} available`,
            },
          },
          { status: 400 }
        );
      }

      cartItem = await database.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: newQuantity,
          updatedAt: new Date(),
        },
        include: {
          product: {
            include: {
              farm: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });
    } else {
      // Create new cart item
      const reservedUntil = new Date();
      reservedUntil.setMinutes(reservedUntil.getMinutes() + 30); // 30 minute reservation

      cartItem = await database.cartItem.create({
        data: {
          userId: session.user.id,
          productId: productId,
          farmId: product.farmId,
          quantity: quantity,
          unit: product.unit,
          priceAtAdd: product.price,
          fulfillmentMethod: (fulfillmentMethod || "DELIVERY") as FulfillmentMethod,
          reservedUntil,
        },
        include: {
          product: {
            include: {
              farm: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      // Increment cart add count for analytics
      await database.product.update({
        where: { id: productId },
        data: {
          cartAddsCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        cartItem,
        message: existingCartItem ? "Cart item updated" : "Item added to cart",
      },
      agricultural: {
        consciousness: "DIVINE",
        season: getCurrentSeason(),
      },
    });
  } catch (error) {
    logger.error("Add to cart error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CART_ADD_ERROR",
          message: error instanceof Error ? error.message : "Failed to add item to cart",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * ✏️ PATCH - Update Cart Item Quantity
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to update cart",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validation schema
    const UpdateCartSchema = z.object({
      cartItemId: z.string().min(1),
      quantity: z.number().positive(),
    });

    const validation = UpdateCartSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid update data",
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { cartItemId, quantity } = validation.data;

    // Get cart item
    const cartItem = await database.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CART_ITEM_NOT_FOUND",
            message: "Cart item not found",
          },
        },
        { status: 404 }
      );
    }

    // Verify ownership
    if (cartItem.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You can only update your own cart items",
          },
        },
        { status: 403 }
      );
    }

    // Check inventory
    const availableQuantity = cartItem.product.quantityAvailable
      ? parseFloat(cartItem.product.quantityAvailable.toString())
      : 0;

    if (availableQuantity < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_INVENTORY",
            message: `Only ${availableQuantity} ${cartItem.product.unit} available`,
          },
        },
        { status: 400 }
      );
    }

    // Update cart item
    const updatedCartItem = await database.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity,
        updatedAt: new Date(),
      },
      include: {
        product: {
          include: {
            farm: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        cartItem: updatedCartItem,
      },
      agricultural: {
        consciousness: "DIVINE",
        season: getCurrentSeason(),
      },
    });
  } catch (error) {
    logger.error("Cart update error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CART_UPDATE_ERROR",
          message: error instanceof Error ? error.message : "Failed to update cart item",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 🗑️ DELETE - Remove Item from Cart
 */
export async function DELETE(request: NextRequest) {
  try {
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
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get("cartItemId");

    if (!cartItemId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "cartItemId is required",
          },
        },
        { status: 400 }
      );
    }

    // Get cart item
    const cartItem = await database.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CART_ITEM_NOT_FOUND",
            message: "Cart item not found",
          },
        },
        { status: 404 }
      );
    }

    // Verify ownership
    if (cartItem.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You can only remove your own cart items",
          },
        },
        { status: 403 }
      );
    }

    // Delete cart item
    await database.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Item removed from cart",
      },
      agricultural: {
        consciousness: "DIVINE",
        season: getCurrentSeason(),
      },
    });
  } catch (error) {
    logger.error("Cart delete error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CART_DELETE_ERROR",
          message: error instanceof Error ? error.message : "Failed to remove cart item",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 🌾 Get current season helper
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "SUMMER";
  if (month >= 8 && month <= 10) return "FALL";
  return "WINTER";
}
