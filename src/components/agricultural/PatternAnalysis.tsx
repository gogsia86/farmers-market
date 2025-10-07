import React from 'react';
import { useLearningAnalysis } from '../../hooks/useLearningPattern';
import { LearningPattern, PatternType } from '../../types/learning-patterns';
import styles from './PatternAnalysis.module.css';

interface PatternAnalysisProps {
  type: PatternType;
  autoAnalyze?: boolean;
  analysisInterval?: number;
}

export function PatternAnalysis({
  type,
  autoAnalyze = true,
  analysisInterval = 3600000, // 1 hour
}: PatternAnalysisProps) {
  const { analysis, isAnalyzing, patterns, refreshAnalysis } = useLearningAnalysis({
    type,
    autoAnalyze,
    analysisInterval,
  });

  return (
    <div className={styles['pattern-analysis']}>
      <div className={styles['pattern-header']}>
        <h2 className={styles['pattern-title']}>
          {type.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')} Analysis
        </h2>
        <button
          onClick={refreshAnalysis}
          disabled={isAnalyzing}
          className={styles['pattern-refresh-button']}
        >
          {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
        </button>
      </div>

      {analysis && (
        <div className="space-y-4">
          <div className={styles['metrics-grid']}>
            <MetricCard
              title="Confidence Score"
              value={`${(analysis.confidence * 100).toFixed(1)}%`}
              description="Overall confidence in the pattern analysis"
            />
            <MetricCard
              title="Quantum Alignment"
              value={`${(analysis.quantumAlignment * 100).toFixed(1)}%`}
              description="Resonance with quantum agricultural principles"
            />
          </div>

          <div className="space-y-2">
            <h3 className={styles['section-title']}>Key Insights</h3>
            <ul className={styles['insights-list']}>
              {analysis.insights.map((insight: string, index: number) => (
                <li key={index} className={styles['insight-item']}>{insight}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className={styles['section-title']}>Recommendations</h3>
            <ul className={styles['insights-list']}>
              {analysis.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className={styles['insight-item']}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <PatternList patterns={patterns} />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
}

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <div className={styles['metric-card']}>
      <h4 className={styles['metric-title']}>{title}</h4>
      <div className={styles['metric-value']}>{value}</div>
      <p className={styles['metric-description']}>{description}</p>
    </div>
  );
}

interface PatternListProps {
  patterns: LearningPattern[];
}

function PatternList({ patterns }: PatternListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-medium text-gray-700">Detected Patterns</h3>
      <div className="space-y-2">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            className={styles['pattern-item']}
          >
            <div className={styles['pattern-item-header']}>
              <div>
                <h4 className={styles['pattern-id']}>
                  Pattern #{pattern.id.slice(0, 8)}
                </h4>
                <p className={styles['pattern-date']}>
                  Detected on {new Date(pattern.dateCreated).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className={styles['confidence-badge']}>
                  {(pattern.confidence * 100).toFixed(1)}% Confidence
                </span>
              </div>
            </div>
            <div className={styles['pattern-data']}>
              <h5 className={styles['pattern-data-title']}>Pattern Data</h5>
              <pre className={styles['pattern-data-content']}>
                {JSON.stringify(pattern.data, null, 2)}
              </pre>
            </div>
            <div className={styles['quantum-resonance']}>
              <span className={styles['resonance-label']}>Quantum Resonance:</span>
              <div className={styles['resonance-bar']}>
                <div
                  className={styles['resonance-progress']}
                  style={{
                    width: `${(pattern.metadata.quantumResonance * 100)}%`,
                  }}
                />
              </div>
              <span className={styles['resonance-value']}>
                {(pattern.metadata.quantumResonance * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}