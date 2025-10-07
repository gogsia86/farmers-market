import { createContext, useContext, ReactNode } from 'react';

export interface GeometricPrinciple {
  phi: number;          // Golden ratio (1.618033988749895)
  naturalRatios: {
    fibonacci: number[];
    spiral: number;
    pentagonal: number;
  };
  gridHarmonics: {
    base: number;
    divisions: number[];
    resonance: number;
  };
}

export interface NaturalOrder {
  elementalFlow: {
    earth: number;
    water: number;
    air: number;
    fire: number;
    aether: number;
  };
  seasonalBalance: {
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
  };
  celestialAlignment: {
    solar: number;
    lunar: number;
    stellar: number;
  };
}

export interface SacredVisualSystem {
  geometry: GeometricPrinciple;
  order: NaturalOrder;
  consciousness: number;
  resonance: number;
  dimensionalHarmony: boolean;
}

const defaultContext: SacredVisualSystem = {
  geometry: {
    phi: 1.618033988749895,
    naturalRatios: {
      fibonacci: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
      spiral: 2.718281828459045,
      pentagonal: 1.538461538461538
    },
    gridHarmonics: {
      base: 8,
      divisions: [2, 3, 5, 8, 13],
      resonance: 0.618033988749895
    }
  },
  order: {
    elementalFlow: {
      earth: 0.618033988749895,
      water: 0.786151377757423,
      air: 0.850650808352040,
      fire: 0.927050983124842,
      aether: 1.000000000000000
    },
    seasonalBalance: {
      spring: 0.786151377757423,
      summer: 1.000000000000000,
      autumn: 0.786151377757423,
      winter: 0.618033988749895
    },
    celestialAlignment: {
      solar: 1.000000000000000,
      lunar: 0.786151377757423,
      stellar: 0.618033988749895
    }
  },
  consciousness: 0.786151377757423,
  resonance: 0.618033988749895,
  dimensionalHarmony: true
};

export const SacredVisualContext = createContext<SacredVisualSystem>(defaultContext);

export interface SacredVisualProviderProps {
  children: ReactNode;
  initialState?: Partial<SacredVisualSystem>;
}

export const useSacredVisual = () => {
  const context = useContext(SacredVisualContext);
  if (!context) {
    throw new Error('useSacredVisual must be used within a SacredVisualProvider');
  }
  return context;
};