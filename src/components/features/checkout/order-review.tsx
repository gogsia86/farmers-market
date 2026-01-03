"use client";

// 📋 ORDER REVIEW - Final Order Review & Payment Confirmation Component
// Complete order review with payment processing and agricultural consciousness

import type { DeliveryAddress, DeliveryOption } from "@/app/(customer)/checkout/page";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { CartSummary } from "@/lib/services/cart.service";
import { useElements, useStripe } from "@stripe/react-stripe-js";
import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface OrderReviewProps {
  cart: CartSummary;
  deliveryAddress: DeliveryAddress;
  deliveryOptions: DeliveryOption[];
  clientSecret: string;
  onBack: () => void;
  isProcessing?: boolean;
}

// ============================================================================
// ORDER REVIEW COMPONENT
// ============================================================================

export function OrderReview({
  cart,
  deliveryAddress,
  deliveryOptions,
  clientSecret,
  onBack,
  isProcessing: externalProcessing = false,
}: OrderReviewProps) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handlePlaceOrder = async () => {
    if (!stripe || !elements) {
      setError("Stripe not initialized");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment successful!
        setSuccess(true);

        // Wait a moment to show success state
        setTimeout(() => {
          // Redirect to success page with payment intent ID
          router.push(`/checkout/success?payment_intent=${paymentIntent.id}`);
        }, 1500);
      } else {
        throw new Error("Payment processing incomplete");
      }
    } catch (err) {
      console.error("Payment confirmation error:", err);
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const getDeliveryOption = (farmId: string) => {
    return deliveryOptions.find((opt) => opt.farmId === farmId);
  };

  // ==========================================================================
  // RENDER SUCCESS STATE
  // ==========================================================================

  if (success) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center justify-center py-16">
          <div className="mb-6 rounded-full bg-green-100 p-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mb-6 text-center text-gray-600">
            Your order has been placed successfully.
            <br />
            Redirecting to confirmation page...
          </p>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
        </CardBody>
      </Card>
    );
  }

  // ==========================================================================
  // RENDER REVIEW FORM
  // ==========================================================================

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-2">
            <Package className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Review Your Order</h2>
            <p className="text-sm text-gray-600">
              Confirm your order details before placing
            </p>
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Payment Error</h3>
                  <p className="mt-1 text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Delivery Address</h3>
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-medium">{deliveryAddress.fullName}</p>
              <p>{deliveryAddress.phone}</p>
              <p>{deliveryAddress.addressLine1}</p>
              {deliveryAddress.addressLine2 && <p>{deliveryAddress.addressLine2}</p>}
              <p>
                {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zipCode}
              </p>
              {deliveryAddress.deliveryInstructions && (
                <p className="mt-2 italic text-gray-600">
                  Note: {deliveryAddress.deliveryInstructions}
                </p>
              )}
            </div>
          </div>

          {/* Order Items by Farm */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Order Items</h3>

            {cart.farmGroups.map((farmGroup) => {
              const deliveryOption = getDeliveryOption(farmGroup.farmId);

              return (
                <div
                  key={farmGroup.farmId}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  {/* Farm Header */}
                  <div className="mb-3 flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{farmGroup.farmName}</h4>
                      <p className="text-sm text-gray-600">
                        {farmGroup.itemCount} item{farmGroup.itemCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${farmGroup.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Farm Items */}
                  <div className="mb-3 space-y-2">
                    {farmGroup.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-gray-600">
                            {item.quantity.toNumber()} {item.unit}
                          </div>
                          <div className="text-gray-900">{item.product.name}</div>
                        </div>
                        <div className="font-medium text-gray-900">
                          ${(item.quantity.toNumber() * item.priceAtAdd.toNumber()).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Method */}
                  {deliveryOption && (
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="flex items-start gap-2">
                        {deliveryOption.method === "DELIVERY" ? (
                          <Truck className="h-4 w-4 flex-shrink-0 text-green-600" />
                        ) : (
                          <Package className="h-4 w-4 flex-shrink-0 text-green-600" />
                        )}
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {deliveryOption.method === "DELIVERY" ? "Delivery" : "Pickup"}
                          </p>
                          {deliveryOption.method === "PICKUP" &&
                            deliveryOption.pickupLocation && (
                              <p className="text-gray-600">
                                Location: {deliveryOption.pickupLocation}
                              </p>
                            )}
                          {deliveryOption.scheduledDate && (
                            <p className="text-gray-600">
                              {new Date(deliveryOption.scheduledDate).toLocaleDateString()} •{" "}
                              {deliveryOption.scheduledTime}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 font-semibold text-gray-900">Order Summary</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>

              {cart.deliveryFee > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span>${cart.deliveryFee.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-700">
                <span>Tax (8%)</span>
                <span>${cart.tax.toFixed(2)}</span>
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-gray-900 text-base">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Payment Method</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Your card will be charged ${cart.total.toFixed(2)} when you place this
              order.
            </p>
          </div>

          {/* Terms Agreement */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-gray-700">
              By placing this order, you agree to our{" "}
              <a href="/terms" className="text-green-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-green-600 hover:underline">
                Privacy Policy
              </a>
              . You also agree to the individual farm policies for the farms you're ordering
              from.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onBack}
              disabled={isProcessing || externalProcessing}
            >
              Back to Payment
            </Button>

            <Button
              type="button"
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={handlePlaceOrder}
              disabled={!stripe || !elements || isProcessing || externalProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processing Payment...
                </>
              ) : (
                `Place Order • $${cart.total.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
