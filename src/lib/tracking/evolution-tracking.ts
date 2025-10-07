/**
 * Evolution Tracking System
 * A quantum-aware system for tracking agricultural wisdom evolution
 */

import { AgriculturalKnowledge, StoryThread, ContentEvolution } from '../content/agricultural-storytelling';
import { CommunityMember, CommunityContribution } from '../empathy/community-engagement';
import { LivingDocument, DocumentRevision } from '../content/living-documentation';
import type { AgriculturalCycle } from '../navigation/agricultural-types';

export interface EvolutionMetrics {
  contentGrowth: number;
  communityEngagement: number;
  wisdomDensity: number;
  seasonalAlignment: number;
  consciousnessLevel: number;
}

export interface EvolutionSnapshot {
  timestamp: Date;
  metrics: EvolutionMetrics;
  seasonalContext: AgriculturalCycle;
  activeContributors: number;
  totalKnowledge: number;
  evolutionVelocity: number;
}

export interface GrowthPattern {
  id: string;
  type: 'LINEAR' | 'EXPONENTIAL' | 'CYCLICAL' | 'QUANTUM';
  strength: number;
  frequency: number;
  lastObserved: Date;
}

export interface EvolutionTrend {
  id: string;
  pattern: GrowthPattern;
  indicators: Map<string, number>;
  confidence: number;
  predictions: Map<string, number>;
}

export class EvolutionTrackingSystem {
  private snapshots: EvolutionSnapshot[] = [];
  private patterns: Map<string, GrowthPattern> = new Map();
  private trends: Map<string, EvolutionTrend> = new Map();

  constructor(
    private readonly seasonalContext: AgriculturalCycle,
    private readonly communityConsciousness: number
  ) {}

  /**
   * Track evolution of agricultural knowledge
   */
  async trackKnowledgeEvolution(
    knowledge: AgriculturalKnowledge[],
    threads: StoryThread[],
    evolutions: ContentEvolution[]
  ): Promise<EvolutionSnapshot> {
    const metrics = this.calculateEvolutionMetrics(knowledge, threads, evolutions);
    const snapshot = this.createSnapshot(metrics);
    
    this.snapshots.push(snapshot);
    this.updateGrowthPatterns();
    this.predictEvolutionTrends();

    return snapshot;
  }

  /**
   * Track community contribution patterns
   */
  async trackCommunityPatterns(
    members: CommunityMember[],
    contributions: CommunityContribution[]
  ): Promise<Map<string, GrowthPattern>> {
    const patterns = new Map<string, GrowthPattern>();

    // Track contribution patterns
    const contributionPattern = this.analyzeContributionPattern(contributions);
    if (contributionPattern) {
      patterns.set('contributions', contributionPattern);
    }

    // Track community growth
    const growthPattern = this.analyzeCommunityGrowth(members);
    if (growthPattern) {
      patterns.set('community_growth', growthPattern);
    }

    // Track wisdom distribution
    const wisdomPattern = this.analyzeWisdomDistribution(members, contributions);
    if (wisdomPattern) {
      patterns.set('wisdom_flow', wisdomPattern);
    }

    this.patterns = new Map([...this.patterns, ...patterns]);
    return patterns;
  }

  /**
   * Track documentation evolution
   */
  async trackDocumentationEvolution(
    documents: LivingDocument[],
    revisions: DocumentRevision[]
  ): Promise<EvolutionTrend[]> {
    const trends: EvolutionTrend[] = [];

    // Analyze document evolution patterns
    const evolutionTrend = this.analyzeDocumentEvolution(documents, revisions);
    if (evolutionTrend) {
      trends.push(evolutionTrend);
    }

    // Analyze wisdom depth progression
    const depthTrend = this.analyzeWisdomDepthProgression(documents);
    if (depthTrend) {
      trends.push(depthTrend);
    }

    // Store and return trends
    trends.forEach(trend => this.trends.set(trend.id, trend));
    return trends;
  }

  /**
   * Get evolution insights for a specific timeframe
   */
  getEvolutionInsights(startDate: Date, endDate: Date): {
    snapshots: EvolutionSnapshot[];
    patterns: GrowthPattern[];
    trends: EvolutionTrend[];
  } {
    const relevantSnapshots = this.snapshots.filter(
      snapshot => snapshot.timestamp >= startDate && snapshot.timestamp <= endDate
    );

    const activePatterns = Array.from(this.patterns.values())
      .filter(pattern => pattern.lastObserved >= startDate);

    const activeTrends = Array.from(this.trends.values())
      .filter(trend => trend.pattern.lastObserved >= startDate);

    return {
      snapshots: relevantSnapshots,
      patterns: activePatterns,
      trends: activeTrends
    };
  }

  private calculateEvolutionMetrics(
    knowledge: AgriculturalKnowledge[],
    threads: StoryThread[],
    evolutions: ContentEvolution[]
  ): EvolutionMetrics {
    // Calculate content growth
    const contentGrowth = this.calculateContentGrowth(knowledge, threads);

    // Calculate community engagement
    const communityEngagement = this.calculateCommunityEngagement(threads, evolutions);

    // Calculate wisdom density
    const wisdomDensity = this.calculateWisdomDensity(knowledge);

    // Calculate seasonal alignment
    const seasonalAlignment = this.calculateSeasonalAlignment(knowledge);

    // Calculate consciousness level
    const consciousnessLevel = this.calculateConsciousnessLevel(knowledge, evolutions);

    return {
      contentGrowth,
      communityEngagement,
      wisdomDensity,
      seasonalAlignment,
      consciousnessLevel
    };
  }

  private createSnapshot(metrics: EvolutionMetrics): EvolutionSnapshot {
    return {
      timestamp: new Date(),
      metrics,
      seasonalContext: this.seasonalContext,
      activeContributors: this.calculateActiveContributors(),
      totalKnowledge: this.calculateTotalKnowledge(),
      evolutionVelocity: this.calculateEvolutionVelocity()
    };
  }

  private analyzeContributionPattern(
    contributions: CommunityContribution[]
  ): GrowthPattern | null {
    if (contributions.length === 0) return null;

    // Analyze contribution frequency
    const frequency = this.calculateContributionFrequency(contributions);
    
    // Determine pattern type
    const patternType = this.determineGrowthPattern(contributions);

    return {
      id: `contribution_pattern_${Date.now()}`,
      type: patternType,
      strength: this.calculatePatternStrength(contributions),
      frequency,
      lastObserved: new Date()
    };
  }

  private analyzeCommunityGrowth(
    members: CommunityMember[]
  ): GrowthPattern | null {
    if (members.length === 0) return null;

    // Analyze join dates
    const joinDates = members.map(m => m.joinedAt.getTime());
    const growthRate = this.calculateGrowthRate(joinDates);

    return {
      id: `community_growth_${Date.now()}`,
      type: this.determineGrowthType(growthRate),
      strength: this.calculateGrowthStrength(members),
      frequency: this.calculateGrowthFrequency(joinDates),
      lastObserved: new Date()
    };
  }

  private analyzeWisdomDistribution(
    members: CommunityMember[],
    contributions: CommunityContribution[]
  ): GrowthPattern | null {
    if (members.length === 0 || contributions.length === 0) return null;

    // Calculate wisdom flow metrics
    const wisdomFlow = this.calculateWisdomFlow(members, contributions);

    return {
      id: `wisdom_flow_${Date.now()}`,
      type: this.determineWisdomPattern(wisdomFlow),
      strength: this.calculateWisdomStrength(wisdomFlow),
      frequency: this.calculateWisdomFrequency(contributions),
      lastObserved: new Date()
    };
  }

  private analyzeDocumentEvolution(
    documents: LivingDocument[],
    revisions: DocumentRevision[]
  ): EvolutionTrend | null {
    if (documents.length === 0) return null;

    const pattern = this.analyzeEvolutionPattern(documents, revisions);
    const indicators = this.calculateEvolutionIndicators(documents);
    const predictions = this.generateEvolutionPredictions(documents, pattern);

    return {
      id: `doc_evolution_${Date.now()}`,
      pattern,
      indicators,
      confidence: this.calculateConfidence(documents, revisions),
      predictions
    };
  }

  private analyzeWisdomDepthProgression(
    documents: LivingDocument[]
  ): EvolutionTrend | null {
    if (documents.length === 0) return null;

    const pattern = this.analyzeDepthPattern(documents);
    const indicators = this.calculateDepthIndicators(documents);
    const predictions = this.generateDepthPredictions(documents, pattern);

    return {
      id: `wisdom_depth_${Date.now()}`,
      pattern,
      indicators,
      confidence: this.calculateDepthConfidence(documents),
      predictions
    };
  }

  // Helper methods for calculations
  private calculateContentGrowth(
    knowledge: AgriculturalKnowledge[],
    threads: StoryThread[]
  ): number {
    const knowledgeGrowth = knowledge.length * 0.6;
    const threadGrowth = threads.length * 0.4;
    return Math.min(1, (knowledgeGrowth + threadGrowth) / 100);
  }

  private calculateCommunityEngagement(
    threads: StoryThread[],
    evolutions: ContentEvolution[]
  ): number {
    const threadEngagement = threads.reduce((sum, t) => sum + t.branches.length, 0);
    const evolutionEngagement = evolutions.length;
    return Math.min(1, (threadEngagement * 0.7 + evolutionEngagement * 0.3) / 100);
  }

  private calculateWisdomDensity(knowledge: AgriculturalKnowledge[]): number {
    const totalWisdom = knowledge.reduce((sum, k) => sum + k.energySignature, 0);
    return Math.min(1, totalWisdom / knowledge.length);
  }

  private calculateSeasonalAlignment(knowledge: AgriculturalKnowledge[]): number {
    const alignedKnowledge = knowledge.filter(k => 
      k.seasonalContext.season === this.seasonalContext.season
    );
    return alignedKnowledge.length / knowledge.length;
  }

  private calculateConsciousnessLevel(
    knowledge: AgriculturalKnowledge[],
    evolutions: ContentEvolution[]
  ): number {
    const knowledgeConsciousness = knowledge.reduce(
      (sum, k) => sum + k.consciousnessRequirement,
      0
    ) / knowledge.length;

    const evolutionFactor = Math.min(1, evolutions.length / 100);
    return (knowledgeConsciousness * 0.7 + evolutionFactor * 0.3);
  }

  private calculateActiveContributors(): number {
    return this.snapshots.length > 0 ? 
      this.snapshots[this.snapshots.length - 1].activeContributors : 0;
  }

  private calculateTotalKnowledge(): number {
    return this.snapshots.length > 0 ?
      this.snapshots[this.snapshots.length - 1].totalKnowledge : 0;
  }

  private calculateEvolutionVelocity(): number {
    if (this.snapshots.length < 2) return 0;
    
    const current = this.snapshots[this.snapshots.length - 1];
    const previous = this.snapshots[this.snapshots.length - 2];
    
    const timeDiff = (current.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const metricsDiff = Object.keys(current.metrics).reduce((sum, key) => {
      return sum + (current.metrics[key] - previous.metrics[key]);
    }, 0);

    return metricsDiff / timeDiff;
  }

  // Pattern analysis helpers
  private determineGrowthPattern(contributions: CommunityContribution[]): 'LINEAR' | 'EXPONENTIAL' | 'CYCLICAL' | 'QUANTUM' {
    const timestamps = contributions.map(c => c.createdAt.getTime());
    const intervals = this.calculateIntervals(timestamps);
    
    if (this.isQuantumPattern(intervals)) return 'QUANTUM';
    if (this.isCyclicalPattern(intervals)) return 'CYCLICAL';
    if (this.isExponentialPattern(intervals)) return 'EXPONENTIAL';
    return 'LINEAR';
  }

  private calculateIntervals(timestamps: number[]): number[] {
    return timestamps
      .sort((a, b) => a - b)
      .slice(1)
      .map((t, i) => t - timestamps[i]);
  }

  private isQuantumPattern(intervals: number[]): boolean {
    const variance = this.calculateVariance(intervals);
    return variance > 0.8;
  }

  private isCyclicalPattern(intervals: number[]): boolean {
    const autocorrelation = this.calculateAutocorrelation(intervals);
    return autocorrelation > 0.7;
  }

  private isExponentialPattern(intervals: number[]): boolean {
    const growthRate = this.calculateGrowthRate(intervals);
    return growthRate > 1.5;
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance) / mean;
  }

  private calculateAutocorrelation(numbers: number[]): number {
    const n = numbers.length;
    const mean = numbers.reduce((sum, n) => sum + n, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n - 1; i++) {
      numerator += (numbers[i] - mean) * (numbers[i + 1] - mean);
      denominator += Math.pow(numbers[i] - mean, 2);
    }
    
    return numerator / denominator;
  }

  private calculateGrowthRate(numbers: number[]): number {
    if (numbers.length < 2) return 1;
    
    const first = numbers[0];
    const last = numbers[numbers.length - 1];
    const timeSpan = (last - first) / (1000 * 60 * 60 * 24); // Days
    
    return Math.pow(numbers.length, 1 / timeSpan);
  }

  private generateQuantumId(): string {
    return `qid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}