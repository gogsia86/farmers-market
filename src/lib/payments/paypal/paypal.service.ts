/**
 * 🌾 PAYPAL PAYMENT SERVICE
 * Divine PayPal Express Checkout & Order Management
 *
 * Features:
 * - PayPal Orders API v2 integration
 * - Express Checkout flow
 * - Order creation and capture
 * - Refund processing
 * - Webhook signature verification
 * - Transaction reconciliation
 * - Agricultural consciousness in payment flows
 *
 * @divine-pattern Quantum Payment Processing
 * @reference 05_TESTING_SECURITY_DIVINITY.instructions.md
 * @reference PayPal Orders API v2 documentation
 */

import { database } from "@/lib/database";
import type { ServiceResponse } from "@/lib/types/service.types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * PayPal API environment
 */
type PayPalEnvironment = "sandbox" | "production";

/**
 * PayPal order creation request
 */
export interface PayPalOrderRequest {
  orderId: string;
  amount: number;
  currency?: string;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * PayPal order response
 */
export interface PayPalOrderResponse {
  id: string;
  status: string;
  approvalUrl: string;
  orderId: string;
  amount: number;
  currency: string;
}

/**
 * PayPal capture request
 */
export interface PayPalCaptureRequest {
  paypalOrderId: string;
  orderId: string;
  expectedAmount?: number;
}

/**
 * PayPal capture response
 */
export interface PayPalCaptureResponse {
  id: string;
  status: string;
  captureId: string;
  orderId: string;
  amount: number;
  currency: string;
  payerEmail?: string;
  payerName?: string;
  transactionId: string;
}

/**
 * PayPal refund request
 */
export interface PayPalRefundRequest {
  captureId: string;
  orderId: string;
  amount?: number;
  currency?: string;
  reason?: string;
  invoiceId?: string;
}

/**
 * PayPal refund response
 */
export interface PayPalRefundResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  createTime: string;
}

/**
 * PayPal webhook event
 */
export interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource_type: string;
  summary: string;
  resource: any;
  create_time: string;
  event_version: string;
}

/**
 * PayPal order details
 */
export interface PayPalOrderDetails {
  id: string;
  status: string;
  intent: string;
  purchaseUnits: Array<{
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
    };
    description?: string;
  }>;
  payer?: {
    email_address?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
  };
  create_time: string;
  update_time: string;
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class PayPalError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "PayPalError";
  }
}

export class PayPalAuthenticationError extends PayPalError {
  constructor(message: string = "PayPal authentication failed") {
    super(message, "PAYPAL_AUTH_FAILED");
    this.name = "PayPalAuthenticationError";
  }
}

export class PayPalOrderCreationError extends PayPalError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "PAYPAL_ORDER_CREATION_FAILED", details);
    this.name = "PayPalOrderCreationError";
  }
}

export class PayPalCaptureError extends PayPalError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "PAYPAL_CAPTURE_FAILED", details);
    this.name = "PayPalCaptureError";
  }
}

export class PayPalRefundError extends PayPalError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "PAYPAL_REFUND_FAILED", details);
    this.name = "PayPalRefundError";
  }
}

// ============================================================================
// PAYPAL SERVICE
// ============================================================================

export class PayPalService {
  private clientId: string;
  private clientSecret: string;
  private environment: PayPalEnvironment;
  private baseUrl: string;
  private defaultReturnUrl: string;
  private defaultCancelUrl: string;

  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // Lazy initialization - credentials will be validated on first use
    this.clientId = "";
    this.clientSecret = "";
    this.environment = "sandbox";
    this.baseUrl = "";
    this.defaultReturnUrl = "";
    this.defaultCancelUrl = "";
  }

  /**
   * Initialize PayPal configuration (lazy-loaded)
   */
  private initializeConfig(): void {
    if (this.clientId && this.baseUrl) {
      return; // Already initialized
    }

    // Validate environment variables
    this.clientId = process.env.PAYPAL_CLIENT_ID || "";
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";

    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        "PayPal credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are required",
      );
    }

    this.environment =
      process.env.NODE_ENV === "production" ? "production" : "sandbox";
    this.baseUrl =
      this.environment === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    this.defaultReturnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`;
    this.defaultCancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`;
  }

  // ==========================================================================
  // PUBLIC METHODS
  // ==========================================================================

  /**
   * Create PayPal order for Express Checkout
   */
  async createOrder(
    request: PayPalOrderRequest,
  ): Promise<ServiceResponse<PayPalOrderResponse>> {
    this.initializeConfig();
    try {
      const {
        orderId,
        amount,
        currency = "USD",
        description,
        returnUrl,
        cancelUrl,
        metadata,
      } = request;

      // Validate order exists
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
        return {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "Order not found",
            details: { orderId },
          },
        };
      }

      // Validate amount matches order total
      const orderAmount = Number(order.total);
      if (Math.abs(orderAmount - amount) > 0.01) {
        return {
          success: false,
          error: {
            code: "AMOUNT_MISMATCH",
            message: "Payment amount does not match order total",
            details: {
              expected: orderAmount,
              provided: amount,
            },
          },
        };
      }

      // Get access token
      const token = await this.getAccessToken();
      if (!token) {
        return {
          success: false,
          error: {
            code: "PAYPAL_AUTH_FAILED",
            message: "Failed to authenticate with PayPal",
          },
        };
      }

      // Prepare order description
      const orderDescription =
        description || `Order #${order.orderNumber} from ${order.farm.name}`;

      // Create PayPal order
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "PayPal-Request-Id": `${orderId}-${Date.now()}`, // Idempotency
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: orderId,
              description: orderDescription,
              custom_id: orderId,
              invoice_id: order.orderNumber,
              amount: {
                currency_code: currency.toUpperCase(),
                value: amount.toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: currency.toUpperCase(),
                    value: Number(order.subtotal).toFixed(2),
                  },
                  tax_total: {
                    currency_code: currency.toUpperCase(),
                    value: Number(order.tax).toFixed(2),
                  },
                  shipping: {
                    currency_code: currency.toUpperCase(),
                    value: Number(order.deliveryFee).toFixed(2),
                  },
                },
              },
              items: order.items.map((item) => ({
                name: item.product.name,
                description: item.product.description?.substring(0, 127),
                unit_amount: {
                  currency_code: currency.toUpperCase(),
                  value: Number(item.unitPrice).toFixed(2),
                },
                quantity: item.quantity.toString(),
                category: "PHYSICAL_GOODS",
              })),
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                brand_name: "Farmers Market",
                locale: "en-US",
                landing_page: "LOGIN",
                shipping_preference: "SET_PROVIDED_ADDRESS",
                user_action: "PAY_NOW",
                return_url: returnUrl || this.defaultReturnUrl,
                cancel_url: cancelUrl || this.defaultCancelUrl,
              },
            },
          },
          application_context: {
            brand_name: "Farmers Market",
            landing_page: "BILLING",
            shipping_preference: "SET_PROVIDED_ADDRESS",
            user_action: "PAY_NOW",
            return_url: returnUrl || this.defaultReturnUrl,
            cancel_url: cancelUrl || this.defaultCancelUrl,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("PayPal order creation failed:", error);

        return {
          success: false,
          error: {
            code: "PAYPAL_ORDER_CREATION_FAILED",
            message: error.message || "Failed to create PayPal order",
            details: error,
          },
        };
      }

      const paypalOrder = await response.json();

      // Find approval URL
      const approvalUrl = paypalOrder.links?.find(
        (link: any) => link.rel === "approve" || link.rel === "payer-action",
      )?.href;

      if (!approvalUrl) {
        return {
          success: false,
          error: {
            code: "APPROVAL_URL_NOT_FOUND",
            message: "PayPal approval URL not found in response",
            details: paypalOrder,
          },
        };
      }

      // Update order with PayPal order ID
      await database.order.update({
        where: { id: orderId },
        data: {
          paymentIntentId: paypalOrder.id,
          paymentStatus: "PENDING",
        },
      });

      const result: PayPalOrderResponse = {
        id: paypalOrder.id,
        status: paypalOrder.status,
        approvalUrl,
        orderId,
        amount,
        currency: currency.toUpperCase(),
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Error creating PayPal order:", error);

      return {
        success: false,
        error: {
          code: "PAYPAL_ORDER_ERROR",
          message: "Failed to create PayPal order",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      };
    }
  }

  /**
   * Capture PayPal order after customer approval
   */
  async captureOrder(
    request: PayPalCaptureRequest,
  ): Promise<ServiceResponse<PayPalCaptureResponse>> {
    this.initializeConfig();
    try {
      const { paypalOrderId, orderId, expectedAmount } = request;

      // Validate order exists
      const order = await database.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          farm: true,
        },
      });

      if (!order) {
        return {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "Order not found",
            details: { orderId },
          },
        };
      }

      // Get access token
      const token = await this.getAccessToken();
      if (!token) {
        return {
          success: false,
          error: {
            code: "PAYPAL_AUTH_FAILED",
            message: "Failed to authenticate with PayPal",
          },
        };
      }

      // Capture the order
      const response = await fetch(
        `${this.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "PayPal-Request-Id": `${orderId}-capture-${Date.now()}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("PayPal capture failed:", error);

        return {
          success: false,
          error: {
            code: "PAYPAL_CAPTURE_FAILED",
            message: error.message || "Failed to capture PayPal payment",
            details: error,
          },
        };
      }

      const captureResult = await response.json();

      // Extract capture details
      const captureDetails =
        captureResult.purchase_units?.[0]?.payments?.captures?.[0];

      if (!captureDetails) {
        return {
          success: false,
          error: {
            code: "CAPTURE_DETAILS_NOT_FOUND",
            message: "Capture details not found in response",
            details: captureResult,
          },
        };
      }

      const capturedAmount = parseFloat(captureDetails.amount.value);
      const currency = captureDetails.amount.currency_code;

      // Validate captured amount
      if (expectedAmount && Math.abs(capturedAmount - expectedAmount) > 0.01) {
        return {
          success: false,
          error: {
            code: "AMOUNT_MISMATCH",
            message: "Captured amount does not match expected amount",
            details: {
              expected: expectedAmount,
              captured: capturedAmount,
            },
          },
        };
      }

      // Extract payer information
      const payer = captureResult.payer;
      const payerEmail = payer?.email_address;
      const payerName = payer?.name
        ? `${payer.name.given_name || ""} ${payer.name.surname || ""}`.trim()
        : undefined;

      // Update order in database
      await database.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          paidAt: new Date(),
          status: "CONFIRMED",
          paymentIntentId: paypalOrderId,
        },
      });

      const result: PayPalCaptureResponse = {
        id: captureResult.id,
        status: captureResult.status,
        captureId: captureDetails.id,
        orderId,
        amount: capturedAmount,
        currency,
        payerEmail,
        payerName,
        transactionId: captureDetails.id,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Error capturing PayPal order:", error);

      return {
        success: false,
        error: {
          code: "PAYPAL_CAPTURE_ERROR",
          message: "Failed to capture PayPal payment",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      };
    }
  }

  /**
   * Get PayPal order details
   */
  async getOrderDetails(
    paypalOrderId: string,
  ): Promise<ServiceResponse<PayPalOrderDetails>> {
    this.initializeConfig();
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          success: false,
          error: {
            code: "PAYPAL_AUTH_FAILED",
            message: "Failed to authenticate with PayPal",
          },
        };
      }

      const response = await fetch(
        `${this.baseUrl}/v2/checkout/orders/${paypalOrderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: {
            code: "PAYPAL_ORDER_FETCH_FAILED",
            message: "Failed to fetch PayPal order details",
            details: error,
          },
        };
      }

      const orderDetails = await response.json();

      return {
        success: true,
        data: {
          id: orderDetails.id,
          status: orderDetails.status,
          intent: orderDetails.intent,
          purchaseUnits: orderDetails.purchase_units,
          payer: orderDetails.payer,
          create_time: orderDetails.create_time,
          update_time: orderDetails.update_time,
        },
      };
    } catch (error) {
      console.error("Error fetching PayPal order details:", error);

      return {
        success: false,
        error: {
          code: "PAYPAL_ORDER_FETCH_ERROR",
          message: "Failed to retrieve PayPal order details",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      };
    }
  }

  /**
   * Refund PayPal capture
   */
  async refundCapture(
    request: PayPalRefundRequest,
  ): Promise<ServiceResponse<PayPalRefundResponse>> {
    this.initializeConfig();
    try {
      const {
        captureId,
        orderId,
        amount,
        currency = "USD",
        reason,
        invoiceId,
      } = request;

      // Validate order
      const order = await database.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "Order not found",
            details: { orderId },
          },
        };
      }

      const token = await this.getAccessToken();
      if (!token) {
        return {
          success: false,
          error: {
            code: "PAYPAL_AUTH_FAILED",
            message: "Failed to authenticate with PayPal",
          },
        };
      }

      // Prepare refund request body
      const body: any = {
        note_to_payer: reason || "Refund processed",
      };

      if (amount && currency) {
        body.amount = {
          value: amount.toFixed(2),
          currency_code: currency.toUpperCase(),
        };
      }

      if (invoiceId) {
        body.invoice_id = invoiceId;
      }

      // Process refund
      const response = await fetch(
        `${this.baseUrl}/v2/payments/captures/${captureId}/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "PayPal-Request-Id": `${orderId}-refund-${Date.now()}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("PayPal refund failed:", error);

        return {
          success: false,
          error: {
            code: "PAYPAL_REFUND_FAILED",
            message: error.message || "Failed to process PayPal refund",
            details: error,
          },
        };
      }

      const refundResult = await response.json();

      // Update order status
      const refundedAmount = parseFloat(refundResult.amount.value);
      const totalAmount = Number(order.total);
      const isFullRefund = Math.abs(refundedAmount - totalAmount) < 0.01;

      await database.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
          status: isFullRefund ? "CANCELLED" : order.status,
        },
      });

      const result: PayPalRefundResponse = {
        id: refundResult.id,
        status: refundResult.status,
        amount: refundedAmount,
        currency: refundResult.amount.currency_code,
        createTime: refundResult.create_time,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Error processing PayPal refund:", error);

      return {
        success: false,
        error: {
          code: "PAYPAL_REFUND_ERROR",
          message: "Failed to process PayPal refund",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      };
    }
  }

  /**
   * Verify PayPal webhook signature
   */
  async verifyWebhookSignature(
    webhookId: string,
    headers: Record<string, string>,
    body: string,
  ): Promise<boolean> {
    this.initializeConfig();
    try {
      const token = await this.getAccessToken();
      if (!token) {
        console.error(
          "Failed to get PayPal access token for webhook verification",
        );
        return false;
      }

      const response = await fetch(
        `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            transmission_id: headers["paypal-transmission-id"],
            transmission_time: headers["paypal-transmission-time"],
            cert_url: headers["paypal-cert-url"],
            auth_algo: headers["paypal-auth-algo"],
            transmission_sig: headers["paypal-transmission-sig"],
            webhook_id: webhookId,
            webhook_event: JSON.parse(body),
          }),
        },
      );

      if (!response.ok) {
        console.error("Webhook verification request failed");
        return false;
      }

      const result = await response.json();
      return result.verification_status === "SUCCESS";
    } catch (error) {
      console.error("Error verifying PayPal webhook:", error);
      return false;
    }
  }

  /**
   * Calculate PayPal transaction fee
   */
  calculateFee(amount: number): number {
    // PayPal standard rate: 2.9% + $0.30
    return Math.round((amount * 0.029 + 0.3) * 100) / 100;
  }

  /**
   * Calculate net amount after PayPal fees
   */
  calculateNet(amount: number): number {
    const fee = this.calculateFee(amount);
    return Math.round((amount - fee) * 100) / 100;
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Get PayPal access token (cached)
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      // Return cached token if still valid
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      // Request new token
      const auth = Buffer.from(
        `${this.clientId}:${this.clientSecret}`,
      ).toString("base64");

      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        console.error("Failed to get PayPal access token");
        return null;
      }

      const data = await response.json();

      // Cache token with 5-minute buffer before expiry
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error("Error getting PayPal access token:", error);
      return null;
    }
  }
}

// ============================================================================
// SERVICE INSTANCE EXPORT
// ============================================================================

/**
 * Singleton instance of PayPalService
 * Lazy-loaded to prevent build-time errors when env vars are missing
 */
let _paypalServiceInstance: PayPalService | null = null;

export const getPayPalService = (): PayPalService => {
  if (!_paypalServiceInstance) {
    _paypalServiceInstance = new PayPalService();
  }
  return _paypalServiceInstance;
};

/**
 * @deprecated Use getPayPalService() instead
 * This export exists for backward compatibility
 */
export const paypalService = {
  get createOrder() {
    return getPayPalService().createOrder.bind(getPayPalService());
  },
  get captureOrder() {
    return getPayPalService().captureOrder.bind(getPayPalService());
  },
  get refundCapture() {
    return getPayPalService().refundCapture.bind(getPayPalService());
  },
  get getOrderDetails() {
    return getPayPalService().getOrderDetails.bind(getPayPalService());
  },
  verifyWebhookSignature(webhookId: string, headers: Record<string, string>, body: string) {
    return getPayPalService().verifyWebhookSignature(webhookId, headers, body);
  },
};
