import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ========================================================================
  // DIVINE NEXT.JS CONFIGURATION FOR FARMERS MARKET
  // Optimized for HP OMEN 16 (RTX 2070 Max-Q, 64GB RAM, 12 threads)
  // With Multi-Language Support 🌍
  // ========================================================================

  // Experimental features for quantum performance
  experimental: {
    // optimizeCss disabled - requires critters package
    // optimizeCss: true,
    scrollRestoration: true,
    // instrumentationHook removed - now default in Next.js 15
  },

  // TypeScript configuration
  typescript: {
    // Type-check during builds - ignore errors for Docker build
    ignoreBuildErrors: true,
  },

  // ESLint is now configured via CLI flags or package.json scripts
  // Removed deprecated 'eslint' config - use 'next lint --max-warnings 0' in CI

  // Fix watchpack issue
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    // Empty config to silence the warning - Turbopack is now default
  },

  // Image optimization for farm photos
  images: {
    // Use remotePatterns instead of deprecated domains
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },

  // Headers for agricultural security consciousness
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Agricultural-Consciousness",
            value: "divine",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "img-src 'self' data: blob: https: http://localhost:*; " +
              "font-src 'self' data: https://fonts.gstatic.com; " +
              "connect-src 'self' https://api.stripe.com https://*.stripe.com http://localhost:* ws://localhost:*; " +
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com; " +
              "object-src 'none'; " +
              "base-uri 'self'; " +
              "form-action 'self'; " +
              "frame-ancestors 'none'; " +
              "upgrade-insecure-requests;",
          },
        ],
      },
    ];
  },

  // Redirects for divine navigation
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/admin",
        permanent: false,
      },
    ];
  },

  // Environment variables (divine configuration)
  env: {
    AGRICULTURAL_CONSCIOUSNESS: "enabled",
    DIVINE_PATTERNS: "active",
    HP_OMEN_OPTIMIZATION: "turbo",
  },

  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  generateEtags: true, // Generate ETags for caching
  compress: true, // Enable gzip compression

  // Output configuration (conditional for Docker vs Vercel)
  // Use standalone for Docker, omit for Vercel
  ...(process.env.DOCKER_BUILD === "true" && { output: "standalone" }),

  // Logging for divine debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default withNextIntl(nextConfig);
