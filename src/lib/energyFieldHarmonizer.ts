import { ContextObservation } from '../lib/quantumContextObserver';
import { QuantumSignificance, calculateQuantumSignificance } from './quantumCalculations';

export interface EnergyFieldMetrics {
  vibration: number;  // 0-1: resonance with quantum field
  harmony: number;    // 0-1: alignment with natural cycles
  flow: number;       // 0-1: energy movement efficiency
  stability: number;  // 0-1: field stability measure
}

export interface HarmonizationResult {
  metrics: EnergyFieldMetrics;
  recommendations: string[];
  optimizations: Array<{
    dimension: string;
    action: string;
    impact: number;
  }>;
}

export class EnergyFieldHarmonizer {
  private readonly dimensions = ['physical', 'quantum', 'spiritual', 'temporal'];
  private fieldHistory: Array<{
    timestamp: number;
    metrics: EnergyFieldMetrics;
  }> = [];

  constructor(
    private readonly config: {
      minVibration: number;
      targetHarmony: number;
      flowThreshold: number;
      stabilityMargin: number;
    } = {
      minVibration: 0.7,
      targetHarmony: 0.85,
      flowThreshold: 0.75,
      stabilityMargin: 0.1
    }
  ) {}

  public analyzeField(
    observations: ContextObservation[],
    currentMetrics: EnergyFieldMetrics
  ): HarmonizationResult {
    this.fieldHistory.push({
      timestamp: Date.now(),
      metrics: currentMetrics
    });

    // Prune old history
    this.pruneHistory();

    const significance = calculateQuantumSignificance(observations);
    const recommendations = this.generateRecommendations(currentMetrics, significance);
    const optimizations = this.calculateOptimizations(currentMetrics, significance);

    return {
      metrics: this.calculateAdjustedMetrics(currentMetrics, significance),
      recommendations,
      optimizations
    };
  }

  private pruneHistory(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // 7 days
    const now = Date.now();
    this.fieldHistory = this.fieldHistory.filter(
      record => now - record.timestamp <= maxAge
    );
  }

  private calculateAdjustedMetrics(
    current: EnergyFieldMetrics,
    significance: QuantumSignificance
  ): EnergyFieldMetrics {
    return {
      vibration: current.vibration * significance.value,
      harmony: current.harmony * significance.dimensionalResonance,
      flow: current.flow * significance.temporalWeight,
      stability: current.stability * significance.confidence
    };
  }

  private generateRecommendations(
    metrics: EnergyFieldMetrics,
    significance: QuantumSignificance
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.vibration < this.config.minVibration) {
      recommendations.push('Increase quantum field resonance through vibrational alignment');
    }

    if (metrics.harmony < this.config.targetHarmony) {
      recommendations.push('Enhance harmonic convergence with natural cycles');
    }

    if (metrics.flow < this.config.flowThreshold) {
      recommendations.push('Optimize energy flow pathways');
    }

    if (metrics.stability < 1 - this.config.stabilityMargin) {
      recommendations.push('Stabilize dimensional boundaries');
    }

    return recommendations;
  }

  private calculateOptimizations(
    metrics: EnergyFieldMetrics,
    significance: QuantumSignificance
  ) {
    return this.dimensions.map(dimension => {
      const impactScore = this.calculateDimensionalImpact(
        dimension,
        metrics,
        significance
      );

      return {
        dimension,
        action: this.determineOptimalAction(dimension, impactScore),
        impact: impactScore
      };
    });
  }

  private calculateDimensionalImpact(
    dimension: string,
    metrics: EnergyFieldMetrics,
    significance: QuantumSignificance
  ): number {
    switch (dimension) {
      case 'physical':
        return metrics.stability * significance.confidence;
      case 'quantum':
        return metrics.vibration * significance.value;
      case 'spiritual':
        return metrics.harmony * significance.dimensionalResonance;
      case 'temporal':
        return metrics.flow * significance.temporalWeight;
      default:
        return 0;
    }
  }

  private determineOptimalAction(dimension: string, impact: number): string {
    if (impact < 0.3) {
      return 'Major realignment required';
    } else if (impact < 0.6) {
      return 'Moderate adjustment needed';
    } else if (impact < 0.8) {
      return 'Minor tuning recommended';
    } else {
      return 'Maintain current alignment';
    }
  }

  public getFieldTrends(): {
    vibrationTrend: number;
    harmonyTrend: number;
    flowTrend: number;
    stabilityTrend: number;
  } {
    if (this.fieldHistory.length < 2) {
      return {
        vibrationTrend: 0,
        harmonyTrend: 0,
        flowTrend: 0,
        stabilityTrend: 0
      };
    }

    const calculateTrend = (metric: keyof EnergyFieldMetrics) => {
      const values = this.fieldHistory.map(record => record.metrics[metric]);
      const recentAvg = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const oldAvg = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      return recentAvg - oldAvg;
    };

    return {
      vibrationTrend: calculateTrend('vibration'),
      harmonyTrend: calculateTrend('harmony'),
      flowTrend: calculateTrend('flow'),
      stabilityTrend: calculateTrend('stability')
    };
  }
}