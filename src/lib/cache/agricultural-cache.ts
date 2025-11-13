/**
 * AGRICULTURAL CACHE - Separate module for clean exports
 */

import { cache, CacheKeys } from "./index";

type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

export const AgriculturalCache = {
  /**
   * Cache farm data with seasonal awareness
   */
  async cacheFarm(farmId: string, data: any): Promise<void> {
    await cache.set(CacheKeys.farm(farmId), data);
  },

  /**
   * Get cached farm data
   */
  async getFarm(farmId: string): Promise<any | null> {
    return cache.get(CacheKeys.farm(farmId));
  },

  /**
   * Invalidate farm cache
   */
  async invalidateFarm(farmId: string): Promise<void> {
    await cache.del(CacheKeys.farm(farmId));
    await cache.delPattern(`farms:list:*`);
  },

  /**
   * Cache product data with seasonal TTL
   */
  async cacheProduct(productId: string, data: any): Promise<void> {
    await cache.set(CacheKeys.product(productId), data);
  },

  /**
   * Get cached product data
   */
  async getProduct(productId: string): Promise<any | null> {
    return cache.get(CacheKeys.product(productId));
  },

  /**
   * Invalidate product cache and related lists
   */
  async invalidateProduct(productId: string, farmId: string): Promise<void> {
    await cache.del(CacheKeys.product(productId));
    await cache.delPattern(`products:${farmId}:*`);
    await cache.delPattern(`farms:list:*`);
  },

  /**
   * Cache seasonal data (longer TTL)
   */
  async cacheSeasonalData(season: Season, data: any): Promise<void> {
    const SEASONAL_TTL = {
      SPRING: 3600,
      SUMMER: 7200,
      FALL: 1800,
      WINTER: 14400,
    };
    await cache.set(CacheKeys.seasonalData(season), data, SEASONAL_TTL[season]);
  },

  /**
   * Get cached seasonal data
   */
  async getSeasonalData(season: Season): Promise<any | null> {
    return cache.get(CacheKeys.seasonalData(season));
  },
} as const;

export type AgriculturalCacheType = typeof AgriculturalCache;
