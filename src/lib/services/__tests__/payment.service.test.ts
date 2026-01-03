/**
 * 💳 PAYMENT SERVICE TEST SUITE
 * Comprehensive tests for Stripe payment integration with ServiceResponse pattern
 *
 * @version 4.0.0 - Migrated to ServiceResponse Pattern
 * @coverage All payment operations with divine error handling
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
import type { ServiceResponse } from "@/lib/types/service-response";
import type {
  PaymentIntent,
  PaymentDetails,
  PaymentConfirmation,
} from "@/lib/services/payment.service";

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

describe("💳 PaymentService - Divine Stripe Integration with ServiceResponse", () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    jest.clearAllMocks();
    clearStripeMocks();

    // Setup environment
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: "sk_test_mock_key_123",
      STRIPE_WEBHOOK_SECRET: "whsec_test_secret_123",
    };

    paymentService = new PaymentService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 CREATE PAYMENT INTENT TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("createPaymentIntent", () => {
    const mockOrder = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      customerId: "customer-456",
      farmId: "farm-789",
      total: 99.99,
      paymentIntentId: null,
      paymentStatus: "PENDING",
      customer: { email: "test@example.com", name: "Test Customer" },
      farm: { name: "Test Farm" },
    };

    it("should create a payment intent successfully with ServiceResponse", async () => {
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
      const result = await paymentService.createPaymentIntent({
        orderId: "550e8400-e29b-41d4-a716-446655440001",
        amount: 99.99,
      });

      // Assert - ServiceResponse structure
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();

      // Assert - Payment intent data
      expect(result.data).toEqual({
        id: "pi_test_123",
        clientSecret: "pi_test_123_secret",
        amount: 99.99,
        currency: "usd",
        status: "requires_payment_method",
        orderId: "550e8400-e29b-41d4-a716-446655440001",
      });

      // Assert - Stripe API calls
      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith({
        amount: 9999,
        currency: "usd",
        metadata: {
          orderId: "550e8400-e29b-41d4-a716-446655440001",
          customerId: "customer-456",
          farmId: "farm-789",
        },
        automatic_payment_methods: { enabled: true },
        description: expect.stringContaining("Test Farm"),
      });

      // Assert - Database updates
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "550e8400-e29b-41d4-a716-446655440001" },
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
      const result = await paymentService.createPaymentIntent({
        orderId: "550e8400-e29b-41d4-a716-446655440001",
        amount: 99.99,
        currency: "eur",
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.currency).toBe("eur");
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
      const result = await paymentService.createPaymentIntent({
        orderId: "550e8400-e29b-41d4-a716-446655440001",
        amount: 123.45,
      });

      // Assert
      expect(result.success).toBe(true);
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
        .mockResolvedValue(orderWithIntent as unknown as Order);
      mockPaymentIntentsRetrieve.mockResolvedValue(mockExistingIntent);

      // Act
      const result = await paymentService.createPaymentIntent({
        orderId: "550e8400-e29b-41d4-a716-446655440001",
        amount: 99.99,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe("pi_existing_123");
      expect(mockPaymentIntentsCreate).not.toHaveBeenCalled();
    });

    it("should return error if order not found", async () => {
      // Arrange
      jest.mocked(database.order.findUnique).mockResolvedValue(null);

      // Act
      const result = await paymentService.createPaymentIntent({
        orderId: "order-999",
        amount: 99.99,
      });

      // Assert - ServiceResponse error structure
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("PAYMENT_INTENT_CREATION_FAILED");
      expect(result.error?.message).toContain(
        "Failed to create payment intent",
      );
    });

    it("should return error if amount is zero or negative", async () => {
      // Act - Zero amount
      const resultZero = await paymentService.createPaymentIntent({
        orderId: "550e8400-e29b-41d4-a716-446655440001",
        amount: 0,
      });

      // Assert
      expect(resultZero.success).toBe(false);
      expect(resultZero.error?.code).toBe("PAYMENT_INTENT_CREATION_FAILED");

      // Act - Negative amount
      const resultNegative = await paymentService.createPaymentIntent({
        orderId: "550e8400-e29b-41d4-a716-446655440001",
        amount: -50,
      });

      // Assert
      expect(resultNegative.success).toBe(false);
      expect(resultNegative.error?.code).toBe("PAYMENT_INTENT_CREATION_FAILED");
    });

    it("should return error if Stripe key not configured", async () => {
      // Arrange
      delete process.env.STRIPE_SECRET_KEY;
      const newService = new PaymentService();

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as unknown as Order);

      // Act
      const result = await newService.createPaymentIntent({
        orderId: "550e8400-e29b-41d4-a716-446655440001",
        amount: 99.99,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PAYMENT_INTENT_CREATION_FAILED");
      expect(result.error?.message).toContain(
        "Failed to create payment intent",
      );
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
        .mockResolvedValue(mockOrder as unknown as Order);
      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);
      jest
        .mocked(database.order.update)
        .mockResolvedValue(mockOrder as unknown as Order);

      // Act
      const result = await paymentService.createPaymentIntent({
        orderId: "550e8400-e29b-41d4-a716-446655440001",
        amount: 99.99,
        metadata: { customField: "customValue" },
      });

      // Assert
      expect(result.success).toBe(true);
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
    it("should confirm successful payment with ServiceResponse", async () => {
      // Arrange
      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        status: "succeeded",
        amount: 9999,
      });

      mockPaymentIntentsRetrieve.mockResolvedValue(mockPaymentIntent);

      // Act
      const result = await paymentService.confirmPayment("pi_test_123");

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(true);
      expect(result.data?.status).toBe("succeeded");
    });

    it("should return false for non-succeeded status", async () => {
      // Arrange
      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        status: "requires_payment_method",
      });

      mockPaymentIntentsRetrieve.mockResolvedValue(mockPaymentIntent);

      // Act
      const result = await paymentService.confirmPayment("pi_test_123");

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(false);
      expect(result.data?.status).toBe("requires_payment_method");
    });

    it("should return error if Stripe retrieval fails", async () => {
      // Arrange
      mockPaymentIntentsRetrieve.mockRejectedValue(
        new Error("Stripe API error"),
      );

      // Act
      const result = await paymentService.confirmPayment("pi_test_123");

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PAYMENT_CONFIRMATION_FAILED");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ✨ HANDLE PAYMENT SUCCESS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("handlePaymentSuccess", () => {
    it("should update order to PAID status with ServiceResponse", async () => {
      // Arrange
      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        amount: 9999,
        metadata: { orderId: "550e8400-e29b-41d4-a716-446655440001" },
      });

      const mockOrder = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        paymentStatus: "PENDING",
      };

      jest
        .mocked(database.order.findFirst)
        .mockResolvedValue(mockOrder as unknown as Order);
      jest.mocked(database.order.update).mockResolvedValue({
        ...mockOrder,
        paymentStatus: "PAID",
      } as unknown as Order);

      // Act
      const result = await paymentService.handlePaymentSuccess(
        mockPaymentIntent as any,
      );

      // Assert
      expect(result.success).toBe(true);
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "550e8400-e29b-41d4-a716-446655440001" },
        data: expect.objectContaining({
          paymentStatus: "PAID",
          paymentIntentId: "pi_test_123",
          paidAt: expect.any(Date),
          status: "CONFIRMED",
        }),
      });
    });

    it("should return error if orderId missing in metadata", async () => {
      // Arrange
      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        metadata: {},
      });

      // Act
      const result = await paymentService.handlePaymentSuccess(
        mockPaymentIntent as any,
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("MISSING_ORDER_ID");
      expect(result.error?.message).toContain("orderId");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ❌ HANDLE PAYMENT FAILURE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("handlePaymentFailure", () => {
    it("should update order to FAILED status with ServiceResponse", async () => {
      // Arrange
      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        metadata: { orderId: "550e8400-e29b-41d4-a716-446655440001" },
        last_payment_error: { message: "Card declined" },
      });

      const mockOrder = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        paymentStatus: "PENDING",
      };

      jest
        .mocked(database.order.findFirst)
        .mockResolvedValue(mockOrder as unknown as Order);
      jest.mocked(database.order.update).mockResolvedValue({
        ...mockOrder,
        paymentStatus: "FAILED",
      } as unknown as Order);

      // Act
      const result = await paymentService.handlePaymentFailure(
        mockPaymentIntent as any,
      );

      // Assert
      expect(result.success).toBe(true);
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "550e8400-e29b-41d4-a716-446655440001" },
        data: expect.objectContaining({
          paymentStatus: "FAILED",
        }),
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 💰 CREATE REFUND TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("createRefund", () => {
    it("should create full refund successfully with ServiceResponse", async () => {
      // Arrange
      const mockRefund = createMockRefund({
        id: "re_test_123",
        amount: 9999,
        status: "succeeded",
        reason: "requested_by_customer",
      });

      mockRefundsCreate.mockResolvedValue(mockRefund);

      // Act
      const result = await paymentService.createRefund({
        paymentIntentId: "pi_test_123",
        reason: "requested_by_customer",
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: mockRefund.id,
        status: mockRefund.status,
        reason: mockRefund.reason,
      });
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
      const result = await paymentService.createRefund({
        paymentIntentId: "pi_test_123",
        amount: 50.0,
        reason: "requested_by_customer",
      });

      // Assert
      expect(result.success).toBe(true);
      expect(mockRefundsCreate).toHaveBeenCalledWith({
        payment_intent: "pi_test_123",
        amount: 5000,
        reason: "requested_by_customer",
      });
    });

    it("should return error for zero or negative refund amount", async () => {
      // Act
      const result = await paymentService.createRefund({
        paymentIntentId: "pi_test_123",
        amount: -50,
        reason: "requested_by_customer",
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("REFUND_CREATION_FAILED");
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
      const result = await paymentService.createRefund({
        paymentIntentId: "pi_test_123",
        reason: "duplicate",
      });

      // Assert
      expect(result.success).toBe(true);
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
    it("should update order to REFUNDED status with ServiceResponse", async () => {
      // Arrange
      const mockCharge = createMockCharge({
        id: "ch_test_123",
        payment_intent: "pi_test_123",
        amount_refunded: 9999,
      });

      const mockOrder = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        paymentIntentId: "pi_test_123",
      };

      jest
        .mocked(database.order.findFirst)
        .mockResolvedValue(mockOrder as unknown as Order);
      jest.mocked(database.order.update).mockResolvedValue({
        ...mockOrder,
        paymentStatus: "REFUNDED",
      } as unknown as Order);

      // Act
      const result = await paymentService.handleRefund(mockCharge as any);

      // Assert
      expect(result.success).toBe(true);
      expect(database.order.update).toHaveBeenCalledWith({
        where: { id: "550e8400-e29b-41d4-a716-446655440001" },
        data: expect.objectContaining({
          paymentStatus: "REFUNDED",
        }),
      });
    });

    it("should return error if charge without payment_intent", async () => {
      // Arrange
      const mockCharge = createMockCharge({
        id: "ch_test_123",
        payment_intent: null,
      });

      // Act
      const result = await paymentService.handleRefund(mockCharge as any);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("MISSING_PAYMENT_INTENT");
    });

    it("should return error if order not found", async () => {
      // Arrange
      const mockCharge = createMockCharge({
        id: "ch_test_123",
        payment_intent: "pi_test_123",
      });

      jest.mocked(database.order.findFirst).mockResolvedValue(null);

      // Act
      const result = await paymentService.handleRefund(mockCharge as any);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORDER_NOT_FOUND");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 GET PAYMENT DETAILS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("getPaymentDetails", () => {
    it("should return order and payment intent with ServiceResponse", async () => {
      // Arrange
      const mockOrder = {
        id: "550e8400-e29b-41d4-a716-446655440001",
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
        .mockResolvedValue(mockOrder as unknown as Order);
      mockPaymentIntentsRetrieve.mockResolvedValue(mockPaymentIntent);

      // Act
      const result = await paymentService.getPaymentDetails(
        "550e8400-e29b-41d4-a716-446655440001",
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.order).toBeDefined();
      expect(result.data?.paymentIntent).toBeDefined();
    });

    it("should return order without payment intent if none exists", async () => {
      // Arrange
      const mockOrder = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        paymentIntentId: null,
        total: 99.99,
      };

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as unknown as Order);

      // Act
      const result = await paymentService.getPaymentDetails(
        "550e8400-e29b-41d4-a716-446655440001",
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.order).toBeDefined();
      expect(result.data?.paymentIntent).toBeUndefined();
    });

    it("should return error if order not found", async () => {
      // Arrange
      jest.mocked(database.order.findUnique).mockResolvedValue(null);

      // Act
      const result = await paymentService.getPaymentDetails("order-999");

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORDER_NOT_FOUND");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔐 VERIFY WEBHOOK SIGNATURE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("verifyWebhookSignature", () => {
    it("should verify valid webhook signature with ServiceResponse", async () => {
      // Arrange
      const mockEvent = createMockEvent();
      const payload = JSON.stringify(mockEvent);
      const signature = "valid_signature";

      mockWebhooksConstructEvent.mockReturnValue(mockEvent);

      // Act
      const result = await paymentService.verifyWebhookSignature({
        payload,
        signature,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEvent);
    });

    it("should return error if webhook secret not configured", async () => {
      // Arrange
      delete process.env.STRIPE_WEBHOOK_SECRET;
      const newService = new PaymentService();

      // Act
      const result = await newService.verifyWebhookSignature({
        payload: "payload",
        signature: "signature",
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("STRIPE_CONFIG_ERROR");
    });

    it("should return error for invalid signature", async () => {
      // Arrange
      mockWebhooksConstructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      // Act
      const result = await paymentService.verifyWebhookSignature({
        payload: "payload",
        signature: "invalid_signature",
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("WEBHOOK_VERIFICATION_FAILED");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧪 EDGE CASES & ERROR SCENARIOS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Edge Cases", () => {
    it("should handle Stripe API errors gracefully with ServiceResponse", async () => {
      // Arrange
      const mockOrder = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        total: 99.99,
      };

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrder as unknown as Order);
      mockPaymentIntentsCreate.mockRejectedValue(
        new Error("Stripe API unavailable"),
      );

      // Act
      const result = await paymentService.createPaymentIntent({
        orderId: "550e8400-e29b-41d4-a716-446655440001",
        amount: 99.99,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PAYMENT_INTENT_CREATION_FAILED");
      expect(result.error?.message).toContain(
        "Failed to create payment intent",
      );
    });

    it("should round amounts correctly to avoid floating point issues", async () => {
      // Arrange
      const mockOrder = {
        id: "550e8400-e29b-41d4-a716-446655440001",
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
        .mockResolvedValue(mockOrder as unknown as Order);
      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);
      jest
        .mocked(database.order.update)
        .mockResolvedValue(mockOrder as unknown as Order);

      // Act
      const result = await paymentService.createPaymentIntent({
        orderId: "550e8400-e29b-41d4-a716-446655440001",
        amount: 99.999,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10000, // Should round to 100.00 -> 10000 cents
        }),
      );
    });

    it("should handle database connection errors", async () => {
      // Arrange
      jest
        .mocked(database.order.findUnique)
        .mockRejectedValue(new Error("Database connection lost"));

      // Act
      const result = await paymentService.createPaymentIntent({
        orderId: "550e8400-e29b-41d4-a716-446655440001",
        amount: 99.99,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PAYMENT_INTENT_CREATION_FAILED");
    });

    it("should handle missing customer or farm data gracefully", async () => {
      // Arrange
      const mockOrderNoCustomer = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        customerId: null,
        farmId: null,
        total: 99.99,
        paymentIntentId: null,
        paymentStatus: "PENDING",
      };

      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
        amount: 9999,
        currency: "usd",
        status: "requires_payment_method",
      });

      jest
        .mocked(database.order.findUnique)
        .mockResolvedValue(mockOrderNoCustomer as unknown as Order);
      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);
      jest
        .mocked(database.order.update)
        .mockResolvedValue(mockOrderNoCustomer as unknown as Order);

      // Act
      const result = await paymentService.createPaymentIntent({
        orderId: "550e8400-e29b-41d4-a716-446655440001",
        amount: 99.99,
      });

      // Assert - Should still succeed with minimal metadata
      expect(result.success).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌾 AGRICULTURAL CONSCIOUSNESS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Agricultural Consciousness", () => {
    it("should include farm context in payment description", async () => {
      // Arrange
      const mockOrder = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        customerId: "customer-456",
        farmId: "farm-789",
        total: 99.99,
        paymentIntentId: null,
        paymentStatus: "PENDING",
        farm: { name: "Quantum Harvest Farm" },
      };

      const mockPaymentIntent = createMockPaymentIntent({
        id: "pi_test_123",
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
      const result = await paymentService.createPaymentIntent({
        orderId: "550e8400-e29b-41d4-a716-446655440001",
        amount: 99.99,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining("Quantum Harvest Farm"),
        }),
      );
    });

    it("should maintain divine consciousness in error messages", async () => {
      // Arrange
      jest.mocked(database.order.findUnique).mockResolvedValue(null);

      // Act
      const result = await paymentService.createPaymentIntent({
        orderId: "order-nonexistent",
        amount: 99.99,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBeTruthy();
      expect(result.error?.code).toBe("PAYMENT_INTENT_CREATION_FAILED");
    });
  });
});
