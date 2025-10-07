import { renderHook, act } from '@testing-library/react-hooks';
import { useQuantumContent } from './useQuantumContent';
import { SeasonalContext, ContentNode, WisdomArchive } from '../lib/content/types';

describe('useQuantumContent', () => {
  const mockInitialContext: SeasonalContext = {
    currentSeason: 'Spring',
    moonPhase: 'Full',
    celestialEvents: ['Equinox'],
    elementalConditions: {
      earth: 0.8,
      water: 0.7,
      air: 0.6,
      fire: 0.5,
      aether: 0.9
    }
  };

  const mockContentNode: Omit<ContentNode, 'id' | 'quantumMetrics'> = {
    type: 'Wisdom',
    title: 'Biodynamic Farming Principles',
    content: 'Understanding natural cycles...',
    metadata: {
      author: 'Wise Farmer',
      createdAt: '2025-10-05',
      updatedAt: '2025-10-05',
      season: ['Spring', 'Summer'],
      crops: ['Tomatoes', 'Herbs'],
      moonPhase: 'Full'
    },
    relationships: {
      parents: [],
      children: [],
      related: []
    },
    consciousness: {
      level: 0.8,
      intention: 'Harmony',
      manifestation: ['Growth', 'Balance']
    },
    biodynamicFactors: {
      preparations: ['BD500', 'BD501'],
      celestialInfluences: ['Moon', 'Venus'],
      elementalForces: ['Earth', 'Water']
    },
    seasonalPatterns: {
      spring: {
        relevance: 0.9,
        practices: ['Planting', 'Preparation'],
        insights: ['Growth Patterns']
      },
      summer: {
        relevance: 0.8,
        practices: ['Maintenance'],
        insights: ['Energy Flow']
      }
    }
  };

  const mockWisdomArchive: Omit<WisdomArchive, 'id'> = {
    category: 'Biodynamic',
    practices: [{
      name: 'Horn Manure',
      description: 'BD500 preparation...',
      season: ['Autumn'],
      elements: ['Earth'],
      consciousness: 0.9
    }],
    principles: [{
      name: 'Cosmic Rhythm',
      description: 'Following celestial cycles...',
      application: ['Planting', 'Harvesting'],
      resonance: 0.85
    }],
    cycles: [{
      name: 'Moon Cycle',
      duration: '29.5 days',
      phases: ['New', 'Full'],
      influence: 0.7
    }]
  };

  it('should initialize with seasonal context', () => {
    const { result } = renderHook(() => useQuantumContent(mockInitialContext));
    
    expect(result.current.seasonalContext).toEqual(mockInitialContext);
    expect(result.current.inventory.nodes.size).toBe(0);
  });

  it('should add content node with quantum metrics', () => {
    const { result } = renderHook(() => useQuantumContent(mockInitialContext));

    let nodeId: string;
    act(() => {
      nodeId = result.current.addContentNode(mockContentNode);
    });

    const node = result.current.inventory.nodes.get(nodeId!);
    expect(node).toBeDefined();
    expect(node!.quantumMetrics).toBeDefined();
    expect(node!.quantumMetrics.resonance).toBeGreaterThan(0);
  });

  it('should add wisdom archive', () => {
    const { result } = renderHook(() => useQuantumContent(mockInitialContext));

    let archiveId: string = '';
    act(() => {
      archiveId = result.current.addWisdomArchive(mockWisdomArchive);
    });

    const archive = result.current.inventory.wisdom.get(archiveId);
    expect(archive).toBeDefined();
    expect(archive!.practices[0].consciousness).toBe(0.9);
  });

  it('should create relationships between nodes', () => {
    const { result } = renderHook(() => useQuantumContent(mockInitialContext));

    let nodeId1: string = '';
    let nodeId2: string = '';
    act(() => {
      nodeId1 = result.current.addContentNode(mockContentNode);
      nodeId2 = result.current.addContentNode(mockContentNode);
      result.current.createRelationship(nodeId1, nodeId2);
    });

    const relationships = result.current.inventory.relationships.get(nodeId1);
    expect(relationships).toBeDefined();
    expect(relationships!.has(nodeId2)).toBe(true);
  });

  it('should get seasonal content', () => {
    const { result } = renderHook(() => useQuantumContent(mockInitialContext));

    act(() => {
      result.current.addContentNode(mockContentNode);
    });

    const springContent = result.current.getSeasonalContent('Spring');
    expect(springContent.length).toBe(1);
    expect(springContent[0].seasonalPatterns.spring.relevance).toBe(0.9);
  });

  it('should get high resonance content', () => {
    const { result } = renderHook(() => useQuantumContent(mockInitialContext));

    act(() => {
      result.current.addContentNode(mockContentNode);
    });

    const highResonanceContent = result.current.getHighResonanceContent(0.5);
    expect(highResonanceContent.length).toBeGreaterThan(0);
  });

  it('should update seasonal context and recalculate metrics', () => {
    const { result } = renderHook(() => useQuantumContent(mockInitialContext));

    let nodeId: string;
    act(() => {
      nodeId = result.current.addContentNode(mockContentNode);
    });

    const initialMetrics = result.current.inventory.nodes.get(nodeId)!.quantumMetrics;

    act(() => {
      result.current.updateSeasonalContext({
        currentSeason: 'Summer',
        moonPhase: 'New'
      });
    });

    const updatedMetrics = result.current.inventory.nodes.get(nodeId)!.quantumMetrics;
    expect(updatedMetrics).not.toEqual(initialMetrics);
  });
});