"use server";

// 🛒 CART SERVER ACTIONS - Divine Shopping Cart Orchestration
// Server actions for cart operations with agricultural consciousness

import type {
  AddToCartRequest,
  CartSummary,
  CartValidationResult,
  UpdateCartItemRequest,
} from "@/lib/services/cart.service";
import { cartService } from "@/lib/services/cart.service";
import { revalidatePath } from "next/cache";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// ============================================================================
// SERIALIZATION HELPERS
// ============================================================================

/**
 * Convert Decimal objects to numbers for client components
 * Next.js cannot pass Prisma Decimal objects to client components
 */
function serializeDecimal(value: any): any {
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return value.toNumber();
  }
  return value;
}

function serializeCartSummary(summary: CartSummary): CartSummary {
  return {
    ...summary,
    items: summary.items.map((item) => ({
      ...item,
      quantity: serializeDecimal(item.quantity),
      priceAtAdd: serializeDecimal(item.priceAtAdd),
      product: {
        ...item.product,
        price: serializeDecimal(item.product.price),
        compareAtPrice: item.product.compareAtPrice ? serializeDecimal(item.product.compareAtPrice) : null,
        quantityAvailable: item.product.quantityAvailable ? serializeDecimal(item.product.quantityAvailable) : null,
        lowStockThreshold: item.product.lowStockThreshold ? serializeDecimal(item.product.lowStockThreshold) : null,
        averageRating: item.product.averageRating ? serializeDecimal(item.product.averageRating) : null,
      },
    })),
    farmGroups: summary.farmGroups.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        quantity: serializeDecimal(item.quantity),
        priceAtAdd: serializeDecimal(item.priceAtAdd),
        product: {
          ...item.product,
          price: serializeDecimal(item.product.price),
          compareAtPrice: item.product.compareAtPrice ? serializeDecimal(item.product.compareAtPrice) : null,
          quantityAvailable: item.product.quantityAvailable ? serializeDecimal(item.product.quantityAvailable) : null,
          lowStockThreshold: item.product.lowStockThreshold ? serializeDecimal(item.product.lowStockThreshold) : null,
          averageRating: item.product.averageRating ? serializeDecimal(item.product.averageRating) : null,
        },
      })),
    })),
  } as CartSummary;
}

// ============================================================================
// CART ACTIONS
// ============================================================================

/**
 * 🛒 Add item to cart
 */
export async function addToCartAction(
  request: AddToCartRequest
): Promise<ActionResponse> {
  try {
    const cartItem = await cartService.addToCart(request);

    // Revalidate relevant paths
    revalidatePath("/cart");
    revalidatePath("/products");
    revalidatePath(`/products/${cartItem.product.slug}`);

    return {
      success: true,
      data: {
        cartItem,
        message: `${cartItem.product.name} added to cart`,
      },
    };
  } catch (error) {
    logger.error("Add to cart error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: {
        code: "ADD_TO_CART_FAILED",
        message: error instanceof Error ? error.message : "Failed to add item to cart",
      },
    };
  }
}

/**
 * 🔄 Update cart item quantity
 */
export async function updateCartItemAction(
  request: UpdateCartItemRequest
): Promise<ActionResponse> {
  try {
    const cartItem = await cartService.updateCartItem(request);

    // Revalidate cart path
    revalidatePath("/cart");

    return {
      success: true,
      data: {
        cartItem,
        message: "Cart updated successfully",
      },
    };
  } catch (error) {
    logger.error("Update cart item error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: {
        code: "UPDATE_CART_FAILED",
        message: error instanceof Error ? error.message : "Failed to update cart item",
      },
    };
  }
}

/**
 * 🗑️ Remove item from cart
 */
export async function removeFromCartAction(itemId: string): Promise<ActionResponse> {
  try {
    await cartService.removeFromCart(itemId);

    // Revalidate cart path
    revalidatePath("/cart");

    return {
      success: true,
      data: {
        message: "Item removed from cart",
      },
    };
  } catch (error) {
    logger.error("Remove from cart error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: {
        code: "REMOVE_FROM_CART_FAILED",
        message: error instanceof Error ? error.message : "Failed to remove item from cart",
      },
    };
  }
}

/**
 * 🧹 Clear entire cart
 */
export async function clearCartAction(userId: string): Promise<ActionResponse> {
  try {
    await cartService.clearCart(userId);

    // Revalidate cart path
    revalidatePath("/cart");

    return {
      success: true,
      data: {
        message: "Cart cleared successfully",
      },
    };
  } catch (error) {
    logger.error("Clear cart error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: {
        code: "CLEAR_CART_FAILED",
        message: error instanceof Error ? error.message : "Failed to clear cart",
      },
    };
  }
}

/**
 * 🧹 Clear cart items for specific farm
 */
export async function clearFarmCartAction(
  userId: string,
  farmId: string
): Promise<ActionResponse> {
  try {
    await cartService.clearFarmCart(userId, farmId);

    // Revalidate cart path
    revalidatePath("/cart");

    return {
      success: true,
      data: {
        message: "Farm items removed from cart",
      },
    };
  } catch (error) {
    logger.error("Clear farm cart error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: {
        code: "CLEAR_FARM_CART_FAILED",
        message: error instanceof Error ? error.message : "Failed to clear farm cart",
      },
    };
  }
}

/**
 * 📊 Get cart summary
 */
export async function getCartSummaryAction(
  userId: string
): Promise<ActionResponse<CartSummary>> {
  try {
    const summary = await cartService.getCartSummary(userId);

    return {
      success: true,
      data: serializeCartSummary(summary),
    };
  } catch (error) {
    logger.error("Get cart summary error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: {
        code: "GET_CART_SUMMARY_FAILED",
        message: error instanceof Error ? error.message : "Failed to get cart summary",
      },
    };
  }
}

/**
 * 🔢 Get cart item count
 */
export async function getCartCountAction(userId: string): Promise<ActionResponse<number>> {
  try {
    const count = await cartService.getCartCount(userId);

    return {
      success: true,
      data: count,
    };
  } catch (error) {
    logger.error("Get cart count error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: {
        code: "GET_CART_COUNT_FAILED",
        message: "Failed to get cart count",
      },
      data: 0, // Return 0 as fallback
    };
  }
}

/**
 * ✅ Validate cart
 */
export async function validateCartAction(
  userId: string
): Promise<ActionResponse<CartValidationResult>> {
  try {
    const validationResult = await cartService.validateCart(userId);

    return {
      success: true,
      data: validationResult,
    };
  } catch (error) {
    logger.error("Validate cart error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: {
        code: "VALIDATE_CART_FAILED",
        message: error instanceof Error ? error.message : "Failed to validate cart",
      },
    };
  }
}

/**
 * 🔄 Sync cart prices with current product prices
 */
export async function syncCartPricesAction(userId: string): Promise<ActionResponse> {
  try {
    const updatedCount = await cartService.syncCartPrices(userId);

    // Revalidate cart path
    revalidatePath("/cart");

    return {
      success: true,
      data: {
        updatedCount,
        message: updatedCount > 0
          ? `Updated prices for ${updatedCount} item(s)`
          : "All prices are up to date",
      },
    };
  } catch (error) {
    logger.error("Sync cart prices error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: {
        code: "SYNC_CART_PRICES_FAILED",
        message: error instanceof Error ? error.message : "Failed to sync cart prices",
      },
    };
  }
}

/**
 * 🔄 Merge guest cart into user cart on login
 */
export async function mergeGuestCartAction(
  guestCartItems: Array<{ productId: string; quantity: number }>,
  userId: string
): Promise<ActionResponse> {
  try {
    await cartService.mergeGuestCart(guestCartItems, userId);

    // Revalidate cart path
    revalidatePath("/cart");

    return {
      success: true,
      data: {
        message: "Cart items merged successfully",
      },
    };
  } catch (error) {
    logger.error("Merge guest cart error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: {
        code: "MERGE_GUEST_CART_FAILED",
        message: error instanceof Error ? error.message : "Failed to merge cart items",
      },
    };
  }
}

/**
 * 🧹 Cleanup expired cart items (admin/cron)
 */
export async function cleanupExpiredCartsAction(): Promise<ActionResponse> {
  try {
    const deletedCount = await cartService.cleanupExpiredCarts();

    return {
      success: true,
      data: {
        deletedCount,
        message: `Cleaned up ${deletedCount} expired cart item(s)`,
      },
    };
  } catch (error) {
    logger.error("Cleanup expired carts error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: {
        code: "CLEANUP_EXPIRED_CARTS_FAILED",
        message: error instanceof Error ? error.message : "Failed to cleanup expired carts",
      },
    };
  }
}
