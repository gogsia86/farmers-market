/**
 * 🔒 ENVIRONMENT VALIDATION
 * Validate all required environment variables at startup
 */

import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().describe("PostgreSQL connection string"),

  // Authentication
  NEXTAUTH_SECRET: z
    .string()
    .min(32)
    .describe("NextAuth secret (min 32 characters)"),
  NEXTAUTH_URL: z.string().url().describe("Application base URL"),

  // Stripe (optional for development)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // PayPal (optional)
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_SECRET: z.string().optional(),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  // Redis (optional)
  REDIS_URL: z.string().url().optional(),

  // Sentry (optional for production)
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Perplexity AI (optional)
  PERPLEXITY_API_KEY: z.string().optional(),

  // Node environment
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);
    console.log("✅ Environment variables validated successfully");
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:");
      const zodError = error as z.ZodError;
      zodError.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      });
    }
    throw new Error("Environment validation failed");
  }
}

/**
 * Check optional services configuration
 */
export function checkOptionalServices(env: Env): void {
  const warnings: string[] = [];

  if (!env.STRIPE_SECRET_KEY) {
    warnings.push("⚠️  Stripe not configured - payments will use stubs");
  }

  if (!env.SMTP_HOST) {
    warnings.push("⚠️  SMTP not configured - emails will be logged only");
  }

  if (!env.REDIS_URL) {
    warnings.push("⚠️  Redis not configured - using memory cache only");
  }

  if (!env.SENTRY_DSN && env.NODE_ENV === "production") {
    warnings.push("⚠️  Sentry not configured - no error tracking");
  }

  if (warnings.length > 0) {
    console.log("\n📋 Optional Service Warnings:");
    warnings.forEach((warning) => console.log(`  ${warning}`));
    console.log("");
  }
}

// Export for manual validation
// DO NOT auto-validate on import to prevent circular dependencies
export default validateEnv;
