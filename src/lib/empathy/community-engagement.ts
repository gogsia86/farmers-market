/**
 * Community Engagement System
 * A quantum-aware platform for collective agricultural wisdom
 */

import { AgriculturalKnowledge, StoryThread, WisdomDepth } from '../content/agricultural-storytelling';
import type { AgriculturalCycle } from '../navigation/agricultural-types';

export type CommunityRole = 'SEED_SOWER' | 'WISDOM_KEEPER' | 'EARTH_GUARDIAN' | 'HARVEST_ELDER';
export type ContributionType = 'KNOWLEDGE' | 'EXPERIENCE' | 'INSIGHT' | 'QUESTION' | 'VALIDATION';
export type ResonanceType = 'HARMONY' | 'GROWTH' | 'WISDOM' | 'INNOVATION';

export interface CommunityMember {
  id: string;
  role: CommunityRole;
  consciousnessLevel: number;
  seasonalAffinity: AgriculturalCycle['season'][];
  contributionCount: number;
  wisdomScore: number;
  resonancePatterns: ResonanceType[];
  activeThreads: string[];
  joinedAt: Date;
}

export interface CommunityContribution {
  id: string;
  contributorId: string;
  threadId: string;
  type: ContributionType;
  content: string;
  wisdomDepth: WisdomDepth;
  seasonalContext: AgriculturalCycle;
  resonance: number;
  verifications: string[];
  createdAt: Date;
}

export interface CollectiveWisdom {
  threadId: string;
  contributors: string[];
  wisdomMatrix: Map<string, number>;
  seasonalStrength: Map<AgriculturalCycle['season'], number>;
  resonanceField: number;
  lastHarvested: Date;
}

export class CommunityEngagementSystem {
  private members: Map<string, CommunityMember> = new Map();
  private contributions: Map<string, CommunityContribution> = new Map();
  private collectiveWisdom: Map<string, CollectiveWisdom> = new Map();

  constructor(
    private readonly seasonalContext: AgriculturalCycle,
    private readonly communityConsciousness: number
  ) {}

  /**
   * Register a new community member
   */
  async registerMember(
    role: CommunityRole,
    initialConsciousness: number,
    seasonalAffinity: AgriculturalCycle['season'][]
  ): Promise<CommunityMember> {
    const member: CommunityMember = {
      id: this.generateQuantumId(),
      role,
      consciousnessLevel: initialConsciousness,
      seasonalAffinity,
      contributionCount: 0,
      wisdomScore: 0,
      resonancePatterns: [],
      activeThreads: [],
      joinedAt: new Date()
    };

    this.members.set(member.id, member);
    return member;
  }

  /**
   * Submit a new contribution to the collective wisdom
   */
  async contributeWisdom(
    memberId: string,
    threadId: string,
    contribution: Omit<CommunityContribution, 'id' | 'contributorId' | 'createdAt' | 'verifications'>
  ): Promise<CommunityContribution | null> {
    const member = this.members.get(memberId);
    if (!member) return null;

    const newContribution: CommunityContribution = {
      id: this.generateQuantumId(),
      contributorId: memberId,
      threadId,
      ...contribution,
      verifications: [],
      createdAt: new Date()
    };

    this.contributions.set(newContribution.id, newContribution);
    this.updateMemberMetrics(memberId, newContribution);
    this.harvestCollectiveWisdom(threadId);

    return newContribution;
  }

  /**
   * Verify and amplify community wisdom
   */
  async verifyContribution(
    contributionId: string,
    verifierId: string
  ): Promise<boolean> {
    const contribution = this.contributions.get(contributionId);
    const verifier = this.members.get(verifierId);

    if (!contribution || !verifier || contribution.contributorId === verifierId) {
      return false;
    }

    contribution.verifications.push(verifierId);
    this.updateContributionResonance(contribution);
    return true;
  }

  /**
   * Get community insights for a specific thread
   */
  getThreadInsights(threadId: string): CollectiveWisdom | null {
    return this.collectiveWisdom.get(threadId) || null;
  }

  /**
   * Get active contributors for the current season
   */
  getSeasonalContributors(): CommunityMember[] {
    return Array.from(this.members.values())
      .filter(member => 
        member.seasonalAffinity.includes(this.seasonalContext.season) &&
        member.consciousnessLevel >= this.communityConsciousness * 0.7
      );
  }

  private updateMemberMetrics(memberId: string, contribution: CommunityContribution): void {
    const member = this.members.get(memberId);
    if (!member) return;

    member.contributionCount++;
    member.wisdomScore += this.calculateWisdomValue(contribution);
    member.resonancePatterns = this.updateResonancePatterns(member, contribution);

    if (!member.activeThreads.includes(contribution.threadId)) {
      member.activeThreads.push(contribution.threadId);
    }
  }

  private calculateWisdomValue(contribution: CommunityContribution): number {
    const depthMultiplier: Record<WisdomDepth, number> = {
      SURFACE: 1,
      ROOT: 2,
      SOUL: 3,
      COSMIC: 4
    }[contribution.wisdomDepth];

    const seasonalAlignment = contribution.seasonalContext.season === this.seasonalContext.season ? 1.2 : 1;
    const baseValue = contribution.resonance * depthMultiplier * seasonalAlignment;

    return Math.min(10, baseValue);
  }

  private updateResonancePatterns(
    member: CommunityMember,
    contribution: CommunityContribution
  ): ResonanceType[] {
    const patterns = new Set(member.resonancePatterns);

    if (contribution.resonance > 0.8) patterns.add('HARMONY');
    if (contribution.wisdomDepth === 'ROOT') patterns.add('GROWTH');
    if (contribution.wisdomDepth === 'SOUL') patterns.add('WISDOM');
    if (contribution.type === 'INSIGHT') patterns.add('INNOVATION');

    return Array.from(patterns);
  }

  private updateContributionResonance(contribution: CommunityContribution): void {
    const verificationWeight = 0.1;
    const baseResonance = contribution.resonance;
    const verificationBoost = contribution.verifications.length * verificationWeight;

    contribution.resonance = Math.min(1, baseResonance + verificationBoost);
  }

  private harvestCollectiveWisdom(threadId: string): void {
    const threadContributions = Array.from(this.contributions.values())
      .filter(c => c.threadId === threadId);

    if (threadContributions.length === 0) return;

    const wisdom: CollectiveWisdom = {
      threadId,
      contributors: [...new Set(threadContributions.map(c => c.contributorId))],
      wisdomMatrix: this.calculateWisdomMatrix(threadContributions),
      seasonalStrength: this.calculateSeasonalStrength(threadContributions),
      resonanceField: this.calculateResonanceField(threadContributions),
      lastHarvested: new Date()
    };

    this.collectiveWisdom.set(threadId, wisdom);
  }

  private calculateWisdomMatrix(contributions: CommunityContribution[]): Map<string, number> {
    const matrix = new Map<string, number>();
    
    contributions.forEach(contribution => {
      const key = `${contribution.type}_${contribution.wisdomDepth}`;
      const current = matrix.get(key) || 0;
      matrix.set(key, current + contribution.resonance);
    });

    return matrix;
  }

  private calculateSeasonalStrength(
    contributions: CommunityContribution[]
  ): Map<AgriculturalCycle['season'], number> {
    const strength = new Map<AgriculturalCycle['season'], number>();
    
    contributions.forEach(contribution => {
      const season = contribution.seasonalContext.season;
      const current = strength.get(season) || 0;
      strength.set(season, current + contribution.resonance);
    });

    return strength;
  }

  private calculateResonanceField(contributions: CommunityContribution[]): number {
    if (contributions.length === 0) return 0;

    const totalResonance = contributions.reduce(
      (sum, c) => sum + c.resonance * (c.verifications.length + 1),
      0
    );

    return totalResonance / (contributions.length * 2);
  }

  private generateQuantumId(): string {
    return `qid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}