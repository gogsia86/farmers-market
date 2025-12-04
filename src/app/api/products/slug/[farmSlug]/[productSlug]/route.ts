/**
 * 🌾 PRODUCT BY SLUG API ROUTE
 *
 * Divine agricultural product retrieval by SEO-friendly slugs
 * Wired through ProductController for unified request handling
 *
 * Endpoint:
 * - GET /api/products/slug/:farmSlug/:productSlug - Get product by slug
 *
 * @phase Phase 4: API Route Integration
 * @reference PHASE4_QUICK_START.md
 */

import { NextRequest } from "next/server";
import { productController } from "@/lib/controllers/product.controller";

type RouteContext = {
  params: {
    farmSlug: string;
    productSlug: string;
  };
};

/**
 * GET /api/products/slug/:farmSlug/:productSlug
 *
 * Retrieve a product using SEO-friendly slugs
 *
 * This endpoint allows fetching products using human-readable URLs
 * for better SEO and user experience.
 *
 * @param {string} farmSlug - Farm slug (path parameter)
 * @param {string} productSlug - Product slug (path parameter)
 *
 * @example
 * GET /api/products/slug/green-valley-farm/organic-tomatoes
 * GET /api/products/slug/sunny-acres/fresh-strawberries
 *
 * @returns {Object} Response with product data
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     name: string,
 *     slug: string,
 *     farmId: string,
 *     farm: {
 *       id: string,
 *       name: string,
 *       slug: string,
 *       ...
 *     },
 *     category: string,
 *     pricing: object,
 *     inventory: object,
 *     description: string,
 *     images: array,
 *     ...
 *   }
 * }
 *
 * @returns {404} If farm or product not found
 * @returns {500} If operation fails
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return productController.getProductBySlug(request, context.params);
}
