/**
 * ⚡ CROP TYPE DEFINITIONS
 * TypeScript types for agricultural crop operations
 */

/**
 * Seasons of the agricultural year
 */
export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

/**
 * Growth phases of crops
 */
export type GrowthPhase =
  | "SEED"
  | "GERMINATION"
  | "VEGETATIVE"
  | "FLOWERING"
  | "FRUITING"
  | "HARVEST"
  | "DORMANT";

/**
 * Types of crops
 */
export type CropType =
  | "VEGETABLE"
  | "FRUIT"
  | "GRAIN"
  | "LEGUME"
  | "HERB"
  | "ROOT"
  | "LEAF"
  | "FLOWER";

/**
 * Crop requirements and conditions
 */
export interface CropRequirements {
  sunlight?: "FULL_SUN" | "PARTIAL_SHADE" | "FULL_SHADE";
  waterFrequency?: "DAILY" | "EVERY_OTHER_DAY" | "WEEKLY" | "BI_WEEKLY";
  soilType?: "SANDY" | "CLAY" | "LOAM" | "SILT" | "PEAT";
  temperature?: {
    min?: number;
    max?: number;
    optimal?: number;
  };
}

/**
 * Complete crop entity
 */
export interface Crop {
  id: string;
  name: string;
  scientificName?: string;
  type: CropType;
  description?: string;
  farmId: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  actualHarvestDate?: Date;
  growthPhase: GrowthPhase;
  season: Season;
  requirements?: CropRequirements;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Seasonal cycle for crop planning
 */
export interface SeasonalCycle {
  id: string;
  cropId: string;
  season: Season;
  plantingWindow: {
    start: Date;
    end: Date;
  };
  harvestWindow: {
    start: Date;
    end: Date;
  };
  expectedYield?: number;
  actualYield?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Crop with related data
 */
export interface CropWithRelations extends Crop {
  farm?: {
    id: string;
    name: string;
    location?: string;
  };
  seasonalCycles?: SeasonalCycle[];
  products?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

/**
 * Crop statistics for analytics
 */
export interface CropStatistics {
  totalCrops: number;
  bySeason: Record<Season, number>;
  byType: Record<CropType, number>;
  byGrowthPhase: Record<GrowthPhase, number>;
  averageGrowthDuration: number;
  yieldEfficiency: number;
}
