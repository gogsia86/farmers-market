/**
 * CACHE TYPE DEFINITIONS
 * Complete type safety for Redis and multi-layer caching
 */

// ============================================
// BASIC CACHE TYPES
// ============================================

export type CacheKey = string;
export type CacheValue = unknown;

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

export type CacheLayer = "memory" | "redis" | "all";

// ============================================
// CACHE OPTIONS
// ============================================

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  seasonal?: boolean; // Use seasonal TTL
  layer?: CacheLayer; // Which cache layer to use
  seasonalAware?: boolean; // Agricultural seasonal awareness
  agriculturalContext?: string; // Farm/product context
}

// ============================================
// CACHE ENTRY
// ============================================

export interface CacheEntry<T = CacheValue> {
  value: T;
  data?: T; // Alternative field name for compatibility
  timestamp: number;
  expires?: number;
  ttl: number;
  tags?: string[];
  metadata?: {
    season?: string;
    agriculturalContext?: string;
  };
}

// ============================================
// CACHE STATISTICS
// ============================================

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  memorySize?: number;
  memoryMax?: number;
  memoryUtilization?: number;
  redisConnected?: boolean;
}

// ============================================
// REDIS CONFIGURATION
// ============================================

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  keyPrefix: string;
  maxRetries: number;
  retryDelay: number;
}

// ============================================
// CACHE SERVICE INTERFACE
// ============================================

export interface ICacheService {
  get<T = CacheValue>(key: CacheKey): Promise<T | null>;
  set(
    key: CacheKey,
    value: CacheValue,
    options?: CacheOptions,
  ): Promise<boolean>;
  delete(key: CacheKey): Promise<boolean | void>;
  deletePattern(pattern: string): Promise<number | void>;
  exists(key: CacheKey): Promise<boolean>;
  clear(pattern?: string): Promise<boolean>;
  getStats(): CacheStats | Record<string, unknown>;
}

// ============================================
// AGRICULTURAL CACHE INTERFACE
// ============================================

export interface AgriculturalCacheInterface {
  cacheFarm(farmId: string, data: unknown): Promise<void>;
  getFarm(farmId: string): Promise<unknown | null>;
  invalidateFarm(farmId: string): Promise<void>;
  cacheProduct(productId: string, data: unknown): Promise<void>;
  getProduct(productId: string): Promise<unknown | null>;
  invalidateProduct(productId: string, farmId: string): Promise<void>;
  cacheSeasonalData(season: Season, data: unknown): Promise<void>;
  getSeasonalData(season: Season): Promise<unknown | null>;
}

// ============================================
// MULTI-LAYER CACHE INTERFACE
// ============================================

export interface IMultiLayerCache {
  get<T>(key: string, options?: CacheOptions): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
  getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T>;
  invalidateSeasonalCaches(season: string): Promise<void>;
  invalidateFarmCaches(farmId: string): Promise<void>;
  clearAll(): Promise<void>;
  getStats(): Record<string, unknown>;
}
