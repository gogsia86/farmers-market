// 🧠 DIVINE PATTERN: Real-time Order Tracking Component
// 📚 Reference: Real-time Communication Client
// 🌾 Domain: Order Management with WebSocket
// ⚡ Performance: Live order updates without polling

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeOrders } from "@/hooks/realtime";
import { formatDistanceToNow } from "date-fns";
import {
    Bell,
    CheckCircle2,
    Clock,
    Package,
    Radio,
    RefreshCw,
    Truck,
    Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RealtimeOrderTrackerProps {
  orderId: string;
  currentStatus: string;
  onOrderUpdate?: () => void;
}

/**
 * Real-time order tracking component
 * Displays live connection status and order updates
 */
export function RealtimeOrderTracker({
  orderId,
  currentStatus,
  onOrderUpdate,
}: RealtimeOrderTrackerProps) {
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [updateHistory, setUpdateHistory] = useState<string[]>([]);

  const { latestUpdate, isConnected, updates } = useRealtimeOrders({
    orderId,
    autoSubscribe: true,
    onOrderUpdate: (update) => {
      console.log("📦 Real-time order update received:", update);

      // Show toast notification
      toast.success("Order Updated", {
        description: update.message || `Status: ${update.status}`,
        icon: <Package className="w-4 h-4" />,
      });

      // Update history
      const message = `${update.status}: ${update.message || "Status updated"}`;
      setUpdateHistory((prev) => [message, ...prev].slice(0, 5));

      // Update timestamp
      setLastUpdateTime(new Date(update.timestamp));

      // Notify parent to refetch
      onOrderUpdate?.();
    },
    onStatusChange: (change) => {
      console.log("📦 Order status changed:", change);

      // Show prominent notification for status changes
      toast.info("Status Changed", {
        description: `${change.previousStatus} → ${change.newStatus}`,
        icon: <Truck className="w-4 h-4" />,
        duration: 5000,
      });
    },
  });

  // Status icon mapping
  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "CONFIRMED":
        return <CheckCircle2 className="w-4 h-4" />;
      case "PROCESSING":
        return <Package className="w-4 h-4" />;
      case "READY_FOR_PICKUP":
        return <Bell className="w-4 h-4" />;
      case "OUT_FOR_DELIVERY":
        return <Truck className="w-4 h-4" />;
      case "DELIVERED":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Radio
              className={`w-4 h-4 ${isConnected ? "animate-pulse text-green-500" : "text-gray-400"}`}
            />
            Live Order Tracking
          </CardTitle>

          {isConnected ? (
            <Badge variant="success" className="gap-1">
              <Zap className="w-3 h-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Connecting...
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div className="flex-shrink-0">
            {getStatusIcon(currentStatus)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Current Status</p>
            <p className="text-lg font-semibold text-primary">
              {currentStatus.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        {/* Latest Update */}
        {latestUpdate && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Latest Update
            </p>
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {latestUpdate.message || "Status updated"}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {formatDistanceToNow(new Date(latestUpdate.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Update History */}
        {updateHistory.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Recent Updates ({updates.length})
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {updateHistory.map((update, index) => (
                <div
                  key={index}
                  className="text-xs p-2 bg-muted/50 rounded border border-border"
                >
                  {update}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Update Time */}
        {lastUpdateTime && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="w-3 h-3" />
            <span>
              Last activity:{" "}
              {formatDistanceToNow(lastUpdateTime, { addSuffix: true })}
            </span>
          </div>
        )}

        {/* Connection Info */}
        {!isConnected && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Attempting to connect to live updates...</span>
          </div>
        )}

        {/* Agricultural Consciousness Badge */}
        {isConnected && (
          <div className="flex items-center justify-center pt-2">
            <Badge variant="outline" className="text-xs gap-1">
              🌾 Agricultural Consciousness Active
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact version for header/navbar
 */
export function RealtimeOrderBadge({
  orderId,
  compact = false,
}: {
  orderId: string;
  compact?: boolean;
}) {
  const { isConnected, updates } = useRealtimeOrders({
    orderId,
    autoSubscribe: true,
  });

  if (compact) {
    return (
      <Badge
        variant={isConnected ? "success" : "secondary"}
        className="gap-1 text-xs"
      >
        <Radio
          className={`w-3 h-3 ${isConnected ? "animate-pulse" : ""}`}
        />
        {isConnected ? "Live" : "Offline"}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isConnected && (
        <Badge variant="success" className="gap-1">
          <Zap className="w-3 h-3" />
          Live Updates Active
        </Badge>
      )}
      {updates.length > 0 && (
        <Badge variant="secondary">{updates.length} updates</Badge>
      )}
    </div>
  );
}

/**
 * Notification sound player
 */
export function useOrderNotificationSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playSound = () => {
    if (!soundEnabled || typeof window === "undefined") return;

    try {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.3;
      audio.play().catch((error) => {
        console.warn("Failed to play notification sound:", error);
      });
    } catch (error) {
      console.warn("Notification sound not available:", error);
    }
  };

  return { playSound, soundEnabled, setSoundEnabled };
}
