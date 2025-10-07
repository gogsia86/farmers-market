import React, { useRef, useEffect } from 'react';
import { useEnergyFlow } from '../hooks/useEnergyFlow';
import styles from './EnergyFlowVisualizer.module.css';

interface EnergyFlowVisualizerProps {
  width: number;
  height: number;
  resolution?: number;
}

export function EnergyFlowVisualizer({
  width,
  height,
  resolution = 1
}: EnergyFlowVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    flows,
    optimizations,
    metrics,
    updateFlows
  } = useEnergyFlow({ width, height }, resolution);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw flow paths
    flows.forEach(flow => {
      const optimization = optimizations.get(flow.id);
      if (!optimization) return;

      // Draw optimal path
      if (optimization.recommendedChanges.path) {
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${getFlowHue(flow.type)}, 70%, 50%, 0.3)`;
        ctx.lineWidth = 1;

        optimization.recommendedChanges.path.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      }

      // Draw actual flow
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${getFlowHue(flow.type)}, 80%, 50%, ${flow.intensity})`;
      ctx.lineWidth = 2;
      ctx.moveTo(flow.source.x, flow.source.y);
      ctx.lineTo(flow.destination.x, flow.destination.y);
      ctx.stroke();

      // Draw flow points
      [flow.source, flow.destination].forEach(point => {
        ctx.fillStyle = `hsla(${getFlowHue(flow.type)}, 80%, 50%, ${point.intensity})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, flow.intensity * 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw velocity indicator
      const midX = (flow.source.x + flow.destination.x) / 2;
      const midY = (flow.source.y + flow.destination.y) / 2;
      const angle = Math.atan2(
        flow.destination.y - flow.source.y,
        flow.destination.x - flow.source.x
      );

      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);
      
      const arrowLength = flow.velocity * 5;
      ctx.beginPath();
      ctx.moveTo(-arrowLength/2, 0);
      ctx.lineTo(arrowLength/2, 0);
      ctx.lineTo(arrowLength/2 - 5, -5);
      ctx.moveTo(arrowLength/2, 0);
      ctx.lineTo(arrowLength/2 - 5, 5);
      
      ctx.strokeStyle = `hsla(${getFlowHue(flow.type)}, 80%, 50%, ${flow.intensity})`;
      ctx.stroke();
      ctx.restore();
    });

  }, [width, height, flows, optimizations]);

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.canvas}
      />
      {metrics && (
        <div className={styles.metrics}>
          <h3>Energy Flow Analysis</h3>
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <label>Overall Efficiency:</label>
              <span>{(metrics.overallEfficiency * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.metric}>
              <label>Energy Balance:</label>
              <span>{(metrics.energyBalance * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.metric}>
              <label>Flow Harmony:</label>
              <span>{(metrics.flowHarmony * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.metric}>
              <label>System Stability:</label>
              <span>{(metrics.systemStability * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.metric}>
              <label>Quantum Alignment:</label>
              <span>{(metrics.quantumAlignment * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className={styles.flowTypes}>
            <h4>Flow Types</h4>
            <div className={styles.flowLegend}>
              {['nutrient', 'water', 'solar', 'thermal', 'biodynamic'].map(type => (
                <div key={type} className={styles.legendItem}>
                  <span
                    className={styles.legendColor}
                    style={{ backgroundColor: `hsl(${getFlowHue(type)}, 70%, 50%)` }}
                  />
                  <span className={styles.legendLabel}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getFlowHue(type: string): number {
  switch (type) {
    case 'nutrient': return 120;  // Green
    case 'water': return 200;     // Blue
    case 'solar': return 60;      // Yellow
    case 'thermal': return 0;     // Red
    case 'biodynamic': return 280; // Purple
    default: return 0;
  }
}