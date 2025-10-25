// src/components/order/OrderDetail.tsx
"use client";

import { formatCurrency } from "@/lib/utils/currency";
import { formatDate, formatDateTime } from "@/lib/utils/date";
import { OrderWithRelations } from "@/types/order.types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderDetailProps {
  order: OrderWithRelations;
  role?: "customer" | "farmer";
  onStatusUpdate?: (newStatus: string) => Promise<void>;
  onCancelOrder?: () => Promise<void>;
}

export function OrderDetail({
  order,
  role = "customer",
  onStatusUpdate,
  onCancelOrder,
}: OrderDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onStatusUpdate) return;

    setIsUpdating(true);
    try {
      await onStatusUpdate(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!onCancelOrder) return;

    setIsUpdating(true);
    try {
      await onCancelOrder();
      setShowCancelConfirm(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const canUpdateStatus = role === "farmer" && order.status !== "DELIVERED";
  const canCancel =
    (role === "customer" &&
      order.status !== "DELIVERED" &&
      order.status !== "CANCELLED") ||
    (role === "farmer" && order.status !== "DELIVERED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500">
              Placed {formatDateTime(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Customer/Farm Info */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            {role === "customer" ? "Farm" : "Customer"}
          </h3>
          <Link
            href={
              role === "customer"
                ? `/farms/${order.farm.id}`
                : `/admin/users/${order.customer.id}`
            }
            className="text-agricultural-600 hover:text-agricultural-700 font-medium"
          >
            {role === "customer" ? order.farm.name : order.customer.name}
          </Link>
          <p className="text-sm text-gray-500 mt-1">{order.customer.email}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Order Items
        </h2>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0"
            >
              {item.product.images && item.product.images.length > 0 && (
                <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900">
                  {item.product.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Unit: {item.product.unit}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Qty: {Number(item.quantity)}
                </p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(Number(item.unitPrice))} each
                </p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {formatCurrency(Number(item.subtotal))}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Totals */}
        <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">
              {formatCurrency(Number(order.subtotal))}
            </span>
          </div>

          {order.deliveryFee && Number(order.deliveryFee) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee:</span>
              <span className="text-gray-900">
                {formatCurrency(Number(order.deliveryFee))}
              </span>
            </div>
          )}

          {order.discount && Number(order.discount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="text-green-600">
                -{formatCurrency(Number(order.discount))}
              </span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span className="text-gray-900">Total:</span>
            <span className="text-agricultural-600">
              {formatCurrency(Number(order.total))}
            </span>
          </div>
        </div>
      </div>

      {/* Fulfillment Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Fulfillment Details
        </h2>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Method:</p>
            <p className="text-sm text-gray-600 mt-1">
              {order.fulfillmentMethod === "DELIVERY"
                ? "🚚 Delivery"
                : order.fulfillmentMethod === "FARM_PICKUP"
                  ? "🚜 Farm Pickup"
                  : "📍 Market Pickup"}
            </p>
          </div>

          {order.scheduledDate && (
            <div>
              <p className="text-sm font-medium text-gray-900">
                Scheduled Date:
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(order.scheduledDate)}
                {order.scheduledTimeSlot && ` • ${order.scheduledTimeSlot}`}
              </p>
            </div>
          )}

          {order.deliveryAddress && (
            <div>
              <p className="text-sm font-medium text-gray-900">
                Delivery Address:
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {order.deliveryAddress.street}
                <br />
                {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
                {order.deliveryAddress.zipCode}
              </p>
            </div>
          )}

          {order.specialInstructions && (
            <div>
              <p className="text-sm font-medium text-gray-900">
                Special Instructions:
              </p>
              <p className="text-sm text-gray-600 mt-1 italic">
                {order.specialInstructions}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {(canUpdateStatus || canCancel) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>

          <div className="flex flex-wrap gap-3">
            {canUpdateStatus && (
              <>
                {order.status === "PENDING" && (
                  <button
                    onClick={() => handleStatusUpdate("CONFIRMED")}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Confirm Order
                  </button>
                )}
                {order.status === "CONFIRMED" && (
                  <button
                    onClick={() => handleStatusUpdate("PROCESSING")}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    Start Processing
                  </button>
                )}
                {order.status === "PROCESSING" &&
                  order.fulfillmentMethod === "FARM_PICKUP" && (
                    <button
                      onClick={() => handleStatusUpdate("READY_FOR_PICKUP")}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Mark Ready for Pickup
                    </button>
                  )}
                {order.status === "PROCESSING" &&
                  order.fulfillmentMethod === "DELIVERY" && (
                    <button
                      onClick={() => handleStatusUpdate("SHIPPED")}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Mark as Shipped
                    </button>
                  )}
              </>
            )}

            {canCancel && !showCancelConfirm && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={isUpdating}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Cancel Order
              </button>
            )}

            {showCancelConfirm && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800 mb-3">
                  Are you sure you want to cancel this order? This action cannot
                  be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelOrder}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Yes, Cancel Order
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    No, Keep Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
