import { QuantumSignificance } from './quantumCalculations';

export interface CelestialPosition {
  azimuth: number;
  altitude: number;
  phase: number; // 0-1 for moon phase, position in zodiac for other bodies
}

export interface BiodynamicPhase {
  type: 'root' | 'leaf' | 'flower' | 'fruit';
  strength: number; // 0-1
  duration: number; // in hours
}

export interface NaturalCycle {
  name: string;
  period: number; // in hours
  currentPhase: number; // 0-1
  influence: number; // 0-1
}

export interface BiodynamicState {
  moonPhase: number; // 0-1
  zodiacPosition: string;
  elementalInfluence: {
    earth: number;
    water: number;
    air: number;
    fire: number;
  };
  plantingQuality: number; // 0-1
  harvestingQuality: number; // 0-1
}

export class BiodynamicCycleTracker {
  private cycles: NaturalCycle[] = [];
  private currentState: BiodynamicState;

  constructor() {
    this.cycles = this.initializeCycles();
    this.currentState = this.calculateInitialState();
  }

  private initializeCycles(): NaturalCycle[] {
    return [
      {
        name: 'lunar',
        period: 29.53 * 24, // synodic month in hours
        currentPhase: this.calculateLunarPhase(),
        influence: 0.8
      },
      {
        name: 'diurnal',
        period: 24,
        currentPhase: (new Date().getHours() % 24) / 24,
        influence: 0.6
      },
      {
        name: 'seasonal',
        period: 8766, // average hours in a year
        currentPhase: this.calculateSeasonalPhase(),
        influence: 0.9
      }
    ];
  }

  private calculateLunarPhase(): number {
    // Simplified lunar phase calculation
    const now = new Date();
    const newMoon = new Date('2025-10-05T12:00:00Z');
    const lunarMonth = 29.53 * 24 * 60 * 60 * 1000;
    const timeSinceNewMoon = now.getTime() - newMoon.getTime();
    return (timeSinceNewMoon % lunarMonth) / lunarMonth;
  }

  private calculateSeasonalPhase(): number {
    const now = new Date();
    return ((now.getMonth() * 30 + now.getDate()) % 365) / 365;
  }

  private calculateInitialState(): BiodynamicState {
    const moonPhase = this.calculateLunarPhase();
    return {
      moonPhase,
      zodiacPosition: this.calculateZodiacPosition(),
      elementalInfluence: this.calculateElementalInfluence(),
      plantingQuality: this.calculatePlantingQuality(),
      harvestingQuality: this.calculateHarvestingQuality()
    };
  }

  private calculateZodiacPosition(): string {
    const zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const zodiacIndex = Math.floor((dayOfYear * 12 / 365) % 12);
    return zodiacSigns[zodiacIndex];
  }

  private calculateElementalInfluence(): BiodynamicState['elementalInfluence'] {
    const baseInfluence = 0.25;
    const seasonalVariation = Math.sin(2 * Math.PI * this.calculateSeasonalPhase());
    const lunarVariation = Math.sin(2 * Math.PI * this.calculateLunarPhase());

    return {
      earth: baseInfluence + 0.1 * seasonalVariation,
      water: baseInfluence + 0.1 * lunarVariation,
      air: baseInfluence - 0.1 * seasonalVariation,
      fire: baseInfluence - 0.1 * lunarVariation
    };
  }

  private calculatePlantingQuality(): number {
    const moonInfluence = Math.sin(2 * Math.PI * this.currentState?.moonPhase || 0);
    const seasonalInfluence = Math.sin(2 * Math.PI * this.calculateSeasonalPhase());
    return (moonInfluence + seasonalInfluence + 2) / 4; // Normalize to 0-1
  }

  private calculateHarvestingQuality(): number {
    const moonInfluence = Math.cos(2 * Math.PI * this.currentState?.moonPhase || 0);
    const seasonalInfluence = Math.cos(2 * Math.PI * this.calculateSeasonalPhase());
    return (moonInfluence + seasonalInfluence + 2) / 4; // Normalize to 0-1
  }

  public updateState(significance: QuantumSignificance): void {
    this.currentState = {
      ...this.calculateInitialState(),
      plantingQuality: this.currentState.plantingQuality * significance.value,
      harvestingQuality: this.currentState.harvestingQuality * significance.dimensionalResonance
    };

    this.cycles = this.cycles.map(cycle => ({
      ...cycle,
      influence: cycle.influence * significance.temporalWeight
    }));
  }

  public getCurrentPhase(): BiodynamicPhase {
    const moonPhase = this.currentState.moonPhase;
    
    if (moonPhase < 0.25) {
      return { type: 'root', strength: 1 - moonPhase * 4, duration: 6 };
    } else if (moonPhase < 0.5) {
      return { type: 'leaf', strength: 1 - (moonPhase - 0.25) * 4, duration: 6 };
    } else if (moonPhase < 0.75) {
      return { type: 'flower', strength: 1 - (moonPhase - 0.5) * 4, duration: 6 };
    } else {
      return { type: 'fruit', strength: 1 - (moonPhase - 0.75) * 4, duration: 6 };
    }
  }

  public getOptimalTimes(activityType: 'planting' | 'harvesting' | 'maintenance'): Date[] {
    const now = new Date();
    const optimalTimes: Date[] = [];
    const hoursToCheck = 168; // Look ahead 1 week

    for (let hour = 0; hour < hoursToCheck; hour++) {
      const checkTime = new Date(now.getTime() + hour * 60 * 60 * 1000);
      const quality = this.calculateActivityQuality(activityType, checkTime);

      if (quality > 0.8) { // Only include highly favorable times
        optimalTimes.push(checkTime);
      }
    }

    return optimalTimes;
  }

  private calculateActivityQuality(
    activityType: 'planting' | 'harvesting' | 'maintenance',
    time: Date
  ): number {
    const moonPhase = this.calculateLunarPhaseForTime(time);
    const seasonalPhase = this.calculateSeasonalPhaseForTime(time);
    const diurnalPhase = (time.getHours() % 24) / 24;

    switch (activityType) {
      case 'planting':
        return (
          Math.sin(2 * Math.PI * moonPhase) * 0.4 +
          Math.sin(2 * Math.PI * seasonalPhase) * 0.4 +
          Math.sin(2 * Math.PI * diurnalPhase) * 0.2 + 1
        ) / 2;
      case 'harvesting':
        return (
          Math.cos(2 * Math.PI * moonPhase) * 0.4 +
          Math.cos(2 * Math.PI * seasonalPhase) * 0.4 +
          Math.cos(2 * Math.PI * diurnalPhase) * 0.2 + 1
        ) / 2;
      case 'maintenance':
        return (
          Math.sin(4 * Math.PI * moonPhase) * 0.3 +
          Math.sin(2 * Math.PI * seasonalPhase) * 0.3 +
          Math.sin(2 * Math.PI * diurnalPhase) * 0.4 + 1
        ) / 2;
    }
  }

  private calculateLunarPhaseForTime(time: Date): number {
    const newMoon = new Date('2025-10-05T12:00:00Z');
    const lunarMonth = 29.53 * 24 * 60 * 60 * 1000;
    const timeSinceNewMoon = time.getTime() - newMoon.getTime();
    return (timeSinceNewMoon % lunarMonth) / lunarMonth;
  }

  private calculateSeasonalPhaseForTime(time: Date): number {
    return ((time.getMonth() * 30 + time.getDate()) % 365) / 365;
  }

  public getCurrentState(): BiodynamicState {
    return this.currentState;
  }

  public getCycles(): NaturalCycle[] {
    return this.cycles;
  }
}