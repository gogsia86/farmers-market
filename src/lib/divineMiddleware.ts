import { DivineState, DivineAction, DivineMiddleware } from './divineStateManager';

export const createDivineMiddleware = (
  config: Partial<DivineMiddleware>
): DivineMiddleware => ({
  name: 'unnamed-middleware',
  ...config,
});

export const karmaticBalanceMiddleware = createDivineMiddleware({
  name: 'karmatic-balance',
  before: (state, action) => ({
    ...state,
    meta: {
      ...state.meta,
      karmaticBalance: state.meta.karmaticBalance + (action.meta?.intentionPurity || 0.5) - 0.5,
    },
  }),
});

export const coherenceStabilizationMiddleware = createDivineMiddleware({
  name: 'coherence-stabilization',
  after: (state) => {
    const coherenceDecay = Math.max(0, (Date.now() - state.meta.timestamp) / (24 * 60 * 60 * 1000));
    return {
      ...state,
      meta: {
        ...state.meta,
        coherence: Math.max(0, state.meta.coherence - coherenceDecay),
      },
    };
  },
});

export const dimensionalHarmonyMiddleware = createDivineMiddleware({
  name: 'dimensional-harmony',
  before: (state, action) => {
    if (action.type === 'SHIFT_DIMENSION') {
      const harmonicResonance = calculateHarmonicResonance(state, action.payload as string);
      return {
        ...state,
        meta: {
          ...state.meta,
          coherence: state.meta.coherence * harmonicResonance,
        },
      };
    }
    return state;
  },
});

export const timelineProtectionMiddleware = createDivineMiddleware({
  name: 'timeline-protection',
  before: (state, action) => {
    if (action.type === 'MERGE_REALITY' && state.meta.coherence < 0.5) {
      throw new Error('Timeline merge rejected: Coherence too low');
    }
    return state;
  },
});

export const transcendencePrepMiddleware = createDivineMiddleware({
  name: 'transcendence-prep',
  before: (state, action) => {
    if (action.type === 'TRANSCEND') {
      if (state.meta.karmaticBalance < 0) {
        throw new Error('Transcendence rejected: Negative karmatic balance');
      }
      return {
        ...state,
        meta: {
          ...state.meta,
          coherence: 1.0, // Reset coherence for transcendence
          karmaticBalance: Math.max(0, state.meta.karmaticBalance - 1), // Consume karmatic balance
        },
      };
    }
    return state;
  },
});

function calculateHarmonicResonance(state: DivineState, targetDimension: string): number {
  const currentDimension = state.meta.dimension;
  if (currentDimension === targetDimension) return 1;

  const dimensionMap = {
    physical: 1,
    quantum: 2,
    spiritual: 3,
  };

  const current = dimensionMap[currentDimension as keyof typeof dimensionMap] || 1;
  const target = dimensionMap[targetDimension as keyof typeof dimensionMap] || 1;
  const difference = Math.abs(current - target);

  return 1 - (difference * 0.2); // 20% coherence loss per dimension shift
}

export const quantumObservationMiddleware = createDivineMiddleware({
  name: 'quantum-observation',
  after: (state, action) => {
    // Collapse quantum states based on observation
    if (state.meta.dimension === 'quantum') {
      const observationStrength = action.meta?.intentionPurity || 0.5;
      return {
        ...state,
        meta: {
          ...state.meta,
          coherence: state.meta.coherence * (1 - (1 - observationStrength) * 0.5),
        },
      };
    }
    return state;
  },
});

export const spiritualAlignmentMiddleware = createDivineMiddleware({
  name: 'spiritual-alignment',
  before: (state) => {
    if (state.meta.dimension === 'spiritual') {
      const alignmentFactor = Math.sin(Date.now() / (24 * 60 * 60 * 1000) * Math.PI) * 0.5 + 0.5;
      return {
        ...state,
        meta: {
          ...state.meta,
          coherence: state.meta.coherence * alignmentFactor,
        },
      };
    }
    return state;
  },
});

export const createDefaultMiddlewareStack = (): DivineMiddleware[] => [
  karmaticBalanceMiddleware,
  coherenceStabilizationMiddleware,
  dimensionalHarmonyMiddleware,
  timelineProtectionMiddleware,
  transcendencePrepMiddleware,
  quantumObservationMiddleware,
  spiritualAlignmentMiddleware,
];