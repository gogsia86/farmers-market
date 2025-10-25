---
applyTo: "**/*"
description: "FR-005: Order Management Dashboard - Centralized order view, accept/decline orders, fulfillment tracking, customer communication, and mobile-optimized workflow"
---

# FR-005: ORDER MANAGEMENT DASHBOARD

**Manage All Orders from One Place**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-005
Priority: P0 - Critical
Effort: 34 story points (≈ 1.5 weeks)
Value: 95/100
Dependencies: FR-003 (Products), FR-013 (Consumer Cart)
User Story: FARM-003 from AGRICULTURAL_PERSONAS
```

---

## 🎯 KEY REQUIREMENTS

### Order Dashboard Views

```yaml
Order List (Default View):
  - Status filters: New, Accepted, Fulfilled, Cancelled
  - Sort: Date, Customer, Total, Fulfillment method
  - Quick stats: Today's orders, weekly revenue, pending count

Order Card Display:
  - Order number: #FM-12345
  - Customer: Name + phone
  - Total: $45.67
  - Items: "3 items: Tomatoes (2 lbs), Eggs (1 dozen)"
  - Fulfillment: Delivery/Pickup + date
  - Status badge: Color-coded
  - Quick actions: Accept, View Details, Message Customer
```

### Order Detail View

```yaml
Customer Info:
  - Name, phone, email
  - Delivery address (if delivery order)
  - Order notes/special requests

Items Ordered:
  - Product name, quantity, unit price, subtotal
  - Photos for visual confirmation
  - Out-of-stock handling: Substitute or refund options

Pricing Breakdown:
  - Subtotal: $42.50
  - Delivery fee: $5.00
  - Platform fee: -$7.13 (15% commission, shown transparently)
  - Farmer receives: $40.37

Fulfillment Details:
  - Method: Delivery, Farm Pickup, Market Pickup
  - Scheduled date/time
  - Special instructions
  - Tracking updates
```

### Order Actions

```yaml
Accept Order:
  - One-tap "Accept" button
  - Confirmation: "Order accepted! Customer notified"
  - Auto-inventory deduction (if not done at checkout)
  - Move to "Accepted" tab

Decline Order:
  - Reason required: Out of stock, Can't fulfill date, Other
  - Customer notified immediately
  - Auto-refund: Full refund processed
  - Note added to customer record

Mark as Fulfilled:
  - Confirm pickup/delivery completion
  - Upload proof photo (optional): Delivery photo at doorstep
  - Customer notification: "Order delivered!"
  - Move to "Fulfilled" tab

Cancel/Refund:
  - Full or partial refund options
  - Reason tracking: Spoilage, Customer request, etc.
  - Automatic Stripe refund processing
```

---

## 📊 SUCCESS METRICS

| Metric                | Target       |
| --------------------- | ------------ |
| Accept rate           | >95%         |
| Accept time           | <2 hours avg |
| Fulfillment accuracy  | >98%         |
| Customer satisfaction | >4.5/5 stars |

---

**Version**: v1.0.0 - October 2025
**Status**: ✅ Ready for Development
