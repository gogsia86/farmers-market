// 🛒 QUANTUM CART SERVICE - Divine Shopping Cart Management
// Manages cart operations with agricultural consciousness and quantum precision

import { database } from "@/lib/database";
import type { CartItem, Product } from "@prisma/client";
import { Decimal } from "decimal.js";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AddToCartRequest {
  userId: string;
  productId: string;
  quantity: number;
  fulfillmentMethod?: "DELIVERY" | "PICKUP";
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

export interface CartItemWithProduct extends CartItem {
  product: Product & {
    farm: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface CartSummary {
  items: CartItemWithProduct[];
  itemCount: number;
  uniqueProductCount: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  farmGroups: FarmCartGroup[];
}

export interface FarmCartGroup {
  farmId: string;
  farmName: string;
  farmSlug: string;
  items: CartItemWithProduct[];
  subtotal: number;
  itemCount: number;
}

export interface CartValidationResult {
  isValid: boolean;
  errors: CartValidationError[];
  warnings: CartValidationWarning[];
}

export interface CartValidationError {
  itemId: string;
  productId: string;
  productName: string;
  type: "OUT_OF_STOCK" | "INSUFFICIENT_STOCK" | "PRODUCT_INACTIVE" | "PRICE_CHANGED";
  message: string;
  currentStock?: number;
  requestedQuantity?: number;
  currentPrice?: number;
  cartPrice?: number;
}

export interface CartValidationWarning {
  itemId: string;
  type: "LOW_STOCK" | "PRICE_INCREASE" | "PRICE_DECREASE";
  message: string;
}

// ============================================================================
// CART SERVICE - QUANTUM SHOPPING CART ORCHESTRATOR
// ============================================================================

export class QuantumCartService {
  private readonly TAX_RATE = 0.08; // 8% - TODO: Make location-based
  private readonly DELIVERY_FEE_BASE = 5.99;
  private readonly FREE_DELIVERY_THRESHOLD = 50;
  private readonly CART_EXPIRATION_DAYS = 7;

  // ==========================================================================
  // CART CRUD OPERATIONS
  // ==========================================================================

  /**
   * 🛒 Add item to cart with quantum manifestation
   */
  async addToCart(request: AddToCartRequest): Promise<CartItemWithProduct> {
    const { userId, productId, quantity, fulfillmentMethod = "DELIVERY" } = request;

    // Validate quantity
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // Fetch product with farm details
    const product = await database.product.findUnique({
      where: { id: productId },
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
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.status !== "ACTIVE") {
      throw new Error("Product is not available for purchase");
    }

    if (product.farm.status !== "ACTIVE") {
      throw new Error("Farm is currently not accepting orders");
    }

    // Check stock availability
    const availableStock = product.quantityAvailable?.toNumber() || 0;
    if (quantity > availableStock) {
      throw new Error(
        `Insufficient stock. Only ${availableStock} ${product.unit} available`
      );
    }

    // Check if item already exists in cart
    const existingItem = await database.cartItem.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity.toNumber() + quantity;

      if (newQuantity > availableStock) {
        throw new Error(
          `Cannot add ${quantity} more. Maximum available: ${availableStock} ${product.unit}`
        );
      }

      const updatedItem = await database.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: new Decimal(newQuantity),
          priceAtAdd: product.price,
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

      return updatedItem as CartItemWithProduct;
    }

    // Create new cart item
    const reservedUntil = new Date();
    reservedUntil.setDate(reservedUntil.getDate() + this.CART_EXPIRATION_DAYS);

    const cartItem = await database.cartItem.create({
      data: {
        userId,
        productId,
        farmId: product.farmId,
        quantity: new Decimal(quantity),
        unit: product.unit,
        priceAtAdd: product.price,
        fulfillmentMethod: fulfillmentMethod as any,
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

    return cartItem as CartItemWithProduct;
  }

  /**
   * 🔄 Update cart item quantity
   */
  async updateCartItem(request: UpdateCartItemRequest): Promise<CartItemWithProduct> {
    const { itemId, quantity } = request;

    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0. Use removeFromCart to delete items.");
    }

    const cartItem = await database.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    // Check stock availability
    const availableStock = cartItem.product.quantityAvailable?.toNumber() || 0;
    if (quantity > availableStock) {
      throw new Error(
        `Insufficient stock. Only ${availableStock} ${cartItem.product.unit} available`
      );
    }

    const updatedItem = await database.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: new Decimal(quantity),
        priceAtAdd: cartItem.product.price, // Update to current price
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

    return updatedItem as CartItemWithProduct;
  }

  /**
   * 🗑️ Remove item from cart
   */
  async removeFromCart(itemId: string): Promise<void> {
    await database.cartItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * 🧹 Clear entire cart for user
   */
  async clearCart(userId: string): Promise<void> {
    await database.cartItem.deleteMany({
      where: { userId },
    });
  }

  /**
   * 🧹 Clear cart items for specific farm
   */
  async clearFarmCart(userId: string, farmId: string): Promise<void> {
    await database.cartItem.deleteMany({
      where: {
        userId,
        farmId,
      },
    });
  }

  // ==========================================================================
  // CART RETRIEVAL & CALCULATIONS
  // ==========================================================================

  /**
   * 📦 Get cart items for user
   */
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    try {
      // Validate userId
      if (!userId) {
        logger.warn('getCartItems called with empty userId');
        return [];
      }

      const items = await database.cartItem.findMany({
        where: { userId },
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
        orderBy: { createdAt: "desc" },
      });

      return items as CartItemWithProduct[];
    } catch (error) {
      logger.error('Get cart items error', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  /**
   * 📊 Get cart summary with calculations
   */
  async getCartSummary(userId: string): Promise<CartSummary> {
    try {
      // Validate userId
      if (!userId) {
        logger.warn('getCartSummary called with empty userId');
        return this.getEmptyCartSummary();
      }

      const items = await this.getCartItems(userId);

      if (items.length === 0) {
        return this.getEmptyCartSummary();
      }

      // Calculate subtotal with error handling
      const subtotal = items.reduce((sum, item) => {
        try {
          const itemTotal = item.quantity.toNumber() * item.priceAtAdd.toNumber();
          return sum + itemTotal;
        } catch (error) {
          logger.warn('Error calculating item total', {
            itemId: item.id,
            error: error instanceof Error ? error.message : String(error),
          });
          return sum;
        }
      }, 0);

      // Calculate delivery fee
      const deliveryFee =
        subtotal >= this.FREE_DELIVERY_THRESHOLD ? 0 : this.DELIVERY_FEE_BASE;

      // Calculate tax
      const tax = subtotal * this.TAX_RATE;

      // Calculate total
      const total = subtotal + tax + deliveryFee;

      // Calculate item count (total quantity of all items)
      const itemCount = items.reduce((sum, item) => {
        try {
          return sum + item.quantity.toNumber();
        } catch (error) {
          logger.warn('Error calculating item quantity', {
            itemId: item.id,
            error: error instanceof Error ? error.message : String(error),
          });
          return sum;
        }
      }, 0);

      // Group items by farm
      const farmGroups = this.groupItemsByFarm(items);

      return {
        items,
        itemCount: Math.round(itemCount),
        uniqueProductCount: items.length,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        deliveryFee: Math.round(deliveryFee * 100) / 100,
        total: Math.round(total * 100) / 100,
        farmGroups,
      };
    } catch (error) {
      logger.error('Get cart summary error', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Return empty cart summary instead of throwing
      return this.getEmptyCartSummary();
    }
  }

  /**
   * 🔄 Get empty cart summary (helper method)
   */
  private getEmptyCartSummary(): CartSummary {
    return {
      items: [],
      itemCount: 0,
      uniqueProductCount: 0,
      subtotal: 0,
      tax: 0,
      deliveryFee: 0,
      total: 0,
      farmGroups: [],
    };
  }

  /**
   * 🏪 Group cart items by farm
   */
  private groupItemsByFarm(items: CartItemWithProduct[]): FarmCartGroup[] {
    const farmMap = new Map<string, CartItemWithProduct[]>();

    for (const item of items) {
      const farmId = item.product.farm.id;
      if (!farmMap.has(farmId)) {
        farmMap.set(farmId, []);
      }
      farmMap.get(farmId)!.push(item);
    }

    const farmGroups: FarmCartGroup[] = [];

    for (const [farmId, farmItems] of farmMap.entries()) {
      const firstItem = farmItems[0];
      if (!firstItem) continue;

      const farmSubtotal = farmItems.reduce((sum, item) => {
        return sum + item.quantity.toNumber() * item.priceAtAdd.toNumber();
      }, 0);

      const farmItemCount = farmItems.reduce((sum, item) => {
        return sum + item.quantity.toNumber();
      }, 0);

      farmGroups.push({
        farmId,
        farmName: firstItem.product.farm.name,
        farmSlug: firstItem.product.farm.slug,
        items: farmItems,
        subtotal: Math.round(farmSubtotal * 100) / 100,
        itemCount: Math.round(farmItemCount),
      });
    }

    return farmGroups.sort((a, b) => a.farmName.localeCompare(b.farmName));
  }

  /**
   * 🔢 Get cart item count
   */
  async getCartCount(userId: string): Promise<number> {
    try {
      // Validate userId
      if (!userId) {
        logger.warn('getCartCount called with empty userId');
        return 0;
      }

      const items = await database.cartItem.findMany({
        where: { userId },
        select: { quantity: true },
      });

      // Handle empty cart
      if (!items || items.length === 0) {
        return 0;
      }

      const totalQuantity = items.reduce((sum, item) => {
        // Handle null/undefined quantity gracefully
        if (!item.quantity) {
          logger.warn('Cart item with null quantity found', { userId });
          return sum;
        }
        return sum + item.quantity.toNumber();
      }, 0);

      return Math.round(totalQuantity);
    } catch (error) {
      logger.error('Get cart count error', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Return 0 instead of throwing to prevent UI crashes
      return 0;
    }
  }

  // ==========================================================================
  // CART VALIDATION
  // ==========================================================================

  /**
   * ✅ Validate cart before checkout
   */
  async validateCart(userId: string): Promise<CartValidationResult> {
    const items = await this.getCartItems(userId);
    const errors: CartValidationError[] = [];
    const warnings: CartValidationWarning[] = [];

    for (const item of items) {
      const product = item.product;
      const requestedQuantity = item.quantity.toNumber();
      const availableStock = product.quantityAvailable?.toNumber() || 0;
      const cartPrice = item.priceAtAdd.toNumber();
      const currentPrice = product.price.toNumber();

      // Check if product is still active
      if (product.status !== "ACTIVE") {
        errors.push({
          itemId: item.id,
          productId: product.id,
          productName: product.name,
          type: "PRODUCT_INACTIVE",
          message: `${product.name} is no longer available`,
        });
        continue;
      }

      // Check stock availability
      if (availableStock === 0) {
        errors.push({
          itemId: item.id,
          productId: product.id,
          productName: product.name,
          type: "OUT_OF_STOCK",
          message: `${product.name} is currently out of stock`,
          currentStock: availableStock,
          requestedQuantity,
        });
      } else if (requestedQuantity > availableStock) {
        errors.push({
          itemId: item.id,
          productId: product.id,
          productName: product.name,
          type: "INSUFFICIENT_STOCK",
          message: `Only ${availableStock} ${product.unit} of ${product.name} available`,
          currentStock: availableStock,
          requestedQuantity,
        });
      } else if (availableStock < requestedQuantity * 1.2) {
        // Warn if stock is low (less than 20% buffer)
        warnings.push({
          itemId: item.id,
          type: "LOW_STOCK",
          message: `Limited stock available for ${product.name}`,
        });
      }

      // Check price changes
      const priceDifference = currentPrice - cartPrice;
      const priceChangePercent = (priceDifference / cartPrice) * 100;

      if (Math.abs(priceChangePercent) > 10) {
        // Significant price change (>10%)
        if (priceDifference > 0) {
          warnings.push({
            itemId: item.id,
            type: "PRICE_INCREASE",
            message: `Price of ${product.name} increased from $${cartPrice.toFixed(2)} to $${currentPrice.toFixed(2)}`,
          });
        } else {
          warnings.push({
            itemId: item.id,
            type: "PRICE_DECREASE",
            message: `Price of ${product.name} decreased from $${cartPrice.toFixed(2)} to $${currentPrice.toFixed(2)}`,
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 🔄 Sync cart prices with current product prices
   */
  async syncCartPrices(userId: string): Promise<number> {
    const items = await this.getCartItems(userId);
    let updatedCount = 0;

    for (const item of items) {
      const currentPrice = item.product.price;
      const cartPrice = item.priceAtAdd;

      if (!currentPrice.equals(cartPrice)) {
        await database.cartItem.update({
          where: { id: item.id },
          data: { priceAtAdd: currentPrice },
        });
        updatedCount++;
      }
    }

    return updatedCount;
  }

  // ==========================================================================
  // CART MAINTENANCE
  // ==========================================================================

  /**
   * 🧹 Clean up expired cart items
   */
  async cleanupExpiredCarts(): Promise<number> {
    const result = await database.cartItem.deleteMany({
      where: {
        reservedUntil: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  /**
   * 🔄 Merge guest cart into user cart on login
   */
  async mergeGuestCart(
    guestCartItems: Array<{ productId: string; quantity: number }>,
    userId: string
  ): Promise<void> {
    for (const item of guestCartItems) {
      try {
        await this.addToCart({
          userId,
          productId: item.productId,
          quantity: item.quantity,
        });
      } catch (error) {
        // Log error but continue with other items
        logger.error(`Failed to merge cart item ${item.productId}:`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const cartService = new QuantumCartService();
