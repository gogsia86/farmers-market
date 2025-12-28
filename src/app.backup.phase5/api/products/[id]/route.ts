/**
 * 🌾 PRODUCT BY ID API ROUTES
 *
 * Divine agricultural product operations for individual products
 * Wired through ProductController for unified request handling
 *
 * Endpoints:
 * - GET /api/products/:id - Get product by ID
 * - PUT /api/products/:id - Update product
 * - DELETE /api/products/:id - Delete product
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
 * GET /api/products/:id
 *
 * Retrieve a single product by its ID with full details
 *
 * @param {string} id - Product ID (path parameter)
 *
 * @example
 * GET /api/products/prod_abc123
 *
 * @returns {Object} Response with product data
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     name: string,
 *     farmId: string,
 *     category: string,
 *     pricing: object,
 *     inventory: object,
 *     ...
 *   }
 * }
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return productController.getProductById(request, context.params);
}

/**
 * PUT /api/products/:id
 *
 * Update an existing product with agricultural consciousness
 *
 * Requires authentication - only farm owners can update their products
 *
 * @param {string} id - Product ID (path parameter)
 *
 * Request Body (all fields optional):
 * {
 *   name?: string
 *   description?: string
 *   shortDescription?: string
 *   category?: ProductCategory
 *   unit?: string
 *   pricing?: {
 *     basePrice?: { amount: number, currency: string }
 *     salePrice?: { amount: number, currency: string }
 *   }
 *   inventory?: {
 *     quantity?: number
 *     lowStockThreshold?: number
 *   }
 *   images?: Array<{ url: string, alt?: string }>
 *   isOrganic?: boolean
 *   isSeasonal?: boolean
 *   isActive?: boolean
 *   isFeatured?: boolean
 *   tags?: string[]
 *   nutritionalInfo?: object
 * }
 *
 * @example
 * PUT /api/products/prod_abc123
 * Authorization: Bearer <token>
 * {
 *   "name": "Updated Product Name",
 *   "pricing": {
 *     "basePrice": { "amount": 5.99, "currency": "USD" }
 *   }
 * }
 *
 * @returns {Object} Response with updated product data
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  return productController.updateProduct(request, context.params);
}

/**
 * DELETE /api/products/:id
 *
 * Delete a product from the system
 *
 * Requires authentication - only farm owners can delete their products
 *
 * @param {string} id - Product ID (path parameter)
 *
 * @example
 * DELETE /api/products/prod_abc123
 * Authorization: Bearer <token>
 *
 * @returns {Object} Response confirming deletion
 * {
 *   success: true,
 *   message: "Product deleted successfully"
 * }
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return productController.deleteProduct(request, context.params);
}
