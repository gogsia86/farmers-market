/**
 * GEOCODING SERVICE - Location Coordinate Resolution
 *
 * Converts addresses to geographic coordinates (latitude/longitude)
 * using multiple providers with fallback support.
 *
 * Supported Providers:
 * - OpenStreetMap Nominatim (Free, no API key required)
 * - Google Maps Geocoding API (Paid, requires API key)
 * - Mapbox Geocoding API (Paid, requires API key)
 *
 * Divine Patterns Applied:
 * - Performance Reality Bending (caching, rate limiting)
 * - Agricultural Quantum Mastery (location awareness)
 * - Testing & Security Divinity (validation, error handling)
 *
 * @module GeocodingService
 */

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
  countryCode?: string; // ISO 3166-1 alpha-2 country code
}

// ============================================================================
// GEOCODING SERVICE CLASS
// ============================================================================

export class GeocodingService {
  private cache = new Map<string, GeocodeResult>();
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly RATE_LIMIT_MS = 1000; // 1 second between requests (Nominatim requirement)

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(
    address: string,
    options: GeocodeOptions = {},
  ): Promise<GeocodeResult | null> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(address, options);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      // Rate limiting
      await this.enforceRateLimit();

      // Try providers in order
      const provider = options.provider || "nominatim";

      let result: GeocodeResult | null = null;

      switch (provider) {
        case "nominatim":
          result = await this.geocodeWithNominatim(address, options);
          break;
        case "google":
          result = await this.geocodeWithGoogle(address, options);
          break;
        case "mapbox":
          result = await this.geocodeWithMapbox(address, options);
          break;
        default:
          result = await this.geocodeWithNominatim(address, options);
      }

      // Cache successful result
      if (result) {
        this.cache.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.error("❌ Geocoding error:", error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to an address
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
    options: GeocodeOptions = {},
  ): Promise<GeocodeResult | null> {
    try {
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
   * Validate coordinates
   */
  validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    );
  }

  /**
   * Calculate distance between two coordinates (in kilometers)
   * Uses Haversine formula
   */
  calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
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
    });

    if (options.countryCode) {
      params.set("countrycodes", options.countryCode);
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": "FarmersMarketPlatform/1.0", // Required by Nominatim
        },
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
      latitude: Number.parseFloat(result.lat),
      longitude: Number.parseFloat(result.lon),
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
        },
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

    // Extract address components
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

    // Extract context information
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

  private getCacheKey(address: string, options: GeocodeOptions): string {
    return `${address}|${options.provider || "nominatim"}|${options.countryCode || ""}`;
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.RATE_LIMIT_MS) {
      const delay = this.RATE_LIMIT_MS - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; requests: number } {
    return {
      size: this.cache.size,
      requests: this.requestCount,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const geocodingService = new GeocodingService();
