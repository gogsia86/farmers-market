/**
 * Agricultural Utilities
 * Helper functions for agricultural operations
 */

import { 
  AgriculturalState,
  SeasonalState,
  GrowthMatrix,
  YieldProjection,
  Season,
  WeatherConditions,
  NutrientLevels
} from '../../core/agricultural/AgriculturalPatterns';

export function calculateYieldProjection(
  growth: GrowthMatrix,
  seasonal: SeasonalState,
  historical: YieldProjection[] = []
): YieldProjection {
  const baseYield = calculateBaseYield(growth);
  const seasonalFactor = calculateSeasonalFactor(seasonal);
  const historicalFactor = calculateHistoricalFactor(historical);

  const estimated = baseYield * seasonalFactor * historicalFactor;
  const confidence = calculateConfidence(growth, seasonal, historical);

  return {
    estimated,
    confidence,
    factors: [
      { name: 'growth', impact: growth.health, confidence: 1.0 },
      { name: 'seasonal', impact: seasonalFactor, confidence: 0.8 },
      { name: 'historical', impact: historicalFactor, confidence: 0.7 }
    ]
  };
}

export function optimizeGrowthConditions(
  current: GrowthMatrix,
  weather: WeatherConditions,
  nutrients: NutrientLevels
): GrowthMatrix {
  const healthAdjustment = calculateHealthAdjustment(weather, nutrients);
  
  return {
    stage: current.stage,
    health: Math.min(1.0, current.health + healthAdjustment),
    nutrients: optimizeNutrients(nutrients, current.stage)
  };
}

function calculateBaseYield(growth: GrowthMatrix): number {
  return growth.health * 100; // Base yield of 100 units at perfect health
}

function calculateSeasonalFactor(seasonal: SeasonalState): number {
  const seasonFactors: Record<Season, number> = {
    spring: 1.2,
    summer: 1.5,
    autumn: 1.0,
    winter: 0.7
  };

  return seasonFactors[seasonal.currentSeason] * seasonal.conditions.rainfall / 100;
}

function calculateHistoricalFactor(historical: YieldProjection[]): number {
  if (historical.length === 0) return 1.0;
  
  const averageYield = historical.reduce((acc, h) => acc + h.estimated, 0) / historical.length;
  return Math.max(0.8, Math.min(1.2, averageYield / 100));
}

function calculateConfidence(
  growth: GrowthMatrix,
  seasonal: SeasonalState,
  historical: YieldProjection[]
): number {
  const growthConfidence = growth.health;
  const seasonalConfidence = 0.8; // Fixed confidence in seasonal predictions
  const historicalConfidence = historical.length > 0 ? 0.7 : 0.5;

  return (growthConfidence + seasonalConfidence + historicalConfidence) / 3;
}

function calculateHealthAdjustment(
  weather: WeatherConditions,
  nutrients: NutrientLevels
): number {
  const weatherFactor = (
    normalizeTemperature(weather.temperature) +
    normalizeHumidity(weather.humidity) +
    normalizeRainfall(weather.rainfall)
  ) / 3;

  const nutrientFactor = (
    nutrients.nitrogen +
    nutrients.phosphorus +
    nutrients.potassium
  ) / 3;

  return (weatherFactor + nutrientFactor) / 2;
}

function optimizeNutrients(
  current: NutrientLevels,
  stage: string
): NutrientLevels {
  // Adjust nutrients based on growth stage
  const adjustmentFactor = stage === 'growth' ? 1.2 : 
                          stage === 'flower' ? 1.5 :
                          stage === 'fruit' ? 1.3 : 1.0;

  return {
    nitrogen: Math.min(1.0, current.nitrogen * adjustmentFactor),
    phosphorus: Math.min(1.0, current.phosphorus * adjustmentFactor),
    potassium: Math.min(1.0, current.potassium * adjustmentFactor)
  };
}

function normalizeTemperature(temp: number): number {
  // Normalize temperature to 0-1 range, assuming optimal range is 15-25°C
  return Math.max(0, Math.min(1, 1 - Math.abs(temp - 20) / 10));
}

function normalizeHumidity(humidity: number): number {
  // Normalize humidity to 0-1 range, assuming optimal range is 40-60%
  return Math.max(0, Math.min(1, 1 - Math.abs(humidity - 50) / 20));
}

function normalizeRainfall(rainfall: number): number {
  // Normalize rainfall to 0-1 range, assuming optimal range is 60-100mm
  return Math.max(0, Math.min(1, rainfall / 100));
}