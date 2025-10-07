export interface AgriculturalCycle {
  season: 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER';
  phase: 'PLANTING' | 'GROWTH' | 'HARVEST' | 'REST';
  moonPhase: number; // 0-1 representing lunar cycle
  energyLevel: number; // Biodynamic energy level
}

export interface AgriculturalNode {
  id: string;
  path: string;
  season: AgriculturalCycle['season'];
  phase: AgriculturalCycle['phase'];
  energyRequirement: number;
  consciousnessThreshold: number;
  nextNodes: string[];
  previousNodes: string[];
}

export interface PathfindingCriteria {
  currentSeason: AgriculturalCycle['season'];
  targetSeason: AgriculturalCycle['season'];
  energyLevel: number;
  consciousness: number;
  preferredPhase?: AgriculturalCycle['phase'];
}

export interface NavigationState {
  currentNode: string;
  currentPath: string[];
  availablePaths: Array<{
    nodes: string[];
    resonance: number;
    energyCost: number;
  }>;
  seasonalAlignment: number;
  consciousness: number;
}

export type PathOptimizationStrategy = 
  | 'ENERGY_EFFICIENT'
  | 'CONSCIOUSNESS_ALIGNED'
  | 'SEASON_OPTIMIZED'
  | 'BALANCED';