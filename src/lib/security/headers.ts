/**
 * 🔒 SECURITY HEADERS - PRODUCTION-GRADE CONFIGURATION
 *
 * Comprehensive security headers for the Farmers Market Platform
 * Protects against XSS, clickjacking, MIME sniffing, and other attacks
 *
 * Headers Implemented:
 * - Content-Security-Policy (CSP)
 * - Strict-Transport-Security (HSTS)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Referrer-Policy
 * - Permissions-Policy
 * - X-XSS-Protection (legacy support)
 *
 * @reference OWASP Security Headers Best Practices
 * @reference .cursorrules - Security Enhancement Protocol
 */

import type { NextRequest, NextResponse } from "next/server";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SecurityHeadersConfig {
  /** Enable Content-Security-Policy */
  enableCSP?: boolean;
  /** Enable HSTS (HTTPS only) */
  enableHSTS?: boolean;
  /** CSP report URI (optional) */
  cspReportUri?: string;
  /** Environment (affects CSP strictness) */
  environment?: "development" | "staging" | "production";
  /** Allowed domains for CSP */
  allowedDomains?: string[];
}

// ============================================================================
// CONTENT SECURITY POLICY (CSP)
// ============================================================================

/**
 * Generate Content-Security-Policy header value
 *
 * Protects against XSS, data injection, and other code injection attacks
 */
export function generateCSP(config: SecurityHeadersConfig = {}): string {
  const {
    environment = process.env.NODE_ENV,
    cspReportUri,
    allowedDomains = [],
  } = config;

  const isDevelopment = environment === "development";

  // Base CSP directives
  const directives: Record<string, string[]> = {
    // Default policy for all resources
    "default-src": ["'self'"],

    // Scripts: Allow self, inline scripts (Next.js), and eval
    "script-src": [
      "'self'",
      "'unsafe-inline'", // Required for Next.js
      "'unsafe-eval'", // Required for Next.js in production too
      "blob:", // Allow blob: URLs for Web Workers
      "https://js.stripe.com", // Stripe
      "https://maps.googleapis.com", // Google Maps
      "https://www.googletagmanager.com", // Analytics
      "https://va.vercel-scripts.com", // Vercel Analytics
      ...allowedDomains,
    ],

    // Styles: Allow self and inline styles (Tailwind)
    "style-src": [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind/CSS-in-JS
      "https://fonts.googleapis.com",
    ],

    // Images: Allow self, data URIs, and CDNs
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https:", // Allow HTTPS images
      "https://res.cloudinary.com", // Cloudinary
      "https://images.unsplash.com", // Unsplash (if used)
      "https://lh3.googleusercontent.com", // Google avatars
      "https://avatars.githubusercontent.com", // GitHub avatars
    ],

    // Fonts: Allow self and Google Fonts
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],

    // Connect (AJAX/WebSocket): API endpoints and external services
    "connect-src": [
      "'self'",
      "https://api.stripe.com", // Stripe
      "https://maps.googleapis.com", // Google Maps
      "https://*.sentry.io", // Sentry error tracking
      "https://vitals.vercel-insights.com", // Vercel Analytics
      "wss://ws.pusher.com", // WebSocket (if using Pusher)
      ...(isDevelopment ? ["ws://localhost:*", "http://localhost:*"] : []),
    ],

    // Frames: Restrict iframe embedding
    "frame-src": [
      "'self'",
      "https://js.stripe.com", // Stripe checkout
      "https://hooks.stripe.com", // Stripe webhooks
      "https://www.google.com", // Google reCAPTCHA
    ],

    // Objects: Disallow plugins (Flash, Java, etc.)
    "object-src": ["'none'"],

    // Media: Allow self and trusted CDNs
    "media-src": ["'self'", "https://res.cloudinary.com"],

    // Workers: Allow self, blob, and data URIs
    "worker-src": ["'self'", "blob:", "data:"],

    // Child sources (workers, frames) - explicitly set to prevent script-src fallback
    "child-src": ["'self'", "blob:", "data:"],

    // Manifests: Allow self (PWA)
    "manifest-src": ["'self'"],

    // Forms: Restrict form submissions
    "form-action": ["'self'"],

    // Frame ancestors: Prevent clickjacking
    "frame-ancestors": ["'none'"],

    // Base URI: Restrict <base> tag
    "base-uri": ["'self'"],

    // Upgrade insecure requests (HTTPS only in production)
    ...(environment === "production" && {
      "upgrade-insecure-requests": [],
    }),
  };

  // Add report-uri if configured
  if (cspReportUri) {
    directives["report-uri"] = [cspReportUri];
    directives["report-to"] = ["csp-endpoint"];
  }

  // Convert directives to CSP string
  const cspString = Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(" ")}`;
    })
    .join("; ");

  return cspString;
}

// ============================================================================
// SECURITY HEADERS COLLECTION
// ============================================================================

/**
 * Get all security headers as key-value pairs
 */
export function getSecurityHeaders(
  config: SecurityHeadersConfig = {},
): Record<string, string> {
  const {
    enableCSP = true,
    enableHSTS = true,
    environment = process.env.NODE_ENV,
  } = config;

  const isProduction = environment === "production";

  const headers: Record<string, string> = {
    // ========================================================================
    // X-DNS-Prefetch-Control
    // Controls browser DNS prefetching
    // ========================================================================
    "X-DNS-Prefetch-Control": "on",

    // ========================================================================
    // X-Frame-Options
    // Prevents clickjacking attacks
    // ========================================================================
    "X-Frame-Options": "DENY",

    // ========================================================================
    // X-Content-Type-Options
    // Prevents MIME type sniffing
    // ========================================================================
    "X-Content-Type-Options": "nosniff",

    // ========================================================================
    // X-XSS-Protection
    // Legacy XSS protection (modern browsers use CSP)
    // ========================================================================
    "X-XSS-Protection": "1; mode=block",

    // ========================================================================
    // Referrer-Policy
    // Controls how much referrer information is sent
    // ========================================================================
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // ========================================================================
    // Permissions-Policy (formerly Feature-Policy)
    // Controls which browser features can be used
    // ========================================================================
    "Permissions-Policy": [
      "camera=()", // No camera access
      "microphone=()", // No microphone access
      "geolocation=(self)", // Geolocation only from same origin
      "interest-cohort=()", // Disable FLoC tracking
      "payment=(self)", // Payment only from same origin
      "usb=()", // No USB access
      "magnetometer=()", // No magnetometer
      "gyroscope=()", // No gyroscope
      "accelerometer=()", // No accelerometer
    ].join(", "),

    // ========================================================================
    // Cross-Origin-Embedder-Policy (COEP)
    // Prevents loading cross-origin resources
    // ========================================================================
    "Cross-Origin-Embedder-Policy": "credentialless",

    // ========================================================================
    // Cross-Origin-Opener-Policy (COOP)
    // Isolates browsing context
    // ========================================================================
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",

    // ========================================================================
    // Cross-Origin-Resource-Policy (CORP)
    // Controls cross-origin resource sharing
    // ========================================================================
    "Cross-Origin-Resource-Policy": "same-site",
  };

  // ========================================================================
  // Strict-Transport-Security (HSTS)
  // Force HTTPS (only in production)
  // ========================================================================
  if (enableHSTS && isProduction) {
    headers["Strict-Transport-Security"] = [
      "max-age=63072000", // 2 years
      "includeSubDomains",
      "preload",
    ].join("; ");
  }

  // ========================================================================
  // Content-Security-Policy
  // Comprehensive XSS and injection protection
  // ========================================================================
  if (enableCSP) {
    headers["Content-Security-Policy"] = generateCSP(config);
  }

  return headers;
}

// ============================================================================
// APPLY HEADERS TO RESPONSE
// ============================================================================

/**
 * Apply security headers to a Next.js response
 *
 * Usage in middleware or API routes:
 * ```typescript
 * import { applySecurityHeaders } from '@/lib/security/headers';
 *
 * export function middleware(request: NextRequest) {
 *   const response = NextResponse.next();
 *   applySecurityHeaders(response);
 *   return response;
 * }
 * ```
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = {},
): NextResponse {
  const headers = getSecurityHeaders(config);

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

export interface CORSConfig {
  /** Allowed origins (domains) */
  allowedOrigins?: string[];
  /** Allowed HTTP methods */
  allowedMethods?: string[];
  /** Allowed headers */
  allowedHeaders?: string[];
  /** Exposed headers */
  exposedHeaders?: string[];
  /** Allow credentials (cookies) */
  allowCredentials?: boolean;
  /** Max age for preflight cache */
  maxAge?: number;
}

/**
 * Get CORS headers
 *
 * Usage:
 * ```typescript
 * const corsHeaders = getCORSHeaders(request, {
 *   allowedOrigins: ['https://yourdomain.com'],
 * });
 * ```
 */
export function getCORSHeaders(
  request: NextRequest,
  config: CORSConfig = {},
): Record<string, string> {
  const {
    allowedOrigins = [],
    allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders = ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders = ["X-Request-Id"],
    allowCredentials = true,
    maxAge = 86400, // 24 hours
  } = config;

  const origin = request.headers.get("origin");
  const isAllowedOrigin =
    allowedOrigins.length === 0 || // Allow all if not specified (dev mode)
    allowedOrigins.includes("*") ||
    (origin && allowedOrigins.includes(origin));

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": allowedMethods.join(", "),
    "Access-Control-Allow-Headers": allowedHeaders.join(", "),
    "Access-Control-Max-Age": maxAge.toString(),
  };

  // Set origin header if allowed
  if (isAllowedOrigin) {
    headers["Access-Control-Allow-Origin"] = origin || allowedOrigins[0] || "*";
  }

  // Expose headers
  if (exposedHeaders.length > 0) {
    headers["Access-Control-Expose-Headers"] = exposedHeaders.join(", ");
  }

  // Allow credentials
  if (allowCredentials) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

/**
 * Apply CORS headers to a response
 */
export function applyCORSHeaders(
  response: NextResponse,
  request: NextRequest,
  config: CORSConfig = {},
): NextResponse {
  const headers = getCORSHeaders(request, config);

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// ============================================================================
// PRODUCTION-READY CORS CONFIGURATION
// ============================================================================

/**
 * Get production CORS configuration
 */
export function getProductionCORSConfig(): CORSConfig {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

  return {
    allowedOrigins: [
      ...allowedOrigins,
      ...(process.env.NODE_ENV === "development"
        ? ["http://localhost:3000", "http://localhost:3001"]
        : []),
    ],
    allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-CSRF-Token",
      "X-Request-Id",
    ],
    exposedHeaders: [
      "X-Request-Id",
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
    ],
    allowCredentials: true,
    maxAge: 86400,
  };
}

/**
 * Divine security headers achieved ✨
 * CSP, HSTS, and comprehensive protection enabled
 * Ready to deploy with confidence
 */
