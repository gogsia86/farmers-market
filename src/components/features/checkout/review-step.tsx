"use client";

// ✅ REVIEW STEP - Divine Order Review & Submission
// Final review of all order details before submission with Stripe payment confirmation
// Follows divine checkout patterns with agricultural consciousness

import { Button } from "@/components/ui/button";
import { confirmPayment } from "@/lib/client/stripe";
import { formatCurrency } from "@/lib/utils/currency";
import type { CartItem, Farm, Product } from "@prisma/client";
import { AlertTriangle, Check, Edit2, Loader2, MapPin, Package, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { logger } from '@/lib/monitoring/logger';

import type { DeliveryInfo, PaymentInfo, ShippingAddress } from "./checkout-wizard";

// ============================================================================
// TYPES
// ============================================================================

interface ReviewStepProps {
  formData: {
    shipping: ShippingAddress | null;
    delivery: DeliveryInfo | null;
    payment: PaymentInfo | null;
  };
  cart: (CartItem & {
    product: Product & {
      farm: Pick<Farm, "id" | "name" | "slug" | "address" | "city" | "state" | "zipCode">;
    };
  })[];
  userId: string;
  onBack: () => void;
  onEditStep: (step: 1 | 2 | 3 | 4) => void;
}

// ============================================================================
// REVIEW STEP COMPONENT
// ============================================================================

export function ReviewStep({
  formData,
  cart,
  userId,
  onBack,
  onEditStep,
}: ReviewStepProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // ==========================================================================
  // CALCULATIONS
  // ==========================================================================

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum: any, item: any) => {
      const itemTotal = Number(item.priceAtAdd) * Number(item.quantity);
      return sum + itemTotal;
    }, 0);

    const deliveryFee = 5.99; // Flat rate for now
    const platformFee = subtotal * 0.15; // 15% platform fee
    const tax = (subtotal + deliveryFee + platformFee) * 0.08; // 8% tax
    const total = subtotal + deliveryFee + platformFee + tax;

    return {
      subtotal,
      deliveryFee,
      platformFee,
      tax,
      total,
    };
  };

  const totals = calculateTotals();

  // ==========================================================================
  // ORDER SUBMISSION
  // ==========================================================================

  const handleSubmitOrder = async () => {
    if (!termsAccepted) {
      setError("Please accept the terms and conditions to continue");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create orders (without payment confirmation yet)
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          shippingAddress: formData.shipping,
          deliveryInfo: formData.delivery,
          paymentMethod: formData.payment,
          cartItems: cart.map((item: any) => ({
            productId: item.productId,
            farmId: item.farmId,
            quantity: Number(item.quantity),
            priceAtPurchase: Number(item.priceAtAdd),
          })),
          totals,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error?.message || "Failed to create order");
      }

      const orderResult = await orderResponse.json();

      if (!orderResult.success || !orderResult.data?.orderId) {
        throw new Error("Invalid order response");
      }

      // Step 2: Get payment intent client secret and confirm payment
      if (formData.payment?.paymentIntentId) {
        // Get the payment intent details
        const paymentIntentResponse = await fetch(
          `/api/checkout/payment-intent?paymentIntentId=${formData.payment.paymentIntentId}`
        );

        if (!paymentIntentResponse.ok) {
          throw new Error("Failed to retrieve payment details");
        }

        const paymentIntentResult = await paymentIntentResponse.json();

        if (!paymentIntentResult.success || !paymentIntentResult.data?.clientSecret) {
          throw new Error("Invalid payment details");
        }

        // Confirm the payment with Stripe
        const confirmResult = await confirmPayment({
          clientSecret: paymentIntentResult.data.clientSecret,
          returnUrl: `${window.location.origin}/orders/${orderResult.data.orderId}/confirmation`,
        });

        if (!confirmResult.success) {
          // Payment confirmation failed - orders were created but payment failed
          // The webhook will handle updating the order status to CANCELLED
          throw new Error(
            confirmResult.error || "Payment confirmation failed. Your order has been cancelled."
          );
        }

        // Step 3: Update order with payment intent ID
        await fetch(`/api/orders/${orderResult.data.orderId}/payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentIntentId: formData.payment.paymentIntentId,
          }),
        });
      }

      // Step 4: Redirect to confirmation page
      router.push(`/orders/${orderResult.data.orderId}/confirmation`);
    } catch (err) {
      logger.error("Order submission error:", {
      error: err instanceof Error ? err.message : String(err),
    });
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (!formData.shipping || !formData.delivery || !formData.payment) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Incomplete Checkout Information
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Please complete all previous steps before reviewing your order.
        </p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const { shipping, delivery, payment } = formData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Package className="h-6 w-6 text-green-600" />
          Review Your Order
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Please review all details before placing your order
        </p>
      </div>

      {/* Shipping Address Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Shipping Address
              </h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{shipping.fullName}</p>
                <p>{shipping.street}</p>
                {shipping.street2 && <p>{shipping.street2}</p>}
                <p>
                  {shipping.city}, {shipping.state} {shipping.zipCode}
                </p>
                <p className="mt-2">Phone: {shipping.phone}</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(1)}
            className="text-green-600 hover:text-green-700"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      {/* Delivery Information Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Delivery Schedule
              </h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-900">Date:</span>{" "}
                  {new Date(delivery.preferredDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Time:</span>{" "}
                  {delivery.preferredTime === "morning" && "8:00 AM - 12:00 PM"}
                  {delivery.preferredTime === "afternoon" && "12:00 PM - 4:00 PM"}
                  {delivery.preferredTime === "evening" && "4:00 PM - 8:00 PM"}
                </p>
                {delivery.deliveryInstructions && (
                  <p className="mt-2">
                    <span className="font-medium text-gray-900">
                      Instructions:
                    </span>{" "}
                    {delivery.deliveryInstructions}
                  </p>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(2)}
            className="text-green-600 hover:text-green-700"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Payment Method
              </h3>
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  {payment.method === "card" ? "Credit/Debit Card" : "Digital Wallet"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Payment will be processed securely via Stripe
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(3)}
            className="text-green-600 hover:text-green-700"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      {/* Order Items Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Order Items ({cart.length})
        </h3>
        <div className="space-y-4">
          {cart.map((item: any) => (
            <div
              key={item.id}
              className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  from {item.product.farm.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {Number(item.quantity)} {item.unit} × {formatCurrency(Number(item.priceAtAdd))}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(Number(item.priceAtAdd) * Number(item.quantity))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Totals */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Order Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>{formatCurrency(totals.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Platform Fee</span>
            <span>{formatCurrency(totals.platformFee)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax (8%)</span>
            <span>{formatCurrency(totals.tax)}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold text-gray-900 text-lg">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <input
            id="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <Label
            htmlFor="terms"
            className="cursor-pointer text-sm font-normal leading-relaxed"
          >
            I agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              className="text-green-600 hover:text-green-700 underline"
            >
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              className="text-green-600 hover:text-green-700 underline"
            >
              Privacy Policy
            </a>
            . I understand that I am purchasing fresh farm products and delivery
            dates are subject to weather and harvest conditions.
          </Label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <h3 className="text-sm font-semibold text-red-900">Error</h3>
              <p className="mt-1 text-xs text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back to Payment
        </Button>
        <Button
          onClick={handleSubmitOrder}
          disabled={isSubmitting || !termsAccepted}
          className="bg-green-600 hover:bg-green-700 min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Order...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Place Order
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// LABEL COMPONENT (if not imported from ui)
// ============================================================================

function Label({ htmlFor, className, children }: { htmlFor?: string; className?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  );
}
