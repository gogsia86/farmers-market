"use client";

/**
 * 🧠 FARMER ORDERS REAL-TIME ALERT COMPONENT
 * Real-time new order notifications for farmers
 * Following: Socket.io Integration & Agricultural Consciousness Patterns
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFarmOrders } from "@/hooks/realtime";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Package,
  Radio,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FarmerOrdersRealtimeProps {
  farmId: string;
  className?: string;
}

/**
 * Real-time new order alerts for farmers
 * Displays connection status and new order count
 */
export function FarmerOrdersRealtime({
  farmId,
  className,
}: FarmerOrdersRealtimeProps) {
  const router = useRouter();
  const [displayCount, setDisplayCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const { isConnected, newOrders } = useFarmOrders(farmId);

  // Handle new orders
  useEffect(() => {
    if (newOrders.length === 0) return;

    const latestOrder = newOrders[0];
    const order = latestOrder.order;

    // Show toast notification
    toast.success("New Order Received!", {
      description: `Order #${order.orderNumber} - ${formatCurrency(Number(order.total || 0))}`,
      icon: <ShoppingCart className="w-4 h-4" />,
      duration: 10000,
      action: {
        label: "View",
        onClick: () =>
          router.push(`/farmer/farms/${farmId}/orders/${order.id}`),
      },
    });

    // Play notification sound
    playNotificationSound();

    // Update state
    setDisplayCount(newOrders.length);

    // Calculate total revenue
    const revenue = newOrders.reduce(
      (sum, orderPayload) => sum + Number(orderPayload.order.total || 0),
      0,
    );
    setTotalRevenue(revenue);

    // Refresh the page data
    router.refresh();
  }, [newOrders, router, farmId]);

  // Reset count when viewing orders
  const handleViewOrders = () => {
    setDisplayCount(0);
  };

  return (
    <Card className={className}>
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
              Offline
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* New Orders Alert */}
        {displayCount > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    {displayCount} New {displayCount === 1 ? "Order" : "Orders"}
                    !
                  </p>
                  <p className="text-xs text-green-700">
                    {formatCurrency(totalRevenue)} total revenue
                  </p>
                </div>
              </div>
              <Link
                href={`/farmer/farms/${farmId}/orders`}
                onClick={handleViewOrders}
              >
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  View Orders
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {newOrders.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Recent Orders
            </p>
            <div className="space-y-2">
              {newOrders.slice(0, 5).map((orderPayload, index) => {
                const order = orderPayload.order;
                return (
                  <Link
                    key={order.id || index}
                    href={`/farmer/farms/${farmId}/orders/${order.id}`}
                    className="block p-3 bg-muted/50 hover:bg-muted rounded-lg border border-border transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(
                              new Date(orderPayload.timestamp),
                              {
                                addSuffix: true,
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-green-600 ml-2">
                        {formatCurrency(Number(order.total || 0))}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Connection Status */}
        {isConnected ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Sparkles className="w-3 h-3 text-green-500" />
            <span>Real-time order notifications active</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Connecting to live updates...</span>
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
 * Compact notification badge for farmer dashboard
 */
export function FarmerNewOrdersBadge({
  farmId,
  className,
}: {
  farmId: string;
  className?: string;
}) {
  const { isConnected, newOrders } = useFarmOrders(farmId);
  const count = newOrders.length;

  if (count === 0) {
    return null;
  }

  return (
    <Badge variant="destructive" className={`gap-1 animate-pulse ${className}`}>
      <Bell className="w-3 h-3" />
      {count} New
      {isConnected && <Radio className="w-2 h-2 animate-pulse ml-1" />}
    </Badge>
  );
}

/**
 * Stats card showing real-time order metrics
 */
export function FarmerOrderStats({
  farmId,
  initialStats,
}: {
  farmId: string;
  initialStats?: {
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
  };
}) {
  const [stats, setStats] = useState(
    initialStats || {
      todayOrders: 0,
      todayRevenue: 0,
      pendingOrders: 0,
    },
  );

  const { isConnected, newOrders } = useFarmOrders(farmId);

  // Update stats when new orders arrive
  useEffect(() => {
    if (newOrders.length === 0) return;

    const latestOrder = newOrders[0];
    const order = latestOrder.order;

    setStats((prev) => ({
      todayOrders: prev.todayOrders + 1,
      todayRevenue: prev.todayRevenue + Number(order.total || 0),
      pendingOrders: prev.pendingOrders + 1,
    }));
  }, [newOrders]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Today's Orders */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Today's Orders
            </p>
            {isConnected && (
              <Badge variant="outline" className="gap-1">
                <Radio className="w-2 h-2 animate-pulse text-green-500" />
                Live
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{stats.todayOrders}</p>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Today's Revenue */}
      <Card>
        <CardHeader className="pb-2">
          <p className="text-sm font-medium text-muted-foreground">
            Today's Revenue
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">
              {formatCurrency(stats.todayRevenue)}
            </p>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Pending Orders */}
      <Card>
        <CardHeader className="pb-2">
          <p className="text-sm font-medium text-muted-foreground">
            Pending Orders
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{stats.pendingOrders}</p>
            <Package className="w-4 h-4 text-yellow-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Play notification sound
 */
function playNotificationSound() {
  if (typeof window === "undefined") return;

  try {
    // Create audio context for better browser support
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();

    // Create oscillator for notification sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure sound (pleasant notification tone)
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.value = 0.1;

    // Play sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);

    // Cleanup
    setTimeout(() => {
      audioContext.close();
    }, 500);
  } catch (error) {
    console.warn("Could not play notification sound:", error);
  }
}
