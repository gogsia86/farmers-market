/**
 * 🛒 CART SERVICE - Divine Agricultural Commerce
 * Comprehensive cart management with database sync, stock validation, and quantum persistence
 *
 * Features:
 * - Database persistence for authenticated users
 * - localStorage fallback for guests
 * - Stock validation and reservation
 * - Farm availability checking
 * - Price consistency validation
 * - Cart merging on login
 * - Agricultural consciousness patterns
 */

import { database } from "@/lib/database";
import type { FulfillmentMethod } from "@prisma/client";
import { z } from "zod";

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export interface CartItemData {
  id: string;
  productId: string;
  farmId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image?: string;
  farmName?: string;
  organic?: boolean;
  inStock: boolean;
  maxQuantity?: number;
  fulfillmentMethod?: FulfillmentMethod;
}

export interface CartSummary {
  items: CartItemData[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  farmCount: number;
}

const AddToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z
    .number()
    .min(1, "Quantity must be at least 1")
    .max(1000, "Quantity too large"),
  fulfillmentMethod: z
    .enum(["DELIVERY", "FARM_PICKUP", "MARKET_PICKUP"])
    .optional(),
});

const UpdateCartItemSchema = z.object({
  quantity: z
    .number()
    .min(0, "Quantity cannot be negative")
    .max(1000, "Quantity too large"),
});

// ============================================================================
// CART SERVICE CLASS
// ============================================================================

export class CartService {
  /**
   * Get user's cart with full product details
   */
  async getCart(userId: string): Promise<CartSummary> {
    const cartItems = await database.cartItem.findMany({
      where: {
        userId,
        // Only get non-expired reservations
        OR: [{ reservedUntil: null }, { reservedUntil: { gte: new Date() } }],
      },
      include: {
        product: {
          include: {
            farm: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Transform to CartItemData
    const items: CartItemData[] = cartItems.map((item) => {
      const { product } = item;
      const quantityNum = Number(item.quantity);
      const priceNum = Number(item.priceAtAdd);
      const availableQuantity = product.quantityAvailable
        ? Number(product.quantityAvailable)
        : 0;

      return {
        id: item.id,
        productId: item.productId,
        farmId: item.farmId,
        name: product.name,
        price: priceNum,
        quantity: quantityNum,
        unit: item.unit,
        image: product.images?.[0] || product.primaryPhotoUrl || undefined,
        farmName: product.farm.name,
        organic: product.organic || false,
        inStock: availableQuantity >= quantityNum,
        maxQuantity: availableQuantity,
        fulfillmentMethod: item.fulfillmentMethod,
      };
    });

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Tax calculation (8% - should be location-based in production)
    const tax = subtotal * 0.08;

    // Delivery fee (varies by farm and fulfillment method)
    const deliveryFee = this.calculateDeliveryFee(items);

    const total = subtotal + tax + deliveryFee;

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const farmCount = new Set(items.map((item) => item.farmId)).size;

    return {
      items,
      subtotal,
      tax,
      deliveryFee,
      total,
      itemCount,
      farmCount,
    };
  }

  /**
   * Add item to cart with stock validation
   */
  async addToCart(
    userId: string,
    data: z.infer<typeof AddToCartSchema>,
  ): Promise<{ success: boolean; cartItem?: CartItemData; error?: string }> {
    // Validate input
    const validation = AddToCartSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid input",
      };
    }

    const { productId, quantity, fulfillmentMethod } = validation.data;

    try {
      // Fetch product with farm info
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
        return { success: false, error: "Product not found" };
      }

      // Validate farm is active
      if (product.farm.status !== "ACTIVE") {
        return {
          success: false,
          error: "Farm is not currently accepting orders",
        };
      }

      // Validate stock availability
      const availableQuantity = product.quantityAvailable
        ? Number(product.quantityAvailable)
        : 0;

      // Check existing cart quantity
      const existingCartItem = await database.cartItem.findFirst({
        where: { userId, productId },
      });

      const currentCartQuantity = existingCartItem
        ? Number(existingCartItem.quantity)
        : 0;
      const totalQuantity = currentCartQuantity + quantity;

      if (totalQuantity > availableQuantity) {
        return {
          success: false,
          error: `Only ${availableQuantity} units available`,
        };
      }

      // Check if item already exists
      const existingItem = await database.cartItem.findFirst({
        where: { userId, productId },
      });

      let cartItem;
      if (existingItem) {
        // Update existing item
        cartItem = await database.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: { increment: quantity },
            priceAtAdd: product.price,
            unit: product.unit,
            updatedAt: new Date(),
          },
          include: {
            product: {
              include: {
                farm: {
                  select: {
                    id: true,
                    name: true,
                    status: true,
                  },
                },
              },
            },
          },
        });
      } else {
        // Create new item
        cartItem = await database.cartItem.create({
          data: {
            userId,
            productId,
            farmId: product.farmId,
            quantity,
            unit: product.unit,
            priceAtAdd: product.price,
            fulfillmentMethod: fulfillmentMethod || "DELIVERY",
          },
          include: {
            product: {
              include: {
                farm: {
                  select: {
                    id: true,
                    name: true,
                    status: true,
                  },
                },
              },
            },
          },
        });
      }

      return {
        success: true,
        cartItem: {
          id: cartItem.id,
          productId: cartItem.productId,
          farmId: cartItem.farmId,
          name: cartItem.product.name,
          price: Number(cartItem.priceAtAdd),
          quantity: Number(cartItem.quantity),
          unit: cartItem.unit,
          image:
            cartItem.product.images?.[0] ||
            cartItem.product.primaryPhotoUrl ||
            undefined,
          farmName: cartItem.product.farm.name,
          organic: cartItem.product.organic || false,
          inStock: true,
          maxQuantity: availableQuantity,
          fulfillmentMethod: cartItem.fulfillmentMethod,
        },
      };
    } catch (error) {
      console.error("Error adding to cart:", error);
      return {
        success: false,
        error: "Failed to add item to cart",
      };
    }
  }

  /**
   * Update cart item quantity with validation
   */
  async updateCartItem(
    userId: string,
    cartItemId: string,
    data: z.infer<typeof UpdateCartItemSchema>,
  ): Promise<{ success: boolean; error?: string }> {
    const validation = UpdateCartItemSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid quantity",
      };
    }

    const { quantity } = validation.data;

    try {
      // If quantity is 0, remove the item
      if (quantity === 0) {
        return await this.removeCartItem(userId, cartItemId);
      }

      // Get cart item with product info
      const cartItem = await database.cartItem.findUnique({
        where: { id: cartItemId },
        include: {
          product: true,
        },
      });

      if (!cartItem) {
        return { success: false, error: "Cart item not found" };
      }

      // Verify ownership
      if (cartItem.userId !== userId) {
        return { success: false, error: "Unauthorized" };
      }

      // Validate stock
      const availableQuantity = cartItem.product.quantityAvailable
        ? Number(cartItem.product.quantityAvailable)
        : 0;

      if (quantity > availableQuantity) {
        return {
          success: false,
          error: `Only ${availableQuantity} units available`,
        };
      }

      // Update quantity
      await database.cartItem.update({
        where: { id: cartItemId },
        data: {
          quantity,
          priceAtAdd: cartItem.product.price, // Update price in case it changed
          updatedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating cart item:", error);
      return { success: false, error: "Failed to update cart item" };
    }
  }

  /**
   * Remove item from cart
   */
  async removeCartItem(
    userId: string,
    cartItemId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify ownership before deleting
      const cartItem = await database.cartItem.findUnique({
        where: { id: cartItemId },
        select: { userId: true },
      });

      if (!cartItem) {
        return { success: false, error: "Cart item not found" };
      }

      if (cartItem.userId !== userId) {
        return { success: false, error: "Unauthorized" };
      }

      await database.cartItem.delete({
        where: { id: cartItemId },
      });

      return { success: true };
    } catch (error) {
      console.error("Error removing cart item:", error);
      return { success: false, error: "Failed to remove cart item" };
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await database.cartItem.deleteMany({
        where: { userId },
      });

      return { success: true };
    } catch (error) {
      console.error("Error clearing cart:", error);
      return { success: false, error: "Failed to clear cart" };
    }
  }

  /**
   * Merge guest cart with user cart on login
   */
  async mergeGuestCart(
    userId: string,
    guestCartItems: Array<{
      productId: string;
      quantity: number;
      fulfillmentMethod?: FulfillmentMethod;
    }>,
  ): Promise<{ success: boolean; merged: number; error?: string }> {
    try {
      let mergedCount = 0;

      for (const item of guestCartItems) {
        const result = await this.addToCart(userId, {
          productId: item.productId,
          quantity: item.quantity,
          fulfillmentMethod: item.fulfillmentMethod,
        });

        if (result.success) {
          mergedCount++;
        }
      }

      return { success: true, merged: mergedCount };
    } catch (error) {
      console.error("Error merging guest cart:", error);
      return { success: false, merged: 0, error: "Failed to merge cart" };
    }
  }

  /**
   * Validate cart before checkout
   */
  async validateCart(userId: string): Promise<{
    valid: boolean;
    issues: Array<{ itemId: string; message: string }>;
  }> {
    const issues: Array<{ itemId: string; message: string }> = [];

    const cartItems = await database.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            farm: true,
          },
        },
      },
    });

    for (const item of cartItems) {
      const product = item.product;
      const farm = product.farm;
      const quantity = Number(item.quantity);
      const availableQuantity = product.quantityAvailable
        ? Number(product.quantityAvailable)
        : 0;

      // Check farm status
      if (farm.status !== "ACTIVE") {
        issues.push({
          itemId: item.id,
          message: `${farm.name} is not currently accepting orders`,
        });
      }

      // Check stock
      if (quantity > availableQuantity) {
        issues.push({
          itemId: item.id,
          message: `Only ${availableQuantity} units of ${product.name} available`,
        });
      }

      // Check price changes
      const priceAtAdd = Number(item.priceAtAdd);
      const currentPrice = Number(product.price);
      if (Math.abs(currentPrice - priceAtAdd) > 0.01) {
        issues.push({
          itemId: item.id,
          message: `Price of ${product.name} has changed from $${priceAtAdd} to $${currentPrice}`,
        });
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Reserve cart items (temporary stock hold before payment)
   */
  async reserveCartItems(
    userId: string,
    reservationMinutes: number = 15,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const reservedUntil = new Date();
      reservedUntil.setMinutes(reservedUntil.getMinutes() + reservationMinutes);

      await database.cartItem.updateMany({
        where: { userId },
        data: { reservedUntil },
      });

      return { success: true };
    } catch (error) {
      console.error("Error reserving cart items:", error);
      return { success: false, error: "Failed to reserve items" };
    }
  }

  /**
   * Release cart item reservations
   */
  async releaseReservations(userId: string): Promise<{ success: boolean }> {
    try {
      await database.cartItem.updateMany({
        where: { userId },
        data: { reservedUntil: null },
      });

      return { success: true };
    } catch (error) {
      console.error("Error releasing reservations:", error);
      return { success: false };
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Calculate delivery fee based on cart items
   */
  private calculateDeliveryFee(items: CartItemData[]): number {
    // Group by farm and fulfillment method
    const farmGroups = items.reduce(
      (acc, item) => {
        const key = `${item.farmId}-${item.fulfillmentMethod}`;
        if (!acc[key]) {
          acc[key] = {
            farmId: item.farmId,
            method: item.fulfillmentMethod,
            total: 0,
          };
        }
        acc[key].total += item.price * item.quantity;
        return acc;
      },
      {} as Record<
        string,
        { farmId: string; method?: FulfillmentMethod; total: number }
      >,
    );

    // Calculate fee per farm
    let totalFee = 0;
    for (const key in farmGroups) {
      const group = farmGroups[key];
      if (!group) continue;

      // Pickup is free, delivery has a base fee + distance fee
      if (group.method === "FARM_PICKUP" || group.method === "MARKET_PICKUP") {
        // No fee for pickup
        continue;
      }

      // Delivery fee calculation
      // Delivery fee: $5 base, free over $50
      if (group.total < 50) {
        totalFee += 5;
      }
    }

    return totalFee;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const cartService = new CartService();
