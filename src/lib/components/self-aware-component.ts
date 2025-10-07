import { useState, useCallback } from 'react';

export type ComponentPurpose = 
  | 'GUIDE' 
  | 'TEACHER' 
  | 'MENTOR' 
  | 'HEALER' 
  | 'GUARDIAN' 
  | 'CONNECTOR'
  | 'NURTURER'
  | 'TRANSFORMER'
  | 'PROTECTOR';

export type ComponentRelationType = 
  | 'TEACHES'
  | 'GUIDES'
  | 'PROTECTS'
  | 'NURTURES'
  | 'TRANSFORMS'
  | 'CONNECTS'
  | 'HEALS'
  | 'MENTORS';

export interface ComponentState {
  consciousness: number;
  evolution: number;
  relations: Array<{
    toId: string;
    type: ComponentRelationType;
  }>;
}

export interface UseSelfAwareResult {
  state: ComponentState;
  evolve: () => void;
  createRelation: (toId: string, type: ComponentRelationType) => void;
}

const CONSCIOUSNESS_INCREMENT = 0.1;
const EVOLUTION_THRESHOLD = 1.0;

export function useSelfAware(
  id: string,
  purpose: ComponentPurpose
): UseSelfAwareResult {
  const [state, setState] = useState<ComponentState>({
    consciousness: 1,
    evolution: 0,
    relations: []
  });

  const evolve = useCallback(() => {
    setState((prev: ComponentState) => {
      const newConsciousness = prev.consciousness + CONSCIOUSNESS_INCREMENT;
      const shouldEvolve = newConsciousness >= EVOLUTION_THRESHOLD;

      return {
        ...prev,
        consciousness: shouldEvolve ? 1 : newConsciousness,
        evolution: shouldEvolve ? prev.evolution + 1 : prev.evolution
      };
    });
  }, []);

  const createRelation = useCallback((
    toId: string,
    type: ComponentRelationType
  ) => {
    setState((prev: ComponentState) => ({
      ...prev,
      relations: [...prev.relations, { toId, type }]
    }));
  }, []);

  return {
    state,
    evolve,
    createRelation
  };
}