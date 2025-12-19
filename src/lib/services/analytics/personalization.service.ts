/**
 * 🎯 PERSONALIZATION SERVICE
 *
 * Divine personalization engine with agricultural consciousness.
 * Learns user preferences and calculates personalization scores.
 *
 * @module PersonalizationService
 * @version 1.0.0
 * @phase Run 4 - Phase 4: Personalization & Recommendations
 */

import { database } from "@/lib/database";
import type {
  PersonalizationScore,
  Season,
  UserPreference,
  Product,
  Farm,
} from "@prisma/client";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface PersonalizationRequest {
  userId: string;
  entityType: "PRODUCT" | "FARM" | "CATEGORY";
  entityId: string;
  season?: Season;
}

interface ScoreComponents {
  relevanceScore: number;
  affinityScore: number;
  seasonalScore: number;
  proximityScore: number;
  popularityScore: number;
}

interface UserProfile {
  categoryAffinities: Map<string, number>;
  farmAffinities: Map<string, number>;
  pricePreferences: {
    min: number;
    max: number;
    average: number;
  };
  timePreferences: {
    preferredHours: number[];
    preferredDays: string[];
  };
  behaviorMetrics: {
    avgSessionDuration: number;
    avgProductsViewed: number;
    conversionRate: number;
    repeatPurchaseRate: number;
  };
}

interface LearningData {
  views: number;
  clicks: number;
  cartAdds: number;
  purchases: number;
  totalSpent: number;
  lastInteraction: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class PersonalizationService {
  private static instance: PersonalizationService;

  private constructor() {}

  public static getInstance(): PersonalizationService {
    if (!PersonalizationService.instance) {
      PersonalizationService.instance = new PersonalizationService();
    }
    return PersonalizationService.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSONALIZATION SCORING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate personalization score for an entity
   */
  async calculatePersonalizationScore(
    request: PersonalizationRequest
  ): Promise<PersonalizationScore> {
    const { userId, entityType, entityId, season } = request;
    const currentSeason = season || this.getCurrentSeason();

    // Check if we have a valid cached score
    const cached = await this.getCachedScore(userId, entityType, entityId, currentSeason);
    if (cached && cached.expiresAt > new Date()) {
      return cached;
    }

    // Calculate score components
    const components = await this.calculateScoreComponents(
      userId,
      entityType,
      entityId,
      currentSeason
    );

    // Calculate total score
    const totalScore =
      components.relevanceScore * 0.3 +
      components.affinityScore * 0.25 +
      components.seasonalScore * 0.2 +
      components.proximityScore * 0.15 +
      components.popularityScore * 0.1;

    // Save to database
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 6); // Cache for 6 hours

    const score = await database.personalizationScore.upsert({
      where: {
        userId_entityType_entityId_season: {
          userId,
          entityType,
          entityId,
          season: currentSeason,
        },
      },
      create: {
        userId,
        entityType,
        entityId,
        ...components,
        totalScore: Math.round(totalScore),
        season: currentSeason,
        expiresAt,
      },
      update: {
        ...components,
        totalScore: Math.round(totalScore),
        calculatedAt: new Date(),
        expiresAt,
      },
    });

    return score;
  }

  /**
   * Calculate individual score components
   */
  private async calculateScoreComponents(
    userId: string,
    entityType: string,
    entityId: string,
    season: Season
  ): Promise<ScoreComponents> {
    const [relevance, affinity, seasonal, proximity, popularity] = await Promise.all([
      this.calculateRelevanceScore(userId, entityType, entityId),
      this.calculateAffinityScore(userId, entityType, entityId),
      this.calculateSeasonalScore(entityType, entityId, season),
      this.calculateProximityScore(userId, entityType, entityId),
      this.calculatePopularityScore(entityType, entityId),
    ]);

    return {
      relevanceScore: relevance,
      affinityScore: affinity,
      seasonalScore: seasonal,
      proximityScore: proximity,
      popularityScore: popularity,
    };
  }

  /**
   * Calculate relevance score based on user preferences
   */
  private async calculateRelevanceScore(
    userId: string,
    entityType: string,
    entityId: string
  ): Promise<number> {
    const preferences = await database.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) return 50; // Default relevance

    let score = 50;

    if (entityType === "PRODUCT") {
      const product = await database.product.findUnique({
        where: { id: entityId },
        include: { farm: true },
      });

      if (!product) return 0;

      // Organic preference match
      if (preferences.preferOrganic && product.certifications?.includes("ORGANIC")) {
        score += 15;
      }

      // Biodynamic preference match
      if (preferences.biodynamicOnly && product.certifications?.includes("BIODYNAMIC")) {
        score += 20;
      }

      // Local preference match
      if (preferences.preferLocal && product.farm.isLocal) {
        score += 15;
      }

      // Dietary restrictions match (if applicable)
      if (preferences.dietaryRestrictions) {
        const restrictions = preferences.dietaryRestrictions as string[];
        // Check if product meets dietary restrictions
        // This would require product dietary info in schema
        score += 10;
      }
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate affinity score based on user history
   */
  private async calculateAffinityScore(
    userId: string,
    entityType: string,
    entityId: string
  ): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (entityType === "PRODUCT") {
      const product = await database.product.findUnique({
        where: { id: entityId },
      });

      if (!product) return 0;

      // Get interactions with this category
      const categoryInteractions = await database.userInteraction.count({
        where: {
          userId,
          timestamp: { gte: thirtyDaysAgo },
          product: { category: product.category },
        },
      });

      // Get interactions with this farm
      const farmInteractions = await database.userInteraction.count({
        where: {
          userId,
          timestamp: { gte: thirtyDaysAgo },
          product: { farmId: product.farmId },
        },
      });

      // Calculate affinity (0-100)
      const categoryAffinity = Math.min((categoryInteractions / 10) * 50, 50);
      const farmAffinity = Math.min((farmInteractions / 5) * 50, 50);

      return Math.round(categoryAffinity + farmAffinity);
    }

    if (entityType === "FARM") {
      const farmInteractions = await database.userInteraction.count({
        where: {
          userId,
          timestamp: { gte: thirtyDaysAgo },
          product: { farmId: entityId },
        },
      });

      return Math.min((farmInteractions / 5) * 100, 100);
    }

    return 0;
  }

  /**
   * Calculate seasonal score with agricultural consciousness
   */
  private async calculateSeasonalScore(
    entityType: string,
    entityId: string,
    season: Season
  ): Promise<number> {
    if (entityType !== "PRODUCT") return 50; // Neutral for non-products

    const product = await database.product.findUnique({
      where: { id: entityId },
    });

    if (!product) return 0;

    // Check if product is in season
    if (product.seasonality.includes(season)) {
      return 100; // Perfect seasonal match
    }

    // Check if product is available in adjacent seasons
    const adjacentSeasons = this.getAdjacentSeasons(season);
    const hasAdjacentSeason = adjacentSeasons.some((s) =>
      product.seasonality.includes(s)
    );

    if (hasAdjacentSeason) {
      return 60; // Partial seasonal match
    }

    // Check if product is year-round
    if (product.seasonality.length >= 3) {
      return 50; // Year-round availability
    }

    return 20; // Out of season
  }

  /**
   * Calculate proximity score based on user location
   */
  private async calculateProximityScore(
    userId: string,
    entityType: string,
    entityId: string
  ): Promise<number> {
    // Get user's preferred location from preferences or recent orders
    const preferences = await database.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences?.defaultLocation) return 50; // Neutral if no location

    const userLocation = preferences.defaultLocation as any;

    let farmId: string | null = null;

    if (entityType === "PRODUCT") {
      const product = await database.product.findUnique({
        where: { id: entityId },
        select: { farmId: true },
      });
      farmId = product?.farmId || null;
    } else if (entityType === "FARM") {
      farmId = entityId;
    }

    if (!farmId) return 50;

    const farm = await database.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm?.location) return 50;

    const farmLocation = farm.location as any;

    // Calculate distance
    const distance = this.calculateDistance(
      userLocation.lat,
      userLocation.lng,
      farmLocation.lat,
      farmLocation.lng
    );

    // Score based on distance (0-100)
    if (distance < 10) return 100; // Within 10km - perfect
    if (distance < 25) return 80; // Within 25km - excellent
    if (distance < 50) return 60; // Within 50km - good
    if (distance < 100) return 40; // Within 100km - okay
    return 20; // Far away
  }

  /**
   * Calculate popularity score based on overall activity
   */
  private async calculatePopularityScore(
    entityType: string,
    entityId: string
  ): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let interactionCount = 0;

    if (entityType === "PRODUCT") {
      interactionCount = await database.userInteraction.count({
        where: {
          productId: entityId,
          timestamp: { gte: sevenDaysAgo },
        },
      });
    } else if (entityType === "FARM") {
      interactionCount = await database.userInteraction.count({
        where: {
          product: { farmId: entityId },
          timestamp: { gte: sevenDaysAgo },
        },
      });
    }

    // Score based on interaction count (0-100)
    return Math.min((interactionCount / 50) * 100, 100);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // USER PREFERENCE LEARNING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Learn and update user preferences from interactions
   */
  async learnUserPreferences(userId: string): Promise<UserPreference | null> {
    const profile = await this.buildUserProfile(userId);

    // Get or create user preferences
    let preferences = await database.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await database.userPreference.create({
        data: {
          userId,
          preferOrganic: false,
          preferLocal: false,
          biodynamicOnly: false,
        },
      });
    }

    // Update preferences based on learned behavior
    const updates: any = {};

    // Learn organic preference
    const organicRate = await this.calculateOrganicPreferenceRate(userId);
    if (organicRate > 0.7) {
      updates.preferOrganic = true;
    }

    // Learn local preference
    const localRate = await this.calculateLocalPreferenceRate(userId);
    if (localRate > 0.6) {
      updates.preferLocal = true;
    }

    // Learn price sensitivity
    if (profile.pricePreferences.average > 0) {
      updates.priceRangeMin = Math.floor(profile.pricePreferences.min);
      updates.priceRangeMax = Math.ceil(profile.pricePreferences.max);
    }

    // Update favorite categories
    const topCategories = Array.from(profile.categoryAffinities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);

    if (topCategories.length > 0) {
      updates.favoriteCategories = topCategories;
    }

    // Update favorite farms
    const topFarms = Array.from(profile.farmAffinities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);

    if (topFarms.length > 0) {
      updates.favoriteFarms = topFarms;
    }

    // Save updates
    if (Object.keys(updates).length > 0) {
      preferences = await database.userPreference.update({
        where: { userId },
        data: updates,
      });
    }

    return preferences;
  }

  /**
   * Build comprehensive user profile
   */
  private async buildUserProfile(userId: string): Promise<UserProfile> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const interactions = await database.userInteraction.findMany({
      where: {
        userId,
        timestamp: { gte: thirtyDaysAgo },
      },
      include: {
        product: {
          include: { farm: true },
        },
      },
    });

    // Calculate category affinities
    const categoryAffinities = new Map<string, number>();
    const farmAffinities = new Map<string, number>();
    const prices: number[] = [];
    const hours: number[] = [];
    const days: string[] = [];

    interactions.forEach((interaction) => {
      if (!interaction.product) return;

      const category = interaction.product.category;
      const farmId = interaction.product.farmId;

      // Weight by action type
      const weight =
        interaction.action === "PURCHASE"
          ? 5
          : interaction.action === "ADD_TO_CART"
          ? 3
          : interaction.action === "CLICK"
          ? 2
          : 1;

      categoryAffinities.set(
        category,
        (categoryAffinities.get(category) || 0) + weight
      );
      farmAffinities.set(farmId, (farmAffinities.get(farmId) || 0) + weight);

      // Track prices for purchases
      if (interaction.action === "PURCHASE" && interaction.metadata) {
        const metadata = interaction.metadata as any;
        if (metadata.price) {
          prices.push(metadata.price);
        }
      }

      // Track time patterns
      const hour = interaction.timestamp.getHours();
      const day = interaction.timestamp.toLocaleDateString("en-US", {
        weekday: "long",
      });
      hours.push(hour);
      days.push(day);
    });

    // Calculate price preferences
    const pricePreferences =
      prices.length > 0
        ? {
            min: Math.min(...prices),
            max: Math.max(...prices),
            average: prices.reduce((a, b) => a + b, 0) / prices.length,
          }
        : { min: 0, max: 0, average: 0 };

    // Calculate time preferences
    const hourCounts = new Map<number, number>();
    hours.forEach((h) => hourCounts.set(h, (hourCounts.get(h) || 0) + 1));
    const preferredHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    const dayCounts = new Map<string, number>();
    days.forEach((d) => dayCounts.set(d, (dayCounts.get(d) || 0) + 1));
    const preferredDays = Array.from(dayCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    // Calculate behavior metrics
    const views = interactions.filter((i) => i.action === "VIEW").length;
    const purchases = interactions.filter((i) => i.action === "PURCHASE").length;
    const conversionRate = views > 0 ? purchases / views : 0;

    // Get repeat purchase rate
    const uniqueProducts = new Set(
      interactions.filter((i) => i.action === "PURCHASE").map((i) => i.productId)
    );
    const repeatPurchaseRate =
      purchases > 0 ? (purchases - uniqueProducts.size) / purchases : 0;

    return {
      categoryAffinities,
      farmAffinities,
      pricePreferences,
      timePreferences: {
        preferredHours,
        preferredDays,
      },
      behaviorMetrics: {
        avgSessionDuration: 0, // Would need session tracking
        avgProductsViewed: views / 30, // Per day average
        conversionRate,
        repeatPurchaseRate,
      },
    };
  }

  /**
   * Calculate user's organic preference rate
   */
  private async calculateOrganicPreferenceRate(userId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [total, organic] = await Promise.all([
      database.userInteraction.count({
        where: {
          userId,
          timestamp: { gte: thirtyDaysAgo },
          action: { in: ["VIEW", "ADD_TO_CART", "PURCHASE"] },
        },
      }),
      database.userInteraction.count({
        where: {
          userId,
          timestamp: { gte: thirtyDaysAgo },
          action: { in: ["VIEW", "ADD_TO_CART", "PURCHASE"] },
          product: {
            certifications: { has: "ORGANIC" },
          },
        },
      }),
    ]);

    return total > 0 ? organic / total : 0;
  }

  /**
   * Calculate user's local preference rate
   */
  private async calculateLocalPreferenceRate(userId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [total, local] = await Promise.all([
      database.userInteraction.count({
        where: {
          userId,
          timestamp: { gte: thirtyDaysAgo },
          action: { in: ["VIEW", "ADD_TO_CART", "PURCHASE"] },
        },
      }),
      database.userInteraction.count({
        where: {
          userId,
          timestamp: { gte: thirtyDaysAgo },
          action: { in: ["VIEW", "ADD_TO_CART", "PURCHASE"] },
          product: {
            farm: { isLocal: true },
          },
        },
      }),
    ]);

    return total > 0 ? local / total : 0;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Batch calculate personalization scores for multiple entities
   */
  async batchCalculateScores(
    userId: string,
    entities: Array<{ type: string; id: string }>,
    season?: Season
  ): Promise<PersonalizationScore[]> {
    const scores = await Promise.all(
      entities.map((entity) =>
        this.calculatePersonalizationScore({
          userId,
          entityType: entity.type as "PRODUCT" | "FARM" | "CATEGORY",
          entityId: entity.id,
          season,
        })
      )
    );

    return scores;
  }

  /**
   * Recalculate all expired scores for a user
   */
  async recalculateExpiredScores(userId: string): Promise<number> {
    const expiredScores = await database.personalizationScore.findMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    });

    await Promise.all(
      expiredScores.map((score) =>
        this.calculatePersonalizationScore({
          userId: score.userId,
          entityType: score.entityType as "PRODUCT" | "FARM" | "CATEGORY",
          entityId: score.entityId,
          season: score.season,
        })
      )
    );

    return expiredScores.length;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUERY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get cached personalization score
   */
  private async getCachedScore(
    userId: string,
    entityType: string,
    entityId: string,
    season: Season
  ): Promise<PersonalizationScore | null> {
    return await database.personalizationScore.findUnique({
      where: {
        userId_entityType_entityId_season: {
          userId,
          entityType,
          entityId,
          season,
        },
      },
    });
  }

  /**
   * Get top personalized products for user
   */
  async getTopPersonalizedProducts(
    userId: string,
    limit = 20,
    season?: Season
  ): Promise<PersonalizationScore[]> {
    const currentSeason = season || this.getCurrentSeason();

    return await database.personalizationScore.findMany({
      where: {
        userId,
        entityType: "PRODUCT",
        season: currentSeason,
        expiresAt: { gt: new Date() },
      },
      orderBy: { totalScore: "desc" },
      take: limit,
    });
  }

  /**
   * Get personalization insights for user
   */
  async getUserPersonalizationInsights(userId: string) {
    const preferences = await database.userPreference.findUnique({
      where: { userId },
    });

    const profile = await this.buildUserProfile(userId);

    const topCategories = Array.from(profile.categoryAffinities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topFarms = Array.from(profile.farmAffinities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      preferences,
      categoryAffinities: Object.fromEntries(topCategories),
      farmAffinities: Object.fromEntries(topFarms),
      pricePreferences: profile.pricePreferences,
      timePreferences: profile.timePreferences,
      behaviorMetrics: profile.behaviorMetrics,
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
   * Get adjacent seasons for seasonal scoring
   */
  private getAdjacentSeasons(season: Season): Season[] {
    const seasonOrder: Season[] = ["SPRING", "SUMMER", "FALL", "WINTER"];
    const currentIndex = seasonOrder.indexOf(season);

    return [
      seasonOrder[(currentIndex - 1 + 4) % 4],
      seasonOrder[(currentIndex + 1) % 4],
    ];
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
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
   * Clean up expired personalization scores
   */
  async cleanupExpiredScores(): Promise<number> {
    const result = await database.personalizationScore.deleteMany({
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

export const personalizationService = PersonalizationService.getInstance();
