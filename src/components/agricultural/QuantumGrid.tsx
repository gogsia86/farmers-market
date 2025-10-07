import React from 'react';
import { useQuantumGrid } from '@/hooks/useQuantumGrid';
import { cn } from '@/lib/utils';

export interface QuantumGridProps extends React.HTMLAttributes<HTMLDivElement> {
  baseUnit?: number;
  maxColumns?: number;
  maxRows?: number;
  gap?: number;
  children: React.ReactNode;
}

export const QuantumGrid: React.FC<QuantumGridProps> = ({
  baseUnit = 8,
  maxColumns = 12,
  maxRows = 6,
  gap = 16,
  children,
  className,
  ...props
}) => {
  const { getGridStyles } = useQuantumGrid({
    baseUnit,
    maxColumns,
    maxRows,
    gap
  });

  return (
    <div 
      className={cn(
        'quantum-grid',
        'transition-all duration-300 ease-in-out',
        className
      )}
      style={getGridStyles()}
      {...props}
    >
      {children}
    </div>
  );
};

export interface QuantumGridCellProps extends React.HTMLAttributes<HTMLDivElement> {
  x: number;
  y: number;
  children: React.ReactNode;
}

export const QuantumGridCell: React.FC<QuantumGridCellProps> = ({
  x,
  y,
  children,
  className,
  ...props
}) => {
  const { getCellStyles } = useQuantumGrid({
    baseUnit: 8,
    maxColumns: 12,
    maxRows: 6,
    gap: 16
  });

  return (
    <div
      className={cn(
        'quantum-grid-cell',
        'transition-all duration-300 ease-in-out',
        className
      )}
      style={getCellStyles(x, y)}
      {...props}
    >
      {children}
    </div>
  );
};