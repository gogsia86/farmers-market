# 🌾 Real-Time Features - Quick Usage Guide

> **For Developers**: How to use the newly integrated real-time features in your pages

---

## 📋 Overview

Real-time features are now fully integrated and ready to use. This guide shows you how to add live updates to any page in the platform.

---

## 🚀 Quick Start

### 1. Customer Order Tracking

**File**: Any customer order detail page

```tsx
import { RealtimeOrderTracker } from "@/components/orders/RealtimeOrderTracker";

export default function OrderPage({ order }) {
  return (
    <div>
      {/* Your existing order details */}
      
      {/* Add real-time tracker */}
      <RealtimeOrderTracker
        orderId={order.id}
        currentStatus={order.status}
        onOrderUpdate={() => {
          // Optional: refresh data when update received
          router.refresh();
        }}
      />
    </div>
  );
}
```

**What you get**:
- ✅ Live connection status indicator
- ✅ Real-time status updates
- ✅ Toast notifications on changes
- ✅ Update history with timestamps
- ✅ Agricultural consciousness badge

---

### 2. Notification Bell (Global Header)

**File**: `src/components/layout/header.tsx` (already integrated!)

```tsx
import { NotificationBell } from "@/components/notifications/NotificationBell";

// In your header component
{isAuthenticated && (
  <NotificationBell userId={user.id} showBadge={true} />
)}
```

**What you get**:
- ✅ Live notification count badge
- ✅ Dropdown with notification list
- ✅ Mark as read functionality
- ✅ Click to navigate to notification target
- ✅ Toast pop-ups for new notifications

---

### 3. Farmer Order Alerts

**File**: Any farmer dashboard or farm orders page

```tsx
import { FarmerOrdersRealtime } from "@/components/orders/FarmerOrdersRealtime";

export default function FarmDashboard({ farm }) {
  return (
    <div className="space-y-6">
      {/* Add real-time order alerts */}
      <FarmerOrdersRealtime farmId={farm.id} />
      
      {/* Your existing dashboard content */}
    </div>
  );
}
```

**What you get**:
- ✅ Instant new order alerts
- ✅ Notification sound on new orders
- ✅ Revenue tracking (live updates)
- ✅ Recent orders list
- ✅ Click to view order details

---

### 4. Farmer Order Stats (Dashboard Metrics)

**File**: Farmer dashboard or analytics page

```tsx
import { FarmerOrderStats } from "@/components/orders/FarmerOrdersRealtime";

export default function FarmerDashboard({ farm, initialStats }) {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Real-time stats cards */}
      <FarmerOrderStats
        farmId={farm.id}
        initialStats={{
          todayOrders: initialStats.todayOrders,
          todayRevenue: initialStats.todayRevenue,
          pendingOrders: initialStats.pendingOrders,
        }}
      />
      
      {/* Rest of dashboard */}
    </div>
  );
}
```

**What you get**:
- ✅ Live order count updates
- ✅ Live revenue tracking
- ✅ Pending orders count
- ✅ Connection status indicators

---

### 5. Compact Notification Badge

**File**: Any page where you want a minimal notification indicator

```tsx
import { NotificationBadge } from "@/components/notifications/NotificationBell";

export default function MobilePage({ user }) {
  return (
    <nav>
      {/* Compact badge for mobile/minimal UI */}
      <NotificationBadge userId={user.id} />
    </nav>
  );
}
```

---

## 🔌 Emitting Real-Time Events from API Routes

### When to Emit Events

Emit events whenever you modify order data in the database:

- ✅ Order created
- ✅ Order status changed
- ✅ Order cancelled
- ✅ Delivery updated
- ✅ Payment status changed

### Example: Order Status Update

```typescript
// In your API route (e.g., PATCH /api/orders/[orderId])
import {
  emitOrderStatusChange,
  emitOrderUpdate,
  emitNotification,
} from "@/lib/realtime/emit-helpers";

export async function PATCH(request: NextRequest, { params }) {
  const session = await auth();
  const { orderId } = params;
  const { status } = await request.json();

  // Update order in database
  const order = await orderService.updateOrderStatus(orderId, status);

  // Emit real-time events
  emitOrderStatusChange({
    orderId: order.id,
    previousStatus: oldStatus,
    newStatus: status,
    timestamp: new Date().toISOString(),
    updatedBy: session.user.id,
  });

  // Send notification to customer
  emitNotification(order.customerId, {
    id: `order-${orderId}-${Date.now()}`,
    type: "ORDER_STATUS",
    title: "Order Status Updated",
    message: `Your order is now ${status}`,
    actionUrl: `/orders/${orderId}`,
    priority: "MEDIUM",
  });

  return NextResponse.json({ success: true, data: order });
}
```

### Example: New Order Creation

```typescript
// In your order creation API route
import { emitNewOrder, emitNotification } from "@/lib/realtime/emit-helpers";

export async function POST(request: NextRequest) {
  const session = await auth();
  const orderData = await request.json();

  // Create order in database
  const order = await orderService.createOrder(orderData);

  // Emit new order event to farm
  emitNewOrder(order.farmId, order);

  // Notify farm owner
  emitNotification(farmOwnerId, {
    id: `new-order-${order.id}-${Date.now()}`,
    type: "ORDER_NEW",
    title: "New Order Received!",
    message: `Order #${order.orderNumber} - ${order.items.length} items`,
    actionUrl: `/farmer/farms/${order.farmId}/orders/${order.id}`,
    priority: "HIGH",
  });

  // Notify customer
  emitNotification(session.user.id, {
    id: `order-confirmation-${order.id}-${Date.now()}`,
    type: "ORDER_UPDATE",
    title: "Order Confirmed",
    message: `Your order #${order.orderNumber} has been placed`,
    actionUrl: `/orders/${order.id}`,
    priority: "MEDIUM",
  });

  return NextResponse.json({ success: true, data: order }, { status: 201 });
}
```

---

## 🎨 Customization Options

### RealtimeOrderTracker Props

```typescript
interface RealtimeOrderTrackerProps {
  orderId: string;              // Required: Order ID to track
  currentStatus: string;        // Required: Current order status
  onOrderUpdate?: () => void;   // Optional: Callback on updates
}
```

### NotificationBell Props

```typescript
interface NotificationBellProps {
  userId?: string;              // Required: User ID for notifications
  className?: string;           // Optional: Additional CSS classes
  showBadge?: boolean;          // Optional: Show unread count badge (default: true)
}
```

### FarmerOrdersRealtime Props

```typescript
interface FarmerOrdersRealtimeProps {
  farmId: string;               // Required: Farm ID to track
  className?: string;           // Optional: Additional CSS classes
}
```

---

## 🧪 Testing Your Integration

### 1. Check Connection Status

Look for these indicators on your page:
- ✅ Green "Connected" badge
- ✅ Pulsing radio icon
- ✅ "Agricultural Consciousness Active" badge

### 2. Test Real-Time Updates

**For Customer Order Tracking**:
1. Open customer order detail page
2. In another tab, update order status as farmer
3. Observe: Toast notification + timeline update

**For Farmer Alerts**:
1. Open farmer dashboard
2. In another tab, place order as customer
3. Observe: Alert appears + sound plays + toast notification

**For Notification Bell**:
1. Log in as any user
2. Trigger notification event (order update, etc.)
3. Observe: Badge increments + bell pulses + toast appears

### 3. Test Offline Behavior

1. Stop Socket.io server
2. Observe: Status changes to "Connecting..." or "Offline"
3. Restart server
4. Observe: Auto-reconnect + status returns to "Connected"

---

## 🔍 Troubleshooting

### Issue: "Connected" badge not showing

**Solution**: Check that Socket.io server is running
```bash
# Make sure you're using the custom server
npm run dev
# or
node server.js
```

### Issue: No real-time updates received

**Solution**: Check that emit helpers are being called in API routes
```typescript
// Make sure you're calling emit functions after DB updates
emitOrderUpdate(orderId, { status: newStatus, ... });
```

### Issue: Notifications not appearing

**Solution**: Check user ID is passed correctly
```tsx
// Ensure userId is available
<NotificationBell userId={session?.user?.id} />
```

### Issue: TypeScript errors

**Solution**: Import types correctly
```typescript
import type { OrderUpdatePayload } from "@/hooks/realtime";
```

---

## 📊 Event Types Reference

### Order Events

| Event | When to Use | Payload |
|-------|-------------|---------|
| `emitOrderUpdate` | General order changes | `{ orderId, status, message, metadata }` |
| `emitOrderStatusChange` | Status transitions | `{ orderId, previousStatus, newStatus, updatedBy }` |
| `emitNewOrder` | New order created | `{ farmId, order }` |

### Notification Events

| Event | When to Use | Payload |
|-------|-------------|---------|
| `emitNotification` | Send user notification | `{ userId, type, title, message, actionUrl, priority }` |

### Notification Types

- `ORDER_UPDATE` - General order updates
- `ORDER_STATUS` - Status changes
- `ORDER_NEW` - New order for farmer
- `ORDER_DELIVERY` - Delivery updates
- `PAYMENT` - Payment notifications
- `FARM_UPDATE` - Farm information changes
- `PRODUCT_UPDATE` - Product changes

### Priority Levels

- `LOW` - Informational
- `MEDIUM` - Standard notification (default)
- `HIGH` - Important (new orders, status changes)
- `URGENT` - Critical alerts

---

## 🎯 Best Practices

### 1. Always Include Error Handling

```typescript
const handleOrderUpdate = async () => {
  try {
    await updateOrder();
    emitOrderUpdate(orderId, { ... });
  } catch (error) {
    logger.error("Failed to update order", { error });
    // Don't throw error if emit fails - it's not critical
  }
};
```

### 2. Emit Events AFTER Database Updates

```typescript
// ✅ CORRECT
const order = await orderService.updateOrder(orderId, updates);
emitOrderUpdate(orderId, { status: order.status });

// ❌ WRONG
emitOrderUpdate(orderId, { status: newStatus });
const order = await orderService.updateOrder(orderId, updates);
```

### 3. Use Descriptive Messages

```typescript
// ✅ CORRECT
emitNotification(userId, {
  title: "Order Ready for Pickup",
  message: "Your order #12345 is ready at Green Valley Farm",
  ...
});

// ❌ WRONG
emitNotification(userId, {
  title: "Update",
  message: "Status changed",
  ...
});
```

### 4. Include Action URLs

```typescript
emitNotification(userId, {
  title: "New Order",
  message: "Order #12345 received",
  actionUrl: `/orders/order_123`, // ✅ User can click to view
  ...
});
```

---

## 🚀 Next Steps

1. **Add to More Pages**: Integrate real-time features into:
   - Customer dashboard
   - Farmer analytics page
   - Admin order management

2. **Custom Notifications**: Create domain-specific notification types:
   - Harvest alerts
   - Seasonal updates
   - Product availability

3. **Performance Monitoring**: Track real-time metrics:
   - Connection count
   - Event throughput
   - Latency measurements

---

## 📚 Additional Resources

- **Complete Documentation**: `docs/REALTIME_INTEGRATION_COMPLETE.md`
- **Socket.io Setup**: `docs/REALTIME_SETUP.md`
- **Quick Reference**: `docs/SOCKET_IO_QUICK_REFERENCE.md`
- **API Documentation**: `docs/API_DOCUMENTATION.md`

---

## 💡 Tips

- Real-time features work best with **fast database queries** - optimize your DB calls
- Use **React Query** or **SWR** for client-side caching to complement real-time updates
- Test with **multiple browser tabs** to see real-time synchronization
- Consider **rate limiting** if implementing high-frequency updates

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: January 2025