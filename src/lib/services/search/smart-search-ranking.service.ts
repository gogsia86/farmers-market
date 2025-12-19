/**
 * 🔍 SMART SEARCH RANKING SERVICE
 * Divine search personalization with agricultural consciousness
 *
 * Features:
 * - Hybrid scoring (relevance + personalization + seasonal + popularity)
 * - Real-time score calculation
 * - A/B testing integration
 * - Performance optimization (<100ms)
 * - Agricultural consciousness
 *
 * @module SmartSearchRankingService
 */

import { database } from "@/lib/database";
import { PersonalizationService } from "@/lib/services/analytics/personalization.service";
import { ABTestingService } from "@/lib/services/analytics/ab-testing.service";
import { Redis } from "@upstash/redis";
import type { Product, User, Farm } from "@prisma/client";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SearchRankingRequest {
  query: string;
  userId?: string;
  filters?: SearchFilters;
  algorithm?: RankingAlgorithm;
  limit?: number;
  offset?: number;
  experimentId?: string;
}

export interface SearchFilters {
  categories?: string[];
  farms?: string[];
  priceRange?: { min: number; max: number };
  inStock?: boolean;
  organic?: boolean;
  local?: boolean;
  seasonal?: boolean;
  location?: { lat: number; lng: number; radius?: number };
}

export interface RankedSearchResult {
  product: ProductWithRelations;
  scores: SearchScores;
  finalScore: number;
  rank: number;
  algorithm: RankingAlgorithm;
  personalized: boolean;
}

export interface SearchScores {
  baseRelevance: number; // 0-1: Text match quality
  personalization: number; // 0-1: User preference match
  recency: number; // 0-1: How fresh is the listing
  popularity: number; // 0-1: Social proof
  seasonal: number; // 0-1: Agricultural timing
  proximity: number; // 0-1: Location relevance
  quality: number; // 0-1: Product quality score
}

export interface SearchScoreWeights {
  baseRelevance: number;
  personalization: number;
  recency: number;
  popularity: number;
  seasonal: number;
  proximity: number;
  quality: number;
}

export type RankingAlgorithm =
  | "HYBRID" // Balanced mix of all factors
  | "RELEVANCE" // Pure text relevance
  | "PERSONALIZED" // User preferences dominant
  | "POPULAR" // Social proof dominant
  | "SEASONAL" // Agricultural timing dominant
  | "NEARBY" // Location-based
  | "EXPERIMENTAL"; // A/B test variant

export interface ProductWithRelations extends Omit<Product, "category"> {
  farm: Farm;
  category: {
    id: string;
    name: string;
  };
  _count?: {
    reviews: number;
    orderItems: number;
    favorites: number;
  };
  avgRating?: number;
}

export interface SearchPerformanceMetrics {
  totalResults: number;
  executionTime: number;
  cacheHit: boolean;
  algorithm: RankingAlgorithm;
  personalized: boolean;
  userId?: string;
}

// ============================================================================
// ALGORITHM WEIGHTS
// ============================================================================

const ALGORITHM_WEIGHTS: Record<RankingAlgorithm, SearchScoreWeights> = {
  HYBRID: {
    baseRelevance: 0.35,
    personalization: 0.25,
    recency: 0.1,
    popularity: 0.1,
    seasonal: 0.1,
    proximity: 0.05,
    quality: 0.05,
  },
  RELEVANCE: {
    baseRelevance: 0.8,
    personalization: 0.0,
    recency: 0.1,
    popularity: 0.05,
    seasonal: 0.0,
    proximity: 0.0,
    quality: 0.05,
  },
  PERSONALIZED: {
    baseRelevance: 0.2,
    personalization: 0.5,
    recency: 0.1,
    popularity: 0.05,
    seasonal: 0.1,
    proximity: 0.05,
    quality: 0.0,
  },
  POPULAR: {
    baseRelevance: 0.3,
    personalization: 0.0,
    recency: 0.05,
    popularity: 0.5,
    seasonal: 0.05,
    proximity: 0.05,
    quality: 0.05,
  },
  SEASONAL: {
    baseRelevance: 0.25,
    personalization: 0.15,
    recency: 0.1,
    popularity: 0.05,
    seasonal: 0.4,
    proximity: 0.0,
    quality: 0.05,
  },
  NEARBY: {
    baseRelevance: 0.25,
    personalization: 0.15,
    recency: 0.1,
    popularity: 0.05,
    seasonal: 0.05,
    proximity: 0.35,
    quality: 0.05,
  },
  EXPERIMENTAL: {
    baseRelevance: 0.3,
    personalization: 0.3,
    recency: 0.1,
    popularity: 0.1,
    seasonal: 0.1,
    proximity: 0.05,
    quality: 0.05,
  },
};

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class SmartSearchRankingService {
  private personalizationService: PersonalizationService;
  private abTestingService: ABTestingService;
  private redis?: Redis;
  private cacheEnabled: boolean = true;
  private cacheTTL: number = 300; // 5 minutes

  constructor() {
    this.personalizationService = PersonalizationService.getInstance();
    this.abTestingService = ABTestingService.getInstance();

    // Initialize Redis if available
    if (process.env.REDIS_URL) {
      this.redis = new Redis({
        url: process.env.REDIS_URL,
        token: process.env.REDIS_TOKEN || "",
      });
    }
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Rank search results with personalization
   */
  async rankSearchResults(request: SearchRankingRequest): Promise<{
    results: RankedSearchResult[];
    metrics: SearchPerformanceMetrics;
  }> {
    const startTime = Date.now();

    try {
      // 1. Determine algorithm (with A/B testing)
      const algorithm = await this.determineAlgorithm(request);

      // 2. Get base search results
      const baseResults = await this.getBaseSearchResults(request);

      if (baseResults.length === 0) {
        return {
          results: [],
          metrics: this.createMetrics(startTime, 0, false, algorithm, false),
        };
      }

      // 3. Calculate scores for each result
      const scoredResults = await this.scoreResults(
        baseResults,
        request,
        algorithm,
      );

      // 4. Sort by final score
      const rankedResults = this.sortByScore(scoredResults);

      // 5. Apply pagination
      const paginatedResults = this.paginate(
        rankedResults,
        request.limit || 20,
        request.offset || 0,
      );

      // 6. Track performance
      await this.trackSearchPerformance(request, paginatedResults, algorithm);

      const executionTime = Date.now() - startTime;

      return {
        results: paginatedResults,
        metrics: this.createMetrics(
          startTime,
          rankedResults.length,
          false,
          algorithm,
          !!request.userId,
        ),
      };
    } catch (error) {
      console.error("❌ Smart search ranking failed:", error);
      throw error;
    }
  }

  /**
   * Calculate personalization score for a product
   */
  async calculatePersonalizedScore(
    userId: string,
    productId: string,
  ): Promise<number> {
    try {
      const score =
        await this.personalizationService.calculatePersonalizationScore({
          userId,
          entityType: "PRODUCT",
          entityId: productId,
        });

      return score.totalScore;
    } catch (error) {
      console.warn("⚠️ Personalization score failed, using default:", error);
      return 0.5; // Neutral score
    }
  }

  /**
   * Batch calculate personalization scores
   */
  async calculatePersonalizedScoresBatch(
    userId: string,
    productIds: string[],
  ): Promise<Record<string, number>> {
    const cacheKey = `personalization:batch:${userId}:${productIds.sort().join(",")}`;

    // Check cache
    if (this.cacheEnabled && this.redis) {
      try {
        const cached = await this.redis.get<Record<string, number>>(cacheKey);
        if (cached) {
          return cached;
        }
      } catch (error) {
        console.warn("⚠️ Cache read failed:", error);
      }
    }

    // Calculate scores in parallel
    const scores = await Promise.all(
      productIds.map(async (productId) => {
        const score = await this.calculatePersonalizedScore(userId, productId);
        return { productId, score };
      }),
    );

    const scoreMap = scores.reduce(
      (acc, { productId, score }) => {
        acc[productId] = score;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Cache results
    if (this.cacheEnabled && this.redis) {
      try {
        await this.redis.set(cacheKey, scoreMap, { ex: this.cacheTTL });
      } catch (error) {
        console.warn("⚠️ Cache write failed:", error);
      }
    }

    return scoreMap;
  }

  /**
   * Get algorithm configuration for A/B testing
   */
  async getAlgorithmConfig(
    userId?: string,
    experimentId?: string,
  ): Promise<{
    algorithm: RankingAlgorithm;
    weights: SearchScoreWeights;
    variant?: string;
  }> {
    if (!experimentId || !userId) {
      return {
        algorithm: "HYBRID",
        weights: ALGORITHM_WEIGHTS.HYBRID,
      };
    }

    try {
      const assignment = await this.abTestingService.assignVariant({
        testId: experimentId,
        userId,
      });

      const algorithm =
        (assignment.toUpperCase() as RankingAlgorithm) || "HYBRID";

      return {
        algorithm,
        weights: ALGORITHM_WEIGHTS[algorithm] || ALGORITHM_WEIGHTS.HYBRID,
        variant: assignment,
      };
    } catch (error) {
      console.warn("⚠️ A/B test assignment failed:", error);
      return {
        algorithm: "HYBRID",
        weights: ALGORITHM_WEIGHTS.HYBRID,
      };
    }
  }

  // ==========================================================================
  // CORE RANKING LOGIC
  // ==========================================================================

  /**
   * Score all search results
   */
  private async scoreResults(
    products: ProductWithRelations[],
    request: SearchRankingRequest,
    algorithm: RankingAlgorithm,
  ): Promise<RankedSearchResult[]> {
    const weights = ALGORITHM_WEIGHTS[algorithm];
    const userId = request.userId;

    // Batch get personalization scores if user is logged in
    let personalizationScores: Record<string, number> = {};
    if (userId && weights.personalization > 0) {
      const productIds = products.map((p) => p.id);
      personalizationScores = await this.calculatePersonalizedScoresBatch(
        userId,
        productIds,
      );
    }

    // Score each product
    const scoredResults = await Promise.all(
      products.map(async (product) => {
        const scores = await this.calculateIndividualScores(
          product,
          request,
          personalizationScores[product.id] || 0,
        );

        const finalScore = this.calculateFinalScore(scores, weights);

        return {
          product,
          scores,
          finalScore,
          rank: 0, // Will be set after sorting
          algorithm,
          personalized: !!userId,
        };
      }),
    );

    return scoredResults;
  }

  /**
   * Calculate individual score components
   */
  private async calculateIndividualScores(
    product: ProductWithRelations,
    request: SearchRankingRequest,
    personalizationScore: number,
  ): Promise<SearchScores> {
    return {
      baseRelevance: this.calculateRelevanceScore(product, request.query),
      personalization: personalizationScore,
      recency: this.calculateRecencyScore(product),
      popularity: this.calculatePopularityScore(product),
      seasonal: this.calculateSeasonalScore(product),
      proximity: this.calculateProximityScore(
        product,
        request.filters?.location,
      ),
      quality: this.calculateQualityScore(product),
    };
  }

  /**
   * Calculate text relevance score (0-1)
   */
  private calculateRelevanceScore(
    product: ProductWithRelations,
    query: string,
  ): number {
    const searchTerms = query.toLowerCase().split(/\s+/);
    const productText = [
      product.name,
      product.description || "",
      product.category?.name || "",
      product.farm?.name || "",
    ]
      .join(" ")
      .toLowerCase();

    let matchScore = 0;
    const totalTerms = searchTerms.length;

    searchTerms.forEach((term) => {
      if (productText.includes(term)) {
        // Exact match in name = highest score
        if (product.name.toLowerCase().includes(term)) {
          matchScore += 1.0;
        }
        // Match in description = medium score
        else if (product.description?.toLowerCase().includes(term)) {
          matchScore += 0.6;
        }
        // Match in category/farm = lower score
        else {
          matchScore += 0.3;
        }
      }
    });

    return Math.min(matchScore / totalTerms, 1.0);
  }

  /**
   * Calculate recency score (0-1)
   */
  private calculateRecencyScore(product: ProductWithRelations): number {
    const now = Date.now();
    const createdAt = new Date(product.createdAt).getTime();
    const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

    // Products lose 1% per day, minimum 0.5
    const recencyScore = Math.max(1 - ageInDays * 0.01, 0.5);

    return recencyScore;
  }

  /**
   * Calculate popularity score (0-1)
   */
  private calculatePopularityScore(product: ProductWithRelations): number {
    const reviews = product._count?.reviews || 0;
    const orders = product._count?.orderItems || 0;
    const favorites = product._count?.favorites || 0;
    const rating = product.avgRating || 0;

    // Weighted popularity score
    const popularityScore =
      (reviews * 0.2 + orders * 0.4 + favorites * 0.2 + rating * 0.2) / 10;

    return Math.min(popularityScore, 1.0);
  }

  /**
   * Calculate seasonal score (0-1)
   */
  private calculateSeasonalScore(product: ProductWithRelations): number {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12

    // Get seasonal data from product
    const seasonality = (product.seasonality as any as number[]) || [];

    if (seasonality.length === 0) {
      return 0.5; // Neutral if no seasonal data
    }

    // Check if current month is in season
    const inSeason = seasonality.includes(currentMonth);

    if (inSeason) {
      return 1.0; // Perfect match
    }

    // Check if close to season (within 1 month)
    const closestMonth = seasonality.reduce(
      (closest, month) => {
        const distance = Math.min(
          Math.abs(month - currentMonth),
          Math.abs(month - currentMonth + 12),
          Math.abs(month - currentMonth - 12),
        );
        return distance < closest.distance ? { month, distance } : closest;
      },
      { month: seasonality[0], distance: Infinity },
    );

    if (closestMonth.distance === 1) {
      return 0.7; // Close to season
    }

    return 0.3; // Out of season
  }

  /**
   * Calculate proximity score (0-1)
   */
  private calculateProximityScore(
    product: ProductWithRelations,
    userLocation?: { lat: number; lng: number; radius?: number },
  ): number {
    if (!userLocation || !product.farm) {
      return 0.5; // Neutral if no location data
    }

    const farmLocation = product.farm.location as any;
    if (!farmLocation?.coordinates) {
      return 0.5;
    }

    const distance = this.calculateDistance(
      userLocation.lat,
      userLocation.lng,
      farmLocation.coordinates.lat,
      farmLocation.coordinates.lng,
    );

    const radius = userLocation.radius || 50; // Default 50km

    if (distance <= radius) {
      // Linear decay: 1.0 at 0km, 0.0 at radius
      return Math.max(1 - distance / radius, 0);
    }

    return 0; // Beyond radius
  }

  /**
   * Calculate quality score (0-1)
   */
  private calculateQualityScore(product: ProductWithRelations): number {
    const rating = product.avgRating || 0;
    const reviews = product._count?.reviews || 0;

    // Quality = rating weighted by review count
    const reviewWeight = Math.min(reviews / 20, 1.0); // Max weight at 20 reviews
    const qualityScore = (rating / 5) * reviewWeight;

    return qualityScore;
  }

  /**
   * Calculate final weighted score
   */
  private calculateFinalScore(
    scores: SearchScores,
    weights: SearchScoreWeights,
  ): number {
    const finalScore =
      scores.baseRelevance * weights.baseRelevance +
      scores.personalization * weights.personalization +
      scores.recency * weights.recency +
      scores.popularity * weights.popularity +
      scores.seasonal * weights.seasonal +
      scores.proximity * weights.proximity +
      scores.quality * weights.quality;

    return finalScore;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Determine which algorithm to use
   */
  private async determineAlgorithm(
    request: SearchRankingRequest,
  ): Promise<RankingAlgorithm> {
    // Explicit algorithm specified
    if (request.algorithm) {
      return request.algorithm;
    }

    // A/B test experiment
    if (request.experimentId && request.userId) {
      const config = await this.getAlgorithmConfig(
        request.userId,
        request.experimentId,
      );
      return config.algorithm;
    }

    // Default to HYBRID
    return "HYBRID";
  }

  /**
   * Get base search results from database
   */
  private async getBaseSearchResults(
    request: SearchRankingRequest,
  ): Promise<ProductWithRelations[]> {
    const { query, filters } = request;

    const whereClause: any = {
      status: "ACTIVE",
      AND: [
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    };

    // Apply filters
    if (filters?.categories?.length) {
      whereClause.AND.push({ categoryId: { in: filters.categories } });
    }

    if (filters?.farms?.length) {
      whereClause.AND.push({ farmId: { in: filters.farms } });
    }

    if (filters?.priceRange) {
      whereClause.AND.push({
        price: {
          gte: filters.priceRange.min,
          lte: filters.priceRange.max,
        },
      });
    }

    if (filters?.inStock) {
      whereClause.AND.push({ stock: { gt: 0 } });
    }

    if (filters?.organic) {
      whereClause.certifications = { has: "ORGANIC" };
    }

    const products = await database.product.findMany({
      where: whereClause,
      include: {
        farm: true,
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          },
        },
      },
      take: 100, // Get top 100 for ranking
    });

    // Manually add category data
    const productsWithCategory = products.map((p) => ({
      ...p,
      category: {
        id: (p.category as string) || "",
        name: (p.category as string) || "",
      },
    }));

    return productsWithCategory as unknown as ProductWithRelations[];
  }

  /**
   * Sort results by score
   */
  private sortByScore(results: RankedSearchResult[]): RankedSearchResult[] {
    const sorted = results.sort((a, b) => b.finalScore - a.finalScore);

    // Assign ranks
    sorted.forEach((result, index) => {
      result.rank = index + 1;
    });

    return sorted;
  }

  /**
   * Apply pagination
   */
  private paginate(
    results: RankedSearchResult[],
    limit: number,
    offset: number,
  ): RankedSearchResult[] {
    return results.slice(offset, offset + limit);
  }

  /**
   * Track search performance
   */
  private async trackSearchPerformance(
    request: SearchRankingRequest,
    results: RankedSearchResult[],
    algorithm: RankingAlgorithm,
  ): Promise<void> {
    try {
      // Track in database for analytics (if SearchPerformance model exists)
      if (request.userId) {
        // Note: SearchPerformance model needs to be added to schema
        // await database.searchPerformance.create({
        //   data: {
        //     userId: request.userId,
        //     query: request.query,
        //     algorithm,
        //     resultsCount: results.length,
        //     personalized: !!request.userId,
        //     executionTime: 0,
        //   },
        // });
        console.log("📊 Search performance tracking:", {
          userId: request.userId,
          query: request.query,
          algorithm,
          resultsCount: results.length,
        });
      }
    } catch (error) {
      console.warn("⚠️ Failed to track search performance:", error);
    }
  }

  /**
   * Create performance metrics
   */
  private createMetrics(
    startTime: number,
    totalResults: number,
    cacheHit: boolean,
    algorithm: RankingAlgorithm,
    personalized: boolean,
  ): SearchPerformanceMetrics {
    return {
      totalResults,
      executionTime: Date.now() - startTime,
      cacheHit,
      algorithm,
      personalized,
    };
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // ==========================================================================
  // CACHE MANAGEMENT
  // ==========================================================================

  /**
   * Clear search cache for a user
   */
  async clearUserCache(userId: string): Promise<void> {
    if (!this.redis) return;

    try {
      const pattern = `personalization:batch:${userId}:*`;
      // Note: Redis SCAN command would be needed for production
      console.log(`🗑️ Clearing cache for user ${userId}`);
    } catch (error) {
      console.warn("⚠️ Failed to clear user cache:", error);
    }
  }

  /**
   * Warm up cache for popular searches
   */
  async warmupCache(queries: string[]): Promise<void> {
    console.log(`🔥 Warming up cache for ${queries.length} queries`);
    // Implementation would pre-calculate and cache popular searches
  }
}

// ============================================================================
// EXPORT SINGLETON (Lazy-loaded to avoid build-time initialization)
// ============================================================================

let smartSearchRankingServiceInstance: SmartSearchRankingService | null = null;

function getSmartSearchRankingService(): SmartSearchRankingService {
  if (!smartSearchRankingServiceInstance) {
    smartSearchRankingServiceInstance = new SmartSearchRankingService();
  }
  return smartSearchRankingServiceInstance;
}

export const smartSearchRankingService = {
  // Proxy all methods to the lazy-loaded singleton instance
  async rankSearchResults(request: SearchRankingRequest) {
    return getSmartSearchRankingService().rankSearchResults(request);
  },

  async calculatePersonalizedScore(userId: string, productId: string) {
    return getSmartSearchRankingService().calculatePersonalizedScore(
      userId,
      productId,
    );
  },

  async calculatePersonalizedScoresBatch(userId: string, productIds: string[]) {
    return getSmartSearchRankingService().calculatePersonalizedScoresBatch(
      userId,
      productIds,
    );
  },
};
