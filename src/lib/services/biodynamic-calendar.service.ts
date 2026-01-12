/**
 * 🌙 Biodynamic Calendar Service
 *
 * Provides seasonal awareness and lunar phase calculations for agricultural operations.
 * Implements biodynamic farming principles based on astronomical cycles.
 *
 * @module BiodynamicCalendarService
 */

export enum Season {
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  FALL = 'FALL',
  WINTER = 'WINTER'
}

export enum LunarPhase {
  NEW_MOON = 'NEW_MOON',
  WAXING_CRESCENT = 'WAXING_CRESCENT',
  FIRST_QUARTER = 'FIRST_QUARTER',
  WAXING_GIBBOUS = 'WAXING_GIBBOUS',
  FULL_MOON = 'FULL_MOON',
  WANING_GIBBOUS = 'WANING_GIBBOUS',
  LAST_QUARTER = 'LAST_QUARTER',
  WANING_CRESCENT = 'WANING_CRESCENT'
}

export enum CropType {
  ROOT = 'ROOT',
  LEAFY = 'LEAFY',
  FRUIT = 'FRUIT',
  FLOWER = 'FLOWER',
  SEED = 'SEED'
}

export interface BiodynamicContext {
  season: Season;
  lunarPhase: LunarPhase;
  lunarAge: number;
  isOptimalPlanting: boolean;
  optimalOperations: string[];
}

export interface PlantingWindow {
  start: Date;
  end: Date;
  lunarPhase: LunarPhase;
  score: number;
  reason: string;
}

// Agricultural operations by season
const SEASONAL_OPERATIONS: Record<Season, string[]> = {
  [Season.SPRING]: ['PLANT', 'PREPARE_SOIL', 'FERTILIZE', 'PRUNE'],
  [Season.SUMMER]: ['WATER', 'WEED', 'MONITOR', 'HARVEST_EARLY'],
  [Season.FALL]: ['HARVEST', 'PRESERVE', 'COMPOST', 'PREPARE_WINTER'],
  [Season.WINTER]: ['REST', 'PLAN', 'REPAIR', 'INDOOR_GROWING']
};

// Optimal lunar phases for different crop types (biodynamic principles)
const OPTIMAL_PHASES_BY_CROP: Record<CropType, LunarPhase[]> = {
  [CropType.ROOT]: [
    LunarPhase.WANING_GIBBOUS,
    LunarPhase.LAST_QUARTER,
    LunarPhase.WANING_CRESCENT
  ],
  [CropType.LEAFY]: [
    LunarPhase.WAXING_CRESCENT,
    LunarPhase.FIRST_QUARTER,
    LunarPhase.WAXING_GIBBOUS
  ],
  [CropType.FRUIT]: [
    LunarPhase.FULL_MOON,
    LunarPhase.WAXING_GIBBOUS
  ],
  [CropType.FLOWER]: [
    LunarPhase.FIRST_QUARTER,
    LunarPhase.WAXING_GIBBOUS
  ],
  [CropType.SEED]: [
    LunarPhase.FULL_MOON,
    LunarPhase.WANING_GIBBOUS
  ]
};

/**
 * Biodynamic Calendar Service
 * Provides astronomical and seasonal calculations for agricultural operations
 */
export class BiodynamicCalendarService {
  /**
   * Get the current season based on date
   */
  getCurrentSeason(date: Date = new Date()): Season {
    const month = date.getMonth();

    // Northern Hemisphere seasons
    if (month >= 2 && month <= 4) return Season.SPRING;
    if (month >= 5 && month <= 7) return Season.SUMMER;
    if (month >= 8 && month <= 10) return Season.FALL;
    return Season.WINTER;
  }

  /**
   * Calculate lunar age (days since new moon)
   * Uses simplified lunar age calculation algorithm
   */
  calculateLunarAge(date: Date = new Date()): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Simplified lunar age calculation
    const c = Math.floor(year / 100);
    const e = c - Math.floor(c / 4) - 8;
    const g = ((year % 19) * 11) + 24;
    const h = (g - e) % 30;
    const i = h + Math.floor(month / 2.0) + day - 4;

    return ((i % 30) + 30) % 30;
  }

  /**
   * Get current lunar phase
   */
  getCurrentLunarPhase(date: Date = new Date()): LunarPhase {
    const lunarAge = this.calculateLunarAge(date);
    return this.lunarAgeToPhase(lunarAge);
  }

  /**
   * Convert lunar age to phase
   */
  private lunarAgeToPhase(lunarAge: number): LunarPhase {
    if (lunarAge < 1.84566) return LunarPhase.NEW_MOON;
    if (lunarAge < 5.53699) return LunarPhase.WAXING_CRESCENT;
    if (lunarAge < 9.22831) return LunarPhase.FIRST_QUARTER;
    if (lunarAge < 12.91963) return LunarPhase.WAXING_GIBBOUS;
    if (lunarAge < 16.61096) return LunarPhase.FULL_MOON;
    if (lunarAge < 20.30228) return LunarPhase.WANING_GIBBOUS;
    if (lunarAge < 23.99361) return LunarPhase.LAST_QUARTER;
    return LunarPhase.WANING_CRESCENT;
  }

  /**
   * Get biodynamic context for a given date
   */
  getBiodynamicContext(date: Date = new Date()): BiodynamicContext {
    const season = this.getCurrentSeason(date);
    const lunarPhase = this.getCurrentLunarPhase(date);
    const lunarAge = this.calculateLunarAge(date);
    const optimalOperations = SEASONAL_OPERATIONS[season];

    // Check if it's optimal planting time (waxing moon for above-ground crops)
    const isOptimalPlanting = [
      LunarPhase.WAXING_CRESCENT,
      LunarPhase.FIRST_QUARTER,
      LunarPhase.WAXING_GIBBOUS
    ].includes(lunarPhase);

    return {
      season,
      lunarPhase,
      lunarAge,
      isOptimalPlanting,
      optimalOperations
    };
  }

  /**
   * Get optimal planting days for a crop type
   */
  getOptimalPlantingDays(
    cropType: CropType,
    daysAhead: number = 14,
    startDate: Date = new Date()
  ): PlantingWindow[] {
    const windows: PlantingWindow[] = [];
    const optimalPhases = OPTIMAL_PHASES_BY_CROP[cropType];

    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const lunarPhase = this.getCurrentLunarPhase(date);
      const isOptimal = optimalPhases.includes(lunarPhase);

      if (isOptimal) {
        // Find the window span (consecutive optimal days)
        const windowEnd = new Date(date);
        let span = 1;

        for (let j = i + 1; j < daysAhead; j++) {
          const nextDate = new Date(startDate);
          nextDate.setDate(nextDate.getDate() + j);
          const nextPhase = this.getCurrentLunarPhase(nextDate);

          if (optimalPhases.includes(nextPhase)) {
            windowEnd.setDate(windowEnd.getDate() + 1);
            span++;
          } else {
            break;
          }
        }

        const score = this.calculatePlantingScore(cropType, lunarPhase, span);
        const reason = this.getPlantingReason(cropType, lunarPhase);

        windows.push({
          start: new Date(date),
          end: windowEnd,
          lunarPhase,
          score,
          reason
        });

        // Skip ahead to avoid duplicate windows
        i += span - 1;
      }
    }

    return windows;
  }

  /**
   * Calculate planting score (0-100)
   */
  private calculatePlantingScore(
    cropType: CropType,
    lunarPhase: LunarPhase,
    windowSpan: number
  ): number {
    let score = 60; // Base score

    // Phase alignment bonus
    const optimalPhases = OPTIMAL_PHASES_BY_CROP[cropType];
    const phaseIndex = optimalPhases.indexOf(lunarPhase);

    if (phaseIndex === 0) {
      score += 25; // Best phase
    } else if (phaseIndex > 0) {
      score += 15; // Good phase
    }

    // Window span bonus (longer windows are more flexible)
    score += Math.min(windowSpan * 2, 15);

    return Math.min(100, score);
  }

  /**
   * Get explanation for planting recommendation
   */
  private getPlantingReason(cropType: CropType, lunarPhase: LunarPhase): string {
    const phaseDescriptions: Record<LunarPhase, string> = {
      [LunarPhase.NEW_MOON]: 'New moon - ideal for rest and planning',
      [LunarPhase.WAXING_CRESCENT]: 'Waxing crescent - increasing energy, good for leafy growth',
      [LunarPhase.FIRST_QUARTER]: 'First quarter - strong growth phase',
      [LunarPhase.WAXING_GIBBOUS]: 'Waxing gibbous - peak growing energy',
      [LunarPhase.FULL_MOON]: 'Full moon - maximum energy, excellent for fruiting crops',
      [LunarPhase.WANING_GIBBOUS]: 'Waning gibbous - energy moving downward, good for roots',
      [LunarPhase.LAST_QUARTER]: 'Last quarter - focus on root development',
      [LunarPhase.WANING_CRESCENT]: 'Waning crescent - deep root growth phase'
    };

    const cropDescriptions: Record<CropType, string> = {
      [CropType.ROOT]: 'Root crops benefit from downward energy flow',
      [CropType.LEAFY]: 'Leafy greens thrive with increasing lunar energy',
      [CropType.FRUIT]: 'Fruit crops develop best near full moon',
      [CropType.FLOWER]: 'Flowers bloom beautifully with waxing energy',
      [CropType.SEED]: 'Seed crops benefit from strong lunar energy'
    };

    return `${phaseDescriptions[lunarPhase]}. ${cropDescriptions[cropType]}.`;
  }

  /**
   * Check if a specific date is optimal for a crop type
   */
  isOptimalPlantingDate(cropType: CropType, date: Date = new Date()): boolean {
    const lunarPhase = this.getCurrentLunarPhase(date);
    const optimalPhases = OPTIMAL_PHASES_BY_CROP[cropType];
    return optimalPhases.includes(lunarPhase);
  }

  /**
   * Get next optimal planting date for a crop type
   */
  getNextOptimalPlantingDate(
    cropType: CropType,
    startDate: Date = new Date()
  ): Date | null {
    const windows = this.getOptimalPlantingDays(cropType, 30, startDate);
    return windows.length > 0 ? windows[0]!.start : null;
  }

  /**
   * Get seasonal operations for current season
   */
  getSeasonalOperations(date: Date = new Date()): string[] {
    const season = this.getCurrentSeason(date);
    return SEASONAL_OPERATIONS[season];
  }

  /**
   * Calculate biodynamic alignment score (0-100)
   * Used for assessing farm practices alignment with biodynamic principles
   */
  calculateBiodynamicScore(farmData: {
    followsLunarCalendar: boolean;
    usesBiodynamicPreparations: boolean;
    practiceCropRotation: boolean;
    maintainsBiodiversity: boolean;
    compostOnSite: boolean;
    avoidsChemicals: boolean;
    integratesLivestock: boolean;
  }): number {
    let score = 0;

    if (farmData.followsLunarCalendar) score += 20;
    if (farmData.usesBiodynamicPreparations) score += 20;
    if (farmData.practiceCropRotation) score += 15;
    if (farmData.maintainsBiodiversity) score += 15;
    if (farmData.compostOnSite) score += 10;
    if (farmData.avoidsChemicals) score += 10;
    if (farmData.integratesLivestock) score += 10;

    return score;
  }

  /**
   * Get lunar phase emoji for UI display
   */
  getLunarPhaseEmoji(phase: LunarPhase): string {
    const emojis: Record<LunarPhase, string> = {
      [LunarPhase.NEW_MOON]: '🌑',
      [LunarPhase.WAXING_CRESCENT]: '🌒',
      [LunarPhase.FIRST_QUARTER]: '🌓',
      [LunarPhase.WAXING_GIBBOUS]: '🌔',
      [LunarPhase.FULL_MOON]: '🌕',
      [LunarPhase.WANING_GIBBOUS]: '🌖',
      [LunarPhase.LAST_QUARTER]: '🌗',
      [LunarPhase.WANING_CRESCENT]: '🌘'
    };

    return emojis[phase];
  }

  /**
   * Get season emoji for UI display
   */
  getSeasonEmoji(season: Season): string {
    const emojis: Record<Season, string> = {
      [Season.SPRING]: '🌱',
      [Season.SUMMER]: '☀️',
      [Season.FALL]: '🍂',
      [Season.WINTER]: '❄️'
    };

    return emojis[season];
  }
}

// Singleton instance
export const biodynamicCalendar = new BiodynamicCalendarService();
