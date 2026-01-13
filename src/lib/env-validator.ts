/**
 * Environment Variable Validator
 *
 * Validates required environment variables at application startup.
 * Prevents runtime errors due to missing or invalid configuration.
 *
 * Usage:
 *   import { validateEnv } from '@/lib/env-validator';
 *   validateEnv(); // Call at app startup
 */

import { z } from 'zod';

// Environment variable schema with validation rules
const envSchema = z.object({
  // ============================================
  // CORE APPLICATION SETTINGS (Required)
  // ============================================
  NODE_ENV: z.enum(['development', 'test', 'production', 'staging']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),

  // ============================================
  // DATABASE (Required)
  // ============================================
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(), // Optional, falls back to DATABASE_URL

  // ============================================
  // AUTHENTICATION (Required)
  // ============================================
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters for security')
    .refine(
      (val) => val !== 'development-secret-change-in-production-min-32-chars',
      'NEXTAUTH_SECRET must be changed from default value in production'
    ),

  // ============================================
  // PAYMENT INTEGRATION - STRIPE (Optional but recommended)
  // ============================================
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // ============================================
  // EMAIL SERVICE (Optional)
  // ============================================
  RESEND_API_KEY: z.string().optional(),
  CONTACT_EMAIL: z.string().email().optional(),

  // ============================================
  // CLOUD STORAGE - CLOUDINARY (Optional)
  // ============================================
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_UPLOAD_PRESET: z.string().optional(),

  // ============================================
  // AI INTEGRATION (Optional)
  // ============================================
  PERPLEXITY_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().optional(),
  OLLAMA_MODEL: z.string().optional(),
  OLLAMA_ENABLED: z.string().optional(),

  // ============================================
  // MONITORING & ERROR TRACKING (Optional)
  // ============================================
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // ============================================
  // CACHING - REDIS (Optional)
  // ============================================
  REDIS_URL: z.string().optional(),
  REDIS_KEY_PREFIX: z.string().optional(),

  // ============================================
  // EXTERNAL APIS (Optional)
  // ============================================
  WEATHER_API_KEY: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),

  // ============================================
  // OAUTH PROVIDERS (Optional)
  // ============================================
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),

  // ============================================
  // TELEMETRY (Optional)
  // ============================================
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  AZURE_APPLICATION_INSIGHTS_KEY: z.string().optional(),
  TELEMETRY_ENABLED: z.string().optional(),

  // ============================================
  // PERFORMANCE OPTIMIZATION (Optional)
  // ============================================
  HARDWARE_PROFILE: z.enum(['omen', 'standard', 'cloud']).optional(),
  GPU_ACCELERATION: z.string().optional(),
  MAX_PARALLEL_OPERATIONS: z.string().optional(),
  MEMORY_CACHE_SIZE_MB: z.string().optional(),
  ENABLE_QUERY_CACHE: z.string().optional(),

  // ============================================
  // DEPLOYMENT (Optional)
  // ============================================
  DEPLOYMENT_PLATFORM: z.enum(['vercel', 'docker', 'aws', 'azure', 'local']).optional(),
  ENABLE_PRODUCTION_OPTIMIZATIONS: z.string().optional(),

  // ============================================
  // SECURITY (Optional)
  // ============================================
  CORS_ALLOWED_ORIGINS: z.string().optional(),
});

// Type-safe environment variables
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates environment variables and provides helpful error messages
 * @throws {Error} If required variables are missing or invalid
 */
export function validateEnv(): EnvConfig {
  try {
    const parsed = envSchema.parse(process.env);

    // Additional custom validations
    validateProductionSecrets(parsed);
    validateStripeConfiguration(parsed);
    validateDatabaseConfiguration(parsed);

    console.log('✅ Environment variables validated successfully');
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      console.error('\nMissing or invalid environment variables:\n');

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        console.error(`  • ${path}: ${err.message}`);
      });

      console.error('\n📖 Please check your .env file and compare with .env.example');
      console.error('   Documentation: docs/deployment/ENV-SETUP-GUIDE.md\n');

      throw new Error('Environment validation failed. Fix the errors above and restart.');
    }
    throw error;
  }
}

/**
 * Production-specific security validations
 */
function validateProductionSecrets(env: EnvConfig): void {
  if (env.NODE_ENV === 'production') {
    const defaultSecrets = [
      'development-secret-change-in-production',
      'your-super-secret-key-change-this',
      'test-secret-key',
    ];

    if (defaultSecrets.some(secret => env.NEXTAUTH_SECRET.includes(secret))) {
      throw new Error(
        '🚨 SECURITY ERROR: Default NEXTAUTH_SECRET detected in production!\n' +
        '   Generate a secure secret: openssl rand -base64 32'
      );
    }

    if (env.NEXTAUTH_SECRET.length < 32) {
      throw new Error(
        '🚨 SECURITY ERROR: NEXTAUTH_SECRET must be at least 32 characters in production!'
      );
    }
  }
}

/**
 * Validates Stripe configuration consistency
 */
function validateStripeConfiguration(env: EnvConfig): void {
  const hasStripeKey = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || env.STRIPE_SECRET_KEY;

  if (hasStripeKey) {
    // If any Stripe key is set, validate configuration
    if (env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && env.STRIPE_SECRET_KEY) {
      const pubKey = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      const secretKey = env.STRIPE_SECRET_KEY;

      // Validate test/live mode consistency
      const pubIsTest = pubKey.startsWith('pk_test_');
      const secretIsTest = secretKey.startsWith('sk_test_');

      if (pubIsTest !== secretIsTest) {
        console.warn(
          '⚠️  WARNING: Stripe key mismatch detected!\n' +
          `   Publishable key: ${pubIsTest ? 'TEST' : 'LIVE'}\n` +
          `   Secret key: ${secretIsTest ? 'TEST' : 'LIVE'}\n` +
          '   Make sure both keys are for the same environment.'
        );
      }

      // Production should use live keys
      if (env.NODE_ENV === 'production' && pubIsTest) {
        console.warn(
          '⚠️  WARNING: Using Stripe TEST keys in production!\n' +
          '   Real payments will not be processed.'
        );
      }
    }
  }
}

/**
 * Validates database configuration
 */
function validateDatabaseConfiguration(env: EnvConfig): void {
  const dbUrl = env.DATABASE_URL;

  // Check for SQLite in production
  if (env.NODE_ENV === 'production' && dbUrl.startsWith('file:')) {
    throw new Error(
      '🚨 PRODUCTION ERROR: SQLite database detected!\n' +
      '   SQLite is not suitable for production. Please use PostgreSQL.\n' +
      '   Get a free PostgreSQL database from Supabase, Neon, or Vercel Postgres.'
    );
  }

  // Check for localhost in production
  if (env.NODE_ENV === 'production' && dbUrl.includes('localhost')) {
    throw new Error(
      '🚨 PRODUCTION ERROR: Localhost database detected!\n' +
      '   DATABASE_URL should point to a production database.'
    );
  }

  // Warn about test credentials in production
  if (env.NODE_ENV === 'production') {
    const testPatterns = ['test_password', 'password123', 'admin:admin'];
    if (testPatterns.some(pattern => dbUrl.includes(pattern))) {
      throw new Error(
        '🚨 SECURITY ERROR: Test credentials detected in production DATABASE_URL!\n' +
        '   Use a secure, randomly generated password.'
      );
    }
  }
}

/**
 * Gets a validated environment variable with a fallback
 * @param key - Environment variable key
 * @param fallback - Fallback value if not found
 */
export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is not defined and no fallback provided`);
  }
  return value || fallback || '';
}

/**
 * Checks if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Checks if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Checks if running in test
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Checks if a feature is enabled via environment variable
 * @param key - Environment variable key
 */
export function isFeatureEnabled(key: string): boolean {
  const value = process.env[key];
  return value === 'true' || value === '1' || value === 'yes';
}

/**
 * Gets the current environment name
 */
export function getEnvironment(): 'development' | 'test' | 'production' | 'staging' {
  return (process.env.NODE_ENV as any) || 'development';
}

// Export validated environment variables
let validatedEnv: EnvConfig | null = null;

/**
 * Gets the validated environment configuration
 * Call validateEnv() first at app startup
 */
export function getValidatedEnv(): EnvConfig {
  if (!validatedEnv) {
    validatedEnv = validateEnv();
  }
  return validatedEnv;
}

// Type-safe environment variable access
export const env = {
  get NODE_ENV() {
    return process.env.NODE_ENV || 'development';
  },
  get NEXT_PUBLIC_APP_URL() {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  },
  get DATABASE_URL() {
    return process.env.DATABASE_URL || '';
  },
  get NEXTAUTH_URL() {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
  },
  get NEXTAUTH_SECRET() {
    return process.env.NEXTAUTH_SECRET || '';
  },
  get REDIS_URL() {
    return process.env.REDIS_URL;
  },
  get STRIPE_SECRET_KEY() {
    return process.env.STRIPE_SECRET_KEY;
  },
  get NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY() {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  },
  // Add more as needed
};

export default {
  validateEnv,
  getEnvVar,
  isProduction,
  isDevelopment,
  isTest,
  isFeatureEnabled,
  getEnvironment,
  getValidatedEnv,
  env,
};
