import { Crop, Harvest, Weather } from '@prisma/client';

export interface LearningPattern<T = any> {
  id: string;
  type: PatternType;
  confidence: number;
  dateCreated: Date;
  dateUpdated: Date;
  data: T;
  metadata: PatternMetadata;
}

export type PatternType = 
  | 'crop-yield'
  | 'weather-impact'
  | 'seasonal-trends'
  | 'farming-technique'
  | 'community-knowledge';

export interface PatternMetadata {
  source: PatternSource;
  frequency: number;
  reliability: number;
  contextualFactors: string[];
  quantumResonance: number;
}

export type PatternSource = 
  | 'user-behavior'
  | 'system-analysis'
  | 'community-input'
  | 'environmental-data'
  | 'quantum-observation';

export interface CropYieldPattern {
  crop: Crop;
  yield: number;
  conditions: {
    weather: Weather[];
    soil: string;
    techniques: string[];
  };
  seasonality: {
    optimal: string[];
    suboptimal: string[];
  };
}

export interface WeatherImpactPattern {
  weatherType: string;
  impact: {
    severity: number;
    duration: string;
    crops: string[];
  };
  adaptationStrategies: string[];
}

export interface LearningPatternContext {
  patterns: LearningPattern[];
  addPattern: <T>(pattern: Omit<LearningPattern<T>, 'id' | 'dateCreated' | 'dateUpdated'>) => Promise<void>;
  updatePattern: <T>(id: string, pattern: Partial<LearningPattern<T>>) => Promise<void>;
  deletePattern: (id: string) => Promise<void>;
  analyzePatterns: (type: PatternType) => Promise<PatternAnalysis>;
}

export interface PatternAnalysis {
  insights: string[];
  confidence: number;
  recommendations: string[];
  quantumAlignment: number;
}