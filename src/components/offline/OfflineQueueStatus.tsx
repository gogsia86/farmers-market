"use client";

// 📴 OFFLINE QUEUE STATUS COMPONENT
// Displays pending offline orders and sync status
// 🌾 Domain: Agricultural E-Commerce Offline-First

import {
    clearFailedOrders,
    getOfflineQueueStats,
    getPendingOrderCount,
    isOffline,
    onOnlineStatusChange,
    onOrderSynced,
    syncPendingOrders,
    type OfflineQueueStats,
} from "@/lib/utils/offline-queue";
import { useEffect, useState } from "react";

interface OfflineQueueStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function OfflineQueueStatus({
  className = "",
  showDetails = false,
}: OfflineQueueStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [stats, setStats] = useState<OfflineQueueStats>({
    pendingOrders: 0,
    failedRequests: 0,
    cachedEntries: 0,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Update online status
  useEffect(() => {
    setIsOnline(!isOffline());

    const cleanup = onOnlineStatusChange((online) => {
      setIsOnline(online);
    });

    return cleanup;
  }, []);

  // Update pending count
  useEffect(() => {
    async function updateCount() {
      const count = await getPendingOrderCount();
      setPendingCount(count);
    }

    updateCount();

    // Poll every 30 seconds
    const interval = setInterval(updateCount, 30000);

    return () => clearInterval(interval);
  }, []);

  // Update detailed stats
  useEffect(() => {
    if (!showDetails) return;

    async function updateStats() {
      const newStats = await getOfflineQueueStats();
      setStats(newStats);
    }

    updateStats();

    // Poll every 30 seconds
    const interval = setInterval(updateStats, 30000);

    return () => clearInterval(interval);
  }, [showDetails]);

  // Listen for order sync events
  useEffect(() => {
    const cleanup = onOrderSynced((event) => {
      console.log("✅ Order synced:", event);
      setLastSyncTime(new Date(event.timestamp));

      // Update counts
      getPendingOrderCount().then(setPendingCount);
      if (showDetails) {
        getOfflineQueueStats().then(setStats);
      }
    });

    return cleanup;
  }, [showDetails]);

  // Handle manual sync
  const handleSyncNow = async () => {
    if (!isOnline) {
      alert("Cannot sync while offline. Please check your connection.");
      return;
    }

    setIsSyncing(true);
    try {
      await syncPendingOrders();
      setLastSyncTime(new Date());

      // Update counts
      const count = await getPendingOrderCount();
      setPendingCount(count);

      if (showDetails) {
        const newStats = await getOfflineQueueStats();
        setStats(newStats);
      }

      if (count === 0) {
        alert("All orders synced successfully! ✅");
      }
    } catch (error) {
      console.error("Sync failed:", error);
      alert("Failed to sync orders. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle clear failed orders
  const handleClearFailed = async () => {
    if (!confirm("Clear all failed orders? This cannot be undone.")) {
      return;
    }

    try {
      const cleared = await clearFailedOrders();
      alert(`Cleared ${cleared} failed order(s)`);

      // Update counts
      const count = await getPendingOrderCount();
      setPendingCount(count);

      if (showDetails) {
        const newStats = await getOfflineQueueStats();
        setStats(newStats);
      }
    } catch (error) {
      console.error("Failed to clear orders:", error);
      alert("Failed to clear orders. Please try again.");
    }
  };

  // Don't show if no pending orders and online
  if (pendingCount === 0 && isOnline && !showDetails) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              isOnline ? "bg-green-500" : "bg-red-500"
            }`}
            title={isOnline ? "Online" : "Offline"}
          />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {isOnline ? "🌐 Online" : "📴 Offline"}
            </h3>
            {pendingCount > 0 && (
              <p className="text-xs text-gray-600">
                {pendingCount} order{pendingCount > 1 ? "s" : ""} pending sync
              </p>
            )}
          </div>
        </div>

        {pendingCount > 0 && isOnline && (
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSyncing ? "Syncing..." : "Sync Now"}
          </button>
        )}
      </div>

      {/* Offline Warning */}
      {!isOnline && (
        <div className="mt-3 rounded-md bg-yellow-50 p-3">
          <p className="text-sm text-yellow-800">
            📴 You&apos;re offline. Orders will be queued and synced when
            you&apos;re back online.
          </p>
        </div>
      )}

      {/* Pending Orders Info */}
      {pendingCount > 0 && (
        <div className="mt-3 rounded-md bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            📦 {pendingCount} order{pendingCount > 1 ? "s" : ""} waiting to be
            synced with the server.
          </p>
          {isOnline && (
            <p className="mt-1 text-xs text-blue-600">
              Sync will happen automatically in the background.
            </p>
          )}
        </div>
      )}

      {/* Detailed Stats */}
      {showDetails && (
        <div className="mt-4 space-y-2 border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-900">
            Queue Statistics
          </h4>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-gray-50 p-2">
              <div className="text-2xl font-bold text-gray-900">
                {stats.pendingOrders}
              </div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
            <div className="rounded-md bg-gray-50 p-2">
              <div className="text-2xl font-bold text-gray-900">
                {stats.failedRequests}
              </div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
            <div className="rounded-md bg-gray-50 p-2">
              <div className="text-2xl font-bold text-gray-900">
                {stats.cachedEntries}
              </div>
              <div className="text-xs text-gray-600">Cached</div>
            </div>
          </div>

          {stats.failedRequests > 0 && (
            <button
              onClick={handleClearFailed}
              className="mt-2 w-full rounded bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
            >
              Clear Failed Orders
            </button>
          )}

          {lastSyncTime && (
            <p className="mt-2 text-xs text-gray-500">
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      {/* Success Message */}
      {pendingCount === 0 && isOnline && showDetails && (
        <div className="mt-3 rounded-md bg-green-50 p-3">
          <p className="text-sm text-green-800">
            ✅ All orders synced successfully!
          </p>
        </div>
      )}
    </div>
  );
}

// Compact badge component for navbar/header
export function OfflineQueueBadge() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(!isOffline());

    const cleanup = onOnlineStatusChange((online) => {
      setIsOnline(online);
    });

    return cleanup;
  }, []);

  useEffect(() => {
    async function updateCount() {
      const count = await getPendingOrderCount();
      setPendingCount(count);
    }

    updateCount();

    // Update when orders are synced
    const cleanup = onOrderSynced(() => {
      updateCount();
    });

    // Poll every 30 seconds
    const interval = setInterval(updateCount, 30000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  if (pendingCount === 0 && isOnline) {
    return null;
  }

  return (
    <div className="relative">
      {!isOnline && (
        <div
          className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white"
          title="Offline mode"
        >
          📴
        </div>
      )}
      {pendingCount > 0 && (
        <div
          className="rounded-full bg-blue-600 px-2 py-1 text-xs font-bold text-white"
          title={`${pendingCount} order(s) pending sync`}
        >
          {pendingCount}
        </div>
      )}
    </div>
  );
}

// Hook for easier usage in components
export function useOfflineQueueStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [stats, setStats] = useState<OfflineQueueStats>({
    pendingOrders: 0,
    failedRequests: 0,
    cachedEntries: 0,
  });

  useEffect(() => {
    setIsOnline(!isOffline());

    const cleanup = onOnlineStatusChange((online) => {
      setIsOnline(online);
    });

    return cleanup;
  }, []);

  useEffect(() => {
    async function update() {
      const count = await getPendingOrderCount();
      setPendingCount(count);

      const newStats = await getOfflineQueueStats();
      setStats(newStats);
    }

    update();

    const cleanup = onOrderSynced(() => {
      update();
    });

    const interval = setInterval(update, 30000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    pendingCount,
    stats,
    syncNow: syncPendingOrders,
    clearFailed: clearFailedOrders,
  };
}
