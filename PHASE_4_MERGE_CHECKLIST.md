# 🚀 Phase 4 API Consolidation - Merge Checklist & Rollout Plan

**Branch:** `phase-4-api-consolidation`
**Target:** `main` / `master`
**Date Prepared:** January 3, 2026
**Prepared By:** AI Development Team

---

## 📋 Pre-Merge Checklist

### Code Quality & Testing

- [x] All TypeScript errors resolved
- [x] Import casing issues fixed (Card.tsx → card.tsx)
- [x] Arithmetic operations with Decimal types fixed
- [x] Null/undefined handling corrected
- [ ] Full test suite passes (unit + integration)
- [ ] E2E tests pass (Playwright)
- [ ] No new ESLint warnings introduced
- [ ] Code coverage maintained or improved (target: >80%)

### API Consolidation Validation

- [x] Farmer endpoints consolidated under `/api/farmers/`
- [x] Farming resources consolidated under `/api/farmers/resources/`
- [x] Payment wallet consolidated under `/api/payments/wallet`
- [x] Agricultural consciousness consolidated under `/api/agricultural/consciousness`
- [x] Backward-compatible aliases created for all deprecated endpoints
- [x] Deprecation headers implemented (X-API-Deprecated, Sunset, etc.)
- [x] HTTP 308 redirects preserve request method and body
- [ ] Manual testing of redirect behavior completed
- [ ] Deprecation headers verified in responses

### Documentation

- [x] Migration guide created (`docs/migrations/api-consolidation-guide.md`)
- [x] Migration announcement drafted (`docs/migrations/api-consolidation-announcement.md`)
- [x] Phase 4 analysis document completed (`PHASE_4_API_CONSOLIDATION_ANALYSIS.md`)
- [x] Implementation checklist completed (`PHASE_4_IMPLEMENTATION_CHECKLIST.md`)
- [x] Completion report created (`PHASE_4_IMPLEMENTATION_COMPLETE.md`)
- [x] Repository cleanup status updated (`REPOSITORY_CLEANUP_STATUS.md`)
- [ ] API documentation updated with new endpoints
- [ ] Changelog entry created

### Infrastructure & Monitoring

- [ ] Endpoint usage telemetry configured
- [ ] Monitoring dashboard created for tracking migration velocity
- [ ] Alerts configured for error rate spikes
- [ ] Logging includes deprecation events
- [ ] Sentry tags updated for new endpoint structure

---

## 🧪 Testing Requirements

### Unit Tests

```bash
npm run test:unit
```

**Expected:** All unit tests pass, no regressions

### Integration Tests

```bash
npm run test:integration
```

**Expected:** All API routes respond correctly, aliases redirect properly

### E2E Tests

```bash
npm run test:e2e
```

**Expected:** User workflows function end-to-end with new endpoints

### Manual Testing Checklist

- [ ] Farmer dashboard loads correctly (`GET /api/farmers/dashboard`)
- [ ] Old farmer dashboard redirects (`POST /api/farmer/dashboard`)
- [ ] Farming resources accessible under new paths
- [ ] Old farming resources redirect correctly
- [ ] Payment wallet functions under new path
- [ ] Old payment wallet endpoint redirects
- [ ] Agricultural consciousness endpoint works
- [ ] Deprecation headers present in all alias responses
- [ ] Request bodies preserved in POST/PUT/PATCH redirects
- [ ] Authentication still works for all endpoints
- [ ] Authorization checks function correctly

---

## 🚀 Deployment Strategy

### Phase 1: Staging Deployment (Week 1)

1. **Deploy to Staging**

   ```bash
   git checkout phase-4-api-consolidation
   # Verify clean state
   git status
   # Deploy to staging
   ./scripts/deploy-staging.sh
   ```

2. **Smoke Tests on Staging**
   - [ ] Hit all new consolidated endpoints
   - [ ] Verify alias redirects work
   - [ ] Check deprecation headers
   - [ ] Test authentication/authorization
   - [ ] Monitor error rates for 24 hours

3. **Performance Testing**
   - [ ] Load test new endpoints (ensure no performance regression)
   - [ ] Measure redirect overhead (should be < 10ms)
   - [ ] Verify database query performance unchanged

### Phase 2: Production Soft Launch (Week 2)

1. **Merge to Main**

   ```bash
   git checkout main
   git merge --no-ff phase-4-api-consolidation -m "feat: API endpoint consolidation (Phase 4)

   - Consolidate farmer endpoints under /api/farmers/
   - Consolidate farming resources under /api/farmers/resources/
   - Consolidate payment wallet under /api/payments/wallet
   - Consolidate agricultural consciousness under /api/agricultural/consciousness
   - Add backward-compatible aliases with deprecation headers
   - Implement HTTP 308 redirects preserving request method/body
   - Add comprehensive migration guide and documentation

   BREAKING CHANGE: Old endpoints deprecated, sunset date June 1, 2026

   Closes #[issue-number]"
   ```

2. **Deploy to Production**

   ```bash
   ./scripts/deploy-production.sh
   ```

3. **Monitor Closely (First 48 Hours)**
   - [ ] Watch error rates in Sentry
   - [ ] Monitor API latency in Application Insights
   - [ ] Track redirect usage metrics
   - [ ] Check database connection pool
   - [ ] Review logs for unexpected errors

### Phase 3: Communication Rollout (Week 2-3)

1. **Internal Communication**
   - [ ] Notify engineering team via Slack
   - [ ] Update internal API documentation
   - [ ] Brief support team on changes

2. **External Communication**
   - [ ] Send migration announcement email to API consumers
   - [ ] Post announcement to developer portal
   - [ ] Update public API documentation
   - [ ] Announce in community forum/Discord
   - [ ] Add in-app notification for developers

3. **Provide Support**
   - [ ] Monitor support tickets for migration issues
   - [ ] Schedule office hours for migration assistance
   - [ ] Offer priority support for high-volume integrations

---

## 📊 Success Metrics

### Immediate Success (Week 1)

- [ ] Zero critical errors post-deployment
- [ ] API error rate < 0.1%
- [ ] P95 latency unchanged or improved
- [ ] All redirects functioning correctly
- [ ] Deprecation headers present in 100% of alias responses

### Short-term Success (Month 1)

- [ ] < 5 support tickets related to migration
- [ ] At least 20% of traffic migrated to new endpoints
- [ ] Zero production incidents related to consolidation
- [ ] Positive developer feedback on migration process

### Long-term Success (By June 1, 2026)

- [ ] 100% of traffic on new endpoints
- [ ] Zero requests to deprecated aliases
- [ ] Improved API consistency scores
- [ ] Reduced maintenance burden
- [ ] Positive impact on developer experience metrics

---

## 🔧 Rollback Plan

### Immediate Rollback (< 1 Hour)

If critical issues discovered within first hour:

```bash
# Revert merge commit
git revert -m 1 <merge-commit-hash>
git push origin main

# Redeploy previous version
./scripts/deploy-production.sh
```

### Selective Rollback (< 24 Hours)

If specific endpoints problematic:

1. Disable problematic redirects via feature flag
2. Route traffic back to old implementation
3. Fix issues on branch
4. Redeploy after testing

### Emergency Contacts

- **On-Call Engineer:** [phone number]
- **Platform Lead:** [phone number]
- **DevOps Lead:** [phone number]

---

## 🚨 Risk Assessment

### High Risk Areas

1. **Payment Wallet Consolidation**
   - **Risk:** Financial transaction failures
   - **Mitigation:** Extra testing, real-time monitoring, immediate rollback capability

2. **Farmer Dashboard Changes**
   - **Risk:** Breaking primary farmer workflow
   - **Mitigation:** Extensive E2E testing, staged rollout

3. **Redirect Performance**
   - **Risk:** Latency increase from redirects
   - **Mitigation:** Load testing, performance monitoring

### Medium Risk Areas

1. **Farming Resources Migration**
   - **Risk:** Broken links in documentation/apps
   - **Mitigation:** Alias redirects, comprehensive testing

2. **Third-party Integrations**
   - **Risk:** External systems not following redirects
   - **Mitigation:** Early communication, extended sunset period

### Low Risk Areas

1. **Agricultural Consciousness Endpoint**
   - **Risk:** Low-traffic endpoint, minimal impact
   - **Mitigation:** Standard testing procedures

---

## 📝 Post-Merge Tasks

### Week 1

- [ ] Monitor production metrics daily
- [ ] Respond to support tickets within 4 hours
- [ ] Daily sync with team on issues
- [ ] Update monitoring dashboards

### Week 2-4

- [ ] Send reminder email about deprecation to users still on old endpoints
- [ ] Analyze migration velocity
- [ ] Adjust timeline if needed
- [ ] Publish case study / blog post

### Month 2-5

- [ ] Monthly check on migration progress
- [ ] Reach out to slow-adopters with assistance
- [ ] Send final warning 30 days before sunset (May 1, 2026)
- [ ] Prepare sunset implementation

### June 1, 2026 (Sunset)

- [ ] Switch aliases from 308 redirect to 410 Gone
- [ ] Monitor for any remaining old endpoint usage
- [ ] Provide emergency support for late migrators

### July 2026 (Cleanup)

- [ ] Archive deprecated alias files
- [ ] Remove deprecation code
- [ ] Update documentation
- [ ] Celebrate successful migration! 🎉

---

## 📞 Stakeholder Communication

### Engineering Team

- **Method:** Slack #engineering channel
- **Message:** "Phase 4 API consolidation merged to main. New endpoints live, old endpoints aliased with 6-month sunset."

### Product Team

- **Method:** Email + Slack #product
- **Message:** "API consolidation complete. User-facing impact minimal. Migration guide available for partners."

### Support Team

- **Method:** Support team meeting + documentation
- **Message:** "New API structure live. Support guide available. Expect migration questions over next 6 months."

### API Consumers

- **Method:** Email blast + developer portal
- **Message:** Use `api-consolidation-announcement.md` content

### Executive Team

- **Method:** Weekly status email
- **Message:** "Phase 4 complete: API consolidated, 6-month migration window, zero downtime."

---

## ✅ Final Approval

### Sign-off Required From:

- [ ] **Tech Lead:** **********\_********** Date: **\_**
- [ ] **Platform Engineer:** **********\_********** Date: **\_**
- [ ] **QA Lead:** **********\_********** Date: **\_**
- [ ] **Product Owner:** **********\_********** Date: **\_**
- [ ] **DevOps Lead:** **********\_********** Date: **\_**

### Pre-Merge Verification

- [ ] All tests passing on CI/CD
- [ ] Staging deployment successful
- [ ] Manual testing completed
- [ ] Documentation reviewed
- [ ] Migration announcement ready
- [ ] Monitoring configured
- [ ] Rollback plan tested
- [ ] Team notified and ready

---

## 🎯 Merge Command

Once all approvals obtained and checklist complete:

```bash
# Ensure you're on main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge with no-fast-forward to preserve history
git merge --no-ff phase-4-api-consolidation -m "feat: API endpoint consolidation (Phase 4)

- Consolidate farmer endpoints under /api/farmers/
- Consolidate farming resources under /api/farmers/resources/
- Consolidate payment wallet under /api/payments/wallet
- Consolidate agricultural consciousness under /api/agricultural/consciousness
- Add backward-compatible aliases with deprecation headers
- Implement HTTP 308 redirects preserving request method/body
- Add comprehensive migration guide and documentation

BREAKING CHANGE: Old endpoints deprecated, sunset date June 1, 2026

Refs: PHASE_4_API_CONSOLIDATION_ANALYSIS.md
Migration Guide: docs/migrations/api-consolidation-guide.md
Announcement: docs/migrations/api-consolidation-announcement.md"

# Push to remote
git push origin main

# Tag the release
git tag -a v2.0.0-phase4 -m "Phase 4: API Consolidation Complete"
git push origin v2.0.0-phase4

# Deploy to production
./scripts/deploy-production.sh
```

---

## 📈 Monitoring Queries

### Track Redirect Usage

```sql
-- Count requests to old vs new endpoints (Application Insights / Log Analytics)
SELECT
  CASE
    WHEN url LIKE '%/api/farmer/%' THEN 'OLD: /api/farmer/*'
    WHEN url LIKE '%/api/farmers/%' THEN 'NEW: /api/farmers/*'
    WHEN url LIKE '%/api/farming/%' THEN 'OLD: /api/farming/*'
    WHEN url LIKE '%/api/payment/wallet%' THEN 'OLD: /api/payment/wallet'
    WHEN url LIKE '%/api/payments/wallet%' THEN 'NEW: /api/payments/wallet'
  END as endpoint_group,
  COUNT(*) as request_count,
  AVG(duration) as avg_duration_ms
FROM requests
WHERE timestamp > ago(1d)
GROUP BY endpoint_group
ORDER BY request_count DESC;
```

### Monitor Error Rates

```sql
-- Check for increased error rates on consolidated endpoints
SELECT
  url,
  resultCode,
  COUNT(*) as error_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as error_percentage
FROM requests
WHERE timestamp > ago(1h)
  AND resultCode >= 400
GROUP BY url, resultCode
ORDER BY error_count DESC;
```

### Track Deprecation Header Usage

```sql
-- Identify consumers still using deprecated endpoints
SELECT
  client_IP,
  user_Agent,
  COUNT(*) as deprecated_calls,
  MAX(timestamp) as last_deprecated_call
FROM requests
WHERE timestamp > ago(7d)
  AND (
    url LIKE '%/api/farmer/%'
    OR url LIKE '%/api/farming/%'
    OR url LIKE '%/api/payment/wallet%'
    OR url LIKE '%/api/agricultural-consciousness%'
  )
GROUP BY client_IP, user_Agent
ORDER BY deprecated_calls DESC
LIMIT 100;
```

---

**Status:** Ready for final review and merge approval

**Last Updated:** January 3, 2026

**Contact:** AI Development Team / Platform Engineering
