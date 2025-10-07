import { QuantumState } from './quantumStateManager';

export interface CacheConfig {
  maxSize: number;
  timeToLive: number; // milliseconds
  coherenceThreshold: number;
  dimensionalCompression: boolean;
}

export interface CachedQuantumState {
  state: QuantumState;
  timestamp: number;
  coherenceLevel: number;
  dimensionalHash: string;
}

export class QuantumCacheManager {
  private cache: Map<string, CachedQuantumState>;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      timeToLive: 5 * 60 * 1000, // 5 minutes
      coherenceThreshold: 0.85,
      dimensionalCompression: true,
      ...config
    };
    this.cache = new Map();
  }

  private generateDimensionalHash(state: QuantumState): string {
    return JSON.stringify({
      dimensions: state.dimensionalState,
      coherence: state.coherenceLevel,
      probability: state.probabilityField[0]
    });
  }

  private isStateValid(cachedState: CachedQuantumState): boolean {
    const now = Date.now();
    const age = now - cachedState.timestamp;
    
    return (
      age < this.config.timeToLive &&
      cachedState.coherenceLevel >= this.config.coherenceThreshold
    );
  }

  private compressDimensionalState(state: QuantumState): QuantumState {
    if (!this.config.dimensionalCompression) return state;

    // Only keep timelines with significant probability
    const significantTimelines = new Map();
    state.timelineVariants.forEach((variant, key) => {
      const probability = state.probabilityField[parseInt(key)] || 0;
      if (probability > 0.1) {
        significantTimelines.set(key, variant);
      }
    });

    return {
      ...state,
      timelineVariants: significantTimelines,
      probabilityField: state.probabilityField.filter((p, i) => 
        significantTimelines.has(i.toString())
      )
    };
  }

  public cacheState(state: QuantumState): void {
    const hash = this.generateDimensionalHash(state);
    
    // Enforce cache size limit with LRU eviction
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const compressedState = this.compressDimensionalState(state);
    
    this.cache.set(hash, {
      state: compressedState,
      timestamp: Date.now(),
      coherenceLevel: state.coherenceLevel,
      dimensionalHash: hash
    });
  }

  public retrieveState(state: QuantumState): QuantumState | null {
    const hash = this.generateDimensionalHash(state);
    const cachedState = this.cache.get(hash);

    if (!cachedState || !this.isStateValid(cachedState)) {
      return null;
    }

    return cachedState.state;
  }

  public clearExpiredStates(): void {
    for (const [hash, cachedState] of this.cache.entries()) {
      if (!this.isStateValid(cachedState)) {
        this.cache.delete(hash);
      }
    }
  }

  public getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      coherenceThreshold: this.config.coherenceThreshold,
      compressionEnabled: this.config.dimensionalCompression
    };
  }
}