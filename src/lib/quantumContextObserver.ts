import { QuantumContext } from '../hooks/useQuantumContextSensing';

export type ContextObservation = {
  timestamp: number;
  context: QuantumContext;
  significance: number;
};

export type ObserverConfig = {
  maxObservations: number;
  significanceThreshold: number;
  timeWindow: number; // milliseconds
};

export class QuantumContextObserver {
  private observations: ContextObservation[];
  private config: ObserverConfig;
  private subscribers: Set<(observation: ContextObservation) => void>;

  constructor(config: Partial<ObserverConfig> = {}) {
    this.config = {
      maxObservations: 1000,
      significanceThreshold: 0.3,
      timeWindow: 60000, // 1 minute
      ...config,
    };
    this.observations = [];
    this.subscribers = new Set();
  }

  public observe(context: QuantumContext): ContextObservation {
    const timestamp = Date.now();
    const significance = this.calculateSignificance(context);
    
    const observation: ContextObservation = {
      timestamp,
      context,
      significance,
    };

    if (significance >= this.config.significanceThreshold) {
      this.addObservation(observation);
      this.notifySubscribers(observation);
    }

    return observation;
  }

  private calculateSignificance(context: QuantumContext): number {
    const weights = {
      entropy: 0.3,
      coherence: 0.2,
      dimensionalShift: 0.3,
      temporalStability: 0.2,
    };

    return (
      weights.entropy * context.entropy +
      weights.coherence * (1 - context.coherence) +
      weights.dimensionalShift * context.dimensionalShift +
      weights.temporalStability * (1 - context.temporalStability)
    );
  }

  private addObservation(observation: ContextObservation) {
    this.observations.push(observation);
    this.pruneObservations();
  }

  private pruneObservations() {
    const now = Date.now();
    this.observations = this.observations
      .filter(obs => (now - obs.timestamp) <= this.config.timeWindow)
      .slice(-this.config.maxObservations);
  }

  public getObservations(timeWindow?: number): ContextObservation[] {
    const now = Date.now();
    const window = timeWindow || this.config.timeWindow;
    return this.observations
      .filter(obs => (now - obs.timestamp) <= window)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  public getSignificantShifts(threshold = this.config.significanceThreshold): ContextObservation[] {
    return this.observations
      .filter(obs => obs.significance >= threshold)
      .sort((a, b) => b.significance - a.significance);
  }

  public subscribe(callback: (observation: ContextObservation) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(observation: ContextObservation) {
    this.subscribers.forEach(callback => callback(observation));
  }

  public getStatistics() {
    if (this.observations.length === 0) {
      return null;
    }

    const significances = this.observations.map(obs => obs.significance);
    return {
      averageSignificance: significances.reduce((a, b) => a + b) / significances.length,
      maxSignificance: Math.max(...significances),
      minSignificance: Math.min(...significances),
      observationCount: this.observations.length,
      timeSpan: this.observations[this.observations.length - 1].timestamp - this.observations[0].timestamp,
    };
  }

  public reset() {
    this.observations = [];
    this.subscribers.clear();
  }
}