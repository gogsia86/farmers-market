# 📴 OFFLINE QUEUE SYSTEM - Documentation

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: ✅ Production Ready

---

## 📖 Overview

The Offline Queue System enables the Farmers Market Platform to function seamlessly when users lose internet connectivity. Orders placed while offline are stored locally using IndexedDB and automatically synchronized when the connection is restored.

### Key Features

- ✅ **Automatic Queue Management** - Orders saved to IndexedDB when offline
- ✅ **Background Sync** - Automatic synchronization when online
- ✅ **Retry Logic** - Failed orders retried up to 5 times
- ✅ **Visual Feedback** - UI components show sync status
- ✅ **Zero Data Loss** - All orders preserved until synced
- ✅ **Service Worker Integration** - Runs in background
- ✅ **React Components** - Ready-to-use UI components

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT APPLICATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐      ┌───────────────────────┐        │
│  │  React Component │◄────►│  offline-queue.ts     │        │
│  │  (UI Layer)      │      │  (Client Utilities)   │        │
│  └──────────────────┘      └───────────┬───────────┘        │
│                                        │                      │
│                                        │ postMessage()        │
│                                        ▼                      │
├────────────────────────────────────────────────────────────┤
│                    SERVICE WORKER                           │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌────────────────┐                  │
│  │    sw.js     │◄────►│  db-utils.js   │                  │
│  │ (SW Logic)   │      │ (IndexedDB)    │                  │
│  └──────┬───────┘      └────────┬───────┘                  │
│         │                       │                           │
│         │                       ▼                           │
│         │              ┌─────────────────┐                  │
│         │              │   IndexedDB     │                  │
│         │              │  - Pending      │                  │
│         │              │  - Failed       │                  │
│         │              │  - Cached       │                  │
│         │              └─────────────────┘                  │
│         │                                                    │
│         │ Background Sync                                   │
│         ▼                                                    │
├────────────────────────────────────────────────────────────┤
│                      BACKEND API                            │
│                    POST /api/orders                         │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Service Worker Setup

The Service Worker is automatically loaded from `public/sw.js`:

```typescript
// public/sw.js (already configured)
importScripts("/db-utils.js");

// Service Worker handles:
// - Offline order queueing
// - Background synchronization
// - Retry logic with backoff
// - Message handling
```

### 2. Register Service Worker

In your app's root layout or initialization:

```typescript
// src/app/layout.tsx or _app.tsx
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker registered:', registration.scope);
        })
        .catch(error => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

  return <html>{children}</html>;
}
```

### 3. Initialize Offline Queue

Initialize the queue monitoring system:

```typescript
// src/app/layout.tsx or pages/_app.tsx
import { initOfflineQueue } from '@/lib/utils/offline-queue';

useEffect(() => {
  // Initialize offline queue monitoring
  const cleanup = initOfflineQueue();

  // Listen for custom events
  window.addEventListener('orderSynced', (event: any) => {
    console.log('✅ Order synced:', event.detail);
    // Show notification to user
  });

  window.addEventListener('pendingOrdersUpdate', (event: any) => {
    console.log(`📦 ${event.detail.count} orders pending`);
  });

  return cleanup;
}, []);
```

---

## 💻 Usage Examples

### Example 1: Queue Order When Offline

```typescript
import { queueOfflineOrder, isOffline } from '@/lib/utils/offline-queue';

async function handleCheckout(orderData: any) {
  // Check if offline
  if (isOffline()) {
    try {
      const localOrderId = await queueOfflineOrder({
        customerId: orderData.customerId,
        items: orderData.items,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress
      });

      alert(`Order queued! ID: ${localOrderId}\nWill sync when online.`);
      return localOrderId;
    } catch (error) {
      console.error('Failed to queue order:', error);
      alert('Failed to save order offline. Please try again.');
    }
  } else {
    // Normal online checkout
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    return await response.json();
  }
}
```

### Example 2: Smart Order Submission (Auto-Queue)

```typescript
import { handleOrderSubmission } from '@/lib/utils/offline-queue';

async function submitOrder(orderData: any) {
  const result = await handleOrderSubmission(
    orderData,
    async (data) => {
      // Your API call
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('API error');
      return await response.json();
    }
  );

  if (result.success) {
    if (result.queuedOffline) {
      alert(`Order queued offline! ID: ${result.orderId}`);
    } else {
      alert(`Order placed successfully! ID: ${result.orderId}`);
    }
  } else {
    alert(`Order failed: ${result.error}`);
  }
}
```

### Example 3: Display Offline Status

```typescript
import { OfflineQueueStatus } from '@/components/offline/OfflineQueueStatus';

export function CheckoutPage() {
  return (
    <div>
      <h1>Checkout</h1>

      {/* Show offline queue status */}
      <OfflineQueueStatus showDetails={true} />

      {/* Your checkout form */}
      <CheckoutForm />
    </div>
  );
}
```

### Example 4: Show Badge in Header

```typescript
import { OfflineQueueBadge } from '@/components/offline/OfflineQueueStatus';

export function Header() {
  return (
    <header>
      <nav>
        <Logo />
        <Menu />

        {/* Show pending order count */}
        <OfflineQueueBadge />
      </nav>
    </header>
  );
}
```

### Example 5: Manual Sync Button

```typescript
import { syncPendingOrders, getPendingOrderCount } from '@/lib/utils/offline-queue';
import { useState } from 'react';

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncPendingOrders();
      const count = await getPendingOrderCount();
      setPendingCount(count);
      alert('Sync complete!');
    } catch (error) {
      alert('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button onClick={handleSync} disabled={isSyncing}>
      {isSyncing ? 'Syncing...' : `Sync Orders (${pendingCount})`}
    </button>
  );
}
```

### Example 6: React Hook Usage

```typescript
import { useOfflineQueueStatus } from '@/components/offline/OfflineQueueStatus';

export function OrderDashboard() {
  const { isOnline, pendingCount, stats, syncNow, clearFailed } = useOfflineQueueStatus();

  return (
    <div>
      <h2>Order Status</h2>

      <div className="status-card">
        <p>Status: {isOnline ? '🌐 Online' : '📴 Offline'}</p>
        <p>Pending Orders: {pendingCount}</p>
        <p>Failed Orders: {stats.failedRequests}</p>

        <button onClick={syncNow} disabled={!isOnline}>
          Sync Now
        </button>

        {stats.failedRequests > 0 && (
          <button onClick={clearFailed}>
            Clear Failed Orders
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## 🔧 API Reference

### Client-Side Utilities (`src/lib/utils/offline-queue.ts`)

#### `queueOfflineOrder(orderData)`
Queue an order for offline processing.

**Parameters:**
- `orderData` (Object): Order data to queue
  - `customerId` (string): Customer ID
  - `items` (Array): Order items
  - `total` (number): Order total
  - `shippingAddress` (Object, optional): Shipping address
  - `paymentMethod` (string, optional): Payment method

**Returns:** `Promise<number>` - Local order ID

**Example:**
```typescript
const localId = await queueOfflineOrder({
  customerId: 'user_123',
  items: [{ productId: 'prod_1', quantity: 2, price: 10.00 }],
  total: 20.00
});
```

---

#### `getPendingOrderCount()`
Get count of pending orders in queue.

**Returns:** `Promise<number>` - Count of pending orders

**Example:**
```typescript
const count = await getPendingOrderCount();
console.log(`${count} orders pending`);
```

---

#### `getOfflineQueueStats()`
Get detailed offline queue statistics.

**Returns:** `Promise<OfflineQueueStats>`
```typescript
{
  pendingOrders: number;    // Orders waiting to sync
  failedRequests: number;   // Failed sync attempts
  cachedEntries: number;    // Cached data entries
}
```

**Example:**
```typescript
const stats = await getOfflineQueueStats();
console.log('Pending:', stats.pendingOrders);
console.log('Failed:', stats.failedRequests);
```

---

#### `syncPendingOrders()`
Manually trigger synchronization of pending orders.

**Returns:** `Promise<void>`

**Example:**
```typescript
try {
  await syncPendingOrders();
  console.log('✅ Sync complete');
} catch (error) {
  console.error('❌ Sync failed:', error);
}
```

---

#### `clearFailedOrders()`
Clear all failed orders from queue.

**Returns:** `Promise<number>` - Count of cleared orders

**Example:**
```typescript
const cleared = await clearFailedOrders();
console.log(`Cleared ${cleared} failed orders`);
```

---

#### `isOffline()`
Check if device is currently offline.

**Returns:** `boolean`

**Example:**
```typescript
if (isOffline()) {
  console.log('📴 Device is offline');
}
```

---

#### `onOrderSynced(callback)`
Listen for order sync events.

**Parameters:**
- `callback` (Function): Callback function
  - `event` (Object): Sync event data
    - `localOrderId` (number): Local order ID
    - `serverOrderId` (string): Server order ID
    - `timestamp` (number): Sync timestamp

**Returns:** `Function` - Cleanup function

**Example:**
```typescript
const cleanup = onOrderSynced((event) => {
  console.log(`Order ${event.localOrderId} synced as ${event.serverOrderId}`);
});

// Later: cleanup();
```

---

#### `onOnlineStatusChange(callback)`
Listen for online/offline status changes.

**Parameters:**
- `callback` (Function): Callback function
  - `isOnline` (boolean): Online status

**Returns:** `Function` - Cleanup function

**Example:**
```typescript
const cleanup = onOnlineStatusChange((isOnline) => {
  console.log(isOnline ? '🌐 Online' : '📴 Offline');
});
```

---

#### `handleOrderSubmission(orderData, submitToAPI)`
Smart order submission with automatic offline queueing.

**Parameters:**
- `orderData` (Object): Order data
- `submitToAPI` (Function): Function to submit to API

**Returns:** `Promise<Object>`
```typescript
{
  success: boolean;
  orderId?: string | number;
  queuedOffline?: boolean;
  error?: string;
}
```

**Example:**
```typescript
const result = await handleOrderSubmission(
  orderData,
  async (data) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return await res.json();
  }
);
```

---

### Service Worker API (`public/sw.js`)

The Service Worker listens for these message types:

#### `QUEUE_ORDER`
Queue an order in IndexedDB.

**Message:**
```javascript
navigator.serviceWorker.controller.postMessage({
  type: 'QUEUE_ORDER',
  orderData: { /* order data */ }
});
```

---

#### `GET_PENDING_COUNT`
Get count of pending orders.

**Message:**
```javascript
const channel = new MessageChannel();
channel.port1.onmessage = (event) => {
  console.log('Pending count:', event.data.count);
};

navigator.serviceWorker.controller.postMessage(
  { type: 'GET_PENDING_COUNT' },
  [channel.port2]
);
```

---

#### `GET_DB_STATS`
Get database statistics.

---

#### `CLEAR_FAILED_ORDERS`
Clear failed orders from queue.

---

#### `SYNC_NOW`
Manually trigger sync.

---

## 🧪 Testing

### Manual Testing

1. **Test Offline Queueing:**
   ```bash
   # Open DevTools → Network tab → Enable "Offline"
   # Place an order
   # Check: Order should be queued (check console)
   ```

2. **Test Background Sync:**
   ```bash
   # With orders queued, go back online
   # Check: Orders should sync automatically
   # Verify in backend database
   ```

3. **Test Failed Orders:**
   ```bash
   # Queue orders offline
   # Temporarily break API endpoint
   # Go online
   # Check: Orders marked as failed after 5 retries
   ```

### Automated Testing

```typescript
// tests/offline-queue.test.ts
import { queueOfflineOrder, getPendingOrderCount } from '@/lib/utils/offline-queue';

describe('Offline Queue', () => {
  it('should queue order when offline', async () => {
    const orderId = await queueOfflineOrder({
      customerId: 'test_user',
      items: [{ productId: 'prod_1', quantity: 1, price: 10 }],
      total: 10
    });

    expect(orderId).toBeGreaterThan(0);

    const count = await getPendingOrderCount();
    expect(count).toBe(1);
  });
});
```

---

## 🔒 Security Considerations

### Data Protection

- ✅ **Sensitive Data**: Never store payment details in IndexedDB
- ✅ **User Isolation**: Orders scoped to user session
- ✅ **Encryption**: IndexedDB data encrypted at rest (browser-level)
- ✅ **Validation**: Server validates all synced orders

### Best Practices

```typescript
// ✅ GOOD - Don't store payment tokens
await queueOfflineOrder({
  customerId: userId,
  items: orderItems,
  total: orderTotal,
  // Don't include: paymentToken, creditCard, etc.
});

// ❌ BAD - Never store sensitive data
await queueOfflineOrder({
  creditCard: '4242424242424242', // ❌ NEVER DO THIS
  cvv: '123', // ❌ NEVER DO THIS
});
```

---

## 📊 Monitoring & Analytics

### Track Offline Usage

```typescript
import { getOfflineQueueStats } from '@/lib/utils/offline-queue';

// Send analytics
const stats = await getOfflineQueueStats();

analytics.track('offline_queue_stats', {
  pendingOrders: stats.pendingOrders,
  failedRequests: stats.failedRequests,
  timestamp: Date.now()
});
```

### Monitor Sync Success Rate

```typescript
import { onOrderSynced } from '@/lib/utils/offline-queue';

let syncedCount = 0;
let failedCount = 0;

onOrderSynced((event) => {
  syncedCount++;
  analytics.track('order_synced', {
    localOrderId: event.localOrderId,
    serverOrderId: event.serverOrderId,
    successRate: syncedCount / (syncedCount + failedCount)
  });
});
```

---

## 🐛 Troubleshooting

### Issue: Orders Not Syncing

**Solution:**
```typescript
// Check Service Worker status
if ('serviceWorker' in navigator) {
  const registration = await navigator.serviceWorker.getRegistration();
  console.log('SW State:', registration?.active?.state);

  // Manually trigger sync
  await syncPendingOrders();
}
```

### Issue: IndexedDB Quota Exceeded

**Solution:**
```typescript
// Clear old cached data
import { clearExpiredCache } from '@/lib/utils/offline-queue';

await clearExpiredCache();

// Check storage usage
const estimate = await navigator.storage.estimate();
console.log('Storage used:', estimate.usage / estimate.quota);
```

### Issue: Failed Orders Stuck

**Solution:**
```typescript
import { clearFailedOrders } from '@/lib/utils/offline-queue';

// Clear failed orders after manual review
const cleared = await clearFailedOrders();
console.log(`Cleared ${cleared} failed orders`);
```

---

## 🚀 Production Deployment

### Checklist

- [ ] Service Worker registered in production build
- [ ] HTTPS enabled (required for Service Workers)
- [ ] Background Sync API supported (check browser support)
- [ ] IndexedDB quota sufficient for expected usage
- [ ] Error monitoring configured (Sentry, etc.)
- [ ] Analytics tracking offline usage
- [ ] User notifications for sync status
- [ ] Failed order alerts for admins

### Environment Variables

No special environment variables needed. The offline queue works entirely client-side.

---

## 📚 Additional Resources

- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)

---

## 🎯 Summary

The Offline Queue System provides:
- ✅ **Zero data loss** for orders placed offline
- ✅ **Automatic synchronization** when online
- ✅ **User-friendly feedback** with React components
- ✅ **Production-ready** with retry logic and error handling
- ✅ **Easy integration** with existing checkout flows

**Status**: ✅ Ready for Production Use

---

**Questions?** Check the code comments in:
- `public/db-utils.js` - IndexedDB utilities
- `public/sw.js` - Service Worker logic
- `src/lib/utils/offline-queue.ts` - Client utilities
- `src/components/offline/OfflineQueueStatus.tsx` - React components