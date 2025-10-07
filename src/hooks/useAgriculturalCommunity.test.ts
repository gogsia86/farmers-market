import { renderHook, act } from '@testing-library/react';
import { useAgriculturalCommunity } from './useAgriculturalCommunity';
import type { AgriculturalCycle } from '../lib/navigation/agricultural-types';

describe('useAgriculturalCommunity', () => {
  const mockSeasonalContext: AgriculturalCycle = {
    season: 'SPRING',
    phase: 'GROWTH',
    energyLevel: 0.8,
    moonPhase: 0.5
  };

  it('initializes with empty members and wisdom', () => {
    const { result } = renderHook(() => useAgriculturalCommunity({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    expect(result.current.activeMembers).toEqual([]);
    expect(result.current.threadWisdom.size).toBe(0);
  });

  it('registers new community members', async () => {
    const { result } = renderHook(() => useAgriculturalCommunity({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    await act(async () => {
      const member = await result.current.registerMember(
        'WISDOM_KEEPER',
        0.7,
        ['SPRING', 'SUMMER']
      );

      expect(member).toBeDefined();
      expect(member.role).toBe('WISDOM_KEEPER');
      expect(member.seasonalAffinity).toContain('SPRING');
    });

    expect(result.current.activeMembers).toHaveLength(1);
  });

  it('allows members to contribute wisdom', async () => {
    const { result } = renderHook(() => useAgriculturalCommunity({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    let memberId: string;

    await act(async () => {
      const member = await result.current.registerMember(
        'EARTH_GUARDIAN',
        0.8,
        ['SPRING']
      );
      memberId = member.id;
    });

    await act(async () => {
      const contribution = await result.current.contributeWisdom(
        memberId!,
        'thread_1',
        'Ancient wisdom about spring planting...',
        'KNOWLEDGE',
        'ROOT'
      );

      expect(contribution).toBeDefined();
      expect(contribution?.type).toBe('KNOWLEDGE');
      expect(contribution?.wisdomDepth).toBe('ROOT');
    });

    const insights = result.current.getThreadInsights('thread_1');
    expect(insights).toBeDefined();
    expect(insights?.contributors).toContain(memberId);
  });

  it('supports contribution verification', async () => {
    const { result } = renderHook(() => useAgriculturalCommunity({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    let memberId1: string;
    let memberId2: string;
    let contributionId: string;

    await act(async () => {
      const member1 = await result.current.registerMember(
        'WISDOM_KEEPER',
        0.7,
        ['SPRING']
      );
      memberId1 = member1.id;

      const member2 = await result.current.registerMember(
        'SEED_SOWER',
        0.6,
        ['SPRING']
      );
      memberId2 = member2.id;
    });

    await act(async () => {
      const contribution = await result.current.contributeWisdom(
        memberId1!,
        'thread_1',
        'Wisdom to be verified...',
        'INSIGHT',
        'SOUL'
      );
      contributionId = contribution!.id;
    });

    await act(async () => {
      const success = await result.current.verifyContribution(
        contributionId!,
        memberId2!
      );
      expect(success).toBe(true);
    });

    const insights = result.current.getThreadInsights('thread_1');
    expect(insights?.resonanceField).toBeGreaterThan(0);
  });

  it('filters members by seasonal affinity', async () => {
    const { result, rerender } = renderHook(
      ({ seasonalContext }) => useAgriculturalCommunity({
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
      await result.current.registerMember(
        'HARVEST_ELDER',
        0.9,
        ['SPRING']
      );
    });

    expect(result.current.activeMembers).toHaveLength(1);

    // Change season to winter
    rerender({
      seasonalContext: {
        ...mockSeasonalContext,
        season: 'WINTER'
      }
    });

    expect(result.current.activeMembers).toHaveLength(0);
  });
});