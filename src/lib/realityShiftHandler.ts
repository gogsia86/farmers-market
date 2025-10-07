import { QuantumState } from './quantumStateManager';
import { DimensionalState } from '../hooks/useMultiDimensionalRender';

export interface TransitionConfig {
  minTransitionDuration: number; // ms
  maxTransitionDuration: number; // ms
  coherenceThreshold: number;
  useQuantumEasing: boolean;
}

export interface RealityTransition {
  from: QuantumState;
  to: QuantumState;
  progress: number;
  duration: number;
  coherenceLevel: number;
}

export class RealityShiftHandler {
  private config: TransitionConfig;
  private activeTransitions: Map<string, RealityTransition>;
  private transitionCallbacks: Set<(transition: RealityTransition) => void>;

  constructor(config: Partial<TransitionConfig> = {}) {
    this.config = {
      minTransitionDuration: 150, // ms
      maxTransitionDuration: 750, // ms
      coherenceThreshold: 0.8,
      useQuantumEasing: true,
      ...config
    };

    this.activeTransitions = new Map();
    this.transitionCallbacks = new Set();
  }

  private generateTransitionId(from: QuantumState, to: QuantumState): string {
    return `${from.coherenceLevel}-${to.coherenceLevel}-${Date.now()}`;
  }

  private calculateTransitionDuration(from: QuantumState, to: QuantumState): number {
    const coherenceDiff = Math.abs(from.coherenceLevel - to.coherenceLevel);
    const dimensionalDiff = this.calculateDimensionalDifference(from.dimensionalState, to.dimensionalState);
    
    // Scale duration based on the magnitude of the change
    const normalizedDiff = (coherenceDiff + dimensionalDiff) / 2;
    
    const duration = this.config.minTransitionDuration + 
      (normalizedDiff * (this.config.maxTransitionDuration - this.config.minTransitionDuration));
    
    return Math.min(this.config.maxTransitionDuration, Math.max(this.config.minTransitionDuration, duration));
  }

  private calculateDimensionalDifference(from: DimensionalState, to: DimensionalState): number {
    const fromDimensions = Object.values(from).filter(v => typeof v === 'boolean').length;
    const toDimensions = Object.values(to).filter(v => typeof v === 'boolean').length;
    
    return Math.abs(fromDimensions - toDimensions) / Math.max(fromDimensions, toDimensions);
  }

  private interpolateQuantumState(from: QuantumState, to: QuantumState, progress: number): QuantumState {
    // Apply quantum easing if enabled
    const easedProgress = this.config.useQuantumEasing 
      ? this.quantumEase(progress)
      : progress;

    // Interpolate dimensional states
    const interpolatedDimensional = this.interpolateDimensionalState(
      from.dimensionalState,
      to.dimensionalState,
      easedProgress
    );

    // Interpolate probability fields
    const interpolatedProbabilities = this.interpolateProbabilities(
      from.probabilityField,
      to.probabilityField,
      easedProgress
    );

    // Merge timeline variants
    const interpolatedVariants = this.interpolateTimelineVariants(
      from.timelineVariants,
      to.timelineVariants,
      easedProgress
    );

    return {
      dimensionalState: interpolatedDimensional,
      timelineVariants: interpolatedVariants,
      probabilityField: interpolatedProbabilities,
      coherenceLevel: from.coherenceLevel * (1 - easedProgress) + to.coherenceLevel * easedProgress
    };
  }

  private quantumEase(progress: number): number {
    // Custom easing function that simulates quantum tunneling effect
    return 0.5 - Math.cos(progress * Math.PI) / 2;
  }

  private interpolateDimensionalState(from: DimensionalState, to: DimensionalState, progress: number): DimensionalState {
    return {
      ...from,
      resonanceFrequency: from.resonanceFrequency * (1 - progress) + to.resonanceFrequency * progress,
      temporalAlignment: from.temporalAlignment * (1 - progress) + to.temporalAlignment * progress,
      // Boolean dimensions switch at 50% progress
      physical: progress < 0.5 ? from.physical : to.physical,
      quantum: progress < 0.5 ? from.quantum : to.quantum,
      spiritual: progress < 0.5 ? from.spiritual : to.spiritual
    };
  }

  private interpolateProbabilities(from: number[], to: number[], progress: number): number[] {
    const maxLength = Math.max(from.length, to.length);
    const result: number[] = [];

    for (let i = 0; i < maxLength; i++) {
      const fromValue = from[i] || 0;
      const toValue = to[i] || 0;
      result.push(fromValue * (1 - progress) + toValue * progress);
    }

    return result;
  }

  private interpolateTimelineVariants(
    from: Map<string, DimensionalState>,
    to: Map<string, DimensionalState>,
    progress: number
  ): Map<string, DimensionalState> {
    const result = new Map();

    // Handle common variants
    from.forEach((fromVariant, key) => {
      if (to.has(key)) {
        result.set(
          key,
          this.interpolateDimensionalState(fromVariant, to.get(key)!, progress)
        );
      } else if (progress < 0.5) {
        // Keep source variants in first half of transition
        result.set(key, fromVariant);
      }
    });

    // Add new variants in second half of transition
    if (progress >= 0.5) {
      to.forEach((toVariant, key) => {
        if (!from.has(key)) {
          result.set(key, toVariant);
        }
      });
    }

    return result;
  }

  public beginTransition(from: QuantumState, to: QuantumState): string {
    const transitionId = this.generateTransitionId(from, to);
    const duration = this.calculateTransitionDuration(from, to);

    const transition: RealityTransition = {
      from,
      to,
      progress: 0,
      duration,
      coherenceLevel: Math.min(from.coherenceLevel, to.coherenceLevel)
    };

    this.activeTransitions.set(transitionId, transition);
    this.notifyTransitionUpdated(transition);

    return transitionId;
  }

  public updateTransition(transitionId: string, progress: number): QuantumState | null {
    const transition = this.activeTransitions.get(transitionId);
    if (!transition) return null;

    const normalizedProgress = Math.min(1, Math.max(0, progress));
    transition.progress = normalizedProgress;

    const interpolatedState = this.interpolateQuantumState(
      transition.from,
      transition.to,
      normalizedProgress
    );

    this.notifyTransitionUpdated(transition);

    if (normalizedProgress >= 1) {
      this.activeTransitions.delete(transitionId);
    }

    return interpolatedState;
  }

  public addTransitionListener(callback: (transition: RealityTransition) => void): void {
    this.transitionCallbacks.add(callback);
  }

  public removeTransitionListener(callback: (transition: RealityTransition) => void): void {
    this.transitionCallbacks.delete(callback);
  }

  private notifyTransitionUpdated(transition: RealityTransition): void {
    this.transitionCallbacks.forEach(callback => callback(transition));
  }

  public getActiveTransitions(): RealityTransition[] {
    return Array.from(this.activeTransitions.values());
  }

  public isTransitionActive(transitionId: string): boolean {
    return this.activeTransitions.has(transitionId);
  }

  public cancelTransition(transitionId: string): void {
    this.activeTransitions.delete(transitionId);
  }

  public updateConfig(newConfig: Partial<TransitionConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }
}