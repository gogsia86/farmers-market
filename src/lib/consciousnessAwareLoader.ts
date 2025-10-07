import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface ConsciousnessLevel {
  awareness: number;      // 0-1: Level of user consciousness awareness
  receptivity: number;    // 0-1: Ability to process complex information
  coherence: number;      // 0-1: Mental state coherence
  attentionSpan: number; // in milliseconds
}

export interface LoadingStrategy {
  priority: 'high' | 'medium' | 'low';
  chunkSize: number;
  delayBetweenChunks: number;
  maxConcurrentLoads: number;
}

export interface LoadingMetrics {
  completedChunks: number;
  totalChunks: number;
  averageChunkTime: number;
  userEngagement: number;
}

export class ConsciousnessAwareLoader {
  private consciousnessLevel: ConsciousnessLevel;
  private loadingStrategies: Map<string, LoadingStrategy>;
  private activeLoads: Set<string>;
  private metrics: LoadingMetrics;
  private observers: Set<(metrics: LoadingMetrics) => void>;

  constructor(initialConsciousness: ConsciousnessLevel) {
    this.consciousnessLevel = initialConsciousness;
    this.loadingStrategies = new Map();
    this.activeLoads = new Set();
    this.metrics = {
      completedChunks: 0,
      totalChunks: 0,
      averageChunkTime: 0,
      userEngagement: 1
    };
    this.observers = new Set();

    this.initializeDefaultStrategies();
  }

  private initializeDefaultStrategies(): void {
    this.loadingStrategies.set('high', {
      priority: 'high',
      chunkSize: 10,
      delayBetweenChunks: 0,
      maxConcurrentLoads: 5
    });

    this.loadingStrategies.set('medium', {
      priority: 'medium',
      chunkSize: 5,
      delayBetweenChunks: 100,
      maxConcurrentLoads: 3
    });

    this.loadingStrategies.set('low', {
      priority: 'low',
      chunkSize: 2,
      delayBetweenChunks: 250,
      maxConcurrentLoads: 1
    });
  }

  private getOptimalStrategy(dataSize: number): LoadingStrategy {
    const { awareness, receptivity, coherence } = this.consciousnessLevel;
    const overallCapacity = (awareness + receptivity + coherence) / 3;

    if (overallCapacity > 0.8) {
      return this.loadingStrategies.get('high')!;
    } else if (overallCapacity > 0.4) {
      return this.loadingStrategies.get('medium')!;
    } else {
      return this.loadingStrategies.get('low')!;
    }
  }

  private async loadChunk<T>(
    data: T[],
    startIndex: number,
    chunkSize: number,
    processItem: (item: T) => Promise<void>
  ): Promise<void> {
    const endIndex = Math.min(startIndex + chunkSize, data.length);
    const chunk = data.slice(startIndex, endIndex);

    const startTime = performance.now();

    await Promise.all(chunk.map(async (item) => {
      try {
        await processItem(item);
        this.metrics.completedChunks++;
      } catch (error) {
        console.error('Error processing item:', error);
      }
    }));

    const chunkTime = performance.now() - startTime;
    this.updateMetrics(chunkTime);
  }

  private updateMetrics(chunkTime: number): void {
    this.metrics.averageChunkTime = (
      this.metrics.averageChunkTime * this.metrics.completedChunks + chunkTime
    ) / (this.metrics.completedChunks + 1);

    this.notifyObservers();
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.metrics));
  }

  public async loadData<T>(
    id: string,
    data: T[],
    processItem: (item: T) => Promise<void>
  ): Promise<void> {
    if (this.activeLoads.has(id)) {
      return;
    }

    this.activeLoads.add(id);
    const strategy = this.getOptimalStrategy(data.length);
    this.metrics.totalChunks += Math.ceil(data.length / strategy.chunkSize);

    try {
      for (let i = 0; i < data.length; i += strategy.chunkSize) {
        await this.loadChunk(data, i, strategy.chunkSize, processItem);
        
        if (strategy.delayBetweenChunks > 0) {
          await new Promise(resolve => setTimeout(resolve, strategy.delayBetweenChunks));
        }

        // Check if consciousness level has changed significantly
        if (this.shouldUpdateStrategy()) {
          const newStrategy = this.getOptimalStrategy(data.length - i);
          strategy.chunkSize = newStrategy.chunkSize;
          strategy.delayBetweenChunks = newStrategy.delayBetweenChunks;
        }
      }
    } finally {
      this.activeLoads.delete(id);
    }
  }

  private shouldUpdateStrategy(): boolean {
    // Check for significant changes in consciousness level
    return Math.random() > this.consciousnessLevel.coherence;
  }

  public updateConsciousnessLevel(newLevel: Partial<ConsciousnessLevel>): void {
    this.consciousnessLevel = {
      ...this.consciousnessLevel,
      ...newLevel
    };
  }

  public addMetricsObserver(observer: (metrics: LoadingMetrics) => void): void {
    this.observers.add(observer);
  }

  public removeMetricsObserver(observer: (metrics: LoadingMetrics) => void): void {
    this.observers.delete(observer);
  }

  public getMetrics(): LoadingMetrics {
    return { ...this.metrics };
  }
}

export function useConsciousnessAwareLoading(
  initialConsciousness: ConsciousnessLevel
) {
  const loader = useMemo(() => new ConsciousnessAwareLoader(initialConsciousness), []);
  const [metrics, setMetrics] = useState<LoadingMetrics>(loader.getMetrics());

  useEffect(() => {
    const observer = (newMetrics: LoadingMetrics) => setMetrics(newMetrics);
    loader.addMetricsObserver(observer);
    return () => loader.removeMetricsObserver(observer);
  }, [loader]);

  const updateConsciousness = useCallback((newLevel: Partial<ConsciousnessLevel>) => {
    loader.updateConsciousnessLevel(newLevel);
  }, [loader]);

  return {
    loader,
    metrics,
    updateConsciousness
  };
}