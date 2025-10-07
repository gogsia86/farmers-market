'use client';

import { useState, useCallback, useEffect } from 'react';
import { EvolutionTrackingSystem, EvolutionSnapshot, GrowthPattern, EvolutionTrend } from '../lib/tracking/evolution-tracking';
import type { AgriculturalCycle } from '../lib/navigation/agricultural-types';
import type { AgriculturalKnowledge, StoryThread, ContentEvolution } from '../lib/content/agricultural-storytelling';
import type { CommunityMember, CommunityContribution } from '../lib/empathy/community-engagement';
import type { LivingDocument, DocumentRevision } from '../lib/content/living-documentation';

interface UseEvolutionTrackingProps {
  seasonalContext: AgriculturalCycle;
  communityConsciousness: number;
}

export function useEvolutionTracking({
  seasonalContext,
  communityConsciousness
}: UseEvolutionTrackingProps) {
  const [trackingSystem] = useState(() => 
    new EvolutionTrackingSystem(seasonalContext, communityConsciousness)
  );

  const [currentSnapshot, setCurrentSnapshot] = useState<EvolutionSnapshot | null>(null);
  const [growthPatterns, setGrowthPatterns] = useState<Map<string, GrowthPattern>>(new Map());
  const [evolutionTrends, setEvolutionTrends] = useState<Map<string, EvolutionTrend>>(new Map());

  const trackKnowledgeEvolution = useCallback(async (
    knowledge: AgriculturalKnowledge[],
    threads: StoryThread[],
    evolutions: ContentEvolution[]
  ) => {
    const snapshot = await trackingSystem.trackKnowledgeEvolution(
      knowledge,
      threads,
      evolutions
    );
    setCurrentSnapshot(snapshot);
    return snapshot;
  }, [trackingSystem]);

  const trackCommunityPatterns = useCallback(async (
    members: CommunityMember[],
    contributions: CommunityContribution[]
  ) => {
    const patterns = await trackingSystem.trackCommunityPatterns(
      members,
      contributions
    );
    setGrowthPatterns(patterns);
    return patterns;
  }, [trackingSystem]);

  const trackDocumentationEvolution = useCallback(async (
    documents: LivingDocument[],
    revisions: DocumentRevision[]
  ) => {
    const trends = await trackingSystem.trackDocumentationEvolution(
      documents,
      revisions
    );
    
    const trendsMap = new Map(trends.map(trend => [trend.id, trend]));
    setEvolutionTrends(trendsMap);
    
    return trends;
  }, [trackingSystem]);

  const getEvolutionInsights = useCallback((
    startDate: Date,
    endDate: Date
  ) => {
    return trackingSystem.getEvolutionInsights(startDate, endDate);
  }, [trackingSystem]);

  // Auto-track evolution based on seasonal changes
  useEffect(() => {
    const trackingInterval = setInterval(() => {
      // Note: This is a placeholder. In a real implementation,
      // you would need to pass actual data from your application state
      const mockData = {
        knowledge: [],
        threads: [],
        evolutions: [],
        members: [],
        contributions: [],
        documents: [],
        revisions: []
      };

      Promise.all([
        trackKnowledgeEvolution(
          mockData.knowledge,
          mockData.threads,
          mockData.evolutions
        ),
        trackCommunityPatterns(
          mockData.members,
          mockData.contributions
        ),
        trackDocumentationEvolution(
          mockData.documents,
          mockData.revisions
        )
      ]).catch(console.error);
    }, 1000 * 60 * 60); // Track evolution every hour

    return () => clearInterval(trackingInterval);
  }, [seasonalContext]);

  return {
    currentSnapshot,
    growthPatterns,
    evolutionTrends,
    trackKnowledgeEvolution,
    trackCommunityPatterns,
    trackDocumentationEvolution,
    getEvolutionInsights
  };
}