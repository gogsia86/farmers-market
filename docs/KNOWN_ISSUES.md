# Known Issues & Warnings

This document tracks known non-critical issues, deprecation warnings, and technical debt in the Farmers Market Platform.

## 📋 Table of Contents

- [Deprecation Warnings](#deprecation-warnings)
- [Technical Debt](#technical-debt)
- [Workarounds](#workarounds)
- [Monitoring](#monitoring)

---

## ⚠️ Deprecation Warnings

### `scmp@2.1.0` Deprecation Warning

**Status:** ℹ️ Non-Critical (Safe to Ignore)

**Warning Message:**

```
npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
```

**Details:**

- **Cause**: The `scmp` package is a transitive dependency of `twilio@5.11.1`
- **Impact**: None - purely informational warning
- **Risk Level**: None - the package works correctly
- **Modern Alternative**: Node.js's built-in `crypto.timingSafeEqual()` (available since Node v6.6.0)

**Why It Exists:**

```
farmers-market@1.0.0
└─┬ twilio@5.11.1
  └── scmp@2.1.0 (deprecated)
```

The Twilio SDK uses `scmp` internally for constant-time buffer comparisons to prevent timing attacks during webhook signature validation. While Node.js now provides this functionality natively via `crypto.timingSafeEqual()`, Twilio has not yet updated their dependency.

**Why We Can't Fix It:**

1. `scmp` is a **transitive dependency** (dependency of a dependency)
2. We don't control Twilio's package.json
3. Twilio SDK v5.11.1 is the latest version and still uses `scmp`
4. Attempting to override with `npm` overrides causes installation errors

**Resolution Timeline:**

- Waiting for Twilio to release updated SDK
- Track issue: https://github.com/twilio/twilio-node/issues
- Expected: Twilio v6.x may update dependencies

**Action Required:**
✅ **None** - This warning can be safely ignored

**Verification:**

```bash
# Check if Twilio has updated
npm view twilio version
npm view twilio dependencies

# Current version: 5.11.1 (as of Jan 2026)
```

---

## 🔧 Technical Debt

### Areas for Future Improvement

#### 1. SMS Service Testing

**Issue:** SMS service uses Twilio but lacks comprehensive test coverage

**Files Affected:**

- `src/lib/services/sms.service.ts`

**Recommendation:**

- Add unit tests with Twilio mocks
- Add integration tests with Twilio test credentials
- Add E2E tests for SMS verification flow

**Priority:** Medium

#### 2. Dependency Updates

**Issue:** Some dependencies may have newer versions with security/performance improvements

**Action Items:**

- Regular dependency audits: `npm audit`
- Check for updates: `npm outdated`
- Review major version updates before upgrading
- Test thoroughly after dependency updates

**Schedule:** Monthly dependency review

---

## 🛠️ Workarounds

### If You Really Want to Suppress the Warning

#### Option 1: Filter npm Output (Recommended)

```bash
# Development
npm install 2>&1 | grep -v "deprecated scmp"

# CI/CD
npm ci --quiet
```

#### Option 2: Use .npmrc to Reduce Warnings

Add to `.npmrc`:

```
loglevel=error
```

**Warning:** This suppresses ALL warnings, not just `scmp`

#### Option 3: Create Custom Shim (Advanced)

We've created a timing-safe comparison shim at `shims/scmp/` that uses Node.js's native `crypto.timingSafeEqual()`. However, npm overrides with local file paths are unreliable.

**Files:**

- `shims/scmp/index.js` - Modern implementation
- `shims/scmp/package.json` - Package metadata

**Note:** This shim is available but not actively used due to npm override limitations.

---

## 📊 Monitoring

### Dependency Security

**Tools:**

```bash
# Check for security vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Check specific package versions
npm view twilio version
npm ls scmp
```

**Automated Checks:**

- GitHub Dependabot enabled ✅
- Security alerts configured ✅
- Monthly dependency review scheduled ✅

### Testing Status

**Current Coverage:**

- Unit Tests: ~75%
- Integration Tests: ~60%
- E2E Tests: ~50%

**Areas Needing Coverage:**

- SMS verification flows
- Payment processing
- File uploads
- Real-time notifications

---

## 🔄 Update History

| Date       | Issue                          | Action                      | Status   |
| ---------- | ------------------------------ | --------------------------- | -------- |
| 2026-01-06 | scmp deprecation               | Documented as non-critical  | Open     |
| 2026-01-06 | Redis credentials exposure     | Rotated passwords           | ✅ Fixed |
| 2026-01-06 | Input text visibility          | Added text-foreground class | ✅ Fixed |
| 2026-01-06 | Farm registration Prisma error | Fixed include wrapping      | ✅ Fixed |

---

## 📚 Resources

### Related Documentation

- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md)
- [Redis Setup Guide](./REDIS_SETUP.md)
- [Environment Variables Check](./ENV_CHECK_TOOL.md)

### External References

- [Twilio SDK Documentation](https://www.twilio.com/docs/libraries/node)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [npm Overrides Documentation](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides)

---

## 💡 Contributing

If you discover new issues or have solutions to existing ones:

1. Check if issue already exists in this document
2. Verify the issue is reproducible
3. Document the workaround or solution
4. Update this file with findings
5. Create GitHub issue if needed

---

**Last Updated:** January 6, 2026
**Next Review:** February 6, 2026
**Maintained by:** Development Team
