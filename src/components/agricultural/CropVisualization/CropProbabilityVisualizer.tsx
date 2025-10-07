import React from 'react';
import { useQuantumProbabilityMapping } from '../../../hooks/useQuantumProbabilityMapping';

interface CropProbabilityVisualizerProps {
  cropId: string;
  temporalRange: [Date, Date];
  dimensionalDepth: number;
}

export const CropProbabilityVisualizer: React.FC<CropProbabilityVisualizerProps> = ({
  cropId,
  temporalRange,
  dimensionalDepth
}) => {
  const { growthProbability, quantumState, updateEnvironmentalData } = useQuantumProbabilityMapping(
    cropId,
    { temporalRange, dimensionalDepth }
  );

  if (!growthProbability) {
    return <div>Loading quantum probabilities...</div>;
  }

  const {
    yield: expectedYield,
    confidence,
    timeToHarvest,
    environmentalFactors,
    quantumAlignment
  } = growthProbability;

  return (
    <div className="probability-visualizer">
      <div className="quantum-metrics">
        <h3>Quantum Growth Probability</h3>
        <div className="metric">
          <label>Expected Yield:</label>
          <span>{(expectedYield * 100).toFixed(1)}%</span>
        </div>
        <div className="metric">
          <label>Confidence:</label>
          <span>{(confidence * 100).toFixed(1)}%</span>
        </div>
        <div className="metric">
          <label>Time to Harvest:</label>
          <span>{timeToHarvest} days</span>
        </div>
        <div className="metric">
          <label>Quantum Alignment:</label>
          <span>{(quantumAlignment * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="environmental-factors">
        <h3>Environmental Influence</h3>
        <div className="factor">
          <label>Soil Quality:</label>
          <span>{(environmentalFactors.soil * 100).toFixed(1)}%</span>
        </div>
        <div className="factor">
          <label>Water Availability:</label>
          <span>{(environmentalFactors.water * 100).toFixed(1)}%</span>
        </div>
        <div className="factor">
          <label>Sunlight Exposure:</label>
          <span>{(environmentalFactors.sunlight * 100).toFixed(1)}%</span>
        </div>
        <div className="factor">
          <label>Temperature:</label>
          <span>{(environmentalFactors.temperature * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="quantum-state">
        <h3>Quantum Field Status</h3>
        <div className="state-metric">
          <label>Observations:</label>
          <span>{quantumState.observationCount}</span>
        </div>
        <div className="state-metric">
          <label>Field Significance:</label>
          <span>{(quantumState.averageSignificance * 100).toFixed(1)}%</span>
        </div>
        <div className="state-metric">
          <label>Quantum Stability:</label>
          <span>{(quantumState.quantumStability * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};