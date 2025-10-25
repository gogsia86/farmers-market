---
applyTo: "**/*"
description: "FR-010: Consumer Registration - Simple <2 min signup, social login (Google/Facebook/Apple), location, dietary preferences, payment methods"
---

# FR-010: CONSUMER REGISTRATION

**Get Started in Under 2 Minutes**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-010
Priority: P0 - Critical
Effort: 13 story points (≈ 3 days)
Value: 85/100
Dependencies: None (entry point)
User Story: CONS-001 from AGRICULTURAL_PERSONAS
```

---

## 🎯 KEY REQUIREMENTS

### Registration Flow (< 2 minutes)

```yaml
Step 1 - Create Account (30 seconds):
  - Social login: Google, Facebook, Apple (one-click)
  - OR email + password
  - Name: First + Last
  - Auto-proceed to Step 2

Step 2 - Location (30 seconds):
  - Home address: For delivery
  - Auto-detect: "Use current location" GPS
  - Or manual: Street, city, ZIP
  - Validate: Show nearby farms (preview)

Step 3 - Preferences (optional, 1 minute):
  - Dietary: Organic only, Vegetarian, Vegan, Gluten-free
  - Notifications: Email, SMS, push (opt-in)
  - Skip: "I'll set this up later"
```

### Profile Management

```yaml
Account Settings:
  - Edit name, email, phone
  - Change password
  - Update location
  - Manage payment methods
  - View order history

Privacy Settings:
  - GDPR: Export data, delete account
  - Notifications: Toggle email/SMS/push
  - Marketing: Opt-in/out
```

---

## 📊 SUCCESS METRICS

| Metric                | Target     |
| --------------------- | ---------- |
| Completion rate       | >85%       |
| Time to complete      | <2 min avg |
| Social login adoption | >60%       |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
