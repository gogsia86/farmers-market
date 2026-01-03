"use client";

import { cn } from "@/lib/utils";
import { createLogger } from "@/lib/utils/logger";
import { Locate, Navigation, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useState } from "react";
import React from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// 🌾 AGRICULTURAL MAP COMPONENT
// Divine map component for farm location visualization with geographical consciousness
// Embodies spatial awareness and biodynamic location patterns
// ═══════════════════════════════════════════════════════════════════════════════

// Create logger for Map component
const mapLogger = createLogger("Map");

export interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type?: "farm" | "market" | "pickup" | "delivery" | "other";
  farmName?: string;
  address?: string;
  metadata?: Record<string, any>;
}

export interface MapProps {
  locations: MapLocation[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  className?: string;
  onLocationClick?: (location: MapLocation) => void;
  showControls?: boolean;
  showCurrentLocation?: boolean;
  clustered?: boolean;
  agriculturalTheme?: boolean;
  interactive?: boolean;
}

// Location type markers with agricultural consciousness
const LOCATION_MARKERS: Record<
  string,
  { icon: string; color: string; bg: string }
> = {
  farm: {
    icon: "🌾",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  market: {
    icon: "🛒",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  pickup: {
    icon: "📦",
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  delivery: {
    icon: "🚚",
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  other: {
    icon: "📍",
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
};

/**
 * 🌾 StaticMap Component - Divine Geographical Display (No External Dependencies)
 *
 * A beautiful, interactive map component built with pure React and CSS.
 * No external map libraries required - perfect for SSR and lightweight applications.
 *
 * @example
 * ```tsx
 * const farmLocations: MapLocation[] = [
 *   {
 *     id: "1",
 *     lat: 40.7128,
 *     lng: -74.0060,
 *     title: "Sunrise Valley Farm",
 *     type: "farm",
 *     address: "123 Farm Road, NY"
 *   },
 *   {
 *     id: "2",
 *     lat: 40.7580,
 *     lng: -73.9855,
 *     title: "Green Meadows Market",
 *     type: "market"
 *   }
 * ];
 *
 * <StaticMap locations={farmLocations} agriculturalTheme />
 * ```
 */
export function StaticMap({
  locations,
  center,
  zoom = 12,
  height = "400px",
  className,
  onLocationClick,
  showControls = true,
  showCurrentLocation = false,
  agriculturalTheme = false,
}: MapProps) {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null,
  );
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [mapCenter, setMapCenter] = useState(
    center ||
    (locations.length > 0
      ? { lat: locations[0].lat, lng: locations[0].lng }
      : { lat: 0, lng: 0 }),
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Get user's current location
  useEffect(() => {
    if (showCurrentLocation && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          mapLogger.warn("Geolocation error occurred", {
            errorCode: error.code,
            errorMessage: error.message,
          });
        },
      );
    }
  }, [showCurrentLocation]);

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
    setMapCenter({ lat: location.lat, lng: location.lng });
    onLocationClick?.(location);
  };

  const handleZoomIn = () => {
    setCurrentZoom((prev) => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setCurrentZoom((prev) => Math.max(prev - 1, 1));
  };

  const handleRecenter = () => {
    if (locations.length > 0) {
      setMapCenter({ lat: locations[0].lat, lng: locations[0].lng });
      setCurrentZoom(zoom);
    }
  };

  const handleGoToUserLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setCurrentZoom(15);
    }
  };

  return (
    <div
      className={cn(
        "map-container relative rounded-lg overflow-hidden border shadow-md",
        agriculturalTheme ? "border-green-300" : "border-gray-300",
        className,
      )}
      style={{ height }}
      role="application"
      aria-label="Farm locations map"
    >
      {/* Map Display Area - Static representation */}
      <div
        className={cn(
          "map-canvas w-full h-full relative",
          agriculturalTheme ? "bg-green-50" : "bg-gray-100",
        )}
      >
        {/* Grid pattern for visual appeal */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
              linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Location Markers */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location) => {
                const marker = LOCATION_MARKERS[location.type || "other"];
                const isSelected = selectedLocation?.id === location.id;

                return (
                  <button
                    key={location.id}
                    onClick={() => handleLocationClick(location)}
                    className={cn(
                      "map-marker p-4 rounded-lg border-2 transition-all duration-300",
                      "hover:shadow-lg hover:scale-105",
                      isSelected
                        ? "ring-4 ring-offset-2 shadow-xl scale-105"
                        : "shadow-md",
                      marker.bg,
                      isSelected
                        ? agriculturalTheme
                          ? "border-green-500 ring-green-300"
                          : "border-blue-500 ring-blue-300"
                        : "border-transparent",
                    )}
                    aria-label={`${location.title} at ${location.address || "location"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-2xl",
                          "bg-white shadow-sm",
                        )}
                      >
                        {marker.icon}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h3
                          className={cn("font-semibold text-sm", marker.color)}
                        >
                          {location.title}
                        </h3>
                        {location.address && (
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            📍 {location.address}
                          </p>
                        )}
                        {location.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {location.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>
                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Location Indicator */}
        {userLocation && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-full shadow-lg">
            <Locate className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-700">
              Your Location
            </span>
          </div>
        )}
      </div>

      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleRecenter}
            className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
            aria-label="Recenter map"
            title="Recenter"
          >
            <Navigation className="w-5 h-5 text-gray-700" />
          </button>
          {showCurrentLocation && userLocation && (
            <button
              onClick={handleGoToUserLocation}
              className="p-2 bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              aria-label="Go to my location"
              title="My location"
            >
              <Locate className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Zoom Level Indicator */}
      {showControls && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-md shadow-md text-xs font-medium text-gray-700">
          Zoom: {currentZoom}x
        </div>
      )}

      {/* Location Count */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-md shadow-md text-xs font-medium text-gray-700">
        {locations.length} {locations.length === 1 ? "location" : "locations"}
      </div>

      {/* Selected Location Details */}
      {selectedLocation && (
        <div className="absolute bottom-16 left-4 right-4 md:left-4 md:right-auto md:max-w-sm bg-white rounded-lg shadow-xl p-4 border-2 border-green-500">
          <button
            onClick={() => setSelectedLocation(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              {LOCATION_MARKERS[selectedLocation.type || "other"].icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">
                {selectedLocation.title}
              </h3>
              {selectedLocation.farmName && (
                <p className="text-sm text-green-600 mt-1">
                  🌾 {selectedLocation.farmName}
                </p>
              )}
              {selectedLocation.address && (
                <p className="text-sm text-gray-600 mt-1">
                  📍 {selectedLocation.address}
                </p>
              )}
              {selectedLocation.description && (
                <p className="text-sm text-gray-500 mt-2">
                  {selectedLocation.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation.lat},${selectedLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 🗺️ Map Component - Main Export (Alias for StaticMap)
 *
 * This is a static map implementation that doesn't require Google Maps API.
 * For production, you can integrate Google Maps, Mapbox, or Leaflet by replacing
 * this implementation while maintaining the same interface.
 */
export const Map = StaticMap;

/**
 * 🌾 FarmLocationMap - Pre-configured for Farm Locations
 *
 * Specialized map component for displaying farm locations with agricultural theme.
 */
export interface FarmLocationMapProps {
  farms: Array<{
    id: string;
    name: string;
    location: {
      address: string;
      coordinates: { lat: number; lng: number };
    };
    description?: string;
  }>;
  onFarmClick?: (farmId: string) => void;
  className?: string;
  height?: string;
}

export function FarmLocationMap({
  farms,
  onFarmClick,
  className,
  height = "500px",
}: FarmLocationMapProps) {
  const locations: MapLocation[] = farms.map((farm) => ({
    id: farm.id,
    lat: farm.location.coordinates.lat,
    lng: farm.location.coordinates.lng,
    title: farm.name,
    description: farm.description,
    address: farm.location.address,
    type: "farm",
    farmName: farm.name,
  }));

  return (
    <StaticMap
      locations={locations}
      height={height}
      className={className}
      onLocationClick={(location) => onFarmClick?.(location.id)}
      agriculturalTheme
      showControls
      showCurrentLocation
    />
  );
}

// Export for divine agricultural consciousness
export default Map;
