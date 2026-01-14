/**
 * Environment Variable Utilities
 *
 * Safely retrieves and cleans environment variables to prevent issues
 * with whitespace, newlines, and tabs that can cause connection errors.
 *
 * @module lib/utils/env
 */

/**
 * Retrieves and cleans an environment variable
 * Removes leading/trailing whitespace, newlines, tabs, and carriage returns
 *
 * @param key - The environment variable key
 * @returns The cleaned value or undefined if not set
 *
 * @example
 * ```typescript
 * const redisUrl = getCleanEnvVar('UPSTASH_REDIS_REST_URL');
 * if (redisUrl) {
 *   // Use the cleaned URL
 * }
 * ```
 */
export function getCleanEnvVar(key: string): string | undefined {
  const value = process.env[key];

  if (!value) {
    return undefined;
  }

  // Remove all types of whitespace
  const cleaned = value
    .trim()
    .replace(/[\r\n\t]/g, '')
    .replace(/\s+/g, ' ');

  // Log warning if we had to clean the value (only in development)
  if (cleaned !== value && process.env.NODE_ENV !== 'production') {
    console.warn(`[ENV] Cleaned whitespace from ${key}`);
  }

  return cleaned;
}

/**
 * Retrieves a required environment variable with cleaning
 * Throws an error if the variable is not set
 *
 * @param key - The environment variable key
 * @returns The cleaned value
 * @throws Error if the environment variable is not set
 *
 * @example
 * ```typescript
 * const databaseUrl = getRequiredEnvVar('DATABASE_URL');
 * // Will throw if DATABASE_URL is not set
 * ```
 */
export function getRequiredEnvVar(key: string): string {
  const value = getCleanEnvVar(key);

  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }

  return value;
}

/**
 * Redis Configuration Interface
 */
export interface RedisConfig {
  url: string;
  token: string;
}

/**
 * Gets Redis configuration with cleaned values
 * Returns null if Redis is not configured
 *
 * @returns Redis configuration or null
 *
 * @example
 * ```typescript
 * const config = getRedisConfig();
 * if (config) {
 *   const redis = new Redis(config);
 * }
 * ```
 */
export function getRedisConfig(): RedisConfig | null {
  const url = getCleanEnvVar('UPSTASH_REDIS_REST_URL');
  const token = getCleanEnvVar('UPSTASH_REDIS_REST_TOKEN');

  if (!url || !token) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Redis] Configuration not available, using fallback');
    }
    return null;
  }

  return { url, token };
}

/**
 * Database Configuration Interface
 */
export interface DatabaseConfig {
  url: string;
}

/**
 * Gets database configuration with cleaned values
 *
 * @returns Database configuration
 * @throws Error if DATABASE_URL is not set
 *
 * @example
 * ```typescript
 * const config = getDatabaseConfig();
 * // Use config.url
 * ```
 */
export function getDatabaseConfig(): DatabaseConfig {
  const url = getRequiredEnvVar('DATABASE_URL');
  return { url };
}

/**
 * Checks if running in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Checks if running in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Checks if running in test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Checks if running on Vercel
 */
export function isVercel(): boolean {
  return process.env.VERCEL === '1';
}

/**
 * Gets the current environment name
 */
export function getEnvironment(): string {
  return process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
}

/**
 * Validates that all required environment variables are set
 *
 * @param keys - Array of required environment variable keys
 * @returns Object with validation results
 *
 * @example
 * ```typescript
 * const result = validateEnvVars([
 *   'DATABASE_URL',
 *   'NEXTAUTH_SECRET',
 *   'UPSTASH_REDIS_REST_URL'
 * ]);
 *
 * if (!result.valid) {
 *   console.error('Missing variables:', result.missing);
 * }
 * ```
 */
export function validateEnvVars(keys: string[]): {
  valid: boolean;
  missing: string[];
  present: string[];
} {
  const missing: string[] = [];
  const present: string[] = [];

  for (const key of keys) {
    const value = getCleanEnvVar(key);
    if (value) {
      present.push(key);
    } else {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    present,
  };
}

/**
 * Gets environment variable as a boolean
 *
 * @param key - The environment variable key
 * @param defaultValue - Default value if not set
 * @returns Boolean value
 *
 * @example
 * ```typescript
 * const enableFeature = getBooleanEnvVar('ENABLE_FEATURE', false);
 * ```
 */
export function getBooleanEnvVar(key: string, defaultValue = false): boolean {
  const value = getCleanEnvVar(key);

  if (!value) {
    return defaultValue;
  }

  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}

/**
 * Gets environment variable as a number
 *
 * @param key - The environment variable key
 * @param defaultValue - Default value if not set or invalid
 * @returns Number value
 *
 * @example
 * ```typescript
 * const port = getNumberEnvVar('PORT', 3000);
 * ```
 */
export function getNumberEnvVar(key: string, defaultValue: number): number {
  const value = getCleanEnvVar(key);

  if (!value) {
    return defaultValue;
  }

  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    console.warn(`[ENV] Invalid number for ${key}, using default: ${defaultValue}`);
    return defaultValue;
  }

  return parsed;
}

/**
 * Gets environment variable as an array (comma-separated)
 *
 * @param key - The environment variable key
 * @param defaultValue - Default value if not set
 * @returns Array of strings
 *
 * @example
 * ```typescript
 * const allowedOrigins = getArrayEnvVar('ALLOWED_ORIGINS', ['http://localhost:3000']);
 * ```
 */
export function getArrayEnvVar(key: string, defaultValue: string[] = []): string[] {
  const value = getCleanEnvVar(key);

  if (!value) {
    return defaultValue;
  }

  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}
