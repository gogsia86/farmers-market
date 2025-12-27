# 🚀 Website Restructure - Quick Reference Guide

**Quick Access:** For detailed analysis, see `WEBSITE_RESTRUCTURE_ANALYSIS.md`

---

## 📊 At-a-Glance Status

| Phase | Status | Timeline | Risk | Impact |
|-------|--------|----------|------|--------|
| **Phase 1: Quick Wins** | 🟢 Ready | Week 1 (3-4 days) | Low | High |
| **Phase 2: Route Groups** | 🟡 Planning | Week 2 (5-7 days) | Medium | High |
| **Phase 3: API Restructure** | 🔴 Design | Week 3-4 (10-14 days) | Medium-High | Very High |
| **Phase 4: Polish** | ⚪ Future | Week 5 (5-7 days) | Low | Medium |

---

## 🎯 Key Changes Summary

### Route Groups (Before → After)

```
BEFORE                          AFTER
(admin)/admin/...      →       (admin-portal)/...
(farmer)/farmer/...    →       (farmer-portal)/...
(customer)/...         →       (dashboard)/ + (shop)/
(public)/...           →       (marketing)/ + (marketplace)/
(monitoring)/monitoring/ →     (monitoring)/...
```

### API Structure (Before → After)

```
BEFORE                          AFTER
/api/farmers/          →       /api/v1/farmer/
/api/farming/          →       [consolidated]
/api/farmer/           →       /api/v1/farmer/
/api/products/         →       /api/v1/public/products/
/api/orders/           →       /api/v1/{customer|farmer}/orders/
```

### Component Organization

```
BEFORE                          AFTER
shared/                →       common/
best-practices/        →       examples/best-practices/
divine/                →       examples/divine-patterns/
[root components]      →       features/{domain}/
```

---

## ⚡ Phase 1: Quick Wins (START HERE)

**Duration:** 3-4 days | **Risk:** 🟢 Low | **Impact:** 📈 High

### Day 1: Documentation Consolidation

```bash
# 1. Create docs structure
mkdir -p docs/{getting-started,architecture,development,deployment,operations,contributing,api}

# 2. Move files (examples)
mv QUICK_START.md docs/getting-started/quick-start.md
mv ARCHITECTURE_DIAGRAM.md docs/architecture/overview.md
mv DOCKER_DEPLOYMENT.md docs/deployment/docker.md

# 3. Update cross-references in moved files
# (Manual: Update all relative paths)

# 4. Create docs index
cat > docs/README.md << 'EOF'
# 📚 Farmers Market Platform Documentation

## Quick Links
- [Quick Start](getting-started/quick-start.md)
- [Architecture Overview](architecture/overview.md)
- [API Documentation](api/overview.md)

## Documentation Structure
- `getting-started/` - Setup & installation
- `architecture/` - System design & patterns
- `development/` - Coding & testing
- `deployment/` - Docker, Vercel, CI/CD
- `operations/` - Runbooks & monitoring
- `contributing/` - How to contribute
- `api/` - API reference
EOF
```

### Day 2: Component Organization

```bash
# 1. Rename shared to common
git mv src/components/shared src/components/common

# 2. Create examples directory
mkdir -p src/components/examples
git mv src/components/best-practices src/components/examples/
git mv src/components/divine src/components/examples/divine-patterns

# 3. Update imports (use find/replace)
# Find: @/components/shared
# Replace: @/components/common
```

### Day 3: Remove Redundant Route Nesting

```bash
# 1. Fix (admin)/admin → (admin)/
cd src/app/\(admin\)
git mv admin/* .
rmdir admin

# 2. Fix (farmer)/farmer → (farmer)/
cd ../\(farmer\)
git mv farmer/* .
rmdir farmer

# 3. Fix (monitoring)/monitoring → (monitoring)/
cd ../\(monitoring\)
git mv monitoring/* .
rmdir monitoring

# 4. Update imports and links (automated script below)
```

**Update Script:**
```typescript
// scripts/fix-route-imports.ts
import { promises as fs } from 'fs';
import path from 'path';

const replacements = [
  { from: '/(admin)/admin/', to: '/(admin)/' },
  { from: '/(farmer)/farmer/', to: '/(farmer)/' },
  { from: '/(monitoring)/monitoring/', to: '/(monitoring)/' },
  { from: '/admin/admin/', to: '/admin/' },
  { from: '/farmer/farmer/', to: '/farmer/' },
  { from: '/monitoring/monitoring/', to: '/monitoring/' },
];

async function updateFile(filePath: string) {
  let content = await fs.readFile(filePath, 'utf-8');
  let changed = false;

  for (const { from, to } of replacements) {
    if (content.includes(from)) {
      content = content.replaceAll(from, to);
      changed = true;
    }
  }

  if (changed) {
    await fs.writeFile(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

// Run on all .ts, .tsx, .md files
```

### Day 4: Add Redirects & Test

```typescript
// src/middleware.ts - Add to existing middleware
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect old routes to new structure
  const redirects: Record<string, string> = {
    '/admin/admin': '/admin',
    '/farmer/farmer': '/farmer',
    '/monitoring/monitoring': '/monitoring',
  };

  for (const [oldPath, newPath] of Object.entries(redirects)) {
    if (pathname.startsWith(oldPath)) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace(oldPath, newPath);
      return NextResponse.redirect(url, 301);
    }
  }

  // ... rest of middleware
}
```

**Testing Checklist:**
- [ ] All tests pass: `npm run test:all`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Manual navigation works
- [ ] Old URLs redirect correctly
- [ ] Type checking passes: `npm run type-check`
- [ ] Build succeeds: `npm run build`

---

## 🎯 Phase 2: Route Group Optimization

**Duration:** 5-7 days | **Risk:** 🟡 Medium | **Impact:** 📈 High

### Step 1: Create New Route Groups

```bash
# Create new route groups
mkdir -p src/app/\(marketing\)
mkdir -p src/app/\(marketplace\)
mkdir -p src/app/\(shop\)
mkdir -p src/app/\(dashboard\)

# Copy layouts from (public) and (customer)
cp src/app/\(public\)/layout.tsx src/app/\(marketing\)/layout.tsx
cp src/app/\(customer\)/layout.tsx src/app/\(dashboard\)/layout.tsx
```

### Step 2: Migrate Marketing Pages

```bash
# Move public pages to (marketing)
cd src/app/\(public\)
for dir in about blog careers contact faq help privacy terms; do
  git mv "$dir" ../\(marketing\)/
done

# Move homepage
git mv page.tsx ../\(marketing\)/page.tsx
```

### Step 3: Consolidate Marketplace

```bash
# Move marketplace pages to new (marketplace) group
git mv src/app/\(public\)/farms src/app/\(marketplace\)/farms
git mv src/app/\(public\)/products src/app/\(marketplace\)/products
git mv src/app/\(customer\)/marketplace/* src/app/\(marketplace\)/
```

### Step 4: Create Shop Route Group

```bash
# Move shopping flow to (shop)
git mv src/app/\(customer\)/cart src/app/\(shop\)/cart
git mv src/app/\(customer\)/checkout src/app/\(shop\)/checkout
git mv src/app/\(customer\)/orders src/app/\(shop\)/orders
```

### Step 5: Rename Route Groups

```bash
# Rename remaining route groups
git mv src/app/\(customer\) src/app/\(dashboard\)
git mv src/app/\(public\) src/app/\(marketing\)  # if anything left
git mv src/app/\(farmer\) src/app/\(farmer-portal\)
git mv src/app/\(admin\) src/app/\(admin-portal\)
```

### Step 6: Update All References

**Find & Replace in all files:**
```
/(customer)/    →  /(dashboard)/ or /(shop)/
/(public)/      →  /(marketing)/ or /(marketplace)/
/(farmer)/      →  /(farmer-portal)/
/(admin)/       →  /(admin-portal)/
```

**Update middleware routes:**
```typescript
// src/middleware.ts
const protectedRoutes = {
  '/admin': ['ADMIN', 'SUPER_ADMIN'],      // Old
  '/admin-portal': ['ADMIN', 'SUPER_ADMIN'], // New
  // ... update all routes
};
```

---

## 🔌 Phase 3: API Restructure

**Duration:** 10-14 days | **Risk:** 🟡 Medium | **Impact:** 📈 Very High

### Week 1: Setup & Public APIs

#### Day 1: Create Structure

```bash
# Create v1 API structure
mkdir -p src/app/api/v1/{public,auth,customer,farmer,admin,payments,search,upload,notifications}
mkdir -p src/app/api/internal/{monitoring,ai,admin}
mkdir -p src/app/api/webhooks
```

#### Day 2-3: Migrate Public APIs

```typescript
// Example: Migrate farms endpoint
// src/app/api/v1/public/farms/route.ts

import { NextRequest, NextResponse } from "next/server";
import { farmService } from "@/lib/services/farm.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const farms = await farmService.getPublicFarms({
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
    });

    return NextResponse.json({
      success: true,
      data: farms,
      meta: {
        version: "v1",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FARM_FETCH_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
```

#### Day 4: Add Deprecation Warnings

```typescript
// src/app/api/farms/route.ts (OLD ENDPOINT)
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Add deprecation header
  const response = NextResponse.redirect(
    new URL("/api/v1/public/farms", request.url)
  );
  
  response.headers.set("X-API-Deprecated", "true");
  response.headers.set("X-API-Deprecation-Info", "Use /api/v1/public/farms instead. This endpoint will be removed on 2025-03-01.");
  response.headers.set("Sunset", "2025-03-01");
  
  return response;
}
```

### Week 2: Auth & Protected APIs

#### Day 5-7: Migrate Auth Endpoints

```bash
# Create auth endpoints in new structure
src/app/api/v1/auth/
├── login/route.ts
├── register/route.ts
├── refresh/route.ts
├── logout/route.ts
├── forgot-password/route.ts
└── reset-password/route.ts
```

**Critical:** Test thoroughly before proceeding!

#### Day 8-10: Migrate Customer/Farmer/Admin APIs

```bash
# Migrate domain by domain
# Day 8: Customer APIs
# Day 9: Farmer APIs
# Day 10: Admin APIs

# Each day:
# 1. Create new endpoints
# 2. Add deprecation to old
# 3. Test extensively
# 4. Update internal consumers
```

---

## 📋 Copy-Paste Checklists

### Before Starting Any Phase

```
Technical Readiness:
[ ] All tests passing
[ ] No pending PRs on routing
[ ] Database migrations current
[ ] Staging environment ready
[ ] Monitoring configured
[ ] Backups verified

Team Readiness:
[ ] Team briefed
[ ] Migration plan reviewed
[ ] Rollback documented
[ ] Support team notified
[ ] Stakeholders informed
```

### After Each Phase

```
Validation:
[ ] npm run test:all (passes)
[ ] npm run test:e2e (passes)
[ ] npm run type-check (passes)
[ ] npm run build (succeeds)
[ ] Manual testing complete
[ ] Performance baseline checked

Documentation:
[ ] Changes documented
[ ] API docs updated
[ ] Migration guide updated
[ ] Changelog updated
[ ] Team notified
```

---

## 🚨 Emergency Rollback

### If Things Go Wrong

```bash
# 1. Immediate rollback via Git
git log --oneline -20  # Find last good commit
git revert <commit-hash> --no-commit
git commit -m "Rollback: [describe issue]"
git push

# 2. If deployed to Vercel
vercel rollback  # Rolls back to previous deployment

# 3. Clear caches
npm run clean:all
rm -rf .next

# 4. Rebuild
npm run build

# 5. Notify team
# Post in Slack: "Rolled back restructure due to [issue]. Investigating."
```

### Rollback Checklist

```
[ ] Identify issue
[ ] Stop ongoing deployments
[ ] Revert Git changes
[ ] Clear build caches
[ ] Rebuild & redeploy
[ ] Verify functionality
[ ] Update team
[ ] Document issue
[ ] Plan fix
```

---

## 📞 Quick Communication Templates

### Phase Kickoff

```
📢 Starting [Phase Name]

Duration: [X days]
Risk Level: [Low/Medium/High]
Impact: [What changes]

What to expect:
- [Key change 1]
- [Key change 2]
- [Key change 3]

Action needed:
- [If any]

Questions? Reply here or DM me.
```

### Daily Update

```
🔄 [Phase Name] - Day [X] Update

Completed:
✅ [Task 1]
✅ [Task 2]

In Progress:
🔨 [Task 3]

Blockers:
❌ [If any]

Tomorrow:
📅 [Next tasks]
```

### Phase Complete

```
🎉 [Phase Name] Complete!

Duration: [Actual vs planned]
Results:
✅ [Achievement 1]
✅ [Achievement 2]

Metrics:
📊 [Key metric improvements]

Issues encountered:
⚠️ [If any]

Lessons learned:
💡 [Key insights]

Next: [Next phase] starting [date]
```

---

## 🎯 Quick Decision Tree

### Should I start restructuring today?

```
Are all tests passing? ──NO──> Fix tests first
    │
   YES
    │
Is there a critical bug? ──YES──> Fix bug first
    │
   NO
    │
Do we have 3+ days available? ──NO──> Wait for capacity
    │
   YES
    │
Is team ready? ──NO──> Brief team first
    │
   YES
    │
✅ START PHASE 1!
```

### Which phase should I do?

```
Phase 1 complete? ──NO──> Start with Phase 1
    │
   YES
    │
Need better API structure urgently? ──YES──> Skip to Phase 3
    │
   NO
    │
Follow order: Phase 2 → Phase 3 → Phase 4
```

---

## 📊 Success Metrics - Quick View

| Metric | Before | After | How to Measure |
|--------|--------|-------|----------------|
| **Build Time** | 90s | <70s | `time npm run build` |
| **Bundle Size** | 2.8MB | <2.5MB | `npm run build:analyze` |
| **Route Files** | 111 | ~80 | `find src/app/api -name route.ts \| wc -l` |
| **Route Groups** | 5 | 8 | Count directories in `src/app` |
| **Docs at Root** | 15+ | 4 | `ls *.md \| wc -l` |
| **Time to Find Code** | 5-10min | <3min | Team survey |

---

## 🔗 Quick Links

- **Full Analysis:** `WEBSITE_RESTRUCTURE_ANALYSIS.md`
- **Refactoring Plan:** `REFACTORING_PLAN.md`
- **Architecture Docs:** `docs/architecture/`
- **API Docs:** `docs/api/`
- **Divine Instructions:** `.github/instructions/`

---

## ✅ Top 5 Priorities (If You Only Have 1 Week)

1. **✅ Remove redundant nesting** - Biggest quick win
2. **✅ Consolidate documentation** - Helps everyone immediately
3. **✅ Organize components** - Better DX
4. **✅ Add API deprecation warnings** - Prepare for future
5. **✅ Update developer docs** - Help the team

---

**Last Updated:** December 26, 2024  
**Status:** Ready for Phase 1 🚀  
**Questions?** See full analysis document or ask the team

_Remember: Incremental is better than perfect. Start small, test thoroughly, iterate!_ 🌾