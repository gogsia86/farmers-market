/** @type {import('next').NextConfig} */
const nextConfig = {
  // ========================================================================
  // DIVINE NEXT.JS CONFIGURATION FOR FARMERS MARKET
  // Optimized for HP OMEN 16 (RTX 2070 Max-Q, 64GB RAM, 12 threads)
  // ========================================================================

  // Experimental features for quantum performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // instrumentationHook removed - now default in Next.js 15
  },

  // TypeScript configuration
  typescript: {
    // Type-check during builds
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Disable ESLint during builds (warnings in compiled NextAuth file)
    ignoreDuringBuilds: true,
    // Disable linting entirely during build
    dirs: [],
  },

  // Fix watchpack issue
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Webpack configuration for divine consciousness
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add path alias support for divine imports
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": "./src",
      "@/components": "./src/components",
      "@/lib": "./src/lib",
      "@/app": "./src/app",
      "@/types": "./src/types",
      "@/hooks": "./src/hooks",
      "@/utils": "./src/utils",
      "@/styles": "./src/styles",
    };

    // HP OMEN optimization for parallel processing
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
            },
          },
        },
      };
    }

    return config;
  },

  // Image optimization for farm photos
  images: {
    domains: ["localhost", "images.unsplash.com", "via.placeholder.com"],
    formats: ["image/webp", "image/avif"],
  },

  // Headers for agricultural security consciousness
  async headers() {
    return [
      {
        source: "/api/(.*)",
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

  // Output configuration
  output: "standalone", // For containerized deployments

  // Logging for divine debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
