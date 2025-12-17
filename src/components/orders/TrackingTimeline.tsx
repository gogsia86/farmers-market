/**
 * 📦 TRACKING TIMELINE COMPONENT
 * Divine Agricultural Order Tracking System
 *
 * Features:
 * - Real-time order status tracking with visual timeline
 * - Multi-farm order coordination display
 * - Agricultural delivery status updates
 * - Estimated delivery times with farm preparation stages
 * - Live location tracking integration
 * - Delivery driver information
 * - Farm-specific status updates
 * - Photo proof of delivery
 * - Mobile-optimized responsive design
 * - Accessibility compliant (WCAG 2.1 AA)
 *
 * @divine-consciousness Agricultural delivery intelligence
 * @quantum-pattern Biodynamic logistics tracking
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  CheckCircle,
  Circle,
  Clock,
  Truck,
  MapPin,
  User,
  Phone,
  MessageSquare,
  Camera,
  Leaf,
  Home,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Navigation,
  Calendar,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// 🎯 DIVINE TYPE DEFINITIONS
// ============================================

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

interface TimelineEvent {
  id: string;
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  isCompleted: boolean;
  isCurrent: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  metadata?: {
    farmName?: string;
    estimatedTime?: string;
    location?: string;
    photoUrl?: string;
    notes?: string;
  };
}

interface DeliveryDriver {
  id: string;
  name: string;
  phone: string;
  photoUrl?: string;
  vehicleInfo?: string;
  rating?: number;
  deliveryCount?: number;
}

interface FarmOrderStatus {
  farmId: string;
  farmName: string;
  farmSlug: string;
  farmLogo?: string | null;
  status: OrderStatus;
  itemCount: number;
  estimatedReadyTime?: string;
  actualReadyTime?: string;
  notes?: string;
}

interface DeliveryLocation {
  latitude: number;
  longitude: number;
  address: string;
  lastUpdated: string;
}

interface TrackingTimelineProps {
  /** Order ID for tracking */
  orderId: string;
  /** Current order status */
  currentStatus: OrderStatus;
  /** Timeline events history */
  events: TimelineEvent[];
  /** Farm-specific order statuses */
  farmStatuses?: FarmOrderStatus[];
  /** Delivery driver information */
  driver?: DeliveryDriver;
  /** Current delivery location */
  deliveryLocation?: DeliveryLocation;
  /** Estimated delivery time */
  estimatedDelivery?: string;
  /** Delivery address */
  deliveryAddress?: {
    name: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  /** Enable live tracking */
  enableLiveTracking?: boolean;
  /** Enable notifications */
  enableNotifications?: boolean;
  /** Callback for refresh */
  onRefresh?: () => void;
  /** Custom CSS classes */
  className?: string;
}

// ============================================
// 🌾 STATUS CONFIGURATIONS
// ============================================

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }
> = {
  PENDING: {
    label: "Order Pending",
    color: "gray",
    icon: Clock,
    description: "Waiting for confirmation",
  },
  CONFIRMED: {
    label: "Order Confirmed",
    color: "blue",
    icon: CheckCircle,
    description: "Farms are preparing your order",
  },
  PREPARING: {
    label: "Being Prepared",
    color: "amber",
    icon: Package,
    description: "Fresh products being harvested and packed",
  },
  READY_FOR_PICKUP: {
    label: "Ready for Pickup",
    color: "purple",
    icon: Package,
    description: "All items ready, awaiting delivery",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    color: "indigo",
    icon: Truck,
    description: "On the way to your location",
  },
  DELIVERED: {
    label: "Delivered",
    color: "green",
    icon: CheckCircle,
    description: "Order successfully delivered",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "red",
    icon: AlertCircle,
    description: "Order has been cancelled",
  },
};

// ============================================
// 🎨 MAIN COMPONENT
// ============================================

export function TrackingTimeline({
  orderId,
  currentStatus,
  events,
  farmStatuses = [],
  driver,
  deliveryLocation,
  estimatedDelivery,
  deliveryAddress,
  enableLiveTracking = true,
  enableNotifications = true,
  onRefresh,
  className,
}: TrackingTimelineProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const statusConfig = STATUS_CONFIG[currentStatus];
  const isDelivered = currentStatus === "DELIVERED";
  const isCancelled = currentStatus === "CANCELLED";
  const isActive = !isDelivered && !isCancelled;

  // Auto-refresh effect
  useEffect(() => {
    if (!isActive || !enableLiveTracking) return;

    const interval = setInterval(() => {
      setLastUpdated(new Date());
      onRefresh?.();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isActive, enableLiveTracking, onRefresh]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    await onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Handle notification toggle
  const handleToggleNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Order #{orderId.slice(0, 8).toUpperCase()}
              </h2>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-semibold",
                  statusConfig.color === "gray" && "bg-gray-100 text-gray-700",
                  statusConfig.color === "blue" && "bg-blue-100 text-blue-700",
                  statusConfig.color === "amber" && "bg-amber-100 text-amber-700",
                  statusConfig.color === "purple" && "bg-purple-100 text-purple-700",
                  statusConfig.color === "indigo" && "bg-indigo-100 text-indigo-700",
                  statusConfig.color === "green" && "bg-green-100 text-green-700",
                  statusConfig.color === "red" && "bg-red-100 text-red-700"
                )}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-gray-600">{statusConfig.description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {enableNotifications && isActive && (
              <button
                onClick={handleToggleNotifications}
                className={cn(
                  "p-2 rounded-lg border transition-colors",
                  notificationsEnabled
                    ? "bg-green-50 border-green-200 text-green-600"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                )}
                title={notificationsEnabled ? "Notifications enabled" : "Enable notifications"}
              >
                <Bell className="h-5 w-5" />
              </button>
            )}
            {isActive && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Estimated Delivery */}
        {estimatedDelivery && isActive && (
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Calendar className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-900">
                Estimated Delivery
              </p>
              <p className="text-sm text-green-700">{estimatedDelivery}</p>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <p className="text-xs text-gray-500 mt-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      {/* Live Tracking Map */}
      {enableLiveTracking && deliveryLocation && currentStatus === "OUT_FOR_DELIVERY" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Navigation className="h-5 w-5 text-indigo-600" />
            Live Tracking
          </h3>
          <LiveTrackingMap location={deliveryLocation} destination={deliveryAddress} />
        </div>
      )}

      {/* Driver Information */}
      {driver && currentStatus === "OUT_FOR_DELIVERY" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5 text-indigo-600" />
            Your Delivery Driver
          </h3>
          <DriverCard driver={driver} />
        </div>
      )}

      {/* Farm Statuses */}
      {farmStatuses.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Leaf className="h-5 w-5 text-green-600" />
            Farm Preparation Status
          </h3>
          <div className="space-y-3">
            {farmStatuses.map((farmStatus) => (
              <FarmStatusCard key={farmStatus.farmId} farmStatus={farmStatus} />
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Order Timeline
        </h3>
        <div className="space-y-4">
          {events.map((event, index) => (
            <TimelineEventItem
              key={event.id}
              event={event}
              isLast={index === events.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Delivery Address */}
      {deliveryAddress && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Home className="h-5 w-5 text-gray-600" />
            Delivery Address
          </h3>
          <div className="text-gray-700">
            <p className="font-medium">{deliveryAddress.name}</p>
            <p>{deliveryAddress.streetAddress}</p>
            <p>
              {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zipCode}
            </p>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Need Help?
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          Contact our support team if you have any questions about your order.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Phone className="h-4 w-4" />
            Call Support
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
            <MessageSquare className="h-4 w-4" />
            Live Chat
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 📦 SUB-COMPONENTS
// ============================================

/**
 * Timeline Event Item
 */
function TimelineEventItem({
  event,
  isLast,
}: {
  event: TimelineEvent;
  isLast: boolean;
}) {
  const IconComponent = event.icon || Circle;

  return (
    <div className="flex gap-4">
      {/* Timeline Indicator */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
            event.isCompleted
              ? "bg-green-600 border-green-600"
              : event.isCurrent
              ? "bg-white border-indigo-600 ring-4 ring-indigo-100"
              : "bg-white border-gray-300"
          )}
        >
          <IconComponent
            className={cn(
              "h-5 w-5",
              event.isCompleted
                ? "text-white"
                : event.isCurrent
                ? "text-indigo-600"
                : "text-gray-400"
            )}
          />
        </div>
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1 min-h-[60px]",
              event.isCompleted ? "bg-green-600" : "bg-gray-300"
            )}
          />
        )}
      </div>

      {/* Event Content */}
      <div className="flex-1 pb-8">
        <div className="flex items-start justify-between mb-1">
          <h4
            className={cn(
              "font-semibold",
              event.isCurrent
                ? "text-indigo-900"
                : event.isCompleted
                ? "text-gray-900"
                : "text-gray-600"
            )}
          >
            {event.title}
          </h4>
          <span className="text-sm text-gray-500">
            {new Date(event.timestamp).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{event.description}</p>

        {/* Metadata */}
        {event.metadata && (
          <div className="space-y-2 mt-3">
            {event.metadata.farmName && (
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <span className="font-medium">{event.metadata.farmName}</span>
              </p>
            )}
            {event.metadata.estimatedTime && (
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                Est: {event.metadata.estimatedTime}
              </p>
            )}
            {event.metadata.location && (
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                {event.metadata.location}
              </p>
            )}
            {event.metadata.notes && (
              <p className="text-sm text-gray-600 italic">{event.metadata.notes}</p>
            )}
            {event.metadata.photoUrl && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 mt-2">
                <Image
                  src={event.metadata.photoUrl}
                  alt="Delivery proof"
                  fill
                  className="object-cover"
                  sizes="128px"
                />
                <button className="absolute top-2 right-2 p-1 bg-white/90 rounded-full">
                  <Camera className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Driver Card
 */
function DriverCard({ driver }: { driver: DeliveryDriver }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      {/* Driver Photo */}
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        {driver.photoUrl ? (
          <Image
            src={driver.photoUrl}
            alt={driver.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-indigo-100">
            <User className="h-8 w-8 text-indigo-600" />
          </div>
        )}
      </div>

      {/* Driver Info */}
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{driver.name}</p>
        {driver.vehicleInfo && (
          <p className="text-sm text-gray-600">{driver.vehicleInfo}</p>
        )}
        {driver.rating && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "text-sm",
                    i < Math.floor(driver.rating || 0)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  )}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {driver.deliveryCount} deliveries
            </span>
          </div>
        )}
      </div>

      {/* Contact Actions */}
      <div className="flex flex-col gap-2">
        <a
          href={`tel:${driver.phone}`}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <MessageSquare className="h-4 w-4" />
          Message
        </button>
      </div>
    </div>
  );
}

/**
 * Farm Status Card
 */
function FarmStatusCard({ farmStatus }: { farmStatus: FarmOrderStatus }) {
  const statusConfig = STATUS_CONFIG[farmStatus.status];

  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
      {/* Farm Logo */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {farmStatus.farmLogo ? (
          <Image
            src={farmStatus.farmLogo}
            alt={farmStatus.farmName}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="h-6 w-6 text-green-600" />
          </div>
        )}
      </div>

      {/* Farm Info */}
      <div className="flex-1">
        <Link
          href={`/farms/${farmStatus.farmSlug}`}
          className="font-medium text-gray-900 hover:text-green-600 transition-colors flex items-center gap-1"
        >
          {farmStatus.farmName}
          <ExternalLink className="h-3 w-3" />
        </Link>
        <p className="text-sm text-gray-600">
          {farmStatus.itemCount} {farmStatus.itemCount === 1 ? "item" : "items"}
        </p>
        {farmStatus.notes && (
          <p className="text-xs text-gray-500 italic mt-1">{farmStatus.notes}</p>
        )}
      </div>

      {/* Status Badge */}
      <div className="text-right">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold",
            statusConfig.color === "gray" && "bg-gray-100 text-gray-700",
            statusConfig.color === "blue" && "bg-blue-100 text-blue-700",
            statusConfig.color === "amber" && "bg-amber-100 text-amber-700",
            statusConfig.color === "purple" && "bg-purple-100 text-purple-700",
            statusConfig.color === "green" && "bg-green-100 text-green-700"
          )}
        >
          {statusConfig.label}
        </span>
        {farmStatus.estimatedReadyTime && (
          <p className="text-xs text-gray-500 mt-1">
            Ready: {farmStatus.estimatedReadyTime}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Live Tracking Map (Placeholder)
 */
function LiveTrackingMap({
  location,
  destination,
}: {
  location: DeliveryLocation;
  destination?: TrackingTimelineProps["deliveryAddress"];
}) {
  return (
    <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
      {/* Map Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Live map integration</p>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {new Date(location.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Location Info Overlay */}
      <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/95 backdrop-blur rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Current Location
              </p>
              <p className="text-xs text-gray-600">{location.address}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            <ExternalLink className="h-4 w-4" />
            Open Map
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 📤 EXPORTS
// ============================================

export type {
  OrderStatus,
  TimelineEvent,
  DeliveryDriver,
  FarmOrderStatus,
  DeliveryLocation,
  TrackingTimelineProps,
};
