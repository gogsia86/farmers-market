// 🧠 DIVINE PATTERN: PWA Service Worker - Agricultural Consciousness Offline Support
// 📚 Reference: 03_PERFORMANCE_REALITY_BENDING.instructions.md
// 🌾 Domain: Offline-First Agricultural Experience
// ⚡ Performance: Intelligent Caching with Quantum Strategies

const CACHE_NAME = "farmers-market-v1";
const RUNTIME_CACHE = "farmers-market-runtime";
const IMAGE_CACHE = "farmers-market-images";

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
    // Get pending orders from IndexedDB or localStorage
    const pendingOrders = await getPendingOrders();

    if (pendingOrders.length === 0) {
      return;
    }

    // Attempt to sync each order
    const syncPromises = pendingOrders.map(async (order) => {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
        });

        if (response.ok) {
          // Remove synced order from pending queue
          await removePendingOrder(order.id);
          console.log("[Service Worker] Order synced:", order.id);
        }
      } catch (error) {
        console.error("[Service Worker] Failed to sync order:", error);
      }
    });

    await Promise.all(syncPromises);
  } catch (error) {
    console.error("[Service Worker] Background sync failed:", error);
    throw error;
  }
}

// Helper functions for pending orders (placeholder - implement with IndexedDB)
async function getPendingOrders() {
  // TODO: Implement with IndexedDB
  return [];
}

async function removePendingOrder(orderId) {
  // TODO: Implement with IndexedDB
  console.log("[Service Worker] Removing order:", orderId);
}

console.log("[Service Worker] Loaded with agricultural consciousness 🌾");
