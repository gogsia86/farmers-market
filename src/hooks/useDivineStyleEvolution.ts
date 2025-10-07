import { useCallback, useMemo } from 'react';
import { useDivineStyles } from '../lib/styles/divine-style-system';
import { useComponentEvolution } from './useComponentEvolution';
import type { ComponentPurpose, ComponentState } from '../lib/components/self-aware-component';

export interface StyleEvolutionOptions {
  initialConsciousness?: number;
  colorEvolution?: boolean;
  typographyEvolution?: boolean;
  spacingEvolution?: boolean;
  animationEvolution?: boolean;
}

export function useDivineStyleEvolution(
  componentId: string,
  purpose: ComponentPurpose,
  options: StyleEvolutionOptions = {}
) {
  const {
    initialConsciousness = 0.5,
    colorEvolution = true,
    typographyEvolution = true,
    spacingEvolution = true,
    animationEvolution = true
  } = options;

  const { styles, updateConsciousness, getResponsiveValue } = useDivineStyles();

  const initialState: ComponentState = {
    consciousness: initialConsciousness,
    evolution: 0,
    relations: []
  };

  const evolution = useComponentEvolution(componentId, purpose, initialState, {
    onConsciousnessThreshold: updateConsciousness,
    autoOptimize: true
  });

  const getEvolvedColor = useCallback((colorKey: keyof typeof styles.colors) => {
    if (!colorEvolution) return styles.colors[colorKey];

    const color = styles.colors[colorKey];
    const consciousness = evolution.currentState.consciousness;
    
    // Adjust color based on consciousness and evolution stage
    return color; // Color is already adjusted by DivineStyleProvider
  }, [styles.colors, evolution.currentState, colorEvolution]);

  const getEvolvedTypography = useCallback((variant: keyof typeof styles.typography) => {
    if (!typographyEvolution) return styles.typography[variant];

    const typography = styles.typography[variant];
    const consciousness = evolution.currentState.consciousness;
    const evolutionStage = evolution.currentState.evolution;

    if (typeof typography === 'object' && 'weight' in typography) {
      return {
        ...typography,
        weight: Math.min(900, typography.weight + evolutionStage * 100),
        letterSpacing: `${parseFloat(typography.letterSpacing) + consciousness * 0.02}em`
      };
    }

    return typography;
  }, [styles.typography, evolution.currentState, typographyEvolution]);

  const getEvolvedSpacing = useCallback((spacingKey: keyof typeof styles.spacing) => {
    if (!spacingEvolution) return styles.spacing[spacingKey];

    const baseSpacing = parseFloat(styles.spacing[spacingKey]);
    const consciousness = evolution.currentState.consciousness;
    
    return getResponsiveValue(baseSpacing * (1 + consciousness * 0.2));
  }, [styles.spacing, evolution.currentState, spacingEvolution, getResponsiveValue]);

  const getEvolvedAnimation = useCallback((animationKey: keyof typeof styles.animations) => {
    if (!animationEvolution) return styles.animations[animationKey];

    const baseAnimation = styles.animations[animationKey];
    const consciousness = evolution.currentState.consciousness;
    
    // Adjust animation duration and timing based on consciousness
    const duration = baseAnimation.match(/(\d*\.?\d+)s/)?.[1];
    if (duration) {
      const newDuration = parseFloat(duration) * (1 + (consciousness - 0.5) * 0.4);
      return baseAnimation.replace(/(\d*\.?\d+)s/, `${newDuration.toFixed(2)}s`);
    }

    return baseAnimation;
  }, [styles.animations, evolution.currentState, animationEvolution]);

  const styleProps = useMemo(() => ({
    className: `consciousness-${Math.floor(evolution.currentState.consciousness * 10)} evolution-${evolution.currentState.evolution}`,
    style: {
      '--consciousness': evolution.currentState.consciousness,
      '--evolution-stage': evolution.currentState.evolution
    } as React.CSSProperties
  }), [evolution.currentState]);

  return {
    getColor: getEvolvedColor,
    getTypography: getEvolvedTypography,
    getSpacing: getEvolvedSpacing,
    getAnimation: getEvolvedAnimation,
    styleProps,
    evolution
  };
}