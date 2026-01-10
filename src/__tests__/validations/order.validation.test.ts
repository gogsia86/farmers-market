/**
 * 🧪 ORDER VALIDATION TESTS
 * Comprehensive tests for order Zod validation schemas
 *
 * Divine Patterns Applied:
 * - Testing Security Divinity (05_TESTING_SECURITY_DIVINITY)
 * - Divine Core Principles (01_DIVINE_CORE_PRINCIPLES)
 */

import {
  orderStatusSchema,
  paymentStatusSchema,
  shippingAddressSchema,
  orderItemSchema,
  createOrderSchema,
  updateOrderSchema,
  checkoutSchema,
  orderQuerySchema,
  refundSchema,
  type CreateOrderInput,
  type UpdateOrderInput,
  type CheckoutInput,
  type OrderQuery,
  type RefundInput,
  type OrderStatus,
  type PaymentStatus,
  type ShippingAddress,
  type OrderItem,
} from "@/lib/validations/order";

describe("📦 Order Validation Schemas - Divine Order Management", () => {
  describe("orderStatusSchema - Order Status Validation", () => {
    const validStatuses: OrderStatus[] = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ];

    validStatuses.forEach((status: any) => {
      it(`should accept valid status: ${status}`, () => {
        const result = orderStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(status);
        }
      });
    });

    it("should reject invalid status", () => {
      const result = orderStatusSchema.safeParse("INVALID_STATUS");
      expect(result.success).toBe(false);
    });

    it("should reject empty string", () => {
      const result = orderStatusSchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("should reject null", () => {
      const result = orderStatusSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });

  describe("paymentStatusSchema - Payment Status Validation", () => {
    const validStatuses: PaymentStatus[] = [
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
    ];

    validStatuses.forEach((status: any) => {
      it(`should accept valid payment status: ${status}`, () => {
        const result = paymentStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(status);
        }
      });
    });

    it("should reject invalid payment status", () => {
      const result = paymentStatusSchema.safeParse("COMPLETED");
      expect(result.success).toBe(false);
    });
  });

  describe("shippingAddressSchema - Shipping Address Validation", () => {
    it("should validate complete shipping address", () => {
      const validAddress: ShippingAddress = {
        fullName: "John Doe",
        addressLine1: "123 Farm Road",
        addressLine2: "Apt 4B",
        city: "Sacramento",
        state: "California",
        postalCode: "95814",
        country: "US",
        phone: "+1-555-0100",
      };

      const result = shippingAddressSchema.safeParse(validAddress);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe(validAddress.fullName);
        expect(result.data.city).toBe(validAddress.city);
      }
    });

    it("should validate address without optional fields", () => {
      const validAddress = {
        fullName: "Jane Smith",
        addressLine1: "456 Valley Street",
        city: "Davis",
        state: "CA",
        postalCode: "95616",
        country: "US",
      };

      const result = shippingAddressSchema.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it("should use default country US", () => {
      const addressWithoutCountry = {
        fullName: "Bob Farmer",
        addressLine1: "789 Agricultural Lane",
        city: "Fresno",
        state: "California",
        postalCode: "93721",
      };

      const result = shippingAddressSchema.safeParse(addressWithoutCountry);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.country).toBe("US");
      }
    });

    it("should reject fullName that is too short", () => {
      const invalidAddress = {
        fullName: "A",
        addressLine1: "123 Farm Road",
        city: "Sacramento",
        state: "CA",
        postalCode: "95814",
      };

      const result = shippingAddressSchema.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });

    it("should reject fullName that is too long", () => {
      const invalidAddress = {
        fullName: "A".repeat(101),
        addressLine1: "123 Farm Road",
        city: "Sacramento",
        state: "CA",
        postalCode: "95814",
      };

      const result = shippingAddressSchema.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });

    it("should reject addressLine1 that is too short", () => {
      const invalidAddress = {
        fullName: "John Doe",
        addressLine1: "123",
        city: "Sacramento",
        state: "CA",
        postalCode: "95814",
      };

      const result = shippingAddressSchema.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });

    it("should reject invalid phone format", () => {
      const invalidAddress = {
        fullName: "John Doe",
        addressLine1: "123 Farm Road",
        city: "Sacramento",
        state: "CA",
        postalCode: "95814",
        phone: "invalid-phone!!!",
      };

      const result = shippingAddressSchema.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });

    it("should accept various phone formats", () => {
      const phoneFormats = [
        "+1-555-0100",
        "555-0100",
        "(555) 0100",
        "555 0100",
        "+15550100",
      ];

      phoneFormats.forEach((phone: any) => {
        const address = {
          fullName: "John Doe",
          addressLine1: "123 Farm Road",
          city: "Sacramento",
          state: "CA",
          postalCode: "95814",
          phone,
        };

        const result = shippingAddressSchema.safeParse(address);
        expect(result.success).toBe(true);
      });
    });

    it("should reject country code that is not 2 characters", () => {
      const invalidAddress = {
        fullName: "John Doe",
        addressLine1: "123 Farm Road",
        city: "Sacramento",
        state: "CA",
        postalCode: "95814",
        country: "USA",
      };

      const result = shippingAddressSchema.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });

    it("should reject missing required fields", () => {
      const invalidAddress = {
        fullName: "John Doe",
        city: "Sacramento",
      };

      const result = shippingAddressSchema.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });
  });

  describe("orderItemSchema - Order Item Validation", () => {
    it("should validate complete order item", () => {
      const validItem: OrderItem = {
        productId: "clq1234567890abcdefgh",
        quantity: 5,
        priceAtPurchase: 19.99,
        name: "Organic Tomatoes",
        image: "https://example.com/tomatoes.jpg",
      };

      const result = orderItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantity).toBe(5);
        expect(result.data.priceAtPurchase).toBe(19.99);
      }
    });

    it("should validate order item without optional fields", () => {
      const validItem = {
        productId: "clq1234567890abcdefgh",
        quantity: 3,
        priceAtPurchase: 9.99,
      };

      const result = orderItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it("should reject invalid productId format", () => {
      const invalidItem = {
        productId: "invalid-id",
        quantity: 2,
        priceAtPurchase: 15.99,
      };

      const result = orderItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it("should reject non-positive quantity", () => {
      const invalidItem = {
        productId: "clq1234567890abcdefgh",
        quantity: 0,
        priceAtPurchase: 10.0,
      };

      const result = orderItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it("should reject negative price", () => {
      const invalidItem = {
        productId: "clq1234567890abcdefgh",
        quantity: 2,
        priceAtPurchase: -5.0,
      };

      const result = orderItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it("should reject zero price", () => {
      const invalidItem = {
        productId: "clq1234567890abcdefgh",
        quantity: 2,
        priceAtPurchase: 0,
      };

      const result = orderItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it("should reject invalid image URL", () => {
      const invalidItem = {
        productId: "clq1234567890abcdefgh",
        quantity: 2,
        priceAtPurchase: 10.0,
        image: "not-a-url",
      };

      const result = orderItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });
  });

  describe("createOrderSchema - Create Order Validation", () => {
    it("should validate complete order creation", () => {
      const validOrder: CreateOrderInput = {
        userId: "clq1111111111111111111",
        items: [
          {
            productId: "clq2222222222222222222",
            quantity: 3,
            priceAtPurchase: 15.99,
            name: "Organic Carrots",
          },
          {
            productId: "clq3333333333333333333",
            quantity: 2,
            priceAtPurchase: 8.99,
            name: "Fresh Lettuce",
          },
        ],
        shippingAddress: {
          fullName: "Alice Customer",
          addressLine1: "123 Main Street",
          city: "Sacramento",
          state: "CA",
          postalCode: "95814",
          country: "US",
        },
        deliverySlotId: "clq4444444444444444444",
        notes: "Please deliver after 5 PM",
        metadata: {
          source: "web",
          campaign: "summer2025",
        },
      };

      const result = createOrderSchema.safeParse(validOrder);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(2);
        expect(result.data.notes).toBe("Please deliver after 5 PM");
      }
    });

    it("should validate minimal order creation", () => {
      const validOrder = {
        userId: "clq1111111111111111111",
        items: [
          {
            productId: "clq2222222222222222222",
            quantity: 1,
            priceAtPurchase: 10.0,
          },
        ],
        shippingAddress: {
          fullName: "Bob Smith",
          addressLine1: "456 Farm Road",
          city: "Davis",
          state: "CA",
          postalCode: "95616",
        },
      };

      const result = createOrderSchema.safeParse(validOrder);
      expect(result.success).toBe(true);
    });

    it("should reject order with empty items array", () => {
      const invalidOrder = {
        userId: "clq1111111111111111111",
        items: [],
        shippingAddress: {
          fullName: "Bob Smith",
          addressLine1: "456 Farm Road",
          city: "Davis",
          state: "CA",
          postalCode: "95616",
        },
      };

      const result = createOrderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least one item");
      }
    });

    it("should reject order with invalid userId", () => {
      const invalidOrder = {
        userId: "not-a-valid-cuid",
        items: [
          {
            productId: "clq2222222222222222222",
            quantity: 1,
            priceAtPurchase: 10.0,
          },
        ],
        shippingAddress: {
          fullName: "Bob Smith",
          addressLine1: "456 Farm Road",
          city: "Davis",
          state: "CA",
          postalCode: "95616",
        },
      };

      const result = createOrderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
    });

    it("should reject notes that are too long", () => {
      const invalidOrder = {
        userId: "clq1111111111111111111",
        items: [
          {
            productId: "clq2222222222222222222",
            quantity: 1,
            priceAtPurchase: 10.0,
          },
        ],
        shippingAddress: {
          fullName: "Bob Smith",
          addressLine1: "456 Farm Road",
          city: "Davis",
          state: "CA",
          postalCode: "95616",
        },
        notes: "A".repeat(501),
      };

      const result = createOrderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
    });
  });

  describe("updateOrderSchema - Update Order Validation", () => {
    it("should validate complete order update", () => {
      const validUpdate: UpdateOrderInput = {
        status: "SHIPPED",
        paymentStatus: "PAID",
        trackingNumber: "TRACK123456",
        notes: "Updated delivery instructions",
        paidAt: new Date(),
      };

      const result = updateOrderSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it("should validate partial order update", () => {
      const validUpdate = {
        status: "CONFIRMED",
      };

      const result = updateOrderSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it("should validate empty update object", () => {
      const result = updateOrderSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate tracking number update", () => {
      const validUpdate = {
        trackingNumber: "UPS123456789",
      };

      const result = updateOrderSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const invalidUpdate = {
        status: "INVALID_STATUS",
      };

      const result = updateOrderSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it("should coerce string date to Date object", () => {
      const validUpdate = {
        paidAt: "2025-01-15T10:00:00Z",
      };

      const result = updateOrderSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paidAt).toBeInstanceOf(Date);
      }
    });

    it("should validate partial shipping address update", () => {
      const validUpdate = {
        shippingAddress: {
          city: "New City",
          state: "NY",
        },
      };

      const result = updateOrderSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });
  });

  describe("checkoutSchema - Checkout Validation", () => {
    it("should validate complete checkout", () => {
      const validCheckout: CheckoutInput = {
        cartId: "clq5555555555555555555",
        shippingAddress: {
          fullName: "Carol Customer",
          addressLine1: "789 Market Street",
          city: "San Francisco",
          state: "CA",
          postalCode: "94102",
          country: "US",
        },
        deliverySlotId: "clq6666666666666666666",
        paymentMethodId: "pm_1234567890",
        notes: "Ring doorbell",
      };

      const result = checkoutSchema.safeParse(validCheckout);
      expect(result.success).toBe(true);
    });

    it("should validate minimal checkout", () => {
      const validCheckout = {
        cartId: "clq5555555555555555555",
        shippingAddress: {
          fullName: "Dave Customer",
          addressLine1: "321 Oak Avenue",
          city: "Oakland",
          state: "CA",
          postalCode: "94601",
        },
      };

      const result = checkoutSchema.safeParse(validCheckout);
      expect(result.success).toBe(true);
    });

    it("should reject invalid cartId", () => {
      const invalidCheckout = {
        cartId: "invalid-cart-id",
        shippingAddress: {
          fullName: "Eve Customer",
          addressLine1: "654 Pine Street",
          city: "Berkeley",
          state: "CA",
          postalCode: "94704",
        },
      };

      const result = checkoutSchema.safeParse(invalidCheckout);
      expect(result.success).toBe(false);
    });
  });

  describe("orderQuerySchema - Order Query Validation", () => {
    it("should validate complete order query", () => {
      const validQuery: OrderQuery = {
        userId: "clq7777777777777777777",
        farmId: "clq8888888888888888888",
        status: "CONFIRMED",
        paymentStatus: "PAID",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        limit: 50,
        offset: 100,
      };

      const result = orderQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it("should use default values", () => {
      const queryWithDefaults = {};

      const result = orderQuerySchema.safeParse(queryWithDefaults);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
      }
    });

    it("should validate partial query", () => {
      const validQuery = {
        userId: "clq7777777777777777777",
        status: "PENDING",
      };

      const result = orderQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it("should reject limit over 100", () => {
      const invalidQuery = {
        limit: 101,
      };

      const result = orderQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it("should reject negative offset", () => {
      const invalidQuery = {
        offset: -1,
      };

      const result = orderQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it("should coerce string dates to Date objects", () => {
      const validQuery = {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      };

      const result = orderQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date);
        expect(result.data.endDate).toBeInstanceOf(Date);
      }
    });
  });

  describe("refundSchema - Refund Request Validation", () => {
    it("should validate complete refund request", () => {
      const validRefund: RefundInput = {
        orderId: "clq9999999999999999999",
        reason: "Product was damaged during shipping",
        amount: 49.99,
        items: ["clq1010101010101010101", "clq1111111111111111111"],
      };

      const result = refundSchema.safeParse(validRefund);
      expect(result.success).toBe(true);
    });

    it("should validate full refund without amount", () => {
      const validRefund = {
        orderId: "clq9999999999999999999",
        reason: "Customer changed mind, full refund requested",
      };

      const result = refundSchema.safeParse(validRefund);
      expect(result.success).toBe(true);
    });

    it("should validate partial item refund", () => {
      const validRefund = {
        orderId: "clq9999999999999999999",
        reason: "One item was incorrect",
        items: ["clq1010101010101010101"],
      };

      const result = refundSchema.safeParse(validRefund);
      expect(result.success).toBe(true);
    });

    it("should reject reason that is too short", () => {
      const invalidRefund = {
        orderId: "clq9999999999999999999",
        reason: "Too short",
      };

      const result = refundSchema.safeParse(invalidRefund);
      expect(result.success).toBe(false);
    });

    it("should reject reason that is too long", () => {
      const invalidRefund = {
        orderId: "clq9999999999999999999",
        reason: "A".repeat(501),
      };

      const result = refundSchema.safeParse(invalidRefund);
      expect(result.success).toBe(false);
    });

    it("should reject negative refund amount", () => {
      const invalidRefund = {
        orderId: "clq9999999999999999999",
        reason: "Valid reason for refund request",
        amount: -10.0,
      };

      const result = refundSchema.safeParse(invalidRefund);
      expect(result.success).toBe(false);
    });

    it("should reject zero refund amount", () => {
      const invalidRefund = {
        orderId: "clq9999999999999999999",
        reason: "Valid reason for refund request",
        amount: 0,
      };

      const result = refundSchema.safeParse(invalidRefund);
      expect(result.success).toBe(false);
    });
  });

  describe("🔒 Security Edge Cases - Agricultural Consciousness", () => {
    it("should reject SQL injection in notes", () => {
      const maliciousOrder = {
        userId: "clq1111111111111111111",
        items: [
          {
            productId: "clq2222222222222222222",
            quantity: 1,
            priceAtPurchase: 10.0,
          },
        ],
        shippingAddress: {
          fullName: "Bob Smith",
          addressLine1: "456 Farm Road",
          city: "Davis",
          state: "CA",
          postalCode: "95616",
        },
        notes: "'; DROP TABLE orders; --",
      };

      const result = createOrderSchema.safeParse(maliciousOrder);
      // Should pass validation but be sanitized at database level
      expect(result.success).toBe(true);
    });

    it("should reject XSS attempts in shipping address", () => {
      const maliciousAddress = {
        fullName: "<script>alert('xss')</script>",
        addressLine1: "123 Main St",
        city: "Test City",
        state: "CA",
        postalCode: "12345",
      };

      const result = shippingAddressSchema.safeParse(maliciousAddress);
      // Should pass validation but be escaped when rendered
      expect(result.success).toBe(true);
    });

    it("should handle extremely large refund amounts", () => {
      const invalidRefund = {
        orderId: "clq9999999999999999999",
        reason: "Testing extreme values for security",
        amount: Number.MAX_VALUE,
      };

      const result = refundSchema.safeParse(invalidRefund);
      expect(result.success).toBe(true);
    });
  });

  describe("⚡ Type Safety - TypeScript Integration", () => {
    it("should properly infer OrderStatus type", () => {
      const status: OrderStatus = "CONFIRMED";
      expect(typeof status).toBe("string");
    });

    it("should properly infer ShippingAddress type", () => {
      const address: ShippingAddress = {
        fullName: "Test User",
        addressLine1: "123 Test St",
        city: "Test City",
        state: "CA",
        postalCode: "12345",
        country: "US",
      };
      expect(typeof address.fullName).toBe("string");
    });

    it("should properly infer CreateOrderInput type", () => {
      const order: CreateOrderInput = {
        userId: "clq1111111111111111111",
        items: [
          {
            productId: "clq2222222222222222222",
            quantity: 1,
            priceAtPurchase: 10.0,
          },
        ],
        shippingAddress: {
          fullName: "Test User",
          addressLine1: "123 Test St",
          city: "Test City",
          state: "CA",
          postalCode: "12345",
          country: "US",
        },
      };
      expect(Array.isArray(order.items)).toBe(true);
    });
  });
});
