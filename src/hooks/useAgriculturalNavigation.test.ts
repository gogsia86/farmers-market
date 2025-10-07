import { renderHook, act } from '@testing-library/react';
import { useAgriculturalNavigation } from './useAgriculturalNavigation';
import type { 
  AgriculturalNode,
  AgriculturalCycle 
} from '../lib/navigation/agricultural-types';

describe('useAgriculturalNavigation', () => {
  const mockNodes = new Map<string, AgriculturalNode>([
    ['field1', {
      id: 'field1',
      season: 'SPRING',
      phase: 'GROWTH',
      energyRequirement: 0.5,
      path: '/fields/spring/field1',
      consciousnessThreshold: 0.3,
      nextNodes: ['field2'],
      previousNodes: []
    }],
    ['field2', {
      id: 'field2',
      season: 'SUMMER',
      phase: 'HARVEST',
      energyRequirement: 0.8,
      path: '/fields/summer/field2',
      consciousnessThreshold: 0.6,
      nextNodes: [],
      previousNodes: ['field1']
    }]
  ]);

  it('initializes with default values', () => {
    const { result } = renderHook(() => useAgriculturalNavigation({
      initialNodes: mockNodes
    }));

    expect(result.current.currentState).toEqual({
      currentNode: '',
      currentPath: [],
      availablePaths: [],
      seasonalAlignment: 1,
      consciousness: 1
    });
  });

  it('updates navigation state with seasonal alignment', () => {
    const { result } = renderHook(() => useAgriculturalNavigation({
      initialNodes: mockNodes,
      initialConsciousness: 0.8
    }));

    const currentCycle = result.current.getCurrentCycle();
    expect(currentCycle).toBeDefined();
    expect(currentCycle.season).toBeDefined();
  });

  it('provides accessible descriptions', () => {
    const { result } = renderHook(() => useAgriculturalNavigation({
      initialNodes: mockNodes,
      accessibilityLevel: 'ENHANCED'
    }));

    const mockCycle: AgriculturalCycle = {
      season: 'SPRING',
      phase: 'GROWTH',
      energyLevel: 0.7,
      moonPhase: 0.5
    };

    const description = result.current.getAccessibleDescription(
      mockNodes.get('field1')!,
      mockCycle
    );

    expect(description).toContain('GROWTH phase');
    expect(description).toContain('current season');
    expect(description).toContain('accessible energy level');
  });

  it('navigates to target node with accessibility features', async () => {
    const { result } = renderHook(() => useAgriculturalNavigation({
      initialNodes: mockNodes,
      accessibilityLevel: 'DIVINE'
    }));

    const consoleSpy = jest.spyOn(console, 'log');
    
    await act(async () => {
      await result.current.navigateTo('field2', {
        strategy: 'BALANCED'
      });
    });

    // Should trigger accessibility announcements
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('handles consciousness-assisted navigation', async () => {
    const { result } = renderHook(() => useAgriculturalNavigation({
      initialNodes: mockNodes,
      initialConsciousness: 0.5,
      accessibilityLevel: 'DIVINE'
    }));

    await act(async () => {
      await result.current.navigateTo('field2');
    });

    // Divine level should boost consciousness
    expect(result.current.currentState.consciousness).toBeGreaterThan(0.5);
  });
});