// ============================================================================
// DIVINE ORDER CARD COMPONENT
// Agricultural Quantum Order Display with Consciousness
// ============================================================================

"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { OrderWithRelations } from "../types";

import { Card, CardHeader, CardBody } from "@/components/ui/card";
import type {
  OrderStatus,
  PaymentStatus,
  FulfillmentMethod,
} from "@prisma/client";

// ============================================================================
// PROPS INTERFACE
// ============================================================================

export interface OrderCardProps {
  order: OrderWithRelations;
  variant?: "customer" | "farmer" | "admin";
  onViewDetails?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  onMessage?: (orderId: string) => void;
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void;
  className?: string;
}

// ============================================================================
// ORDER CARD COMPONENT
// ============================================================================

export function OrderCard({
  order,
  variant = "customer",
  onViewDetails,
  onCancel,
  onMessage,
  onUpdateStatus,
  className,
}: OrderCardProps) {
  const [showActions, setShowActions] = useState(false);

  // Calculate total items
  const totalItems = order.items.reduce(
    (sum, item) => sum + Number(item.quantity),
    0,
  );

  // Format currency
  const formatCurrency = (amount: number | { toString: () => string }) => {
    const value =
      typeof amount === "number" ? amount : parseFloat(amount.toString());
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Get status badge color
  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      PREPARING: "bg-purple-100 text-purple-800",
      READY: "bg-green-100 text-green-800",
      FULFILLED: "bg-green-100 text-green-800",
      COMPLETED: "bg-green-600 text-white",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Get payment status color
  const getPaymentColor = (status: PaymentStatus) => {
    const colors: Record<PaymentStatus, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      PAID: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      REFUNDED: "bg-gray-100 text-gray-800",
      PARTIALLY_REFUNDED: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Get fulfillment method icon
  const getFulfillmentIcon = (method: FulfillmentMethod) => {
    const icons: Record<FulfillmentMethod, string> = {
      DELIVERY: "🚚",
      FARM_PICKUP: "📦",
      MARKET_PICKUP: "🏪",
    };
    return icons[method] || "📦";
  };

  // Get farm location
  const farmLocation =
    typeof order.farm.location === "object" && order.farm.location !== null
      ? (order.farm.location as { address?: string }).address || "Unknown"
      : "Unknown";

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              Order #{order.orderNumber}
            </h3>
            <p className="text-sm text-gray-600">
              {formatDistanceToNow(new Date(order.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ⋮
            </button>
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                {onViewDetails && (
                  <button
                    onClick={() => {
                      onViewDetails(order.id);
                      setShowActions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    👁️ View Details
                  </button>
                )}
                {onMessage && (
                  <button
                    onClick={() => {
                      onMessage(order.id);
                      setShowActions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    💬 Send Message
                  </button>
                )}
                {onCancel &&
                  (order.status === "PENDING" ||
                    order.status === "CONFIRMED") && (
                    <button
                      onClick={() => {
                        onCancel(order.id);
                        setShowActions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                    >
                      ❌ Cancel Order
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
          >
            {order.status.replace("_", " ")}
          </span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentColor(order.paymentStatus)}`}
          >
            Payment: {order.paymentStatus.replace("_", " ")}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {getFulfillmentIcon(order.fulfillmentMethod)}{" "}
            {order.fulfillmentMethod}
          </span>
        </div>

        {/* Farm/Customer Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              🏡
            </div>
            <div>
              <p className="font-medium text-sm">{order.farm.name}</p>
              {variant === "customer" && (
                <p className="text-xs text-gray-600">{farmLocation}</p>
              )}
              {variant === "farmer" && (
                <p className="text-xs text-gray-600">
                  Customer: {order.customer.firstName} {order.customer.lastName}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          {/* Order Items Summary */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {order.items.length} {order.items.length === 1 ? "item" : "items"}{" "}
              ({totalItems} total)
            </p>
            <div className="space-y-1">
              {order.items.slice(0, 3).map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>
                    {Number(item.quantity)} × {item.productName}
                  </span>
                  <span>{formatCurrency(Number(item.subtotal))}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-xs text-gray-500 italic">
                  +{order.items.length - 3} more items
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          {/* Order Total */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(Number(order.subtotal))}</span>
            </div>
            {Number(order.deliveryFee) > 0 && (
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>{formatCurrency(Number(order.deliveryFee))}</span>
              </div>
            )}
            {Number(order.tax) > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatCurrency(Number(order.tax))}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-lg">
                {formatCurrency(Number(order.total))}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <div className="border-t pt-4">
            <div className="flex items-start gap-2 text-sm">
              <span>📍</span>
              <div>
                <p className="font-medium">Delivery Address</p>
                <p className="text-gray-600">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city},{" "}
                  {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Date */}
        {order.scheduledDate && (
          <div className="flex items-center gap-2 text-sm">
            <span>🕐</span>
            <div>
              <p className="font-medium">Scheduled</p>
              <p className="text-gray-600">
                {new Date(order.scheduledDate).toLocaleDateString()}{" "}
                {order.scheduledTimeSlot && `at ${order.scheduledTimeSlot}`}
              </p>
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-xs font-medium mb-1">Special Instructions</p>
            <p className="text-sm text-gray-600">{order.specialInstructions}</p>
          </div>
        )}

        {/* Tracking Number */}
        {order.trackingNumber && (
          <div className="flex items-center gap-2 text-sm">
            <span>📦</span>
            <div>
              <p className="font-medium">Tracking Number</p>
              <p className="text-gray-600 font-mono">{order.trackingNumber}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t pt-4 flex gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(order.id)}
              className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 text-sm font-medium"
            >
              👁️ View Details
            </button>
          )}
          {variant === "farmer" &&
            onUpdateStatus &&
            order.status === "CONFIRMED" && (
              <button
                onClick={() => onUpdateStatus(order.id, "PREPARING")}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Mark as Preparing
              </button>
            )}
          {variant === "farmer" &&
            onUpdateStatus &&
            order.status === "PREPARING" && (
              <button
                onClick={() => onUpdateStatus(order.id, "READY")}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Mark as Ready
              </button>
            )}
          {variant === "farmer" &&
            onUpdateStatus &&
            order.status === "READY" && (
              <button
                onClick={() => onUpdateStatus(order.id, "FULFILLED")}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              >
                Mark as Fulfilled
              </button>
            )}
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// DIVINE ORDER CARD - AGRICULTURAL CONSCIOUSNESS
// Complete order representation with quantum awareness
// ============================================================================
