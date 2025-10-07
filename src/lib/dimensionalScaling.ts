import { DimensionalState } from '../hooks/useMultiDimensionalRender';
import { QuantumState } from './quantumStateManager';

export interface ScalingConfig {
  minDimensions: number;
  maxDimensions: number;
  scalingThreshold: number;
  adaptiveScaling: boolean;
  performanceTarget: number; // ms
}

export interface ScalingMetrics {
  currentDimensions: number;
  renderTime: number;
  coherenceLevel: number;
  scalingFactor: number;
}

export class DimensionalScaling {
  private config: ScalingConfig;
  private metrics: ScalingMetrics;

  constructor(config: Partial<ScalingConfig> = {}) {
    this.config = {
      minDimensions: 1,
      maxDimensions: 11, // Maximum dimensions we can handle
      scalingThreshold: 0.75,
      adaptiveScaling: true,
      performanceTarget: 16.67, // 60fps
      ...config
    };

    this.metrics = {
      currentDimensions: 3, // Start with basic 3D
      renderTime: 0,
      coherenceLevel: 1,
      scalingFactor: 1
    };
  }

  private calculateScalingFactor(state: QuantumState): number {
    const baseCoherence = state.coherenceLevel;
    const dimensionalComplexity = state.timelineVariants.size;
    const performanceRatio = this.metrics.renderTime / this.config.performanceTarget;

    // Adjust scaling based on performance and coherence
    let scalingFactor = (baseCoherence * (1 / performanceRatio));

    // Normalize between 0 and 1
    scalingFactor = Math.max(0, Math.min(1, scalingFactor));

    return scalingFactor;
  }

  private determineOptimalDimensions(scalingFactor: number): number {
    const range = this.config.maxDimensions - this.config.minDimensions;
    const rawDimensions = this.config.minDimensions + (range * scalingFactor);
    
    return Math.round(rawDimensions);
  }

  public updateRenderMetrics(renderTime: number): void {
    this.metrics.renderTime = renderTime;
  }

  public scaleState(state: QuantumState): QuantumState {
    if (!this.config.adaptiveScaling) return state;

    const scalingFactor = this.calculateScalingFactor(state);
    const optimalDimensions = this.determineOptimalDimensions(scalingFactor);

    this.metrics.scalingFactor = scalingFactor;
    this.metrics.currentDimensions = optimalDimensions;
    this.metrics.coherenceLevel = state.coherenceLevel;

    // Scale the dimensional state based on optimal dimensions
    const scaledVariants = new Map();
    let scaledProbabilities: number[] = [];

    state.timelineVariants.forEach((variant, key) => {
      const probability = state.probabilityField[parseInt(key)] || 0;
      
      // Only keep variants that fit within our dimensional budget
      if (probability >= this.config.scalingThreshold) {
        scaledVariants.set(key, this.scaleDimensionalState(variant, optimalDimensions));
        scaledProbabilities.push(probability);
      }
    });

    return {
      ...state,
      timelineVariants: scaledVariants,
      probabilityField: scaledProbabilities,
      dimensionalState: this.scaleDimensionalState(state.dimensionalState, optimalDimensions)
    };
  }

  private scaleDimensionalState(state: DimensionalState, targetDimensions: number): DimensionalState {
    // Preserve core dimensions while scaling additional ones
    return {
      ...state,
      physical: true, // Always keep physical dimension
      quantum: targetDimensions >= 2,
      spiritual: targetDimensions >= 3,
      resonanceFrequency: state.resonanceFrequency * (targetDimensions / this.config.maxDimensions),
      temporalAlignment: state.temporalAlignment * (this.metrics.scalingFactor)
    };
  }

  public getMetrics(): ScalingMetrics {
    return { ...this.metrics };
  }

  public updateConfig(newConfig: Partial<ScalingConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }
}