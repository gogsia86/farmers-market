/**
 * 🔄 MAP VIEW TOGGLE COMPONENT - DIVINE IMPLEMENTATION
 *
 * Toggle between map and list views with:
 * - Smooth transition animations
 * - Icon-based toggle
 * - Accessible keyboard navigation
 * - Responsive design
 *
 * DIVINE PRINCIPLES:
 * - Quantum view state management
 * - Biodynamic UI transitions
 * - Agricultural consciousness in navigation
 * - Holographic view switching
 */

"use client";

import { Map, List, Grid } from "lucide-react";
import { useState } from "react";

interface MapViewToggleProps {
  currentView: "list" | "map" | "grid";
  onViewChange: (view: "list" | "map" | "grid") => void;
  showGridOption?: boolean;
  className?: string;
}

/**
 * 🔄 MAP VIEW TOGGLE COMPONENT
 * Divine view mode consciousness
 */
export function MapViewToggle({
  currentView,
  onViewChange,
  showGridOption = false,
  className = "",
}: MapViewToggleProps) {
  return (
    <div
      className={`inline-flex items-center bg-white border border-gray-300 rounded-lg p-1 ${className}`}
      role="group"
      aria-label="View mode selector"
    >
      {/* List View Button */}
      <button
        onClick={() => onViewChange("list")}
        className={`p-2 rounded-md transition-all duration-200 ${
          currentView === "list"
            ? "bg-agricultural-600 text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        aria-label="List view"
        aria-pressed={currentView === "list"}
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>

      {/* Grid View Button (Optional) */}
      {showGridOption && (
        <button
          onClick={() => onViewChange("grid")}
          className={`p-2 rounded-md transition-all duration-200 ${
            currentView === "grid"
              ? "bg-agricultural-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          aria-label="Grid view"
          aria-pressed={currentView === "grid"}
          title="Grid view"
        >
          <Grid className="h-4 w-4" />
        </button>
      )}

      {/* Map View Button */}
      <button
        onClick={() => onViewChange("map")}
        className={`p-2 rounded-md transition-all duration-200 ${
          currentView === "map"
            ? "bg-agricultural-600 text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        aria-label="Map view"
        aria-pressed={currentView === "map"}
        title="Map view"
      >
        <Map className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * 🔄 ENHANCED MAP VIEW TOGGLE WITH LABELS
 * Toggle with text labels for better UX
 */
export function MapViewToggleWithLabels({
  currentView,
  onViewChange,
  showGridOption = false,
  className = "",
}: MapViewToggleProps) {
  return (
    <div
      className={`inline-flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden ${className}`}
      role="group"
      aria-label="View mode selector"
    >
      {/* List View Button */}
      <button
        onClick={() => onViewChange("list")}
        className={`flex items-center gap-2 px-4 py-2 transition-all duration-200 border-r border-gray-300 last:border-r-0 ${
          currentView === "list"
            ? "bg-agricultural-600 text-white"
            : "text-gray-700 hover:bg-gray-50"
        }`}
        aria-label="List view"
        aria-pressed={currentView === "list"}
      >
        <List className="h-4 w-4" />
        <span className="text-sm font-medium hidden sm:inline">List</span>
      </button>

      {/* Grid View Button (Optional) */}
      {showGridOption && (
        <button
          onClick={() => onViewChange("grid")}
          className={`flex items-center gap-2 px-4 py-2 transition-all duration-200 border-r border-gray-300 last:border-r-0 ${
            currentView === "grid"
              ? "bg-agricultural-600 text-white"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          aria-label="Grid view"
          aria-pressed={currentView === "grid"}
        >
          <Grid className="h-4 w-4" />
          <span className="text-sm font-medium hidden sm:inline">Grid</span>
        </button>
      )}

      {/* Map View Button */}
      <button
        onClick={() => onViewChange("map")}
        className={`flex items-center gap-2 px-4 py-2 transition-all duration-200 ${
          currentView === "map"
            ? "bg-agricultural-600 text-white"
            : "text-gray-700 hover:bg-gray-50"
        }`}
        aria-label="Map view"
        aria-pressed={currentView === "map"}
      >
        <Map className="h-4 w-4" />
        <span className="text-sm font-medium hidden sm:inline">Map</span>
      </button>
    </div>
  );
}

/**
 * 🔄 MOBILE-OPTIMIZED TOGGLE
 * Simplified toggle for mobile devices
 */
export function MobileMapViewToggle({
  currentView,
  onViewChange,
}: {
  currentView: "list" | "map";
  onViewChange: (view: "list" | "map") => void;
}) {
  return (
    <button
      onClick={() => onViewChange(currentView === "list" ? "map" : "list")}
      className="fixed bottom-20 right-4 z-50 bg-agricultural-600 text-white p-4 rounded-full shadow-lg hover:bg-agricultural-700 transition-colors md:hidden"
      aria-label={currentView === "list" ? "Show map view" : "Show list view"}
    >
      {currentView === "list" ? (
        <Map className="h-6 w-6" />
      ) : (
        <List className="h-6 w-6" />
      )}
    </button>
  );
}

/**
 * 🔄 VIEW MODE CONTEXT HOOK
 * Hook for managing view mode state
 */
export function useViewMode(initialView: "list" | "map" | "grid" = "list") {
  const [viewMode, setViewMode] = useState<"list" | "map" | "grid">(
    initialView,
  );

  const isListView = viewMode === "list";
  const isMapView = viewMode === "map";
  const isGridView = viewMode === "grid";

  return {
    viewMode,
    setViewMode,
    isListView,
    isMapView,
    isGridView,
  };
}
