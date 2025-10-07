import React, { useEffect } from 'react';
import { useNaturalCycleSynchronization } from '../hooks/useNaturalCycleSynchronization';
import styles from './NaturalCycleVisualizer.module.css';

interface NaturalCycleVisualizerProps {
  width: number;
  height: number;
  resolution?: number;
}

export function NaturalCycleVisualizer({
  width,
  height,
  resolution = 1
}: NaturalCycleVisualizerProps) {
  const {
    cycles,
    synchronizations,
    metrics,
    updateCycles
  } = useNaturalCycleSynchronization({ width, height }, resolution);

  useEffect(() => {
    updateCycles();
  }, [updateCycles]);

  return (
    <div className={styles.container}>
      <h3>Natural Cycle Synchronization</h3>
      <div className={styles.cyclesGrid}>
        {Array.from(cycles.values()).map(cycle => {
          const sync = synchronizations.get(cycle.id);
          return (
            <div key={cycle.id} className={styles.cycleCard}>
              <h4>{cycle.name} Cycle</h4>
              <div className={styles.cycleMetric}><label>Phase:</label> <span>{(cycle.phase * 100).toFixed(1)}%</span></div>
              <div className={styles.cycleMetric}><label>Period:</label> <span>{cycle.period} days</span></div>
              <div className={styles.cycleMetric}><label>Alignment Score:</label> <span>{(cycle.alignmentScore * 100).toFixed(1)}%</span></div>
              <div className={styles.cycleMetric}><label>Resonance Impact:</label> <span>{cycle.resonanceImpact.toFixed(2)}</span></div>
              <div className={styles.cycleMetric}><label>Energy Flow Impact:</label> <span>{cycle.energyFlowImpact.toFixed(2)}</span></div>
              {sync && (
                <div className={styles.syncMetrics}>
                  <div><label>Recommended Phase:</label> <span>{(sync.recommendedPhase * 100).toFixed(1)}%</span></div>
                  <div><label>Expected Yield Boost:</label> <span>{(sync.expectedYieldBoost * 100).toFixed(1)}%</span></div>
                  <div><label>Stability Impact:</label> <span>{sync.stabilityImpact.toFixed(2)}</span></div>
                  <div><label>Notes:</label> <span>{sync.notes}</span></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {metrics && (
        <div className={styles.metricsDashboard}>
          <h4>System Metrics</h4>
          <div className={styles.metricsGrid}>
            <div className={styles.metric}><label>Overall Alignment:</label> <span>{(metrics.overallAlignment * 100).toFixed(1)}%</span></div>
            <div className={styles.metric}><label>Resonance Synergy:</label> <span>{(metrics.resonanceSynergy * 100).toFixed(1)}%</span></div>
            <div className={styles.metric}><label>Energy Flow Synergy:</label> <span>{(metrics.energyFlowSynergy * 100).toFixed(1)}%</span></div>
            <div className={styles.metric}><label>System Stability:</label> <span>{(metrics.systemStability * 100).toFixed(1)}%</span></div>
            <div className={styles.metric}><label>Quantum Harmony:</label> <span>{(metrics.quantumHarmony * 100).toFixed(1)}%</span></div>
          </div>
        </div>
      )}
    </div>
  );
}