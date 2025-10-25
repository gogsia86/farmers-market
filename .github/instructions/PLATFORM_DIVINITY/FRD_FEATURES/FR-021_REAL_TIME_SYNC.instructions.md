---
applyTo: "**/*"
description: "FR-021: Real-Time Sync - WebSocket infrastructure, inventory sync (<2s), order status sync, presence indicators, optimistic UI, conflict resolution"
---

# FR-021: REAL-TIME SYNC

**Live Updates Across All Devices**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-021
Priority: P0 - Critical
Effort: 34 story points (≈ 1.5 weeks)
Value: 90/100
Dependencies: FR-019 (Architecture), FR-004 (Inventory)
```

---

## 🎯 KEY REQUIREMENTS

### WebSocket Infrastructure

```yaml
Technology:
  - Socket.io: Cross-browser WebSocket library
  - Fallback: Long polling if WebSocket unavailable
  - Clustering: Sticky sessions for multi-server

Connection:
  // Client
  const socket = io('wss://api.farmersmarket.com', {
    auth: { token: userToken }
  });

  socket.on('connect', () => {
    console.log('Connected to real-time server');
  });

  socket.on('inventory.updated', (data) => {
    updateProductQuantity(data.productId, data.newQuantity);
  });
```

### Inventory Sync

```yaml
Scenario:
  1. Farmer updates tomatoes: 20 lbs → 15 lbs
  2. Server broadcasts: inventory.updated event
  3. All connected clients: Update within <2 seconds

Implementation:
  // Server (when farmer updates inventory)
  io.to(`product-${productId}`).emit('inventory.updated', {
    productId: '123',
    newQuantity: 15,
    timestamp: Date.now()
  });

  // Client (consumer browsing products)
  socket.on('inventory.updated', ({ productId, newQuantity }) => {
    // Update UI instantly
    updateProductCard(productId, newQuantity);

    // If in cart and now out of stock
    if (newQuantity === 0 && isInCart(productId)) {
      showNotification('Tomatoes are now out of stock');
    }
  });
```

### Order Status Sync

```yaml
Flow:
  1. Farmer accepts order: Status → "Confirmed"
  2. Server broadcasts: order.status.changed
  3. Customer sees: "Order confirmed!" instantly

Implementation:
  // Server
  io.to(`order-${orderId}`).emit('order.status.changed', {
    orderId: '12345',
    newStatus: 'CONFIRMED',
    message: 'Your order has been confirmed!'
  });

  // Client
  socket.on('order.status.changed', ({ orderId, newStatus, message }) => {
    updateOrderStatus(orderId, newStatus);
    showNotification(message);
  });
```

### Presence Indicators

```yaml
Farmer Online Status:
  - Green dot: Farmer online (active < 5 min ago)
  - Yellow dot: Farmer away (active 5-60 min ago)
  - Gray dot: Farmer offline (> 60 min)

Display:
  - Farm profile page: "Sunny Valley Farm is online"
  - Product cards: Green dot if farmer online
  - Messaging: "Farmer is online - expect quick reply"

Implementation:
  // Server tracks last activity
  socket.on('activity', () => {
    updateLastSeen(userId, Date.now());
  });

  // Broadcast presence changes
  io.emit('user.presence', {
    userId: 'farmer-123',
    status: 'online'
  });
```

### Optimistic UI

```yaml
Pattern:
  1. User action: Add item to cart
  2. UI updates: Instantly show in cart (optimistic)
  3. API call: Send to server in background
  4. Success: Keep optimistic UI
  5. Failure: Rollback UI, show error

Implementation: async function addToCart(product) {
  // Optimistic update
  updateCartUI(product);

  try {
  await api.post('/cart', product);
  // Success - UI already updated
  } catch (error) {
  // Rollback
  removeFromCartUI(product);
  showError('Failed to add to cart. Try again.');
  }
  }
```

### Conflict Resolution

```yaml
Scenario:
  - Customer adds 5 lbs tomatoes to cart
  - Meanwhile: Farmer updates inventory to 3 lbs
  - Conflict: Customer's cart exceeds available inventory

Resolution Strategy:
  1. Server validation: Check inventory on checkout
  2. Conflict detected: Return error
  3. Client notification: "Only 3 lbs available. Adjust quantity?"
  4. Options:
    - Adjust to 3 lbs
    - Remove from cart
    - Contact farmer

Last-Write-Wins:
  - Inventory changes: Server value always wins
  - Customer cart: Updated to match available quantity
  - Notification: Customer informed of change
```

### Fallback: Polling

```yaml
If WebSocket Fails:
  - Detect: Connection failure, firewall blocking
  - Fallback: HTTP polling every 5 seconds
  - Less real-time: 5-10 second delay vs <1 second
  - Graceful degradation: Still functional, just slower

Implementation: if (!socket.connected) {
  setInterval(() => {
  fetchLatestData(); // Poll API
  }, 5000);
  }
```

---

## 📊 SUCCESS METRICS

| Metric           | Target              |
| ---------------- | ------------------- |
| Sync latency     | <2 seconds p95      |
| WebSocket uptime | >99.5%              |
| Conflict rate    | <1% of transactions |
| Fallback usage   | <5% connections     |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
