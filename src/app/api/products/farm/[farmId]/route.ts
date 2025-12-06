/**
 * 🌾 FARM PRODUCTS API ROUTE
 *
 * Divine agricultural product listing by farm
 * Wired through ProductController for unified request handling
 *
 * Endpoint:
 * - GET /api/products/farm/:farmId - Get all products for a specific farm
 *
 * @phase Phase 4: API Route Integration
 * @reference PHASE4_QUICK_START.md
 */

import { NextRequest } from "next/server";
import { productController } from "@/lib/controllers/product.controller";

type RouteContext = {
  params: { farmId: string };
};

/**
 * GET /api/products/farm/:farmId
 *
 * Retrieve all products for a specific farm with pagination
 *
 * @param {string} farmId - Farm ID (path parameter)
 *
 * Query Parameters:
 * - page?: number (default: 1)
 * - limit?: number (default: 20, max: 100)
 * - category?: string - Filter by category
 * - organic?: boolean - Filter organic products
 * - seasonal?: boolean - Filter seasonal products
 * - inStock?: boolean - Filter by stock availability
 * - sortBy?: string - Sort field (name, price, createdAt)
 * - sortOrder?: 'asc' | 'desc'
 *
 * @example
 * GET /api/products/farm/farm_abc123
 * GET /api/products/farm/farm_abc123?organic=true&category=VEGETABLES
 * GET /api/products/farm/farm_abc123?page=2&limit=20
 *
 * @returns {Object} Response with farm products and pagination
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
 *     farmId: string,
 *     total: number,
 *     page: number,
 *     limit: number,
 *     totalPages: number
 *   }
 * }
 *
 * @returns {404} If farm is not found
 * @returns {500} If retrieval fails
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return productController.getProductsByFarmId(request, context.params);
}
