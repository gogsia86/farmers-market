/**
 * CART VALIDATION TESTS
 * Comprehensive test suite for cart validation schemas
 *
 * Coverage Target: 100%
 * References: 13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemSchema,
  type AddToCartInput,
  type UpdateCartItemInput,
  type CartItem,
} from "../cart";

describe("Cart Validation Schemas", () => {
  describe("addToCartSchema", () => {
    it("should validate valid cart addition", () => {
      const validData = {
        productId: "clabcdef1234567890abcdef",
        quantity: 5,
      };

      const result = addToCartSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should apply default quantity of 1", () => {
      const data = {
        productId: "clabcdef1234567890abcdef",
      };

      const result = addToCartSchema.parse(data);
      expect(result.quantity).toBe(1);
    });

    it("should validate CUID format for productId", () => {
      const validData = {
        productId: "clabcdef1234567890abcdef",
        quantity: 1,
      };

      expect(() => addToCartSchema.parse(validData)).not.toThrow();
    });

    it("should reject invalid CUID format", () => {
      const invalidData = {
        productId: "not-a-valid-cuid",
        quantity: 1,
      };

      expect(() => addToCartSchema.parse(invalidData)).toThrow();
    });

    it("should reject non-string productId", () => {
      const invalidData = {
        productId: 123,
        quantity: 1,
      };

      expect(() => addToCartSchema.parse(invalidData)).toThrow();
    });

    it("should require positive quantity", () => {
      const validData = {
        productId: "clabcdef1234567890abcdef",
        quantity: 1,
      };

      expect(() => addToCartSchema.parse(validData)).not.toThrow();
      expect(() =>
        addToCartSchema.parse({ ...validData, quantity: 100 }),
      ).not.toThrow();
    });

    it("should reject zero quantity", () => {
      const invalidData = {
        productId: "clabcdef1234567890abcdef",
        quantity: 0,
      };

      expect(() => addToCartSchema.parse(invalidData)).toThrow();
    });

    it("should reject negative quantity", () => {
      const invalidData = {
        productId: "clabcdef1234567890abcdef",
        quantity: -1,
      };

      expect(() => addToCartSchema.parse(invalidData)).toThrow();
    });

    it("should reject non-integer quantity", () => {
      const invalidData = {
        productId: "clabcdef1234567890abcdef",
        quantity: 2.5,
      };

      expect(() => addToCartSchema.parse(invalidData)).toThrow();
    });

    it("should reject missing productId", () => {
      const invalidData = {
        quantity: 1,
      };

      expect(() => addToCartSchema.parse(invalidData)).toThrow();
    });

    it("should accept various positive integer quantities", () => {
      const productId = "clabcdef1234567890abcdef";

      [1, 2, 5, 10, 50, 100, 1000].forEach((quantity) => {
        expect(() =>
          addToCartSchema.parse({ productId, quantity }),
        ).not.toThrow();
      });
    });
  });

  describe("updateCartItemSchema", () => {
    it("should validate quantity update to positive number", () => {
      const validData = { quantity: 5 };
      const result = updateCartItemSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should allow zero quantity for removal", () => {
      const validData = { quantity: 0 };
      const result = updateCartItemSchema.parse(validData);
      expect(result.quantity).toBe(0);
    });

    it("should reject negative quantity", () => {
      const invalidData = { quantity: -1 };
      expect(() => updateCartItemSchema.parse(invalidData)).toThrow();
    });

    it("should reject non-integer quantity", () => {
      const invalidData = { quantity: 3.7 };
      expect(() => updateCartItemSchema.parse(invalidData)).toThrow();
    });

    it("should require quantity field", () => {
      const invalidData = {};
      expect(() => updateCartItemSchema.parse(invalidData)).toThrow();
    });

    it("should reject non-number quantity", () => {
      const invalidData = { quantity: "5" };
      expect(() => updateCartItemSchema.parse(invalidData)).toThrow();
    });

    it("should accept boundary values", () => {
      expect(() => updateCartItemSchema.parse({ quantity: 0 })).not.toThrow();
      expect(() => updateCartItemSchema.parse({ quantity: 1 })).not.toThrow();
      expect(() =>
        updateCartItemSchema.parse({ quantity: 9999 }),
      ).not.toThrow();
    });

    it("should validate large quantities", () => {
      const validData = { quantity: 1000000 };
      expect(() => updateCartItemSchema.parse(validData)).not.toThrow();
    });
  });

  describe("cartItemSchema", () => {
    const validCartItem = {
      id: "clabcdef1234567890abcdef",
      cartId: "clabcdef1234567890abcde1",
      productId: "clabcdef1234567890abcde2",
      quantity: 3,
      createdAt: new Date("2024-01-15T10:00:00Z"),
      updatedAt: new Date("2024-01-15T11:00:00Z"),
    };

    it("should validate complete cart item", () => {
      const result = cartItemSchema.parse(validCartItem);
      expect(result.id).toBe(validCartItem.id);
      expect(result.quantity).toBe(validCartItem.quantity);
    });

    it("should validate cart item without timestamps", () => {
      const minimalItem = {
        id: "clabcdef1234567890abcdef",
        cartId: "clabcdef1234567890abcde1",
        productId: "clabcdef1234567890abcde2",
        quantity: 3,
      };

      const result = cartItemSchema.parse(minimalItem);
      expect(result.id).toBe(minimalItem.id);
      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
    });

    it("should validate all CUID fields", () => {
      expect(() => cartItemSchema.parse(validCartItem)).not.toThrow();
    });

    it("should reject invalid id CUID", () => {
      const invalidItem = {
        ...validCartItem,
        id: "not-a-cuid",
      };

      expect(() => cartItemSchema.parse(invalidItem)).toThrow();
    });

    it("should reject invalid cartId CUID", () => {
      const invalidItem = {
        ...validCartItem,
        cartId: "invalid-cart-id",
      };

      expect(() => cartItemSchema.parse(invalidItem)).toThrow();
    });

    it("should reject invalid productId CUID", () => {
      const invalidItem = {
        ...validCartItem,
        productId: "123-not-valid",
      };

      expect(() => cartItemSchema.parse(invalidItem)).toThrow();
    });

    it("should require positive quantity", () => {
      const invalidItem = {
        ...validCartItem,
        quantity: 0,
      };

      expect(() => cartItemSchema.parse(invalidItem)).toThrow();
    });

    it("should reject negative quantity", () => {
      const invalidItem = {
        ...validCartItem,
        quantity: -5,
      };

      expect(() => cartItemSchema.parse(invalidItem)).toThrow();
    });

    it("should reject non-integer quantity", () => {
      const invalidItem = {
        ...validCartItem,
        quantity: 2.5,
      };

      expect(() => cartItemSchema.parse(invalidItem)).toThrow();
    });

    it("should validate date types for timestamps", () => {
      const itemWithDates = {
        ...validCartItem,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => cartItemSchema.parse(itemWithDates)).not.toThrow();
    });

    it("should reject invalid date types", () => {
      const invalidItem = {
        ...validCartItem,
        createdAt: "2024-01-15",
      };

      expect(() => cartItemSchema.parse(invalidItem)).toThrow();
    });

    it("should require all required fields", () => {
      const fields = ["id", "cartId", "productId", "quantity"];

      fields.forEach((field) => {
        const incompleteItem = { ...validCartItem };
        delete (incompleteItem as any)[field];

        expect(() => cartItemSchema.parse(incompleteItem)).toThrow();
      });
    });

    it("should handle undefined optional fields", () => {
      const itemWithUndefined = {
        ...validCartItem,
        createdAt: undefined,
        updatedAt: undefined,
      };

      const result = cartItemSchema.parse(itemWithUndefined);
      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
    });

    it("should validate with only createdAt", () => {
      const item = {
        id: "clabcdef1234567890abcdef",
        cartId: "clabcdef1234567890abcde1",
        productId: "clabcdef1234567890abcde2",
        quantity: 1,
        createdAt: new Date(),
      };

      expect(() => cartItemSchema.parse(item)).not.toThrow();
    });

    it("should validate with only updatedAt", () => {
      const item = {
        id: "clabcdef1234567890abcdef",
        cartId: "clabcdef1234567890abcde1",
        productId: "clabcdef1234567890abcde2",
        quantity: 1,
        updatedAt: new Date(),
      };

      expect(() => cartItemSchema.parse(item)).not.toThrow();
    });
  });

  describe("Type Exports", () => {
    it("should export AddToCartInput type", () => {
      const input: AddToCartInput = {
        productId: "clabcdef1234567890abcdef",
        quantity: 1,
      };

      expect(input.productId).toBe("clabcdef1234567890abcdef");
      expect(input.quantity).toBe(1);
    });

    it("should export UpdateCartItemInput type", () => {
      const input: UpdateCartItemInput = {
        quantity: 5,
      };

      expect(input.quantity).toBe(5);
    });

    it("should export CartItem type", () => {
      const item: CartItem = {
        id: "clabcdef1234567890abcdef",
        cartId: "clabcdef1234567890abcde1",
        productId: "clabcdef1234567890abcde2",
        quantity: 2,
      };

      expect(item.id).toBe("clabcdef1234567890abcdef");
      expect(item.quantity).toBe(2);
    });
  });
});
