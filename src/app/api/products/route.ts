/**
 * 🌾 PRODUCT API ROUTES
 *
 * Divine agricultural product management endpoints
 * Wired through ProductController for unified request handling
 *
 * Endpoints:
 * - GET /api/products - List products with filters
 * - POST /api/products - Create new product
 *
 * @phase Phase 4: API Route Integration
 * @reference PHASE4_QUICK_START.md
 */

import { NextRequest } from "next/server";
import { productController } from "@/lib/controllers/product.controller";

/**
 * GET /api/products
 *
 * List products with biodynamic filtering and pagination
 *
 * Query Parameters:
 * - page?: number (default: 1)
 * - limit?: number (default: 20, max: 100)
 * - farmId?: string - Filter by farm
 * - category?: string - Filter by category
 * - organic?: boolean - Filter organic products
 * - seasonal?: boolean - Filter seasonal products
 * - inStock?: boolean - Filter by stock availability
 * - searchTerm?: string - Search in name/description
 * - minPrice?: number - Minimum price filter
 * - maxPrice?: number - Maximum price filter
 * - sortBy?: string - Sort field (name, price, createdAt)
 * - sortOrder?: 'asc' | 'desc'
 *
 * @example
 * GET /api/products?organic=true&category=VEGETABLES&page=1&limit=20
 *
 * @returns {Object} Response with products array and pagination meta
 */
export async function GET(request: NextRequest) {
  return productController.listProducts(request);
}

/**
 * POST /api/products
 *
 * Create a new product with agricultural consciousness
 *
 * Requires authentication - only farm owners can create products
 *
 * Request Body:
 * {
 *   name: string (required, 3-200 chars)
 *   farmId: string (required)
 *   category: ProductCategory (required)
 *   unit: string (required)
 *   pricing: {
 *     basePrice: { amount: number, currency: string }
 *     salePrice?: { amount: number, currency: string }
 *   }
 *   inventory: {
 *     quantity: number
 *     lowStockThreshold?: number
 *   }
 *   description?: string
 *   shortDescription?: string
 *   images?: Array<{ url: string, alt?: string }>
 *   isOrganic?: boolean
 *   isSeasonal?: boolean
 *   tags?: string[]
 *   nutritionalInfo?: object
 * }
 *
 * @example
 * POST /api/products
 * Authorization: Bearer <token>
 * {
 *   "name": "Organic Tomatoes",
 *   "farmId": "farm_123",
 *   "category": "VEGETABLES",
 *   "unit": "lb",
 *   "pricing": {
 *     "basePrice": { "amount": 4.99, "currency": "USD" }
 *   },
 *   "inventory": {
 *     "quantity": 100,
 *     "lowStockThreshold": 10
 *   }
 * }
 *
 * @returns {Object} Response with created product data
 */
export async function POST(request: NextRequest) {
  return productController.createProduct(request);
}
