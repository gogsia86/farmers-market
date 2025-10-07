import { useEffect, useState } from 'react';
import { useProgressiveEnhancement, FeatureCapability } from '../components/adaptation/progressive-enhancement';
import { useAdaptation } from '../components/adaptation/context-adaptation-engine';

export interface ProgressiveFeature extends FeatureCapability {
  enhancementComponent: React.ComponentType<any>;
  fallbackComponent?: React.ComponentType<any>;
}

export const useFeatureEnhancement = (
  features: ProgressiveFeature[],
  componentId: string
) => {
  const { state, activateFeature, deactivateFeature, checkFeatureAvailability } = useProgressiveEnhancement();
  const { state: adaptationState } = useAdaptation();
  const [activeFeatures, setActiveFeatures] = useState<ProgressiveFeature[]>([]);

  useEffect(() => {
    const updateActiveFeatures = () => {
      const newActiveFeatures = features.filter(feature => {
        const isAvailable = checkFeatureAvailability(feature);
        if (isAvailable) {
          activateFeature(`${componentId}-${feature.id}`);
        } else {
          deactivateFeature(`${componentId}-${feature.id}`);
        }
        return isAvailable;
      });

      setActiveFeatures(newActiveFeatures);
    };

    updateActiveFeatures();

    // Re-evaluate when relevant states change
    return () => {
      features.forEach(feature => {
        deactivateFeature(`${componentId}-${feature.id}`);
      });
    };
  }, [
    features,
    componentId,
    state.deviceCapabilities,
    state.quantumCoherence,
    adaptationState.userState.consciousnessLevel,
    checkFeatureAvailability,
    activateFeature,
    deactivateFeature
  ]);

  const getFeatureComponent = (featureId: string) => {
    const feature = activeFeatures.find(f => f.id === featureId);
    return feature ? feature.enhancementComponent : null;
  };

  const getFallbackComponent = (featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    return feature?.fallbackComponent || null;
  };

  return {
    activeFeatures,
    getFeatureComponent,
    getFallbackComponent,
    deviceCapabilities: state.deviceCapabilities,
    quantumCoherence: state.quantumCoherence,
    consciousnessLevel: adaptationState.userState.consciousnessLevel
  };
};