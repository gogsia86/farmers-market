// src/lib/services/harvest-tracking.service.ts

/**
 * Harvest Tracking Service
 *
 * Comprehensive service for managing harvest records, yield predictions,
 * and ML-based yield forecasting for the Farmers Market Platform.
 *
 * Features:
 * - Record actual harvest data
 * - Track yield predictions vs actuals
 * - Generate ML training data from harvest records
 * - Provide harvest analytics and insights
 * - Biodynamic calendar integration
 * - Quality tracking and grading
 */

import { database } from "@/lib/database";
import { logger } from "@/lib/monitoring/logger";
import { biodynamicCalendar } from "@/lib/services/biodynamic-calendar.service";
import { weatherService } from "@/lib/services/weather.service";
import type {
  HarvestQuality,
  HarvestRecord,
  LunarPhase,
  Prisma,
  Season,
  YieldPrediction,
} from "@prisma/client";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CreateHarvestRecordInput {
  farmId: string;
  cropId: string;
  scheduleId?: string;
  predictionId?: string;
  harvestDate: Date;
  fieldName: string;
  fieldSize?: number;
  fieldSizeUnit?: string;
  totalYield: number;
  yieldUnit: string;
  quality: HarvestQuality;
  gradeSplit?: Record<string, number>;
  laborHours?: number;
  laborCost?: number;
  equipmentUsed?: string[];
  totalCost?: number;
  marketValue?: number;
  temperature?: number;
  humidity?: number;
  rainfall7Days?: number;
  diseasePresent?: boolean;
  diseaseName?: string;
  pestDamage?: boolean;
  pestName?: string;
  plantHealthScore?: number;
  soilMoisture?: number;
  soilPH?: number;
  soilNitrogen?: number;
  soilPhosphorus?: number;
  soilPotassium?: number;
  notes?: string;
  challenges?: string[];
  successes?: string[];
  lessonsLearned?: string;
  photos?: string[];
  documents?: string[];
  recordedBy?: string;
}

export interface HarvestAnalytics {
  totalHarvests: number;
  totalYield: number;
  averageYield: number;
  yieldUnit: string;
  qualityDistribution: Record<HarvestQuality, number>;
  topCrops: Array<{
    cropId: string;
    cropName: string;
    totalYield: number;
    averageQuality: number;
    harvestCount: number;
  }>;
  seasonalPerformance: Record<
    Season,
    {
      harvestCount: number;
      averageYield: number;
      averageQuality: number;
    }
  >;
  predictionAccuracy: {
    totalPredictions: number;
    accuratePredictions: number;
    averageError: number;
    rmse: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    totalCost: number;
    profit: number;
    roi: number;
  };
}

export interface YieldPredictionInput {
  farmId: string;
  cropId: string;
  plantingDate: Date;
  predictedHarvestDate: Date;
  fieldSize?: number;
  weatherData?: any;
  soilData?: any;
  biodynamicFactors?: any;
}

export interface HarvestInsights {
  bestPerformingCrops: string[];
  optimalHarvestWindows: Array<{
    season: Season;
    lunarPhase: LunarPhase;
    qualityScore: number;
  }>;
  improvementRecommendations: string[];
  riskFactors: string[];
}

// ============================================================================
// Harvest Tracking Service
// ============================================================================

export class HarvestTrackingService {
  /**
   * Create a new harvest record
   */
  async createHarvestRecord(
    input: CreateHarvestRecordInput,
  ): Promise<HarvestRecord> {
    try {
      // Get current season and lunar phase
      const season = biodynamicCalendar.getCurrentSeason();
      const lunarPhase = biodynamicCalendar.getCurrentLunarPhase();

      // Get weather data if not provided
      let weatherData = null;
      if (!input.temperature || !input.humidity) {
        try {
          const farm = await database.farm.findUnique({
            where: { id: input.farmId },
            select: { latitude: true, longitude: true },
          });

          if (farm) {
            weatherData = await weatherService.getCurrentWeather({
              lat: Number(farm.latitude),
              lng: Number(farm.longitude),
            });
          }
        } catch (error) {
          logger.warn("Failed to fetch weather data for harvest record", {
            error,
          });
        }
      }

      // Calculate yield per area if field size provided
      const yieldPerArea = input.fieldSize
        ? input.totalYield / input.fieldSize
        : null;

      // Create harvest record
      const harvestRecord = await database.harvestRecord.create({
        data: {
          farmId: input.farmId,
          cropId: input.cropId,
          scheduleId: input.scheduleId,
          predictionId: input.predictionId,
          harvestDate: input.harvestDate,
          fieldName: input.fieldName,
          fieldSize: input.fieldSize,
          fieldSizeUnit: input.fieldSizeUnit,
          totalYield: input.totalYield,
          yieldUnit: input.yieldUnit,
          yieldPerArea,
          quality: input.quality,
          gradeSplit: input.gradeSplit as Prisma.InputJsonValue,
          laborHours: input.laborHours,
          laborCost: input.laborCost,
          equipmentUsed: input.equipmentUsed,
          totalCost: input.totalCost,
          marketValue: input.marketValue,
          temperature: input.temperature ?? weatherData?.temperature,
          humidity: input.humidity ?? weatherData?.humidity,
          rainfall7Days: input.rainfall7Days,
          lunarPhase,
          season,
          diseasePresent: input.diseasePresent ?? false,
          diseaseName: input.diseaseName,
          pestDamage: input.pestDamage ?? false,
          pestName: input.pestName,
          plantHealthScore: input.plantHealthScore,
          soilMoisture: input.soilMoisture,
          soilPH: input.soilPH,
          soilNitrogen: input.soilNitrogen,
          soilPhosphorus: input.soilPhosphorus,
          soilPotassium: input.soilPotassium,
          notes: input.notes,
          challenges: input.challenges,
          successes: input.successes,
          lessonsLearned: input.lessonsLearned,
          photos: input.photos,
          documents: input.documents,
          recordedBy: input.recordedBy,
        },
        include: {
          crop: true,
          farm: true,
          prediction: true,
        },
      });

      // Update prediction with actual results if prediction exists
      if (input.predictionId) {
        await this.updatePredictionWithActuals(
          input.predictionId,
          harvestRecord,
        );
      }

      // Update harvest schedule if exists
      if (input.scheduleId) {
        await this.updateScheduleWithActuals(input.scheduleId, harvestRecord);
      }

      // Generate ML training data asynchronously
      this.generateMLTrainingData(harvestRecord).catch((error) => {
        logger.error("Failed to generate ML training data", {
          error,
          harvestRecordId: harvestRecord.id,
        });
      });

      logger.info("Harvest record created", {
        harvestRecordId: harvestRecord.id,
        farmId: input.farmId,
        cropId: input.cropId,
        totalYield: input.totalYield,
      });

      return harvestRecord;
    } catch (error) {
      logger.error("Failed to create harvest record", { error, input });
      throw error;
    }
  }

  /**
   * Get harvest records for a farm
   */
  async getHarvestRecords(
    farmId: string,
    filters?: {
      cropId?: string;
      season?: Season;
      startDate?: Date;
      endDate?: Date;
      quality?: HarvestQuality;
      limit?: number;
      offset?: number;
    },
  ): Promise<HarvestRecord[]> {
    const where: Prisma.HarvestRecordWhereInput = {
      farmId,
      ...(filters?.cropId && { cropId: filters.cropId }),
      ...(filters?.season && { season: filters.season }),
      ...(filters?.quality && { quality: filters.quality }),
      ...(filters?.startDate || filters?.endDate
        ? {
            harvestDate: {
              ...(filters.startDate && { gte: filters.startDate }),
              ...(filters.endDate && { lte: filters.endDate }),
            },
          }
        : {}),
    };

    return database.harvestRecord.findMany({
      where,
      include: {
        crop: {
          select: {
            id: true,
            name: true,
            category: true,
            cropFamily: true,
          },
        },
        prediction: true,
      },
      orderBy: { harvestDate: "desc" },
      take: filters?.limit ?? 50,
      skip: filters?.offset ?? 0,
    });
  }

  /**
   * Get harvest analytics for a farm
   */
  async getHarvestAnalytics(
    farmId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      cropId?: string;
    },
  ): Promise<HarvestAnalytics> {
    const where: Prisma.HarvestRecordWhereInput = {
      farmId,
      ...(options?.cropId && { cropId: options.cropId }),
      ...(options?.startDate || options?.endDate
        ? {
            harvestDate: {
              ...(options.startDate && { gte: options.startDate }),
              ...(options.endDate && { lte: options.endDate }),
            },
          }
        : {}),
    };

    // Get all harvest records
    const harvests = await database.harvestRecord.findMany({
      where,
      include: {
        crop: {
          select: {
            id: true,
            name: true,
          },
        },
        prediction: true,
      },
    });

    // Calculate totals
    const totalHarvests = harvests.length;
    const totalYield = harvests.reduce(
      (sum: number, h: any) => sum + Number(h.totalYield),
      0,
    );
    const averageYield = totalHarvests > 0 ? totalYield / totalHarvests : 0;
    const yieldUnit = harvests[0]?.yieldUnit ?? "lbs";

    // Quality distribution
    const qualityDistribution: Record<HarvestQuality, number> = {
      EXCELLENT: 0,
      GOOD: 0,
      FAIR: 0,
      POOR: 0,
      FAILED: 0,
    };

    harvests.forEach((h: any) => {
      qualityDistribution[h.quality as HarvestQuality]++;
    });

    // Top crops by yield
    const cropYields = new Map<
      string,
      {
        cropId: string;
        cropName: string;
        totalYield: number;
        qualities: number[];
        count: number;
      }
    >();

    harvests.forEach((h: any) => {
      const key = h.cropId;
      const existing = cropYields.get(key);
      const qualityScore = this.qualityToScore(h.quality);

      if (existing) {
        existing.totalYield += Number(h.totalYield);
        existing.qualities.push(qualityScore);
        existing.count++;
      } else {
        cropYields.set(key, {
          cropId: h.cropId,
          cropName: h.crop.name,
          totalYield: Number(h.totalYield),
          qualities: [qualityScore],
          count: 1,
        });
      }
    });

    const topCrops = Array.from(cropYields.values())
      .map((c) => ({
        cropId: c.cropId,
        cropName: c.cropName,
        totalYield: c.totalYield,
        averageQuality:
          c.qualities.reduce((a, b) => a + b, 0) / c.qualities.length,
        harvestCount: c.count,
      }))
      .sort((a, b) => b.totalYield - a.totalYield)
      .slice(0, 10);

    // Seasonal performance
    const seasonalPerformance: Record<
      Season,
      {
        harvestCount: number;
        averageYield: number;
        averageQuality: number;
      }
    > = {
      SPRING: { harvestCount: 0, averageYield: 0, averageQuality: 0 },
      SUMMER: { harvestCount: 0, averageYield: 0, averageQuality: 0 },
      FALL: { harvestCount: 0, averageYield: 0, averageQuality: 0 },
      WINTER: { harvestCount: 0, averageYield: 0, averageQuality: 0 },
    };

    const seasonalData = new Map<
      Season,
      { yields: number[]; qualities: number[] }
    >();

    harvests.forEach((h: any) => {
      if (!seasonalData.has(h.season)) {
        seasonalData.set(h.season, { yields: [], qualities: [] });
      }
      const data = seasonalData.get(h.season)!;
      data.yields.push(Number(h.totalYield));
      data.qualities.push(this.qualityToScore(h.quality));
    });

    seasonalData.forEach((data, season) => {
      seasonalPerformance[season] = {
        harvestCount: data.yields.length,
        averageYield:
          data.yields.reduce((a, b) => a + b, 0) / data.yields.length,
        averageQuality:
          data.qualities.reduce((a, b) => a + b, 0) / data.qualities.length,
      };
    });

    // Prediction accuracy
    const predictionsWithActuals = harvests.filter((h: any) => h.prediction);
    const totalPredictions = predictionsWithActuals.length;
    let accuratePredictions = 0;
    let totalError = 0;
    let sumSquaredError = 0;

    predictionsWithActuals.forEach((h: any) => {
      if (h.prediction) {
        const predicted = Number(h.prediction.predictedYield);
        const actual = Number(h.totalYield);
        const error = Math.abs(predicted - actual);
        const percentError = (error / actual) * 100;

        if (percentError <= 10) accuratePredictions++; // Within 10% is accurate
        totalError += percentError;
        sumSquaredError += Math.pow(predicted - actual, 2);
      }
    });

    const averageError =
      totalPredictions > 0 ? totalError / totalPredictions : 0;
    const rmse =
      totalPredictions > 0 ? Math.sqrt(sumSquaredError / totalPredictions) : 0;

    // Revenue metrics
    const totalRevenue = harvests.reduce(
      (sum: number, h: any) =>
        sum + (h.marketValue ? Number(h.marketValue) : 0),
      0,
    );
    const totalCost = harvests.reduce(
      (sum: number, h: any) => sum + (h.totalCost ? Number(h.totalCost) : 0),
      0,
    );
    const profit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    return {
      totalHarvests,
      totalYield,
      averageYield,
      yieldUnit,
      qualityDistribution,
      topCrops,
      seasonalPerformance,
      predictionAccuracy: {
        totalPredictions,
        accuratePredictions,
        averageError,
        rmse,
      },
      revenueMetrics: {
        totalRevenue,
        totalCost,
        profit,
        roi,
      },
    };
  }

  /**
   * Create a yield prediction using ML
   */
  async createYieldPrediction(
    input: YieldPredictionInput,
  ): Promise<YieldPrediction> {
    try {
      // Get farm and crop data
      const [farm, crop] = await Promise.all([
        database.farm.findUnique({
          where: { id: input.farmId },
          include: { owner: true },
        }),
        database.crop.findUnique({
          where: { id: input.cropId },
        }),
      ]);

      if (!farm || !crop) {
        throw new Error("Farm or crop not found");
      }

      // Calculate days to maturity
      const daysToMaturity = crop.daysToMaturity as {
        min: number;
        max: number;
      };
      const avgDaysToMaturity = (daysToMaturity.min + daysToMaturity.max) / 2;

      // Get historical data for similar harvests
      const historicalHarvests = await database.harvestRecord.findMany({
        where: {
          farmId: input.farmId,
          cropId: input.cropId,
          quality: { in: ["EXCELLENT", "GOOD", "FAIR"] },
        },
        orderBy: { harvestDate: "desc" },
        take: 10,
      });

      // Calculate base prediction from historical average
      let predictedYield = Number(crop.averageYieldPerAcre);
      let historicalScore = 0.5;

      if (historicalHarvests.length > 0) {
        const avgHistoricalYield =
          historicalHarvests.reduce(
            (sum: number, h: any) => sum + Number(h.yieldPerArea || 0),
            0,
          ) / historicalHarvests.length;

        if (avgHistoricalYield > 0) {
          predictedYield = avgHistoricalYield;
          historicalScore = 0.8; // Higher confidence with historical data
        }
      }

      // Adjust for field size if provided
      if (input.fieldSize) {
        predictedYield = predictedYield * input.fieldSize;
      }

      // Get weather score
      let weatherScore = 0.7; // Default
      try {
        const weather = await weatherService.getCurrentWeather({
          lat: Number(farm.latitude),
          lng: Number(farm.longitude),
        });
        weatherScore = this.calculateWeatherScore(weather);
      } catch (error) {
        logger.warn("Failed to get weather for prediction", { error });
      }

      // Calculate soil score
      const soilScore = this.calculateSoilScore(input.soilData);

      // Calculate biodynamic score
      const biodynamicScore = this.calculateBiodynamicScore(
        input.plantingDate,
        crop,
      );

      // Overall confidence
      const confidence =
        historicalScore * 0.4 +
        weatherScore * 0.3 +
        soilScore * 0.2 +
        biodynamicScore * 0.1;

      // Apply confidence to prediction
      predictedYield = predictedYield * confidence;

      // Create prediction record
      const prediction = await database.yieldPrediction.create({
        data: {
          farmId: input.farmId,
          cropId: input.cropId,
          plantingDate: input.plantingDate,
          predictedHarvestDate: input.predictedHarvestDate,
          predictedYield,
          yieldUnit: crop.yieldUnit,
          confidence,
          weatherScore,
          soilScore,
          biodynamicScore,
          historicalScore,
        },
        include: {
          crop: true,
          farm: true,
        },
      });

      logger.info("Yield prediction created", {
        predictionId: prediction.id,
        farmId: input.farmId,
        cropId: input.cropId,
        predictedYield,
        confidence,
      });

      return prediction;
    } catch (error) {
      logger.error("Failed to create yield prediction", { error, input });
      throw error;
    }
  }

  /**
   * Get harvest insights for a farm
   */
  async getHarvestInsights(farmId: string): Promise<HarvestInsights> {
    const harvests = await database.harvestRecord.findMany({
      where: { farmId },
      include: { crop: true },
      orderBy: { harvestDate: "desc" },
      take: 100,
    });

    // Best performing crops (by quality and yield)
    const cropPerformance = new Map<
      string,
      {
        name: string;
        avgQuality: number;
        avgYield: number;
        count: number;
      }
    >();

    harvests.forEach((h: any) => {
      const existing = cropPerformance.get(h.cropId);
      const qualityScore = this.qualityToScore(h.quality);

      if (existing) {
        existing.avgQuality =
          (existing.avgQuality * existing.count + qualityScore) /
          (existing.count + 1);
        existing.avgYield =
          (existing.avgYield * existing.count + Number(h.totalYield)) /
          (existing.count + 1);
        existing.count++;
      } else {
        cropPerformance.set(h.cropId, {
          name: h.crop.name,
          avgQuality: qualityScore,
          avgYield: Number(h.totalYield),
          count: 1,
        });
      }
    });

    const bestPerformingCrops = Array.from(cropPerformance.entries())
      .sort(
        (a, b) =>
          b[1].avgQuality +
          b[1].avgYield / 1000 -
          (a[1].avgQuality + a[1].avgYield / 1000),
      )
      .slice(0, 5)
      .map(([_, crop]) => crop.name);

    // Optimal harvest windows
    const harvestWindows = new Map<
      string,
      { quality: number; count: number }
    >();

    harvests.forEach((h: any) => {
      const key = `${h.season}-${h.lunarPhase}`;
      const existing = harvestWindows.get(key);
      const qualityScore = this.qualityToScore(h.quality);

      if (existing) {
        existing.quality =
          (existing.quality * existing.count + qualityScore) /
          (existing.count + 1);
        existing.count++;
      } else {
        harvestWindows.set(key, { quality: qualityScore, count: 1 });
      }
    });

    const optimalHarvestWindows = Array.from(harvestWindows.entries())
      .filter(([_, data]) => data.count >= 3) // Minimum 3 harvests
      .sort((a, b) => b[1].quality - a[1].quality)
      .slice(0, 5)
      .map(([key, data]) => {
        const [season, lunarPhase] = key.split("-");
        return {
          season: season as Season,
          lunarPhase: lunarPhase as LunarPhase,
          qualityScore: data.quality,
        };
      });

    // Improvement recommendations
    const improvementRecommendations: string[] = [];

    // Check for pest/disease issues
    const diseaseRate =
      harvests.filter((h: any) => h.diseasePresent).length / harvests.length;
    const pestRate =
      harvests.filter((h: any) => h.pestDamage).length / harvests.length;

    if (diseaseRate > 0.2) {
      improvementRecommendations.push(
        "High disease incidence detected. Consider crop rotation and disease-resistant varieties.",
      );
    }

    if (pestRate > 0.2) {
      improvementRecommendations.push(
        "Significant pest damage detected. Implement integrated pest management strategies.",
      );
    }

    // Check soil health
    const lowPHHarvests = harvests.filter(
      (h: any) => h.soilPH && Number(h.soilPH) < 6.0,
    );
    if (lowPHHarvests.length > harvests.length * 0.3) {
      improvementRecommendations.push(
        "Soil pH appears low. Consider lime application to improve soil health.",
      );
    }

    // Risk factors
    const riskFactors: string[] = [];

    if (diseaseRate > 0.3) riskFactors.push("High disease risk");
    if (pestRate > 0.3) riskFactors.push("High pest pressure");

    const poorQualityRate =
      harvests.filter(
        (h: any) => h.quality === "POOR" || h.quality === "FAILED",
      ).length / harvests.length;
    if (poorQualityRate > 0.2)
      riskFactors.push("Quality issues affecting more than 20% of harvests");

    return {
      bestPerformingCrops,
      optimalHarvestWindows,
      improvementRecommendations,
      riskFactors,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async updatePredictionWithActuals(
    predictionId: string,
    harvest: HarvestRecord,
  ): Promise<void> {
    await database.yieldPrediction.update({
      where: { id: predictionId },
      data: {
        actualHarvestDate: harvest.harvestDate,
        actualYield: harvest.totalYield,
        harvestQuality: harvest.quality,
        notes: harvest.notes,
      },
    });
  }

  private async updateScheduleWithActuals(
    scheduleId: string,
    harvest: HarvestRecord,
  ): Promise<void> {
    await database.harvestSchedule.update({
      where: { id: scheduleId },
      data: {
        actualHarvestStart: harvest.harvestDate,
        actualHarvestEnd: harvest.harvestDate,
        actualYield: harvest.totalYield,
        actualYieldUnit: harvest.yieldUnit,
        harvestQuality: harvest.quality,
        actualLaborHours: harvest.laborHours,
        status: "COMPLETED",
      },
    });
  }

  private async generateMLTrainingData(harvest: HarvestRecord): Promise<void> {
    try {
      // Normalize features to 0-1 range
      const normalizedYield = Math.min(
        Number(harvest.yieldPerArea || harvest.totalYield) / 10000,
        1,
      );
      const qualityScore = this.qualityToScore(harvest.quality) / 5;

      await database.mLTrainingData.create({
        data: {
          harvestRecordId: harvest.id,
          avgTemperature: harvest.temperature
            ? Number(harvest.temperature) / 120
            : 0.5,
          totalRainfall: harvest.rainfall7Days
            ? Number(harvest.rainfall7Days) / 10
            : 0.5,
          avgHumidity: harvest.humidity ? Number(harvest.humidity) / 100 : 0.5,
          growingDegreeDays: 0.7, // Placeholder
          frostDays: 0,
          soilQualityScore: this.normalizeSoilScore(harvest),
          soilNitrogenLevel: harvest.soilNitrogen
            ? Number(harvest.soilNitrogen) / 200
            : 0.5,
          soilPhosphorusLevel: harvest.soilPhosphorus
            ? Number(harvest.soilPhosphorus) / 100
            : 0.5,
          soilPotassiumLevel: harvest.soilPotassium
            ? Number(harvest.soilPotassium) / 400
            : 0.5,
          soilPHLevel: harvest.soilPH ? (Number(harvest.soilPH) - 4) / 6 : 0.5,
          soilMoistureAvg: harvest.soilMoisture
            ? Number(harvest.soilMoisture) / 100
            : 0.5,
          lunarPhaseScore: this.lunarPhaseToScore(harvest.lunarPhase),
          seasonalAlignment: this.seasonToScore(harvest.season),
          plantingTiming: 0.7, // Placeholder
          cropType: "VEGETABLE", // Placeholder
          cropFamily: "OTHER", // Placeholder
          daysToMaturity: 60, // Placeholder
          companionPlants: 0,
          farmSize: 1,
          farmerExperience: 5,
          organicCertified: false,
          irrigationMethod: "DRIP",
          yieldPerArea: normalizedYield,
          qualityScore,
          trainingSetVersion: "v1.0",
          usedInTraining: false,
          validationSet: Math.random() < 0.2, // 20% validation
          outlier: false,
        },
      });

      logger.debug("ML training data generated", {
        harvestRecordId: harvest.id,
      });
    } catch (error) {
      logger.error("Failed to generate ML training data", {
        error,
        harvestId: harvest.id,
      });
    }
  }

  private qualityToScore(quality: HarvestQuality): number {
    const scores: Record<HarvestQuality, number> = {
      EXCELLENT: 5,
      GOOD: 4,
      FAIR: 3,
      POOR: 2,
      FAILED: 1,
    };
    return scores[quality] || 3;
  }

  private normalizeSoilScore(harvest: HarvestRecord): number {
    let score = 0.5;
    let factors = 0;

    if (harvest.soilPH) {
      const ph = Number(harvest.soilPH);
      score += ph >= 6.0 && ph <= 7.0 ? 1 : 0.5;
      factors++;
    }

    if (harvest.soilMoisture) {
      score += Number(harvest.soilMoisture) / 100;
      factors++;
    }

    return factors > 0 ? score / factors : 0.5;
  }

  private lunarPhaseToScore(phase: LunarPhase | null): number {
    if (!phase) return 0.5;

    const scores: Record<LunarPhase, number> = {
      NEW_MOON: 0.3,
      WAXING_CRESCENT: 0.6,
      FIRST_QUARTER: 0.7,
      WAXING_GIBBOUS: 0.8,
      FULL_MOON: 1.0,
      WANING_GIBBOUS: 0.8,
      LAST_QUARTER: 0.6,
      WANING_CRESCENT: 0.4,
    };
    return scores[phase] || 0.5;
  }

  private seasonToScore(season: Season): number {
    const scores: Record<Season, number> = {
      SPRING: 0.9,
      SUMMER: 1.0,
      FALL: 0.8,
      WINTER: 0.3,
    };
    return scores[season] || 0.5;
  }

  private calculateWeatherScore(weather: any): number {
    // Temperature ideal range: 60-80°F
    const tempScore =
      weather.temperature >= 60 && weather.temperature <= 80 ? 1.0 : 0.7;

    // Humidity ideal: 50-70%
    const humidityScore =
      weather.humidity >= 50 && weather.humidity <= 70 ? 1.0 : 0.7;

    return (tempScore + humidityScore) / 2;
  }

  private calculateSoilScore(soilData: any): number {
    if (!soilData) return 0.7;

    let score = 0.7;
    if (soilData.ph >= 6.0 && soilData.ph <= 7.0) score += 0.2;
    if (soilData.nitrogen > 50) score += 0.1;

    return Math.min(score, 1.0);
  }

  private calculateBiodynamicScore(plantingDate: Date, crop: any): number {
    const season = biodynamicCalendar.getCurrentSeason();
    const cropSeasons = crop.growingSeasons || [];

    return cropSeasons.includes(season) ? 0.9 : 0.6;
  }
}

// ============================================================================
// Export Singleton
// ============================================================================

export const harvestTrackingService = new HarvestTrackingService();
