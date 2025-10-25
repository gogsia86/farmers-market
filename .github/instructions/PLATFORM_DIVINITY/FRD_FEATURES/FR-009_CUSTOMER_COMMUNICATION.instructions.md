---
applyTo: "**/*"
description: "FR-009: Customer Communication - In-app messaging, notifications (email/SMS/push), pre-order questions, canned templates, read receipts"
---

# FR-009: CUSTOMER COMMUNICATION

**Connect with Customers Directly**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-009
Priority: P1 - High
Effort: 21 story points (≈ 1 week)
Value: 85/100
Dependencies: FR-005 (Orders)
```

---

## 🎯 KEY REQUIREMENTS

### In-App Messaging

```yaml
Conversation View:
  - Threaded messages per customer
  - Unread badge count
  - Quick reply from order screen
  - Message history preserved

Message Actions:
  - Send text message
  - Attach photo (product, delivery proof)
  - Voice notes (optional future)
  - Mark as read/unread
```

### Notifications

```yaml
Email Notifications:
  - New order received
  - Customer question
  - Order cancellation
  - Payment received

SMS Notifications (opt-in):
  - Urgent: New order, customer waiting
  - Daily digest: Order summary

Push Notifications (mobile app):
  - Real-time: New message, new order
  - Badge count on app icon
```

### Pre-Order Questions

- **Customer asks**: "Are tomatoes organic?" before ordering
- **Farmer responds**: Quick reply from dashboard/mobile
- **Public visibility**: Q&A visible on product page (optional)

### Canned Templates

```yaml
Quick Responses:
  - "Thanks for your order! Will deliver Saturday."
  - "Pickup ready - come anytime during hours."
  - "Sorry, out of stock. Would you like [substitute]?"
  - "Delivered to your doorstep. Enjoy!"

Custom Templates:
  - Farmer creates own templates
  - Save frequently used responses
```

---

## 📊 SUCCESS METRICS

| Metric                | Target                     |
| --------------------- | -------------------------- |
| Response time         | <2 hours avg               |
| Customer satisfaction | >4.6/5 for communication   |
| Template usage        | >70% farmers use templates |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
