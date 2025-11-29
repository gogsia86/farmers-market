"use client";

import Link from "next/link";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  farmName: string;
  status: string;
  totalAmount: number;
  createdAt: Date | string;
  items?: OrderItem[];
  deliveryFee?: number;
  estimatedReadyTime?: Date | string;
}

interface OrderCardProps {
  order: Order;
  showItems?: boolean;
  showActions?: boolean;
}

export function OrderCard({ order, showItems = false, showActions = true }: OrderCardProps) {
  const statusColors: Record<string, string> = {
    pending: "badge-pending",
    confirmed: "badge-confirmed",
    preparing: "badge-preparing",
    ready: "badge-ready",
    completed: "badge-completed",
    delivered: "badge-completed",
    cancelled: "badge-cancelled",
  };

  const statusColor = statusColors[order.status.toLowerCase()] || "badge";

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="order-card">
      {/* Order Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h3>
            <span className={statusColor}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <p className="text-gray-600 font-medium">{order.farmName}</p>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            ${order.totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Order Items */}
      {showItems && order.items && order.items.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2">
              <span className="text-gray-700">
                {item.productName} ({item.quantity} {item.unit})
              </span>
              <span className="font-medium">${item.price.toFixed(2)}</span>
            </div>
          ))}
          {order.deliveryFee && order.deliveryFee > 0 && (
            <div className="flex justify-between py-2 text-gray-600">
              <span>Delivery</span>
              <span>${order.deliveryFee.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Status Info */}
      {order.status.toLowerCase() !== "completed" &&
        order.status.toLowerCase() !== "delivered" &&
        order.status.toLowerCase() !== "cancelled" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Status:</strong> {getStatusMessage(order.status)}
            </p>
            {order.estimatedReadyTime && (
              <p className="text-sm text-blue-800 mt-1">
                <strong>Ready:</strong>{" "}
                {new Date(order.estimatedReadyTime).toLocaleString()}
              </p>
            )}
          </div>
        )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-3">
          <Link
            href={`/dashboard/orders/${order.id}`}
            className="flex-1 text-center btn-green"
          >
            View Details
          </Link>
          {order.status.toLowerCase() === "completed" && (
            <Link
              href={`/dashboard/reviews/new?order=${order.id}`}
              className="flex-1 text-center btn-outline-green"
            >
              Leave Review
            </Link>
          )}
          {order.status.toLowerCase() !== "completed" &&
            order.status.toLowerCase() !== "cancelled" && (
              <button className="px-4 py-2 btn-outline">Contact Farmer</button>
            )}
        </div>
      )}
    </div>
  );
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    pending: "Order received, awaiting farmer confirmation",
    confirmed: "Farmer confirmed your order",
    preparing: "Your order is being prepared",
    ready: "Your order is ready for pickup/delivery",
    delivered: "Order completed",
  };
  return (
    messages[status.toLowerCase()] ||
    status.charAt(0).toUpperCase() + status.slice(1)
  );
}
