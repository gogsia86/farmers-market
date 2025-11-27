/**
 * 🧪 CART VALIDATION TESTS
 * Comprehensive tests for cart Zod validation schemas
 *
 * Divine Patterns Applied:
 * - Testing Security Divinity (05_TESTING_SECURITY_DIVINITY)
 * - Divine Core Principles (01_DIVINE_CORE_PRINCIPLES)
 */

import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemSchema,
  type AddToCartInput,
  type UpdateCartItemInput,
  type CartItem,
} from "@/lib/validations/cart";
import { z } from "zod";

describe("🛒 Cart Validation Schemas - Divine Shopping Cart Validation", () => {
  describe("addToCartSchema - Add Product to Cart", () => {
    it("should validate correct add to cart data", () => {
      const validData = {
        productId: "clq1234567890abcdefgh",
        quantity: 5,
      };

      const result = addToCartSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.productId).toBe(validData.productId);
        expect(result.data.quantity).toBe(validData.quantity);
      }
    });

    it("should use default quantity of 1 when not provided", () => {
      const dataWithoutQuantity = {
        productId: "clq1234567890abcdefgh",
      };

      const result = addToCartSchema.safeParse(dataWithoutQuantity);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantity).toBe(1);
      }
    });

    it("should reject invalid CUID format for productId", () => {
      const invalidData = {
        productId: "invalid-id",
        quantity: 2,
      };

      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("productId");
      }
    });

    it("should reject non-positive quantity", () => {
      const invalidData = {
        productId: "clq1234567890abcdefgh",
        quantity: 0,
      };

      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("quantity");
      }
    });

    it("should reject negative quantity", () => {
      const invalidData = {
        productId: "clq1234567890abcdefgh",
        quantity: -5,
      };

      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("quantity");
      }
    });

    it("should reject non-integer quantity", () => {
      const invalidData = {
        productId: "clq1234567890abcdefgh",
        quantity: 2.5,
      };

      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("quantity");
      }
    });

    it("should reject missing productId", () => {
      const invalidData = {
        quantity: 3,
      };

      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("productId");
      }
    });

    it("should accept maximum reasonable quantity", () => {
      const validData = {
        productId: "clq1234567890abcdefgh",
        quantity: 999999,
      };

      const result = addToCartSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject non-string productId", () => {
      const invalidData = {
        productId: 123456,
        quantity: 2,
      };

      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty productId", () => {
      const invalidData = {
        productId: "",
        quantity: 2,
      };

      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateCartItemSchema - Update Cart Item Quantity", () => {
    it("should validate correct update data", () => {
      const validData = {
        quantity: 10,
      };

      const result = updateCartItemSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantity).toBe(validData.quantity);
      }
    });

    it("should allow quantity of 0 (for removal)", () => {
      const validData = {
        quantity: 0,
      };

      const result = updateCartItemSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantity).toBe(0);
      }
    });

    it("should reject negative quantity", () => {
      const invalidData = {
        quantity: -1,
      };

      const result = updateCartItemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("quantity");
      }
    });

    it("should reject non-integer quantity", () => {
      const invalidData = {
        quantity: 3.7,
      };

      const result = updateCartItemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("quantity");
      }
    });

    it("should reject missing quantity", () => {
      const invalidData = {};

      const result = updateCartItemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject non-number quantity", () => {
      const invalidData = {
        quantity: "10",
      };

      const result = updateCartItemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept large quantity values", () => {
      const validData = {
        quantity: 100000,
      };

      const result = updateCartItemSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("cartItemSchema - Complete Cart Item", () => {
    it("should validate complete cart item with all fields", () => {
      const validData: CartItem = {
        id: "clq1111111111111111111",
        cartId: "clq2222222222222222222",
        productId: "clq3333333333333333333",
        quantity: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = cartItemSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(validData.id);
        expect(result.data.cartId).toBe(validData.cartId);
        expect(result.data.productId).toBe(validData.productId);
        expect(result.data.quantity).toBe(validData.quantity);
      }
    });

    it("should validate cart item without optional dates", () => {
      const validData = {
        id: "clq1111111111111111111",
        cartId: "clq2222222222222222222",
        productId: "clq3333333333333333333",
        quantity: 3,
      };

      const result = cartItemSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid id CUID format", () => {
      const invalidData = {
        id: "invalid-id",
        cartId: "clq2222222222222222222",
        productId: "clq3333333333333333333",
        quantity: 2,
      };

      const result = cartItemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("id");
      }
    });

    it("should reject invalid cartId CUID format", () => {
      const invalidData = {
        id: "clq1111111111111111111",
        cartId: "not-a-valid-cuid",
        productId: "clq3333333333333333333",
        quantity: 2,
      };

      const result = cartItemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("cartId");
      }
    });

    it("should reject invalid productId CUID format", () => {
      const invalidData = {
        id: "clq1111111111111111111",
        cartId: "clq2222222222222222222",
        productId: "bad-product-id",
        quantity: 2,
      };

      const result = cartItemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("productId");
      }
    });

    it("should reject non-positive quantity", () => {
      const invalidData = {
        id: "clq1111111111111111111",
        cartId: "clq2222222222222222222",
        productId: "clq3333333333333333333",
        quantity: 0,
      };

      const result = cartItemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("quantity");
      }
    });

    it("should reject missing required fields", () => {
      const invalidData = {
        id: "clq1111111111111111111",
        quantity: 5,
      };

      const result = cartItemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid date for createdAt", () => {
      const invalidData = {
        id: "clq1111111111111111111",
        cartId: "clq2222222222222222222",
        productId: "clq3333333333333333333",
        quantity: 2,
        createdAt: "not-a-date",
      };

      const result = cartItemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid date for updatedAt", () => {
      const invalidData = {
        id: "clq1111111111111111111",
        cartId: "clq2222222222222222222",
        productId: "clq3333333333333333333",
        quantity: 2,
        updatedAt: "2024-01-01", // String instead of Date object
      };

      const result = cartItemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("🔒 Security Edge Cases - Agricultural Consciousness", () => {
    it("should reject SQL injection attempts in productId", () => {
      const maliciousData = {
        productId: "clq123'; DROP TABLE products;--",
        quantity: 1,
      };

      const result = addToCartSchema.safeParse(maliciousData);
      expect(result.success).toBe(false);
    });

    it("should reject XSS attempts in productId", () => {
      const maliciousData = {
        productId: "<script>alert('xss')</script>",
        quantity: 1,
      };

      const result = addToCartSchema.safeParse(maliciousData);
      expect(result.success).toBe(false);
    });

    it("should reject extremely large quantity values", () => {
      const invalidData = {
        productId: "clq1234567890abcdefgh",
        quantity: Number.MAX_SAFE_INTEGER + 1,
      };

      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject NaN quantity", () => {
      const invalidData = {
        productId: "clq1234567890abcdefgh",
        quantity: NaN,
      };

      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject Infinity quantity", () => {
      const invalidData = {
        productId: "clq1234567890abcdefgh",
        quantity: Infinity,
      };

      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("⚡ Type Safety - TypeScript Integration", () => {
    it("should properly infer AddToCartInput type", () => {
      const data: AddToCartInput = {
        productId: "clq1234567890abcdefgh",
        quantity: 5,
      };

      expect(typeof data.productId).toBe("string");
      expect(typeof data.quantity).toBe("number");
    });

    it("should properly infer UpdateCartItemInput type", () => {
      const data: UpdateCartItemInput = {
        quantity: 10,
      };

      expect(typeof data.quantity).toBe("number");
    });

    it("should properly infer CartItem type", () => {
      const data: CartItem = {
        id: "clq1111111111111111111",
        cartId: "clq2222222222222222222",
        productId: "clq3333333333333333333",
        quantity: 5,
      };

      expect(typeof data.id).toBe("string");
      expect(typeof data.cartId).toBe("string");
      expect(typeof data.productId).toBe("string");
      expect(typeof data.quantity).toBe("number");
    });
  });

  describe("🌾 Agricultural Workflow Integration", () => {
    it("should validate typical customer cart addition", () => {
      const customerAction = {
        productId: "clq7777777777777777777",
        quantity: 3,
      };

      const result = addToCartSchema.safeParse(customerAction);
      expect(result.success).toBe(true);
    });

    it("should validate cart item update for quantity increase", () => {
      const updateAction = {
        quantity: 15,
      };

      const result = updateCartItemSchema.safeParse(updateAction);
      expect(result.success).toBe(true);
    });

    it("should validate cart item removal (quantity 0)", () => {
      const removeAction = {
        quantity: 0,
      };

      const result = updateCartItemSchema.safeParse(removeAction);
      expect(result.success).toBe(true);
    });

    it("should validate complete cart checkout item", () => {
      const checkoutItem = {
        id: "clq9999999999999999999",
        cartId: "clq8888888888888888888",
        productId: "clq7777777777777777777",
        quantity: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = cartItemSchema.safeParse(checkoutItem);
      expect(result.success).toBe(true);
    });
  });
});
