import { withSentryConfig } from "@sentry/nextjs";
import { fileURLToPath } from "url";
import bundleAnalyzer from "@next/bundle-analyzer";

// Bundle analyzer for performance optimization
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */

// Import extracted webpack configuration
import { configureWebpack } from "./webpack.config.mjs";

const nextConfig = {
  // Docker compatibility - only enable in CI/production or when explicitly requested
  // Disabled for local Windows builds to avoid file path issues with node:inspector
  // Note: Omitting 'output' key entirely when not needed (rather than setting to undefined)
  ...(process.env.DOCKER_BUILD === "true" || process.env.CI
    ? { output: "standalone" }
    : {}),

  // ============================================
  // COMPILER OPTIMIZATIONS
  // ============================================
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
    // Enable React compiler optimizations
    reactRemoveProperties: process.env.NODE_ENV === "production",
  },

  // ============================================
  // SWC MINIFIER (DEFAULT IN NEXT.JS 15+)
  // ============================================
  // Note: swcMinify is now default and deprecated option removed

  // ============================================
  // EXPERIMENTAL FEATURES (PERFORMANCE)
  // ============================================
  experimental: {
    // Optimize package imports - Phase 5 Enhanced
    optimizePackageImports: [
      "@headlessui/react",
      "@heroicons/react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-toast",
      "lucide-react",
      "framer-motion",
      "date-fns",
      "@tanstack/react-query",
      "zod",
      "react-hook-form",
    ],
    // Enable scroll restoration
    scrollRestoration: true,
    // Optimize CSS loading
    optimizeCss: true,
    // Memory optimization with 64GB available
    memoryBasedWorkersCount: true,
    // Client trace metadata for better debugging
    clientTraceMetadata: ["appDir", "middleware"],
    // Use lighter client bundle
    optimizeServerReact: true,
    // Turbopack source map configuration for Sentry
    turbo: {
      rules: {
        "*.tsx": {
          loaders: ["@next/swc-loader"],
          as: "*.tsx",
        },
        "*.ts": {
          loaders: ["@next/swc-loader"],
          as: "*.ts",
        },
      },
    },
  },

  // Server external packages (moved from experimental)
  serverExternalPackages: ["@prisma/client", "bcryptjs", "sharp"],

  // ============================================
  // OUTPUT FILE TRACING (TOP-LEVEL)
  // ============================================
  // Exclude problematic Node.js built-in modules from file tracing
  // Fixes Windows EINVAL error with node:inspector in standalone builds
  outputFileTracingExcludes: {
    "*": ["node:inspector", "node:diagnostics_channel"],
  },

  // ============================================
  // WEBPACK OPTIMIZATION
  // ============================================
  // Extracted to webpack.config.js for better maintainability
  // See: webpack.config.js for full configuration details
  webpack: configureWebpack,

  // ============================================
  // TYPESCRIPT CONFIGURATION
  // ============================================
  typescript: {
    // Skip type checking during Vercel builds (done in prebuild locally)
    ignoreBuildErrors: process.env.VERCEL === "1" || process.env.CI === "true",
    tsconfigPath: "./tsconfig.json",
  },

  // ============================================
  // ESLINT CONFIGURATION (RUN SEPARATELY)
  // ============================================
  // Note: Next.js 15+ handles ESLint through CLI only
  // Use: npm run lint or npm run quality

  // ============================================
  // BUILD OPTIMIZATION
  // ============================================
  staticPageGenerationTimeout: 300, // 5 minutes
  generateBuildId: async () => {
    // Use git SHA in production, timestamp in dev
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      return process.env.VERCEL_GIT_COMMIT_SHA;
    }
    return `build-${Date.now()}`;
  },

  // React strict mode (disable in Docker for speed)
  reactStrictMode: process.env.DOCKER_BUILD !== "true",

  // Output directory
  distDir: ".next",

  // Optimize production builds - ENABLED for Sentry error tracking
  productionBrowserSourceMaps: true,

  // Skip trailing slash for cleaner URLs
  trailingSlash: false,

  // ============================================
  // ON-DEMAND ENTRIES
  // ============================================
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 1 minute
    pagesBufferLength: 5, // Pages to keep in buffer
  },

  // ============================================
  // IMAGE OPTIMIZATION
  // ============================================
  images: {
    // Remote image sources (consolidated patterns)
    remotePatterns: [
      // Development
      { protocol: "http", hostname: "localhost" },

      // External image services
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },

      // CDN providers (wildcard patterns for flexibility)
      { protocol: "https", hostname: "*.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "*.vercel-storage.com" },
    ],

    // Modern image formats (AVIF → WebP fallback)
    formats: ["image/avif", "image/webp"],

    // Responsive breakpoints (optimized for common devices)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Cache for 60 days
    minimumCacheTTL: 5184000,

    // SVG handling with security
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ============================================
  // HEADERS (SECURITY + PERFORMANCE)
  // ============================================
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Security headers
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
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http://localhost:*",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://api.stripe.com https://*.stripe.com http://localhost:* ws://localhost:*",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // ============================================
  // REDIRECTS
  // ============================================
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/admin",
        permanent: false,
      },
    ];
  },

  // ============================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================
  poweredByHeader: false,
  generateEtags: true,
  compress: true,

  // Optimized logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // ============================================
  // SWC CONFIGURATION
  // ============================================
  modularizeImports: {
    "@heroicons/react/24/outline": {
      transform: "@heroicons/react/24/outline/{{member}}",
    },
    "@heroicons/react/24/solid": {
      transform: "@heroicons/react/24/solid/{{member}}",
    },
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
  },

  // ============================================
  // CACHE CONFIGURATION
  // ============================================
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },

  // ============================================
  // ENVIRONMENT VARIABLES
  // ============================================
  env: {
    NEXT_TELEMETRY_DISABLED: "1",
  },
};

// ============================================
// CONDITIONAL CONFIGURATION BASED ON ENV
// ============================================
if (process.env.ANALYZE === "true") {
  console.log("🔍 Bundle analysis enabled");
}

if (process.env.VERCEL === "1") {
  console.log("☁️  Building for Vercel deployment");
  nextConfig.typescript.ignoreBuildErrors = true;
}

if (process.env.NODE_ENV === "development") {
  // Development-specific optimizations
  nextConfig.compiler.removeConsole = false;
}

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "medicis-gang",

  project: "farmers-market-prod",

  // Enable verbose logging to debug source map uploads
  silent: false,
  dryRun: false,

  // Source map configuration for Turbopack
  include: ".next",
  ignore: ["node_modules", ".next/cache"],
  urlPrefix: "~/_next",

  // Auto-detect source maps (KEY FIX for Turbopack)
  sourcemaps: {
    assets: [
      ".next/static/chunks/**",
      ".next/server/**",
      ".next/static/css/**",
    ],
    deleteAfterUpload: false, // Keep for debugging
    filesToDeleteAfterUpload: [],
  },

  // Error handling - don't fail build on Sentry errors
  errorHandler: (err, invokeErr, compilation) => {
    console.error("❌ Sentry upload error:", err.message);
    return false;
  },

  // Git integration
  setCommits: {
    auto: true,
    ignoreMissing: true,
    ignoreEmpty: true,
  },

  // Deployment tracking
  deploy: {
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || "production",
  },

  // Release naming
  release: {
    name: process.env.VERCEL_GIT_COMMIT_SHA || undefined,
    uploadLegacySourcemaps: true,
  },

  // Auth token from environment
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Don't hide source maps - we need them for Sentry
  hideSourceMaps: false,

  // Automatically tree-shake Sentry logger statements in production
  disableLogger: process.env.NODE_ENV === "production",

  // Annotate React components for better breadcrumbs
  reactComponentAnnotation: {
    enabled: true,
  },
});
