import React, { createContext, useContext, useMemo } from 'react';
import { QuantumStateManager, QuantumStateContext } from '../lib/quantumStateManager';
import { useMultiDimensionalRender } from '../hooks/useMultiDimensionalRender';

interface DimensionalAwarenessProviderProps {
  children: React.ReactNode;
  initialQuantumState?: ConstructorParameters<typeof QuantumStateManager>[0];
}

export const DimensionalAwarenessProvider: React.FC<DimensionalAwarenessProviderProps> = ({
  children,
  initialQuantumState,
}) => {
  const quantumStateManager = useMemo(() => new QuantumStateManager(initialQuantumState), []);
  const { dimensionalState, optimizeRenderingPlane } = useMultiDimensionalRender();

  const renderWithDimensionalAwareness = (content: React.ReactNode) => {
    const optimizedContent = optimizeRenderingPlane(content);
    const currentState = quantumStateManager.getCurrentState();

    // Apply quantum state transformations based on probability field
    if (currentState.coherenceLevel < 1) {
      const variants = Array.from(currentState.timelineVariants.values());
      const probabilities = currentState.probabilityField;
      
      // Quantum superposition of content across timelines
      return variants.reduce((acc, variant, index) => {
        const probability = probabilities[index + 1]; // +1 because index 0 is primary timeline
        if (probability > 0.1) { // Only render significant probability variants
          const element = acc as React.ReactElement<any>;
          const elementProps = element.props as { style?: React.CSSProperties };
          return React.cloneElement(element, {
            ...elementProps,
            style: {
              ...(elementProps.style || {}),
              opacity: probability,
              position: index === 0 ? 'relative' : 'absolute',
            } as React.CSSProperties,
          });
        }
        return acc;
      }, optimizedContent);
    }

    return optimizedContent;
  };

  return (
    <QuantumStateContext.Provider value={quantumStateManager}>
      {renderWithDimensionalAwareness(children)}
    </QuantumStateContext.Provider>
  );
};

export const useDimensionalAwareness = () => {
  const context = useContext(QuantumStateContext);
  if (!context) {
    throw new Error('useDimensionalAwareness must be used within a DimensionalAwarenessProvider');
  }
  return context;
};