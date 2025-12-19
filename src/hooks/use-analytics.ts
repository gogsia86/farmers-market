/**
 * ╔════════════════════════════════════════════════════════════╗
 * ║ 🌾 ANALYTICS HOOKS - DIVINE REACT QUERY INTEGRATION       ║
 * ╠════════════════════════════════════════════════════════════╣
 * ║ React Query hooks for analytics tracking and retrieval    ║
 * ║ Phase 3: Complete analytics consciousness                 ║
 * ╚════════════════════════════════════════════════════════════╝
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  TrackSearchEventRequest,
  TrackInteractionRequest,
  SearchAnalyticsQuery,
} from "@/lib/services/analytics.service";
import { InteractionType, PeriodType, Season } from "@prisma/client";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface SearchEventTrackingData {
  sessionId: string;
  query: string;
  filters?: Record<string, any>;
  sortBy?: string;
  categoryId?: string;
  farmId?: string;
  location?: {
    lat: number;
    lng: number;
    radius?: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  seasonalFilter?: Season;
  resultsCount: number;
  responseTimeMs: number;
  clickedResultIds?: string[];
  agriculturalContext?: {
    currentSeason: Season;
    biodynamicPhase?: string;
    lunarCycle?: string;
    regionalConditions?: Record<string, any>;
  };
  cacheHit?: boolean;
  databaseTimeMs?: number;
  renderTimeMs?: number;
  deviceId?: string;
}

export interface InteractionTrackingData {
  sessionId: string;
  type: InteractionType;
  entityType: string;
  entityId: string;
  searchEventId?: string;
  recommendationId?: string;
  abTestId?: string;
  abTestVariant?: string;
  metadata?: Record<string, any>;
  durationMs?: number;
  scrollDepth?: number;
  clickPosition?: number;
  agriculturalContext?: Record<string, any>;
  sessionDepth?: number;
  timeInSession?: number;
  deviceId?: string;
}

export interface AggregationRequest {
  query?: string;
  categoryId?: string;
  farmId?: string;
  season?: Season;
  period: PeriodType;
  periodKey: string;
}

export interface AnalyticsMetrics {
  volume: {
    totalSearches: number;
    uniqueUsers: number;
    uniqueSessions: number;
    averageResultsCount: number;
    noResultsCount: number;
    noResultsRate?: number;
  };
  engagement: {
    refinementRate: number;
    saveRate: number;
    clickThroughRate: number;
    conversionRate: number;
    bounceRate: number;
  };
  performance: {
    averageResponseTime: number;
    cacheHitRate: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  agricultural: {
    seasonalRelevanceAvg: number | null;
    biodynamicEngagement: number | null;
  };
}

export interface SearchAnalyticsData {
  id: string;
  query: string | null;
  categoryId: string | null;
  farmId: string | null;
  season: Season | null;
  period: PeriodType;
  periodKey: string;
  metrics: AnalyticsMetrics;
  topResults: {
    clicked: any;
    converted: any;
  };
  calculatedAt: Date;
  updatedAt: Date;
}

// ============================================
// API CLIENT FUNCTIONS
// ============================================

/**
 * 🔮 Track search event via API
 */
async function trackSearchEventAPI(
  data: SearchEventTrackingData,
): Promise<any> {
  const response = await fetch("/api/analytics/events/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to track search event");
  }

  return response.json();
}

/**
 * 🎯 Track user interaction via API
 */
async function trackInteractionAPI(
  data: InteractionTrackingData,
): Promise<any> {
  const response = await fetch("/api/analytics/interactions/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to track interaction");
  }

  return response.json();
}

/**
 * 📊 Aggregate analytics via API
 */
async function aggregateAnalyticsAPI(query: AggregationRequest): Promise<any> {
  const response = await fetch("/api/analytics/aggregate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to aggregate analytics");
  }

  return response.json();
}

/**
 * 📊 Fetch existing analytics via API
 */
async function fetchAnalyticsAPI(
  query: AggregationRequest,
): Promise<SearchAnalyticsData> {
  const params = new URLSearchParams();
  params.append("period", query.period);
  params.append("periodKey", query.periodKey);
  if (query.query) params.append("query", query.query);
  if (query.categoryId) params.append("categoryId", query.categoryId);
  if (query.farmId) params.append("farmId", query.farmId);
  if (query.season) params.append("season", query.season);

  const response = await fetch(`/api/analytics/aggregate?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch analytics");
  }

  const result = await response.json();
  return result.data;
}

/**
 * 👤 Fetch user search profile via API
 */
async function fetchUserProfileAPI(userId: string): Promise<any> {
  const response = await fetch(`/api/analytics/profile/${userId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch user profile");
  }

  const result = await response.json();
  return result.data;
}

/**
 * 📈 Fetch search trends via API
 */
async function fetchTrendsAPI(request: {
  period: PeriodType;
  periodKey: string;
  comparisonPeriodKey: string;
  query?: string;
  categoryId?: string;
  farmId?: string;
  season?: Season;
  limit?: number;
}): Promise<any> {
  const params = new URLSearchParams();
  params.append("period", request.period);
  params.append("periodKey", request.periodKey);
  params.append("comparisonPeriodKey", request.comparisonPeriodKey);
  if (request.query) params.append("query", request.query);
  if (request.categoryId) params.append("categoryId", request.categoryId);
  if (request.farmId) params.append("farmId", request.farmId);
  if (request.season) params.append("season", request.season);
  if (request.limit) params.append("limit", request.limit.toString());

  const response = await fetch(`/api/analytics/trends?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch trends");
  }

  const result = await response.json();
  return result.data;
}

// ============================================
// REACT QUERY HOOKS
// ============================================

/**
 * 🔮 Hook to track search events with agricultural consciousness
 *
 * @example
 * ```tsx
 * const { trackSearchEvent, isTracking } = useTrackSearchEvent();
 *
 * const handleSearch = async (query: string, results: any[]) => {
 *   await trackSearchEvent({
 *     sessionId: getSessionId(),
 *     query,
 *     resultsCount: results.length,
 *     responseTimeMs: performanceMetrics.duration,
 *     agriculturalContext: {
 *       currentSeason: Season.SUMMER,
 *       biodynamicPhase: "harvest"
 *     }
 *   });
 * };
 * ```
 */
export function useTrackSearchEvent() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: trackSearchEventAPI,
    onSuccess: (data) => {
      // Invalidate analytics queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      console.log("Search event tracked:", data.data?.id);
    },
    onError: (error: Error) => {
      console.error("Failed to track search event:", error.message);
    },
  });

  return {
    trackSearchEvent: mutation.mutate,
    trackSearchEventAsync: mutation.mutateAsync,
    isTracking: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

/**
 * 🎯 Hook to track user interactions with quantum precision
 *
 * @example
 * ```tsx
 * const { trackInteraction } = useTrackInteraction();
 *
 * const handleProductClick = (productId: string, position: number) => {
 *   trackInteraction({
 *     sessionId: getSessionId(),
 *     type: InteractionType.CLICK,
 *     entityType: "product",
 *     entityId: productId,
 *     clickPosition: position,
 *     searchEventId: currentSearchEventId
 *   });
 * };
 * ```
 */
export function useTrackInteraction() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: trackInteractionAPI,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      console.log("Interaction tracked:", data.data?.type);
    },
    onError: (error: Error) => {
      console.error("Failed to track interaction:", error.message);
    },
  });

  return {
    trackInteraction: mutation.mutate,
    trackInteractionAsync: mutation.mutateAsync,
    isTracking: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

/**
 * 📊 Hook to aggregate analytics with divine intelligence
 *
 * @example
 * ```tsx
 * const { aggregateAnalytics, isAggregating } = useAggregateAnalytics();
 *
 * const handleAggregation = async () => {
 *   await aggregateAnalytics({
 *     period: PeriodType.WEEK,
 *     periodKey: "2024-W23",
 *     categoryId: "vegetables"
 *   });
 * };
 * ```
 */
export function useAggregateAnalytics() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: aggregateAnalyticsAPI,
    onSuccess: (data, variables) => {
      // Update cache with new analytics data
      queryClient.setQueryData(
        ["analytics", variables.period, variables.periodKey],
        data.data,
      );
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (error: Error) => {
      console.error("Failed to aggregate analytics:", error.message);
    },
  });

  return {
    aggregateAnalytics: mutation.mutate,
    aggregateAnalyticsAsync: mutation.mutateAsync,
    isAggregating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

/**
 * 📊 Hook to fetch search analytics with caching
 *
 * @example
 * ```tsx
 * const { data: analytics, isLoading } = useSearchAnalytics({
 *   period: PeriodType.WEEK,
 *   periodKey: "2024-W23",
 *   categoryId: "vegetables"
 * });
 *
 * if (analytics) {
 *   console.log("Total searches:", analytics.metrics.volume.totalSearches);
 * }
 * ```
 */
export function useSearchAnalytics(query: AggregationRequest) {
  return useQuery({
    queryKey: [
      "analytics",
      "search",
      query.period,
      query.periodKey,
      query.query,
      query.categoryId,
      query.farmId,
      query.season,
    ],
    queryFn: () => fetchAnalyticsAPI(query),
    enabled: !!query.period && !!query.periodKey,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });
}

/**
 * 👤 Hook to fetch user search profile with divine insights
 *
 * @example
 * ```tsx
 * const { data: profile, isLoading } = useUserSearchProfile(userId);
 *
 * if (profile) {
 *   console.log("Total searches:", profile.totalSearches);
 *   console.log("Top categories:", profile.topCategories);
 * }
 * ```
 */
export function useUserSearchProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["analytics", "profile", userId],
    queryFn: () => fetchUserProfileAPI(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * 📈 Hook to fetch search trends with temporal consciousness
 *
 * @example
 * ```tsx
 * const { data: trends, isLoading } = useSearchTrends({
 *   period: PeriodType.WEEK,
 *   periodKey: "2024-W23",
 *   comparisonPeriodKey: "2024-W22",
 *   limit: 20
 * });
 *
 * if (trends) {
 *   trends.forEach(trend => {
 *     console.log(`${trend.query}: ${trend.trendType} (${trend.growthRate}%)`);
 *   });
 * }
 * ```
 */
export function useSearchTrends(request: {
  period: PeriodType;
  periodKey: string;
  comparisonPeriodKey: string;
  query?: string;
  categoryId?: string;
  farmId?: string;
  season?: Season;
  limit?: number;
}) {
  return useQuery({
    queryKey: [
      "analytics",
      "trends",
      request.period,
      request.periodKey,
      request.comparisonPeriodKey,
      request.query,
      request.categoryId,
      request.farmId,
      request.season,
      request.limit,
    ],
    queryFn: () => fetchTrendsAPI(request),
    enabled:
      !!request.period && !!request.periodKey && !!request.comparisonPeriodKey,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * 🌾 Combined hook for comprehensive search tracking
 *
 * Automatically tracks search events and interactions
 *
 * @example
 * ```tsx
 * const tracking = useSearchTracking();
 *
 * const handleSearch = async (query: string, results: any[]) => {
 *   await tracking.trackSearch({
 *     query,
 *     results,
 *     responseTimeMs: 145,
 *     cacheHit: true
 *   });
 * };
 *
 * const handleResultClick = (productId: string, position: number) => {
 *   tracking.trackClick(productId, position);
 * };
 * ```
 */
export function useSearchTracking(sessionId: string) {
  const { trackSearchEventAsync } = useTrackSearchEvent();
  const { trackInteraction } = useTrackInteraction();

  let currentSearchEventId: string | undefined;

  const trackSearch = async (options: {
    query: string;
    results: any[];
    filters?: Record<string, any>;
    sortBy?: string;
    categoryId?: string;
    farmId?: string;
    responseTimeMs: number;
    cacheHit?: boolean;
    databaseTimeMs?: number;
  }) => {
    try {
      const response = await trackSearchEventAsync({
        sessionId,
        query: options.query,
        filters: options.filters,
        sortBy: options.sortBy,
        categoryId: options.categoryId,
        farmId: options.farmId,
        resultsCount: options.results.length,
        responseTimeMs: options.responseTimeMs,
        cacheHit: options.cacheHit,
        databaseTimeMs: options.databaseTimeMs,
        agriculturalContext: {
          currentSeason: getCurrentSeason(),
        },
      });

      currentSearchEventId = response.data?.id;
      return response;
    } catch (error) {
      console.error("Search tracking failed:", error);
    }
  };

  const trackClick = (entityId: string, clickPosition?: number) => {
    trackInteraction({
      sessionId,
      type: InteractionType.CLICK,
      entityType: "product",
      entityId,
      searchEventId: currentSearchEventId,
      clickPosition,
    });
  };

  const trackView = (entityId: string, durationMs?: number) => {
    trackInteraction({
      sessionId,
      type: InteractionType.VIEW,
      entityType: "product",
      entityId,
      searchEventId: currentSearchEventId,
      durationMs,
    });
  };

  const trackAddToCart = (entityId: string) => {
    trackInteraction({
      sessionId,
      type: InteractionType.ADD_TO_CART,
      entityType: "product",
      entityId,
      searchEventId: currentSearchEventId,
    });
  };

  return {
    trackSearch,
    trackClick,
    trackView,
    trackAddToCart,
    currentSearchEventId,
  };
}

/**
 * 🔮 Get current agricultural season
 */
function getCurrentSeason(): Season {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) return Season.SPRING;
  if (month >= 5 && month <= 7) return Season.SUMMER;
  if (month >= 8 && month <= 10) return Season.FALL;
  return Season.WINTER;
}

/**
 * 📊 Generate period key for current period
 *
 * @example
 * ```tsx
 * const weekKey = generatePeriodKey(PeriodType.WEEK); // "2024-W23"
 * const monthKey = generatePeriodKey(PeriodType.MONTH); // "2024-06"
 * ```
 */
export function generatePeriodKey(period: PeriodType): string {
  const now = new Date();
  const year = now.getFullYear();

  switch (period) {
    case PeriodType.HOUR:
      return `${year}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}`;

    case PeriodType.DAY:
      return `${year}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    case PeriodType.WEEK: {
      const weekNumber = getWeekNumber(now);
      return `${year}-W${String(weekNumber).padStart(2, "0")}`;
    }

    case PeriodType.MONTH:
      return `${year}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    case PeriodType.QUARTER: {
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      return `${year}-Q${quarter}`;
    }

    case PeriodType.YEAR:
      return `${year}`;

    default:
      return `${year}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
}

/**
 * Get ISO week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ============================================
// EXPORT TYPES
// ============================================
// Types are already exported with their declarations above
