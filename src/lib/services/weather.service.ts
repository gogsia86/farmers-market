import type { Coordinates } from "@/types/biodynamic.types";

/**
 * Weather Service
 *
 * Provides real-time weather data and forecasts for farm locations
 * Integrates with OpenWeatherMap API
 *
 * Features:
 * - Current weather conditions
 * - 7-day forecast
 * - Frost warnings
 * - Precipitation alerts
 * - Growing degree days calculation
 * - Biodynamic planting recommendations based on weather
 */

// Weather data types
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  temperature: number; // Fahrenheit
  feelsLike: number;
  humidity: number; // percentage
  pressure: number; // hPa
  windSpeed: number; // mph
  windDirection: number; // degrees
  cloudCover: number; // percentage
  uvIndex: number;
  visibility: number; // miles
  conditions: WeatherCondition[];
  sunrise: Date;
  sunset: Date;
  timestamp: Date;
}

export interface DailyForecast {
  date: Date;
  temperatureMin: number;
  temperatureMax: number;
  temperatureMorning: number;
  temperatureDay: number;
  temperatureEvening: number;
  temperatureNight: number;
  feelsLikeDay: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  precipitationChance: number; // percentage
  precipitationAmount: number; // inches
  uvIndex: number;
  conditions: WeatherCondition[];
  sunrise: Date;
  sunset: Date;
}

export interface WeatherAlert {
  event: string;
  headline: string;
  description: string;
  severity: "minor" | "moderate" | "severe" | "extreme";
  start: Date;
  end: Date;
  areas: string[];
}

export interface FrostAlert {
  date: Date;
  temperatureMin: number;
  severity: "light" | "moderate" | "hard"; // 29-32°F, 25-28°F, <25°F
  confidence: number; // 0-1
  recommendation: string;
}

export interface GrowingDegreeDays {
  date: Date;
  gdd: number;
  cumulativeGdd: number;
  baseTemperature: number;
}

export interface PlantingWeatherScore {
  date: Date;
  score: number; // 0-100
  factors: {
    temperature: { value: number; score: number; ideal: string };
    soilMoisture: { value: number; score: number; ideal: string };
    precipitation: { value: number; score: number; ideal: string };
    windSpeed: { value: number; score: number; ideal: string };
  };
  recommendation: string;
  isOptimal: boolean;
}

export interface WeatherForecast {
  location: {
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  current: CurrentWeather;
  daily: DailyForecast[];
  alerts: WeatherAlert[];
  frostAlerts: FrostAlert[];
  growingDegreeDays: GrowingDegreeDays[];
  plantingScore: PlantingWeatherScore;
}

class WeatherService {
  private apiKey: string;
  private baseUrl = "https://api.openweathermap.org/data/3.0";
  private cacheMap = new Map<string, { data: any; expiry: number }>();
  private cacheDuration = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || "";

    if (!this.apiKey && process.env.NODE_ENV === "production") {
      console.warn(
        "OpenWeatherMap API key not configured. Weather features will be limited.",
      );
    }
  }

  /**
   * Get comprehensive weather forecast for a location
   */
  async getForecast(
    coordinates: Coordinates,
    days: number = 7,
  ): Promise<WeatherForecast> {
    const cacheKey = `forecast:${coordinates.lat},${coordinates.lng}:${days}`;

    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Use mock data if no API key (development)
      if (!this.apiKey) {
        return this.getMockForecast(coordinates, days);
      }

      // Call OneCall API 3.0 (includes current, daily, alerts)
      const response = await fetch(
        `${this.baseUrl}/onecall?lat=${coordinates.lat}&lon=${coordinates.lng}&exclude=minutely,hourly&units=imperial&appid=${this.apiKey}`,
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform to our format
      const forecast: WeatherForecast = {
        location: {
          name: "", // Will be populated by reverse geocoding if needed
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          timezone: data.timezone || "America/New_York",
        },
        current: this.transformCurrentWeather(data.current),
        daily: data.daily
          .slice(0, days)
          .map((day: any) => this.transformDailyForecast(day)),
        alerts: (data.alerts || []).map((alert: any) =>
          this.transformAlert(alert),
        ),
        frostAlerts: this.detectFrostAlerts(data.daily.slice(0, days)),
        growingDegreeDays: this.calculateGDD(data.daily.slice(0, days)),
        plantingScore: this.calculatePlantingScore(data.current, data.daily[0]),
      };

      // Cache the result
      this.setCache(cacheKey, forecast);

      return forecast;
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
      // Fallback to mock data
      return this.getMockForecast(coordinates, days);
    }
  }

  /**
   * Get current weather conditions
   */
  async getCurrentWeather(coordinates: Coordinates): Promise<CurrentWeather> {
    const forecast = await this.getForecast(coordinates, 1);
    return forecast.current;
  }

  /**
   * Check for upcoming frost events
   */
  async checkFrostRisk(
    coordinates: Coordinates,
    days: number = 7,
  ): Promise<FrostAlert[]> {
    const forecast = await this.getForecast(coordinates, days);
    return forecast.frostAlerts;
  }

  /**
   * Calculate growing degree days
   * GDD = (Max Temp + Min Temp) / 2 - Base Temp
   * Base temperature typically 50°F for most crops
   */
  async getGrowingDegreeDays(
    coordinates: Coordinates,
    baseTemperature: number = 50,
    days: number = 7,
  ): Promise<GrowingDegreeDays[]> {
    const forecast = await this.getForecast(coordinates, days);
    return forecast.growingDegreeDays.map((gdd) => ({
      ...gdd,
      baseTemperature,
    }));
  }

  /**
   * Get optimal planting weather score
   */
  async getPlantingScore(
    coordinates: Coordinates,
  ): Promise<PlantingWeatherScore> {
    const forecast = await this.getForecast(coordinates, 1);
    return forecast.plantingScore;
  }

  /**
   * Check if current conditions are suitable for planting
   */
  async isOptimalPlantingWeather(
    coordinates: Coordinates,
    cropType: "COOL_SEASON" | "WARM_SEASON" | "ALL_SEASON" = "ALL_SEASON",
  ): Promise<{ optimal: boolean; score: number; reason: string }> {
    const score = await this.getPlantingScore(coordinates);

    const temperatureRanges = {
      COOL_SEASON: { min: 45, max: 75 },
      WARM_SEASON: { min: 60, max: 90 },
      ALL_SEASON: { min: 50, max: 85 },
    };

    const range = temperatureRanges[cropType];
    const temp = score.factors.temperature.value;
    const tempOk = temp >= range.min && temp <= range.max;

    const soilOk = score.factors.soilMoisture.score >= 60;
    const precipOk = score.factors.precipitation.score >= 60;
    const windOk = score.factors.windSpeed.score >= 60;

    const optimal = tempOk && soilOk && precipOk && windOk && score.score >= 70;

    let reason = "";
    if (!tempOk)
      reason = `Temperature ${temp}°F outside optimal range ${range.min}-${range.max}°F`;
    else if (!soilOk) reason = "Soil conditions not ideal";
    else if (!precipOk)
      reason =
        score.factors.precipitation.value > 0.5
          ? "Too wet for planting"
          : "Too dry for planting";
    else if (!windOk) reason = "Wind too strong for planting";
    else if (score.score < 70) reason = "Overall conditions suboptimal";
    else reason = "Excellent conditions for planting";

    return { optimal, score: score.score, reason };
  }

  // Private helper methods

  private transformCurrentWeather(data: any): CurrentWeather {
    return {
      temperature: data.temp,
      feelsLike: data.feels_like,
      humidity: data.humidity,
      pressure: data.pressure,
      windSpeed: data.wind_speed,
      windDirection: data.wind_deg || 0,
      cloudCover: data.clouds,
      uvIndex: data.uvi || 0,
      visibility: (data.visibility || 10000) * 0.000621371, // meters to miles
      conditions: data.weather || [],
      sunrise: new Date(data.sunrise * 1000),
      sunset: new Date(data.sunset * 1000),
      timestamp: new Date(data.dt * 1000),
    };
  }

  private transformDailyForecast(data: any): DailyForecast {
    return {
      date: new Date(data.dt * 1000),
      temperatureMin: data.temp.min,
      temperatureMax: data.temp.max,
      temperatureMorning: data.temp.morn,
      temperatureDay: data.temp.day,
      temperatureEvening: data.temp.eve,
      temperatureNight: data.temp.night,
      feelsLikeDay: data.feels_like.day,
      humidity: data.humidity,
      pressure: data.pressure,
      windSpeed: data.wind_speed,
      windDirection: data.wind_deg || 0,
      cloudCover: data.clouds,
      precipitationChance: (data.pop || 0) * 100,
      precipitationAmount: (data.rain || 0) * 0.0393701, // mm to inches
      uvIndex: data.uvi || 0,
      conditions: data.weather || [],
      sunrise: new Date(data.sunrise * 1000),
      sunset: new Date(data.sunset * 1000),
    };
  }

  private transformAlert(data: any): WeatherAlert {
    const severityMap: Record<string, WeatherAlert["severity"]> = {
      minor: "minor",
      moderate: "moderate",
      severe: "severe",
      extreme: "extreme",
    };

    return {
      event: data.event,
      headline: data.headline || data.event,
      description: data.description,
      severity: severityMap[data.severity] || "moderate",
      start: new Date(data.start * 1000),
      end: new Date(data.end * 1000),
      areas: data.tags || [],
    };
  }

  private detectFrostAlerts(dailyForecasts: any[]): FrostAlert[] {
    const alerts: FrostAlert[] = [];

    for (const day of dailyForecasts) {
      const minTemp = day.temp.min;

      if (minTemp <= 32) {
        let severity: FrostAlert["severity"];
        if (minTemp >= 29) severity = "light";
        else if (minTemp >= 25) severity = "moderate";
        else severity = "hard";

        const recommendations = {
          light: "Cover tender plants. Most hardy plants will survive.",
          moderate: "Protect all tender plants. Harvest sensitive crops.",
          hard: "Severe damage likely to most plants. Harvest all remaining crops.",
        };

        alerts.push({
          date: new Date(day.dt * 1000),
          temperatureMin: minTemp,
          severity,
          confidence: minTemp <= 28 ? 0.9 : 0.7,
          recommendation: recommendations[severity],
        });
      }
    }

    return alerts;
  }

  private calculateGDD(
    dailyForecasts: any[],
    baseTemp: number = 50,
  ): GrowingDegreeDays[] {
    let cumulative = 0;
    const result: GrowingDegreeDays[] = [];

    for (const day of dailyForecasts) {
      const maxTemp = day.temp.max;
      const minTemp = day.temp.min;

      // Calculate daily GDD
      const avgTemp = (maxTemp + minTemp) / 2;
      const gdd = Math.max(0, avgTemp - baseTemp);
      cumulative += gdd;

      result.push({
        date: new Date(day.dt * 1000),
        gdd: Math.round(gdd * 10) / 10,
        cumulativeGdd: Math.round(cumulative * 10) / 10,
        baseTemperature: baseTemp,
      });
    }

    return result;
  }

  private calculatePlantingScore(
    current: any,
    forecast: any,
  ): PlantingWeatherScore {
    const temp = current.temp;
    const humidity = current.humidity;
    const windSpeed = current.wind_speed;
    const precipChance = forecast.pop || 0;
    const precipAmount = forecast.rain || 0;

    // Temperature score (ideal: 60-75°F)
    let tempScore = 100;
    if (temp < 50 || temp > 85) tempScore = 30;
    else if (temp < 55 || temp > 80) tempScore = 60;
    else if (temp < 60 || temp > 75) tempScore = 80;

    // Soil moisture score (based on recent precipitation and humidity)
    let soilScore = 70; // Assume moderate
    if (humidity > 80 || precipAmount > 0.5)
      soilScore = 40; // Too wet
    else if (humidity < 40)
      soilScore = 50; // Too dry
    else if (humidity >= 50 && humidity <= 70) soilScore = 90; // Ideal

    // Precipitation score (ideal: no rain today, light rain yesterday)
    let precipScore = 100;
    if (precipChance > 50) precipScore = 30;
    else if (precipChance > 30) precipScore = 60;
    else if (precipChance > 10) precipScore = 80;

    // Wind score (ideal: < 10 mph)
    let windScore = 100;
    if (windSpeed > 20) windScore = 30;
    else if (windSpeed > 15) windScore = 60;
    else if (windSpeed > 10) windScore = 80;

    // Overall score (weighted average)
    const overallScore = Math.round(
      tempScore * 0.35 +
        soilScore * 0.25 +
        precipScore * 0.25 +
        windScore * 0.15,
    );

    let recommendation = "";
    if (overallScore >= 80) recommendation = "Excellent planting conditions";
    else if (overallScore >= 70) recommendation = "Good planting conditions";
    else if (overallScore >= 60)
      recommendation = "Fair planting conditions, monitor weather";
    else if (overallScore >= 50)
      recommendation = "Marginal conditions, consider waiting";
    else recommendation = "Poor planting conditions, wait for better weather";

    return {
      date: new Date(current.dt * 1000),
      score: overallScore,
      factors: {
        temperature: {
          value: temp,
          score: tempScore,
          ideal: "60-75°F",
        },
        soilMoisture: {
          value: humidity,
          score: soilScore,
          ideal: "50-70% humidity",
        },
        precipitation: {
          value: precipChance,
          score: precipScore,
          ideal: "< 10% chance",
        },
        windSpeed: {
          value: windSpeed,
          score: windScore,
          ideal: "< 10 mph",
        },
      },
      recommendation,
      isOptimal: overallScore >= 70,
    };
  }

  private getMockForecast(
    coordinates: Coordinates,
    days: number,
  ): WeatherForecast {
    const now = new Date();
    const current: CurrentWeather = {
      temperature: 68,
      feelsLike: 65,
      humidity: 60,
      pressure: 1013,
      windSpeed: 8,
      windDirection: 180,
      cloudCover: 20,
      uvIndex: 5,
      visibility: 10,
      conditions: [
        { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
      ],
      sunrise: new Date(now.setHours(6, 30, 0, 0)),
      sunset: new Date(now.setHours(19, 45, 0, 0)),
      timestamp: new Date(),
    };

    const daily: DailyForecast[] = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);

      return {
        date,
        temperatureMin: 55 + Math.random() * 10,
        temperatureMax: 75 + Math.random() * 10,
        temperatureMorning: 60,
        temperatureDay: 75,
        temperatureEvening: 70,
        temperatureNight: 60,
        feelsLikeDay: 73,
        humidity: 55 + Math.random() * 20,
        pressure: 1010 + Math.random() * 10,
        windSpeed: 5 + Math.random() * 10,
        windDirection: 180,
        cloudCover: Math.random() * 50,
        precipitationChance: Math.random() * 30,
        precipitationAmount: 0,
        uvIndex: 4 + Math.random() * 4,
        conditions: [
          { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
        ],
        sunrise: new Date(date.setHours(6, 30, 0, 0)),
        sunset: new Date(date.setHours(19, 45, 0, 0)),
      };
    });

    return {
      location: {
        name: "Mock Location",
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        timezone: "America/New_York",
      },
      current,
      daily,
      alerts: [],
      frostAlerts: [],
      growingDegreeDays: this.calculateGDD(
        daily.map((d, i) => ({
          dt: Math.floor(d.date.getTime() / 1000),
          temp: { max: d.temperatureMax, min: d.temperatureMin },
        })),
      ),
      plantingScore: {
        date: new Date(),
        score: 85,
        factors: {
          temperature: { value: 68, score: 90, ideal: "60-75°F" },
          soilMoisture: { value: 60, score: 85, ideal: "50-70% humidity" },
          precipitation: { value: 10, score: 80, ideal: "< 10% chance" },
          windSpeed: { value: 8, score: 85, ideal: "< 10 mph" },
        },
        recommendation: "Excellent planting conditions",
        isOptimal: true,
      },
    };
  }

  private getFromCache(key: string): any | null {
    const cached = this.cacheMap.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.cacheMap.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cacheMap.set(key, {
      data,
      expiry: Date.now() + this.cacheDuration,
    });
  }
}

// Export singleton instance
export const weatherService = new WeatherService();
