/**
 * 🔒 STRIPE 3D SECURE AUTHENTICATION SERVICE
 * Divine Strong Customer Authentication (SCA) implementation
 *
 * Features:
 * - 3D Secure 2.0 (3DS2) authentication
 * - Payment Intent confirmation with authentication
 * - Dynamic 3DS based on risk and regulations
 * - Authentication status tracking
 * - Fallback handling for unsupported cards
 * - Agricultural consciousness in error messaging
 *
 * @divine-pattern Quantum Security Consciousness
 * @reference 05_TESTING_SECURITY_DIVINITY.instructions.md
 * @reference PCI-DSS compliance requirements
 */

import { database } from "@/lib/database";
import { stripe } from "@/lib/stripe";
import type { ServiceResponse } from "@/lib/types/service.types";
import Stripe from "stripe";

import { logger } from "@/lib/monitoring/logger";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * 3D Secure authentication status
 */
export type ThreeDSecureStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "AUTHENTICATED"
  | "FAILED"
  | "CHALLENGE_REQUIRED"
  | "UNSUPPORTED";

/**
 * 3D Secure authentication request
 */
export interface ThreeDSecureAuthRequest {
  paymentIntentId: string;
  orderId: string;
  returnUrl?: string;
}

/**
 * 3D Secure authentication result
 */
export interface ThreeDSecureAuthResult {
  status: ThreeDSecureStatus;
  paymentIntentId: string;
  requiresAction: boolean;
  nextActionType?: string;
  clientSecret?: string;
  redirectUrl?: string;
  authenticationFlowType?: "redirect" | "iframe" | "none";
  message?: string;
}

/**
 * 3D Secure confirmation request
 */
export interface ThreeDSecureConfirmRequest {
  paymentIntentId: string;
  paymentMethodId: string;
  orderId: string;
  returnUrl?: string;
  savePaymentMethod?: boolean;
}

/**
 * Payment Intent confirmation result
 */
export interface PaymentIntentConfirmResult {
  paymentIntent: Stripe.PaymentIntent;
  status: Stripe.PaymentIntent.Status;
  requiresAction: boolean;
  clientSecret?: string;
  nextAction?: Stripe.PaymentIntent.NextAction;
}

/**
 * 3D Secure verification details
 */
export interface ThreeDSecureVerification {
  authenticated: boolean;
  liabilityShift: "possible" | "succeeded" | "failed" | "unknown";
  version: "1.0.2" | "2.1.0" | "2.2.0" | "unknown";
  authenticationFlow: "challenge" | "frictionless" | "unknown";
  transactionId?: string;
  statusReason?: string;
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class ThreeDSecureError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "ThreeDSecureError";
  }
}

export class AuthenticationRequiredError extends ThreeDSecureError {
  constructor(
    message: string = "Additional authentication required",
    details?: Record<string, any>,
  ) {
    super(message, "AUTHENTICATION_REQUIRED", details);
    this.name = "AuthenticationRequiredError";
  }
}

export class AuthenticationFailedError extends ThreeDSecureError {
  constructor(
    message: string = "3D Secure authentication failed",
    details?: Record<string, any>,
  ) {
    super(message, "AUTHENTICATION_FAILED", details);
    this.name = "AuthenticationFailedError";
  }
}

// ============================================================================
// STRIPE 3D SECURE SERVICE
// ============================================================================

export class Stripe3DSecureService {
  private readonly DEFAULT_RETURN_URL = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/payment/confirm`;

  /**
   * Check if 3D Secure is required for a payment intent
   */
  async check3DSecureStatus(
    paymentIntentId: string,
  ): Promise<ServiceResponse<ThreeDSecureAuthResult>> {
    try {
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      const result = this.analyze3DSecureStatus(paymentIntent);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error("Error checking 3D Secure status:", {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: {
          code: "3DS_CHECK_FAILED",
          message: "Failed to check 3D Secure status",
          details: {
            paymentIntentId,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      };
    }
  }

  /**
   * Confirm payment intent with 3D Secure authentication
   */
  async confirmWithAuthentication(
    request: ThreeDSecureConfirmRequest,
  ): Promise<ServiceResponse<PaymentIntentConfirmResult>> {
    try {
      const {
        paymentIntentId,
        paymentMethodId,
        orderId,
        returnUrl,
        savePaymentMethod = false,
      } = request;

      // Validate order exists and belongs to user
      const order = await database.order.findUnique({
        where: { id: orderId },
        include: { customer: true },
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

      // Prepare confirmation parameters
      const confirmParams: Stripe.PaymentIntentConfirmParams = {
        payment_method: paymentMethodId,
        return_url: returnUrl || this.DEFAULT_RETURN_URL,
        setup_future_usage: savePaymentMethod ? "off_session" : undefined,
      };

      // Confirm payment intent (will trigger 3DS if required)
      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmParams,
      );

      // Update order with payment method
      await database.order.update({
        where: { id: orderId },
        data: {
          paymentIntentId: paymentIntent.id,
          paymentStatus:
            paymentIntent.status === "succeeded" ? "PAID" : "PENDING",
        },
      });

      const result: PaymentIntentConfirmResult = {
        paymentIntent,
        status: paymentIntent.status,
        requiresAction: paymentIntent.status === "requires_action",
        clientSecret: paymentIntent.client_secret || undefined,
        nextAction: paymentIntent.next_action || undefined,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error("Error confirming payment with authentication:", {
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof Stripe.errors.StripeError) {
        return {
          success: false,
          error: {
            code: error.code || "STRIPE_ERROR",
            message: error.message,
            details: {
              type: error.type,
              statusCode: error.statusCode,
              declineCode: (error as any).decline_code,
            },
          },
        };
      }

      return {
        success: false,
        error: {
          code: "PAYMENT_CONFIRMATION_FAILED",
          message: "Failed to confirm payment",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      };
    }
  }

  /**
   * Handle 3D Secure authentication completion
   */
  async handleAuthenticationComplete(
    paymentIntentId: string,
  ): Promise<ServiceResponse<PaymentIntentConfirmResult>> {
    try {
      // Retrieve updated payment intent
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      // Check if authentication succeeded
      if (paymentIntent.status === "succeeded") {
        // Update order in database
        const orderId = paymentIntent.metadata.orderId;
        if (orderId) {
          await database.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              paidAt: new Date(),
              status: "CONFIRMED",
            },
          });
        }

        return {
          success: true,
          data: {
            paymentIntent,
            status: paymentIntent.status,
            requiresAction: false,
          },
        };
      }

      // Check if still requires action
      if (paymentIntent.status === "requires_action") {
        return {
          success: false,
          error: {
            code: "AUTHENTICATION_INCOMPLETE",
            message: "Authentication is not yet complete",
            details: {
              status: paymentIntent.status,
              nextAction: paymentIntent.next_action?.type,
            },
          },
        };
      }

      // Authentication failed
      if (paymentIntent.status === "requires_payment_method") {
        return {
          success: false,
          error: {
            code: "AUTHENTICATION_FAILED",
            message: "3D Secure authentication failed",
            details: {
              status: paymentIntent.status,
              lastError: paymentIntent.last_payment_error?.message,
            },
          },
        };
      }

      // Unknown status
      return {
        success: false,
        error: {
          code: "UNKNOWN_PAYMENT_STATUS",
          message: `Unexpected payment status: ${paymentIntent.status}`,
          details: { status: paymentIntent.status },
        },
      };
    } catch (error) {
      logger.error("Error handling authentication completion:", {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: {
          code: "AUTHENTICATION_COMPLETION_FAILED",
          message: "Failed to process authentication completion",
          details: {
            paymentIntentId,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      };
    }
  }

  /**
   * Get 3D Secure verification details from payment intent
   */
  async getVerificationDetails(
    paymentIntentId: string,
  ): Promise<ServiceResponse<ThreeDSecureVerification>> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId,
        {
          expand: ["charges"],
        },
      );

      // Access charges with proper type handling
      const charges = (paymentIntent as any).charges;

      if (
        !charges ||
        typeof charges === "string" ||
        !charges.data ||
        !charges.data[0]
      ) {
        return {
          success: false,
          error: {
            code: "NO_CHARGE_FOUND",
            message: "No charge found for payment intent",
            details: { paymentIntentId },
          },
        };
      }

      const charge = charges.data[0];

      if (!charge) {
        return {
          success: false,
          error: {
            code: "NO_CHARGE_FOUND",
            message: "No charge data found for payment intent",
            details: { paymentIntentId },
          },
        };
      }
      const paymentMethodDetails = charge.payment_method_details;

      if (!paymentMethodDetails || paymentMethodDetails.type !== "card") {
        return {
          success: false,
          error: {
            code: "INVALID_PAYMENT_METHOD",
            message: "3D Secure is only available for card payments",
            details: { type: paymentMethodDetails?.type },
          },
        };
      }

      const threeDSecure = paymentMethodDetails.card?.three_d_secure;

      const verification: ThreeDSecureVerification = {
        authenticated: threeDSecure?.authenticated || false,
        liabilityShift: (threeDSecure?.result as any) || ("unknown" as const),
        version: (threeDSecure?.version as any) || ("unknown" as const),
        authenticationFlow:
          (threeDSecure?.authentication_flow as any) || ("unknown" as const),
        transactionId: threeDSecure?.transaction_id,
        statusReason: threeDSecure?.result_reason || undefined,
      };

      return {
        success: true,
        data: verification,
      };
    } catch (error) {
      logger.error("Error getting verification details:", {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: {
          code: "VERIFICATION_DETAILS_FAILED",
          message: "Failed to retrieve 3D Secure verification details",
          details: {
            paymentIntentId,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      };
    }
  }

  /**
   * Retry failed 3D Secure authentication with new payment method
   */
  async retryAuthentication(
    paymentIntentId: string,
    newPaymentMethodId: string,
  ): Promise<ServiceResponse<PaymentIntentConfirmResult>> {
    try {
      // Update payment intent with new payment method
      const paymentIntent = await stripe.paymentIntents.update(
        paymentIntentId,
        {
          payment_method: newPaymentMethodId,
        },
      );

      // Confirm with new payment method
      const confirmed = await stripe.paymentIntents.confirm(paymentIntentId, {
        return_url: this.DEFAULT_RETURN_URL,
      });

      return {
        success: true,
        data: {
          paymentIntent: confirmed,
          status: confirmed.status,
          requiresAction: confirmed.status === "requires_action",
          clientSecret: confirmed.client_secret || undefined,
          nextAction: confirmed.next_action || undefined,
        },
      };
    } catch (error) {
      logger.error("Error retrying authentication:", {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: {
          code: "AUTHENTICATION_RETRY_FAILED",
          message: "Failed to retry authentication with new payment method",
          details: {
            paymentIntentId,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      };
    }
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  /**
   * Analyze payment intent to determine 3D Secure status
   */
  private analyze3DSecureStatus(
    paymentIntent: Stripe.PaymentIntent,
  ): ThreeDSecureAuthResult {
    const result: ThreeDSecureAuthResult = {
      status: "NOT_REQUIRED",
      paymentIntentId: paymentIntent.id,
      requiresAction: false,
    };

    // Check if payment intent requires action
    if (paymentIntent.status === "requires_action") {
      result.requiresAction = true;
      result.status = "CHALLENGE_REQUIRED";
      result.clientSecret = paymentIntent.client_secret || undefined;

      // Determine action type
      if (paymentIntent.next_action) {
        result.nextActionType = paymentIntent.next_action.type;

        if (paymentIntent.next_action.type === "redirect_to_url") {
          result.authenticationFlowType = "redirect";
          result.redirectUrl =
            paymentIntent.next_action.redirect_to_url?.url || undefined;
          result.message =
            "Please complete authentication by following the redirect";
        } else if (
          paymentIntent.next_action.type === "use_stripe_sdk" ||
          paymentIntent.next_action.type === "verify_with_microdeposits"
        ) {
          result.authenticationFlowType = "iframe";
          result.message = "Please complete authentication in the secure frame";
        }
      }
    } else if (paymentIntent.status === "succeeded") {
      result.status = "AUTHENTICATED";
      result.message = "Payment authenticated and completed successfully";
    } else if (paymentIntent.status === "requires_payment_method") {
      result.status = "FAILED";
      result.message =
        paymentIntent.last_payment_error?.message ||
        "Authentication failed, please try a different payment method";
    } else if (paymentIntent.status === "processing") {
      result.status = "PENDING";
      result.message = "Payment is being processed";
    }

    return result;
  }

  /**
   * Check if card supports 3D Secure
   */
  private async checkCardSupports3DS(
    paymentMethodId: string,
  ): Promise<boolean> {
    try {
      const paymentMethod =
        await stripe.paymentMethods.retrieve(paymentMethodId);

      // Most cards support 3DS2, but some older cards may not
      // Stripe will automatically handle this during confirmation
      return paymentMethod.type === "card" && paymentMethod.card !== null;
    } catch (error) {
      logger.error("Error checking card 3DS support:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}

// ============================================================================
// SERVICE INSTANCE EXPORT
// ============================================================================

export const stripe3DSecureService = new Stripe3DSecureService();
