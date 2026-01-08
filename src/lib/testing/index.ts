/**
 * 🤖 Unified Bot Framework - Public API
 * Farmers Market Platform
 *
 * Consolidated testing and monitoring system
 */

// ============================================================================
// CORE EXPORTS
// ============================================================================

export { BotEngine, createBotEngine, createModule, createSuite } from './core/bot-engine';
export type { BotEngineOptions, ModuleExecutionContext } from './core/bot-engine';
export { BrowserManager, createBrowserManager } from './core/browser-manager';
export { createReportGenerator, generateQuickReport, ReportGenerator } from './core/report-generator';
export type { GeneratedReport, HistoricalData, ReportFormat as ReportFormatType, ReportOptions } from './core/report-generator';
export { createTestRunner, quickTest, runSuiteWithCleanup, TestRunner } from './core/test-runner';
export type { TestFilter, TestRunnerOptions, TestRunReport, TestSummary } from './core/test-runner';

// Export types
export type {
  // Configuration
  BotConfig,
  // Events
  BotEvent,
  BotEventData, BotReport, EventHandler, ExecutionMode, HealthCheckReport,
  // Utilities
  LoggerColors,
  // Monitoring
  MonitoringCheck,
  MonitoringResult, NotificationChannel,
  // Notifications
  NotificationConfig, NotificationPayload, PageSelectors, ReportFormat,
  // Selectors
  SelectorMap, TestCategory, TestContext,
  TestData,
  // Test Module
  TestModule, TestPriority,
  // Results
  TestResult,
  // Core types
  TestStatus,
  // Suite
  TestSuite, TestSuiteResult
} from './types';

// ============================================================================
// UTILITIES
// ============================================================================

export {
  AssertionError, Assertions, createAssertions,
  expect,
  throwAssertionError
} from './utils/assertions';
export type { AssertionResult } from './utils/assertions';

export {
  createScreenshotManager, screenshotIf, ScreenshotManager, takeFailureScreenshot, takeScreenshot, withScreenshotOnFailure
} from './utils/screenshots';
export type { ScreenshotMetadata, ScreenshotOptions, ScreenshotResult } from './utils/screenshots';

export {
  createTestDataGenerator, generateMultipleProducts, generateTestData, getSeededAdmin,
  getSeededFarmer,
  getSeededPendingFarmer,
  getStripeTestCard, TestDataGenerator
} from './utils/test-data';

export {
  ariaLabelSelector, combineSelectors, fallbackSelector, getAdminSelectors, getAllSelectors, getCartSelectors, getFarmerSelectors, getLoginSelectors, getMarketplaceSelectors, getRegistrationSelectors, getSelector, placeholderSelector, SELECTORS, testIdSelector, textSelector, validateSelectors
} from './utils/selectors';

// ============================================================================
// CONFIGURATION
// ============================================================================

export {
  CI_CD_CONFIG, createConfig, DEBUG_CONFIG, DEFAULT_BOT_CONFIG, getPreset, loadConfigFromEnv, mergeConfigs, MONITORING_CONFIG, MVP_VALIDATION_CONFIG, printConfig, QUICK_VALIDATION_CONFIG, validateConfig
} from './config/bot-config';

// ============================================================================
// TEST MODULES (Phase 3 - Migrated)
// ============================================================================

// Health Checks Module
export { default as HealthChecksModule } from './modules/health/checks.module';

// Marketplace Module
export { default as MarketplaceBrowseModule } from './modules/marketplace/browse.module';

// Cart & Checkout Module
export { default as CartCheckoutModule } from './modules/cart/checkout.module';

// Authentication Module (Phase 2)
export { default as AuthLoginModule } from './modules/auth/login.module';

// ============================================================================
// VERSION & INFO
// ============================================================================

export const VERSION = '1.0.0';
export const FRAMEWORK_NAME = 'Unified Bot Framework';

/**
 * Get framework information
 */
export function getFrameworkInfo() {
  return {
    name: FRAMEWORK_NAME,
    version: VERSION,
    description: 'Consolidated testing and monitoring system for Farmers Market Platform',
    features: [
      'Unified CLI interface',
      'Modular test system',
      'Configuration presets',
      'Dynamic test data generation',
      'Centralized selectors',
      'Browser automation utilities',
      'Comprehensive reporting',
      'Health checks & monitoring',
      'E2E test automation',
    ],
    status: {
      foundation: 'Complete',
      coreEngine: 'Complete',
      testModules: 'In Progress (Phase 3)',
      migratedModules: ['health', 'marketplace', 'cart', 'auth'],
    },
  };
}

/**
 * Quick health check - verify framework is properly installed
 */
export function verifyInstallation(): {
  installed: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check if required dependencies are available
  try {
    require('playwright');
  } catch {
    issues.push('Playwright is not installed');
  }

  try {
    require('dotenv');
  } catch {
    issues.push('dotenv is not installed');
  }

  return {
    installed: issues.length === 0,
    issues,
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a browser manager with default configuration
 */
export function createDefaultBrowserManager() {
  const { createBrowserManager } = require('./core/browser-manager');
  const { DEFAULT_BOT_CONFIG } = require('./config/bot-config');
  return createBrowserManager(DEFAULT_BOT_CONFIG);
}

/**
 * Create a browser manager with custom configuration preset
 */
export function createBrowserManagerWithPreset(preset: string) {
  const { createBrowserManager } = require('./core/browser-manager');
  const { createConfig } = require('./config/bot-config');
  return createBrowserManager(createConfig(preset));
}

/**
 * Quick start helper - generates test data and returns browser manager
 */
export async function quickStart(preset?: string) {
  const { createBrowserManager } = require('./core/browser-manager');
  const { createConfig } = require('./config/bot-config');
  const { generateTestData } = require('./utils/test-data');

  const config = createConfig(preset || 'quick');
  const browserManager = createBrowserManager(config);
  const testData = generateTestData();

  await browserManager.initialize();

  return {
    browserManager,
    testData,
    config,
    async cleanup() {
      await browserManager.cleanup();
    },
  };
}

/**
 * Quick start with full test runner setup
 */
export async function quickStartTestRunner(preset?: string) {
  const { createTestRunner } = require('./core/test-runner');
  const { createConfig } = require('./config/bot-config');
  const { generateTestData } = require('./utils/test-data');

  const config = createConfig(preset || 'quick');
  const testData = generateTestData();
  const runner = createTestRunner(config);

  return {
    runner,
    testData,
    config,
    async cleanup() {
      await runner.cleanup();
    },
  };
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  VERSION,
  FRAMEWORK_NAME,
  getFrameworkInfo,
  verifyInstallation,
  createDefaultBrowserManager,
  createBrowserManagerWithPreset,
  quickStart,
  quickStartTestRunner,
};
