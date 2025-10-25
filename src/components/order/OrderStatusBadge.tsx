// src/components/order/OrderStatusBadge.tsx
"use client";

import { cn } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: string;
  }
> = {
  PENDING: {
    label: "Pending",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: "⏳",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: "✓",
  },
  PROCESSING: {
    label: "Processing",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: "⚙️",
  },
  READY_FOR_PICKUP: {
    label: "Ready for Pickup",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: "📦",
  },
  SHIPPED: {
    label: "Shipped",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
    icon: "🚚",
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-green-800",
    bgColor: "bg-green-200",
    icon: "✅",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: "❌",
  },
  REFUNDED: {
    label: "Refunded",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: "💰",
  },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
        config.color,
        config.bgColor,
        className
      )}
    >
      <span className="text-base">{config.icon}</span>
      {config.label}
    </span>
  );
}
