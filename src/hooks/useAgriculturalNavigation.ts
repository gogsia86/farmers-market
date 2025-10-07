'use client';

import { useState, useCallback, useEffect } from 'react';
import { AgriculturalPathfinder } from '../lib/navigation/agricultural-pathfinder';
import { SeasonalFlowManager } from '../lib/navigation/seasonal-flow';
import type { 
  AgriculturalNode, 
  PathfindingCriteria,
  NavigationState,
  PathOptimizationStrategy,
  AgriculturalCycle
} from '../lib/navigation/agricultural-types';

interface UseAgriculturalNavigationProps {
  initialNodes: Map<string, AgriculturalNode>;
  initialConsciousness?: number;
  preferredStrategy?: PathOptimizationStrategy;
  accessibilityLevel?: 'BASE' | 'ENHANCED' | 'DIVINE';
}

interface AccessibilityConfig {
  level: 'BASE' | 'ENHANCED' | 'DIVINE';
  features: {
    audioFeedback: boolean;
    visualEnhancement: boolean;
    consciousnessAssist: boolean;
    seasonalGuidance: boolean;
  };
}

export function useAgriculturalNavigation({
  initialNodes,
  initialConsciousness = 1,
  preferredStrategy = 'BALANCED',
  accessibilityLevel = 'ENHANCED'
}: UseAgriculturalNavigationProps) {
  const [pathfinder] = useState(() => new AgriculturalPathfinder(initialNodes));
  const [flowManager] = useState(() => new SeasonalFlowManager(initialNodes));
  const [currentState, setCurrentState] = useState<NavigationState>({
    currentNode: '',
    currentPath: [],
    availablePaths: [],
    seasonalAlignment: 1,
    consciousness: initialConsciousness
  });
  const [accessibility] = useState<AccessibilityConfig>(() => ({
    level: accessibilityLevel,
    features: {
      audioFeedback: accessibilityLevel !== 'BASE',
      visualEnhancement: accessibilityLevel !== 'BASE',
      consciousnessAssist: accessibilityLevel === 'DIVINE',
      seasonalGuidance: accessibilityLevel !== 'BASE'
    }
  }));

  // Update cycle and state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      flowManager.updateCycle();
      updateNavigationState();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const updateNavigationState = useCallback(() => {
    const cycle = flowManager.getCurrentCycle();
    const state = pathfinder.getCurrentState();

    setCurrentState((prev: NavigationState) => ({
      ...prev,
      seasonalAlignment: calculateSeasonalAlignment(cycle, state),
      consciousness: calculateConsciousnessLevel(cycle, state, accessibility)
    }));
  }, []);

  const navigateTo = useCallback(async (
    targetNode: string,
    options: {
      strategy?: PathOptimizationStrategy;
      forceSeason?: AgriculturalCycle['season'];
    } = {}
  ) => {
    const cycle = flowManager.getCurrentCycle();
    const criteria: PathfindingCriteria = {
      currentSeason: cycle.season,
      targetSeason: options.forceSeason || cycle.season,
      energyLevel: cycle.energyLevel,
      consciousness: currentState.consciousness,
      preferredPhase: cycle.phase
    };

    const paths = pathfinder.findPath(
      currentState.currentNode,
      targetNode,
      criteria,
      options.strategy || preferredStrategy
    );

    if (paths.length > 0) {
      const optimalPath = paths[0];
      pathfinder.updateState({
        currentNode: targetNode,
        currentPath: optimalPath.nodes,
        availablePaths: paths
      });

      // Apply accessibility enhancements
      if (accessibility.features.audioFeedback) {
        announceNavigation(optimalPath);
      }
      if (accessibility.features.visualEnhancement) {
        highlightPath(optimalPath);
      }
      if (accessibility.features.seasonalGuidance) {
        provideSeasonalContext(cycle, optimalPath);
      }

      updateNavigationState();
      return optimalPath;
    }

    return null;
  }, [currentState, preferredStrategy, accessibility]);

  const getAccessibleDescription = useCallback((
    node: AgriculturalNode,
    cycle: AgriculturalCycle
  ): string => {
    const seasonMatch = node.season === cycle.season ? 
      'current season' : 
      `${node.season.toLowerCase()} season`;
    
    const energyDesc = node.energyRequirement > cycle.energyLevel ?
      'high energy requirement' :
      'accessible energy level';

    return `${node.phase} phase, ${seasonMatch}, ${energyDesc}`;
  }, []);

  // Private helper functions
  const calculateSeasonalAlignment = (
    cycle: AgriculturalCycle,
    state: NavigationState
  ): number => {
    if (state.currentPath.length === 0) return 1;

    const seasonalNodes = flowManager.getNodesForSeason(cycle.season);
    const alignedNodes = state.currentPath.filter(id => seasonalNodes.has(id));

    return alignedNodes.length / state.currentPath.length;
  };

  const calculateConsciousnessLevel = (
    cycle: AgriculturalCycle,
    state: NavigationState,
    config: AccessibilityConfig
  ): number => {
    let base = state.consciousness;

    // Apply consciousness assist if enabled
    if (config.features.consciousnessAssist) {
      base *= 1.2; // 20% boost
    }

    // Seasonal modifier
    const seasonalModifier = cycle.energyLevel;
    
    // Moon phase influence
    const moonInfluence = Math.sin(cycle.moonPhase * Math.PI) * 0.1;

    return Math.min(1, base * seasonalModifier + moonInfluence);
  };

  const announceNavigation = (path: { nodes: string[]; energyCost: number }) => {
    const cycle = flowManager.getCurrentCycle();
    const node = initialNodes.get(path.nodes[0]);
    if (!node) return;

    const description = getAccessibleDescription(node, cycle);
    // Integration point for screen readers or audio feedback
    console.log(`Navigating to ${description}. Energy cost: ${path.energyCost.toFixed(2)}`);
  };

  const highlightPath = (path: { nodes: string[] }) => {
    // Integration point for visual accessibility enhancements
    document.querySelectorAll('[data-agricultural-node]').forEach(element => {
      element.classList.remove('agricultural-path-active');
    });

    path.nodes.forEach(nodeId => {
      const element = document.querySelector(`[data-agricultural-node="${nodeId}"]`);
      if (element) {
        element.classList.add('agricultural-path-active');
      }
    });
  };

  const provideSeasonalContext = (
    cycle: AgriculturalCycle,
    path: { nodes: string[] }
  ) => {
    const seasonalTransitions = path.nodes
      .map(id => initialNodes.get(id))
      .filter((node): node is AgriculturalNode => !!node)
      .filter((node, i, arr) => 
        i === 0 || node.season !== arr[i - 1]?.season
      );

    if (seasonalTransitions.length > 1) {
      // Integration point for seasonal guidance
      console.log(
        `This path transitions through ${seasonalTransitions.map(n => n.season).join(' → ')}`
      );
    }
  };

  return {
    currentState,
    navigateTo,
    getCurrentCycle: flowManager.getCurrentCycle,
    getAccessibleDescription
  };
}