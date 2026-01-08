/**
 * 🔒 ENVIRONMENT VARIABLE VALIDATION
 * Type-safe environment configuration with runtime validation
 * Prevents silent production failures from missing/invalid env vars
 */

import { z } from 'zod';

// ============================================================================
// ENVIRONMENT SCHEMA
// ============================================================================

const envSchema = z.object({
  // ========================================================================
  // NODE ENVIRONMENT
  // ========================================================================
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // ========================================================================
  // DATABASE
  // ========================================================================
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection URL'),

  // ========================================================================
  // NEXT.JS
  // ========================================================================
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),

  // ========================================================================
  // NEXTAUTH
  // ========================================================================
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters for security'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

  // ========================================================================
  // STRIPE
  // ========================================================================
  STRIPE_SECRET_KEY: z
    .string()
    .refine(
      (val) => val.startsWith('sk_'),
      'STRIPE_SECRET_KEY must start with sk_'
    ),
  STRIPE_PUBLISHABLE_KEY: z
    .string()
    .refine(
      (val) => val.startsWith('pk_'),
      'STRIPE_PUBLISHABLE_KEY must start with pk_'
    ),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .refine(
      (val) => val.startsWith('whsec_'),
      'STRIPE_WEBHOOK_SECRET must start with whsec_'
    ),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .refine(
      (val) => val.startsWith('pk_'),
      'Public Stripe key must start with pk_'
    )
    .optional(),

  // ========================================================================
  // EMAIL (SENDGRID)
  // ========================================================================
  SENDGRID_API_KEY: z
    .string()
    .refine(
      (val) => val.startsWith('SG.'),
      'SENDGRID_API_KEY must start with SG.'
    )
    .optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  SENDGRID_FROM_NAME: z.string().optional(),

  // ========================================================================
  // MONITORING & ANALYTICS
  // ========================================================================
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // ========================================================================
  // CLOUDINARY (IMAGE STORAGE)
  // ========================================================================
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // ========================================================================
  // REDIS (CACHING)
  // ========================================================================
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // ========================================================================
  // VERCEL
  // ========================================================================
  VERCEL: z.string().optional(),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  VERCEL_URL: z.string().optional(),

  // ========================================================================
  // FEATURE FLAGS
  // ========================================================================
  NEXT_PUBLIC_ENABLE_AI: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  // ========================================================================
  // DOCKER/BUILD
  // ========================================================================
  DOCKER_BUILD: z.string().optional(),
  CI: z.string().optional(),
  HUSKY: z.string().optional(),

  // ========================================================================
  // OPTIONAL INTEGRATIONS
  // ========================================================================
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),

  // ========================================================================
  // SMS (TWILIO)
  // ========================================================================
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // ========================================================================
  // GEOCODING
  // ========================================================================
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
});

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Env = z.infer<typeof envSchema>;

// ============================================================================
// VALIDATION FUNCTION
// ============================================================================

/**
 * Validates environment variables at startup
 * Only exits in production - allows builds and development to continue
 */
export function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);

    // Log successful validation in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Environment variables validated successfully');
    }

    return parsed;
  } catch (error) {
    // During build time, use safe defaults
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

    if (isBuildTime) {
      console.warn('⚠️  Build time - using safe defaults for env validation');
      // Return safe defaults for build
      return envSchema.parse({
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'x'.repeat(32),
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_placeholder',
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_placeholder',
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
      });
    }

    console.error('❌ INVALID ENVIRONMENT VARIABLES:');
    console.error('');

    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        console.error(`  • ${path}: ${err.message}`);
      });
    } else {
      console.error(error);
    }

    console.error('');
    console.error('💡 TIP: Check your .env file and ensure all required variables are set');
    console.error('📖 See .env.example for reference');
    console.error('');

    // Never exit during build or development
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  Continuing with invalid env vars (non-production)...');
      console.warn('⚠️  This may cause runtime errors!');
      console.warn('');
      // Return partial env with safe defaults
      return {
        NODE_ENV: (process.env.NODE_ENV as any) || 'development',
        DATABASE_URL: process.env.DATABASE_URL || '',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
      } as Env;
    }

    // Only exit in production runtime
    console.error('🚨 PRODUCTION: Cannot start with invalid environment variables');
    process.exit(1);
  }
}

// ============================================================================
// SAFE ENVIRONMENT ACCESS
// ============================================================================

/**
 * Type-safe environment variables
 * Uses lazy validation - only validates when accessed
 */
let _env: Env | null = null;

export const env = new Proxy({} as Env, {
  get(target, prop: string) {
    if (!_env) {
      _env = validateEnv();
    }
    return _env[prop as keyof Env];
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}

/**
 * Check if running on Vercel
 */
export function isVercel(): boolean {
  return env.VERCEL === '1';
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof Pick<Env, 'NEXT_PUBLIC_ENABLE_AI' | 'NEXT_PUBLIC_ENABLE_ANALYTICS' | 'NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS'>): boolean {
  return env[feature] === true;
}

/**
 * Get public environment variables for client-side
 * Only returns NEXT_PUBLIC_* variables
 */
export function getPublicEnv() {
  return {
    APP_URL: env.NEXT_PUBLIC_APP_URL,
    API_URL: env.NEXT_PUBLIC_API_URL,
    STRIPE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    GA_MEASUREMENT_ID: env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    SENTRY_DSN: env.NEXT_PUBLIC_SENTRY_DSN,
    CLOUDINARY_CLOUD_NAME: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    GOOGLE_MAPS_API_KEY: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    ENABLE_AI: env.NEXT_PUBLIC_ENABLE_AI,
    ENABLE_ANALYTICS: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    ENABLE_PUSH_NOTIFICATIONS: env.NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS,
  };
}

// ============================================================================
// RUNTIME CHECKS
// ============================================================================

/**
 * Ensure critical services are configured
 */
export function checkCriticalServices(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];

  // Database is always required
  if (!env.DATABASE_URL) {
    missing.push('DATABASE_URL');
  }

  // Auth is required in production
  if (isProduction()) {
    if (!env.NEXTAUTH_SECRET || env.NEXTAUTH_SECRET.length < 32) {
      missing.push('NEXTAUTH_SECRET (must be 32+ characters)');
    }
    if (!env.NEXTAUTH_URL) {
      missing.push('NEXTAUTH_URL');
    }
  }

  // Stripe is required for payments
  if (!env.STRIPE_SECRET_KEY) {
    missing.push('STRIPE_SECRET_KEY');
  }
  if (!env.STRIPE_WEBHOOK_SECRET) {
    missing.push('STRIPE_WEBHOOK_SECRET');
  }

  return {
    ok: missing.length === 0,
    missing,
  };
}

/**
 * Log environment configuration (safe - no secrets)
 */
export function logEnvironmentInfo(): void {
  if (isDevelopment()) {
    console.log('🌾 Farmers Market Platform - Environment Configuration');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 Environment:      ${env.NODE_ENV}`);
    console.log(`🔗 Database:         ${env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
    console.log(`🔐 Auth:             ${env.NEXTAUTH_SECRET ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`💳 Stripe:           ${env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`📧 Email (SendGrid): ${env.SENDGRID_API_KEY ? '✅ Configured' : '⚠️  Optional'}`);
    console.log(`📊 Analytics:        ${env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? '✅ Configured' : '⚠️  Optional'}`);
    console.log(`🐛 Sentry:           ${env.SENTRY_DSN ? '✅ Configured' : '⚠️  Optional'}`);
    console.log(`☁️  Cloudinary:       ${env.CLOUDINARY_API_KEY ? '✅ Configured' : '⚠️  Optional'}`);
    console.log(`🗄️  Redis:            ${env.REDIS_URL || env.REDIS_HOST ? '✅ Configured' : '⚠️  Optional'}`);
    console.log(`🤖 AI Features:      ${env.NEXT_PUBLIC_ENABLE_AI ? '✅ Enabled' : '❌ Disabled'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const criticalCheck = checkCriticalServices();
    if (!criticalCheck.ok) {
      console.warn('⚠️  WARNING: Missing critical services:');
      criticalCheck.missing.forEach(service => {
        console.warn(`   • ${service}`);
      });
      console.warn('');
    }
  }
}

// Export validation function but don't run automatically
// This prevents build-time errors when env vars aren't set
// Call validateEnv() or logEnvironmentInfo() manually in your app startup

/**
 * Initialize environment validation
 * Call this in your app entry point (not at build time)
 */
export function initEnv(): void {
  if (typeof window === 'undefined' && typeof process !== 'undefined') {
    logEnvironmentInfo();
  }
}
