import { useEffect, useMemo } from 'react';
import { useAdaptation } from '../components/adaptation/context-adaptation-engine';
import { AdaptationType, AdaptationRule } from '../types/adaptation';

export const useContextualAdaptation = (
  componentId: string,
  adaptationTypes: AdaptationType[]
) => {
  const { state, applyAdaptation, removeAdaptation, dispatch } = useAdaptation();

  const adaptationRules = useMemo(() => {
    const rules: AdaptationRule[] = [];

    if (adaptationTypes.includes('LAYOUT_SHIFT')) {
      rules.push({
        id: `${componentId}-layout`,
        condition: ({ environmentalContext, userState }) => 
          userState.consciousnessLevel > 7 || environmentalContext.deviceCapabilities.prefersDarkMode === true,
        apply: (state) => {
          // Apply quantum-aware layout modifications
          document.documentElement.style.setProperty(
            '--quantum-layout-shift',
            state.userState.consciousnessLevel > 7 ? '1' : '0'
          );
        }
      });
    }

    if (adaptationTypes.includes('COLOR_SCHEME')) {
      rules.push({
        id: `${componentId}-color`,
        condition: ({ environmentalContext }) => 
          environmentalContext.timeOfDay !== null &&
          (environmentalContext.timeOfDay < 6 || environmentalContext.timeOfDay > 18),
        apply: () => {
          document.documentElement.classList.add('dark-adaptation');
        }
      });
    }

    if (adaptationTypes.includes('INTERACTION_MODE')) {
      rules.push({
        id: `${componentId}-interaction`,
        condition: ({ userState }) => 
          userState.interactionPatterns.has('advanced-gestures'),
        apply: () => {
          document.documentElement.classList.add('enhanced-interactions');
        }
      });
    }

    if (adaptationTypes.includes('CONTENT_DENSITY')) {
      rules.push({
        id: `${componentId}-density`,
        condition: ({ environmentalContext }) => 
          environmentalContext.networkConditions === 'slow',
        apply: () => {
          document.documentElement.classList.add('low-density');
        }
      });
    }

    if (adaptationTypes.includes('CONSCIOUSNESS_LEVEL')) {
      rules.push({
        id: `${componentId}-consciousness`,
        condition: ({ userState }) => 
          userState.quantumState === 'elevated',
        apply: () => {
          document.documentElement.classList.add('elevated-consciousness');
        }
      });
    }

    return rules;
  }, [componentId, adaptationTypes]);

  useEffect(() => {
    // Apply initial adaptations
    adaptationRules.forEach(rule => {
      if (rule.condition(state)) {
        applyAdaptation(rule);
      }
    });

    return () => {
      // Clean up adaptations on unmount
      adaptationRules.forEach(rule => {
        removeAdaptation(rule.id);
        document.documentElement.classList.remove(
          'dark-adaptation',
          'enhanced-interactions',
          'low-density',
          'elevated-consciousness'
        );
      });
    };
  }, [adaptationRules, state, applyAdaptation, removeAdaptation]);

  return {
    currentAdaptations: Array.from(state.activeAdaptations),
    environmentalContext: state.environmentalContext,
    userState: state.userState,
    dispatch
  };
};