/**
 * ✅ CART VALIDATION API ROUTES
 *
 * GET /api/cart/validate - Validate cart items are still available
 *
 * This endpoint validates that all items in a user's cart are still
 * available and in stock. It automatically adjusts quantities when
 * items have insufficient stock and reports any issues found.
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 */

import {
  createErrorResponse,
  createGetHandler,
  createSuccessResponse,
} from "@/lib/api/handler-factory";
import { createLogger } from "@/lib/logger";
import { cartSyncService } from "@/lib/services/cart-sync.service";

// Initialize structured logger
const logger = createLogger("cart-validate-api");

// ============================================
// GET /api/cart/validate - Validate cart items
// ============================================

export const GET = createGetHandler(
  async ({ user }) => {
    if (!user?.id) {
      return createErrorResponse(
        "USER_NOT_FOUND",
        "User ID not found in session",
        400,
      );
    }

    try {
      logger.info("Starting cart validation", { userId: user.id });

      // Validate cart items
      const validationResult = await cartSyncService.validateCart(user.id);

      // Get updated cart with totals
      const updatedCart = await cartSyncService.getCart(user.id);
      const clientCart = cartSyncService.toClientFormat(updatedCart);

      // Determine validation status
      const isValid = validationResult.issues.length === 0;
      const hasAdjustments = validationResult.issues.some(
        (issue) => issue.issue === "insufficient_stock",
      );
      const hasRemovals = validationResult.issues.some(
        (issue) =>
          issue.issue === "out_of_stock" ||
          issue.issue === "product_unavailable",
      );

      // Categorize issues for client
      const issuesByType = {
        outOfStock: validationResult.issues.filter(
          (i) => i.issue === "out_of_stock",
        ),
        insufficientStock: validationResult.issues.filter(
          (i) => i.issue === "insufficient_stock",
        ),
        unavailable: validationResult.issues.filter(
          (i) => i.issue === "product_unavailable",
        ),
      };

      logger.info("Cart validation completed", {
        userId: user.id,
        isValid,
        issueCount: validationResult.issues.length,
        hasAdjustments,
        hasRemovals,
      });

      return createSuccessResponse(
        {
          valid: isValid,
          cart: clientCart,
          validation: {
            validItemCount:
              clientCart.items.length - validationResult.issues.length,
            issueCount: validationResult.issues.length,
            hasAdjustments,
            hasRemovals,
            issues: validationResult.issues,
            issuesByType,
          },
          recommendations: generateRecommendations(validationResult.issues),
        },
        {
          agricultural: true,
        },
      );
    } catch (error) {
      logger.error("Cart validation failed", error as Error, {
        userId: user.id,
      });

      if (error instanceof Error) {
        return createErrorResponse(
          "CART_VALIDATION_ERROR",
          error.message,
          500,
          { originalError: error.name },
        );
      }

      return createErrorResponse(
        "CART_VALIDATION_ERROR",
        "Failed to validate cart",
        500,
      );
    }
  },
  {
    requireAuth: true,
    paginated: false,
    agriculturalMetadata: true,
  },
);

// ============================================
// HELPER FUNCTIONS
// ============================================

interface ValidationIssue {
  itemId: string;
  productId: string;
  issue: "out_of_stock" | "insufficient_stock" | "product_unavailable";
  available?: number;
}

interface Recommendation {
  type: "warning" | "error" | "info";
  message: string;
  action?: string;
}

function generateRecommendations(issues: ValidationIssue[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const outOfStockCount = issues.filter(
    (i) => i.issue === "out_of_stock",
  ).length;
  const insufficientCount = issues.filter(
    (i) => i.issue === "insufficient_stock",
  ).length;
  const unavailableCount = issues.filter(
    (i) => i.issue === "product_unavailable",
  ).length;

  if (unavailableCount > 0) {
    recommendations.push({
      type: "error",
      message: `${unavailableCount} item(s) are no longer available and have been removed from your cart.`,
      action: "ITEMS_REMOVED",
    });
  }

  if (outOfStockCount > 0) {
    recommendations.push({
      type: "warning",
      message: `${outOfStockCount} item(s) are currently out of stock. Consider checking back later or exploring similar products.`,
      action: "CHECK_ALTERNATIVES",
    });
  }

  if (insufficientCount > 0) {
    recommendations.push({
      type: "info",
      message: `${insufficientCount} item(s) had their quantities adjusted due to limited stock.`,
      action: "QUANTITIES_ADJUSTED",
    });
  }

  if (issues.length === 0) {
    recommendations.push({
      type: "info",
      message: "All items in your cart are available and ready for checkout!",
      action: "PROCEED_TO_CHECKOUT",
    });
  }

  return recommendations;
}
