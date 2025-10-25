// src/components/order/OrderCard.tsx
"use client";

import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { OrderWithRelations } from "@/types/order.types";
import Image from "next/image";
import Link from "next/link";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderCardProps {
  order: OrderWithRelations;
  role?: "customer" | "farmer";
}

export function OrderCard({ order, role = "customer" }: OrderCardProps) {
  const displayName =
    role === "customer" ? order.farm.name : order.customer.name;

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:border-agricultural-600 hover:shadow-md transition-all duration-200"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              Order #{order.orderNumber}
            </p>
            <h3 className="text-lg font-semibold text-gray-900">
              {displayName}
            </h3>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Order Items Preview */}
        <div className="space-y-2 mb-4">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              {item.product.images && item.product.images.length > 0 && (
                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-500">
                  Qty: {item.quantity} × {formatCurrency(item.pricePerUnit)}
                </p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(item.total)}
              </p>
            </div>
          ))}

          {order.items.length > 3 && (
            <p className="text-xs text-gray-500 pl-15">
              +{order.items.length - 3} more items
            </p>
          )}
        </div>

        {/* Order Details */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order Date:</span>
            <span className="text-gray-900">{formatDate(order.createdAt)}</span>
          </div>

          {order.scheduledDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {order.fulfillmentMethod === "DELIVERY"
                  ? "Delivery Date:"
                  : "Pickup Date:"}
              </span>
              <span className="text-gray-900">
                {formatDate(order.scheduledDate)}
                {order.scheduledTimeSlot && ` • ${order.scheduledTimeSlot}`}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Fulfillment:</span>
            <span className="text-gray-900">
              {order.fulfillmentMethod === "DELIVERY"
                ? "🚚 Delivery"
                : order.fulfillmentMethod === "FARM_PICKUP"
                  ? "🚜 Farm Pickup"
                  : "📍 Market Pickup"}
            </span>
          </div>

          <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
            <span className="text-gray-900">Total:</span>
            <span className="text-agricultural-600">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>

        {/* Action Hint */}
        <div className="mt-4 text-center">
          <span className="text-sm text-agricultural-600 hover:text-agricultural-700 font-medium">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
