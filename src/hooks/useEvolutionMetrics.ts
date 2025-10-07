import { useState, useEffect, useCallback } from 'react';
import { EvolutionMetricsService } from '../lib/evolution-metrics.service';
import {
  EvolutionMetric,
  MetricType,
  MetricDimension,
  MetricContext,
  TimeFrame
} from '../types/evolution-metrics';

interface UseEvolutionMetricsOptions {
  type: MetricType;
  dimension?: MetricDimension;
  timeframe?: TimeFrame;
  farmId?: string;
  autoUpdate?: boolean;
  updateInterval?: number;
}

interface UseEvolutionMetricsResult {
  metrics: EvolutionMetric[];
  latestMetric: EvolutionMetric | null;
  isLoading: boolean;
  error: Error | null;
  recordMetric: (value: number, context: MetricContext) => Promise<void>;
  refreshMetrics: () => Promise<void>;
}

export function useEvolutionMetrics({
  type,
  dimension = 'quantum',
  timeframe = 'daily',
  farmId,
  autoUpdate = true,
  updateInterval = 60000, // 1 minute
}: UseEvolutionMetricsOptions): UseEvolutionMetricsResult {
  const [metrics, setMetrics] = useState<EvolutionMetric[]>([]);
  const [latestMetric, setLatestMetric] = useState<EvolutionMetric | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const metricsService = EvolutionMetricsService.getInstance();

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedMetrics = await metricsService.getMetricsByType(
        type,
        timeframe,
        farmId
      );
      setMetrics(fetchedMetrics);
      setLatestMetric(fetchedMetrics[fetchedMetrics.length - 1] || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setIsLoading(false);
    }
  }, [type, timeframe, farmId, metricsService]);

  const recordMetric = useCallback(
    async (value: number, context: MetricContext) => {
      try {
        setIsLoading(true);
        const newMetric = await metricsService.recordMetric(
          type,
          value,
          dimension,
          context,
          farmId
        );
        setMetrics((prev) => [...prev, newMetric]);
        setLatestMetric(newMetric);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to record metric'));
      } finally {
        setIsLoading(false);
      }
    },
    [type, dimension, farmId, metricsService]
  );

  useEffect(() => {
    fetchMetrics();

    if (autoUpdate) {
      const interval = setInterval(fetchMetrics, updateInterval);
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, autoUpdate, updateInterval]);

  return {
    metrics,
    latestMetric,
    isLoading,
    error,
    recordMetric,
    refreshMetrics: fetchMetrics,
  };
}