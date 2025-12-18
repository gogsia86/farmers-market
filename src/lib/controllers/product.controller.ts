/**
 * 🌾 PRODUCT CONTROLLER - API REQUEST HANDLERS
 *
 * Handles all product-related HTTP requests with divine agricultural consciousness.
 * Uses BaseController for unified response patterns and error handling.
 *
 * Divine Patterns Applied:
 * - Controller layer (HTTP → Controller → Service → Repository → Database)
 * - Unified API response format
 * - Agricultural consciousness
 * - Type-safe request handling
 * - Authentication & authorization
 * - Comprehensive validation
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 * @reference .github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./base.controller";
import { ProductService } from "@/lib/services/product.service";
import type { ProductFilters } from "@/types/product";
import { ProductCategory } from "@/types/product";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Product pricing validation schema
 */
const PricingSchema = z.object({
  basePrice: z.object({
    amount: z.number().positive("Price must be positive"),
    currency: z.string().default("USD"),
  }),
  salePrice: z
    .object({
      amount: z.number().positive(),
      currency: z.string().default("USD"),
    })
    .optional(),
  wholesalePrice: z
    .object({
      amount: z.number().positive(),
      currency: z.string().default("USD"),
    })
    .optional(),
});

/**
 * Product inventory validation schema
 */
const InventorySchema = z.object({
  quantity: z.number().int().nonnegative("Quantity cannot be negative"),
  reservedQuantity: z
    .number()
    .int()
    .nonnegative("Reserved quantity cannot be negative")
    .default(0),
  lowStockThreshold: z
    .number()
    .int()
    .nonnegative("Threshold must be non-negative")
    .default(10),
});

/**
 * Product image validation schema
 */
const ImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  alt: z.string().optional(),
  isPrimary: z.boolean().optional().default(false),
});

/**
 * Nutritional info validation schema
 */
const NutritionSchema = z.object({
  servingSize: z.string().optional(),
  calories: z.number().nonnegative().optional(),
  protein: z.number().nonnegative().optional(),
  carbohydrates: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
  fiber: z.number().nonnegative().optional(),
});

/**
 * Product creation validation schema
 */
const CreateProductSchema = z.object({
  // Basic info (required)
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(200, "Product name cannot exceed 200 characters"),
  farmId: z.string().min(1, "Farm ID is required"),

  // Description (optional)
  description: z.string().max(2000).optional(),
  shortDescription: z.string().max(500).optional(),

  // Category & Unit (required)
  category: z.nativeEnum(ProductCategory),
  unit: z.string().min(1, "Unit is required (e.g., lb, oz, each)"),

  // Pricing (required)
  pricing: PricingSchema,

  // Inventory (required)
  inventory: InventorySchema,

  // Images (optional)
  images: z.array(ImageSchema).optional().default([]),

  // Properties (optional)
  organic: z.boolean().optional().default(false),
  seasonal: z.boolean().optional().default(false),
  harvestDate: z.string().datetime().optional(),

  // Availability (optional)
  availableFrom: z.string().datetime().optional(),
  availableTo: z.string().datetime().optional(),

  // Nutrition (optional)
  nutrition: NutritionSchema.optional(),

  // Tags (optional)
  tags: z.array(z.string()).optional().default([]),
});

/**
 * Product update validation schema (all fields optional)
 */
const UpdateProductSchema = CreateProductSchema.partial().omit({
  farmId: true,
});

/**
 * Product listing query parameters schema
 */
const ListProductsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  farmId: z.string().optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  organic: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined,
    ),
  seasonal: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined,
    ),
  inStock: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined,
    ),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  sortBy: z.enum(["name", "price", "newest", "popular", "season"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

/**
 * Product search query parameters schema
 */
const SearchProductsQuerySchema = z.object({
  query: z.string().optional().default(""),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  farmId: z.string().optional(),
  category: z.nativeEnum(ProductCategory).optional(),
});

/**
 * Inventory update validation schema
 */
const UpdateInventorySchema = z.object({
  quantity: z.number().int().nonnegative().optional(),
  reservedQuantity: z.number().int().nonnegative().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
});

/**
 * Batch update validation schema
 */
const BatchUpdateSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().min(1, "Product ID is required"),
      data: UpdateProductSchema,
    }),
  ),
});

// ============================================================================
// PRODUCT CONTROLLER CLASS
// ============================================================================

/**
 * Product Controller with divine agricultural consciousness
 *
 * Handles all product-related API endpoints:
 * - GET /api/products - List products
 * - POST /api/products - Create product
 * - GET /api/products/[id] - Get product by ID
 * - PATCH /api/products/[id] - Update product
 * - DELETE /api/products/[id] - Delete product
 * - GET /api/products/search - Search products
 * - GET /api/products/slug/[farmSlug]/[productSlug] - Get product by slug
 * - PATCH /api/products/[id]/inventory - Update inventory
 * - GET /api/products/[id]/stats - Get product statistics
 * - POST /api/products/batch - Batch update products
 * - GET /api/products/[id]/related - Get related products
 * - POST /api/products/[id]/view - Increment view count
 *
 * @example
 * ```typescript
 * // In API route: /api/products/route.ts
 * const controller = new ProductController();
 * export const GET = (req: NextRequest) => controller.listProducts(req);
 * export const POST = (req: NextRequest) => controller.createProduct(req);
 * ```
 */
export class ProductController extends BaseController {
  constructor() {
    super("ProductController");
  }

  /**
   * List products with filters and pagination
   * GET /api/products
   *
   * Query parameters:
   * - page?: number (default: 1)
   * - limit?: number (default: 20)
   * - farmId?: string
   * - category?: ProductCategory
   * - organic?: boolean
   * - seasonal?: boolean
   * - inStock?: boolean
   * - minPrice?: number
   * - maxPrice?: number
   * - sortBy?: "name" | "price" | "createdAt" | "popularity"
   * - sortOrder?: "asc" | "desc"
   *
   * @param request - Next.js request object
   * @returns JSON response with paginated products
   */
  async listProducts(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      // Parse and validate query parameters
      const searchParams = Object.fromEntries(request.nextUrl.searchParams);
      const validated = ListProductsQuerySchema.parse(searchParams);

      // Extract pagination and filters
      const { page, limit, sortBy, sortOrder, ...filters } = validated;

      // Build filters object
      const productFilters: ProductFilters = {
        ...(filters.farmId && { farmId: filters.farmId }),
        ...(filters.category && { category: filters.category }),
        ...(filters.organic !== undefined && { isOrganic: filters.organic }),
        ...(filters.seasonal !== undefined && { isSeasonal: filters.seasonal }),
        ...(filters.inStock !== undefined && { inStock: filters.inStock }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(sortBy && { sortBy: sortBy as ProductFilters["sortBy"] }),
        ...(sortOrder && {
          sortOrder: sortOrder as ProductFilters["sortOrder"],
        }),
      };

      // Call service layer
      const result = await ProductService.listProducts(productFilters, {
        page: page || 1,
        limit: limit || 20,
      });

      return this.success(result, {
        message: "Products retrieved successfully",
      });
    });
  }

  /**
   * Create a new product
   * POST /api/products
   *
   * Requires authentication
   *
   * @param request - Next.js request object with product data
   * @returns JSON response with created product
   */
  async createProduct(request: NextRequest): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      const userId = session.user.id;

      // Parse and validate request body
      const body = await request.json();
      const validated = CreateProductSchema.parse(body);

      // Call service layer
      const product = await ProductService.createProduct(
        validated as any, // Type-safe after Zod validation
        userId,
      );

      return this.created(product, { message: "Product created successfully" });
    });
  }

  /**
   * Get product by ID
   * GET /api/products/[id]
   *
   * @param request - Next.js request object
   * @param params - Route parameters { id: string }
   * @returns JSON response with product data
   */
  async getProductById(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      const { id } = params;

      // Check if includeFarm query param is present
      const includeFarm =
        request.nextUrl.searchParams.get("includeFarm") !== "false";

      // Call service layer
      const product = await ProductService.getProductById(id, includeFarm);

      if (!product) {
        return this.notFound("Product not found");
      }

      return this.success(product, {
        message: "Product retrieved successfully",
      });
    });
  }

  /**
   * Get product by farm and product slug
   * GET /api/products/slug/[farmSlug]/[productSlug]
   *
   * @param request - Next.js request object
   * @param params - Route parameters { farmSlug: string, productSlug: string }
   * @returns JSON response with product data
   */
  async getProductBySlug(
    request: NextRequest,
    params: { farmSlug: string; productSlug: string },
  ): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      const { farmSlug, productSlug } = params;

      // Call service layer
      const product = await ProductService.getProductBySlug(
        farmSlug,
        productSlug,
      );

      if (!product) {
        return this.notFound("Product not found");
      }

      return this.success(product, {
        message: "Product retrieved successfully",
      });
    });
  }

  /**
   * Update product
   * PATCH /api/products/[id]
   *
   * Requires authentication and ownership
   *
   * @param request - Next.js request object with update data
   * @param params - Route parameters { id: string }
   * @returns JSON response with updated product
   */
  async updateProduct(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      const userId = session.user.id;
      const { id } = params;

      // Parse and validate request body
      const body = await request.json();
      const validated = UpdateProductSchema.parse(body);

      // Call service layer
      const product = await ProductService.updateProduct(
        id,
        validated as any, // Type-safe after Zod validation
        userId,
      );

      return this.success(product, { message: "Product updated successfully" });
    });
  }

  /**
   * Delete product (soft delete)
   * DELETE /api/products/[id]
   *
   * Requires authentication and ownership
   *
   * @param request - Next.js request object
   * @param params - Route parameters { id: string }
   * @returns JSON response confirming deletion
   */
  async deleteProduct(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      const userId = session.user.id;
      const { id } = params;

      // Call service layer
      await ProductService.deleteProduct(id, userId);

      return this.success(null, { message: "Product deleted successfully" });
    });
  }

  /**
   * Search products
   * GET /api/products/search
   *
   * Query parameters:
   * - query: string (required)
   * - limit?: number (default: 20)
   * - farmId?: string
   * - category?: ProductCategory
   *
   * @param request - Next.js request object
   * @returns JSON response with search results
   */
  async searchProducts(request: NextRequest): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      // Parse and validate query parameters
      const searchParams = Object.fromEntries(request.nextUrl.searchParams);
      const validated = SearchProductsQuerySchema.parse(searchParams);

      // If no query provided, return empty results or all products based on limit
      const query = validated.query || "";

      // Call service layer
      const products = await ProductService.searchProducts(
        query,
        validated.limit || 20,
      );

      return this.success(
        { products, total: products.length, query },
        { message: "Search completed successfully" },
      );
    });
  }

  /**
   * Update product inventory
   * PATCH /api/products/[id]/inventory
   *
   * Requires authentication and ownership
   *
   * @param request - Next.js request object with inventory data
   * @param params - Route parameters { id: string }
   * @returns JSON response with updated product
   */
  async updateInventory(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      const userId = session.user.id;
      const { id } = params;

      // Parse and validate request body
      const body = await request.json();
      const validated = UpdateInventorySchema.parse(body);

      // Call service layer
      const product = await ProductService.updateInventory(
        id,
        validated,
        userId,
      );

      return this.success(product, {
        message: "Inventory updated successfully",
      });
    });
  }

  /**
   * Get product statistics
   * GET /api/products/[id]/stats
   *
   * @param request - Next.js request object
   * @param params - Route parameters { id: string }
   * @returns JSON response with product statistics
   */
  async getProductStats(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      const { id } = params;

      // Call service layer
      const stats = await ProductService.getProductStats(id);

      return this.success(stats, {
        message: "Product statistics retrieved successfully",
      });
    });
  }

  /**
   * Batch update products
   * POST /api/products/batch
   *
   * Requires authentication and ownership for each product
   *
   * @param request - Next.js request object with batch updates
   * @returns JSON response with batch result
   */
  async batchUpdateProducts(request: NextRequest): Promise<NextResponse> {
    return this.handleAuthenticatedRequest(request, async (session) => {
      const userId = session.user.id;

      // Parse and validate request body
      const body = await request.json();
      const validated = BatchUpdateSchema.parse(body);

      // Call service layer
      const result = await ProductService.batchUpdateProducts(
        validated.updates.map((update) => ({
          id: update.id,
          data: update.data as any, // Type-safe after Zod validation
        })),
        userId,
      );

      return this.success(result, { message: "Batch update completed" });
    });
  }

  /**
   * Get related products
   * GET /api/products/[id]/related
   *
   * @param request - Next.js request object
   * @param params - Route parameters { id: string }
   * @returns JSON response with related products
   */
  async getRelatedProducts(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      const { id } = params;

      // Get limit from query params
      const limit = parseInt(
        request.nextUrl.searchParams.get("limit") || "6",
        10,
      );

      // Call service layer
      const products = await ProductService.getRelatedProducts(id, limit);

      return this.success(
        { products, total: products.length },
        { message: "Related products retrieved successfully" },
      );
    });
  }

  /**
   * Increment product view count
   * POST /api/products/[id]/view
   *
   * @param request - Next.js request object
   * @param params - Route parameters { id: string }
   * @returns JSON response confirming view count increment
   */
  async incrementViewCount(
    request: NextRequest,
    params: { id: string },
  ): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      const { id } = params;

      // Call service layer
      await ProductService.incrementViewCount(id);

      return this.success(null, {
        message: "View count incremented successfully",
      });
    });
  }

  /**
   * Get product detail by slug (with reviews)
   * GET /api/products/detail/[farmSlug]/[productSlug]
   *
   * @param request - Next.js request object
   * @param params - Route parameters { farmSlug: string, productSlug: string }
   * @returns JSON response with product detail including reviews
   */
  async getProductDetailBySlug(
    request: NextRequest,
    params: { farmSlug: string; productSlug: string },
  ): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      const { farmSlug, productSlug } = params;

      // Call service layer
      const detail = await ProductService.getProductDetailBySlug(
        farmSlug,
        productSlug,
      );

      if (!detail) {
        return this.notFound("Product not found");
      }

      return this.success(detail, {
        message: "Product detail retrieved successfully",
      });
    });
  }

  /**
   * Get products by farm ID
   * GET /api/farms/[farmId]/products
   *
   * @param request - Next.js request object
   * @param params - Route parameters { farmId: string }
   * @returns JSON response with farm's products
   */
  async getProductsByFarmId(
    request: NextRequest,
    params: { farmId: string },
  ): Promise<NextResponse> {
    return this.handleRequest(request, async () => {
      const { farmId } = params;

      // Parse pagination from query params
      const page = parseInt(
        request.nextUrl.searchParams.get("page") || "1",
        10,
      );
      const limit = parseInt(
        request.nextUrl.searchParams.get("limit") || "20",
        10,
      );

      // Call service layer
      const result = await ProductService.listProducts(
        { farmId },
        { page, limit },
      );

      return this.success(result, {
        message: "Farm products retrieved successfully",
      });
    });
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

/**
 * Singleton ProductController instance for use in API routes
 *
 * @example
 * ```typescript
 * // In /api/products/route.ts
 * import { productController } from "@/lib/controllers/product.controller";
 *
 * export const GET = (req: NextRequest) => productController.listProducts(req);
 * export const POST = (req: NextRequest) => productController.createProduct(req);
 * ```
 */
export const productController = new ProductController();
