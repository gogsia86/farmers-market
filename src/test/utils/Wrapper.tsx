import React from 'react';
import { AdaptiveProvider } from '../../context/AdaptiveContext';
import { DimensionalAwarenessProvider } from '../../context/DimensionalAwarenessContext';
import { QuantumContextProvider } from '../../context/QuantumContextProvider';

interface WrapperProps {
  children: React.ReactNode;
}

export const Wrapper = ({ children }: WrapperProps) => {
  return (
    <QuantumContextProvider>
      <DimensionalAwarenessProvider>
        <AdaptiveProvider>
          {children}
        </AdaptiveProvider>
      </DimensionalAwarenessProvider>
    </QuantumContextProvider>
  );
};