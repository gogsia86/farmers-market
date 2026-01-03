/**
 * User Interaction Tracking Service
 *
 * Tracks all user interactions across the platform including views, clicks,
 * add to cart, purchases, favorites, reviews, and shares.
 *
 * ✅ NOTE: TypeScript checking re-enabled - fixed and validated
 *
 * @module UserInteractionService
 * @category Analytics
 */

import { database } from "@/lib/database";
import { InteractionType, Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface TrackInteractionInput {
  userId?: string;
  sessionId?: string;
  type: InteractionType;
  entityType: string;
  entityId: string;
  source?: string;
  metadata?: Record<string, any>;
  value?: number;
}

export interface InteractionFilters {
  userId?: string;
  sessionId?: string;
  type?: InteractionType;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  source?: string;
}

export interface InteractionStats {
  totalInteractions: number;
  uniqueUsers: number;
  uniqueSessions: number;
  byType: Record<InteractionType, number>;
  byEntityType: Record<string, number>;
  topProducts: Array<{
    productId: string;
    interactions: number;
    types: string[];
  }>;
  topFarms: Array<{ farmId: string; interactions: number; types: string[] }>;
  conversionFunnel: {
    views: number;
    clicks: number;
    addToCart: number;
    purchases: number;
    viewToClick: number;
    clickToCart: number;
    cartToPurchase: number;
    viewToPurchase: number;
  };
}

export interface UserBehaviorProfile {
  userId: string;
  totalInteractions: number;
  favoriteCategories: string[];
  favoriteFarms: string[];
  averageSessionDuration: number;
  preferredTimeOfDay: number;
  purchaseFrequency: number;
  averageOrderValue: number;
  engagementScore: number;
}

export interface PopularProduct {
  productId: string;
  views: number;
  clicks: number;
  addToCart: number;
  purchases: number;
  favorites: number;
  reviews: number;
  shares: number;
  conversionRate: number;
  popularityScore: number;
}

// ============================================================================
// User Interaction Service
// ============================================================================

export class UserInteractionService {
  /**
   * Track a user interaction
   */
  static async track(input: TrackInteractionInput) {
    const sessionId = input.sessionId || nanoid();

    const interaction = await database.userInteraction.create({
      data: {
        userId: input.userId,
        sessionId,
        type: input.type,
        entityType: input.entityType,
        entityId: input.entityId,
        source: input.source || "web",
        metadata: input.metadata || {},
        value: input.value ? new Prisma.Decimal(input.value) : null,
        timestamp: new Date(),
      },
    });

    return {
      interactionId: interaction.id,
      sessionId,
    };
  }

  /**
   * Track product view
   */
  static async trackView(
    productId: string,
    userId?: string,
    sessionId?: string,
    metadata?: Record<string, any>,
  ) {
    return this.track({
      userId,
      sessionId,
      type: InteractionType.VIEW,
      entityType: "product",
      entityId: productId,
      source: "product_page",
      metadata,
    });
  }

  /**
   * Track product click
   */
  static async trackClick(
    productId: string,
    userId?: string,
    sessionId?: string,
    source?: string,
    metadata?: Record<string, any>,
  ) {
    return this.track({
      userId,
      sessionId,
      type: InteractionType.CLICK,
      entityType: "product",
      entityId: productId,
      source: source || "product_grid",
      metadata,
    });
  }

  /**
   * Track add to cart
   */
  static async trackAddToCart(
    productId: string,
    quantity: number,
    price: number,
    userId?: string,
    sessionId?: string,
    metadata?: Record<string, any>,
  ) {
    return this.track({
      userId,
      sessionId,
      type: InteractionType.ADD_TO_CART,
      entityType: "product",
      entityId: productId,
      value: price * quantity,
      metadata: {
        ...metadata,
        quantity,
        price,
      },
    });
  }

  /**
   * Track purchase
   */
  static async trackPurchase(
    orderId: string,
    productId: string,
    quantity: number,
    price: number,
    userId?: string,
    sessionId?: string,
    metadata?: Record<string, any>,
  ) {
    return this.track({
      userId,
      sessionId,
      type: InteractionType.PURCHASE,
      entityType: "product",
      entityId: productId,
      value: price * quantity,
      metadata: {
        ...metadata,
        orderId,
        quantity,
        price,
      },
    });
  }

  /**
   * Track favorite
   */
  static async trackFavorite(
    productId: string,
    userId: string,
    sessionId?: string,
  ) {
    return this.track({
      userId,
      sessionId,
      type: InteractionType.FAVORITE,
      entityType: "product",
      entityId: productId,
      source: "favorite_button",
    });
  }

  /**
   * Track review
   */
  static async trackReview(
    productId: string,
    rating: number,
    userId: string,
    sessionId?: string,
    metadata?: Record<string, any>,
  ) {
    return this.track({
      userId,
      sessionId,
      type: InteractionType.REVIEW,
      entityType: "product",
      entityId: productId,
      value: rating,
      metadata,
    });
  }

  /**
   * Track share
   */
  static async trackShare(
    productId: string,
    platform: string,
    userId?: string,
    sessionId?: string,
  ) {
    return this.track({
      userId,
      sessionId,
      type: InteractionType.SHARE,
      entityType: "product",
      entityId: productId,
      source: platform,
    });
  }

  /**
   * Get interactions with filters
   */
  static async getInteractions(
    filters: InteractionFilters,
    limit = 100,
    offset = 0,
  ) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.sessionId) where.sessionId = filters.sessionId;
    if (filters.type) where.type = filters.type;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.source) where.source = filters.source;

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const [interactions, total] = await Promise.all([
      database.userInteraction.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: limit,
        skip: offset,
      }),
      database.userInteraction.count({ where }),
    ]);

    return {
      interactions,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Get interaction statistics
   */
  static async getStats(
    filters: InteractionFilters,
  ): Promise<InteractionStats> {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const interactions = await database.userInteraction.findMany({
      where,
      select: {
        userId: true,
        sessionId: true,
        type: true,
        entityType: true,
        entityId: true,
      },
    });

    const totalInteractions = interactions.length;
    const uniqueUsers = new Set(
      interactions.filter((i) => i.userId).map((i) => i.userId),
    ).size;
    const uniqueSessions = new Set(interactions.map((i) => i.sessionId)).size;

    // By type
    const byType: Record<InteractionType, number> = {
      [InteractionType.SEARCH]: 0,
      [InteractionType.VIEW]: 0,
      [InteractionType.CLICK]: 0,
      [InteractionType.ADD_TO_CART]: 0,
      [InteractionType.PURCHASE]: 0,
      [InteractionType.FAVORITE]: 0,
      [InteractionType.REVIEW]: 0,
      [InteractionType.SHARE]: 0,
    };
    interactions.forEach((i) => {
      byType[i.type]++;
    });

    // By entity type
    const byEntityType: Record<string, number> = {};
    interactions.forEach((i) => {
      byEntityType[i.entityType] = (byEntityType[i.entityType] || 0) + 1;
    });

    // Top products
    const productInteractions = new Map<
      string,
      { count: number; types: Set<string> }
    >();
    interactions
      .filter((i) => i.entityType === "product")
      .forEach((i) => {
        const existing = productInteractions.get(i.entityId) || {
          count: 0,
          types: new Set(),
        };
        existing.count++;
        existing.types.add(i.type);
        productInteractions.set(i.entityId, existing);
      });

    const topProducts = Array.from(productInteractions.entries())
      .map(([productId, data]) => ({
        productId,
        interactions: data.count,
        types: Array.from(data.types),
      }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 10);

    // Top farms
    const farmInteractions = new Map<
      string,
      { count: number; types: Set<string> }
    >();
    interactions
      .filter((i) => i.entityType === "farm")
      .forEach((i) => {
        const existing = farmInteractions.get(i.entityId) || {
          count: 0,
          types: new Set(),
        };
        existing.count++;
        existing.types.add(i.type);
        farmInteractions.set(i.entityId, existing);
      });

    const topFarms = Array.from(farmInteractions.entries())
      .map(([farmId, data]) => ({
        farmId,
        interactions: data.count,
        types: Array.from(data.types),
      }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 10);

    // Conversion funnel
    const views = byType[InteractionType.VIEW];
    const clicks = byType[InteractionType.CLICK];
    const addToCart = byType[InteractionType.ADD_TO_CART];
    const purchases = byType[InteractionType.PURCHASE];

    const conversionFunnel = {
      views,
      clicks,
      addToCart,
      purchases,
      viewToClick: views > 0 ? (clicks / views) * 100 : 0,
      clickToCart: clicks > 0 ? (addToCart / clicks) * 100 : 0,
      cartToPurchase: addToCart > 0 ? (purchases / addToCart) * 100 : 0,
      viewToPurchase: views > 0 ? (purchases / views) * 100 : 0,
    };

    return {
      totalInteractions,
      uniqueUsers,
      uniqueSessions,
      byType,
      byEntityType,
      topProducts,
      topFarms,
      conversionFunnel,
    };
  }

  /**
   * Get user behavior profile
   */
  static async getUserProfile(
    userId: string,
    lookbackDays = 90,
  ): Promise<UserBehaviorProfile> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);

    const interactions = await database.userInteraction.findMany({
      where: {
        userId,
        timestamp: { gte: startDate },
      },
      select: {
        type: true,
        entityType: true,
        entityId: true,
        sessionId: true,
        timestamp: true,
        value: true,
        metadata: true,
      },
      orderBy: { timestamp: "asc" },
    });

    const totalInteractions = interactions.length;

    // Extract categories and farms from metadata
    const categories = new Set<string>();
    const farms = new Set<string>();

    interactions.forEach((i) => {
      const metadata = i.metadata as any;
      if (metadata?.category) categories.add(metadata.category);
      if (metadata?.farmId) farms.add(metadata.farmId);
      if (i.entityType === "farm") farms.add(i.entityId);
    });

    // Calculate session duration
    const sessions = new Map<string, { start: Date; end: Date }>();
    interactions.forEach((i) => {
      const existing = sessions.get(i.sessionId);
      if (!existing) {
        sessions.set(i.sessionId, { start: i.timestamp, end: i.timestamp });
      } else {
        existing.end = i.timestamp;
      }
    });

    let totalSessionDuration = 0;
    sessions.forEach((session) => {
      totalSessionDuration += session.end.getTime() - session.start.getTime();
    });
    const averageSessionDuration =
      sessions.size > 0
        ? Math.round(totalSessionDuration / sessions.size / 1000)
        : 0;

    // Preferred time of day (hour with most interactions)
    const hourCounts = new Map<number, number>();
    interactions.forEach((i) => {
      const hour = i.timestamp.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    let preferredTimeOfDay = 12;
    let maxCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        preferredTimeOfDay = hour;
      }
    });

    // Purchase frequency and average order value
    const purchases = interactions.filter(
      (i) => i.type === InteractionType.PURCHASE,
    );
    const purchaseFrequency = purchases.length / lookbackDays;

    let totalOrderValue = 0;
    purchases.forEach((p) => {
      if (p.value) {
        totalOrderValue += parseFloat(p.value.toString());
      }
    });
    const averageOrderValue =
      purchases.length > 0 ? totalOrderValue / purchases.length : 0;

    // Engagement score (0-100)
    const viewScore = Math.min(
      (interactions.filter((i) => i.type === InteractionType.VIEW).length /
        100) *
      20,
      20,
    );
    const clickScore = Math.min(
      (interactions.filter((i) => i.type === InteractionType.CLICK).length /
        50) *
      20,
      20,
    );
    const cartScore = Math.min(
      (interactions.filter((i) => i.type === InteractionType.ADD_TO_CART)
        .length /
        20) *
      20,
      20,
    );
    const purchaseScore = Math.min((purchases.length / 5) * 20, 20);
    const socialScore = Math.min(
      (interactions.filter(
        (i) =>
          i.type === InteractionType.FAVORITE ||
          i.type === InteractionType.REVIEW ||
          i.type === InteractionType.SHARE,
      ).length /
        10) *
      20,
      20,
    );

    const engagementScore = Math.round(
      viewScore + clickScore + cartScore + purchaseScore + socialScore,
    );

    return {
      userId,
      totalInteractions,
      favoriteCategories: Array.from(categories).slice(0, 5),
      favoriteFarms: Array.from(farms).slice(0, 5),
      averageSessionDuration,
      preferredTimeOfDay,
      purchaseFrequency: Math.round(purchaseFrequency * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      engagementScore,
    };
  }

  /**
   * Get popular products with detailed metrics
   */
  static async getPopularProducts(
    startDate: Date,
    endDate: Date,
    limit = 20,
  ): Promise<PopularProduct[]> {
    const interactions = await database.userInteraction.findMany({
      where: {
        timestamp: { gte: startDate, lte: endDate },
        entityType: "product",
      },
      select: {
        entityId: true,
        type: true,
      },
    });

    const productMetrics = new Map<
      string,
      {
        views: number;
        clicks: number;
        addToCart: number;
        purchases: number;
        favorites: number;
        reviews: number;
        shares: number;
      }
    >();

    interactions.forEach((i) => {
      const existing = productMetrics.get(i.entityId) || {
        views: 0,
        clicks: 0,
        addToCart: 0,
        purchases: 0,
        favorites: 0,
        reviews: 0,
        shares: 0,
      };

      if (i.type === InteractionType.VIEW) existing.views++;
      if (i.type === InteractionType.CLICK) existing.clicks++;
      if (i.type === InteractionType.ADD_TO_CART) existing.addToCart++;
      if (i.type === InteractionType.PURCHASE) existing.purchases++;
      if (i.type === InteractionType.FAVORITE) existing.favorites++;
      if (i.type === InteractionType.REVIEW) existing.reviews++;
      if (i.type === InteractionType.SHARE) existing.shares++;

      productMetrics.set(i.entityId, existing);
    });

    const products: PopularProduct[] = [];

    productMetrics.forEach((metrics, productId) => {
      const conversionRate =
        metrics.views > 0 ? (metrics.purchases / metrics.views) * 100 : 0;

      // Calculate popularity score (weighted algorithm)
      const popularityScore =
        metrics.views * 1 +
        metrics.clicks * 2 +
        metrics.addToCart * 5 +
        metrics.purchases * 10 +
        metrics.favorites * 3 +
        metrics.reviews * 4 +
        metrics.shares * 6;

      products.push({
        productId,
        ...metrics,
        conversionRate: Math.round(conversionRate * 100) / 100,
        popularityScore,
      });
    });

    return products
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, limit);
  }

  /**
   * Get session timeline (all interactions in a session)
   */
  static async getSessionTimeline(sessionId: string) {
    const interactions = await database.userInteraction.findMany({
      where: { sessionId },
      orderBy: { timestamp: "asc" },
      select: {
        id: true,
        type: true,
        entityType: true,
        entityId: true,
        source: true,
        metadata: true,
        timestamp: true,
      },
    });

    if (interactions.length === 0) {
      return null;
    }

    const startTime = interactions[0]?.timestamp;
    const endTime = interactions[interactions.length - 1]?.timestamp;

    if (!startTime || !endTime) {
      return null;
    }
    const duration = (endTime.getTime() - startTime.getTime()) / 1000; // seconds

    return {
      sessionId,
      startTime,
      endTime,
      duration,
      interactionCount: interactions.length,
      interactions,
    };
  }

  /**
   * Delete old interactions (data retention)
   */
  static async deleteOldInteractions(daysToKeep = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await database.userInteraction.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  /**
   * Get cohort analysis (users by signup date)
   */
  static async getCohortAnalysis(
    cohortStartDate: Date,
    cohortEndDate: Date,
    analysisPeriodDays = 30,
  ) {
    // This would require joining with user creation dates
    // Simplified version tracking interaction retention

    const firstInteractions = await database.userInteraction.groupBy({
      by: ["userId"],
      where: {
        userId: { not: null },
        timestamp: {
          gte: cohortStartDate,
          lte: cohortEndDate,
        },
      },
      _min: {
        timestamp: true,
      },
    });

    const cohortUsers = firstInteractions.map((f) => f.userId as string);

    const periods = [];
    for (let day = 0; day <= analysisPeriodDays; day += 7) {
      const periodStart = new Date(cohortStartDate);
      periodStart.setDate(periodStart.getDate() + day);

      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 7);

      const activeUsers = await database.userInteraction.findMany({
        where: {
          userId: { in: cohortUsers },
          timestamp: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
        select: {
          userId: true,
        },
        distinct: ["userId"],
      });

      periods.push({
        week: Math.floor(day / 7),
        activeUsers: activeUsers.length,
        retentionRate:
          cohortUsers.length > 0
            ? (activeUsers.length / cohortUsers.length) * 100
            : 0,
      });
    }

    return {
      cohortSize: cohortUsers.length,
      cohortStartDate,
      cohortEndDate,
      periods,
    };
  }
}
