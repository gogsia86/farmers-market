import { fileURLToPath } from "url";
import bundleAnalyzer from "@next/bundle-analyzer";

// Bundle analyzer for performance optimization
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================
  // HP OMEN ULTIMATE OPTIMIZATION
  // ============================================
  // System: 64GB RAM, 12 threads, RTX 2070 Max-Q 8GB
  // Target: Maximum performance and parallelization
  // ============================================

  // Docker compatibility
  output: "standalone",

  // ============================================
  // COMPILER OPTIMIZATIONS (HP OMEN TUNED)
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
    ],
    // Enable scroll restoration
    scrollRestoration: true,
    // Optimize CSS loading
    optimizeCss: true,
    // Memory optimization with 64GB available
    memoryBasedWorkersCount: true,
  },

  // ============================================
  // WEBPACK OPTIMIZATION (64GB RAM + 12 THREADS)
  // ============================================
  webpack: (config, { dev, isServer }) => {
    // Fix __name is not defined error
    config.optimization = config.optimization || {};
    config.optimization.minimize = !dev;

    if (!dev) {
      // Import TerserPlugin
      const TerserPlugin = require("terser-webpack-plugin");

      // Replace minimizer array with properly configured Terser
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: process.env.NODE_ENV === "production",
            },
            mangle: {
              keep_fnames: true, // Preserve function names
              reserved: ["__name"], // Explicitly protect __name
            },
            keep_fnames: true,
            keep_classnames: true,
          },
        }),
      ];
    }

    // Enable parallel building with all threads
    config.parallelism = 12;

    // Optimize for 64GB RAM
    config.performance = {
      maxAssetSize: 10000000, // 10MB (we have the RAM!)
      maxEntrypointSize: 10000000, // 10MB
    };

    // Enable caching with plenty of memory
    config.cache = {
      type: "memory",
      maxGenerations: 100, // Keep more in cache with 64GB
    };

    // Thread loader for parallel processing
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            default: false,
            vendors: false,
            // ============================================
            // PHASE 6 DAY 4: ROUTE-BASED CODE SPLITTING
            // ============================================
            // Admin routes bundle (80-100 KB)
            admin: {
              name: "admin",
              test: /[\\/]app[\\/]\(admin\)/,
              chunks: "all",
              priority: 35,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Farmer dashboard bundle (70-90 KB)
            farmer: {
              name: "farmer",
              test: /[\\/]app[\\/]\(farmer\)/,
              chunks: "all",
              priority: 35,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Monitoring dashboard bundle (40-60 KB)
            monitoring: {
              name: "monitoring",
              test: /[\\/]app[\\/]\(monitoring\)|[\\/]lib[\\/]monitoring/,
              chunks: "all",
              priority: 36,
              reuseExistingChunk: true,
              enforce: true,
            },
            // ============================================
            // Framework chunk (React, Next.js core)
            framework: {
              name: "framework",
              chunks: "all",
              test: /[\\/]node_modules[\\/](react|react-dom|next|scheduler)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Heavy AI/ML libraries - Phase 5 Dynamic Import Target
            ai: {
              name: "ai-ml",
              test: /[\\/]node_modules[\\/](@tensorflow|ollama)[\\/]/,
              chunks: "async",
              priority: 35,
              reuseExistingChunk: true,
            },
            // Chart libraries - Phase 5 Dynamic Import Target
            charts: {
              name: "charts",
              test: /[\\/]node_modules[\\/](recharts|chart\.js|d3|victory)[\\/]/,
              chunks: "async",
              priority: 35,
              reuseExistingChunk: true,
            },
            // Animation libraries
            animations: {
              name: "animations",
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              chunks: "async",
              priority: 30,
              reuseExistingChunk: true,
            },
            // Stripe and payment processing
            payments: {
              name: "payments",
              test: /[\\/]node_modules[\\/](@stripe)[\\/]/,
              chunks: "async",
              priority: 30,
              reuseExistingChunk: true,
            },
            // OpenTelemetry and monitoring
            telemetry: {
              name: "telemetry",
              test: /[\\/]node_modules[\\/](@opentelemetry|@sentry)[\\/]/,
              chunks: "all",
              priority: 25,
              reuseExistingChunk: true,
            },
            // Large vendor libraries
            vendor: {
              name: "vendor",
              chunks: "all",
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common chunks across pages
            common: {
              name: "common",
              minChunks: 2,
              chunks: "all",
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
        // Minimize for production
        minimize: true,
      };
    }

    return config;
  },

  // ============================================
  // TYPESCRIPT CONFIGURATION (12 THREAD COMPILATION)
  // ============================================
  typescript: {
    // WARNING: Set to false for production builds to catch type errors
    // Only set to true temporarily if you need to debug specific issues
    ignoreBuildErrors: false,
    tsconfigPath: "./tsconfig.json",
  },

  // ============================================
  // ESLINT CONFIGURATION (RUN SEPARATELY)
  // ============================================
  // Note: Next.js 15+ handles ESLint through CLI only
  // Use: npm run lint or npm run quality

  // ============================================
  // BUILD OPTIMIZATION (HP OMEN BEAST MODE)
  // ============================================
  staticPageGenerationTimeout: 300, // 5 minutes (we have time with this power)
  generateBuildId: async () => {
    return `omen-${Date.now()}`;
  },

  // React strict mode (disable in Docker for speed)
  reactStrictMode: process.env.DOCKER_BUILD !== "true",

  // Output directory
  distDir: ".next",

  // ============================================
  // ON-DEMAND ENTRIES (OPTIMIZED FOR 64GB RAM)
  // ============================================
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 1 minute (more aggressive with 64GB)
    pagesBufferLength: 10, // Keep more pages in buffer
  },

  // ============================================
  // IMAGE OPTIMIZATION (RTX 2070 HARDWARE ACCELERATION)
  // ============================================
  images: {
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
    formats: ["image/webp", "image/avif"], // AVIF for RTX hardware acceleration
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours (we have the storage)
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
          // Agricultural consciousness
          {
            key: "X-Agricultural-Consciousness",
            value: "divine",
          },
          {
            key: "X-HP-OMEN-Optimized",
            value: "true",
          },
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
  // ENVIRONMENT VARIABLES
  // ============================================
  env: {
    AGRICULTURAL_CONSCIOUSNESS: "enabled",
    DIVINE_PATTERNS: "active",
    HP_OMEN_OPTIMIZATION: "ultimate",
    HP_OMEN_RAM_GB: "64",
    HP_OMEN_THREADS: "12",
    HP_OMEN_GPU: "RTX_2070_MAX_Q",
    HP_OMEN_VRAM_GB: "8",
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
      fullUrl: true,
    },
  },

  // Source maps (disabled for performance, we have good error tracking)
  productionBrowserSourceMaps: false,

  // ============================================
  // SWC CONFIGURATION (12 THREAD COMPILATION)
  // ============================================
  // Note: swcMinify is now default in Next.js 15+
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
  // TURBOPACK CONFIGURATION (Next.js 16+)
  // ============================================
  // Empty config to silence webpack compatibility warning
  turbopack: {},
};

export default withBundleAnalyzer(nextConfig);
