import type { 
  AgriculturalNode, 
  PathfindingCriteria, 
  NavigationState,
  PathOptimizationStrategy
} from './agricultural-types';

interface PathSegment {
  nodes: string[];
  resonance: number;
  energyCost: number;
  seasonalAlignment: number;
}

export class AgriculturalPathfinder {
  private nodes: Map<string, AgriculturalNode>;
  private currentState: NavigationState;

  constructor(nodes: Map<string, AgriculturalNode>) {
    this.nodes = nodes;
    this.currentState = {
      currentNode: '',
      currentPath: [],
      availablePaths: [],
      seasonalAlignment: 1,
      consciousness: 1
    };
  }

  findPath(
    start: string,
    end: string,
    criteria: PathfindingCriteria,
    strategy: PathOptimizationStrategy = 'BALANCED'
  ): PathSegment[] {
    const visited = new Set<string>();
    const paths: PathSegment[] = [];
    
    const explore = (
      current: string,
      path: string[],
      totalEnergy: number,
      totalResonance: number
    ) => {
      if (current === end) {
        paths.push({
          nodes: [...path],
          resonance: totalResonance / path.length,
          energyCost: totalEnergy,
          seasonalAlignment: this.calculateSeasonalAlignment(path, criteria)
        });
        return;
      }

      const currentNode = this.nodes.get(current);
      if (!currentNode) return;

      for (const nextId of currentNode.nextNodes) {
        if (visited.has(nextId)) continue;
        
        const nextNode = this.nodes.get(nextId);
        if (!nextNode) continue;

        if (!this.isNodeAccessible(nextNode, criteria)) continue;

        visited.add(nextId);
        explore(
          nextId,
          [...path, nextId],
          totalEnergy + nextNode.energyRequirement,
          totalResonance + this.calculateNodeResonance(nextNode, criteria)
        );
        visited.delete(nextId);
      }
    };

    visited.add(start);
    explore(start, [start], 0, 0);

    return this.optimizePaths(paths, strategy, criteria);
  }

  private isNodeAccessible(
    node: AgriculturalNode,
    criteria: PathfindingCriteria
  ): boolean {
    return (
      criteria.consciousness >= node.consciousnessThreshold &&
      criteria.energyLevel >= node.energyRequirement
    );
  }

  private calculateNodeResonance(
    node: AgriculturalNode,
    criteria: PathfindingCriteria
  ): number {
    const seasonalAlignment = node.season === criteria.currentSeason ? 1 :
      node.season === criteria.targetSeason ? 0.8 :
      0.5;

    const phaseAlignment = criteria.preferredPhase === node.phase ? 1 : 0.7;
    const consciousnessAlignment = Math.min(criteria.consciousness / node.consciousnessThreshold, 1);

    return (seasonalAlignment + phaseAlignment + consciousnessAlignment) / 3;
  }

  private calculateSeasonalAlignment(
    path: string[],
    criteria: PathfindingCriteria
  ): number {
    let alignment = 0;
    let seasonTransitions = 0;
    let lastSeason = criteria.currentSeason;

    for (const nodeId of path) {
      const node = this.nodes.get(nodeId);
      if (!node) continue;

      if (node.season !== lastSeason) {
        seasonTransitions++;
        lastSeason = node.season;
      }

      alignment += node.season === criteria.targetSeason ? 1 : 0.5;
    }

    // Penalize excessive season transitions
    const transitionPenalty = Math.max(0, seasonTransitions - 1) * 0.1;
    return (alignment / path.length) - transitionPenalty;
  }

  private optimizePaths(
    paths: PathSegment[],
    strategy: PathOptimizationStrategy,
    criteria: PathfindingCriteria
  ): PathSegment[] {
    const weightedPaths = paths.map(path => ({
      ...path,
      score: this.calculatePathScore(path, strategy, criteria)
    }));

    return weightedPaths
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...path }) => path);
  }

  private calculatePathScore(
    path: PathSegment,
    strategy: PathOptimizationStrategy,
    criteria: PathfindingCriteria
  ): number {
    switch (strategy) {
      case 'ENERGY_EFFICIENT':
        return 1 / (path.energyCost + 1);
      case 'CONSCIOUSNESS_ALIGNED':
        return path.resonance;
      case 'SEASON_OPTIMIZED':
        return path.seasonalAlignment;
      case 'BALANCED':
      default:
        return (
          (1 / (path.energyCost + 1)) * 0.3 +
          path.resonance * 0.3 +
          path.seasonalAlignment * 0.4
        );
    }
  }

  updateState(state: Partial<NavigationState>): void {
    this.currentState = {
      ...this.currentState,
      ...state
    };
  }

  getCurrentState(): NavigationState {
    return this.currentState;
  }
}