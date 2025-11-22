/**
 * GEOCODING SERVICE
 * Divine location services with agricultural consciousness
 *
 * Features:
 * - Free OpenStreetMap Nominatim API (no API key required)
 * - State center fallback for reliability
 * - Cache support for repeated requests
 * - Rate limiting compliance
 *
 * @module GeocodingService
 */

import { createHash } from "crypto";

/**
 * Geocoding result with coordinates and formatted address
 */
export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

/**
 * State center coordinates for US states
 * Used as fallback when geocoding fails
 */
const STATE_CENTERS: Record<string, { lat: number; lng: number }> = {
  AL: { lat: 32.806671, lng: -86.79113 },
  AK: { lat: 61.370716, lng: -152.404419 },
  AZ: { lat: 33.729759, lng: -111.431221 },
  AR: { lat: 34.969704, lng: -92.373123 },
  CA: { lat: 36.116203, lng: -119.681564 },
  CO: { lat: 39.059811, lng: -105.311104 },
  CT: { lat: 41.597782, lng: -72.755371 },
  DE: { lat: 39.318523, lng: -75.507141 },
  FL: { lat: 27.766279, lng: -81.686783 },
  GA: { lat: 33.040619, lng: -83.643074 },
  HI: { lat: 21.094318, lng: -157.498337 },
  ID: { lat: 44.240459, lng: -114.478828 },
  IL: { lat: 40.349457, lng: -88.986137 },
  IN: { lat: 39.849426, lng: -86.258278 },
  IA: { lat: 42.011539, lng: -93.210526 },
  KS: { lat: 38.5266, lng: -96.726486 },
  KY: { lat: 37.66814, lng: -84.670067 },
  LA: { lat: 31.169546, lng: -91.867805 },
  ME: { lat: 44.693947, lng: -69.381927 },
  MD: { lat: 39.063946, lng: -76.802101 },
  MA: { lat: 42.230171, lng: -71.530106 },
  MI: { lat: 43.326618, lng: -84.536095 },
  MN: { lat: 45.694454, lng: -93.900192 },
  MS: { lat: 32.741646, lng: -89.678696 },
  MO: { lat: 38.456085, lng: -92.288368 },
  MT: { lat: 46.921925, lng: -110.454353 },
  NE: { lat: 41.12537, lng: -98.268082 },
  NV: { lat: 38.313515, lng: -117.055374 },
  NH: { lat: 43.452492, lng: -71.563896 },
  NJ: { lat: 40.298904, lng: -74.521011 },
  NM: { lat: 34.840515, lng: -106.248482 },
  NY: { lat: 42.165726, lng: -74.948051 },
  NC: { lat: 35.630066, lng: -79.806419 },
  ND: { lat: 47.528912, lng: -99.784012 },
  OH: { lat: 40.388783, lng: -82.764915 },
  OK: { lat: 35.565342, lng: -96.928917 },
  OR: { lat: 44.572021, lng: -122.070938 },
  PA: { lat: 40.590752, lng: -77.209755 },
  RI: { lat: 41.680893, lng: -71.51178 },
  SC: { lat: 33.856892, lng: -80.945007 },
  SD: { lat: 44.299782, lng: -99.438828 },
  TN: { lat: 35.747845, lng: -86.692345 },
  TX: { lat: 31.054487, lng: -97.563461 },
  UT: { lat: 40.150032, lng: -111.862434 },
  VT: { lat: 44.045876, lng: -72.710686 },
  VA: { lat: 37.769337, lng: -78.169968 },
  WA: { lat: 47.400902, lng: -121.490494 },
  WV: { lat: 38.491226, lng: -80.954453 },
  WI: { lat: 44.268543, lng: -89.616508 },
  WY: { lat: 42.755966, lng: -107.30249 },
};

/**
 * US Center coordinates (geographic center of contiguous US)
 */
const US_CENTER = { lat: 39.8283, lng: -98.5795 };

/**
 * In-memory cache for geocoding results
 * TODO: Replace with Redis when available
 */
const geocodeCache = new Map<string, GeocodeResult>();

/**
 * Rate limiting: Track last request time to comply with Nominatim usage policy
 * Nominatim requires max 1 request per second
 */
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second in milliseconds

/**
 * Geocoding Service
 * Converts addresses to latitude/longitude coordinates
 */
export class GeocodingService {
  /**
   * Geocode a full address to coordinates
   *
   * @param address - Street address
   * @param city - City name
   * @param state - State code (e.g., "CA", "NY")
   * @param zipCode - ZIP code
   * @returns Geocoding result with lat/lng and formatted address
   *
   * @example
   * const result = await GeocodingService.geocodeAddress(
   *   "123 Main St",
   *   "Sacramento",
   *   "CA",
   *   "95814"
   * );
   * console.log(result.latitude, result.longitude);
   */
  static async geocodeAddress(
    address: string,
    city: string,
    state: string,
    zipCode: string,
  ): Promise<GeocodeResult> {
    const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
    const cacheKey = this.generateCacheKey(fullAddress);

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`✅ Geocoding cache hit: ${fullAddress}`);
      return cached;
    }

    try {
      console.log(`🌍 Geocoding address: ${fullAddress}`);

      // Primary: OpenStreetMap Nominatim (free, no API key)
      const result = await this.geocodeWithNominatim(fullAddress);
      this.saveToCache(cacheKey, result);

      console.log(
        `✅ Geocoded: ${fullAddress} → (${result.latitude}, ${result.longitude})`,
      );
      return result;
    } catch (error) {
      console.error(`❌ Geocoding failed for: ${fullAddress}`, error);

      // Fallback: Use state center coordinates
      const fallback = this.getStateCenterCoordinates(state);
      console.log(
        `⚠️ Using state center fallback for ${state}: (${fallback.latitude}, ${fallback.longitude})`,
      );

      return fallback;
    }
  }

  /**
   * Geocode using OpenStreetMap Nominatim API
   * Free service with usage policy: max 1 request per second
   *
   * @param address - Full address to geocode
   * @returns Geocoding result
   * @private
   */
  private static async geocodeWithNominatim(
    address: string,
  ): Promise<GeocodeResult> {
    // Rate limiting: Wait if necessary
    await this.waitForRateLimit();

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", address);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "us"); // Restrict to US
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "FarmersMarketPlatform/1.0 (Agricultural E-Commerce)",
        Accept: "application/json",
      },
      // Add timeout
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(
        `Nominatim API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data[0]) {
      throw new Error("Nominatim geocoding failed: No results found");
    }

    const result = data[0];

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
    };
  }

  /**
   * Wait if necessary to comply with rate limiting
   * Nominatim requires max 1 request per second
   *
   * @private
   */
  private static async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    lastRequestTime = Date.now();
  }

  /**
   * Get state center coordinates as fallback
   *
   * @param state - State code (e.g., "CA", "NY")
   * @returns Geocoding result with state center coordinates
   * @private
   */
  private static getStateCenterCoordinates(state: string): GeocodeResult {
    const stateUpper = state.toUpperCase();
    const coords = STATE_CENTERS[stateUpper] || US_CENTER;

    return {
      latitude: coords.lat,
      longitude: coords.lng,
      formattedAddress: `${stateUpper}, United States`,
    };
  }

  /**
   * Generate cache key from address
   *
   * @param address - Full address
   * @returns SHA-256 hash of address
   * @private
   */
  private static generateCacheKey(address: string): string {
    return createHash("sha256")
      .update(address.toLowerCase())
      .digest("hex")
      .substring(0, 32); // Use first 32 chars for shorter keys
  }

  /**
   * Get result from cache
   *
   * @param key - Cache key
   * @returns Cached result or null
   * @private
   */
  private static getFromCache(key: string): GeocodeResult | null {
    return geocodeCache.get(key) || null;
  }

  /**
   * Save result to cache
   *
   * @param key - Cache key
   * @param result - Geocoding result to cache
   * @private
   */
  private static saveToCache(key: string, result: GeocodeResult): void {
    geocodeCache.set(key, result);

    // Limit cache size to prevent memory issues
    if (geocodeCache.size > 1000) {
      // Remove oldest entries (first 100)
      const entries = Array.from(geocodeCache.keys());
      for (let i = 0; i < 100 && i < entries.length; i++) {
        const entry = entries[i];
        if (entry) {
          geocodeCache.delete(entry);
        }
      }
    }
  }

  /**
   * Clear the geocoding cache
   * Useful for testing or manual cache invalidation
   */
  static clearCache(): void {
    geocodeCache.clear();
    console.log("✅ Geocoding cache cleared");
  }

  /**
   * Get cache statistics
   *
   * @returns Cache size and statistics
   */
  static getCacheStats(): { size: number; maxSize: number } {
    return {
      size: geocodeCache.size,
      maxSize: 1000,
    };
  }

  /**
   * Validate coordinates are within reasonable bounds
   *
   * @param latitude - Latitude to validate
   * @param longitude - Longitude to validate
   * @returns True if valid
   */
  static validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    );
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   *
   * @param lat1 - Latitude of point 1
   * @param lon1 - Longitude of point 1
   * @param lat2 - Latitude of point 2
   * @param lon2 - Longitude of point 2
   * @returns Distance in miles
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Convert degrees to radians
   *
   * @param degrees - Degrees to convert
   * @returns Radians
   * @private
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
