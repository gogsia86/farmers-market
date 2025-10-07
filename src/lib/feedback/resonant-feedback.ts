/**
 * Resonant Feedback System
 * Creates harmonious natural patterns in response to user interactions
 */

export type ResonancePattern = 'RIPPLE' | 'PULSE' | 'WAVE' | 'ECHO' | 'GLOW';
export type EnergyState = 'DORMANT' | 'AWAKENING' | 'RESONATING' | 'HARMONIZING';
export type FeedbackIntensity = 'SUBTLE' | 'GENTLE' | 'MODERATE' | 'VIBRANT';

export interface ResonanceConfig {
  baseFrequency: number;
  harmonics: number[];
  amplitude: number;
  duration: number;
  decay: number;
}

export interface FeedbackState {
  pattern: ResonancePattern;
  energy: EnergyState;
  intensity: FeedbackIntensity;
  harmony: number;
  resonance: number;
}

export class ResonantFeedbackSystem {
  private activeResonance: Map<string, ResonanceConfig> = new Map();
  private state: FeedbackState;

  constructor(
    private readonly baseHarmony: number = 1,
    private readonly consciousnessLevel: number = 1
  ) {
    this.state = {
      pattern: 'RIPPLE',
      energy: 'DORMANT',
      intensity: 'SUBTLE',
      harmony: baseHarmony,
      resonance: consciousnessLevel
    };
  }

  /**
   * Create resonant feedback for an interaction
   */
  createResonance(
    element: HTMLElement,
    pattern: ResonancePattern,
    options: Partial<ResonanceConfig> = {}
  ): ResonanceConfig {
    const config = this.generateResonanceConfig(pattern, options);
    this.applyResonance(element, config);
    this.activeResonance.set(element.id, config);
    return config;
  }

  /**
   * Update resonance based on consciousness level
   */
  updateResonance(elementId: string, consciousnessLevel: number): void {
    const element = document.getElementById(elementId);
    const config = this.activeResonance.get(elementId);
    
    if (!element || !config) return;

    const updatedConfig = this.evolveResonance(config, consciousnessLevel);
    this.applyResonance(element, updatedConfig);
    this.activeResonance.set(elementId, updatedConfig);
  }

  /**
   * Get current feedback state
   */
  getFeedbackState(): FeedbackState {
    return { ...this.state };
  }

  private generateResonanceConfig(
    pattern: ResonancePattern,
    options: Partial<ResonanceConfig>
  ): ResonanceConfig {
    const baseConfig = this.getBaseConfig(pattern);
    return {
      ...baseConfig,
      ...options
    };
  }

  private getBaseConfig(pattern: ResonancePattern): ResonanceConfig {
    const configs: Record<ResonancePattern, ResonanceConfig> = {
      RIPPLE: {
        baseFrequency: 2,
        harmonics: [1, 1.618, 2.618],
        amplitude: 0.5,
        duration: 1000,
        decay: 0.8
      },
      PULSE: {
        baseFrequency: 1,
        harmonics: [1, 2, 3],
        amplitude: 0.7,
        duration: 800,
        decay: 0.9
      },
      WAVE: {
        baseFrequency: 0.5,
        harmonics: [1, 1.5, 2],
        amplitude: 0.6,
        duration: 1500,
        decay: 0.7
      },
      ECHO: {
        baseFrequency: 1.5,
        harmonics: [1, 1.2, 1.4],
        amplitude: 0.4,
        duration: 2000,
        decay: 0.6
      },
      GLOW: {
        baseFrequency: 0.8,
        harmonics: [1, 1.3, 1.6],
        amplitude: 0.5,
        duration: 1200,
        decay: 0.85
      }
    };

    return configs[pattern];
  }

  private applyResonance(element: HTMLElement, config: ResonanceConfig): void {
    const { baseFrequency, harmonics, amplitude, duration, decay } = config;

    // Create resonant animation
    element.animate([
      { scale: 1, opacity: 1 },
      { scale: 1 + amplitude * harmonics[0], opacity: 0.8 },
      { scale: 1 + amplitude * harmonics[1], opacity: 0.9 },
      { scale: 1 + amplitude * harmonics[2], opacity: 1 },
      { scale: 1, opacity: 1 }
    ], {
      duration,
      easing: 'ease-in-out',
      iterations: 1
    });

    // Apply resonant transform
    this.applyResonantTransform(element, config);

    // Update feedback state
    this.updateFeedbackState(config);
  }

  private applyResonantTransform(
    element: HTMLElement,
    config: ResonanceConfig
  ): void {
    const { baseFrequency, amplitude } = config;
    
    // Add resonant class
    element.classList.add('resonating');

    // Apply custom properties for CSS animations
    element.style.setProperty('--resonance-frequency', `${baseFrequency}s`);
    element.style.setProperty('--resonance-amplitude', `${amplitude}`);

    // Clean up after resonance
    setTimeout(() => {
      element.classList.remove('resonating');
      element.style.removeProperty('--resonance-frequency');
      element.style.removeProperty('--resonance-amplitude');
    }, config.duration);
  }

  private evolveResonance(
    config: ResonanceConfig,
    consciousnessLevel: number
  ): ResonanceConfig {
    return {
      ...config,
      amplitude: config.amplitude * Math.min(1.5, consciousnessLevel),
      harmonics: config.harmonics.map(h => h * consciousnessLevel),
      duration: config.duration * (1 / Math.sqrt(consciousnessLevel))
    };
  }

  private updateFeedbackState(config: ResonanceConfig): void {
    const intensity = this.calculateIntensity(config);
    const energy = this.calculateEnergyState(config);

    this.state = {
      ...this.state,
      intensity,
      energy,
      harmony: this.calculateHarmony(config),
      resonance: this.calculateResonance(config)
    };
  }

  private calculateIntensity(config: ResonanceConfig): FeedbackIntensity {
    const totalEnergy = config.amplitude * config.baseFrequency;
    
    if (totalEnergy > 0.8) return 'VIBRANT';
    if (totalEnergy > 0.6) return 'MODERATE';
    if (totalEnergy > 0.4) return 'GENTLE';
    return 'SUBTLE';
  }

  private calculateEnergyState(config: ResonanceConfig): EnergyState {
    const energy = config.amplitude * Math.max(...config.harmonics);
    
    if (energy > 0.8) return 'HARMONIZING';
    if (energy > 0.6) return 'RESONATING';
    if (energy > 0.3) return 'AWAKENING';
    return 'DORMANT';
  }

  private calculateHarmony(config: ResonanceConfig): number {
    return config.harmonics.reduce((sum, h) => sum + h, 0) / config.harmonics.length;
  }

  private calculateResonance(config: ResonanceConfig): number {
    return (config.amplitude * config.baseFrequency * this.consciousnessLevel) / 
           (config.decay * config.duration / 1000);
  }
}