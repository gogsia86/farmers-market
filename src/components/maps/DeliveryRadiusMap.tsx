/**
 * 📍 DELIVERY RADIUS MAP COMPONENT - DIVINE IMPLEMENTATION
 *
 * Interactive map showing farm delivery coverage area with:
 * - Delivery radius circle visualization
 * - Multiple farms support
 * - Address search within radius
 * - Coverage area calculation
 *
 * DIVINE PRINCIPLES:
 * - Quantum geographical consciousness
 * - Agricultural territory visualization
 * - Biodynamic delivery patterns
 * - Holographic coverage mapping
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, Check, X } from "lucide-react";

interface DeliveryArea {
  farmId: string;
  farmName: string;
  latitude: number;
  longitude: number;
  radiusMiles: number;
  color?: string;
}

interface DeliveryRadiusMapProps {
  deliveryAreas: DeliveryArea[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  height?: string;
  showSearch?: boolean;
  onAddressCheck?: (address: string, inRange: boolean) => void;
}

/**
 * 📍 DELIVERY RADIUS MAP COMPONENT
 * Divine delivery territory consciousness
 */
export function DeliveryRadiusMap({
  deliveryAreas,
  userLocation,
  height = "500px",
  showSearch = true,
  onAddressCheck,
}: DeliveryRadiusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState("");
  const [searchResult, setSearchResult] = useState<{
    inRange: boolean;
    farms: string[];
  } | null>(null);

  useEffect(() => {
    // Check if Google Maps is loaded
    if (typeof window === "undefined" || !window.google) {
      setError("Google Maps is not loaded. Please add your API key.");
      setLoading(false);
      return;
    }

    if (!mapRef.current || deliveryAreas.length === 0) return;

    try {
      // Calculate center point
      const avgLat =
        deliveryAreas.reduce((sum, area) => sum + area.latitude, 0) /
        deliveryAreas.length;
      const avgLng =
        deliveryAreas.reduce((sum, area) => sum + area.longitude, 0) /
        deliveryAreas.length;

      // Initialize map
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: avgLat, lng: avgLng },
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Add delivery areas
      deliveryAreas.forEach((area, index) => {
        const color = area.color || getColorForIndex(index);
        const radiusInMeters = area.radiusMiles * 1609.34;

        // Add farm marker
        const marker = new google.maps.Marker({
          position: { lat: area.latitude, lng: area.longitude },
          map: mapInstance,
          title: area.farmName,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: ${color};">
                ${area.farmName}
              </h3>
              <p style="margin: 0; font-size: 14px; color: #4A5568;">
                Delivers within ${area.radiusMiles} miles
              </p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstance, marker);
        });

        // Draw delivery radius circle
        new google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: color,
          fillOpacity: 0.1,
          map: mapInstance,
          center: { lat: area.latitude, lng: area.longitude },
          radius: radiusInMeters,
        });
      });

      // Add user location marker if provided
      if (userLocation) {
        new google.maps.Marker({
          position: {
            lat: userLocation.latitude,
            lng: userLocation.longitude,
          },
          map: mapInstance,
          title: "Your Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#3B82F6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
      }

      setMap(mapInstance);
      setLoading(false);
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to load map");
      setLoading(false);
    }
  }, [deliveryAreas, userLocation]);

  // Check if address is within delivery radius
  const handleCheckAddress = async () => {
    if (!searchAddress || !window.google) return;

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: searchAddress });

      if (result.results.length === 0) {
        alert("Address not found. Please try again.");
        return;
      }

      const location = result.results[0]?.geometry.location;

      if (!location) {
        alert("Could not determine location coordinates.");
        return;
      }
      const lat = location.lat();
      const lng = location.lng();

      // Check which farms can deliver to this address
      const farmsInRange: string[] = [];
      deliveryAreas.forEach((area) => {
        const distance = calculateDistance(
          lat,
          lng,
          area.latitude,
          area.longitude,
        );
        if (distance <= area.radiusMiles) {
          farmsInRange.push(area.farmName);
        }
      });

      const inRange = farmsInRange.length > 0;
      setSearchResult({ inRange, farms: farmsInRange });

      if (onAddressCheck) {
        onAddressCheck(searchAddress, inRange);
      }

      // Add marker for searched location
      if (map) {
        new google.maps.Marker({
          position: { lat, lng },
          map,
          title: "Searched Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: inRange ? "#10B981" : "#EF4444",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          animation: google.maps.Animation.DROP,
        });

        // Center map on searched location
        map.panTo({ lat, lng });
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      alert("Error checking address. Please try again.");
    }
  };

  // Fallback: Static display
  if (error || typeof window === "undefined" || !window.google) {
    return (
      <div
        className="bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Delivery Areas Map</p>
          <p className="text-sm text-gray-500 mb-4">
            {deliveryAreas.length} farm(s) with delivery service
          </p>
          <div className="space-y-2">
            {deliveryAreas.map((area) => (
              <div
                key={area.farmId}
                className="bg-white rounded-lg p-3 text-left"
              >
                <p className="font-medium text-gray-900">{area.farmName}</p>
                <p className="text-sm text-gray-600">
                  Delivers within {area.radiusMiles} miles
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Address Search */}
      {showSearch && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-bold mb-3">Check Delivery Availability</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter your address..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCheckAddress()}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agricultural-500"
            />
            <button
              onClick={handleCheckAddress}
              className="px-6 py-2 bg-agricultural-600 text-white rounded-lg hover:bg-agricultural-700 transition-colors"
            >
              Check
            </button>
          </div>

          {/* Search Result */}
          {searchResult && (
            <div
              className={`mt-4 p-4 rounded-lg border-2 ${
                searchResult.inRange
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {searchResult.inRange ? (
                  <>
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-green-900">
                      Delivery Available!
                    </span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-red-600" />
                    <span className="font-bold text-red-900">
                      Outside Delivery Range
                    </span>
                  </>
                )}
              </div>
              {searchResult.inRange && (
                <div>
                  <p className="text-sm text-green-800 mb-2">
                    The following farms can deliver to your address:
                  </p>
                  <ul className="space-y-1">
                    {searchResult.farms.map((farm) => (
                      <li key={farm} className="text-sm text-green-700">
                        ✓ {farm}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden shadow-md">
        {loading && (
          <div
            className="absolute inset-0 bg-white flex items-center justify-center z-10"
            style={{ height }}
          >
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-agricultural-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ height, width: "100%" }} />
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h4 className="font-bold mb-3">Delivery Areas</h4>
        <div className="space-y-2">
          {deliveryAreas.map((area, index) => {
            const color = area.color || getColorForIndex(index);
            return (
              <div key={area.farmId} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{area.farmName}</p>
                  <p className="text-xs text-gray-600">
                    {area.radiusMiles} mile radius
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * 🎨 COLOR HELPER
 * Generate distinct colors for each farm
 */
function getColorForIndex(index: number): string {
  const colors = [
    "#2D5A27", // Agricultural green
    "#E67E22", // Harvest orange
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
  ];
  return colors[index % colors.length] || "#10b981";
}

/**
 * 📏 DISTANCE CALCULATION
 * Haversine formula for distance between two coordinates
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 📍 SIMPLE DELIVERY INFO COMPONENT
 * Lightweight delivery information display without map
 */
export function DeliveryInfo({
  radiusMiles,
  farmName,
}: {
  radiusMiles: number;
  farmName: string;
}) {
  return (
    <div className="bg-agricultural-50 rounded-lg p-4 border border-agricultural-200">
      <div className="flex items-start gap-3">
        <div className="bg-agricultural-600 rounded-full p-2 flex-shrink-0">
          <MapPin className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">Delivery Available</h4>
          <p className="text-sm text-gray-600">
            {farmName} delivers within{" "}
            <span className="font-bold text-agricultural-700">
              {radiusMiles} miles
            </span>{" "}
            of the farm location.
          </p>
        </div>
      </div>
    </div>
  );
}
