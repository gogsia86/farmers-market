---
applyTo: "**/*"
description: "FR-016: Order Tracking - Real-time status (pending→confirmed→fulfilled→completed), notifications each stage, history view, modification requests"
---

# FR-016: ORDER TRACKING

**Track Your Orders in Real-Time**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-016
Priority: P0 - Critical
Effort: 21 story points (≈ 1 week)
Value: 85/100
Dependencies: FR-005 (Order Management), FR-014 (Checkout)
User Story: CONS-008 from AGRICULTURAL_PERSONAS
```

---

## 🎯 KEY REQUIREMENTS

### Order Status Flow

```yaml
Status Progression:
  1. Pending (Order placed)
     → Notification: "Order received! Farmer will confirm shortly."

  2. Confirmed (Farmer accepted)
     → Notification: "Order confirmed! Estimated fulfillment: Saturday 10am-12pm"

  3. Fulfilled (Delivered/Picked up)
     → Notification: "Order delivered! Enjoy your fresh food."

  4. Completed (Closed)
     → Prompt: "Rate your experience"
```

### Order Details

```yaml
Display:
  - Order number: FM-12345
  - Status: Confirmed
  - Farm: Sunny Valley Farm
  - Items: 3 items listed
  - Total: $21.00
  - Fulfillment: Delivery - Tomorrow 10am-12pm
  - Estimated completion: Display countdown

Actions:
  - Contact farmer: Message button
  - Modify order: Change fulfillment (if >24 hrs before)
  - Cancel order: Cancel with refund
  - Report issue: Quality/missing items (FR-018)
```

### Notifications

```yaml
Delivery Methods:
  - Email: All status changes
  - SMS: Critical updates (confirmed, out for delivery)
  - Push: Real-time (if mobile app)

Content:
  - Clear status: "Your order is confirmed!"
  - Action needed: "Ready for pickup - come anytime today"
  - Next steps: "Rate your experience"
```

### Order History

```yaml
View:
  - All orders: Sorted by date (newest first)
  - Filter: Status, farm, date range
  - Search: Order number, farm name

Order Card:
  - Date: May 20, 2024
  - Farm: Sunny Valley Farm
  - Total: $21.00
  - Status: Completed
  - Quick actions: Reorder, View details, Leave review
```

### Multi-Farm Orders

```yaml
Tracking:
  - Per-farm status: Each farm tracked separately
  - Overall status: "2 of 3 farms confirmed"
  - Separate notifications: Per-farm updates
```

---

## 📊 SUCCESS METRICS

| Metric                  | Target                       |
| ----------------------- | ---------------------------- |
| Order tracking views    | >80% customers check status  |
| Notification engagement | >90% open confirmation email |
| Reorder rate            | >40% reorder from history    |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
