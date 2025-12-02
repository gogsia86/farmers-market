/**
 * ⚡ ORDER VALIDATION SCHEMAS
 * Zod schemas for order operations with divine consciousness
 */
import { z } from "zod";

// Order status validation
export const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

// Payment status validation
export const paymentStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
]);

// Shipping address schema
export const shippingAddressSchema = z.object({
  fullName: z.string().min(2).max(100),
  addressLine1: z.string().min(5).max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(50),
  postalCode: z.string().min(5).max(10),
  country: z.string().length(2).default("US"),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/)
    .optional(),
});

// Order item schema
export const orderItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().positive(),
  priceAtPurchase: z.number().positive(),
  name: z.string().optional(),
  image: z.string().url().optional(),
});

// Create order schema
export const createOrderSchema = z.object({
  userId: z.string().cuid(),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  shippingAddress: shippingAddressSchema,
  deliverySlotId: z.string().cuid().optional(),
  notes: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Update order schema
export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  trackingNumber: z.string().max(100).optional(),
  shippingAddress: shippingAddressSchema.partial().optional(),
  notes: z.string().max(500).optional(),
  paidAt: z.coerce.date().optional(),
});

// Checkout schema
export const checkoutSchema = z.object({
  cartId: z.string().cuid(),
  shippingAddress: shippingAddressSchema,
  deliverySlotId: z.string().cuid().optional(),
  paymentMethodId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// Order query schema
export const orderQuerySchema = z.object({
  userId: z.string().cuid().optional(),
  farmId: z.string().cuid().optional(),
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Refund request schema
export const refundSchema = z.object({
  orderId: z.string().cuid(),
  reason: z.string().min(10).max(500),
  amount: z.number().positive().optional(), // Optional partial refund
  items: z.array(z.string().cuid()).optional(), // Specific items to refund
});

// Type exports
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
export type RefundInput = z.infer<typeof refundSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
