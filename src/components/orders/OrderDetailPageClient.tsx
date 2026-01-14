"use client";

/**
 * 🧠 ORDER DETAIL PAGE CLIENT WRAPPER
 * Client component wrapper for order detail page with real-time tracking
 * Following: Socket.io Integration & Real-time Communication Patterns
 */

import { RealtimeOrderTracker } from "@/components/orders/RealtimeOrderTracker";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";
import {
    Calendar,
    Mail,
    MapPin,
    Package,
    Phone,
    Truck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface OrderDetailPageClientProps {
  order: any;
  orderStatusSteps: Array<{
    key: string;
    label: string;
    icon: any;
  }>;
  currentStatusIndex: number;
  isCancelled: boolean;
  isCompleted: boolean;
  estimatedDelivery: Date;
  shippingAddress: any;
}

export function OrderDetailPageClient({
  order,
  orderStatusSteps,
  currentStatusIndex,
  isCancelled,
  isCompleted,
  estimatedDelivery,
  shippingAddress,
}: OrderDetailPageClientProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle order update from real-time tracker
  const handleOrderUpdate = async () => {
    setIsRefreshing(true);
    try {
      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error("Failed to refresh order data:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Main Content - Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Order Status Timeline */}
        {!isCancelled && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Order Status
            </h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-5 top-8 h-[calc(100%-4rem)] w-0.5 bg-gray-200" />
              <div
                className="absolute left-5 top-8 w-0.5 bg-green-600 transition-all duration-500"
                style={{
                  height: `${(currentStatusIndex / (orderStatusSteps.length - 1)) * 100}%`,
                }}
              />

              {/* Steps */}
              <div className="space-y-8">
                {orderStatusSteps.map((step, index) => {
                  const isStepCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="relative flex items-start">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition-all z-10",
                          isStepCompleted
                            ? "border-green-600 bg-green-50"
                            : "border-gray-300",
                          isCurrent && "ring-4 ring-green-100",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isStepCompleted ? "text-green-600" : "text-gray-500",
                          )}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            isStepCompleted ? "text-gray-900" : "text-gray-500",
                          )}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="mt-1 text-xs text-green-600 font-medium">
                            Current Status
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estimated Delivery */}
            {order.status !== "COMPLETED" && (
              <div className="mt-6 rounded-lg bg-green-50 p-4">
                <div className="flex items-start">
                  <Calendar className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Estimated Delivery
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      {estimatedDelivery.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {order.scheduledTimeSlot &&
                        ` • ${order.scheduledTimeSlot}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order Items */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
            <Package className="mr-2 h-5 w-5" />
            Order Items ({order.items.length})
          </h2>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                {/* Product Image */}
                <Link
                  href={`/products/${item.product.slug}`}
                  className="flex-shrink-0"
                >
                  {item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                      <Package
                        className="h-10 w-10 text-gray-500"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </Link>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-base font-medium text-gray-900 hover:text-green-600"
                  >
                    {item.productName}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>
                      Quantity: {Number(item.quantity)} {item.unit}
                    </span>
                    <span>•</span>
                    <span>
                      {formatCurrency(Number(item.unitPrice))} per {item.unit}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(Number(item.subtotal))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Information */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
            <Truck className="mr-2 h-5 w-5" />
            Delivery Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Delivery Address
              </p>
              <div className="mt-1 text-sm text-gray-600">
                <p>{shippingAddress?.fullName}</p>
                <p>{shippingAddress?.street}</p>
                {shippingAddress?.street2 && <p>{shippingAddress.street2}</p>}
                <p>
                  {shippingAddress?.city}, {shippingAddress?.state}{" "}
                  {shippingAddress?.zipCode}
                </p>
                <p className="mt-1">{shippingAddress?.phone}</p>
              </div>
            </div>

            {order.specialInstructions && (
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Delivery Instructions
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {order.specialInstructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Right Column */}
      <div className="space-y-6">
        {/* Real-time Order Tracker */}
        {!isCancelled && (
          <RealtimeOrderTracker
            orderId={order.id}
            currentStatus={order.status}
            onOrderUpdate={handleOrderUpdate}
          />
        )}

        {/* Order Summary */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Order Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(Number(order.subtotal))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(Number(order.deliveryFee))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Platform Fee</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(Number(order.platformFee))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(Number(order.tax))}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(Number(order.total))}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Payment Status
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  order.paymentStatus === "PAID"
                    ? "bg-green-100 text-green-800"
                    : order.paymentStatus === "REFUNDED"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800",
                )}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Farm Information */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Farm Details
          </h2>
          <div>
            <Link
              href={`/farms/${order.farm.id}`}
              className="text-base font-medium text-green-600 hover:text-green-700"
            >
              {order.farm.name}
            </Link>
            <div className="mt-4 space-y-3">
              <div className="flex items-start">
                <MapPin
                  className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500"
                  aria-hidden="true"
                />
                <div className="text-sm text-gray-600">
                  <p>{order.farm.address}</p>
                  <p>
                    {order.farm.city}, {order.farm.state} {order.farm.zipCode}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone
                  className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500"
                  aria-hidden="true"
                />
                <a
                  href={`tel:${order.farm.phone}`}
                  className="text-sm text-gray-600 hover:text-green-600"
                >
                  {order.farm.phone}
                </a>
              </div>
              <div className="flex items-start">
                <Mail
                  className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500"
                  aria-hidden="true"
                />
                <a
                  href={`mailto:${order.farm.email}`}
                  className="text-sm text-gray-600 hover:text-green-600"
                >
                  {order.farm.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 text-sm font-semibold text-blue-900">
            Need Help?
          </h3>
          <p className="mb-4 text-sm text-blue-700">
            Have questions about your order? We're here to help.
          </p>
          <Link
            href="/support"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
