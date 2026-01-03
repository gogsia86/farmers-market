/**
 * 🛒 CART SERVICE - Divine Agricultural Commerce
 * Comprehensive cart management with BaseService patterns, tracing, and caching
 *
 * Features:
 * - Database persistence for authenticated users
 * - Stock validation and reservation
 * - Farm availability checking
 * - Price consistency validation
 * - Cart merging on login
 * - OpenTelemetry tracing
 * - Service-level caching
 * - Agricultural consciousness patterns
 * - ServiceResponse pattern for type-safe responses
 *
 * @extends BaseService
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 */

import { BaseService } from "@/lib/services/base.service";
import type {
  ServiceResponse,
  ServiceSuccessResponse,
  ServiceErrorResponse,
} from "@/lib/types/service-response";
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

export interface ValidationIssue {
  itemId: string;
  message: string;
}

export interface CartValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
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

export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;

// ============================================================================
// CART SERVICE CLASS
// ============================================================================

export class CartService extends BaseService<CartItemData> {
  constructor() {
    super({
      serviceName: "CartService",
      cacheTTL: 3600, // 1 hour
      cachePrefix: "cart",
      enableCaching: true,
      enableTracing: true,
      enableAgriculturalConsciousness: true,
    });
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Get user's cart with full product details
   * Implements caching for performance
   *
   * @param userId - User ID
   * @returns ServiceResponse with CartSummary
   */
  async getCart(userId: string): Promise<ServiceResponse<CartSummary>> {
    return this.traced("getCart", async () => {
      this.setTraceAttributes({
        "cart.userId": userId,
        "cart.operation": "get",
      });

      // Try cache first
      const cacheKey = this.getCacheKey(`user:${userId}`);
      const cached = await this.cache.get<CartSummary>(cacheKey);

      if (cached) {
        this.setTraceAttributes({ "cache.hit": true });
        this.logger.debug("Cart retrieved from cache", {
          userId,
          cached: true,
        });

        return this.success(cached, {
          cached: true,
          message: "Cart retrieved from cache",
        });
      }

      this.setTraceAttributes({ "cache.hit": false });

      try {
        const cartItems = await database.cartItem.findMany({
          where: {
            userId,
            // Only get non-expired reservations
            OR: [
              { reservedUntil: null },
              { reservedUntil: { gte: new Date() } },
            ],
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

        const cartSummary: CartSummary = {
          items,
          subtotal,
          tax,
          deliveryFee,
          total,
          itemCount,
          farmCount,
        };

        // Cache the result
        await this.cache.set(cacheKey, cartSummary, this.cacheTTL);

        this.setTraceAttributes({
          "cart.itemCount": itemCount,
          "cart.farmCount": farmCount,
          "cart.total": total,
        });

        this.logger.info("Cart retrieved successfully", {
          userId,
          itemCount,
          farmCount,
          total,
        });

        return this.success(cartSummary, {
          cached: false,
          message: "Cart retrieved successfully",
        });
      } catch (error) {
        this.logger.error("Failed to retrieve cart", error, { userId });
        return this.error("CART_RETRIEVAL_ERROR", "Failed to retrieve cart", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }

  /**
   * Add item to cart with stock validation
   *
   * @param userId - User ID
   * @param data - Add to cart data
   * @returns ServiceResponse with CartItemData
   */
  async addToCart(
    userId: string,
    data: AddToCartInput,
  ): Promise<ServiceResponse<CartItemData>> {
    return this.traced("addToCart", async () => {
      this.setTraceAttributes({
        "cart.userId": userId,
        "cart.productId": data.productId,
        "cart.quantity": data.quantity,
        "cart.operation": "add_item",
      });

      // Validate input
      const validation = AddToCartSchema.safeParse(data);
      if (!validation.success) {
        return this.validationError(
          "Invalid cart data",
          validation.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        );
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
          return this.notFound("Product", productId);
        }

        // Validate farm is active
        if (product.farm.status !== "ACTIVE") {
          return this.error(
            "FARM_INACTIVE",
            "Farm is not currently accepting orders",
            { farmId: product.farmId, farmName: product.farm.name },
          );
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
          return this.error(
            "INSUFFICIENT_STOCK",
            `Only ${availableQuantity} units available`,
            {
              available: availableQuantity,
              requested: totalQuantity,
              productId,
            },
          );
        }

        // Add or update cart item
        let cartItem;
        if (existingCartItem) {
          // Update existing item
          cartItem = await database.cartItem.update({
            where: { id: existingCartItem.id },
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

        // Invalidate cart cache
        await this.invalidateUserCache(userId);

        const cartItemData: CartItemData = {
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
        };

        this.setTraceAttributes({ "cart.itemAdded": true });

        this.logger.info("Item added to cart successfully", {
          userId,
          productId,
          quantity,
          itemId: cartItem.id,
        });

        return this.success(cartItemData, {
          message: "Item added to cart successfully",
        });
      } catch (error) {
        this.logger.error("Failed to add item to cart", error, {
          userId,
          productId,
        });
        return this.error("CART_ADD_ERROR", "Failed to add item to cart", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }

  /**
   * Update cart item quantity with validation
   *
   * @param userId - User ID
   * @param cartItemId - Cart item ID
   * @param data - Update data
   * @returns ServiceResponse with CartItemData
   */
  async updateCartItem(
    userId: string,
    cartItemId: string,
    data: UpdateCartItemInput,
  ): Promise<ServiceResponse<CartItemData | void>> {
    return this.traced("updateCartItem", async () => {
      this.setTraceAttributes({
        "cart.userId": userId,
        "cart.itemId": cartItemId,
        "cart.quantity": data.quantity,
        "cart.operation": "update_item",
      });

      // Validate input
      const validation = UpdateCartItemSchema.safeParse(data);
      if (!validation.success) {
        return this.validationError(
          "Invalid quantity",
          validation.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        );
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

        if (!cartItem) {
          return this.notFound("Cart item", cartItemId);
        }

        // Verify ownership
        if (cartItem.userId !== userId) {
          return this.error("UNAUTHORIZED", "Unauthorized access to cart item");
        }

        // Validate stock
        const availableQuantity = cartItem.product.quantityAvailable
          ? Number(cartItem.product.quantityAvailable)
          : 0;

        if (quantity > availableQuantity) {
          return this.error(
            "INSUFFICIENT_STOCK",
            `Only ${availableQuantity} units available`,
            { available: availableQuantity, requested: quantity },
          );
        }

        // Update quantity
        const updatedItem = await database.cartItem.update({
          where: { id: cartItemId },
          data: {
            quantity,
            priceAtAdd: cartItem.product.price, // Update price in case it changed
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

        // Invalidate cart cache
        await this.invalidateUserCache(userId);

        const cartItemData: CartItemData = {
          id: updatedItem.id,
          productId: updatedItem.productId,
          farmId: updatedItem.farmId,
          name: updatedItem.product.name,
          price: Number(updatedItem.priceAtAdd),
          quantity: Number(updatedItem.quantity),
          unit: updatedItem.unit,
          image:
            updatedItem.product.images?.[0] ||
            updatedItem.product.primaryPhotoUrl ||
            undefined,
          farmName: updatedItem.product.farm.name,
          organic: updatedItem.product.organic || false,
          inStock: true,
          maxQuantity: availableQuantity,
          fulfillmentMethod: updatedItem.fulfillmentMethod,
        };

        this.logger.info("Cart item updated successfully", {
          userId,
          cartItemId,
          quantity,
        });

        return this.success(cartItemData, {
          message: "Cart item updated successfully",
        });
      } catch (error) {
        this.logger.error("Failed to update cart item", error, {
          userId,
          cartItemId,
        });
        return this.error("CART_UPDATE_ERROR", "Failed to update cart item", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }

  /**
   * Remove item from cart
   *
   * @param userId - User ID
   * @param cartItemId - Cart item ID
   * @returns ServiceResponse with void
   */
  async removeCartItem(
    userId: string,
    cartItemId: string,
  ): Promise<ServiceResponse<void>> {
    return this.traced("removeCartItem", async () => {
      this.setTraceAttributes({
        "cart.userId": userId,
        "cart.itemId": cartItemId,
        "cart.operation": "remove_item",
      });

      try {
        // Verify ownership before deleting
        const cartItem = await database.cartItem.findUnique({
          where: { id: cartItemId },
          select: { userId: true },
        });

        if (!cartItem) {
          return this.notFound("Cart item", cartItemId);
        }

        if (cartItem.userId !== userId) {
          return this.error("UNAUTHORIZED", "Unauthorized access to cart item");
        }

        await database.cartItem.delete({
          where: { id: cartItemId },
        });

        // Invalidate cart cache
        await this.invalidateUserCache(userId);

        this.logger.info("Cart item removed successfully", {
          userId,
          cartItemId,
        });

        return this.success(undefined, {
          message: "Cart item removed successfully",
        });
      } catch (error) {
        this.logger.error("Failed to remove cart item", error, {
          userId,
          cartItemId,
        });
        return this.error("CART_REMOVE_ERROR", "Failed to remove cart item", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }

  /**
   * Clear entire cart
   *
   * @param userId - User ID
   * @returns ServiceResponse with void
   */
  async clearCart(userId: string): Promise<ServiceResponse<void>> {
    return this.traced("clearCart", async () => {
      this.setTraceAttributes({
        "cart.userId": userId,
        "cart.operation": "clear",
      });

      try {
        const result = await database.cartItem.deleteMany({
          where: { userId },
        });

        // Invalidate cart cache
        await this.invalidateUserCache(userId);

        this.setTraceAttributes({ "cart.itemsCleared": result.count });

        this.logger.info("Cart cleared successfully", {
          userId,
          itemsCleared: result.count,
        });

        return this.success(undefined, {
          message: "Cart cleared successfully",
        });
      } catch (error) {
        this.logger.error("Failed to clear cart", error, { userId });
        return this.error("CART_CLEAR_ERROR", "Failed to clear cart", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }

  /**
   * Merge guest cart with user cart on login
   *
   * @param userId - User ID
   * @param guestCartItems - Guest cart items
   * @returns ServiceResponse with merge count
   */
  async mergeGuestCart(
    userId: string,
    guestCartItems: Array<{
      productId: string;
      quantity: number;
      fulfillmentMethod?: FulfillmentMethod;
    }>,
  ): Promise<ServiceResponse<{ merged: number }>> {
    return this.traced("mergeGuestCart", async () => {
      this.setTraceAttributes({
        "cart.userId": userId,
        "cart.guestItemCount": guestCartItems.length,
        "cart.operation": "merge",
      });

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
          } else {
            this.logger.warn("Failed to merge guest cart item", {
              userId,
              productId: item.productId,
              error: result.error,
            });
          }
        }

        this.setTraceAttributes({ "cart.mergedCount": mergedCount });

        this.logger.info("Guest cart merged successfully", {
          userId,
          mergedCount,
          totalItems: guestCartItems.length,
        });

        return this.success(
          { merged: mergedCount },
          { message: `Successfully merged ${mergedCount} items` },
        );
      } catch (error) {
        this.logger.error("Failed to merge guest cart", error, { userId });
        return this.error("CART_MERGE_ERROR", "Failed to merge guest cart", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }

  /**
   * Validate cart before checkout
   *
   * @param userId - User ID
   * @returns ServiceResponse with validation result
   */
  async validateCart(
    userId: string,
  ): Promise<ServiceResponse<CartValidationResult>> {
    return this.traced("validateCart", async () => {
      this.setTraceAttributes({
        "cart.userId": userId,
        "cart.operation": "validate",
      });

      try {
        const issues: ValidationIssue[] = [];

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
              message: `Price of ${product.name} has changed from $${priceAtAdd.toFixed(2)} to $${currentPrice.toFixed(2)}`,
            });
          }
        }

        const valid = issues.length === 0;

        this.setTraceAttributes({
          "cart.valid": valid,
          "cart.issueCount": issues.length,
        });

        this.logger.info("Cart validation completed", {
          userId,
          valid,
          issueCount: issues.length,
        });

        return this.success(
          { valid, issues },
          { message: valid ? "Cart is valid" : "Cart has validation issues" },
        );
      } catch (error) {
        this.logger.error("Failed to validate cart", error, { userId });
        return this.error("CART_VALIDATION_ERROR", "Failed to validate cart", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }

  /**
   * Reserve cart items (temporary stock hold before payment)
   *
   * @param userId - User ID
   * @param reservationMinutes - Minutes to hold reservation
   * @returns ServiceResponse with void
   */
  async reserveCartItems(
    userId: string,
    reservationMinutes: number = 15,
  ): Promise<ServiceResponse<void>> {
    return this.traced("reserveCartItems", async () => {
      this.setTraceAttributes({
        "cart.userId": userId,
        "cart.reservationMinutes": reservationMinutes,
        "cart.operation": "reserve",
      });

      try {
        const reservedUntil = new Date();
        reservedUntil.setMinutes(
          reservedUntil.getMinutes() + reservationMinutes,
        );

        const result = await database.cartItem.updateMany({
          where: { userId },
          data: { reservedUntil },
        });

        // Invalidate cart cache
        await this.invalidateUserCache(userId);

        this.setTraceAttributes({ "cart.itemsReserved": result.count });

        this.logger.info("Cart items reserved successfully", {
          userId,
          itemsReserved: result.count,
          reservedUntil,
        });

        return this.success(undefined, {
          message: `Reserved ${result.count} items for ${reservationMinutes} minutes`,
        });
      } catch (error) {
        this.logger.error("Failed to reserve cart items", error, { userId });
        return this.error(
          "CART_RESERVATION_ERROR",
          "Failed to reserve cart items",
          { error: error instanceof Error ? error.message : "Unknown error" },
        );
      }
    });
  }

  /**
   * Release cart item reservations
   *
   * @param userId - User ID
   * @returns ServiceResponse with void
   */
  async releaseReservations(userId: string): Promise<ServiceResponse<void>> {
    return this.traced("releaseReservations", async () => {
      this.setTraceAttributes({
        "cart.userId": userId,
        "cart.operation": "release_reservations",
      });

      try {
        const result = await database.cartItem.updateMany({
          where: { userId },
          data: { reservedUntil: null },
        });

        // Invalidate cart cache
        await this.invalidateUserCache(userId);

        this.setTraceAttributes({ "cart.itemsReleased": result.count });

        this.logger.info("Cart reservations released successfully", {
          userId,
          itemsReleased: result.count,
        });

        return this.success(undefined, {
          message: "Reservations released successfully",
        });
      } catch (error) {
        this.logger.error("Failed to release reservations", error, { userId });
        return this.error(
          "CART_RELEASE_ERROR",
          "Failed to release reservations",
          { error: error instanceof Error ? error.message : "Unknown error" },
        );
      }
    });
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Get cache key for user's cart
   */
  private getCacheKey(suffix: string): string {
    return `${this.cachePrefix}:${suffix}`;
  }

  /**
   * Invalidate all cache for a specific user
   */
  private async invalidateUserCache(userId: string): Promise<void> {
    const cacheKey = this.getCacheKey(`user:${userId}`);
    await this.cache.delete(cacheKey);
    this.logger.debug("Cart cache invalidated", { userId });
  }

  /**
   * Calculate delivery fee based on cart items
   * Agricultural consciousness: Promotes farm pickup with free delivery
   *
   * @param items - Cart items
   * @returns Delivery fee amount
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

    // Calculate fee per farm with agricultural consciousness
    let totalFee = 0;
    for (const key in farmGroups) {
      const group = farmGroups[key];
      if (!group) continue;

      // Pickup is free (promotes sustainable local pickup)
      if (group.method === "FARM_PICKUP" || group.method === "MARKET_PICKUP") {
        continue;
      }

      // Delivery fee calculation with agricultural consciousness
      // Delivery fee: $5 base, free over $50 (encourages larger orders)
      if (group.total < 50) {
        totalFee += 5;
      }
    }

    return totalFee;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const cartService = new CartService();
