---
applyTo: "**/*"
description: "FR-006: Payment Processing - Stripe Connect integration, split payments (15% commission), weekly payouts to farmers (85% margins), transparent fee breakdown"
---

# FR-006: PAYMENT PROCESSING

**Secure Payments with Automatic Farmer Payouts**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-006
Priority: P0 - Critical
Effort: 34 story points (≈ 1.5 weeks)
Value: 100/100 (HIGHEST)
Dependencies: FR-001 (Registration), FR-005 (Orders)
```

---

## 🎯 KEY REQUIREMENTS

### Stripe Connect Integration

- **Platform account**: Farmers Market master account
- **Connected accounts**: Each farmer gets Stripe Connect account
- **Split payments**:
  - 15% commission to platform
  - 85% to farmer (target margin from BRD)
- **Payment methods**: Credit/debit cards, Apple Pay, Google Pay

### Payout Schedule

- **Frequency**: Weekly automatic payouts
- **Timing**: Every Monday morning
- **Deposit**: Direct to farmer bank account
- **Statement**: Detailed breakdown via email/dashboard

### Farmer Dashboard

```yaml
Earnings Overview:
  - This week: $342.50
  - This month: $1,456.00
  - Total (lifetime): $8,234.15

Recent Payouts:
  - Date: May 20, 2024
  - Amount: $289.00
  - Status: Paid
  - View details: Orders included, fees breakdown

Fee Transparency:
  - Per order: Show platform 15% + Stripe ~3%
  - Total fees: $45.67 (18% of gross)
  - Net to farmer: 82% avg after all fees
```

---

## 📊 SUCCESS METRICS

| Metric                 | Target       |
| ---------------------- | ------------ |
| Farmer margin          | 82-85% avg   |
| Payment success rate   | >99.5%       |
| Payout reliability     | 100% on-time |
| Fee transparency score | >4.5/5       |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
