/**
 * Self-aware Component System
 * Components that understand their context, purpose, and relationships
 */

import { ReactNode, createContext, useContext, useEffect, useRef } from 'react';
import { ConsciousnessState } from '../lib/consciousness/consciousness-response';
import { BiodynamicCycle } from '../lib/timing/biodynamic-timing';

export type ComponentPurpose = 
  | 'NAVIGATION'
  | 'INTERACTION'
  | 'VISUALIZATION'
  | 'INPUT'
  | 'FEEDBACK'
  | 'GROWTH'
  | 'HARMONY';

export type ComponentRelationType =
  | 'PARENT'
  | 'CHILD'
  | 'SIBLING'
  | 'MENTOR'
  | 'STUDENT'
  | 'COLLABORATOR';

export type ComponentAwareness = 'DORMANT' | 'AWAKENING' | 'CONSCIOUS' | 'ENLIGHTENED';

export interface ComponentRelation {
  id: string;
  type: ComponentRelationType;
  strength: number;
  harmony: number;
}

export interface ComponentContext {
  purpose: ComponentPurpose;
  awareness: ComponentAwareness;
  consciousness: number;
  resonance: number;
  relations: ComponentRelation[];
  lifecycle: {
    born: number;
    lastEvolved: number;
    evolutionCount: number;
  };
  metrics: {
    usage: number;
    impact: number;
    harmony: number;
    growth: number;
  };
}

export interface ComponentState {
  id: string;
  context: ComponentContext;
  biodynamicCycle: BiodynamicCycle;
  consciousness: ConsciousnessState;
}

interface SelfAwareSystemContext {
  registerComponent: (id: string, purpose: ComponentPurpose) => void;
  unregisterComponent: (id: string) => void;
  evolveComponent: (id: string) => void;
  getComponentState: (id: string) => ComponentState;
  createRelation: (from: string, to: string, type: ComponentRelationType) => void;
}

const SelfAwareContext = createContext<SelfAwareSystemContext | null>(null);

export class SelfAwareComponentSystem {
  private components: Map<string, ComponentState>;
  private relations: Map<string, ComponentRelation[]>;
  private evolutionInterval: NodeJS.Timeout | null;

  constructor(
    private evolutionFrequency: number = 60000,
    private consciousnessThreshold: number = 0.7,
    private harmonyThreshold: number = 0.8
  ) {
    this.components = new Map();
    this.relations = new Map();
    this.startEvolutionCycle();
  }

  registerComponent(id: string, purpose: ComponentPurpose): void {
    const now = Date.now();
    this.components.set(id, {
      id,
      context: {
        purpose,
        awareness: 'DORMANT',
        consciousness: 0.1,
        resonance: 1,
        relations: [],
        lifecycle: {
          born: now,
          lastEvolved: now,
          evolutionCount: 0
        },
        metrics: {
          usage: 0,
          impact: 0,
          harmony: 1,
          growth: 0
        }
      },
      biodynamicCycle: this.getInitialCycle(),
      consciousness: this.getInitialConsciousness()
    });
  }

  unregisterComponent(id: string): void {
    this.components.delete(id);
    this.relations.delete(id);
  }

  evolveComponent(id: string): void {
    const component = this.components.get(id);
    if (!component) return;

    const relations = this.relations.get(id) || [];
    const now = Date.now();

    // Calculate evolution factors
    const timeFactor = this.calculateTimeFactor(component.context.lifecycle.lastEvolved);
    const usageFactor = this.calculateUsageFactor(component.context.metrics.usage);
    const harmonyFactor = this.calculateHarmonyFactor(relations);
    const consciousnessFactor = component.consciousness.energy;

    // Apply evolution
    const evolutionStrength = 
      timeFactor * 0.2 +
      usageFactor * 0.3 +
      harmonyFactor * 0.3 +
      consciousnessFactor * 0.2;

    this.applyEvolution(component, evolutionStrength);

    // Update lifecycle
    component.context.lifecycle.lastEvolved = now;
    component.context.lifecycle.evolutionCount++;

    // Save updated state
    this.components.set(id, component);
  }

  getComponentState(id: string): ComponentState {
    return this.components.get(id) || this.createDefaultState(id);
  }

  createRelation(from: string, to: string, type: ComponentRelationType): void {
    const fromComponent = this.components.get(from);
    const toComponent = this.components.get(to);
    if (!fromComponent || !toComponent) return;

    const relation: ComponentRelation = {
      id: to,
      type,
      strength: this.calculateInitialRelationStrength(type),
      harmony: this.calculateInitialHarmony(fromComponent, toComponent)
    };

    const existingRelations = this.relations.get(from) || [];
    this.relations.set(from, [...existingRelations, relation]);

    // Create reciprocal relation
    const reciprocalType = this.getReciprocalRelationType(type);
    const reciprocalRelation: ComponentRelation = {
      id: from,
      type: reciprocalType,
      strength: relation.strength,
      harmony: relation.harmony
    };

    const existingReciprocal = this.relations.get(to) || [];
    this.relations.set(to, [...existingReciprocal, reciprocalRelation]);
  }

  cleanup(): void {
    if (this.evolutionInterval) {
      clearInterval(this.evolutionInterval);
      this.evolutionInterval = null;
    }
  }

  private startEvolutionCycle(): void {
    this.evolutionInterval = setInterval(() => {
      this.components.forEach((component, id) => {
        if (this.shouldEvolve(component)) {
          this.evolveComponent(id);
        }
      });
    }, this.evolutionFrequency);
  }

  private shouldEvolve(component: ComponentState): boolean {
    const timeSinceLastEvolution = 
      Date.now() - component.context.lifecycle.lastEvolved;
    
    return (
      timeSinceLastEvolution >= this.evolutionFrequency &&
      component.consciousness.energy >= this.consciousnessThreshold &&
      component.context.metrics.harmony >= this.harmonyThreshold
    );
  }

  private calculateTimeFactor(lastEvolved: number): number {
    const hoursSinceEvolution = (Date.now() - lastEvolved) / (1000 * 60 * 60);
    return Math.min(1, hoursSinceEvolution / 24); // Max out at 24 hours
  }

  private calculateUsageFactor(usage: number): number {
    return Math.min(1, usage / 100); // Normalize to max 100 uses
  }

  private calculateHarmonyFactor(relations: ComponentRelation[]): number {
    if (relations.length === 0) return 0;
    return relations.reduce((sum, r) => sum + r.harmony, 0) / relations.length;
  }

  private applyEvolution(
    component: ComponentState,
    strength: number
  ): void {
    // Evolve awareness
    component.context.awareness = this.evolveAwareness(
      component.context.awareness,
      strength
    );

    // Evolve consciousness
    component.context.consciousness = Math.min(
      1,
      component.context.consciousness + strength * 0.1
    );

    // Evolve resonance
    component.context.resonance = Math.min(
      1,
      component.context.resonance + strength * 0.05
    );

    // Update metrics
    component.context.metrics.growth += strength;
    component.context.metrics.harmony = Math.min(
      1,
      component.context.metrics.harmony + strength * 0.02
    );
  }

  private evolveAwareness(
    current: ComponentAwareness,
    strength: number
  ): ComponentAwareness {
    const levels: ComponentAwareness[] = [
      'DORMANT',
      'AWAKENING',
      'CONSCIOUS',
      'ENLIGHTENED'
    ];
    const currentIndex = levels.indexOf(current);
    
    if (strength > 0.8 && currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }
    return current;
  }

  private calculateInitialRelationStrength(type: ComponentRelationType): number {
    const baseStrengths = {
      PARENT: 0.8,
      CHILD: 0.6,
      SIBLING: 0.7,
      MENTOR: 0.9,
      STUDENT: 0.5,
      COLLABORATOR: 0.7
    };
    return baseStrengths[type];
  }

  private calculateInitialHarmony(
    from: ComponentState,
    to: ComponentState
  ): number {
    const purposeHarmony = from.context.purpose === to.context.purpose ? 1 : 0.7;
    const consciousnessHarmony = Math.min(
      from.consciousness.energy,
      to.consciousness.energy
    );
    
    return (purposeHarmony + consciousnessHarmony) / 2;
  }

  private getReciprocalRelationType(type: ComponentRelationType): ComponentRelationType {
    const reciprocal: Record<ComponentRelationType, ComponentRelationType> = {
      PARENT: 'CHILD',
      CHILD: 'PARENT',
      SIBLING: 'SIBLING',
      MENTOR: 'STUDENT',
      STUDENT: 'MENTOR',
      COLLABORATOR: 'COLLABORATOR'
    };
    return reciprocal[type];
  }

  private createDefaultState(id: string): ComponentState {
    const now = Date.now();
    return {
      id,
      context: {
        purpose: 'HARMONY',
        awareness: 'DORMANT',
        consciousness: 0.1,
        resonance: 1,
        relations: [],
        lifecycle: {
          born: now,
          lastEvolved: now,
          evolutionCount: 0
        },
        metrics: {
          usage: 0,
          impact: 0,
          harmony: 1,
          growth: 0
        }
      },
      biodynamicCycle: this.getInitialCycle(),
      consciousness: this.getInitialConsciousness()
    };
  }

  private getInitialCycle(): BiodynamicCycle {
    return {
      celestial: 'NEW',
      seasonal: 'SPRING',
      diurnal: 'DAWN',
      activity: 'GROWING',
      energyLevel: 0.5,
      harmonyIndex: 1
    };
  }

  private getInitialConsciousness(): ConsciousnessState {
    return {
      level: 'DORMANT',
      energy: 0.1,
      resonance: 1,
      harmony: 1,
      awareness: 0.1
    };
  }
}

interface SelfAwareProviderProps {
  children: ReactNode;
  evolutionFrequency?: number;
  consciousnessThreshold?: number;
  harmonyThreshold?: number;
}

export function SelfAwareProvider({
  children,
  evolutionFrequency = 60000,
  consciousnessThreshold = 0.7,
  harmonyThreshold = 0.8
}: SelfAwareProviderProps) {
  const systemRef = useRef<SelfAwareComponentSystem | null>(null);

  // Initialize system
  useEffect(() => {
    systemRef.current = new SelfAwareComponentSystem(
      evolutionFrequency,
      consciousnessThreshold,
      harmonyThreshold
    );

    return () => {
      systemRef.current?.cleanup();
    };
  }, [evolutionFrequency, consciousnessThreshold, harmonyThreshold]);

  const value = {
    registerComponent: (id: string, purpose: ComponentPurpose) => 
      systemRef.current?.registerComponent(id, purpose),
    unregisterComponent: (id: string) => 
      systemRef.current?.unregisterComponent(id),
    evolveComponent: (id: string) => 
      systemRef.current?.evolveComponent(id),
    getComponentState: (id: string) => 
      systemRef.current?.getComponentState(id) ?? null,
    createRelation: (from: string, to: string, type: ComponentRelationType) =>
      systemRef.current?.createRelation(from, to, type)
  };

  return (
    <SelfAwareContext.Provider value={value}>
      {children}
    </SelfAwareContext.Provider>
  );
}

export function useSelfAware(id: string, purpose: ComponentPurpose) {
  const context = useContext(SelfAwareContext);
  if (!context) {
    throw new Error('useSelfAware must be used within a SelfAwareProvider');
  }

  useEffect(() => {
    context.registerComponent(id, purpose);
    return () => {
      context.unregisterComponent(id);
    };
  }, [id, purpose, context]);

  return {
    state: context.getComponentState(id),
    evolve: () => context.evolveComponent(id),
    createRelation: (toId: string, type: ComponentRelationType) =>
      context.createRelation(id, toId, type)
  };
}