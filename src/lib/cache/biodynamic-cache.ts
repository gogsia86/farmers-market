/**
 * 🌾 BIODYNAMIC CACHE SYSTEM
 * Agricultural-aware caching with seasonal patterns and quantum performance
 */

import { MemoryCache } from "./memory";

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  seasonal?: boolean; // Apply seasonal TTL adjustments
  farmId?: string; // For farm-specific caching
  tags?: string[]; // Cache tags for invalidation
}

export interface CachedData<T> {
  data: T;
  cached: true;
  timestamp: number;
  expiresAt: number;
}

/**
 * Biodynamic Cache Manager
 * Multi-layer caching with agricultural awareness
 */
export class BiodynamicCacheManager {
  private readonly memoryCache: MemoryCache;
  private readonly defaultTTL = 300; // 5 minutes

  constructor() {
    this.memoryCache = new MemoryCache();
  }

  /**
   * Get value from cache (Memory only for now)
   */
  async get<T>(key: string): Promise<T | null> {
    // L1: Check memory cache
    const memoryValue = this.memoryCache.get<T>(key);
    if (memoryValue !== null) {
      return memoryValue;
    }

    // TODO: L2: Redis cache when configured
    return null;
  }

  /**
   * Set value in cache (Memory only for now)
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const ttl = this.calculateTTL(options);

    // Store in memory cache
    this.memoryCache.set(key, value, Math.min(ttl, 300)); // Max 5 min in memory

    // TODO: Store tags for invalidation when Redis is configured
  }

  /**
   * Get or compute value with caching
   */
  async getOrSet<T>(
    key: string,
    compute: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Compute value
    const value = await compute();

    // Store in cache
    await this.set(key, value, options);

    return value;
  }

  /**
   * Invalidate cache by key
   */
  async invalidate(key: string): Promise<void> {
    this.memoryCache.invalidate(key);
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    this.memoryCache.invalidatePattern(pattern);
  }

  /**
   * Invalidate cache by tag
   */
  async invalidateByTag(_tag: string): Promise<void> {
    // TODO: Implement when Redis is configured
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
  }

  /**
   * Calculate TTL with seasonal awareness
   */
  private calculateTTL(options: CacheOptions): number {
    let ttl = options.ttl || this.defaultTTL;

    if (options.seasonal) {
      const season = this.getCurrentSeason();
      const seasonalMultiplier = this.getSeasonalMultiplier(season);
      ttl = Math.floor(ttl * seasonalMultiplier);
    }

    return ttl;
  }

  /**
   * Get current agricultural season
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth();

    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  }

  /**
   * Get seasonal cache TTL multiplier
   */
  private getSeasonalMultiplier(season: string): number {
    // Longer cache during off-season, shorter during peak season
    switch (season) {
      case "SPRING":
        return 0.5; // Peak planting - fresh data
      case "SUMMER":
        return 0.7; // Growth season - frequent updates
      case "FALL":
        return 1; // Harvest - normal caching
      case "WINTER":
        return 1.5; // Off-season - can cache longer
      default:
        return 1;
    }
  }

  /**
   * Generate agricultural-aware cache key
   */
  static generateKey(
    resource: string,
    id?: string,
    params?: Record<string, any>
  ): string {
    const parts = ["biodynamic", resource];

    if (id) {
      parts.push(id);
    }

    if (params) {
      const sortedParams = Object.keys(params)
        .sort((a, b) => a.localeCompare(b))
        .map((key) => `${key}:${params[key]}`)
        .join(":");
      parts.push(sortedParams);
    }

    return parts.join(":");
  }
}

// Singleton instance
export const biodynamicCache = new BiodynamicCacheManager();
