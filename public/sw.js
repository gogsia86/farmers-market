// 🧠 DIVINE PATTERN: PWA Service Worker - Agricultural Consciousness Offline Support
// 📚 Reference: 03_PERFORMANCE_REALITY_BENDING.instructions.md
// 🌾 Domain: Offline-First Agricultural Experience
// ⚡ Performance: Intelligent Caching with Quantum Strategies

// Import IndexedDB utilities
importScripts("/db-utils.js");

const CACHE_NAME = "farmers-market-v1";
const RUNTIME_CACHE = "farmers-market-runtime";
const IMAGE_CACHE = "farmers-market-images";

// Max retry attempts for failed orders
const MAX_RETRY_ATTEMPTS = 5;

// Critical assets to cache on install
const PRECACHE_URLS = [
  "/",
  "/search",
  "/login",
  "/signup",
  "/offline",
  "/manifest.json",
  "/globals.css",
];

// Install event - cache critical assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Precaching critical assets");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName !== CACHE_NAME &&
                cacheName !== RUNTIME_CACHE &&
                cacheName !== IMAGE_CACHE
              );
            })
            .map((cacheName) => {
              console.log("[Service Worker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle API requests - network first with cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline response for failed API calls
            return new Response(
              JSON.stringify({ error: "Offline", offline: true }),
              {
                headers: { "Content-Type": "application/json" },
                status: 503,
              },
            );
          });
        }),
    );
    return;
  }

  // Handle image requests - cache first
  if (
    request.destination === "image" ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i)
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      }),
    );
    return;
  }

  // Handle page navigation - network first with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful page responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cached version or offline page
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match("/offline");
          });
        }),
    );
    return;
  }

  // Default: cache first, then network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok && request.method === "GET") {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    }),
  );
});

// Background sync for offline orders
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync:", event.tag);

  if (event.tag === "sync-orders") {
    event.waitUntil(syncOrders());
  }
});

// Push notification handler
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push notification received");

  const data = event.data ? event.data.json() : {};
  const title = data.title || "Farmers Market";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [],
    tag: data.tag || "default",
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked:", event.action);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

// Helper function to sync offline orders
async function syncOrders() {
  try {
    // Get pending orders from IndexedDB
    const pendingOrders = await self.dbUtils.getPendingOrders();

    if (pendingOrders.length === 0) {
      console.log("[Service Worker] No pending orders to sync");
      return;
    }

    console.log(
      `[Service Worker] Syncing ${pendingOrders.length} pending orders`,
    );

    // Attempt to sync each order
    const syncPromises = pendingOrders.map(async (order) => {
      try {
        // Check if max retries exceeded
        if (order.retryCount >= MAX_RETRY_ATTEMPTS) {
          console.warn(
            "[Service Worker] Max retries exceeded for order:",
            order.id,
          );
          await self.dbUtils.updateOrderStatus(order.id, "failed");
          return;
        }

        // Increment retry count
        await self.dbUtils.incrementRetryCount(order.id);

        // Prepare order data (remove internal fields)
        const orderData = { ...order };
        delete orderData.id;
        delete orderData.timestamp;
        delete orderData.status;
        delete orderData.retryCount;
        delete orderData.createdOffline;
        delete orderData.lastRetry;
        delete orderData.lastUpdated;

        // Attempt to send order to server
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });

        if (response.ok) {
          // Order synced successfully
          await self.dbUtils.removePendingOrder(order.id);
          console.log("[Service Worker] Order synced successfully:", order.id);

          // Get the created order ID from response
          const result = await response.json();

          // Notify all clients about successful sync
          const clients = await self.clients.matchAll();
          clients.forEach((client) => {
            client.postMessage({
              type: "ORDER_SYNCED",
              data: {
                localOrderId: order.id,
                serverOrderId: result.data?.id,
                timestamp: Date.now(),
              },
            });
          });
        } else {
          console.error(
            "[Service Worker] Failed to sync order:",
            response.status,
          );

          // If it's a permanent error (4xx), mark as failed
          if (response.status >= 400 && response.status < 500) {
            await self.dbUtils.updateOrderStatus(order.id, "failed");
          }
        }
      } catch (error) {
        console.error("[Service Worker] Failed to sync order:", error);

        // Network error - will retry on next sync
        console.log(
          "[Service Worker] Will retry order on next sync:",
          order.id,
        );
      }
    });

    await Promise.all(syncPromises);

    // Get updated stats
    const stats = await self.dbUtils.getDatabaseStats();
    console.log(
      "[Service Worker] Sync complete. Pending orders:",
      stats.pendingOrders,
    );
  } catch (error) {
    console.error("[Service Worker] Background sync failed:", error);
    throw error;
  }
}

// Helper function to add order to offline queue
async function queueOfflineOrder(orderData) {
  try {
    const orderId = await self.dbUtils.addPendingOrder(orderData);
    console.log("[Service Worker] Order queued for offline sync:", orderId);

    // Try to register background sync
    if ("sync" in self.registration) {
      await self.registration.sync.register("sync-orders");
      console.log("[Service Worker] Background sync registered");
    }

    return orderId;
  } catch (error) {
    console.error("[Service Worker] Failed to queue order:", error);
    throw error;
  }
}

// Helper functions for pending orders (using IndexedDB)
async function getPendingOrders() {
  return await self.dbUtils.getPendingOrders();
}

async function removePendingOrder(orderId) {
  return await self.dbUtils.removePendingOrder(orderId);
}

async function getPendingOrderCount() {
  return await self.dbUtils.getPendingOrderCount();
}

// Message handler for communication with clients
self.addEventListener("message", async (event) => {
  console.log("[Service Worker] Message received:", event.data.type);

  switch (event.data.type) {
    case "QUEUE_ORDER":
      try {
        const orderId = await queueOfflineOrder(event.data.orderData);
        event.ports[0]?.postMessage({
          success: true,
          orderId: orderId,
        });
      } catch (error) {
        event.ports[0]?.postMessage({
          success: false,
          error: error.message,
        });
      }
      break;

    case "GET_PENDING_COUNT":
      try {
        const count = await getPendingOrderCount();
        event.ports[0]?.postMessage({
          success: true,
          count: count,
        });
      } catch (error) {
        event.ports[0]?.postMessage({
          success: false,
          error: error.message,
        });
      }
      break;

    case "GET_DB_STATS":
      try {
        const stats = await self.dbUtils.getDatabaseStats();
        event.ports[0]?.postMessage({
          success: true,
          stats: stats,
        });
      } catch (error) {
        event.ports[0]?.postMessage({
          success: false,
          error: error.message,
        });
      }
      break;

    case "CLEAR_FAILED_ORDERS":
      try {
        const pendingOrders = await self.dbUtils.getPendingOrders();
        const failedOrders = pendingOrders.filter((o) => o.status === "failed");

        for (const order of failedOrders) {
          await self.dbUtils.removePendingOrder(order.id);
        }

        event.ports[0]?.postMessage({
          success: true,
          clearedCount: failedOrders.length,
        });
      } catch (error) {
        event.ports[0]?.postMessage({
          success: false,
          error: error.message,
        });
      }
      break;

    case "SYNC_NOW":
      try {
        await syncOrders();
        event.ports[0]?.postMessage({
          success: true,
        });
      } catch (error) {
        event.ports[0]?.postMessage({
          success: false,
          error: error.message,
        });
      }
      break;
  }
});

// Periodic cleanup of expired cache
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "cleanup-expired-cache") {
    event.waitUntil(self.dbUtils.clearExpiredCache());
  }
});

console.log("[Service Worker] Loaded with agricultural consciousness 🌾");
console.log("[Service Worker] IndexedDB offline queue ready 🗄️");
