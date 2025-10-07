import { useEffect, useCallback, useState } from 'react';
import { useEvolutionTracker } from '../lib/evolution/evolution-tracker';
import { ComponentPurpose, ComponentState } from '../lib/components/self-aware-component';

export interface UseComponentEvolutionOptions {
  onEvolutionThreshold?: (evolutionStage: number) => void;
  onConsciousnessThreshold?: (consciousness: number) => void;
  autoOptimize?: boolean;
}

export function useComponentEvolution(
  componentId: string,
  purpose: ComponentPurpose,
  initialState: ComponentState,
  options: UseComponentEvolutionOptions = {}
) {
  const {
    onEvolutionThreshold,
    onConsciousnessThreshold,
    autoOptimize = true
  } = options;

  const evolutionTracker = useEvolutionTracker();
  const [lastState, setLastState] = useState<ComponentState>(initialState);

  // Track evolution whenever state changes
  useEffect(() => {
    evolutionTracker.trackEvolution(componentId, purpose, lastState);
  }, [componentId, purpose, lastState, evolutionTracker]);

  // Subscribe to evolution data updates
  useEffect(() => {
    return evolutionTracker.subscribeToEvolution(componentId, (data) => {
      // Check evolution thresholds
      const currentStage = data.snapshots[data.snapshots.length - 1]?.evolution || 0;
      const prevStage = data.snapshots[data.snapshots.length - 2]?.evolution || 0;
      
      if (currentStage > prevStage && onEvolutionThreshold) {
        onEvolutionThreshold(currentStage);
      }

      // Check consciousness thresholds
      const currentConsciousness = data.snapshots[data.snapshots.length - 1]?.consciousness || 0;
      const prevConsciousness = data.snapshots[data.snapshots.length - 2]?.consciousness || 0;

      if (
        Math.floor(currentConsciousness * 10) > Math.floor(prevConsciousness * 10) &&
        onConsciousnessThreshold
      ) {
        onConsciousnessThreshold(currentConsciousness);
      }

      // Auto-optimize if enabled
      if (autoOptimize) {
        const predictions = data.predictions;
        if (predictions.nextEvolutionTime <= Date.now()) {
          // Component is ready to evolve
          const optimalPurpose = predictions.potentialPurposes[0];
          if (optimalPurpose) {
            // TODO: Implement automatic purpose transition
          }

          // Create optimal relationships
          predictions.optimalRelationships.forEach(relation => {
            if (relation.confidence > 0.8) {
              // TODO: Implement automatic relationship creation
            }
          });
        }
      }
    });
  }, [
    componentId,
    evolutionTracker,
    onEvolutionThreshold,
    onConsciousnessThreshold,
    autoOptimize
  ]);

  const updateState = useCallback((newState: ComponentState) => {
    setLastState(newState);
  }, []);

  const getEvolutionData = useCallback(() => {
    return evolutionTracker.getEvolutionData(componentId);
  }, [evolutionTracker, componentId]);

  const getSystemMetrics = useCallback(() => {
    return evolutionTracker.getSystemwideMetrics();
  }, [evolutionTracker]);

  return {
    updateState,
    getEvolutionData,
    getSystemMetrics,
    currentState: lastState
  };
}