/**
 * 🔐 API Authentication Middleware
 * Farmers Market Platform - Secure API Access
 * Version: 1.0.0
 *
 * This module provides authentication and authorization for API routes,
 * particularly for the orchestrator and monitoring endpoints.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import crypto from "crypto";

// ============================================================================
// TYPES
// ============================================================================

export type ApiKeyScope =
  | "orchestrator:read"
  | "orchestrator:write"
  | "orchestrator:execute"
  | "monitoring:read"
  | "monitoring:write"
  | "remediation:read"
  | "remediation:write"
  | "remediation:execute"
  | "admin:full";

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  scopes: ApiKeyScope[];
  createdAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
  metadata?: Record<string, unknown>;
}

export interface AuthResult {
  authenticated: boolean;
  method: "API_KEY" | "SESSION" | "JWT" | "NONE";
  userId?: string;
  keyId?: string;
  scopes?: ApiKeyScope[];
  error?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

export interface ApiAuthConfig {
  requireAuth: boolean;
  allowedMethods: ("API_KEY" | "SESSION" | "JWT")[];
  requiredScopes?: ApiKeyScope[];
  rateLimit?: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  ipWhitelist?: string[];
  bypassInDevelopment?: boolean;
}

// ============================================================================
// IN-MEMORY STORAGE (Replace with database in production)
// ============================================================================

// API Keys storage (in production, use database)
const apiKeys: Map<string, ApiKey> = new Map();

// Rate limit tracking
const rateLimitStore: Map<string, { count: number; resetAt: number }> =
  new Map();

// ============================================================================
// API KEY MANAGEMENT
// ============================================================================

/**
 * Generate a new API key
 */
export function generateApiKey(
  name: string,
  scopes: ApiKeyScope[],
  options?: {
    expiresInDays?: number;
    maxRequests?: number;
    windowMs?: number;
    metadata?: Record<string, unknown>;
  },
): ApiKey {
  const id = `ak_${crypto.randomBytes(8).toString("hex")}`;
  const key = `fmp_${crypto.randomBytes(32).toString("hex")}`;

  const apiKey: ApiKey = {
    id,
    key,
    name,
    scopes,
    createdAt: new Date(),
    expiresAt: options?.expiresInDays
      ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined,
    rateLimit: {
      maxRequests: options?.maxRequests || 1000,
      windowMs: options?.windowMs || 60 * 60 * 1000, // 1 hour default
    },
    metadata: options?.metadata,
  };

  // Store the key (hash it in production!)
  apiKeys.set(key, apiKey);

  return apiKey;
}

/**
 * Validate an API key
 */
export function validateApiKey(key: string): ApiKey | null {
  const apiKey = apiKeys.get(key);

  if (!apiKey) {
    return null;
  }

  // Check expiration
  if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
    return null;
  }

  // Update last used
  apiKey.lastUsedAt = new Date();
  apiKeys.set(key, apiKey);

  return apiKey;
}

/**
 * Revoke an API key
 */
export function revokeApiKey(keyId: string): boolean {
  for (const [key, apiKey] of apiKeys) {
    if (apiKey.id === keyId) {
      apiKeys.delete(key);
      return true;
    }
  }
  return false;
}

/**
 * List all API keys (without exposing the actual keys)
 */
export function listApiKeys(): Array<
  Omit<ApiKey, "key"> & { keyPreview: string }
> {
  return Array.from(apiKeys.values()).map((apiKey) => ({
    ...apiKey,
    key: undefined as unknown as string,
    keyPreview: `${apiKey.key.substring(0, 8)}...${apiKey.key.substring(apiKey.key.length - 4)}`,
  }));
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up expired records periodically
  if (Math.random() < 0.01) {
    cleanupRateLimitStore();
  }

  if (!record || now > record.resetAt) {
    // Create new window
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(now + windowMs),
    };
  }

  // Check if within limit
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(record.resetAt),
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  // Increment count
  record.count++;
  rateLimitStore.set(identifier, record);

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: new Date(record.resetAt),
  };
}

/**
 * Clean up expired rate limit records
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Authenticate a request using various methods
 */
export async function authenticateRequest(
  request: NextRequest,
): Promise<AuthResult> {
  // Try API Key authentication
  const apiKeyResult = await authenticateWithApiKey(request);
  if (apiKeyResult.authenticated) {
    return apiKeyResult;
  }

  // Try Session authentication
  const sessionResult = await authenticateWithSession();
  if (sessionResult.authenticated) {
    return sessionResult;
  }

  // Try JWT authentication
  const jwtResult = await authenticateWithJwt(request);
  if (jwtResult.authenticated) {
    return jwtResult;
  }

  return {
    authenticated: false,
    method: "NONE",
    error: "No valid authentication provided",
  };
}

/**
 * Authenticate using API Key
 */
async function authenticateWithApiKey(
  request: NextRequest,
): Promise<AuthResult> {
  // Check Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer fmp_")) {
    const key = authHeader.substring(7);
    const apiKey = validateApiKey(key);

    if (apiKey) {
      return {
        authenticated: true,
        method: "API_KEY",
        keyId: apiKey.id,
        scopes: apiKey.scopes,
      };
    }
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get("X-API-Key");
  if (apiKeyHeader?.startsWith("fmp_")) {
    const apiKey = validateApiKey(apiKeyHeader);

    if (apiKey) {
      return {
        authenticated: true,
        method: "API_KEY",
        keyId: apiKey.id,
        scopes: apiKey.scopes,
      };
    }
  }

  return {
    authenticated: false,
    method: "API_KEY",
    error: "Invalid or missing API key",
  };
}

/**
 * Authenticate using NextAuth session
 */
async function authenticateWithSession(): Promise<AuthResult> {
  try {
    const session = await auth();

    if (session?.user) {
      // Determine scopes based on user role
      const scopes = getUserScopes(session.user.role);

      return {
        authenticated: true,
        method: "SESSION",
        userId: session.user.id,
        scopes,
      };
    }
  } catch (error) {
    // Session auth failed, continue to next method
  }

  return {
    authenticated: false,
    method: "SESSION",
    error: "No valid session",
  };
}

/**
 * Authenticate using JWT token
 */
async function authenticateWithJwt(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("Authorization");
  if (
    !authHeader?.startsWith("Bearer ") ||
    authHeader.startsWith("Bearer fmp_")
  ) {
    return {
      authenticated: false,
      method: "JWT",
      error: "No JWT token provided",
    };
  }

  const token = authHeader.substring(7);

  try {
    // Verify JWT (simplified - use proper JWT verification in production)
    const payload = verifyJwtToken(token);

    if (payload) {
      return {
        authenticated: true,
        method: "JWT",
        userId: payload.sub,
        scopes: payload.scopes,
      };
    }
  } catch (error) {
    // JWT verification failed
  }

  return {
    authenticated: false,
    method: "JWT",
    error: "Invalid JWT token",
  };
}

/**
 * Simple JWT verification (use proper library in production)
 */
function verifyJwtToken(
  token: string,
): { sub: string; scopes: ApiKeyScope[] } | null {
  try {
    // This is a simplified implementation
    // In production, use jsonwebtoken or jose library with proper secret/key
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payloadPart = parts[1];
    if (!payloadPart) return null;

    const payload = JSON.parse(
      Buffer.from(payloadPart, "base64url").toString(),
    );

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return {
      sub: payload.sub,
      scopes: payload.scopes || [],
    };
  } catch {
    return null;
  }
}

/**
 * Get scopes based on user role
 */
function getUserScopes(role?: string): ApiKeyScope[] {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return ["admin:full"];
    case "MODERATOR":
      return [
        "orchestrator:read",
        "orchestrator:write",
        "monitoring:read",
        "monitoring:write",
        "remediation:read",
      ];
    case "FARMER":
      return ["monitoring:read", "orchestrator:read"];
    case "CUSTOMER":
      return ["monitoring:read"];
    default:
      return [];
  }
}

// ============================================================================
// AUTHORIZATION
// ============================================================================

/**
 * Check if auth result has required scopes
 */
export function hasRequiredScopes(
  authResult: AuthResult,
  requiredScopes: ApiKeyScope[],
): boolean {
  if (!authResult.authenticated || !authResult.scopes) {
    return false;
  }

  // Admin has all permissions
  if (authResult.scopes.includes("admin:full")) {
    return true;
  }

  // Check if all required scopes are present
  return requiredScopes.every((scope) => authResult.scopes!.includes(scope));
}

/**
 * Check if request IP is whitelisted
 */
export function isIpWhitelisted(
  request: NextRequest,
  whitelist: string[],
): boolean {
  if (whitelist.length === 0) {
    return true; // No whitelist = all allowed
  }

  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return whitelist.includes(clientIp) || whitelist.includes("*");
}

// ============================================================================
// MIDDLEWARE WRAPPER
// ============================================================================

/**
 * Create an authenticated API route handler
 */
export function withApiAuth(
  handler: (
    request: NextRequest,
    authResult: AuthResult,
  ) => Promise<NextResponse>,
  config: ApiAuthConfig = {
    requireAuth: true,
    allowedMethods: ["API_KEY", "SESSION"],
  },
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Bypass in development if configured
    if (config.bypassInDevelopment && process.env.NODE_ENV === "development") {
      return handler(request, {
        authenticated: true,
        method: "NONE",
        scopes: ["admin:full"],
      });
    }

    // Check IP whitelist
    if (config.ipWhitelist && !isIpWhitelisted(request, config.ipWhitelist)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "IP_NOT_ALLOWED",
            message: "Your IP address is not allowed to access this resource",
          },
        },
        { status: 403 },
      );
    }

    // Authenticate the request
    const authResult = await authenticateRequest(request);

    // Check if authentication is required
    if (config.requireAuth && !authResult.authenticated) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: authResult.error || "Authentication required",
          },
        },
        { status: 401 },
      );
    }

    // Check if method is allowed
    if (
      authResult.authenticated &&
      !config.allowedMethods.includes(
        authResult.method as "API_KEY" | "SESSION" | "JWT",
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTH_METHOD_NOT_ALLOWED",
            message: `Authentication method '${authResult.method}' is not allowed for this endpoint`,
          },
        },
        { status: 403 },
      );
    }

    // Check required scopes
    if (
      config.requiredScopes &&
      !hasRequiredScopes(authResult, config.requiredScopes)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: `Required scopes: ${config.requiredScopes.join(", ")}`,
          },
        },
        { status: 403 },
      );
    }

    // Check rate limit
    if (config.rateLimit?.enabled) {
      const identifier =
        authResult.keyId ||
        authResult.userId ||
        request.headers.get("x-forwarded-for") ||
        "anonymous";

      const rateLimitResult = checkRateLimit(
        identifier,
        config.rateLimit.maxRequests,
        config.rateLimit.windowMs,
      );

      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: "Too many requests. Please try again later.",
              retryAfter: rateLimitResult.retryAfter,
            },
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(rateLimitResult.retryAfter),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": rateLimitResult.resetAt.toISOString(),
            },
          },
        );
      }
    }

    // Call the handler
    return handler(request, authResult);
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a handler that requires orchestrator read access
 */
export function withOrchestratorReadAccess(
  handler: (
    request: NextRequest,
    authResult: AuthResult,
  ) => Promise<NextResponse>,
) {
  return withApiAuth(handler, {
    requireAuth: true,
    allowedMethods: ["API_KEY", "SESSION", "JWT"],
    requiredScopes: ["orchestrator:read"],
    rateLimit: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
    },
  });
}

/**
 * Create a handler that requires orchestrator write access
 */
export function withOrchestratorWriteAccess(
  handler: (
    request: NextRequest,
    authResult: AuthResult,
  ) => Promise<NextResponse>,
) {
  return withApiAuth(handler, {
    requireAuth: true,
    allowedMethods: ["API_KEY", "SESSION", "JWT"],
    requiredScopes: ["orchestrator:write"],
    rateLimit: {
      enabled: true,
      maxRequests: 50,
      windowMs: 60 * 1000, // 1 minute
    },
  });
}

/**
 * Create a handler that requires orchestrator execute access
 */
export function withOrchestratorExecuteAccess(
  handler: (
    request: NextRequest,
    authResult: AuthResult,
  ) => Promise<NextResponse>,
) {
  return withApiAuth(handler, {
    requireAuth: true,
    allowedMethods: ["API_KEY", "SESSION"],
    requiredScopes: ["orchestrator:execute"],
    rateLimit: {
      enabled: true,
      maxRequests: 20,
      windowMs: 60 * 1000, // 1 minute
    },
  });
}

/**
 * Create a handler that requires remediation execute access
 */
export function withRemediationExecuteAccess(
  handler: (
    request: NextRequest,
    authResult: AuthResult,
  ) => Promise<NextResponse>,
) {
  return withApiAuth(handler, {
    requireAuth: true,
    allowedMethods: ["API_KEY", "SESSION"],
    requiredScopes: ["remediation:execute"],
    rateLimit: {
      enabled: true,
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
    },
  });
}

/**
 * Create a handler that requires admin access
 */
export function withAdminAccess(
  handler: (
    request: NextRequest,
    authResult: AuthResult,
  ) => Promise<NextResponse>,
) {
  return withApiAuth(handler, {
    requireAuth: true,
    allowedMethods: ["SESSION"],
    requiredScopes: ["admin:full"],
    rateLimit: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
    },
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize default API keys from environment
 */
export function initializeApiKeys(): void {
  // Create a default admin API key if specified in environment
  const adminApiKey = process.env.ADMIN_API_KEY;
  if (adminApiKey && adminApiKey.startsWith("fmp_")) {
    const existingKey = validateApiKey(adminApiKey);
    if (!existingKey) {
      apiKeys.set(adminApiKey, {
        id: "ak_admin_default",
        key: adminApiKey,
        name: "Default Admin Key",
        scopes: ["admin:full"],
        createdAt: new Date(),
        rateLimit: {
          maxRequests: 10000,
          windowMs: 60 * 60 * 1000,
        },
      });
      console.log("✅ Default admin API key initialized");
    }
  }

  // Create orchestrator API key if specified
  const orchestratorApiKey = process.env.ORCHESTRATOR_API_KEY;
  if (orchestratorApiKey && orchestratorApiKey.startsWith("fmp_")) {
    const existingKey = validateApiKey(orchestratorApiKey);
    if (!existingKey) {
      apiKeys.set(orchestratorApiKey, {
        id: "ak_orchestrator_default",
        key: orchestratorApiKey,
        name: "Orchestrator Service Key",
        scopes: [
          "orchestrator:read",
          "orchestrator:write",
          "orchestrator:execute",
          "remediation:read",
          "remediation:write",
          "remediation:execute",
        ],
        createdAt: new Date(),
        rateLimit: {
          maxRequests: 5000,
          windowMs: 60 * 60 * 1000,
        },
      });
      console.log("✅ Orchestrator API key initialized");
    }
  }
}

// Auto-initialize on module load
if (typeof process !== "undefined" && process.env) {
  initializeApiKeys();
}
