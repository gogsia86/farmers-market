import { useState, useCallback, useEffect } from 'react';
import { useSacredVisualSystem } from './useSacredVisualSystem';
import {
  QuantumGridSystem,
  QuantumGridUnit,
  QuantumGridCell,
  QuantumBreakpoint,
  QUANTUM_BREAKPOINTS,
  calculateGridUnit,
  createGridDimension,
  calculateGridHarmony,
  getCellKey,
  createQuantumCell
} from '../lib/grid/quantum-grid';

interface GridConfig {
  baseUnit: number;
  maxColumns: number;
  maxRows: number;
  gap: number;
}

interface Viewport {
  width: number;
  height: number;
  breakpoint: QuantumBreakpoint;
}

export const useQuantumGrid = (config: GridConfig) => {
  const { geometry, consciousness } = useSacredVisualSystem();
  const [viewport, setViewport] = useState<Viewport>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    breakpoint: QUANTUM_BREAKPOINTS[4] // harvest by default
  });
  
  const [grid, setGrid] = useState<QuantumGridSystem>(() => {
    const unit = calculateGridUnit(config.baseUnit, geometry, consciousness);
    return {
      dimensions: {
        rows: createGridDimension(config.maxRows, 'vertical', unit),
        columns: createGridDimension(config.maxColumns, 'horizontal', unit),
        depth: createGridDimension(1, 'radial', unit)
      },
      cells: new Map(),
      harmony: {
        resonance: 0,
        balance: 0,
        flow: 0
      }
    };
  });

  const updateViewport = useCallback((width: number, height: number) => {
    const breakpoint = QUANTUM_BREAKPOINTS.find(bp => 
      width >= bp.minWidth && (!bp.maxWidth || width <= bp.maxWidth)
    ) || QUANTUM_BREAKPOINTS[4];

    setViewport({ width, height, breakpoint });
  }, []);

  const calculateGridLayout = useCallback(() => {
    const { breakpoint } = viewport;
    const unit = calculateGridUnit(config.baseUnit, geometry, breakpoint.consciousness);
    const cellWidth = unit.base + config.gap;
    const cellHeight = unit.base + config.gap;
    const cells = new Map<string, QuantumGridCell>();

    for (let y = 0; y < config.maxRows; y++) {
      for (let x = 0; x < breakpoint.gridUnits; x++) {
        const cell = createQuantumCell(
          x,
          y,
          cellWidth,
          cellHeight,
          breakpoint.consciousness * consciousness
        );
        cells.set(getCellKey(x, y), cell);
      }
    }

    const harmony = calculateGridHarmony(cells);

    setGrid((prev: QuantumGridSystem) => ({
      ...prev,
      cells,
      harmony,
      dimensions: {
        ...prev.dimensions,
        columns: createGridDimension(breakpoint.gridUnits, 'horizontal', unit)
      }
    }));
  }, [viewport, geometry, consciousness, config]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        updateViewport(window.innerWidth, window.innerHeight);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [updateViewport]);

  useEffect(() => {
    calculateGridLayout();
  }, [calculateGridLayout]);

  const getCellStyles = useCallback((x: number, y: number) => {
    const cell = grid.cells.get(getCellKey(x, y));
    if (!cell) return {};

    return {
      gridColumn: `${x + 1} / span 1`,
      gridRow: `${y + 1} / span 1`,
      width: cell.width,
      height: cell.height,
      '--quantum-resonance': cell.resonance,
      '--consciousness-level': cell.consciousness,
      '--energy-flow-in': cell.energyFlow.input,
      '--energy-flow-out': cell.energyFlow.output,
      '--harmony-level': cell.energyFlow.harmony
    };
  }, [grid.cells]);

  const getGridStyles = useCallback(() => {
    const { breakpoint } = viewport;
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${breakpoint.gridUnits}, 1fr)`,
      gridTemplateRows: `repeat(${config.maxRows}, 1fr)`,
      gap: `${config.gap}px`,
      '--grid-resonance': grid.harmony.resonance,
      '--grid-balance': grid.harmony.balance,
      '--grid-flow': grid.harmony.flow
    };
  }, [viewport, config, grid.harmony]);

  return {
    grid,
    viewport,
    getCellStyles,
    getGridStyles,
    updateViewport
  };
};