/**
 * Search Event Tracking Service
 *
 * Tracks all search events with agricultural consciousness and performance metrics.
 * Provides analytics on search behavior, popular queries, and seasonal trends.
 *
 * @module SearchEventService
 * @category Analytics
 */

import { database } from '@/lib/database';
import { Season, InteractionType } from '@prisma/client';
import { nanoid } from 'nanoid';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface TrackSearchEventInput {
  userId?: string;
  sessionId?: string;
  query?: string;
  filters: Record<string, any>;
  sortBy?: string;
  resultsCount: number;
  resultsShown: number;
  responseTime: number;
  source?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    region?: string;
  };
  userAgent?: string;
  currentSeason?: Season;
  lunarPhase?: string;
  abTestVariant?: string;
}

export interface TrackClickInput {
  searchEventId?: string;
  userId?: string;
  sessionId: string;
  productId: string;
  position: number;
  query?: string;
}

export interface SearchEventFilters {
  userId?: string;
  sessionId?: string;
  query?: string;
  startDate?: Date;
  endDate?: Date;
  season?: Season;
  source?: string;
  minResponseTime?: number;
  maxResponseTime?: number;
}

export interface SearchEventStats {
  totalSearches: number;
  uniqueUsers: number;
  uniqueSessions: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  avgResultsCount: number;
  topQueries: Array<{ query: string; count: number }>;
  topFilters: Array<{ filter: string; count: number }>;
  seasonalBreakdown: Record<Season, number>;
  sourceBreakdown: Record<string, number>;
}

export interface TrendingSearch {
  query: string;
  count: number;
  growth: number; // Percentage growth vs previous period
  season: Season;
}

// ============================================================================
// Search Event Service
// ============================================================================

export class SearchEventService {
  /**
   * Track a search event
   */
  static async trackSearch(input: TrackSearchEventInput) {
    const sessionId = input.sessionId || nanoid();

    const event = await database.searchEvent.create({
      data: {
        userId: input.userId,
        sessionId,
        query: input.query?.toLowerCase().trim(),
        filters: input.filters,
        sortBy: input.sortBy,
        resultsCount: input.resultsCount,
        resultsShown: input.resultsShown,
        clickedResults: [],
        responseTime: input.responseTime,
        source: input.source || 'web',
        location: input.location || {},
        userAgent: input.userAgent,
        currentSeason: input.currentSeason || this.getCurrentSeason(),
        lunarPhase: input.lunarPhase,
        abTestVariant: input.abTestVariant,
        timestamp: new Date(),
      },
    });

    // Track as user interaction
    if (input.userId) {
      await database.userInteraction.create({
        data: {
          userId: input.userId,
          sessionId,
          type: InteractionType.SEARCH,
          entityType: 'search',
          entityId: event.id,
          source: input.source || 'web',
          metadata: {
            query: input.query,
            resultsCount: input.resultsCount,
            responseTime: input.responseTime,
          },
          timestamp: new Date(),
        },
      });
    }

    return {
      eventId: event.id,
      sessionId,
    };
  }

  /**
   * Track a click on a search result
   */
  static async trackClick(input: TrackClickInput) {
    // Update search event with clicked result
    if (input.searchEventId) {
      const event = await database.searchEvent.findUnique({
        where: { id: input.searchEventId },
      });

      if (event) {
        await database.searchEvent.update({
          where: { id: input.searchEventId },
          data: {
            clickedResults: {
              set: [...event.clickedResults, input.productId],
            },
          },
        });
      }
    }

    // Track as user interaction
    await database.userInteraction.create({
      data: {
        userId: input.userId,
        sessionId: input.sessionId,
        type: InteractionType.CLICK,
        entityType: 'product',
        entityId: input.productId,
        source: 'search_results',
        metadata: {
          position: input.position,
          query: input.query,
          searchEventId: input.searchEventId,
        },
        timestamp: new Date(),
      },
    });
  }

  /**
   * Get search events with filters
   */
  static async getEvents(filters: SearchEventFilters, limit = 100, offset = 0) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.sessionId) where.sessionId = filters.sessionId;
    if (filters.query) {
      where.query = {
        contains: filters.query.toLowerCase(),
      };
    }
    if (filters.season) where.currentSeason = filters.season;
    if (filters.source) where.source = filters.source;

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    if (filters.minResponseTime || filters.maxResponseTime) {
      where.responseTime = {};
      if (filters.minResponseTime) where.responseTime.gte = filters.minResponseTime;
      if (filters.maxResponseTime) where.responseTime.lte = filters.maxResponseTime;
    }

    const [events, total] = await Promise.all([
      database.searchEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      database.searchEvent.count({ where }),
    ]);

    return {
      events,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Get search event statistics
   */
  static async getStats(filters: SearchEventFilters): Promise<SearchEventStats> {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    // Get all matching events for analysis
    const events = await database.searchEvent.findMany({
      where,
      select: {
        id: true,
        userId: true,
        sessionId: true,
        query: true,
        filters: true,
        resultsCount: true,
        responseTime: true,
        currentSeason: true,
        source: true,
      },
    });

    // Calculate basic metrics
    const totalSearches = events.length;
    const uniqueUsers = new Set(events.filter(e => e.userId).map(e => e.userId)).size;
    const uniqueSessions = new Set(events.map(e => e.sessionId)).size;

    // Response time metrics
    const responseTimes = events.map(e => e.responseTime).sort((a, b) => a - b);
    const avgResponseTime = responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length || 0;
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p95ResponseTime = responseTimes[p95Index] || 0;

    // Results count
    const avgResultsCount = events.reduce((sum, e) => sum + e.resultsCount, 0) / totalSearches || 0;

    // Top queries
    const queryCount = new Map<string, number>();
    events.forEach(e => {
      if (e.query) {
        queryCount.set(e.query, (queryCount.get(e.query) || 0) + 1);
      }
    });
    const topQueries = Array.from(queryCount.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top filters
    const filterCount = new Map<string, number>();
    events.forEach(e => {
      Object.keys(e.filters || {}).forEach(filter => {
        const key = `${filter}:${JSON.stringify((e.filters as any)[filter])}`;
        filterCount.set(key, (filterCount.get(key) || 0) + 1);
      });
    });
    const topFilters = Array.from(filterCount.entries())
      .map(([filter, count]) => ({ filter, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Seasonal breakdown
    const seasonalBreakdown: Record<Season, number> = {
      [Season.SPRING]: 0,
      [Season.SUMMER]: 0,
      [Season.FALL]: 0,
      [Season.WINTER]: 0,
    };
    events.forEach(e => {
      if (e.currentSeason) {
        seasonalBreakdown[e.currentSeason]++;
      }
    });

    // Source breakdown
    const sourceBreakdown: Record<string, number> = {};
    events.forEach(e => {
      if (e.source) {
        sourceBreakdown[e.source] = (sourceBreakdown[e.source] || 0) + 1;
      }
    });

    return {
      totalSearches,
      uniqueUsers,
      uniqueSessions,
      avgResponseTime: Math.round(avgResponseTime),
      p95ResponseTime,
      avgResultsCount: Math.round(avgResultsCount * 100) / 100,
      topQueries,
      topFilters,
      seasonalBreakdown,
      sourceBreakdown,
    };
  }

  /**
   * Get trending searches (searches with increasing popularity)
   */
  static async getTrendingSearches(
    limit = 10,
    lookbackDays = 7
  ): Promise<TrendingSearch[]> {
    const now = new Date();
    const currentPeriodStart = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(currentPeriodStart.getTime() - lookbackDays * 24 * 60 * 60 * 1000);

    // Get current period searches
    const currentSearches = await database.searchEvent.findMany({
      where: {
        timestamp: {
          gte: currentPeriodStart,
          lte: now,
        },
        query: { not: null },
      },
      select: {
        query: true,
        currentSeason: true,
      },
    });

    // Get previous period searches
    const previousSearches = await database.searchEvent.findMany({
      where: {
        timestamp: {
          gte: previousPeriodStart,
          lt: currentPeriodStart,
        },
        query: { not: null },
      },
      select: {
        query: true,
      },
    });

    // Count queries in both periods
    const currentCounts = new Map<string, { count: number; season: Season }>();
    currentSearches.forEach(s => {
      if (s.query) {
        const existing = currentCounts.get(s.query);
        currentCounts.set(s.query, {
          count: (existing?.count || 0) + 1,
          season: s.currentSeason || Season.SPRING,
        });
      }
    });

    const previousCounts = new Map<string, number>();
    previousSearches.forEach(s => {
      if (s.query) {
        previousCounts.set(s.query, (previousCounts.get(s.query) || 0) + 1);
      }
    });

    // Calculate growth
    const trending: TrendingSearch[] = [];
    currentCounts.forEach((current, query) => {
      const previous = previousCounts.get(query) || 0;
      const growth = previous > 0
        ? ((current.count - previous) / previous) * 100
        : current.count > 0 ? 100 : 0;

      trending.push({
        query,
        count: current.count,
        growth: Math.round(growth * 10) / 10,
        season: current.season,
      });
    });

    // Sort by growth and count
    return trending
      .sort((a, b) => {
        if (a.growth !== b.growth) return b.growth - a.growth;
        return b.count - a.count;
      })
      .slice(0, limit);
  }

  /**
   * Get search conversion rate (searches that led to actions)
   */
  static async getConversionRate(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<{
    totalSearches: number;
    searchesWithClicks: number;
    searchesWithCart: number;
    searchesWithPurchase: number;
    clickThroughRate: number;
    cartConversionRate: number;
    purchaseConversionRate: number;
  }> {
    const searchWhere: any = {
      timestamp: { gte: startDate, lte: endDate },
    };
    if (userId) searchWhere.userId = userId;

    // Get all search events
    const searches = await database.searchEvent.findMany({
      where: searchWhere,
      select: {
        id: true,
        sessionId: true,
        userId: true,
      },
    });

    const totalSearches = searches.length;
    if (totalSearches === 0) {
      return {
        totalSearches: 0,
        searchesWithClicks: 0,
        searchesWithCart: 0,
        searchesWithPurchase: 0,
        clickThroughRate: 0,
        cartConversionRate: 0,
        purchaseConversionRate: 0,
      };
    }

    const sessionIds = searches.map(s => s.sessionId);

    // Get interactions for these sessions
    const interactions = await database.userInteraction.findMany({
      where: {
        sessionId: { in: sessionIds },
        timestamp: { gte: startDate, lte: endDate },
      },
      select: {
        sessionId: true,
        type: true,
      },
    });

    // Count sessions with each interaction type
    const sessionsWithClick = new Set<string>();
    const sessionsWithCart = new Set<string>();
    const sessionsWithPurchase = new Set<string>();

    interactions.forEach(i => {
      if (i.type === InteractionType.CLICK) sessionsWithClick.add(i.sessionId);
      if (i.type === InteractionType.ADD_TO_CART) sessionsWithCart.add(i.sessionId);
      if (i.type === InteractionType.PURCHASE) sessionsWithPurchase.add(i.sessionId);
    });

    const searchesWithClicks = sessionsWithClick.size;
    const searchesWithCart = sessionsWithCart.size;
    const searchesWithPurchase = sessionsWithPurchase.size;

    return {
      totalSearches,
      searchesWithClicks,
      searchesWithCart,
      searchesWithPurchase,
      clickThroughRate: (searchesWithClicks / totalSearches) * 100,
      cartConversionRate: (searchesWithCart / totalSearches) * 100,
      purchaseConversionRate: (searchesWithPurchase / totalSearches) * 100,
    };
  }

  /**
   * Get popular filters
   */
  static async getPopularFilters(
    startDate: Date,
    endDate: Date,
    limit = 10
  ): Promise<Array<{ filter: string; value: any; count: number; percentage: number }>> {
    const events = await database.searchEvent.findMany({
      where: {
        timestamp: { gte: startDate, lte: endDate },
      },
      select: {
        filters: true,
      },
    });

    const filterCount = new Map<string, number>();
    const totalSearches = events.length;

    events.forEach(e => {
      const filters = e.filters as Record<string, any>;
      Object.entries(filters).forEach(([key, value]) => {
        const filterKey = `${key}:${JSON.stringify(value)}`;
        filterCount.set(filterKey, (filterCount.get(filterKey) || 0) + 1);
      });
    });

    return Array.from(filterCount.entries())
      .map(([filterKey, count]) => {
        const [filter, value] = filterKey.split(':');
        return {
          filter,
          value: JSON.parse(value),
          count,
          percentage: (count / totalSearches) * 100,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get search performance by time of day
   */
  static async getPerformanceByTimeOfDay(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ hour: number; avgResponseTime: number; searchCount: number }>> {
    const events = await database.searchEvent.findMany({
      where: {
        timestamp: { gte: startDate, lte: endDate },
      },
      select: {
        timestamp: true,
        responseTime: true,
      },
    });

    const hourlyData = new Map<number, { totalTime: number; count: number }>();

    events.forEach(e => {
      const hour = e.timestamp.getHours();
      const existing = hourlyData.get(hour) || { totalTime: 0, count: 0 };
      hourlyData.set(hour, {
        totalTime: existing.totalTime + e.responseTime,
        count: existing.count + 1,
      });
    });

    const result: Array<{ hour: number; avgResponseTime: number; searchCount: number }> = [];
    for (let hour = 0; hour < 24; hour++) {
      const data = hourlyData.get(hour) || { totalTime: 0, count: 0 };
      result.push({
        hour,
        avgResponseTime: data.count > 0 ? Math.round(data.totalTime / data.count) : 0,
        searchCount: data.count,
      });
    }

    return result;
  }

  /**
   * Helper: Get current season
   */
  private static getCurrentSeason(): Season {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return Season.SPRING;
    if (month >= 5 && month <= 7) return Season.SUMMER;
    if (month >= 8 && month <= 10) return Season.FALL;
    return Season.WINTER;
  }

  /**
   * Delete old search events (data retention)
   */
  static async deleteOldEvents(daysToKeep = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await database.searchEvent.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}
