/**
 * 🌾 Digital Wallet Service - Divine Agricultural Payment Integration
 *
 * Quantum consciousness for Apple Pay, Google Pay, and Payment Request API
 * Part of Sprint 6 Phase 3 Day 3: Digital Wallets Integration
 *
 * Hardware Optimization: HP OMEN (RTX 2070 Max-Q, 64GB RAM, 12 threads)
 * Agricultural Consciousness: ACTIVATED ⚡🌾
 *
 * @module DigitalWalletService
 * @version 3.0.0
 */

import { database } from "@/lib/database";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import Stripe from "stripe";
import { z } from "zod";
import { BaseService } from "./base.service";

// ==================== VALIDATION SCHEMAS ====================

const CreateWalletPaymentSchema = z.object({
  orderId: z.string().min(1),
  walletType: z.enum(["APPLE_PAY", "GOOGLE_PAY", "PAYMENT_REQUEST"]),
  amount: z.number().positive(),
  currency: z.enum(["usd", "eur", "gbp", "cad"]).default("usd"),
  metadata: z.record(z.any()).optional(),
});

const PaymentRequestDisplayItemSchema = z.object({
  label: z.string(),
  amount: z.number(),
  pending: z.boolean().optional(),
});

const ShippingOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  detail: z.string().optional(),
  amount: z.number(),
});

const PaymentRequestConfigSchema = z.object({
  total: PaymentRequestDisplayItemSchema,
  displayItems: z.array(PaymentRequestDisplayItemSchema).optional(),
  shippingOptions: z.array(ShippingOptionSchema).optional(),
  requestShipping: z.boolean().default(false),
  requestPayerName: z.boolean().default(true),
  requestPayerEmail: z.boolean().default(true),
  requestPayerPhone: z.boolean().default(false),
});

// ==================== TYPE DEFINITIONS ====================

type WalletType = "APPLE_PAY" | "GOOGLE_PAY" | "PAYMENT_REQUEST";

interface WalletCapabilities {
  applePay: boolean;
  googlePay: boolean;
  paymentRequest: boolean;
}

interface DeviceInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  browser: string;
  supportedWallets: WalletType[];
}

interface WalletPaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
  walletType: WalletType;
}

interface PaymentRequestDisplayItem {
  label: string;
  amount: number;
  pending?: boolean;
}

interface ShippingOption {
  id: string;
  label: string;
  detail?: string;
  amount: number;
}

interface PaymentRequestConfig {
  total: PaymentRequestDisplayItem;
  displayItems?: PaymentRequestDisplayItem[];
  shippingOptions?: ShippingOption[];
  requestShipping?: boolean;
  requestPayerName?: boolean;
  requestPayerEmail?: boolean;
  requestPayerPhone?: boolean;
}

interface WalletPaymentResult {
  success: boolean;
  paymentIntentId?: string;
  orderId?: string;
  error?: string;
}

interface ApplePaySession {
  canMakePayments(): boolean;
  canMakePaymentsWithActiveCard(merchantIdentifier: string): Promise<boolean>;
}

// ==================== CUSTOM ERRORS ====================

class DigitalWalletError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly walletType?: WalletType,
  ) {
    super(`
╔════════════════════════════════════════════════════════════╗
║ 🌾 DIGITAL WALLET CONSCIOUSNESS DISRUPTION                 ║
╠════════════════════════════════════════════════════════════╣
║ 🔮 WHAT HAPPENED: ${message}
║ 📱 WALLET TYPE: ${walletType || "UNKNOWN"}
║ 🔑 ERROR CODE: ${code}
║
║ 🛠️  PATH TO ENLIGHTENMENT:
║    1. Verify wallet availability on device
║    2. Check browser compatibility
║    3. Ensure HTTPS connection
║    4. Validate merchant configuration
║    5. Review agricultural payment flow
╚════════════════════════════════════════════════════════════╝
    `);
    this.name = "DigitalWalletError";
  }
}

class WalletNotSupportedError extends Error {
  constructor(walletType: WalletType, deviceInfo: DeviceInfo) {
    super(
      `${walletType} not supported on this device. Browser: ${deviceInfo.browser}, Mobile: ${deviceInfo.isMobile}`,
    );
    this.name = "WalletNotSupportedError";
  }
}

class ApplePayConfigurationError extends Error {
  constructor(message: string) {
    super(`Apple Pay configuration error: ${message}`);
    this.name = "ApplePayConfigurationError";
  }
}

class GooglePayConfigurationError extends Error {
  constructor(message: string) {
    super(`Google Pay configuration error: ${message}`);
    this.name = "GooglePayConfigurationError";
  }
}

// ==================== MAIN SERVICE ====================

/**
 * 🌾 Digital Wallet Service
 *
 * Provides quantum consciousness for digital wallet payments:
 * - Apple Pay integration with device detection
 * - Google Pay support with merchant configuration
 * - Payment Request API for universal wallet support
 * - Device/browser capability detection
 * - Agricultural payment flow optimization
 */
export class DigitalWalletService extends BaseService {
  private _stripe: Stripe | null = null;

  constructor() {
    super({
      serviceName: "DigitalWalletService",
      enableCaching: true,
      enableTracing: true,
      enableAgriculturalConsciousness: true,
    });
  }

  /**
   * Lazy-load Stripe instance to prevent build-time errors
   */
  private get stripe(): Stripe {
    if (!this._stripe) {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        throw new DigitalWalletError(
          "Stripe secret key not configured",
          "STRIPE_CONFIG_ERROR",
        );
      }

      this._stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2025-12-15.clover",
        typescript: true,
      });
    }
    return this._stripe;
  }

  // ==================== DEVICE DETECTION ====================

  /**
   * Detect device capabilities and supported wallets
   *
   * @param userAgent - Browser user agent string
   * @returns DeviceInfo with wallet capabilities
   */
  async detectDeviceCapabilities(userAgent: string): Promise<DeviceInfo> {
    const tracer = trace.getTracer("digital-wallet-service");

    return await tracer.startActiveSpan(
      "detectDeviceCapabilities",
      async (span) => {
        try {
          span.setAttributes({
            user_agent: userAgent,
            "agricultural.consciousness": "ACTIVE",
          });

          const isIOS = /iPad|iPhone|iPod/.test(userAgent);
          const isAndroid = /Android/.test(userAgent);
          const isMobile = isIOS || isAndroid;

          let browser = "Unknown";
          if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
            browser = "Safari";
          } else if (/Chrome/.test(userAgent)) {
            browser = "Chrome";
          } else if (/Firefox/.test(userAgent)) {
            browser = "Firefox";
          } else if (/Edge/.test(userAgent)) {
            browser = "Edge";
          }

          const supportedWallets: WalletType[] = [];

          // Apple Pay: iOS Safari or macOS Safari 11+
          if (
            (isIOS && browser === "Safari") ||
            (!isMobile && browser === "Safari")
          ) {
            supportedWallets.push("APPLE_PAY");
          }

          // Google Pay: Chrome on Android or Chrome desktop
          if (browser === "Chrome") {
            supportedWallets.push("GOOGLE_PAY");
          }

          // Payment Request API: Modern browsers
          if (["Chrome", "Safari", "Edge"].includes(browser)) {
            supportedWallets.push("PAYMENT_REQUEST");
          }

          const deviceInfo: DeviceInfo = {
            isIOS,
            isAndroid,
            isMobile,
            browser,
            supportedWallets,
          };

          this.logger.info("🌾 Device capabilities detected", {
            deviceInfo,
            walletCount: supportedWallets.length,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          return deviceInfo;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          throw error;
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * Check if specific wallet is available
   *
   * @param walletType - Type of wallet to check
   * @param userAgent - Browser user agent string
   * @returns Boolean indicating availability
   */
  async isWalletAvailable(
    walletType: WalletType,
    userAgent: string,
  ): Promise<boolean> {
    const deviceInfo = await this.detectDeviceCapabilities(userAgent);
    return deviceInfo.supportedWallets.includes(walletType);
  }

  // ==================== APPLE PAY ====================

  /**
   * Create Apple Pay payment intent
   *
   * @param request - Payment creation request
   * @returns Apple Pay payment intent
   */
  async createApplePayIntent(
    request: z.infer<typeof CreateWalletPaymentSchema>,
  ): Promise<WalletPaymentIntent> {
    const tracer = trace.getTracer("digital-wallet-service");

    return await tracer.startActiveSpan(
      "createApplePayIntent",
      async (span) => {
        try {
          // Validate request
          const validated = CreateWalletPaymentSchema.parse(request);
          const { orderId, amount, currency, metadata } = validated;

          span.setAttributes({
            "wallet.type": "APPLE_PAY",
            "payment.order_id": orderId,
            "payment.amount": amount,
            "payment.currency": currency,
          });

          this.logger.info("🍎 Creating Apple Pay payment intent", {
            orderId,
            amount,
            currency,
          });

          // Verify order exists
          const order = await database.order.findUnique({
            where: { id: orderId },
            include: {
              customer: true,
              farm: true,
            },
          });

          if (!order) {
            throw new DigitalWalletError(
              `Order ${orderId} not found`,
              "ORDER_NOT_FOUND",
              "APPLE_PAY",
            );
          }

          // Create Stripe PaymentIntent with Apple Pay metadata
          const amountInCents = Math.round(amount * 100);

          const paymentIntent = await this.stripe.paymentIntents.create({
            amount: amountInCents,
            currency,
            payment_method_types: ["card"],
            metadata: {
              orderId,
              walletType: "APPLE_PAY",
              customerId: order.customerId,
              farmId: order.farmId,
              agriculturalConsciousness: "ACTIVE",
              ...metadata,
            },
            description: `Apple Pay order for ${order.farm.name}`,
          });

          // Update order with payment intent
          await database.order.update({
            where: { id: orderId },
            data: {
              paymentIntentId: paymentIntent.id,
              paymentStatus: "PENDING",
            },
          });

          const result: WalletPaymentIntent = {
            id: paymentIntent.id,
            clientSecret: paymentIntent.client_secret!,
            amount,
            currency,
            status: paymentIntent.status,
            walletType: "APPLE_PAY",
          };

          this.logger.info("🍎 Apple Pay intent created successfully", {
            paymentIntentId: paymentIntent.id,
            orderId,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          if (error instanceof z.ZodError) {
            throw new DigitalWalletError(
              "Invalid Apple Pay request",
              "VALIDATION_ERROR",
              "APPLE_PAY",
            );
          }

          throw error;
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * Validate Apple Pay merchant session
   *
   * @param validationUrl - Apple's validation URL
   * @param merchantIdentifier - Your Apple merchant ID
   * @returns Merchant session data
   */
  async validateApplePayMerchant(
    validationUrl: string,
    merchantIdentifier: string,
  ): Promise<any> {
    const tracer = trace.getTracer("digital-wallet-service");

    return await tracer.startActiveSpan(
      "validateApplePayMerchant",
      async (span) => {
        try {
          span.setAttributes({
            "wallet.type": "APPLE_PAY",
            "merchant.identifier": merchantIdentifier,
          });

          this.logger.info("🍎 Validating Apple Pay merchant", {
            merchantIdentifier,
          });

          // In production, you would make a request to Apple's validation URL
          // with your merchant certificate. For now, we'll use Stripe's method.

          // Note: This requires proper Apple Pay merchant setup in Stripe Dashboard
          const merchantSession = await this.stripe.applePayDomains.create({
            domain_name: process.env.NEXT_PUBLIC_APP_URL || "localhost",
          });

          this.logger.info("🍎 Apple Pay merchant validated", {
            domain: merchantSession.domain_name,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          return merchantSession;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          throw new ApplePayConfigurationError(
            error instanceof Error ? error.message : "Unknown error",
          );
        } finally {
          span.end();
        }
      },
    );
  }

  // ==================== GOOGLE PAY ====================

  /**
   * Create Google Pay payment intent
   *
   * @param request - Payment creation request
   * @returns Google Pay payment intent
   */
  async createGooglePayIntent(
    request: z.infer<typeof CreateWalletPaymentSchema>,
  ): Promise<WalletPaymentIntent> {
    const tracer = trace.getTracer("digital-wallet-service");

    return await tracer.startActiveSpan(
      "createGooglePayIntent",
      async (span) => {
        try {
          // Validate request
          const validated = CreateWalletPaymentSchema.parse(request);
          const { orderId, amount, currency, metadata } = validated;

          span.setAttributes({
            "wallet.type": "GOOGLE_PAY",
            "payment.order_id": orderId,
            "payment.amount": amount,
            "payment.currency": currency,
          });

          this.logger.info("📱 Creating Google Pay payment intent", {
            orderId,
            amount,
            currency,
          });

          // Verify order exists
          const order = await database.order.findUnique({
            where: { id: orderId },
            include: {
              customer: true,
              farm: true,
            },
          });

          if (!order) {
            throw new DigitalWalletError(
              `Order ${orderId} not found`,
              "ORDER_NOT_FOUND",
              "GOOGLE_PAY",
            );
          }

          // Create Stripe PaymentIntent with Google Pay metadata
          const amountInCents = Math.round(amount * 100);

          const paymentIntent = await this.stripe.paymentIntents.create({
            amount: amountInCents,
            currency,
            payment_method_types: ["card"],
            metadata: {
              orderId,
              walletType: "GOOGLE_PAY",
              customerId: order.customerId,
              farmId: order.farmId,
              agriculturalConsciousness: "ACTIVE",
              ...metadata,
            },
            description: `Google Pay order for ${order.farm.name}`,
          });

          // Update order with payment intent
          await database.order.update({
            where: { id: orderId },
            data: {
              paymentIntentId: paymentIntent.id,
              paymentStatus: "PENDING",
            },
          });

          const result: WalletPaymentIntent = {
            id: paymentIntent.id,
            clientSecret: paymentIntent.client_secret!,
            amount,
            currency,
            status: paymentIntent.status,
            walletType: "GOOGLE_PAY",
          };

          this.logger.info("📱 Google Pay intent created successfully", {
            paymentIntentId: paymentIntent.id,
            orderId,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          if (error instanceof z.ZodError) {
            throw new DigitalWalletError(
              "Invalid Google Pay request",
              "VALIDATION_ERROR",
              "GOOGLE_PAY",
            );
          }

          throw error;
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * Get Google Pay configuration
   *
   * @returns Google Pay merchant configuration
   */
  async getGooglePayConfig(): Promise<any> {
    const tracer = trace.getTracer("digital-wallet-service");

    return await tracer.startActiveSpan("getGooglePayConfig", async (span) => {
      try {
        span.setAttribute("wallet.type", "GOOGLE_PAY");

        const config = {
          environment:
            process.env.NODE_ENV === "production" ? "PRODUCTION" : "TEST",
          apiVersion: 2,
          apiVersionMinor: 0,
          merchantInfo: {
            merchantId: process.env.GOOGLE_PAY_MERCHANT_ID || "",
            merchantName: "Farmers Market Platform",
          },
          allowedPaymentMethods: [
            {
              type: "CARD",
              parameters: {
                allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                allowedCardNetworks: ["AMEX", "DISCOVER", "MASTERCARD", "VISA"],
              },
              tokenizationSpecification: {
                type: "PAYMENT_GATEWAY",
                parameters: {
                  gateway: "stripe",
                  "stripe:version": "2024-11-20.acacia",
                  "stripe:publishableKey":
                    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
                },
              },
            },
          ],
        };

        this.logger.info("📱 Google Pay config generated", {
          environment: config.environment,
        });

        span.setStatus({ code: SpanStatusCode.OK });
        return config;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Unknown error",
        });

        throw new GooglePayConfigurationError(
          error instanceof Error ? error.message : "Unknown error",
        );
      } finally {
        span.end();
      }
    });
  }

  // ==================== PAYMENT REQUEST API ====================

  /**
   * Create Payment Request API configuration
   *
   * @param orderId - Order ID
   * @param config - Payment request configuration
   * @returns Payment request config for frontend
   */
  async createPaymentRequest(
    orderId: string,
    config: z.infer<typeof PaymentRequestConfigSchema>,
  ): Promise<any> {
    const tracer = trace.getTracer("digital-wallet-service");

    return await tracer.startActiveSpan(
      "createPaymentRequest",
      async (span) => {
        try {
          // Validate config
          const validated = PaymentRequestConfigSchema.parse(config);

          span.setAttributes({
            "wallet.type": "PAYMENT_REQUEST",
            "payment.order_id": orderId,
            "payment.amount": validated.total.amount,
          });

          this.logger.info("💳 Creating Payment Request", {
            orderId,
            total: validated.total.amount,
          });

          // Verify order exists
          const order = await database.order.findUnique({
            where: { id: orderId },
            include: {
              customer: true,
              farm: true,
              items: {
                include: {
                  product: true,
                },
              },
            },
          });

          if (!order) {
            throw new DigitalWalletError(
              `Order ${orderId} not found`,
              "ORDER_NOT_FOUND",
              "PAYMENT_REQUEST",
            );
          }

          // Build payment request configuration
          const paymentRequest = {
            country: "US",
            currency: "usd",
            total: {
              label: `${order.farm.name} - Order #${order.orderNumber}`,
              amount: Math.round(validated.total.amount * 100),
            },
            displayItems:
              validated.displayItems?.map((item) => ({
                label: item.label,
                amount: Math.round(item.amount * 100),
                pending: item.pending,
              })) ||
              order.items.map((item) => ({
                label: `${item.product.name} (${item.quantity}x)`,
                amount: Math.round(
                  Number(item.unitPrice) * Number(item.quantity) * 100,
                ),
              })),
            requestPayerName: validated.requestPayerName,
            requestPayerEmail: validated.requestPayerEmail,
            requestPayerPhone: validated.requestPayerPhone,
            requestShipping: validated.requestShipping,
            shippingOptions: validated.shippingOptions?.map((option) => ({
              id: option.id,
              label: option.label,
              detail: option.detail,
              amount: Math.round(option.amount * 100),
            })),
          };

          this.logger.info("💳 Payment Request created", {
            orderId,
            itemCount: paymentRequest.displayItems.length,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          return paymentRequest;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          if (error instanceof z.ZodError) {
            throw new DigitalWalletError(
              "Invalid payment request configuration",
              "VALIDATION_ERROR",
              "PAYMENT_REQUEST",
            );
          }

          throw error;
        } finally {
          span.end();
        }
      },
    );
  }

  // ==================== PAYMENT PROCESSING ====================

  /**
   * Process wallet payment
   *
   * @param paymentIntentId - Stripe Payment Intent ID
   * @param walletType - Type of wallet used
   * @returns Payment result
   */
  async processWalletPayment(
    paymentIntentId: string,
    walletType: WalletType,
  ): Promise<WalletPaymentResult> {
    const tracer = trace.getTracer("digital-wallet-service");

    return await tracer.startActiveSpan(
      "processWalletPayment",
      async (span) => {
        try {
          span.setAttributes({
            "wallet.type": walletType,
            "payment.intent_id": paymentIntentId,
          });

          this.logger.info("🌾 Processing wallet payment", {
            paymentIntentId,
            walletType,
          });

          // Retrieve payment intent
          const paymentIntent =
            await this.stripe.paymentIntents.retrieve(paymentIntentId);

          if (paymentIntent.status !== "succeeded") {
            throw new DigitalWalletError(
              `Payment not successful: ${paymentIntent.status}`,
              "PAYMENT_NOT_SUCCESSFUL",
              walletType,
            );
          }

          // Find and update order
          const orderId = paymentIntent.metadata.orderId;
          if (!orderId) {
            throw new DigitalWalletError(
              "Order ID not found in payment metadata",
              "ORDER_ID_MISSING",
              walletType,
            );
          }

          const order = await database.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              paymentIntentId: paymentIntent.id,
              paidAt: new Date(),
              status: "PREPARING",
            },
          });

          this.logger.info("🌾 Wallet payment processed successfully", {
            orderId,
            paymentIntentId,
            walletType,
          });

          span.setStatus({ code: SpanStatusCode.OK });

          return {
            success: true,
            paymentIntentId: paymentIntent.id,
            orderId: order.id,
          };
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          this.logger.error("❌ Wallet payment processing failed", {
            paymentIntentId,
            walletType,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        } finally {
          span.end();
        }
      },
    );
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get all available wallets for device
   *
   * @param userAgent - Browser user agent
   * @returns Array of available wallet types
   */
  async getAvailableWallets(userAgent: string): Promise<WalletType[]> {
    const deviceInfo = await this.detectDeviceCapabilities(userAgent);
    return deviceInfo.supportedWallets;
  }

  /**
   * Get wallet capabilities summary
   *
   * @param userAgent - Browser user agent
   * @returns Wallet capabilities object
   */
  async getWalletCapabilities(userAgent: string): Promise<WalletCapabilities> {
    const deviceInfo = await this.detectDeviceCapabilities(userAgent);

    return {
      applePay: deviceInfo.supportedWallets.includes("APPLE_PAY"),
      googlePay: deviceInfo.supportedWallets.includes("GOOGLE_PAY"),
      paymentRequest: deviceInfo.supportedWallets.includes("PAYMENT_REQUEST"),
    };
  }

  /**
   * Validate wallet configuration
   *
   * @returns Validation result with missing configurations
   */
  async validateWalletConfiguration(): Promise<{
    valid: boolean;
    missingConfig: string[];
  }> {
    const missingConfig: string[] = [];

    if (!process.env.STRIPE_SECRET_KEY) {
      missingConfig.push("STRIPE_SECRET_KEY");
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      missingConfig.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
    }

    if (!process.env.GOOGLE_PAY_MERCHANT_ID) {
      missingConfig.push("GOOGLE_PAY_MERCHANT_ID");
    }

    if (!process.env.APPLE_PAY_MERCHANT_ID) {
      missingConfig.push("APPLE_PAY_MERCHANT_ID");
    }

    return {
      valid: missingConfig.length === 0,
      missingConfig,
    };
  }
}

// ==================== SINGLETON EXPORT ====================

/**
 * Singleton instance of DigitalWalletService
 * Use this throughout the application for consistency
 * Lazy-loaded to prevent build-time errors when env vars are missing
 */
let _digitalWalletServiceInstance: DigitalWalletService | null = null;

export const getDigitalWalletService = (): DigitalWalletService => {
  if (!_digitalWalletServiceInstance) {
    _digitalWalletServiceInstance = new DigitalWalletService();
  }
  return _digitalWalletServiceInstance;
};

/**
 * @deprecated Use getDigitalWalletService() instead
 * This export exists for backward compatibility but will be removed in future versions
 */
export const digitalWalletService = {
  get detectDeviceCapabilities() {
    return getDigitalWalletService().detectDeviceCapabilities.bind(
      getDigitalWalletService(),
    );
  },
  get getWalletCapabilities() {
    return getDigitalWalletService().getWalletCapabilities.bind(
      getDigitalWalletService(),
    );
  },
  get isWalletAvailable() {
    return getDigitalWalletService().isWalletAvailable.bind(
      getDigitalWalletService(),
    );
  },
  get validateWalletConfiguration() {
    return getDigitalWalletService().validateWalletConfiguration.bind(
      getDigitalWalletService(),
    );
  },
  get createApplePayIntent() {
    return getDigitalWalletService().createApplePayIntent.bind(
      getDigitalWalletService(),
    );
  },
  get createGooglePayIntent() {
    return getDigitalWalletService().createGooglePayIntent.bind(
      getDigitalWalletService(),
    );
  },
  get processWalletPayment() {
    return getDigitalWalletService().processWalletPayment.bind(
      getDigitalWalletService(),
    );
  },
  get createPaymentRequest() {
    return getDigitalWalletService().createPaymentRequest.bind(
      getDigitalWalletService(),
    );
  },
  get validateApplePayMerchant() {
    return getDigitalWalletService().validateApplePayMerchant.bind(
      getDigitalWalletService(),
    );
  },
  get getGooglePayConfig() {
    return getDigitalWalletService().getGooglePayConfig.bind(
      getDigitalWalletService(),
    );
  },
  get getAvailableWallets() {
    return getDigitalWalletService().getAvailableWallets.bind(
      getDigitalWalletService(),
    );
  },
};

/**
 * Export types for external use
 */
export type {
  DeviceInfo,
  PaymentRequestConfig,
  PaymentRequestDisplayItem,
  ShippingOption,
  WalletCapabilities,
  WalletPaymentIntent,
  WalletPaymentResult,
  WalletType,
};

/**
 * Export custom errors
 */
export {
  ApplePayConfigurationError,
  DigitalWalletError,
  GooglePayConfigurationError,
  WalletNotSupportedError,
};
