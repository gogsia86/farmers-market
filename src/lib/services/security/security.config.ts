/**
 * SECURITY CONFIG VALIDATOR
 * Zod schema for validating security configuration
 */

import { SecurityConfigurationError } from "@/lib/errors/security.errors";
import { z } from "zod";

// Rate limit configuration schema
const RateLimitConfigSchema = z.object({
  api: z.string().regex(/^\d+\/(second|minute|hour|day)$/),
  auth: z.string().regex(/^\d+\/(second|minute|hour|day)$/),
  upload: z.string().regex(/^\d+\/(second|minute|hour|day)$/),
  search: z.string().regex(/^\d+\/(second|minute|hour|day)$/),
  consciousness: z.string().regex(/^\d+\/(second|minute|hour|day)$/),
});

// Encryption configuration schema
const EncryptionConfigSchema = z.object({
  algorithm: z.enum(["AES-256-GCM", "AES-256-CBC"]),
  keyLength: z.number().int().min(128).max(512),
  saltRounds: z.number().int().min(10).max(16),
});

// Security monitoring schema
const SecurityMonitoringSchema = z.object({
  failedLogins: z.boolean(),
  suspiciousActivity: z.boolean(),
  dataAccess: z.enum(["none", "basic", "audit-log", "full-trace"]),
  alertWebhook: z.string().url().optional(),
});

// Security headers schema
const SecurityHeadersSchema = z.object({
  csp: z.string(),
  xssProtection: z.boolean(),
  nosniff: z.boolean(),
  frameOptions: z.enum(["DENY", "SAMEORIGIN"]),
  hsts: z.string(),
});

// Audit configuration schema
const AuditConfigSchema = z.object({
  enabled: z.boolean(),
  logLevel: z.enum(["info", "warn", "error", "debug"]),
  retention: z.number().int().min(1).max(365),
  sensitiveFields: z.array(z.string()),
});

// Complete security configuration schema
export const SecurityConfigSchema = z.object({
  rateLimit: RateLimitConfigSchema,
  encryption: EncryptionConfigSchema,
  monitoring: SecurityMonitoringSchema,
  headers: SecurityHeadersSchema,
  audit: AuditConfigSchema,
});

/**
 * Validate security configuration
 * @throws {SecurityConfigurationError} If configuration is invalid
 */
export function validateSecurityConfig(config: unknown): void {
  try {
    SecurityConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );
      throw new SecurityConfigurationError(
        `Invalid security configuration:\n${issues.join("\n")}`
      );
    }
    throw error;
  }
}

export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;
