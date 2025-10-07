'use client';

import { useState, useCallback, useEffect } from 'react';
import { CommunityEngagementSystem, CommunityMember, CommunityContribution, CommunityRole, ContributionType, CollectiveWisdom } from '../lib/empathy/community-engagement';
import type { AgriculturalCycle } from '../lib/navigation/agricultural-types';
import type { WisdomDepth } from '../lib/content/agricultural-storytelling';

interface UseAgriculturalCommunityProps {
  seasonalContext: AgriculturalCycle;
  communityConsciousness: number;
}

export function useAgriculturalCommunity({
  seasonalContext,
  communityConsciousness
}: UseAgriculturalCommunityProps) {
  const [engagementSystem] = useState(() => 
    new CommunityEngagementSystem(seasonalContext, communityConsciousness)
  );

  const [activeMembers, setActiveMembers] = useState<CommunityMember[]>([]);
  const [threadWisdom, setThreadWisdom] = useState<Map<string, CollectiveWisdom>>(new Map());

  // Update active members based on seasonal changes
  useEffect(() => {
    const members = engagementSystem.getSeasonalContributors();
    setActiveMembers(members);
  }, [seasonalContext.season]);

  const registerMember = useCallback(async (
    role: CommunityRole,
    initialConsciousness: number,
    seasonalAffinity: AgriculturalCycle['season'][]
  ) => {
    const member = await engagementSystem.registerMember(
      role,
      initialConsciousness,
      seasonalAffinity
    );
    setActiveMembers(engagementSystem.getSeasonalContributors());
    return member;
  }, [engagementSystem]);

  const contributeWisdom = useCallback(async (
    memberId: string,
    threadId: string,
    content: string,
    type: ContributionType,
    wisdomDepth: WisdomDepth
  ) => {
    const contribution = await engagementSystem.contributeWisdom(
      memberId,
      threadId,
      {
        type,
        content,
        wisdomDepth,
        seasonalContext,
        resonance: 0.5 // Initial resonance
      }
    );

    if (contribution) {
      const wisdom = engagementSystem.getThreadInsights(threadId);
      if (wisdom) {
        setThreadWisdom(prev => new Map(prev).set(threadId, wisdom));
      }
    }

    return contribution;
  }, [engagementSystem, seasonalContext]);

  const verifyContribution = useCallback(async (
    contributionId: string,
    verifierId: string
  ) => {
    const success = await engagementSystem.verifyContribution(
      contributionId,
      verifierId
    );

    if (success) {
      setActiveMembers(engagementSystem.getSeasonalContributors());
    }

    return success;
  }, [engagementSystem]);

  const getThreadInsights = useCallback((threadId: string) => {
    return engagementSystem.getThreadInsights(threadId);
  }, [engagementSystem]);

  return {
    activeMembers,
    threadWisdom,
    registerMember,
    contributeWisdom,
    verifyContribution,
    getThreadInsights
  };
}