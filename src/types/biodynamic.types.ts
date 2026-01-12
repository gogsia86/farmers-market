/**
 * 🌾 Biodynamic & Crop Intelligence Types
 *
 * Comprehensive type definitions for biodynamic farming, crop recommendations,
 * and agricultural intelligence systems.
 *
 * @module BiodynamicTypes
 */

import type { CropType, LunarPhase, Season } from '@/lib/services/biodynamic-calendar.service';
import type {
    CropCategory,
    CropProfile,
    CropRecommendation,
    FarmProfile,
    FarmerPreferences,
    MarketData,
    SoilType,
    SunLevel,
    WaterLevel
} from '@/lib/services/crop-recommendation.service';

// Re-export for convenience
export type {
    CropCategory, CropProfile, CropRecommendation, CropType, FarmProfile,
    FarmerPreferences, LunarPhase, MarketData, Season, SoilType, SunLevel, WaterLevel
};

/**
 * Biodynamic farm certification details
 */
export interface BiodynamicCertification {
  certified: boolean;
  certifier?: string;
  certificationDate?: Date;
  expirationDate?: Date;
  certificationNumber?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'REVOKED';
}

/**
 * Biodynamic preparation usage
 */
export interface BiodynamicPreparation {
  id: string;
  name: string;
  code: string; // e.g., "BD500", "BD501"
  type: 'SPRAY' | 'COMPOST' | 'FIELD';
  description: string;
  applicationMethod: string;
  frequency: string;
  lunarTiming?: LunarPhase[];
}

/**
 * Soil health metrics
 */
export interface SoilHealth {
  ph: number;
  organicMatter: number; // percentage
  nitrogenLevel: 'LOW' | 'MODERATE' | 'HIGH';
  phosphorusLevel: 'LOW' | 'MODERATE' | 'HIGH';
  potassiumLevel: 'LOW' | 'MODERATE' | 'HIGH';
  microbialActivity: number; // 0-100
  soilType: SoilType;
  drainageQuality: 'POOR' | 'ADEQUATE' | 'EXCELLENT';
  lastTested?: Date;
}

/**
 * Biodiversity metrics
 */
export interface BiodiversityMetrics {
  cropDiversity: number; // number of different crops
  wildlifePresence: number; // 0-100 score
  pollinatorActivity: number; // 0-100 score
  beneficialInsects: string[];
  birdSpecies: string[];
  nativePlants: string[];
  hedgerowPresence: boolean;
  wetlandAreas: boolean;
}

/**
 * Farm sustainability assessment
 */
export interface SustainabilityAssessment {
  overallScore: number; // 0-100
  breakdown: {
    soilHealth: number;
    waterManagement: number;
    biodiversity: number;
    energyUse: number;
    wasteManagement: number;
    carbonFootprint: number;
  };
  strengths: string[];
  improvements: string[];
  assessmentDate: Date;
  assessor?: string;
}

/**
 * Crop rotation plan
 */
export interface CropRotationPlan {
  id: string;
  farmId: string;
  fieldId: string;
  planName: string;
  rotationCycle: number; // years
  crops: {
    cropId: string;
    cropName: string;
    year: number;
    season: Season;
    category: CropCategory;
    benefits: string[];
  }[];
  rationale: string;
  expectedBenefits: {
    soilHealth: string;
    pestManagement: string;
    yieldImprovement: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Planting calendar entry
 */
export interface PlantingCalendarEntry {
  id: string;
  farmId: string;
  cropId: string;
  cropName: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  lunarPhase: LunarPhase;
  season: Season;
  fieldLocation: string;
  quantityPlanned: number;
  unit: string;
  status: 'PLANNED' | 'PLANTED' | 'GROWING' | 'HARVESTED' | 'FAILED';
  notes?: string;
  biodynamicScore: number;
}

/**
 * Harvest record
 */
export interface HarvestRecord {
  id: string;
  farmId: string;
  cropId: string;
  cropName: string;
  harvestDate: Date;
  quantityHarvested: number;
  unit: string;
  quality: 'PREMIUM' | 'STANDARD' | 'SECONDS';
  lunarPhase: LunarPhase;
  weather: string;
  notes?: string;
  soldQuantity?: number;
  wasteQuantity?: number;
  revenue?: number;
}

/**
 * Weather forecast for farming
 */
export interface FarmWeatherForecast {
  date: Date;
  temperature: {
    high: number;
    low: number;
    unit: 'F' | 'C';
  };
  precipitation: {
    chance: number; // percentage
    amount?: number;
    unit: 'inches' | 'mm';
  };
  conditions: string;
  windSpeed: number;
  humidity: number;
  uvIndex: number;
  frostRisk: boolean;
  farmingRecommendation: string;
  lunarPhase: LunarPhase;
}

/**
 * Pest and disease monitoring
 */
export interface PestDiseaseReport {
  id: string;
  farmId: string;
  cropId?: string;
  fieldLocation: string;
  reportDate: Date;
  type: 'PEST' | 'DISEASE' | 'WEED';
  identification: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  affectedArea: string;
  treatment?: string;
  treatmentDate?: Date;
  resolved: boolean;
  images?: string[];
  notes?: string;
}

/**
 * Companion planting recommendation
 */
export interface CompanionPlantingRecommendation {
  primaryCrop: string;
  companionCrop: string;
  benefits: string[];
  spacing: string;
  plantingTiming: string;
  compatibility: number; // 0-100
  scientificRationale: string;
}

/**
 * Market price history
 */
export interface MarketPriceHistory {
  cropId: string;
  cropName: string;
  date: Date;
  price: number;
  unit: string;
  marketType: 'FARMERS_MARKET' | 'WHOLESALE' | 'RETAIL' | 'ORGANIC';
  location: string;
  source: string;
}

/**
 * Farm consciousness state (advanced)
 */
export interface FarmConsciousness {
  farmId: string;
  currentSeason: Season;
  currentLunarPhase: LunarPhase;
  biodynamicScore: number;
  sustainabilityScore: number;
  biodiversityIndex: number;
  soilHealthIndex: number;
  activeCrops: string[];
  upcomingTasks: string[];
  seasonalReadiness: number;
  quantumAlignment: number; // 0-100 (divine metric)
  lastUpdated: Date;
}

/**
 * Agricultural wisdom entry
 */
export interface AgriculturalWisdom {
  id: string;
  category: 'PLANTING' | 'HARVEST' | 'PEST_MANAGEMENT' | 'SOIL' | 'WEATHER' | 'GENERAL';
  season?: Season;
  lunarPhase?: LunarPhase;
  wisdom: string;
  source: string;
  verified: boolean;
  upvotes: number;
  tags: string[];
  createdAt: Date;
}

/**
 * Biodynamic calendar event
 */
export interface BiodynamicCalendarEvent {
  id: string;
  date: Date;
  type: 'PLANTING' | 'HARVEST' | 'PREPARATION' | 'REST' | 'CULTIVATION' | 'LUNAR';
  title: string;
  description: string;
  lunarPhase: LunarPhase;
  season: Season;
  recommendedCrops?: string[];
  recommendedActivities?: string[];
  significance: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Crop yield prediction
 */
export interface YieldPrediction {
  cropId: string;
  cropName: string;
  farmId: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  predictedYield: {
    min: number;
    expected: number;
    max: number;
    unit: string;
    confidence: number; // 0-100
  };
  factorsConsidered: {
    weather: boolean;
    soilHealth: boolean;
    historicalData: boolean;
    biodynamicAlignment: boolean;
  };
  risks: string[];
  opportunities: string[];
  predictionDate: Date;
  modelVersion: string;
}

/**
 * Farm analytics dashboard data
 */
export interface FarmAnalytics {
  farmId: string;
  timeframe: {
    start: Date;
    end: Date;
  };
  production: {
    totalYield: number;
    cropCount: number;
    averageYieldPerCrop: number;
    topPerformingCrops: string[];
  };
  financial: {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    profitMargin: number;
    revenuePerAcre: number;
  };
  sustainability: {
    biodynamicScore: number;
    sustainabilityScore: number;
    biodiversityIndex: number;
    carbonFootprint: number;
    waterUsage: number;
  };
  efficiency: {
    laborHours: number;
    revenuePerLaborHour: number;
    yieldPerAcre: number;
    inputCostPerAcre: number;
  };
  trends: {
    metric: string;
    direction: 'UP' | 'DOWN' | 'STABLE';
    change: number; // percentage
  }[];
}

/**
 * Crop performance metrics
 */
export interface CropPerformanceMetrics {
  cropId: string;
  cropName: string;
  farmId: string;
  season: Season;
  year: number;
  actualYield: number;
  expectedYield: number;
  yieldEfficiency: number; // percentage
  quality: {
    premium: number;
    standard: number;
    seconds: number;
  };
  revenue: number;
  costs: number;
  profit: number;
  roi: number; // percentage
  marketPerformance: {
    averagePrice: number;
    priceVsMarket: number; // percentage difference
    salesRate: number; // percentage sold
  };
  growingConditions: {
    weather: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    soilHealth: number;
    pestPressure: 'LOW' | 'MODERATE' | 'HIGH';
  };
  lessonsLearned: string[];
  recommendations: string[];
}

/**
 * Field management data
 */
export interface FieldManagement {
  fieldId: string;
  farmId: string;
  fieldName: string;
  size: number; // acres
  soilType: SoilType;
  soilHealth: SoilHealth;
  currentCrop?: string;
  cropHistory: {
    cropId: string;
    cropName: string;
    year: number;
    season: Season;
    yield: number;
  }[];
  lastFertilized?: Date;
  lastTilled?: Date;
  restPeriod?: {
    start: Date;
    end: Date;
    reason: string;
  };
  biodynamicTreatments: {
    preparation: string;
    date: Date;
    lunarPhase: LunarPhase;
  }[];
  notes?: string;
}

/**
 * Seasonal planning data
 */
export interface SeasonalPlan {
  id: string;
  farmId: string;
  season: Season;
  year: number;
  plannedCrops: {
    cropId: string;
    cropName: string;
    fieldId: string;
    acreage: number;
    plantingWindow: {
      start: Date;
      end: Date;
    };
    expectedYield: number;
    expectedRevenue: number;
  }[];
  totalAcreagePlanned: number;
  totalExpectedRevenue: number;
  totalExpectedCosts: number;
  projectedProfit: number;
  resourceNeeds: {
    labor: number; // hours
    water: number; // gallons
    inputs: string[];
  };
  riskAssessment: {
    weatherRisks: string[];
    marketRisks: string[];
    resourceRisks: string[];
    mitigationStrategies: string[];
  };
  status: 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Biodynamic preparation application record
 */
export interface PreparationApplication {
  id: string;
  farmId: string;
  fieldId?: string;
  preparationCode: string; // BD500, BD501, etc.
  applicationDate: Date;
  applicationTime: string;
  lunarPhase: LunarPhase;
  weather: string;
  dilution?: string;
  applicationMethod: string;
  areaApplied: number; // acres
  observedEffects?: string;
  nextApplicationDue?: Date;
  notes?: string;
}

/**
 * Educational resource
 */
export interface EducationalResource {
  id: string;
  title: string;
  category: 'BIODYNAMIC' | 'ORGANIC' | 'PERMACULTURE' | 'PEST_MANAGEMENT' | 'SOIL' | 'MARKETING';
  type: 'ARTICLE' | 'VIDEO' | 'GUIDE' | 'COURSE' | 'WEBINAR';
  description: string;
  content?: string;
  url?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration?: number; // minutes
  tags: string[];
  author: string;
  publishedDate: Date;
  ratings: {
    average: number;
    count: number;
  };
  views: number;
}

/**
 * API request/response types for crop recommendations
 */
export interface CropRecommendationRequest {
  farmId: string;
  season?: Season;
  preferences?: Partial<FarmerPreferences>;
  maxRecommendations?: number;
}

export interface CropRecommendationResponse {
  success: boolean;
  recommendations: CropRecommendation[];
  biodynamicContext: {
    season: Season;
    lunarPhase: LunarPhase;
    isOptimalPlanting: boolean;
  };
  metadata: {
    requestDate: Date;
    farmProfile: {
      farmId: string;
      hardinessZone: number;
      soilType: SoilType;
    };
  };
}

/**
 * API request/response for planting calendar
 */
export interface PlantingCalendarRequest {
  farmId: string;
  cropType?: CropType;
  startDate?: Date;
  daysAhead?: number;
}

export interface PlantingCalendarResponse {
  success: boolean;
  optimalWindows: {
    cropType: CropType;
    windows: {
      start: Date;
      end: Date;
      lunarPhase: LunarPhase;
      score: number;
      reason: string;
    }[];
  }[];
  currentContext: {
    date: Date;
    season: Season;
    lunarPhase: LunarPhase;
  };
}
