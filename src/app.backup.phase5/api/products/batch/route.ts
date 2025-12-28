/**
 * 🌾 PRODUCT BATCH OPERATIONS API ROUTE
 *
 * Divine agricultural batch operations for multiple products
 * Wired through ProductController for unified request handling
 *
 * Endpoints:
 * - POST /api/products/batch - Batch update multiple products
 *
 * @phase Phase 4: API Route Integration
 * @reference PHASE4_QUICK_START.md
 */

import { NextRequest } from "next/server";
import { productController } from "@/lib/controllers/product.controller";

/**
 * POST /api/products/batch
 *
 * Batch update multiple products simultaneously
 *
 * Requires authentication - only farm owners can update their products
 *
 * Request Body:
 * {
 *   updates: Array<{
 *     id: string (required)
 *     data: {
 *       name?: string
 *       description?: string
 *       pricing?: object
 *       inventory?: object
 *       isActive?: boolean
 *       isFeatured?: boolean
 *       isOrganic?: boolean
 *       isSeasonal?: boolean
 *       ... (any updateable field)
 *     }
 *   }>
 * }
 *
 * @example
 * POST /api/products/batch
 * Authorization: Bearer <token>
 * {
 *   "updates": [
 *     {
 *       "id": "prod_123",
 *       "data": { "isActive": false }
 *     },
 *     {
 *       "id": "prod_456",
 *       "data": { "isFeatured": true }
 *     },
 *     {
 *       "id": "prod_789",
 *       "data": {
 *         "pricing": {
 *           "basePrice": { "amount": 3.99, "currency": "USD" }
 *         }
 *       }
 *     }
 *   ]
 * }
 *
 * @returns {Object} Response with batch update results
 * {
 *   success: true,
 *   data: {
 *     successful: Array<{ id: string, product: Product }>,
 *     failed: Array<{ id: string, error: string }>
 *   },
 *   meta: {
 *     total: number,
 *     successCount: number,
 *     failureCount: number
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  return productController.batchUpdateProducts(request);
}
