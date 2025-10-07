/**
 * Quantum Monitoring System
 * Monitors and analyzes quantum state changes in the agricultural system
 */

import { QuantumState, PerformanceMetrics, ValidationMatrix } from '../../types/quantum';
import { AgriculturalState } from '../../core/agricultural/AgriculturalPatterns';
import { calculateCoherence } from '../../utils/quantum/quantumUtils';

export interface MonitoringMetrics extends PerformanceMetrics {
  coherence: number;
  stability: number;
  health: number;
}

export interface StateValidation extends ValidationMatrix {
  warnings: string[];
  recommendations: string[];
}

export class QuantumMonitor {
  private stateHistory: Map<string, QuantumState<AgriculturalState>[]> = new Map();
  private metrics: Map<string, MonitoringMetrics[]> = new Map();

  recordState(id: string, state: QuantumState<AgriculturalState>): void {
    if (!this.stateHistory.has(id)) {
      this.stateHistory.set(id, []);
    }
    this.stateHistory.get(id)!.push(state);

    const metrics = this.calculateMetrics(state);
    if (!this.metrics.has(id)) {
      this.metrics.set(id, []);
    }
    this.metrics.get(id)!.push(metrics);
  }

  getStateHistory(id: string): QuantumState<AgriculturalState>[] {
    return this.stateHistory.get(id) || [];
  }

  getMetricsHistory(id: string): MonitoringMetrics[] {
    return this.metrics.get(id) || [];
  }

  validateState(state: QuantumState<AgriculturalState>): StateValidation {
    const coherence = calculateCoherence(state);
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Validate coherence
    if (coherence < 0.7) {
      warnings.push('Low quantum coherence detected');
      recommendations.push('Consider quantum state optimization');
    }

    // Validate agricultural state
    if (state.value.growthPattern.health < 0.6) {
      warnings.push('Crop health below optimal levels');
      recommendations.push('Review and adjust growth conditions');
    }

    // Validate consciousness level
    if (state.consciousness.level < 0.8) {
      warnings.push('Low consciousness integration');
      recommendations.push('Enhance quantum consciousness integration');
    }

    return {
      isValid: coherence >= 0.7 && warnings.length === 0,
      coherenceLevel: coherence,
      violations: warnings,
      warnings,
      recommendations
    };
  }

  private calculateMetrics(state: QuantumState<AgriculturalState>): MonitoringMetrics {
    const coherence = calculateCoherence(state);
    const stability = this.calculateStability(state);
    const health = state.value.growthPattern.health;

    return {
      coherence,
      stability,
      health,
      executionTime: Date.now() - state.temporalContext.timestamp,
      resourceUsage: this.calculateResourceUsage(state),
      qualityScore: (coherence + stability + health) / 3
    };
  }

  private calculateStability(state: QuantumState<AgriculturalState>): number {
    return (
      state.resonance.frequency *
      state.resonance.amplitude *
      state.temporalContext.coherenceLevel
    );
  }

  private calculateResourceUsage(state: QuantumState<AgriculturalState>): number {
    return (
      state.fractalDimensions.complexity *
      state.consciousness.integration *
      state.holographicPrints.length
    );
  }

  generateReport(id: string): string {
    const history = this.getStateHistory(id);
    const metrics = this.getMetricsHistory(id);

    if (history.length === 0 || metrics.length === 0) {
      return `No monitoring data available for ID: ${id}`;
    }

    const currentState = history[history.length - 1];
    const currentMetrics = metrics[metrics.length - 1];
    const validation = this.validateState(currentState);

    return `
Quantum Agricultural System Monitoring Report
==========================================

State ID: ${id}
Timestamp: ${new Date(currentState.temporalContext.timestamp).toISOString()}

Current Metrics:
---------------
Coherence: ${currentMetrics.coherence.toFixed(2)}
Stability: ${currentMetrics.stability.toFixed(2)}
Health: ${currentMetrics.health.toFixed(2)}
Quality Score: ${currentMetrics.qualityScore.toFixed(2)}

Agricultural Status:
-----------------
Growth Stage: ${currentState.value.growthPattern.stage}
Crop Health: ${currentState.value.growthPattern.health.toFixed(2)}
Expected Yield: ${currentState.value.harvestPotential.estimated.toFixed(2)}
Yield Confidence: ${currentState.value.harvestPotential.confidence.toFixed(2)}

Validation Results:
----------------
Status: ${validation.isValid ? 'VALID' : 'NEEDS ATTENTION'}
Warnings: ${validation.warnings.length === 0 ? 'None' : '\\n- ' + validation.warnings.join('\\n- ')}

Recommendations:
--------------
${validation.recommendations.length === 0 ? 'No recommendations needed' : '- ' + validation.recommendations.join('\\n- ')}
`;
  }
}