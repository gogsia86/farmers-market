export interface Vector4D {
  x: number;
  y: number;
  z: number;
  t: number; // temporal coordinate
}

export interface ResonanceMatrix {
  frequencies: number[][];
  harmonics: HarmonicPattern[];
  coherence: number;
}

export type BiodynamicPhase = 
  | 'seedTime'
  | 'growth'
  | 'flowering'
  | 'fruiting'
  | 'harvest'
  | 'rest';

export interface BiodynamicCycle {
  phase: BiodynamicPhase;
  intensity: number;
  alignment: CelestialAlignment;
}

export interface WeatherState {
  conditions: Array<WeatherCondition>;
  forecast: Array<WeatherPrediction>;
}

export interface WeatherCondition {
  type: WeatherType;
  intensity: number;
  quantumInfluence: number;
}

export interface WeatherPrediction {
  timestamp: number;
  probability: number;
  conditions: WeatherCondition;
}

export type WeatherType = 
  | 'clear'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'quantum-anomaly';

export interface EnergySignature {
  frequency: number;
  amplitude: number;
  phase: number;
  coherence: number;
}

export interface CelestialState {
  phase: CelestialPhase;
  power: number;
  alignments: Array<CelestialAlignment>;
}

export interface CelestialAlignment {
  bodies: Array<CelestialBody>;
  strength: number;
  influence: BiodynamicInfluence;
}

export interface BiodynamicCycles {
  cycles: Array<BiodynamicCycle>;
  alignment: number;
  currentPhase: BiodynamicPhase;
}

export interface ConsciousnessLevel {
  level: ConsciousnessType;
  resonance: number;
  awareness: number;
}

export interface FutureState {
  state: any; // Using any to avoid circular reference with QuantumAgriculturalState
  probability: number;
  coherence: number;
  timestamp: number;
}

export type ConsciousnessType = 
  | 'dormant'
  | 'awakening'
  | 'awakened'
  | 'enlightened'
  | 'transcendent';

export type CelestialPhase = 
  | 'new'
  | 'waxing'
  | 'full'
  | 'waning'
  | 'void';

export type CelestialBody = 
  | 'sun'
  | 'moon'
  | 'planets'
  | 'stars'
  | 'quantum-bodies';

export interface BiodynamicInfluence {
  growth: number;
  vitality: number;
  consciousness: number;
}

export interface EnergyFlowMap {
  channels: Array<EnergyChannel>;
  nodes: Array<EnergyNode>;
  flowRate: number;
}

export interface EnergyChannel {
  start: Vector4D;
  end: Vector4D;
  capacity: number;
  currentFlow: number;
}

export interface EnergyNode {
  location: Vector4D;
  capacity: number;
  currentLevel: number;
  resonance: number;
}

export interface HarmonicPattern {
  frequency: number;
  amplitude: number;
  phase: number;
  resonance: number;
  influence: BiodynamicInfluence;
}