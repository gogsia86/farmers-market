# 🧹 Cleanup Guide - Farmers Market Platform

**Last Updated:** 2024
**Status:** Active Maintenance Guide

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Automated Cleanup Tools](#automated-cleanup-tools)
4. [Current Issues Found](#current-issues-found)
5. [Manual Cleanup Checklist](#manual-cleanup-checklist)
6. [Database Cleanup](#database-cleanup)
7. [File Organization](#file-organization)
8. [Best Practices](#best-practices)
9. [CI/CD Integration](#cicd-integration)

---

## 🎯 Overview

This guide provides comprehensive instructions for identifying and cleaning up problematic files, duplicate code, and database inconsistencies in the Farmers Market Platform.

### Goals

- ✅ Eliminate duplicate files and conflicting code
- ✅ Remove deprecated patterns and old code
- ✅ Ensure database integrity
- ✅ Maintain clean codebase structure
- ✅ Improve build performance

---

## 🚀 Quick Start

### Run All Cleanup Checks

```bash
# Check codebase for issues
npm run cleanup:check

# Check database for integrity issues
npm run cleanup:db

# Run both checks
npm run cleanup:full
```

### View Detailed Reports

After running the checks, view the generated reports:

- `cleanup-report.json` - Codebase issues
- `database-cleanup-report.json` - Database issues

---

## 🛠️ Automated Cleanup Tools

### 1. Codebase Cleanup Check (`cleanup:check`)

**Location:** `scripts/cleanup-check.js`

**Checks for:**

- ✅ Duplicate filenames
- ✅ Case-insensitive duplicates
- ✅ Old/deprecated patterns (getServerSideProps, class components, etc.)
- ✅ Route conflicts
- ✅ Improper client component usage
- ✅ Missing 'use client' directives
- ✅ Large files (>500 lines)
- ✅ Empty files
- ✅ Missing exports

**Usage:**

```bash
npm run cleanup:check
```

### 2. Database Cleanup Check (`cleanup:db`)

**Location:** `scripts/clean-database.ts`

**Checks for:**

- ✅ Orphaned records (products without farms, etc.)
- ✅ Invalid statuses
- ✅ Old soft-deleted records (>30 days)
- ✅ Inconsistent data
- ✅ Duplicate emails
- ✅ Duplicate slugs

**Usage:**

```bash
npm run cleanup:db
```

---

## 🔍 Current Issues Found

### Critical Issues (Require Immediate Attention)

#### 1. Duplicate File Conflicts

**Problem:** Multiple files with same name causing potential conflicts

**High Priority Duplicates:**

```
actions.ts
├── app/(admin)/farms/actions.ts
└── types/actions.ts
[Action Required: Rename one to be more specific]

farm.types.ts
├── features/farm-management/types/farm.types.ts
├── types/api/farm.types.ts
└── types/farm.types.ts
[Action Required: Consolidate into single source of truth]

order.service.ts
├── features/order-management/services/order.service.ts
└── lib/services/order.service.ts
[Action Required: Remove duplicate, use single service]

geocoding.service.ts
├── lib/geocoding/geocoding.service.ts
└── lib/services/geocoding.service.ts
[Action Required: Remove duplicate]
```

#### 2. Improper Client Component Usage

**Problem:** Files marked with "use client" but using server-only features

**Files to Fix:**

- `app/(admin)/farms/FarmsTable.tsx`
- `app/(auth)/admin-login/page.tsx`
- `app/error.tsx`
- `components/checkout/StripePaymentElement.tsx`
- `components/notifications/NotificationBell.tsx`
- `features/order-management/components/OrderCard.tsx`
- `features/order-management/hooks/useOrders.ts`

**Resolution:**

1. Remove server-only features from client components
2. OR move server logic to Server Components
3. OR remove "use client" directive if not needed

### Medium Priority Issues

#### 3. Case-Insensitive Duplicates

```
Loading.tsx vs loading.tsx
├── components/ui/Loading.tsx
└── app/loading.tsx (and others)
```

**Risk:** Can cause issues on case-sensitive file systems (Linux/Unix)

#### 4. Large Files (>500 lines)

**Files that should be refactored:**

- `app/(customer)/dashboard/profile/page.tsx` (918 lines)
- `app/(customer)/dashboard/addresses/page.tsx` (784 lines)
- `app/(farmer)/settings/page.tsx` (683 lines)
- `app/(farmer)/orders/[id]/page.tsx` (657 lines)

**Recommendation:** Break into smaller components/modules

### Low Priority Issues

#### 5. Old React Patterns

- `components/ErrorBoundary.tsx` uses class component
  - **Action:** Consider converting to function component with error boundary library

#### 6. Missing Exports

- `components/__tests__/ErrorBoundary.test.tsx`
- `components/__tests__/SeasonalProductCatalog.test.tsx`

---

## ✅ Manual Cleanup Checklist

### Phase 1: Critical Fixes (Week 1)

- [ ] **Consolidate `farm.types.ts`**
  - [ ] Review all three versions
  - [ ] Merge into single source in `types/farm.types.ts`
  - [ ] Update all imports
  - [ ] Delete duplicates

- [ ] **Consolidate Services**
  - [ ] `order.service.ts` - Keep one version in `lib/services/`
  - [ ] `geocoding.service.ts` - Keep one version in `lib/services/`
  - [ ] Update all imports

- [ ] **Fix Client Component Issues**
  - [ ] Remove server-only code from client components
  - [ ] Move server logic to Server Components
  - [ ] Test all affected pages

### Phase 2: Medium Priority (Week 2)

- [ ] **Resolve Case-Sensitive Issues**
  - [ ] Rename `components/ui/Loading.tsx` to `LoadingSpinner.tsx`
  - [ ] Update all imports

- [ ] **Refactor Large Files**
  - [ ] Break down dashboard profile page
  - [ ] Extract reusable components
  - [ ] Split into logical modules

- [ ] **Rename Ambiguous Files**
  - [ ] `app/(admin)/farms/actions.ts` → `farm-actions.ts`
  - [ ] Document naming conventions

### Phase 3: Optimization (Week 3)

- [ ] **Modernize Code**
  - [ ] Convert ErrorBoundary to functional component
  - [ ] Review and update deprecated patterns

- [ ] **Add Missing Exports**
  - [ ] Fix test files without exports

- [ ] **Bundle Optimization**
  - [ ] Run bundle analyzer
  - [ ] Identify and fix large dependencies

---

## 🗄️ Database Cleanup

### Check Database Integrity

```bash
npm run cleanup:db
```

### Common Issues and Solutions

#### Orphaned Records

**Products without farms:**

```sql
-- Find orphaned products
SELECT p.id, p.name, p."farmId"
FROM products p
LEFT JOIN farms f ON p."farmId" = f.id
WHERE f.id IS NULL;

-- Clean up (use with caution!)
DELETE FROM products
WHERE "farmId" NOT IN (SELECT id FROM farms);
```

**Order items without orders:**

```sql
-- Find orphaned order items
SELECT oi.id, oi."orderId"
FROM order_items oi
LEFT JOIN orders o ON oi."orderId" = o.id
WHERE o.id IS NULL;

-- Clean up
DELETE FROM order_items
WHERE "orderId" NOT IN (SELECT id FROM orders);
```

#### Invalid Status Values

```sql
-- Find orders with invalid status
SELECT id, status, "createdAt"
FROM orders
WHERE status NOT IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- Update to valid status
UPDATE orders
SET status = 'PENDING'
WHERE status NOT IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
```

#### Duplicate Data

```sql
-- Find duplicate emails
SELECT email, COUNT(*) as count
FROM users
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- Find duplicate farm slugs
SELECT slug, COUNT(*) as count
FROM farms
WHERE slug IS NOT NULL
GROUP BY slug
HAVING COUNT(*) > 1;
```

---

## 📁 File Organization

### Recommended Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin route group
│   ├── (customer)/               # Customer route group
│   ├── (farmer)/                 # Farmer route group
│   ├── (public)/                 # Public route group
│   └── api/                      # API routes
├── components/                   # Shared components
│   ├── ui/                       # UI primitives
│   ├── dashboard/                # Dashboard components
│   ├── forms/                    # Form components
│   └── layout/                   # Layout components
├── features/                     # Feature modules
│   ├── farm-management/
│   ├── order-management/
│   └── product-management/
├── lib/                          # Utilities and services
│   ├── services/                 # Business logic services
│   ├── utils/                    # Utility functions
│   ├── auth/                     # Authentication
│   └── database/                 # Database utilities
└── types/                        # TypeScript types
    ├── api/                      # API types
    └── models/                   # Data model types
```

### Naming Conventions

**Files:**

- Components: PascalCase (`FarmCard.tsx`)
- Utilities: camelCase (`formatPrice.ts`)
- Types: camelCase with `.types.ts` suffix (`farm.types.ts`)
- Services: camelCase with `.service.ts` suffix (`order.service.ts`)
- Tests: Match filename with `.test.ts` suffix

**Directories:**

- kebab-case for multi-word (`farm-management/`)
- PascalCase for component directories (`FarmCard/`)

---

## 🎯 Best Practices

### 1. Prevent Duplicates

**Before creating a new file:**

```bash
# Search for existing similar files
find src -name "*farm*" -type f
rg "export.*FarmCard" src/
```

**Use path aliases:**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### 2. Code Review Checklist

- [ ] No duplicate files created
- [ ] Imports use path aliases
- [ ] Client components properly marked
- [ ] Server-only code not in client components
- [ ] Files under 500 lines (consider splitting)
- [ ] Proper naming conventions followed
- [ ] Types defined in appropriate location

### 3. Regular Maintenance

**Weekly:**

```bash
npm run cleanup:check
```

**Monthly:**

```bash
npm run cleanup:full
npm run build  # Check for build errors
npm run test   # Run all tests
```

**Quarterly:**

- Review and update dependencies
- Analyze bundle size
- Database performance audit
- Security audit

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/cleanup-check.yml`:

```yaml
name: Cleanup Check

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  cleanup-check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run cleanup check
        run: npm run cleanup:check || true

      - name: Upload cleanup report
        uses: actions/upload-artifact@v3
        with:
          name: cleanup-report
          path: cleanup-report.json

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('cleanup-report.json', 'utf8'));

            const duplicates = Object.keys(report.duplicateNames).length;
            const oldPatterns = report.oldPatterns.length;
            const routeConflicts = report.routeConflicts.length;

            let comment = '## 🧹 Cleanup Check Results\n\n';
            comment += `- Duplicate filenames: ${duplicates}\n`;
            comment += `- Old patterns: ${oldPatterns}\n`;
            comment += `- Route conflicts: ${routeConflicts}\n`;

            if (duplicates > 0 || oldPatterns > 0 || routeConflicts > 0) {
              comment += '\n⚠️ Issues found. Please review the cleanup report.';
            } else {
              comment += '\n✅ No issues found!';
            }

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run cleanup check (non-blocking)
npm run cleanup:check || echo "⚠️ Cleanup check found issues. Please review."

# Run linting (blocking)
npm run lint-staged
```

---

## 📊 Monitoring and Reporting

### View Current Status

```bash
# Quick status check
npm run cleanup:check | grep "SUMMARY" -A 10

# Database status
npm run cleanup:db | grep "SUMMARY" -A 15
```

### Metrics to Track

**Codebase Health:**

- Number of duplicate files: **Target: 0**
- Files with old patterns: **Target: 0**
- Route conflicts: **Target: 0**
- Average file size: **Target: <300 lines**
- Test coverage: **Target: >80%**

**Database Health:**

- Orphaned records: **Target: 0**
- Invalid statuses: **Target: 0**
- Duplicate keys: **Target: 0**
- Query performance: **Monitor slow queries**

---

## 🆘 Troubleshooting

### Issue: "Cannot find module" after cleanup

**Solution:**

1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `npm ci`
3. Rebuild: `npm run build`

### Issue: Tests failing after refactor

**Solution:**

1. Update test imports
2. Check mock paths
3. Run tests with verbose: `npm test -- --verbose`

### Issue: Build errors after cleanup

**Solution:**

1. Check TypeScript errors: `npm run type-check`
2. Review ESLint warnings: `npm run lint`
3. Verify all imports are correct

---

## 📚 Additional Resources

- [Next.js 13+ Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading)
- [React Server Components](https://react.dev/reference/react/use-server)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

---

## 🤝 Contributing

When contributing to the cleanup effort:

1. **Create a branch:** `git checkout -b cleanup/descriptive-name`
2. **Make focused changes:** One issue at a time
3. **Test thoroughly:** Run all tests and build
4. **Update documentation:** Keep this guide current
5. **Submit PR:** Include before/after metrics

---

## 📝 Changelog

### 2024-01-XX - Initial Cleanup Guide

- Created automated cleanup scripts
- Documented current issues
- Established cleanup procedures
- Added CI/CD integration

---

## ✅ Success Criteria

A successful cleanup should achieve:

- ✅ Zero duplicate files with same name
- ✅ Zero route conflicts
- ✅ All client components properly configured
- ✅ No deprecated React/Next.js patterns
- ✅ No orphaned database records
- ✅ All tests passing
- ✅ Build completing without warnings
- ✅ Bundle size optimized

---

**Remember:** Regular maintenance prevents major cleanup efforts. Run checks weekly and address issues promptly!

**Questions?** Contact the development team or create an issue in the repository.
