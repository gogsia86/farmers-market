/**
 * 🌾 PRODUCT RELATED PRODUCTS API ROUTE
 *
 * Divine agricultural product recommendations endpoint
 * Finds related products based on category, farm, and agricultural patterns
 *
 * Endpoint:
 * - GET /api/products/:id/related - Get related products
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
 * GET /api/products/:id/related
 *
 * Get related products based on agricultural consciousness and similarity
 *
 * Returns products that are:
 * - From the same farm
 * - In the same category
 * - Share similar tags
 * - Have similar organic/seasonal attributes
 *
 * Query Parameters:
 * - limit?: number (default: 6, max: 20) - Number of related products to return
 *
 * @param {string} id - Product ID (path parameter)
 *
 * @example
 * GET /api/products/prod_abc123/related
 * GET /api/products/prod_abc123/related?limit=10
 *
 * @returns {Object} Response with related products
 * {
 *   success: true,
 *   data: {
 *     products: [
 *       {
 *         id: string,
 *         name: string,
 *         farmId: string,
 *         category: string,
 *         pricing: object,
 *         inventory: object,
 *         isOrganic: boolean,
 *         isSeasonal: boolean,
 *         ...
 *       }
 *     ],
 *     total: number,
 *     basedOn: {
 *       productId: string,
 *       productName: string,
 *       category: string,
 *       farmId: string
 *     }
 *   }
 * }
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return productController.getRelatedProducts(request, context.params);
}
