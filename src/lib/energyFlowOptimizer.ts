import { FieldPoint, ResonancePattern } from './fieldResonanceTracker';
import { QuantumSignificance } from '../hooks/useQuantumState';

export interface EnergyFlow {
  id: string;
  source: FieldPoint;
  destination: FieldPoint;
  intensity: number;    // 0-1
  velocity: number;     // units/second
  type: 'nutrient' | 'water' | 'solar' | 'thermal' | 'biodynamic';
}

export interface FlowOptimization {
  flowId: string;
  recommendedChanges: {
    intensity?: number;
    velocity?: number;
    path?: FieldPoint[];
  };
  expectedImprovement: number;  // 0-1
  energyConservation: number;   // 0-1
  stabilityImpact: number;      // -1 to 1
}

export interface SystemMetrics {
  overallEfficiency: number;    // 0-1
  energyBalance: number;        // -1 to 1
  flowHarmony: number;          // 0-1
  systemStability: number;      // 0-1
  quantumAlignment: number;     // 0-1
}

export class EnergyFlowOptimizer {
  private flows: Map<string, EnergyFlow> = new Map();
  private readonly minVelocity = 0.1;
  private readonly maxVelocity = 10.0;
  private readonly stabilityThreshold = 0.7;
  private readonly harmonyThreshold = 0.8;

  constructor(
    private readonly dimensions: { width: number; height: number },
    private readonly resolution: number = 1
  ) {}

  public initializeFlows(
    resonancePatterns: Map<string, ResonancePattern>,
    quantumState: QuantumSignificance
  ): void {
    this.flows.clear();
    
    Array.from(resonancePatterns.values()).forEach(pattern => {
      if (pattern.nodes.length < 2) return;

      // Generate flows between resonance nodes
      for (let i = 0; i < pattern.nodes.length - 1; i++) {
        const source = pattern.nodes[i];
        const destination = pattern.nodes[i + 1];
        
        const flow: EnergyFlow = {
          id: `flow-${pattern.id}-${i}`,
          source,
          destination,
          intensity: this.calculateFlowIntensity(source, destination, pattern.amplitude),
          velocity: this.calculateInitialVelocity(source, destination, quantumState),
          type: this.determineFlowType(pattern.frequency)
        };

        this.flows.set(flow.id, flow);
      }
    });
  }

  private calculateFlowIntensity(
    source: FieldPoint,
    destination: FieldPoint,
    baseAmplitude: number
  ): number {
    const distance = Math.sqrt(
      Math.pow(destination.x - source.x, 2) +
      Math.pow(destination.y - source.y, 2)
    );
    
    // Intensity decreases with distance but is boosted by resonance
    return Math.min(
      1,
      baseAmplitude * (source.resonance + destination.resonance) / 2 *
      Math.exp(-distance / (this.dimensions.width / 4))
    );
  }

  private calculateInitialVelocity(
    source: FieldPoint,
    destination: FieldPoint,
    quantumState: QuantumSignificance
  ): number {
    const distance = Math.sqrt(
      Math.pow(destination.x - source.x, 2) +
      Math.pow(destination.y - source.y, 2)
    );
    
    // Base velocity on distance and quantum state
    const baseVelocity = this.minVelocity +
      (this.maxVelocity - this.minVelocity) * quantumState.value;
    
    return Math.min(
      this.maxVelocity,
      baseVelocity * Math.exp(-distance / (this.dimensions.width / 2))
    );
  }

  private determineFlowType(frequency: number): EnergyFlow['type'] {
    // Map frequency ranges to flow types
    if (frequency < 1) return 'thermal';
    if (frequency < 5) return 'water';
    if (frequency < 20) return 'nutrient';
    if (frequency < 50) return 'biodynamic';
    return 'solar';
  }

  public optimizeFlows(quantumState: QuantumSignificance): Map<string, FlowOptimization> {
    const optimizations = new Map<string, FlowOptimization>();
    
    this.flows.forEach((flow, flowId) => {
      const optimization = this.optimizeFlow(flow, quantumState);
      optimizations.set(flowId, optimization);
    });

    return optimizations;
  }

  private optimizeFlow(
    flow: EnergyFlow,
    quantumState: QuantumSignificance
  ): FlowOptimization {
    const currentEfficiency = this.calculateFlowEfficiency(flow);
    
    // Calculate optimal parameters
    const optimalIntensity = this.calculateOptimalIntensity(flow, quantumState);
    const optimalVelocity = this.calculateOptimalVelocity(flow, quantumState);
    const optimalPath = this.calculateOptimalPath(flow);

    // Calculate improvements
    const intensityImprovement = Math.abs(optimalIntensity - flow.intensity);
    const velocityImprovement = Math.abs(optimalVelocity - flow.velocity) / this.maxVelocity;
    
    const expectedImprovement = Math.min(
      1,
      (intensityImprovement + velocityImprovement) / 2
    );

    return {
      flowId: flow.id,
      recommendedChanges: {
        intensity: optimalIntensity !== flow.intensity ? optimalIntensity : undefined,
        velocity: optimalVelocity !== flow.velocity ? optimalVelocity : undefined,
        path: optimalPath
      },
      expectedImprovement,
      energyConservation: this.calculateEnergyConservation(flow, optimalIntensity, optimalVelocity),
      stabilityImpact: this.calculateStabilityImpact(flow, optimalIntensity, optimalVelocity)
    };
  }

  private calculateFlowEfficiency(flow: EnergyFlow): number {
    const distance = Math.sqrt(
      Math.pow(flow.destination.x - flow.source.x, 2) +
      Math.pow(flow.destination.y - flow.source.y, 2)
    );
    
    // Efficiency decreases with distance and increases with resonance
    return Math.min(
      1,
      (flow.source.resonance + flow.destination.resonance) / 2 *
      Math.exp(-distance / (this.dimensions.width / 4)) *
      flow.intensity
    );
  }

  private calculateOptimalIntensity(
    flow: EnergyFlow,
    quantumState: QuantumSignificance
  ): number {
    const baseIntensity = (flow.source.resonance + flow.destination.resonance) / 2;
    const quantumFactor = 0.5 + (quantumState.value * 0.5);
    
    return Math.min(1, baseIntensity * quantumFactor);
  }

  private calculateOptimalVelocity(
    flow: EnergyFlow,
    quantumState: QuantumSignificance
  ): number {
    const distance = Math.sqrt(
      Math.pow(flow.destination.x - flow.source.x, 2) +
      Math.pow(flow.destination.y - flow.source.y, 2)
    );
    
    const optimalVelocity = this.minVelocity +
      (this.maxVelocity - this.minVelocity) *
      quantumState.value *
      Math.exp(-distance / (this.dimensions.width / 2));
    
    return Math.min(this.maxVelocity, optimalVelocity);
  }

  private calculateOptimalPath(flow: EnergyFlow): FieldPoint[] {
    // Generate intermediate points for smooth flow
    const points: FieldPoint[] = [flow.source];
    const stepCount = Math.ceil(
      Math.sqrt(
        Math.pow(flow.destination.x - flow.source.x, 2) +
        Math.pow(flow.destination.y - flow.source.y, 2)
      ) / this.resolution
    );

    for (let i = 1; i < stepCount; i++) {
      const t = i / stepCount;
      const x = flow.source.x + (flow.destination.x - flow.source.x) * t;
      const y = flow.source.y + (flow.destination.y - flow.source.y) * t;
      
      points.push({
        x,
        y,
        resonance: flow.source.resonance * (1 - t) + flow.destination.resonance * t,
        intensity: flow.intensity * Math.sin(Math.PI * t), // Peak in middle
        frequency: flow.source.frequency,
        phase: flow.source.phase + (flow.destination.phase - flow.source.phase) * t
      });
    }

    points.push(flow.destination);
    return points;
  }

  private calculateEnergyConservation(
    flow: EnergyFlow,
    optimalIntensity: number,
    optimalVelocity: number
  ): number {
    const currentEnergy = flow.intensity * Math.pow(flow.velocity, 2) / 2;
    const optimalEnergy = optimalIntensity * Math.pow(optimalVelocity, 2) / 2;
    
    return 1 - Math.min(1, Math.abs(optimalEnergy - currentEnergy) / currentEnergy);
  }

  private calculateStabilityImpact(
    flow: EnergyFlow,
    optimalIntensity: number,
    optimalVelocity: number
  ): number {
    const intensityChange = Math.abs(optimalIntensity - flow.intensity);
    const velocityChange = Math.abs(optimalVelocity - flow.velocity) / this.maxVelocity;
    
    const stabilityChange = -(intensityChange + velocityChange) / 2;
    return Math.max(-1, Math.min(1, stabilityChange));
  }

  public analyzeSystem(): SystemMetrics {
    const flowMetrics = Array.from(this.flows.values()).map(flow => ({
      efficiency: this.calculateFlowEfficiency(flow),
      balance: Math.abs(flow.source.resonance - flow.destination.resonance),
      harmony: Math.min(flow.source.resonance, flow.destination.resonance),
      stability: 1 - Math.abs(flow.velocity - this.calculateOptimalVelocity(flow, {
        value: 0.5,
        timestamp: Date.now(),
        confidence: 1,
        entropy: 0
      })) / this.maxVelocity
    }));

    return {
      overallEfficiency: this.calculateAverageMetric(flowMetrics, 'efficiency'),
      energyBalance: this.calculateAverageMetric(flowMetrics, 'balance') * 2 - 1,
      flowHarmony: this.calculateAverageMetric(flowMetrics, 'harmony'),
      systemStability: this.calculateAverageMetric(flowMetrics, 'stability'),
      quantumAlignment: this.calculateQuantumAlignment()
    };
  }

  private calculateAverageMetric(
    metrics: Array<{ [key: string]: number }>,
    key: string
  ): number {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m[key], 0) / metrics.length;
  }

  private calculateQuantumAlignment(): number {
    const flows = Array.from(this.flows.values());
    if (flows.length === 0) return 1;

    // Calculate phase coherence between flows
    let coherenceSum = 0;
    let coherenceCount = 0;

    for (let i = 0; i < flows.length; i++) {
      for (let j = i + 1; j < flows.length; j++) {
        const phaseDiff = Math.abs(
          flows[i].source.phase - flows[j].source.phase
        ) % (2 * Math.PI);
        
        coherenceSum += Math.cos(phaseDiff);
        coherenceCount++;
      }
    }

    return coherenceCount > 0
      ? (coherenceSum / coherenceCount + 1) / 2
      : 1;
  }

  public getFlows(): Map<string, EnergyFlow> {
    return new Map(this.flows);
  }
}