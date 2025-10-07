import React from 'react';
import { useAdaptiveInterface } from '../hooks/useAdaptiveInterface';

export interface AdaptiveComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  sensitivity?: number;
  transformOrigin?: string;
  minScale?: number;
  maxScale?: number;
}

export const AdaptiveComponent: React.FC<AdaptiveComponentProps> = ({
  children,
  sensitivity = 0.7,
  transformOrigin = 'center',
  minScale = 0.8,
  maxScale = 1.2,
  ...props
}) => {
  const { getAdaptiveProps } = useAdaptiveInterface({
    quantumSensitivity: sensitivity,
    transformOrigin,
    minScale,
    maxScale
  });

  return (
    <div {...props} {...getAdaptiveProps()}>
      {children}
    </div>
  );
};

export default AdaptiveComponent;