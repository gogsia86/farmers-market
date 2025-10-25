---
applyTo: "**/*"
description: "FR-013: Shopping Cart - Multi-farm consolidation (5+ farms one cart), grouping by farm, fulfillment per farm, cart persistence, expiration handling"
---

# FR-013: SHOPPING CART

**One Cart for All Your Farms (UNIQUE Competitive Advantage)**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-013
Priority: P0 - Critical
Effort: 34 story points (≈ 1.5 weeks)
Value: 100/100 (HIGHEST + UNIQUE vs LocalHarvest single-farm limitation)
Dependencies: FR-012 (Product Browsing)
User Story: CONS-002 from AGRICULTURAL_PERSONAS
```

---

## 🎯 KEY REQUIREMENTS

### Multi-Farm Cart

```yaml
Consolidation:
  - 5+ farms in one cart simultaneously
  - Grouped by farm: Visual separation
  - Per-farm fulfillment: Delivery vs pickup per farm
  - Combined checkout: Single payment flow

Cart Structure:
  Farm 1: Sunny Valley Farm
    - Heirloom Tomatoes (2 lbs) - $9.00
    - Free-Range Eggs (1 dozen) - $7.00
    - Fulfillment: Delivery ($5.00)
    - Farm subtotal: $21.00

  Farm 2: Green Acres
    - Mixed Greens (1 lb) - $6.00
    - Raw Milk (1 gallon) - $12.00
    - Fulfillment: Farm Pickup (free)
    - Farm subtotal: $18.00

  Total: $39.00 + $5.00 delivery = $44.00
```

### Cart Persistence

- **Cross-session**: Cart saved across logout/login
- **Cross-device**: Synced via account (phone → desktop)
- **Duration**: 7 days before expiration

### Quantity Adjustments

```yaml
Actions:
  - Increase quantity: + button
  - Decrease quantity: - button
  - Remove item: Swipe left or X button
  - Save for later: Move to wishlist

Validation:
  - Stock check: Can't exceed available quantity
  - Hold inventory: Reserve for 30 minutes
  - Release on timeout: If cart abandoned
```

### Expiration Handling

```yaml
Stock Changes While in Cart:
  - Item out of stock: Notify "Tomatoes no longer available"
  - Suggest substitute: "Try Cherry Tomatoes from same farm?"
  - Auto-remove: If no substitute accepted
  - Update total: Recalculate after changes
```

---

## 📊 SUCCESS METRICS

| Metric              | Target             |
| ------------------- | ------------------ |
| Multi-farm carts    | >40% have 2+ farms |
| Cart abandonment    | <60%               |
| Checkout conversion | >40% of carts      |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
