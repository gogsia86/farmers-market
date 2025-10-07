import React, { useMemo } from 'react';
import { useEvolutionMetrics } from '../../hooks/useEvolutionMetrics';
import { MetricType, TimeFrame, EvolutionMetric } from '../../types/evolution-metrics';
import styles from './EvolutionMetrics.module.css';

interface EvolutionMetricsProps {
  type: MetricType;
  timeframe?: TimeFrame;
  farmId?: string;
}

export function EvolutionMetrics({
  type,
  timeframe = 'daily',
  farmId,
}: EvolutionMetricsProps) {
  const {
    metrics,
    latestMetric,
    isLoading,
    error,
    refreshMetrics,
  } = useEvolutionMetrics({
    type,
    timeframe,
    farmId,
    autoUpdate: true,
  });

  const {
    trendColor,
    trendLabel,
    trendDescription
  } = useMemo(() => getTrendInfo(latestMetric), [latestMetric]);

  const evolutionScore = useMemo(() => 
    calculateEvolutionScore(metrics),
    [metrics]
  );

  if (error) {
    return (
      <div className={styles.error}>
        Error loading evolution metrics: {error.message}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {formatMetricType(type)} Evolution Metrics
        </h2>
        <button
          onClick={refreshMetrics}
          disabled={isLoading}
          className={styles.refreshButton}
        >
          {isLoading ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {latestMetric && (
        <div className={styles.metricsGrid}>
          <MetricCard
            title="Evolution Score"
            value={`${(evolutionScore * 100).toFixed(1)}%`}
            description="Overall system evolution progress"
            color="var(--metric-primary)"
          />
          <MetricCard
            title="Quantum Coherence"
            value={`${(latestMetric.quantumState.coherence * 100).toFixed(1)}%`}
            description="System quantum state stability"
            color="var(--metric-quantum)"
          />
          <MetricCard
            title="Current Trend"
            value={trendLabel}
            description={trendDescription}
            color={trendColor}
          />
          <MetricCard
            title="Dimensional Alignment"
            value={`${(latestMetric.quantumState.alignment * 100).toFixed(1)}%`}
            description="Multi-dimensional harmony"
            color="var(--metric-alignment)"
          />
        </div>
      )}

      <div className={styles.chart}>
        <EvolutionChart metrics={metrics} />
      </div>

      <div className={styles.insights}>
        <h3 className={styles.insightsTitle}>Evolution Insights</h3>
        <EvolutionInsights metrics={metrics} />
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  color: string;
}

function MetricCard({ title, value, description, color }: MetricCardProps) {
  return (
    <div className={styles.metricCard} style={{ '--metric-color': color } as any}>
      <h4 className={styles.metricTitle}>{title}</h4>
      <div className={styles.metricValue}>{value}</div>
      <p className={styles.metricDescription}>{description}</p>
    </div>
  );
}

function EvolutionChart({ metrics }: { metrics: EvolutionMetric[] }) {
  // Implementation would use a charting library like recharts
  return (
    <div className={styles.chartPlaceholder}>
      Chart visualization of evolution metrics over time would go here
    </div>
  );
}

function EvolutionInsights({ metrics }: { metrics: EvolutionMetric[] }) {
  const insights = useMemo(() => generateInsights(metrics), [metrics]);

  return (
    <ul className={styles.insightsList}>
      {insights.map((insight, index) => (
        <li key={index} className={styles.insightItem}>
          {insight}
        </li>
      ))}
    </ul>
  );
}

// Helper functions
function formatMetricType(type: MetricType): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

interface TrendInfo {
  trendColor: string;
  trendLabel: string;
  trendDescription: string;
}

function getTrendInfo(metric: EvolutionMetric | null): TrendInfo {
  if (!metric) {
    return {
      trendColor: 'var(--metric-neutral)',
      trendLabel: 'N/A',
      trendDescription: 'No trend data available'
    };
  }

  const trends: Record<string, TrendInfo> = {
    ascending: {
      trendColor: 'var(--metric-positive)',
      trendLabel: 'Rising',
      trendDescription: 'System is evolving positively'
    },
    descending: {
      trendColor: 'var(--metric-negative)',
      trendLabel: 'Declining',
      trendDescription: 'System requires attention'
    },
    stable: {
      trendColor: 'var(--metric-neutral)',
      trendLabel: 'Stable',
      trendDescription: 'System is maintaining equilibrium'
    },
    fluctuating: {
      trendColor: 'var(--metric-warning)',
      trendLabel: 'Fluctuating',
      trendDescription: 'System is in dynamic adjustment'
    },
    transcending: {
      trendColor: 'var(--metric-transcendent)',
      trendLabel: 'Transcending',
      trendDescription: 'System is achieving higher consciousness'
    }
  };

  return trends[metric.trend] || trends.stable;
}

function calculateEvolutionScore(metrics: EvolutionMetric[]): number {
  if (metrics.length === 0) return 0;

  return metrics.reduce((score, metric) => {
    const quantumContribution = (
      metric.quantumState.coherence +
      metric.quantumState.alignment +
      metric.quantumState.entanglement
    ) / 3;

    const metricScore = (metric.value * metric.confidence * quantumContribution) / 3;
    return score + metricScore;
  }, 0) / metrics.length;
}

function generateInsights(metrics: EvolutionMetric[]): string[] {
  if (metrics.length < 2) return ['Gathering evolution data...'];

  const insights: string[] = [];
  const latest = metrics[metrics.length - 1];
  const previous = metrics[metrics.length - 2];

  if (latest.quantumState.coherence > previous.quantumState.coherence) {
    insights.push('Quantum coherence is strengthening, indicating enhanced system consciousness');
  }

  if (latest.quantumState.alignment > 0.9) {
    insights.push('Achieving optimal dimensional alignment for transcendent operations');
  }

  if (latest.trend === 'transcending') {
    insights.push('System is entering a higher state of evolution');
  }

  return insights;
}