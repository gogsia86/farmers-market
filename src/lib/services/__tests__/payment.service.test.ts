/**
 * 💳 PAYMENT SERVICE TEST SUITE
 * Comprehensive tests for Stripe payment integration
 *
 * @version 2.0.0 - Full Stripe Integration Tests
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import Stripe from "stripe";
import { PaymentService } from "../payment.service";
import { database } from "@/lib/database";

// ✅ MOCK STRIPE
const mockPaymentIntentsCreate = jest.fn();
const mockPaymentIntentsRetrieve = jest.fn();
const mockRefundsCreate = jest.fn();
const mockWebhooksConstructEvent = jest.fn();

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: mockPaymentIntentsCreate,
      retrieve: mockPaymentIntentsRetrieve,
    },
    refunds: {
      create: mockRefundsCreate,
    },
    webhooks: {
      constructEvent: mockWebhooksConstructEvent,
    },
  }));
});

// ✅ MOCK DATABASE
jest.mock("@/lib/database", () => ({
  database: {
    order: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// ✅ MOCK ENVIRONMENT VARIABLES
const originalEnv = process.env;

describe("💳 PaymentService - Divine Stripe Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup environment
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: "sk_test_mock_key_123",
      STRIPE_WEBHOOK_SECRET: "whsec_test_secret_123",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 CREATE PAYMENT INTENT TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("createPaymentIntent", () => {
    const mockOrder = {
      id: "order-123",
      customerId: "customer-456",
      farmId: "farm-789",
      total: 99.99,
      paymentIntentId: null,
      paymentStatus: "PENDING",
      customer: { email: "test@example.com", name: "Test Customer" },
      farm: { name: "Test Farm" },
    };

    it("should create a payment intent successfully", async () => {
      // Arrange
      const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
        id: "pi_test_123",
        client_secret: "pi_test_123_secret",
        amount: 9999,
        currency: "usd",
        status: "requires_payment_method",
      };

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as any);
      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);
      jest.mocked(database.order.update).mockResolvedValue(mockOrder as any);

      // Act
      const result = await PaymentService.createPaymentIntent({
        orderId: "order-123",
        amount: 99.99,
      });

      // Assert
      expect(result).toEqual({
        id: "pi_test_123",
        clientSecret: "pi_test_123_secret",
        amount: 99.99,
        currency: "usd",
        status: "requires_payment_method",
        orderId: "order-123",
      });

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith({
        amount: 9999,
        currency: "usd",
        metadata: {
          orderId: "order-123",
          customerId: "customer-456",
          farmId: "farm-789",
        },
        automatic_payment_methods: { enabled: true },
        description: expect.stringContaining("Order #order-12"),
      });

      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "order-123" },
        data: {
          paymentIntentId: "pi_test_123",
          paymentStatus: "PENDING",
        },
      });
    });

    it("should use custom currency when specified", async () => {
      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as any);
      mockPaymentIntentsCreate.mockResolvedValue({
        id: "pi_test_eur",
        client_secret: "secret",
        amount: 9999,
        currency: "eur",
        status: "requires_payment_method",
      });
      jest.mocked(database.order.update).mockResolvedValue(mockOrder as any);

      await PaymentService.createPaymentIntent({
        orderId: "order-123",
        amount: 99.99,
        currency: "eur",
      });

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: "eur",
        }),
      );
    });

    it("should convert amount to cents correctly", async () => {
      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as any);
      mockPaymentIntentsCreate.mockResolvedValue({
        id: "pi_test",
        amount: 12345,
        currency: "usd",
        status: "requires_payment_method",
      });
      jest.mocked(database.order.update).mockResolvedValue(mockOrder as any);

      await PaymentService.createPaymentIntent({
        orderId: "order-123",
        amount: 123.45,
      });

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 12345,
        }),
      );
    });

    it("should return existing payment intent if not canceled", async () => {
      const mockExistingIntent: Partial<Stripe.PaymentIntent> = {
        id: "pi_existing_123",
        client_secret: "pi_existing_secret",
        amount: 9999,
        currency: "usd",
        status: "requires_payment_method",
      };

      jest.mocked(database.order.findUnique).mockResolvedValue({
        ...mockOrder,
        paymentIntentId: "pi_existing_123",
      } as any);
      mockPaymentIntentsRetrieve.mockResolvedValue(mockExistingIntent);

      const result = await PaymentService.createPaymentIntent({
        orderId: "order-123",
        amount: 99.99,
      });

      expect(result.id).toBe("pi_existing_123");
      expect(mockPaymentIntentsCreate).not.toHaveBeenCalled();
    });

    it("should throw error if order not found", async () => {
      jest.mocked(database.order.findUnique).mockResolvedValue(null);

      await expect(
        PaymentService.createPaymentIntent({
          orderId: "nonexistent",
          amount: 99.99,
        }),
      ).rejects.toThrow("Order not found");
    });

    it("should throw error if amount is zero or negative", async () => {
      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as any);

      await expect(
        PaymentService.createPaymentIntent({
          orderId: "order-123",
          amount: 0,
        }),
      ).rejects.toThrow("Payment amount must be greater than 0");

      await expect(
        PaymentService.createPaymentIntent({
          orderId: "order-123",
          amount: -10,
        }),
      ).rejects.toThrow("Payment amount must be greater than 0");
    });

    it("should throw error if Stripe key not configured", async () => {
      delete process.env.STRIPE_SECRET_KEY;

      await expect(
        PaymentService.createPaymentIntent({
          orderId: "order-123",
          amount: 99.99,
        }),
      ).rejects.toThrow("STRIPE_SECRET_KEY is not configured");
    });

    it("should include custom metadata", async () => {
      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as any);
      mockPaymentIntentsCreate.mockResolvedValue({
        id: "pi_test",
        amount: 9999,
        currency: "usd",
        status: "requires_payment_method",
      });
      jest.mocked(database.order.update).mockResolvedValue(mockOrder as any);

      await PaymentService.createPaymentIntent({
        orderId: "order-123",
        amount: 99.99,
        metadata: { customField: "customValue" },
      });

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            customField: "customValue",
          }),
        }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ✅ CONFIRM PAYMENT TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("confirmPayment", () => {
    it("should confirm successful payment", async () => {
      const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
        id: "pi_test_123",
        status: "succeeded",
        amount: 9999,
      };

      mockPaymentIntentsRetrieve.mockResolvedValue(mockPaymentIntent);

      const result = await PaymentService.confirmPayment("pi_test_123");

      expect(result).toEqual({
        success: true,
        status: "succeeded",
        paymentIntent: mockPaymentIntent,
      });
    });

    it("should return false for non-succeeded status", async () => {
      mockPaymentIntentsRetrieve.mockResolvedValue({
        id: "pi_test_123",
        status: "requires_payment_method",
      });

      const result = await PaymentService.confirmPayment("pi_test_123");

      expect(result.success).toBe(false);
      expect(result.status).toBe("requires_payment_method");
    });

    it("should throw error if Stripe retrieval fails", async () => {
      mockPaymentIntentsRetrieve.mockRejectedValue(
        new Error("Payment intent not found"),
      );

      await expect(
        PaymentService.confirmPayment("pi_invalid"),
      ).rejects.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔄 PAYMENT SUCCESS HANDLER TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("handlePaymentSuccess", () => {
    it("should update order to PAID status", async () => {
      const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
        id: "pi_test_123",
        amount: 9999,
        metadata: { orderId: "order-123" },
      };

      jest.mocked(database.order.update).mockResolvedValue({
        id: "order-123",
        paymentStatus: "PAID",
      } as any);

      await PaymentService.handlePaymentSuccess(
        mockPaymentIntent as Stripe.PaymentIntent,
      );

      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "order-123" },
        data: {
          paymentStatus: "PAID",
          paymentIntentId: "pi_test_123",
          paidAt: expect.any(Date),
          status: "CONFIRMED",
        },
      });
    });

    it("should handle missing orderId in metadata gracefully", async () => {
      const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
        id: "pi_test_123",
        metadata: {},
      };

      // Should not throw
      await expect(
        PaymentService.handlePaymentSuccess(
          mockPaymentIntent as Stripe.PaymentIntent,
        ),
      ).resolves.not.toThrow();

      expect(database.order.update).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ❌ PAYMENT FAILURE HANDLER TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("handlePaymentFailure", () => {
    it("should update order to FAILED status", async () => {
      const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
        id: "pi_test_123",
        metadata: { orderId: "order-123" },
        last_payment_error: { message: "Card declined" } as any,
      };

      jest.mocked(database.order.update).mockResolvedValue({
        id: "order-123",
        paymentStatus: "FAILED",
      } as any);

      await PaymentService.handlePaymentFailure(
        mockPaymentIntent as Stripe.PaymentIntent,
      );

      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "order-123" },
        data: {
          paymentStatus: "FAILED",
        },
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 💸 REFUND TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("createRefund", () => {
    it("should create full refund successfully", async () => {
      const mockRefund: Partial<Stripe.Refund> = {
        id: "re_test_123",
        amount: 9999,
        status: "succeeded",
        reason: "requested_by_customer",
      };

      mockRefundsCreate.mockResolvedValue(mockRefund);

      const result = await PaymentService.createRefund("pi_test_123");

      expect(result).toEqual({
        id: "re_test_123",
        amount: 99.99,
        status: "succeeded",
        reason: "requested_by_customer",
      });

      expect(mockRefundsCreate).toHaveBeenCalledWith({
        payment_intent: "pi_test_123",
        reason: "requested_by_customer",
      });
    });

    it("should create partial refund with specified amount", async () => {
      mockRefundsCreate.mockResolvedValue({
        id: "re_test_partial",
        amount: 2500,
        status: "succeeded",
      });

      const result = await PaymentService.createRefund("pi_test_123", 25.0);

      expect(result.amount).toBe(25.0);
      expect(mockRefundsCreate).toHaveBeenCalledWith({
        payment_intent: "pi_test_123",
        amount: 2500,
        reason: "requested_by_customer",
      });
    });

    it("should throw error for zero or negative refund amount", async () => {
      await expect(
        PaymentService.createRefund("pi_test_123", 0),
      ).rejects.toThrow("Refund amount must be greater than 0");

      await expect(
        PaymentService.createRefund("pi_test_123", -10),
      ).rejects.toThrow("Refund amount must be greater than 0");
    });

    it("should use custom refund reason", async () => {
      mockRefundsCreate.mockResolvedValue({
        id: "re_test",
        amount: 9999,
        status: "succeeded",
      });

      await PaymentService.createRefund("pi_test_123", undefined, "duplicate");

      expect(mockRefundsCreate).toHaveBeenCalledWith({
        payment_intent: "pi_test_123",
        reason: "duplicate",
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔄 REFUND HANDLER TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("handleRefund", () => {
    it("should update order to REFUNDED status", async () => {
      const mockCharge: Partial<Stripe.Charge> = {
        id: "ch_test_123",
        payment_intent: "pi_test_123",
        amount_refunded: 9999,
      };

      jest.mocked(database.order.findFirst).mockResolvedValue({
        id: "order-123",
        paymentIntentId: "pi_test_123",
      } as any);

      jest.mocked(database.order.update).mockResolvedValue({
        id: "order-123",
        paymentStatus: "REFUNDED",
      } as any);

      await PaymentService.handleRefund(mockCharge as Stripe.Charge);

      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "order-123" },
        data: {
          paymentStatus: "REFUNDED",
          refundedAt: expect.any(Date),
        },
      });
    });

    it("should handle charge without payment_intent gracefully", async () => {
      const mockCharge: Partial<Stripe.Charge> = {
        id: "ch_test_123",
        payment_intent: null,
      };

      await expect(
        PaymentService.handleRefund(mockCharge as any),
      ).resolves.not.toThrow();

      expect(database.order.findFirst).not.toHaveBeenCalled();
    });

    it("should handle order not found gracefully", async () => {
      const mockCharge: Partial<Stripe.Charge> = {
        id: "ch_test_123",
        payment_intent: "pi_test_123",
      };

      jest.mocked(database.order.findFirst).mockResolvedValue(null);

      await expect(
        PaymentService.handleRefund(mockCharge as Stripe.Charge),
      ).resolves.not.toThrow();

      expect(database.order.update).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 GET PAYMENT DETAILS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("getPaymentDetails", () => {
    it("should return order and payment intent", async () => {
      const mockOrder = {
        id: "order-123",
        paymentIntentId: "pi_test_123",
        total: 99.99,
      };

      const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
        id: "pi_test_123",
        amount: 9999,
        status: "succeeded",
      };

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as any);
      mockPaymentIntentsRetrieve.mockResolvedValue(mockPaymentIntent);

      const result = await PaymentService.getPaymentDetails("order-123");

      expect(result.order).toEqual(mockOrder);
      expect(result.paymentIntent).toEqual(mockPaymentIntent);
    });

    it("should return order without payment intent if none exists", async () => {
      const mockOrder = {
        id: "order-123",
        paymentIntentId: null,
        total: 99.99,
      };

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as any);

      const result = await PaymentService.getPaymentDetails("order-123");

      expect(result.order).toEqual(mockOrder);
      expect(result.paymentIntent).toBeUndefined();
      expect(mockPaymentIntentsRetrieve).not.toHaveBeenCalled();
    });

    it("should throw error if order not found", async () => {
      jest.mocked(database.order.findUnique).mockResolvedValue(null);

      await expect(
        PaymentService.getPaymentDetails("nonexistent"),
      ).rejects.toThrow("Order not found");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔍 WEBHOOK SIGNATURE VERIFICATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("verifyWebhookSignature", () => {
    it("should verify valid webhook signature", () => {
      const mockEvent = { type: "payment_intent.succeeded" } as Stripe.Event;
      mockWebhooksConstructEvent.mockReturnValue(mockEvent);

      const result = PaymentService.verifyWebhookSignature(
        "payload",
        "signature",
      );

      expect(result).toEqual(mockEvent);
      expect(mockWebhooksConstructEvent).toHaveBeenCalledWith(
        "payload",
        "signature",
        "whsec_test_secret_123",
      );
    });

    it("should throw error if webhook secret not configured", () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      expect(() =>
        PaymentService.verifyWebhookSignature("payload", "signature"),
      ).toThrow("STRIPE_WEBHOOK_SECRET is not configured");
    });

    it("should throw error for invalid signature", () => {
      mockWebhooksConstructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      expect(() =>
        PaymentService.verifyWebhookSignature("payload", "invalid"),
      ).toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 EDGE CASES & ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Edge Cases", () => {
    it("should handle Stripe API errors gracefully", async () => {
      jest.mocked(database.order.findUnique).mockResolvedValue({
        id: "order-123",
        total: 99.99,
      } as any);

      mockPaymentIntentsCreate.mockRejectedValue(new Error("Stripe API error"));

      await expect(
        PaymentService.createPaymentIntent({
          orderId: "order-123",
          amount: 99.99,
        }),
      ).rejects.toThrow();
    });

    it("should round amounts correctly to avoid floating point issues", async () => {
      jest.mocked(database.order.findUnique).mockResolvedValue({
        id: "order-123",
        total: 99.99,
      } as any);

      mockPaymentIntentsCreate.mockResolvedValue({
        id: "pi_test",
        amount: 9999,
        currency: "usd",
        status: "requires_payment_method",
      });

      jest.mocked(database.order.update).mockResolvedValue({} as any);

      await PaymentService.createPaymentIntent({
        orderId: "order-123",
        amount: 99.999999,
      });

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10000, // Should be rounded properly
        }),
      );
    });
  });
});
