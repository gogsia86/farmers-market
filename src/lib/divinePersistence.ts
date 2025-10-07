import { DivineState } from './divineStateManager';

export interface DivinePersistenceAdapter<T = any> {
  save(state: DivineState<T>): Promise<void>;
  load(): Promise<DivineState<T> | null>;
  clear(): Promise<void>;
  sync(): Promise<void>;
}

export class LocalStoragePersistence<T = any> implements DivinePersistenceAdapter<T> {
  private key: string;

  constructor(key: string = 'divine-state') {
    this.key = key;
  }

  async save(state: DivineState<T>): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.key, JSON.stringify(state));
    }
  }

  async load(): Promise<DivineState<T> | null> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.key);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }

  async clear(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.key);
    }
  }

  async sync(): Promise<void> {
    // Local storage is always in sync
    return Promise.resolve();
  }
}

export class QuantumPersistence<T = any> implements DivinePersistenceAdapter<T> {
  private states: Map<string, DivineState<T>> = new Map();
  private dimensions: string[] = ['physical', 'quantum', 'spiritual'];
  private syncInterval: number | undefined;

  constructor() {
    if (typeof window !== 'undefined') {
      this.startQuantumSync();
    }
  }

  async save(state: DivineState<T>): Promise<void> {
    const dimensionKey = state.meta.dimension || 'physical';
    this.states.set(dimensionKey, state);
    await this.sync();
  }

  async load(): Promise<DivineState<T> | null> {
    const coherentState = await this.collapseQuantumStates();
    return coherentState;
  }

  async clear(): Promise<void> {
    this.states.clear();
    this.stopQuantumSync();
  }

  private startQuantumSync() {
    this.syncInterval = window.setInterval(() => {
      this.sync().catch(console.error);
    }, 1000) as unknown as number;
  }

  private stopQuantumSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  async sync(): Promise<void> {
    const states = Array.from(this.states.values());
    if (states.length > 1) {
      const coherentState = await this.collapseQuantumStates();
      if (coherentState) {
        this.states.clear();
        this.states.set(coherentState.meta.dimension, coherentState);
      }
    }
  }

  private async collapseQuantumStates(): Promise<DivineState<T> | null> {
    if (this.states.size === 0) return null;
    if (this.states.size === 1) {
      const value = this.states.values().next().value;
      return value || null;
    }

    const states = Array.from(this.states.values());
    const weightedStates = states.map(state => ({
      state,
      weight: this.calculateStateWeight(state),
    }));

    // Sort by weight and get the most coherent state
    weightedStates.sort((a, b) => b.weight - a.weight);
    const dominantState = weightedStates[0].state;

    // Merge quantum information from other states
    const mergedState = {
      ...dominantState,
      meta: {
        ...dominantState.meta,
        coherence: this.calculateMergedCoherence(weightedStates),
      },
    };

    return mergedState;
  }

  private calculateStateWeight(state: DivineState<T>): number {
    return (
      state.meta.coherence *
      (state.meta.transcendenceLevel / 10) *
      (1 + Math.abs(state.meta.karmaticBalance))
    );
  }

  private calculateMergedCoherence(
    weightedStates: Array<{ state: DivineState<T>; weight: number }>
  ): number {
    const totalWeight = weightedStates.reduce((sum, { weight }) => sum + weight, 0);
    return weightedStates.reduce(
      (coherence, { state, weight }) =>
        coherence + (state.meta.coherence * weight) / totalWeight,
      0
    );
  }
}

export class OmnipresentPersistence<T = any> implements DivinePersistenceAdapter<T> {
  private broadcastChannel: BroadcastChannel | null = null;
  private states: Map<string, DivineState<T>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('divine-state-sync');
      this.setupBroadcastListener();
    }
  }

  private setupBroadcastListener() {
    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = (event) => {
        const { action, state } = event.data;
        if (action === 'sync') {
          this.states.set(state.meta.dimension, state);
        }
      };
    }
  }

  async save(state: DivineState<T>): Promise<void> {
    this.states.set(state.meta.dimension, state);
    await this.sync();
  }

  async load(): Promise<DivineState<T> | null> {
    if (this.states.size === 0) return null;
    return this.mergeDimensionalStates();
  }

  async clear(): Promise<void> {
    this.states.clear();
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
  }

  async sync(): Promise<void> {
    if (this.broadcastChannel) {
      const state = await this.load();
      if (state) {
        this.broadcastChannel.postMessage({
          action: 'sync',
          state,
        });
      }
    }
  }

  private mergeDimensionalStates(): DivineState<T> {
    const states = Array.from(this.states.values());
    if (states.length === 1) return states[0];

    return states.reduce(
      (merged, current) => ({
        ...merged,
        value: this.deepMerge(merged.value, current.value),
        meta: {
          ...merged.meta,
          coherence: (merged.meta.coherence + current.meta.coherence) / 2,
          karmaticBalance: merged.meta.karmaticBalance + current.meta.karmaticBalance,
          transcendenceLevel: Math.max(
            merged.meta.transcendenceLevel,
            current.meta.transcendenceLevel
          ),
        },
      }),
      states[0]
    );
  }

  private deepMerge(target: any, source: any): any {
    if (typeof target !== 'object' || typeof source !== 'object') {
      return source;
    }

    const merged = { ...target };
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        merged[key] = this.deepMerge(target[key], source[key]);
      } else {
        merged[key] = source[key];
      }
    }

    return merged;
  }
}