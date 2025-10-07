import { createContext, useContext, useEffect, useReducer } from 'react';
import { useAdaptation } from './context-adaptation-engine';

export interface FeatureCapability {
  id: string;
  name: string;
  requiredConsciousnessLevel: number;
  deviceRequirements: {
    memory?: number;
    cpu?: number;
    network?: 'fast' | 'medium' | 'slow';
  };
  quantumRequirements?: {
    resonance: number;
    stability: number;
    coherence: number;
  };
}

interface EnhancementState {
  activeFeatures: Set<string>;
  enhancementLevel: number;
  quantumCoherence: number;
  deviceCapabilities: {
    memory: number;
    cpu: number;
    network: 'fast' | 'medium' | 'slow';
  };
}

type EnhancementAction =
  | { type: 'ACTIVATE_FEATURE'; payload: string }
  | { type: 'DEACTIVATE_FEATURE'; payload: string }
  | { type: 'SET_ENHANCEMENT_LEVEL'; payload: number }
  | { type: 'UPDATE_QUANTUM_COHERENCE'; payload: number }
  | { type: 'UPDATE_DEVICE_CAPABILITIES'; payload: Partial<EnhancementState['deviceCapabilities']> };

const initialState: EnhancementState = {
  activeFeatures: new Set(),
  enhancementLevel: 1,
  quantumCoherence: 0.5,
  deviceCapabilities: {
    memory: 4,
    cpu: 2,
    network: 'medium'
  }
};

const enhancementReducer = (state: EnhancementState, action: EnhancementAction): EnhancementState => {
  switch (action.type) {
    case 'ACTIVATE_FEATURE':
      return {
        ...state,
        activeFeatures: new Set([...state.activeFeatures, action.payload])
      };
    case 'DEACTIVATE_FEATURE':
      const newFeatures = new Set(state.activeFeatures);
      newFeatures.delete(action.payload);
      return {
        ...state,
        activeFeatures: newFeatures
      };
    case 'SET_ENHANCEMENT_LEVEL':
      return {
        ...state,
        enhancementLevel: action.payload
      };
    case 'UPDATE_QUANTUM_COHERENCE':
      return {
        ...state,
        quantumCoherence: action.payload
      };
    case 'UPDATE_DEVICE_CAPABILITIES':
      return {
        ...state,
        deviceCapabilities: {
          ...state.deviceCapabilities,
          ...action.payload
        }
      };
    default:
      return state;
  }
};

export const ProgressiveEnhancementContext = createContext<{
  state: EnhancementState;
  activateFeature: (featureId: string) => void;
  deactivateFeature: (featureId: string) => void;
  checkFeatureAvailability: (feature: FeatureCapability) => boolean;
} | null>(null);

export const ProgressiveEnhancementProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(enhancementReducer, initialState);
  const { state: adaptationState } = useAdaptation();

  const activateFeature = (featureId: string) => {
    dispatch({ type: 'ACTIVATE_FEATURE', payload: featureId });
  };

  const deactivateFeature = (featureId: string) => {
    dispatch({ type: 'DEACTIVATE_FEATURE', payload: featureId });
  };

  const checkFeatureAvailability = (feature: FeatureCapability): boolean => {
    // Check consciousness level requirement
    if (adaptationState.userState.consciousnessLevel < feature.requiredConsciousnessLevel) {
      return false;
    }

    // Check device requirements
    const { deviceRequirements } = feature;
    if (deviceRequirements) {
      if (deviceRequirements.memory && state.deviceCapabilities.memory < deviceRequirements.memory) {
        return false;
      }
      if (deviceRequirements.cpu && state.deviceCapabilities.cpu < deviceRequirements.cpu) {
        return false;
      }
      if (deviceRequirements.network && 
          !meetsNetworkRequirement(state.deviceCapabilities.network, deviceRequirements.network)) {
        return false;
      }
    }

    // Check quantum requirements
    if (feature.quantumRequirements) {
      const { resonance, stability, coherence } = feature.quantumRequirements;
      if (state.quantumCoherence < coherence) {
        return false;
      }
      // Additional quantum checks can be added here
    }

    return true;
  };

  useEffect(() => {
    // Update device capabilities
    const updateCapabilities = () => {
      dispatch({
        type: 'UPDATE_DEVICE_CAPABILITIES',
        payload: {
          memory: (navigator as any).deviceMemory || 4,
          cpu: navigator.hardwareConcurrency || 2,
          network: getNetworkSpeed()
        }
      });
    };

    updateCapabilities();
    window.addEventListener('online', updateCapabilities);
    window.addEventListener('offline', updateCapabilities);

    return () => {
      window.removeEventListener('online', updateCapabilities);
      window.removeEventListener('offline', updateCapabilities);
    };
  }, []);

  useEffect(() => {
    // Update quantum coherence based on user state
    dispatch({
      type: 'UPDATE_QUANTUM_COHERENCE',
      payload: calculateQuantumCoherence(adaptationState.userState)
    });
  }, [adaptationState.userState]);

  return (
    <ProgressiveEnhancementContext.Provider
      value={{ state, activateFeature, deactivateFeature, checkFeatureAvailability }}
    >
      {children}
    </ProgressiveEnhancementContext.Provider>
  );
};

export const useProgressiveEnhancement = () => {
  const context = useContext(ProgressiveEnhancementContext);
  if (!context) {
    throw new Error('useProgressiveEnhancement must be used within a ProgressiveEnhancementProvider');
  }
  return context;
};

// Utility functions
const meetsNetworkRequirement = (current: string, required: string): boolean => {
  const speeds = { fast: 3, medium: 2, slow: 1 };
  return speeds[current as keyof typeof speeds] >= speeds[required as keyof typeof speeds];
};

const getNetworkSpeed = (): 'fast' | 'medium' | 'slow' => {
  if (!navigator.onLine) return 'slow';
  const connection = (navigator as any).connection;
  if (!connection) return 'medium';

  const effectiveType = connection.effectiveType;
  switch (effectiveType) {
    case '4g':
      return 'fast';
    case '3g':
      return 'medium';
    default:
      return 'slow';
  }
};

const calculateQuantumCoherence = (userState: any): number => {
  // Calculate quantum coherence based on user state
  // This is a simplified implementation
  const consciousnessContribution = userState.consciousnessLevel / 10;
  const quantumStateContribution = userState.quantumState === 'elevated' ? 0.3 : 0;
  return Math.min(consciousnessContribution + quantumStateContribution, 1);
};