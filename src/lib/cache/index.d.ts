/**
 * Type declarations for @/lib/cache module
 * Explicit module declaration for better TypeScript resolution
 */

declare module "@/lib/cache" {
  export interface AgriculturalCacheType {
    cacheFarm(farmId: string, data: unknown): Promise<void>;
    getFarm(farmId: string): Promise<unknown | null>;
    invalidateFarm(farmId: string): Promise<void>;
    cacheProduct(productId: string, data: unknown): Promise<void>;
    getProduct(productId: string): Promise<unknown | null>;
    invalidateProduct(productId: string, farmId: string): Promise<void>;
    cacheSeasonalData(season: string, data: unknown): Promise<void>;
    getSeasonalData(season: string): Promise<unknown | null>;
  }

  export interface CacheType {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    delPattern(pattern: string): Promise<void>;
    clear(): Promise<void>;
    wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T>;
  }

  export const AgriculturalCache: AgriculturalCacheType;
  export const cache: CacheType;
  export function warmCache(): Promise<void>;
}
