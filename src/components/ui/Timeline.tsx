"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Check,
  Clock,
  Package,
  Truck,
  Home,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// 🌾 AGRICULTURAL TIMELINE COMPONENT
// Divine timeline component for tracking farm orders through the agricultural supply chain
// Embodies temporal consciousness and biodynamic order flow patterns
// ═══════════════════════════════════════════════════════════════════════════════

export type TimelineStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";
export type TimelineOrientation = "vertical" | "horizontal";

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  status: TimelineStatus;
  icon?: ReactNode;
  metadata?: Record<string, any>;
}

export interface TimelineProps {
  events: TimelineEvent[];
  orientation?: TimelineOrientation;
  activeIndex?: number;
  className?: string;
  showConnectors?: boolean;
  animated?: boolean;
  agriculturalTheme?: boolean;
}

// Status color mapping with agricultural consciousness
const STATUS_COLORS: Record<
  TimelineStatus,
  { bg: string; border: string; icon: string; text: string }
> = {
  pending: {
    bg: "bg-yellow-100",
    border: "border-yellow-400",
    icon: "text-yellow-600",
    text: "text-yellow-900",
  },
  processing: {
    bg: "bg-blue-100",
    border: "border-blue-400",
    icon: "text-blue-600",
    text: "text-blue-900",
  },
  completed: {
    bg: "bg-green-100",
    border: "border-green-500",
    icon: "text-green-600",
    text: "text-green-900",
  },
  failed: {
    bg: "bg-red-100",
    border: "border-red-400",
    icon: "text-red-600",
    text: "text-red-900",
  },
  cancelled: {
    bg: "bg-gray-100",
    border: "border-gray-400",
    icon: "text-gray-600",
    text: "text-gray-900",
  },
};

// Default status icons
const STATUS_ICONS: Record<TimelineStatus, ReactNode> = {
  pending: <Clock className="w-5 h-5" />,
  processing: <Package className="w-5 h-5" />,
  completed: <CheckCircle2 className="w-5 h-5" />,
  failed: <XCircle className="w-5 h-5" />,
  cancelled: <AlertCircle className="w-5 h-5" />,
};

// Format timestamp with agricultural consciousness
function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } else if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const minutes = Math.floor(diff / (1000 * 60));
    return minutes < 1
      ? "Just now"
      : `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
}

/**
 * 🌾 Timeline Component - Divine Temporal Tracking
 *
 * Tracks order progression through the agricultural supply chain with
 * biodynamic consciousness and quantum temporal awareness.
 *
 * @example
 * ```tsx
 * const orderEvents: TimelineEvent[] = [
 *   {
 *     id: "1",
 *     title: "Order Placed",
 *     description: "Your farm fresh order has been received",
 *     timestamp: new Date("2024-01-15T10:00:00"),
 *     status: "completed"
 *   },
 *   {
 *     id: "2",
 *     title: "Farmer Preparing",
 *     description: "Harvest in progress from Sunrise Valley Farm",
 *     timestamp: new Date("2024-01-15T14:30:00"),
 *     status: "processing"
 *   },
 *   {
 *     id: "3",
 *     title: "Out for Delivery",
 *     timestamp: new Date(),
 *     status: "pending"
 *   }
 * ];
 *
 * <Timeline events={orderEvents} agriculturalTheme />
 * ```
 */
export function Timeline({
  events,
  orientation = "vertical",
  activeIndex,
  className,
  showConnectors = true,
  animated = true,
  agriculturalTheme = false,
}: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No timeline events to display</p>
      </div>
    );
  }

  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "timeline-container",
        isVertical
          ? "space-y-4"
          : "flex items-start space-x-8 overflow-x-auto pb-4",
        agriculturalTheme && "agricultural-timeline",
        className,
      )}
      role="list"
      aria-label="Timeline"
    >
      {events.map((event, index) => {
        const colors = STATUS_COLORS[event.status];
        const icon = event.icon || STATUS_ICONS[event.status];
        const isActive =
          activeIndex !== undefined ? index === activeIndex : false;
        const isLast = index === events.length - 1;

        return (
          <div
            key={event.id}
            className={cn(
              "timeline-event",
              isVertical
                ? "flex gap-4"
                : "flex flex-col items-center min-w-[200px]",
              animated && "transition-all duration-300",
              isActive && "scale-105",
            )}
            role="listitem"
          >
            {/* Timeline Node */}
            <div
              className={cn(
                "flex flex-col items-center",
                isVertical ? "pt-1" : "",
              )}
            >
              <div
                className={cn(
                  "timeline-node relative flex items-center justify-center rounded-full border-2 transition-all duration-300",
                  colors.bg,
                  colors.border,
                  colors.icon,
                  isActive ? "w-12 h-12 shadow-lg" : "w-10 h-10 shadow",
                  animated && "hover:scale-110",
                  agriculturalTheme && "shadow-green-100",
                )}
                aria-label={`${event.status} status`}
              >
                {icon}
              </div>

              {/* Connector Line */}
              {showConnectors && !isLast && (
                <div
                  className={cn(
                    "timeline-connector",
                    isVertical
                      ? "w-0.5 h-full min-h-[60px] ml-0"
                      : "h-0.5 w-full min-w-[100px] mt-0",
                    event.status === "completed"
                      ? "bg-green-400"
                      : event.status === "processing"
                        ? "bg-blue-400"
                        : "bg-gray-300",
                    animated && "transition-colors duration-500",
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Event Content */}
            <div
              className={cn(
                "timeline-content flex-1",
                isVertical ? "pb-6" : "pt-4 text-center",
              )}
            >
              <div
                className={cn("timeline-header", isActive && "font-semibold")}
              >
                <h3
                  className={cn(
                    "text-sm font-medium",
                    colors.text,
                    isVertical ? "text-left" : "text-center",
                  )}
                >
                  {event.title}
                </h3>
                <time
                  className="text-xs text-gray-500 mt-1 block"
                  dateTime={
                    typeof event.timestamp === "string"
                      ? event.timestamp
                      : event.timestamp.toISOString()
                  }
                >
                  {formatTimestamp(event.timestamp)}
                </time>
              </div>

              {event.description && (
                <p
                  className={cn(
                    "text-sm text-gray-600 mt-2",
                    isVertical ? "text-left" : "text-center",
                  )}
                >
                  {event.description}
                </p>
              )}

              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="timeline-metadata mt-3 text-xs text-gray-500">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-2">
                      <span className="font-medium capitalize">
                        {key.replace(/_/g, " ")}:
                      </span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 🌾 Order Timeline - Pre-configured for Agricultural Orders
 *
 * Specialized timeline for tracking farm product orders from placement to delivery.
 */
export interface OrderTimelineProps {
  orderId: string;
  status:
    | "placed"
    | "preparing"
    | "ready"
    | "in_transit"
    | "delivered"
    | "cancelled";
  placedAt: Date | string;
  preparedAt?: Date | string;
  readyAt?: Date | string;
  deliveredAt?: Date | string;
  cancelledAt?: Date | string;
  farmName?: string;
  deliveryAddress?: string;
  className?: string;
}

export function OrderTimeline({
  orderId,
  status,
  placedAt,
  preparedAt,
  readyAt,
  deliveredAt,
  cancelledAt,
  farmName,
  deliveryAddress,
  className,
}: OrderTimelineProps) {
  const events: TimelineEvent[] = [
    {
      id: `${orderId}-placed`,
      title: "Order Placed",
      description: "Your farm fresh order has been received",
      timestamp: placedAt,
      status: "completed",
      icon: <Check className="w-5 h-5" />,
    },
  ];

  if (status !== "cancelled") {
    events.push({
      id: `${orderId}-preparing`,
      title: "Farmer Preparing",
      description: farmName
        ? `Harvest in progress at ${farmName}`
        : "Preparing your fresh produce",
      timestamp: preparedAt || new Date(),
      status: preparedAt
        ? "completed"
        : status === "preparing"
          ? "processing"
          : "pending",
      icon: <Package className="w-5 h-5" />,
    });

    events.push({
      id: `${orderId}-ready`,
      title: "Ready for Pickup",
      description: "Your order is packed and ready",
      timestamp: readyAt || new Date(),
      status: readyAt
        ? "completed"
        : ["ready", "in_transit", "delivered"].includes(status)
          ? "processing"
          : "pending",
      icon: <CheckCircle2 className="w-5 h-5" />,
    });

    events.push({
      id: `${orderId}-transit`,
      title: "Out for Delivery",
      description: deliveryAddress
        ? `En route to ${deliveryAddress}`
        : "On the way to you",
      timestamp: readyAt || new Date(),
      status:
        status === "in_transit"
          ? "processing"
          : status === "delivered"
            ? "completed"
            : "pending",
      icon: <Truck className="w-5 h-5" />,
    });

    events.push({
      id: `${orderId}-delivered`,
      title: "Delivered",
      description: "Enjoy your fresh farm products!",
      timestamp: deliveredAt || new Date(),
      status: deliveredAt ? "completed" : "pending",
      icon: <Home className="w-5 h-5" />,
    });
  } else {
    events.push({
      id: `${orderId}-cancelled`,
      title: "Order Cancelled",
      description: "This order has been cancelled",
      timestamp: cancelledAt || new Date(),
      status: "cancelled",
      icon: <XCircle className="w-5 h-5" />,
    });
  }

  return (
    <Timeline
      events={events}
      className={className}
      agriculturalTheme
      animated
    />
  );
}

// Export for divine agricultural consciousness
export default Timeline;
