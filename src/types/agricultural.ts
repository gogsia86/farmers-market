/**
 * AGRICULTURAL TYPE DEFINITIONS
 * Divexport interface NavigationPattern {
  currentSeason: Season;
  lunarPhase: LunarPhase;
  plantingWindow: boolean;
  harvestWindow: boolean;
  animationDuration: number; // Animation duration in ms
  transitionPattern: 'smooth' | 'quantum' | 'agricultural';
  quantumEffects: {
    particleCount: number;
    glowIntensity: number;
    seasonalColors: string[];
    fieldCoherence: number; // Quantum field coherence level
    particleIntensity: number; // Particle system intensity
    resonanceFrequency: number; // Quantum resonance frequency
  };
} farming domain consciousness
 */

// Seasonal types
export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

export type LunarPhase =
  | "NEW"
  | "WAXING_CRESCENT"
  | "FIRST_QUARTER"
  | "WAXING_GIBBOUS"
  | "FULL"
  | "WANING_GIBBOUS"
  | "LAST_QUARTER"
  | "WANING_CRESCENT";

// Crop types
export type CropType =
  | "VEGETABLES"
  | "FRUITS"
  | "GRAINS"
  | "HERBS"
  | "LIVESTOCK"
  | "DAIRY"
  | "POULTRY";

export type CropPhase =
  | "PLANNING"
  | "PLANTING"
  | "GROWING"
  | "FLOWERING"
  | "FRUITING"
  | "HARVESTING"
  | "RESTING";

// Soil types
export type SoilType = "CLAY" | "SANDY" | "LOAM" | "SILT" | "PEAT" | "CHALK";

export type SoilHealth = "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "DEPLETED";

// Agricultural consciousness interfaces
export interface NavigationPattern {
  currentSeason: Season;
  lunarPhase: LunarPhase;
  plantingWindow: boolean;
  harvestWindow: boolean;
  animationDuration: number; // Animation duration in ms
  transitionPattern: "smooth" | "quantum" | "agricultural";
  quantumEffects: {
    particleCount: number;
    glowIntensity: number;
    seasonalColors: string[];
  };
}

export interface BiodynamicState {
  season: Season;
  lunarPhase: LunarPhase;
  soilHealth: SoilHealth;
  cropPhase: CropPhase;
  weatherConditions: WeatherConditions;
}

export interface WeatherConditions {
  temperature: number; // Celsius
  humidity: number; // Percentage
  rainfall: number; // mm
  sunlight: number; // hours per day
  windSpeed: number; // km/h
}

export interface CropCycle {
  cropType: CropType;
  plantingDate: Date;
  expectedHarvestDate: Date;
  currentPhase: CropPhase;
  growthProgress: number; // Percentage
}

export interface SeasonalTimeframe {
  season: Season;
  startDate: Date;
  endDate: Date;
  optimalCrops: CropType[];
}

export interface FarmingPattern {
  id: string;
  name: string;
  description: string;
  season: Season[];
  cropTypes: CropType[];
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
}

// Agricultural consciousness state
export interface AgriculturalConsciousness {
  currentSeason: Season;
  lunarPhase: LunarPhase;
  activeCropCycles: CropCycle[];
  soilHealth: SoilHealth;
  weatherForecast: WeatherConditions[];
  farmingPatterns: FarmingPattern[];
}

// Biodynamic calendar
export interface BiodynamicCalendar {
  date: Date;
  season: Season;
  lunarPhase: LunarPhase;
  optimalActivities: string[];
  avoidActivities: string[];
}

// Harvest prediction
export interface HarvestPrediction {
  cropType: CropType;
  expectedDate: Date;
  estimatedYield: number;
  qualityForecast: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";
  confidence: number; // 0-1
}

// Soil analysis
export interface SoilAnalysis {
  soilType: SoilType;
  health: SoilHealth;
  pH: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  organicMatter: number; // Percentage
  recommendations: string[];
}

// Export utility type guards
export function isSeason(value: string): value is Season {
  return ["SPRING", "SUMMER", "FALL", "WINTER"].includes(value);
}

export function isLunarPhase(value: string): value is LunarPhase {
  return [
    "NEW",
    "WAXING_CRESCENT",
    "FIRST_QUARTER",
    "WAXING_GIBBOUS",
    "FULL",
    "WANING_GIBBOUS",
    "LAST_QUARTER",
    "WANING_CRESCENT",
  ].includes(value);
}

export function isCropType(value: string): value is CropType {
  return [
    "VEGETABLES",
    "FRUITS",
    "GRAINS",
    "HERBS",
    "LIVESTOCK",
    "DAIRY",
    "POULTRY",
  ].includes(value);
}
