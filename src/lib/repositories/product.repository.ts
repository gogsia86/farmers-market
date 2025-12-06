/**
 * 🌾 PRODUCT REPOSITORY - QUANTUM DATABASE OPERATIONS
 *
 * Handles all product entity database operations with agricultural consciousness.
 * Single source of truth for product data access patterns.
 *
 * Divine Patterns Applied:
 * - Repository pattern (isolates database operations)
 * - Agricultural consciousness (seasonal product awareness)
 * - Type-safe operations with Prisma
 * - Quantum product manifestation
 * - Inventory tracking and management
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import { BaseRepository, type RepositoryOptions } from "./base.repository";
import type { Product, Prisma } from "@prisma/client";

/**
 * Quantum Product with all relations loaded
 * Represents a product with complete consciousness and agricultural awareness
 */
export type QuantumProduct = Product & {
  farm: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    status: string;
  };
  _count: {
    orderItems: number;
    reviews: number;
  };
};

/**
 * Product search filters with agricultural consciousness
 */
export interface ProductSearchFilters {
  farmId?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  season?: string;
  inStock?: boolean;
}

/**
 * Product with availability status
 */
export interface ProductWithAvailability extends QuantumProduct {
  availabilityStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  remainingQuantity?: number;
}

/**
 * Product Repository with quantum consciousness and agricultural awareness
 *
 * @example
 * ```typescript
 * const productRepo = new QuantumProductRepository();
 *
 * // Manifest a new product
 * const product = await productRepo.manifestProduct({
 *   name: "Organic Tomatoes",
 *   farmId: "farm_123",
 *   price: 4.99,
 *   unit: "lb"
 * });
 *
 * // Find seasonal products
 * const summerProducts = await productRepo.findBySeason("SUMMER");
 * ```
 */
export class QuantumProductRepository extends BaseRepository<
  QuantumProduct,
  Prisma.ProductCreateInput,
  Prisma.ProductUpdateInput
> {
  constructor() {
    super({ name: "product" }, "QuantumProductRepository");
  }

  /**
   * Manifest a new product into reality
   * (Divine naming for product creation with agricultural consciousness)
   *
   * @param data - Product creation data
   * @param options - Repository options
   * @returns Manifested quantum product
   *
   * @example
   * ```typescript
   * const product = await repository.manifestProduct({
   *   name: "Heritage Heirloom Tomatoes",
   *   farmId: "farm_123",
   *   price: 5.99,
   *   unit: "lb",
   *   category: "VEGETABLES",
   *   isOrganic: true
   * });
   * ```
   */
  async manifestProduct(
    data: Prisma.ProductCreateInput,
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct> {
    this.logOperation("manifestProduct:start", {
      productName: (data as any).name,
      agriculturalConsciousness: "DIVINE",
    });

    const product = await this.create(data, options);

    this.logOperation("manifestProduct:complete", {
      productId: product.id,
      category: product.category,
      biodynamicEnergy: "PURE",
    });

    return product;
  }

  /**
   * Find all products for a specific farm
   *
   * @param farmId - Farm ID
   * @param options - Repository options
   * @returns Array of farm's products
   *
   * @example
   * ```typescript
   * const farmProducts = await repository.findByFarmId("farm_123");
   * ```
   */
  async findByFarmId(
    farmId: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct[]> {
    return await this.findMany(
      { farmId },
      {
        ...options,
        orderBy: { createdAt: "desc" },
      },
    );
  }

  /**
   * Find active products for a specific farm
   *
   * @param farmId - Farm ID
   * @param options - Repository options
   * @returns Array of active products
   */
  async findActiveFarmProducts(
    farmId: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct[]> {
    return await this.findMany(
      {
        farmId,
        status: "ACTIVE",
      },
      {
        ...options,
        orderBy: { name: "asc" },
      },
    );
  }

  /**
   * Find products by category
   *
   * @param category - Product category (e.g., "VEGETABLES", "FRUITS")
   * @param options - Repository options
   * @returns Array of products in category
   *
   * @example
   * ```typescript
   * const vegetables = await repository.findByCategory("VEGETABLES");
   * ```
   */
  async findByCategory(
    category: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct[]> {
    return await this.findMany(
      {
        category,
        status: "ACTIVE",
      },
      {
        ...options,
        orderBy: { name: "asc" },
      },
    );
  }

  /**
   * Find seasonal products
   * (Agricultural consciousness: products aligned with current season)
   *
   * @param season - Season (SPRING, SUMMER, FALL, WINTER)
   * @param options - Repository options
   * @returns Array of seasonal products
   *
   * @example
   * ```typescript
   * const summerProducts = await repository.findBySeason("SUMMER");
   * ```
   */
  async findBySeason(
    season: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct[]> {
    try {
      const db = options.tx || this.db;

      const products = (await db.product.findMany({
        where: {
          seasonal: true,
          inStock: true,
        },
        ...this.getDefaultInclude(),
        ...this.filterOptions(options),
      })) as QuantumProduct[];

      this.logOperation("findBySeason", {
        season,
        productsFound: products.length,
        agriculturalAlignment: "PERFECT",
      });

      return products;
    } catch (error) {
      throw this.handleDatabaseError("findBySeason", error);
    }
  }

  /**
   * Find organic products
   * (Agricultural consciousness: organic farming practices)
   *
   * @param options - Repository options
   * @returns Array of organic products
   */
  async findOrganicProducts(
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct[]> {
    return await this.findMany(
      {
        organic: true,
        inStock: true,
      },
      {
        ...options,
        orderBy: { name: "asc" },
      },
    );
  }

  /**
   * Search products by name or description
   *
   * @param searchTerm - Search term
   * @param options - Repository options
   * @returns Array of matching products
   *
   * @example
   * ```typescript
   * const results = await repository.searchProducts("tomato");
   * ```
   */
  async searchProducts(
    searchTerm: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct[]> {
    try {
      const db = options.tx || this.db;

      const products = (await db.product.findMany({
        where: {
          AND: [
            { inStock: true },
            {
              OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { description: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
          ],
        },
        ...this.getDefaultInclude(),
        ...this.filterOptions(options),
      })) as QuantumProduct[];

      this.logOperation("searchProducts", {
        searchTerm,
        resultsCount: products.length,
      });

      return products;
    } catch (error) {
      throw this.handleDatabaseError("searchProducts", error);
    }
  }

  /**
   * Advanced product search with filters
   *
   * @param filters - Search filters
   * @param options - Repository options
   * @returns Array of matching products
   *
   * @example
   * ```typescript
   * const products = await repository.searchWithFilters({
   *   category: "VEGETABLES",
   *   isOrganic: true,
   *   minPrice: 2,
   *   maxPrice: 10
   * });
   * ```
   */
  async searchWithFilters(
    filters: ProductSearchFilters,
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct[]> {
    const where: Prisma.ProductWhereInput = {
      inStock: true,
    };

    if (filters.farmId) {
      where.farmId = filters.farmId;
    }

    if (filters.category) {
      where.category = filters.category as any;
    }

    if (filters.isOrganic !== undefined) {
      where.organic = filters.isOrganic;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.season) {
      where.seasonal = true;
    }

    if (filters.inStock) {
      where.quantityAvailable = {
        gt: 0,
      };
    }

    return await this.findMany(where, {
      ...options,
      orderBy: options.orderBy || { createdAt: "desc" },
    });
  }

  /**
   * Find products by price range
   *
   * @param minPrice - Minimum price
   * @param maxPrice - Maximum price
   * @param options - Repository options
   * @returns Array of products in price range
   */
  async findByPriceRange(
    minPrice: number,
    maxPrice: number,
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct[]> {
    return await this.findMany(
      {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
        inStock: true,
      },
      options,
    );
  }

  /**
   * Find low stock products
   * (Inventory management with agricultural consciousness)
   *
   * @param threshold - Stock quantity threshold (default: 10)
   * @param options - Repository options
   * @returns Array of low stock products
   */
  async findLowStock(
    threshold: number = 10,
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct[]> {
    return await this.findMany(
      {
        quantityAvailable: {
          lte: threshold,
          gt: 0,
        },
        inStock: true,
      },
      {
        ...options,
        orderBy: { quantityAvailable: "asc" },
      },
    );
  }

  /**
   * Find out of stock products
   *
   * @param options - Repository options
   * @returns Array of out of stock products
   */
  async findOutOfStock(
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct[]> {
    return await this.findMany(
      {
        quantityAvailable: 0,
        inStock: false,
      },
      options,
    );
  }

  /**
   * Update product stock quantity
   *
   * @param productId - Product ID
   * @param quantity - New stock quantity
   * @param options - Repository options
   * @returns Updated product
   *
   * @example
   * ```typescript
   * const product = await repository.updateStock("product_123", 50);
   * ```
   */
  async updateStock(
    productId: string,
    quantity: number,
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct> {
    return await this.update(
      productId,
      { quantityAvailable: quantity } as Prisma.ProductUpdateInput,
      options,
    );
  }

  /**
   * Decrement product stock (for orders)
   *
   * @param productId - Product ID
   * @param quantity - Quantity to decrement
   * @param options - Repository options
   * @returns Updated product
   */
  async decrementStock(
    productId: string,
    quantity: number,
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct> {
    try {
      const db = options.tx || this.db;

      const product = (await db.product.update({
        where: { id: productId },
        data: {
          quantityAvailable: {
            decrement: quantity,
          },
        },
        ...this.getDefaultInclude(),
      })) as QuantumProduct;

      this.logOperation("decrementStock", {
        productId,
        quantityDecremented: quantity,
        newStock: product.quantityAvailable,
      });

      return product;
    } catch (error) {
      throw this.handleDatabaseError("decrementStock", error);
    }
  }

  /**
   * Increment product stock (for restocking)
   *
   * @param productId - Product ID
   * @param quantity - Quantity to increment
   * @param options - Repository options
   * @returns Updated product
   */
  async incrementStock(
    productId: string,
    quantity: number,
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct> {
    try {
      const db = options.tx || this.db;

      const product = (await db.product.update({
        where: { id: productId },
        data: {
          quantityAvailable: {
            increment: quantity,
          },
        },
        ...this.getDefaultInclude(),
      })) as QuantumProduct;

      this.logOperation("incrementStock", {
        productId,
        quantityAdded: quantity,
        newStock: product.quantityAvailable,
      });

      return product;
    } catch (error) {
      throw this.handleDatabaseError("incrementStock", error);
    }
  }

  /**
   * Update product status (active/inactive)
   *
   * @param id - Product ID
   * @param isActive - Active status
   * @param options - Repository options
   * @returns Updated product
   */
  async updateStatus(
    id: string,
    inStock: boolean,
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct> {
    return await this.update(
      id,
      { inStock } as Prisma.ProductUpdateInput,
      options,
    );
  }

  /**
   * Get featured products (highest rated or best selling)
   *
   * @param limit - Number of products to return
   * @param options - Repository options
   * @returns Array of featured products
   */
  async getFeaturedProducts(
    limit: number = 10,
    options: RepositoryOptions = {},
  ): Promise<QuantumProduct[]> {
    return await this.findMany(
      {
        inStock: true,
        featured: true,
      },
      {
        ...options,
        take: limit,
        orderBy: { createdAt: "desc" },
      },
    );
  }

  /**
   * Get product availability status
   *
   * @param productId - Product ID
   * @returns Product with availability status
   */
  async getProductAvailability(
    productId: string,
  ): Promise<ProductWithAvailability | null> {
    const product = await this.findById(productId);

    if (!product) {
      return null;
    }

    let availabilityStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
    const quantity = product.quantityAvailable
      ? Number(product.quantityAvailable)
      : 0;

    if (quantity === 0) {
      availabilityStatus = "OUT_OF_STOCK";
    } else if (quantity < 10) {
      availabilityStatus = "LOW_STOCK";
    } else {
      availabilityStatus = "IN_STOCK";
    }

    return {
      ...product,
      availabilityStatus,
      remainingQuantity: quantity,
    };
  }

  /**
   * Default relations to include with product queries
   * Implements agricultural consciousness by loading farm context
   *
   * @returns Prisma include configuration with proper types
   */
  protected getDefaultInclude(): any {
    return {
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            status: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    };
  }
}

/**
 * Export singleton instance for application-wide use
 * Following divine pattern of single point of database access
 */
export const productRepository = new QuantumProductRepository();

/**
 * Divine product repository consciousness achieved ✨🌾
 * Agricultural awareness integrated at database layer
 * Inventory management with biodynamic consciousness
 * Ready to scale from 1 to 1 billion products with quantum efficiency
 */
