/**
 * 🌾 PRODUCT VIEW COUNT API ROUTE
 *
 * Divine agricultural view tracking endpoint
 * Increments product view count for analytics
 *
 * Endpoint:
 * - POST /api/products/:id/view - Increment product view count
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
 * POST /api/products/:id/view
 *
 * Increment the view count for a product
 *
 * This endpoint should be called when:
 * - Product detail page is loaded
 * - Product card is clicked
 * - Product preview is displayed
 *
 * No authentication required - public endpoint for analytics
 *
 * @param {string} id - Product ID (path parameter)
 *
 * @example
 * POST /api/products/prod_abc123/view
 *
 * @returns {Object} Response confirming view count increment
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     viewCount: number,
 *     lastViewedAt: string
 *   }
 * }
 *
 * Usage in frontend:
 * ```typescript
 * // Call when product page loads
 * useEffect(() => {
 *   fetch(`/api/products/${productId}/view`, { method: 'POST' });
 * }, [productId]);
 * ```
 */
export async function POST(request: NextRequest, context: RouteContext) {
  return productController.incrementViewCount(request, context.params);
}
