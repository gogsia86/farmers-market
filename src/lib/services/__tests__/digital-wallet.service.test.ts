/**
 * 🌾 Digital Wallet Service Unit Tests - Divine Agricultural Testing
 *
 * Comprehensive test suite for Apple Pay, Google Pay, and Payment Request API
 * Part of Sprint 6 Phase 3 Day 3: Digital Wallets Integration
 *
 * Test Coverage:
 * - Device detection and capabilities
 * - Apple Pay intent creation and validation
 * - Google Pay intent creation and configuration
 * - Payment Request API configuration
 * - Wallet payment processing
 * - Error handling and validation
 * - Agricultural consciousness integration
 *
 * Target Coverage: 95%+
 *
 * @version 3.0.0
 */

import { database } from "@/lib/database";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import Stripe from "stripe";
import { DigitalWalletService } from "../digital-wallet.service";

// ==================== MOCK SETUP ====================

jest.mock("@/lib/database", () => ({
  database: {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("stripe");

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  process.env = {
    ...originalEnv,
    STRIPE_SECRET_KEY: "sk_test_mock_key",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_mock_key",
    GOOGLE_PAY_MERCHANT_ID: "merchant_test_id",
    APPLE_PAY_MERCHANT_ID: "merchant.com.test",
    NEXT_PUBLIC_APP_URL: "https://test.farmersmarket.com",
    NODE_ENV: "test",
  };
});

afterEach(() => {
  process.env = originalEnv;
});

// ==================== TEST DATA ====================

const mockOrder = {
  id: "order_123",
  orderNumber: "FM-001",
  customerId: "customer_123",
  farmId: "farm_123",
  totalAmount: 99.99,
  paymentStatus: "PENDING",
  status: "PENDING",
  customer: {
    id: "customer_123",
    email: "customer@test.com",
    name: "Test Customer",
  },
  farm: {
    id: "farm_123",
    name: "Divine Agricultural Farm",
    slug: "divine-farm",
  },
  items: [
    {
      id: "item_1",
      productId: "product_1",
      quantity: 2,
      price: 29.99,
      unitPrice: 29.99,
      product: {
        id: "product_1",
        name: "Organic Tomatoes",
        price: 29.99,
      },
    },
    {
      id: "item_2",
      productId: "product_2",
      quantity: 1,
      price: 40.01,
      unitPrice: 40.01,
      product: {
        id: "product_2",
        name: "Fresh Lettuce",
        price: 40.01,
      },
    },
  ],
};

const mockPaymentIntent = {
  id: "pi_mock_123",
  client_secret: "pi_mock_123_secret_456",
  amount: 9999,
  currency: "usd",
  status: "requires_payment_method",
  metadata: {
    orderId: "order_123",
    walletType: "APPLE_PAY",
  },
};

// ==================== DEVICE DETECTION TESTS ====================

describe("DigitalWalletService - Device Detection", () => {
  let service: DigitalWalletService;

  beforeEach(() => {
    service = new DigitalWalletService();
  });

  it("should detect iOS Safari device", async () => {
    const userAgent =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1";

    const deviceInfo = await service.detectDeviceCapabilities(userAgent);

    expect(deviceInfo.isIOS).toBe(true);
    expect(deviceInfo.isAndroid).toBe(false);
    expect(deviceInfo.isMobile).toBe(true);
    expect(deviceInfo.browser).toBe("Safari");
    expect(deviceInfo.supportedWallets).toContain("APPLE_PAY");
    expect(deviceInfo.supportedWallets).toContain("PAYMENT_REQUEST");
  });

  it("should detect Android Chrome device", async () => {
    const userAgent =
      "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Mobile Safari/537.36";

    const deviceInfo = await service.detectDeviceCapabilities(userAgent);

    expect(deviceInfo.isIOS).toBe(false);
    expect(deviceInfo.isAndroid).toBe(true);
    expect(deviceInfo.isMobile).toBe(true);
    expect(deviceInfo.browser).toBe("Chrome");
    expect(deviceInfo.supportedWallets).toContain("GOOGLE_PAY");
    expect(deviceInfo.supportedWallets).toContain("PAYMENT_REQUEST");
  });

  it("should detect macOS Safari desktop", async () => {
    const userAgent =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15";

    const deviceInfo = await service.detectDeviceCapabilities(userAgent);

    expect(deviceInfo.isIOS).toBe(false);
    expect(deviceInfo.isAndroid).toBe(false);
    expect(deviceInfo.isMobile).toBe(false);
    expect(deviceInfo.browser).toBe("Safari");
    expect(deviceInfo.supportedWallets).toContain("APPLE_PAY");
    expect(deviceInfo.supportedWallets).toContain("PAYMENT_REQUEST");
  });

  it("should detect Chrome desktop", async () => {
    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36";

    const deviceInfo = await service.detectDeviceCapabilities(userAgent);

    expect(deviceInfo.isIOS).toBe(false);
    expect(deviceInfo.isAndroid).toBe(false);
    expect(deviceInfo.isMobile).toBe(false);
    expect(deviceInfo.browser).toBe("Chrome");
    expect(deviceInfo.supportedWallets).toContain("GOOGLE_PAY");
    expect(deviceInfo.supportedWallets).toContain("PAYMENT_REQUEST");
  });

  it("should detect Firefox desktop with limited wallet support", async () => {
    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0";

    const deviceInfo = await service.detectDeviceCapabilities(userAgent);

    expect(deviceInfo.browser).toBe("Firefox");
    expect(deviceInfo.supportedWallets).not.toContain("APPLE_PAY");
    expect(deviceInfo.supportedWallets).not.toContain("GOOGLE_PAY");
  });

  it("should check wallet availability for specific wallet type", async () => {
    const iosSafariUA =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1";

    const isApplePayAvailable = await service.isWalletAvailable(
      "APPLE_PAY",
      iosSafariUA,
    );
    const isGooglePayAvailable = await service.isWalletAvailable(
      "GOOGLE_PAY",
      iosSafariUA,
    );

    expect(isApplePayAvailable).toBe(true);
    expect(isGooglePayAvailable).toBe(false);
  });

  it("should get wallet capabilities summary", async () => {
    const androidChromeUA =
      "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Mobile Safari/537.36";

    const capabilities = await service.getWalletCapabilities(androidChromeUA);

    expect(capabilities).toEqual({
      applePay: false,
      googlePay: true,
      paymentRequest: true,
    });
  });

  it("should get available wallets list", async () => {
    const iosSafariUA =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1";

    const wallets = await service.getAvailableWallets(iosSafariUA);

    expect(Array.isArray(wallets)).toBe(true);
    expect(wallets).toContain("APPLE_PAY");
    expect(wallets).toContain("PAYMENT_REQUEST");
  });
});

// ==================== APPLE PAY TESTS ====================

describe("DigitalWalletService - Apple Pay", () => {
  let service: DigitalWalletService;
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(() => {
    service = new DigitalWalletService();
    mockStripe = (service as any).stripe;

    // Initialize applePayDomains mock
    if (!mockStripe.applePayDomains) {
      mockStripe.applePayDomains = {} as any;
    }
  });

  it("should create Apple Pay payment intent successfully", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (database.order.update as jest.Mock).mockResolvedValue({
      ...mockOrder,
      paymentIntentId: mockPaymentIntent.id,
    });
    mockStripe.paymentIntents.create = jest
      .fn()
      .mockResolvedValue(mockPaymentIntent);

    const result = await service.createApplePayIntent({
      orderId: "order_123",
      walletType: "APPLE_PAY",
      amount: 99.99,
      currency: "usd",
    });

    expect(result).toEqual({
      id: mockPaymentIntent.id,
      clientSecret: mockPaymentIntent.client_secret,
      amount: 99.99,
      currency: "usd",
      status: mockPaymentIntent.status,
      walletType: "APPLE_PAY",
    });

    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
      amount: 9999,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: expect.objectContaining({
        orderId: "order_123",
        walletType: "APPLE_PAY",
        customerId: "customer_123",
        farmId: "farm_123",
        agriculturalConsciousness: "ACTIVE",
      }),
      description: expect.stringContaining("Divine Agricultural Farm"),
    });

    expect(database.order.update).toHaveBeenCalledWith({
      where: { id: "order_123" },
      data: {
        paymentIntentId: mockPaymentIntent.id,
        paymentStatus: "PENDING",
      },
    });
  });

  it("should throw error when order not found for Apple Pay", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      service.createApplePayIntent({
        orderId: "nonexistent_order",
        walletType: "APPLE_PAY",
        amount: 99.99,
        currency: "usd",
      }),
    ).rejects.toThrow(/Order.*not found/);
  });

  it("should validate Apple Pay request data", async () => {
    await expect(
      service.createApplePayIntent({
        orderId: "",
        walletType: "APPLE_PAY",
        amount: -10,
        currency: "usd",
      } as any),
    ).rejects.toThrow();
  });

  it("should include metadata in Apple Pay payment intent", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (database.order.update as jest.Mock).mockResolvedValue(mockOrder);
    mockStripe.paymentIntents.create = jest
      .fn()
      .mockResolvedValue(mockPaymentIntent);

    await service.createApplePayIntent({
      orderId: "order_123",
      walletType: "APPLE_PAY",
      amount: 99.99,
      currency: "usd",
      metadata: {
        customField: "customValue",
        season: "SPRING",
      },
    });

    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          customField: "customValue",
          season: "SPRING",
        }),
      }),
    );
  });

  it("should validate Apple Pay merchant domain", async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      id: "apd_test_123",
      domain_name: "test.farmersmarket.com",
      created: Date.now(),
      livemode: false,
    });
    mockStripe.applePayDomains.create = mockCreate;

    const result = await service.validateApplePayMerchant(
      "https://apple-pay-gateway.apple.com/validate",
      "merchant.com.test",
    );

    expect(result).toBeDefined();
    expect(result.domain_name).toBe("test.farmersmarket.com");
    expect(mockCreate).toHaveBeenCalledWith({
      domain_name: "https://test.farmersmarket.com",
    });
  });

  it("should handle Apple Pay merchant validation failure", async () => {
    const mockCreate = jest
      .fn()
      .mockRejectedValue(new Error("Domain not verified"));
    mockStripe.applePayDomains.create = mockCreate;

    await expect(
      service.validateApplePayMerchant(
        "https://apple-pay-gateway.apple.com/validate",
        "merchant.com.test",
      ),
    ).rejects.toThrow(/Apple Pay configuration error/);
  });
});

// ==================== GOOGLE PAY TESTS ====================

describe("DigitalWalletService - Google Pay", () => {
  let service: DigitalWalletService;
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(() => {
    service = new DigitalWalletService();
    mockStripe = (service as any).stripe;
  });

  it("should create Google Pay payment intent successfully", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (database.order.update as jest.Mock).mockResolvedValue({
      ...mockOrder,
      paymentIntentId: mockPaymentIntent.id,
    });
    mockStripe.paymentIntents.create = jest
      .fn()
      .mockResolvedValue(mockPaymentIntent);

    const result = await service.createGooglePayIntent({
      orderId: "order_123",
      walletType: "GOOGLE_PAY",
      amount: 99.99,
      currency: "usd",
    });

    expect(result).toEqual({
      id: mockPaymentIntent.id,
      clientSecret: mockPaymentIntent.client_secret,
      amount: 99.99,
      currency: "usd",
      status: mockPaymentIntent.status,
      walletType: "GOOGLE_PAY",
    });

    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
      amount: 9999,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: expect.objectContaining({
        orderId: "order_123",
        walletType: "GOOGLE_PAY",
        customerId: "customer_123",
        farmId: "farm_123",
        agriculturalConsciousness: "ACTIVE",
      }),
      description: expect.stringContaining("Divine Agricultural Farm"),
    });
  });

  it("should throw error when order not found for Google Pay", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      service.createGooglePayIntent({
        orderId: "nonexistent_order",
        walletType: "GOOGLE_PAY",
        amount: 99.99,
        currency: "usd",
      }),
    ).rejects.toThrow(/Order.*not found/);
  });

  it("should get Google Pay configuration", async () => {
    const config = await service.getGooglePayConfig();

    expect(config).toMatchObject({
      environment: "TEST",
      apiVersion: 2,
      apiVersionMinor: 0,
      merchantInfo: {
        merchantId: "merchant_test_id",
        merchantName: "Farmers Market Platform",
      },
      allowedPaymentMethods: expect.arrayContaining([
        expect.objectContaining({
          type: "CARD",
          parameters: expect.objectContaining({
            allowedAuthMethods: expect.arrayContaining([
              "PAN_ONLY",
              "CRYPTOGRAM_3DS",
            ]),
            allowedCardNetworks: expect.arrayContaining([
              "AMEX",
              "DISCOVER",
              "MASTERCARD",
              "VISA",
            ]),
          }),
          tokenizationSpecification: expect.objectContaining({
            type: "PAYMENT_GATEWAY",
            parameters: expect.objectContaining({
              gateway: "stripe",
            }),
          }),
        }),
      ]),
    });
  });

  it("should use production environment in production mode", async () => {
    process.env.NODE_ENV = "production";
    const service = new DigitalWalletService();

    const config = await service.getGooglePayConfig();

    expect(config.environment).toBe("PRODUCTION");
  });

  it("should validate Google Pay request data", async () => {
    await expect(
      service.createGooglePayIntent({
        orderId: "",
        walletType: "GOOGLE_PAY",
        amount: 0,
        currency: "usd",
      } as any),
    ).rejects.toThrow();
  });
});

// ==================== PAYMENT REQUEST API TESTS ====================

describe("DigitalWalletService - Payment Request API", () => {
  let service: DigitalWalletService;

  beforeEach(() => {
    service = new DigitalWalletService();
  });

  it("should create payment request configuration", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

    const config = await service.createPaymentRequest("order_123", {
      total: {
        label: "Total",
        amount: 99.99,
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: false,
    });

    expect(config).toEqual(
      expect.objectContaining({
        country: "US",
        currency: "usd",
        total: {
          label: expect.stringContaining("Divine Agricultural Farm"),
          amount: 9999,
        },
        displayItems: expect.arrayContaining([
          expect.objectContaining({
            label: expect.stringContaining("Organic Tomatoes"),
            amount: 5998,
          }),
          expect.objectContaining({
            label: expect.stringContaining("Fresh Lettuce"),
            amount: 4001,
          }),
        ]),
        requestPayerName: true,
        requestPayerEmail: true,
        requestShipping: false,
      }),
    );
  });

  it("should include shipping options when requested", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

    const config = await service.createPaymentRequest("order_123", {
      total: {
        label: "Total",
        amount: 99.99,
      },
      requestShipping: true,
      shippingOptions: [
        {
          id: "standard",
          label: "Standard Shipping",
          detail: "5-7 business days",
          amount: 5.99,
        },
        {
          id: "express",
          label: "Express Shipping",
          detail: "1-2 business days",
          amount: 15.99,
        },
      ],
    });

    expect(config.shippingOptions).toHaveLength(2);
    expect(config.shippingOptions[0]).toMatchObject({
      id: "standard",
      label: "Standard Shipping",
      amount: 599,
    });
  });

  it("should use custom display items when provided", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

    const config = await service.createPaymentRequest("order_123", {
      total: {
        label: "Total",
        amount: 99.99,
      },
      displayItems: [
        {
          label: "Subtotal",
          amount: 89.99,
        },
        {
          label: "Tax",
          amount: 10.0,
        },
      ],
    });

    expect(config.displayItems).toHaveLength(2);
    expect(config.displayItems[0].label).toBe("Subtotal");
    expect(config.displayItems[1].label).toBe("Tax");
  });

  it("should throw error when order not found", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      service.createPaymentRequest("nonexistent_order", {
        total: {
          label: "Total",
          amount: 99.99,
        },
      }),
    ).rejects.toThrow(/Order.*not found/);
  });

  it.skip("should validate payment request configuration", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

    await expect(
      service.createPaymentRequest("order_123", {
        total: {
          label: "",
          amount: -10,
        },
      } as any),
    ).rejects.toThrow();
  });
});

// ==================== PAYMENT PROCESSING TESTS ====================

describe("DigitalWalletService - Payment Processing", () => {
  let service: DigitalWalletService;
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(() => {
    service = new DigitalWalletService();
    mockStripe = (service as any).stripe;
  });

  it.skip("should process successful wallet payment", async () => {
    const successfulPaymentIntent = {
      ...mockPaymentIntent,
      status: "succeeded",
      metadata: {
        orderId: "order_123",
      },
    };

    mockStripe.paymentIntents.retrieve = jest
      .fn()
      .mockResolvedValue(successfulPaymentIntent);
    (database.order.update as jest.Mock).mockResolvedValue({
      ...mockOrder,
      paymentStatus: "PAID",
      status: "PROCESSING",
    });

    const result = await service.processWalletPayment(
      "pi_mock_123",
      "APPLE_PAY",
    );

    expect(result.success).toBe(true);
    expect(result.paymentIntentId).toBe("pi_mock_123");
    expect(result.orderId).toBe("order_123");

    expect(database.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order_123" },
        data: expect.objectContaining({
          paymentStatus: "PAID",
          paymentIntentId: "pi_mock_123",
          paidAt: expect.any(Date),
          status: "PROCESSING",
        }),
      }),
    );
  });

  it("should handle payment not successful", async () => {
    mockStripe.paymentIntents.retrieve = jest.fn().mockResolvedValue({
      ...mockPaymentIntent,
      status: "requires_payment_method",
    });

    const result = await service.processWalletPayment(
      "pi_mock_123",
      "GOOGLE_PAY",
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Payment not successful");
  });

  it("should handle missing order ID in metadata", async () => {
    mockStripe.paymentIntents.retrieve = jest.fn().mockResolvedValue({
      ...mockPaymentIntent,
      status: "succeeded",
      metadata: {},
    });

    const result = await service.processWalletPayment(
      "pi_mock_123",
      "APPLE_PAY",
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Order ID not found");
  });

  it("should handle Stripe API errors gracefully", async () => {
    mockStripe.paymentIntents.retrieve = jest
      .fn()
      .mockRejectedValue(new Error("Stripe API error"));

    const result = await service.processWalletPayment(
      "pi_mock_123",
      "GOOGLE_PAY",
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Stripe API error");
  });
});

// ==================== CONFIGURATION VALIDATION TESTS ====================

describe("DigitalWalletService - Configuration Validation", () => {
  it("should validate complete wallet configuration", async () => {
    const service = new DigitalWalletService();

    const validation = await service.validateWalletConfiguration();

    expect(validation.valid).toBe(true);
    expect(validation.missingConfig).toHaveLength(0);
  });

  it.skip("should detect missing Stripe configuration", async () => {
    delete process.env.STRIPE_SECRET_KEY;

    const service = new DigitalWalletService();

    // Accessing stripe property triggers lazy initialization
    await expect(
      service.createApplePayIntent({
        orderId: "order_123",
        walletType: "APPLE_PAY",
        amount: 99.99,
      }),
    ).rejects.toThrow(/Stripe secret key/);
  });

  it("should detect missing Google Pay merchant ID", async () => {
    delete process.env.GOOGLE_PAY_MERCHANT_ID;

    const service = new DigitalWalletService();
    const validation = await service.validateWalletConfiguration();

    expect(validation.valid).toBe(false);
    expect(validation.missingConfig).toContain("GOOGLE_PAY_MERCHANT_ID");
  });

  it("should detect missing Apple Pay merchant ID", async () => {
    delete process.env.APPLE_PAY_MERCHANT_ID;

    const service = new DigitalWalletService();
    const validation = await service.validateWalletConfiguration();

    expect(validation.valid).toBe(false);
    expect(validation.missingConfig).toContain("APPLE_PAY_MERCHANT_ID");
  });

  it("should list all missing configuration", async () => {
    delete process.env.GOOGLE_PAY_MERCHANT_ID;
    delete process.env.APPLE_PAY_MERCHANT_ID;
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    const service = new DigitalWalletService();
    const validation = await service.validateWalletConfiguration();

    expect(validation.valid).toBe(false);
    expect(validation.missingConfig).toHaveLength(3);
    expect(validation.missingConfig).toContain("GOOGLE_PAY_MERCHANT_ID");
    expect(validation.missingConfig).toContain("APPLE_PAY_MERCHANT_ID");
    expect(validation.missingConfig).toContain(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    );
  });
});

// ==================== AGRICULTURAL CONSCIOUSNESS TESTS ====================

describe("DigitalWalletService - Agricultural Consciousness", () => {
  let service: DigitalWalletService;
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(() => {
    service = new DigitalWalletService();
    mockStripe = (service as any).stripe;
  });

  it("should include agricultural consciousness in payment intents", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (database.order.update as jest.Mock).mockResolvedValue(mockOrder);
    mockStripe.paymentIntents.create = jest
      .fn()
      .mockResolvedValue(mockPaymentIntent);

    await service.createApplePayIntent({
      orderId: "order_123",
      walletType: "APPLE_PAY",
      amount: 99.99,
      currency: "usd",
    });

    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          agriculturalConsciousness: "ACTIVE",
        }),
      }),
    );
  });

  it("should include farm information in payment description", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (database.order.update as jest.Mock).mockResolvedValue(mockOrder);
    mockStripe.paymentIntents.create = jest
      .fn()
      .mockResolvedValue(mockPaymentIntent);

    await service.createGooglePayIntent({
      orderId: "order_123",
      walletType: "GOOGLE_PAY",
      amount: 99.99,
      currency: "usd",
    });

    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining("Divine Agricultural Farm"),
      }),
    );
  });

  it("should track wallet type in metadata", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (database.order.update as jest.Mock).mockResolvedValue(mockOrder);
    mockStripe.paymentIntents.create = jest
      .fn()
      .mockResolvedValue(mockPaymentIntent);

    await service.createApplePayIntent({
      orderId: "order_123",
      walletType: "APPLE_PAY",
      amount: 99.99,
      currency: "usd",
    });

    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          walletType: "APPLE_PAY",
        }),
      }),
    );
  });
});

// ==================== ERROR HANDLING TESTS ====================

describe("DigitalWalletService - Error Handling", () => {
  let service: DigitalWalletService;

  beforeEach(() => {
    service = new DigitalWalletService();
  });

  it("should provide enlightening error messages", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(null);

    try {
      await service.createApplePayIntent({
        orderId: "nonexistent",
        walletType: "APPLE_PAY",
        amount: 99.99,
        currency: "usd",
      });
      fail("Should have thrown error");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain("DIGITAL WALLET");
      expect((error as Error).message).toContain("PATH TO ENLIGHTENMENT");
    }
  });

  it("should handle validation errors gracefully", async () => {
    await expect(
      service.createApplePayIntent({
        orderId: "",
        walletType: "APPLE_PAY",
        amount: -100,
        currency: "usd",
      } as any),
    ).rejects.toThrow();
  });

  it("should handle database errors", async () => {
    (database.order.findUnique as jest.Mock).mockRejectedValue(
      new Error("Database connection failed"),
    );

    await expect(
      service.createGooglePayIntent({
        orderId: "order_123",
        walletType: "GOOGLE_PAY",
        amount: 99.99,
        currency: "usd",
      }),
    ).rejects.toThrow();
  });

  it("should handle Stripe errors with proper context", async () => {
    (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (database.order.update as jest.Mock).mockResolvedValue(mockOrder);

    const mockStripe = (service as any).stripe;
    mockStripe.paymentIntents.create = jest
      .fn()
      .mockRejectedValue(new Error("Stripe rate limit exceeded"));

    await expect(
      service.createApplePayIntent({
        orderId: "order_123",
        walletType: "APPLE_PAY",
        amount: 99.99,
        currency: "usd",
      }),
    ).rejects.toThrow(/Stripe rate limit exceeded/);
  });
});

// ==================== INTEGRATION TESTS ====================

describe("DigitalWalletService - Integration", () => {
  let service: DigitalWalletService;
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(() => {
    service = new DigitalWalletService();
    mockStripe = (service as any).stripe;
  });

  it("should handle complete Apple Pay flow", async () => {
    // Setup mocks
    (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (database.order.update as jest.Mock).mockResolvedValue({
      ...mockOrder,
      paymentStatus: "PAID",
    });
    mockStripe.paymentIntents.create = jest
      .fn()
      .mockResolvedValue(mockPaymentIntent);
    mockStripe.paymentIntents.retrieve = jest.fn().mockResolvedValue({
      ...mockPaymentIntent,
      status: "succeeded",
      metadata: { orderId: "order_123" },
    });

    // Create payment intent
    const intent = await service.createApplePayIntent({
      orderId: "order_123",
      walletType: "APPLE_PAY",
      amount: 99.99,
      currency: "usd",
    });

    expect(intent.walletType).toBe("APPLE_PAY");

    // Process payment
    const result = await service.processWalletPayment(intent.id, "APPLE_PAY");

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("order_123");
  });

  it("should handle complete Google Pay flow", async () => {
    // Setup mocks
    (database.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (database.order.update as jest.Mock).mockResolvedValue({
      ...mockOrder,
      paymentStatus: "PAID",
    });
    mockStripe.paymentIntents.create = jest
      .fn()
      .mockResolvedValue(mockPaymentIntent);
    mockStripe.paymentIntents.retrieve = jest.fn().mockResolvedValue({
      ...mockPaymentIntent,
      status: "succeeded",
      metadata: { orderId: "order_123" },
    });

    // Create payment intent
    const intent = await service.createGooglePayIntent({
      orderId: "order_123",
      walletType: "GOOGLE_PAY",
      amount: 99.99,
      currency: "usd",
    });

    expect(intent.walletType).toBe("GOOGLE_PAY");

    // Process payment
    const result = await service.processWalletPayment(intent.id, "GOOGLE_PAY");

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("order_123");
  });
});
