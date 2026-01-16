/**
 * @jest-environment node
 * @module __tests__/unit/utils/env.test
 *
 * Comprehensive Test Suite for Environment Variable Utilities
 *
 * Coverage Areas:
 * - Basic environment variable retrieval and cleaning
 * - Required environment variable validation
 * - Redis and database configuration
 * - Environment detection (production, development, test, Vercel)
 * - Type conversions (boolean, number, array)
 * - Edge cases and error handling
 *
 * Test Pattern: AAA (Arrange-Act-Assert)
 *
 * @version 1.0.0
 * @since 2025-01-16
 */

import {
  getArrayEnvVar,
  getBooleanEnvVar,
  getCleanEnvVar,
  getDatabaseConfig,
  getEnvironment,
  getNumberEnvVar,
  getRedisConfig,
  getRequiredEnvVar,
  isDevelopment,
  isProduction,
  isTest,
  isVercel,
  validateEnvVars,
} from "@/lib/utils/env";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

describe("Environment Variable Utilities", () => {
  // Store original environment
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("getCleanEnvVar", () => {
    describe("basic retrieval", () => {
      it("should return undefined for missing variable", () => {
        // Arrange
        delete process.env.TEST_VAR;

        // Act
        const result = getCleanEnvVar("TEST_VAR");

        // Assert
        expect(result).toBeUndefined();
      });

      it("should return value for existing variable", () => {
        // Arrange
        process.env.TEST_VAR = "test-value";

        // Act
        const result = getCleanEnvVar("TEST_VAR");

        // Assert
        expect(result).toBe("test-value");
      });

      it("should return empty string as valid value", () => {
        // Arrange
        process.env.TEST_VAR = "";

        // Act
        const result = getCleanEnvVar("TEST_VAR");

        // Assert
        expect(result).toBeUndefined();
      });
    });

    describe("whitespace cleaning", () => {
      it("should trim leading whitespace", () => {
        // Arrange
        process.env.TEST_VAR = "   value";

        // Act
        const result = getCleanEnvVar("TEST_VAR");

        // Assert
        expect(result).toBe("value");
      });

      it("should trim trailing whitespace", () => {
        // Arrange
        process.env.TEST_VAR = "value   ";

        // Act
        const result = getCleanEnvVar("TEST_VAR");

        // Assert
        expect(result).toBe("value");
      });

      it("should trim both leading and trailing whitespace", () => {
        // Arrange
        process.env.TEST_VAR = "   value   ";

        // Act
        const result = getCleanEnvVar("TEST_VAR");

        // Assert
        expect(result).toBe("value");
      });

      it("should remove newlines", () => {
        // Arrange
        process.env.TEST_VAR = "value\nwith\nnewlines";

        // Act
        const result = getCleanEnvVar("TEST_VAR");

        // Assert
        expect(result).toBe("valuewithnewlines");
      });

      it("should remove carriage returns", () => {
        // Arrange
        process.env.TEST_VAR = "value\rwith\rreturns";

        // Act
        const result = getCleanEnvVar("TEST_VAR");

        // Assert
        expect(result).toBe("valuewithreturns");
      });

      it("should remove tabs", () => {
        // Arrange
        process.env.TEST_VAR = "value\twith\ttabs";

        // Act
        const result = getCleanEnvVar("TEST_VAR");

        // Assert
        expect(result).toBe("valuewithtabs");
      });

      it("should normalize multiple spaces", () => {
        // Arrange
        process.env.TEST_VAR = "value    with    spaces";

        // Act
        const result = getCleanEnvVar("TEST_VAR");

        // Assert
        expect(result).toBe("value with spaces");
      });

      it("should handle mixed whitespace characters", () => {
        // Arrange
        process.env.TEST_VAR = "  value\n\twith\r\nmixed  \t whitespace  ";

        // Act
        const result = getCleanEnvVar("TEST_VAR");

        // Assert
        expect(result).toBe("valuewithmixed whitespace");
      });
    });

    describe("URL cleaning scenarios", () => {
      it("should clean Redis URL with whitespace", () => {
        // Arrange
        process.env.REDIS_URL = "  https://redis.example.com:6379  \n";

        // Act
        const result = getCleanEnvVar("REDIS_URL");

        // Assert
        expect(result).toBe("https://redis.example.com:6379");
        expect(result).not.toContain("\n");
      });

      it("should clean database URL with trailing newline", () => {
        // Arrange
        process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db\n";

        // Act
        const result = getCleanEnvVar("DATABASE_URL");

        // Assert
        expect(result).toBe("postgresql://user:pass@localhost:5432/db");
      });

      it("should preserve URL query parameters", () => {
        // Arrange
        process.env.API_URL = "https://api.example.com/v1?key=value&foo=bar";

        // Act
        const result = getCleanEnvVar("API_URL");

        // Assert
        expect(result).toBe("https://api.example.com/v1?key=value&foo=bar");
      });
    });
  });

  describe("getRequiredEnvVar", () => {
    it("should return value for existing variable", () => {
      // Arrange
      process.env.REQUIRED_VAR = "required-value";

      // Act
      const result = getRequiredEnvVar("REQUIRED_VAR");

      // Assert
      expect(result).toBe("required-value");
    });

    it("should throw error for missing variable", () => {
      // Arrange
      delete process.env.REQUIRED_VAR;

      // Act & Assert
      expect(() => getRequiredEnvVar("REQUIRED_VAR")).toThrow(
        "Required environment variable REQUIRED_VAR is not set",
      );
    });

    it("should clean whitespace before returning", () => {
      // Arrange
      process.env.REQUIRED_VAR = "  value\n  ";

      // Act
      const result = getRequiredEnvVar("REQUIRED_VAR");

      // Assert
      expect(result).toBe("value");
    });

    it("should throw for empty string", () => {
      // Arrange
      process.env.REQUIRED_VAR = "";

      // Act & Assert
      expect(() => getRequiredEnvVar("REQUIRED_VAR")).toThrow();
    });

    it("should throw for whitespace-only value", () => {
      // Arrange
      process.env.REQUIRED_VAR = "   \n\t   ";

      // Act & Assert
      expect(() => getRequiredEnvVar("REQUIRED_VAR")).toThrow();
    });
  });

  describe("getRedisConfig", () => {
    it("should return config when both values are set", () => {
      // Arrange
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
      process.env.UPSTASH_REDIS_REST_TOKEN = "token123";

      // Act
      const result = getRedisConfig();

      // Assert
      expect(result).toEqual({
        url: "https://redis.example.com",
        token: "token123",
      });
    });

    it("should return null when URL is missing", () => {
      // Arrange
      delete process.env.UPSTASH_REDIS_REST_URL;
      process.env.UPSTASH_REDIS_REST_TOKEN = "token123";

      // Act
      const result = getRedisConfig();

      // Assert
      expect(result).toBeNull();
    });

    it("should return null when token is missing", () => {
      // Arrange
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      // Act
      const result = getRedisConfig();

      // Assert
      expect(result).toBeNull();
    });

    it("should return null when both are missing", () => {
      // Arrange
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      // Act
      const result = getRedisConfig();

      // Assert
      expect(result).toBeNull();
    });

    it("should clean whitespace from values", () => {
      // Arrange
      process.env.UPSTASH_REDIS_REST_URL = "  https://redis.example.com\n  ";
      process.env.UPSTASH_REDIS_REST_TOKEN = "  token123\t  ";

      // Act
      const result = getRedisConfig();

      // Assert
      expect(result).toEqual({
        url: "https://redis.example.com",
        token: "token123",
      });
    });
  });

  describe("getDatabaseConfig", () => {
    it("should return config when DATABASE_URL is set", () => {
      // Arrange
      process.env.DATABASE_URL = "postgresql://localhost:5432/db";

      // Act
      const result = getDatabaseConfig();

      // Assert
      expect(result).toEqual({
        url: "postgresql://localhost:5432/db",
      });
    });

    it("should throw error when DATABASE_URL is missing", () => {
      // Arrange
      delete process.env.DATABASE_URL;

      // Act & Assert
      expect(() => getDatabaseConfig()).toThrow(
        "Required environment variable DATABASE_URL is not set",
      );
    });

    it("should clean whitespace from URL", () => {
      // Arrange
      process.env.DATABASE_URL = "  postgresql://localhost:5432/db\n  ";

      // Act
      const result = getDatabaseConfig();

      // Assert
      expect(result.url).toBe("postgresql://localhost:5432/db");
    });
  });

  describe("Environment Detection", () => {
    describe("isProduction", () => {
      it("should return true when NODE_ENV is production", () => {
        // Arrange
        process.env.NODE_ENV = "production";

        // Act
        const result = isProduction();

        // Assert
        expect(result).toBe(true);
      });

      it("should return false when NODE_ENV is development", () => {
        // Arrange
        process.env.NODE_ENV = "development";

        // Act
        const result = isProduction();

        // Assert
        expect(result).toBe(false);
      });

      it("should return false when NODE_ENV is test", () => {
        // Arrange
        process.env.NODE_ENV = "test";

        // Act
        const result = isProduction();

        // Assert
        expect(result).toBe(false);
      });

      it("should return false when NODE_ENV is not set", () => {
        // Arrange
        delete process.env.NODE_ENV;

        // Act
        const result = isProduction();

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("isDevelopment", () => {
      it("should return true when NODE_ENV is development", () => {
        // Arrange
        process.env.NODE_ENV = "development";

        // Act
        const result = isDevelopment();

        // Assert
        expect(result).toBe(true);
      });

      it("should return false when NODE_ENV is production", () => {
        // Arrange
        process.env.NODE_ENV = "production";

        // Act
        const result = isDevelopment();

        // Assert
        expect(result).toBe(false);
      });

      it("should return false when NODE_ENV is test", () => {
        // Arrange
        process.env.NODE_ENV = "test";

        // Act
        const result = isDevelopment();

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("isTest", () => {
      it("should return true when NODE_ENV is test", () => {
        // Arrange
        process.env.NODE_ENV = "test";

        // Act
        const result = isTest();

        // Assert
        expect(result).toBe(true);
      });

      it("should return false when NODE_ENV is production", () => {
        // Arrange
        process.env.NODE_ENV = "production";

        // Act
        const result = isTest();

        // Assert
        expect(result).toBe(false);
      });

      it("should return false when NODE_ENV is development", () => {
        // Arrange
        process.env.NODE_ENV = "development";

        // Act
        const result = isTest();

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("isVercel", () => {
      it("should return true when VERCEL is 1", () => {
        // Arrange
        process.env.VERCEL = "1";

        // Act
        const result = isVercel();

        // Assert
        expect(result).toBe(true);
      });

      it("should return false when VERCEL is not set", () => {
        // Arrange
        delete process.env.VERCEL;

        // Act
        const result = isVercel();

        // Assert
        expect(result).toBe(false);
      });

      it("should return false when VERCEL is 0", () => {
        // Arrange
        process.env.VERCEL = "0";

        // Act
        const result = isVercel();

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("getEnvironment", () => {
      it("should return VERCEL_ENV when on Vercel", () => {
        // Arrange
        process.env.VERCEL_ENV = "preview";
        process.env.NODE_ENV = "production";

        // Act
        const result = getEnvironment();

        // Assert
        expect(result).toBe("preview");
      });

      it("should return NODE_ENV when not on Vercel", () => {
        // Arrange
        delete process.env.VERCEL_ENV;
        process.env.NODE_ENV = "development";

        // Act
        const result = getEnvironment();

        // Assert
        expect(result).toBe("development");
      });

      it("should return development as default", () => {
        // Arrange
        delete process.env.VERCEL_ENV;
        delete process.env.NODE_ENV;

        // Act
        const result = getEnvironment();

        // Assert
        expect(result).toBe("development");
      });

      it("should handle Vercel production environment", () => {
        // Arrange
        process.env.VERCEL_ENV = "production";

        // Act
        const result = getEnvironment();

        // Assert
        expect(result).toBe("production");
      });
    });
  });

  describe("validateEnvVars", () => {
    it("should return valid when all variables are present", () => {
      // Arrange
      process.env.VAR1 = "value1";
      process.env.VAR2 = "value2";
      process.env.VAR3 = "value3";

      // Act
      const result = validateEnvVars(["VAR1", "VAR2", "VAR3"]);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
      expect(result.present).toEqual(["VAR1", "VAR2", "VAR3"]);
    });

    it("should return invalid when some variables are missing", () => {
      // Arrange
      process.env.VAR1 = "value1";
      delete process.env.VAR2;
      process.env.VAR3 = "value3";

      // Act
      const result = validateEnvVars(["VAR1", "VAR2", "VAR3"]);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(["VAR2"]);
      expect(result.present).toEqual(["VAR1", "VAR3"]);
    });

    it("should return invalid when all variables are missing", () => {
      // Arrange
      delete process.env.VAR1;
      delete process.env.VAR2;
      delete process.env.VAR3;

      // Act
      const result = validateEnvVars(["VAR1", "VAR2", "VAR3"]);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(["VAR1", "VAR2", "VAR3"]);
      expect(result.present).toEqual([]);
    });

    it("should handle empty array", () => {
      // Act
      const result = validateEnvVars([]);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
      expect(result.present).toEqual([]);
    });

    it("should handle single variable", () => {
      // Arrange
      process.env.SINGLE_VAR = "value";

      // Act
      const result = validateEnvVars(["SINGLE_VAR"]);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
      expect(result.present).toEqual(["SINGLE_VAR"]);
    });

    it("should clean whitespace before validation", () => {
      // Arrange
      process.env.VAR1 = "  value  \n";
      delete process.env.VAR2;

      // Act
      const result = validateEnvVars(["VAR1", "VAR2"]);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.present).toEqual(["VAR1"]);
      expect(result.missing).toEqual(["VAR2"]);
    });
  });

  describe("getBooleanEnvVar", () => {
    describe("truthy values", () => {
      it("should return true for 'true'", () => {
        // Arrange
        process.env.BOOL_VAR = "true";

        // Act
        const result = getBooleanEnvVar("BOOL_VAR");

        // Assert
        expect(result).toBe(true);
      });

      it("should return true for '1'", () => {
        // Arrange
        process.env.BOOL_VAR = "1";

        // Act
        const result = getBooleanEnvVar("BOOL_VAR");

        // Assert
        expect(result).toBe(true);
      });

      it("should return true for 'yes'", () => {
        // Arrange
        process.env.BOOL_VAR = "yes";

        // Act
        const result = getBooleanEnvVar("BOOL_VAR");

        // Assert
        expect(result).toBe(true);
      });

      it("should return true for 'on'", () => {
        // Arrange
        process.env.BOOL_VAR = "on";

        // Act
        const result = getBooleanEnvVar("BOOL_VAR");

        // Assert
        expect(result).toBe(true);
      });

      it("should be case insensitive", () => {
        // Arrange & Act & Assert
        process.env.BOOL_VAR = "TRUE";
        expect(getBooleanEnvVar("BOOL_VAR")).toBe(true);

        process.env.BOOL_VAR = "YES";
        expect(getBooleanEnvVar("BOOL_VAR")).toBe(true);

        process.env.BOOL_VAR = "ON";
        expect(getBooleanEnvVar("BOOL_VAR")).toBe(true);
      });
    });

    describe("falsy values", () => {
      it("should return false for 'false'", () => {
        // Arrange
        process.env.BOOL_VAR = "false";

        // Act
        const result = getBooleanEnvVar("BOOL_VAR");

        // Assert
        expect(result).toBe(false);
      });

      it("should return false for '0'", () => {
        // Arrange
        process.env.BOOL_VAR = "0";

        // Act
        const result = getBooleanEnvVar("BOOL_VAR");

        // Assert
        expect(result).toBe(false);
      });

      it("should return false for 'no'", () => {
        // Arrange
        process.env.BOOL_VAR = "no";

        // Act
        const result = getBooleanEnvVar("BOOL_VAR");

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("default values", () => {
      it("should return default when variable is not set", () => {
        // Arrange
        delete process.env.BOOL_VAR;

        // Act
        const result = getBooleanEnvVar("BOOL_VAR", true);

        // Assert
        expect(result).toBe(true);
      });

      it("should return false as default when not specified", () => {
        // Arrange
        delete process.env.BOOL_VAR;

        // Act
        const result = getBooleanEnvVar("BOOL_VAR");

        // Assert
        expect(result).toBe(false);
      });
    });
  });

  describe("getNumberEnvVar", () => {
    it("should parse integer values", () => {
      // Arrange
      process.env.NUM_VAR = "42";

      // Act
      const result = getNumberEnvVar("NUM_VAR", 0);

      // Assert
      expect(result).toBe(42);
    });

    it("should parse negative numbers", () => {
      // Arrange
      process.env.NUM_VAR = "-10";

      // Act
      const result = getNumberEnvVar("NUM_VAR", 0);

      // Assert
      expect(result).toBe(-10);
    });

    it("should parse zero", () => {
      // Arrange
      process.env.NUM_VAR = "0";

      // Act
      const result = getNumberEnvVar("NUM_VAR", 100);

      // Assert
      expect(result).toBe(0);
    });

    it("should truncate decimal values", () => {
      // Arrange
      process.env.NUM_VAR = "42.7";

      // Act
      const result = getNumberEnvVar("NUM_VAR", 0);

      // Assert
      expect(result).toBe(42);
    });

    it("should return default for non-numeric values", () => {
      // Arrange
      process.env.NUM_VAR = "not-a-number";

      // Act
      const result = getNumberEnvVar("NUM_VAR", 100);

      // Assert
      expect(result).toBe(100);
    });

    it("should return default when variable is not set", () => {
      // Arrange
      delete process.env.NUM_VAR;

      // Act
      const result = getNumberEnvVar("NUM_VAR", 3000);

      // Assert
      expect(result).toBe(3000);
    });

    it("should handle large numbers", () => {
      // Arrange
      process.env.NUM_VAR = "999999";

      // Act
      const result = getNumberEnvVar("NUM_VAR", 0);

      // Assert
      expect(result).toBe(999999);
    });

    it("should clean whitespace before parsing", () => {
      // Arrange
      process.env.NUM_VAR = "  42  \n";

      // Act
      const result = getNumberEnvVar("NUM_VAR", 0);

      // Assert
      expect(result).toBe(42);
    });
  });

  describe("getArrayEnvVar", () => {
    it("should parse comma-separated values", () => {
      // Arrange
      process.env.ARRAY_VAR = "one,two,three";

      // Act
      const result = getArrayEnvVar("ARRAY_VAR");

      // Assert
      expect(result).toEqual(["one", "two", "three"]);
    });

    it("should trim whitespace from items", () => {
      // Arrange
      process.env.ARRAY_VAR = " one , two , three ";

      // Act
      const result = getArrayEnvVar("ARRAY_VAR");

      // Assert
      expect(result).toEqual(["one", "two", "three"]);
    });

    it("should handle single value", () => {
      // Arrange
      process.env.ARRAY_VAR = "single";

      // Act
      const result = getArrayEnvVar("ARRAY_VAR");

      // Assert
      expect(result).toEqual(["single"]);
    });

    it("should return default when variable is not set", () => {
      // Arrange
      delete process.env.ARRAY_VAR;

      // Act
      const result = getArrayEnvVar("ARRAY_VAR", ["default"]);

      // Assert
      expect(result).toEqual(["default"]);
    });

    it("should return empty array as default when not specified", () => {
      // Arrange
      delete process.env.ARRAY_VAR;

      // Act
      const result = getArrayEnvVar("ARRAY_VAR");

      // Assert
      expect(result).toEqual([]);
    });

    it("should filter out empty items", () => {
      // Arrange
      process.env.ARRAY_VAR = "one,,two,  ,three";

      // Act
      const result = getArrayEnvVar("ARRAY_VAR");

      // Assert
      expect(result).toEqual(["one", "two", "three"]);
    });

    it("should handle URLs in array", () => {
      // Arrange
      process.env.ARRAY_VAR = "http://localhost:3000,https://example.com";

      // Act
      const result = getArrayEnvVar("ARRAY_VAR");

      // Assert
      expect(result).toEqual(["http://localhost:3000", "https://example.com"]);
    });

    it("should handle mixed content", () => {
      // Arrange
      process.env.ARRAY_VAR = "farm_123,product_456,order_789";

      // Act
      const result = getArrayEnvVar("ARRAY_VAR");

      // Assert
      expect(result).toEqual(["farm_123", "product_456", "order_789"]);
    });

    it("should clean newlines and tabs from items", () => {
      // Arrange
      process.env.ARRAY_VAR = "one\n,\ttwo,three\r";

      // Act
      const result = getArrayEnvVar("ARRAY_VAR");

      // Assert
      expect(result).toEqual(["one", "two", "three"]);
    });
  });

  describe("Integration Tests", () => {
    it("should work with typical Redis configuration", () => {
      // Arrange
      process.env.UPSTASH_REDIS_REST_URL =
        "  https://redis.upstash.io:6379  \n";
      process.env.UPSTASH_REDIS_REST_TOKEN = "  token_abc123  \t";

      // Act
      const config = getRedisConfig();

      // Assert
      expect(config).not.toBeNull();
      expect(config?.url).toBe("https://redis.upstash.io:6379");
      expect(config?.token).toBe("token_abc123");
      expect(config?.url).not.toContain("\n");
      expect(config?.token).not.toContain("\t");
    });

    it("should work with typical database configuration", () => {
      // Arrange
      process.env.DATABASE_URL =
        "  postgresql://user:pass@db.example.com:5432/farmersmarket\n  ";

      // Act
      const config = getDatabaseConfig();

      // Assert
      expect(config.url).toBe(
        "postgresql://user:pass@db.example.com:5432/farmersmarket",
      );
    });

    it("should validate required variables for application startup", () => {
      // Arrange
      process.env.DATABASE_URL = "postgresql://localhost:5432/db";
      process.env.NEXTAUTH_SECRET = "secret123";
      delete process.env.UPSTASH_REDIS_REST_URL;

      // Act
      const result = validateEnvVars([
        "DATABASE_URL",
        "NEXTAUTH_SECRET",
        "UPSTASH_REDIS_REST_URL",
      ]);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.present).toEqual(["DATABASE_URL", "NEXTAUTH_SECRET"]);
      expect(result.missing).toEqual(["UPSTASH_REDIS_REST_URL"]);
    });

    it("should handle feature flags with boolean variables", () => {
      // Arrange
      process.env.ENABLE_CACHING = "true";
      process.env.ENABLE_LOGGING = "1";
      process.env.ENABLE_ANALYTICS = "false";

      // Act
      const caching = getBooleanEnvVar("ENABLE_CACHING", false);
      const logging = getBooleanEnvVar("ENABLE_LOGGING", false);
      const analytics = getBooleanEnvVar("ENABLE_ANALYTICS", true);

      // Assert
      expect(caching).toBe(true);
      expect(logging).toBe(true);
      expect(analytics).toBe(false);
    });

    it("should parse configuration arrays", () => {
      // Arrange
      process.env.ALLOWED_ORIGINS =
        "http://localhost:3000,https://farmersmarket.com";
      process.env.ADMIN_EMAILS = "admin@example.com, support@example.com";

      // Act
      const origins = getArrayEnvVar("ALLOWED_ORIGINS");
      const emails = getArrayEnvVar("ADMIN_EMAILS");

      // Assert
      expect(origins).toEqual([
        "http://localhost:3000",
        "https://farmersmarket.com",
      ]);
      expect(emails).toEqual(["admin@example.com", "support@example.com"]);
    });

    it("should work in different environments", () => {
      // Production
      process.env.NODE_ENV = "production";
      expect(isProduction()).toBe(true);
      expect(isDevelopment()).toBe(false);
      expect(isTest()).toBe(false);

      // Development
      process.env.NODE_ENV = "development";
      expect(isProduction()).toBe(false);
      expect(isDevelopment()).toBe(true);
      expect(isTest()).toBe(false);

      // Test
      process.env.NODE_ENV = "test";
      expect(isProduction()).toBe(false);
      expect(isDevelopment()).toBe(false);
      expect(isTest()).toBe(true);
    });
  });
});
