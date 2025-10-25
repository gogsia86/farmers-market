/**
 * PRODUCT SERVICE LAYER
 * Divine business logic for agricultural product management
 * Quantum operations for farm product consciousness
 */

import { database } from "@/lib/database";
import { generateSlug } from "@/lib/utils/slug";
import {
  BatchProductResult,
  CreateProductInput,
  PaginatedProducts,
  PaginationOptions,
  Product,
  ProductFilters,
  ProductStats,
  ProductStatus,
  ProductValidation,
  UpdateProductInput,
} from "@/types/product";

// ============================================
// PRODUCT SERVICE CLASS
// ============================================

export class ProductService {
  /**
   * Create a new product for a farm
   * Validates farm ownership and generates unique slug
   */
  static async createProduct(
    input: CreateProductInput,
    userId: string
  ): Promise<Product> {
    // 1. Verify farm ownership
    const farm = await database.farm.findUnique({
      where: { id: input.farmId },
      select: { id: true, ownerId: true, isActive: true },
    });

    if (!farm) {
      throw new Error("Farm not found");
    }

    if (farm.ownerId !== userId) {
      throw new Error("Unauthorized: You don't own this farm");
    }

    if (!farm.isActive) {
      throw new Error("Cannot add products to inactive farm");
    }

    // 2. Validate product data
    const validation = await this.validateProduct(input);
    if (!validation.isValid) {
      throw new Error(
        `Validation failed: ${validation.errors.map((e) => e.message).join(", ")}`
      );
    }

    // 3. Generate unique slug
    const baseSlug = generateSlug(input.name);
    const slug = await this.generateUniqueSlug(baseSlug, input.farmId);

    // 4. Calculate derived values
    const availableQuantity =
      input.inventory.quantity - input.inventory.reservedQuantity;
    const isLowStock = availableQuantity <= input.inventory.lowStockThreshold;
    const primaryImageUrl = input.images.find((img) => img.isPrimary)?.url;

    // 5. Create product
    const product = await database.product.create({
      data: {
        ...input,
        slug,
        inventory: {
          ...input.inventory,
          availableQuantity,
          isLowStock,
        },
        primaryImageUrl,
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
    });

    return product as Product;
  }

  /**
   * Get product by ID with optional relations
   */
  static async getProductById(
    productId: string,
    includeFarm: boolean = true
  ): Promise<Product | null> {
    const product = await database.product.findUnique({
      where: { id: productId },
      include: {
        farm: includeFarm
          ? {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                verificationStatus: true,
              },
            }
          : false,
      },
    });

    return product as Product | null;
  }

  /**
   * Get product by slug (for public URLs)
   */
  static async getProductBySlug(
    farmSlug: string,
    productSlug: string
  ): Promise<Product | null> {
    const product = await database.product.findFirst({
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
    });

    return product as Product | null;
  }

  /**
   * List products with filters and pagination
   */
  static async listProducts(
    filters: ProductFilters = {},
    options?: PaginationOptions
  ): Promise<PaginatedProducts> {
    const { page = 1, limit = 20 } = options || {};
    const skip = (page - 1) * limit;

    // Build where clause
    const where = this.buildWhereClause(filters);

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

    // Build orderBy clause
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
          // Would need to join with order stats
          orderBy.createdAt = "desc";
          break;
        default:
          orderBy.createdAt = "desc";
      }
    } else {
      orderBy.createdAt = "desc";
    }

    // Execute queries
    const [products, total] = await Promise.all([
      database.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
      database.product.count({ where }),
    ]);

    return {
      products: products as Product[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + products.length < total,
      },
    };
  }

  /**
   * Update product (owner only)
   */
  static async updateProduct(
    productId: string,
    updates: UpdateProductInput,
    userId: string
  ): Promise<Product> {
    // 1. Get existing product with farm
    const existing = await database.product.findUnique({
      where: { id: productId },
      include: {
        farm: {
          select: { ownerId: true },
        },
      },
    });

    if (!existing) {
      throw new Error("Product not found");
    }

    if (existing.farm.ownerId !== userId) {
      throw new Error("Unauthorized: You don't own this product");
    }

    // 2. If name changed, regenerate slug
    let slug = existing.slug;
    if (updates.name && updates.name !== existing.name) {
      const baseSlug = generateSlug(updates.name);
      slug = await this.generateUniqueSlug(baseSlug, existing.farmId);
    }

    // 3. Calculate derived inventory values if inventory updated
    let inventoryUpdates = updates.inventory;
    if (inventoryUpdates) {
      const availableQuantity =
        (inventoryUpdates.quantity ?? existing.inventory.quantity) -
        (inventoryUpdates.reservedQuantity ??
          existing.inventory.reservedQuantity);

      const lowStockThreshold =
        inventoryUpdates.lowStockThreshold ??
        existing.inventory.lowStockThreshold;

      inventoryUpdates = {
        ...inventoryUpdates,
        availableQuantity,
        isLowStock: availableQuantity <= lowStockThreshold,
        inStock: availableQuantity > 0,
      };
    }

    // 4. Update primary image URL if images changed
    let primaryImageUrl = existing.primaryImageUrl;
    if (updates.images) {
      primaryImageUrl = updates.images.find((img) => img.isPrimary)?.url;
    }

    // 5. Apply updates
    const product = await database.product.update({
      where: { id: productId },
      data: {
        ...updates,
        slug,
        inventory: inventoryUpdates,
        primaryImageUrl,
        updatedAt: new Date(),
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
    });

    return product as Product;
  }

  /**
   * Delete product (soft delete - mark as inactive)
   */
  static async deleteProduct(productId: string, userId: string): Promise<void> {
    // Verify ownership
    const product = await database.product.findUnique({
      where: { id: productId },
      include: {
        farm: {
          select: { ownerId: true },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.farm.ownerId !== userId) {
      throw new Error("Unauthorized: You don't own this product");
    }

    // Soft delete
    await database.product.update({
      where: { id: productId },
      data: {
        isActive: false,
        status: ProductStatus.DISCONTINUED,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Update product inventory
   */
  static async updateInventory(
    productId: string,
    quantity: number,
    userId: string
  ): Promise<Product> {
    const product = await database.product.findUnique({
      where: { id: productId },
      include: {
        farm: {
          select: { ownerId: true },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.farm.ownerId !== userId) {
      throw new Error("Unauthorized: You don't own this product");
    }

    const availableQuantity = quantity - product.inventory.reservedQuantity;
    const isLowStock = availableQuantity <= product.inventory.lowStockThreshold;

    const updated = await database.product.update({
      where: { id: productId },
      data: {
        inventory: {
          ...product.inventory,
          quantity,
          availableQuantity,
          isLowStock,
          inStock: availableQuantity > 0,
          lastRestocked: new Date(),
        },
        status:
          availableQuantity > 0
            ? ProductStatus.AVAILABLE
            : ProductStatus.OUT_OF_STOCK,
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
    });

    return updated as Product;
  }

  /**
   * Get product statistics
   */
  static async getProductStats(productId: string): Promise<ProductStats> {
    // This would integrate with analytics/orders
    // For now, return basic structure
    return {
      productId,
      views: 0,
      orders: 0,
      revenue: 0,
      reviewCount: 0,
      inWishlistCount: 0,
    };
  }

  /**
   * Search products by name or description
   */
  static async searchProducts(
    query: string,
    limit: number = 20
  ): Promise<Product[]> {
    const products = await database.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { tags: { has: query } },
        ],
      },
      take: limit,
      orderBy: { createdAt: "desc" },
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
    });

    return products as Product[];
  }

  /**
   * Batch update products
   */
  static async batchUpdateProducts(
    productIds: string[],
    updates: Partial<UpdateProductInput>,
    userId: string
  ): Promise<BatchProductResult> {
    const result: BatchProductResult = {
      successful: [],
      failed: [],
      total: productIds.length,
      successCount: 0,
      failureCount: 0,
    };

    for (const productId of productIds) {
      try {
        await this.updateProduct(productId, updates, userId);
        result.successful.push(productId);
        result.successCount++;
      } catch (error) {
        result.failed.push({
          productId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        result.failureCount++;
      }
    }

    return result;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Build where clause for filtering products
   */
  private static buildWhereClause(
    filters: ProductFilters
  ): Record<string, unknown> {
    const where: Record<string, unknown> = {};

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
      where.inventory = { inStock: filters.inStock };
    }
    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    // Attribute filtering
    if (filters.isOrganic !== undefined) {
      where.attributes = { path: ["isOrganic"], equals: filters.isOrganic };
    }
    if (filters.isNonGMO !== undefined) {
      where.attributes = { path: ["isNonGMO"], equals: filters.isNonGMO };
    }

    // Seasonal filtering
    if (filters.season) {
      where.seasons = { has: filters.season };
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
   * Build orderBy clause for sorting products
   */
  private static buildOrderByClause(
    filters: ProductFilters
  ): Record<string, unknown> {
    const orderBy: Record<string, unknown> = {};

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
   * Generate unique slug for product within farm
   */
  private static async generateUniqueSlug(
    baseSlug: string,
    farmId: string
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await database.product.findFirst({
        where: { slug, farmId },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Validate product data
   */
  private static async validateProduct(
    input: CreateProductInput | UpdateProductInput
  ): Promise<ProductValidation> {
    const errors: { field: string; message: string }[] = [];

    // Name validation
    if ("name" in input && input.name) {
      if (input.name.length < 3) {
        errors.push({
          field: "name",
          message: "Product name must be at least 3 characters",
        });
      }
      if (input.name.length > 100) {
        errors.push({
          field: "name",
          message: "Product name must not exceed 100 characters",
        });
      }
    }

    // Price validation
    if ("pricing" in input && input.pricing) {
      if (input.pricing.basePrice.amount <= 0) {
        errors.push({
          field: "pricing.basePrice.amount",
          message: "Price must be greater than 0",
        });
      }
    }

    // Inventory validation
    if ("inventory" in input && input.inventory) {
      if (input.inventory.quantity < 0) {
        errors.push({
          field: "inventory.quantity",
          message: "Quantity cannot be negative",
        });
      }
      if (input.inventory.reservedQuantity < 0) {
        errors.push({
          field: "inventory.reservedQuantity",
          message: "Reserved quantity cannot be negative",
        });
      }
      if (input.inventory.reservedQuantity > input.inventory.quantity) {
        errors.push({
          field: "inventory.reservedQuantity",
          message: "Reserved quantity cannot exceed total quantity",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
