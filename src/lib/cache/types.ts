/**
 * AGRICULTURAL CACHE TYPES
 * Separate type declarations for better module resolution
 */

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

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
