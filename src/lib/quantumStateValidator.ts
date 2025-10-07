import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QuantumState } from './quantumStateManager';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  validate: (state: QuantumState) => ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  score: number; // 0-1
  details: string;
  suggestions?: string[];
}

export interface ValidationMetrics {
  overallIntegrity: number;  // 0-1
  coherenceScore: number;    // 0-1
  dimensionalBalance: number;// 0-1
  timelineStability: number; // 0-1
  entanglementQuality: number; // 0-1
}

export interface ValidationConfig {
  autoRepair: boolean;
  validationFrequency: number; // Hz
  integrityThreshold: number;  // 0-1
  repairAttempts: number;
  dimensionalTolerance: number;// 0-1
}

export class QuantumStateValidator {
  private config: ValidationConfig;
  private rules: Map<string, ValidationRule>;
  private metrics: ValidationMetrics;
  private validationInterval: NodeJS.Timeout | null;
  private observers: Set<(metrics: ValidationMetrics) => void>;
  private repairHistory: Map<string, number>;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = {
      autoRepair: true,
      validationFrequency: 1, // 1Hz default validation rate
      integrityThreshold: 0.85,
      repairAttempts: 3,
      dimensionalTolerance: 0.1,
      ...config
    };

    this.rules = new Map();
    this.repairHistory = new Map();
    this.observers = new Set();

    this.metrics = {
      overallIntegrity: 1,
      coherenceScore: 1,
      dimensionalBalance: 1,
      timelineStability: 1,
      entanglementQuality: 1
    };

    this.validationInterval = null;
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Coherence Validation
    this.addRule({
      id: 'coherence-check',
      name: 'Quantum Coherence Validation',
      description: 'Validates the coherence level of the quantum state',
      severity: 'critical',
      validate: (state: QuantumState) => ({
        valid: state.coherenceLevel >= this.config.integrityThreshold,
        score: state.coherenceLevel,
        details: `Coherence level: ${state.coherenceLevel}`,
        suggestions: state.coherenceLevel < this.config.integrityThreshold 
          ? ['Increase state isolation', 'Reduce dimensional interference']
          : undefined
      })
    });

    // Dimensional Balance
    this.addRule({
      id: 'dimensional-balance',
      name: 'Dimensional Balance Check',
      description: 'Ensures proper balance across dimensional states',
      severity: 'critical',
      validate: (state: QuantumState) => {
        const balance = this.calculateDimensionalBalance(state);
        return {
          valid: balance >= this.config.dimensionalTolerance,
          score: balance,
          details: `Dimensional balance: ${balance}`,
          suggestions: balance < this.config.dimensionalTolerance
            ? ['Realign dimensional matrices', 'Adjust quantum fields']
            : undefined
        };
      }
    });

    // Timeline Stability
    this.addRule({
      id: 'timeline-stability',
      name: 'Timeline Stability Check',
      description: 'Validates the stability of timeline variants',
      severity: 'warning',
      validate: (state: QuantumState) => {
        const stability = this.calculateTimelineStability(state);
        return {
          valid: stability >= this.config.integrityThreshold,
          score: stability,
          details: `Timeline stability: ${stability}`,
          suggestions: stability < this.config.integrityThreshold
            ? ['Consolidate timeline variants', 'Strengthen primary timeline']
            : undefined
        };
      }
    });

    // Probability Field Integrity
    this.addRule({
      id: 'probability-integrity',
      name: 'Probability Field Check',
      description: 'Validates the integrity of probability distributions',
      severity: 'warning',
      validate: (state: QuantumState) => {
        const integrity = this.calculateProbabilityIntegrity(state);
        return {
          valid: integrity >= this.config.integrityThreshold,
          score: integrity,
          details: `Probability integrity: ${integrity}`,
          suggestions: integrity < this.config.integrityThreshold
            ? ['Normalize probability distribution', 'Reduce quantum uncertainty']
            : undefined
        };
      }
    });
  }

  private calculateDimensionalBalance(state: QuantumState): number {
    const dimensions = Object.values(state.dimensionalState)
      .filter(value => typeof value === 'boolean');
    
    if (dimensions.length === 0) return 1;

    const activeCount = dimensions.filter(Boolean).length;
    return activeCount / dimensions.length;
  }

  private calculateTimelineStability(state: QuantumState): number {
    if (state.timelineVariants.size === 0) return 1;

    let stabilitySum = 0;
    state.timelineVariants.forEach((variant, key) => {
      const probability = state.probabilityField[parseInt(key)] || 0;
      stabilitySum += probability;
    });

    return stabilitySum / state.timelineVariants.size;
  }

  private calculateProbabilityIntegrity(state: QuantumState): number {
    const probSum = state.probabilityField.reduce((sum, p) => sum + p, 0);
    return Math.abs(1 - probSum); // Should be close to 0
  }

  public startValidation(): void {
    if (this.validationInterval) return;

    const interval = Math.floor(1000 / this.config.validationFrequency);
    this.validationInterval = setInterval(() => this.validate(), interval);
  }

  public stopValidation(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
  }

  public addRule(rule: ValidationRule): void {
    this.rules.set(rule.id, rule);
  }

  public removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  public validate(state?: QuantumState): ValidationMetrics {
    if (!state) return this.metrics;

    let totalIntegrity = 0;
    let coherenceSum = 0;
    let dimensionalSum = 0;
    let timelineSum = 0;
    let entanglementSum = 0;
    let ruleCount = 0;

    this.rules.forEach(rule => {
      const result = rule.validate(state);
      ruleCount++;

      switch (rule.id) {
        case 'coherence-check':
          coherenceSum += result.score;
          break;
        case 'dimensional-balance':
          dimensionalSum += result.score;
          break;
        case 'timeline-stability':
          timelineSum += result.score;
          break;
        case 'probability-integrity':
          entanglementSum += result.score;
          break;
      }

      totalIntegrity += result.score;

      if (!result.valid && this.config.autoRepair) {
        this.attemptRepair(state, rule, result);
      }
    });

    this.metrics = {
      overallIntegrity: totalIntegrity / ruleCount,
      coherenceScore: coherenceSum,
      dimensionalBalance: dimensionalSum,
      timelineStability: timelineSum,
      entanglementQuality: entanglementSum
    };

    this.notifyObservers();
    return this.metrics;
  }

  private attemptRepair(
    state: QuantumState,
    rule: ValidationRule,
    result: ValidationResult
  ): void {
    const attempts = this.repairHistory.get(rule.id) || 0;
    if (attempts >= this.config.repairAttempts) return;

    switch (rule.id) {
      case 'coherence-check':
        this.repairCoherence(state);
        break;
      case 'dimensional-balance':
        this.repairDimensionalBalance(state);
        break;
      case 'timeline-stability':
        this.repairTimelineStability(state);
        break;
      case 'probability-integrity':
        this.repairProbabilityField(state);
        break;
    }

    this.repairHistory.set(rule.id, attempts + 1);
  }

  private repairCoherence(state: QuantumState): void {
    state.coherenceLevel = Math.min(1, state.coherenceLevel * 1.1);
  }

  private repairDimensionalBalance(state: QuantumState): void {
    Object.entries(state.dimensionalState).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        (state.dimensionalState as any)[key] = true;
      }
    });
  }

  private repairTimelineStability(state: QuantumState): void {
    const sortedTimelines = Array.from(state.timelineVariants.entries())
      .sort(([, a], [, b]) => 
        (state.probabilityField[parseInt(b.toString())] || 0) -
        (state.probabilityField[parseInt(a.toString())] || 0)
      );

    // Keep only the most stable timelines
    const stableTimelines = new Map(sortedTimelines.slice(0, 3));
    state.timelineVariants = stableTimelines;
    state.probabilityField = state.probabilityField.map((p, i) =>
      stableTimelines.has(i.toString()) ? p : 0
    );
  }

  private repairProbabilityField(state: QuantumState): void {
    const sum = state.probabilityField.reduce((acc, p) => acc + p, 0);
    state.probabilityField = state.probabilityField.map(p => p / sum);
  }

  public getMetrics(): ValidationMetrics {
    return { ...this.metrics };
  }

  public addObserver(callback: (metrics: ValidationMetrics) => void): void {
    this.observers.add(callback);
  }

  public removeObserver(callback: (metrics: ValidationMetrics) => void): void {
    this.observers.delete(callback);
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.metrics));
  }

  public updateConfig(newConfig: Partial<ValidationConfig>): void {
    const oldFrequency = this.config.validationFrequency;
    this.config = { ...this.config, ...newConfig };

    if (this.config.validationFrequency !== oldFrequency && this.validationInterval) {
      this.stopValidation();
      this.startValidation();
    }
  }

  public clearRepairHistory(): void {
    this.repairHistory.clear();
  }
}

export function useQuantumStateValidation(config?: Partial<ValidationConfig>) {
  const validator = useMemo(() => new QuantumStateValidator(config), []);
  const [metrics, setMetrics] = useState<ValidationMetrics>(validator.getMetrics());

  useEffect(() => {
    validator.addObserver(setMetrics);
    validator.startValidation();

    return () => {
      validator.removeObserver(setMetrics);
      validator.stopValidation();
    };
  }, [validator]);

  const addRule = useCallback((rule: ValidationRule) => {
    validator.addRule(rule);
  }, [validator]);

  const removeRule = useCallback((ruleId: string) => {
    validator.removeRule(ruleId);
  }, [validator]);

  const validateState = useCallback((state: QuantumState) => {
    return validator.validate(state);
  }, [validator]);

  return {
    metrics,
    addRule,
    removeRule,
    validateState,
    validator
  };
}