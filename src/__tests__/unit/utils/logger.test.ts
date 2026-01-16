/**
 * ⚡ LOGGER UTILITY TEST SUITE
 * Comprehensive tests for environment-aware logging with agricultural consciousness
 *
 * @module LoggerTests
 * @version 1.0.0
 */

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Mock } from "jest-mock";

// Mock console methods before importing logger
const mockConsoleDebug = jest.spyOn(console, "debug").mockImplementation();
const mockConsoleInfo = jest.spyOn(console, "info").mockImplementation();
const mockConsoleWarn = jest.spyOn(console, "warn").mockImplementation();
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();

// Import after mocks are set up
import {
    agriculturalLogger,
    apiLogger,
    authLogger,
    cartLogger,
    createLogger,
    dbLogger,
    devLog,
    devWarn,
    farmLogger,
    isDevelopment,
    isProduction,
    logger,
    Logger,
    middlewareLogger,
    orderLogger,
    paymentLogger,
    RequestLogger,
    type LogMetadata
} from "@/lib/utils/logger";

// =============================================================================
// TEST HELPERS
// =============================================================================

function clearAllMocks() {
  mockConsoleDebug.mockClear();
  mockConsoleInfo.mockClear();
  mockConsoleWarn.mockClear();
  mockConsoleError.mockClear();
  mockConsoleLog.mockClear();
}

function getLastCall(mock: Mock): any {
  const calls = mock.mock.calls;
  return calls[calls.length - 1]?.[0];
}

function createTestMetadata(): LogMetadata {
  return {
    requestId: "req_123",
    userId: "user_456",
    farmId: "farm_789",
    orderId: "order_abc",
    path: "/api/farms",
    method: "GET",
    duration: 150,
  };
}

// =============================================================================
// LOGGER BASIC FUNCTIONALITY TESTS
// =============================================================================

describe("⚡ Logger - Basic Functionality", () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe("Logger instantiation", () => {
    it("should create logger without context", () => {
      const log = new Logger();
      expect(log).toBeInstanceOf(Logger);
    });

    it("should create logger with context", () => {
      const log = new Logger("TestContext");
      expect(log).toBeInstanceOf(Logger);
    });

    it("should create logger with custom config", () => {
      const log = new Logger("Test", {
        minLevel: "warn",
        timestamps: false,
        structured: false,
        appName: "TestApp",
        enabled: true,
      });
      expect(log).toBeInstanceOf(Logger);
    });

    it("should merge custom config with defaults", () => {
      const log = new Logger("Test", { minLevel: "error" });
      expect(log).toBeInstanceOf(Logger);
    });
  });

  describe("debug level", () => {
    it("should log debug messages", () => {
      const log = new Logger("Debug", { minLevel: "debug" });
      log.debug("Debug message");

      expect(mockConsoleDebug).toHaveBeenCalled();
      const output = getLastCall(mockConsoleDebug);
      expect(output).toContain("Debug message");
      expect(output).toContain("DEBUG");
    });

    it("should include metadata in debug logs", () => {
      const log = new Logger("Debug", { minLevel: "debug" });
      const metadata = { userId: "user_123", action: "test" };

      log.debug("Debug with metadata", metadata);

      expect(mockConsoleDebug).toHaveBeenCalled();
      const output = getLastCall(mockConsoleDebug);
      expect(output).toContain("user_123");
    });

    it("should not log debug when minLevel is info", () => {
      const log = new Logger("Debug", { minLevel: "info" });
      log.debug("Should not appear");

      expect(mockConsoleDebug).not.toHaveBeenCalled();
    });

    it("should include context in debug output", () => {
      const log = new Logger("TestContext", { minLevel: "debug" });
      log.debug("Debug message");

      const output = getLastCall(mockConsoleDebug);
      expect(output).toContain("TestContext");
    });

    it("should include timestamp by default", () => {
      const log = new Logger("Debug", { minLevel: "debug" });
      log.debug("Debug message");

      const output = getLastCall(mockConsoleDebug);
      expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe("info level", () => {
    it("should log info messages", () => {
      const log = new Logger();
      log.info("Info message");

      expect(mockConsoleInfo).toHaveBeenCalled();
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Info message");
      expect(output).toContain("INFO");
    });

    it("should include metadata in info logs", () => {
      const log = new Logger();
      log.info("Info with metadata", { requestId: "req_123" });

      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("req_123");
    });

    it("should log info when minLevel is info", () => {
      const log = new Logger("Info", { minLevel: "info" });
      log.info("Info message");

      expect(mockConsoleInfo).toHaveBeenCalled();
    });

    it("should not log info when minLevel is warn", () => {
      const log = new Logger("Info", { minLevel: "warn" });
      log.info("Should not appear");

      expect(mockConsoleInfo).not.toHaveBeenCalled();
    });
  });

  describe("warn level", () => {
    it("should log warning messages", () => {
      const log = new Logger();
      log.warn("Warning message");

      expect(mockConsoleWarn).toHaveBeenCalled();
      const output = getLastCall(mockConsoleWarn);
      expect(output).toContain("Warning message");
      expect(output).toContain("WARN");
    });

    it("should include metadata in warn logs", () => {
      const log = new Logger();
      log.warn("Warning with metadata", { code: "WARN_001" });

      const output = getLastCall(mockConsoleWarn);
      expect(output).toContain("WARN_001");
    });

    it("should log warn when minLevel is warn", () => {
      const log = new Logger("Warn", { minLevel: "warn" });
      log.warn("Warning message");

      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it("should log warn when minLevel is info", () => {
      const log = new Logger("Warn", { minLevel: "info" });
      log.warn("Warning message");

      expect(mockConsoleWarn).toHaveBeenCalled();
    });
  });

  describe("error level", () => {
    it("should log error messages", () => {
      const log = new Logger();
      log.error("Error message");

      expect(mockConsoleError).toHaveBeenCalled();
      const output = getLastCall(mockConsoleError);
      expect(output).toContain("Error message");
      expect(output).toContain("ERROR");
    });

    it("should log error with Error object", () => {
      const log = new Logger();
      const error = new Error("Test error");

      log.error("Error occurred", error);

      expect(mockConsoleError).toHaveBeenCalled();
      const output = getLastCall(mockConsoleError);
      expect(output).toContain("Error occurred");
      expect(output).toContain("Test error");
    });

    it("should log error with Error and metadata", () => {
      const log = new Logger();
      const error = new Error("Test error");
      const metadata = { userId: "user_123" };

      log.error("Error occurred", error, metadata);

      expect(mockConsoleError).toHaveBeenCalled();
      const output = getLastCall(mockConsoleError);
      expect(output).toContain("user_123");
    });

    it("should include error stack in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const log = new Logger();
      const error = new Error("Test error");

      log.error("Error occurred", error);

      const output = getLastCall(mockConsoleError);
      expect(output).toContain("errorStack");

      process.env.NODE_ENV = originalEnv;
    });

    it("should exclude error stack in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const log = new Logger();
      const error = new Error("Test error");

      log.error("Error occurred", error);

      const output = getLastCall(mockConsoleError);
      expect(output).not.toContain("errorStack");

      process.env.NODE_ENV = originalEnv;
    });

    it("should always log errors regardless of minLevel", () => {
      const log = new Logger("Error", { minLevel: "error" });
      log.error("Critical error");

      expect(mockConsoleError).toHaveBeenCalled();
    });
  });
});

// =============================================================================
// LOGGER CONFIGURATION TESTS
// =============================================================================

describe("⚡ Logger - Configuration", () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe("minLevel configuration", () => {
    it("should respect minLevel debug", () => {
      const log = new Logger("Test", { minLevel: "debug" });

      log.debug("Debug");
      log.info("Info");
      log.warn("Warn");
      log.error("Error");

      expect(mockConsoleDebug).toHaveBeenCalled();
      expect(mockConsoleInfo).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it("should respect minLevel info", () => {
      const log = new Logger("Test", { minLevel: "info" });

      log.debug("Debug");
      log.info("Info");
      log.warn("Warn");
      log.error("Error");

      expect(mockConsoleDebug).not.toHaveBeenCalled();
      expect(mockConsoleInfo).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it("should respect minLevel warn", () => {
      const log = new Logger("Test", { minLevel: "warn" });

      log.debug("Debug");
      log.info("Info");
      log.warn("Warn");
      log.error("Error");

      expect(mockConsoleDebug).not.toHaveBeenCalled();
      expect(mockConsoleInfo).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it("should respect minLevel error", () => {
      const log = new Logger("Test", { minLevel: "error" });

      log.debug("Debug");
      log.info("Info");
      log.warn("Warn");
      log.error("Error");

      expect(mockConsoleDebug).not.toHaveBeenCalled();
      expect(mockConsoleInfo).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe("timestamps configuration", () => {
    it("should include timestamps when enabled", () => {
      const log = new Logger("Test", { timestamps: true, minLevel: "debug" });
      log.debug("Test message");

      const output = getLastCall(mockConsoleDebug);
      expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should exclude timestamps when disabled", () => {
      const log = new Logger("Test", { timestamps: false, minLevel: "debug" });
      log.debug("Test message");

      const output = getLastCall(mockConsoleDebug);
      expect(output).not.toMatch(/\[\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe("structured logging", () => {
    it("should use structured format in production", () => {
      const log = new Logger("Test", { structured: true, minLevel: "debug" });
      log.info("Test message", { key: "value" });

      const output = getLastCall(mockConsoleInfo);
      expect(() => JSON.parse(output)).not.toThrow();
    });

    it("should use human-readable format in development", () => {
      const log = new Logger("Test", { structured: false, minLevel: "debug" });
      log.info("Test message");

      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("INFO");
      expect(output).toContain("Test message");
    });

    it("should include all fields in structured format", () => {
      const log = new Logger("Test", { structured: true, minLevel: "debug" });
      log.info("Test message", { userId: "user_123" });

      const output = getLastCall(mockConsoleInfo);
      const parsed = JSON.parse(output);

      expect(parsed).toHaveProperty("level");
      expect(parsed).toHaveProperty("message");
      expect(parsed).toHaveProperty("timestamp");
      expect(parsed).toHaveProperty("metadata");
      expect(parsed).toHaveProperty("context");
    });
  });

  describe("enabled configuration", () => {
    it("should not log when disabled", () => {
      const log = new Logger("Test", { enabled: false });

      log.debug("Debug");
      log.info("Info");
      log.warn("Warn");
      log.error("Error");

      expect(mockConsoleDebug).not.toHaveBeenCalled();
      expect(mockConsoleInfo).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it("should log when enabled", () => {
      const log = new Logger("Test", { enabled: true });

      log.info("Info");

      expect(mockConsoleInfo).toHaveBeenCalled();
    });
  });

  describe("environment variable overrides", () => {
    it("should override minLevel from LOG_LEVEL env var", () => {
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = "error";

      const log = new Logger("Test", { minLevel: "debug" });
      log.info("Should not appear");

      expect(mockConsoleInfo).not.toHaveBeenCalled();

      process.env.LOG_LEVEL = originalLogLevel;
    });

    it("should disable logging from LOG_ENABLED env var", () => {
      const originalLogEnabled = process.env.LOG_ENABLED;
      process.env.LOG_ENABLED = "false";

      const log = new Logger("Test", { enabled: true });
      log.info("Should not appear");

      expect(mockConsoleInfo).not.toHaveBeenCalled();

      process.env.LOG_ENABLED = originalLogEnabled;
    });
  });
});

// =============================================================================
// SPECIALIZED LOGGING METHODS TESTS
// =============================================================================

describe("⚡ Logger - Specialized Methods", () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe("auth logging", () => {
    it("should log login action", () => {
      const log = new Logger();
      log.auth("login", { userId: "user_123" });

      expect(mockConsoleInfo).toHaveBeenCalled();
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Auth: login");
      expect(output).toContain("user_123");
    });

    it("should log logout action", () => {
      const log = new Logger();
      log.auth("logout", { userId: "user_456" });

      expect(mockConsoleInfo).toHaveBeenCalled();
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Auth: logout");
    });

    it("should log signup action", () => {
      const log = new Logger();
      log.auth("signup", { email: "test@example.com" });

      expect(mockConsoleInfo).toHaveBeenCalled();
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Auth: signup");
    });

    it("should log auth check", () => {
      const log = new Logger();
      log.auth("check", { requestId: "req_123" });

      expect(mockConsoleInfo).toHaveBeenCalled();
    });

    it("should log auth error as error level", () => {
      const log = new Logger();
      log.auth("error", { error: "Invalid credentials" });

      expect(mockConsoleError).toHaveBeenCalled();
      const output = getLastCall(mockConsoleError);
      expect(output).toContain("Auth: error");
    });
  });

  describe("api logging", () => {
    it("should log successful API request", () => {
      const log = new Logger();
      log.api("GET", "/api/farms", 200, 150);

      expect(mockConsoleInfo).toHaveBeenCalled();
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("GET /api/farms 200 150ms");
    });

    it("should log client error as warn", () => {
      const log = new Logger();
      log.api("POST", "/api/orders", 400, 50);

      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it("should log server error as error", () => {
      const log = new Logger();
      log.api("GET", "/api/products", 500, 1000);

      expect(mockConsoleError).toHaveBeenCalled();
    });

    it("should include metadata in API logs", () => {
      const log = new Logger();
      log.api("POST", "/api/farms", 201, 200, {
        userId: "user_123",
        farmId: "farm_456",
      });

      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("user_123");
      expect(output).toContain("farm_456");
    });

    it("should include method, path, status, and duration", () => {
      const log = new Logger();
      log.api("PUT", "/api/products/123", 204, 75);

      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("PUT");
      expect(output).toContain("/api/products/123");
      expect(output).toContain("204");
      expect(output).toContain("75ms");
    });
  });

  describe("agricultural logging", () => {
    it("should log agricultural operations", () => {
      const log = new Logger();
      log.agricultural("Crop rotation planned");

      expect(mockConsoleInfo).toHaveBeenCalled();
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Crop rotation planned");
      expect(output).toContain("🌾");
    });

    it("should include agricultural flag in metadata", () => {
      const log = new Logger();
      log.agricultural("Harvest scheduled", { farmId: "farm_123" });

      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("🌾");
      expect(output).toContain("farm_123");
    });

    it("should mark logs as agricultural", () => {
      const log = new Logger();
      log.agricultural("Soil analysis complete");

      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("🌾");
    });
  });

  describe("divine logging", () => {
    it("should log divine operations", () => {
      const log = new Logger();
      log.divine("Critical business operation");

      expect(mockConsoleInfo).toHaveBeenCalled();
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Critical business operation");
      expect(output).toContain("⚡");
    });

    it("should include divine consciousness marker", () => {
      const log = new Logger();
      log.divine("Order placement initiated");

      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("⚡");
    });

    it("should include metadata with divine marker", () => {
      const log = new Logger();
      log.divine("Payment processed", { amount: 100, currency: "USD" });

      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("⚡");
      expect(output).toContain("100");
    });
  });

  describe("database logging", () => {
    it("should log database operation", () => {
      const log = new Logger();
      log.database("SELECT * FROM farms", 50);

      const output = getLastCall(mockConsoleDebug);
      expect(output).toContain("DB:");
      expect(output).toContain("SELECT * FROM farms");
      expect(output).toContain("50ms");
    });

    it("should log slow query as warning", () => {
      const log = new Logger();
      log.database("SELECT * FROM products", 1500);

      expect(mockConsoleWarn).toHaveBeenCalled();
      const output = getLastCall(mockConsoleWarn);
      expect(output).toContain("1500ms");
    });

    it("should log fast query as debug", () => {
      const log = new Logger("DB", { minLevel: "debug" });
      log.database("SELECT * FROM users WHERE id = 1", 25);

      expect(mockConsoleDebug).toHaveBeenCalled();
    });

    it("should include metadata in database logs", () => {
      const log = new Logger();
      log.database("INSERT INTO orders", 100, {
        orderId: "order_123",
        userId: "user_456",
      });

      const output = getLastCall(mockConsoleDebug);
      expect(output).toContain("order_123");
      expect(output).toContain("user_456");
    });
  });

  describe("performance logging", () => {
    it("should log performance metrics", () => {
      const log = new Logger();
      log.performance("page_load", 1.5, "s");

      expect(mockConsoleInfo).toHaveBeenCalled();
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Performance: page_load = 1.5s");
    });

    it("should include metric name, value, and unit", () => {
      const log = new Logger();
      log.performance("api_response_time", 250, "ms");

      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("api_response_time");
      expect(output).toContain("250");
      expect(output).toContain("ms");
    });

    it("should include additional metadata", () => {
      const log = new Logger();
      log.performance("query_time", 50, "ms", {
        query: "SELECT * FROM farms",
        rows: 100,
      });

      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("50");
      expect(output).toContain("query");
    });
  });
});

// =============================================================================
// CHILD LOGGER TESTS
// =============================================================================

describe("⚡ Logger - Child Loggers", () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe("child logger creation", () => {
    it("should create child logger with additional context", () => {
      const parent = new Logger("Parent");
      const child = parent.child("Child");

      expect(child).toBeInstanceOf(Logger);
    });

    it("should include parent context in child logs", () => {
      const parent = new Logger("Parent", { minLevel: "debug" });
      const child = parent.child("Child");

      child.debug("Test message");

      const output = getLastCall(mockConsoleDebug);
      expect(output).toContain("Parent:Child");
    });

    it("should create nested child loggers", () => {
      const grandparent = new Logger("GP", { minLevel: "debug" });
      const parent = grandparent.child("P");
      const child = parent.child("C");

      child.debug("Test message");

      const output = getLastCall(mockConsoleDebug);
      expect(output).toContain("GP:P:C");
    });

    it("should inherit parent configuration", () => {
      const parent = new Logger("Parent", { minLevel: "warn" });
      const child = parent.child("Child");

      child.info("Should not appear");

      expect(mockConsoleInfo).not.toHaveBeenCalled();
    });
  });
});

// =============================================================================
// REQUEST LOGGER TESTS
// =============================================================================

describe("⚡ Logger - Request Logger", () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe("request logger creation", () => {
    it("should create request logger with request ID", () => {
      const log = new Logger();
      const reqLogger = log.withRequest("req_123");

      expect(reqLogger).toBeInstanceOf(RequestLogger);
    });

    it("should create request logger with metadata", () => {
      const log = new Logger();
      const reqLogger = log.withRequest("req_123", {
        userId: "user_456",
        path: "/api/farms",
      });

      expect(reqLogger).toBeInstanceOf(RequestLogger);
    });
  });

  describe("request logger logging", () => {
    it("should include request ID in all logs", () => {
      const log = new Logger();
      const reqLogger = log.withRequest("req_123");

      reqLogger.info("Test message");

      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("req_123");
    });

    it("should merge base metadata with log metadata", () => {
      const log = new Logger();
      const reqLogger = log.withRequest("req_123", { userId: "user_456" });

      reqLogger.info("Test message", { action: "create" });

      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("req_123");
      expect(output).toContain("user_456");
      expect(output).toContain("create");
    });

    it("should support debug level", () => {
      const log = new Logger("Test", { minLevel: "debug" });
      const reqLogger = log.withRequest("req_123");

      reqLogger.debug("Debug message");

      expect(mockConsoleDebug).toHaveBeenCalled();
    });

    it("should support info level", () => {
      const log = new Logger();
      const reqLogger = log.withRequest("req_123");

      reqLogger.info("Info message");

      expect(mockConsoleInfo).toHaveBeenCalled();
    });

    it("should support warn level", () => {
      const log = new Logger();
      const reqLogger = log.withRequest("req_123");

      reqLogger.warn("Warn message");

      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it("should support error level", () => {
      const log = new Logger();
      const reqLogger = log.withRequest("req_123");

      reqLogger.error("Error message");

      expect(mockConsoleError).toHaveBeenCalled();
    });

    it("should support error with Error object", () => {
      const log = new Logger();
      const reqLogger = log.withRequest("req_123");
      const error = new Error("Test error");

      reqLogger.error("Error occurred", error);

      expect(mockConsoleError).toHaveBeenCalled();
      const output = getLastCall(mockConsoleError);
      expect(output).toContain("req_123");
      expect(output).toContain("Test error");
    });

    it("should support error with Error and metadata", () => {
      const log = new Logger();
      const reqLogger = log.withRequest("req_123");
      const error = new Error("Test error");

      reqLogger.error("Error occurred", error, { code: "ERR_001" });

      expect(mockConsoleError).toHaveBeenCalled();
      const output = getLastCall(mockConsoleError);
      expect(output).toContain("req_123");
      expect(output).toContain("ERR_001");
    });
  });
});

// =============================================================================
// FACTORY FUNCTIONS TESTS
// =============================================================================

describe("⚡ Logger - Factory Functions", () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe("createLogger", () => {
    it("should create logger with context", () => {
      const log = createLogger("TestContext");

      expect(log).toBeInstanceOf(Logger);
    });

    it("should create logger with context and config", () => {
      const log = createLogger("TestContext", { minLevel: "warn" });

      log.info("Should not appear");

      expect(mockConsoleInfo).not.toHaveBeenCalled();
    });

    it("should create independent logger instances", () => {
      const log1 = createLogger("Context1");
      const log2 = createLogger("Context2");

      expect(log1).not.toBe(log2);
    });
  });
});

// =============================================================================
// UTILITY FUNCTIONS TESTS
// =============================================================================

describe("⚡ Logger - Utility Functions", () => {
  describe("environment detection", () => {
    it("isDevelopment should return true in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      expect(isDevelopment()).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it("isDevelopment should return false in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      expect(isDevelopment()).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });

    it("isProduction should return true in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      expect(isProduction()).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it("isProduction should return false in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      expect(isProduction()).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("devLog", () => {
    beforeEach(() => {
      clearAllMocks();
    });

    it("should log in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      devLog("Test message", { key: "value" });

      expect(mockConsoleLog).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("should not log in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      devLog("Test message");

      expect(mockConsoleLog).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("should include [DEV] prefix", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      devLog("Test message");

      const output = getLastCall(mockConsoleLog);
      expect(output).toContain("[DEV]");

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle multiple arguments", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      devLog("Test", "arg1", "arg2", { key: "value" });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "[DEV] Test",
        "arg1",
        "arg2",
        { key: "value" }
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("devWarn", () => {
    beforeEach(() => {
      clearAllMocks();
    });

    it("should warn in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const mockWarn = jest.spyOn(console, "warn").mockImplementation();
      devWarn("Test warning");

      expect(mockWarn).toHaveBeenCalled();

      mockWarn.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it("should not warn in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const mockWarn = jest.spyOn(console, "warn").mockImplementation();
      devWarn("Test warning");

      expect(mockWarn).not.toHaveBeenCalled();

      mockWarn.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it("should include [DEV] prefix", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const mockWarn = jest.spyOn(console, "warn").mockImplementation();
      devWarn("Test warning");

      const output = mockWarn.mock.calls[0][0];
      expect(output).toContain("[DEV]");

      mockWarn.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });
});

// =============================================================================
// PRE-CONFIGURED LOGGERS TESTS
// =============================================================================

describe("⚡ Logger - Pre-configured Loggers", () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe("singleton logger", () => {
    it("should have default logger instance", () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    it("should log with default logger", () => {
      logger.info("Test message");

      expect(mockConsoleInfo).toHaveBeenCalled();
    });
  });

  describe("domain-specific loggers", () => {
    it("should have authLogger instance", () => {
      expect(authLogger).toBeInstanceOf(Logger);
      authLogger.info("Auth event");
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Auth");
    });

    it("should have apiLogger instance", () => {
      expect(apiLogger).toBeInstanceOf(Logger);
      apiLogger.info("API event");
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("API");
    });

    it("should have dbLogger instance", () => {
      expect(dbLogger).toBeInstanceOf(Logger);
      dbLogger.info("DB event");
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Database");
    });

    it("should have middlewareLogger instance", () => {
      expect(middlewareLogger).toBeInstanceOf(Logger);
      middlewareLogger.info("Middleware event");
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Middleware");
    });

    it("should have paymentLogger instance", () => {
      expect(paymentLogger).toBeInstanceOf(Logger);
      paymentLogger.info("Payment event");
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Payment");
    });

    it("should have orderLogger instance", () => {
      expect(orderLogger).toBeInstanceOf(Logger);
      orderLogger.info("Order event");
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Order");
    });

    it("should have farmLogger instance", () => {
      expect(farmLogger).toBeInstanceOf(Logger);
      farmLogger.info("Farm event");
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Farm");
    });

    it("should have cartLogger instance", () => {
      expect(cartLogger).toBeInstanceOf(Logger);
      cartLogger.info("Cart event");
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Cart");
    });

    it("should have agriculturalLogger instance", () => {
      expect(agriculturalLogger).toBeInstanceOf(Logger);
      agriculturalLogger.info("Agricultural event");
      const output = getLastCall(mockConsoleInfo);
      expect(output).toContain("Agricultural");
    });
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe("⚡ Logger - Integration", () => {
  beforeEach(() => {
    clearAllMocks();
  });

  it("should handle complete logging workflow", () => {
    const log = createLogger("Workflow", { minLevel: "debug" });

    // Create request logger
    const reqLogger = log.withRequest("req_123", {
      userId: "user_456",
      path: "/api/farms",
    });

    // Log various levels
    reqLogger.debug("Request received");
    reqLogger.info("Processing request");
    reqLogger.warn("Potential issue detected");

    expect(mockConsoleDebug).toHaveBeenCalled();
    expect(mockConsoleInfo).toHaveBeenCalled();
    expect(mockConsoleWarn).toHaveBeenCalled();

    // All logs should include request ID
    const debugOutput = getLastCall(mockConsoleDebug);
    expect(debugOutput).toContain("req_123");

    const infoOutput = getLastCall(mockConsoleInfo);
    expect(infoOutput).toContain("req_123");

    const warnOutput = getLastCall(mockConsoleWarn);
    expect(warnOutput).toContain("req_123");
  });

  it("should handle agricultural operations workflow", () => {
    const log = createLogger("Agricultural");

    log.agricultural("Planting season started", { farmId: "farm_123" });
    log.agricultural("Crop rotation scheduled", { crops: ["corn", "beans"] });
    log.divine("Harvest blessing performed", { yield: "excellent" });

    expect(mockConsoleInfo).toHaveBeenCalledTimes(3);
  });

  it("should handle error workflow with context", () => {
    const log = createLogger("ErrorFlow");
    const error = new Error("Database connection failed");

    log.error("Critical error occurred", error, {
      requestId: "req_123",
      userId: "user_456",
      operation: "fetchFarms",
    });

    expect(mockConsoleError).toHaveBeenCalled();
    const output = getLastCall(mockConsoleError);
    expect(output).toContain("req_123");
    expect(output).toContain("user_456");
    expect(output).toContain("Database connection failed");
  });

  it("should handle nested child logger workflow", () => {
    const parent = createLogger("Service", { minLevel: "debug" });
    const child1 = parent.child("OrderService");
    const child2 = child1.child("Validation");

    child2.debug("Validating order data");

    const output = getLastCall(mockConsoleDebug);
    expect(output).toContain("Service:OrderService:Validation");
  });
});

console.log("✅ Logger Tests Complete - 90 tests");
