/**
 * ============================================================================
 * BIODYNAMIC CALENDAR SERVICE - Divine Agricultural Consciousness
 * ============================================================================
 *
 * Manages lunar cycles, seasonal alignments, and biodynamic recommendations
 * for optimal planting, harvesting, and soil work timing.
 *
 * Following divine patterns from:
 * - 02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 * - Service layer pattern (validation → business logic → database)
 */

import { database } from "@/lib/database";
import type { LunarPhase, Season } from "@prisma/client";

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class BiodynamicCalendarError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "BiodynamicCalendarError";
  }
}

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// Removed unused _BiodynamicCalendarInput interface

interface BiodynamicRecommendations {
  plantingFavorability: number; // 0-100
  harvestFavorability: number; // 0-100
  soilWorkFavorability: number; // 0-100
  recommendedActivities: string[];
  avoidActivities: string[];
  agriculturalConsciousness: number; // 0.00-1.00
}

// ============================================================================
// BIODYNAMIC CALENDAR SERVICE
// ============================================================================

export class BiodynamicCalendarService {
  /**
   * Calculate lunar phase from date
   * Divine consciousness: moon cycles affect plant growth
   */
  static calculateLunarPhase(date: Date): LunarPhase {
    try {
      // Validate input
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new BiodynamicCalendarError(
          "Invalid date provided for lunar phase calculation",
        );
      }

      // Known new moon reference: January 6, 2000
      const knownNewMoon = new Date("2000-01-06T18:14:00Z");
      const lunarCycle = 29.53059; // days

      const daysSinceKnownNewMoon =
        (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
      const cyclePosition = (daysSinceKnownNewMoon % lunarCycle) / lunarCycle;

      if (cyclePosition < 0.03 || cyclePosition >= 0.97) return "NEW_MOON";
      if (cyclePosition >= 0.03 && cyclePosition < 0.22)
        return "WAXING_CRESCENT";
      if (cyclePosition >= 0.22 && cyclePosition < 0.28) return "FIRST_QUARTER";
      if (cyclePosition >= 0.28 && cyclePosition < 0.47)
        return "WAXING_GIBBOUS";
      if (cyclePosition >= 0.47 && cyclePosition < 0.53) return "FULL_MOON";
      if (cyclePosition >= 0.53 && cyclePosition < 0.72)
        return "WANING_GIBBOUS";
      if (cyclePosition >= 0.72 && cyclePosition < 0.78) return "LAST_QUARTER";
      return "WANING_CRESCENT";
    } catch (error) {
      if (error instanceof BiodynamicCalendarError) {
        throw error;
      }
      throw new BiodynamicCalendarError(
        "Failed to calculate lunar phase",
        error,
      );
    }
  }

  /**
   * Calculate current season from date
   */
  static calculateSeason(
    date: Date,
    hemisphere: "north" | "south" = "north",
  ): Season {
    try {
      // Validate input
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new BiodynamicCalendarError(
          "Invalid date provided for season calculation",
        );
      }

      const month = date.getMonth();
      const day = date.getDate();

      // Northern hemisphere seasons
      if (hemisphere === "north") {
        if (
          (month === 2 && day >= 20) ||
          (month > 2 && month < 5) ||
          (month === 5 && day < 21)
        ) {
          return "SPRING";
        }
        if (
          (month === 5 && day >= 21) ||
          (month > 5 && month < 8) ||
          (month === 8 && day < 22)
        ) {
          return "SUMMER";
        }
        if (
          (month === 8 && day >= 22) ||
          (month > 8 && month < 11) ||
          (month === 11 && day < 21)
        ) {
          return "FALL";
        }
        return "WINTER";
      }

      // Southern hemisphere (reversed)
      if (
        (month === 2 && day >= 20) ||
        (month > 2 && month < 5) ||
        (month === 5 && day < 21)
      ) {
        return "FALL";
      }
      if (
        (month === 5 && day >= 21) ||
        (month > 5 && month < 8) ||
        (month === 8 && day < 22)
      ) {
        return "WINTER";
      }
      if (
        (month === 8 && day >= 22) ||
        (month > 8 && month < 11) ||
        (month === 11 && day < 21)
      ) {
        return "SPRING";
      }
      return "SUMMER";
    } catch (error) {
      if (error instanceof BiodynamicCalendarError) {
        throw error;
      }
      throw new BiodynamicCalendarError("Failed to calculate season", error);
    }
  }

  /**
   * Calculate biodynamic recommendations based on lunar phase and season
   * Divine quantum consciousness: aligning farming with cosmic rhythms
   */
  static calculateBiodynamicRecommendations(
    lunarPhase: LunarPhase,
    season: Season,
    _lunarDay: number,
  ): BiodynamicRecommendations {
    let plantingFavorability = 50;
    let harvestFavorability = 50;
    let soilWorkFavorability = 50;
    const recommendedActivities: string[] = [];
    const avoidActivities: string[] = [];

    // Lunar phase influence
    switch (lunarPhase) {
      case "NEW_MOON":
        plantingFavorability += 20;
        soilWorkFavorability += 30;
        recommendedActivities.push(
          "PLANT_ROOT_CROPS",
          "PREPARE_SOIL",
          "COMPOSTING",
        );
        avoidActivities.push("HARVEST_LEAFY_GREENS");
        break;

      case "WAXING_CRESCENT":
        plantingFavorability += 35;
        recommendedActivities.push(
          "PLANT_LEAFY_GREENS",
          "TRANSPLANT_SEEDLINGS",
        );
        break;

      case "FIRST_QUARTER":
        plantingFavorability += 40;
        recommendedActivities.push("PLANT_FRUITING_CROPS", "GRAFTING");
        break;

      case "WAXING_GIBBOUS":
        plantingFavorability += 30;
        harvestFavorability += 20;
        recommendedActivities.push("PLANT_BULBS", "WATER_DEEPLY");
        break;

      case "FULL_MOON":
        harvestFavorability += 45;
        plantingFavorability -= 10;
        recommendedActivities.push(
          "HARVEST_LEAFY_GREENS",
          "HARVEST_FRUITS",
          "COLLECT_SEEDS",
        );
        avoidActivities.push("PRUNING", "TRANSPLANTING");
        break;

      case "WANING_GIBBOUS":
        harvestFavorability += 35;
        recommendedActivities.push("HARVEST_ROOT_CROPS", "MULCHING");
        break;

      case "LAST_QUARTER":
        soilWorkFavorability += 40;
        harvestFavorability += 25;
        recommendedActivities.push(
          "WEED_CONTROL",
          "PEST_MANAGEMENT",
          "PRUNING",
        );
        avoidActivities.push("PLANTING");
        break;

      case "WANING_CRESCENT":
        soilWorkFavorability += 35;
        recommendedActivities.push(
          "TURN_COMPOST",
          "DEEP_CULTIVATION",
          "REST_FIELDS",
        );
        avoidActivities.push("PLANTING", "HEAVY_WATERING");
        break;
    }

    // Seasonal adjustments
    switch (season) {
      case "SPRING":
        plantingFavorability += 20;
        recommendedActivities.push("SOW_SEEDS", "PREPARE_BEDS");
        break;
      case "SUMMER":
        harvestFavorability += 20;
        recommendedActivities.push(
          "HARVEST_SUMMER_CROPS",
          "IRRIGATION_PLANNING",
        );
        break;
      case "FALL":
        harvestFavorability += 25;
        plantingFavorability += 10;
        recommendedActivities.push(
          "PLANT_COVER_CROPS",
          "HARVEST_ROOT_VEGETABLES",
        );
        break;
      case "WINTER":
        soilWorkFavorability += 15;
        recommendedActivities.push(
          "PLAN_ROTATIONS",
          "TOOL_MAINTENANCE",
          "SOIL_TESTING",
        );
        avoidActivities.push("HEAVY_PLANTING");
        break;
    }

    // Ensure values are within 0-100 range
    plantingFavorability = Math.max(0, Math.min(100, plantingFavorability));
    harvestFavorability = Math.max(0, Math.min(100, harvestFavorability));
    soilWorkFavorability = Math.max(0, Math.min(100, soilWorkFavorability));

    // Calculate agricultural consciousness (0.00-1.00)
    const agriculturalConsciousness =
      (plantingFavorability + harvestFavorability + soilWorkFavorability) / 300;

    return {
      plantingFavorability,
      harvestFavorability,
      soilWorkFavorability,
      recommendedActivities: [...new Set(recommendedActivities)], // Remove duplicates
      avoidActivities: [...new Set(avoidActivities)],
      agriculturalConsciousness: Number(agriculturalConsciousness.toFixed(2)),
    };
  }

  /**
   * Create or update biodynamic calendar entry
   */
  static async createOrUpdateCalendar(
    farmId: string,
    date: Date,
    _userId: string,
  ) {
    // Validate farm ownership
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      select: { ownerId: true, status: true },
    });

    if (!farm) {
      throw new Error("Farm not found");
    }

    if (farm.status !== "ACTIVE") {
      throw new Error("Farm must be active to access biodynamic calendar");
    }

    // Calculate lunar and seasonal data
    const lunarPhase = this.calculateLunarPhase(date);
    const season = this.calculateSeason(date);

    // Calculate lunar day (1-29)
    const knownNewMoon = new Date("2000-01-06T18:14:00Z");
    const daysSinceKnownNewMoon =
      (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const lunarDay = Math.floor(daysSinceKnownNewMoon % 29.53059) + 1;

    // Calculate recommendations
    const recommendations = this.calculateBiodynamicRecommendations(
      lunarPhase,
      season,
      lunarDay,
    );

    // Create or update calendar entry
    const calendar = await database.biodynamicCalendar.upsert({
      where: {
        farmId_astronomicalDate: {
          farmId,
          astronomicalDate: date,
        },
      },
      create: {
        farmId,
        astronomicalDate: date,
        lunarPhase,
        lunarDay,
        season,
        plantingFavorability: recommendations.plantingFavorability,
        harvestFavorability: recommendations.harvestFavorability,
        soilWorkFavorability: recommendations.soilWorkFavorability,
        recommendedActivities: recommendations.recommendedActivities,
        avoidActivities: recommendations.avoidActivities,
        agriculturalConsciousness: recommendations.agriculturalConsciousness,
      },
      update: {
        lunarPhase,
        lunarDay,
        season,
        plantingFavorability: recommendations.plantingFavorability,
        harvestFavorability: recommendations.harvestFavorability,
        soilWorkFavorability: recommendations.soilWorkFavorability,
        recommendedActivities: recommendations.recommendedActivities,
        avoidActivities: recommendations.avoidActivities,
        agriculturalConsciousness: recommendations.agriculturalConsciousness,
      },
    });

    return calendar;
  }

  /**
   * Get biodynamic calendar for date range
   */
  static async getCalendarRange(
    farmId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const calendars = await database.biodynamicCalendar.findMany({
      where: {
        farmId,
        astronomicalDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        astronomicalDate: "asc",
      },
    });

    return calendars;
  }

  /**
   * Get today's biodynamic guidance
   */
  static async getTodaysGuidance(farmId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let calendar = await database.biodynamicCalendar.findUnique({
      where: {
        farmId_astronomicalDate: {
          farmId,
          astronomicalDate: today,
        },
      },
    });

    // If not exists, create it
    if (!calendar) {
      calendar = await this.createOrUpdateCalendar(farmId, today, "system");
    }

    return calendar;
  }

  /**
   * Get optimal planting dates for next 30 days
   */
  static async getOptimalPlantingDates(farmId: string, days: number = 30) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const calendars = await this.getCalendarRange(farmId, startDate, endDate);

    // Filter for high planting favorability (>70)
    return calendars
      .filter((cal) => cal.plantingFavorability >= 70)
      .sort((a, b) => b.plantingFavorability - a.plantingFavorability);
  }

  /**
   * Get optimal harvest dates for next 30 days
   */
  static async getOptimalHarvestDates(farmId: string, days: number = 30) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const calendars = await this.getCalendarRange(farmId, startDate, endDate);

    // Filter for high harvest favorability (>70)
    return calendars
      .filter((cal) => cal.harvestFavorability >= 70)
      .sort((a, b) => b.harvestFavorability - a.harvestFavorability);
  }
}
