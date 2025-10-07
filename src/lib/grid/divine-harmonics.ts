const PHI = 1.618033988749895;

export interface HarmonicRatio {
  value: number;
  resonance: number;
  consciousness: number;
}

export interface BiodynamicBalance {
  energy: number;
  flow: number;
  harmony: number;
  season: string;
}

export function calculateGoldenHarmonic(baseSize: number, depth: number = 1): HarmonicRatio {
  const value = baseSize * Math.pow(PHI, depth);
  const resonance = 1 / Math.pow(PHI, depth - 1);
  const consciousness = Math.tanh(depth / PHI);

  return {
    value,
    resonance,
    consciousness
  };
}

export function generateHarmonicSequence(
  baseSize: number,
  steps: number
): HarmonicRatio[] {
  return Array.from({ length: steps }, (_, i) => 
    calculateGoldenHarmonic(baseSize, i + 1)
  );
}

export function calculateBiodynamicBalance(
  currentPhase: number,
  season: string,
  energyField: number
): BiodynamicBalance {
  const seasonalMultiplier = getSeasonalMultiplier(season);
  const phaseAlignment = Math.sin(currentPhase * PHI);
  
  const energy = energyField * seasonalMultiplier;
  const flow = phaseAlignment * energy;
  const harmony = (energy + flow) / 2;

  return {
    energy,
    flow,
    harmony,
    season
  };
}

function getSeasonalMultiplier(season: string): number {
  switch (season.toUpperCase()) {
    case 'SPRING':
      return 1.2;
    case 'SUMMER':
      return 1.0;
    case 'FALL':
      return 0.8;
    case 'WINTER':
      return 0.6;
    default:
      return 1.0;
  }
}

export function createConsciousnessPattern(
  basePattern: number[],
  consciousnessLevel: number
): number[] {
  return basePattern.map(value => {
    const harmonicValue = value * PHI;
    const consciousnessModifier = Math.pow(consciousnessLevel, 1 / PHI);
    return harmonicValue * consciousnessModifier;
  });
}

export function harmonizeGridDimensions(
  width: number,
  height: number
): { width: number; height: number } {
  const ratio = width / height;
  const harmonicRatio = PHI;

  if (ratio > harmonicRatio) {
    return {
      width: height * harmonicRatio,
      height
    };
  } else {
    return {
      width,
      height: width / harmonicRatio
    };
  }
}