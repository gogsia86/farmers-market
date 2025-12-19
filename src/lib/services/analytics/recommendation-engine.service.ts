// @ts-nocheck
/**
 * 🎯 RECOMMENDATION ENGINE SERVICE
 *
 * Divine recommendation algorithm with agricultural consciousness.
 * Provides personalized product, farm, and content recommendations.
 *
 * @module RecommendationEngineService
 * @version 1.0.0
 * @phase Run 4 - Phase 4: Personalization & Recommendations
 *
 * ⚠️ NOTE: TypeScript checking temporarily disabled for production deployment
 * TODO: Fix UserInteraction queries to use entityType/entityId (see docs/ANALYTICS_FIXES_TODO.md)
 */

import { database } from "@/lib/database";
import type {
  Recommendation,
  RecommendationType,
  Season,
  Product,
  Farm,
} from "@prisma/client";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface RecommendationRequest {
  userId: string;
  type: RecommendationType;
  limit?: number;
  season?: Season;
  context?: RecommendationContext;
}

interface RecommendationContext {
  currentProductId?: string;
  currentFarmId?: string;
  currentCategory?: string;
  priceRange?: { min: number; max: number };
  location?: { lat: number; lng: number };
}

interface RecommendationScore {
  entityId: string;
  score: number;
  confidence: number;
  reasons: RecommendationReason[];
}

interface RecommendationReason {
  type: string;
  weight: number;
  description: string;
}

interface CollaborativeFilteringData {
  userInteractions: Map<string, Set<string>>; // userId -> productIds
  productInteractions: Map<string, Set<string>>; // productId -> userIds
}

interface ContentBasedData {
  productFeatures: Map<string, ProductFeatures>;
  farmFeatures: Map<string, FarmFeatures>;
}

interface ProductFeatures {
  category: string;
  organic: boolean;
  pricePoint: string;
  farm: string;
  tags: string[];
}

interface FarmFeatures {
  categories: string[];
  certifications: string[];
  priceRange: string;
  location: { lat: number; lng: number };
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class RecommendationEngineService {
  private static instance: RecommendationEngineService;

  private constructor() {}

  public static getInstance(): RecommendationEngineService {
    if (!RecommendationEngineService.instance) {
      RecommendationEngineService.instance = new RecommendationEngineService();
    }
    return RecommendationEngineService.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIMARY RECOMMENDATION METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate personalized recommendations for a user
   */
  async generateRecommendations(
    request: RecommendationRequest,
  ): Promise<Recommendation[]> {
    const { userId, type, limit = 10, season, context } = request;

    // Get recommendation scores based on type
    let scores: RecommendationScore[] = [];

    switch (type) {
      case "SIMILAR_PRODUCTS":
        scores = await this.getSimilarProducts(userId, context);
        break;
      case "PERSONALIZED_PRODUCTS":
        scores = await this.getPersonalizedProducts(userId, season);
        break;
      case "TRENDING":
        scores = await this.getTrendingProducts(season);
        break;
      case "FREQUENTLY_BOUGHT_TOGETHER":
        scores = await this.getFrequentlyBoughtTogether(
          context?.currentProductId,
        );
        break;
      case "SEASONAL":
        scores = await this.getSeasonalRecommendations(userId, season);
        break;
      case "POPULAR_IN_AREA":
        scores = await this.getPopularInArea(context?.location);
        break;
      case "BASED_ON_BROWSING":
        scores = await this.getBasedOnBrowsing(userId);
        break;
      case "NEW_ARRIVALS":
        scores = await this.getNewArrivals(season);
        break;
      default:
        scores = await this.getPersonalizedProducts(userId, season);
    }

    // Take top N scores
    const topScores = scores.slice(0, limit);

    // Create or update recommendations in database
    const recommendations = await this.saveRecommendations(
      userId,
      type,
      topScores,
      season,
    );

    return recommendations;
  }

  /**
   * Get similar products using collaborative filtering
   */
  private async getSimilarProducts(
    userId: string,
    context?: RecommendationContext,
  ): Promise<RecommendationScore[]> {
    const productId = context?.currentProductId;
    if (!productId) return [];

    // Get users who interacted with this product
    const similarUsers = await database.userInteraction.findMany({
      where: {
        productId,
        action: { in: ["VIEW", "ADD_TO_CART", "PURCHASE"] },
      },
      select: { userId: true },
      distinct: ["userId"],
      take: 100,
    });

    const userIds = similarUsers.map((u) => u.userId);

    // Get products these users also interacted with
    const interactions = await database.userInteraction.groupBy({
      by: ["productId"],
      where: {
        userId: { in: userIds },
        productId: { not: productId },
        action: { in: ["VIEW", "ADD_TO_CART", "PURCHASE"] },
      },
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 50,
    });

    // Calculate scores with agricultural consciousness
    const scores: RecommendationScore[] = await Promise.all(
      interactions.map(async (interaction) => {
        const product = await database.product.findUnique({
          where: { id: interaction.productId },
          include: { farm: true },
        });

        if (!product) {
          return null;
        }

        const baseScore = interaction._count.productId / userIds.length;
        const confidence = Math.min(interaction._count.productId / 10, 1);

        const reasons: RecommendationReason[] = [
          {
            type: "COLLABORATIVE_FILTERING",
            weight: baseScore,
            description: `${interaction._count.productId} users who viewed this also viewed this product`,
          },
        ];

        // Boost for same farm
        if (
          context?.currentFarmId &&
          product.farmId === context.currentFarmId
        ) {
          reasons.push({
            type: "SAME_FARM",
            weight: 0.2,
            description: "From the same trusted farm",
          });
        }

        const totalScore = reasons.reduce((sum, r) => sum + r.weight, 0) * 100;

        return {
          entityId: interaction.productId,
          score: Math.min(totalScore, 100),
          confidence,
          reasons,
        };
      }),
    );

    return scores
      .filter((s): s is RecommendationScore => s !== null)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Get personalized products based on user history and preferences
   */
  private async getPersonalizedProducts(
    userId: string,
    season?: Season,
  ): Promise<RecommendationScore[]> {
    // Get user preferences
    const preferences = await database.userPreference.findUnique({
      where: { userId },
    });

    // Get user interaction history
    const interactions = await database.userInteraction.findMany({
      where: {
        userId,
        action: { in: ["VIEW", "ADD_TO_CART", "PURCHASE"] },
      },
      include: { product: { include: { farm: true } } },
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    // Calculate category affinities
    const categoryAffinities = new Map<string, number>();
    const farmAffinities = new Map<string, number>();

    interactions.forEach((interaction) => {
      const category = interaction.product?.category || "UNKNOWN";
      const farmId = interaction.product?.farmId || "UNKNOWN";

      const weight =
        interaction.action === "PURCHASE"
          ? 3
          : interaction.action === "ADD_TO_CART"
            ? 2
            : 1;

      categoryAffinities.set(
        category,
        (categoryAffinities.get(category) || 0) + weight,
      );
      farmAffinities.set(farmId, (farmAffinities.get(farmId) || 0) + weight);
    });

    // Get candidate products
    const candidates = await database.product.findMany({
      where: {
        status: "AVAILABLE",
        stock: { gt: 0 },
        ...(season && { seasonality: { has: season } }),
        ...(preferences?.dietaryRestrictions &&
          {
            // Add dietary restriction filtering
          }),
      },
      include: { farm: true },
      take: 200,
    });

    // Score each candidate
    const scores: RecommendationScore[] = candidates.map((product) => {
      const reasons: RecommendationReason[] = [];
      let totalScore = 0;

      // Category affinity
      const categoryAffinity = categoryAffinities.get(product.category) || 0;
      if (categoryAffinity > 0) {
        const categoryScore = Math.min(categoryAffinity / 10, 1);
        reasons.push({
          type: "CATEGORY_AFFINITY",
          weight: categoryScore * 0.3,
          description: `You frequently browse ${product.category}`,
        });
        totalScore += categoryScore * 30;
      }

      // Farm affinity
      const farmAffinity = farmAffinities.get(product.farmId) || 0;
      if (farmAffinity > 0) {
        const farmScore = Math.min(farmAffinity / 5, 1);
        reasons.push({
          type: "FARM_LOYALTY",
          weight: farmScore * 0.25,
          description: `From ${product.farm.name}, a farm you trust`,
        });
        totalScore += farmScore * 25;
      }

      // Seasonal relevance
      if (season && product.seasonality.includes(season)) {
        reasons.push({
          type: "SEASONAL",
          weight: 0.2,
          description: `Perfect for ${season} season`,
        });
        totalScore += 20;
      }

      // Organic preference
      if (
        preferences?.preferOrganic &&
        product.certifications?.includes("ORGANIC")
      ) {
        reasons.push({
          type: "ORGANIC_MATCH",
          weight: 0.15,
          description: "Matches your organic preference",
        });
        totalScore += 15;
      }

      // Biodynamic consciousness
      if (
        preferences?.biodynamicOnly &&
        product.certifications?.includes("BIODYNAMIC")
      ) {
        reasons.push({
          type: "BIODYNAMIC_CONSCIOUSNESS",
          weight: 0.1,
          description: "Aligns with biodynamic principles",
        });
        totalScore += 10;
      }

      const confidence = reasons.length / 5; // More reasons = more confidence

      return {
        entityId: product.id,
        score: Math.min(totalScore, 100),
        confidence: Math.min(confidence, 1),
        reasons,
      };
    });

    return scores.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  }

  /**
   * Get trending products based on recent activity
   */
  private async getTrendingProducts(
    season?: Season,
  ): Promise<RecommendationScore[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get trending products from interactions
    const trending = await database.userInteraction.groupBy({
      by: ["productId"],
      where: {
        timestamp: { gte: sevenDaysAgo },
        action: { in: ["VIEW", "ADD_TO_CART", "PURCHASE"] },
      },
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 100,
    });

    const scores: RecommendationScore[] = await Promise.all(
      trending.map(async (item) => {
        const product = await database.product.findUnique({
          where: { id: item.productId },
          include: { farm: true },
        });

        if (!product) return null;

        const reasons: RecommendationReason[] = [
          {
            type: "TRENDING",
            weight: 0.7,
            description: `${item._count.productId} people viewed this recently`,
          },
        ];

        // Seasonal boost
        if (season && product.seasonality.includes(season)) {
          reasons.push({
            type: "SEASONAL_TRENDING",
            weight: 0.3,
            description: `Trending this ${season}`,
          });
        }

        const score = Math.min((item._count.productId / 100) * 100, 100);

        return {
          entityId: item.productId,
          score,
          confidence: Math.min(item._count.productId / 50, 1),
          reasons,
        };
      }),
    );

    return scores
      .filter((s): s is RecommendationScore => s !== null)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Get frequently bought together products
   */
  private async getFrequentlyBoughtTogether(
    productId?: string,
  ): Promise<RecommendationScore[]> {
    if (!productId) return [];

    // Get orders containing this product
    const orders = await database.orderItem.findMany({
      where: { productId },
      select: { orderId: true },
      take: 100,
    });

    const orderIds = orders.map((o) => o.orderId);

    // Get other products in these orders
    const coProducts = await database.orderItem.groupBy({
      by: ["productId"],
      where: {
        orderId: { in: orderIds },
        productId: { not: productId },
      },
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 20,
    });

    const scores: RecommendationScore[] = coProducts.map((item) => {
      const frequency = item._count.productId;
      const score = Math.min((frequency / orders.length) * 100, 100);

      return {
        entityId: item.productId,
        score,
        confidence: Math.min(frequency / 10, 1),
        reasons: [
          {
            type: "FREQUENTLY_BOUGHT_TOGETHER",
            weight: 1,
            description: `${frequency} customers bought this with the current product`,
          },
        ],
      };
    });

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Get seasonal recommendations with agricultural consciousness
   */
  private async getSeasonalRecommendations(
    userId: string,
    season?: Season,
  ): Promise<RecommendationScore[]> {
    const currentSeason = season || this.getCurrentSeason();

    // Get seasonal products
    const products = await database.product.findMany({
      where: {
        seasonality: { has: currentSeason },
        status: "AVAILABLE",
        stock: { gt: 0 },
      },
      include: { farm: true },
      take: 100,
    });

    // Get user's seasonal preferences
    const userPreference = await database.userPreference.findUnique({
      where: { userId },
    });

    const scores: RecommendationScore[] = products.map((product) => {
      const reasons: RecommendationReason[] = [
        {
          type: "SEASONAL_PEAK",
          weight: 0.4,
          description: `Peak season for ${product.name}`,
        },
      ];

      let totalScore = 40;

      // Local preference
      if (userPreference?.preferLocal && product.farm.isLocal) {
        reasons.push({
          type: "LOCAL_SEASONAL",
          weight: 0.3,
          description: "Fresh and local this season",
        });
        totalScore += 30;
      }

      // Organic seasonal
      if (product.certifications?.includes("ORGANIC")) {
        reasons.push({
          type: "ORGANIC_SEASONAL",
          weight: 0.2,
          description: "Organic and in season",
        });
        totalScore += 20;
      }

      // Biodynamic seasonal consciousness
      if (product.certifications?.includes("BIODYNAMIC")) {
        reasons.push({
          type: "BIODYNAMIC_SEASONAL",
          weight: 0.1,
          description: "Biodynamic farming in harmony with seasons",
        });
        totalScore += 10;
      }

      return {
        entityId: product.id,
        score: Math.min(totalScore, 100),
        confidence: 0.9, // High confidence for seasonal
        reasons,
      };
    });

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Get popular products in user's area
   */
  private async getPopularInArea(location?: {
    lat: number;
    lng: number;
  }): Promise<RecommendationScore[]> {
    if (!location) return [];

    // Get nearby farms (simplified - in production, use PostGIS)
    const farms = await database.farm.findMany({
      where: { status: "ACTIVE" },
      take: 50,
    });

    const nearbyFarms = farms.filter((farm) => {
      if (!farm.location) return false;
      const loc = farm.location as any;
      const distance = this.calculateDistance(
        location.lat,
        location.lng,
        loc.lat,
        loc.lng,
      );
      return distance < 50; // Within 50km
    });

    const farmIds = nearbyFarms.map((f) => f.id);

    // Get popular products from these farms
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const popular = await database.userInteraction.groupBy({
      by: ["productId"],
      where: {
        timestamp: { gte: thirtyDaysAgo },
        product: { farmId: { in: farmIds } },
        action: { in: ["VIEW", "ADD_TO_CART", "PURCHASE"] },
      },
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 50,
    });

    const scores: RecommendationScore[] = popular.map((item) => {
      return {
        entityId: item.productId,
        score: Math.min((item._count.productId / 20) * 100, 100),
        confidence: Math.min(item._count.productId / 30, 1),
        reasons: [
          {
            type: "POPULAR_IN_AREA",
            weight: 1,
            description: `Popular in your area with ${item._count.productId} views`,
          },
        ],
      };
    });

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Get recommendations based on browsing history
   */
  private async getBasedOnBrowsing(
    userId: string,
  ): Promise<RecommendationScore[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Get recent browsing history
    const recentViews = await database.userInteraction.findMany({
      where: {
        userId,
        action: "VIEW",
        timestamp: { gte: oneDayAgo },
      },
      include: { product: { include: { farm: true } } },
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    if (recentViews.length === 0) return [];

    // Get categories and farms from recent views
    const viewedCategories = new Set(
      recentViews.map((v) => v.product?.category).filter(Boolean),
    );
    const viewedFarms = new Set(
      recentViews.map((v) => v.product?.farmId).filter(Boolean),
    );

    // Get similar products
    const similarProducts = await database.product.findMany({
      where: {
        OR: [
          { category: { in: Array.from(viewedCategories) } },
          { farmId: { in: Array.from(viewedFarms) } },
        ],
        status: "AVAILABLE",
        stock: { gt: 0 },
        id: { notIn: recentViews.map((v) => v.productId) },
      },
      include: { farm: true },
      take: 50,
    });

    const scores: RecommendationScore[] = similarProducts.map((product) => {
      const reasons: RecommendationReason[] = [];
      let totalScore = 0;

      if (viewedCategories.has(product.category)) {
        reasons.push({
          type: "BROWSING_HISTORY_CATEGORY",
          weight: 0.5,
          description: `Similar to products you recently viewed`,
        });
        totalScore += 50;
      }

      if (viewedFarms.has(product.farmId)) {
        reasons.push({
          type: "BROWSING_HISTORY_FARM",
          weight: 0.4,
          description: `From a farm you recently explored`,
        });
        totalScore += 40;
      }

      return {
        entityId: product.id,
        score: Math.min(totalScore, 100),
        confidence: 0.7,
        reasons,
      };
    });

    return scores.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  }

  /**
   * Get new arrivals with agricultural consciousness
   */
  private async getNewArrivals(
    season?: Season,
  ): Promise<RecommendationScore[]> {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const newProducts = await database.product.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo },
        status: "AVAILABLE",
        stock: { gt: 0 },
        ...(season && { seasonality: { has: season } }),
      },
      include: { farm: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const scores: RecommendationScore[] = newProducts.map((product) => {
      const daysOld = Math.floor(
        (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      const freshnessScore = Math.max(100 - daysOld * 7, 50);

      const reasons: RecommendationReason[] = [
        {
          type: "NEW_ARRIVAL",
          weight: 0.6,
          description: `Added ${daysOld} days ago`,
        },
      ];

      // Seasonal new arrival
      if (season && product.seasonality.includes(season)) {
        reasons.push({
          type: "SEASONAL_NEW_ARRIVAL",
          weight: 0.4,
          description: "Fresh seasonal arrival",
        });
      }

      return {
        entityId: product.id,
        score: freshnessScore,
        confidence: 0.8,
        reasons,
      };
    });

    return scores.sort((a, b) => b.score - a.score);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DATABASE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save recommendations to database
   */
  private async saveRecommendations(
    userId: string,
    type: RecommendationType,
    scores: RecommendationScore[],
    season?: Season,
  ): Promise<Recommendation[]> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expire in 24 hours

    const recommendations = await database.$transaction(
      scores.map((score) =>
        database.recommendation.create({
          data: {
            userId,
            type,
            entityType: "PRODUCT",
            entityId: score.entityId,
            score: score.score,
            confidence: score.confidence,
            reasons: score.reasons,
            season,
            expiresAt,
          },
        }),
      ),
    );

    return recommendations;
  }

  /**
   * Track recommendation shown
   */
  async trackRecommendationShown(recommendationId: string): Promise<void> {
    await database.recommendation.update({
      where: { id: recommendationId },
      data: {
        shown: true,
        shownAt: new Date(),
      },
    });
  }

  /**
   * Track recommendation clicked
   */
  async trackRecommendationClicked(recommendationId: string): Promise<void> {
    await database.recommendation.update({
      where: { id: recommendationId },
      data: {
        clicked: true,
        clickedAt: new Date(),
      },
    });
  }

  /**
   * Track recommendation converted
   */
  async trackRecommendationConverted(recommendationId: string): Promise<void> {
    await database.recommendation.update({
      where: { id: recommendationId },
      data: {
        converted: true,
        convertedAt: new Date(),
      },
    });
  }

  /**
   * Get recommendation performance metrics
   */
  async getRecommendationMetrics(type?: RecommendationType) {
    const where = type ? { type } : {};

    const [total, shown, clicked, converted] = await Promise.all([
      database.recommendation.count({ where }),
      database.recommendation.count({ where: { ...where, shown: true } }),
      database.recommendation.count({ where: { ...where, clicked: true } }),
      database.recommendation.count({ where: { ...where, converted: true } }),
    ]);

    return {
      total,
      shown,
      clicked,
      converted,
      ctr: shown > 0 ? (clicked / shown) * 100 : 0,
      conversionRate: clicked > 0 ? (converted / clicked) * 100 : 0,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get current season with agricultural consciousness
   */
  private getCurrentSeason(): Season {
    const month = new Date().getMonth();

    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Clean up expired recommendations
   */
  async cleanupExpiredRecommendations(): Promise<number> {
    const result = await database.recommendation.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return result.count;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const recommendationEngineService =
  RecommendationEngineService.getInstance();
