/**
 * 🛒 CART SYNC SERVICE - Server-Side Cart Persistence
 *
 * Provides server-side cart persistence for logged-in users:
 * - Save cart to database when authenticated
 * - Merge local cart with server cart on login
 * - Sync cart across devices
 * - Clear server cart on logout
 * - Handle cart item reservations
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 */

import { database } from "@/lib/database";
import type { CartItem, Product, Prisma } from "@prisma/client";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { BusinessLogicError } from "@/lib/errors/BusinessLogicError";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CartItemInput {
  productId: string;
  quantity: number;
  farmId?: string;
}

export interface CartItemWithProduct extends CartItem {
  product: Product & {
    farm: {
      id: string;
      name: string;
    };
  };
}

export interface ServerCart {
  items: CartItemWithProduct[];
  totals: CartTotals;
  lastUpdated: Date;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export interface MergeStrategy {
  /** How to handle items that exist in both local and server cart */
  conflictResolution: "local" | "server" | "sum" | "max";
  /** Whether to clear local cart after merge */
  clearLocalAfterMerge: boolean;
}

export interface MergeResult {
  mergedItems: CartItemWithProduct[];
  addedFromLocal: number;
  updatedFromServer: number;
  conflicts: number;
}

// ============================================
// CONSTANTS
// ============================================

const TAX_RATE = 0.08; // 8% tax
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING = 5.99;
const CART_ITEM_RESERVATION_MINUTES = 30;

const DEFAULT_MERGE_STRATEGY: MergeStrategy = {
  conflictResolution: "sum",
  clearLocalAfterMerge: true,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safely convert Prisma Decimal to number
 */
function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  return value.toNumber();
}

// ============================================
// CART SYNC SERVICE
// ============================================

export class CartSyncService {
  // ========================================
  // CART RETRIEVAL
  // ========================================

  /**
   * Get cart for a user from the database
   */
  async getCart(userId: string): Promise<ServerCart> {
    const items = await database.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            farm: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const typedItems = items as CartItemWithProduct[];

    return {
      items: typedItems,
      totals: this.calculateTotals(typedItems),
      lastUpdated: new Date(),
    };
  }

  /**
   * Get cart item count for header display
   */
  async getCartItemCount(userId: string): Promise<number> {
    const result = await database.cartItem.aggregate({
      where: { userId },
      _sum: { quantity: true },
    });

    return toNumber(result._sum.quantity);
  }

  // ========================================
  // CART MODIFICATIONS
  // ========================================

  /**
   * Add item to cart
   */
  async addItem(
    userId: string,
    input: CartItemInput,
  ): Promise<CartItemWithProduct> {
    // Validate product exists and is available
    const product = await database.product.findUnique({
      where: { id: input.productId },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError("Product", input.productId);
    }

    const availableQuantity = toNumber(product.quantityAvailable);

    if (!product.inStock || availableQuantity < input.quantity) {
      throw new BusinessLogicError(
        "Insufficient stock available",
        "INSUFFICIENT_STOCK",
        {
          available: availableQuantity,
          requested: input.quantity,
        },
      );
    }

    // Check if item already exists in cart
    const existingItem = await database.cartItem.findFirst({
      where: {
        userId,
        productId: input.productId,
      },
    });

    let cartItem: CartItem;

    if (existingItem) {
      // Update quantity
      const existingQuantity = toNumber(existingItem.quantity);
      const newQuantity = existingQuantity + input.quantity;

      if (newQuantity > availableQuantity) {
        throw new BusinessLogicError(
          "Cannot add more items than available stock",
          "QUANTITY_EXCEEDS_STOCK",
          {
            currentInCart: existingQuantity,
            requested: input.quantity,
            available: availableQuantity,
          },
        );
      }

      cartItem = await database.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          updatedAt: new Date(),
          reservedUntil: this.calculateReservationExpiry(),
        },
      });
    } else {
      // Create new cart item
      cartItem = await database.cartItem.create({
        data: {
          userId,
          productId: input.productId,
          farmId: product.farmId,
          quantity: input.quantity,
          unit: product.unit,
          priceAtAdd: product.price,
          reservedUntil: this.calculateReservationExpiry(),
        },
      });
    }

    // Fetch complete item with relations
    const completeItem = await database.cartItem.findUnique({
      where: { id: cartItem.id },
      include: {
        product: {
          include: {
            farm: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!completeItem) {
      throw new NotFoundError("CartItem", cartItem.id);
    }

    return completeItem as CartItemWithProduct;
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(
    userId: string,
    itemId: string,
    quantity: number,
  ): Promise<CartItemWithProduct> {
    // Find existing item
    const existingItem = await database.cartItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
      include: {
        product: {
          include: {
            farm: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!existingItem) {
      throw new NotFoundError("CartItem", itemId);
    }

    const availableQuantity = toNumber(existingItem.product.quantityAvailable);

    if (quantity > availableQuantity) {
      throw new BusinessLogicError(
        "Requested quantity exceeds available stock",
        "QUANTITY_EXCEEDS_STOCK",
        {
          requested: quantity,
          available: availableQuantity,
        },
      );
    }

    // If quantity is 0, remove the item
    if (quantity <= 0) {
      await database.cartItem.delete({ where: { id: itemId } });
      return existingItem as CartItemWithProduct;
    }

    // Update quantity
    const updatedItem = await database.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        updatedAt: new Date(),
        reservedUntil: this.calculateReservationExpiry(),
      },
      include: {
        product: {
          include: {
            farm: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return updatedItem as CartItemWithProduct;
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string): Promise<void> {
    const item = await database.cartItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });

    if (!item) {
      throw new NotFoundError("CartItem", itemId);
    }

    await database.cartItem.delete({ where: { id: itemId } });
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: string): Promise<void> {
    await database.cartItem.deleteMany({ where: { userId } });
  }

  // ========================================
  // CART MERGE
  // ========================================

  /**
   * Merge local cart with server cart
   * Used when user logs in with items in local storage
   */
  async mergeLocalCart(
    userId: string,
    localItems: CartItemInput[],
    strategy: MergeStrategy = DEFAULT_MERGE_STRATEGY,
  ): Promise<MergeResult> {
    const serverCart = await this.getCart(userId);
    const serverItemMap = new Map(
      serverCart.items.map((item) => [item.productId, item]),
    );

    let addedFromLocal = 0;
    let updatedFromServer = 0;
    let conflicts = 0;

    for (const localItem of localItems) {
      const serverItem = serverItemMap.get(localItem.productId);

      if (serverItem) {
        // Conflict: item exists in both
        conflicts++;
        const serverQuantity = toNumber(serverItem.quantity);
        let newQuantity: number;

        switch (strategy.conflictResolution) {
          case "local":
            newQuantity = localItem.quantity;
            break;
          case "server":
            newQuantity = serverQuantity;
            break;
          case "sum":
            newQuantity = serverQuantity + localItem.quantity;
            break;
          case "max":
            newQuantity = Math.max(serverQuantity, localItem.quantity);
            break;
        }

        if (newQuantity !== serverQuantity) {
          await this.updateItemQuantity(userId, serverItem.id, newQuantity);
          updatedFromServer++;
        }
      } else {
        // New item from local
        try {
          await this.addItem(userId, localItem);
          addedFromLocal++;
        } catch {
          // Skip items that can't be added (product unavailable, etc.)
        }
      }
    }

    const mergedCart = await this.getCart(userId);

    return {
      mergedItems: mergedCart.items,
      addedFromLocal,
      updatedFromServer,
      conflicts,
    };
  }

  // ========================================
  // CART VALIDATION
  // ========================================

  /**
   * Validate cart items before checkout
   * Returns list of issues found
   */
  async validateCart(userId: string): Promise<{
    valid: boolean;
    issues: Array<{
      itemId: string;
      productId: string;
      issue: "out_of_stock" | "insufficient_stock" | "product_unavailable";
      available?: number;
    }>;
  }> {
    const cart = await this.getCart(userId);
    const issues: Array<{
      itemId: string;
      productId: string;
      issue: "out_of_stock" | "insufficient_stock" | "product_unavailable";
      available?: number;
    }> = [];

    for (const item of cart.items) {
      if (!item.product) {
        issues.push({
          itemId: item.id,
          productId: item.productId,
          issue: "product_unavailable",
        });
        continue;
      }

      const availableQuantity = toNumber(item.product.quantityAvailable);
      const itemQuantity = toNumber(item.quantity);

      if (!item.product.inStock || availableQuantity === 0) {
        issues.push({
          itemId: item.id,
          productId: item.productId,
          issue: "out_of_stock",
          available: 0,
        });
        continue;
      }

      if (itemQuantity > availableQuantity) {
        issues.push({
          itemId: item.id,
          productId: item.productId,
          issue: "insufficient_stock",
          available: availableQuantity,
        });

        // Auto-adjust quantity to available stock
        await this.updateItemQuantity(userId, item.id, availableQuantity);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  // ========================================
  // RESERVATION MANAGEMENT
  // ========================================

  /**
   * Extend reservation for all cart items
   */
  async extendReservation(userId: string): Promise<void> {
    const newExpiry = this.calculateReservationExpiry();

    await database.cartItem.updateMany({
      where: { userId },
      data: { reservedUntil: newExpiry },
    });
  }

  /**
   * Clear expired reservations (run as cron job)
   */
  async clearExpiredReservations(): Promise<number> {
    const result = await database.cartItem.deleteMany({
      where: {
        reservedUntil: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Calculate cart totals
   */
  private calculateTotals(items: CartItemWithProduct[]): CartTotals {
    const subtotal = items.reduce((sum, item) => {
      const price = toNumber(item.product?.price);
      const quantity = toNumber(item.quantity);
      return sum + price * quantity;
    }, 0);

    const itemCount = items.reduce(
      (sum, item) => sum + toNumber(item.quantity),
      0,
    );
    const tax = subtotal * TAX_RATE;
    const shipping =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
    const total = subtotal + tax + shipping;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      total: Math.round(total * 100) / 100,
      itemCount,
    };
  }

  /**
   * Calculate reservation expiry time
   */
  private calculateReservationExpiry(): Date {
    return new Date(Date.now() + CART_ITEM_RESERVATION_MINUTES * 60 * 1000);
  }

  /**
   * Convert server cart to client-friendly format
   */
  toClientFormat(cart: ServerCart): {
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      productImage: string;
      price: number;
      quantity: number;
      unit: string;
      farmId: string;
      farmName: string;
      stock: number;
    }>;
    totals: CartTotals;
  } {
    return {
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productImage:
          (item.product as unknown as { images?: string[] }).images?.[0] || "",
        price: toNumber(item.product.price),
        quantity: toNumber(item.quantity),
        unit: item.product.unit,
        farmId: item.product.farm.id,
        farmName: item.product.farm.name,
        stock: toNumber(item.product.quantityAvailable),
      })),
      totals: cart.totals,
    };
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const cartSyncService = new CartSyncService();
