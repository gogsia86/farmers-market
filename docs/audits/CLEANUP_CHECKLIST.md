# ✅ CLEANUP CHECKLIST

## Farmers Market Platform - Step-by-Step Action Items

**Start Date**: ****\_\_\_****  
**Target Completion**: ****\_\_\_****  
**Team Member**: ****\_\_\_****

---

## 🎯 OVERVIEW

This checklist breaks down the cleanup into manageable tasks. Check off each item as you complete it.

**Total Estimated Time**: 8-12 hours  
**Can be done incrementally**: YES  
**Safe to pause between phases**: YES

---

## 📋 PRE-CLEANUP CHECKLIST

### Before Starting

- [ ] Read `CLEANUP_EXECUTIVE_SUMMARY.md`
- [ ] Review `DEEP_CLEANUP_ANALYSIS_REPORT.md`
- [ ] Review `ROUTE_CLEANUP_ACTION_PLAN.md`
- [ ] Create backup branch: `git checkout -b cleanup/repository-organization`
- [ ] Ensure all tests pass: `npm test`
- [ ] Ensure development server runs: `npm run dev`
- [ ] Commit current work: `git commit -am "checkpoint before cleanup"`

---

## 🔴 PHASE 1: CRITICAL SECURITY (MUST DO FIRST)

**Priority**: CRITICAL  
**Time**: 1.5 hours  
**Risk**: LOW  
**Can Skip**: NO

### Task 1.1: Protect Demo Routes (1 hour)

- [ ] Create `src/app/demos/layout.tsx`
- [ ] Add production environment check
- [ ] Add admin-only authentication
- [ ] Add warning banner to demo pages
- [ ] Test in development
- [ ] Test protection with non-admin user
- [ ] Test production build blocks demos
- [ ] Add `ENABLE_DEMOS=false` to `.env.example`
- [ ] Commit: `git commit -m "security: protect demo routes with admin-only access"`

**Code Template**:

```typescript
// src/app/demos/layout.tsx
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export default async function DemosLayout({
  children
}: {
  children: React.ReactNode
}) {
  // Block in production
  if (process.env.NODE_ENV === 'production' &&
      process.env.ENABLE_DEMOS !== 'true') {
    notFound();
  }

  // Admin only
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div>
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
        <p className="text-yellow-700 font-semibold">
          ⚠️ DEMO ENVIRONMENT - Admin Only
        </p>
      </div>
      {children}
    </div>
  );
}
```

### Task 1.2: Protect Diagnostic Routes (30 minutes)

- [ ] Check if `src/app/(monitoring)/layout.tsx` has admin protection
- [ ] Add admin check to `src/app/diagnostic/page.tsx`
- [ ] Test diagnostic route requires admin
- [ ] Add warning banner to diagnostic page
- [ ] Test non-admin gets redirected
- [ ] Commit: `git commit -m "security: protect diagnostic routes"`

**Verification Commands**:

```bash
# Test demo protection
curl http://localhost:3001/demos
# Should return 404 or redirect

# Test with admin user
# Should show demo pages
```

---

## 🟡 PHASE 2: DOCUMENTATION CLEANUP (RECOMMENDED)

**Priority**: HIGH  
**Time**: 2-3 hours  
**Risk**: LOW  
**Can Skip**: NO (strongly recommended)

### Task 2.1: Review Cleanup Script (15 minutes)

- [ ] Read `scripts/cleanup-documentation.sh`
- [ ] Understand what files will be moved
- [ ] Verify script won't delete anything
- [ ] Make script executable: `chmod +x scripts/cleanup-documentation.sh`

### Task 2.2: Run Automated Cleanup (30 minutes)

- [ ] Backup current state: `git add -A && git commit -m "pre-cleanup checkpoint"`
- [ ] Run script: `./scripts/cleanup-documentation.sh`
- [ ] Review output for any errors
- [ ] Check created directories: `ls -la docs/`
- [ ] Verify files moved correctly
- [ ] Check root directory is cleaner: `ls *.md`

### Task 2.3: Manual Cleanup (1 hour)

- [ ] Remove temporary files: `rm -f prisma-version-*.txt`
- [ ] Remove orphaned file: `rm -f "Market Platform web and app"`
- [ ] Archive old README variants
- [ ] Review remaining root markdown files
- [ ] Keep only essential root files (README.md, LICENSE, etc.)

### Task 2.4: Update Documentation Links (1 hour)

- [ ] Search for broken links: `grep -r "](\.\./" docs/`
- [ ] Update README.md links to new locations
- [ ] Update .cursorrules if it references moved files
- [ ] Update any CI/CD scripts that reference docs
- [ ] Create `docs/INDEX.md` with navigation
- [ ] Test all documentation links work

### Task 2.5: Update .gitignore (5 minutes)

- [ ] Add `monitoring-reports/` to .gitignore
- [ ] Add `.vs/` to .gitignore
- [ ] Add `*.slnx` to .gitignore
- [ ] Add `prisma-version-*.txt` to .gitignore
- [ ] Commit: `git commit -m "chore: update gitignore"`

### Task 2.6: Commit Documentation Changes (5 minutes)

- [ ] Review changes: `git status`
- [ ] Check moved files: `git diff --cached --name-status`
- [ ] Commit: `git commit -m "docs: reorganize documentation into structured directories"`
- [ ] Verify commit size is reasonable

---

## 🟢 PHASE 3: ROUTE CLEANUP (RECOMMENDED)

**Priority**: HIGH  
**Time**: 4-6 hours  
**Risk**: MEDIUM  
**Can Skip**: For initial deployment, but do before production

### Task 3.1: Remove Farmer Dashboard Duplicate (30 minutes)

- [ ] Verify `src/app/(farmer)/farmer/dashboard/page.tsx` exists and works
- [ ] Search for links to `/farmer-dashboard`: `grep -r "farmer-dashboard" src/`
- [ ] Update any found links to `/farmer/dashboard`
- [ ] Remove duplicate: `rm -rf src/app/farmer-dashboard/`
- [ ] Add redirect to `next.config.mjs`:
  ```javascript
  redirects: async () => [
    {
      source: "/farmer-dashboard/:path*",
      destination: "/farmer/dashboard/:path*",
      permanent: true,
    },
  ];
  ```
- [ ] Test redirect works
- [ ] Test farmer dashboard still accessible
- [ ] Commit: `git commit -m "refactor: remove duplicate farmer dashboard route"`

### Task 3.2: Consolidate Account Routes (2 hours)

- [ ] Compare `/dashboard/` and `/(customer)/account/` directories
- [ ] List files in each: `ls src/app/dashboard/ src/app/(customer)/account/`
- [ ] Identify which has more complete implementation
- [ ] Move missing pages from `/dashboard/` to `/(customer)/account/`:
  - [ ] `addresses/page.tsx`
  - [ ] `favorites/page.tsx`
  - [ ] `profile/page.tsx`
  - [ ] `reviews/page.tsx`
- [ ] Move `/account/notifications/page.tsx` to `/(customer)/account/`
- [ ] Update imports in moved files
- [ ] Test each moved page works
- [ ] Update navigation components
- [ ] Remove old directories: `rm -rf src/app/dashboard/ src/app/account/`
- [ ] Add redirect to `next.config.mjs`:
  ```javascript
  {
    source: '/dashboard/:path*',
    destination: '/account/:path*',
    permanent: true
  }
  ```
- [ ] Test all account pages
- [ ] Test redirects work
- [ ] Commit: `git commit -m "refactor: consolidate account routes into customer route group"`

### Task 3.3: Fix Orders Route Ambiguity (1 hour)

- [ ] Create role-based redirect in `src/app/orders/page.tsx`:

  ```typescript
  import { auth } from "@/lib/auth";
  import { redirect } from "next/navigation";

  export default async function OrdersPage() {
    const session = await auth();

    if (!session?.user) {
      redirect("/login?callbackUrl=/orders");
    }

    switch (session.user.role) {
      case "FARMER":
        redirect("/farmer/orders");
      case "ADMIN":
        redirect("/admin/orders");
      default:
        redirect("/account/orders");
    }
  }
  ```

- [ ] Test redirect for customer role
- [ ] Test redirect for farmer role
- [ ] Test redirect for admin role
- [ ] Test redirect when not authenticated
- [ ] Update any navigation links to use role-specific routes
- [ ] Commit: `git commit -m "fix: add role-based redirect for orders route"`

### Task 3.4: Resolve Products Route (1.5 hours)

- [ ] Compare `src/app/products/page.tsx` vs `src/app/(customer)/marketplace/products/page.tsx`
- [ ] Check if they're identical: `diff src/app/products/page.tsx src/app/(customer)/marketplace/products/page.tsx`
- [ ] If identical, keep `/products` as canonical public URL
- [ ] Add canonical meta tag to `/products/page.tsx`
- [ ] Remove or redirect marketplace version if duplicate
- [ ] Update internal links to use `/products`
- [ ] Add to sitemap as canonical
- [ ] Test products page accessible
- [ ] Test SEO metadata present
- [ ] Commit: `git commit -m "fix: establish products as canonical public catalog URL"`

### Task 3.5: Verify Admin Login Pattern (30 minutes)

- [ ] Check `src/app/admin-login/page.tsx` is public
- [ ] Check `src/app/(admin)/layout.tsx` has admin verification
- [ ] Verify admin can access `/admin-login`
- [ ] Verify non-admin cannot access `/admin/*` routes
- [ ] Test login flow: `/admin-login` → `/admin`
- [ ] Add rate limiting if missing
- [ ] Document the pattern in `docs/architecture/`
- [ ] Commit if any changes made

### Task 3.6: Investigate Farms Routes (1 hour)

- [ ] Compare `/farms/[slug]` vs `/(customer)/marketplace/farms/[slug]`
- [ ] Check for differences: `diff -r src/app/farms/ src/app/(customer)/marketplace/farms/`
- [ ] If identical, decide on canonical URL (recommend `/farms`)
- [ ] Add canonical meta tag
- [ ] Update links throughout app
- [ ] Add appropriate redirects
- [ ] Test farm pages accessible
- [ ] Commit: `git commit -m "fix: establish canonical farm URLs"`

---

## 🧪 PHASE 4: TESTING & VALIDATION (CRITICAL)

**Priority**: CRITICAL  
**Time**: 3 hours  
**Risk**: N/A  
**Can Skip**: NO

### Task 4.1: Run Test Suite (30 minutes)

- [ ] Run unit tests: `npm test`
- [ ] Run integration tests: `npm run test:integration`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Check for any new failures
- [ ] Fix any broken tests
- [ ] Verify 80%+ coverage maintained

### Task 4.2: Manual Testing - Routes (1 hour)

- [ ] Test all redirects work:
  - [ ] `/farmer-dashboard` → `/farmer/dashboard`
  - [ ] `/dashboard/*` → `/account/*`
  - [ ] `/orders` → role-based redirect
- [ ] Test protected routes require auth:
  - [ ] `/demos` requires admin
  - [ ] `/diagnostic` requires admin
  - [ ] `/farmer/*` requires farmer role
  - [ ] `/account/*` requires authentication
- [ ] Test public routes accessible:
  - [ ] `/` (homepage)
  - [ ] `/about`
  - [ ] `/farms`
  - [ ] `/products`
  - [ ] `/login`

### Task 4.3: Manual Testing - User Flows (1 hour)

- [ ] Test customer journey:
  - [ ] Browse products
  - [ ] View farm
  - [ ] Add to cart
  - [ ] Checkout
  - [ ] View order history
- [ ] Test farmer journey:
  - [ ] Login as farmer
  - [ ] Access dashboard
  - [ ] View orders
  - [ ] Manage products
- [ ] Test admin journey:
  - [ ] Login via `/admin-login`
  - [ ] Access admin dashboard
  - [ ] Manage farms
  - [ ] View all orders

### Task 4.4: Link Verification (30 minutes)

- [ ] Check navigation components for broken links
- [ ] Check footer links
- [ ] Check breadcrumbs
- [ ] Check email templates
- [ ] Check API route redirects
- [ ] Use grep to find old URLs: `grep -r "/farmer-dashboard" src/`

---

## 📊 PHASE 5: DOCUMENTATION & DEPLOYMENT

**Priority**: MEDIUM  
**Time**: 1 hour  
**Risk**: LOW  
**Can Skip**: For development, required for production

### Task 5.1: Update Documentation (30 minutes)

- [ ] Update README.md with new route structure
- [ ] Document protected routes
- [ ] Update deployment guide
- [ ] Add note about demo/diagnostic routes
- [ ] Update architecture diagrams if any
- [ ] Update API documentation

### Task 5.2: Deployment Preparation (30 minutes)

- [ ] Verify environment variables documented
- [ ] Check `ENABLE_DEMOS=false` in production env
- [ ] Update `next.config.mjs` redirects are committed
- [ ] Verify `.gitignore` updated
- [ ] Create deployment checklist
- [ ] Tag release: `git tag v1.0.0-cleanup`

---

## ✅ POST-CLEANUP VERIFICATION

### Final Checks

- [ ] All tests passing
- [ ] Development server runs without errors
- [ ] No broken links found
- [ ] Documentation up to date
- [ ] Git history clean (no accidental commits)
- [ ] Changes reviewed (self or peer)
- [ ] Merge to main/develop branch

### Quality Metrics

- [ ] Root directory has <10 markdown files
- [ ] No duplicate routes
- [ ] All sensitive routes protected
- [ ] All redirects tested
- [ ] Documentation organized in `/docs/`
- [ ] Build size unchanged or reduced
- [ ] No new TypeScript errors
- [ ] Test coverage maintained or improved

---

## 📝 COMPLETION SUMMARY

### Date Completed: ****\_\_\_****

### Changes Made:

- [ ] Documentation reorganized
- [ ] Demo routes protected
- [ ] Diagnostic routes protected
- [ ] Duplicate routes removed
- [ ] Redirects added
- [ ] Tests updated
- [ ] Documentation updated

### Metrics:

- Root markdown files: **\_** (target: <10)
- Total routes: **\_** (should be reduced)
- Protected routes: **\_** (should increase)
- Test coverage: **\_**% (maintain >80%)

### Issues Encountered:

---

---

---

### Notes for Future:

---

---

---

---

## 🚀 READY FOR PRODUCTION?

### Pre-Production Checklist

- [ ] All cleanup phases completed
- [ ] All tests passing
- [ ] Staging environment tested
- [ ] Performance benchmarks meet targets
- [ ] Security audit passed
- [ ] Demo routes disabled
- [ ] Monitoring configured
- [ ] Rollback plan prepared

### Deployment Approval

- [ ] Technical Lead: ****\_\_\_****
- [ ] Date: ****\_\_\_****
- [ ] Production URL: ****\_\_\_****

---

## 📞 HELP & RESOURCES

**If you get stuck**:

1. Review detailed reports:
   - `CLEANUP_EXECUTIVE_SUMMARY.md`
   - `DEEP_CLEANUP_ANALYSIS_REPORT.md`
   - `ROUTE_CLEANUP_ACTION_PLAN.md`

2. Check divine instructions:
   - `.github/instructions/`

3. Rollback if needed:

   ```bash
   git reset --hard HEAD~1
   git clean -fd
   ```

4. Ask for help with specific error messages

---

**Cleanup Version**: 1.0  
**Last Updated**: November 2025  
**Estimated Total Time**: 8-12 hours  
**Difficulty**: MEDIUM  
**Risk**: LOW-MEDIUM (with proper testing)

✅ Good luck! Take it one phase at a time. You've got this! 🚀
