import { useState, useCallback } from 'react';
import { ContentNode, WisdomArchive, ContentInventory, SeasonalContext } from '../lib/content/types';

export const useQuantumContent = (initialContext: SeasonalContext) => {
  const [inventory, setInventory] = useState<ContentInventory>({
    nodes: new Map(),
    wisdom: new Map(),
    relationships: new Map(),
    seasonalIndices: new Map(),
    quantumIndices: new Map()
  });
  
  const [seasonalContext, setSeasonalContext] = useState<SeasonalContext>(initialContext);

  const calculateQuantumMetrics = useCallback((node: ContentNode): ContentNode['quantumMetrics'] => {
    const baseResonance = Math.random(); // Replace with actual quantum calculation
    const seasonalAlignment = node.seasonalPatterns[seasonalContext.currentSeason]?.relevance || 0;
    const moonInfluence = node.metadata.moonPhase === seasonalContext.moonPhase ? 0.2 : 0;
    const elementalAlignment = calculateElementalAlignment(node);

    return {
      resonance: (baseResonance + seasonalAlignment + moonInfluence) / 3,
      alignment: elementalAlignment,
      impact: (baseResonance + elementalAlignment) / 2,
      wisdom: calculateWisdomLevel(node)
    };
  }, [seasonalContext]);

  const calculateElementalAlignment = useCallback((node: ContentNode): number => {
    const elements = node.biodynamicFactors.elementalForces;
    let alignment = 0;

    elements.forEach((element: string) => {
      const elementLevel = seasonalContext.elementalConditions[element.toLowerCase() as keyof typeof seasonalContext.elementalConditions];
      if (elementLevel) {
        alignment += elementLevel;
      }
    });

    return elements.length > 0 ? alignment / elements.length : 0;
  }, [seasonalContext]);

  const calculateWisdomLevel = useCallback((node: ContentNode): number => {
    const consciousness = node.consciousness.level;
    const practices = node.biodynamicFactors.preparations.length;
    const celestial = node.biodynamicFactors.celestialInfluences.length;
    
    return (consciousness + (practices / 10) + (celestial / 10)) / 3;
  }, []);

  const addContentNode = useCallback((node: Omit<ContentNode, 'id' | 'quantumMetrics'>): string => {
    const newNode: ContentNode = {
      ...node,
      id: crypto.randomUUID(),
      quantumMetrics: {
        resonance: 0,
        alignment: 0,
        impact: 0,
        wisdom: 0
      }
    };

    newNode.quantumMetrics = calculateQuantumMetrics(newNode);

    setInventory(prev => {
      const updated = { ...prev };
      updated.nodes.set(newNode.id, newNode);
      
      // Update seasonal indices
      node.metadata.season.forEach((season: string) => {
        const seasonSet = updated.seasonalIndices.get(season) || new Set();
        seasonSet.add(newNode.id);
        updated.seasonalIndices.set(season, seasonSet);
      });

      // Update quantum indices
      const quantumLevel = Math.floor(newNode.quantumMetrics.resonance * 10);
      const quantumSet = updated.quantumIndices.get(quantumLevel) || new Set();
      quantumSet.add(newNode.id);
      updated.quantumIndices.set(quantumLevel, quantumSet);

      return updated;
    });

    return newNode.id;
  }, [calculateQuantumMetrics]);

  const addWisdomArchive = useCallback((wisdom: Omit<WisdomArchive, 'id'>): string => {
    const newWisdom: WisdomArchive = {
      ...wisdom,
      id: crypto.randomUUID()
    };

    setInventory(prev => {
      const updated = { ...prev };
      updated.wisdom.set(newWisdom.id, newWisdom);
      return updated;
    });

    return newWisdom.id;
  }, []);

  const createRelationship = useCallback((sourceId: string, targetId: string): void => {
    setInventory(prev => {
      const updated = { ...prev };
      const relationships = updated.relationships.get(sourceId) || new Set();
      relationships.add(targetId);
      updated.relationships.set(sourceId, relationships);
      return updated;
    });
  }, []);

  const getSeasonalContent = useCallback((season: string): ContentNode[] => {
    const seasonalIds = inventory.seasonalIndices.get(season) || new Set();
    return Array.from(seasonalIds)
      .map(id => inventory.nodes.get(id))
      .filter((node): node is ContentNode => node !== undefined)
      .sort((a, b) => b.quantumMetrics.resonance - a.quantumMetrics.resonance);
  }, [inventory]);

  const getHighResonanceContent = useCallback((threshold: number = 0.7): ContentNode[] => {
    const highResonanceNodes: ContentNode[] = [];
    
    inventory.nodes.forEach((node: ContentNode) => {
      if (node.quantumMetrics.resonance >= threshold) {
        highResonanceNodes.push(node);
      }
    });

    return highResonanceNodes.sort((a, b) => b.quantumMetrics.wisdom - a.quantumMetrics.wisdom);
  }, [inventory]);

  const updateSeasonalContext = useCallback((newContext: Partial<SeasonalContext>): void => {
    setSeasonalContext((prev: SeasonalContext) => ({
      ...prev,
      ...newContext
    }));

    // Recalculate quantum metrics for all nodes
    setInventory(prev => {
      const updated = { ...prev };
      updated.nodes.forEach((node: ContentNode, id: string) => {
        const updatedNode = { ...node };
        updatedNode.quantumMetrics = calculateQuantumMetrics(updatedNode);
        updated.nodes.set(id, updatedNode);
      });
      return updated;
    });
  }, [calculateQuantumMetrics]);

  return {
    inventory,
    seasonalContext,
    addContentNode,
    addWisdomArchive,
    createRelationship,
    getSeasonalContent,
    getHighResonanceContent,
    updateSeasonalContext
  };
};