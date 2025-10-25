// src/types/payment.types.ts
import { PaymentMethod, PaymentStatus } from "@prisma/client";

/**
 * Payment Intent Creation Input
 */
export interface CreatePaymentIntentInput {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  customerId?: string;
  savePaymentMethod?: boolean;
}

/**
 * Payment Intent Response
 */
export interface PaymentIntentResponse {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
}

/**
 * Payment Confirmation Input
 */
export interface ConfirmPaymentInput {
  paymentIntentId: string;
  paymentMethodId?: string;
  orderId: string;
}

/**
 * Payment Result
 */
export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId: string;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
  receiptUrl?: string;
  error?: string;
}

/**
 * Refund Input
 */
export interface RefundInput {
  paymentId: string;
  orderId: string;
  amount?: number; // If not provided, full refund
  reason: string;
  requestedBy: string;
}

/**
 * Refund Result
 */
export interface RefundResult {
  success: boolean;
  refundId?: string;
  paymentId: string;
  orderId: string;
  amount: number;
  status: string;
  error?: string;
}

/**
 * Payment History Item
 */
export interface PaymentHistoryItem {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  createdAt: Date;
  transactionId?: string;
  order?: {
    orderNumber: string;
    farm: {
      name: string;
    };
  };
}

/**
 * Stripe Payment Metadata
 */
export interface StripeMetadata {
  orderId: string;
  farmId: string;
  customerId: string;
  orderNumber: string;
}

/**
 * PayPal Order Data
 */
export interface PayPalOrderData {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
}

/**
 * Payment Webhook Event
 */
export interface PaymentWebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

/**
 * Payment Method Details
 */
export interface PaymentMethodDetails {
  id: string;
  type: PaymentMethod;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string; // For PayPal
}

/**
 * Payment Settings
 */
export interface PaymentSettings {
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  allowSaveCards: boolean;
  requireCVV: boolean;
  enable3DSecure: boolean;
  refundWindow: number; // days
}
