/**
 * GEOCODING SERVICE - Divine Location Intelligence
 *
 * Converts addresses to geographic coordinates (latitude/longitude)
 * using multiple providers with fallback support.
 *
 * Features:
 * - Multi-provider support (Nominatim, Google Maps, Mapbox)
 * - US state center fallbacks for reliability
 * - Reverse geocoding
 * - Distance calculations (Haversine formula)
 * - Agricultural farm proximity search
 * - Performance caching
 * - Rate limiting compliance
 *
 * Divine Patterns Applied:
 * - Performance Reality Bending (caching, rate limiting)
 * - Agricultural Quantum Mastery (location awareness, farm proximity)
 * - Testing & Security Divinity (validation, error handling)
 *
 * @module GeocodingService
 */

import { createHash } from "crypto";

// ============================================================================
// TYPES
// ============================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodeResult extends Coordinates {
  formattedAddress: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  confidence: number; // 0-1 scale
  provider: string;
}

export interface GeocodeOptions {
  provider?: "nominatim" | "google" | "mapbox";
  language?: string;
  countryCode?: string; // ISO 3166-1 alpha-2 country code (default: "us")
}

// ============================================================================
// US STATE CENTER COORDINATES
// ============================================================================

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

const US_CENTER = { lat: 39.8283, lng: -98.5795 };

// ============================================================================
// GEOCODING SERVICE CLASS
// ============================================================================

export class GeocodingService {
  private cache = new Map<string, GeocodeResult>();
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly RATE_LIMIT_MS = 1000; // 1 second between requests (Nominatim requirement)
  private readonly MAX_CACHE_SIZE = 1000;

  /**
   * Geocode an address to coordinates
   *
   * @param address - Full address string OR street address (if other params provided)
   * @param city - Optional city name
   * @param state - Optional state code (e.g., "CA", "NY")
   * @param zipCode - Optional ZIP code
   * @param options - Geocoding options (provider, language, countryCode)
   * @returns Geocoding result with coordinates and formatted address
   *
   * @example
   * // Simple usage
   * const result = await geocodingService.geocodeAddress("1600 Amphitheatre Parkway, Mountain View, CA 94043");
   *
   * @example
   * // With separated components
   * const result = await geocodingService.geocodeAddress(
   *   "123 Main St",
   *   "Sacramento",
   *   "CA",
   *   "95814"
   * );
   */
  async geocodeAddress(
    address: string,
    city?: string,
    state?: string,
    zipCode?: string,
    options: GeocodeOptions = {},
  ): Promise<GeocodeResult | null> {
    try {
      // Build full address string
      const fullAddress = city
        ? `${address}, ${city}, ${state} ${zipCode}`.trim()
        : address;

      // Check cache first
      const cacheKey = this.getCacheKey(fullAddress, options);
      if (this.cache.has(cacheKey)) {
        console.log(`✅ Geocoding cache hit: ${fullAddress}`);
        return this.cache.get(cacheKey)!;
      }

      // Rate limiting
      await this.enforceRateLimit();

      console.log(`🌍 Geocoding address: ${fullAddress}`);

      // Try providers in order
      const provider = options.provider || "nominatim";

      let result: GeocodeResult | null = null;

      switch (provider) {
        case "nominatim":
          result = await this.geocodeWithNominatim(fullAddress, options);
          break;
        case "google":
          result = await this.geocodeWithGoogle(fullAddress, options);
          break;
        case "mapbox":
          result = await this.geocodeWithMapbox(fullAddress, options);
          break;
        default:
          result = await this.geocodeWithNominatim(fullAddress, options);
      }

      // If geocoding failed and we have a state, use state center as fallback
      if (!result && state) {
        console.log(
          `⚠️ Geocoding failed, using state center fallback for ${state}`,
        );
        result = this.getStateCenterCoordinates(state);
      }

      // Cache successful result
      if (result) {
        this.saveToCache(cacheKey, result);
        console.log(
          `✅ Geocoded: ${fullAddress} → (${result.latitude}, ${result.longitude})`,
        );
      }

      return result;
    } catch (error) {
      console.error("❌ Geocoding error:", error);

      // Final fallback: Use state center if available
      if (state) {
        console.log(`⚠️ Error fallback: using state center for ${state}`);
        return this.getStateCenterCoordinates(state);
      }

      return null;
    }
  }

  /**
   * Reverse geocode coordinates to an address
   *
   * @param latitude - Latitude
   * @param longitude - Longitude
   * @param options - Geocoding options
   * @returns Geocoding result with formatted address
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
    options: GeocodeOptions = {},
  ): Promise<GeocodeResult | null> {
    try {
      // Validate coordinates
      if (!this.validateCoordinates(latitude, longitude)) {
        throw new Error(
          `Invalid coordinates: lat=${latitude}, lng=${longitude}`,
        );
      }

      await this.enforceRateLimit();

      const provider = options.provider || "nominatim";

      switch (provider) {
        case "nominatim":
          return await this.reverseGeocodeWithNominatim(
            latitude,
            longitude,
            options,
          );
        case "google":
          return await this.reverseGeocodeWithGoogle(
            latitude,
            longitude,
            options,
          );
        case "mapbox":
          return await this.reverseGeocodeWithMapbox(
            latitude,
            longitude,
            options,
          );
        default:
          return await this.reverseGeocodeWithNominatim(
            latitude,
            longitude,
            options,
          );
      }
    } catch (error) {
      console.error("❌ Reverse geocoding error:", error);
      return null;
    }
  }

  /**
   * Validate coordinates are within reasonable bounds
   *
   * @param latitude - Latitude to validate
   * @param longitude - Longitude to validate
   * @returns True if valid
   */
  validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    );
  }

  /**
   * Calculate distance between two coordinates (in miles)
   * Uses Haversine formula
   *
   * @param lat1 - Latitude of point 1
   * @param lon1 - Longitude of point 1
   * @param lat2 - Latitude of point 2
   * @param lon2 - Longitude of point 2
   * @returns Distance in miles (rounded to 1 decimal)
   */
  calculateDistance(
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
   * Calculate distance using Coordinates interface (in kilometers)
   *
   * @param coord1 - First coordinate
   * @param coord2 - Second coordinate
   * @returns Distance in kilometers
   */
  calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) *
        Math.cos(this.toRadians(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Find nearby farms within a specified radius (Agricultural Feature)
   * Calculates distances and filters/sorts farms by proximity
   *
   * @param userLat - User's latitude
   * @param userLng - User's longitude
   * @param farms - Array of farms with location data
   * @param radiusMiles - Search radius in miles
   * @returns Array of farms within radius, sorted by distance (closest first)
   *
   * @example
   * const nearbyFarms = await geocodingService.findNearbyFarms(
   *   38.5816,
   *   -121.4944,
   *   farmsList,
   *   50
   * );
   */
  async findNearbyFarms<
    T extends {
      id: string;
      name: string;
      lat: number;
      lng: number;
      distance?: number;
    },
  >(
    userLat: number,
    userLng: number,
    farms: T[],
    radiusMiles: number,
  ): Promise<(T & { distance: number })[]> {
    // Handle empty array
    if (farms.length === 0) {
      return [];
    }

    // Validate user coordinates
    if (!this.validateCoordinates(userLat, userLng)) {
      throw new Error(
        `Invalid user coordinates: lat=${userLat}, lng=${userLng}`,
      );
    }

    // Calculate distances for all farms
    const farmsWithDistances = farms.map((farm) => {
      const distance = this.calculateDistance(
        userLat,
        userLng,
        farm.lat,
        farm.lng,
      );

      return {
        ...farm,
        distance,
      };
    });

    // Filter farms within radius
    const nearbyFarms = farmsWithDistances.filter(
      (farm) => farm.distance <= radiusMiles,
    );

    // Sort by distance (closest first)
    nearbyFarms.sort((a, b) => a.distance - b.distance);

    console.log(
      `🔍 Found ${nearbyFarms.length} farms within ${radiusMiles} miles of (${userLat}, ${userLng})`,
    );

    return nearbyFarms;
  }

  // ============================================================================
  // PROVIDER IMPLEMENTATIONS
  // ============================================================================

  /**
   * Geocode using OpenStreetMap Nominatim (Free, no API key)
   */
  private async geocodeWithNominatim(
    address: string,
    options: GeocodeOptions,
  ): Promise<GeocodeResult | null> {
    const params = new URLSearchParams({
      q: address,
      format: "json",
      limit: "1",
      addressdetails: "1",
      countrycodes: options.countryCode || "us", // Default to US
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": "FarmersMarketPlatform/1.0 (Agricultural E-Commerce)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      },
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const result = data[0];

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
      city: result.address?.city || result.address?.town,
      state: result.address?.state,
      country: result.address?.country,
      postalCode: result.address?.postcode,
      confidence: result.importance || 0.5,
      provider: "nominatim",
    };
  }

  /**
   * Reverse geocode using Nominatim
   */
  private async reverseGeocodeWithNominatim(
    latitude: number,
    longitude: number,
    _options: GeocodeOptions,
  ): Promise<GeocodeResult | null> {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      format: "json",
      addressdetails: "1",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      {
        headers: {
          "User-Agent": "FarmersMarketPlatform/1.0",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result || result.error) {
      return null;
    }

    return {
      latitude,
      longitude,
      formattedAddress: result.display_name,
      city: result.address?.city || result.address?.town,
      state: result.address?.state,
      country: result.address?.country,
      postalCode: result.address?.postcode,
      confidence: 0.8,
      provider: "nominatim",
    };
  }

  /**
   * Geocode using Google Maps Geocoding API (Requires API key)
   */
  private async geocodeWithGoogle(
    address: string,
    options: GeocodeOptions,
  ): Promise<GeocodeResult | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn(
        "⚠️  Google Maps API key not configured, falling back to Nominatim",
      );
      return this.geocodeWithNominatim(address, options);
    }

    const params = new URLSearchParams({
      address,
      key: apiKey,
    });

    if (options.language) {
      params.set("language", options.language);
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];
    const location = result.geometry.location;

    const getComponent = (type: string) =>
      result.address_components.find((c: { types: string[] }) =>
        c.types.includes(type),
      )?.long_name;

    return {
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: result.formatted_address,
      city:
        getComponent("locality") || getComponent("administrative_area_level_2"),
      state: getComponent("administrative_area_level_1"),
      country: getComponent("country"),
      postalCode: getComponent("postal_code"),
      confidence: 1.0,
      provider: "google",
    };
  }

  /**
   * Reverse geocode using Google Maps
   */
  private async reverseGeocodeWithGoogle(
    latitude: number,
    longitude: number,
    options: GeocodeOptions,
  ): Promise<GeocodeResult | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn(
        "⚠️  Google Maps API key not configured, falling back to Nominatim",
      );
      return this.reverseGeocodeWithNominatim(latitude, longitude, options);
    }

    const params = new URLSearchParams({
      latlng: `${latitude},${longitude}`,
      key: apiKey,
    });

    if (options.language) {
      params.set("language", options.language);
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];

    const getComponent = (type: string) =>
      result.address_components.find((c: { types: string[] }) =>
        c.types.includes(type),
      )?.long_name;

    return {
      latitude,
      longitude,
      formattedAddress: result.formatted_address,
      city:
        getComponent("locality") || getComponent("administrative_area_level_2"),
      state: getComponent("administrative_area_level_1"),
      country: getComponent("country"),
      postalCode: getComponent("postal_code"),
      confidence: 1.0,
      provider: "google",
    };
  }

  /**
   * Geocode using Mapbox Geocoding API (Requires API key)
   */
  private async geocodeWithMapbox(
    address: string,
    _options: GeocodeOptions,
  ): Promise<GeocodeResult | null> {
    const apiKey = process.env.MAPBOX_API_KEY;

    if (!apiKey) {
      console.warn(
        "⚠️  Mapbox API key not configured, falling back to Nominatim",
      );
      return this.geocodeWithNominatim(address, _options);
    }

    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const result = data.features[0];
    const [longitude, latitude] = result.center;

    const getContext = (type: string) =>
      result.context?.find((c: { id: string }) => c.id.startsWith(type))?.text;

    return {
      latitude,
      longitude,
      formattedAddress: result.place_name,
      city: getContext("place"),
      state: getContext("region"),
      country: getContext("country"),
      postalCode: getContext("postcode"),
      confidence: result.relevance || 0.8,
      provider: "mapbox",
    };
  }

  /**
   * Reverse geocode using Mapbox
   */
  private async reverseGeocodeWithMapbox(
    latitude: number,
    longitude: number,
    _options: GeocodeOptions,
  ): Promise<GeocodeResult | null> {
    const apiKey = process.env.MAPBOX_API_KEY;

    if (!apiKey) {
      console.warn(
        "⚠️  Mapbox API key not configured, falling back to Nominatim",
      );
      return this.reverseGeocodeWithNominatim(latitude, longitude, _options);
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const result = data.features[0];

    const getContext = (type: string) =>
      result.context?.find((c: { id: string }) => c.id.startsWith(type))?.text;

    return {
      latitude,
      longitude,
      formattedAddress: result.place_name,
      city: getContext("place"),
      state: getContext("region"),
      country: getContext("country"),
      postalCode: getContext("postcode"),
      confidence: 1.0,
      provider: "mapbox",
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get state center coordinates as fallback
   */
  private getStateCenterCoordinates(state: string): GeocodeResult {
    const stateUpper = state.toUpperCase();
    const coords = STATE_CENTERS[stateUpper] || US_CENTER;

    return {
      latitude: coords.lat,
      longitude: coords.lng,
      formattedAddress: `${stateUpper}, United States`,
      state: stateUpper,
      country: "United States",
      confidence: 0.3, // Low confidence for fallback
      provider: "state-center-fallback",
    };
  }

  /**
   * Generate cache key from address and options
   */
  private getCacheKey(address: string, options: GeocodeOptions): string {
    const keyString = `${address}|${options.provider || "nominatim"}|${options.countryCode || ""}`;
    return createHash("sha256")
      .update(keyString.toLowerCase())
      .digest("hex")
      .substring(0, 32);
  }

  /**
   * Save result to cache with size management
   */
  private saveToCache(key: string, result: GeocodeResult): void {
    this.cache.set(key, result);

    // Limit cache size to prevent memory issues
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      // Remove oldest entries (first 100)
      const entries = Array.from(this.cache.keys());
      for (let i = 0; i < 100 && i < entries.length; i++) {
        const entry = entries[i];
        if (entry) {
          this.cache.delete(entry);
        }
      }
    }
  }

  /**
   * Wait if necessary to comply with rate limiting
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.RATE_LIMIT_MS) {
      const waitTime = this.RATE_LIMIT_MS - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log("✅ Geocoding cache cleared");
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; requests: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      requests: this.requestCount,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const geocodingService = new GeocodingService();
