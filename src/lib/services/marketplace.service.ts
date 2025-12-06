/**
 * 🛒 MARKETPLACE SERVICE
 * Divine marketplace operations with agricultural consciousness
 *
 * @module MarketplaceService
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 *
 * Features:
 * - Product discovery and filtering
 * - Featured farms showcase
 * - Seasonal product recommendations
 * - Advanced search with agricultural context
 * - Performance optimization for HP OMEN hardware
 */

import { database } from "@/lib/database";
import type {
  Product,
  Farm,
  ProductCategory,
  ProductStatus,
  FarmStatus,
  FarmVerificationStatus,
  Prisma,
} from "@prisma/client";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MarketplaceFilters {
  search?: string;
  category?: ProductCategory;
  farmId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?:
    | "price_asc"
    | "price_low"
    | "price_high"
    | "newest"
    | "popular"
    | "name";
  page?: number;
  limit?: number;
}

export interface ProductWithFarm extends Product {
  farm: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    city: string | null;
    state: string | null;
    averageRating: number | null;
  };
}

export interface MarketplaceProductsResult {
  products: ProductWithFarm[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface FeaturedFarm extends Farm {
  _count: {
    products: number;
    reviews: number;
  };
  products: Product[];
}

export interface FeaturedFarmsResult {
  farms: FeaturedFarm[];
  total: number;
}

export interface SeasonalRecommendation {
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER";
  products: ProductWithFarm[];
  message: string;
}

// ============================================================================
// MARKETPLACE SERVICE CLASS
// ============================================================================

export class MarketplaceService {
  /**
   * 🔍 GET FILTERED PRODUCTS
   * Advanced product search with agricultural consciousness
   */
  async getProducts(
    filters: MarketplaceFilters = {},
  ): Promise<MarketplaceProductsResult> {
    try {
      const {
        search,
        category,
        farmId,
        minPrice,
        maxPrice,
        inStock = true,
        sortBy = "newest",
        page = 1,
        limit = 20,
      } = filters;

      // Validate pagination
      const validPage = Math.max(1, page);
      const validLimit = Math.min(100, Math.max(1, limit));
      const skip = (validPage - 1) * validLimit;

      // Build where clause with agricultural awareness
      const where: Prisma.ProductWhereInput = {
        status: "ACTIVE" as ProductStatus,
        inStock: true,
      };

      // Search filter - agricultural product names and descriptions
      if (search) {
        where.OR = [
          {
            name: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        ];
      }

      // Category filter
      if (category) {
        where.category = category;
      }

      // Farm filter
      if (farmId) {
        where.farmId = farmId;
      }

      // Price range filter
      if (minPrice !== undefined) {
        where.price = {
          ...((where.price as Prisma.DecimalFilter) || {}),
          gte: minPrice,
        };
      }

      if (maxPrice !== undefined) {
        where.price = {
          ...((where.price as Prisma.DecimalFilter) || {}),
          lte: maxPrice,
        };
      }

      // Stock filter
      if (inStock) {
        where.quantityAvailable = {
          gt: 0,
        };
      }

      // Build orderBy clause
      let orderBy: Prisma.ProductOrderByWithRelationInput = {
        createdAt: "desc",
      };

      switch (sortBy) {
        case "price_asc":
        case "price_low":
          orderBy = { price: "asc" };
          break;
        case "price_high":
          orderBy = { price: "desc" };
          break;
        case "newest":
          orderBy = { createdAt: "desc" };
          break;
        case "name":
          orderBy = { name: "asc" };
          break;
        case "popular":
          // Sort by view count if available, otherwise created date
          orderBy = { createdAt: "desc" };
          break;
      }

      // Execute parallel queries for performance (HP OMEN optimization)
      const [products, total] = await Promise.all([
        database.product.findMany({
          where,
          include: {
            farm: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                city: true,
                state: true,
                averageRating: true,
              },
            },
          },
          orderBy,
          skip,
          take: validLimit,
        }),
        database.product.count({ where }),
      ]);

      const totalPages = Math.ceil(total / validLimit);

      return {
        products: products as unknown as ProductWithFarm[],
        total,
        page: validPage,
        totalPages,
        hasMore: validPage < totalPages,
      };
    } catch (error) {
      console.error("❌ MarketplaceService.getProducts error:", error);
      throw new Error(
        `Failed to fetch products: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 🌟 GET FEATURED FARMS
   * Showcase top-rated verified farms with agricultural consciousness
   */
  async getFeaturedFarms(limit: number = 6): Promise<FeaturedFarmsResult> {
    try {
      const validLimit = Math.min(20, Math.max(1, limit));

      const [farms, total] = await Promise.all([
        database.farm.findMany({
          where: {
            status: "ACTIVE" as FarmStatus,
            verificationStatus: "VERIFIED" as FarmVerificationStatus,
          },
          include: {
            _count: {
              select: {
                products: true,
                reviews: true,
              },
            },
            products: {
              where: {
                status: "ACTIVE" as ProductStatus,
                inStock: true,
                quantityAvailable: {
                  gt: 0,
                },
              },
              take: 4,
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          orderBy: {
            averageRating: "desc",
          },
          take: validLimit,
        }),
        database.farm.count({
          where: {
            status: "ACTIVE" as FarmStatus,
            verificationStatus: "VERIFIED" as FarmVerificationStatus,
          },
        }),
      ]);

      return {
        farms: farms as FeaturedFarm[],
        total,
      };
    } catch (error) {
      console.error("❌ MarketplaceService.getFeaturedFarms error:", error);
      throw new Error(
        `Failed to fetch featured farms: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 🌱 GET SEASONAL RECOMMENDATIONS
   * Biodynamic seasonal product awareness
   */
  async getSeasonalRecommendations(
    limit: number = 12,
  ): Promise<SeasonalRecommendation> {
    try {
      const validLimit = Math.min(50, Math.max(1, limit));
      const currentSeason = this.getCurrentSeason();
      const seasonalCategories = this.getSeasonalCategories(currentSeason);

      const products = await database.product.findMany({
        where: {
          status: "ACTIVE" as ProductStatus,
          inStock: true,
          quantityAvailable: {
            gt: 0,
          },
          category: {
            in: seasonalCategories,
          },
        },
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              city: true,
              state: true,
              averageRating: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: validLimit,
      });

      return {
        season: currentSeason,
        products: products as unknown as ProductWithFarm[],
        message: this.getSeasonalMessage(currentSeason),
      };
    } catch (error) {
      console.error(
        "❌ MarketplaceService.getSeasonalRecommendations error:",
        error,
      );
      throw new Error(
        `Failed to fetch seasonal recommendations: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 🔍 SEARCH PRODUCTS BY NAME
   * Quick search functionality with agricultural awareness
   */
  async searchProducts(
    query: string,
    limit: number = 10,
  ): Promise<ProductWithFarm[]> {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const validLimit = Math.min(50, Math.max(1, limit));

      const products = await database.product.findMany({
        where: {
          status: "ACTIVE" as ProductStatus,
          inStock: true,
          OR: [
            {
              name: {
                contains: query.trim(),
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
            {
              description: {
                contains: query.trim(),
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
          ],
        },
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              city: true,
              state: true,
              averageRating: true,
            },
          },
        },
        take: validLimit,
        orderBy: {
          name: "asc",
        },
      });

      return products as unknown as ProductWithFarm[];
    } catch (error) {
      console.error("❌ MarketplaceService.searchProducts error:", error);
      throw new Error(
        `Failed to search products: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 🏪 GET FARM PRODUCTS
   * Get all products for a specific farm
   */
  async getFarmProducts(
    farmId: string,
    filters: Partial<MarketplaceFilters> = {},
  ): Promise<MarketplaceProductsResult> {
    return this.getProducts({
      ...filters,
      farmId,
    });
  }

  /**
   * 📊 GET PRODUCT STATS
   * Get marketplace statistics for analytics
   */
  async getMarketplaceStats() {
    try {
      const [totalProducts, totalFarms, activeFarms, categoryCounts] =
        await Promise.all([
          database.product.count({
            where: {
              status: "ACTIVE" as ProductStatus,
              inStock: true,
            },
          }),
          database.farm.count(),
          database.farm.count({
            where: {
              status: "ACTIVE" as FarmStatus,
              verificationStatus: "VERIFIED" as FarmVerificationStatus,
            },
          }),
          database.product.groupBy({
            by: ["category"],
            where: {
              status: "ACTIVE" as ProductStatus,
              inStock: true,
            },
            _count: {
              category: true,
            },
          }),
        ]);

      return {
        totalProducts,
        totalFarms,
        activeFarms,
        categoryCounts: categoryCounts.map((item) => ({
          category: item.category,
          count: item._count.category,
        })),
      };
    } catch (error) {
      console.error("❌ MarketplaceService.getMarketplaceStats error:", error);
      throw new Error(
        `Failed to fetch marketplace stats: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS - AGRICULTURAL CONSCIOUSNESS
  // ============================================================================

  /**
   * 🌍 GET CURRENT SEASON
   * Biodynamic seasonal awareness
   */
  private getCurrentSeason(): "SPRING" | "SUMMER" | "FALL" | "WINTER" {
    const now = new Date();
    const month = now.getMonth(); // 0-11

    // Northern Hemisphere seasons
    if (month >= 2 && month <= 4) return "SPRING"; // Mar-May
    if (month >= 5 && month <= 7) return "SUMMER"; // Jun-Aug
    if (month >= 8 && month <= 10) return "FALL"; // Sep-Nov
    return "WINTER"; // Dec-Feb
  }

  /**
   * 🌾 GET SEASONAL CATEGORIES
   * Map seasons to product categories
   */
  private getSeasonalCategories(
    season: "SPRING" | "SUMMER" | "FALL" | "WINTER",
  ): ProductCategory[] {
    const categoryMap: Record<string, ProductCategory[]> = {
      SPRING: [
        "VEGETABLES" as ProductCategory,
        "HERBS" as ProductCategory,
        "FLOWERS" as ProductCategory,
        "HONEY" as ProductCategory,
      ],
      SUMMER: [
        "FRUITS" as ProductCategory,
        "VEGETABLES" as ProductCategory,
        "BERRIES" as ProductCategory,
        "HERBS" as ProductCategory,
      ],
      FALL: [
        "VEGETABLES" as ProductCategory,
        "FRUITS" as ProductCategory,
        "GRAINS" as ProductCategory,
        "PRESERVES" as ProductCategory,
      ],
      WINTER: [
        "PRESERVES" as ProductCategory,
        "HONEY" as ProductCategory,
        "MEAT" as ProductCategory,
        "BAKED_GOODS" as ProductCategory,
      ],
    };

    return categoryMap[season] || [];
  }

  /**
   * 💬 GET SEASONAL MESSAGE
   * Agricultural consciousness messaging
   */
  private getSeasonalMessage(
    season: "SPRING" | "SUMMER" | "FALL" | "WINTER",
  ): string {
    const messages: Record<string, string> = {
      SPRING:
        "🌱 Spring awakening! Fresh greens, herbs, and early season produce are here.",
      SUMMER:
        "☀️ Summer bounty! Peak season for fruits, vegetables, and vibrant flavors.",
      FALL: "🍂 Fall harvest! Root vegetables, grains, and preserves for the season.",
      WINTER:
        "❄️ Winter preservation! Stored goods, honey, and hearty provisions.",
    };

    return (
      messages[season] || "Discover fresh, local products from nearby farms."
    );
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const marketplaceService = new MarketplaceService();
export default marketplaceService;
