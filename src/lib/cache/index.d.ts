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

  export const AgriculturalCache: AgriculturalCacheType;
  export const cache: any;
  export function warmCache(): Promise<void>;
}
