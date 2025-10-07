import { useState, useCallback, useEffect } from 'react';
import { useAgriculturalEmpathy } from './useAgriculturalEmpathy';
import { useQuantumGrid } from './useQuantumGrid';
import type { NavigationFlow, NavigationNode, OrganicPattern } from '../lib/navigation/types';

export const useOrganicNavigation = (initialPattern?: OrganicPattern) => {
  const { getSeasonalPatterns, calculateResonance } = useAgriculturalEmpathy();
  const { grid, viewport } = useQuantumGrid({
    baseUnit: 8,
    maxColumns: 12,
    maxRows: 1,
    gap: 4
  });

  const [navigationFlow, setNavigationFlow] = useState<NavigationFlow>({
    nodes: new Map(),
    currentPath: [],
    quantumState: {
      resonance: 0,
      harmony: 0,
      consciousness: 0
    }
  });

  const calculateOrganicFlow = useCallback((nodes: Map<string, NavigationNode>) => {
    const seasonalPatterns = getSeasonalPatterns(getCurrentSeason());
    let totalResonance = 0;
    let totalHarmony = 0;

    nodes.forEach((node) => {
      const nodeResonance = calculateResonance({
        type: node.type,
        season: getCurrentSeason(),
        pattern: seasonalPatterns[0] // Use most relevant pattern
      });

      node.quantumState = {
        resonance: nodeResonance,
        harmony: grid.harmony.balance * nodeResonance,
        consciousness: viewport.breakpoint.consciousness
      };

      totalResonance += nodeResonance;
      totalHarmony += node.quantumState.harmony;
    });

    return {
      resonance: totalResonance / nodes.size,
      harmony: totalHarmony / nodes.size,
      consciousness: viewport.breakpoint.consciousness
    };
  }, [calculateResonance, getSeasonalPatterns, grid.harmony.balance, viewport.breakpoint.consciousness]);

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'SPRING';
    if (month >= 5 && month <= 7) return 'SUMMER';
    if (month >= 8 && month <= 10) return 'FALL';
    return 'WINTER';
  };

  const addNavigationNode = useCallback((
    id: string,
    node: Omit<NavigationNode, 'quantumState'>
  ) => {
    setNavigationFlow((prev) => {
      const newNodes = new Map(prev.nodes);
      newNodes.set(id, {
        ...node,
        quantumState: {
          resonance: 0,
          harmony: 0,
          consciousness: 0
        }
      });

      const quantumState = calculateOrganicFlow(newNodes);

      return {
        ...prev,
        nodes: newNodes,
        quantumState
      };
    });
  }, [calculateOrganicFlow]);

  const updateNavigationPath = useCallback((path: string[]) => {
    setNavigationFlow((prev) => ({
      ...prev,
      currentPath: path,
      quantumState: calculateOrganicFlow(prev.nodes)
    }));
  }, [calculateOrganicFlow]);

  const getNavigationStyles = useCallback((nodeId: string) => {
    const node = navigationFlow.nodes.get(nodeId);
    if (!node) return {};

    return {
      '--nav-resonance': node.quantumState.resonance,
      '--nav-harmony': node.quantumState.harmony,
      '--nav-consciousness': node.quantumState.consciousness,
      '--nav-flow': navigationFlow.currentPath.includes(nodeId) ? 1 : 0.5
    };
  }, [navigationFlow]);

  useEffect(() => {
    if (initialPattern) {
      // Initialize with provided pattern
      initialPattern.nodes.forEach((node, id) => {
        addNavigationNode(id, node);
      });
      updateNavigationPath(initialPattern.initialPath || []);
    }
  }, [initialPattern, addNavigationNode, updateNavigationPath]);

  return {
    navigationFlow,
    addNavigationNode,
    updateNavigationPath,
    getNavigationStyles
  };
};