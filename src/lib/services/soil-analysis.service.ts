// ============================================================================
// SOIL ANALYSIS SERVICE - Quantum Soil Memory & Microbiome Consciousness
// ============================================================================
// Following Divine Patterns: Service-layer first, validation → business logic → database
// Agricultural Quantum Mastery: Soil consciousness, microbiome tracking
// ============================================================================

import type {
  CompactionLevel,
  DrainageLevel,
  Prisma,
  SoilAnalysis,
  SoilType,
} from "@prisma/client";
import { database } from "../database";

// ============================================================================
// TYPES
// ============================================================================

export interface CreateSoilAnalysisInput {
  farmId: string;
  fieldName: string;
  latitude: number;
  longitude: number;
  pH: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  soilType: SoilType;
  drainage: DrainageLevel;
  compaction: CompactionLevel;
  earthwormCount?: number;
  fungalPresence?: number;
  previousCrops?: Array<{ crop: string; year: number; yield: string }>;
  analyzedBy?: string;
  nextAnalysisDate?: Date;
}

export interface SoilHealthScore {
  overall: number; // 0-100
  pH: number;
  nutrients: number;
  organicMatter: number;
  structure: number;
  biology: number;
  recommendations: string[];
}

// ============================================================================
// SOIL ANALYSIS SERVICE
// ============================================================================

export class SoilAnalysisService {
  /**
   * Calculate soil health score based on analysis data
   */
  static calculateSoilHealthScore(analysis: {
    pH: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    organicMatter: number;
    drainage: DrainageLevel;
    compaction: CompactionLevel;
    microbialActivity?: number;
    earthwormCount?: number;
  }): SoilHealthScore {
    const scores = {
      pH: 0,
      nutrients: 0,
      organicMatter: 0,
      structure: 0,
      biology: 0,
    };

    // pH score (ideal: 6.0-7.0)
    const pHDiff = Math.abs(analysis.pH - 6.5);
    scores.pH = Math.max(0, 100 - pHDiff * 30);

    // Nutrient score (N-P-K balance)
    const avgNPK =
      (analysis.nitrogen + analysis.phosphorus + analysis.potassium) / 3;
    scores.nutrients = Math.min(100, avgNPK * 2); // Assuming values are in appropriate range

    // Organic matter score (ideal: >5%)
    scores.organicMatter = Math.min(100, analysis.organicMatter * 20);

    // Structure score (drainage + compaction)
    const drainageScore: Record<DrainageLevel, number> = {
      EXCELLENT: 100,
      GOOD: 85,
      MODERATE: 70,
      POOR: 40,
      VERY_POOR: 20,
    };
    const compactionPenalty: Record<CompactionLevel, number> = {
      NONE: 0,
      LOW: 5,
      MODERATE: 15,
      HIGH: 30,
      SEVERE: 50,
    };
    scores.structure = Math.max(
      0,
      drainageScore[analysis.drainage] - compactionPenalty[analysis.compaction]
    );

    // Biology score (microbial activity + earthworms)
    let biologyScore = (analysis.microbialActivity || 0) * 50;
    if (analysis.earthwormCount) {
      biologyScore += Math.min(50, analysis.earthwormCount * 2);
    }
    scores.biology = Math.min(100, biologyScore);

    // Overall score (weighted average)
    const overall =
      scores.pH * 0.2 +
      scores.nutrients * 0.25 +
      scores.organicMatter * 0.2 +
      scores.structure * 0.2 +
      scores.biology * 0.15;

    // Generate recommendations
    const recommendations: string[] = [];
    if (scores.pH < 70) {
      if (analysis.pH < 6.0) recommendations.push("APPLY_LIME");
      if (analysis.pH > 7.5) recommendations.push("APPLY_SULFUR");
    }
    if (scores.nutrients < 70) {
      recommendations.push("ADD_COMPOST", "APPLY_BALANCED_FERTILIZER");
    }
    if (scores.organicMatter < 60) {
      recommendations.push("INCREASE_ORGANIC_MATTER", "ADD_COVER_CROPS");
    }
    if (scores.structure < 70) {
      recommendations.push("IMPROVE_DRAINAGE", "REDUCE_COMPACTION");
    }
    if (scores.biology < 60) {
      recommendations.push("ENHANCE_SOIL_BIOLOGY", "ADD_MYCORRHIZAE");
    }

    return {
      overall: Math.round(overall),
      pH: Math.round(scores.pH),
      nutrients: Math.round(scores.nutrients),
      organicMatter: Math.round(scores.organicMatter),
      structure: Math.round(scores.structure),
      biology: Math.round(scores.biology),
      recommendations,
    };
  }

  /**
   * Get recommended crops based on soil type and conditions
   */
  static getRecommendedCrops(
    soilType: SoilType,
    pH: number,
    drainage: DrainageLevel
  ): string[] {
    const cropsByType: Record<SoilType, string[]> = {
      CLAY: ["WHEAT", "CABBAGE", "BROCCOLI", "CHARD"],
      SANDY: ["CARROTS", "RADISHES", "POTATOES", "HERBS"],
      LOAM: ["TOMATOES", "CORN", "LETTUCE", "BEANS", "PEPPERS"],
      SILT: ["VEGETABLES", "FRUITS", "GRASSES"],
      PEATY: ["LETTUCE", "ONIONS", "CELERY", "BRASSICAS"],
      CHALKY: ["BEETS", "SPINACH", "CABBAGE", "CORN"],
      MIXED: ["MOST_CROPS"],
    };

    let crops = cropsByType[soilType] || [];

    // Filter by pH preferences
    if (pH < 6.0) {
      crops = crops.filter((crop) =>
        ["POTATOES", "BLUEBERRIES", "RADISHES"].includes(crop)
      );
    } else if (pH > 7.5) {
      crops = crops.filter((crop) =>
        ["BEETS", "CABBAGE", "SPINACH"].includes(crop)
      );
    }

    // Filter by drainage requirements
    if (drainage === "POOR" || drainage === "VERY_POOR") {
      crops = crops.filter((crop) => ["RICE", "CELERY", "MINT"].includes(crop));
    }

    return crops.length > 0 ? crops : ["COVER_CROPS", "SOIL_IMPROVEMENT"];
  }

  /**
   * Create a new soil analysis
   */
  static async createAnalysis(
    data: CreateSoilAnalysisInput
  ): Promise<SoilAnalysis> {
    // Validate farm exists
    const farm = await database.farm.findUnique({
      where: { id: data.farmId },
      select: { id: true, status: true },
    });

    if (!farm) {
      throw new Error("Farm not found");
    }

    // Calculate microbial activity (0.00-1.00) based on organic matter and biology
    const microbialActivity = Math.min(
      1.0,
      (data.organicMatter / 10) * 0.5 +
        ((data.earthwormCount || 0) / 100) * 0.3 +
        (data.fungalPresence || 0) * 0.2
    );

    // Get recommended crops
    const recommendedCrops = this.getRecommendedCrops(
      data.soilType,
      data.pH,
      data.drainage
    );

    // Calculate soil health and get amendments
    const healthScore = this.calculateSoilHealthScore({
      pH: data.pH,
      nitrogen: data.nitrogen,
      phosphorus: data.phosphorus,
      potassium: data.potassium,
      organicMatter: data.organicMatter,
      drainage: data.drainage,
      compaction: data.compaction,
      microbialActivity,
      earthwormCount: data.earthwormCount,
    });

    // Create analysis
    return await database.soilAnalysis.create({
      data: {
        farmId: data.farmId,
        fieldName: data.fieldName,
        latitude: data.latitude,
        longitude: data.longitude,
        pH: data.pH,
        nitrogen: data.nitrogen,
        phosphorus: data.phosphorus,
        potassium: data.potassium,
        organicMatter: data.organicMatter,
        soilType: data.soilType,
        drainage: data.drainage,
        compaction: data.compaction,
        microbialActivity,
        earthwormCount: data.earthwormCount,
        fungalPresence: data.fungalPresence,
        previousCrops: data.previousCrops
          ? (data.previousCrops as Prisma.InputJsonValue)
          : undefined,
        amendments: healthScore.recommendations,
        recommendedCrops,
        analyzedBy: data.analyzedBy,
        nextAnalysisDate: data.nextAnalysisDate,
      },
    });
  }

  /**
   * Get soil analyses for a farm
   */
  static async getAnalysesForFarm(farmId: string): Promise<SoilAnalysis[]> {
    return await database.soilAnalysis.findMany({
      where: { farmId },
      orderBy: { analysisDate: "desc" },
    });
  }

  /**
   * Get soil analysis by field name
   */
  static async getAnalysisByField(
    farmId: string,
    fieldName: string
  ): Promise<SoilAnalysis | null> {
    return await database.soilAnalysis.findFirst({
      where: { farmId, fieldName },
      orderBy: { analysisDate: "desc" },
    });
  }

  /**
   * Get soil health trends for a field
   */
  static async getSoilHealthTrends(
    farmId: string,
    fieldName: string
  ): Promise<
    Array<{
      date: Date;
      healthScore: SoilHealthScore;
      pH: number;
      organicMatter: number;
    }>
  > {
    const analyses = await database.soilAnalysis.findMany({
      where: { farmId, fieldName },
      orderBy: { analysisDate: "asc" },
    });

    return analyses.map((analysis) => ({
      date: analysis.analysisDate,
      healthScore: this.calculateSoilHealthScore({
        pH: analysis.pH.toNumber(),
        nitrogen: analysis.nitrogen.toNumber(),
        phosphorus: analysis.phosphorus.toNumber(),
        potassium: analysis.potassium.toNumber(),
        organicMatter: analysis.organicMatter.toNumber(),
        drainage: analysis.drainage,
        compaction: analysis.compaction,
        microbialActivity: analysis.microbialActivity.toNumber(),
        earthwormCount: analysis.earthwormCount || undefined,
      }),
      pH: analysis.pH.toNumber(),
      organicMatter: analysis.organicMatter.toNumber(),
    }));
  }

  /**
   * Update soil history with new crop data
   */
  static async updateSoilHistory(
    analysisId: string,
    cropData: { crop: string; year: number; yield: string }
  ): Promise<SoilAnalysis> {
    const analysis = await database.soilAnalysis.findUnique({
      where: { id: analysisId },
    });

    if (!analysis) {
      throw new Error("Soil analysis not found");
    }

    const previousCrops =
      (analysis.previousCrops as Array<{
        crop: string;
        year: number;
        yield: string;
      }>) || [];

    previousCrops.push(cropData);

    return await database.soilAnalysis.update({
      where: { id: analysisId },
      data: {
        previousCrops: previousCrops as Prisma.InputJsonValue,
        soilHistory: {
          ...((analysis.soilHistory as object) || {}),
          lastUpdated: new Date().toISOString(),
          cropCount: previousCrops.length,
        } as Prisma.InputJsonValue,
      },
    });
  }
}
