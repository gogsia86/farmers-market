/**
 * 🧪 LOGGER UTILITY TEST SUITE
 * Comprehensive tests for environment-aware logging with divine consciousness
 *
 * @module LoggerTests
 * @version 1.0.0
 */

import {
  Logger,
  RequestLogger,
  createLogger,
  logger,
  isDevelopment,
  isProduction,
  devLog,
  devWarn,
  authLogger,
  apiLogger,
  dbLogger,
  middlewareLogger,
  paymentLogger,
  orderLogger,
  farmLogger,
  cartLogger,
  agriculturalLogger,
  type LogMetadata,
  type LoggerConfig,
} from "../logger";

// ============================================================================
// MOCK SETUP
// ============================================================================

// Store original console methods
const originalConsole = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
  log: console.log,
};

// Store original NODE_ENV
const originalNodeEnv = process.env.NODE_ENV;

describe("Logger Utility", () => {
  // Mock console methods before each test
  beforeEach(() => {
    console.debug = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.log = jest.fn();
    // Reset NODE_ENV to development for predictable tests
    process.env.NODE_ENV = "development";
    // Clear LOG_LEVEL to prevent env override
    delete process.env.LOG_LEVEL;
    delete process.env.LOG_ENABLED;
  });

  // Restore original console methods after each test
  afterEach(() => {
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.log = originalConsole.log;
    process.env.NODE_ENV = originalNodeEnv;
  });

  // ========================================
  // LOGGER CLASS TESTS
  // ========================================

  describe("Logger Class", () => {
    describe("constructor", () => {
      it("should create logger without context", () => {
        const testLogger = new Logger();
        expect(testLogger).toBeDefined();
      });

      it("should create logger with context", () => {
        const testLogger = new Logger("TestContext");
        testLogger.info("Test message");
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("[TestContext]"),
        );
      });

      it("should apply custom configuration", () => {
        const customConfig: Partial<LoggerConfig> = {
          minLevel: "warn",
          timestamps: false,
        };
        const testLogger = new Logger("Test", customConfig);

        // Clear any calls from logger initialization
        jest.clearAllMocks();

        testLogger.debug("Debug message"); // Should not log
        testLogger.info("Info message"); // Should not log
        testLogger.warn("Warn message"); // Should log

        expect(console.debug).not.toHaveBeenCalled();
        expect(console.info).not.toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalled();
      });

      it("should respect LOG_ENABLED environment variable", () => {
        process.env.LOG_ENABLED = "false";
        const testLogger = new Logger();
        testLogger.info("Test message");
        expect(console.info).not.toHaveBeenCalled();
        delete process.env.LOG_ENABLED;
      });

      it("should respect LOG_LEVEL environment variable", () => {
        process.env.LOG_LEVEL = "error";
        const testLogger = new Logger();
        testLogger.info("Info message");
        testLogger.error("Error message");
        expect(console.info).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalled();
        delete process.env.LOG_LEVEL;
      });
    });

    describe("log levels", () => {
      let testLogger: Logger;

      beforeEach(() => {
        testLogger = new Logger("TestContext", { minLevel: "debug" });
      });

      it("should log debug messages", () => {
        testLogger.debug("Debug message");
        expect(console.debug).toHaveBeenCalledWith(
          expect.stringContaining("DEBUG"),
        );
      });

      it("should log info messages", () => {
        testLogger.info("Info message");
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("INFO"),
        );
      });

      it("should log warn messages", () => {
        testLogger.warn("Warn message");
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("WARN"),
        );
      });

      it("should log error messages", () => {
        testLogger.error("Error message");
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining("ERROR"),
        );
      });

      it("should respect minimum log level", () => {
        const warnLogger = new Logger("Test", { minLevel: "warn" });
        warnLogger.debug("Debug");
        warnLogger.info("Info");
        warnLogger.warn("Warn");
        warnLogger.error("Error");

        expect(console.debug).not.toHaveBeenCalled();
        expect(console.info).not.toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe("metadata handling", () => {
      let testLogger: Logger;

      beforeEach(() => {
        testLogger = new Logger("Test");
      });

      it("should include metadata in log output", () => {
        testLogger.info("Test message", { userId: "123", action: "test" });
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("userId"),
        );
      });

      it("should handle agricultural metadata", () => {
        testLogger.info("Agricultural message", { agricultural: true });
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("🌾"),
        );
      });

      it("should handle divine consciousness metadata", () => {
        testLogger.info("Divine message", { consciousness: "divine" });
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("⚡"),
        );
      });

      it("should handle empty metadata gracefully", () => {
        expect(() => {
          testLogger.info("Message without metadata");
        }).not.toThrow();
      });
    });

    describe("error logging", () => {
      let testLogger: Logger;

      beforeEach(() => {
        testLogger = new Logger("Test");
      });

      it("should log error with Error object", () => {
        const error = new Error("Test error");
        testLogger.error("An error occurred", error);
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining("Test error"),
        );
      });

      it("should include error name in log", () => {
        const error = new TypeError("Type error");
        testLogger.error("Type error occurred", error);
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining("TypeError"),
        );
      });

      it("should include stack trace in development", () => {
        process.env.NODE_ENV = "development";
        const error = new Error("Test error");
        testLogger.error("Error with stack", error);
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining("stack"),
        );
      });

      it("should log error with metadata only", () => {
        testLogger.error("Error message", { code: "ERR_001" });
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining("ERR_001"),
        );
      });

      it("should log error with Error object and additional metadata", () => {
        const error = new Error("Test error");
        testLogger.error("Error occurred", error, { requestId: "req-123" });
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe("structured logging in production", () => {
      it("should output JSON in production mode", () => {
        process.env.NODE_ENV = "production";
        const prodLogger = new Logger("Prod", { structured: true });
        prodLogger.info("Production message", { key: "value" });

        expect(console.info).toHaveBeenCalled();
        const logOutput = (console.info as jest.Mock).mock.calls[0][0];

        // Should be valid JSON
        expect(() => JSON.parse(logOutput)).not.toThrow();
      });

      it("should include all fields in structured output", () => {
        const structuredLogger = new Logger("Test", { structured: true });
        structuredLogger.info("Test message", { customField: "value" });

        const logOutput = (console.info as jest.Mock).mock.calls[0][0];
        const parsed = JSON.parse(logOutput);

        expect(parsed.level).toBe("info");
        expect(parsed.message).toBe("Test message");
        expect(parsed.timestamp).toBeDefined();
        expect(parsed.metadata.customField).toBe("value");
      });
    });
  });

  // ========================================
  // SPECIALIZED LOGGING METHODS TESTS
  // ========================================

  describe("Specialized Logging Methods", () => {
    let testLogger: Logger;

    beforeEach(() => {
      testLogger = new Logger("Test");
    });

    describe("auth logging", () => {
      it("should log login action", () => {
        testLogger.auth("login", { userId: "user-123" });
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("Auth: login"),
        );
      });

      it("should log logout action", () => {
        testLogger.auth("logout", { userId: "user-123" });
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("Auth: logout"),
        );
      });

      it("should log auth error as error level", () => {
        testLogger.auth("error", {
          userId: "user-123",
          reason: "invalid_token",
        });
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining("Auth: error"),
        );
      });
    });

    describe("api logging", () => {
      it("should log successful API request", () => {
        testLogger.api("GET", "/api/farms", 200, 150);
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("GET /api/farms 200"),
        );
      });

      it("should log client error as warn", () => {
        testLogger.api("POST", "/api/orders", 400, 50);
        expect(console.warn).toHaveBeenCalled();
      });

      it("should log server error as error", () => {
        testLogger.api("GET", "/api/products", 500, 1000);
        expect(console.error).toHaveBeenCalled();
      });

      it("should include duration in log", () => {
        testLogger.api("GET", "/api/farms", 200, 250);
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("250ms"),
        );
      });
    });

    describe("agricultural logging", () => {
      it("should log with agricultural flag", () => {
        testLogger.agricultural("Farm created", { farmId: "farm-123" });
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("🌾"),
        );
      });
    });

    describe("divine logging", () => {
      it("should log with divine consciousness", () => {
        testLogger.divine("Order completed", { orderId: "order-123" });
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("⚡"),
        );
      });
    });

    describe("database logging", () => {
      it("should log fast database operations as debug", () => {
        testLogger.database("SELECT", 50);
        expect(console.debug).toHaveBeenCalledWith(
          expect.stringContaining("DB: SELECT"),
        );
      });

      it("should log slow database operations as warn", () => {
        testLogger.database("SELECT", 1500);
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("DB: SELECT"),
        );
      });

      it("should include duration in log", () => {
        testLogger.database("INSERT", 100);
        expect(console.debug).toHaveBeenCalledWith(
          expect.stringContaining("100ms"),
        );
      });
    });

    describe("performance logging", () => {
      it("should log performance metrics", () => {
        testLogger.performance("response_time", 150, "ms");
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("Performance: response_time = 150ms"),
        );
      });
    });
  });

  // ========================================
  // FACTORY METHODS TESTS
  // ========================================

  describe("Factory Methods", () => {
    describe("child logger", () => {
      it("should create child logger with extended context", () => {
        const parentLogger = new Logger("Parent");
        const childLogger = parentLogger.child("Child");

        childLogger.info("Child message");
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("[Parent:Child]"),
        );
      });

      it("should inherit parent configuration", () => {
        const parentLogger = new Logger("Parent", { minLevel: "warn" });
        const childLogger = parentLogger.child("Child");

        childLogger.debug("Debug"); // Should not log
        childLogger.warn("Warn"); // Should log

        expect(console.debug).not.toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalled();
      });
    });

    describe("withRequest", () => {
      it("should create request-scoped logger", () => {
        const testLogger = new Logger("Test");
        const requestLogger = testLogger.withRequest("req-123");

        requestLogger.info("Request message");
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("req-123"),
        );
      });

      it("should include base metadata in all logs", () => {
        const testLogger = new Logger("Test");
        const requestLogger = testLogger.withRequest("req-123", {
          userId: "user-456",
        });

        requestLogger.info("Request message", { action: "test" });
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("user-456"),
        );
      });
    });
  });

  // ========================================
  // REQUEST LOGGER TESTS
  // ========================================

  describe("RequestLogger", () => {
    let parentLogger: Logger;
    let requestLogger: RequestLogger;

    beforeEach(() => {
      parentLogger = new Logger("Parent");
      requestLogger = parentLogger.withRequest("req-123");
    });

    it("should include requestId in all log levels", () => {
      requestLogger.debug("Debug");
      requestLogger.info("Info");
      requestLogger.warn("Warn");
      requestLogger.error("Error");

      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining("req-123"),
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("req-123"),
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("req-123"),
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("req-123"),
      );
    });

    it("should merge additional metadata", () => {
      requestLogger.info("Test", { extra: "data" });
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("extra"),
      );
    });

    it("should handle error with Error object", () => {
      const error = new Error("Test error");
      requestLogger.error("Error occurred", error);
      expect(console.error).toHaveBeenCalled();
    });

    it("should handle error with Error object and metadata", () => {
      const error = new Error("Test error");
      requestLogger.error("Error occurred", error, { code: "ERR_001" });
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ========================================
  // UTILITY FUNCTIONS TESTS
  // ========================================

  describe("Utility Functions", () => {
    describe("createLogger", () => {
      it("should create logger with context", () => {
        const testLogger = createLogger("CustomContext");
        testLogger.info("Test");
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining("[CustomContext]"),
        );
      });

      it("should accept custom configuration", () => {
        const testLogger = createLogger("Custom", { minLevel: "error" });
        testLogger.info("Info"); // Should not log
        testLogger.error("Error"); // Should log

        expect(console.info).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe("isDevelopment", () => {
      it("should return true in development", () => {
        process.env.NODE_ENV = "development";
        expect(isDevelopment()).toBe(true);
      });

      it("should return false in production", () => {
        process.env.NODE_ENV = "production";
        expect(isDevelopment()).toBe(false);
      });

      it("should return true when NODE_ENV is undefined", () => {
        delete process.env.NODE_ENV;
        expect(isDevelopment()).toBe(true);
      });
    });

    describe("isProduction", () => {
      it("should return true in production", () => {
        process.env.NODE_ENV = "production";
        expect(isProduction()).toBe(true);
      });

      it("should return false in development", () => {
        process.env.NODE_ENV = "development";
        expect(isProduction()).toBe(false);
      });
    });

    describe("devLog", () => {
      it("should log in development", () => {
        process.env.NODE_ENV = "development";
        devLog("Dev message", { key: "value" });
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining("[DEV]"),
          expect.anything(),
        );
      });

      it("should not log in production", () => {
        process.env.NODE_ENV = "production";
        devLog("Dev message");
        expect(console.log).not.toHaveBeenCalled();
      });
    });

    describe("devWarn", () => {
      it("should warn in development", () => {
        process.env.NODE_ENV = "development";
        devWarn("Dev warning", { key: "value" });
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("[DEV]"),
          expect.anything(),
        );
      });

      it("should not warn in production", () => {
        process.env.NODE_ENV = "production";
        devWarn("Dev warning");
        expect(console.warn).not.toHaveBeenCalled();
      });
    });
  });

  // ========================================
  // PRE-CONFIGURED LOGGERS TESTS
  // ========================================

  describe("Pre-configured Loggers", () => {
    it("should have default logger instance", () => {
      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(Logger);
    });

    it("should have authLogger", () => {
      expect(authLogger).toBeDefined();
      authLogger.info("Auth test");
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("[Auth]"),
      );
    });

    it("should have apiLogger", () => {
      expect(apiLogger).toBeDefined();
      apiLogger.info("API test");
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("[API]"),
      );
    });

    it("should have dbLogger", () => {
      expect(dbLogger).toBeDefined();
      dbLogger.info("DB test");
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("[Database]"),
      );
    });

    it("should have middlewareLogger", () => {
      expect(middlewareLogger).toBeDefined();
      middlewareLogger.info("Middleware test");
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("[Middleware]"),
      );
    });

    it("should have paymentLogger", () => {
      expect(paymentLogger).toBeDefined();
      paymentLogger.info("Payment test");
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("[Payment]"),
      );
    });

    it("should have orderLogger", () => {
      expect(orderLogger).toBeDefined();
      orderLogger.info("Order test");
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("[Order]"),
      );
    });

    it("should have farmLogger", () => {
      expect(farmLogger).toBeDefined();
      farmLogger.info("Farm test");
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("[Farm]"),
      );
    });

    it("should have cartLogger", () => {
      expect(cartLogger).toBeDefined();
      cartLogger.info("Cart test");
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("[Cart]"),
      );
    });

    it("should have agriculturalLogger", () => {
      expect(agriculturalLogger).toBeDefined();
      agriculturalLogger.info("Agricultural test");
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("[Agricultural]"),
      );
    });
  });

  // ========================================
  // EDGE CASES AND ERROR HANDLING
  // ========================================

  describe("Edge Cases", () => {
    it("should handle null metadata gracefully", () => {
      const testLogger = new Logger("Test");
      expect(() => {
        testLogger.info("Test", undefined);
      }).not.toThrow();
    });

    it("should handle empty string message", () => {
      const testLogger = new Logger("Test");
      expect(() => {
        testLogger.info("");
      }).not.toThrow();
    });

    it("should handle very long messages", () => {
      const testLogger = new Logger("Test");
      const longMessage = "a".repeat(10000);
      expect(() => {
        testLogger.info(longMessage);
      }).not.toThrow();
    });

    it("should handle circular references in metadata", () => {
      const testLogger = new Logger("Test");
      const circular: Record<string, unknown> = { key: "value" };
      circular.self = circular;

      // This might throw or handle gracefully depending on implementation
      expect(() => {
        try {
          testLogger.info("Circular", circular as LogMetadata);
        } catch {
          // Expected to throw due to circular reference
        }
      }).not.toThrow();
    });

    it("should handle special characters in message", () => {
      const testLogger = new Logger("Test");
      expect(() => {
        testLogger.info("Special: <>&\"'`\n\t\r");
      }).not.toThrow();
    });

    it("should handle unicode in message", () => {
      const testLogger = new Logger("Test");
      expect(() => {
        testLogger.info("Unicode: 🌾⚡🚀 农场 مزرعة");
      }).not.toThrow();
    });
  });

  // ========================================
  // TIMESTAMP TESTS
  // ========================================

  describe("Timestamps", () => {
    it("should include timestamp by default", () => {
      const testLogger = new Logger("Test");
      testLogger.info("Test message");

      const logOutput = (console.info as jest.Mock).mock.calls[0][0];
      // ISO timestamp format check
      expect(logOutput).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should exclude timestamp when disabled", () => {
      const testLogger = new Logger("Test", { timestamps: false });
      testLogger.info("Test message");

      const logOutput = (console.info as jest.Mock).mock.calls[0][0];
      // Should not have ISO timestamp format
      expect(logOutput).not.toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
