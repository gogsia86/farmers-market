import React from 'react';
import { render, screen } from '@testing-library/react';
import { QuantumGrid, QuantumGridCell } from './QuantumGrid';
import { useQuantumGrid } from '../../hooks/useQuantumGrid';

jest.mock('../../hooks/useQuantumGrid', () => ({
  useQuantumGrid: jest.fn(() => ({
    getGridStyles: () => ({
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gridTemplateRows: 'repeat(6, 1fr)',
      gap: '16px',
      '--grid-resonance': 0.87,
      '--grid-balance': 0.92,
      '--grid-flow': 0.85
    }),
    getCellStyles: () => ({
      gridColumn: '1 / span 1',
      gridRow: '1 / span 1',
      width: 100,
      height: 100,
      '--quantum-resonance': 0.88,
      '--consciousness-level': 0.95,
      '--energy-flow-in': 0.82,
      '--energy-flow-out': 0.79,
      '--harmony-level': 0.91
    })
  }))
}));

describe('QuantumGrid', () => {
  it('renders grid with default props', () => {
    render(
      <QuantumGrid>
        <div>Grid Content</div>
      </QuantumGrid>
    );

    const grid = screen.getByText('Grid Content').parentElement;
    expect(grid).toHaveClass('quantum-grid');
    expect(grid).toHaveStyle({
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: '16px'
    });
  });

  it('renders grid with custom props', () => {
    render(
      <QuantumGrid
        baseUnit={12}
        maxColumns={6}
        maxRows={4}
        gap={24}
        className="custom-class"
      >
        <div>Custom Grid</div>
      </QuantumGrid>
    );

    const grid = screen.getByText('Custom Grid').parentElement;
    expect(grid).toHaveClass('quantum-grid', 'custom-class');
  });
});

describe('QuantumGridCell', () => {
  it('renders cell with correct position', () => {
    render(
      <QuantumGridCell x={2} y={3}>
        <div>Cell Content</div>
      </QuantumGridCell>
    );

    const cell = screen.getByText('Cell Content').parentElement;
    expect(cell).toHaveClass('quantum-grid-cell');
    expect(cell).toHaveStyle({
      gridColumn: '1 / span 1',
      gridRow: '1 / span 1'
    });
  });

  it('renders cell with custom className', () => {
    render(
      <QuantumGridCell x={0} y={0} className="custom-cell">
        <div>Custom Cell</div>
      </QuantumGridCell>
    );

    const cell = screen.getByText('Custom Cell').parentElement;
    expect(cell).toHaveClass('quantum-grid-cell', 'custom-cell');
  });
});