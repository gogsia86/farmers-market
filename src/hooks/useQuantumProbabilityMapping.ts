import { useState, useEffect, useMemo } from 'react';
import { useQuantumContextProvider } from '../context/QuantumContextProvider';
import { QuantumProbabilityMapper, CropGrowthProbability, ProbabilityMapOptions } from '../lib/quantumProbabilityMapper';

export const useQuantumProbabilityMapping = (cropId: string, options: ProbabilityMapOptions) => {
  const { recentObservations } = useQuantumContextProvider();
  const [growthProbability, setGrowthProbability] = useState<CropGrowthProbability | null>(null);
  
  const probabilityMapper = useMemo(() => new QuantumProbabilityMapper(options), [options]);

  useEffect(() => {
    // Update probability mapper with new observations
    recentObservations.forEach(obs => probabilityMapper.addObservation(obs));

    // Calculate new growth probability
    const probability = probabilityMapper.calculateGrowthProbability({
      id: cropId,
      // Add other crop data as needed
    });

    setGrowthProbability(probability);
  }, [cropId, recentObservations, probabilityMapper]);

  const quantumState = useMemo(() => probabilityMapper.getQuantumState(), [probabilityMapper]);

  return {
    growthProbability,
    quantumState,
    updateEnvironmentalData: (newData: ProbabilityMapOptions['environmentalData']) => {
      const updatedOptions = {
        ...options,
        environmentalData: {
          ...options.environmentalData,
          ...newData
        }
      };
      
      const mapper = new QuantumProbabilityMapper(updatedOptions);
      recentObservations.forEach(obs => mapper.addObservation(obs));
      
      const probability = mapper.calculateGrowthProbability({
        id: cropId,
        // Add other crop data as needed
      });
      
      setGrowthProbability(probability);
    }
  };
};