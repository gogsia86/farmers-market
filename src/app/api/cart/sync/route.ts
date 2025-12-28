/**
 * 🔄 CART SYNC API ROUTES
 *
 * POST /api/cart/sync - Sync local cart with server cart on login
 *
 * This endpoint merges a user's local (offline/guest) cart with their
 * server-side cart when they log in. Supports configurable merge strategies.
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 */

import { z } from "zod";
import {
  createPostHandler,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api/handler-factory";
import { cartSyncService } from "@/lib/services/cart-sync.service";
import type { MergeStrategy } from "@/lib/services/cart-sync.service";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const CartItemInputSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1").max(1000),
  farmId: z.string().optional(),
});

const MergeStrategySchema = z.object({
  conflictResolution: z.enum(["local", "server", "sum", "max"]).default("sum"),
  clearLocalAfterMerge: z.boolean().default(true),
});

const SyncCartRequestSchema = z.object({
  localItems: z.array(CartItemInputSchema).optional(),
  strategy: MergeStrategySchema.optional(),
});

type SyncCartRequest = z.infer<typeof SyncCartRequestSchema>;

// ============================================
// POST /api/cart/sync - Sync local cart with server
// ============================================

export const POST = createPostHandler<SyncCartRequest>(
  async ({ body, user }) => {
    if (!user?.id) {
      return createErrorResponse(
        "USER_NOT_FOUND",
        "User ID not found in session",
        400,
      );
    }

    const { localItems = [], strategy } = body!;

    // Default merge strategy
    const mergeStrategy: MergeStrategy = {
      conflictResolution: strategy?.conflictResolution || "sum",
      clearLocalAfterMerge: strategy?.clearLocalAfterMerge ?? true,
    };

    try {
      // Perform cart sync/merge
      const mergeResult = await cartSyncService.mergeLocalCart(
        user.id,
        localItems,
        mergeStrategy,
      );

      // Get updated cart with totals
      const updatedCart = await cartSyncService.getCart(user.id);
      const clientCart = cartSyncService.toClientFormat(updatedCart);

      return createSuccessResponse(
        {
          cart: clientCart,
          merge: {
            addedFromLocal: mergeResult.addedFromLocal,
            updatedFromServer: mergeResult.updatedFromServer,
            conflicts: mergeResult.conflicts,
            totalItems: mergeResult.mergedItems.length,
          },
          strategy: mergeStrategy,
        },
        {
          agricultural: true,
        },
      );
    } catch (error) {
      console.error("[Cart Sync Error]", error);

      if (error instanceof Error) {
        return createErrorResponse("CART_SYNC_ERROR", error.message, 500, {
          originalError: error.name,
        });
      }

      return createErrorResponse("CART_SYNC_ERROR", "Failed to sync cart", 500);
    }
  },
  SyncCartRequestSchema as any,
  {
    requireAuth: true,
    agriculturalMetadata: true,
  },
);
