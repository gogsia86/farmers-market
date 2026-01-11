# ✅ UBF Validation Checklist

> Quick reference checklist for validating UBF migration parity with legacy scripts

**Version:** 1.0.0
**Date:** January 2025

---

## Pre-Validation Setup

### Environment Preparation

- [ ] Application running on `http://localhost:3000`
- [ ] Database seeded with test data (`npm run bot:seed`)
- [ ] Environment variables configured
  - [ ] `BASE_URL` set
  - [ ] `TEST_USER_PASSWORD` set
- [ ] Playwright browsers installed (`npx playwright install`)
- [ ] Dependencies up to date (`npm ci`)
- [ ] No other processes interfering
- [ ] Clean state (delete old screenshots/reports)

```bash
# Quick setup script
export BASE_URL=http://localhost:3000
export TEST_USER_PASSWORD=YourPassword123!
npm ci
npx playwright install
npm run bot:seed
npm run dev
```

---

## Validation Execution

### 1. Health Checks Module

- [ ] Run legacy health checks: `tsx scripts/website-checker-bot.ts`
  - [ ] Record: Tests passed: \_**\_/\_\_**
  - [ ] Record: Duration: \_\_\_\_ seconds
  - [ ] Record: Success: YES / NO
- [ ] Run UBF health checks: `npm run validate:ubf:health`
  - [ ] Record: Tests passed: \_**\_/\_\_**
  - [ ] Record: Duration: \_\_\_\_ seconds
  - [ ] Record: Success: YES / NO
- [ ] Review comparison report
  - [ ] Recommendation: PASS / INVESTIGATE / FAIL
  - [ ] Differences documented: YES / NO
  - [ ] Action required: YES / NO

**Notes:**

```
_____________________________________________________________
_____________________________________________________________
```

---

### 2. Marketplace Module

- [ ] Run legacy marketplace checks
  - [ ] Record: Tests passed: \_**\_/\_\_**
  - [ ] Record: Duration: \_\_\_\_ seconds
  - [ ] Record: Success: YES / NO
- [ ] Run UBF marketplace validation: `npm run validate:ubf:marketplace`
  - [ ] Record: Tests passed: \_**\_/\_\_**
  - [ ] Record: Duration: \_\_\_\_ seconds
  - [ ] Record: Success: YES / NO
- [ ] Review comparison report
  - [ ] Recommendation: PASS / INVESTIGATE / FAIL
  - [ ] Differences documented: YES / NO
  - [ ] Action required: YES / NO

**Notes:**

```
_____________________________________________________________
_____________________________________________________________
```

---

### 3. Cart & Checkout Module

- [ ] Run legacy cart/checkout checks
  - [ ] Record: Tests passed: \_**\_/\_\_**
  - [ ] Record: Duration: \_\_\_\_ seconds
  - [ ] Record: Success: YES / NO
- [ ] Run UBF cart validation: `npm run validate:ubf:cart`
  - [ ] Record: Tests passed: \_**\_/\_\_**
  - [ ] Record: Duration: \_\_\_\_ seconds
  - [ ] Record: Success: YES / NO
- [ ] Review comparison report
  - [ ] Recommendation: PASS / INVESTIGATE / FAIL
  - [ ] Differences documented: YES / NO
  - [ ] Action required: YES / NO

**Notes:**

```
_____________________________________________________________
_____________________________________________________________
```

---

## Comprehensive Validation

### Run All Modules

- [ ] Execute: `npm run validate:ubf:all`
- [ ] All modules completed: YES / NO
- [ ] Reports generated in `./validation-reports/`
  - [ ] JSON report saved
  - [ ] Markdown report saved

### Summary Results

| Module          | Legacy Pass | UBF Pass | Recommendation            | Status |
| --------------- | ----------- | -------- | ------------------------- | ------ |
| Health          | ☐           | ☐        | PASS / INVESTIGATE / FAIL | ☐      |
| Marketplace     | ☐           | ☐        | PASS / INVESTIGATE / FAIL | ☐      |
| Cart & Checkout | ☐           | ☐        | PASS / INVESTIGATE / FAIL | ☐      |

**Overall Status:** PASS / INVESTIGATE / FAIL

---

## Issue Investigation

### Differences Found

For each module with INVESTIGATE or FAIL recommendation:

#### Module: ******\_\_\_\_******

**Difference Type:**

- [ ] Success status differs
- [ ] Test count differs
- [ ] Success rate differs
- [ ] Duration differs significantly
- [ ] Error patterns differ

**Severity:**

- [ ] CRITICAL - Functionality broken
- [ ] HIGH - Significant degradation
- [ ] MEDIUM - Notable differences
- [ ] LOW - Minor variations

**Analysis:**

```
Root cause: _________________________________________________
Expected behavior: __________________________________________
Actual behavior: ____________________________________________
Impact: _____________________________________________________
```

**Action Plan:**

- [ ] Fix UBF module
- [ ] Update test logic
- [ ] Improve selectors
- [ ] Accept difference (document why)
- [ ] Update legacy comparison

**Resolution:**

```
What was done: ______________________________________________
Re-validation result: PASS / FAIL
Sign-off: _________________ Date: __________
```

---

## Acceptance Criteria

### Automatic PASS Criteria

- [ ] All modules return PASS recommendation
- [ ] No critical differences found
- [ ] No high-severity differences found
- [ ] Success rates match (±5%)
- [ ] All critical tests pass

### Conditional PASS Criteria

If INVESTIGATE recommendations exist:

- [ ] Each difference reviewed and documented
- [ ] Impact assessed as acceptable
- [ ] Team consensus reached
- [ ] Differences logged in validation report
- [ ] Action items created (if needed)

### FAIL Criteria (Must Fix)

- [ ] Any FAIL recommendation exists
- [ ] Critical functionality broken
- [ ] Success rate drops >10%
- [ ] Critical tests fail
- [ ] New blocking errors introduced

---

## Quality Gates

### Critical Functionality (Must Work)

#### Health Checks

- [ ] Homepage loads
- [ ] API endpoints respond
- [ ] Database connects
- [ ] Authentication works
- [ ] Performance acceptable

#### Marketplace

- [ ] Product listing displays
- [ ] Search functionality works
- [ ] Filters apply correctly
- [ ] Product details load
- [ ] Responsive on mobile

#### Cart & Checkout

- [ ] Add to cart works
- [ ] Cart persists
- [ ] Checkout flow completes
- [ ] Payment integration works
- [ ] Order confirmation received

---

## Review & Sign-Off

### Technical Review

**Reviewed by:** **************\_\_\_**************
**Date:** ****\_\_****
**Result:** APPROVED / NEEDS WORK / REJECTED

**Comments:**

```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

### QA Sign-Off

**QA Lead:** **************\_\_\_**************
**Date:** ****\_\_****
**Result:** APPROVED / NEEDS WORK / REJECTED

**Test Coverage Assessment:**

- [ ] All critical paths validated
- [ ] Edge cases considered
- [ ] Error handling verified
- [ ] Performance acceptable

**Comments:**

```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

### Product Owner Approval

**PO:** **************\_\_\_**************
**Date:** ****\_\_****
**Decision:** PROCEED / HOLD / REVERT

**Business Impact:**

- [ ] No user-facing regressions
- [ ] Critical features work
- [ ] Acceptable user experience
- [ ] Ready for production

**Comments:**

```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

---

## Post-Validation Actions

### If APPROVED

- [ ] Update documentation
- [ ] Enable UBF in CI/CD
- [ ] Schedule team training
- [ ] Deprecate legacy scripts
- [ ] Archive legacy code
- [ ] Communicate to stakeholders

### If NEEDS WORK

- [ ] Create issue tickets for each fix
- [ ] Assign to appropriate team members
- [ ] Set timeline for re-validation
- [ ] Update this checklist with findings
- [ ] Schedule follow-up validation

### If REJECTED

- [ ] Document critical issues
- [ ] Assess rollback options
- [ ] Plan remediation strategy
- [ ] Communicate to stakeholders
- [ ] Schedule retrospective

---

## Flakiness Assessment

### Test Stability Check

Run validation **3 times** to check for flaky tests:

| Run | Health        | Marketplace   | Cart          | Overall       |
| --- | ------------- | ------------- | ------------- | ------------- |
| 1   | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL |
| 2   | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL |
| 3   | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL | ☐ PASS ☐ FAIL |

**Consistency:** STABLE / FLAKY / UNSTABLE

**Flaky Tests Identified:**

```
_____________________________________________________________
_____________________________________________________________
```

**Action Items:**

- [ ] Fix flaky tests
- [ ] Improve selectors
- [ ] Add retries
- [ ] Increase timeouts
- [ ] Document workarounds

---

## Performance Comparison

### Execution Time

| Module      | Legacy (avg) | UBF (avg)   | Difference  | Acceptable? |
| ----------- | ------------ | ----------- | ----------- | ----------- |
| Health      | \_\_\_s      | \_\_\_s     | \_\_\_%     | ☐ YES ☐ NO  |
| Marketplace | \_\_\_s      | \_\_\_s     | \_\_\_%     | ☐ YES ☐ NO  |
| Cart        | \_\_\_s      | \_\_\_s     | \_\_\_%     | ☐ YES ☐ NO  |
| **Total**   | **\_\_\_s**  | **\_\_\_s** | **\_\_\_%** | ☐ YES ☐ NO  |

**Performance Assessment:**

- [ ] UBF is faster (positive)
- [ ] UBF is comparable (±50%)
- [ ] UBF is slower but acceptable (<100% slower)
- [ ] UBF is unacceptably slow (>100% slower)

---

## Documentation Updates

### Required Documentation

- [ ] Validation report saved to `./validation-reports/`
- [ ] Differences documented in `VALIDATION_GUIDE.md`
- [ ] Known issues logged in issue tracker
- [ ] Team wiki updated with results
- [ ] CHANGELOG updated with validation status
- [ ] Migration notes updated

---

## Communication

### Stakeholder Notification

- [ ] Development team notified
- [ ] QA team notified
- [ ] Product owner notified
- [ ] DevOps team notified (for CI/CD)
- [ ] Documentation team notified

**Notification Template:**

```
Subject: UBF Validation Complete - [PASS/INVESTIGATE/FAIL]

Team,

The UBF migration validation has been completed with the following results:

- Health Checks: [PASS/INVESTIGATE/FAIL]
- Marketplace: [PASS/INVESTIGATE/FAIL]
- Cart & Checkout: [PASS/INVESTIGATE/FAIL]

Overall Recommendation: [PASS/INVESTIGATE/FAIL]

[Summary of key findings]

Action Items:
1. [Action item 1]
2. [Action item 2]

Next Steps:
[What happens next]

Reports available at: ./validation-reports/validation-[timestamp].md

Questions? Contact: [Your Name]
```

---

## Final Checklist

### Ready to Proceed

- [ ] All validations completed
- [ ] All FAIL issues resolved
- [ ] All INVESTIGATE items reviewed
- [ ] Documentation complete
- [ ] Team trained on UBF
- [ ] CI/CD pipeline ready
- [ ] Rollback plan documented
- [ ] Stakeholders informed
- [ ] Final approval received

**Final Sign-Off:**

**Project Lead:** **************\_\_\_************** Date: ****\_\_****

**Validation Status:** ✅ APPROVED / ⚠️ CONDITIONAL / ❌ REJECTED

---

## Appendix: Quick Commands

```bash
# Setup
npm ci
npx playwright install
npm run bot:seed
npm run dev

# Validation
npm run validate:ubf              # Health only (default)
npm run validate:ubf:health       # Health checks
npm run validate:ubf:marketplace  # Marketplace
npm run validate:ubf:cart         # Cart & checkout
npm run validate:ubf:all          # All modules

# Review reports
cat validation-reports/validation-*.md
cat validation-reports/validation-*.json | jq .

# Check UBF independently
npm run bot:test:health
npm run bot:test:marketplace
npm run bot test checkout

# Check legacy independently
tsx scripts/website-checker-bot.ts
tsx scripts/mvp-validation-bot.ts
```

---

**Validation Date:** ****\_\_****
**Completed By:** **************\_\_\_**************
**Final Status:** ✅ PASS / ⚠️ INVESTIGATE / ❌ FAIL
