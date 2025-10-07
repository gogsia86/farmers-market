import { renderHook, act } from '@testing-library/react';
import { useAgriculturalStorytelling } from './useAgriculturalStorytelling';
import type { AgriculturalCycle } from '../lib/navigation/agricultural-types';
import type { AgriculturalKnowledge } from '../lib/content/agricultural-storytelling';

describe('useAgriculturalStorytelling', () => {
  const mockSeasonalContext: AgriculturalCycle = {
    season: 'SPRING',
    phase: 'GROWTH',
    energyLevel: 0.8,
    moonPhase: 0.5
  };

  const mockKnowledge: Omit<AgriculturalKnowledge, 'id' | 'evolutionState' | 'createdAt' | 'lastEvolved'> = {
    title: 'Spring Planting Wisdom',
    content: 'The dance of seeds beneath spring soil...',
    medium: 'TEXT',
    seasonalContext: mockSeasonalContext,
    wisdomDepth: 'ROOT',
    energySignature: 0.7,
    consciousnessRequirement: 0.5,
    contributors: ['farmer_sage_1']
  };

  it('initializes with empty stories and events', () => {
    const { result } = renderHook(() => useAgriculturalStorytelling({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    expect(result.current.activeStories).toEqual([]);
    expect(result.current.evolutionEvents).toEqual([]);
  });

  it('plants a new story successfully', async () => {
    const { result } = renderHook(() => useAgriculturalStorytelling({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    await act(async () => {
      const thread = await result.current.plantNewStory(mockKnowledge);
      expect(thread).toBeDefined();
      expect(thread.rootKnowledge.evolutionState).toBe('SEED');
      expect(thread.seasonalRelevance).toContain('SPRING');
    });

    expect(result.current.activeStories).toHaveLength(1);
  });

  it('branches existing story with new knowledge', async () => {
    const { result } = renderHook(() => useAgriculturalStorytelling({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    let threadId: string;

    await act(async () => {
      const thread = await result.current.plantNewStory(mockKnowledge);
      threadId = thread.id;
    });

    await act(async () => {
      const branchKnowledge = {
        ...mockKnowledge,
        title: 'Advanced Spring Techniques',
        wisdomDepth: 'SOUL',
        consciousnessRequirement: 0.7
      };

      const branch = await result.current.branchStory(threadId!, branchKnowledge);
      expect(branch).toBeDefined();
      expect(branch?.title).toBe('Advanced Spring Techniques');
    });

    const story = result.current.activeStories[0];
    expect(story.branches).toHaveLength(1);
  });

  it('filters stories based on seasonal relevance', async () => {
    const { result, rerender } = renderHook(
      ({ seasonalContext }) => useAgriculturalStorytelling({
        seasonalContext,
        communityConsciousness: 0.8
      }),
      {
        initialProps: {
          seasonalContext: mockSeasonalContext
        }
      }
    );

    await act(async () => {
      await result.current.plantNewStory(mockKnowledge);
    });

    expect(result.current.activeStories).toHaveLength(1);

    // Change season to winter
    rerender({
      seasonalContext: {
        ...mockSeasonalContext,
        season: 'WINTER'
      }
    });

    // Story should not be active in winter
    expect(result.current.activeStories).toHaveLength(0);
  });
});