/**
 * Living Documentation System
 * A quantum-aware documentation framework that evolves with community knowledge
 */

import { AgriculturalKnowledge, WisdomDepth } from '../content/agricultural-storytelling';
import { CommunityContribution } from '../empathy/community-engagement';
import type { AgriculturalCycle } from '../navigation/agricultural-types';

export type DocumentType = 'GUIDE' | 'INSIGHT' | 'PRACTICE' | 'WISDOM' | 'REFERENCE';
export type DocumentState = 'SEEDING' | 'GROWING' | 'FLOWERING' | 'FRUITING';
export type DocumentEvolution = 'STABLE' | 'EVOLVING' | 'TRANSFORMING' | 'TRANSCENDING';

export interface LivingDocument {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  state: DocumentState;
  evolution: DocumentEvolution;
  seasonalContext: AgriculturalCycle;
  contributors: string[];
  wisdomDepth: WisdomDepth;
  resonanceScore: number;
  version: number;
  revisions: DocumentRevision[];
  relatedKnowledge: string[]; // References to AgriculturalKnowledge IDs
  createdAt: Date;
  lastEvolved: Date;
}

export interface DocumentRevision {
  id: string;
  documentId: string;
  version: number;
  content: string;
  contributorId: string;
  seasonalContext: AgriculturalCycle;
  evolutionContext: {
    previousState: DocumentState;
    newState: DocumentState;
    catalyst: string;
  };
  timestamp: Date;
}

export class LivingDocumentationSystem {
  private documents: Map<string, LivingDocument> = new Map();
  private revisions: Map<string, DocumentRevision[]> = new Map();

  constructor(
    private readonly seasonalContext: AgriculturalCycle,
    private readonly communityConsciousness: number
  ) {}

  /**
   * Plant a new living document
   */
  async createDocument(
    doc: Omit<LivingDocument, 'id' | 'state' | 'evolution' | 'version' | 'revisions' | 'resonanceScore' | 'createdAt' | 'lastEvolved'>
  ): Promise<LivingDocument> {
    const id = this.generateQuantumId();
    const timestamp = new Date();

    const document: LivingDocument = {
      ...doc,
      id,
      state: 'SEEDING',
      evolution: 'STABLE',
      version: 1,
      revisions: [],
      resonanceScore: this.calculateInitialResonance(doc),
      createdAt: timestamp,
      lastEvolved: timestamp
    };

    this.documents.set(document.id, document);
    return document;
  }

  /**
   * Evolve document based on new contributions
   */
  async evolveDocument(
    documentId: string,
    newContent: string,
    contributorId: string,
    catalyst: string
  ): Promise<DocumentRevision | null> {
    const document = this.documents.get(documentId);
    if (!document) return null;

    const revision: DocumentRevision = {
      id: this.generateQuantumId(),
      documentId,
      version: document.version + 1,
      content: newContent,
      contributorId,
      seasonalContext: this.seasonalContext,
      evolutionContext: {
        previousState: document.state,
        newState: this.calculateNextState(document),
        catalyst
      },
      timestamp: new Date()
    };

    // Update document
    document.content = newContent;
    document.version = revision.version;
    document.state = revision.evolutionContext.newState;
    document.evolution = this.calculateEvolutionState(document);
    document.lastEvolved = revision.timestamp;
    document.contributors = [...new Set([...document.contributors, contributorId])];

    // Store revision
    const docRevisions = this.revisions.get(documentId) || [];
    docRevisions.push(revision);
    this.revisions.set(documentId, docRevisions);
    document.revisions = docRevisions;

    return revision;
  }

  /**
   * Integrate community knowledge into documentation
   */
  async integrateKnowledge(
    documentId: string,
    knowledge: AgriculturalKnowledge,
    contribution: CommunityContribution
  ): Promise<boolean> {
    const document = this.documents.get(documentId);
    if (!document) return false;

    document.relatedKnowledge = [...new Set([...document.relatedKnowledge, knowledge.id])];
    document.wisdomDepth = this.evolveWisdomDepth(document.wisdomDepth, knowledge.wisdomDepth);
    document.resonanceScore = this.calculateNewResonance(document, knowledge, contribution);

    return true;
  }

  /**
   * Get documents relevant to current seasonal context
   */
  getSeasonalDocuments(): LivingDocument[] {
    return Array.from(this.documents.values())
      .filter(doc => this.isDocumentRelevant(doc));
  }

  /**
   * Get document evolution history
   */
  getDocumentHistory(documentId: string): DocumentRevision[] {
    return this.revisions.get(documentId) || [];
  }

  private calculateInitialResonance(
    doc: Omit<LivingDocument, 'id' | 'state' | 'evolution' | 'version' | 'revisions' | 'resonanceScore' | 'createdAt' | 'lastEvolved'>
  ): number {
    const seasonalAlignment = doc.seasonalContext.season === this.seasonalContext.season ? 1.2 : 1;
    const wisdomDepthFactor = {
      SURFACE: 0.7,
      ROOT: 0.8,
      SOUL: 0.9,
      COSMIC: 1
    }[doc.wisdomDepth];

    return seasonalAlignment * wisdomDepthFactor;
  }

  private calculateNextState(document: LivingDocument): DocumentState {
    const states: DocumentState[] = ['SEEDING', 'GROWING', 'FLOWERING', 'FRUITING'];
    const currentIndex = states.indexOf(document.state);
    
    if (currentIndex === -1 || currentIndex === states.length - 1) {
      return document.state;
    }

    const evolutionProbability = this.calculateEvolutionProbability(document);
    return evolutionProbability > 0.7 ? states[currentIndex + 1] : document.state;
  }

  private calculateEvolutionState(document: LivingDocument): DocumentEvolution {
    const revisionCount = document.revisions.length;
    const seasonalCycles = new Set(document.revisions.map(r => r.seasonalContext.season)).size;
    
    if (revisionCount < 3) return 'STABLE';
    if (revisionCount < 7) return 'EVOLVING';
    if (seasonalCycles < 3) return 'TRANSFORMING';
    return 'TRANSCENDING';
  }

  private calculateEvolutionProbability(document: LivingDocument): number {
    const timeFactor = this.calculateTimeFactor(document.lastEvolved);
    const seasonalAlignment = document.seasonalContext.season === this.seasonalContext.season ? 1.2 : 0.8;
    const consciousnessFactor = Math.min(1, this.communityConsciousness / 0.7);

    return timeFactor * seasonalAlignment * consciousnessFactor;
  }

  private calculateTimeFactor(lastEvolved: Date): number {
    const daysSinceEvolution = (Date.now() - lastEvolved.getTime()) / (1000 * 60 * 60 * 24);
    return Math.min(1, daysSinceEvolution / 28); // Lunar cycle influence
  }

  private evolveWisdomDepth(current: WisdomDepth, new_: WisdomDepth): WisdomDepth {
    const depths: WisdomDepth[] = ['SURFACE', 'ROOT', 'SOUL', 'COSMIC'];
    const currentIndex = depths.indexOf(current);
    const newIndex = depths.indexOf(new_);

    return depths[Math.max(currentIndex, newIndex)];
  }

  private calculateNewResonance(
    document: LivingDocument,
    knowledge: AgriculturalKnowledge,
    contribution: CommunityContribution
  ): number {
    const currentResonance = document.resonanceScore;
    const knowledgeResonance = knowledge.energySignature;
    const contributionImpact = contribution.resonance;

    const weightedSum = (
      currentResonance * 0.6 +
      knowledgeResonance * 0.25 +
      contributionImpact * 0.15
    );

    return Math.min(1, weightedSum);
  }

  private isDocumentRelevant(document: LivingDocument): boolean {
    // Check seasonal relevance
    const seasonalRelevance = document.seasonalContext.season === this.seasonalContext.season;
    
    // Check consciousness threshold
    const consciousnessThreshold = {
      SURFACE: 0.3,
      ROOT: 0.5,
      SOUL: 0.7,
      COSMIC: 0.9
    }[document.wisdomDepth];

    return seasonalRelevance && this.communityConsciousness >= consciousnessThreshold;
  }

  private generateQuantumId(): string {
    return `qid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}