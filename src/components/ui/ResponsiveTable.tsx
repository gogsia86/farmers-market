"use client";

/**
 * 📊 RESPONSIVE TABLE COMPONENT
 * Mobile-optimized table wrapper with horizontal scrolling
 *
 * Purpose:
 * - Prevent table overflow on mobile devices
 * - Smooth horizontal scrolling for wide tables
 * - Consistent shadow indicators for scroll state
 * - Accessible keyboard navigation
 *
 * Features:
 * - Auto-detects overflow and adds scroll
 * - Shadow indicators when content is scrollable
 * - Touch-friendly scrolling
 * - Maintains table formatting on desktop
 *
 * Reference: DESIGN_SYSTEM_ANALYSIS.md - Mobile Table Optimization
 */

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useRef, useState } from "react";

export interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
  /**
   * Show shadow indicators when scrollable
   */
  showScrollIndicators?: boolean;
  /**
   * Remove negative margin on mobile
   */
  removeNegativeMargin?: boolean;
}

export function ResponsiveTable({
  children,
  className,
  showScrollIndicators = true,
  removeNegativeMargin = false,
}: ResponsiveTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  // Check scroll position and update indicators
  const checkScroll = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const canScrollLeft = scrollLeft > 0;
    const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;

    setScrollState({ canScrollLeft, canScrollRight });
  };

  useEffect(() => {
    checkScroll();

    // Add resize observer to detect container size changes
    const resizeObserver = new ResizeObserver(checkScroll);
    if (scrollRef.current) {
      resizeObserver.observe(scrollRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [children]);

  return (
    <div className="relative">
      {/* Left scroll indicator */}
      {showScrollIndicators && scrollState.canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-100 to-transparent pointer-events-none z-10" />
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={cn(
          "overflow-x-auto",
          !removeNegativeMargin && "-mx-4 sm:mx-0",
          "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
          className,
        )}
        style={{
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
        }}
      >
        {/* Inner wrapper to maintain padding */}
        <div
          className={cn(!removeNegativeMargin && "px-4 sm:px-0")}
          style={{ minWidth: "max-content" }}
        >
          {children}
        </div>
      </div>

      {/* Right scroll indicator */}
      {showScrollIndicators && scrollState.canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-100 to-transparent pointer-events-none z-10" />
      )}
    </div>
  );
}

/**
 * Pre-styled table component with responsive behavior
 */
export function ResponsiveDataTable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ResponsiveTable>
      <table className={cn("min-w-full divide-y divide-gray-200", className)}>
        {children}
      </table>
    </ResponsiveTable>
  );
}

/**
 * Table header with consistent styling
 */
export function TableHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <thead className={cn("bg-gray-50", className)}>
      <tr>{children}</tr>
    </thead>
  );
}

/**
 * Table header cell with consistent styling
 */
export function TableHeaderCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
        className,
      )}
    >
      {children}
    </th>
  );
}

/**
 * Table body with consistent styling
 */
export function TableBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tbody className={cn("bg-white divide-y divide-gray-200", className)}>
      {children}
    </tbody>
  );
}

/**
 * Table row with hover state
 */
export function TableRow({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        onClick && "cursor-pointer hover:bg-gray-50 transition-colors",
        className,
      )}
    >
      {children}
    </tr>
  );
}

/**
 * Table cell with consistent styling
 */
export function TableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-6 py-4 whitespace-nowrap text-sm", className)}>
      {children}
    </td>
  );
}

/**
 * Empty table state
 */
export function TableEmptyState({
  icon,
  title,
  description,
}: {
  icon?: string;
  title: string;
  description?: string;
}) {
  return (
    <tr>
      <td colSpan={100} className="px-6 py-12 text-center">
        {icon && <div className="text-4xl mb-3">{icon}</div>}
        <p className="text-base font-medium text-gray-900 mb-1">{title}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </td>
    </tr>
  );
}

/**
 * Table loading skeleton
 */
export function TableLoadingSkeleton({ rows = 5, cols = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Export all components
export {
  ResponsiveTable as default,
  ResponsiveDataTable as Table,
  TableHeader as Thead,
  TableHeaderCell as Th,
  TableBody as Tbody,
  TableRow as Tr,
  TableCell as Td,
};
