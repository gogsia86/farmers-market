import { renderHook, act } from '@testing-library/react';
import { useEvolutionTracking } from './useEvolutionTracking';
import type { AgriculturalCycle } from '../lib/navigation/agricultural-types';
import type { AgriculturalKnowledge } from '../lib/content/agricultural-storytelling';
import type { CommunityMember, CommunityContribution } from '../lib/empathy/community-engagement';
import type { LivingDocument } from '../lib/content/living-documentation';

describe('useEvolutionTracking', () => {
  const mockSeasonalContext: AgriculturalCycle = {
    season: 'SPRING',
    phase: 'GROWTH',
    energyLevel: 0.8,
    moonPhase: 0.5
  };

  const mockKnowledge: AgriculturalKnowledge = {
    id: 'knowledge_1',
    title: 'Spring Wisdom',
    content: 'Deep farming insights...',
    medium: 'TEXT',
    seasonalContext: mockSeasonalContext,
    evolutionState: 'GROWTH',
    wisdomDepth: 'ROOT',
    energySignature: 0.7,
    consciousnessRequirement: 0.6,
    contributors: ['farmer_1'],
    createdAt: new Date(),
    lastEvolved: new Date()
  };

  const mockMember: CommunityMember = {
    id: 'member_1',
    role: 'WISDOM_KEEPER',
    consciousnessLevel: 0.7,
    seasonalAffinity: ['SPRING'],
    contributionCount: 5,
    wisdomScore: 0.8,
    resonancePatterns: ['HARMONY'],
    activeThreads: ['thread_1'],
    joinedAt: new Date()
  };

  const mockContribution: CommunityContribution = {
    id: 'contribution_1',
    contributorId: 'member_1',
    threadId: 'thread_1',
    type: 'KNOWLEDGE',
    content: 'Valuable insights...',
    wisdomDepth: 'ROOT',
    seasonalContext: mockSeasonalContext,
    resonance: 0.7,
    verifications: [],
    createdAt: new Date()
  };

  const mockDocument: LivingDocument = {
    id: 'doc_1',
    title: 'Spring Planting Guide',
    content: 'Comprehensive guide...',
    type: 'GUIDE',
    state: 'GROWING',
    evolution: 'EVOLVING',
    seasonalContext: mockSeasonalContext,
    contributors: ['member_1'],
    wisdomDepth: 'ROOT',
    resonanceScore: 0.8,
    version: 1,
    revisions: [],
    relatedKnowledge: ['knowledge_1'],
    createdAt: new Date(),
    lastEvolved: new Date()
  };

  it('initializes with empty evolution data', () => {
    const { result } = renderHook(() => useEvolutionTracking({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    expect(result.current.currentSnapshot).toBeNull();
    expect(result.current.growthPatterns.size).toBe(0);
    expect(result.current.evolutionTrends.size).toBe(0);
  });

  it('tracks knowledge evolution', async () => {
    const { result } = renderHook(() => useEvolutionTracking({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    await act(async () => {
      const snapshot = await result.current.trackKnowledgeEvolution(
        [mockKnowledge],
        [], // threads
        []  // evolutions
      );

      expect(snapshot).toBeDefined();
      expect(snapshot.metrics.contentGrowth).toBeGreaterThan(0);
    });

    expect(result.current.currentSnapshot).toBeDefined();
  });

  it('tracks community patterns', async () => {
    const { result } = renderHook(() => useEvolutionTracking({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    await act(async () => {
      const patterns = await result.current.trackCommunityPatterns(
        [mockMember],
        [mockContribution]
      );

      expect(patterns.size).toBeGreaterThan(0);
      const contributionPattern = patterns.get('contributions');
      expect(contributionPattern).toBeDefined();
      if (contributionPattern) {
        expect(contributionPattern.strength).toBeGreaterThan(0);
      }
    });
  });

  it('tracks documentation evolution', async () => {
    const { result } = renderHook(() => useEvolutionTracking({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    await act(async () => {
      const trends = await result.current.trackDocumentationEvolution(
        [mockDocument],
        [] // revisions
      );

      expect(trends.length).toBeGreaterThan(0);
      const evolutionTrend = trends[0];
      expect(evolutionTrend.confidence).toBeGreaterThan(0);
    });

    expect(result.current.evolutionTrends.size).toBeGreaterThan(0);
  });

  it('provides evolution insights', async () => {
    const { result } = renderHook(() => useEvolutionTracking({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    // First, create some evolution data
    await act(async () => {
      await result.current.trackKnowledgeEvolution([mockKnowledge], [], []);
      await result.current.trackCommunityPatterns([mockMember], [mockContribution]);
      await result.current.trackDocumentationEvolution([mockDocument], []);
    });

    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const endDate = new Date();

    const insights = result.current.getEvolutionInsights(startDate, endDate);
    
    expect(insights).toBeDefined();
    expect(insights.snapshots).toBeDefined();
    expect(insights.patterns).toBeDefined();
    expect(insights.trends).toBeDefined();
  });
});