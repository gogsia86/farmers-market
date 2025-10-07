import { useCallback, useEffect, useRef, useState } from 'react';
import { useAdaptiveContext } from '../context/AdaptiveContext';
import { QuantumState } from '../types/quantum';

interface AdaptiveStyle {
  scale: number;
  opacity: number;
  transform: string;
  filter: string;
  transition: string;
}

interface AdaptiveConfig {
  minScale?: number;
  maxScale?: number;
  transformOrigin?: string;
  transitionDuration?: number;
  quantumSensitivity?: number;
}

const defaultConfig: Required<AdaptiveConfig> = {
  minScale: 0.8,
  maxScale: 1.2,
  transformOrigin: 'center',
  transitionDuration: 300,
  quantumSensitivity: 0.7
};

export const useAdaptiveInterface = (config: AdaptiveConfig = {}) => {
  const mergedConfig = { ...defaultConfig, ...config };
  const context = useAdaptiveContext();
  const [style, setStyle] = useState<AdaptiveStyle>({
    scale: 1,
    opacity: 1,
    transform: 'none',
    filter: 'none',
    transition: `all ${mergedConfig.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
  });

  const previousState = useRef<QuantumState>(context.quantumState);

  const calculateAdaptation = useCallback((state: QuantumState) => {
    const { resonance, coherence, entanglement, dimensionality } = state;

    // Calculate quantum-influenced scale
    const quantumScale = lerp(
      mergedConfig.minScale,
      mergedConfig.maxScale,
      resonance
    );

    // Calculate quantum-influenced transform
    const rotation = Math.sin(coherence * Math.PI * 2) * 5;
    const skew = Math.sin(entanglement * Math.PI) * 2;
    
    // Calculate quantum filters
    const blur = lerp(0, 2, 1 - coherence);
    const brightness = lerp(0.9, 1.1, resonance);
    const contrast = lerp(0.9, 1.1, entanglement);

    return {
      scale: quantumScale,
      opacity: lerp(0.7, 1, coherence),
      transform: `
        scale(${quantumScale})
        rotate(${rotation}deg)
        skew(${skew}deg)
      `,
      filter: `
        blur(${blur}px)
        brightness(${brightness})
        contrast(${contrast})
      `,
      transition: `all ${mergedConfig.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
    };
  }, [mergedConfig]);

  const shouldAdapt = useCallback((
    current: QuantumState,
    previous: QuantumState
  ): boolean => {
    const threshold = mergedConfig.quantumSensitivity;
    
    return (
      Math.abs(current.resonance - previous.resonance) > threshold ||
      Math.abs(current.coherence - previous.coherence) > threshold ||
      Math.abs(current.entanglement - previous.entanglement) > threshold ||
      current.dimensionality !== previous.dimensionality
    );
  }, [mergedConfig.quantumSensitivity]);

  useEffect(() => {
    if (shouldAdapt(context.quantumState, previousState.current)) {
      const newStyle = calculateAdaptation(context.quantumState);
      setStyle(newStyle);
      previousState.current = context.quantumState;
    }
  }, [context.quantumState, calculateAdaptation, shouldAdapt]);

  const getAdaptiveProps = useCallback(() => ({
    style: {
      ...style,
      transformOrigin: mergedConfig.transformOrigin
    }
  }), [style, mergedConfig.transformOrigin]);

  return {
    style,
    getAdaptiveProps,
    quantumState: context.quantumState
  };
};

// Utility function for linear interpolation
function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}