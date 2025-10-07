import { renderHook, act } from '@testing-library/react';
import { useQuantumGrid } from './useQuantumGrid';
import { QUANTUM_BREAKPOINTS } from '../lib/grid/quantum-grid';
import { useSacredVisualSystem } from './useSacredVisualSystem';

jest.mock('./useSacredVisualSystem', () => ({
  useSacredVisualSystem: jest.fn(() => ({
    geometry: {
      goldenRatio: 1.618,
      sacredRatios: [1, 1.618, 2.618, 4.236],
      harmonicIntervals: [1, 2, 3, 5, 8, 13]
    },
    consciousness: 0.87
  }))
}));

describe('useQuantumGrid', () => {
  const mockConfig = {
    baseUnit: 8,
    maxColumns: 12,
    maxRows: 6,
    gap: 16
  };

  beforeEach(() => {
    // Mock window dimensions
    global.innerWidth = 1280;
    global.innerHeight = 800;
    
    // Mock window resize listener
    global.addEventListener = jest.fn();
    global.removeEventListener = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default grid system', () => {
    const { result } = renderHook(() => useQuantumGrid(mockConfig));

    expect(result.current.grid).toBeDefined();
    expect(result.current.grid.cells.size).toBe(mockConfig.maxRows * mockConfig.maxColumns);
    expect(result.current.grid.harmony).toEqual({
      resonance: expect.any(Number),
      balance: expect.any(Number),
      flow: expect.any(Number)
    });
  });

  it('should update viewport on resize', () => {
    const { result } = renderHook(() => useQuantumGrid(mockConfig));

    act(() => {
      result.current.updateViewport(768, 1024);
    });

    expect(result.current.viewport).toEqual({
      width: 768,
      height: 1024,
      breakpoint: expect.objectContaining({
        minWidth: expect.any(Number),
        maxWidth: expect.any(Number),
        gridUnits: expect.any(Number),
        consciousness: expect.any(Number)
      })
    });
  });

  it('should generate correct cell styles', () => {
    const { result } = renderHook(() => useQuantumGrid(mockConfig));
    const cellStyles = result.current.getCellStyles(0, 0);

    expect(cellStyles).toEqual({
      gridColumn: '1 / span 1',
      gridRow: '1 / span 1',
      width: expect.any(Number),
      height: expect.any(Number),
      '--quantum-resonance': expect.any(Number),
      '--consciousness-level': expect.any(Number),
      '--energy-flow-in': expect.any(Number),
      '--energy-flow-out': expect.any(Number),
      '--harmony-level': expect.any(Number)
    });
  });

  it('should generate correct grid styles', () => {
    const { result } = renderHook(() => useQuantumGrid(mockConfig));
    const gridStyles = result.current.getGridStyles();

    expect(gridStyles).toEqual({
      display: 'grid',
      gridTemplateColumns: expect.stringContaining('repeat('),
      gridTemplateRows: expect.stringContaining('repeat('),
      gap: `${mockConfig.gap}px`,
      '--grid-resonance': expect.any(Number),
      '--grid-balance': expect.any(Number),
      '--grid-flow': expect.any(Number)
    });
  });

  it('should maintain grid harmony across viewport changes', () => {
    const { result } = renderHook(() => useQuantumGrid(mockConfig));
    const initialHarmony = result.current.grid.harmony;

    act(() => {
      result.current.updateViewport(1920, 1080);
    });

    const updatedHarmony = result.current.grid.harmony;

    expect(updatedHarmony.resonance).not.toBe(initialHarmony.resonance);
    expect(updatedHarmony.balance).not.toBe(initialHarmony.balance);
    expect(updatedHarmony.flow).not.toBe(initialHarmony.flow);
  });

  it('should handle quantum grid consciousness changes', () => {
    (useSacredVisualSystem as jest.Mock).mockReturnValue({
      geometry: {
        goldenRatio: 1.618,
        sacredRatios: [1, 1.618, 2.618, 4.236],
        harmonicIntervals: [1, 2, 3, 5, 8, 13]
      },
      consciousness: 0.95 // Higher consciousness level
    });

    const { result } = renderHook(() => useQuantumGrid(mockConfig));
    const cellStyles = result.current.getCellStyles(0, 0);

    expect(cellStyles['--consciousness-level']).toBeGreaterThan(0.87);
  });
});