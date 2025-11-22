/**
 * AGRICULTURAL QUANTUM TYPES
 * Divine type definitions for agricultural consciousness
 */

// ============================================
// SEASONAL TYPES
// ============================================

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

export type LunarPhase =
  | "NEW_MOON"
  | "WAXING_CRESCENT"
  | "FIRST_QUARTER"
  | "WAXING_GIBBOUS"
  | "FULL_MOON"
  | "WANING_GIBBOUS"
  | "LAST_QUARTER"
  | "WANING_CRESCENT";

export type CropType =
  | "TOMATOES"
  | "LETTUCE"
  | "CARROTS"
  | "BEANS"
  | "CORN"
  | "SQUASH"
  | "PEPPERS"
  | "CUCUMBERS"
  | "OTHER";

// ============================================
// BIODYNAMIC TYPES
// ============================================

export interface BiodynamicScore {
  overall: number; // 0-100
  breakdown: {
    soilHealth: number;
    seasonalAlignment: number;
    biodiversityPotential: number;
    sustainabilityPractices: number;
    communityIntegration: number;
  };
  recommendations: string[];
  timestamp: Date;
}

export interface SoilMemory {
  farmId: string;
  healthIndex: number; // 0-1
  nutrientLevels: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    organicMatter: number;
  };
  previousCrops: Array<{
    crop: CropType;
    year: number;
    yield: "POOR" | "AVERAGE" | "GOOD" | "EXCELLENT" | "OUTSTANDING";
  }>;
  biodynamicTreatments: Array<{
    treatment: string;
    date: Date;
  }>;
  recordedAt: Date;
}

// ============================================
// SEASONAL CONSCIOUSNESS
// ============================================

export interface SeasonalConsciousness {
  currentSeason: Season;
  lunarPhase: LunarPhase;
  getSeasonalAdvice: (cropType?: CropType) => string[];
  biodynamicAlignment: number; // 0-1
  plantingWindows: PlantingWindow[];
  optimalHarvestTimes: Record<CropType, Date[]>;
}

export interface PlantingWindow {
  crop: CropType;
  season: Season;
  startDate: Date;
  endDate: Date;
  lunarPhasePreference: LunarPhase[];
  soilTemperatureMin: number; // Fahrenheit
  soilTemperatureMax: number;
}

// ============================================
// QUANTUM FARM TYPES
// ============================================

export interface QuantumFarm {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  ownerId: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "INACTIVE";

  // Agricultural consciousness
  biodynamicScore?: BiodynamicScore;
  seasonalAlignment?: Season;
  agriculturalConsciousness: number; // 0-1
  soilMemory?: SoilMemory;

  // Certifications
  certifications: string[];
  images: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFarmRequest {
  name: string;
  address: string;
  description?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  certifications?: string[];
}

// ============================================
// AGRICULTURAL VALIDATION
// ============================================

export interface AgriculturalValidationError {
  field: string;
  message: string;
  seasonalContext?: Season;
  biodynamicViolations?: string[];
  recommendedActions?: string[];
}

// ============================================
// COMPONENT CONSCIOUSNESS
// ============================================

export interface ComponentConsciousness {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  errorCount: number;
  startMeasurement: (operation: string) => PerformanceMeasurement;
}

export interface PerformanceMeasurement {
  success: () => void;
  failure: (error: any) => void;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface QuantumApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
    agriculturalContext?: {
      affectedSeason?: Season;
      soilCompatibilityIssues?: string[];
      biodynamicViolations?: string[];
      recommendedActions?: string[];
    };
  };
  meta?: {
    requestId?: string;
    timestamp: string;
    responseTime?: number;
  };
  agricultural?: {
    season: Season;
    lunarPhase: LunarPhase;
    biodynamicAlignment: number;
  };
}

// ============================================
// SEASONAL ORCHESTRATION
// ============================================

export interface SeasonalOrchestrator {
  getCurrentSeason(): Promise<Season>;
  getCurrentLunarPhase(): Promise<LunarPhase>;
  validateSeasonalAlignment(
    operation: string,
    season: Season
  ): Promise<boolean>;
  getOptimalPlantingWindows(crop: CropType): Promise<PlantingWindow[]>;
}
