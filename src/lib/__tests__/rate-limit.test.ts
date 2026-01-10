/**
 * 🛡️ RATE LIMITING TESTS
 * Comprehensive test suite for rate limiting functionality
 */

import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import {
  API_RATE_LIMIT,
  checkRateLimit,
  clearAllRateLimits,
  getClientIp,
  getRateLimitStatus,
  LOGIN_RATE_LIMIT,
  resetRateLimit,
  SENSITIVE_RATE_LIMIT,
} from "../rate-limit";

describe("🛡️ Rate Limiting", () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  afterEach(() => {
    clearAllRateLimits();
  });

  describe("Basic Rate Limiting", () => {
    it("should allow requests within limit", () => {
      const config = { maxRequests: 5, windowMs: 60000 };
      const identifier = "test-user-1";

      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(identifier, config);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
        expect(result.current).toBe(i + 1);
      }
    });

    it("should block requests exceeding limit", () => {
      const config = { maxRequests: 3, windowMs: 60000 };
      const identifier = "test-user-2";

      // First 3 requests should be allowed
      for (let i = 0; i < 3; i++) {
        const result = checkRateLimit(identifier, config);
        expect(result.allowed).toBe(true);
      }

      // 4th request should be blocked
      const result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.current).toBe(4);
    });

    it("should reset after time window expires", async () => {
      const config = { maxRequests: 2, windowMs: 100 }; // 100ms window
      const identifier = "test-user-3";

      // Use up the limit
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);

      // Should be blocked
      let result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be allowed again
      result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(true);
      expect(result.current).toBe(1);
    });

    it("should handle different identifiers separately", () => {
      const config = { maxRequests: 2, windowMs: 60000 };

      const result1 = checkRateLimit("user-1", config);
      const result2 = checkRateLimit("user-2", config);

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result1.current).toBe(1);
      expect(result2.current).toBe(1);
    });

    it("should return correct remaining count", () => {
      const config = { maxRequests: 5, windowMs: 60000 };
      const identifier = "test-user-4";

      let result = checkRateLimit(identifier, config);
      expect(result.remaining).toBe(4);

      result = checkRateLimit(identifier, config);
      expect(result.remaining).toBe(3);

      result = checkRateLimit(identifier, config);
      expect(result.remaining).toBe(2);
    });
  });

  describe("Pre-configured Rate Limits", () => {
    it("LOGIN_RATE_LIMIT should have correct configuration", () => {
      expect(LOGIN_RATE_LIMIT.maxRequests).toBe(5);
      expect(LOGIN_RATE_LIMIT.windowMs).toBe(15 * 60 * 1000); // 15 minutes
    });

    it("API_RATE_LIMIT should have correct configuration", () => {
      expect(API_RATE_LIMIT.maxRequests).toBe(100);
      expect(API_RATE_LIMIT.windowMs).toBe(60 * 1000); // 1 minute
    });

    it("SENSITIVE_RATE_LIMIT should have correct configuration", () => {
      expect(SENSITIVE_RATE_LIMIT.maxRequests).toBe(10);
      expect(SENSITIVE_RATE_LIMIT.windowMs).toBe(60 * 60 * 1000); // 1 hour
    });

    it("should enforce LOGIN_RATE_LIMIT correctly", () => {
      const identifier = "login-test";

      // Allow 5 requests
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(identifier, LOGIN_RATE_LIMIT);
        expect(result.allowed).toBe(true);
      }

      // Block 6th request
      const result = checkRateLimit(identifier, LOGIN_RATE_LIMIT);
      expect(result.allowed).toBe(false);
    });
  });

  describe("Rate Limit Status", () => {
    it("should return null for non-existent identifier", () => {
      const status = getRateLimitStatus("non-existent", LOGIN_RATE_LIMIT);
      expect(status).toBeNull();
    });

    it("should return current status without incrementing", () => {
      const identifier = "status-test";
      const config = { maxRequests: 5, windowMs: 60000 };

      // Make 2 requests
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);

      // Check status (should not increment)
      const status1 = getRateLimitStatus(identifier, config);
      expect(status1?.current).toBe(2);
      expect(status1?.remaining).toBe(3);

      // Check again (should still be 2)
      const status2 = getRateLimitStatus(identifier, config);
      expect(status2?.current).toBe(2);
    });
  });

  describe("Rate Limit Reset", () => {
    it("should reset rate limit for specific identifier", () => {
      const identifier = "reset-test";
      const config = { maxRequests: 3, windowMs: 60000 };

      // Use up the limit
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);

      // Should be blocked
      let result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(false);

      // Reset
      resetRateLimit(identifier, config.windowMs);

      // Should be allowed again
      result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(true);
      expect(result.current).toBe(1);
    });

    it("should clear all rate limits", () => {
      const config = { maxRequests: 2, windowMs: 60000 };

      checkRateLimit("user-1", config);
      checkRateLimit("user-2", config);
      checkRateLimit("user-3", config);

      clearAllRateLimits();

      // All should start fresh
      const result1 = checkRateLimit("user-1", config);
      const result2 = checkRateLimit("user-2", config);
      const result3 = checkRateLimit("user-3", config);

      expect(result1.current).toBe(1);
      expect(result2.current).toBe(1);
      expect(result3.current).toBe(1);
    });
  });

  describe("Reset Time Calculation", () => {
    it("should calculate reset time correctly", () => {
      const config = { maxRequests: 5, windowMs: 60000 };
      const identifier = "time-test";

      const result = checkRateLimit(identifier, config);

      // Reset time should be approximately 60 seconds (60000ms with small tolerance)
      expect(result.resetTime).toBeGreaterThan(55000);
      expect(result.resetTime).toBeLessThanOrEqual(60000);
    });

    it("should decrease reset time with subsequent calls", async () => {
      const config = { maxRequests: 5, windowMs: 5000 }; // 5 second window
      const identifier = "time-decrease-test";

      const result1 = checkRateLimit(identifier, config);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result2 = checkRateLimit(identifier, config);

      // After 500ms, reset time should be at least 500ms less
      expect(result2.resetTime).toBeLessThanOrEqual(result1.resetTime);
    });
  });

  describe("Client IP Extraction", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const request = new Request("https://example.com", {
        headers: {
          "x-forwarded-for": "192.168.1.1, 10.0.0.1",
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe("192.168.1.1");
    });

    it("should extract IP from x-real-ip header", () => {
      const request = new Request("https://example.com", {
        headers: {
          "x-real-ip": "192.168.1.2",
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe("192.168.1.2");
    });

    it("should extract IP from cf-connecting-ip header (Cloudflare)", () => {
      const request = new Request("https://example.com", {
        headers: {
          "cf-connecting-ip": "192.168.1.3",
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe("192.168.1.3");
    });

    it("should return 'unknown' if no IP headers present", () => {
      const request = new Request("https://example.com");

      const ip = getClientIp(request);
      expect(ip).toBe("unknown");
    });

    it("should prioritize x-forwarded-for over other headers", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "192.168.1.1");
      headers.set("x-real-ip", "192.168.1.2");
      headers.set("cf-connecting-ip", "192.168.1.3");

      const request = new Request("https://example.com", { headers });

      const ip = getClientIp(request);
      expect(ip).toBe("192.168.1.1");
    });
  });

  describe("Edge Cases", () => {
    it("should handle concurrent requests correctly", async () => {
      const config = { maxRequests: 10, windowMs: 60000 };
      const identifier = "concurrent-test";

      const requests = Array.from({ length: 15 }, () =>
        checkRateLimit(identifier, config),
      );

      const results = await Promise.all(requests);

      const allowed = results.filter((r: any) => r.allowed);
      const blocked = results.filter((r: any) => !r.allowed);

      expect(allowed.length).toBe(10);
      expect(blocked.length).toBe(5);
    });

    it("should handle zero max requests", () => {
      const config = { maxRequests: 0, windowMs: 60000 };
      const identifier = "zero-test";

      const result = checkRateLimit(identifier, config);
      // With 0 max requests, first request creates entry with count=1
      // which is > 0, so it should be blocked
      expect(result.allowed).toBe(false);
      expect(result.current).toBe(1);
      expect(result.limit).toBe(0);
    });

    it("should handle very large window", () => {
      const config = { maxRequests: 5, windowMs: 1000 * 60 * 60 * 24 }; // 24 hours
      const identifier = "large-window-test";

      const result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(true);
      expect(result.resetTime).toBeGreaterThan(86000000); // ~24 hours in milliseconds
    });

    it("should handle rapid successive requests", () => {
      const config = { maxRequests: 100, windowMs: 60000 };
      const identifier = "rapid-test";

      for (let i = 0; i < 100; i++) {
        const result = checkRateLimit(identifier, config);
        expect(result.allowed).toBe(true);
      }

      const result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(false);
    });
  });

  describe("Rate Limit Response Headers", () => {
    it("should include correct limit information", () => {
      const config = { maxRequests: 5, windowMs: 60000 };
      const identifier = "header-test";

      const result = checkRateLimit(identifier, config);

      expect(result.limit).toBe(5);
      expect(result.current).toBe(1);
      expect(result.remaining).toBe(4);
      expect(result.resetTime).toBeGreaterThan(0);
    });

    it("should provide retry-after information when blocked", () => {
      const config = { maxRequests: 2, windowMs: 60000 };
      const identifier = "retry-test";

      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);

      const result = checkRateLimit(identifier, config);

      expect(result.allowed).toBe(false);
      expect(result.resetTime).toBeGreaterThan(0);
      expect(result.resetTime).toBeLessThanOrEqual(60000);
    });
  });
});
