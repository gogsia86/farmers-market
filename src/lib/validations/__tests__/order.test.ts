/**
 * ⚡ ORDER VALIDATION TEST SUITE
 * Comprehensive tests for order validation schemas with divine consciousness
 * Target: 100% coverage
 */

import { describe, it, expect } from "@jest/globals";
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
} from "../order";

describe("⚡ Order Validation Schemas - Divine Test Suite", () => {
  describe("Order Status Schema", () => {
    it("accepts all valid order statuses", () => {
      const validStatuses = [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
      ];

      validStatuses.forEach((status) => {
        const result = orderStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(status);
        }
      });
    });

    it("rejects invalid status values", () => {
      const invalidStatuses = [
        "INVALID",
        "pending",
        "Confirmed",
        "",
        null,
        undefined,
        123,
      ];

      invalidStatuses.forEach((status) => {
        const result = orderStatusSchema.safeParse(status);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Payment Status Schema", () => {
    it("accepts all valid payment statuses", () => {
      const validStatuses = [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
      ];

      validStatuses.forEach((status) => {
        const result = paymentStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(status);
        }
      });
    });

    it("rejects invalid payment status values", () => {
      const invalidStatuses = [
        "INVALID",
        "paid",
        "Failed",
        "",
        null,
        undefined,
        456,
      ];

      invalidStatuses.forEach((status) => {
        const result = paymentStatusSchema.safeParse(status);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Shipping Address Schema", () => {
    const validAddress = {
      fullName: "John Doe",
      addressLine1: "123 Farm Road",
      city: "Portland",
      state: "Oregon",
      postalCode: "97201",
      country: "US",
    };

    it("accepts valid complete shipping address", () => {
      const result = shippingAddressSchema.safeParse(validAddress);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe("John Doe");
        expect(result.data.country).toBe("US");
      }
    });

    it("defaults country to US when not provided", () => {
      const address = { ...validAddress };
      delete (address as any).country;

      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.country).toBe("US");
      }
    });

    it("accepts valid address with optional fields", () => {
      const address = {
        ...validAddress,
        addressLine2: "Apt 4B",
        phone: "+1 (503) 555-0123",
      };

      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.addressLine2).toBe("Apt 4B");
        expect(result.data.phone).toBe("+1 (503) 555-0123");
      }
    });

    it("accepts various valid phone formats", () => {
      const phoneFormats = [
        "+1-503-555-0123",
        "(503) 555-0123",
        "503 555 0123",
        "5035550123",
        "+15035550123",
      ];

      phoneFormats.forEach((phone) => {
        const address = { ...validAddress, phone };
        const result = shippingAddressSchema.safeParse(address);
        expect(result.success).toBe(true);
      });
    });

    it("rejects fullName too short", () => {
      const address = { ...validAddress, fullName: "J" };
      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });

    it("rejects fullName too long", () => {
      const address = { ...validAddress, fullName: "x".repeat(101) };
      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });

    it("rejects addressLine1 too short", () => {
      const address = { ...validAddress, addressLine1: "123" };
      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });

    it("rejects addressLine1 too long", () => {
      const address = { ...validAddress, addressLine1: "x".repeat(201) };
      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });

    it("rejects addressLine2 too long", () => {
      const address = { ...validAddress, addressLine2: "x".repeat(201) };
      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });

    it("rejects city too short", () => {
      const address = { ...validAddress, city: "P" };
      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });

    it("rejects city too long", () => {
      const address = { ...validAddress, city: "x".repeat(101) };
      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });

    it("rejects state too short", () => {
      const address = { ...validAddress, state: "O" };
      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });

    it("rejects state too long", () => {
      const address = { ...validAddress, state: "x".repeat(51) };
      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });

    it("rejects postalCode too short", () => {
      const address = { ...validAddress, postalCode: "9720" };
      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });

    it("rejects postalCode too long", () => {
      const address = { ...validAddress, postalCode: "97201-12345" };
      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });

    it("rejects country code not exactly 2 characters", () => {
      const address = { ...validAddress, country: "USA" };
      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });

    it("rejects invalid phone format", () => {
      const address = { ...validAddress, phone: "invalid-phone!" };
      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });

    it("rejects missing required fields", () => {
      const address = { fullName: "John Doe" };
      const result = shippingAddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });
  });

  describe("Order Item Schema", () => {
    const validItem = {
      productId: "clxyz123abc456",
      quantity: 2,
      priceAtPurchase: 9.99,
    };

    it("accepts valid order item with required fields", () => {
      const result = orderItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.productId).toBe("clxyz123abc456");
        expect(result.data.quantity).toBe(2);
        expect(result.data.priceAtPurchase).toBe(9.99);
      }
    });

    it("accepts valid order item with optional fields", () => {
      const item = {
        ...validItem,
        name: "Organic Tomatoes",
        image: "https://example.com/tomato.jpg",
      };

      const result = orderItemSchema.safeParse(item);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Organic Tomatoes");
        expect(result.data.image).toBe("https://example.com/tomato.jpg");
      }
    });

    it("rejects invalid productId format", () => {
      const item = { ...validItem, productId: "invalid-id" };
      const result = orderItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it("rejects zero quantity", () => {
      const item = { ...validItem, quantity: 0 };
      const result = orderItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it("rejects negative quantity", () => {
      const item = { ...validItem, quantity: -1 };
      const result = orderItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it("rejects non-integer quantity", () => {
      const item = { ...validItem, quantity: 2.5 };
      const result = orderItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it("rejects zero priceAtPurchase", () => {
      const item = { ...validItem, priceAtPurchase: 0 };
      const result = orderItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it("rejects negative priceAtPurchase", () => {
      const item = { ...validItem, priceAtPurchase: -9.99 };
      const result = orderItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it("rejects invalid image URL", () => {
      const item = { ...validItem, image: "not-a-url" };
      const result = orderItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });
  });

  describe("Create Order Schema", () => {
    const validOrder = {
      userId: "cluser123abc456",
      items: [
        {
          productId: "clprod123abc456",
          quantity: 2,
          priceAtPurchase: 9.99,
        },
      ],
      shippingAddress: {
        fullName: "Jane Smith",
        addressLine1: "456 Market Street",
        city: "Seattle",
        state: "Washington",
        postalCode: "98101",
      },
    };

    it("accepts valid complete order", () => {
      const result = createOrderSchema.safeParse(validOrder);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe("cluser123abc456");
        expect(result.data.items).toHaveLength(1);
      }
    });

    it("accepts valid order with multiple items", () => {
      const order = {
        ...validOrder,
        items: [
          {
            productId: "clprod123abc456",
            quantity: 2,
            priceAtPurchase: 9.99,
          },
          {
            productId: "clprod789def012",
            quantity: 1,
            priceAtPurchase: 14.99,
          },
          {
            productId: "clprod345ghi678",
            quantity: 5,
            priceAtPurchase: 3.99,
          },
        ],
      };

      const result = createOrderSchema.safeParse(order);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(3);
      }
    });

    it("accepts valid order with optional deliverySlotId", () => {
      const order = {
        ...validOrder,
        deliverySlotId: "clslot123abc456",
      };

      const result = createOrderSchema.safeParse(order);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.deliverySlotId).toBe("clslot123abc456");
      }
    });

    it("accepts valid order with notes", () => {
      const order = {
        ...validOrder,
        notes: "Please leave at the front door",
      };

      const result = createOrderSchema.safeParse(order);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBe("Please leave at the front door");
      }
    });

    it("accepts valid order with metadata", () => {
      const order = {
        ...validOrder,
        metadata: {
          source: "mobile_app",
          campaignId: "summer_sale_2024",
        },
      };

      const result = createOrderSchema.safeParse(order);
      expect(result.success).toBe(true);
    });

    it("rejects invalid userId format", () => {
      const order = { ...validOrder, userId: "invalid-id" };
      const result = createOrderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });

    it("rejects empty items array", () => {
      const order = { ...validOrder, items: [] };
      const result = createOrderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });

    it("rejects notes exceeding max length", () => {
      const order = { ...validOrder, notes: "x".repeat(501) };
      const result = createOrderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });

    it("rejects invalid deliverySlotId format", () => {
      const order = { ...validOrder, deliverySlotId: "invalid" };
      const result = createOrderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });

    it("rejects missing required fields", () => {
      const order = { userId: "cluser123abc456" };
      const result = createOrderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });
  });

  describe("Update Order Schema", () => {
    it("accepts valid status update", () => {
      const update = { status: "CONFIRMED" };

      const result = updateOrderSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("CONFIRMED");
      }
    });

    it("accepts valid payment status update", () => {
      const update = { paymentStatus: "PAID" };

      const result = updateOrderSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paymentStatus).toBe("PAID");
      }
    });

    it("accepts valid tracking number update", () => {
      const update = { trackingNumber: "1Z999AA10123456784" };

      const result = updateOrderSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.trackingNumber).toBe("1Z999AA10123456784");
      }
    });

    it("accepts valid partial shipping address update", () => {
      const update = {
        shippingAddress: {
          addressLine2: "Unit 5",
        },
      };

      const result = updateOrderSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("accepts valid notes update", () => {
      const update = { notes: "Updated delivery instructions" };

      const result = updateOrderSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("accepts valid paidAt timestamp", () => {
      const update = { paidAt: new Date("2024-07-15T10:30:00Z") };

      const result = updateOrderSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paidAt).toBeInstanceOf(Date);
      }
    });

    it("coerces paidAt string to Date", () => {
      const update = { paidAt: "2024-07-15T10:30:00Z" };

      const result = updateOrderSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paidAt).toBeInstanceOf(Date);
      }
    });

    it("accepts multiple update fields", () => {
      const update = {
        status: "SHIPPED",
        trackingNumber: "1Z999AA10123456784",
        notes: "Package shipped via UPS",
      };

      const result = updateOrderSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("accepts empty update object", () => {
      const update = {};
      const result = updateOrderSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("rejects invalid status value", () => {
      const update = { status: "INVALID_STATUS" };
      const result = updateOrderSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("rejects tracking number exceeding max length", () => {
      const update = { trackingNumber: "x".repeat(101) };
      const result = updateOrderSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("rejects notes exceeding max length", () => {
      const update = { notes: "x".repeat(501) };
      const result = updateOrderSchema.safeParse(update);
      expect(result.success).toBe(false);
    });
  });

  describe("Checkout Schema", () => {
    const validCheckout = {
      cartId: "clcart123abc456",
      shippingAddress: {
        fullName: "Bob Johnson",
        addressLine1: "789 Farm Lane",
        city: "Eugene",
        state: "Oregon",
        postalCode: "97401",
      },
    };

    it("accepts valid checkout with required fields", () => {
      const result = checkoutSchema.safeParse(validCheckout);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cartId).toBe("clcart123abc456");
      }
    });

    it("accepts valid checkout with all optional fields", () => {
      const checkout = {
        ...validCheckout,
        deliverySlotId: "clslot123abc456",
        paymentMethodId: "pm_1234567890",
        notes: "Ring doorbell on arrival",
      };

      const result = checkoutSchema.safeParse(checkout);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.deliverySlotId).toBe("clslot123abc456");
        expect(result.data.paymentMethodId).toBe("pm_1234567890");
        expect(result.data.notes).toBe("Ring doorbell on arrival");
      }
    });

    it("rejects invalid cartId format", () => {
      const checkout = { ...validCheckout, cartId: "invalid" };
      const result = checkoutSchema.safeParse(checkout);
      expect(result.success).toBe(false);
    });

    it("rejects invalid deliverySlotId format", () => {
      const checkout = { ...validCheckout, deliverySlotId: "invalid" };
      const result = checkoutSchema.safeParse(checkout);
      expect(result.success).toBe(false);
    });

    it("rejects notes exceeding max length", () => {
      const checkout = { ...validCheckout, notes: "x".repeat(501) };
      const result = checkoutSchema.safeParse(checkout);
      expect(result.success).toBe(false);
    });

    it("rejects missing required fields", () => {
      const checkout = { cartId: "clcart123abc456" };
      const result = checkoutSchema.safeParse(checkout);
      expect(result.success).toBe(false);
    });
  });

  describe("Order Query Schema", () => {
    it("accepts query with defaults", () => {
      const query = {};

      const result = orderQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
      }
    });

    it("accepts query with all filters", () => {
      const query = {
        userId: "cluser123abc456",
        farmId: "clfarm123abc456",
        status: "DELIVERED",
        paymentStatus: "PAID",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        limit: 50,
        offset: 100,
      };

      const result = orderQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("DELIVERED");
        expect(result.data.limit).toBe(50);
        expect(result.data.offset).toBe(100);
      }
    });

    it("coerces date strings to Date objects", () => {
      const query = {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      };

      const result = orderQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date);
        expect(result.data.endDate).toBeInstanceOf(Date);
      }
    });

    it("accepts valid order statuses", () => {
      const statuses = [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
      ];

      statuses.forEach((status) => {
        const result = orderQuerySchema.safeParse({ status });
        expect(result.success).toBe(true);
      });
    });

    it("accepts valid payment statuses", () => {
      const paymentStatuses = [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
      ];

      paymentStatuses.forEach((paymentStatus) => {
        const result = orderQuerySchema.safeParse({ paymentStatus });
        expect(result.success).toBe(true);
      });
    });

    it("rejects invalid userId format", () => {
      const query = { userId: "invalid" };
      const result = orderQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects invalid farmId format", () => {
      const query = { farmId: "invalid" };
      const result = orderQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects limit exceeding max value", () => {
      const query = { limit: 101 };
      const result = orderQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects non-positive limit", () => {
      const query = { limit: 0 };
      const result = orderQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects negative offset", () => {
      const query = { offset: -1 };
      const result = orderQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });
  });

  describe("Refund Schema", () => {
    const validRefund = {
      orderId: "clorder123abc456",
      reason: "Product was damaged during shipping",
    };

    it("accepts valid refund request with required fields", () => {
      const result = refundSchema.safeParse(validRefund);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.orderId).toBe("clorder123abc456");
        expect(result.data.reason).toBe("Product was damaged during shipping");
      }
    });

    it("accepts valid partial refund with amount", () => {
      const refund = {
        ...validRefund,
        amount: 25.99,
      };

      const result = refundSchema.safeParse(refund);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(25.99);
      }
    });

    it("accepts valid refund for specific items", () => {
      const refund = {
        ...validRefund,
        items: ["clitem123abc456", "clitem789def012"],
      };

      const result = refundSchema.safeParse(refund);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(2);
      }
    });

    it("accepts valid refund with both amount and items", () => {
      const refund = {
        ...validRefund,
        amount: 50.0,
        items: ["clitem123abc456"],
      };

      const result = refundSchema.safeParse(refund);
      expect(result.success).toBe(true);
    });

    it("rejects invalid orderId format", () => {
      const refund = { ...validRefund, orderId: "invalid" };
      const result = refundSchema.safeParse(refund);
      expect(result.success).toBe(false);
    });

    it("rejects reason too short", () => {
      const refund = { ...validRefund, reason: "Too short" };
      const result = refundSchema.safeParse(refund);
      expect(result.success).toBe(false);
    });

    it("rejects reason too long", () => {
      const refund = { ...validRefund, reason: "x".repeat(501) };
      const result = refundSchema.safeParse(refund);
      expect(result.success).toBe(false);
    });

    it("rejects zero amount", () => {
      const refund = { ...validRefund, amount: 0 };
      const result = refundSchema.safeParse(refund);
      expect(result.success).toBe(false);
    });

    it("rejects negative amount", () => {
      const refund = { ...validRefund, amount: -25.99 };
      const result = refundSchema.safeParse(refund);
      expect(result.success).toBe(false);
    });

    it("rejects invalid item IDs", () => {
      const refund = { ...validRefund, items: ["invalid"] };
      const result = refundSchema.safeParse(refund);
      expect(result.success).toBe(false);
    });

    it("rejects missing required fields", () => {
      const refund = { orderId: "clorder123abc456" };
      const result = refundSchema.safeParse(refund);
      expect(result.success).toBe(false);
    });
  });

  describe("Type Inference and Integration", () => {
    it("infers correct types from schemas", () => {
      const order = {
        userId: "cluser123abc456",
        items: [
          {
            productId: "clprod123abc456",
            quantity: 2,
            priceAtPurchase: 9.99,
          },
        ],
        shippingAddress: {
          fullName: "Test User",
          addressLine1: "123 Test Street",
          city: "TestCity",
          state: "TestState",
          postalCode: "12345",
        },
      };

      const result = createOrderSchema.safeParse(order);
      expect(result.success).toBe(true);

      if (result.success) {
        // Type assertions to verify inference
        const data = result.data;
        expect(typeof data.userId).toBe("string");
        expect(Array.isArray(data.items)).toBe(true);
        expect(typeof data.shippingAddress.fullName).toBe("string");
        expect(typeof data.items[0].quantity).toBe("number");
      }
    });

    it("validates complex nested structures", () => {
      const order = {
        userId: "cluser123abc456",
        items: [
          {
            productId: "clprod123abc456",
            quantity: 2,
            priceAtPurchase: 9.99,
            name: "Test Product",
            image: "https://example.com/test.jpg",
          },
        ],
        shippingAddress: {
          fullName: "Jane Doe",
          addressLine1: "456 Test Road",
          addressLine2: "Suite 100",
          city: "Portland",
          state: "Oregon",
          postalCode: "97201",
          country: "US",
          phone: "+1 (503) 555-0100",
        },
        deliverySlotId: "clslot123abc456",
        notes: "Please deliver between 2-4 PM",
        metadata: {
          source: "web",
          referrer: "google",
        },
      };

      const result = createOrderSchema.safeParse(order);
      expect(result.success).toBe(true);
    });
  });
});
