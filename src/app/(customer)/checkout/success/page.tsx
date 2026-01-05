"use client";

// ✅ CHECKOUT SUCCESS PAGE - Order Confirmation
// Beautiful success page with order details and next steps

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { CheckCircle, Download, Home, Package } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface OrderDetails {
  id: string;
  orderNumber: string;
  total: number;
  farmName: string;
  itemCount: number;
  estimatedDelivery?: string;
  status: string;
}

// ============================================================================
// CHECKOUT SUCCESS PAGE COMPONENT
// ============================================================================

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [error, setError] = useState<string | null>(null);

  const paymentIntentId = searchParams.get("payment_intent");

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  useEffect(() => {
    if (!paymentIntentId) {
      setError("No payment information found");
      setIsLoading(false);
      return;
    }

    // Fetch order details
    fetchOrderDetails();
  }, [paymentIntentId]);

  // ==========================================================================
  // FETCH ORDER DETAILS
  // ==========================================================================

  const fetchOrderDetails = async () => {
    try {
      // TODO: Implement API call to fetch order details
      // const response = await fetch(`/api/orders/by-payment-intent/${paymentIntentId}`);
      // const data = await response.json();

      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockOrders: OrderDetails[] = [
        {
          id: "order_123",
          orderNumber: "FM-2024-001",
          total: 89.99,
          farmName: "Green Valley Farm",
          itemCount: 5,
          estimatedDelivery: "2024-01-10",
          status: "CONFIRMED",
        },
      ];

      setOrders(mockOrders);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      setError("Failed to load order details");
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    alert("Receipt download will be implemented");
  };

  // ==========================================================================
  // RENDER LOADING
  // ==========================================================================

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
          <span className="ml-3 text-lg text-gray-600">Loading order details...</span>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER ERROR
  // ==========================================================================

  if (error || !paymentIntentId) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl">
          <CardBody className="flex flex-col items-center justify-center py-16">
            <div className="mb-6 rounded-full bg-red-100 p-6">
              <Package className="h-16 w-16 text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">
              Order Not Found
            </h2>
            <p className="mb-6 text-center text-gray-600">
              {error || "We couldn't find your order. Please check your email for confirmation."}
            </p>
            <Link href="/orders">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                View My Orders
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ==========================================================================
  // RENDER SUCCESS
  // ==========================================================================

  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
  const totalItems = orders.reduce((sum, order) => sum + order.itemCount, 0);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-6">
              <CheckCircle className="h-20 w-20 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for supporting local farms
          </p>
        </div>

        {/* Order Details */}
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Confirmation Message */}
          <Card>
            <CardBody className="text-center">
              <p className="text-gray-700">
                We've sent a confirmation email with your order details to your email address.
                <br />
                You can track your order status from your orders page.
              </p>
            </CardBody>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardBody>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Order Summary
              </h2>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-600">{order.farmName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {order.estimatedDelivery && (
                      <div className="flex items-center gap-2 rounded-lg bg-white p-3">
                        <Package className="h-4 w-4 text-green-600" />
                        <div className="text-sm">
                          <span className="text-gray-600">Estimated delivery: </span>
                          <span className="font-medium text-gray-900">
                            {new Date(order.estimatedDelivery).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between border-t pt-3">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-900">Total Paid</span>
                  <span className="font-semibold text-gray-900">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Payment processed securely via Stripe
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardBody>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                What's Next?
              </h2>

              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                      1
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Farm Prepares Your Order
                    </h3>
                    <p className="text-sm text-gray-600">
                      The farm will carefully prepare your fresh produce for delivery or
                      pickup.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                      2
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Get Notified</h3>
                    <p className="text-sm text-gray-600">
                      You'll receive email updates when your order is ready for delivery or
                      pickup.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                      3
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Receive Your Fresh Produce
                    </h3>
                    <p className="text-sm text-gray-600">
                      Enjoy your fresh, locally-grown products from your favorite farms!
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/orders" className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                <Package className="mr-2 h-4 w-4" />
                View Orders
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleDownloadReceipt}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>

            <Link href="/" className="w-full">
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Support Info */}
          <Card>
            <CardBody className="text-center">
              <p className="text-sm text-gray-600">
                Need help with your order?{" "}
                <a href="/support" className="text-green-600 hover:underline">
                  Contact Support
                </a>
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
            <span className="ml-3 text-lg text-gray-600">Loading...</span>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
