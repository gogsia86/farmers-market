/**
 * 🌾 QUANTUM PRODUCT CATALOG SERVICE
 * Divine product management service with agricultural consciousness
 *
 * Features:
 * - Complete CRUD operations for products
 * - Product variants and inventory management
 * - Seasonal awareness and availability tracking
 * - Category and tag management
 * - Image and media handling
 * - Price management and discounts
 * - Search and filtering with quantum efficiency
 * - Agricultural domain intelligence
 *
 * Architecture:
 * - Service Layer (Business Logic)
 * - Uses canonical database import
 * - Full type safety with Prisma types
 * - Comprehensive error handling
 * - Biodynamic product patterns
 */

import { CacheTTL, multiLayerCache } from "@/lib/cache/multi-layer.cache";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/monitoring/logger";
import { productRepository } from "@/lib/repositories/product.repository";
import type { Product, ProductCategory, ProductStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

const logger = createLogger("ProductService");

/**
 * 🌱 CREATE PRODUCT REQUEST TYPE
 */
export interface CreateProductRequest {
  name: string;
  description: string;
  category: ProductCategory;
  farmId: string;
  price: number;
  unit: string;
  quantityAvailable: number;
  images?: string[];
  tags?: string[];
  organic?: boolean;
  harvestDate?: Date;
  storageInstructions?: string;
}

/**
 * 🌱 UPDATE PRODUCT REQUEST TYPE
 */
export interface UpdateProductRequest {
  name?: string;
  description?: string;
  category?: ProductCategory;
  price?: number;
  unit?: string;
  quantityAvailable?: number;
  images?: string[];
  tags?: string[];
  organic?: boolean;
  harvestDate?: Date;
  status?: ProductStatus;
  storageInstructions?: string;
}

/**
 * 🌱 PRODUCT WITH RELATIONS TYPE
 */
export type ProductWithRelations = Product & {
  farm?: any;
  reviews?: any[];
};

/**
 * 🌱 PRODUCT SEARCH OPTIONS
 */
export interface ProductSearchOptions {
  page?: number;
  limit?: number;
  category?: ProductCategory;
  farmId?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  status?: ProductStatus;
  sortBy?: "price" | "name" | "createdAt" | "popularity";
  sortOrder?: "asc" | "desc";
}

/**
 * 🌱 BATCH UPDATE PRODUCT REQUEST
 */
export interface BatchUpdateProductRequest {
  productId: string;
  updates: UpdateProductRequest;
}

/**
 * 🌱 BATCH INVENTORY UPDATE REQUEST
 */
export interface BatchInventoryUpdate {
  productId: string;
  quantityChange: number;
}

/**
 * 🌱 VALIDATION ERROR
 */
export class ProductValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: any,
  ) {
    super(message);
    this.name = "ProductValidationError";
  }
}

/**
 * 🌾 QUANTUM PRODUCT CATALOG SERVICE CLASS
 */
export class QuantumProductCatalogService {
  /**
   * 🌱 CREATE NEW PRODUCT
   * Manifests a new product into the quantum catalog with agricultural consciousness
   */
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    // Validate product data
    await this.validateProductData(productData);

    // Generate unique slug from product name
    const slug = await this.generateUniqueSlug(
      productData.name,
      productData.farmId,
    );

    // Create product in database
    const product = await database.product.create({
      data: {
        name: productData.name,
        slug,
        description: productData.description,
        category: productData.category,
        farmId: productData.farmId,
        price: productData.price,
        unit: productData.unit,
        quantityAvailable: productData.quantityAvailable,
        images: productData.images || [],
        tags: productData.tags
          ? (productData.tags as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        organic: productData.organic || false,
        harvestDate: productData.harvestDate || null,
        storageInstructions: productData.storageInstructions || null,
        status: "ACTIVE" as ProductStatus,
        // Initialize metrics
        viewsCount: 0,
        cartAddsCount: 0,
        purchaseCount: 0,
        wishlistCount: 0,
        reviewCount: 0,
      },
      include: {
        farm: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    return product;
  }

  /**
   * 🔍 GET PRODUCT BY ID
   * Retrieves a single product with complete quantum coherence
   */
  async getProductById(
    productId: string,
    includeRelations: boolean = false,
  ): Promise<ProductWithRelations | null> {
    const product = await database.product.findUnique({
      where: { id: productId },
      include: {
        farm: true,
        reviews: includeRelations,
      },
    });

    return product;
  }

  /**
   * 🔍 GET PRODUCT BY SLUG
   * Retrieves product by URL-friendly slug
   */
  async getProductBySlug(
    slug: string,
    farmId: string,
  ): Promise<ProductWithRelations | null> {
    const product = await database.product.findFirst({
      where: { slug, farmId },
      include: {
        farm: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return product;
  }

  /**
   * 📋 SEARCH AND FILTER PRODUCTS
   * Retrieves products with advanced search, filtering, and pagination
   */
  async searchProducts(options: ProductSearchOptions): Promise<{
    products: ProductWithRelations[];
    total: number;
    hasMore: boolean;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    // Filter by status (default to ACTIVE)
    where.status = options.status || "ACTIVE";

    // Filter by category
    if (options.category) {
      where.category = options.category;
    }

    // Filter by farm
    if (options.farmId) {
      where.farmId = options.farmId;
    }

    // Search query (name and description)
    // Filter by tags and search query
    if (options?.searchQuery) {
      where.OR = [
        { name: { contains: options.searchQuery, mode: "insensitive" } },
        { description: { contains: options.searchQuery, mode: "insensitive" } },
      ];
    }

    // Filter by price range
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      where.price = {};
      if (options.minPrice !== undefined) {
        where.price.gte = options.minPrice;
      }
      if (options.maxPrice !== undefined) {
        where.price.lte = options.maxPrice;
      }
    }

    // Filter by organic
    if (options?.isOrganic !== undefined) {
      where.organic = options.isOrganic;
    }

    // Build order by clause
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (options.sortBy) {
      switch (options.sortBy) {
        case "price":
          orderBy = { price: options.sortOrder || "asc" };
          break;
        case "name":
          orderBy = { name: options.sortOrder || "asc" };
          break;
        case "popularity":
          orderBy = { purchaseCount: options.sortOrder || "desc" };
          break;
        case "createdAt":
          orderBy = { createdAt: options.sortOrder || "desc" };
          break;
      }
    }

    // Execute parallel queries for products and count
    const [products, total] = await Promise.all([
      database.product.findMany({
        where,
        take: limit,
        skip,
        orderBy,
        include: {
          farm: {
            select: {
              id: true,
              slug: true,
            },
          },
        },
      }),
      database.product.count({ where }),
    ]);

    return {
      products,
      total,
      hasMore: skip + products.length < total,
    };
  }

  /**
   * 📋 GET PRODUCTS BY FARM
   * Retrieves all products for a specific farm
   */
  async getProductsByFarm(
    farmId: string,
    options?: {
      status?: ProductStatus;
      category?: ProductCategory;
      page?: number;
      limit?: number;
    },
  ): Promise<{ products: Product[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { farmId };

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.category) {
      where.category = options.category;
    }

    const [products, total] = await Promise.all([
      database.product.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
      }),
      database.product.count({ where }),
    ]);

    return { products, total };
  }

  /**
   * ✏️ UPDATE PRODUCT
   * Updates product with quantum precision
   */
  async updateProduct(
    productId: string,
    updates: UpdateProductRequest,
    userId: string,
  ): Promise<Product> {
    // Verify product exists and user has permission
    await this.verifyProductAccess(productId, userId);

    // Update slug if name changed
    let slug: string | undefined;
    if (updates.name) {
      const product = await database.product.findUnique({
        where: { id: productId },
        select: { farmId: true },
      });
      if (product) {
        slug = await this.generateUniqueSlug(
          updates.name,
          product.farmId,
          productId,
        );
      }
    }

    const product = await database.product.update({
      where: { id: productId },
      data: {
        ...updates,
        slug,
        tags: updates.tags
          ? (updates.tags as Prisma.InputJsonValue)
          : undefined,
        updatedAt: new Date(),
      },
      include: {
        farm: true,
      },
    });

    return product;
  }

  /**
   * 📦 UPDATE INVENTORY
   * Updates product quantity available
   */
  async updateInventory(
    productId: string,
    quantityChange: number,
    userId: string,
  ): Promise<Product> {
    // Verify product exists and user has permission
    await this.verifyProductAccess(productId, userId);

    const product = await database.product.update({
      where: { id: productId },
      data: {
        quantityAvailable: {
          increment: quantityChange,
        },
        updatedAt: new Date(),
      },
    });

    // Update status based on quantity
    if (product.quantityAvailable && Number(product.quantityAvailable) <= 0) {
      await database.product.update({
        where: { id: productId },
        data: { status: "OUT_OF_STOCK" },
      });
    } else if (product.status === "OUT_OF_STOCK") {
      await database.product.update({
        where: { id: productId },
        data: { status: "ACTIVE" },
      });
    }

    return product;
  }

  /**
   * 🗑️ DELETE PRODUCT
   * Soft delete product (sets status to DELETED)
   */
  async deleteProduct(productId: string, userId: string): Promise<void> {
    // Verify product exists and user has permission
    await this.verifyProductAccess(productId, userId);

    await database.product.update({
      where: { id: productId },
      data: {
        status: "DELETED" as ProductStatus,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 📊 GET PRODUCT METRICS
   * Retrieves product performance metrics
   */
  async getProductMetrics(productId: string): Promise<{
    purchaseCount: number;
    cartAddsCount: number;
    viewsCount: number;
    wishlistCount: number;
    averageRating: number;
    reviewCount: number;
    quantityAvailable: number;
  }> {
    const product = await database.product.findUnique({
      where: { id: productId },
      select: {
        purchaseCount: true,
        cartAddsCount: true,
        viewsCount: true,
        wishlistCount: true,
        averageRating: true,
        reviewCount: true,
        quantityAvailable: true,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      purchaseCount: product.purchaseCount || 0,
      cartAddsCount: product.cartAddsCount || 0,
      viewsCount: product.viewsCount || 0,
      wishlistCount: product.wishlistCount || 0,
      averageRating: product.averageRating?.toNumber() || 0,
      reviewCount: product.reviewCount || 0,
      quantityAvailable: product.quantityAvailable?.toNumber() || 0,
    };
  }

  /**
   * 🔐 VERIFY PRODUCT ACCESS
   * Verifies that a user has access to modify a product
   */
  private async verifyProductAccess(
    productId: string,
    userId: string,
  ): Promise<boolean> {
    const product = await database.product.findUnique({
      where: { id: productId },
      include: {
        farm: {
          select: {
            ownerId: true,
            teamMembers: {
              where: { userId },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // User is farm owner or team member
    const hasAccess =
      product.farm.ownerId === userId || product.farm.teamMembers.length > 0;

    if (!hasAccess) {
      throw new Error("Unauthorized: You don't have access to this product");
    }

    return true;
  }

  /**
   * ✅ VALIDATE PRODUCT DATA
   * Validates product data before creation
   */
  private async validateProductData(
    productData: CreateProductRequest,
  ): Promise<void> {
    // Validate name
    if (!productData.name || productData.name.trim().length < 3) {
      throw new ProductValidationError(
        "Product name must be at least 3 characters long",
        "name",
        productData.name,
      );
    }

    if (productData.name.length > 200) {
      throw new ProductValidationError(
        "Product name must be less than 200 characters",
        "name",
        productData.name,
      );
    }

    // Validate description
    if (
      !productData.description ||
      productData.description.trim().length < 10
    ) {
      throw new ProductValidationError(
        "Product description must be at least 10 characters long",
        "description",
        productData.description,
      );
    }

    // Validate price
    if (!productData.price || productData.price <= 0) {
      throw new ProductValidationError(
        "Product price must be greater than 0",
        "price",
        productData.price,
      );
    }

    // Validate quantity
    if (productData.quantityAvailable < 0) {
      throw new ProductValidationError(
        "Quantity available cannot be negative",
        "quantityAvailable",
        productData.quantityAvailable,
      );
    }

    // Validate farm exists
    const farm = await database.farm.findUnique({
      where: { id: productData.farmId },
      select: { id: true, status: true },
    });

    if (!farm) {
      throw new ProductValidationError(
        "Farm not found",
        "farmId",
        productData.farmId,
      );
    }

    if (farm.status !== "ACTIVE") {
      throw new ProductValidationError(
        "Cannot add products to inactive farm",
        "farmId",
        farm.status,
      );
    }
  }

  /**
   * 🔤 GENERATE UNIQUE SLUG
   * Generates URL-friendly slug from product name
   */
  private async generateUniqueSlug(
    name: string,
    farmId: string,
    excludeProductId?: string,
  ): Promise<string> {
    // Convert to lowercase and replace spaces with hyphens
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug exists for this farm
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await database.product.findFirst({
        where: { slug: uniqueSlug, farmId },
        select: { id: true },
      });

      // If no existing product or it's the same product being updated
      if (!existing || existing.id === excludeProductId) {
        break;
      }

      // Add counter to make it unique
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  /**
   * 📦 BATCH UPDATE PRODUCTS
   * Updates multiple products in a single transaction for concurrency testing
   */
  async batchUpdateProducts(
    updates: BatchUpdateProductRequest[],
    userId: string,
  ): Promise<Product[]> {
    // Use transaction for atomic updates
    return await database.$transaction(async (tx: any) => {
      const updatedProducts: Product[] = [];

      for (const { productId, updates: productUpdates } of updates) {
        // Verify product exists and user has permission
        const product = await tx.product.findUnique({
          where: { id: productId },
          include: {
            farm: {
              select: { ownerId: true },
            },
          },
        });

        if (!product) {
          throw new ProductValidationError(
            "Product not found",
            "productId",
            productId,
          );
        }

        if (product.farm.ownerId !== userId) {
          throw new ProductValidationError(
            "Unauthorized: You do not own this product",
            "userId",
            userId,
          );
        }

        // Update slug if name changed
        let slug: string | undefined;
        if (productUpdates.name) {
          slug = await this.generateUniqueSlug(
            productUpdates.name,
            product.farmId,
            productId,
          );
        }

        const updated = await tx.product.update({
          where: { id: productId },
          data: {
            ...productUpdates,
            slug,
            tags: productUpdates.tags
              ? (productUpdates.tags as Prisma.InputJsonValue)
              : undefined,
            updatedAt: new Date(),
          },
          include: {
            farm: true,
          },
        });

        updatedProducts.push(updated);
      }

      return updatedProducts;
    });
  }

  /**
   * 📦 BATCH UPDATE INVENTORY
   * Updates inventory for multiple products atomically
   */
  async batchUpdateInventory(
    updates: BatchInventoryUpdate[],
    userId: string,
  ): Promise<Product[]> {
    return await database.$transaction(async (tx: any) => {
      const updatedProducts: Product[] = [];

      for (const { productId, quantityChange } of updates) {
        // Verify product exists and user has permission
        const product = await tx.product.findUnique({
          where: { id: productId },
          include: {
            farm: {
              select: { ownerId: true },
            },
          },
        });

        if (!product) {
          throw new ProductValidationError(
            "Product not found",
            "productId",
            productId,
          );
        }

        if (product.farm.ownerId !== userId) {
          throw new ProductValidationError(
            "Unauthorized: You do not own this product",
            "userId",
            userId,
          );
        }

        const currentQuantity = product.quantityAvailable
          ? parseFloat(product.quantityAvailable.toString())
          : 0;
        const newQuantity = currentQuantity + quantityChange;

        if (newQuantity < 0) {
          throw new ProductValidationError(
            "Insufficient inventory",
            "quantityAvailable",
            newQuantity,
          );
        }

        // Determine new status based on quantity
        let status = product.status;
        if (newQuantity === 0 && product.status === "ACTIVE") {
          status = "OUT_OF_STOCK";
        } else if (newQuantity > 0 && product.status === "OUT_OF_STOCK") {
          status = "ACTIVE";
        }

        const updated = await tx.product.update({
          where: { id: productId },
          data: {
            quantityAvailable: newQuantity,
            status,
            updatedAt: new Date(),
          },
          include: {
            farm: true,
          },
        });

        updatedProducts.push(updated);
      }

      return updatedProducts;
    });
  }

  /**
   * 🎯 GET PRODUCT DETAIL DATA (OPTIMIZED)
   * Fetches minimal product data for detail page with aggressive caching
   * This method is optimized for the product detail page to minimize query time
   *
   * @param slug - Product slug
   * @returns Product with minimal relations for detail page
   */
  async getProductDetailData(
    slug: string,
  ): Promise<
    Awaited<ReturnType<typeof productRepository.findBySlugWithMinimalData>>
  > {
    const requestId = nanoid();
    logger.debug("Getting optimized product detail data", { requestId, slug });

    try {
      const cacheKey = `product:detail:${slug}`;
      const cached = await multiLayerCache.get(cacheKey);

      if (cached) {
        logger.debug("Product detail data retrieved from cache", {
          requestId,
          slug,
        });
        return cached as Awaited<
          ReturnType<typeof productRepository.findBySlugWithMinimalData>
        >;
      }

      // Optimized query with minimal field selection
      const product = await productRepository.findBySlugWithMinimalData(slug);

      if (!product) {
        logger.debug("Product not found for detail page", { requestId, slug });
        return null;
      }

      // Cache with longer TTL (product details don't change often)
      await multiLayerCache.set(cacheKey, product, { ttl: CacheTTL.LONG });

      logger.info("Product detail data fetched and cached", {
        requestId,
        slug,
        productId: product.id,
      });

      return product;
    } catch (error) {
      logger.error("Failed to get product detail data", {
        requestId,
        slug,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * 🌾 GET RELATED PRODUCTS (OPTIMIZED)
   * Fetches related products with caching
   *
   * @param productId - Product ID
   * @param category - Product category
   * @param farmId - Farm ID
   * @param limit - Max products to return (default: 6)
   * @returns Array of related products
   */
  async getRelatedProducts(
    productId: string,
    category: string | null,
    farmId: string,
    limit: number = 6,
  ): Promise<
    Awaited<ReturnType<typeof productRepository.findRelatedProducts>>
  > {
    const requestId = nanoid();
    logger.debug("Getting related products (optimized)", {
      requestId,
      productId,
      limit,
    });

    try {
      const cacheKey = `product:related:${productId}:${limit}`;
      const cached = await multiLayerCache.get(cacheKey);

      if (cached) {
        logger.debug("Related products retrieved from cache", {
          requestId,
          productId,
        });
        return cached as Awaited<
          ReturnType<typeof productRepository.findRelatedProducts>
        >;
      }

      const products = await productRepository.findRelatedProducts(
        productId,
        category,
        farmId,
        limit,
      );

      // Cache for medium duration
      await multiLayerCache.set(cacheKey, products, { ttl: CacheTTL.MEDIUM });

      logger.debug("Related products fetched and cached", {
        requestId,
        productId,
        count: products.length,
      });

      return products;
    } catch (error) {
      logger.error("Failed to get related products", {
        requestId,
        productId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * 📋 GET PRODUCTS FOR LISTING (OPTIMIZED)
   * Fetches products for listing pages with caching
   *
   * @param filters - Search and filter criteria
   * @returns Paginated product list
   */
  async getProductsForListing(filters: {
    search?: string;
    category?: string;
    farmId?: string;
    organic?: boolean;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    page?: number;
    limit?: number;
  }): Promise<Awaited<ReturnType<typeof productRepository.findForListing>>> {
    const requestId = nanoid();
    logger.debug("Getting products for listing (optimized)", {
      requestId,
      filters,
    });

    try {
      const filterKey = JSON.stringify(filters);
      const cacheKey = `products:listing:${Buffer.from(filterKey).toString("base64").slice(0, 50)}`;
      const cached = await multiLayerCache.get(cacheKey);

      if (cached) {
        logger.debug("Product listing retrieved from cache", { requestId });
        return cached as Awaited<
          ReturnType<typeof productRepository.findForListing>
        >;
      }

      const result = await productRepository.findForListing(filters);

      // Cache for short duration (listings change frequently)
      await multiLayerCache.set(cacheKey, result, { ttl: CacheTTL.SHORT });

      logger.debug("Product listing fetched and cached", {
        requestId,
        count: result.products.length,
        total: result.total,
      });

      return result;
    } catch (error) {
      logger.error("Failed to get products for listing", {
        requestId,
        filters,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * 🏪 GET FEATURED PRODUCTS (OPTIMIZED)
   * Fetches featured products with caching for homepage
   *
   * @param limit - Max products to return (default: 8)
   * @returns Array of featured products
   */
  async getFeaturedProducts(
    limit: number = 8,
  ): Promise<
    Awaited<ReturnType<typeof productRepository.findFeaturedProducts>>
  > {
    const requestId = nanoid();
    logger.debug("Getting featured products (optimized)", { requestId, limit });

    try {
      const cacheKey = `products:featured:${limit}`;
      const cached = await multiLayerCache.get(cacheKey);

      if (cached) {
        logger.debug("Featured products retrieved from cache", { requestId });
        return cached as Awaited<
          ReturnType<typeof productRepository.findFeaturedProducts>
        >;
      }

      const products = await productRepository.findFeaturedProducts(limit);

      // Cache for long duration (featured products rarely change)
      await multiLayerCache.set(cacheKey, products, { ttl: CacheTTL.LONG });

      logger.debug("Featured products fetched and cached", {
        requestId,
        count: products.length,
      });

      return products;
    } catch (error) {
      logger.error("Failed to get featured products", {
        requestId,
        limit,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

/**
 * 🌾 EXPORT SINGLETON INSTANCE
 * Canonical product service instance for application-wide use
 */
export const productService = new QuantumProductCatalogService();
