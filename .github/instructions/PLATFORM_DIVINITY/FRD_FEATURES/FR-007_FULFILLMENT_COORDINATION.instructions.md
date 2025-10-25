---
applyTo: "**/*"
description: "FR-007: Fulfillment Coordination - 3 methods (delivery, farm pickup, farmers market), route optimization, scheduling, reminders, proof of delivery"
---

# FR-007: FULFILLMENT COORDINATION

**Flexible Fulfillment: Delivery, Pickup, or Markets**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-007
Priority: P0 - Critical
Effort: 34 story points (≈ 1.5 weeks)
Value: 90/100 (UNIQUE competitive advantage)
Dependencies: FR-002 (Farm Profile), FR-005 (Orders)
```

---

## 🎯 KEY REQUIREMENTS

### Three Fulfillment Methods

```yaml
1. Home Delivery:
  - Farmer delivers to customer address
  - Date/time slots: Next 7 days
  - Fee: Farmer sets ($5-15 typical)
  - Route optimization: Multi-stop delivery suggestions

2. Farm Pickup:
  - Customer picks up at farm
  - Hours: Farmer sets (e.g., "Tue/Thu 4-6pm, Sat 9am-12pm")
  - No fee (free pickup)
  - Pickup instructions: Gate code, parking, etc.

3. Farmers Market Pickup:
  - Customer picks up at market booth
  - Markets: Farmer lists which markets they attend
  - Schedule: "Downtown Market - Saturdays 8am-1pm"
  - Booth location: "Booth #12 near entrance"
```

### Farmer Workflow

- **Set availability**: Enable/disable methods per farm
- **Delivery routes**: Batch orders by area, optimize route
- **Pickup scheduling**: Set weekly schedule, blackout dates
- **Customer reminders**: Auto-SMS 1 day before (FR-015)

### Proof of Delivery

- **Photo upload**: Doorstep photo for deliveries
- **Signature**: Digital signature on farmer phone
- **Timestamp**: GPS + time logged automatically

---

## 📊 SUCCESS METRICS

| Metric                     | Target                     |
| -------------------------- | -------------------------- |
| Method adoption            | All 3 offered by 80% farms |
| Delivery on-time           | >95%                       |
| Pickup no-shows            | <5%                        |
| Customer flexibility score | >4.7/5                     |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
