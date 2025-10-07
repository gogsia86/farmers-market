import { GeometricPrinciple } from '../visual/types';
import { calculateGoldenHarmonic, calculateBiodynamicBalance, type HarmonicRatio, type BiodynamicBalance } from './divine-harmonics';

export interface QuantumGridUnit {
  base: number;
  phi: number;
  consciousness: number;
  resonance: number;
}

export interface QuantumGridDimension {
  size: number;
  units: QuantumGridUnit[];
  harmonics: number[];
  flow: 'horizontal' | 'vertical' | 'radial';
}

export interface QuantumGridCell {
  x: number;
  y: number;
  width: number;
  height: number;
  resonance: number;
  consciousness: number;
  harmonics: HarmonicRatio;
  biodynamics: BiodynamicBalance;
  energyFlow: {
    input: number;
    output: number;
    harmony: number;
  };
}

export interface QuantumGridSystem {
  dimensions: {
    rows: QuantumGridDimension;
    columns: QuantumGridDimension;
    depth: QuantumGridDimension;
  };
  cells: Map<string, QuantumGridCell>;
  harmony: {
    resonance: number;
    balance: number;
    flow: number;
  };
}

export interface QuantumBreakpoint {
  name: string;
  minWidth: number;
  maxWidth: number | null;
  gridUnits: number;
  consciousness: number;
}

export const CONSCIOUSNESS_LEVELS = {
  MORTAL: 0.618033988749895, // Golden ratio reciprocal
  HEROIC: 0.786151377757423, // φ^-0.8
  DEMIGOD: 0.850650808352040, // φ^-0.6
  DEITY: 0.927050983124842,  // φ^-0.4
  DIVINE: 1.000000000000000  // Perfect consciousness
};

export const QUANTUM_BREAKPOINTS: QuantumBreakpoint[] = [
  {
    name: 'seed',
    minWidth: 0,
    maxWidth: 639,
    gridUnits: 4,
    consciousness: CONSCIOUSNESS_LEVELS.MORTAL
  },
  {
    name: 'sprout',
    minWidth: 640,
    maxWidth: 767,
    gridUnits: 6,
    consciousness: 0.786151377757423
  },
  {
    name: 'growth',
    minWidth: 768,
    maxWidth: 1023,
    gridUnits: 8,
    consciousness: 0.850650808352040
  },
  {
    name: 'bloom',
    minWidth: 1024,
    maxWidth: 1279,
    gridUnits: 12,
    consciousness: 0.927050983124842
  },
  {
    name: 'harvest',
    minWidth: 1280,
    maxWidth: null,
    gridUnits: 16,
    consciousness: 1.000000000000000
  }
];

export const calculateGridUnit = (
  baseSize: number,
  geometry: GeometricPrinciple,
  consciousness: number
): QuantumGridUnit => {
  const phi = geometry.phi;
  const resonance = (consciousness * phi) / 2;

  return {
    base: baseSize,
    phi,
    consciousness,
    resonance
  };
};

export const calculateHarmonics = (
  unit: QuantumGridUnit,
  count: number
): number[] => {
  const harmonics: number[] = [];
  let current = unit.base;

  for (let i = 0; i < count; i++) {
    harmonics.push(current);
    current *= unit.phi;
  }

  return harmonics;
};

export const createGridDimension = (
  size: number,
  flow: QuantumGridDimension['flow'],
  unit: QuantumGridUnit
): QuantumGridDimension => {
  const harmonics = calculateHarmonics(unit, Math.ceil(size / unit.base));
  const units = Array(size).fill(unit);

  return {
    size,
    units,
    harmonics,
    flow
  };
};

export const calculateGridHarmony = (
  cells: Map<string, QuantumGridCell>
): QuantumGridSystem['harmony'] => {
  let totalResonance = 0;
  let totalBalance = 0;
  let totalFlow = 0;
  const cellCount = cells.size;

  cells.forEach(cell => {
    totalResonance += cell.resonance;
    totalBalance += Math.abs(cell.energyFlow.input - cell.energyFlow.output);
    totalFlow += cell.energyFlow.harmony;
  });

  return {
    resonance: totalResonance / cellCount,
    balance: 1 - (totalBalance / cellCount),
    flow: totalFlow / cellCount
  };
};

export const getCellKey = (x: number, y: number): string => `${x},${y}`;

export const createQuantumCell = (
  x: number,
  y: number,
  width: number,
  height: number,
  consciousness: number,
  season: string = 'SUMMER'
): QuantumGridCell => {
  const harmonics = calculateGoldenHarmonic(Math.max(width, height), Math.max(x, y) + 1);
  const biodynamics = calculateBiodynamicBalance(
    (x + y) / 10, // Phase based on position
    season,
    consciousness
  );
  
  const resonance = harmonics.resonance * biodynamics.harmony;
  const energyFlow = {
    input: biodynamics.energy * harmonics.consciousness,
    output: biodynamics.flow * harmonics.consciousness,
    harmony: (biodynamics.harmony + harmonics.resonance) / 2
  };

  return {
    x,
    y,
    width: width * harmonics.resonance,
    height: height * harmonics.resonance,
    resonance,
    consciousness: consciousness * harmonics.consciousness,
    harmonics,
    biodynamics,
    energyFlow
  };
};