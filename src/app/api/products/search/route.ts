/**
 * 🌾 PRODUCT SEARCH API ROUTE
 *
 * Divine agricultural product search with full-text capabilities
 * Wired through ProductController for unified request handling
 *
 * Endpoint:
 * - GET /api/products/search - Search products
 *
 * @phase Phase 4: API Route Integration
 * @reference PHASE4_QUICK_START.md
 */

import { NextRequest } from "next/server";
import { productController } from "@/lib/controllers/product.controller";

/**
 * GET /api/products/search
 *
 * Search products using full-text search with agricultural consciousness
 *
 * Query Parameters:
 * - query: string (required) - Search term to match against name, description, tags
 * - limit?: number (default: 20, max: 100) - Number of results to return
 * - farmId?: string - Filter results by specific farm
 * - category?: string - Filter results by category
 * - organic?: boolean - Filter organic products only
 * - seasonal?: boolean - Filter seasonal products only
 * - inStock?: boolean - Filter by stock availability
 *
 * Search Behavior:
 * - Searches in product name (case-insensitive)
 * - Searches in product description (case-insensitive)
 * - Searches in product tags
 * - Returns relevance-ranked results
 *
 * @example
 * GET /api/products/search?query=tomatoes
 * GET /api/products/search?query=organic&category=VEGETABLES&limit=10
 * GET /api/products/search?query=fresh&farmId=farm_123
 *
 * @returns {Object} Response with matching products
 * {
 *   success: true,
 *   data: {
 *     products: [
 *       {
 *         id: string,
 *         name: string,
 *         description: string,
 *         farmId: string,
 *         category: string,
 *         pricing: object,
 *         inventory: object,
 *         ...
 *       }
 *     ],
 *     total: number,
 *     query: string
 *   }
 * }
 *
 * @returns {400} If query parameter is missing
 * @returns {500} If search operation fails
 */
export async function GET(request: NextRequest) {
  return productController.searchProducts(request);
}
