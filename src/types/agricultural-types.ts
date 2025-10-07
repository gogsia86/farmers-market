export interface AgriculturalCycle {
  moonPhase: number; // 0-1 representing lunar cycle
  energyLevel: number; // 0-1 representing seasonal energy
  season: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';
  growthPhase: 'DORMANT' | 'GERMINATION' | 'GROWTH' | 'HARVEST';
}

export interface SeasonalMetrics {
  temperature: number; // normalized 0-1
  moisture: number; // normalized 0-1
  sunlight: number; // normalized 0-1
  soilHealth: number; // normalized 0-1
}

export interface GrowthConditions {
  cycle: AgriculturalCycle;
  metrics: SeasonalMetrics;
  biorhythm: number; // 0-1 representing overall natural harmony
}