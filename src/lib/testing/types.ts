/**
 * 🤖 Unified Bot Framework - Type Definitions
 * Farmers Market Platform
 *
 * Consolidated type system for all testing and monitoring bots
 */

import type { Browser, BrowserContext, Page } from 'playwright';

// ============================================================================
// CORE TYPES
// ============================================================================

export type TestStatus = 'PASSED' | 'FAILED' | 'WARNING' | 'SKIPPED';
export type TestPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OPTIONAL' | 'NICE_TO_HAVE';
export type TestCategory =
  | 'AUTH'
  | 'MARKETPLACE'
  | 'CART'
  | 'CHECKOUT'
  | 'FARMER'
  | 'ADMIN'
  | 'HEALTH'
  | 'SECURITY'
  | 'PERFORMANCE'
  | 'ACCESSIBILITY'
  | 'MOBILE'
  | 'IMPORTANT'
  | 'general';

export type ExecutionMode = 'single' | 'suite' | 'continuous' | 'scheduled' | 'sequential' | 'parallel' | 'limited-parallel';
export type ReportFormat = 'json' | 'html' | 'markdown' | 'console';
export type EventType =
  | 'module:registered'
  | 'module:started'
  | 'module:completed'
  | 'module:failed'
  | 'module:retry'
  | 'suite:registered'
  | 'suite:started'
  | 'suite:completed'
  | 'suite:failed'
  | 'suite:setup:complete'
  | 'suite:teardown:complete'
  | 'test:started'
  | 'test:passed'
  | 'test:failed'
  | 'test:skipped'
  | 'report:generated'
  | 'monitoring:started'
  | 'monitoring:stopped'
  | 'monitoring:cycle:completed'
  | 'monitoring:cycle:failed'
  | 'monitoring:failures:detected'
  | 'engine:cleanup:complete'
  | 'error'
  | '*';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface BotConfig {
  // Core settings
  name: string;
  version: string;
  baseUrl: string;

  // Browser settings
  browser: {
    headless: boolean;
    slowMo: number;
    timeout: number;
    viewport: {
      width: number;
      height: number;
    };
    userAgent?: string;
  };

  // Execution settings
  execution: {
    mode: ExecutionMode;
    parallel: boolean;
    maxConcurrency: number;
    retries: number;
    retryDelay: number;
    continueOnFailure: boolean;
  };

  // Retry settings
  retryAttempts?: number;
  retryDelay?: number;
  maxConcurrency?: number;

  // Monitoring settings
  monitoring?: {
    enabled: boolean;
    interval: number; // milliseconds
    alertThreshold: number; // percentage of failures to trigger alert
  };

  // Reporting settings
  reporting: {
    enabled: boolean;
    formats: ReportFormat[];
    outputDir: string;
    screenshotOnFailure: boolean;
    screenshotOnSuccess: boolean;
    fullPageScreenshot: boolean;
    saveTraces: boolean;
  };

  // Test data
  testData?: {
    useSeededData: boolean;
    generateDynamic: boolean;
    credentials?: {
      admin?: { email: string; password: string };
      farmer?: { email: string; password: string };
      customer?: { email: string; password: string };
    };
  };

  // Module configuration
  modules?: {
    include?: string[];
    exclude?: string[];
    config?: Record<string, any>;
  };

  // Logging
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    console: boolean;
    file: boolean;
    filePath?: string;
  };

  // Verbose mode
  verbose?: boolean;
}

// ============================================================================
// TEST MODULE
// ============================================================================

export interface TestModule {
  id: string;
  name: string;
  description: string;
  category: TestCategory;
  priority?: TestPriority;
  enabled?: boolean;
  timeout?: number;
  retries?: number;
  dependencies?: string[]; // IDs of modules that must run first
  tags?: string[]; // Tags for filtering and grouping

  // Test execution function (optional if suites are provided)
  execute?: (context: TestContext) => Promise<TestResult>;

  // Test suites (alternative to execute function)
  suites?: TestSuiteDefinition[];

  // Optional lifecycle hooks
  beforeAll?: (context: TestContext) => Promise<void>;
  afterAll?: (context: TestContext) => Promise<void>;
  beforeEach?: (context: TestContext) => Promise<void>;
  afterEach?: (context: TestContext) => Promise<void>;
}

// ============================================================================
// BOT MODULE (Legacy/Engine Format)
// ============================================================================

export interface BotModule {
  id: string;
  name: string;
  description: string;
  category: TestCategory;
  priority?: TestPriority;
  enabled?: boolean;
  timeout?: number;
  retries?: number;
  dependencies?: string[];
  tags?: string[];
  retryOnFailure?: boolean;

  // Execute function for bot engine
  execute: (context: any) => Promise<BotResult>;
}

export interface BotResult {
  moduleId: string;
  moduleName: string;
  status: 'success' | 'failed' | 'warning' | 'skipped';
  timestamp: string;
  duration: number;
  error?: string;
  details?: {
    totalTests?: number;
    passedTests?: number;
    failedTests?: number;
    skippedTests?: number;
    successRate?: number;
    results?: any[];
  };
}

export interface TestSuiteDefinition {
  id: string;
  name: string;
  description?: string;
  tests: TestDefinition[];
  setup?: (page: any) => Promise<void>;
  teardown?: (page: any) => Promise<void>;
  stopOnFailure?: boolean;
}

export interface TestDefinition {
  id: string;
  name: string;
  description?: string;
  category?: TestCategory | TestPriority; // Accepts both for flexibility
  priority?: TestPriority;
  timeout?: number;
  retries?: number;
  tags?: string[];
  run: (page: any, context?: any) => Promise<void | any>;
}

// ============================================================================
// TEST CONTEXT
// ============================================================================

export interface TestContext {
  // Core context
  moduleId?: string;
  runId?: string;
  config?: BotConfig;
  baseUrl?: string;

  // Browser instances
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  // Test data
  testData?: TestData;
  data?: Record<string, any>; // Alternative data property

  // State management
  state?: Record<string, any>;

  // Utilities
  utils?: {
    navigate: (url: string) => Promise<void>;
    waitForNavigation: () => Promise<void>;
    fillForm: (selector: string, value: string) => Promise<void>;
    clickAndWait: (selector: string) => Promise<void>;
    takeScreenshot: (name: string) => Promise<string>;
    waitFor: (ms: number) => Promise<void>;
    retry: <T>(fn: () => Promise<T>, attempts?: number) => Promise<T>;
  };

  // Logging
  log?: {
    debug: (message: string, data?: any) => void;
    info: (message: string, data?: any) => void;
    warn: (message: string, data?: any) => void;
    error: (message: string, data?: any) => void;
    success: (message: string, data?: any) => void;
    step: (message: string, data?: any) => void;
  };
}

// ============================================================================
// TEST DATA
// ============================================================================

export interface TestData {
  timestamp: number;

  farmer?: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    farm?: {
      name: string;
      description: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };

  customer?: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    address?: string;
  };

  admin?: {
    email: string;
    password: string;
  };

  product?: {
    name: string;
    description: string;
    category: string;
    price: string;
    stock: string;
    unit: string;
    organic?: boolean;
  };

  payment?: {
    cardNumber: string;
    expiry: string;
    cvc: string;
    zipCode: string;
  };

  // Dynamic data storage
  generated?: Record<string, any>;
}

// ============================================================================
// TEST RESULTS
// ============================================================================

export interface TestResult {
  // Identification
  id?: string;
  testId?: string; // Alternative test identifier
  moduleId?: string;
  name?: string;
  testName?: string; // Alternative test name
  category?: TestCategory;
  priority?: TestPriority;

  // Status
  status: TestStatus;

  // Timing
  startTime?: Date;
  endTime?: Date;
  duration: number;
  timestamp?: string; // ISO timestamp string

  // Results
  message?: string;
  error?: string;
  errorStack?: string;

  // Evidence
  screenshots?: string[];
  traces?: string[];

  // Metrics
  metrics?: {
    assertions: {
      total: number;
      passed: number;
      failed: number;
    };
    performance?: {
      pageLoadTime?: number;
      apiResponseTime?: number;
      renderTime?: number;
    };
  };

  // Additional data
  metadata?: Record<string, any>;
}

export interface TestSuiteResult {
  // Suite info
  suiteId: string;
  suiteName: string;
  description: string;

  // Results
  results: TestResult[];

  // Timing
  startTime: Date;
  endTime: Date;
  duration: number;

  // Summary
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
    successRate: number;
  };
}

// ============================================================================
// COMPREHENSIVE REPORT
// ============================================================================

export interface BotReport {
  // Report metadata
  reportId: string;
  generatedAt: Date;

  // Bot info
  botName: string;
  botVersion: string;

  // Environment
  environment: {
    baseUrl: string;
    nodeVersion: string;
    platform: string;
  };

  // Execution info
  execution: {
    mode: ExecutionMode;
    startTime: Date | string;
    endTime: Date | string;
    duration: number;
  };

  // Test results
  suites: TestSuiteResult[];

  // Overall summary
  summary: {
    totalSuites: number;
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
    successRate: number;

    // By category
    byCategory: Record<TestCategory, {
      total: number;
      passed: number;
      failed: number;
    }>;

    // By priority
    byPriority: Record<TestPriority, {
      total: number;
      passed: number;
      failed: number;
    }>;
  };

  // Critical issues
  criticalFailures: TestResult[];
  blockers: string[];
  recommendations: string[];

  // System health
  systemHealth?: {
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    lastIncident?: Date;
  };

  // File paths
  files: {
    reportPath: string;
    screenshotsDir?: string;
    tracesDir?: string;
  };
}

// ============================================================================
// MONITORING
// ============================================================================

export interface MonitoringCheck {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  expectedStatus: number;
  timeout: number;
  interval: number;
}

export interface MonitoringResult {
  checkId: string;
  timestamp: Date;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  responseTime: number;
  statusCode?: number;
  error?: string;
}

export interface HealthCheckReport {
  timestamp: Date;
  overall: 'healthy' | 'degraded' | 'down';
  checks: MonitoringResult[];
  metrics: {
    avgResponseTime: number;
    uptime: number;
    successRate: number;
  };
}

// ============================================================================
// SUITE DEFINITIONS
// ============================================================================

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  category?: TestCategory;
  priority?: TestPriority;
  enabled?: boolean;

  // Modules to run
  modules: string[]; // Module IDs

  // Execution settings
  parallel?: boolean;
  timeout?: number;
  retries?: number;
  stopOnFailure?: boolean;
  tags?: string[];

  // Lifecycle hooks
  setup?: (context: any) => Promise<void>;
  teardown?: (context: any) => Promise<void>;

  // Prerequisites
  prerequisites?: {
    serverRunning?: boolean;
    databaseSeeded?: boolean;
    environmentVariables?: string[];
  };

  // Scheduling
  schedule?: {
    enabled: boolean;
    cron?: string;
    interval?: number; // minutes
  };
}

// ============================================================================
// SELECTORS
// ============================================================================

export interface SelectorMap {
  [key: string]: string | string[];
}

export interface PageSelectors {
  // Common elements
  common: {
    header: string;
    footer: string;
    navigation: string;
    logo: string;
    loginButton: string;
    signupButton: string;
    userMenu: string;
    searchInput: string;
  };

  // Auth pages
  auth: {
    emailInput: string;
    passwordInput: string;
    firstNameInput: string;
    lastNameInput: string;
    submitButton: string;
    errorMessage: string;
    successMessage: string;
    roleSelector: string;
    agreeCheckbox: string;
  };

  // Marketplace
  marketplace: {
    productGrid: string;
    productCard: string;
    productImage: string;
    productName: string;
    productPrice: string;
    addToCartButton: string;
    searchInput: string;
    categoryFilter: string;
    sortDropdown: string;
  };

  // Cart
  cart: {
    cartIcon: string;
    cartBadge: string;
    cartItems: string;
    cartItem: string;
    removeButton: string;
    quantityInput: string;
    checkoutButton: string;
    emptyCartMessage: string;
    totalPrice: string;
  };

  // Farmer dashboard
  farmer: {
    farmNameInput: string;
    farmDescriptionInput: string;
    farmAddressInput: string;
    productNameInput: string;
    productPriceInput: string;
    productStockInput: string;
    productCategorySelect: string;
    imageUploadInput: string;
    saveButton: string;
    ordersTab: string;
    productsTab: string;
  };

  // Admin dashboard
  admin: {
    farmsTab: string;
    usersTab: string;
    ordersTab: string;
    pendingFarms: string;
    approveButton: string;
    rejectButton: string;
    userTable: string;
    orderTable: string;
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

export interface LoggerColors {
  reset: string;
  bright: string;
  dim: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  gray: string;
}

export interface AssertionResult {
  passed: boolean;
  message: string;
  expected?: any;
  actual?: any;
}

// ============================================================================
// EVENTS
// ============================================================================

export type BotEventType =
  | 'bot:started'
  | 'bot:stopped'
  | 'suite:started'
  | 'suite:completed'
  | 'test:started'
  | 'test:completed'
  | 'test:failed'
  | 'test:skipped'
  | 'report:generated'
  | 'error:critical';

export interface BotEvent {
  type: EventType;
  timestamp: Date | string;
  data: any;
}

export interface BotEventData {
  event: BotEventType;
  timestamp: Date;
  data: any;
}

export type EventHandler = (event: BotEventData) => void | Promise<void>;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface NotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  onFailureOnly: boolean;
  threshold?: number; // Minimum number of failures to trigger notification
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'console';
  config: Record<string, any>;
}

export interface NotificationPayload {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  report?: BotReport;
  timestamp: Date;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  Browser,
  BrowserContext,
  Page
} from 'playwright';
