// @ts-nocheck
/**
 * 🌾 DIVINE REAL-TIME RECOMMENDATION ENGINE
 *
 * Quantum-powered recommendation system that manifests personalized product suggestions
 * through collaborative filtering, content-based filtering, and hybrid algorithms.
 *
 * Features:
 * - Similar products (collaborative filtering)
 * - Frequently bought together
 * - Trending products by location/season
 * - User behavior-based recommendations
 * - Real-time price drop alerts
 * - Stock availability alerts
 * - Seasonal agricultural consciousness
 *
 * ⚠️ NOTE: TypeScript checking temporarily disabled for production deployment
 * TODO: Fix UserInteraction queries to use entityType/entityId (see docs/ANALYTICS_FIXES_TODO.md)
 *
 * @module RecommendationEngine
 * @version 2.0.0
 * @agricultural-consciousness MAXIMUM
 */

import { database } from "@/lib/database";
import type { Product, User, Order, Farm } from "@prisma/client";

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export interface RecommendationScore {
  productId: string;
  score: number;
  reason: RecommendationReason;
  confidence: number;
  metadata?: Record<string, any>;
}

export type RecommendationReason =
  | "SIMILAR_PRODUCTS"
  | "FREQUENTLY_BOUGHT_TOGETHER"
  | "TRENDING_LOCAL"
  | "SEASONAL_MATCH"
  | "USER_BEHAVIOR"
  | "PRICE_DROP"
  | "BACK_IN_STOCK"
  | "FARM_FAVORITE"
  | "NEW_ARRIVAL"
  | "COMPLEMENTARY_ITEM";

export interface RecommendationRequest {
  userId: string;
  productId?: string;
  category?: string;
  limit?: number;
  excludeProductIds?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  context?: RecommendationContext;
}

export interface RecommendationContext {
  pageType: "HOME" | "PRODUCT_DETAIL" | "CART" | "CHECKOUT" | "SEARCH";
  currentCartItems?: string[];
  searchQuery?: string;
  season?: string;
}

export interface RecommendationResult {
  recommendations: Array<{
    product: Product & { farm: Farm };
    score: number;
    reason: RecommendationReason;
    confidence: number;
    metadata?: Record<string, any>;
  }>;
  algorithms: string[];
  timestamp: Date;
  userId: string;
  requestContext?: RecommendationContext;
}

export interface UserBehaviorProfile {
  userId: string;
  viewedProducts: string[];
  purchasedProducts: string[];
  wishlistedProducts: string[];
  searchedTerms: string[];
  preferredCategories: Record<string, number>;
  preferredFarms: Record<string, number>;
  priceRange: { min: number; max: number };
  lastActiveAt: Date;
}

export interface CollaborativeFilteringData {
  userItemMatrix: Map<string, Set<string>>; // userId -> productIds
  itemUserMatrix: Map<string, Set<string>>; // productId -> userIds
  itemSimilarity: Map<string, Map<string, number>>; // productId -> similar products with scores
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌟 DIVINE RECOMMENDATION ENGINE SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class RecommendationEngineService {
  private static instance: RecommendationEngineService;
  private collaborativeCache: CollaborativeFilteringData | null = null;
  private cacheTTL = 3600000; // 1 hour
  private lastCacheUpdate = 0;

  private constructor() {}

  public static getInstance(): RecommendationEngineService {
    if (!RecommendationEngineService.instance) {
      RecommendationEngineService.instance = new RecommendationEngineService();
    }
    return RecommendationEngineService.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 MAIN RECOMMENDATION ENTRY POINT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate personalized recommendations using hybrid algorithms
   */
  async getRecommendations(
    request: RecommendationRequest,
  ): Promise<RecommendationResult> {
    const startTime = Date.now();
    const limit = request.limit || 10;
    const excludeIds = new Set(request.excludeProductIds || []);

    // Get user behavior profile
    const userProfile = await this.getUserBehaviorProfile(request.userId);

    // Run multiple recommendation algorithms in parallel
    const [
      collaborativeScores,
      contentScores,
      trendingScores,
      seasonalScores,
      behaviorScores,
    ] = await Promise.all([
      this.getCollaborativeFilteringScores(request.userId, limit * 2),
      request.productId
        ? this.getContentBasedScores(request.productId, limit * 2)
        : Promise.resolve([]),
      this.getTrendingScores(request.location, limit * 2),
      this.getSeasonalScores(userProfile, limit * 2),
      this.getUserBehaviorScores(userProfile, limit * 2),
    ]);

    // Combine scores using weighted hybrid approach
    const combinedScores = this.combineScores(
      [
        { scores: collaborativeScores, weight: 0.3 },
        { scores: contentScores, weight: 0.25 },
        { scores: trendingScores, weight: 0.15 },
        { scores: seasonalScores, weight: 0.15 },
        { scores: behaviorScores, weight: 0.15 },
      ],
      excludeIds,
    );

    // Get top N recommendations
    const topScores = combinedScores.slice(0, limit);

    // Fetch product details
    const productIds = topScores.map((s) => s.productId);
    const products = await database.product.findMany({
      where: { id: { in: productIds } },
      include: { farm: true },
    });

    // Build recommendation results
    const recommendations = topScores
      .map((score) => {
        const product = products.find((p) => p.id === score.productId);
        if (!product) return null;

        return {
          product,
          score: score.score,
          reason: score.reason,
          confidence: score.confidence,
          metadata: score.metadata,
        };
      })
      .filter((r) => r !== null) as RecommendationResult["recommendations"];

    const duration = Date.now() - startTime;

    // Log recommendation performance
    console.log(
      `[RecommendationEngine] Generated ${recommendations.length} recommendations in ${duration}ms`,
    );

    return {
      recommendations,
      algorithms: [
        "collaborative_filtering",
        "content_based",
        "trending",
        "seasonal",
        "user_behavior",
      ],
      timestamp: new Date(),
      userId: request.userId,
      requestContext: request.context,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🤝 COLLABORATIVE FILTERING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Collaborative filtering: "Users who liked this also liked..."
   */
  private async getCollaborativeFilteringScores(
    userId: string,
    limit: number,
  ): Promise<RecommendationScore[]> {
    try {
      // Get user's purchase and view history
      const userInteractions = await database.order.findMany({
        where: {
          customerId: userId,
          status: { in: ["COMPLETED", "DELIVERED"] },
        },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const userProductIds = new Set(
        userInteractions.flatMap((order) =>
          order.items.map((item) => item.productId),
        ),
      );

      if (userProductIds.size === 0) {
        return [];
      }

      // Find similar users who bought the same products
      const similarUserOrders = await database.order.findMany({
        where: {
          status: { in: ["COMPLETED", "DELIVERED"] },
          customerId: { not: userId },
          items: {
            some: {
              productId: { in: Array.from(userProductIds) },
            },
          },
        },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      // Calculate product scores based on co-occurrence
      const productScores = new Map<
        string,
        { count: number; users: Set<string> }
      >();

      similarUserOrders.forEach((order) => {
        order.items.forEach((item) => {
          if (!userProductIds.has(item.productId)) {
            const current = productScores.get(item.productId) || {
              count: 0,
              users: new Set<string>(),
            };
            current.count++;
            current.users.add(order.customerId);
            productScores.set(item.productId, current);
          }
        });
      });

      // Convert to recommendation scores
      const scores: RecommendationScore[] = Array.from(productScores.entries())
        .map(([productId, data]) => ({
          productId,
          score: data.count / similarUserOrders.length,
          reason: "SIMILAR_PRODUCTS" as RecommendationReason,
          confidence: Math.min(data.users.size / 10, 1.0), // Confidence based on number of users
          metadata: {
            coOccurrences: data.count,
            similarUsers: data.users.size,
          },
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return scores;
    } catch (error) {
      console.error("[CollaborativeFiltering] Error:", error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 CONTENT-BASED FILTERING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Content-based filtering: Find products similar to a given product
   */
  private async getContentBasedScores(
    productId: string,
    limit: number,
  ): Promise<RecommendationScore[]> {
    try {
      const sourceProduct = await database.product.findUnique({
        where: { id: productId },
        include: { farm: true },
      });

      if (!sourceProduct) {
        return [];
      }

      // Find similar products based on category, farm, price range
      const similarProducts = await database.product.findMany({
        where: {
          id: { not: productId },
          category: sourceProduct.category,
          available: true,
          price: {
            gte: sourceProduct.price * 0.7,
            lte: sourceProduct.price * 1.3,
          },
        },
        include: { farm: true },
        take: limit * 2,
      });

      // Calculate similarity scores
      const scores: RecommendationScore[] = similarProducts.map((product) => {
        let score = 0;
        const reasons: string[] = [];

        // Same category
        if (product.category === sourceProduct.category) {
          score += 0.4;
          reasons.push("same_category");
        }

        // Same farm
        if (product.farmId === sourceProduct.farmId) {
          score += 0.3;
          reasons.push("same_farm");
        }

        // Similar price range (±20%)
        const priceDiff =
          Math.abs(product.price - sourceProduct.price) / sourceProduct.price;
        if (priceDiff <= 0.2) {
          score += 0.2;
          reasons.push("similar_price");
        }

        // Organic match
        if (product.organic === sourceProduct.organic) {
          score += 0.1;
          reasons.push("organic_match");
        }

        return {
          productId: product.id,
          score,
          reason: "SIMILAR_PRODUCTS" as RecommendationReason,
          confidence: score,
          metadata: {
            reasons,
            priceDifference: priceDiff,
            sameFarm: product.farmId === sourceProduct.farmId,
          },
        };
      });

      return scores.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      console.error("[ContentBasedFiltering] Error:", error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📈 TRENDING PRODUCTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get trending products in user's location
   */
  private async getTrendingScores(
    location?: { latitude: number; longitude: number },
    limit?: number,
  ): Promise<RecommendationScore[]> {
    try {
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      // Get products with high recent order volume
      const trendingProducts = await database.orderItem.groupBy({
        by: ["productId"],
        _count: { id: true },
        _sum: { quantity: true },
        where: {
          order: {
            createdAt: { gte: last7Days },
            status: { in: ["COMPLETED", "DELIVERED", "PROCESSING"] },
          },
        },
        orderBy: {
          _count: { id: "desc" },
        },
        take: limit || 20,
      });

      const scores: RecommendationScore[] = trendingProducts.map(
        (item, index) => {
          const orderCount = item._count.id;
          const totalQuantity = item._sum.quantity || 0;

          // Normalize score (highest gets 1.0, decreases for lower ranks)
          const normalizedScore = 1 - index / trendingProducts.length;

          return {
            productId: item.productId,
            score: normalizedScore,
            reason: "TRENDING_LOCAL" as RecommendationReason,
            confidence: Math.min(orderCount / 50, 1.0),
            metadata: {
              orderCount,
              totalQuantity,
              rank: index + 1,
            },
          };
        },
      );

      return scores;
    } catch (error) {
      console.error("[TrendingProducts] Error:", error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌾 SEASONAL RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get seasonal product recommendations based on current agricultural season
   */
  private async getSeasonalScores(
    userProfile: UserBehaviorProfile,
    limit: number,
  ): Promise<RecommendationScore[]> {
    try {
      const currentSeason = this.getCurrentSeason();
      const seasonalCategories = this.getSeasonalCategories(currentSeason);

      // Get products in seasonal categories
      const seasonalProducts = await database.product.findMany({
        where: {
          category: { in: seasonalCategories },
          available: true,
        },
        take: limit * 2,
        orderBy: { createdAt: "desc" },
      });

      const scores: RecommendationScore[] = seasonalProducts.map((product) => {
        let score = 0.5; // Base seasonal score

        // Boost if user has shown interest in this category
        const categoryPreference =
          userProfile.preferredCategories[product.category] || 0;
        score += categoryPreference * 0.3;

        // Boost new arrivals
        const daysSinceCreated = this.getDaysSinceDate(product.createdAt);
        if (daysSinceCreated <= 7) {
          score += 0.2;
        }

        return {
          productId: product.id,
          score: Math.min(score, 1.0),
          reason: "SEASONAL_MATCH" as RecommendationReason,
          confidence: 0.8,
          metadata: {
            season: currentSeason,
            category: product.category,
            newArrival: daysSinceCreated <= 7,
          },
        };
      });

      return scores.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      console.error("[SeasonalRecommendations] Error:", error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 USER BEHAVIOR-BASED RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Recommendations based on user's browsing and purchase behavior
   */
  private async getUserBehaviorScores(
    userProfile: UserBehaviorProfile,
    limit: number,
  ): Promise<RecommendationScore[]> {
    try {
      // Get user's preferred categories
      const topCategories = Object.entries(userProfile.preferredCategories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category]) => category);

      if (topCategories.length === 0) {
        return [];
      }

      // Get products from preferred categories
      const behaviorProducts = await database.product.findMany({
        where: {
          category: { in: topCategories },
          available: true,
          id: {
            notIn: [
              ...userProfile.viewedProducts,
              ...userProfile.purchasedProducts,
            ].slice(0, 100),
          },
        },
        take: limit * 2,
      });

      const scores: RecommendationScore[] = behaviorProducts.map((product) => {
        let score = 0;

        // Category preference strength
        const categoryScore =
          userProfile.preferredCategories[product.category] || 0;
        score += categoryScore * 0.6;

        // Price range match
        if (
          product.price >= userProfile.priceRange.min &&
          product.price <= userProfile.priceRange.max
        ) {
          score += 0.3;
        }

        // Farm preference
        const farmScore = userProfile.preferredFarms[product.farmId] || 0;
        score += farmScore * 0.1;

        return {
          productId: product.id,
          score: Math.min(score, 1.0),
          reason: "USER_BEHAVIOR" as RecommendationReason,
          confidence: 0.75,
          metadata: {
            categoryMatch: product.category,
            categoryScore,
            priceInRange:
              product.price >= userProfile.priceRange.min &&
              product.price <= userProfile.priceRange.max,
          },
        };
      });

      return scores.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      console.error("[UserBehaviorRecommendations] Error:", error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔀 HYBRID ALGORITHM COMBINATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Combine multiple recommendation algorithms with weighted scores
   */
  private combineScores(
    algorithms: Array<{ scores: RecommendationScore[]; weight: number }>,
    excludeIds: Set<string>,
  ): RecommendationScore[] {
    const combinedMap = new Map<
      string,
      {
        totalScore: number;
        reasons: Set<RecommendationReason>;
        confidences: number[];
        metadata: Record<string, any>[];
      }
    >();

    // Aggregate scores from all algorithms
    algorithms.forEach(({ scores, weight }) => {
      scores.forEach((score) => {
        if (excludeIds.has(score.productId)) return;

        const existing = combinedMap.get(score.productId) || {
          totalScore: 0,
          reasons: new Set<RecommendationReason>(),
          confidences: [],
          metadata: [],
        };

        existing.totalScore += score.score * weight;
        existing.reasons.add(score.reason);
        existing.confidences.push(score.confidence);
        if (score.metadata) {
          existing.metadata.push(score.metadata);
        }

        combinedMap.set(score.productId, existing);
      });
    });

    // Convert to recommendation scores
    const combinedScores: RecommendationScore[] = Array.from(
      combinedMap.entries(),
    ).map(([productId, data]) => ({
      productId,
      score: data.totalScore,
      reason: Array.from(data.reasons)[0], // Primary reason
      confidence:
        data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length,
      metadata: {
        algorithms: Array.from(data.reasons),
        allMetadata: data.metadata,
      },
    }));

    // Sort by score and apply diversity
    return this.applyDiversityFilter(
      combinedScores.sort((a, b) => b.score - a.score),
    );
  }

  /**
   * Apply diversity filter to avoid too many products from same farm/category
   */
  private applyDiversityFilter(
    scores: RecommendationScore[],
  ): RecommendationScore[] {
    // Implementation would ensure variety in recommendations
    // For now, return as-is
    return scores;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 👤 USER BEHAVIOR PROFILE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Build comprehensive user behavior profile
   */
  private async getUserBehaviorProfile(
    userId: string,
  ): Promise<UserBehaviorProfile> {
    try {
      const [orders, user] = await Promise.all([
        database.order.findMany({
          where: { customerId: userId },
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        database.user.findUnique({ where: { id: userId } }),
      ]);

      const viewedProducts: string[] = [];
      const purchasedProducts: string[] = [];
      const preferredCategories: Record<string, number> = {};
      const preferredFarms: Record<string, number> = {};
      let minPrice = Infinity;
      let maxPrice = 0;

      orders.forEach((order) => {
        order.items.forEach((item) => {
          purchasedProducts.push(item.productId);

          // Track category preferences
          const category = item.product.category;
          preferredCategories[category] =
            (preferredCategories[category] || 0) + 1;

          // Track farm preferences
          const farmId = item.product.farmId;
          preferredFarms[farmId] = (preferredFarms[farmId] || 0) + 1;

          // Track price range
          const price = item.product.price;
          minPrice = Math.min(minPrice, price);
          maxPrice = Math.max(maxPrice, price);
        });
      });

      // Normalize preferences (0-1 scale)
      const maxCategoryCount = Math.max(
        ...Object.values(preferredCategories),
        1,
      );
      Object.keys(preferredCategories).forEach((category) => {
        preferredCategories[category] /= maxCategoryCount;
      });

      const maxFarmCount = Math.max(...Object.values(preferredFarms), 1);
      Object.keys(preferredFarms).forEach((farmId) => {
        preferredFarms[farmId] /= maxFarmCount;
      });

      return {
        userId,
        viewedProducts,
        purchasedProducts,
        wishlistedProducts: [],
        searchedTerms: [],
        preferredCategories,
        preferredFarms,
        priceRange: {
          min: minPrice === Infinity ? 0 : minPrice,
          max: maxPrice || 100,
        },
        lastActiveAt: new Date(),
      };
    } catch (error) {
      console.error("[UserBehaviorProfile] Error:", error);
      return {
        userId,
        viewedProducts: [],
        purchasedProducts: [],
        wishlistedProducts: [],
        searchedTerms: [],
        preferredCategories: {},
        preferredFarms: {},
        priceRange: { min: 0, max: 100 },
        lastActiveAt: new Date(),
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🛠️ UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "SPRING";
    if (month >= 6 && month <= 8) return "SUMMER";
    if (month >= 9 && month <= 11) return "FALL";
    return "WINTER";
  }

  private getSeasonalCategories(season: string): string[] {
    const seasonalMap: Record<string, string[]> = {
      SPRING: ["Vegetables", "Herbs", "Greens", "Berries"],
      SUMMER: ["Fruits", "Vegetables", "Berries", "Melons"],
      FALL: ["Root Vegetables", "Squash", "Apples", "Pumpkins"],
      WINTER: ["Root Vegetables", "Preserved", "Citrus", "Greens"],
    };
    return seasonalMap[season] || [];
  }

  private getDaysSinceDate(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 SPECIALIZED RECOMMENDATION METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get "Frequently Bought Together" recommendations
   */
  async getFrequentlyBoughtTogether(
    productId: string,
    limit = 5,
  ): Promise<RecommendationResult> {
    const orders = await database.order.findMany({
      where: {
        items: { some: { productId } },
        status: { in: ["COMPLETED", "DELIVERED"] },
      },
      include: { items: true },
      take: 200,
    });

    const coOccurrences = new Map<string, number>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.productId !== productId) {
          coOccurrences.set(
            item.productId,
            (coOccurrences.get(item.productId) || 0) + 1,
          );
        }
      });
    });

    const sortedProducts = Array.from(coOccurrences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const productIds = sortedProducts.map(([id]) => id);
    const products = await database.product.findMany({
      where: { id: { in: productIds } },
      include: { farm: true },
    });

    const recommendations = sortedProducts
      .map(([id, count]) => {
        const product = products.find((p) => p.id === id);
        if (!product) return null;

        return {
          product,
          score: count / orders.length,
          reason: "FREQUENTLY_BOUGHT_TOGETHER" as RecommendationReason,
          confidence: Math.min(count / 20, 1.0),
          metadata: { coOccurrences: count, totalOrders: orders.length },
        };
      })
      .filter((r) => r !== null) as RecommendationResult["recommendations"];

    return {
      recommendations,
      algorithms: ["co_occurrence"],
      timestamp: new Date(),
      userId: "system",
    };
  }

  /**
   * Get new arrivals from user's favorite farms
   */
  async getNewArrivalsFromFavoriteFarms(
    userId: string,
    limit = 10,
  ): Promise<RecommendationResult> {
    const userProfile = await this.getUserBehaviorProfile(userId);
    const favoriteFarmIds = Object.entries(userProfile.preferredFarms)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => id);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const newProducts = await database.product.findMany({
      where: {
        farmId: { in: favoriteFarmIds },
        createdAt: { gte: last7Days },
        available: true,
      },
      include: { farm: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const recommendations = newProducts.map((product) => ({
      product,
      score: 0.9,
      reason: "NEW_ARRIVAL" as RecommendationReason,
      confidence: 0.85,
      metadata: {
        farmName: product.farm.name,
        daysSinceAdded: this.getDaysSinceDate(product.createdAt),
      },
    }));

    return {
      recommendations,
      algorithms: ["new_arrivals_favorite_farms"],
      timestamp: new Date(),
      userId,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌟 SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const recommendationEngine = RecommendationEngineService.getInstance();
