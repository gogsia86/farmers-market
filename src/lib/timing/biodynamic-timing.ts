/**
 * Biodynamic Timing System
 * Aligns application timing with natural cycles and agricultural rhythms
 */

export type CelestialPhase = 'NEW' | 'WAXING' | 'FULL' | 'WANING';
export type SeasonalPhase = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';
export type DiurnalPhase = 'DAWN' | 'ZENITH' | 'DUSK' | 'NADIR';
export type BiodynamicActivity = 'PLANTING' | 'GROWING' | 'HARVESTING' | 'RESTING';

export interface BiodynamicCycle {
  celestial: CelestialPhase;
  seasonal: SeasonalPhase;
  diurnal: DiurnalPhase;
  activity: BiodynamicActivity;
  energyLevel: number;
  harmonyIndex: number;
}

export interface TimingConfig {
  updateFrequency: number;
  sensitivity: number;
  harmonicAlignment: number;
  resonanceFactor: number;
}

export class BiodynamicTimingSystem {
  private currentCycle: BiodynamicCycle;
  private timingCallbacks: Map<string, (cycle: BiodynamicCycle) => void>;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(private config: TimingConfig) {
    this.currentCycle = this.calculateCurrentCycle();
    this.timingCallbacks = new Map();
    this.startCycleUpdates();
  }

  /**
   * Register a callback for cycle updates
   */
  subscribeToCycle(
    id: string,
    callback: (cycle: BiodynamicCycle) => void
  ): void {
    this.timingCallbacks.set(id, callback);
    callback(this.currentCycle); // Initial callback
  }

  /**
   * Unregister a cycle callback
   */
  unsubscribeFromCycle(id: string): void {
    this.timingCallbacks.delete(id);
  }

  /**
   * Get the current biodynamic cycle
   */
  getCurrentCycle(): BiodynamicCycle {
    return { ...this.currentCycle };
  }

  /**
   * Calculate optimal timing for an activity
   */
  calculateOptimalTiming(
    activity: BiodynamicActivity,
    duration: number
  ): Date {
    const now = new Date();
    const cycle = this.currentCycle;
    
    // Calculate base optimal time
    let optimalHours = this.getOptimalHours(activity, cycle);
    let optimalDate = new Date(now);
    optimalDate.setHours(optimalHours, 0, 0, 0);

    // If we've passed the optimal time today, try tomorrow
    if (optimalDate.getTime() < now.getTime()) {
      optimalDate.setDate(optimalDate.getDate() + 1);
    }

    // Adjust for celestial and seasonal influences
    const celestialAdjustment = this.calculateCelestialAdjustment(cycle, activity);
    const seasonalAdjustment = this.calculateSeasonalAdjustment(cycle, activity);

    optimalDate = new Date(
      optimalDate.getTime() + 
      celestialAdjustment + 
      seasonalAdjustment
    );

    return optimalDate;
  }

  /**
   * Check if current time is harmonious for an activity
   */
  isHarmoniousTime(activity: BiodynamicActivity): boolean {
    const cycle = this.currentCycle;
    
    // Check celestial harmony
    const celestialHarmony = this.checkCelestialHarmony(cycle, activity);
    if (!celestialHarmony) return false;

    // Check seasonal harmony
    const seasonalHarmony = this.checkSeasonalHarmony(cycle, activity);
    if (!seasonalHarmony) return false;

    // Check diurnal harmony
    const diurnalHarmony = this.checkDiurnalHarmony(cycle, activity);
    if (!diurnalHarmony) return false;

    // Check energy levels
    return cycle.energyLevel >= this.getMinimumEnergy(activity);
  }

  /**
   * Stop cycle updates
   */
  cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private startCycleUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.currentCycle = this.calculateCurrentCycle();
      this.notifySubscribers();
    }, this.config.updateFrequency);
  }

  private notifySubscribers(): void {
    this.timingCallbacks.forEach(callback => {
      callback(this.currentCycle);
    });
  }

  private calculateCurrentCycle(): BiodynamicCycle {
    const now = new Date();
    const hour = now.getHours();

    return {
      celestial: this.calculateCelestialPhase(now),
      seasonal: this.calculateSeasonalPhase(now),
      diurnal: this.calculateDiurnalPhase(hour),
      activity: this.determineCurrentActivity(hour),
      energyLevel: this.calculateEnergyLevel(now),
      harmonyIndex: this.calculateHarmonyIndex(now)
    };
  }

  private calculateCelestialPhase(date: Date): CelestialPhase {
    // Simplified moon phase calculation
    const moonAge = this.getMoonAge(date);
    if (moonAge < 7) return 'NEW';
    if (moonAge < 14) return 'WAXING';
    if (moonAge < 21) return 'FULL';
    return 'WANING';
  }

  private calculateSeasonalPhase(date: Date): SeasonalPhase {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'SPRING';
    if (month >= 5 && month <= 7) return 'SUMMER';
    if (month >= 8 && month <= 10) return 'AUTUMN';
    return 'WINTER';
  }

  private calculateDiurnalPhase(hour: number): DiurnalPhase {
    if (hour >= 5 && hour < 11) return 'DAWN';
    if (hour >= 11 && hour < 17) return 'ZENITH';
    if (hour >= 17 && hour < 23) return 'DUSK';
    return 'NADIR';
  }

  private determineCurrentActivity(hour: number): BiodynamicActivity {
    if (hour >= 5 && hour < 11) return 'PLANTING';
    if (hour >= 11 && hour < 17) return 'GROWING';
    if (hour >= 17 && hour < 23) return 'HARVESTING';
    return 'RESTING';
  }

  private calculateEnergyLevel(date: Date): number {
    const hour = date.getHours();
    const baseEnergy = Math.sin((hour / 24) * Math.PI * 2);
    const moonInfluence = Math.sin(this.getMoonAge(date) / 29.5 * Math.PI * 2);
    const seasonalFactor = this.getSeasonalFactor(date);

    return (baseEnergy * 0.4 + moonInfluence * 0.3 + seasonalFactor * 0.3);
  }

  private calculateHarmonyIndex(date: Date): number {
    const celestialHarmony = Math.sin(this.getMoonAge(date) / 29.5 * Math.PI * 2);
    const diurnalHarmony = Math.sin((date.getHours() / 24) * Math.PI * 2);
    const seasonalHarmony = this.getSeasonalFactor(date);

    return (
      celestialHarmony * this.config.harmonicAlignment +
      diurnalHarmony * this.config.resonanceFactor +
      seasonalHarmony
    ) / 3;
  }

  private getMoonAge(date: Date): number {
    // Simplified moon age calculation
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const lp = 2551443;
    const now = new Date(year, month - 1, day, 20, 35, 0);
    const new_moon = new Date(1970, 0, 7, 20, 35, 0);
    const phase = ((now.getTime() - new_moon.getTime()) / 1000) % lp;
    
    return Math.floor(phase / (24 * 3600)) + 1;
  }

  private getSeasonalFactor(date: Date): number {
    const month = date.getMonth();
    const seasonPosition = (month % 12) / 12;
    return Math.sin(seasonPosition * Math.PI * 2);
  }

  private getOptimalHours(
    activity: BiodynamicActivity,
    cycle: BiodynamicCycle
  ): number {
    const baseHours = {
      PLANTING: 8,
      GROWING: 14,
      HARVESTING: 19,
      RESTING: 2
    };

    return baseHours[activity];
  }

  private calculateCelestialAdjustment(
    cycle: BiodynamicCycle,
    activity: BiodynamicActivity
  ): number {
    const adjustmentMap = {
      PLANTING: { NEW: 0, WAXING: 2, FULL: -1, WANING: -2 },
      GROWING: { NEW: -2, WAXING: 2, FULL: 2, WANING: -1 },
      HARVESTING: { NEW: -1, WAXING: -2, FULL: 2, WANING: 2 },
      RESTING: { NEW: 2, WAXING: -1, WANING: 2, FULL: -2 }
    };

    return adjustmentMap[activity][cycle.celestial] * 3600000; // Convert to milliseconds
  }

  private calculateSeasonalAdjustment(
    cycle: BiodynamicCycle,
    activity: BiodynamicActivity
  ): number {
    const adjustmentMap = {
      PLANTING: { SPRING: 0, SUMMER: 1, AUTUMN: -1, WINTER: -2 },
      GROWING: { SPRING: 1, SUMMER: 2, AUTUMN: 0, WINTER: -2 },
      HARVESTING: { SPRING: -1, SUMMER: 1, AUTUMN: 2, WINTER: -1 },
      RESTING: { SPRING: -1, SUMMER: -2, AUTUMN: 1, WINTER: 2 }
    };

    return adjustmentMap[activity][cycle.seasonal] * 3600000; // Convert to milliseconds
  }

  private checkCelestialHarmony(
    cycle: BiodynamicCycle,
    activity: BiodynamicActivity
  ): boolean {
    const harmonies = {
      PLANTING: ['NEW', 'WAXING'],
      GROWING: ['WAXING', 'FULL'],
      HARVESTING: ['FULL', 'WANING'],
      RESTING: ['WANING', 'NEW']
    };

    return harmonies[activity].includes(cycle.celestial);
  }

  private checkSeasonalHarmony(
    cycle: BiodynamicCycle,
    activity: BiodynamicActivity
  ): boolean {
    const harmonies = {
      PLANTING: ['SPRING', 'SUMMER'],
      GROWING: ['SPRING', 'SUMMER', 'AUTUMN'],
      HARVESTING: ['SUMMER', 'AUTUMN'],
      RESTING: ['AUTUMN', 'WINTER']
    };

    return harmonies[activity].includes(cycle.seasonal);
  }

  private checkDiurnalHarmony(
    cycle: BiodynamicCycle,
    activity: BiodynamicActivity
  ): boolean {
    const harmonies = {
      PLANTING: ['DAWN', 'ZENITH'],
      GROWING: ['ZENITH'],
      HARVESTING: ['DUSK'],
      RESTING: ['NADIR']
    };

    return harmonies[activity].includes(cycle.diurnal);
  }

  private getMinimumEnergy(activity: BiodynamicActivity): number {
    const minimums = {
      PLANTING: 0.4,
      GROWING: 0.6,
      HARVESTING: 0.5,
      RESTING: 0.2
    };

    return minimums[activity];
  }
}