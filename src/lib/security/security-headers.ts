/**
 * 🛡️ SECURITY HEADERS - DIVINE SECURITY FORTRESS
 *
 * Comprehensive HTTP security headers configuration
 * Protects against common web vulnerabilities
 *
 * Divine Patterns Applied:
 * - Defense in depth (multiple security layers)
 * - Security best practices (OWASP recommendations)
 * - Zero-trust security model
 * - Agricultural consciousness (seasonal security awareness)
 *
 * @reference .github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md
 * @reference https://owasp.org/www-project-secure-headers/
 */

// ============================================================================
// SECURITY HEADERS CONFIGURATION
// ============================================================================

/**
 * All security headers with explanations
 */
export interface SecurityHeaders {
  /**
   * X-Frame-Options: Prevents clickjacking attacks
   * DENY = Cannot be framed by any site
   * SAMEORIGIN = Can only be framed by same origin
   */
  "X-Frame-Options": "DENY" | "SAMEORIGIN";

  /**
   * X-Content-Type-Options: Prevents MIME-type sniffing
   * nosniff = Browser must respect declared Content-Type
   */
  "X-Content-Type-Options": "nosniff";

  /**
   * X-XSS-Protection: Legacy XSS protection (for older browsers)
   * 1; mode=block = Enable XSS filter and block page if attack detected
   * Note: Modern browsers use CSP instead, but kept for legacy support
   */
  "X-XSS-Protection": "1; mode=block";

  /**
   * Referrer-Policy: Controls referrer information
   * strict-origin-when-cross-origin = Send full URL for same-origin,
   * only origin for cross-origin HTTPS, nothing for HTTP
   */
  "Referrer-Policy":
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";

  /**
   * Permissions-Policy: Controls browser features access
   * Disables unused features to reduce attack surface
   */
  "Permissions-Policy": string;

  /**
   * Strict-Transport-Security (HSTS): Forces HTTPS
   * max-age = Duration in seconds (2 years)
   * includeSubDomains = Apply to all subdomains
   * preload = Submit to browser preload list
   */
  "Strict-Transport-Security": string;

  /**
   * X-DNS-Prefetch-Control: Controls DNS prefetching
   * off = Disable DNS prefetching for privacy
   */
  "X-DNS-Prefetch-Control": "on" | "off";

  /**
   * X-Download-Options: IE-specific security (legacy)
   * noopen = Prevents opening files directly in IE
   */
  "X-Download-Options": "noopen";

  /**
   * X-Permitted-Cross-Domain-Policies: Controls cross-domain access
   * none = No cross-domain access allowed
   */
  "X-Permitted-Cross-Domain-Policies":
    | "none"
    | "master-only"
    | "by-content-type"
    | "all";

  /**
   * Cross-Origin-Embedder-Policy: Controls resource loading
   * require-corp = Resources must opt-in to be loaded
   */
  "Cross-Origin-Embedder-Policy":
    | "unsafe-none"
    | "require-corp"
    | "credentialless";

  /**
   * Cross-Origin-Opener-Policy: Controls window.opener access
   * same-origin = Only same-origin windows can access
   */
  "Cross-Origin-Opener-Policy":
    | "unsafe-none"
    | "same-origin-allow-popups"
    | "same-origin";

  /**
   * Cross-Origin-Resource-Policy: Controls resource sharing
   * same-origin = Only same-origin can load resources
   */
  "Cross-Origin-Resource-Policy": "same-site" | "same-origin" | "cross-origin";
}

// ============================================================================
// PRODUCTION SECURITY HEADERS (STRICT)
// ============================================================================

/**
 * Production-grade security headers (maximum protection)
 * Use in production environment for all routes
 */
export const PRODUCTION_SECURITY_HEADERS: SecurityHeaders = {
  // Prevent clickjacking - no framing allowed
  "X-Frame-Options": "DENY",

  // Prevent MIME-type sniffing
  "X-Content-Type-Options": "nosniff",

  // Enable XSS filter for legacy browsers
  "X-XSS-Protection": "1; mode=block",

  // Strict referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Disable unnecessary browser features
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=(self)",
    "interest-cohort=()", // Disable FLoC
    "payment=(self)",
    "usb=()",
    "bluetooth=()",
    "accelerometer=()",
    "gyroscope=()",
    "magnetometer=()",
  ].join(", "),

  // Force HTTPS for 2 years
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",

  // Disable DNS prefetching for privacy
  "X-DNS-Prefetch-Control": "off",

  // Prevent opening files directly in IE
  "X-Download-Options": "noopen",

  // No cross-domain policies
  "X-Permitted-Cross-Domain-Policies": "none",

  // Require CORP for resources
  "Cross-Origin-Embedder-Policy": "require-corp",

  // Isolate browsing context
  "Cross-Origin-Opener-Policy": "same-origin",

  // Same-origin resource policy
  "Cross-Origin-Resource-Policy": "same-origin",
};

// ============================================================================
// DEVELOPMENT SECURITY HEADERS (RELAXED)
// ============================================================================

/**
 * Development-friendly security headers
 * More permissive for local development and hot reloading
 */
export const DEVELOPMENT_SECURITY_HEADERS: Partial<SecurityHeaders> = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "on",
  "Cross-Origin-Embedder-Policy": "unsafe-none",
  "Cross-Origin-Opener-Policy": "unsafe-none",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

// ============================================================================
// API SECURITY HEADERS
// ============================================================================

/**
 * Security headers for API routes
 * Optimized for API endpoints (no frame protection needed)
 */
export const API_SECURITY_HEADERS: Partial<SecurityHeaders> = {
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "off",
  "Cross-Origin-Resource-Policy": "same-origin",
  // Allow CORS for API (configure separately)
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert security headers object to Headers instance
 *
 * @param config - Security headers configuration
 * @returns Headers instance
 */
export function toHeaders(
  config: Partial<SecurityHeaders> = PRODUCTION_SECURITY_HEADERS,
): Headers {
  const headers = new Headers();

  for (const [key, value] of Object.entries(config)) {
    if (value) {
      headers.set(key, value);
    }
  }

  return headers;
}

/**
 * Apply security headers to response
 *
 * @param response - Response object
 * @param config - Security headers configuration
 */
export function applySecurityHeaders(
  response: Response,
  config: Partial<SecurityHeaders> = PRODUCTION_SECURITY_HEADERS,
): Response {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(config)) {
    if (value) {
      headers.set(key, value);
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Get environment-appropriate security headers
 *
 * @returns Security headers for current environment
 */
export function getEnvironmentSecurityHeaders(): Partial<SecurityHeaders> {
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SECURITY_HEADERS;
  }

  return DEVELOPMENT_SECURITY_HEADERS;
}

/**
 * Merge custom headers with default security headers
 *
 * @param customHeaders - Custom headers to merge
 * @param baseHeaders - Base security headers (defaults to environment headers)
 * @returns Merged headers
 */
export function mergeSecurityHeaders(
  customHeaders: Partial<SecurityHeaders>,
  baseHeaders: Partial<SecurityHeaders> = getEnvironmentSecurityHeaders(),
): Partial<SecurityHeaders> {
  return {
    ...baseHeaders,
    ...customHeaders,
  };
}

// ============================================================================
// MIDDLEWARE HELPER
// ============================================================================

/**
 * Create security headers middleware
 *
 * @param config - Security headers configuration
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * // In middleware.ts
 * import { createSecurityMiddleware } from '@/lib/security/security-headers';
 *
 * export const middleware = createSecurityMiddleware();
 * ```
 */
export function createSecurityMiddleware(
  config?: Partial<SecurityHeaders>,
): (response: Response) => Response {
  const headers = config || getEnvironmentSecurityHeaders();

  return (response: Response) => {
    return applySecurityHeaders(response, headers);
  };
}

// ============================================================================
// CORS HEADERS (separate from security headers)
// ============================================================================

/**
 * CORS configuration for API routes
 */
export interface CORSConfig {
  origin: string | string[];
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

/**
 * Default CORS configuration
 */
export const DEFAULT_CORS_CONFIG: CORSConfig = {
  origin: process.env.NEXT_PUBLIC_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Generate CORS headers
 *
 * @param config - CORS configuration
 * @param origin - Request origin
 * @returns CORS headers
 */
export function generateCORSHeaders(
  config: CORSConfig = DEFAULT_CORS_CONFIG,
  origin?: string,
): Record<string, string> {
  const headers: Record<string, string> = {};

  // Access-Control-Allow-Origin
  if (Array.isArray(config.origin)) {
    if (origin && config.origin.includes(origin)) {
      headers["Access-Control-Allow-Origin"] = origin;
    }
  } else if (config.origin === "*") {
    headers["Access-Control-Allow-Origin"] = "*";
  } else if (origin === config.origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  // Access-Control-Allow-Methods
  headers["Access-Control-Allow-Methods"] = config.methods.join(", ");

  // Access-Control-Allow-Headers
  headers["Access-Control-Allow-Headers"] = config.allowedHeaders.join(", ");

  // Access-Control-Expose-Headers
  if (config.exposedHeaders.length > 0) {
    headers["Access-Control-Expose-Headers"] = config.exposedHeaders.join(", ");
  }

  // Access-Control-Allow-Credentials
  if (config.credentials) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  // Access-Control-Max-Age
  headers["Access-Control-Max-Age"] = config.maxAge.toString();

  return headers;
}

/**
 * Apply CORS headers to response
 *
 * @param response - Response object
 * @param config - CORS configuration
 * @param origin - Request origin
 */
export function applyCORSHeaders(
  response: Response,
  config: CORSConfig = DEFAULT_CORS_CONFIG,
  origin?: string,
): Response {
  const corsHeaders = generateCORSHeaders(config, origin);
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ============================================================================
// AGRICULTURAL CONSCIOUSNESS - SEASONAL SECURITY
// ============================================================================

/**
 * Get seasonal security headers
 * During harvest season (high traffic), enable more aggressive caching
 */
export function getSeasonalSecurityHeaders(): Partial<SecurityHeaders> {
  const month = new Date().getMonth(); // 0-11
  const baseHeaders = getEnvironmentSecurityHeaders();

  // Summer/Fall harvest season (June-November)
  if (month >= 5 && month <= 10) {
    return {
      ...baseHeaders,
      // Enable DNS prefetch for better performance during high traffic
      "X-DNS-Prefetch-Control": "on",
    };
  }

  return baseHeaders;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  production: PRODUCTION_SECURITY_HEADERS,
  development: DEVELOPMENT_SECURITY_HEADERS,
  api: API_SECURITY_HEADERS,
  toHeaders,
  apply: applySecurityHeaders,
  getEnvironment: getEnvironmentSecurityHeaders,
  merge: mergeSecurityHeaders,
  createMiddleware: createSecurityMiddleware,
  cors: {
    default: DEFAULT_CORS_CONFIG,
    generate: generateCORSHeaders,
    apply: applyCORSHeaders,
  },
  seasonal: getSeasonalSecurityHeaders,
};
