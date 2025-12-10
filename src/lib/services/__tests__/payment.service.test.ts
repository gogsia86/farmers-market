/**
 * 💳 PAYMENT SERVICE TEST SUITE
 * Comprehensive tests for Stripe payment integration
 *
 * @version 3.0.0 - Using Global Stripe Mock
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { PaymentService } from "../payment.service";
import type { Order } from "@prisma/client";
import { database } from "@/lib/database";
import {
  mockPaymentIntentsCreate,
  mockPaymentIntentsRetrieve,
  mockRefundsCreate,
  mockWebhooksConstructEvent,
  clearStripeMocks,
  createMockPaymentIntent,
  createMockRefund,
  createMockCharge,
  createMockEvent,
} from "__mocks__/stripe";

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
    clearStripeMocks();

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
      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        client_secret: "pi_test_123_secret",
        amount: 9999,
        currency: "usd",
        status: "requires_payment_method",
      });

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as unknown as Order);
      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);
      jest
        .mocked(database.order.update)
        .mockResolvedValue(mockOrder as unknown as Order);

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
        description: expect.stringContaining("Test Farm"),
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
      // Arrange
      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        client_secret: "pi_test_123_secret",
        amount: 9999,
        currency: "eur",
        status: "requires_payment_method",
      });

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as unknown as Order);
      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);
      jest
        .mocked(database.order.update)
        .mockResolvedValue(mockOrder as unknown as Order);

      // Act
      const result = await PaymentService.createPaymentIntent({
        orderId: "order-123",
        amount: 99.99,
        currency: "eur",
      });

      // Assert
      expect(result.currency).toBe("eur");
      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: "eur",
        }),
      );
    });

    it("should convert amount to cents correctly", async () => {
      // Arrange
      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        amount: 12345,
        currency: "usd",
        status: "requires_payment_method",
      });

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as unknown as Order);
      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);
      jest
        .mocked(database.order.update)
        .mockResolvedValue(mockOrder as unknown as Order);

      // Act
      const result = await PaymentService.createPaymentIntent({
        orderId: "order-123",
        amount: 123.45,
      });

      // Assert
      expect(result.amount).toBe(123.45);
      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 12345,
        }),
      );
    });

    it("should return existing payment intent if not canceled", async () => {
      // Arrange
      const mockExistingIntent = createMockPaymentIntent({
        id: "pi_existing_123",
        client_secret: "pi_existing_123_secret",
        amount: 9999,
        currency: "usd",
        status: "requires_payment_method",
      });

      const orderWithIntent = {
        ...mockOrder,
        paymentIntentId: "pi_existing_123",
      };

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(orderWithIntent as any);
      mockPaymentIntentsRetrieve.mockResolvedValue(mockExistingIntent);

      // Act
      const result = await PaymentService.createPaymentIntent({
        orderId: "order-123",
        amount: 99.99,
      });

      // Assert
      expect(result.id).toBe("pi_existing_123");
      expect(mockPaymentIntentsCreate).not.toHaveBeenCalled();
    });

    it("should throw error if order not found", async () => {
      // Arrange
      jest.mocked(database.order.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(
        PaymentService.createPaymentIntent({
          orderId: "nonexistent",
          amount: 99.99,
        }),
      ).rejects.toThrow("Order not found");
    });

    it("should throw error if amount is zero or negative", async () => {
      // Arrange
      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as any);

      // Act & Assert
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
      // Arrange
      delete process.env.STRIPE_SECRET_KEY;
      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as any);

      // Act & Assert
      await expect(
        PaymentService.createPaymentIntent({
          orderId: "order-123",
          amount: 99.99,
        }),
      ).rejects.toThrow();
    });

    it("should include custom metadata", async () => {
      // Arrange
      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        amount: 9999,
        currency: "usd",
        status: "requires_payment_method",
      });

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as any);
      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);
      jest.mocked(database.order.update).mockResolvedValue(mockOrder as any);

      // Act
      await PaymentService.createPaymentIntent({
        orderId: "order-123",
        amount: 99.99,
        metadata: { customField: "customValue" },
      });

      // Assert
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
      // Arrange
      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        status: "succeeded",
        amount: 9999,
      });

      mockPaymentIntentsRetrieve.mockResolvedValue(mockPaymentIntent);

      // Act
      const result = await PaymentService.confirmPayment("pi_test_123");

      // Assert
      expect(result.success).toBe(true);
      expect(result.status).toBe("succeeded");
      expect(result.paymentIntent).toEqual(mockPaymentIntent);
    });

    it("should return false for non-succeeded status", async () => {
      // Arrange
      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        status: "requires_payment_method",
      });

      mockPaymentIntentsRetrieve.mockResolvedValue(mockPaymentIntent);

      // Act
      const result = await PaymentService.confirmPayment("pi_test_123");

      // Assert
      expect(result.success).toBe(false);
    });

    it("should throw error if Stripe retrieval fails", async () => {
      // Arrange
      mockPaymentIntentsRetrieve.mockRejectedValue(
        new Error("Stripe API error"),
      );

      // Act & Assert
      await expect(
        PaymentService.confirmPayment("pi_test_123"),
      ).rejects.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔄 HANDLE PAYMENT SUCCESS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("handlePaymentSuccess", () => {
    it("should update order to PAID status", async () => {
      // Arrange
      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        amount: 9999,
        metadata: { orderId: "order-123" },
      });

      const mockOrder = {
        id: "order-123",
        paymentStatus: "PENDING",
      };

      jest.mocked(database.order.findFirst).mockResolvedValue(mockOrder as any);
      jest.mocked(database.order.update).mockResolvedValue({
        ...mockOrder,
        paymentStatus: "PAID",
      } as any);

      // Act
      await PaymentService.handlePaymentSuccess(mockPaymentIntent);

      // Assert
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
      // Arrange
      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        metadata: {},
      });

      // Act & Assert
      await expect(
        PaymentService.handlePaymentSuccess(mockPaymentIntent),
      ).resolves.not.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ❌ HANDLE PAYMENT FAILURE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("handlePaymentFailure", () => {
    it("should update order to FAILED status", async () => {
      // Arrange
      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        metadata: { orderId: "order-123" },
        last_payment_error: { message: "Card declined" },
      });

      const mockOrder = {
        id: "order-123",
        paymentStatus: "PENDING",
      };

      jest.mocked(database.order.findFirst).mockResolvedValue(mockOrder as any);
      jest.mocked(database.order.update).mockResolvedValue({
        ...mockOrder,
        paymentStatus: "FAILED",
      } as any);

      // Act
      await PaymentService.handlePaymentFailure(mockPaymentIntent);

      // Assert
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "order-123" },
        data: {
          paymentStatus: "FAILED",
        },
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 💰 CREATE REFUND TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("createRefund", () => {
    it("should create full refund successfully", async () => {
      // Arrange
      const mockRefund = createMockRefund({
        id: "re_test_123",
        amount: 9999,
        status: "succeeded",
        reason: "requested_by_customer",
      });

      mockRefundsCreate.mockResolvedValue(mockRefund);

      // Act
      const result = await PaymentService.createRefund("pi_test_123");

      // Assert
      expect(result.id).toBe("re_test_123");
      expect(result.amount).toBe(99.99);
      expect(result.status).toBe("succeeded");
      expect(result.reason).toBe("requested_by_customer");

      expect(mockRefundsCreate).toHaveBeenCalledWith({
        payment_intent: "pi_test_123",
        reason: "requested_by_customer",
      });
    });

    it("should create partial refund with specified amount", async () => {
      // Arrange
      const mockRefund = createMockRefund({
        id: "re_test_123",
        amount: 5000,
        status: "succeeded",
      });

      mockRefundsCreate.mockResolvedValue(mockRefund);

      // Act
      const result = await PaymentService.createRefund("pi_test_123", 50.0);

      // Assert
      expect(mockRefundsCreate).toHaveBeenCalledWith({
        payment_intent: "pi_test_123",
        amount: 5000,
        reason: "requested_by_customer",
      });
    });

    it("should throw error for zero or negative refund amount", async () => {
      // Act & Assert
      await expect(
        PaymentService.createRefund("pi_test_123", 0),
      ).rejects.toThrow("Refund amount must be greater than 0");
    });

    it("should use custom refund reason", async () => {
      // Arrange
      const mockRefund = createMockRefund({
        id: "re_test_123",
        amount: 9999,
        status: "succeeded",
      });

      mockRefundsCreate.mockResolvedValue(mockRefund);

      // Act
      await PaymentService.createRefund("pi_test_123", undefined, "duplicate");

      // Assert
      expect(mockRefundsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: "duplicate",
        }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔄 HANDLE REFUND TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("handleRefund", () => {
    it("should update order to REFUNDED status", async () => {
      // Arrange
      const mockCharge = createMockCharge({
        id: "ch_test_123",
        payment_intent: "pi_test_123",
        amount_refunded: 9999,
      });

      const mockOrder = {
        id: "order-123",
        paymentIntentId: "pi_test_123",
      };

      jest.mocked(database.order.findFirst).mockResolvedValue(mockOrder as any);
      jest.mocked(database.order.update).mockResolvedValue({
        ...mockOrder,
        paymentStatus: "REFUNDED",
      } as any);

      // Act
      await PaymentService.handleRefund(mockCharge);

      // Assert
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "order-123" },
        data: {
          paymentStatus: "REFUNDED",
        },
      });
    });

    it("should handle charge without payment_intent gracefully", async () => {
      // Arrange
      const mockCharge = createMockCharge({
        id: "ch_test_123",
        payment_intent: null,
      });

      // Act & Assert
      await expect(
        PaymentService.handleRefund(mockCharge),
      ).resolves.not.toThrow();
    });

    it("should handle order not found gracefully", async () => {
      // Arrange
      const mockCharge = createMockCharge({
        id: "ch_test_123",
        payment_intent: "pi_test_123",
      });

      jest.mocked(database.order.findFirst).mockResolvedValue(null);

      // Act & Assert
      await expect(
        PaymentService.handleRefund(mockCharge),
      ).resolves.not.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔍 GET PAYMENT DETAILS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("getPaymentDetails", () => {
    it("should return order and payment intent", async () => {
      // Arrange
      const mockOrder = {
        id: "order-123",
        paymentIntentId: "pi_test_123",
        total: 99.99,
      };

      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        amount: 9999,
        status: "succeeded",
      });

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as any);
      mockPaymentIntentsRetrieve.mockResolvedValue(mockPaymentIntent);

      // Act
      const result = await PaymentService.getPaymentDetails("order-123");

      // Assert
      expect(result.order).toEqual(mockOrder);
      expect(result.paymentIntent).toEqual(mockPaymentIntent);
    });

    it("should return order without payment intent if none exists", async () => {
      // Arrange
      const mockOrder = {
        id: "order-123",
        paymentIntentId: null,
        total: 99.99,
      };

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as any);

      // Act
      const result = await PaymentService.getPaymentDetails("order-123");

      // Assert
      expect(result.order).toEqual(mockOrder);
      expect(result.paymentIntent).toBeUndefined();
    });

    it("should throw error if order not found", async () => {
      // Arrange
      jest.mocked(database.order.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(
        PaymentService.getPaymentDetails("nonexistent"),
      ).rejects.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔐 VERIFY WEBHOOK SIGNATURE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("verifyWebhookSignature", () => {
    it("should verify valid webhook signature", async () => {
      // Arrange
      const mockEvent = createMockEvent("payment_intent.succeeded", {});

      mockWebhooksConstructEvent.mockReturnValue(mockEvent);

      // Act
      const result = PaymentService.verifyWebhookSignature(
        "raw_body",
        "signature",
      );

      // Assert
      expect(result).toEqual(mockEvent);
    });

    it("should throw error if webhook secret not configured", async () => {
      // Arrange
      delete process.env.STRIPE_WEBHOOK_SECRET;

      // Act & Assert
      expect(() =>
        PaymentService.verifyWebhookSignature("raw_body", "signature"),
      ).toThrow();
    });

    it("should throw error for invalid signature", async () => {
      // Arrange
      mockWebhooksConstructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      // Act & Assert
      expect(() =>
        PaymentService.verifyWebhookSignature("raw_body", "bad_signature"),
      ).toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧪 EDGE CASES
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Edge Cases", () => {
    it("should handle Stripe API errors gracefully", async () => {
      // Arrange
      const mockOrder = {
        id: "order-123",
        total: 99.99,
      };

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as any);
      mockPaymentIntentsCreate.mockRejectedValue(new Error("Stripe API error"));

      // Act & Assert
      await expect(
        PaymentService.createPaymentIntent({
          orderId: "order-123",
          amount: 99.99,
        }),
      ).rejects.toThrow();
    });

    it("should round amounts correctly to avoid floating point issues", async () => {
      // Arrange
      const mockOrder = {
        id: "order-123",
        total: 99.999,
      };

      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        amount: 10000,
        currency: "usd",
        status: "requires_payment_method",
      });

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as any);
      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);
      jest.mocked(database.order.update).mockResolvedValue(mockOrder as any);

      // Act
      const result = await PaymentService.createPaymentIntent({
        orderId: "order-123",
        amount: 99.999,
      });

      // Assert
      expect(result.amount).toBe(100.0);
      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10000,
        }),
      );
    });
  });
});
