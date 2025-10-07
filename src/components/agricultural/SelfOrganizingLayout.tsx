import React, { useEffect, useRef } from 'react';
import { QuantumGrid, QuantumGridProps } from './QuantumGrid';
import { useSelfOrganization } from '@/hooks/useSelfOrganization';
import { useQuantumObserver } from '@/hooks/useQuantumObserver';
import { cn } from '@/lib/utils';

export interface SelfOrganizingLayoutProps extends Omit<QuantumGridProps, 'children'> {
  children: React.ReactNode[];
  evolutionRate?: number; // Rate at which the layout evolves (0-1)
  consciousness?: number; // Level of layout consciousness (0-1)
  adaptationThreshold?: number; // Threshold for triggering layout adaptation (0-1)
  children: React.ReactNode;
}

export const SelfOrganizingLayout: React.FC<SelfOrganizingLayoutProps> = ({
  children,
  evolutionRate = 0.5,
  consciousness = 0.7,
  adaptationThreshold = 0.3,
  className,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    optimizedLayout,
    adaptLayout,
    measureHarmony
  } = useSelfOrganization({
    evolutionRate,
    consciousness,
    adaptationThreshold
  });

  const { observeQuantumState } = useQuantumObserver({
    onStateChange: (newState) => {
      if (newState.dissonance > adaptationThreshold) {
        adaptLayout(newState);
      }
    }
  });

  useEffect(() => {
    if (containerRef.current) {
      observeQuantumState(containerRef.current);
    }
    
    // Measure initial harmony
    const harmony = measureHarmony(children);
    
    if (harmony.resonance < adaptationThreshold) {
      adaptLayout({
        elements: children,
        currentHarmony: harmony,
        environmentalFactors: {
          timeOfDay: new Date(),
          userInteractionPatterns: [], // To be populated from analytics
          deviceCapabilities: {
            screen: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            performance: window.navigator.hardwareConcurrency
          }
        }
      });
    }
  }, [children, adaptationThreshold, observeQuantumState, adaptLayout, measureHarmony]);

  return (
    <div ref={containerRef} className={cn('self-organizing-container', className)}>
      <QuantumGrid {...props}>
        {React.Children.map(children, (child, index) => {
          const optimizedProps = optimizedLayout[index] || {};
          return React.cloneElement(child as React.ReactElement, {
            ...optimizedProps,
            style: {
              ...(child as React.ReactElement).props.style,
              ...optimizedProps.style,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }
          });
        })}
      </QuantumGrid>
    </div>
  );
};