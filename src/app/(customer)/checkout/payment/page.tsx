"use client";

import { StripeCheckoutForm } from "@/components/payment/StripeCheckoutForm";
import { AgriculturalCard } from "@/components/ui/AgriculturalCard";
import { AgriculturalError } from "@/components/ui/AgriculturalError";
import { AgriculturalLoading } from "@/components/ui/AgriculturalLoading";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const amount = Number.parseFloat(searchParams.get("amount") || "0");

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !amount) {
      setError("Invalid payment request");
      setIsLoading(false);
      return;
    }

    // Create payment intent
    fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        amount,
        paymentMethod: "STRIPE",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.paymentIntent) {
          setClientSecret(data.paymentIntent.clientSecret);
        } else {
          setError(data.error || "Failed to create payment intent");
        }
      })
      .catch((err) => {
        setError(err.message || "Payment initialization failed");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderId, amount]);

  const handlePaymentSuccess = () => {
    router.push(`/orders/${orderId}?payment=success`);
  };

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg);
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <AgriculturalLoading
          type="processing"
          size="lg"
          message="Preparing your payment..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <AgriculturalError
          type="quantum-decoherence"
          message={error}
          recovery={{
            action: "Return to Order",
            handler: () => router.push(`/orders/${orderId}`),
          }}
        />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <AgriculturalError
          type="soil-depletion"
          message="Payment session not available"
          recovery={{
            action: "Return to Orders",
            handler: () => router.push("/orders"),
          }}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Complete Your Payment
        </h1>
        <p className="text-gray-600">Securely pay for your order with Stripe</p>
      </div>

      <AgriculturalCard consciousness="harvesting" elevation="elevated">
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#22c55e",
                colorBackground: "#ffffff",
                colorText: "#1f2937",
                colorDanger: "#ef4444",
                fontFamily: "system-ui, sans-serif",
                spacingUnit: "4px",
                borderRadius: "8px",
              },
            },
          }}
        >
          <StripeCheckoutForm
            orderId={orderId!}
            amount={amount}
            clientSecret={clientSecret}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Elements>
      </AgriculturalCard>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          🔒 Secure payment powered by Stripe
        </p>
        <p className="text-xs text-gray-400 mt-1">
          All transactions are encrypted and secure
        </p>
      </div>
    </div>
  );
}
