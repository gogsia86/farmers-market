/**
 * Divine Webpack Configuration
 * Farmers Market Platform - Next.js Webpack Optimization
 *
 * Extracted from next.config.mjs for better maintainability
 * Phase 2, Task 3: Configuration Simplification
 *
 * @module webpack.config
 * @version 1.0.0
 * @agricultural-consciousness ACTIVE
 */

import os from "os";

/**
 * Strategic Cache Groups Configuration
 * Simplified from 13 to 7 groups in Phase 2, Task 2
 *
 * Priority Hierarchy:
 *   40 → Framework (Always highest)
 *   35 → Routes (App-specific)
 *   30 → Heavy Async (On-demand)
 *   25 → Services (Critical business)
 *   22 → UI (Components)
 *   20 → Vendor (Everything else)
 *   10 → Common (Shared code)
 */
export const cacheGroups = {
  default: false,
  vendors: false,

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
};

/**
 * Externals Configuration
 * Exclude packages that shouldn't be bundled (server-only, native modules)
 */
export const externalsConfig = {
  // Exclude Bull queue from build (Redis dependency, server-only)
  'bull': 'commonjs bull',
  'ioredis': 'commonjs ioredis',
};

/**
 * Get optimized Terser configuration
 * Preserves function names and handles __name correctly
 *
 * @param {boolean} dropConsole - Whether to drop console statements
 * @returns {Object} TerserPlugin configuration
 */
export function getTerserConfig(dropConsole = false) {
  // Dynamic import for TerserPlugin
  const TerserPlugin = require("terser-webpack-plugin");

  return new TerserPlugin({
    terserOptions: {
      compress: {
        drop_console: dropConsole,
      },
      mangle: {
        keep_fnames: true, // Preserve function names
        reserved: ["__name"], // Explicitly protect __name
      },
      keep_fnames: true,
      keep_classnames: true,
    },
  });
}

/**
 * Get optimization configuration for production builds
 *
 * @returns {Object} Webpack optimization config
 */
export function getOptimizationConfig() {
  return {
    moduleIds: "deterministic",
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
      maxInitialRequests: 25,
      minSize: 20000,
      cacheGroups,
    },
    minimize: true,
  };
}

/**
 * Get performance configuration
 * Optimized for agricultural platform scale
 *
 * @returns {Object} Webpack performance config
 */
export function getPerformanceConfig() {
  return {
    maxAssetSize: 10000000, // 10MB
    maxEntrypointSize: 10000000, // 10MB
  };
}

/**
 * Get cache configuration
 * Memory-based caching with generation limits
 *
 * @param {boolean} isDevelopment - Whether in development mode
 * @returns {Object} Webpack cache config
 */
export function getCacheConfig(isDevelopment = false) {
  return {
    type: "memory",
    maxGenerations: isDevelopment ? 20 : 50,
  };
}

/**
 * Calculate optimal parallelism based on available CPU cores
 * Leaves 2 cores free for system operations
 *
 * @returns {number} Optimal parallelism value
 */
export function getOptimalParallelism() {
  return Math.max(os.cpus().length - 2, 1);
}

/**
 * Main webpack configuration function
 * Called by Next.js during build process
 *
 * @param {Object} config - Webpack config object
 * @param {Object} options - Next.js webpack options
 * @param {boolean} options.dev - Development mode flag
 * @param {boolean} options.isServer - Server build flag
 * @returns {Object} Modified webpack config
 */
export function configureWebpack(config, { dev, isServer }) {
  // Initialize optimization
  config.optimization = config.optimization || {};
  config.optimization.minimize = !dev;

  // Production optimizations (client-side only)
  if (!dev) {
    // Configure Terser for production
    const dropConsole = process.env.NODE_ENV === "production";
    config.optimization.minimizer = [getTerserConfig(dropConsole)];

    // Apply split chunks configuration (client-side only)
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        ...getOptimizationConfig(),
      };
    }
  }

  // Server-side externals (exclude Bull queue from build)
  if (isServer) {
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push(externalsConfig);
    }
  }

  // Environment-adaptive parallelism
  config.parallelism = getOptimalParallelism();

  // Performance settings
  config.performance = getPerformanceConfig();

  // Memory caching
  config.cache = getCacheConfig(dev);

  return config;
}

/**
 * Utility: Get cache group by name
 * Useful for debugging and analysis
 *
 * @param {string} groupName - Name of cache group
 * @returns {Object|null} Cache group configuration
 */
export function getCacheGroup(groupName) {
  return cacheGroups[groupName] || null;
}

/**
 * Utility: Get all cache group names
 *
 * @returns {string[]} Array of cache group names
 */
export function getCacheGroupNames() {
  return Object.keys(cacheGroups).filter(
    (key) => key !== "default" && key !== "vendors",
  );
}

/**
 * Utility: Get cache groups by priority
 *
 * @returns {Object[]} Sorted array of cache groups
 */
export function getCacheGroupsByPriority() {
  return Object.entries(cacheGroups)
    .filter(([key]) => key !== "default" && key !== "vendors")
    .map(([name, config]) => ({ name, ...config }))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

/**
 * USAGE IN next.config.mjs:
 *
 * import { configureWebpack } from './webpack.config.mjs';
 *
 * export default {
 *   webpack: configureWebpack,
 *   // ... other Next.js config
 * }
 *
 * DIVINE AGRICULTURAL CONSCIOUSNESS:
 *
 * This configuration embodies:
 * 🌾 Strategic Bundling - Like organizing seasonal crops
 * ⚡ Quantum Performance - Optimal loading patterns
 * 🎯 Divine Simplicity - 7 strategic groups for clarity
 * 📚 Knowledge Preservation - Complete documentation
 * 🔮 Holographic Patterns - Clean, maintainable structure
 */
