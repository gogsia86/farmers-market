"use server";

// 🛒 CART SERVER ACTIONS - Divine Shopping Cart Orchestration
// Server actions for cart operations with agricultural consciousness

import { auth } from "@/lib/auth/config";
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
// AUTHENTICATION HELPER
// ============================================================================

/**
 * Get authenticated user from session
 * Throws error if not authenticated
 */
async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  return session.user.id;
}

// ============================================================================
// CART ACTIONS
// ============================================================================

/**
 * 🛒 Add item to cart
 * userId is derived from server-side session
 */
export async function addToCartAction(
  request: Omit<AddToCartRequest, "userId">
): Promise<ActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();

    const cartItem = await cartService.addToCart({
      ...request,
      userId,
    });

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
        code: error instanceof Error && error.message === "Authentication required"
          ? "UNAUTHORIZED"
          : "ADD_TO_CART_FAILED",
        message: error instanceof Error ? error.message : "Failed to add item to cart",
      },
    };
  }
}

/**
 * 🔄 Update cart item quantity
 * userId is derived from server-side session
 */
export async function updateCartItemAction(
  request: UpdateCartItemRequest
): Promise<ActionResponse> {
  try {
    await getAuthenticatedUserId();

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
        code: error instanceof Error && error.message === "Authentication required"
          ? "UNAUTHORIZED"
          : "UPDATE_CART_FAILED",
        message: error instanceof Error ? error.message : "Failed to update cart item",
      },
    };
  }
}

/**
 * 🗑️ Remove item from cart
 * userId is derived from server-side session
 */
export async function removeFromCartAction(itemId: string): Promise<ActionResponse> {
  try {
    await getAuthenticatedUserId();

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
        code: error instanceof Error && error.message === "Authentication required"
          ? "UNAUTHORIZED"
          : "REMOVE_FROM_CART_FAILED",
        message: error instanceof Error ? error.message : "Failed to remove item from cart",
      },
    };
  }
}

/**
 * 🧹 Clear entire cart
 * userId is derived from server-side session
 */
export async function clearCartAction(): Promise<ActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();

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
        code: error instanceof Error && error.message === "Authentication required"
          ? "UNAUTHORIZED"
          : "CLEAR_CART_FAILED",
        message: error instanceof Error ? error.message : "Failed to clear cart",
      },
    };
  }
}

/**
 * 🧹 Clear cart items for specific farm
 * userId is derived from server-side session
 */
export async function clearFarmCartAction(
  farmId: string
): Promise<ActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();

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
        code: error instanceof Error && error.message === "Authentication required"
          ? "UNAUTHORIZED"
          : "CLEAR_FARM_CART_FAILED",
        message: error instanceof Error ? error.message : "Failed to clear farm cart",
      },
    };
  }
}

/**
 * 📊 Get cart summary
 * userId is derived from server-side session
 */
export async function getCartSummaryAction(): Promise<ActionResponse<CartSummary>> {
  try {
    const userId = await getAuthenticatedUserId();

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
        code: error instanceof Error && error.message === "Authentication required"
          ? "UNAUTHORIZED"
          : "GET_CART_SUMMARY_FAILED",
        message: error instanceof Error ? error.message : "Failed to get cart summary",
      },
    };
  }
}

/**
 * 🔢 Get cart item count
 * userId is derived from server-side session
 */
export async function getCartCountAction(): Promise<ActionResponse<number>> {
  try {
    const userId = await getAuthenticatedUserId();

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
        code: error instanceof Error && error.message === "Authentication required"
          ? "UNAUTHORIZED"
          : "GET_CART_COUNT_FAILED",
        message: "Failed to get cart count",
      },
      data: 0, // Return 0 as fallback
    };
  }
}

/**
 * ✅ Validate cart
 * userId is derived from server-side session
 */
export async function validateCartAction(): Promise<ActionResponse<CartValidationResult>> {
  try {
    const userId = await getAuthenticatedUserId();

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
        code: error instanceof Error && error.message === "Authentication required"
          ? "UNAUTHORIZED"
          : "VALIDATE_CART_FAILED",
        message: error instanceof Error ? error.message : "Failed to validate cart",
      },
    };
  }
}

/**
 * 🔄 Sync cart prices with current product prices
 * userId is derived from server-side session
 */
export async function syncCartPricesAction(): Promise<ActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();

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
        code: error instanceof Error && error.message === "Authentication required"
          ? "UNAUTHORIZED"
          : "SYNC_CART_PRICES_FAILED",
        message: error instanceof Error ? error.message : "Failed to sync cart prices",
      },
    };
  }
}

/**
 * 🔄 Merge guest cart into user cart on login
 * userId is derived from server-side session
 */
export async function mergeGuestCartAction(
  guestCartItems: Array<{ productId: string; quantity: number }>
): Promise<ActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();

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
        code: error instanceof Error && error.message === "Authentication required"
          ? "UNAUTHORIZED"
          : "MERGE_GUEST_CART_FAILED",
        message: error instanceof Error ? error.message : "Failed to merge cart items",
      },
    };
  }
}

/**
 * 🧹 Cleanup expired cart items (admin/cron)
 * userId is derived from server-side session
 */
export async function cleanupExpiredCartsAction(): Promise<ActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();

    // TODO: Add admin role check here
    // const session = await auth();
    // if (session.user.role !== 'ADMIN') throw new Error('Unauthorized');

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
        code: error instanceof Error && error.message === "Authentication required"
          ? "UNAUTHORIZED"
          : "CLEANUP_EXPIRED_CARTS_FAILED",
        message: error instanceof Error ? error.message : "Failed to cleanup expired carts",
      },
    };
  }
}
