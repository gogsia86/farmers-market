import { renderHook, act } from '@testing-library/react';
import { useAgriculturalDocumentation } from './useAgriculturalDocumentation';
import type { AgriculturalCycle } from '../lib/navigation/agricultural-types';
import type { AgriculturalKnowledge } from '../lib/content/agricultural-storytelling';
import type { CommunityContribution } from '../lib/empathy/community-engagement';

describe('useAgriculturalDocumentation', () => {
  const mockSeasonalContext: AgriculturalCycle = {
    season: 'SPRING',
    phase: 'GROWTH',
    energyLevel: 0.8,
    moonPhase: 0.5
  };

  it('initializes with empty documents', () => {
    const { result } = renderHook(() => useAgriculturalDocumentation({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    expect(result.current.activeDocuments).toEqual([]);
    expect(result.current.documentHistory.size).toBe(0);
  });

  it('creates new living documents', async () => {
    const { result } = renderHook(() => useAgriculturalDocumentation({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    await act(async () => {
      const document = await result.current.createDocument(
        'Spring Planting Guide',
        'Essential wisdom for spring planting...',
        'GUIDE',
        'ROOT',
        ['farmer_1'],
        []
      );

      expect(document).toBeDefined();
      expect(document.title).toBe('Spring Planting Guide');
      expect(document.state).toBe('SEEDING');
      expect(document.evolution).toBe('STABLE');
    });

    expect(result.current.activeDocuments).toHaveLength(1);
  });

  it('evolves documents through states', async () => {
    const { result } = renderHook(() => useAgriculturalDocumentation({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    let documentId: string;

    await act(async () => {
      const document = await result.current.createDocument(
        'Seasonal Wisdom',
        'Initial wisdom...',
        'WISDOM',
        'ROOT',
        ['farmer_1'],
        []
      );
      documentId = document.id;
    });

    await act(async () => {
      const revision = await result.current.evolveDocument(
        documentId!,
        'Evolved wisdom with new insights...',
        'farmer_2',
        'New seasonal observations'
      );

      expect(revision).toBeDefined();
      expect(revision?.version).toBe(2);
    });

    const history = result.current.getDocumentHistory(documentId!);
    expect(history).toHaveLength(1);
  });

  it('integrates community knowledge', async () => {
    const { result } = renderHook(() => useAgriculturalDocumentation({
      seasonalContext: mockSeasonalContext,
      communityConsciousness: 0.8
    }));

    let documentId: string;

    await act(async () => {
      const document = await result.current.createDocument(
        'Community Wisdom',
        'Base wisdom...',
        'WISDOM',
        'SURFACE',
        ['farmer_1'],
        []
      );
      documentId = document.id;
    });

    const mockKnowledge: AgriculturalKnowledge = {
      id: 'knowledge_1',
      title: 'Spring Insights',
      content: 'Deep agricultural wisdom...',
      medium: 'TEXT',
      seasonalContext: mockSeasonalContext,
      evolutionState: 'GROWTH',
      wisdomDepth: 'ROOT',
      energySignature: 0.8,
      consciousnessRequirement: 0.6,
      contributors: ['farmer_2'],
      createdAt: new Date(),
      lastEvolved: new Date()
    };

    const mockContribution: CommunityContribution = {
      id: 'contribution_1',
      contributorId: 'farmer_2',
      threadId: 'thread_1',
      type: 'KNOWLEDGE',
      content: 'Valuable insights...',
      wisdomDepth: 'ROOT',
      seasonalContext: mockSeasonalContext,
      resonance: 0.7,
      verifications: [],
      createdAt: new Date()
    };

    await act(async () => {
      const success = await result.current.integrateKnowledge(
        documentId!,
        mockKnowledge,
        mockContribution
      );

      expect(success).toBe(true);
    });

    const activeDoc = result.current.activeDocuments.find(d => d.id === documentId);
    expect(activeDoc?.relatedKnowledge).toContain('knowledge_1');
    expect(activeDoc?.wisdomDepth).toBe('ROOT');
  });

  it('filters documents by seasonal relevance', async () => {
    const { result, rerender } = renderHook(
      ({ seasonalContext }) => useAgriculturalDocumentation({
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
      await result.current.createDocument(
        'Spring Guide',
        'Spring-specific content...',
        'GUIDE',
        'ROOT',
        ['farmer_1'],
        []
      );
    });

    expect(result.current.activeDocuments).toHaveLength(1);

    // Change season to winter
    rerender({
      seasonalContext: {
        ...mockSeasonalContext,
        season: 'WINTER'
      }
    });

    expect(result.current.activeDocuments).toHaveLength(0);
  });
});