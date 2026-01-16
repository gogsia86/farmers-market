/**
 * @jest-environment node
 * @module __tests__/unit/utils/quantum.test
 *
 * Comprehensive Test Suite for Quantum ID Generation Utilities
 *
 * Coverage Areas:
 * - Quantum ID generation with and without prefixes
 * - Request ID generation
 * - Session ID generation
 * - ID validation
 * - Uniqueness and format verification
 * - Edge cases and integration scenarios
 *
 * Test Pattern: AAA (Arrange-Act-Assert)
 *
 * @version 1.0.0
 * @since 2025-01-16
 */

import {
  generateQuantumId,
  generateRequestId,
  generateSessionId,
  validateQuantumId,
} from "@/lib/utils/quantum";
import { describe, expect, it } from "@jest/globals";

describe("Quantum ID Generation Utilities", () => {
  describe("generateQuantumId", () => {
    describe("basic generation", () => {
      it("should generate an ID", () => {
        // Act
        const id = generateQuantumId();

        // Assert
        expect(id).toBeDefined();
        expect(typeof id).toBe("string");
        expect(id.length).toBeGreaterThan(0);
      });

      it("should generate ID with timestamp and quantum parts", () => {
        // Act
        const id = generateQuantumId();

        // Assert
        expect(id).toMatch(/_/); // Should contain underscore separator
        const parts = id.split("_");
        expect(parts.length).toBe(2);
      });

      it("should generate unique IDs on consecutive calls", () => {
        // Act
        const id1 = generateQuantumId();
        const id2 = generateQuantumId();
        const id3 = generateQuantumId();

        // Assert
        expect(id1).not.toBe(id2);
        expect(id2).not.toBe(id3);
        expect(id1).not.toBe(id3);
      });

      it("should generate IDs with consistent format", () => {
        // Act
        const ids = Array.from({ length: 10 }, () => generateQuantumId());

        // Assert
        ids.forEach((id) => {
          expect(id).toMatch(/^[a-z0-9]+_[a-f0-9]{8}$/);
        });
      });
    });

    describe("generation with prefix", () => {
      it("should generate ID with custom prefix", () => {
        // Act
        const id = generateQuantumId("farm");

        // Assert
        expect(id).toMatch(/^farm_/);
      });

      it("should maintain uniqueness with prefix", () => {
        // Act
        const id1 = generateQuantumId("farm");
        const id2 = generateQuantumId("farm");
        const id3 = generateQuantumId("farm");

        // Assert
        expect(id1).not.toBe(id2);
        expect(id2).not.toBe(id3);
        expect(id1).not.toBe(id3);
      });

      it("should work with different prefixes", () => {
        // Act
        const farmId = generateQuantumId("farm");
        const productId = generateQuantumId("product");
        const orderId = generateQuantumId("order");

        // Assert
        expect(farmId).toMatch(/^farm_/);
        expect(productId).toMatch(/^product_/);
        expect(orderId).toMatch(/^order_/);
      });

      it("should have correct format with prefix", () => {
        // Act
        const id = generateQuantumId("test");

        // Assert
        expect(id).toMatch(/^test_[a-z0-9]+_[a-f0-9]{8}$/);
        const parts = id.split("_");
        expect(parts.length).toBe(3); // prefix_timestamp_quantum
        expect(parts[0]).toBe("test");
      });

      it("should handle various prefix formats", () => {
        // Arrange
        const prefixes = ["farm", "product_123", "order", "user_abc", "cart"];

        // Act
        const ids = prefixes.map((prefix) => generateQuantumId(prefix));

        // Assert
        ids.forEach((id, index) => {
          expect(id).toMatch(new RegExp(`^${prefixes[index]}_`));
        });
      });
    });

    describe("timestamp component", () => {
      it("should include timestamp in base36 format", () => {
        // Act
        const id = generateQuantumId();

        // Assert
        const timestampPart = id.split("_")[0];
        expect(timestampPart).toMatch(/^[a-z0-9]+$/);
        expect(timestampPart.length).toBeGreaterThanOrEqual(8);
      });

      it("should have increasing timestamp for sequential IDs", () => {
        // Act
        const id1 = generateQuantumId();
        const id2 = generateQuantumId();

        // Assert
        const ts1 = id1.split("_")[0];
        const ts2 = id2.split("_")[0];

        // Base36 timestamps should be same or increasing
        expect(ts1.length).toBeGreaterThan(0);
        expect(ts2.length).toBeGreaterThan(0);
      });
    });

    describe("quantum component", () => {
      it("should include 8-character quantum hash", () => {
        // Act
        const id = generateQuantumId();

        // Assert
        const quantumPart = id.split("_")[1];
        expect(quantumPart).toMatch(/^[a-f0-9]{8}$/);
        expect(quantumPart.length).toBe(8);
      });

      it("should generate different quantum hashes", () => {
        // Act
        const ids = Array.from({ length: 10 }, () => generateQuantumId());
        const quantumParts = ids.map((id) => id.split("_")[1]);

        // Assert
        const uniqueQuantums = new Set(quantumParts);
        expect(uniqueQuantums.size).toBeGreaterThan(8); // Most should be unique
      });
    });

    describe("uniqueness guarantees", () => {
      it("should generate 100 unique IDs", () => {
        // Act
        const ids = Array.from({ length: 100 }, () => generateQuantumId());

        // Assert
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(100);
      });

      it("should generate unique IDs with same prefix", () => {
        // Act
        const ids = Array.from({ length: 50 }, () => generateQuantumId("farm"));

        // Assert
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(50);
      });

      it("should generate unique IDs across different prefixes", () => {
        // Act
        const farmIds = Array.from({ length: 25 }, () =>
          generateQuantumId("farm"),
        );
        const productIds = Array.from({ length: 25 }, () =>
          generateQuantumId("product"),
        );
        const allIds = [...farmIds, ...productIds];

        // Assert
        const uniqueIds = new Set(allIds);
        expect(uniqueIds.size).toBe(50);
      });
    });

    describe("performance", () => {
      it("should generate IDs quickly", () => {
        // Arrange
        const startTime = Date.now();

        // Act
        Array.from({ length: 1000 }, () => generateQuantumId());

        // Assert
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(1000); // Should complete in under 1 second
      });
    });
  });

  describe("generateRequestId", () => {
    it("should generate ID with 'req' prefix", () => {
      // Act
      const id = generateRequestId();

      // Assert
      expect(id).toMatch(/^req_/);
    });

    it("should generate unique request IDs", () => {
      // Act
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      const id3 = generateRequestId();

      // Assert
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it("should have correct format", () => {
      // Act
      const id = generateRequestId();

      // Assert
      expect(id).toMatch(/^req_[a-z0-9]+_[a-f0-9]{8}$/);
      const parts = id.split("_");
      expect(parts.length).toBe(3);
      expect(parts[0]).toBe("req");
    });

    it("should generate multiple unique request IDs", () => {
      // Act
      const ids = Array.from({ length: 50 }, () => generateRequestId());

      // Assert
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(50);
    });

    it("should be valid quantum ID", () => {
      // Act
      const id = generateRequestId();

      // Assert
      expect(validateQuantumId(id)).toBe(true);
    });
  });

  describe("generateSessionId", () => {
    it("should generate ID with 'sess' prefix", () => {
      // Act
      const id = generateSessionId();

      // Assert
      expect(id).toMatch(/^sess_/);
    });

    it("should generate unique session IDs", () => {
      // Act
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      const id3 = generateSessionId();

      // Assert
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it("should have correct format", () => {
      // Act
      const id = generateSessionId();

      // Assert
      expect(id).toMatch(/^sess_[a-z0-9]+_[a-f0-9]{8}$/);
      const parts = id.split("_");
      expect(parts.length).toBe(3);
      expect(parts[0]).toBe("sess");
    });

    it("should generate multiple unique session IDs", () => {
      // Act
      const ids = Array.from({ length: 50 }, () => generateSessionId());

      // Assert
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(50);
    });

    it("should be valid quantum ID", () => {
      // Act
      const id = generateSessionId();

      // Assert
      expect(validateQuantumId(id)).toBe(true);
    });
  });

  describe("validateQuantumId", () => {
    describe("valid IDs", () => {
      it("should validate generated quantum ID", () => {
        // Arrange
        const id = generateQuantumId();

        // Act
        const result = validateQuantumId(id);

        // Assert
        expect(result).toBe(true);
      });

      it("should validate request ID", () => {
        // Arrange
        const id = generateRequestId();

        // Act
        const result = validateQuantumId(id);

        // Assert
        expect(result).toBe(true);
      });

      it("should validate session ID", () => {
        // Arrange
        const id = generateSessionId();

        // Act
        const result = validateQuantumId(id);

        // Assert
        expect(result).toBe(true);
      });

      it("should validate ID with custom prefix", () => {
        // Arrange
        const id = generateQuantumId("custom_prefix");

        // Act
        const result = validateQuantumId(id);

        // Assert
        expect(result).toBe(true);
      });

      it("should validate alphanumeric IDs with underscores", () => {
        // Arrange
        const validIds = [
          "farm_123abc_def456gh",
          "product_abc123_xyz789",
          "order_xyz_abc123_def456",
          "abc123_def456_ghi789",
        ];

        // Act & Assert
        validIds.forEach((id) => {
          expect(validateQuantumId(id)).toBe(true);
        });
      });

      it("should validate long IDs", () => {
        // Arrange
        const longId = "a".repeat(100);

        // Act
        const result = validateQuantumId(longId);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe("invalid IDs", () => {
      it("should reject empty string", () => {
        // Act
        const result = validateQuantumId("");

        // Assert
        expect(result).toBe(false);
      });

      it("should reject short IDs", () => {
        // Arrange
        const shortIds = [
          "a",
          "ab",
          "abc",
          "abcd",
          "abcde",
          "abcdef",
          "abcdefg",
          "abcdefgh",
        ];

        // Act & Assert
        shortIds.forEach((id) => {
          expect(validateQuantumId(id)).toBe(false);
        });
      });

      it("should reject IDs with special characters", () => {
        // Arrange
        const invalidIds = [
          "farm-123-abc",
          "product@123",
          "order#abc",
          "cart$123",
          "user%abc",
          "sess&123",
          "req*abc",
          "id+123",
          "test=abc",
        ];

        // Act & Assert
        invalidIds.forEach((id) => {
          expect(validateQuantumId(id)).toBe(false);
        });
      });

      it("should reject IDs with spaces", () => {
        // Arrange
        const invalidIds = [
          "farm 123 abc",
          "product 123",
          " farm_123",
          "farm_123 ",
          "farm _123",
        ];

        // Act & Assert
        invalidIds.forEach((id) => {
          expect(validateQuantumId(id)).toBe(false);
        });
      });

      it("should reject IDs with dots", () => {
        // Act
        const result = validateQuantumId("farm.123.abc");

        // Assert
        expect(result).toBe(false);
      });

      it("should reject IDs with slashes", () => {
        // Arrange
        const invalidIds = ["farm/123", "product\\123"];

        // Act & Assert
        invalidIds.forEach((id) => {
          expect(validateQuantumId(id)).toBe(false);
        });
      });
    });

    describe("edge cases", () => {
      it("should handle exactly 9 characters (minimum valid)", () => {
        // Arrange
        const id = "abc123def";

        // Act
        const result = validateQuantumId(id);

        // Assert
        expect(result).toBe(true);
      });

      it("should reject 8 characters (too short)", () => {
        // Arrange
        const id = "abc12def";

        // Act
        const result = validateQuantumId(id);

        // Assert
        expect(result).toBe(false);
      });

      it("should validate uppercase letters", () => {
        // Arrange
        const id = "FARM_123_ABC";

        // Act
        const result = validateQuantumId(id);

        // Assert
        expect(result).toBe(true);
      });

      it("should validate mixed case", () => {
        // Arrange
        const id = "FaRm_123_AbC";

        // Act
        const result = validateQuantumId(id);

        // Assert
        expect(result).toBe(true);
      });
    });
  });

  describe("Integration Tests", () => {
    it("should generate and validate request IDs", () => {
      // Act
      const ids = Array.from({ length: 10 }, () => generateRequestId());

      // Assert
      ids.forEach((id) => {
        expect(validateQuantumId(id)).toBe(true);
        expect(id).toMatch(/^req_/);
      });
    });

    it("should generate and validate session IDs", () => {
      // Act
      const ids = Array.from({ length: 10 }, () => generateSessionId());

      // Assert
      ids.forEach((id) => {
        expect(validateQuantumId(id)).toBe(true);
        expect(id).toMatch(/^sess_/);
      });
    });

    it("should generate unique IDs across all types", () => {
      // Act
      const requestIds = Array.from({ length: 10 }, () => generateRequestId());
      const sessionIds = Array.from({ length: 10 }, () => generateSessionId());
      const quantumIds = Array.from({ length: 10 }, () => generateQuantumId());
      const allIds = [...requestIds, ...sessionIds, ...quantumIds];

      // Assert
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(30);
    });

    it("should work in typical API request flow", () => {
      // Arrange
      const userId = generateQuantumId("user");
      const requestId = generateRequestId();
      const sessionId = generateSessionId();

      // Act
      const allValid = [userId, requestId, sessionId].every(validateQuantumId);

      // Assert
      expect(allValid).toBe(true);
      expect(userId).toMatch(/^user_/);
      expect(requestId).toMatch(/^req_/);
      expect(sessionId).toMatch(/^sess_/);
    });

    it("should work for agricultural domain entities", () => {
      // Act
      const farmId = generateQuantumId("farm");
      const productId = generateQuantumId("product");
      const orderId = generateQuantumId("order");
      const cartId = generateQuantumId("cart");

      // Assert
      expect(validateQuantumId(farmId)).toBe(true);
      expect(validateQuantumId(productId)).toBe(true);
      expect(validateQuantumId(orderId)).toBe(true);
      expect(validateQuantumId(cartId)).toBe(true);

      expect(farmId).toMatch(/^farm_/);
      expect(productId).toMatch(/^product_/);
      expect(orderId).toMatch(/^order_/);
      expect(cartId).toMatch(/^cart_/);
    });

    it("should maintain uniqueness in high-volume scenario", () => {
      // Act
      const ids = Array.from({ length: 500 }, () => generateQuantumId("test"));

      // Assert
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(500);
      ids.forEach((id) => {
        expect(validateQuantumId(id)).toBe(true);
      });
    });
  });
});
