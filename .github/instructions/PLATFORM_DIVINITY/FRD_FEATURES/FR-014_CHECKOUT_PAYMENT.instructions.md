---
applyTo: "**/*"
description: "FR-014: Checkout & Payment - Single checkout multi-farm, payment (credit/Apple Pay/Google Pay), delivery address, order summary, split payment Stripe Connect"
---

# FR-014: CHECKOUT & PAYMENT

**Secure Checkout for All Your Farms**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-014
Priority: P0 - Critical
Effort: 34 story points (≈ 1.5 weeks)
Value: 100/100 (HIGHEST)
Dependencies: FR-013 (Cart), FR-006 (Payment Processing)
```

---

## 🎯 KEY REQUIREMENTS

### Single Checkout Flow

```yaml
Step 1 - Review Order:
  - Show all farms in cart
  - Per-farm subtotals
  - Fulfillment method per farm
  - Edit: Back to cart

Step 2 - Delivery Address:
  - Confirm home address
  - Or enter new address
  - Validate: Zip code in delivery range

Step 3 - Payment:
  - Payment methods: Credit/debit, Apple Pay, Google Pay
  - Save card: For future orders
  - Security: PCI DSS compliant via Stripe

Step 4 - Confirm & Place Order:
  - Order summary: Itemized by farm
  - Total breakdown: Subtotal + fees + taxes
  - Place order: Single button
```

### Order Summary

```yaml
Itemized by Farm:
  Sunny Valley Farm:
    - Tomatoes (2 lbs): $9.00
    - Eggs (1 dozen): $7.00
    - Delivery fee: $5.00
    - Subtotal: $21.00

  Green Acres:
    - Mixed Greens: $6.00
    - Raw Milk: $12.00
    - Farm Pickup: Free
    - Subtotal: $18.00

  Order Total: $39.00
  Platform fee: Included in pricing
  Tax (if applicable): $2.34 (6%)
  Grand Total: $41.34
```

### Split Payment (Stripe Connect)

```yaml
Processing:
  - Single charge to customer: $41.34
  - Split automatically:
      - Sunny Valley: $17.85 (85% of $21)
      - Green Acres: $15.30 (85% of $18)
      - Platform: $5.85 (15% commission)
      - Stripe: ~3% ($1.24)

  - Farmers paid: Weekly auto-payout (FR-006)
```

### Guest Checkout (Optional)

- **No account required**: Email + payment only
- **Order tracking**: Via email link
- **Account creation**: Prompt after order placed

### Abandonment Recovery

- **Email reminder**: 24 hours after abandonment
- **Contents**: "You left items in your cart..."
- **Link**: Direct to checkout
- **Discount**: Optional 10% off to convert

---

## 📊 SUCCESS METRICS

| Metric               | Target                       |
| -------------------- | ---------------------------- |
| Checkout conversion  | >70% reach checkout complete |
| Payment success      | >98%                         |
| Guest checkout usage | 20-30%                       |
| Abandonment recovery | 15% convert after email      |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
