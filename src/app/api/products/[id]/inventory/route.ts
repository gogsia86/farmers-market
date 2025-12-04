/**
 * 🌾 PRODUCT INVENTORY API ROUTE
 *
 * Divine agricultural inventory management endpoint
 * Wired through ProductController for unified request handling
 *
 * Endpoint:
 * - PATCH /api/products/:id/inventory - Update product inventory
 *
 * @phase Phase 4: API Route Integration
 * @reference PHASE4_QUICK_START.md
 */

import { NextRequest } from "next/server";
import { productController } from "@/lib/controllers/product.controller";

type RouteContext = {
  params: { id: string };
};

/**
 * PATCH /api/products/:id/inventory
 *
 * Update product inventory levels with agricultural consciousness
 *
 * Requires authentication - only farm owners can update inventory
 *
 * @param {string} id - Product ID (path parameter)
 *
 * Request Body:
 * {
 *   quantity?: number (total available quantity)
 *   reservedQuantity?: number (quantity reserved for pending orders)
 *   lowStockThreshold?: number (alert threshold for low stock)
 * }
 *
 * @example
 * PATCH /api/products/prod_abc123/inventory
 * Authorization: Bearer <token>
 * {
 *   "quantity": 75,
 *   "reservedQuantity": 5,
 *   "lowStockThreshold": 15
 * }
 *
 * @returns {Object} Response with updated product inventory
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     inventory: {
 *       quantity: number,
 *       reservedQuantity: number,
 *       availableQuantity: number,
 *       lowStockThreshold: number,
 *       isLowStock: boolean
 *     }
 *   }
 * }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return productController.updateInventory(request, context.params);
}
