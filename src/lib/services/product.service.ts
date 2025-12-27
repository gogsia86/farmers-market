/**
 * 🛒 PRODUCT SERVICE - DIVINE BUSINESS LOGIC LAYER
 *
 * Business logic layer for product entity operations using repository pattern.
 * Separates business concerns from database operations and API routes.
 *
 * Divine Patterns Applied:
 * - BaseService extension for standardized patterns
 * - ServiceResponse types for consistent API responses
 * - Repository pattern usage (no direct database access)
 * - Type-safe operations with agricultural consciousness
 * - Enlightening error messages
 * - Quantum entity manifestation
 * - Comprehensive error handling
 * - Service-level caching
 * - OpenTelemetry tracing integration
 * - Seasonal and biodynamic awareness
 *
 * Architecture:
 * Controller → Service (extends BaseService) → Repository → Database
 *
 * Functional Requirements: FR-014 (Product Management)
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 * @reference .github/instructions/15_KILO_CODE_DIVINE_INTEGRATION.instructions.md
 */

import { Prisma } from "@prisma/client";
import { BaseService } from "@/lib/services/base.service";
import type {
  ServiceResponse,
  PaginatedResponse,
} from "@/lib/types/service-response";
import { ErrorCodes } from "@/lib/types/service-response";
import {
  productRepository,
  type QuantumProductRepository,
} from "@/lib/repositories/product.repository";
import { database } from "@/lib/database";
import { generateSlug } from "@/lib/utils/slug";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthorizationError,
} from "@/lib/errors";
import type {
  BatchProductResult,
  CreateProductInput,
  PaginatedProducts,
  PaginationOptions,
  Product,
  ProductFilters,
  ProductStats,
  ProductValidation,
  UpdateProductInput,
} from "@/types/product";

// ============================================================================
// TYPE DEFINITIONS FOR JSON FIELDS
// ============================================================================

interface ProductInventory {
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  availableQuantity?: number;
  isLowStock?: boolean;
  inStock?: boolean;
  lastRestocked?: Date;
}

interface ProductPricing {
  basePrice: {
    amount: number;
    currency: string;
  };
  compareAtPrice?: {
    amount: number;
    currency: string;
  };
}

interface ProductImage {
  url: string;
  isPrimary: boolean;
  alt?: string;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Product creation result with metadata
 */
export interface ProductServiceResult {
  product: Product;
  slug: string;
}

/**
 * Product listing options
 */
export interface ListProductsOptions {
  page?: number;
  limit?: number;
  farmId?: string;
  category?: string;
  status?: string;
  inStock?: boolean;
  isFeatured?: boolean;
  search?: string;
  sortBy?: "name" | "price" | "newest" | "popular";
  sortOrder?: "asc" | "desc";
}

/**
 * Inventory update request
 */
export interface UpdateInventoryRequest {
  quantity?: number;
  reservedQuantity?: number;
  lowStockThreshold?: number;
}

/**
 * Batch update request item
 */
export interface BatchUpdateItem {
  id: string;
  data: UpdateProductInput;
}

// ============================================================================
// PRODUCT SERVICE CLASS
// ============================================================================

/**
 * Product Service with agricultural consciousness
 * Extends BaseService for standardized patterns
 *
 * Returns ServiceResponse for all public methods
 *
 * @example
 * ```typescript
 * const service = new ProductService();
 * const response = await service.createProduct(userId, productData);
 *
 * if (response.success) {
 *   console.log(response.data.slug);
 * } else {
 *   console.error(response.error.message);
 * }
 * ```
 */
export class ProductService extends BaseService<Product> {
  private readonly MAX_SLUG_ATTEMPTS = 10;

  constructor(private repository = productRepository) {
    super({
      serviceName: "ProductService",
      cacheTTL: 3600,
      cachePrefix: "product",
      enableCaching: true,
      enableTracing: true,
      enableAgriculturalConsciousness: true,
    });
  }

  // ==========================================================================
  // PRODUCT CREATION
  // ==========================================================================

  /**
   * Create a new product for a farm
   *
   * Validates farm ownership, generates unique slug, and manifests the product
   * into the database with agricultural consciousness. Calculates inventory
   * metrics and sets appropriate status.
   *
   * Divine Patterns Applied:
   * - ServiceResponse for type-safe return
   * - Slug collision detection with retry logic
   * - Agricultural consciousness in validation
   * - Enlightening error messages
   *
   * Functional Requirement: FR-014 (Product Management)
   *
   * @param userId - User ID for authorization
   * @param productData - Product creation data
   * @returns ServiceResponse with created product or error
   *
   * @example
   * ```typescript
   * const response = await service.createProduct("user-123", {
   *   name: "Organic Tomatoes",
   *   farmId: "farm-456",
   *   category: "VEGETABLES",
   *   pricing: { basePrice: { amount: 5.99, currency: "USD" } },
   *   inventory: { quantity: 100, reservedQuantity: 0, lowStockThreshold: 10 }
   * });
   * ```
   */
  async createProduct(
    userId: string,
    productData: CreateProductInput,
  ): Promise<ServiceResponse<ProductServiceResult>> {
    return this.safeExecute("createProduct", async () => {
      this.logger.info("Creating product with agricultural consciousness", {
        userId,
        productName: productData.name,
      });

      // 1. Input validation
      if (!userId || typeof userId !== "string") {
        return this.validationError("Valid user ID is required");
      }

      if (!productData?.name || productData.name.trim().length < 3) {
        return this.validationError(
          "Product name must be at least 3 characters",
        );
      }

      if (!productData?.farmId) {
        return this.validationError("Farm ID is required");
      }

      // 2. Verify farm ownership
      const farm = await this.database.farm.findUnique({
        where: { id: productData.farmId },
        select: { id: true, ownerId: true, status: true },
      });

      if (!farm) {
        return this.notFound("Farm", productData.farmId);
      }

      if (farm.ownerId !== userId) {
        return this.error(
          ErrorCodes.FORBIDDEN_ACTION,
          "Unauthorized: You don't own this farm",
          { userId, farmOwnerId: farm.ownerId },
        );
      }

      if (farm.status !== "ACTIVE") {
        return this.error(
          ErrorCodes.BUSINESS_LOGIC_ERROR,
          "Cannot add products to inactive farm",
          { farmStatus: farm.status },
        );
      }

      // 3. Validate product data
      const validation = await this.validateProductData(productData);
      if (!validation.isValid) {
        return this.validationError(
          `Validation failed: ${validation.errors.map((e) => e.message).join(", ")}`,
          validation.errors,
        );
      }

      // 4. Generate unique slug
      const baseSlug = generateSlug(productData.name);
      const slug = await this.generateUniqueSlug(baseSlug, productData.farmId);

      // 5. Calculate derived values
      const inventory = productData.inventory as unknown as ProductInventory;
      const availableQuantity = this.calculateAvailableQuantityValue(
        inventory.quantity,
        inventory.reservedQuantity,
      );
      const isLowStock = availableQuantity <= inventory.lowStockThreshold;
      const images = productData.images as unknown as ProductImage[];
      const primaryPhotoUrl = images?.find((img) => img.isPrimary)?.url;

      // 6. Create product using repository
      const product = await this.repository.manifestProduct({
        ...(productData as any),
        slug,
        inventory: {
          ...inventory,
          availableQuantity,
          isLowStock,
          inStock: availableQuantity > 0,
        },
        primaryPhotoUrl,
        farm: {
          connect: { id: productData.farmId },
        },
      } as Prisma.ProductCreateInput);

      // 7. Invalidate related caches
      await this.invalidateCache(`*`); // Invalidate all product caches (list, search)

      this.logger.info(
        "Product created successfully with divine consciousness",
        { productId: product.id, slug },
      );

      const returnData = {
        product: product as unknown as Product,
        slug,
      };
      return this.success(returnData);
    });
  }

  // ==========================================================================
  // PRODUCT RETRIEVAL
  // ==========================================================================

  /**
   * Get product by ID with optional relations
   *
   * @param productId - Product ID
   * @param includeFarm - Whether to include farm details
   * @returns ServiceResponse with product or null
   */
  async getProductById(
    productId: string,
    includeFarm: boolean = true,
  ): Promise<ServiceResponse<Product | null>> {
    return this.safeExecute("getProductById", async () => {
      this.logger.debug("Fetching product by ID", { productId, includeFarm });

      // Fetch from cache with fallback to repository
      const product = await this.getCached(
        `${productId}:farm=${includeFarm}`,
        async () => await this.repository.findById(productId),
        300, // 5 minutes
      );

      if (!product) {
        return this.success(null);
      }

      // Remove farm if not requested
      let result: Product = product as unknown as Product;
      if (!includeFarm && product.farm) {
        const { farm, ...productWithoutFarm } = product;
        result = productWithoutFarm as unknown as Product;
      }

      return this.success(result);
    });
  }

  /**
   * Get product by slug (for public URLs)
   *
   * @param farmSlug - Farm slug
   * @param productSlug - Product slug
   * @returns ServiceResponse with product or null
   */
  async getProductBySlug(
    farmSlug: string,
    productSlug: string,
  ): Promise<ServiceResponse<Product | null>> {
    return this.safeExecute("getProductBySlug", async () => {
      this.logger.debug("Fetching product by slug", { farmSlug, productSlug });

      // Fetch from cache with fallback to database
      const product = await this.getCached(
        `slug:${farmSlug}:${productSlug}`,
        async () =>
          await this.database.product.findFirst({
            where: {
              slug: productSlug,
              farm: {
                slug: farmSlug,
              },
            },
            include: {
              farm: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  logoUrl: true,
                  verificationStatus: true,
                },
              },
            },
          }),
        600, // 10 minutes (slug-based lookups are more stable)
      );

      if (!product) {
        return this.success(null);
      }

      const result = product as unknown as Product;

      return this.success(result);
    });
  }

  /**
   * Get product detail by slug with reviews
   *
   * @param farmSlug - Farm slug
   * @param productSlug - Product slug
   * @returns ServiceResponse with product detail or null
   */
  async getProductDetailBySlug(
    farmSlug: string,
    productSlug: string,
  ): Promise<ServiceResponse<Product | null>> {
    return this.safeExecute("getProductDetailBySlug", async () => {
      this.logger.debug("Fetching detailed product by slug", {
        farmSlug,
        productSlug,
      });

      // Fetch from cache with fallback to database with reviews
      const product = await this.getCached(
        `detail:${farmSlug}:${productSlug}`,
        async () =>
          await this.database.product.findFirst({
            where: {
              slug: productSlug,
              farm: {
                slug: farmSlug,
              },
              status: "ACTIVE",
            },
            include: {
              farm: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  logoUrl: true,
                  verificationStatus: true,
                  location: true,
                  description: true,
                },
              },
              reviews: {
                take: 5,
                orderBy: {
                  createdAt: "desc",
                },
                include: {
                  customer: {
                    select: {
                      id: true,
                      name: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          }),
        600, // 10 minutes (detail pages with reviews are relatively stable)
      );

      if (!product) {
        return this.notFound("Product not found");
      }

      const result = product as unknown as Product;

      return this.success(result);
    });
  }

  // ==========================================================================
  // PRODUCT LISTING
  // ==========================================================================

  /**
   * List products with filters and pagination
   *
   * @param filters - Product filters
   * @param options - Pagination options
   * @returns ServiceResponse with paginated products
   */
  async listProducts(
    filters: ProductFilters = {},
    options?: PaginationOptions,
  ): Promise<PaginatedResponse<Product>> {
    return this.safeExecute("listProducts", async () => {
      const { page = 1, limit = 20 } = options || {};
      const skip = (page - 1) * limit;

      this.logger.debug("Listing products", { filters, page, limit });

      // Generate cache key from filters and pagination
      const cacheKey = `list:${JSON.stringify({ filters, page, limit })}`;

      // Fetch from cache with fallback to database query
      const result = await this.getCached(
        cacheKey,
        async () => {
          // Build where clause
          const where = this.buildWhereClause(filters);

          // Build orderBy clause
          const orderBy = this.buildOrderByClause(filters);

          // Execute queries
          const [products, total] = await Promise.all([
            this.repository.findMany(where, {
              skip,
              take: limit,
              orderBy,
            }),
            this.repository.count(where),
          ]);

          return { products, total };
        },
        60, // 1 minute (list data changes frequently)
      );

      return this.paginated(
        result.products as unknown as Product[],
        page,
        limit,
        result.total,
      );
    });
  }

  /**
   * Search products by text
   *
   * @param searchTerm - Search query
   * @param limit - Maximum results
   * @returns ServiceResponse with matching products
   */
  async searchProducts(
    query: string,
    limit: number = 20,
  ): Promise<ServiceResponse<Product[]>> {
    return this.safeExecute("searchProducts", async () => {
      this.logger.debug("Searching products", { query, limit });

      // Fetch from cache with fallback to repository search
      const products = await this.getCached(
        `search:${query}:limit=${limit}`,
        async () =>
          await this.repository.searchProducts(query, {
            take: limit,
            orderBy: { createdAt: "desc" },
          }),
        120, // 2 minutes (search results change moderately)
      );

      return this.success(products as unknown as Product[]);
    });
  }

  /**
   * Get related products (same category or farm)
   *
   * @param productId - Product ID
   * @param limit - Maximum results
   * @returns ServiceResponse with related products
   */
  async getRelatedProducts(
    productId: string,
    limit: number = 6,
  ): Promise<ServiceResponse<Product[]>> {
    return this.safeExecute("getRelatedProducts", async () => {
      this.logger.debug("Fetching related products", { productId, limit });

      // Get product to determine category and farm
      const product = await this.repository.findById(productId);

      if (!product) {
        return this.success([]);
      }

      // Find related products
      const relatedProducts = await this.repository.findMany(
        {
          id: { not: productId },
          status: "ACTIVE" as any,
          inStock: true,
          OR: [{ category: product.category }, { farmId: product.farmId }],
        },
        {
          take: limit,
          orderBy: [
            { featured: "desc" as any },
            { averageRating: "desc" as any },
            { viewsCount: "desc" as any },
          ],
        },
      );

      return this.success(relatedProducts as unknown as Product[]);
    });
  }

  // ==========================================================================
  // PRODUCT UPDATE
  // ==========================================================================

  /**
   * Update product
   *
   * @param productId - Product ID
   * @param updates - Product updates
   * @param userId - User ID for authorization
   * @returns ServiceResponse with updated product
   */
  async updateProduct(
    productId: string,
    updates: UpdateProductInput,
    userId: string,
  ): Promise<ServiceResponse<Product>> {
    return this.safeExecute("updateProduct", async () => {
      this.logger.info("Updating product", {
        productId,
        userId,
        updates: Object.keys(updates),
      });

      // 1. Get existing product
      const existing = await this.repository.findById(productId);

      if (!existing) {
        return this.notFound("Product", productId);
      }

      // 2. Check ownership
      const farmDetails = await this.database.farm.findUnique({
        where: { id: existing.farmId },
        select: { ownerId: true },
      });

      if (!farmDetails || farmDetails.ownerId !== userId) {
        return this.error(
          ErrorCodes.FORBIDDEN_ACTION,
          "Unauthorized: You don't own this product",
          { userId, farmOwnerId: farmDetails?.ownerId },
        );
      }

      // 3. Handle slug update if name changed
      let slug = existing.slug;
      if (updates.name && updates.name !== existing.name) {
        const baseSlug = generateSlug(updates.name);
        slug = await this.generateUniqueSlug(
          baseSlug,
          existing.farmId,
          productId,
        );
      }

      // 4. Handle inventory updates if provided
      let inventoryUpdates: any = {};
      if (updates.inventory) {
        const existingInventory =
          existing.inventory as unknown as ProductInventory;
        const updatedInventory = updates.inventory as Partial<ProductInventory>;
        const availableQuantity =
          (updatedInventory.quantity ?? existingInventory.quantity) -
          (updatedInventory.reservedQuantity ??
            existingInventory.reservedQuantity);

        const lowStockThreshold =
          updatedInventory.lowStockThreshold ??
          existingInventory.lowStockThreshold ??
          10;

        inventoryUpdates = {
          ...existingInventory,
          ...updatedInventory,
          availableQuantity,
          isLowStock: availableQuantity <= lowStockThreshold,
          inStock: availableQuantity > 0,
        };
      }

      // 5. Handle primary photo update
      let primaryPhotoUrl = existing.primaryPhotoUrl;
      if (updates.images) {
        const images = updates.images as unknown as ProductImage[];
        primaryPhotoUrl = images.find((img) => img.isPrimary)?.url ?? null;
      }

      // 6. Update product using repository
      const product = await this.repository.update(productId, {
        ...(updates as any),
        slug,
        inventory: Object.keys(inventoryUpdates).length
          ? inventoryUpdates
          : undefined,
        primaryPhotoUrl,
        updatedAt: new Date().toISOString(),
      } as Prisma.ProductUpdateInput);

      // 7. Invalidate related caches
      await this.invalidateCache(`${productId}*`); // Product by ID and variations
      await this.invalidateCache(`slug:*`); // All slug-based lookups
      await this.invalidateCache(`detail:*`); // All detail pages
      await this.invalidateCache(`list:*`); // All list queries
      await this.invalidateCache(`search:*`); // All search results

      this.logger.info("Product updated successfully", { productId, slug });

      return this.success(product as unknown as Product);
    });
  }

  /**
   * Update product inventory
   *
   * @param productId - Product ID
   * @param inventoryUpdate - Inventory updates
   * @param userId - User ID for authorization
   * @returns ServiceResponse with updated product
   */
  async updateInventory(
    productId: string,
    inventoryUpdate: UpdateInventoryRequest,
    userId: string,
  ): Promise<ServiceResponse<Product>> {
    return this.safeExecute("updateInventory", async () => {
      this.logger.info("Updating product inventory", {
        productId,
        userId,
        inventoryUpdate,
      });

      // 1. Get product
      const product = await this.repository.findById(productId);

      if (!product) {
        return this.notFound("Product", productId);
      }

      // 2. Check ownership
      const farmDetails = await this.database.farm.findUnique({
        where: { id: product.farmId },
        select: { id: true, ownerId: true },
      });

      if (!farmDetails || farmDetails.ownerId !== userId) {
        return this.error(
          ErrorCodes.FORBIDDEN_ACTION,
          "Unauthorized: You don't own this product",
          { userId, farmOwnerId: farmDetails?.ownerId },
        );
      }

      // 3. Calculate new inventory values
      const existingInventory = product.inventory as any;
      const inventory = { ...existingInventory, ...inventoryUpdate };
      const availableQuantity = inventory.quantity - inventory.reservedQuantity;
      const isLowStock = availableQuantity <= inventory.lowStockThreshold;

      // 4. Update using repository
      const updated = await this.repository.update(productId, {
        inventory: {
          ...inventory,
          availableQuantity,
          isLowStock,
          inStock: availableQuantity > 0,
          lastRestocked: new Date(),
        },
        status:
          availableQuantity > 0 ? ("ACTIVE" as any) : ("OUT_OF_STOCK" as any),
      } as Prisma.ProductUpdateInput);

      // 5. Invalidate related caches
      await this.invalidateCache(`${productId}*`); // Product by ID
      await this.invalidateCache(`list:*`); // List queries (inventory changed)

      this.logger.info("Inventory updated successfully", {
        productId,
        availableQuantity,
      });

      return this.success(updated as unknown as Product);
    });
  }

  // ==========================================================================
  // PRODUCT DELETION
  // ==========================================================================

  /**
   * Delete product (soft delete)
   *
   * @param productId - Product ID
   * @param userId - User ID for authorization
   * @returns ServiceResponse with success confirmation
   */
  async deleteProduct(
    productId: string,
    userId: string,
  ): Promise<ServiceResponse<void>> {
    return this.safeExecute("deleteProduct", async () => {
      this.logger.info("Deleting product", { productId, userId });

      // 1. Get product
      const product = await this.repository.findById(productId);

      if (!product) {
        return this.notFound("Product", productId);
      }

      // 2. Check ownership
      const farmDetails = await this.database.farm.findUnique({
        where: { id: product.farmId },
        select: { ownerId: true },
      });

      if (!farmDetails || farmDetails.ownerId !== userId) {
        return this.error(
          ErrorCodes.FORBIDDEN_ACTION,
          "Unauthorized: You don't own this product",
          { userId, farmOwnerId: farmDetails?.ownerId },
        );
      }

      // 3. Soft delete - update status to ARCHIVED
      await this.repository.update(productId, {
        status: "ARCHIVED" as any,
        updatedAt: new Date().toISOString(),
      } as Prisma.ProductUpdateInput);

      // 4. Invalidate related caches
      await this.invalidateCache(`${productId}*`); // Product by ID
      await this.invalidateCache(`slug:*`); // Slug lookups
      await this.invalidateCache(`detail:*`); // Detail pages
      await this.invalidateCache(`list:*`); // List queries

      this.logger.info("Product deleted successfully", { productId });

      return this.success(undefined as void);
    });
  }

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================

  /**
   * Batch update multiple products
   *
   * @param updates - Array of product updates
   * @param userId - User ID for authorization
   * @returns ServiceResponse with batch result
   */
  async batchUpdateProducts(
    updates: BatchUpdateItem[],
    userId: string,
  ): Promise<ServiceResponse<BatchProductResult>> {
    return this.safeExecute("batchUpdateProducts", async () => {
      this.logger.info("Batch updating products", {
        userId,
        updateCount: updates.length,
      });

      const result: BatchProductResult = {
        successful: [],
        failed: [],
        total: updates.length,
        successCount: 0,
        failureCount: 0,
      };

      for (const update of updates) {
        try {
          const response = await this.updateProduct(
            update.id,
            update.data,
            userId,
          );

          if (response.success) {
            result.successful.push({
              productId: response.data.id,
              product: response.data,
            } as any);
            result.successCount++;
          } else {
            result.failed.push({
              productId: update.id,
              error: response.error.message,
            });
            result.failureCount++;
          }
        } catch (error) {
          result.failed.push({
            productId: update.id,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          result.failureCount++;
        }
      }

      this.logger.info("Batch update completed", {
        successCount: result.successCount,
        failureCount: result.failureCount,
      });

      return this.success(result);
    });
  }

  // ==========================================================================
  // STATISTICS & METRICS
  // ==========================================================================

  /**
   * Get product statistics
   *
   * @param productId - Product ID
   * @returns ServiceResponse with product stats
   */
  async getProductStats(
    productId: string,
  ): Promise<ServiceResponse<ProductStats>> {
    return this.safeExecute("getProductStats", async () => {
      this.logger.debug("Fetching product stats", { productId });

      // Get product with counts
      const product = await this.repository.findById(productId);

      if (!product) {
        return this.notFound("Product", productId);
      }

      const stats: ProductStats = {
        productId: product.id,
        views: (product as any).viewsCount || 0,
        orders: product._count.orderItems || 0,
        revenue: 0, // Would need to calculate from orders
        reviewCount: product._count.reviews || 0,
        inWishlistCount: 0, // Would need to query wishlist
      };

      return this.success(stats);
    });
  }

  /**
   * Increment product view count
   *
   * @param productId - Product ID
   * @returns ServiceResponse with success confirmation
   */
  async incrementViewCount(productId: string): Promise<ServiceResponse<void>> {
    return this.safeExecute("incrementViewCount", async () => {
      await this.database.product.update({
        where: { id: productId },
        data: {
          viewsCount: {
            increment: 1,
          },
        },
      });

      // Invalidate product caches (view count changed)
      await this.invalidateCache(`${productId}*`);
      await this.invalidateCache(`detail:*`); // Detail pages show view count

      return this.success(undefined as void);
    });
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  /**
   * Build Prisma where clause from filters
   */
  private buildWhereClause(filters: ProductFilters): any {
    const where: any = {};

    // Farm filtering
    if (filters.farmId) {
      where.farmId = filters.farmId;
    }
    if (filters.farmIds && filters.farmIds.length > 0) {
      where.farmId = { in: filters.farmIds };
    }

    // Category filtering
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.categories && filters.categories.length > 0) {
      where.category = { in: filters.categories };
    }
    if (filters.subCategory) {
      where.subCategory = filters.subCategory;
    }

    // Status filtering
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters.inStock !== undefined) {
      where.inventory = {
        inStock: filters.inStock,
      };
    }
    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    // Attribute filtering
    if (filters.isOrganic !== undefined) {
      where.attributes = {
        path: ["isOrganic"],
        equals: filters.isOrganic,
      };
    }
    if (filters.isNonGMO !== undefined) {
      where.attributes = {
        path: ["isNonGMO"],
        equals: filters.isNonGMO,
      };
    }

    // Seasonal filtering
    if (filters.season) {
      where.seasons = {
        has: filters.season,
      };
    }

    // Price filtering
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.pricing = {
        path: ["basePrice", "amount"],
        gte: filters.minPrice,
        lte: filters.maxPrice,
      };
    }

    // Search
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { tags: { has: filters.search } },
      ];
    }

    return where;
  }

  /**
   * Build Prisma orderBy clause from filters
   */
  private buildOrderByClause(filters: ProductFilters): any {
    const orderBy: any = {};

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "name":
          orderBy.name = filters.sortOrder || "asc";
          break;
        case "price":
          orderBy.pricing = {
            path: ["basePrice", "amount"],
            order: filters.sortOrder || "asc",
          };
          break;
        case "newest":
          orderBy.createdAt = "desc";
          break;
        case "popular":
          orderBy.createdAt = "desc";
          break;
        default:
          orderBy.createdAt = "desc";
      }
    } else {
      orderBy.createdAt = "desc";
    }

    return orderBy;
  }

  /**
   * Generate unique slug for product
   */
  private async generateUniqueSlug(
    baseSlug: string,
    farmId: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    let attempts = 0;

    while (attempts < this.MAX_SLUG_ATTEMPTS) {
      const existing = await this.database.product.findFirst({
        where: {
          slug,
          farmId,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
      attempts++;
    }

    // Fallback: add timestamp
    return `${baseSlug}-${Date.now()}`;
  }

  /**
   * Validate product data
   */
  private async validateProductData(
    productData: CreateProductInput,
  ): Promise<ProductValidation> {
    const errors: Array<{ field: string; message: string }> = [];

    // Name validation
    if (!productData.name || productData.name.trim().length < 3) {
      errors.push({
        field: "name",
        message: "Product name must be at least 3 characters",
      });
    }
    if (productData.name && productData.name.length > 200) {
      errors.push({
        field: "name",
        message: "Product name must not exceed 200 characters",
      });
    }

    // Description validation
    if (productData.description && productData.description.length > 2000) {
      errors.push({
        field: "description",
        message: "Description must not exceed 2000 characters",
      });
    }

    // Price validation
    const pricing = productData.pricing as ProductPricing | null | undefined;
    if (!pricing?.basePrice?.amount || pricing.basePrice.amount <= 0) {
      errors.push({
        field: "pricing.basePrice",
        message: "Valid base price is required",
      });
    }

    // Category validation
    const validCategories = [
      "VEGETABLES",
      "FRUITS",
      "DAIRY",
      "MEAT",
      "EGGS",
      "BAKERY",
      "HONEY",
      "PRESERVES",
      "OTHER",
    ];
    if (
      productData.category &&
      !validCategories.includes(productData.category)
    ) {
      errors.push({
        field: "category",
        message: `Category must be one of: ${validCategories.join(", ")}`,
      });
    }

    // Unit validation
    const validUnits = [
      "lb",
      "oz",
      "kg",
      "g",
      "each",
      "bunch",
      "pint",
      "quart",
    ];
    if (productData.unit && !validUnits.includes(productData.unit)) {
      errors.push({
        field: "unit",
        message: `Unit must be one of: ${validUnits.join(", ")}`,
      });
    }

    // Inventory validation
    const inventory = productData.inventory as
      | ProductInventory
      | null
      | undefined;
    if (inventory?.quantity !== undefined && inventory.quantity < 0) {
      errors.push({
        field: "inventory.quantity",
        message: "Inventory quantity cannot be negative",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate available quantity from inventory
   */
  private calculateAvailableQuantityValue(
    quantity: number,
    reservedQuantity: number,
  ): number {
    const totalQuantity = quantity || 0;
    const reserved = reservedQuantity || 0;
    return Math.max(0, totalQuantity - reserved);
  }
}

// ============================================================================
// SINGLETON INSTANCE EXPORT
// ============================================================================

/**
 * Singleton instance of ProductService for use in controllers and API routes
 *
 * @example
 * ```typescript
 * import { productService } from "@/lib/services/product.service";
 *
 * const response = await productService.listProducts(filters, pagination);
 * ```
 */
export const productService = new ProductService();
