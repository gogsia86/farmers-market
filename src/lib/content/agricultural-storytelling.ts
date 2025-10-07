/**
 * Agricultural Storytelling Framework
 * A quantum-aware system for dynamic agricultural content management
 */

import { AgriculturalCycle } from '../navigation/agricultural-types';

export type StoryMedium = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'EXPERIENCE';
export type ContentEvolutionState = 'SEED' | 'SPROUT' | 'GROWTH' | 'HARVEST' | 'LEGACY';
export type WisdomDepth = 'SURFACE' | 'ROOT' | 'SOUL' | 'COSMIC';

export interface AgriculturalKnowledge {
  id: string;
  title: string;
  content: string;
  medium: StoryMedium;
  seasonalContext: AgriculturalCycle;
  evolutionState: ContentEvolutionState;
  wisdomDepth: WisdomDepth;
  energySignature: number;
  consciousnessRequirement: number;
  contributors: string[];
  createdAt: Date;
  lastEvolved: Date;
}

export interface ContentEvolution {
  knowledgeId: string;
  previousState: ContentEvolutionState;
  newState: ContentEvolutionState;
  evolutionContext: {
    season: AgriculturalCycle['season'];
    communityEnergy: number;
    environmentalFactors: string[];
  };
  timestamp: Date;
}

export interface StoryThread {
  id: string;
  rootKnowledge: AgriculturalKnowledge;
  branches: AgriculturalKnowledge[];
  seasonalRelevance: AgriculturalCycle['season'][];
  evolutionPath: ContentEvolution[];
  consciousnessThreshold: number;
}

export class AgriculturalStoryManager {
  private stories: Map<string, StoryThread> = new Map();
  private evolutionHistory: ContentEvolution[] = [];

  constructor(
    private readonly seasonalContext: AgriculturalCycle,
    private readonly communityConsciousness: number
  ) {}

  /**
   * Plant a new story seed in the content ecosystem
   */
  async plantStorySeed(
    knowledge: Omit<AgriculturalKnowledge, 'id' | 'evolutionState' | 'createdAt' | 'lastEvolved'>
  ): Promise<StoryThread> {
    const id = this.generateQuantumId();
    const timestamp = new Date();

    const newKnowledge: AgriculturalKnowledge = {
      ...knowledge,
      id,
      evolutionState: 'SEED',
      createdAt: timestamp,
      lastEvolved: timestamp
    };

    const thread: StoryThread = {
      id: this.generateQuantumId(),
      rootKnowledge: newKnowledge,
      branches: [],
      seasonalRelevance: [knowledge.seasonalContext.season],
      evolutionPath: [],
      consciousnessThreshold: knowledge.consciousnessRequirement
    };

    this.stories.set(thread.id, thread);
    return thread;
  }

  /**
   * Nurture content evolution based on seasonal and community factors
   */
  async evolveContent(threadId: string): Promise<ContentEvolution | null> {
    const thread = this.stories.get(threadId);
    if (!thread) return null;

    const evolution = this.calculateEvolution(thread);
    if (evolution) {
      thread.evolutionPath.push(evolution);
      this.evolutionHistory.push(evolution);
      
      // Update knowledge state
      thread.rootKnowledge.evolutionState = evolution.newState;
      thread.rootKnowledge.lastEvolved = evolution.timestamp;
    }

    return evolution;
  }

  /**
   * Create a new branch of wisdom from existing knowledge
   */
  async branchKnowledge(
    threadId: string,
    newKnowledge: Omit<AgriculturalKnowledge, 'id' | 'createdAt' | 'lastEvolved'>
  ): Promise<AgriculturalKnowledge | null> {
    const thread = this.stories.get(threadId);
    if (!thread) return null;

    const id = this.generateQuantumId();
    const timestamp = new Date();

    const branch: AgriculturalKnowledge = {
      ...newKnowledge,
      id,
      createdAt: timestamp,
      lastEvolved: timestamp
    };

    thread.branches.push(branch);
    thread.seasonalRelevance = [...new Set([...thread.seasonalRelevance, newKnowledge.seasonalContext.season])];

    return branch;
  }

  /**
   * Get stories relevant to current seasonal context
   */
  getSeasonalStories(): StoryThread[] {
    return Array.from(this.stories.values())
      .filter(thread => 
        thread.seasonalRelevance.includes(this.seasonalContext.season) &&
        thread.consciousnessThreshold <= this.communityConsciousness
      );
  }

  /**
   * Calculate natural evolution state based on quantum factors
   */
  private calculateEvolution(thread: StoryThread): ContentEvolution | null {
    const { rootKnowledge } = thread;
    const currentState = rootKnowledge.evolutionState;
    
    // Evolution quantum probability based on multiple factors
    const evolutionProbability = this.calculateEvolutionProbability(thread);
    if (evolutionProbability < 0.5) return null;

    const stateProgression: ContentEvolutionState[] = ['SEED', 'SPROUT', 'GROWTH', 'HARVEST', 'LEGACY'];
    const currentIndex = stateProgression.indexOf(currentState);
    if (currentIndex === -1 || currentIndex === stateProgression.length - 1) return null;

    return {
      knowledgeId: rootKnowledge.id,
      previousState: currentState,
      newState: stateProgression[currentIndex + 1],
      evolutionContext: {
        season: this.seasonalContext.season,
        communityEnergy: this.communityConsciousness,
        environmentalFactors: this.getCurrentEnvironmentalFactors()
      },
      timestamp: new Date()
    };
  }

  /**
   * Calculate probability of content evolution based on quantum factors
   */
  private calculateEvolutionProbability(thread: StoryThread): number {
    const seasonalAlignment = thread.seasonalRelevance.includes(this.seasonalContext.season) ? 1 : 0.5;
    const consciousnessRatio = this.communityConsciousness / thread.consciousnessThreshold;
    const timeFactors = this.calculateTimeQuantumEffects(thread.rootKnowledge.lastEvolved);
    
    return (seasonalAlignment * consciousnessRatio * timeFactors);
  }

  /**
   * Calculate quantum effects based on time passage
   */
  private calculateTimeQuantumEffects(lastEvolved: Date): number {
    const timeDiff = Date.now() - lastEvolved.getTime();
    const daysPassed = timeDiff / (1000 * 60 * 60 * 24);
    return Math.min(1, daysPassed / 28); // Lunar cycle influence
  }

  /**
   * Generate a quantum-entangled unique identifier
   */
  private generateQuantumId(): string {
    return `qid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current environmental factors affecting content evolution
   */
  private getCurrentEnvironmentalFactors(): string[] {
    const factors = [];
    if (this.seasonalContext.moonPhase > 0.8) factors.push('FULL_MOON');
    if (this.seasonalContext.energyLevel > 0.7) factors.push('HIGH_ENERGY');
    return factors;
  }
}