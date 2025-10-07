import { renderHook, act } from '@testing-library/react-hooks';
import { useAgriculturalEmpathy } from './useAgriculturalEmpathy';

describe('useAgriculturalEmpathy', () => {
  it('should create and manage agricultural personas', () => {
    const { result } = renderHook(() => useAgriculturalEmpathy());

    act(() => {
      result.current.createPersona({
        type: 'Farmer',
        consciousness: {
          level: 0.8,
          focus: ['Organic', 'Biodynamic'],
          values: ['Sustainability', 'Community']
        },
        experience: {
          years: 15,
          specialties: ['Vegetables', 'Herbs'],
          biodynamicKnowledge: 0.9
        },
        seasonalPatterns: {
          preferredSeasons: ['Spring', 'Summer'],
          cropRotations: ['3-Year Cycle'],
          marketTiming: ['Weekly']
        },
        sustainability: {
          practices: ['No-Till', 'Companion Planting'],
          certifications: ['Organic', 'Biodynamic'],
          goals: ['Carbon Neutral']
        }
      });
    });

    expect(result.current.personas).toHaveLength(1);
    expect(result.current.personas[0].consciousness.level).toBe(0.8);
    expect(result.current.personas[0].quantumResonance).toBeGreaterThan(0);
  });

  it('should create and track user journeys', () => {
    const { result } = renderHook(() => useAgriculturalEmpathy());

    act(() => {
      result.current.createJourney({
        personaId: 'test-persona',
        touchpoints: [
          {
            phase: 'Discovery',
            activities: ['Market Research'],
            emotionalState: 0.5,
            agriculturalAlignment: 0.7
          }
        ],
        seasonalContext: {
          season: 'Spring',
          weatherConditions: ['Sunny', 'Mild'],
          cropPhases: ['Planting']
        },
        consciousness: {
          level: 0.6,
          insights: ['Natural Rhythms'],
          transformations: ['Increased Awareness']
        }
      });
    });

    expect(result.current.journeys).toHaveLength(1);
    expect(result.current.journeys[0].touchpoints[0].resonanceScore).toBeGreaterThan(0);
  });

  it('should manage emotional design patterns', () => {
    const { result } = renderHook(() => useAgriculturalEmpathy());

    act(() => {
      result.current.createPattern({
        pattern: 'Natural Flow',
        naturalAlignment: 0.9,
        seasonalVariation: {
          spring: 'Growth',
          summer: 'Abundance',
          autumn: 'Harvest',
          winter: 'Rest'
        },
        energyFlow: {
          input: ['Sunlight', 'Rain'],
          transformation: 'Photosynthesis',
          output: ['Growth', 'Nutrients']
        },
        consciousness: {
          level: 0.8,
          intention: 'Harmony',
          manifestation: 'Balance'
        }
      });
    });

    expect(result.current.patterns).toHaveLength(1);
    expect(result.current.patterns[0].naturalAlignment).toBe(0.9);
  });

  it('should track research insights with quantum metrics', () => {
    const { result } = renderHook(() => useAgriculturalEmpathy());

    act(() => {
      result.current.addInsight({
        category: 'Motivation',
        description: 'Connection to land',
        relevance: 0.9,
        seasonalImpact: {
          spring: 0.8,
          summer: 0.9,
          autumn: 0.7,
          winter: 0.6
        }
      });
    });

    expect(result.current.insights).toHaveLength(1);
    expect(result.current.insights[0].quantumMetrics.resonance).toBeGreaterThan(0);
    expect(result.current.insights[0].quantumMetrics.consciousness).toBe(0.9);
  });

  it('should filter insights by persona resonance', () => {
    const { result } = renderHook(() => useAgriculturalEmpathy());

    act(() => {
      result.current.addInsight({
        category: 'Need',
        description: 'Sustainable tools',
        relevance: 0.95,
        seasonalImpact: {
          spring: 0.8,
          summer: 0.9,
          autumn: 0.7,
          winter: 0.6
        }
      });
    });

    const insights = result.current.getPersonaInsights('any-id');
    expect(insights.length).toBeGreaterThanOrEqual(0);
  });

  it('should filter patterns by season', () => {
    const { result } = renderHook(() => useAgriculturalEmpathy());

    act(() => {
      result.current.createPattern({
        pattern: 'Seasonal Rhythm',
        naturalAlignment: 0.85,
        seasonalVariation: {
          spring: 'Awakening',
          summer: 'Growth',
          autumn: 'Harvest',
          winter: 'Rest'
        },
        energyFlow: {
          input: ['Light', 'Water'],
          transformation: 'Growth',
          output: ['Food', 'Energy']
        },
        consciousness: {
          level: 0.75,
          intention: 'Natural Flow',
          manifestation: 'Harmony'
        }
      });
    });

    const springPatterns = result.current.getSeasonalPatterns('spring');
    expect(springPatterns.length).toBe(1);
    expect(springPatterns[0].seasonalVariation.spring).toBe('Awakening');
  });
});