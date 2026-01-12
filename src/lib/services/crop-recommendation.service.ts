/**
 * 🌾 Crop Recommendation Engine
 *
 * Provides intelligent crop recommendations based on farm profile, market conditions,
 * and biodynamic principles. Includes scoring algorithms for profitability,
 * sustainability, and market demand.
 *
 * @module CropRecommendationService
 */

import {
  biodynamicCalendar,
  CropType,
  Season,
} from "./biodynamic-calendar.service";

export enum CropCategory {
  VEGETABLE = "VEGETABLE",
  FRUIT = "FRUIT",
  HERB = "HERB",
  GRAIN = "GRAIN",
  LEGUME = "LEGUME",
  ROOT = "ROOT",
  LEAFY_GREEN = "LEAFY_GREEN",
  FLOWER = "FLOWER",
}

export enum WaterLevel {
  LOW = "LOW",
  MODERATE = "MODERATE",
  HIGH = "HIGH",
}

export enum SunLevel {
  FULL_SUN = "FULL_SUN",
  PARTIAL_SHADE = "PARTIAL_SHADE",
  FULL_SHADE = "FULL_SHADE",
}

export enum SoilType {
  CLAY = "CLAY",
  SANDY = "SANDY",
  LOAMY = "LOAMY",
  SILTY = "SILTY",
  PEATY = "PEATY",
  CHALKY = "CHALKY",
}

export interface CropProfile {
  id: string;
  name: string;
  scientificName: string;
  category: CropCategory;
  cropType: CropType;
  growingSeasons: Season[];
  daysToMaturity: { min: number; max: number };
  hardinessZones: number[];
  waterRequirements: WaterLevel;
  sunRequirements: SunLevel;
  soilPreferences: SoilType[];
  companionPlants: string[];
  antagonistPlants: string[];
  pests: string[];
  diseases: string[];
  averageYieldPerAcre: number; // lbs
  marketPricePerLb: number; // USD
  inputCostPerAcre: number; // USD
  laborHoursPerAcre: number;
  storageLife: number; // days
  organicPremium: number; // percentage (e.g., 1.3 = 30% premium)
}

export interface FarmProfile {
  id: string;
  location: {
    latitude: number;
    longitude: number;
    hardinessZone: number;
  };
  farmSize: number; // acres
  soilType: SoilType;
  waterAvailability: WaterLevel;
  sunExposure: SunLevel;
  isOrganic: boolean;
  isBiodynamic: boolean;
  previousCrops: string[];
  equipmentAvailable: string[];
  laborCapacity: number; // hours per week
  budgetPerAcre: number; // USD
}

export interface FarmerPreferences {
  prioritizeOrganic: boolean;
  prioritizeProfit: boolean;
  prioritizeSustainability: boolean;
  riskTolerance: "LOW" | "MEDIUM" | "HIGH";
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
  marketAccess: "LOCAL" | "REGIONAL" | "NATIONAL";
}

export interface CropRecommendation {
  crop: CropProfile;
  overallScore: number;
  profitabilityScore: number;
  sustainabilityScore: number;
  marketDemandScore: number;
  suitabilityScore: number;
  plantingWindow: {
    start: Date;
    end: Date;
    optimal: boolean;
  };
  expectedYield: {
    min: number;
    max: number;
    unit: string;
  };
  expectedRevenue: {
    min: number;
    max: number;
    breakEven: number;
  };
  riskFactors: string[];
  strengths: string[];
  recommendations: string[];
}

export interface MarketData {
  cropId: string;
  averagePrice: number;
  priceVolatility: number; // 0-1
  demandIndex: number; // 0-100
  supplyIndex: number; // 0-100
  trendDirection: "INCREASING" | "STABLE" | "DECREASING";
  seasonalPriceFactor: number; // multiplier
  competitionLevel: "LOW" | "MEDIUM" | "HIGH";
}

/**
 * Crop Recommendation Engine
 * Provides intelligent crop suggestions with comprehensive scoring
 */
export class CropRecommendationService {
  /**
   * Get crop recommendations for a farm
   */
  async getRecommendations(
    farmProfile: FarmProfile,
    preferences: FarmerPreferences,
    marketDataMap: Map<string, MarketData>,
  ): Promise<CropRecommendation[]> {
    const season = biodynamicCalendar.getCurrentSeason();
    const eligibleCrops = this.filterEligibleCrops(farmProfile, season);

    const recommendations = eligibleCrops.map((crop) =>
      this.createRecommendation(
        crop,
        farmProfile,
        preferences,
        marketDataMap,
        season,
      ),
    );

    // Sort by overall score
    recommendations.sort((a, b) => b.overallScore - a.overallScore);

    return recommendations;
  }

  /**
   * Create a comprehensive recommendation for a crop
   */
  private createRecommendation(
    crop: CropProfile,
    farmProfile: FarmProfile,
    preferences: FarmerPreferences,
    marketDataMap: Map<string, MarketData>,
    season: Season,
  ): CropRecommendation {
    const marketData = marketDataMap.get(crop.id);

    // Calculate individual scores
    const profitabilityScore = this.calculateProfitabilityScore(
      crop,
      farmProfile,
      marketData,
    );
    const sustainabilityScore = this.calculateSustainabilityScore(
      crop,
      farmProfile,
    );
    const marketDemandScore = this.calculateMarketDemandScore(
      crop,
      marketData,
      farmProfile,
    );
    const suitabilityScore = this.calculateSuitabilityScore(crop, farmProfile);

    // Calculate weighted overall score based on preferences
    const overallScore = this.calculateOverallScore(
      profitabilityScore,
      sustainabilityScore,
      marketDemandScore,
      suitabilityScore,
      preferences,
    );

    // Calculate planting window
    const plantingWindow = this.calculatePlantingWindow(crop, season);

    // Calculate expected yield
    const expectedYield = this.calculateExpectedYield(crop, farmProfile);

    // Calculate expected revenue
    const expectedRevenue = this.calculateExpectedRevenue(
      crop,
      expectedYield,
      marketData,
      farmProfile,
    );

    // Identify risk factors and strengths
    const riskFactors = this.identifyRiskFactors(crop, farmProfile, marketData);
    const strengths = this.identifyStrengths(crop, farmProfile, marketData);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      crop,
      farmProfile,
      marketData,
    );

    return {
      crop,
      overallScore,
      profitabilityScore,
      sustainabilityScore,
      marketDemandScore,
      suitabilityScore,
      plantingWindow,
      expectedYield,
      expectedRevenue,
      riskFactors,
      strengths,
      recommendations,
    };
  }

  /**
   * Calculate profitability score (0-100)
   * Factors: revenue potential, input costs, labor efficiency, market price, storage
   */
  calculateProfitabilityScore(
    crop: CropProfile,
    farmProfile: FarmProfile,
    marketData?: MarketData,
  ): number {
    let score = 0;

    // Revenue potential (0-30 points)
    const baseRevenue = crop.averageYieldPerAcre * crop.marketPricePerLb;
    const organicMultiplier = farmProfile.isOrganic ? crop.organicPremium : 1;
    const potentialRevenue = baseRevenue * organicMultiplier;

    if (potentialRevenue > 10000) score += 30;
    else if (potentialRevenue > 5000) score += 25;
    else if (potentialRevenue > 2500) score += 20;
    else score += 15;

    // Cost efficiency (0-25 points)
    const profitMargin =
      (potentialRevenue - crop.inputCostPerAcre) / potentialRevenue;

    if (profitMargin > 0.7) score += 25;
    else if (profitMargin > 0.5) score += 20;
    else if (profitMargin > 0.3) score += 15;
    else if (profitMargin > 0.1) score += 10;
    else score += 5;

    // Labor efficiency (0-20 points)
    const revenuePerLaborHour = potentialRevenue / crop.laborHoursPerAcre;

    if (revenuePerLaborHour > 100) score += 20;
    else if (revenuePerLaborHour > 50) score += 15;
    else if (revenuePerLaborHour > 25) score += 10;
    else score += 5;

    // Market price stability (0-15 points)
    if (marketData) {
      const priceStability = 1 - marketData.priceVolatility;
      score += priceStability * 15;
    } else {
      score += 10; // Default moderate score
    }

    // Storage and preservation value (0-10 points)
    if (crop.storageLife > 90) score += 10;
    else if (crop.storageLife > 30) score += 7;
    else if (crop.storageLife > 7) score += 4;
    else score += 2;

    return Math.round(Math.min(100, score));
  }

  /**
   * Calculate sustainability score (0-100)
   * Factors: water usage, soil impact, biodiversity, input requirements, carbon footprint
   */
  calculateSustainabilityScore(
    crop: CropProfile,
    farmProfile: FarmProfile,
  ): number {
    let score = 50; // Base score

    // Water efficiency (0-20 points)
    if (crop.waterRequirements === WaterLevel.LOW) {
      score += 20;
    } else if (crop.waterRequirements === WaterLevel.MODERATE) {
      score += 12;
    } else {
      score += 5;
    }

    // Bonus if water requirements match farm availability
    if (crop.waterRequirements === farmProfile.waterAvailability) {
      score += 5;
    }

    // Soil health impact (0-20 points)
    if (crop.category === CropCategory.LEGUME) {
      score += 20; // Nitrogen fixing
    } else if (crop.category === CropCategory.ROOT) {
      score += 10; // Helps break up soil
    } else if (crop.category === CropCategory.LEAFY_GREEN) {
      score += 15; // Quick rotation, less soil depletion
    }

    // Biodiversity contribution (0-15 points)
    const companionCount = crop.companionPlants.length;
    if (companionCount > 10) score += 15;
    else if (companionCount > 5) score += 10;
    else score += 5;

    // Input requirements (0-15 points)
    const inputCostRatio = crop.inputCostPerAcre / 1000; // Normalized
    if (inputCostRatio < 0.5) score += 15;
    else if (inputCostRatio < 1) score += 10;
    else if (inputCostRatio < 2) score += 5;

    // Organic/biodynamic bonus (0-10 points)
    if (farmProfile.isBiodynamic) {
      score += 10;
    } else if (farmProfile.isOrganic) {
      score += 7;
    }

    // Pest resistance (0-10 points)
    const pestCount = crop.pests.length;
    if (pestCount < 3) score += 10;
    else if (pestCount < 6) score += 7;
    else if (pestCount < 10) score += 4;

    // Crop rotation benefit (0-10 points)
    if (!farmProfile.previousCrops.includes(crop.id)) {
      score += 10; // New crop, good for rotation
    } else {
      score += 3; // Previously grown
    }

    return Math.round(Math.min(100, score));
  }

  /**
   * Calculate market demand score (0-100)
   * Factors: current demand, price trends, competition, seasonal factors, consumer preferences
   */
  calculateMarketDemandScore(
    crop: CropProfile,
    marketData: MarketData | undefined,
    farmProfile: FarmProfile,
  ): number {
    let score = 50; // Base score

    if (!marketData) {
      // Fallback scoring based on crop category
      return this.getDefaultMarketScore(crop, farmProfile);
    }

    // Demand index (0-25 points)
    score += (marketData.demandIndex / 100) * 25;

    // Supply-demand balance (0-20 points)
    const demandSupplyRatio =
      marketData.demandIndex / Math.max(marketData.supplyIndex, 1);
    if (demandSupplyRatio > 1.5)
      score += 20; // High demand, low supply
    else if (demandSupplyRatio > 1.2) score += 15;
    else if (demandSupplyRatio > 0.8) score += 10;
    else score += 5;

    // Price trend (0-20 points)
    if (marketData.trendDirection === "INCREASING") {
      score += 20;
    } else if (marketData.trendDirection === "STABLE") {
      score += 12;
    } else {
      score += 5;
    }

    // Competition level (0-15 points)
    if (marketData.competitionLevel === "LOW") {
      score += 15;
    } else if (marketData.competitionLevel === "MEDIUM") {
      score += 10;
    } else {
      score += 5;
    }

    // Seasonal factor (0-10 points)
    score += (marketData.seasonalPriceFactor - 1) * 100; // Converts multiplier to bonus

    // Organic premium market (0-10 points)
    if (farmProfile.isOrganic && crop.organicPremium > 1.2) {
      score += 10;
    } else if (farmProfile.isOrganic) {
      score += 5;
    }

    return Math.round(Math.min(100, score));
  }

  /**
   * Calculate suitability score (0-100)
   * Factors: climate match, soil match, water match, experience level, equipment
   */
  private calculateSuitabilityScore(
    crop: CropProfile,
    farmProfile: FarmProfile,
  ): number {
    let score = 0;

    // Hardiness zone match (0-25 points)
    if (crop.hardinessZones.includes(farmProfile.location.hardinessZone)) {
      score += 25;
    } else {
      const closestZone = crop.hardinessZones.reduce((prev, curr) =>
        Math.abs(curr - farmProfile.location.hardinessZone) <
        Math.abs(prev - farmProfile.location.hardinessZone)
          ? curr
          : prev,
      );
      const zoneDiff = Math.abs(
        closestZone - farmProfile.location.hardinessZone,
      );
      score += Math.max(0, 25 - zoneDiff * 5);
    }

    // Soil compatibility (0-20 points)
    if (crop.soilPreferences.includes(farmProfile.soilType)) {
      score += 20;
    } else {
      score += 8; // Partial credit
    }

    // Water availability match (0-20 points)
    const waterMatch = this.getWaterMatchScore(
      crop.waterRequirements,
      farmProfile.waterAvailability,
    );
    score += waterMatch;

    // Sun exposure match (0-15 points)
    const sunMatch = this.getSunMatchScore(
      crop.sunRequirements,
      farmProfile.sunExposure,
    );
    score += sunMatch;

    // Labor capacity (0-10 points)
    const requiredLaborPerWeek =
      (crop.laborHoursPerAcre * farmProfile.farmSize) / 16; // Assuming 16-week season
    if (requiredLaborPerWeek <= farmProfile.laborCapacity) {
      score += 10;
    } else {
      const ratio = farmProfile.laborCapacity / requiredLaborPerWeek;
      score += ratio * 10;
    }

    // Budget alignment (0-10 points)
    if (crop.inputCostPerAcre <= farmProfile.budgetPerAcre) {
      score += 10;
    } else {
      const ratio = farmProfile.budgetPerAcre / crop.inputCostPerAcre;
      score += ratio * 10;
    }

    return Math.round(Math.min(100, score));
  }

  /**
   * Calculate overall score based on weighted preferences
   */
  private calculateOverallScore(
    profitabilityScore: number,
    sustainabilityScore: number,
    marketDemandScore: number,
    suitabilityScore: number,
    preferences: FarmerPreferences,
  ): number {
    const weights = {
      profitability: 0.25,
      sustainability: 0.25,
      marketDemand: 0.25,
      suitability: 0.25,
    };

    // Adjust weights based on preferences
    if (preferences.prioritizeProfit) {
      weights.profitability = 0.4;
      weights.sustainability = 0.2;
      weights.marketDemand = 0.25;
      weights.suitability = 0.15;
    }

    if (preferences.prioritizeSustainability) {
      weights.sustainability = 0.4;
      weights.profitability = 0.2;
      weights.marketDemand = 0.2;
      weights.suitability = 0.2;
    }

    const overall =
      profitabilityScore * weights.profitability +
      sustainabilityScore * weights.sustainability +
      marketDemandScore * weights.marketDemand +
      suitabilityScore * weights.suitability;

    return Math.round(overall);
  }

  /**
   * Filter crops that are suitable for the farm
   */
  private filterEligibleCrops(
    farmProfile: FarmProfile,
    season: Season,
  ): CropProfile[] {
    // In production, this would query a database
    // For now, return sample crops
    return this.getSampleCrops().filter((crop) => {
      // Must be in growing season
      if (!crop.growingSeasons.includes(season)) return false;

      // Must be in hardiness zone or close
      const closestZone = crop.hardinessZones.reduce((prev, curr) =>
        Math.abs(curr - farmProfile.location.hardinessZone) <
        Math.abs(prev - farmProfile.location.hardinessZone)
          ? curr
          : prev,
      );
      if (Math.abs(closestZone - farmProfile.location.hardinessZone) > 2)
        return false;

      // Must be within budget (with some tolerance)
      if (crop.inputCostPerAcre > farmProfile.budgetPerAcre * 1.5) return false;

      return true;
    });
  }

  /**
   * Calculate planting window
   */
  private calculatePlantingWindow(
    crop: CropProfile,
    season: Season,
  ): {
    start: Date;
    end: Date;
    optimal: boolean;
  } {
    const today = new Date();
    const start = new Date(today);
    const end = new Date(today);
    end.setDate(end.getDate() + 30); // 30-day window

    // Check if currently optimal based on lunar calendar
    const windows = biodynamicCalendar.getOptimalPlantingDays(
      crop.cropType,
      30,
      start,
    );
    const optimal = windows.length > 0;

    if (optimal && windows[0]) {
      return {
        start: windows[0].start,
        end: windows[0].end,
        optimal: true,
      };
    }

    return { start, end, optimal: false };
  }

  /**
   * Calculate expected yield
   */
  private calculateExpectedYield(
    crop: CropProfile,
    farmProfile: FarmProfile,
  ): {
    min: number;
    max: number;
    unit: string;
  } {
    const baseYield = crop.averageYieldPerAcre * farmProfile.farmSize;

    // Adjust for organic farming (typically 20% less yield but higher price)
    const organicFactor = farmProfile.isOrganic ? 0.8 : 1.0;

    return {
      min: Math.round(baseYield * 0.7 * organicFactor),
      max: Math.round(baseYield * 1.3 * organicFactor),
      unit: "lbs",
    };
  }

  /**
   * Calculate expected revenue
   */
  private calculateExpectedRevenue(
    crop: CropProfile,
    expectedYield: { min: number; max: number },
    marketData: MarketData | undefined,
    farmProfile: FarmProfile,
  ): {
    min: number;
    max: number;
    breakEven: number;
  } {
    const price = marketData?.averagePrice ?? crop.marketPricePerLb;
    const organicMultiplier = farmProfile.isOrganic ? crop.organicPremium : 1;
    const effectivePrice = price * organicMultiplier;

    const totalCosts = crop.inputCostPerAcre * farmProfile.farmSize;

    return {
      min: Math.round(expectedYield.min * effectivePrice),
      max: Math.round(expectedYield.max * effectivePrice),
      breakEven: Math.round(totalCosts),
    };
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(
    crop: CropProfile,
    farmProfile: FarmProfile,
    marketData?: MarketData,
  ): string[] {
    const risks: string[] = [];

    if (
      marketData &&
      marketData.priceVolatility &&
      marketData.priceVolatility > 0.3
    ) {
      risks.push("High price volatility in current market");
    }

    if (crop.pests.length > 8) {
      risks.push(`Susceptible to ${crop.pests.length} common pests`);
    }

    if (crop.diseases.length > 5) {
      risks.push(`Vulnerable to ${crop.diseases.length} diseases`);
    }

    if (crop.storageLife < 7) {
      risks.push("Short storage life requires immediate sale");
    }

    if (!crop.soilPreferences.includes(farmProfile.soilType)) {
      risks.push("Soil type not ideal for this crop");
    }

    if (
      crop.waterRequirements === WaterLevel.HIGH &&
      farmProfile.waterAvailability !== WaterLevel.HIGH
    ) {
      risks.push("High water requirements may strain resources");
    }

    if (marketData?.competitionLevel === "HIGH") {
      risks.push("High competition in market");
    }

    return risks;
  }

  /**
   * Identify strengths
   */
  private identifyStrengths(
    crop: CropProfile,
    farmProfile: FarmProfile,
    marketData?: MarketData,
  ): string[] {
    const strengths: string[] = [];

    if (crop.soilPreferences.includes(farmProfile.soilType)) {
      strengths.push("Excellent soil compatibility");
    }

    if (marketData?.trendDirection === "INCREASING") {
      strengths.push("Rising market demand");
    }

    if (crop.organicPremium > 1.3 && farmProfile.isOrganic) {
      strengths.push("Strong organic price premium");
    }

    if (crop.companionPlants.length > 10) {
      strengths.push("Many companion planting options");
    }

    if (crop.storageLife > 90) {
      strengths.push("Long storage life provides flexibility");
    }

    if (crop.category === CropCategory.LEGUME) {
      strengths.push("Improves soil nitrogen naturally");
    }

    if (marketData?.competitionLevel === "LOW") {
      strengths.push("Limited competition in market");
    }

    return strengths;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    crop: CropProfile,
    farmProfile: FarmProfile,
    marketData?: MarketData,
  ): string[] {
    const recommendations: string[] = [];

    // Companion planting
    if (crop.companionPlants.length > 0) {
      recommendations.push(
        `Consider companion planting with: ${crop.companionPlants.slice(0, 3).join(", ")}`,
      );
    }

    // Timing
    const isOptimal = biodynamicCalendar.isOptimalPlantingDate(crop.cropType);
    if (isOptimal) {
      recommendations.push("Current lunar phase is optimal for planting");
    } else {
      const nextDate = biodynamicCalendar.getNextOptimalPlantingDate(
        crop.cropType,
      );
      if (nextDate) {
        recommendations.push(
          `Wait until ${nextDate.toLocaleDateString()} for optimal planting conditions`,
        );
      }
    }

    // Market timing
    if (
      marketData &&
      marketData.seasonalPriceFactor &&
      marketData.seasonalPriceFactor > 1.2
    ) {
      recommendations.push("Market prices are currently favorable");
    }

    // Soil preparation
    if (!crop.soilPreferences.includes(farmProfile.soilType)) {
      recommendations.push("Soil amendment recommended before planting");
    }

    // Pest management
    if (crop.pests.length > 5) {
      recommendations.push("Implement integrated pest management early");
    }

    return recommendations;
  }

  /**
   * Helper: Water match scoring
   */
  private getWaterMatchScore(
    required: WaterLevel,
    available: WaterLevel,
  ): number {
    if (required === available) return 20;

    const levels = [WaterLevel.LOW, WaterLevel.MODERATE, WaterLevel.HIGH];
    const reqIndex = levels.indexOf(required);
    const availIndex = levels.indexOf(available);
    const diff = Math.abs(reqIndex - availIndex);

    return Math.max(0, 20 - diff * 10);
  }

  /**
   * Helper: Sun match scoring
   */
  private getSunMatchScore(required: SunLevel, available: SunLevel): number {
    if (required === available) return 15;

    const levels = [
      SunLevel.FULL_SHADE,
      SunLevel.PARTIAL_SHADE,
      SunLevel.FULL_SUN,
    ];
    const reqIndex = levels.indexOf(required);
    const availIndex = levels.indexOf(available);
    const diff = Math.abs(reqIndex - availIndex);

    return Math.max(0, 15 - diff * 7);
  }

  /**
   * Default market score when real data unavailable
   */
  private getDefaultMarketScore(
    crop: CropProfile,
    farmProfile: FarmProfile,
  ): number {
    let score = 50;

    // High-value crops
    if (crop.marketPricePerLb > 5) score += 20;
    else if (crop.marketPricePerLb > 2) score += 10;

    // Organic premium
    if (farmProfile.isOrganic && crop.organicPremium > 1.2) score += 15;

    // Popular categories
    if (
      [CropCategory.VEGETABLE, CropCategory.HERB, CropCategory.FRUIT].includes(
        crop.category,
      )
    ) {
      score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Sample crops for demonstration
   * In production, this would come from a database
   */
  private getSampleCrops(): CropProfile[] {
    return [
      {
        id: "tomato-1",
        name: "Tomato",
        scientificName: "Solanum lycopersicum",
        category: CropCategory.VEGETABLE,
        cropType: CropType.FRUIT,
        growingSeasons: [Season.SPRING, Season.SUMMER],
        daysToMaturity: { min: 60, max: 85 },
        hardinessZones: [3, 4, 5, 6, 7, 8, 9, 10],
        waterRequirements: WaterLevel.MODERATE,
        sunRequirements: SunLevel.FULL_SUN,
        soilPreferences: [SoilType.LOAMY, SoilType.SANDY],
        companionPlants: ["basil", "carrot", "onion", "parsley", "marigold"],
        antagonistPlants: ["potato", "fennel", "cabbage"],
        pests: ["aphids", "hornworm", "whitefly"],
        diseases: ["blight", "wilt", "leaf spot"],
        averageYieldPerAcre: 25000,
        marketPricePerLb: 2.5,
        inputCostPerAcre: 3500,
        laborHoursPerAcre: 120,
        storageLife: 14,
        organicPremium: 1.4,
      },
      {
        id: "lettuce-1",
        name: "Lettuce",
        scientificName: "Lactuca sativa",
        category: CropCategory.LEAFY_GREEN,
        cropType: CropType.LEAFY,
        growingSeasons: [Season.SPRING, Season.FALL],
        daysToMaturity: { min: 45, max: 65 },
        hardinessZones: [4, 5, 6, 7, 8, 9],
        waterRequirements: WaterLevel.MODERATE,
        sunRequirements: SunLevel.PARTIAL_SHADE,
        soilPreferences: [SoilType.LOAMY, SoilType.SILTY],
        companionPlants: ["carrot", "radish", "strawberry", "cucumber"],
        antagonistPlants: ["parsley"],
        pests: ["aphids", "slugs", "cutworms"],
        diseases: ["downy mildew", "bottom rot"],
        averageYieldPerAcre: 18000,
        marketPricePerLb: 3.0,
        inputCostPerAcre: 2500,
        laborHoursPerAcre: 80,
        storageLife: 7,
        organicPremium: 1.5,
      },
      {
        id: "carrot-1",
        name: "Carrot",
        scientificName: "Daucus carota",
        category: CropCategory.ROOT,
        cropType: CropType.ROOT,
        growingSeasons: [Season.SPRING, Season.FALL],
        daysToMaturity: { min: 70, max: 80 },
        hardinessZones: [3, 4, 5, 6, 7, 8, 9],
        waterRequirements: WaterLevel.MODERATE,
        sunRequirements: SunLevel.FULL_SUN,
        soilPreferences: [SoilType.SANDY, SoilType.LOAMY],
        companionPlants: ["onion", "leek", "lettuce", "tomato", "peas"],
        antagonistPlants: ["dill", "parsnip"],
        pests: ["carrot fly", "aphids", "wireworms"],
        diseases: ["leaf blight", "root rot"],
        averageYieldPerAcre: 20000,
        marketPricePerLb: 1.8,
        inputCostPerAcre: 2000,
        laborHoursPerAcre: 100,
        storageLife: 90,
        organicPremium: 1.3,
      },
    ];
  }
}

// Singleton instance
export const cropRecommendationEngine = new CropRecommendationService();
