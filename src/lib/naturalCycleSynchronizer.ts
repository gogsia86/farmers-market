import { QuantumSignificance } from '../hooks/useQuantumState';
import { FieldResonanceTracker } from './fieldResonanceTracker';
import { EnergyFlowOptimizer } from './energyFlowOptimizer';

export interface NaturalCycle {
  id: string;
  name: string;
  phase: number; // 0-1
  period: number; // days
  alignmentScore: number; // 0-1
  resonanceImpact: number; // -1 to 1
  energyFlowImpact: number; // -1 to 1
}

export interface CycleSynchronization {
  cycleId: string;
  recommendedPhase: number;
  expectedYieldBoost: number; // 0-1
  stabilityImpact: number; // -1 to 1
  notes: string;
}

export interface CycleMetrics {
  overallAlignment: number;
  resonanceSynergy: number;
  energyFlowSynergy: number;
  systemStability: number;
  quantumHarmony: number;
}

export class NaturalCycleSynchronizer {
  private cycles: Map<string, NaturalCycle> = new Map();

  constructor(
    private readonly fieldResonance: FieldResonanceTracker,
    private readonly energyFlow: EnergyFlowOptimizer,
    private readonly quantumState: QuantumSignificance
  ) {
    this.initializeCycles();
  }

  private initializeCycles() {
    // Example cycles: lunar, solar, seasonal, biodynamic
    const baseCycles: Array<Partial<NaturalCycle>> = [
      { name: 'Lunar', period: 29.5 },
      { name: 'Solar', period: 365 },
      { name: 'Seasonal', period: 90 },
      { name: 'Biodynamic', period: 28 }
    ];
    baseCycles.forEach((cycle, i) => {
      this.cycles.set(`cycle-${i}`, {
        id: `cycle-${i}`,
        name: cycle.name!,
        phase: Math.random(),
        period: cycle.period!,
        alignmentScore: 0,
        resonanceImpact: 0,
        energyFlowImpact: 0
      });
    });
  }

  public synchronizeCycles(): Map<string, CycleSynchronization> {
    const synchronizations = new Map<string, CycleSynchronization>();
    this.cycles.forEach((cycle, cycleId) => {
      const recommendedPhase = this.calculateRecommendedPhase(cycle);
      const expectedYieldBoost = this.calculateYieldBoost(cycle, recommendedPhase);
      const stabilityImpact = this.calculateStabilityImpact(cycle, recommendedPhase);
      const notes = this.generateNotes(cycle, recommendedPhase);
      synchronizations.set(cycleId, {
        cycleId,
        recommendedPhase,
        expectedYieldBoost,
        stabilityImpact,
        notes
      });
    });
    return synchronizations;
  }

  private calculateRecommendedPhase(cycle: NaturalCycle): number {
    // Align phase with quantum resonance and field resonance
    const quantumInfluence = this.quantumState.value;
    const fieldResonance = this.fieldResonance.analyzeResonance().overallResonance;
    const energySynergy = this.energyFlow.analyzeSystem().flowHarmony;
    return (quantumInfluence + fieldResonance + energySynergy) / 3;
  }

  private calculateYieldBoost(cycle: NaturalCycle, phase: number): number {
    // Boost is higher when phase aligns with resonance and energy flow
    return Math.max(0, phase * this.quantumState.confidence);
  }

  private calculateStabilityImpact(cycle: NaturalCycle, phase: number): number {
    // Stability is affected by phase deviation from optimal
    const optimalPhase = 0.5;
    return 1 - Math.abs(phase - optimalPhase) * 2;
  }

  private generateNotes(cycle: NaturalCycle, phase: number): string {
    if (phase > 0.8) return `${cycle.name} cycle is in peak alignment.`;
    if (phase < 0.2) return `${cycle.name} cycle is in low alignment.`;
    return `${cycle.name} cycle is moderately aligned.`;
  }

  public analyzeCycles(): CycleMetrics {
    const synchronizations = this.synchronizeCycles();
    const alignmentScores = Array.from(synchronizations.values()).map(s => s.recommendedPhase);
    const yieldBoosts = Array.from(synchronizations.values()).map(s => s.expectedYieldBoost);
    const stabilityImpacts = Array.from(synchronizations.values()).map(s => s.stabilityImpact);

    return {
      overallAlignment: this.average(alignmentScores),
      resonanceSynergy: this.fieldResonance.analyzeResonance().harmonicStability,
      energyFlowSynergy: this.energyFlow.analyzeSystem().flowHarmony,
      systemStability: this.average(stabilityImpacts),
      quantumHarmony: this.quantumState.value
    };
  }

  private average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, v) => sum + v, 0) / arr.length;
  }

  public getCycles(): Map<string, NaturalCycle> {
    return new Map(this.cycles);
  }
}