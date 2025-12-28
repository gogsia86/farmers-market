/**
 * 🛡️ CONTENT SECURITY POLICY (CSP) - DIVINE SECURITY FORTRESS
 *
 * Comprehensive CSP configuration to prevent XSS, clickjacking, and other attacks
 * Protects the agricultural platform from malicious code injection
 *
 * Divine Patterns Applied:
 * - Defense in depth (multiple security layers)
 * - Strict CSP directives with selective allowlisting
 * - Nonce-based script protection
 * - Report-only mode for testing
 *
 * @reference .github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md
 * @reference https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */

import { telemetryService } from "@/lib/telemetry/azure-insights";

// ============================================================================
// CSP DIRECTIVE BUILDERS
// ============================================================================

/**
 * Generate Content Security Policy header value
 *
 * @param options - CSP configuration options
 * @returns CSP header string
 */
export function generateCSP(options: CSPOptions = {}): string {
  const {
    nonce,
    enableUnsafeInline = false,
    enableUnsafeEval = false,
  } = options;

  const directives: Record<string, string[]> = {
    // Default fallback for all fetch directives
    "default-src": ["'self'"],

    // Scripts - use nonce for inline scripts
    "script-src": [
      "'self'",
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      ...(enableUnsafeEval ? ["'unsafe-eval'"] : []),
      ...(enableUnsafeInline ? ["'unsafe-inline'"] : []),
      // Trusted CDNs
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
    ],

    // Styles - allow inline for Tailwind and styled-components
    "style-src": [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind CSS and dynamic styles
      "https://fonts.googleapis.com",
    ],

    // Images - allow from multiple sources
    "img-src": [
      "'self'",
      "data:", // Base64 encoded images
      "blob:", // Blob URLs for uploaded images
      "https:", // All HTTPS images (for user-uploaded content)
      // Specific image CDNs
      "https://res.cloudinary.com",
      "https://images.unsplash.com",
      "https://lh3.googleusercontent.com", // Google profile images
    ],

    // Fonts
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],

    // API connections
    "connect-src": [
      "'self'",
      "https://api.openai.com", // OpenAI API for AI features
      "https://*.supabase.co", // Supabase (if used)
      "https://*.vercel-insights.com", // Analytics
      "https://*.microsoft.com", // Azure services
      "https://nominatim.openstreetmap.org", // Geocoding
      ...(process.env.NODE_ENV === "development"
        ? ["ws://localhost:*", "wss://localhost:*"]
        : []),
    ],

    // Frames/iframes
    "frame-src": [
      "'self'",
      "https://www.google.com", // Google Maps
      "https://checkout.stripe.com", // Stripe payment
    ],

    // Workers
    "worker-src": ["'self'", "blob:"],

    // Media (audio/video)
    "media-src": ["'self'", "https:", "blob:"],

    // Objects (deprecated but included for older browsers)
    "object-src": ["'none'"],

    // Prevent framing by other sites (clickjacking protection)
    "frame-ancestors": ["'none'"],

    // Form submissions
    "form-action": ["'self'"],

    // Base URI for relative URLs
    "base-uri": ["'self'"],

    // Upgrade insecure requests (HTTP → HTTPS)
    "upgrade-insecure-requests": [],
  };

  // Add report-uri in production
  if (process.env.NODE_ENV === "production" && process.env.CSP_REPORT_URI) {
    directives["report-uri"] = [process.env.CSP_REPORT_URI];
    directives["report-to"] = ["csp-endpoint"];
  }

  // Convert directives to CSP string
  const cspString = Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(" ")}`;
    })
    .join("; ");

  return cspString;
}

// ============================================================================
// CSP OPTIONS
// ============================================================================

export interface CSPOptions {
  /**
   * CSP mode
   * - "enforce": Blocks violations (production)
   * - "report-only": Reports violations but doesn't block (testing)
   */
  mode?: "enforce" | "report-only";

  /**
   * Nonce for inline scripts
   * Randomly generated per request for security
   */
  nonce?: string;

  /**
   * Allow unsafe-inline (not recommended for production)
   * Only enable for development or legacy compatibility
   */
  enableUnsafeInline?: boolean;

  /**
   * Allow unsafe-eval (required for some libraries)
   * Only enable if absolutely necessary (e.g., for eval-based template engines)
   */
  enableUnsafeEval?: boolean;
}

// ============================================================================
// NONCE GENERATION
// ============================================================================

/**
 * Generate cryptographically secure nonce for CSP
 *
 * @returns Random nonce string
 */
export function generateNonce(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

// ============================================================================
// MIDDLEWARE HELPERS
// ============================================================================

/**
 * Get CSP header name based on mode
 *
 * @param mode - CSP mode
 * @returns Header name
 */
export function getCSPHeaderName(
  mode: "enforce" | "report-only" = "enforce",
): string {
  return mode === "enforce"
    ? "Content-Security-Policy"
    : "Content-Security-Policy-Report-Only";
}

/**
 * Apply CSP headers to response
 *
 * @param headers - Response headers object
 * @param options - CSP options
 */
export function applyCSPHeaders(
  headers: Headers,
  options: CSPOptions = {},
): void {
  const csp = generateCSP(options);
  const headerName = getCSPHeaderName(options.mode);

  headers.set(headerName, csp);
}

// ============================================================================
// DEVELOPMENT VS PRODUCTION CSP
// ============================================================================

/**
 * Get environment-specific CSP configuration
 */
export function getEnvironmentCSP(): CSPOptions {
  if (process.env.NODE_ENV === "development") {
    return {
      mode: "report-only", // Don't block in development
      enableUnsafeEval: true, // Allow eval for hot reloading
      enableUnsafeInline: true, // Allow inline scripts for dev tools
    };
  }

  return {
    mode: "enforce", // Strict enforcement in production
    enableUnsafeEval: false,
    enableUnsafeInline: false,
  };
}

// ============================================================================
// CSP VIOLATION REPORTING
// ============================================================================

/**
 * CSP violation report structure
 */
export interface CSPViolationReport {
  "csp-report": {
    "document-uri": string;
    referrer: string;
    "violated-directive": string;
    "effective-directive": string;
    "original-policy": string;
    disposition: string;
    "blocked-uri": string;
    "line-number": number;
    "column-number": number;
    "source-file": string;
    "status-code": number;
    "script-sample": string;
  };
}

/**
 * Parse and log CSP violation report
 *
 * @param report - CSP violation report
 */
export async function handleCSPViolation(
  report: CSPViolationReport,
): Promise<void> {
  const violation = report["csp-report"];

  console.error("🚨 CSP VIOLATION DETECTED:", {
    directive: violation["violated-directive"],
    blockedUri: violation["blocked-uri"],
    documentUri: violation["document-uri"],
    sourceFile: violation["source-file"],
    lineNumber: violation["line-number"],
    sample: violation["script-sample"],
  });

  // Send to Azure Application Insights in production
  if (process.env.NODE_ENV === "production" && telemetryService.enabled) {
    telemetryService.trackCSPViolation({
      documentUri: violation["document-uri"] || "",
      violatedDirective: violation["violated-directive"] || "",
      effectiveDirective:
        violation["effective-directive"] ||
        violation["violated-directive"] ||
        "",
      originalPolicy: violation["original-policy"] || "",
      blockedUri: violation["blocked-uri"],
      sourceFile: violation["source-file"],
      lineNumber: violation["line-number"],
      columnNumber: violation["column-number"],
    });
  }
}

// ============================================================================
// CSP META TAG GENERATOR (for HTML <meta> tag)
// ============================================================================

/**
 * Generate CSP meta tag for HTML
 * Use this in HTML <head> as fallback or for static pages
 *
 * @param options - CSP options
 * @returns HTML meta tag string
 *
 * @example
 * ```tsx
 * <head>
 *   {generateCSPMetaTag()}
 * </head>
 * ```
 */
export function generateCSPMetaTag(options: CSPOptions = {}): string {
  const csp = generateCSP(options);
  return `<meta http-equiv="Content-Security-Policy" content="${csp}">`;
}

// ============================================================================
// PRESETS
// ============================================================================

/**
 * Strict CSP for maximum security
 * Use for static pages or pages without dynamic content
 */
export const STRICT_CSP: CSPOptions = {
  mode: "enforce",
  enableUnsafeInline: false,
  enableUnsafeEval: false,
};

/**
 * Relaxed CSP for pages with dynamic content
 * Use for pages with user-generated content or third-party widgets
 */
export const RELAXED_CSP: CSPOptions = {
  mode: "enforce",
  enableUnsafeInline: true,
  enableUnsafeEval: false,
};

/**
 * Development CSP
 * Allows hot reloading and dev tools
 */
export const DEV_CSP: CSPOptions = {
  mode: "report-only",
  enableUnsafeInline: true,
  enableUnsafeEval: true,
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generate: generateCSP,
  apply: applyCSPHeaders,
  generateNonce,
  getEnvironmentCSP,
  handleViolation: handleCSPViolation,
  presets: {
    strict: STRICT_CSP,
    relaxed: RELAXED_CSP,
    dev: DEV_CSP,
  },
};
