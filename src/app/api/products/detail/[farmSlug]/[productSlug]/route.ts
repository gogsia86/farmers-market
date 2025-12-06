/**
 * 🌾 PRODUCT DETAIL BY SLUG API ROUTE
 *
 * Divine agricultural product detail retrieval with extended information
 * Wired through ProductController for unified request handling
 *
 * Endpoint:
 * - GET /api/products/detail/:farmSlug/:productSlug - Get detailed product by slug
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
 * GET /api/products/detail/:farmSlug/:productSlug
 *
 * Retrieve comprehensive product details using SEO-friendly slugs
 *
 * This endpoint returns extended product information including:
 * - Complete product data
 * - Farm details and information
 * - Related products suggestions
 * - Reviews and ratings
 * - Nutritional information
 * - Agricultural certifications
 * - Seasonal availability
 * - Stock status and inventory
 *
 * @param {string} farmSlug - Farm slug (path parameter)
 * @param {string} productSlug - Product slug (path parameter)
 *
 * @example
 * GET /api/products/detail/green-valley-farm/organic-tomatoes
 * GET /api/products/detail/sunny-acres/fresh-strawberries
 *
 * @returns {Object} Response with comprehensive product details
 * {
 *   success: true,
 *   data: {
 *     product: {
 *       id: string,
 *       name: string,
 *       slug: string,
 *       description: string,
 *       shortDescription: string,
 *       category: string,
 *       unit: string,
 *       pricing: {
 *         basePrice: { amount: number, currency: string },
 *         salePrice?: { amount: number, currency: string },
 *         wholesalePrice?: { amount: number, currency: string }
 *       },
 *       inventory: {
 *         quantity: number,
 *         reservedQuantity: number,
 *         availableQuantity: number,
 *         lowStockThreshold: number,
 *         isLowStock: boolean
 *       },
 *       images: Array<{ url: string, alt: string, isPrimary: boolean }>,
 *       isOrganic: boolean,
 *       isSeasonal: boolean,
 *       isActive: boolean,
 *       isFeatured: boolean,
 *       tags: string[],
 *       nutritionalInfo?: object,
 *       certifications?: string[],
 *       viewCount: number,
 *       createdAt: string,
 *       updatedAt: string
 *     },
 *     farm: {
 *       id: string,
 *       name: string,
 *       slug: string,
 *       description: string,
 *       address: string,
 *       contactEmail: string,
 *       contactPhone: string,
 *       certifications: string[],
 *       rating: number,
 *       reviewCount: number
 *     },
 *     relatedProducts: Array<{
 *       id: string,
 *       name: string,
 *       slug: string,
 *       pricing: object,
 *       images: array
 *     }>,
 *     reviews: {
 *       averageRating: number,
 *       totalReviews: number,
 *       recentReviews: array
 *     },
 *     seasonal: {
 *       isInSeason: boolean,
 *       seasonalMonths: string[],
 *       nextAvailability?: string
 *     }
 *   }
 * }
 *
 * @returns {404} If farm or product not found
 * @returns {500} If operation fails
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return productController.getProductDetailBySlug(request, context.params);
}
