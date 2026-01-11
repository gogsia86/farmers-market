/**
 * ⚙️ Bot Configuration
 * Unified Bot Framework - Default Configuration & Management
 *
 * Centralized configuration for all bot testing scenarios
 */

import type { BotConfig } from "../types";

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_BOT_CONFIG: BotConfig = {
  // Core settings
  name: "Unified Bot Framework",
  version: "1.0.0",
  baseUrl:
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3001",

  // Browser settings
  browser: {
    headless: process.env.HEADLESS !== "false",
    slowMo: parseInt(process.env.SLOW_MO || "0"),
    timeout: 60000, // 60 seconds
    viewport: {
      width: 1920,
      height: 1080,
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },

  // Execution settings
  execution: {
    mode: "suite",
    parallel: false, // Sequential by default to avoid browser issues
    maxConcurrency: 1,
    retries: 2,
    retryDelay: 2000, // 2 seconds
    continueOnFailure: true,
  },

  // Monitoring settings (for continuous mode)
  monitoring: {
    enabled: false,
    interval: 60000, // 1 minute
    alertThreshold: 20, // Alert if >20% of tests fail
  },

  // Reporting settings
  reporting: {
    enabled: true,
    formats: ["json", "markdown", "console"],
    outputDir: "./bot-reports",
    screenshotOnFailure: true,
    screenshotOnSuccess: false,
    fullPageScreenshot: true,
    saveTraces: false,
  },

  // Test data settings
  testData: {
    useSeededData: false, // Use dynamic data by default
    generateDynamic: true,
    credentials: {
      admin: {
        email: process.env.ADMIN_EMAIL || "admin@farmersmarket.app",
        password:
          process.env.ADMIN_PASSWORD ||
          process.env.TEST_USER_PASSWORD ||
          "DivineAdmin123!",
      },
      farmer: {
        email: "farmer.existing@farmersmarket.test",
        password: process.env.TEST_USER_PASSWORD || "FarmerTest123!@#",
      },
      customer: {
        email: "", // Will be generated dynamically
        password: process.env.TEST_USER_PASSWORD || "CustomerTest123!@#",
      },
    },
  },

  // Module configuration
  modules: {
    include: [], // Empty = all modules
    exclude: [],
    config: {},
  },

  // Logging settings
  logging: {
    level: "info",
    console: true,
    file: false,
    filePath: "./bot-reports/logs/bot.log",
  },
};

// ============================================================================
// CONFIGURATION PRESETS
// ============================================================================

/**
 * Quick validation preset - fast, critical tests only
 */
export const QUICK_VALIDATION_CONFIG: Partial<BotConfig> = {
  name: "Quick Validation",
  execution: {
    mode: "suite",
    parallel: false,
    maxConcurrency: 1,
    retries: 1,
    retryDelay: 1000,
    continueOnFailure: true,
  },
  reporting: {
    enabled: true,
    formats: ["console"],
    outputDir: "./bot-reports/quick",
    screenshotOnFailure: true,
    screenshotOnSuccess: false,
    fullPageScreenshot: false,
    saveTraces: false,
  },
  modules: {
    include: ["health-check", "auth-login", "marketplace-browse"],
    exclude: [],
    config: {},
  },
};

/**
 * Comprehensive MVP validation preset
 */
export const MVP_VALIDATION_CONFIG: Partial<BotConfig> = {
  name: "MVP Validation",
  execution: {
    mode: "suite",
    parallel: false,
    maxConcurrency: 1,
    retries: 2,
    retryDelay: 2000,
    continueOnFailure: true,
  },
  reporting: {
    enabled: true,
    formats: ["json", "markdown", "html", "console"],
    outputDir: "./mvp-validation-reports",
    screenshotOnFailure: true,
    screenshotOnSuccess: true,
    fullPageScreenshot: true,
    saveTraces: true,
  },
  logging: {
    level: "info",
    console: true,
    file: true,
    filePath: "./mvp-validation-reports/logs/mvp-bot.log",
  },
};

/**
 * Continuous monitoring preset
 */
export const MONITORING_CONFIG: Partial<BotConfig> = {
  name: "Continuous Monitor",
  execution: {
    mode: "continuous",
    parallel: false,
    maxConcurrency: 1,
    retries: 3,
    retryDelay: 5000,
    continueOnFailure: true,
  },
  monitoring: {
    enabled: true,
    interval: 300000, // 5 minutes
    alertThreshold: 10,
  },
  reporting: {
    enabled: true,
    formats: ["json", "console"],
    outputDir: "./monitoring-reports",
    screenshotOnFailure: true,
    screenshotOnSuccess: false,
    fullPageScreenshot: false,
    saveTraces: false,
  },
  modules: {
    include: [
      "health-check",
      "health-database",
      "health-api",
      "marketplace-browse",
      "performance-page-load",
    ],
    exclude: [],
    config: {},
  },
};

/**
 * CI/CD preset - fast, no videos/traces
 */
export const CI_CD_CONFIG: Partial<BotConfig> = {
  name: "CI/CD Pipeline",
  browser: {
    headless: true,
    slowMo: 0,
    timeout: 30000,
    viewport: {
      width: 1920,
      height: 1080,
    },
  },
  execution: {
    mode: "suite",
    parallel: true,
    maxConcurrency: 3,
    retries: 2,
    retryDelay: 1000,
    continueOnFailure: false, // Fail fast in CI/CD
  },
  reporting: {
    enabled: true,
    formats: ["json", "console"],
    outputDir: "./ci-reports",
    screenshotOnFailure: true,
    screenshotOnSuccess: false,
    fullPageScreenshot: false,
    saveTraces: false,
  },
  logging: {
    level: "warn", // Less verbose in CI
    console: true,
    file: true,
    filePath: "./ci-reports/logs/ci-bot.log",
  },
};

/**
 * Debug preset - verbose logging, videos, traces
 */
export const DEBUG_CONFIG: Partial<BotConfig> = {
  name: "Debug Mode",
  browser: {
    headless: false,
    slowMo: 500,
    timeout: 120000, // 2 minutes
    viewport: {
      width: 1920,
      height: 1080,
    },
  },
  execution: {
    mode: "single",
    parallel: false,
    maxConcurrency: 1,
    retries: 0,
    retryDelay: 0,
    continueOnFailure: false,
  },
  reporting: {
    enabled: true,
    formats: ["json", "markdown", "console"],
    outputDir: "./debug-reports",
    screenshotOnFailure: true,
    screenshotOnSuccess: true,
    fullPageScreenshot: true,
    saveTraces: true,
  },
  logging: {
    level: "debug",
    console: true,
    file: true,
    filePath: "./debug-reports/logs/debug-bot.log",
  },
};

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

/**
 * Merge configurations with proper deep merging
 */
export function mergeConfigs(
  base: BotConfig,
  override: Partial<BotConfig>,
): BotConfig {
  return {
    ...base,
    ...override,
    browser: {
      ...base.browser,
      ...override.browser,
      viewport: {
        ...base.browser.viewport,
        ...override.browser?.viewport,
      },
    },
    execution: {
      ...base.execution,
      ...override.execution,
    },
    monitoring: {
      ...base.monitoring,
      ...override.monitoring,
    },
    reporting: {
      ...base.reporting,
      ...override.reporting,
    },
    testData: {
      ...base.testData,
      ...override.testData,
      credentials: {
        ...base.testData?.credentials,
        ...override.testData?.credentials,
      },
    },
    modules: {
      ...base.modules,
      ...override.modules,
    },
    logging: {
      ...base.logging,
      ...override.logging,
    },
  };
}

/**
 * Load configuration from environment variables
 */
export function loadConfigFromEnv(): Partial<BotConfig> {
  return {
    baseUrl: process.env.BASE_URL || process.env.NEXT_PUBLIC_APP_URL,
    browser: {
      headless: process.env.HEADLESS !== "false",
      slowMo: parseInt(process.env.SLOW_MO || "0"),
      timeout: parseInt(process.env.BOT_TIMEOUT || "60000"),
      viewport: {
        width: parseInt(process.env.VIEWPORT_WIDTH || "1920"),
        height: parseInt(process.env.VIEWPORT_HEIGHT || "1080"),
      },
    },
    execution: {
      mode: (process.env.BOT_MODE as any) || "suite",
      parallel: process.env.BOT_PARALLEL === "true",
      maxConcurrency: parseInt(process.env.BOT_MAX_CONCURRENCY || "1"),
      retries: parseInt(process.env.BOT_RETRIES || "2"),
      retryDelay: parseInt(process.env.BOT_RETRY_DELAY || "2000"),
      continueOnFailure: process.env.BOT_CONTINUE_ON_FAILURE !== "false",
    },
    reporting: {
      enabled: process.env.BOT_REPORTING !== "false",
      formats: (process.env.BOT_REPORT_FORMATS?.split(",") as any[]) || [
        "json",
        "console",
      ],
      outputDir: process.env.BOT_OUTPUT_DIR || "./bot-reports",
      screenshotOnFailure: process.env.BOT_SCREENSHOT_ON_FAILURE !== "false",
      screenshotOnSuccess: process.env.BOT_SCREENSHOT_ON_SUCCESS === "true",
      fullPageScreenshot: process.env.BOT_FULL_PAGE_SCREENSHOT !== "false",
      saveTraces: process.env.BOT_SAVE_TRACES === "true",
    },
    testData: {
      useSeededData: process.env.BOT_USE_SEEDED_DATA === "true",
      generateDynamic: process.env.BOT_GENERATE_DYNAMIC !== "false",
      credentials: {
        admin: {
          email: process.env.ADMIN_EMAIL || "admin@farmersmarket.app",
          password:
            process.env.ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD,
        },
      },
    },
    logging: {
      level: (process.env.BOT_LOG_LEVEL as any) || "info",
      console: process.env.BOT_LOG_CONSOLE !== "false",
      file: process.env.BOT_LOG_FILE === "true",
      filePath: process.env.BOT_LOG_FILE_PATH,
    },
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: BotConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!config.baseUrl) {
    errors.push("baseUrl is required");
  }

  if (!config.name) {
    errors.push("name is required");
  }

  // Browser settings
  if (config.browser.timeout < 1000) {
    errors.push("browser.timeout must be at least 1000ms");
  }

  if (config.browser.viewport.width < 320) {
    errors.push("browser.viewport.width must be at least 320px");
  }

  if (config.browser.viewport.height < 240) {
    errors.push("browser.viewport.height must be at least 240px");
  }

  // Execution settings
  if (config.execution.maxConcurrency < 1) {
    errors.push("execution.maxConcurrency must be at least 1");
  }

  if (config.execution.retries < 0) {
    errors.push("execution.retries must be non-negative");
  }

  // Monitoring settings
  if (config.monitoring?.enabled && config.monitoring.interval < 1000) {
    errors.push("monitoring.interval must be at least 1000ms");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get configuration preset by name
 */
export function getPreset(name: string): Partial<BotConfig> | null {
  const presets: Record<string, Partial<BotConfig>> = {
    quick: QUICK_VALIDATION_CONFIG,
    mvp: MVP_VALIDATION_CONFIG,
    monitoring: MONITORING_CONFIG,
    cicd: CI_CD_CONFIG,
    debug: DEBUG_CONFIG,
  };

  return presets[name.toLowerCase()] || null;
}

/**
 * Create configuration from preset
 */
export function createConfig(
  preset?: string,
  overrides?: Partial<BotConfig>,
): BotConfig {
  let config = DEFAULT_BOT_CONFIG;

  // Apply preset if specified
  if (preset) {
    const presetConfig = getPreset(preset);
    if (presetConfig) {
      config = mergeConfigs(config, presetConfig);
    }
  }

  // Apply environment variables
  const envConfig = loadConfigFromEnv();
  config = mergeConfigs(config, envConfig);

  // Apply overrides
  if (overrides) {
    config = mergeConfigs(config, overrides);
  }

  // Validate
  const validation = validateConfig(config);
  if (!validation.valid) {
    console.warn("⚠️  Configuration validation warnings:");
    validation.errors.forEach((error) => console.warn(`   - ${error}`));
  }

  return config;
}

/**
 * Print configuration summary
 */
export function printConfig(config: BotConfig): void {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║              BOT CONFIGURATION SUMMARY                     ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(`║ Name: ${config.name.padEnd(50)} ║`);
  console.log(`║ Version: ${config.version.padEnd(47)} ║`);
  console.log(`║ Base URL: ${config.baseUrl.padEnd(46)} ║`);
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(`║ Mode: ${config.execution.mode.padEnd(50)} ║`);
  console.log(
    `║ Headless: ${(config.browser.headless ? "Yes" : "No").padEnd(46)} ║`,
  );
  console.log(
    `║ Parallel: ${(config.execution.parallel ? "Yes" : "No").padEnd(46)} ║`,
  );
  console.log(
    `║ Max Concurrency: ${String(config.execution.maxConcurrency).padEnd(39)} ║`,
  );
  console.log(`║ Retries: ${String(config.execution.retries).padEnd(47)} ║`);
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(
    `║ Report Formats: ${config.reporting.formats.join(", ").padEnd(40)} ║`,
  );
  console.log(`║ Output Dir: ${config.reporting.outputDir.padEnd(44)} ║`);
  console.log(
    `║ Screenshots: ${(config.reporting.screenshotOnFailure ? "On Failure" : "Disabled").padEnd(43)} ║`,
  );
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default DEFAULT_BOT_CONFIG;
