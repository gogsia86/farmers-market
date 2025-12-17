# 🔒 Security Testing Quick Reference

## ⚡ One-Line Commands

```bash
# Complete security audit (recommended)
npm run security:full && npm run security:report

# Quick vulnerability scan (2-3 min)
npm run security:scan

# Advanced penetration testing (5-7 min)
npm run security:pentest

# CI/CD security check
npm run security:ci

# Specific vulnerability testing
npm run security:injection    # SQL Injection only
npm run security:xss          # XSS only
npm run security:auth         # Auth/authz only
npm run security:headers      # Security headers only
```

---

## 📋 Common Scenarios

### Scenario 1: Pre-Deployment Security Check

```bash
# Start server
npm run dev &
sleep 10

# Run full security suite
npm run security:full

# Generate reports
npm run security:report

# Check CI status
cat tests/security/reports/ci-security-status.json

# If PASS, deploy!
```

### Scenario 2: Daily Security Monitoring

```bash
# Morning security check
npm run security:quick

# Review any issues
open tests/security/reports/security-report-latest.html

# Fix critical issues immediately
```

### Scenario 3: After Code Changes

```bash
# Affected feature: Authentication
npm run security:auth

# Affected feature: API endpoints
npm run security:injection
npm run security:xss

# Full validation
npm run security:scan
```

### Scenario 4: Security Incident Response

```bash
# Run all tests immediately
npm run security:full

# Generate detailed report
npm run security:report

# Review penetration test results
npm run security:pentest

# Document findings
open tests/security/reports/security-report-*.html
```

---

## 🎯 Test Categories

### SQL Injection
```bash
npm run security:injection

# Tests:
# - Classic SQLi patterns
# - Blind SQLi (boolean & time-based)
# - UNION-based SQLi
# - Second-order SQLi
# - Error-based SQLi
```

### Cross-Site Scripting (XSS)
```bash
npm run security:xss

# Tests:
# - Stored XSS
# - Reflected XSS
# - DOM-based XSS
# - mXSS (mutation XSS)
# - Event handler XSS
```

### Authentication & Authorization
```bash
npm run security:auth

# Tests:
# - JWT validation
# - Session security
# - Brute force protection
# - Privilege escalation (horizontal & vertical)
# - IDOR vulnerabilities
```

### Security Headers
```bash
npm run security:headers

# Validates:
# - X-Frame-Options
# - X-Content-Type-Options
# - Strict-Transport-Security (HSTS)
# - Content-Security-Policy (CSP)
# - Referrer-Policy
# - Permissions-Policy
```

---

## 📊 Report Formats

### JSON (CI/CD)
```bash
npm run security:ci

# Output: tests/security/reports/ci-security-status.json
# Use in pipelines for pass/fail decisions
```

### HTML (Human-Readable)
```bash
npm run security:report

# Output: tests/security/reports/security-report-{timestamp}.html
# Beautiful dashboard with charts
```

### Markdown (Documentation)
```bash
npm run security:report

# Output: tests/security/reports/security-report-{timestamp}.md
# Perfect for GitHub issues
```

---

## 🔧 Troubleshooting Commands

### Tests Timing Out
```bash
# Increase timeout
npm run security:scan -- --testTimeout=60000

# Run sequentially
npm run security:scan -- --runInBand
```

### Server Not Running
```bash
# Start server and wait
npm run dev &
sleep 15
npm run security:scan
```

### False Positives in Development
```bash
# Run with development mode
NODE_ENV=development npm run security:scan
```

### Rate Limiting Issues
```bash
# Disable rate limiting for tests
DISABLE_RATE_LIMIT=true npm run security:scan
```

### Missing Dependencies
```bash
# Reinstall everything
rm -rf node_modules
npm install
npx playwright install
```

---

## 📈 Reading Security Scores

| Score | Status | Action Required |
|-------|--------|-----------------|
| 95-100% | 🛡️ Divine Fortress | Maintain vigilance |
| 85-94% | ✅ Secure | Monitor trends |
| 70-84% | ⚠️ Fair | Address issues within 1 week |
| 50-69% | 🚨 Poor | Immediate action required |
| <50% | 🔴 Critical | Emergency response |

---

## 🚨 Severity Levels

### Critical (🔴)
- **Timeline**: Fix within 24 hours
- **Examples**: SQLi, Authentication bypass, RCE
- **Command**: `npm run security:scan -- --testNamePattern="CRITICAL"`

### High (🟠)
- **Timeline**: Fix within 1 week
- **Examples**: XSS, CSRF, privilege escalation
- **Command**: `npm run security:scan -- --testNamePattern="HIGH"`

### Medium (🟡)
- **Timeline**: Fix within 1 month
- **Examples**: Information disclosure, rate limiting issues
- **Command**: `npm run security:scan -- --testNamePattern="MEDIUM"`

### Low (🟢)
- **Timeline**: Fix in next sprint
- **Examples**: Minor header issues, info leakage

---

## 🎨 Copy-Paste Test Patterns

### Add New SQLi Test
```typescript
it("should reject new SQLi payload", async () => {
  const payload = "' OR 1=1--";
  
  const response = await fetch(`${API_BASE}/endpoint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: payload })
  });

  expect([400, 422]).toContain(response.status);
  
  const data = await response.json();
  expect(data.error?.toLowerCase()).not.toContain("sql");
});
```

### Add New XSS Test
```typescript
it("should sanitize XSS in user input", async () => {
  const xssPayload = "<script>alert('XSS')</script>";
  
  const response = await fetch(`${API_BASE}/endpoint`, {
    method: "POST",
    body: JSON.stringify({ content: xssPayload })
  });

  if (response.ok) {
    const data = await response.json();
    expect(data.content).not.toContain("<script");
  }
});
```

### Add New Auth Test
```typescript
it("should require authentication", async () => {
  const response = await fetch(`${API_BASE}/protected`, {
    method: "GET"
    // No Authorization header
  });

  expect([401, 403]).toContain(response.status);
});
```

### Add New Rate Limit Test
```typescript
it("should rate limit excessive requests", async () => {
  const requests = Array(50).fill(null).map(() =>
    fetch(`${API_BASE}/endpoint`, { method: "POST" })
  );

  const responses = await Promise.all(requests);
  const rateLimited = responses.filter(r => r.status === 429).length;

  expect(rateLimited).toBeGreaterThan(0);
});
```

---

## 🔍 Useful Filters

### Run Only Failed Tests
```bash
npm run security:scan -- --onlyFailures
```

### Run Specific Test File
```bash
npm run security:scan -- tests/security/security-scanner.test.ts
```

### Run Tests Matching Pattern
```bash
npm run security:scan -- --testNamePattern="SQL Injection"
npm run security:scan -- --testNamePattern="XSS|CSRF"
```

### Verbose Output
```bash
npm run security:scan -- --verbose
```

### Update Snapshots
```bash
npm run security:scan -- --updateSnapshot
```

---

## 📦 Integration Snippets

### GitHub Actions
```yaml
- name: Security Testing
  run: |
    npm run dev &
    sleep 10
    npm run security:ci
    
- name: Check Status
  run: |
    STATUS=$(jq -r '.status' tests/security/reports/ci-security-status.json)
    if [ "$STATUS" != "PASS" ]; then
      exit 1
    fi
```

### Jenkins
```groovy
stage('Security') {
    steps {
        sh 'npm run security:full'
        sh 'npm run security:report'
        publishHTML([
            reportDir: 'tests/security/reports',
            reportFiles: 'security-report-*.html',
            reportName: 'Security Report'
        ])
    }
}
```

### Pre-commit Hook
```bash
#!/bin/bash
npm run security:quick
if [ $? -ne 0 ]; then
    echo "❌ Security checks failed!"
    exit 1
fi
```

### Docker
```dockerfile
RUN npm run security:scan
RUN npm run security:ci
```

---

## 🌾 Agricultural Consciousness Tests

```bash
# Validate seasonal security
npm run security:scan -- --testNamePattern="seasonal|agricultural"

# Business logic security
npm run security:pentest -- --grep "Business Logic"

# Farm-specific vulnerabilities
npm run security:scan -- --testNamePattern="farm"
```

**Agricultural Security Score**: Measures how well security testing respects farming domain logic (seasonal products, biodynamic practices, etc.)

---

## 📞 Support

### Security Issue Found?
```bash
# Generate detailed report
npm run security:full
npm run security:report

# Email report to security team
# security@farmersmarket.com
```

### Bug Bounty Submission
```bash
# Include full test results
npm run security:pentest
npm run security:report

# Submit to bugbounty@farmersmarket.com
```

### Emergency Security Incident
```bash
# Run all tests
npm run security:full

# Generate reports
npm run security:report

# Contact: security-incident@farmersmarket.com
# Include: tests/security/reports/ directory
```

---

## ✅ Daily Checklist

- [ ] Run `npm run security:quick` every morning
- [ ] Review security reports weekly
- [ ] Run `npm run security:full` before deployments
- [ ] Update security tests monthly
- [ ] Review and fix HIGH/CRITICAL issues immediately
- [ ] Document all security exceptions
- [ ] Keep dependencies updated
- [ ] Monitor security scores and trends

---

## 🎯 Success Metrics

**Target Security Score**: ≥95%
**Agricultural Consciousness**: ≥90%
**Critical Issues**: 0
**High Issues**: ≤2
**Test Coverage**: 100% of OWASP Top 10

**Current Status**: 
```bash
npm run security:full && cat tests/security/reports/ci-security-status.json
```

---

**Last Updated**: January 15, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production-Ready

_Quick security testing with divine precision._ ⚡🔒