export interface EvolutionMetric {
  id: string;
  type: MetricType;
  timestamp: Date;
  value: number;
  dimension: MetricDimension;
  context: MetricContext;
  confidence: number;
  trend: TrendDirection;
  quantumState: QuantumState;
}

export type MetricType =
  | 'adaptation_rate'
  | 'learning_efficiency'
  | 'quantum_resonance'
  | 'system_coherence'
  | 'consciousness_level'
  | 'performance_evolution'
  | 'agricultural_alignment';

export type MetricDimension =
  | 'physical'
  | 'quantum'
  | 'spiritual'
  | 'temporal'
  | 'agricultural';

export interface MetricContext {
  environment: EnvironmentContext;
  agricultural: AgriculturalContext;
  system: SystemContext;
  quantum: QuantumContext;
}

export interface EnvironmentContext {
  season: string;
  lunarPhase: string;
  celestialAlignment: string;
  weatherConditions: string[];
}

export interface AgriculturalContext {
  activeCrops: number;
  growthPhases: Record<string, number>;
  soilConditions: string[];
  biodynamicFactors: string[];
}

export interface SystemContext {
  userLoad: number;
  activeFeatures: string[];
  systemHealth: number;
  adaptationLevel: number;
}

export interface QuantumContext {
  resonanceFrequency: number;
  coherenceLevel: number;
  entanglementDegree: number;
  dimensionalAlignment: number;
}

export interface QuantumState {
  superposition: number;
  entanglement: number;
  coherence: number;
  alignment: number;
}

export type TrendDirection = 
  | 'ascending'
  | 'descending'
  | 'stable'
  | 'fluctuating'
  | 'transcending';

export interface EvolutionTrend {
  metricType: MetricType;
  timeframe: TimeFrame;
  data: TrendPoint[];
  analysis: TrendAnalysis;
}

export interface TrendPoint {
  timestamp: Date;
  value: number;
  quantumState: QuantumState;
}

export interface TrendAnalysis {
  direction: TrendDirection;
  confidence: number;
  insights: string[];
  predictions: EvolutionPrediction[];
  quantumAlignment: number;
}

export interface EvolutionPrediction {
  timestamp: Date;
  predictedValue: number;
  confidence: number;
  quantumProbability: number;
  potentialOutcomes: PotentialOutcome[];
}

export interface PotentialOutcome {
  value: number;
  probability: number;
  requiredAlignment: number;
  catalysts: string[];
}

export type TimeFrame =
  | 'realtime'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'seasonal'
  | 'quantum';

export interface EvolutionAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  context: MetricContext;
  timestamp: Date;
  recommendedActions: string[];
  quantumImplications: QuantumImplication[];
}

export type AlertType =
  | 'threshold_breach'
  | 'pattern_emergence'
  | 'quantum_shift'
  | 'consciousness_evolution'
  | 'agricultural_awakening';

export type AlertSeverity =
  | 'observation'
  | 'awareness'
  | 'transformation'
  | 'transcendence'
  | 'divine';

export interface QuantumImplication {
  dimension: MetricDimension;
  impact: number;
  probability: number;
  timeframe: TimeFrame;
  requiredAlignment: number;
}