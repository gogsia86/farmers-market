export interface AgriculturalPersona {
  id: string;
  type: 'Farmer' | 'Buyer' | 'Distributor' | 'MarketManager';
  consciousness: {
    level: number;  // 0-1 representing spiritual connection to agriculture
    focus: string[];  // Areas of agricultural interest
    values: string[];  // Core farming/sustainability values
  };
  experience: {
    years: number;
    specialties: string[];
    biodynamicKnowledge: number;  // 0-1 scale
  };
  seasonalPatterns: {
    preferredSeasons: string[];
    cropRotations: string[];
    marketTiming: string[];
  };
  sustainability: {
    practices: string[];
    certifications: string[];
    goals: string[];
  };
  quantumResonance: number;  // Measure of alignment with agricultural energy
}

export interface UserJourney {
  id: string;
  personaId: string;
  touchpoints: Array<{
    phase: string;
    activities: string[];
    emotionalState: number;  // -1 to 1 scale
    agriculturalAlignment: number;  // 0-1 scale
    resonanceScore: number;
  }>;
  seasonalContext: {
    season: string;
    weatherConditions: string[];
    cropPhases: string[];
  };
  consciousness: {
    level: number;
    insights: string[];
    transformations: string[];
  };
}

export interface EmotionalDesignPattern {
  id: string;
  pattern: string;
  naturalAlignment: number;  // 0-1 scale
  seasonalVariation: {
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
  };
  energyFlow: {
    input: string[];
    transformation: string;
    output: string[];
  };
  consciousness: {
    level: number;
    intention: string;
    manifestation: string;
  };
}

export interface ResearchInsight {
  id: string;
  category: 'Behavior' | 'Need' | 'Motivation' | 'Pain Point';
  description: string;
  relevance: number;  // 0-1 scale
  seasonalImpact: {
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
  };
  quantumMetrics: {
    resonance: number;
    alignment: number;
    consciousness: number;
  };
}