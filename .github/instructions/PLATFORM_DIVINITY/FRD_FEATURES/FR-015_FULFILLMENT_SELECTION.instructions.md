---
applyTo: "**/*"
description: "FR-015: Fulfillment Selection - Choose method per farm (delivery/pickup/market), address/time slots, comparison view, reminders SMS 1 day before"
---

# FR-015: FULFILLMENT SELECTION

**Choose How You Get Your Food**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-015
Priority: P0 - Critical
Effort: 21 story points (≈ 1 week)
Value: 90/100 (UNIQUE competitive advantage)
Dependencies: FR-007 (Fulfillment Coordination), FR-014 (Checkout)
```

---

## 🎯 KEY REQUIREMENTS

### Method Selection Per Farm

```yaml
Farm 1: Sunny Valley Farm
  Options:
    ☐ Home Delivery - $5.00
       Available: Tomorrow, Thu, Fri (next 7 days)
       Time slots: 10am-12pm, 2pm-4pm

    ☐ Farm Pickup - Free
       Address: 123 Farm Road, City
       Hours: Tue/Thu 4-6pm, Sat 9am-12pm

    ☐ Market Pickup - Free
       Downtown Market - Saturday 8am-1pm
       Booth location shown on map

  Selected: ✓ Home Delivery ($5.00) - Tomorrow 10am-12pm
```

### Method Comparison

```yaml
Side-by-Side View:
  Delivery:
    - Cost: $5.00
    - Time: Next day
    - Convenience: High (to your door)

  Farm Pickup:
    - Cost: Free
    - Time: Flexible (during hours)
    - Convenience: Medium (you drive)

  Market Pickup:
    - Cost: Free
    - Time: Specific day/time
    - Convenience: Medium (visit market)
```

### Reminders

- **Delivery**: SMS 1 day before with time slot
- **Farm Pickup**: SMS reminder + directions + hours
- **Market Pickup**: SMS with booth location + parking tips

### Flexible Changes

```yaml
Change Fulfillment:
  - Allowed: Up to 24 hours before
  - Process: Select new method, update order
  - Notification: Farmer notified of change

Cancel Order:
  - Allowed: Up to 24 hours before
  - Refund: Full refund automatically
```

---

## 📊 SUCCESS METRICS

| Metric                 | Target                              |
| ---------------------- | ----------------------------------- |
| Method adoption        | All 3 methods used by 70% customers |
| Reminder effectiveness | >95% check reminder SMS             |
| Change requests        | <10% change fulfillment method      |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
