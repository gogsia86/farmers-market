import React, { useState } from 'react';
import { useEnergyFieldHarmonization } from '../../../hooks/useEnergyFieldHarmonization';
import styles from './EnergyFieldHarmonizer.module.css';

const initialMetrics = {
  vibration: 0.8,
  harmony: 0.75,
  flow: 0.7,
  stability: 0.9
};

export const EnergyFieldHarmonizer: React.FC = () => {
  const [autoOptimize, setAutoOptimize] = useState(false);
  
  const {
    currentMetrics,
    harmonizationResult,
    trends,
    updateMetrics
  } = useEnergyFieldHarmonization(initialMetrics, {
    autoOptimize,
    minVibration: 0.7,
    targetHarmony: 0.85,
    flowThreshold: 0.75,
    stabilityMargin: 0.1
  });

  if (!harmonizationResult) {
    return <div>Initializing energy field harmonization...</div>;
  }

  return (
    <div className={styles.harmonizer}>
      <div className={styles.controls}>
        <label className={styles.autoOptimize}>
          <input
            type="checkbox"
            checked={autoOptimize}
            onChange={(e) => setAutoOptimize(e.target.checked)}
          />
          Auto-Optimize Energy Fields
        </label>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metric}>
          <h4>Vibration</h4>
          <div className={styles.value}>
            {(currentMetrics.vibration * 100).toFixed(1)}%
            <span className={`${styles.trend} ${trends.vibrationTrend > 0 ? styles.positive : styles.negative}`}>
              {trends.vibrationTrend > 0 ? '↑' : '↓'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentMetrics.vibration}
            onChange={(e) => updateMetrics({ vibration: Number(e.target.value) })}
            disabled={autoOptimize}
          />
        </div>

        <div className={styles.metric}>
          <h4>Harmony</h4>
          <div className={styles.value}>
            {(currentMetrics.harmony * 100).toFixed(1)}%
            <span className={`${styles.trend} ${trends.harmonyTrend > 0 ? styles.positive : styles.negative}`}>
              {trends.harmonyTrend > 0 ? '↑' : '↓'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentMetrics.harmony}
            onChange={(e) => updateMetrics({ harmony: Number(e.target.value) })}
            disabled={autoOptimize}
          />
        </div>

        <div className={styles.metric}>
          <h4>Energy Flow</h4>
          <div className={styles.value}>
            {(currentMetrics.flow * 100).toFixed(1)}%
            <span className={`${styles.trend} ${trends.flowTrend > 0 ? styles.positive : styles.negative}`}>
              {trends.flowTrend > 0 ? '↑' : '↓'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentMetrics.flow}
            onChange={(e) => updateMetrics({ flow: Number(e.target.value) })}
            disabled={autoOptimize}
          />
        </div>

        <div className={styles.metric}>
          <h4>Stability</h4>
          <div className={styles.value}>
            {(currentMetrics.stability * 100).toFixed(1)}%
            <span className={`${styles.trend} ${trends.stabilityTrend > 0 ? styles.positive : styles.negative}`}>
              {trends.stabilityTrend > 0 ? '↑' : '↓'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentMetrics.stability}
            onChange={(e) => updateMetrics({ stability: Number(e.target.value) })}
            disabled={autoOptimize}
          />
        </div>
      </div>

      <div className={styles.recommendations}>
        <h3>Field Harmonization Recommendations</h3>
        <ul>
          {harmonizationResult.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>

      <div className={styles.optimizations}>
        <h3>Dimensional Optimizations</h3>
        <div className={styles.optimizationGrid}>
          {harmonizationResult.optimizations.map((opt, index) => (
            <div key={index} className={styles.optimization}>
              <h4>{opt.dimension}</h4>
              <p className={styles.action}>{opt.action}</p>
              <div className={styles.impact}>
                Impact: {(opt.impact * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};