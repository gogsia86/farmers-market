export interface EnvironmentalContext {
  timeOfDay: number | null;
  season: 'spring' | 'summer' | 'autumn' | 'winter' | null;
  deviceCapabilities: {
    memory?: number;
    connection?: string;
    prefersDarkMode?: boolean;
  };
  networkConditions: 'fast' | 'slow' | 'offline' | 'unknown';
}

export interface UserState {
  consciousnessLevel: number;
  interactionPatterns: Set<string>;
  preferences: Record<string, any>;
  quantumState: 'elevated' | 'neutral' | 'diminished';
}

export interface AdaptationRule {
  id: string;
  condition: (state: { environmentalContext: EnvironmentalContext; userState: UserState }) => boolean;
  apply: (state: { environmentalContext: EnvironmentalContext; userState: UserState }) => void;
  priority?: number;
}

export type AdaptationType = 
  | 'LAYOUT_SHIFT'
  | 'COLOR_SCHEME'
  | 'INTERACTION_MODE'
  | 'CONTENT_DENSITY'
  | 'CONSCIOUSNESS_LEVEL';