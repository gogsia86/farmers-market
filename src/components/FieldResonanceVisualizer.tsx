import React, { useRef, useEffect } from 'react';
import { useFieldResonance } from '../hooks/useFieldResonance';
import styles from './FieldResonanceVisualizer.module.css';

interface FieldResonanceVisualizerProps {
  width: number;
  height: number;
  resolution?: number;
}

export function FieldResonanceVisualizer({
  width,
  height,
  resolution = 1
}: FieldResonanceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    patterns,
    sections,
    analysis,
    resonanceScore
  } = useFieldResonance({ width, height }, resolution);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw sections
    sections.forEach(section => {
      const { bounds, resonanceScore, dominantPattern } = section;
      const { x1, y1, x2, y2 } = bounds;

      ctx.fillStyle = `hsla(${resonanceScore * 360}, 70%, 50%, ${resonanceScore * 0.5})`;
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);

      if (dominantPattern) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      }
    });

    // Draw patterns
    patterns.forEach(pattern => {
      const hue = (pattern.frequency % 100) * 3.6;
      ctx.strokeStyle = `hsla(${hue}, 80%, 50%, ${pattern.amplitude})`;
      ctx.lineWidth = 2;

      ctx.beginPath();
      pattern.nodes.forEach((node, i) => {
        if (i === 0) {
          ctx.moveTo(node.x, node.y);
        } else {
          ctx.lineTo(node.x, node.y);
        }
      });
      ctx.stroke();

      // Draw nodes
      pattern.nodes.forEach(node => {
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${node.intensity})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.resonance * 5, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }, [width, height, patterns, sections]);

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.canvas}
      />
      {analysis && (
        <div className={styles.analysis}>
          <h3>Field Resonance Analysis</h3>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <label>Overall Resonance:</label>
              <span>{(resonanceScore * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.metric}>
              <label>Pattern Density:</label>
              <span>{(analysis.patternDensity * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.metric}>
              <label>Harmonic Stability:</label>
              <span>{(analysis.harmonicStability * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.metric}>
              <label>Phase Coherence:</label>
              <span>{(analysis.phaseCoherence * 100).toFixed(1)}%</span>
            </div>
          </div>
          {analysis.recommendations.length > 0 && (
            <div className={styles.recommendations}>
              <h4>Recommendations:</h4>
              <ul>
                {analysis.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          <div className={styles.frequencies}>
            <h4>Dominant Frequencies:</h4>
            <div className={styles.frequencyBars}>
              {analysis.dominantFrequencies.map((freq, i) => (
                <div
                  key={i}
                  className={styles.frequencyBar}
                  style={{
                    height: `${(freq / 100) * 100}%`,
                    backgroundColor: `hsl(${(freq % 100) * 3.6}, 70%, 50%)`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}