import { fileURLToPath } from "url";
import bundleAnalyzer from "@next/bundle-analyzer";

// Bundle analyzer for performance optimization
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker compatibility
  output: "standalone",

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

    // Enable parallel building based on available CPU cores
    const os = require("os");
    config.parallelism = Math.max(os.cpus().length - 2, 1);

    // Performance settings
    config.performance = {
      maxAssetSize: 10000000, // 10MB
      maxEntrypointSize: 10000000, // 10MB
    };

    // Enable memory caching
    config.cache = {
      type: "memory",
      maxGenerations: process.env.NODE_ENV === "production" ? 50 : 20,
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
            // STRATEGIC CACHE GROUPS (7 GROUPS)
            // Simplified from 13 groups for better maintainability
            // ============================================

            // 1. Framework Core - React, Next.js essentials (highest priority)
            framework: {
              name: "framework",
              test: /[\\/]node_modules[\\/](react|react-dom|next|scheduler)[\\/]/,
              chunks: "all",
              priority: 40,
              enforce: true,
              reuseExistingChunk: true,
            },

            // 2. Route-Based Splits - Admin, Farmer, Monitoring dashboards
            routes: {
              name: "routes",
              test: /[\\/]app[\\/]\((admin|farmer|monitoring)\)|[\\/]lib[\\/]monitoring/,
              chunks: "all",
              priority: 35,
              enforce: true,
              reuseExistingChunk: true,
            },

            // 3. Heavy Async Libraries - AI/ML, Charts, Animations
            // Loaded on-demand to reduce initial bundle size
            heavyAsync: {
              name: "heavy-async",
              test: /[\\/]node_modules[\\/](@tensorflow|ollama|recharts|chart\.js|d3|victory|framer-motion)[\\/]/,
              chunks: "async",
              priority: 30,
              reuseExistingChunk: true,
            },

            // 4. Critical Services - Payment, Auth, Telemetry
            services: {
              name: "services",
              test: /[\\/]node_modules[\\/](@stripe|@opentelemetry|@sentry|next-auth)[\\/]/,
              chunks: "all",
              priority: 25,
              reuseExistingChunk: true,
            },

            // 5. UI Libraries - Component libraries and styling
            ui: {
              name: "ui",
              test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|clsx|class-variance-authority)[\\/]/,
              chunks: "all",
              priority: 22,
              reuseExistingChunk: true,
            },

            // 6. Vendor - All other node_modules
            vendor: {
              name: "vendor",
              test: /[\\/]node_modules[\\/]/,
              chunks: "all",
              priority: 20,
              reuseExistingChunk: true,
            },

            // 7. Common - Shared code across multiple pages
            common: {
              name: "common",
              minChunks: 2,
              chunks: "all",
              priority: 10,
              enforce: true,
              reuseExistingChunk: true,
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
  // TYPESCRIPT CONFIGURATION
  // ============================================
  typescript: {
    // TypeScript strict checking enabled - no build errors present
    // Verified with `npx tsc --noEmit` on December 26, 2024
    ignoreBuildErrors: false,
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
    return `build-${Date.now()}`;
  },

  // React strict mode (disable in Docker for speed)
  reactStrictMode: process.env.DOCKER_BUILD !== "true",

  // Output directory
  distDir: ".next",

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
      // Cloudinary CDN
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
      // Supabase Storage
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
      // AWS S3
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
      },
      // Vercel Blob Storage
      {
        protocol: "https",
        hostname: "*.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 5184000, // 60 days
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
      fullUrl: true,
    },
  },

  // Source maps (disabled for performance, we have good error tracking)
  productionBrowserSourceMaps: false,

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
  // TURBOPACK CONFIGURATION (Next.js 16+)
  // ============================================
  // Empty config to silence webpack compatibility warning
  turbopack: {},
};

export default withBundleAnalyzer(nextConfig);
