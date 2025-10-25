---
applyTo: "**/*"
description: "FR-018: Quality Guarantee - Refund/replacement policy, reporting flow (photo/description), farmer notification, auto-refund <$20, support ticket, FAQ"
---

# FR-018: QUALITY GUARANTEE

**100% Satisfaction Promise**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-018
Priority: P1 - High
Effort: 21 story points (≈ 1 week)
Value: 85/100
Dependencies: FR-016 (Order Tracking)
```

---

## 🎯 KEY REQUIREMENTS

### Quality Guarantee Policy

```yaml
Promise: "If you're not 100% satisfied with your order,
  we'll make it right with a refund or replacement."

Covered:
  - Spoiled/rotten produce
  - Missing items from order
  - Incorrect items delivered
  - Quality below expectations

Not Covered:
  - Change of mind
  - Didn't use product in time
  - Natural variations (size, color)
```

### Reporting Flow

```yaml
Step 1 - Report Issue:
  - From order: "Report a Problem" button
  - Issue type:
    ☐ Spoiled/rotten
    ☐ Missing items
    ☐ Wrong items
    ☐ Quality issue
    ☐ Other

Step 2 - Provide Details:
  - Photo upload: Show issue (required for quality)
  - Description: Explain problem (200 chars)
  - Resolution preference:
    ☐ Full refund
    ☐ Partial refund
    ☐ Replacement (if available)

Step 3 - Submit:
  - Confirmation: "Issue reported. We'll resolve within 24 hours."
  - Tracking: Status visible in order details
```

### Farmer Notification

```yaml
Notification to Farmer:
  - Alert: "Quality issue reported for Order #FM-12345"
  - Details: Customer complaint, photo, description
  - Actions:
      - Respond: Explain/resolve directly with customer
      - Accept: Approve refund/replacement
      - Dispute: Provide counter-evidence

Farmer Response Time:
  - Target: <24 hours
  - Auto-resolve: If no response in 48 hours, auto-refund
```

### Refund Processing

```yaml
Auto-Refund (< $20):
  - Instant approval: No farmer confirmation needed
  - Refund: Processed to original payment method
  - Timeline: 3-5 business days

Manual Review (≥ $20):
  - Farmer review: Farmer has 24 hours to respond
  - Platform review: If disputed, admin reviews
  - Resolution: Refund, partial refund, or replacement
  - Timeline: 1-3 business days
```

### Replacement Coordination

```yaml
If Replacement Requested:
  - Farmer confirms: "Yes, I can replace with next delivery"
  - Schedule: Customer chooses new fulfillment date
  - No additional charge: Replacement is free
  - Tracking: New order created, linked to original
```

### Support Ticket

```yaml
Ticket System:
  - Customer view: Status of issue (Open, In Review, Resolved)
  - Farmer view: Respond to customer, upload evidence
  - Platform admin: Review disputes, final decision
  - Communication: In-app messaging for resolution
```

### FAQ & Help

```yaml
Self-Service:
  - FAQ: "What's covered under the guarantee?"
  - Tips: "How to store produce for maximum freshness"
  - Contact: "Still need help? Live chat Mon-Fri 9am-5pm"

Live Chat (Business Hours):
  - Instant support: Chat with platform team
  - Escalation: Complex issues routed to senior support
  - Fallback: Email support after hours
```

---

## 📊 SUCCESS METRICS

| Metric                | Target                         |
| --------------------- | ------------------------------ |
| Issue rate            | <3% orders                     |
| Resolution time       | <24 hours avg                  |
| Customer satisfaction | >4.5/5 after resolution        |
| Farmer acceptance     | >90% accept refund/replacement |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
