import type { AgriculturalCycle, AgriculturalNode } from './agricultural-types';

interface SeasonalTransition {
  from: AgriculturalCycle['season'];
  to: AgriculturalCycle['season'];
  energyCost: number;
  duration: number;
}

export class SeasonalFlowManager {
  private readonly transitions: Map<string, SeasonalTransition>;
  private readonly nodeSeasonMap: Map<AgriculturalCycle['season'], Set<string>>;
  private currentCycle: AgriculturalCycle;

  constructor(nodes: Map<string, AgriculturalNode>) {
    this.transitions = this.initializeTransitions();
    this.nodeSeasonMap = this.buildSeasonMap(nodes);
    this.currentCycle = this.calculateCurrentCycle();
  }

  private initializeTransitions(): Map<string, SeasonalTransition> {
    const transitions = new Map<string, SeasonalTransition>();
    
    // Natural season progressions
    this.addTransition(transitions, 'SPRING', 'SUMMER', 1.0, 91);
    this.addTransition(transitions, 'SUMMER', 'FALL', 1.0, 91);
    this.addTransition(transitions, 'FALL', 'WINTER', 1.2, 91);
    this.addTransition(transitions, 'WINTER', 'SPRING', 1.5, 91);
    
    // Cross-seasonal jumps (higher energy cost)
    this.addTransition(transitions, 'SPRING', 'FALL', 2.0, 182);
    this.addTransition(transitions, 'SUMMER', 'WINTER', 2.2, 182);
    this.addTransition(transitions, 'FALL', 'SPRING', 2.5, 182);
    this.addTransition(transitions, 'WINTER', 'SUMMER', 2.8, 182);

    return transitions;
  }

  private addTransition(
    transitions: Map<string, SeasonalTransition>,
    from: AgriculturalCycle['season'],
    to: AgriculturalCycle['season'],
    energyCost: number,
    duration: number
  ): void {
    transitions.set(`${from}-${to}`, { from, to, energyCost, duration });
  }

  private buildSeasonMap(
    nodes: Map<string, AgriculturalNode>
  ): Map<AgriculturalCycle['season'], Set<string>> {
    const seasonMap = new Map<AgriculturalCycle['season'], Set<string>>();
    
    ['SPRING', 'SUMMER', 'FALL', 'WINTER'].forEach(season => {
      seasonMap.set(season as AgriculturalCycle['season'], new Set());
    });

    nodes.forEach((node, id) => {
      const seasonSet = seasonMap.get(node.season);
      if (seasonSet) {
        seasonSet.add(id);
      }
    });

    return seasonMap;
  }

  private calculateCurrentCycle(): AgriculturalCycle {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    );
    
    // Calculate season
    const season = this.calculateSeasonFromDay(dayOfYear);
    
    // Calculate moon phase (0-1)
    const moonPhase = this.calculateMoonPhase(now);
    
    // Calculate phase based on season and moon
    const phase = this.calculatePhase(season, moonPhase);
    
    // Calculate energy level based on season, phase, and moon
    const energyLevel = this.calculateEnergyLevel(season, phase, moonPhase);

    return {
      season,
      phase,
      moonPhase,
      energyLevel
    };
  }

  private calculateSeasonFromDay(dayOfYear: number): AgriculturalCycle['season'] {
    if (dayOfYear < 79) return 'WINTER';
    if (dayOfYear < 171) return 'SPRING';
    if (dayOfYear < 264) return 'SUMMER';
    if (dayOfYear < 355) return 'FALL';
    return 'WINTER';
  }

  private calculateMoonPhase(date: Date): number {
    const LUNAR_MONTH = 29.530588853; // Length of synodic month (days)
    const KNOWN_NEW_MOON = new Date('2025-01-01T00:00:00Z').getTime();
    
    const timeSinceNewMoon = date.getTime() - KNOWN_NEW_MOON;
    const daysSinceNewMoon = timeSinceNewMoon / (24 * 60 * 60 * 1000);
    
    return (daysSinceNewMoon % LUNAR_MONTH) / LUNAR_MONTH;
  }

  private calculatePhase(
    season: AgriculturalCycle['season'],
    moonPhase: number
  ): AgriculturalCycle['phase'] {
    if (season === 'WINTER') return 'REST';
    if (moonPhase < 0.25) return 'PLANTING';
    if (moonPhase < 0.75) return 'GROWTH';
    return 'HARVEST';
  }

  private calculateEnergyLevel(
    season: AgriculturalCycle['season'],
    phase: AgriculturalCycle['phase'],
    moonPhase: number
  ): number {
    let energy = 0;

    // Season base energy
    switch (season) {
      case 'SPRING': energy += 0.8; break;
      case 'SUMMER': energy += 1.0; break;
      case 'FALL': energy += 0.7; break;
      case 'WINTER': energy += 0.4; break;
    }

    // Phase modifier
    switch (phase) {
      case 'PLANTING': energy *= 1.2; break;
      case 'GROWTH': energy *= 1.0; break;
      case 'HARVEST': energy *= 0.8; break;
      case 'REST': energy *= 0.6; break;
    }

    // Moon phase influence (peaks at full moon)
    const moonInfluence = Math.sin(moonPhase * Math.PI) * 0.2;
    energy += moonInfluence;

    return Math.max(0, Math.min(1, energy));
  }

  getTransitionCost(
    from: AgriculturalCycle['season'],
    to: AgriculturalCycle['season']
  ): SeasonalTransition | undefined {
    return this.transitions.get(`${from}-${to}`);
  }

  getNodesForSeason(season: AgriculturalCycle['season']): Set<string> {
    return this.nodeSeasonMap.get(season) || new Set();
  }

  getCurrentCycle(): AgriculturalCycle {
    return this.currentCycle;
  }

  updateCycle(): void {
    this.currentCycle = this.calculateCurrentCycle();
  }
}