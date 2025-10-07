import { useState, useCallback } from 'react';
import { SacredVisualSystem, GeometricPrinciple, NaturalOrder } from '../lib/visual/types';

interface SacredVisualState extends SacredVisualSystem {
  updateGeometry: (updates: Partial<GeometricPrinciple>) => void;
  updateOrder: (updates: Partial<NaturalOrder>) => void;
  calculateResonance: () => number;
  validateHarmony: () => boolean;
}

export const useSacredVisualSystem = (
  initialState?: Partial<SacredVisualSystem>
): SacredVisualState => {
  const [system, setSystem] = useState<SacredVisualSystem>(() => ({
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
    dimensionalHarmony: true,
    ...initialState
  }));

  const calculateResonance = useCallback((): number => {
    const geometricResonance = system.geometry.gridHarmonics.resonance;
    const elementalValues = Object.values(system.order.elementalFlow) as number[];
    const elementalResonance = elementalValues.reduce((sum, value) => sum + value, 0) / 5;
    const seasonalValues = Object.values(system.order.seasonalBalance) as number[];
    const seasonalResonance = seasonalValues.reduce((sum, value) => sum + value, 0) / 4;
    const celestialValues = Object.values(system.order.celestialAlignment) as number[];
    const celestialResonance = celestialValues.reduce((sum, value) => sum + value, 0) / 3;

    const resonance = (
      geometricResonance +
      elementalResonance +
      seasonalResonance +
      celestialResonance +
      system.consciousness
    ) / 5;

    setSystem(prev => ({
      ...prev,
      resonance
    }));

    return resonance;
  }, [system]);

  const validateHarmony = useCallback((): boolean => {
    const resonance = calculateResonance();
    const harmony = resonance >= 0.618033988749895;

    setSystem(prev => ({
      ...prev,
      dimensionalHarmony: harmony
    }));

    return harmony;
  }, [calculateResonance]);

  const updateGeometry = useCallback((updates: Partial<GeometricPrinciple>): void => {
    setSystem(prev => {
      const updated = {
        ...prev,
        geometry: {
          ...prev.geometry,
          ...updates
        }
      };
      
      updated.resonance = calculateResonance();
      updated.dimensionalHarmony = validateHarmony();
      
      return updated;
    });
  }, [calculateResonance, validateHarmony]);

  const updateOrder = useCallback((updates: Partial<NaturalOrder>): void => {
    setSystem(prev => {
      const updated = {
        ...prev,
        order: {
          ...prev.order,
          ...updates
        }
      };
      
      updated.resonance = calculateResonance();
      updated.dimensionalHarmony = validateHarmony();
      
      return updated;
    });
  }, [calculateResonance, validateHarmony]);

  return {
    ...system,
    updateGeometry,
    updateOrder,
    calculateResonance,
    validateHarmony
  };
};