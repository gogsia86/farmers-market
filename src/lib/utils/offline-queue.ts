// 📴 OFFLINE QUEUE UTILITIES - Client-Side Service Worker Communication
// 🌾 Domain: Agricultural E-Commerce Offline-First
// 📚 Reference: Service Worker IndexedDB integration
// ⚡ Performance: Seamless offline order handling

/**
 * Check if Service Worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return "serviceWorker" in navigator;
}

/**
 * Check if IndexedDB is supported
 */
export function isIndexedDBSupported(): boolean {
  return "indexedDB" in window;
}

/**
 * Check if offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Get registered Service Worker
 */
async function getServiceWorker(): Promise<ServiceWorker | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.active;
}

/**
 * Send message to Service Worker and wait for response
 */
async function sendMessageToSW(type: string, data?: any): Promise<any> {
  const sw = await getServiceWorker();

  if (!sw) {
    throw new Error("Service Worker not available");
  }

  return new Promise((resolve, reject) => {
    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = (event) => {
      if (event.data.success) {
        resolve(event.data);
      } else {
        reject(new Error(event.data.error || "Unknown error"));
      }
    };

    sw.postMessage({ type, ...data }, [messageChannel.port2]);

    // Timeout after 5 seconds
    setTimeout(() => {
      reject(new Error("Service Worker response timeout"));
    }, 5000);
  });
}

// =============================================================================
// OFFLINE ORDER QUEUE OPERATIONS
// =============================================================================

export interface QueuedOrder {
  id?: number;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress?: any;
  paymentMethod?: string;
  timestamp?: number;
  status?: "pending" | "syncing" | "synced" | "failed";
  retryCount?: number;
}

export interface OfflineQueueStats {
  pendingOrders: number;
  failedRequests: number;
  cachedEntries: number;
}

/**
 * Queue an order for offline processing
 * @param orderData - Order data to queue
 * @returns Promise with local order ID
 */
export async function queueOfflineOrder(
  orderData: Omit<QueuedOrder, "id" | "timestamp" | "status" | "retryCount">,
): Promise<number> {
  if (!isServiceWorkerSupported()) {
    throw new Error("Service Worker not supported");
  }

  if (!isOffline()) {
    console.warn("Device is online - consider using direct API call");
  }

  try {
    const response = await sendMessageToSW("QUEUE_ORDER", { orderData });
    console.log("✅ Order queued for offline sync:", response.orderId);
    return response.orderId;
  } catch (error) {
    console.error("❌ Failed to queue order:", error);
    throw error;
  }
}

/**
 * Get count of pending orders in queue
 * @returns Promise with count
 */
export async function getPendingOrderCount(): Promise<number> {
  if (!isServiceWorkerSupported()) {
    return 0;
  }

  try {
    const response = await sendMessageToSW("GET_PENDING_COUNT");
    return response.count;
  } catch (error) {
    console.error("Failed to get pending order count:", error);
    return 0;
  }
}

/**
 * Get offline queue statistics
 * @returns Promise with stats
 */
export async function getOfflineQueueStats(): Promise<OfflineQueueStats> {
  if (!isServiceWorkerSupported()) {
    return {
      pendingOrders: 0,
      failedRequests: 0,
      cachedEntries: 0,
    };
  }

  try {
    const response = await sendMessageToSW("GET_DB_STATS");
    return response.stats;
  } catch (error) {
    console.error("Failed to get queue stats:", error);
    return {
      pendingOrders: 0,
      failedRequests: 0,
      cachedEntries: 0,
    };
  }
}

/**
 * Clear failed orders from queue
 * @returns Promise with count of cleared orders
 */
export async function clearFailedOrders(): Promise<number> {
  if (!isServiceWorkerSupported()) {
    return 0;
  }

  try {
    const response = await sendMessageToSW("CLEAR_FAILED_ORDERS");
    console.log(`🧹 Cleared ${response.clearedCount} failed orders`);
    return response.clearedCount;
  } catch (error) {
    console.error("Failed to clear failed orders:", error);
    return 0;
  }
}

/**
 * Manually trigger sync of pending orders
 * @returns Promise that resolves when sync is complete
 */
export async function syncPendingOrders(): Promise<void> {
  if (!isServiceWorkerSupported()) {
    throw new Error("Service Worker not supported");
  }

  try {
    await sendMessageToSW("SYNC_NOW");
    console.log("✅ Manual sync triggered successfully");
  } catch (error) {
    console.error("❌ Failed to trigger sync:", error);
    throw error;
  }
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

export type OrderSyncCallback = (event: {
  localOrderId: number;
  serverOrderId?: string;
  timestamp: number;
}) => void;

export type OnlineStatusCallback = (isOnline: boolean) => void;

/**
 * Listen for order sync events from Service Worker
 * @param callback - Function to call when order is synced
 * @returns Cleanup function
 */
export function onOrderSynced(callback: OrderSyncCallback): () => void {
  if (!isServiceWorkerSupported()) {
    return () => {};
  }

  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === "ORDER_SYNCED") {
      callback(event.data.data);
    }
  };

  navigator.serviceWorker.addEventListener("message", handler);

  // Return cleanup function
  return () => {
    navigator.serviceWorker.removeEventListener("message", handler);
  };
}

/**
 * Listen for online/offline status changes
 * @param callback - Function to call when status changes
 * @returns Cleanup function
 */
export function onOnlineStatusChange(
  callback: OnlineStatusCallback,
): () => void {
  const onlineHandler = () => {
    console.log("🌐 Device is online");
    callback(true);

    // Trigger sync when coming back online
    if (isServiceWorkerSupported()) {
      syncPendingOrders().catch(console.error);
    }
  };

  const offlineHandler = () => {
    console.log("📴 Device is offline");
    callback(false);
  };

  window.addEventListener("online", onlineHandler);
  window.addEventListener("offline", offlineHandler);

  // Return cleanup function
  return () => {
    window.removeEventListener("online", onlineHandler);
    window.removeEventListener("offline", offlineHandler);
  };
}

// =============================================================================
// REACT HOOKS (Optional - for React components)
// =============================================================================

/**
 * React hook for managing offline queue
 * Usage:
 *
 * const {
 *   isOnline,
 *   pendingCount,
 *   queueOrder,
 *   stats
 * } = useOfflineQueue();
 */
export function useOfflineQueue() {
  if (typeof window === "undefined") {
    return {
      isOnline: true,
      pendingCount: 0,
      stats: { pendingOrders: 0, failedRequests: 0, cachedEntries: 0 },
      queueOrder: async () => 0,
      clearFailed: async () => 0,
      syncNow: async () => {},
    };
  }

  // For use with React - implement with useState and useEffect
  // This is a basic version - enhance with React hooks as needed
  return {
    isOnline: navigator.onLine,
    pendingCount: 0, // Poll with useEffect
    stats: { pendingOrders: 0, failedRequests: 0, cachedEntries: 0 },
    queueOrder: queueOfflineOrder,
    clearFailed: clearFailedOrders,
    syncNow: syncPendingOrders,
  };
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Check if order should be queued offline
 * @param force - Force offline queueing even if online
 * @returns true if should queue offline
 */
export function shouldQueueOffline(force: boolean = false): boolean {
  if (force) return true;
  if (!isServiceWorkerSupported()) return false;
  if (!isIndexedDBSupported()) return false;
  return isOffline();
}

/**
 * Get offline queue status as human-readable string
 * @returns Status message
 */
export async function getOfflineQueueStatus(): Promise<string> {
  if (!isServiceWorkerSupported()) {
    return "Offline mode not available";
  }

  const stats = await getOfflineQueueStats();

  if (stats.pendingOrders === 0) {
    return "All orders synced ✅";
  }

  return `${stats.pendingOrders} order${stats.pendingOrders > 1 ? "s" : ""} pending sync`;
}

/**
 * Display offline queue badge number
 * Useful for showing pending count in UI
 * @returns Badge number (0 if none)
 */
export async function getOfflineQueueBadge(): Promise<number> {
  const stats = await getOfflineQueueStats();
  return stats.pendingOrders;
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export class OfflineQueueError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "OfflineQueueError";
  }
}

/**
 * Handle offline order submission
 * Try to submit online first, queue for offline if fails
 */
export async function handleOrderSubmission(
  orderData: any,
  submitToAPI: (data: any) => Promise<any>,
): Promise<{
  success: boolean;
  orderId?: string | number;
  queuedOffline?: boolean;
  error?: string;
}> {
  // Try online submission first
  if (navigator.onLine) {
    try {
      const result = await submitToAPI(orderData);
      return {
        success: true,
        orderId: result.id,
        queuedOffline: false,
      };
    } catch (error) {
      console.warn("Online order submission failed, queueing offline:", error);
    }
  }

  // Queue for offline if online failed or offline
  try {
    const localOrderId = await queueOfflineOrder(orderData);
    return {
      success: true,
      orderId: localOrderId,
      queuedOffline: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to queue order",
      queuedOffline: false,
    };
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize offline queue monitoring
 * Call this once when app loads
 */
export function initOfflineQueue(): () => void {
  const cleanupFunctions: Array<() => void> = [];

  // Listen for order sync events
  const cleanupSyncListener = onOrderSynced((event) => {
    console.log("✅ Order synced:", event);

    // Dispatch custom event for app-wide handling
    window.dispatchEvent(new CustomEvent("orderSynced", { detail: event }));
  });
  cleanupFunctions.push(cleanupSyncListener);

  // Listen for online/offline status
  const cleanupStatusListener = onOnlineStatusChange((isOnline) => {
    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("onlineStatusChange", {
        detail: { isOnline },
      }),
    );
  });
  cleanupFunctions.push(cleanupStatusListener);

  // Poll pending count periodically (every 30 seconds)
  const interval = setInterval(async () => {
    const count = await getPendingOrderCount();
    if (count > 0) {
      console.log(`📦 ${count} order(s) pending sync`);

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("pendingOrdersUpdate", {
          detail: { count },
        }),
      );
    }
  }, 30000);

  cleanupFunctions.push(() => clearInterval(interval));

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}

console.log("📴 Offline queue utilities loaded 🌾");
