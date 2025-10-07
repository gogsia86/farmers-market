/**
 * Divine Animation System
 * A quantum-aware animation framework inspired by natural patterns
 */

import type { AgriculturalCycle } from '../navigation/agricultural-types';

export type NaturalPattern = 'GROWTH' | 'FLOW' | 'SPIRAL' | 'WAVE' | 'BLOOM';
export type AnimationEnergy = 'GENTLE' | 'FLOWING' | 'VIBRANT' | 'RADIANT';
export type CyclicalPhase = 'DAWN' | 'ZENITH' | 'DUSK' | 'NADIR';

export interface NaturalMotion {
  pattern: NaturalPattern;
  energy: AnimationEnergy;
  duration: number;
  phase: CyclicalPhase;
  harmonics: number[];
}

export interface BiodynamicTiming {
  moonPhase: number;
  seasonalEnergy: number;
  diurnalPhase: CyclicalPhase;
  rhythmStrength: number;
}

export interface AnimationState {
  currentPattern: NaturalPattern;
  energyLevel: number;
  resonance: number;
  harmony: number;
  flow: number;
}

export class DivineAnimationSystem {
  private activeAnimations: Map<string, NaturalMotion> = new Map();
  private state: AnimationState;

  constructor(
    private readonly seasonalContext: AgriculturalCycle,
    private readonly consciousnessLevel: number
  ) {
    this.state = {
      currentPattern: 'FLOW',
      energyLevel: seasonalContext.energyLevel,
      resonance: 1,
      harmony: 1,
      flow: 1
    };
  }

  /**
   * Create a nature-inspired animation
   */
  createNaturalMotion(
    element: HTMLElement,
    pattern: NaturalPattern,
    options: Partial<NaturalMotion> = {}
  ): NaturalMotion {
    const timing = this.calculateBiodynamicTiming();
    const motion = this.generateMotion(pattern, timing, options);
    
    this.applyNaturalMotion(element, motion);
    this.activeAnimations.set(element.id, motion);

    return motion;
  }

  /**
   * Update animation based on seasonal changes
   */
  updateSeasonalAnimations(): void {
    for (const [elementId, motion] of this.activeAnimations) {
      const element = document.getElementById(elementId);
      if (!element) continue;

      const updatedMotion = this.evolveMotion(motion);
      this.applyNaturalMotion(element, updatedMotion);
      this.activeAnimations.set(elementId, updatedMotion);
    }
  }

  /**
   * Get current animation state
   */
  getAnimationState(): AnimationState {
    return { ...this.state };
  }

  private calculateBiodynamicTiming(): BiodynamicTiming {
    const { moonPhase, energyLevel } = this.seasonalContext;
    const diurnalPhase = this.calculateDiurnalPhase();

    return {
      moonPhase,
      seasonalEnergy: energyLevel,
      diurnalPhase,
      rhythmStrength: this.calculateRhythmStrength(moonPhase, energyLevel)
    };
  }

  private generateMotion(
    pattern: NaturalPattern,
    timing: BiodynamicTiming,
    options: Partial<NaturalMotion>
  ): NaturalMotion {
    const baseHarmonics = this.calculateHarmonics(pattern, timing);
    const energy = this.determineEnergy(timing);
    const phase = timing.diurnalPhase;
    const duration = this.calculateDuration(pattern, timing);

    return {
      pattern,
      energy,
      duration,
      phase,
      harmonics: baseHarmonics,
      ...options
    };
  }

  private evolveMotion(motion: NaturalMotion): NaturalMotion {
    const timing = this.calculateBiodynamicTiming();
    const harmonics = this.evolveHarmonics(motion.harmonics, timing);
    const energy = this.evolveEnergy(motion.energy, timing);

    return {
      ...motion,
      harmonics,
      energy,
      phase: timing.diurnalPhase
    };
  }

  private applyNaturalMotion(element: HTMLElement, motion: NaturalMotion): void {
    const { pattern, harmonics, duration, energy } = motion;
    const animation = this.createAnimation(pattern, harmonics);
    
    // Apply CSS animations with Web Animations API
    element.animate(animation.keyframes, {
      duration,
      easing: this.getNaturalEasing(pattern),
      iterations: Infinity,
      direction: this.getAnimationDirection(pattern)
    });

    // Apply energy-based modifications
    this.applyEnergyEffects(element, energy);
    
    // Update animation state
    this.updateAnimationState(pattern, harmonics);
  }

  private createAnimation(pattern: NaturalPattern, harmonics: number[]): {
    keyframes: Keyframe[];
    timing: KeyframeAnimationOptions;
  } {
    switch (pattern) {
      case 'GROWTH':
        return this.createGrowthAnimation(harmonics);
      case 'FLOW':
        return this.createFlowAnimation(harmonics);
      case 'SPIRAL':
        return this.createSpiralAnimation(harmonics);
      case 'WAVE':
        return this.createWaveAnimation(harmonics);
      case 'BLOOM':
        return this.createBloomAnimation(harmonics);
      default:
        return this.createFlowAnimation(harmonics);
    }
  }

  private createGrowthAnimation(harmonics: number[]): {
    keyframes: Keyframe[];
    timing: KeyframeAnimationOptions;
  } {
    return {
      keyframes: [
        { transform: 'scale(1)', opacity: '0.7' },
        { transform: `scale(${1 + harmonics[0]})`, opacity: '1' },
        { transform: 'scale(1)', opacity: '0.7' }
      ],
      timing: {
        duration: 3000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    };
  }

  private createFlowAnimation(harmonics: number[]): {
    keyframes: Keyframe[];
    timing: KeyframeAnimationOptions;
  } {
    return {
      keyframes: [
        { transform: 'translateX(0)' },
        { transform: `translateX(${harmonics[0] * 10}px)` },
        { transform: 'translateX(0)' }
      ],
      timing: {
        duration: 2000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    };
  }

  private createSpiralAnimation(harmonics: number[]): {
    keyframes: Keyframe[];
    timing: KeyframeAnimationOptions;
  } {
    const radius = harmonics[0] * 20;
    const keyframes = [];
    for (let i = 0; i <= 1; i += 0.1) {
      const angle = i * Math.PI * 2;
      const x = Math.cos(angle) * radius * i;
      const y = Math.sin(angle) * radius * i;
      keyframes.push({
        transform: `translate(${x}px, ${y}px)`
      });
    }

    return {
      keyframes,
      timing: {
        duration: 4000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    };
  }

  private createWaveAnimation(harmonics: number[]): {
    keyframes: Keyframe[];
    timing: KeyframeAnimationOptions;
  } {
    const amplitude = harmonics[0] * 10;
    const keyframes = [];
    for (let i = 0; i <= 1; i += 0.1) {
      const y = Math.sin(i * Math.PI * 2) * amplitude;
      keyframes.push({
        transform: `translateY(${y}px)`
      });
    }

    return {
      keyframes,
      timing: {
        duration: 2500,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    };
  }

  private createBloomAnimation(harmonics: number[]): {
    keyframes: Keyframe[];
    timing: KeyframeAnimationOptions;
  } {
    return {
      keyframes: [
        { transform: 'scale(0)', opacity: '0' },
        { transform: `scale(${harmonics[0]})`, opacity: '0.5' },
        { transform: 'scale(1)', opacity: '1' }
      ],
      timing: {
        duration: 3500,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    };
  }

  private calculateHarmonics(
    pattern: NaturalPattern,
    timing: BiodynamicTiming
  ): number[] {
    const baseHarmonic = timing.rhythmStrength;
    const moonInfluence = Math.sin(timing.moonPhase * Math.PI * 2);
    const seasonalFactor = timing.seasonalEnergy;

    return [
      baseHarmonic,
      baseHarmonic * moonInfluence,
      baseHarmonic * seasonalFactor
    ];
  }

  private evolveHarmonics(
    currentHarmonics: number[],
    timing: BiodynamicTiming
  ): number[] {
    return currentHarmonics.map(h => 
      h * (0.8 + timing.rhythmStrength * 0.4)
    );
  }

  private determineEnergy(timing: BiodynamicTiming): AnimationEnergy {
    const totalEnergy = timing.seasonalEnergy * timing.rhythmStrength;
    
    if (totalEnergy > 0.8) return 'RADIANT';
    if (totalEnergy > 0.6) return 'VIBRANT';
    if (totalEnergy > 0.4) return 'FLOWING';
    return 'GENTLE';
  }

  private evolveEnergy(
    currentEnergy: AnimationEnergy,
    timing: BiodynamicTiming
  ): AnimationEnergy {
    const energyLevels: AnimationEnergy[] = ['GENTLE', 'FLOWING', 'VIBRANT', 'RADIANT'];
    const currentIndex = energyLevels.indexOf(currentEnergy);
    const targetEnergy = this.determineEnergy(timing);
    const targetIndex = energyLevels.indexOf(targetEnergy);

    if (currentIndex === targetIndex) return currentEnergy;
    return energyLevels[currentIndex + (targetIndex > currentIndex ? 1 : -1)];
  }

  private calculateDuration(
    pattern: NaturalPattern,
    timing: BiodynamicTiming
  ): number {
    const baseDuration = {
      GROWTH: 3000,
      FLOW: 2000,
      SPIRAL: 4000,
      WAVE: 2500,
      BLOOM: 3500
    }[pattern];

    return baseDuration * (1 / timing.rhythmStrength);
  }

  private getNaturalEasing(pattern: NaturalPattern): string {
    switch (pattern) {
      case 'GROWTH':
        return 'cubic-bezier(0.4, 0, 0.2, 1)';
      case 'FLOW':
        return 'cubic-bezier(0.4, 0, 0.2, 1)';
      case 'SPIRAL':
        return 'cubic-bezier(0.4, 0, 0.2, 1)';
      case 'WAVE':
        return 'cubic-bezier(0.4, 0, 0.2, 1)';
      case 'BLOOM':
        return 'cubic-bezier(0.4, 0, 0.2, 1)';
      default:
        return 'ease-in-out';
    }
  }

  private getAnimationDirection(pattern: NaturalPattern): PlaybackDirection {
    switch (pattern) {
      case 'GROWTH':
      case 'BLOOM':
        return 'alternate';
      case 'FLOW':
      case 'WAVE':
        return 'alternate';
      case 'SPIRAL':
        return 'normal';
      default:
        return 'alternate';
    }
  }

  private applyEnergyEffects(element: HTMLElement, energy: AnimationEnergy): void {
    const energyClass = `energy-${energy.toLowerCase()}`;
    element.classList.remove('energy-gentle', 'energy-flowing', 'energy-vibrant', 'energy-radiant');
    element.classList.add(energyClass);
  }

  private calculateDiurnalPhase(): CyclicalPhase {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'DAWN';
    if (hour >= 11 && hour < 17) return 'ZENITH';
    if (hour >= 17 && hour < 23) return 'DUSK';
    return 'NADIR';
  }

  private calculateRhythmStrength(moonPhase: number, seasonalEnergy: number): number {
    const moonInfluence = Math.sin(moonPhase * Math.PI * 2) * 0.3;
    const seasonalInfluence = seasonalEnergy * 0.7;
    return Math.min(1, moonInfluence + seasonalInfluence);
  }

  private updateAnimationState(pattern: NaturalPattern, harmonics: number[]): void {
    this.state = {
      currentPattern: pattern,
      energyLevel: this.seasonalContext.energyLevel,
      resonance: harmonics[0],
      harmony: this.calculateHarmony(harmonics),
      flow: this.calculateFlow(pattern)
    };
  }

  private calculateHarmony(harmonics: number[]): number {
    return harmonics.reduce((sum, h) => sum + h, 0) / harmonics.length;
  }

  private calculateFlow(pattern: NaturalPattern): number {
    const flowFactors = {
      GROWTH: 0.7,
      FLOW: 1,
      SPIRAL: 0.8,
      WAVE: 0.9,
      BLOOM: 0.6
    };
    return flowFactors[pattern] * this.seasonalContext.energyLevel;
  }
}