import { renderHook, act } from '@testing-library/react-hooks';
import { useSacredVisualSystem } from './useSacredVisualSystem';

describe('useSacredVisualSystem', () => {
  it('should initialize with default sacred geometry values', () => {
    const { result } = renderHook(() => useSacredVisualSystem());
    
    expect(result.current.geometry.phi).toBe(1.618033988749895);
    expect(result.current.geometry.naturalRatios.fibonacci).toHaveLength(10);
    expect(result.current.geometry.gridHarmonics.resonance).toBe(0.618033988749895);
  });

  it('should initialize with default natural order values', () => {
    const { result } = renderHook(() => useSacredVisualSystem());
    
    expect(result.current.order.elementalFlow.earth).toBe(0.618033988749895);
    expect(result.current.order.seasonalBalance.summer).toBe(1.0);
    expect(result.current.order.celestialAlignment.solar).toBe(1.0);
  });

  it('should update geometric principles while maintaining harmony', () => {
    const { result } = renderHook(() => useSacredVisualSystem());

    act(() => {
      result.current.updateGeometry({
        gridHarmonics: {
          base: 13,
          divisions: [3, 5, 8, 13, 21],
          resonance: 0.786151377757423
        }
      });
    });

    expect(result.current.geometry.gridHarmonics.base).toBe(13);
    expect(result.current.dimensionalHarmony).toBe(true);
    expect(result.current.resonance).toBeGreaterThan(0.618033988749895);
  });

  it('should update natural order while preserving resonance', () => {
    const { result } = renderHook(() => useSacredVisualSystem());

    act(() => {
      result.current.updateOrder({
        elementalFlow: {
          ...result.current.order.elementalFlow,
          earth: 0.786151377757423,
          water: 0.850650808352040
        }
      });
    });

    expect(result.current.order.elementalFlow.earth).toBe(0.786151377757423);
    expect(result.current.resonance).toBeGreaterThan(0.618033988749895);
  });

  it('should calculate resonance based on all system aspects', () => {
    const { result } = renderHook(() => useSacredVisualSystem());

    const initialResonance = result.current.resonance;
    
    act(() => {
      result.current.updateGeometry({
        gridHarmonics: {
          ...result.current.geometry.gridHarmonics,
          resonance: 1.0
        }
      });
    });

    expect(result.current.calculateResonance()).toBeGreaterThan(initialResonance);
  });

  it('should validate dimensional harmony', () => {
    const { result } = renderHook(() => useSacredVisualSystem());

    const initialHarmony = result.current.dimensionalHarmony;
    
    act(() => {
      result.current.updateOrder({
        elementalFlow: {
          earth: 0.1,
          water: 0.1,
          air: 0.1,
          fire: 0.1,
          aether: 0.1
        }
      });
    });

    expect(result.current.validateHarmony()).toBe(false);
    expect(result.current.dimensionalHarmony).not.toBe(initialHarmony);
  });

  it('should maintain quantum coherence across updates', () => {
    const { result } = renderHook(() => useSacredVisualSystem());

    act(() => {
      result.current.updateGeometry({
        naturalRatios: {
          ...result.current.geometry.naturalRatios,
          spiral: 3.141592653589793
        }
      });

      result.current.updateOrder({
        celestialAlignment: {
          ...result.current.order.celestialAlignment,
          lunar: 0.927050983124842
        }
      });
    });

    expect(result.current.calculateResonance()).toBeGreaterThan(0.618033988749895);
    expect(result.current.validateHarmony()).toBe(true);
  });
});