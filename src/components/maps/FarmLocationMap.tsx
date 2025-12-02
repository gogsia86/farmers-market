/**
 * 🗺️ FARM LOCATION MAP COMPONENT - DIVINE IMPLEMENTATION
 *
 * Google Maps integration for displaying farm locations with:
 * - Interactive map with farm marker
 * - Delivery radius visualization
 * - Directions link
 * - Responsive design
 *
 * DIVINE PRINCIPLES:
 * - Geographical consciousness
 * - Quantum location visualization
 * - Biodynamic map patterns
 * - Agricultural territory awareness
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

interface FarmLocationMapProps {
  farmName: string;
  address: string;
  latitude: number;
  longitude: number;
  deliveryRadius?: number; // in miles
  height?: string;
  showDirections?: boolean;
}

/**
 * 🗺️ FARM LOCATION MAP COMPONENT
 * Divine geographical consciousness display
 */
export function FarmLocationMap({
  farmName,
  address,
  latitude,
  longitude,
  deliveryRadius = 0,
  height = "400px",
  showDirections = true,
}: FarmLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google Maps is loaded
    if (typeof window === "undefined" || !window.google) {
      setError("Google Maps is not loaded. Please add your API key.");
      setLoading(false);
      return;
    }

    if (!mapRef.current) return;

    try {
      // Initialize map
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: deliveryRadius > 0 ? 11 : 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Add farm marker
      const marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapInstance,
        title: farmName,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#2D5A27",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #2D5A27;">
              ${farmName}
            </h3>
            <p style="margin: 0; font-size: 14px; color: #4A5568;">
              ${address}
            </p>
            ${
              showDirections
                ? `
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}"
                target="_blank"
                rel="noopener noreferrer"
                style="display: inline-block; margin-top: 8px; color: #2D5A27; text-decoration: none; font-weight: 500;"
              >
                Get Directions →
              </a>
            `
                : ""
            }
          </div>
        `,
      });

      // Show info window on marker click
      marker.addListener("click", () => {
        infoWindow.open(mapInstance, marker);
      });

      // Draw delivery radius circle if specified
      if (deliveryRadius > 0) {
        const radiusInMeters = deliveryRadius * 1609.34; // Convert miles to meters

        new google.maps.Circle({
          strokeColor: "#2D5A27",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#2D5A27",
          fillOpacity: 0.15,
          map: mapInstance,
          center: { lat: latitude, lng: longitude },
          radius: radiusInMeters,
        });
      }

      setMap(mapInstance);
      setLoading(false);
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to load map");
      setLoading(false);
    }
  }, [farmName, address, latitude, longitude, deliveryRadius, showDirections]);

  // Fallback: Static map or error state
  if (error || typeof window === "undefined" || !window.google) {
    return (
      <div
        className="bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">{farmName}</p>
          <p className="text-sm text-gray-500 mb-4">{address}</p>
          {showDirections && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-agricultural-600 text-white rounded-lg hover:bg-agricultural-700 transition-colors"
            >
              <Navigation className="h-4 w-4" />
              Get Directions
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
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
      {deliveryRadius > 0 && (
        <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-agricultural-700">
              Delivery Radius:
            </span>{" "}
            {deliveryRadius} miles
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * 📍 SIMPLE MAP MARKER COMPONENT
 * Lightweight marker without full map
 */
export function FarmLocationMarker({
  farmName,
  address,
  distance,
}: {
  farmName: string;
  address: string;
  distance?: number;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start gap-3">
        <div className="bg-agricultural-100 rounded-full p-2 flex-shrink-0">
          <MapPin className="h-5 w-5 text-agricultural-700" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{farmName}</h4>
          <p className="text-sm text-gray-600 mb-2">{address}</p>
          {distance !== undefined && (
            <p className="text-sm text-agricultural-600 font-medium">
              {distance} miles away
            </p>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-agricultural-600 hover:text-agricultural-700 font-medium mt-2"
          >
            <Navigation className="h-4 w-4" />
            Get Directions
          </a>
        </div>
      </div>
    </div>
  );
}
