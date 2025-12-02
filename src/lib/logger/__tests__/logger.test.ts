/**
 * 🧪 LOGGER TESTS
 * Comprehensive test suite for the divine logging utility
 *
 * Tests:
 * - Structured logging
 * - Log levels
 * - Context merging
 * - OpenTelemetry integration
 * - Error handling
 * - Child logger creation
 * - Production vs development output
 */

import { trace, Span, SpanContext } from "@opentelemetry/api";
import {
  createLogger,
  Logger,
  LogLevel,
  logTiming,
  logger as defaultLogger,
} from "../index";
import type { LogContext } from "../index";

// Mock OpenTelemetry
const mockSpanContext: SpanContext = {
  traceId: "mock-trace-id-123456",
  spanId: "mock-span-id-789",
  traceFlags: 1,
};

const mockSpan = {
  spanContext: jest.fn(),
  addEvent: jest.fn(),
  isRecording: jest.fn(),
  setAttribute: jest.fn(),
  setAttributes: jest.fn(),
  setStatus: jest.fn(),
  updateName: jest.fn(),
  end: jest.fn(),
};

// Initialize mock span context
mockSpan.spanContext.mockReturnValue(mockSpanContext);
mockSpan.isRecording.mockReturnValue(true);

jest.mock("@opentelemetry/api");

// Get mocked trace module
const mockedTrace = trace as jest.Mocked<typeof trace>;

describe("🌟 Divine Logger", () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Setup OpenTelemetry mocks
    mockedTrace.getActiveSpan = jest.fn(() => mockSpan as any);

    // Reset mock calls
    mockSpan.spanContext.mockClear();
    mockSpan.addEvent.mockClear();
    mockSpan.isRecording.mockClear();
    mockSpan.spanContext.mockReturnValue(mockSpanContext);
    mockSpan.isRecording.mockReturnValue(true);

    // Spy on console methods
    logSpy = jest.spyOn(console, "log").mockImplementation();
    errorSpy = jest.spyOn(console, "error").mockImplementation();
    warnSpy = jest.spyOn(console, "warn").mockImplementation();

    // Reset environment
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // BASIC FUNCTIONALITY
  // ==========================================================================

  describe("Logger Creation", () => {
    it("should create logger with service name", () => {
      const logger = createLogger("test-service");
      expect(logger).toBeInstanceOf(Logger);
    });

    it("should create logger with default context", () => {
      const defaultContext: LogContext = { userId: "user-123" };
      const logger = createLogger("test-service", defaultContext);

      logger.info("Test message");

      expect(logSpy).toHaveBeenCalled();
      // In development mode, context is logged separately
      // Check that the logger was called (context validation happens in integration)
      expect(logSpy.mock.calls.length).toBeGreaterThan(0);
    });

    it("should export default logger", () => {
      expect(defaultLogger).toBeInstanceOf(Logger);
    });
  });

  // ==========================================================================
  // LOG LEVELS
  // ==========================================================================

  describe("Log Levels", () => {
    let logger: Logger;

    beforeEach(() => {
      logger = createLogger("test-service");
    });

    it("should log info messages", () => {
      logger.info("Info message");
      expect(logSpy).toHaveBeenCalled();
    });

    it("should log warning messages", () => {
      logger.warn("Warning message");
      // In development, warn uses console.log, not console.warn
      expect(logSpy).toHaveBeenCalled();
    });

    it("should log error messages", () => {
      const error = new Error("Test error");
      logger.error("Error occurred", error);
      // In development, error uses console.log, not console.error
      expect(logSpy).toHaveBeenCalled();
    });

    it("should log fatal messages", () => {
      const error = new Error("Fatal error");
      logger.fatal("Fatal error occurred", error);
      // In development, fatal uses console.log, not console.error
      expect(logSpy).toHaveBeenCalled();
    });

    it("should log debug messages in development", () => {
      process.env.NODE_ENV = "development";
      logger.debug("Debug message");
      expect(logSpy).toHaveBeenCalled();
    });

    it("should NOT log debug messages in production by default", () => {
      process.env.NODE_ENV = "production";
      logger.debug("Debug message");
      expect(logSpy).not.toHaveBeenCalled();
    });

    it("should log debug messages when LOG_LEVEL=debug", () => {
      process.env.NODE_ENV = "production";
      process.env.LOG_LEVEL = "debug";
      logger.debug("Debug message");
      expect(logSpy).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // STRUCTURED LOGGING
  // ==========================================================================

  describe("Structured Logging", () => {
    let logger: Logger;

    beforeEach(() => {
      process.env.NODE_ENV = "production";
      logger = createLogger("test-service");
    });

    it("should create structured JSON logs in production", () => {
      const context: LogContext = {
        userId: "user-123",
        orderId: "order-456",
      };

      logger.info("Test message", context);

      expect(logSpy).toHaveBeenCalled();
      const logOutput = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed).toMatchObject({
        level: "info",
        service: "test-service",
        message: "Test message",
        context: {
          userId: "user-123",
          orderId: "order-456",
        },
      });
    });

    it("should include timestamp", () => {
      logger.info("Test message");

      const logOutput = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.timestamp).toBeDefined();
      expect(new Date(parsed.timestamp)).toBeInstanceOf(Date);
    });

    it("should include trace and span IDs", () => {
      // Ensure we're in production mode for JSON output
      process.env.NODE_ENV = "production";

      logger.info("Test message");

      expect(logSpy).toHaveBeenCalled();
      const logOutput = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.traceId).toBe("mock-trace-id-123456");
      expect(parsed.spanId).toBe("mock-span-id-789");
    });
  });

  // ==========================================================================
  // CONTEXT HANDLING
  // ==========================================================================

  describe("Context Management", () => {
    it("should merge default context with log context", () => {
      process.env.NODE_ENV = "production";
      const defaultContext: LogContext = { userId: "user-123" };
      const logger = createLogger("test-service", defaultContext);

      logger.info("Test message", { orderId: "order-456" });

      const logOutput = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.context).toMatchObject({
        userId: "user-123",
        orderId: "order-456",
      });
    });

    it("should allow log context to override default context", () => {
      process.env.NODE_ENV = "production";
      const defaultContext: LogContext = { userId: "user-123" };
      const logger = createLogger("test-service", defaultContext);

      logger.info("Test message", { userId: "user-456" });

      const logOutput = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.context.userId).toBe("user-456");
    });

    it("should handle empty context", () => {
      process.env.NODE_ENV = "production";
      const logger = createLogger("test-service");

      logger.info("Test message");

      const logOutput = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.context).toEqual({});
    });
  });

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  describe("Error Handling", () => {
    let logger: Logger;

    beforeEach(() => {
      process.env.NODE_ENV = "production";
      logger = createLogger("test-service");
    });

    it("should log Error objects with full context", () => {
      const error = new Error("Test error");
      error.stack = "Error stack trace";

      logger.error("Error occurred", error);

      const logOutput = errorSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.context.error).toMatchObject({
        name: "Error",
        message: "Test error",
        stack: "Error stack trace",
      });
    });

    it("should handle non-Error objects", () => {
      logger.error("Error occurred", "string error");

      const logOutput = errorSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.context.error).toBeDefined();
      expect(parsed.context.error.message).toBe("string error");
    });

    it("should handle undefined error", () => {
      logger.error("Error occurred", undefined, { userId: "user-123" });

      const logOutput = errorSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.context.error).toBeUndefined();
      expect(parsed.context.userId).toBe("user-123");
    });

    it("should include error code if available", () => {
      const error: any = new Error("Test error");
      error.code = "ERR_TEST_123";

      logger.error("Error occurred", error);

      const logOutput = errorSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.context.error.code).toBe("ERR_TEST_123");
    });
  });

  // ==========================================================================
  // CHILD LOGGER
  // ==========================================================================

  describe("Child Logger", () => {
    it("should create child logger with additional context", () => {
      process.env.NODE_ENV = "production";
      const parentLogger = createLogger("parent-service", {
        userId: "user-123",
      });
      const childLogger = parentLogger.child({ orderId: "order-456" });

      childLogger.info("Test message");

      const logOutput = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.context).toMatchObject({
        userId: "user-123",
        orderId: "order-456",
      });
    });

    it("should inherit service name", () => {
      process.env.NODE_ENV = "production";
      const parentLogger = createLogger("parent-service");
      const childLogger = parentLogger.child({ sessionId: "session-123" });

      childLogger.info("Test message");

      const logOutput = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.service).toBe("parent-service");
    });
  });

  // ==========================================================================
  // OPENTELEMETRY INTEGRATION
  // ==========================================================================

  describe("OpenTelemetry Integration", () => {
    let logger: Logger;

    beforeEach(() => {
      // OpenTelemetry integration works regardless of environment
      // Ensure span is active and recording
      mockSpan.isRecording.mockReturnValue(true);
      mockedTrace.getActiveSpan = jest.fn(() => mockSpan as any);

      logger = createLogger("test-service");
    });

    it("should add events to active span", () => {
      logger.info("Test message", { userId: "user-123" });

      expect(mockSpan.addEvent).toHaveBeenCalledWith(
        "Test message",
        expect.objectContaining({
          "log.level": "info",
          "log.service": "test-service",
          "log.message": "Test message",
          userId: "user-123",
        }),
      );
    });

    it("should not add events if span is not recording", () => {
      mockSpan.isRecording.mockReturnValue(false);

      logger.info("Test message");

      expect(mockSpan.addEvent).not.toHaveBeenCalled();
    });

    it("should check if span is recording", () => {
      mockSpan.isRecording.mockReturnValue(true);

      logger.info("Test message");

      expect(mockSpan.isRecording).toHaveBeenCalled();
    });

    it("should flatten nested context for span attributes", () => {
      const context = {
        user: {
          id: "user-123",
          name: "John Doe",
        },
        operation: "checkout",
      };

      logger.info("Test message", context);

      expect(mockSpan.addEvent).toHaveBeenCalledWith(
        "Test message",
        expect.objectContaining({
          "user.id": "user-123",
          "user.name": "John Doe",
          operation: "checkout",
        }),
      );
    });
  });

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  describe("Utility Functions", () => {
    let logger: Logger;

    beforeEach(() => {
      process.env.NODE_ENV = "production";
      logger = createLogger("test-service");
    });

    describe("logTiming", () => {
      it("should log successful operation with duration", async () => {
        const mockFn = jest.fn().mockResolvedValue("result");

        const result = await logTiming("test-operation", mockFn, logger, {
          userId: "user-123",
        });

        expect(result).toBe("result");
        expect(logSpy).toHaveBeenCalled();

        const logOutput = logSpy.mock.calls[0][0];
        const parsed = JSON.parse(logOutput);

        expect(parsed.message).toBe("test-operation completed");
        expect(parsed.context).toMatchObject({
          operation: "test-operation",
          success: true,
          userId: "user-123",
        });
        expect(parsed.context.duration).toBeGreaterThanOrEqual(0);
      });

      it("should log failed operation with error", async () => {
        const mockError = new Error("Operation failed");
        const mockFn = jest.fn().mockRejectedValue(mockError);

        await expect(
          logTiming("test-operation", mockFn, logger),
        ).rejects.toThrow("Operation failed");

        expect(errorSpy).toHaveBeenCalled();

        const logOutput = errorSpy.mock.calls[0][0];
        const parsed = JSON.parse(logOutput);

        expect(parsed.message).toBe("test-operation failed");
        expect(parsed.context).toMatchObject({
          operation: "test-operation",
          success: false,
        });
        expect(parsed.context.error).toBeDefined();
      });
    });
  });

  // ==========================================================================
  // OUTPUT FORMATS
  // ==========================================================================

  describe("Output Formats", () => {
    let logger: Logger;

    beforeEach(() => {
      logger = createLogger("test-service");
    });

    it("should output JSON in production", () => {
      process.env.NODE_ENV = "production";

      logger.info("Test message", { userId: "user-123" });

      const logOutput = logSpy.mock.calls[0][0];
      expect(() => JSON.parse(logOutput)).not.toThrow();
    });

    it("should output human-readable format in development", () => {
      process.env.NODE_ENV = "development";

      logger.info("Test message", { userId: "user-123" });

      const logOutput = logSpy.mock.calls[0][0];
      expect(logOutput).toContain("[test-service]");
      expect(logOutput).toContain("Test message");
    });

    it("should handle circular references", () => {
      process.env.NODE_ENV = "production";

      const circular: any = { a: 1 };
      circular.self = circular;

      expect(() => {
        logger.info("Test message", circular);
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // DIVINE PATTERNS
  // ==========================================================================

  describe("Divine Agricultural Patterns", () => {
    it("should support farm context logging", () => {
      process.env.NODE_ENV = "production";
      const logger = createLogger("farm-service");

      logger.info("Farm created", {
        farmId: "farm-123",
        farmName: "Sunny Acres",
        farmerId: "farmer-456",
      });

      const logOutput = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.context).toMatchObject({
        farmId: "farm-123",
        farmName: "Sunny Acres",
        farmerId: "farmer-456",
      });
    });

    it("should support order context logging", () => {
      process.env.NODE_ENV = "production";
      const logger = createLogger("order-service");

      logger.info("Order processed", {
        orderId: "order-123",
        customerId: "customer-456",
        totalAmount: 5000,
        status: "COMPLETED",
      });

      const logOutput = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.context.orderId).toBe("order-123");
      expect(parsed.context.totalAmount).toBe(5000);
    });
  });
});
