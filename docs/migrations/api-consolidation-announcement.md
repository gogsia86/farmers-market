# 📢 API Endpoint Consolidation Announcement

**Date:** January 3, 2026
**Effective:** December 2025 (Deprecation Period Begins)
**Sunset Date:** June 1, 2026

---

## Executive Summary

We're consolidating our API endpoints to improve consistency, maintainability, and developer experience. This change affects several endpoint families, with a **6-month transition period** and full backward compatibility via redirects.

**Action Required:** Update your API integration by June 1, 2026.

---

## What's Changing?

### 🌾 Farmer Endpoints Consolidation

**Old Endpoints** (Deprecated):
```
POST   /api/farmer/dashboard
GET    /api/farmer/finances
POST   /api/farmer/payouts
GET    /api/farmer/payout-schedule
```

**New Endpoints** (Active):
```
GET    /api/farmers/dashboard
GET    /api/farmers/finances
POST   /api/farmers/payouts
GET    /api/farmers/payout-schedule
```

### 🌱 Farming Resources Consolidation

**Old Endpoints** (Deprecated):
```
GET    /api/farming/advice
GET    /api/farming/education
GET    /api/farming/market
GET    /api/farming/support
```

**New Endpoints** (Active):
```
GET    /api/farmers/resources/advice
GET    /api/farmers/resources/education
GET    /api/farmers/resources/market
GET    /api/farmers/resources/support
```

### 💰 Payment Wallet Consolidation

**Old Endpoint** (Deprecated):
```
GET/POST  /api/payment/wallet
```

**New Endpoint** (Active):
```
GET/POST  /api/payments/wallet
```

### 🌍 Agricultural Consciousness Consolidation

**Old Endpoint** (Deprecated):
```
GET    /api/agricultural-consciousness
```

**New Endpoint** (Active):
```
GET    /api/agricultural/consciousness
```

---

## Timeline

| Date | Milestone |
|------|-----------|
| **December 2025** | Deprecation period begins. Old endpoints return deprecation headers but continue to work via redirects (HTTP 308). |
| **January 2026** | Migration guide published. Support team available to assist with integration updates. |
| **May 1, 2026** | Final migration warning sent (30 days before sunset). |
| **June 1, 2026** | Old endpoints return HTTP 410 Gone. All traffic must use new endpoints. |
| **July 2026** | Deprecated alias files archived. |

---

## Migration Guide

### Step 1: Review Your Integration

Audit your codebase for references to deprecated endpoints:

```bash
# Search for old endpoints in your codebase
grep -r "/api/farmer/" .
grep -r "/api/farming/" .
grep -r "/api/payment/wallet" .
grep -r "/api/agricultural-consciousness" .
```

### Step 2: Update Endpoint URLs

Replace old URLs with new consolidated URLs:

**Example (JavaScript/TypeScript):**

```typescript
// ❌ OLD (Deprecated)
const response = await fetch('/api/farmer/dashboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ farmId })
});

// ✅ NEW (Recommended)
const response = await fetch('/api/farmers/dashboard', {
  method: 'GET', // Note: Changed from POST to GET
  headers: { 'Content-Type': 'application/json' }
});
```

**Example (Python):**

```python
# ❌ OLD
response = requests.get('https://api.farmersmarket.com/api/farming/advice')

# ✅ NEW
response = requests.get('https://api.farmersmarket.com/api/farmers/resources/advice')
```

### Step 3: Update HTTP Methods (Where Changed)

Some endpoints have standardized HTTP methods:

| Endpoint | Old Method | New Method |
|----------|-----------|------------|
| `/api/farmers/dashboard` | POST | GET |
| All other endpoints | (No change) | (No change) |

### Step 4: Test Your Integration

1. **Test in Development:** Update your development environment first
2. **Monitor Deprecation Headers:** Check for `X-API-Deprecated` and `Deprecation` headers in responses
3. **Test in Staging:** Validate all functionality works with new endpoints
4. **Deploy to Production:** Roll out changes before June 1, 2026

### Step 5: Monitor & Validate

After migration, verify:
- [ ] All API calls use new endpoints
- [ ] No deprecation headers in responses
- [ ] All functionality works as expected
- [ ] Error handling still works correctly

---

## Backward Compatibility

### Automatic Redirects (Until June 1, 2026)

Old endpoints automatically redirect to new endpoints with:
- **HTTP 308** (Permanent Redirect)
- Preserves request method and body
- Includes deprecation headers

**Response Headers:**
```http
X-API-Deprecated: true
Deprecation: true
Sunset: Sat, 01 Jun 2026 00:00:00 GMT
Link: </docs/migrations/api-consolidation-guide.md>; rel="deprecation"
Location: /api/farmers/dashboard
```

### Breaking Changes (After June 1, 2026)

Old endpoints will return:
```json
{
  "success": false,
  "error": {
    "code": "ENDPOINT_SUNSET",
    "message": "This endpoint has been sunset. Please use /api/farmers/dashboard instead.",
    "migration_guide": "https://docs.farmersmarket.com/migrations/api-consolidation-guide"
  }
}
```

---

## Impact Assessment

### Low Impact Changes
- ✅ Request/response formats unchanged
- ✅ Authentication unchanged
- ✅ Query parameters unchanged
- ✅ Rate limits unchanged

### What You Need to Update
- 🔄 Endpoint URLs in your code
- 🔄 API client configuration
- 🔄 Documentation references
- 🔄 Monitoring/logging filters (optional)

---

## Support & Resources

### Documentation
- **Full Migration Guide:** [/docs/migrations/api-consolidation-guide.md](./api-consolidation-guide.md)
- **API Reference:** [https://docs.farmersmarket.com/api](https://docs.farmersmarket.com/api)
- **Quick Reference:** [.github/instructions/16_KILO_QUICK_REFERENCE.instructions.md](../../.github/instructions/16_KILO_QUICK_REFERENCE.instructions.md)

### Getting Help
- **Email:** api-support@farmersmarket.com
- **Slack:** #api-migration-support
- **Office Hours:** Every Tuesday 2-4 PM EST
- **Priority Support:** Available for high-volume integrations

### Code Examples
We've prepared migration examples for popular languages:
- JavaScript/TypeScript
- Python
- Ruby
- PHP
- Java
- Go

Request examples: api-support@farmersmarket.com

---

## FAQ

### Q: Do I need to update immediately?
**A:** No. Old endpoints will continue to work via redirects until June 1, 2026. However, we recommend updating as soon as possible.

### Q: Will my existing API keys work?
**A:** Yes. Authentication is unchanged. Your existing API keys and tokens will work with both old and new endpoints.

### Q: Are there any breaking changes to request/response formats?
**A:** No. Request and response formats remain identical. Only the URL paths are changing.

### Q: What if I miss the June 1, 2026 deadline?
**A:** After June 1, old endpoints will return HTTP 410 Gone, causing your integration to fail. Please migrate before this date.

### Q: Can I test the new endpoints now?
**A:** Yes! New endpoints are already live and fully functional. You can test them in parallel with your existing integration.

### Q: How do I know if I'm using old endpoints?
**A:** Check response headers for `X-API-Deprecated: true` or `Deprecation: true`. These indicate you're using a deprecated endpoint.

### Q: Will there be more API changes?
**A:** This is a one-time consolidation. We're committed to API stability after this migration.

### Q: What happens to rate limits?
**A:** Rate limits are unchanged and apply to your account, not individual endpoints.

---

## Recommended Actions

### For Low-Volume Integrations (< 1,000 requests/day)
1. Review migration guide
2. Update endpoint URLs
3. Test in development
4. Deploy before June 1, 2026

### For Medium-Volume Integrations (1,000 - 100,000 requests/day)
1. Schedule migration sprint
2. Update and test in staging
3. Monitor redirect usage
4. Gradual production rollout
5. Complete before May 1, 2026

### For High-Volume Integrations (> 100,000 requests/day)
1. Contact api-support@farmersmarket.com for assisted migration
2. Schedule migration planning call
3. Request custom monitoring dashboard
4. Coordinate deployment schedule
5. Complete before April 1, 2026 (recommended)

---

## Technical Details

### Redirect Behavior

**Old endpoint request:**
```http
POST /api/farmer/dashboard HTTP/1.1
Host: api.farmersmarket.com
Content-Type: application/json

{"farmId": "farm_123"}
```

**Redirect response (until June 1, 2026):**
```http
HTTP/1.1 308 Permanent Redirect
Location: /api/farmers/dashboard
X-API-Deprecated: true
Deprecation: true
Sunset: Sat, 01 Jun 2026 00:00:00 GMT
Link: </docs/migrations/api-consolidation-guide.md>; rel="deprecation"
Content-Type: application/json

{
  "success": true,
  "data": { ... },
  "meta": {
    "deprecation": {
      "deprecated": true,
      "sunset": "2026-06-01T00:00:00Z",
      "replacement": "/api/farmers/dashboard",
      "migration_guide": "/docs/migrations/api-consolidation-guide.md"
    }
  }
}
```

---

## Contact Information

For questions or assistance with migration:

- **Email:** api-support@farmersmarket.com
- **Phone:** 1-800-FARMERS (1-800-327-6377)
- **Slack:** #api-migration-support
- **Documentation:** https://docs.farmersmarket.com/migrations

---

**Thank you for your cooperation in making our API more consistent and reliable!**

*The Farmers Market Platform Team* 🌾
