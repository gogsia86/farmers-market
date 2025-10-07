import React, { useEffect, useRef } from 'react';
import { useAdaptiveContext } from '../../context/AdaptiveContext';
import { AdaptationEngine } from '../adaptation/AdaptationEngine';
import { useContextSensing } from '../sensing/ContextSensingSystem';

interface TransformableProps {
  children: React.ReactNode;
  adaptationConfig?: {
    sensitivity?: number;
    minScale?: number;
    maxScale?: number;
    transformOrigin?: string;
  };
  className?: string;
  style?: React.CSSProperties;
}

export const QuantumTransformable: React.FC<TransformableProps> = ({
  children,
  adaptationConfig,
  className,
  style,
  ...props
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const contextSnapshot = useContextSensing();
  const adaptiveContext = useAdaptiveContext();
  const engineRef = useRef<AdaptationEngine>();

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new AdaptationEngine();
    }
  }, []);

  useEffect(() => {
    if (contextSnapshot && engineRef.current) {
      const adaptationState = engineRef.current.adapt(contextSnapshot);
      applyAdaptations(adaptationState);
    }
  }, [contextSnapshot]);

  const applyAdaptations = (state: any) => {
    if (!elementRef.current) return;

    const {
      layout,
      style: styleAdaptation,
      behavior,
      accessibility
    } = state;

    // Apply layout adaptations
    const layoutTransform = calculateLayoutTransform(layout);
    
    // Apply style adaptations
    const styleTransform = calculateStyleTransform(styleAdaptation);
    
    // Apply behavior adaptations
    applyBehaviorAdaptations(behavior);
    
    // Apply accessibility adaptations
    applyAccessibilityAdaptations(accessibility);

    // Combine and apply all transforms
    elementRef.current.style.transform = combineTransforms([
      layoutTransform,
      styleTransform
    ]);
  };

  const calculateLayoutTransform = (layout: any) => {
    const { dimensionality, flow } = layout;
    let transform = '';

    // Apply quantum flow patterns
    if (flow === 'quantum') {
      transform += `
        rotate(${Math.sin(Date.now() / 1000) * 2}deg)
        scale(${1 + Math.sin(Date.now() / 1500) * 0.05})
      `;
    }

    // Apply dimensional transformations
    if (dimensionality > 1) {
      transform += `perspective(1000px) rotateX(${Math.sin(Date.now() / 2000) * 5}deg)`;
    }

    return transform;
  };

  const calculateStyleTransform = (styleAdaptation: any) => {
    const { scale, motion } = styleAdaptation;
    let transform = '';

    // Apply scale adaptation
    if (scale !== 1) {
      transform += `scale(${scale})`;
    }

    // Apply motion-based transforms
    if (motion > 0.5) {
      const motionIntensity = (motion - 0.5) * 2;
      transform += `
        translate(${Math.sin(Date.now() / 1000) * motionIntensity}px)
        rotate(${Math.sin(Date.now() / 1200) * motionIntensity}deg)
      `;
    }

    return transform;
  };

  const applyBehaviorAdaptations = (behavior: any) => {
    const element = elementRef.current;
    if (!element) return;

    // Apply interaction adaptations
    element.style.transition = `all ${300 * behavior.responsiveness}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    
    // Apply anticipation behaviors
    if (behavior.anticipation > 0.7) {
      element.dataset.anticipation = 'high';
    } else {
      delete element.dataset.anticipation;
    }
  };

  const applyAccessibilityAdaptations = (accessibility: any) => {
    const element = elementRef.current;
    if (!element) return;

    // Apply text size adjustments
    element.style.fontSize = `${accessibility.textSize * 100}%`;
    
    // Apply spacing adjustments
    element.style.padding = `${accessibility.spacing}em`;

    // Apply interaction modes
    element.dataset.interactions = accessibility.interactions;
    element.dataset.feedback = accessibility.feedback;
  };

  const combineTransforms = (transforms: string[]): string => {
    return transforms.filter(Boolean).join(' ');
  };

  return (
    <div
      ref={elementRef}
      className={`quantum-transformable ${className || ''}`}
      style={{
        ...style,
        willChange: 'transform',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const withQuantumTransform = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return (props: P & TransformableProps) => (
    <QuantumTransformable {...props.adaptationConfig}>
      <WrappedComponent {...props} />
    </QuantumTransformable>
  );
};

// Specialized transformers for common use cases
export const QuantumCard = withQuantumTransform(({ children, ...props }: any) => (
  <div className="quantum-card" {...props}>
    {children}
  </div>
));

export const QuantumButton = withQuantumTransform(({ children, ...props }: any) => (
  <button className="quantum-button" {...props}>
    {children}
  </button>
));

export const QuantumContainer = withQuantumTransform(({ children, ...props }: any) => (
  <div className="quantum-container" {...props}>
    {children}
  </div>
));

// Example usage:
// <QuantumTransformable>
//   <div>Content that will adapt based on quantum context</div>
// </QuantumTransformable>
//
// or using the specialized components:
// <QuantumCard>Card content</QuantumCard>
// <QuantumButton>Adaptive Button</QuantumButton>
// <QuantumContainer>Container content</QuantumContainer>