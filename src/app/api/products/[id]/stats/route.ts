/**
 * 🌾 PRODUCT STATS API ROUTE
 *
 * Divine agricultural product statistics endpoint
 * Provides analytics and metrics for individual products
 *
 * Endpoint:
 * - GET /api/products/:id/stats - Get product statistics
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
 * GET /api/products/:id/stats
 *
 * Retrieve comprehensive statistics for a product
 *
 * Returns analytics including:
 * - View count
 * - Sales metrics
 * - Revenue data
 * - Inventory turnover
 * - Customer engagement metrics
 *
 * @param {string} id - Product ID (path parameter)
 *
 * @example
 * GET /api/products/prod_abc123/stats
 *
 * @returns {Object} Response with product statistics
 * {
 *   success: true,
 *   data: {
 *     viewCount: number,
 *     salesCount: number,
 *     totalRevenue: number,
 *     averageRating: number,
 *     reviewCount: number,
 *     inventoryTurnover: number,
 *     lastSoldAt: string,
 *     trending: boolean,
 *     ...
 *   }
 * }
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return productController.getProductStats(request, context.params);
}
