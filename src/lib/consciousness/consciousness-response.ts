/**
 * Consciousness Response System
 * Provides consciousness-aware interaction responses
 */

export type ConsciousnessLevel = 'DORMANT' | 'AWAKENING' | 'AWARE' | 'ENLIGHTENED' | 'TRANSCENDENT';
export type InteractionType = 'TOUCH' | 'HOVER' | 'FOCUS' | 'SCROLL' | 'NAVIGATE';
export type ResponseIntensity = 'SUBTLE' | 'GENTLE' | 'MODERATE' | 'STRONG' | 'PROFOUND';
export type EnergeticState = 'GROUNDING' | 'FLOWING' | 'EXPANDING' | 'HARMONIZING' | 'TRANSCENDING';

export interface ConsciousnessState {
  level: ConsciousnessLevel;
  energy: number;
  resonance: number;
  harmony: number;
  awareness: number;
}

export interface InteractionContext {
  type: InteractionType;
  element: HTMLElement;
  duration?: number;
  intensity?: number;
  intentionality?: number;
}

export interface ResponseConfig {
  baseIntensity: ResponseIntensity;
  energeticState: EnergeticState;
  duration: number;
  harmonics: number[];
  resonanceThreshold: number;
}

export class ConsciousnessResponseSystem {
  private currentState: ConsciousnessState;
  private responseCallbacks: Map<string, (response: ResponseConfig) => void>;
  private interactionHistory: InteractionContext[];
  private lastUpdateTime: number;

  constructor(
    private initialConsciousness: number = 0.5,
    private sensitivityThreshold: number = 0.7,
    private evolutionRate: number = 0.1
  ) {
    this.currentState = this.initializeState();
    this.responseCallbacks = new Map();
    this.interactionHistory = [];
    this.lastUpdateTime = Date.now();
  }

  /**
   * Register a response callback
   */
  subscribeToResponses(
    id: string,
    callback: (response: ResponseConfig) => void
  ): void {
    this.responseCallbacks.set(id, callback);
  }

  /**
   * Unregister a response callback
   */
  unsubscribeFromResponses(id: string): void {
    this.responseCallbacks.delete(id);
  }

  /**
   * Handle a conscious interaction
   */
  handleInteraction(context: InteractionContext): ResponseConfig {
    // Record interaction
    this.interactionHistory.push(context);
    if (this.interactionHistory.length > 10) {
      this.interactionHistory.shift();
    }

    // Update consciousness state
    this.evolveConsciousness(context);

    // Generate response
    const response = this.generateResponse(context);

    // Notify subscribers
    this.notifySubscribers(response);

    return response;
  }

  /**
   * Get current consciousness state
   */
  getConsciousnessState(): ConsciousnessState {
    return { ...this.currentState };
  }

  private initializeState(): ConsciousnessState {
    return {
      level: this.getConsciousnessLevel(this.initialConsciousness),
      energy: this.initialConsciousness,
      resonance: 1,
      harmony: 1,
      awareness: this.initialConsciousness
    };
  }

  private evolveConsciousness(context: InteractionContext): void {
    const timeDelta = (Date.now() - this.lastUpdateTime) / 1000; // seconds
    const interactionInfluence = this.calculateInteractionInfluence(context);
    const evolutionFactor = this.evolutionRate * timeDelta;

    this.currentState = {
      level: this.getConsciousnessLevel(this.currentState.energy),
      energy: this.evolveEnergy(interactionInfluence, evolutionFactor),
      resonance: this.evolveResonance(interactionInfluence, evolutionFactor),
      harmony: this.evolveHarmony(interactionInfluence, evolutionFactor),
      awareness: this.evolveAwareness(interactionInfluence, evolutionFactor)
    };

    this.lastUpdateTime = Date.now();
  }

  private generateResponse(context: InteractionContext): ResponseConfig {
    const baseIntensity = this.calculateResponseIntensity();
    const energeticState = this.calculateEnergeticState();
    const duration = this.calculateResponseDuration(context);
    const harmonics = this.calculateHarmonics();

    return {
      baseIntensity,
      energeticState,
      duration,
      harmonics,
      resonanceThreshold: this.sensitivityThreshold
    };
  }

  private calculateInteractionInfluence(context: InteractionContext): number {
    const typeWeights = {
      TOUCH: 1.0,
      HOVER: 0.6,
      FOCUS: 0.8,
      SCROLL: 0.4,
      NAVIGATE: 0.7
    };

    const baseInfluence = typeWeights[context.type];
    const intentionality = context.intentionality ?? 0.5;
    const intensity = context.intensity ?? 0.5;
    const duration = context.duration ?? 1;

    return baseInfluence * intentionality * intensity * Math.log10(duration + 1);
  }

  private evolveEnergy(influence: number, factor: number): number {
    const currentEnergy = this.currentState.energy;
    const targetEnergy = Math.min(1, currentEnergy + influence);
    return currentEnergy + (targetEnergy - currentEnergy) * factor;
  }

  private evolveResonance(influence: number, factor: number): number {
    const currentResonance = this.currentState.resonance;
    const targetResonance = Math.min(1, currentResonance + influence * 0.5);
    return currentResonance + (targetResonance - currentResonance) * factor;
  }

  private evolveHarmony(influence: number, factor: number): number {
    const currentHarmony = this.currentState.harmony;
    const targetHarmony = this.calculateTargetHarmony(influence);
    return currentHarmony + (targetHarmony - currentHarmony) * factor;
  }

  private evolveAwareness(influence: number, factor: number): number {
    const currentAwareness = this.currentState.awareness;
    const recentInteractions = this.interactionHistory.slice(-3);
    const interactionPattern = this.analyzeInteractionPattern(recentInteractions);
    const targetAwareness = Math.min(1, currentAwareness + influence * interactionPattern);
    return currentAwareness + (targetAwareness - currentAwareness) * factor;
  }

  private calculateTargetHarmony(influence: number): number {
    const recentStates = this.interactionHistory.map(i => 
      this.calculateInteractionInfluence(i)
    );

    if (recentStates.length < 2) return this.currentState.harmony;

    const variance = this.calculateVariance(recentStates);
    const smoothness = Math.max(0, 1 - variance);
    return Math.min(1, this.currentState.harmony + influence * smoothness);
  }

  private analyzeInteractionPattern(interactions: InteractionContext[]): number {
    if (interactions.length < 2) return 1;

    const patterns = interactions.map(i => ({
      type: i.type,
      intensity: i.intensity ?? 0.5,
      intentionality: i.intentionality ?? 0.5
    }));

    const consistency = this.calculatePatternConsistency(patterns);
    const intentionality = patterns.reduce((sum, p) => sum + p.intentionality, 0) / patterns.length;
    const intensity = patterns.reduce((sum, p) => sum + p.intensity, 0) / patterns.length;

    return (consistency * 0.4 + intentionality * 0.3 + intensity * 0.3);
  }

  private calculatePatternConsistency(
    patterns: Array<{ type: InteractionType; intensity: number; intentionality: number }>
  ): number {
    const typeFrequency = patterns.reduce((freq, p) => {
      freq[p.type] = (freq[p.type] || 0) + 1;
      return freq;
    }, {} as Record<InteractionType, number>);

    const dominantType = Object.entries(typeFrequency).sort((a, b) => b[1] - a[1])[0];
    return dominantType[1] / patterns.length;
  }

  private calculateResponseIntensity(): ResponseIntensity {
    const totalEnergy = this.currentState.energy * this.currentState.resonance;
    
    if (totalEnergy > 0.8) return 'PROFOUND';
    if (totalEnergy > 0.6) return 'STRONG';
    if (totalEnergy > 0.4) return 'MODERATE';
    if (totalEnergy > 0.2) return 'GENTLE';
    return 'SUBTLE';
  }

  private calculateEnergeticState(): EnergeticState {
    const { energy, resonance, harmony } = this.currentState;
    const totalState = (energy + resonance + harmony) / 3;

    if (totalState > 0.8) return 'TRANSCENDING';
    if (totalState > 0.6) return 'HARMONIZING';
    if (totalState > 0.4) return 'EXPANDING';
    if (totalState > 0.2) return 'FLOWING';
    return 'GROUNDING';
  }

  private calculateResponseDuration(context: InteractionContext): number {
    const baseDuration = {
      TOUCH: 800,
      HOVER: 600,
      FOCUS: 1000,
      SCROLL: 400,
      NAVIGATE: 1200
    }[context.type];

    return baseDuration * (1 + this.currentState.resonance);
  }

  private calculateHarmonics(): number[] {
    const baseHarmonic = this.currentState.harmony;
    const resonanceFactor = this.currentState.resonance;
    const awarenessFactor = this.currentState.awareness;

    return [
      baseHarmonic,
      baseHarmonic * resonanceFactor,
      baseHarmonic * awarenessFactor,
      baseHarmonic * Math.min(resonanceFactor, awarenessFactor)
    ];
  }

  private getConsciousnessLevel(energy: number): ConsciousnessLevel {
    if (energy > 0.8) return 'TRANSCENDENT';
    if (energy > 0.6) return 'ENLIGHTENED';
    if (energy > 0.4) return 'AWARE';
    if (energy > 0.2) return 'AWAKENING';
    return 'DORMANT';
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - mean, 2));
    return squareDiffs.reduce((sum, sq) => sum + sq, 0) / values.length;
  }

  private notifySubscribers(response: ResponseConfig): void {
    this.responseCallbacks.forEach(callback => {
      callback(response);
    });
  }
}