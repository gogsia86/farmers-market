import { createContext, useContext, useCallback } from 'react';
import { DimensionalState } from '../hooks/useMultiDimensionalRender';

export type QuantumState = {
  dimensionalState: DimensionalState;
  timelineVariants: Map<string, DimensionalState>;
  probabilityField: number[];
  coherenceLevel: number;
};

export type QuantumStateUpdate = {
  dimension?: keyof DimensionalState;
  value?: boolean | number;
  timeline?: string;
  coherenceAdjustment?: number;
};

export class QuantumStateManager {
  private state: QuantumState;
  private subscribers: Set<(state: QuantumState) => void>;

  constructor(initialState?: Partial<QuantumState>) {
    this.state = {
      dimensionalState: {
        physical: true,
        quantum: false,
        spiritual: false,
        temporalAlignment: 1.0,
        resonanceFrequency: 432,
      },
      timelineVariants: new Map(),
      probabilityField: [1.0], // Initial probability in primary timeline
      coherenceLevel: 1.0,
      ...initialState,
    };
    this.subscribers = new Set();
  }

  public subscribe(callback: (state: QuantumState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  public updateState(update: QuantumStateUpdate) {
    if (update.dimension && update.value !== undefined) {
      this.state.dimensionalState = {
        ...this.state.dimensionalState,
        [update.dimension]: update.value,
      };
    }

    if (update.timeline) {
      this.state.timelineVariants.set(update.timeline, { ...this.state.dimensionalState });
      this.recalculateProbabilityField();
    }

    if (update.coherenceAdjustment) {
      this.state.coherenceLevel = Math.max(0, Math.min(1, 
        this.state.coherenceLevel + update.coherenceAdjustment
      ));
    }

    this.notify();
  }

  private recalculateProbabilityField() {
    const totalTimelines = this.state.timelineVariants.size + 1; // Including primary
    const baseProbability = 1 / totalTimelines;
    
    // Adjust probabilities based on coherence level
    this.state.probabilityField = Array(totalTimelines).fill(0)
      .map((_, i) => baseProbability * (i === 0 ? this.state.coherenceLevel : (1 - this.state.coherenceLevel) / (totalTimelines - 1)));
  }

  public getCurrentState(): QuantumState {
    return this.state;
  }

  public getTimelineVariant(timeline: string): DimensionalState | undefined {
    return this.state.timelineVariants.get(timeline);
  }

  public getProbabilityDistribution(): number[] {
    return this.state.probabilityField;
  }

  public getCoherenceLevel(): number {
    return this.state.coherenceLevel;
  }
}

export const QuantumStateContext = createContext<QuantumStateManager | null>(null);

export const useQuantumState = () => {
  const context = useContext(QuantumStateContext);
  if (!context) {
    throw new Error('useQuantumState must be used within a QuantumStateProvider');
  }
  return context;
};