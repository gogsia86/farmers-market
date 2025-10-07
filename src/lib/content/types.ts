import { UserJourney } from '../empathy/types';

export interface ContentNode {
  id: string;
  type: 'Article' | 'Guide' | 'Wisdom' | 'Research' | 'Practice';
  title: string;
  content: string;
  metadata: {
    author: string;
    createdAt: string;
    updatedAt: string;
    season: string[];
    crops: string[];
    moonPhase: string;
  };
  quantumMetrics: {
    resonance: number;
    alignment: number;
    impact: number;
    wisdom: number;
  };
  relationships: {
    parents: string[];
    children: string[];
    related: string[];
  };
  consciousness: {
    level: number;
    intention: string;
    manifestation: string[];
  };
  biodynamicFactors: {
    preparations: string[];
    celestialInfluences: string[];
    elementalForces: string[];
  };
  seasonalPatterns: {
    [key: string]: {
      relevance: number;
      practices: string[];
      insights: string[];
    };
  };
}

export interface WisdomArchive {
  id: string;
  category: string;
  practices: Array<{
    name: string;
    description: string;
    season: string[];
    elements: string[];
    consciousness: number;
  }>;
  principles: Array<{
    name: string;
    description: string;
    application: string[];
    resonance: number;
  }>;
  cycles: Array<{
    name: string;
    duration: string;
    phases: string[];
    influence: number;
  }>;
}

export interface ContentInventory {
  nodes: Map<string, ContentNode>;
  wisdom: Map<string, WisdomArchive>;
  relationships: Map<string, Set<string>>;
  seasonalIndices: Map<string, Set<string>>;
  quantumIndices: Map<number, Set<string>>;
}

export interface SeasonalContext {
  currentSeason: string;
  moonPhase: string;
  celestialEvents: string[];
  elementalConditions: {
    earth: number;
    water: number;
    air: number;
    fire: number;
    aether: number;
  };
}