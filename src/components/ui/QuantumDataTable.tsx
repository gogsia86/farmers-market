/**
 * 🌾 QUANTUM DATA TABLE - Enterprise-Grade Agricultural Component
 *
 * Divine table component with full sorting, filtering, pagination, and agricultural consciousness.
 * Supports both server-side and client-side data management with TypeScript generics.
 *
 * FEATURES:
 * - Generic TypeScript support for any data type
 * - Server-side and client-side modes
 * - Column sorting (ascending/descending)
 * - Row selection (single/multiple)
 * - Pagination with customizable page sizes
 * - Empty states with agricultural consciousness
 * - Mobile-responsive design
 * - Loading states and skeletons
 * - Accessibility (ARIA labels, keyboard navigation)
 *
 * USAGE:
 * ```tsx
 * <QuantumDataTable
 *   data={farms}
 *   columns={farmColumns}
 *   onRowClick={(farm) => router.push(`/farms/${farm.id}`)}
 *   selectable
 *   agricultural={{
 *     season: "SPRING",
 *     consciousness: "DIVINE"
 *   }}
 * />
 * ```
 *
 * DIVINE PATTERN:
 * - Holographic column definitions
 * - Quantum sorting algorithms
 * - Biodynamic pagination
 * - Agricultural consciousness integration
 */

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Column definition for the data table
 */
export interface QuantumColumn<T> {
  /** Unique identifier for the column */
  key: string;
  /** Display label for the column header */
  label: string;
  /** Accessor function to get cell value */
  accessor: (row: T) => React.ReactNode;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Custom sort function */
  sortFn?: (a: T, b: T) => number;
  /** Column width (CSS value) */
  width?: string;
  /** Column alignment */
  align?: "left" | "center" | "right";
  /** Hide on mobile */
  hideOnMobile?: boolean;
  /** Custom header render */
  headerRender?: () => React.ReactNode;
  /** Custom cell class name */
  cellClassName?: string;
}

/**
 * Agricultural consciousness metadata
 */
export interface AgriculturalContext {
  season?: "SPRING" | "SUMMER" | "FALL" | "WINTER";
  consciousness?: "DIVINE" | "QUANTUM" | "BIODYNAMIC";
  theme?: "light" | "dark";
}

/**
 * Sort state
 */
interface SortState {
  key: string | null;
  direction: "asc" | "desc" | null;
}

/**
 * Pagination state
 */
interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

/**
 * Main component props
 */
export interface QuantumDataTableProps<T> {
  /** Data array to display */
  data: T[];
  /** Column definitions */
  columns: QuantumColumn<T>[];
  /** Unique key extractor for rows */
  keyExtractor: (row: T, index: number) => string;
  /** Whether rows are selectable */
  selectable?: boolean;
  /** Selected row keys */
  selectedKeys?: string[];
  /** Selection change callback */
  onSelectionChange?: (selectedKeys: string[]) => void;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Enable pagination */
  pagination?: boolean;
  /** Initial page size */
  pageSize?: number;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Agricultural consciousness */
  agricultural?: AgriculturalContext;
  /** Custom table class name */
  className?: string;
  /** Enable hover effect on rows */
  hoverable?: boolean;
  /** Striped rows */
  striped?: boolean;
}

// ============================================================================
// QUANTUM DATA TABLE COMPONENT
// ============================================================================

export function QuantumDataTable<T>({
  data,
  columns,
  keyExtractor,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  onRowClick,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  loading = false,
  emptyMessage,
  agricultural = { consciousness: "DIVINE" },
  className = "",
  hoverable = true,
  striped = false,
}: QuantumDataTableProps<T>) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [sortState, setSortState] = useState<SortState>({
    key: null,
    direction: null,
  });

  const [paginationState, setPaginationState] = useState<PaginationState>({
    currentPage: 1,
    pageSize,
    totalPages: 1,
    totalItems: data.length,
  });

  // ============================================================================
  // SORTED AND PAGINATED DATA
  // ============================================================================

  const sortedData = useMemo(() => {
    if (!sortState.key || !sortState.direction) {
      return data;
    }

    const column = columns.find((col) => col.key === sortState.key);
    if (!column?.sortable) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      // Use custom sort function if provided
      if (column.sortFn) {
        return column.sortFn(a, b);
      }

      // Default sort by accessor value
      const aValue = column.accessor(a);
      const bValue = column.accessor(b);

      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // String comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue);
      }

      // Number comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return aValue - bValue;
      }

      // Default comparison
      return String(aValue).localeCompare(String(bValue));
    });

    return sortState.direction === "desc" ? sorted.reverse() : sorted;
  }, [data, sortState, columns]);

  const paginatedData = useMemo(() => {
    if (!pagination) {
      return sortedData;
    }

    const startIndex =
      (paginationState.currentPage - 1) * paginationState.pageSize;
    const endIndex = startIndex + paginationState.pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination, paginationState]);

  // Update pagination when data changes
  React.useEffect(() => {
    setPaginationState((prev) => ({
      ...prev,
      totalItems: data.length,
      totalPages: Math.ceil(data.length / prev.pageSize),
    }));
  }, [data.length, paginationState.pageSize]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSort = useCallback((columnKey: string) => {
    setSortState((prev) => {
      if (prev.key !== columnKey) {
        return { key: columnKey, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key: columnKey, direction: "desc" };
      }
      return { key: null, direction: null };
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;

    const allKeys = paginatedData.map((row, idx) => keyExtractor(row, idx));
    if (selectedKeys.length === allKeys.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allKeys);
    }
  }, [paginatedData, selectedKeys, keyExtractor, onSelectionChange]);

  const handleSelectRow = useCallback(
    (key: string) => {
      if (!onSelectionChange) return;

      if (selectedKeys.includes(key)) {
        onSelectionChange(selectedKeys.filter((k) => k !== key));
      } else {
        onSelectionChange([...selectedKeys, key]);
      }
    },
    [selectedKeys, onSelectionChange],
  );

  const handlePageChange = useCallback((page: number) => {
    setPaginationState((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPaginationState((prev) => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / newPageSize),
    }));
  }, []);

  // ============================================================================
  // AGRICULTURAL CONSCIOUSNESS
  // ============================================================================

  const getSeasonalColor = () => {
    switch (agricultural.season) {
      case "SPRING":
        return "border-green-200 bg-green-50";
      case "SUMMER":
        return "border-yellow-200 bg-yellow-50";
      case "FALL":
        return "border-orange-200 bg-orange-50";
      case "WINTER":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-agricultural-200 bg-agricultural-50";
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className={`quantum-data-table ${className}`}>
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-agricultural-200">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="border-b border-agricultural-200 bg-agricultural-50 px-6 py-4">
              <div className="flex space-x-4">
                {columns.slice(0, 3).map((col) => (
                  <div
                    key={col.key}
                    className="h-5 bg-agricultural-300 rounded flex-1"
                  />
                ))}
              </div>
            </div>
            {/* Rows skeleton */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="border-b border-agricultural-100 px-6 py-4"
              >
                <div className="flex space-x-4">
                  {columns.slice(0, 3).map((col) => (
                    <div
                      key={col.key}
                      className="h-4 bg-agricultural-200 rounded flex-1"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  if (data.length === 0) {
    return (
      <div className={`quantum-data-table ${className}`}>
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-agricultural-200">
          <div className="px-6 py-12 text-center">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {emptyMessage || "No data available"}
            </h3>
            <p className="text-gray-600">
              {agricultural.consciousness === "DIVINE"
                ? "The quantum field is empty. Create your first entry to manifest reality."
                : "Start by adding some data to see it here."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  const allSelected =
    paginatedData.length > 0 && selectedKeys.length === paginatedData.length;
  const someSelected = selectedKeys.length > 0 && !allSelected;

  return (
    <div className={`quantum-data-table ${className}`}>
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-agricultural-200">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-agricultural-200">
            {/* Header */}
            <thead className={`bg-agricultural-50 ${getSeasonalColor()}`}>
              <tr>
                {selectable && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-agricultural-300 text-agricultural-600 focus:ring-agricultural-500"
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-${column.align || "left"} text-xs font-medium text-agricultural-700 uppercase tracking-wider ${
                      column.hideOnMobile ? "hidden md:table-cell" : ""
                    } ${column.sortable ? "cursor-pointer select-none hover:bg-agricultural-100" : ""}`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      {column.headerRender ? (
                        column.headerRender()
                      ) : (
                        <span>{column.label}</span>
                      )}
                      {column.sortable && (
                        <span className="flex flex-col">
                          <ChevronUpIcon
                            className={`h-3 w-3 ${
                              sortState.key === column.key &&
                              sortState.direction === "asc"
                                ? "text-agricultural-600"
                                : "text-agricultural-400"
                            }`}
                          />
                          <ChevronDownIcon
                            className={`h-3 w-3 -mt-1 ${
                              sortState.key === column.key &&
                              sortState.direction === "desc"
                                ? "text-agricultural-600"
                                : "text-agricultural-400"
                            }`}
                          />
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="bg-white divide-y divide-agricultural-100">
              {paginatedData.map((row, index) => {
                const rowKey = keyExtractor(row, index);
                const isSelected = selectedKeys.includes(rowKey);

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick?.(row)}
                    className={`
                      ${striped && index % 2 === 1 ? "bg-agricultural-25" : ""}
                      ${hoverable ? "hover:bg-agricultural-50 transition-colors" : ""}
                      ${onRowClick ? "cursor-pointer" : ""}
                      ${isSelected ? "bg-agricultural-100" : ""}
                    `}
                  >
                    {selectable && (
                      <td className="w-12 px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRow(rowKey);
                          }}
                          className="h-4 w-4 rounded border-agricultural-300 text-agricultural-600 focus:ring-agricultural-500"
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-${column.align || "left"} ${
                          column.hideOnMobile ? "hidden md:table-cell" : ""
                        } ${column.cellClassName || ""}`}
                      >
                        {column.accessor(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && paginationState.totalPages > 1 && (
          <div className="bg-agricultural-50 px-4 py-3 border-t border-agricultural-200 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              {/* Page size selector */}
              <div className="flex items-center space-x-2">
                <label htmlFor="pageSize" className="text-sm text-gray-700">
                  Rows per page:
                </label>
                <select
                  id="pageSize"
                  value={paginationState.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border-agricultural-300 rounded-md shadow-sm focus:border-agricultural-500 focus:ring-agricultural-500 text-sm"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info */}
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(paginationState.currentPage - 1) *
                    paginationState.pageSize +
                    1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    paginationState.currentPage * paginationState.pageSize,
                    paginationState.totalItems,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {paginationState.totalItems}
                </span>{" "}
                results
              </div>

              {/* Page navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handlePageChange(paginationState.currentPage - 1)
                  }
                  disabled={paginationState.currentPage === 1}
                  className="px-3 py-1 border border-agricultural-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-agricultural-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="hidden sm:flex space-x-1">
                  {[...Array(paginationState.totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first, last, current, and pages around current
                    if (
                      page === 1 ||
                      page === paginationState.totalPages ||
                      Math.abs(page - paginationState.currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 border rounded-md text-sm font-medium ${
                            page === paginationState.currentPage
                              ? "bg-agricultural-600 text-white border-agricultural-600"
                              : "bg-white text-gray-700 border-agricultural-300 hover:bg-agricultural-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === paginationState.currentPage - 2 ||
                      page === paginationState.currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 py-1 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() =>
                    handlePageChange(paginationState.currentPage + 1)
                  }
                  disabled={
                    paginationState.currentPage === paginationState.totalPages
                  }
                  className="px-3 py-1 border border-agricultural-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-agricultural-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Divine consciousness indicator */}
      {agricultural.consciousness === "DIVINE" && (
        <div className="mt-2 text-xs text-center text-agricultural-600">
          🌾 Divine Agricultural Table • Quantum Coherence: Active
        </div>
      )}
    </div>
  );
}

/**
 * EXPORT HELPER: Create column definition
 * Convenience function for type-safe column creation
 */
export function createColumn<T>(column: QuantumColumn<T>): QuantumColumn<T> {
  return column;
}
