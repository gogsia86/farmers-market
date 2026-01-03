"use client";

// 🛒 CHECKOUT PAGE - Divine Multi-Step Checkout Experience
// Orchestrates the complete checkout flow with agricultural consciousness

import { CheckoutSteps } from "@/components/features/checkout/checkout-steps";
import { DeliveryAddressForm } from "@/components/features/checkout/delivery-address-form";
import { DeliveryOptionsForm } from "@/components/features/checkout/delivery-options-form";
import { OrderReview } from "@/components/features/checkout/order-review";
import { PaymentForm } from "@/components/features/checkout/payment-form";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { AlertTriangle, ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

export type CheckoutStep = "address" | "delivery" | "payment" | "review";

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryInstructions?: string;
}

export interface DeliveryOption {
  farmId: string;
  method: "DELIVERY" | "PICKUP";
  pickupLocation?: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

// Helper to calculate total with fees
function calculateOrderTotal(cart: any): {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  total: number;
} {
  const subtotal = cart.subtotal || 0;
  const deliveryFee = cart.deliveryFee || 0;

  // Platform fee: 15% of subtotal
  const platformFee = subtotal * 0.15;

  // Tax: 8% of (subtotal + deliveryFee + platformFee)
  const tax = (subtotal + deliveryFee + platformFee) * 0.08;

  const total = subtotal + deliveryFee + platformFee + tax;

  return { subtotal, deliveryFee, platformFee, tax, total };
}

// ============================================================================
// STRIPE INITIALIZATION
// ============================================================================

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
      return null;
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// ============================================================================
// CHECKOUT PAGE COMPONENT
// ============================================================================

export default function CheckoutPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);

  // Checkout state
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cart hook
  const {
    cart,
    count,
    isLoading,
    isEmpty,
    validateCart,
    syncPrices,
  } = useCart({ userId });

  // Stripe
  const stripe = getStripe();

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  useEffect(() => {
    setIsMounted(true);
    // TODO: Get userId from auth session
    // For now, using mock user ID
    setUserId("user_123");
  }, []);

  useEffect(() => {
    if (isMounted && userId) {
      // Validate cart and sync prices
      validateCart();
      syncPrices();
    }
  }, [isMounted, userId]);

  // Redirect to cart if empty
  useEffect(() => {
    if (isMounted && !isLoading && isEmpty) {
      router.push("/cart");
    }
  }, [isMounted, isLoading, isEmpty, router]);

  // ==========================================================================
  // STEP HANDLERS
  // ==========================================================================

  const handleAddressSubmit = (address: DeliveryAddress) => {
    setDeliveryAddress(address);
    setCurrentStep("delivery");
    setError(null);
  };

  const handleDeliveryOptionsSubmit = (options: DeliveryOption[]) => {
    setDeliveryOptions(options);
    setCurrentStep("payment");
    setError(null);
  };

  const handlePaymentMethodReady = async () => {
    // Create payment intent
    setIsProcessing(true);
    setError(null);

    try {
      if (!cart || !deliveryAddress || deliveryOptions.length === 0) {
        throw new Error("Missing required checkout data");
      }

      // Call API to create payment intent
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          cartSummary: {
            items: cart.items.map((item) => ({
              id: item.id,
              productId: item.productId,
              farmId: item.farmId,
              quantity: item.quantity.toNumber(),
              priceAtAdd: item.priceAtAdd.toNumber(),
            })),
            total: calculateOrderTotal(cart).total,
          },
          deliveryAddress,
          deliveryOptions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to create payment intent");
      }

      const data = await response.json();

      if (!data.success || !data.clientSecret) {
        throw new Error("Invalid payment intent response");
      }

      setClientSecret(data.clientSecret);
      setCurrentStep("review");
    } catch (err) {
      console.error("Payment intent creation error:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToReview = () => {
    setCurrentStep("review");
    setError(null);
  };

  const handleBackToStep = (step: CheckoutStep) => {
    setCurrentStep(step);
    setError(null);
  };

  // ==========================================================================
  // RENDER LOADING
  // ==========================================================================

  if (!isMounted || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER EMPTY CART (should redirect)
  // ==========================================================================

  if (isEmpty || !cart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-2xl">
          <CardBody className="flex flex-col items-center justify-center py-16">
            <div className="mb-6 rounded-full bg-gray-100 p-6">
              <ShoppingBag className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">
              Your cart is empty
            </h2>
            <p className="mb-6 text-center text-gray-600">
              Add items to your cart before checking out.
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Browse Products
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ==========================================================================
  // RENDER CHECKOUT FLOW
  // ==========================================================================

  const steps: CheckoutStep[] = ["address", "delivery", "payment", "review"];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-sm text-gray-600 hover:text-green-600 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">
            {count} item{count !== 1 ? "s" : ""} from {cart.farmGroups.length} farm
            {cart.farmGroups.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <CheckoutSteps currentStep={currentStep} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="mt-1 text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2">
            {currentStep === "address" && (
              <DeliveryAddressForm
                initialData={deliveryAddress}
                onSubmit={handleAddressSubmit}
                isProcessing={isProcessing}
              />
            )}

            {currentStep === "delivery" && deliveryAddress && (
              <DeliveryOptionsForm
                farmGroups={cart.farmGroups}
                initialOptions={deliveryOptions}
                onSubmit={handleDeliveryOptionsSubmit}
                onBack={() => handleBackToStep("address")}
                isProcessing={isProcessing}
              />
            )}

            {currentStep === "payment" && stripe && (
              <Elements stripe={stripe}>
                <PaymentForm
                  onReady={handlePaymentMethodReady}
                  onProceed={handleGoToReview}
                  onBack={() => handleBackToStep("delivery")}
                  isProcessing={isProcessing}
                />
              </Elements>
            )}

            {currentStep === "review" && deliveryAddress && clientSecret && stripe && (
              <Elements stripe={stripe} options={{ clientSecret }}>
                <OrderReview
                  cart={cart}
                  deliveryAddress={deliveryAddress}
                  deliveryOptions={deliveryOptions}
                  clientSecret={clientSecret}
                  onBack={() => handleBackToStep("payment")}
                  isProcessing={isProcessing}
                />
              </Elements>
            )}
          </div>

          {/* Order Summary Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardBody>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Order Summary
                </h2>

                {/* Cart Summary */}
                <div className="space-y-3 border-b pb-4 mb-4">
                  {cart.farmGroups.map((farmGroup) => (
                    <div key={farmGroup.farmId}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {farmGroup.farmName}
                        </span>
                        <span className="text-gray-600">
                          {farmGroup.itemCount} item{farmGroup.itemCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>${farmGroup.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  {(() => {
                    const totals = calculateOrderTotal(cart);
                    return (
                      <>
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span>${totals.subtotal.toFixed(2)}</span>
                        </div>

                        {totals.deliveryFee > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span>Delivery Fee</span>
                            <span>${totals.deliveryFee.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-gray-600">
                          <span>Platform Fee</span>
                          <span>${totals.platformFee.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-gray-600">
                          <span>Tax (8%)</span>
                          <span>${totals.tax.toFixed(2)}</span>
                        </div>

                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold text-gray-900 text-base">
                            <span>Total</span>
                            <span>${totals.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Step Indicator */}
                <div className="mt-6 pt-4 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    Step {currentStepIndex + 1} of {steps.length}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
