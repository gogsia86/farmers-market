# 🔧 Recommended Updates & Improvements

**Farmers Market Platform - Priority Action Items**  
**Generated**: December 3, 2024  
**Status**: Ready for Implementation

---

## 📊 Overview

This document outlines recommended updates and improvements needed to ensure the dev server shows all latest changes optimally and maintains code quality.

**Priority Levels**:

- 🔴 **CRITICAL** - Blocks functionality or causes errors
- 🟡 **HIGH** - Improves reliability and user experience
- 🟢 **MEDIUM** - Code quality and maintainability
- 🔵 **LOW** - Nice-to-have enhancements

---

## 🔴 CRITICAL PRIORITIES (Do First)

### 1. Fix API Route Parameter Naming (30 minutes)

**Issue**: Orders API routes use `orderId` but service expects `id`

**Files to Update**:

```typescript
// src/app/api/orders/[orderId]/route.ts
// src/app/api/orders/[orderId]/cancel/route.ts

// Current (WRONG):
const order = await orderService.getOrder({ orderId: params.orderId });

// Fix to:
const order = await orderService.getOrder({ id: params.orderId });
```

**Affected Files**:

- `src/app/api/orders/[orderId]/route.ts` (Line 33, 87, 125)
- `src/app/api/orders/[orderId]/cancel/route.ts` (Line 95)

**Fix Steps**:

1. Open each file
2. Find `orderService.getOrder({ orderId: ... })`
3. Replace with `orderService.getOrder({ id: ... })`
4. Find `orderService.updateOrder({ orderId: ... })`
5. Replace with `orderService.updateOrder({ id: ... })`
6. Test: `npm run type-check`

**Impact**: Fixes 4 TypeScript errors, ensures order endpoints work correctly

---

### 2. Verify Database Connection String (5 minutes)

**Issue**: Ensure `.env.local` has correct local database URL

**File**: `.env.local`

**Required Configuration**:

```bash
# Development Database (Local PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/farmersmarket

# NOT Docker/Production URL:
# DATABASE_URL=postgresql://postgres:postgres@db:5432/farmersmarket
```

**Verification**:

```bash
# Check current value:
cat .env.local | grep DATABASE_URL

# Test connection:
psql -U postgres -d farmersmarket -c "SELECT COUNT(*) FROM users;"
```

**Impact**: Ensures database operations work in development

---

### 3. Clear Build Cache Before First Run (1 minute)

**Issue**: Stale `.next` cache may show old code

**Action**:

```bash
# Remove build cache:
rm -rf .next

# Remove test cache (optional):
rm -rf .jest-cache

# Remove all caches:
npm run clean:all
```

**When to Do This**:

- Before first `npm run dev` after pulling changes
- After major dependency updates
- When experiencing unexplained UI issues
- After Prisma schema changes

**Impact**: Ensures latest code changes are compiled and displayed

---

## 🟡 HIGH PRIORITY (Next Session)

### 4. Exclude Mobile App from TypeScript Check (15 minutes)

**Issue**: 10+ TypeScript errors in `mobile-app/` directory blocking clean type-check

**Solution**: Create separate TypeScript config for mobile app

**File**: `mobile-app/tsconfig.json` (CREATE NEW)

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "jsx": "react-native",
    "target": "ES2020",
    "lib": ["ES2020"],
    "skipLibCheck": true,
    "strict": false
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

**Update**: `tsconfig.json` (ROOT)

```json
{
  "exclude": [
    "node_modules",
    ".next",
    "mobile-app/**", // ADD THIS LINE
    "scripts/**"
    // ... rest of excludes
  ]
}
```

**Test**:

```bash
npm run type-check
# Should show ~12 fewer errors
```

**Impact**: Clean TypeScript compilation for web platform

---

### 5. Add Environment Variable Validation (20 minutes)

**Issue**: Missing environment variables fail silently

**File**: `src/lib/config/env.ts` (CREATE NEW)

```typescript
/**
 * Environment Variable Validation
 * Ensures all required env vars are present at startup
 */

import { z } from "zod";

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.string().default("3001"),

  // Database
  DATABASE_URL: z.string().url(),

  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),

  // Public URLs
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error("❌ Invalid environment variables:", error);
  throw new Error("Environment validation failed. Check .env.local");
}

export { env };
```

**Usage**: Import in `src/lib/database/index.ts`

```typescript
import { env } from "@/lib/config/env";

const connectionString = env.DATABASE_URL;
```

**Impact**: Fail fast with clear error messages for missing config

---

### 6. Add Dev Server Health Check Script (15 minutes)

**Issue**: No automated way to verify dev server is fully operational

**File**: `scripts/check-dev-server.ts` (CREATE NEW)

```typescript
#!/usr/bin/env tsx
/**
 * Dev Server Health Check
 * Verifies all critical services are operational
 */

import { spawn } from "child_process";

const BASE_URL = "http://localhost:3001";

async function checkEndpoint(path: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.ok;
  } catch {
    return false;
  }
}

async function runHealthCheck() {
  console.log("🏥 Running Dev Server Health Check...\n");

  const checks = [
    { name: "Homepage", path: "/" },
    { name: "API Health", path: "/api/health" },
    { name: "Platform Stats", path: "/api/platform/stats" },
    { name: "Farms API", path: "/api/farms" },
  ];

  let allPassed = true;

  for (const check of checks) {
    const passed = await checkEndpoint(check.path);
    const status = passed ? "✅" : "❌";
    console.log(`${status} ${check.name}: ${check.path}`);
    if (!passed) allPassed = false;
  }

  console.log(
    "\n" + (allPassed ? "✅ All checks passed!" : "❌ Some checks failed"),
  );
  process.exit(allPassed ? 0 : 1);
}

runHealthCheck();
```

**Add to `package.json`**:

```json
{
  "scripts": {
    "dev:check": "tsx scripts/check-dev-server.ts"
  }
}
```

**Usage**:

```bash
# Start dev server in one terminal:
npm run dev

# Run health check in another:
npm run dev:check
```

**Impact**: Automated verification that server is fully operational

---

## 🟢 MEDIUM PRIORITY (This Week)

### 7. Update Documentation References (30 minutes)

**Issue**: Some docs reference old port (3000) instead of current port (3001)

**Files to Check & Update**:

- `README.md`
- `START_HERE.md`
- `.github/instructions/*.md`
- `docs/*.md`

**Find & Replace**:

```bash
# Find all references:
grep -r "localhost:3000" --include="*.md"

# Replace:
# localhost:3000 → localhost:3001
# :3000 → :3001
```

**Impact**: Consistent documentation, reduces confusion

---

### 8. Add Pre-commit Hook for Type Checking (15 minutes)

**Issue**: TypeScript errors slip into commits

**File**: `.husky/pre-commit` (UPDATE)

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run lint-staged (formatting, linting)
npx lint-staged

# Run type check (exclude mobile-app)
echo "📝 Type checking..."
npm run type-check

# Only proceed if type check passes
if [ $? -ne 0 ]; then
  echo "❌ Type check failed. Fix errors before committing."
  exit 1
fi

echo "✅ Pre-commit checks passed!"
```

**Impact**: Ensures type safety before commits

---

### 9. Create Database Seed Reset Script (20 minutes)

**Issue**: No quick way to reset database to clean state

**File**: `scripts/reset-dev-db.sh` (CREATE NEW)

```bash
#!/bin/bash
# Reset Development Database to Clean State

set -e

echo "🗄️  Resetting Development Database..."

# Confirm action
read -p "⚠️  This will DELETE all data. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cancelled"
  exit 1
fi

# Drop and recreate database
echo "📥 Dropping database..."
psql -U postgres -c "DROP DATABASE IF EXISTS farmersmarket;"
psql -U postgres -c "CREATE DATABASE farmersmarket;"

# Push schema
echo "📊 Pushing Prisma schema..."
npm run db:push -- --skip-generate

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed basic data
echo "🌱 Seeding basic data..."
npm run db:seed:basic

echo "✅ Database reset complete!"
echo "🚀 Restart dev server: npm run dev"
```

**Add to `package.json`**:

```json
{
  "scripts": {
    "db:reset:dev": "bash scripts/reset-dev-db.sh"
  }
}
```

**Impact**: Quick database reset for testing

---

### 10. Add Hot Reload Verification Test (10 minutes)

**Issue**: No automated test for hot reload functionality

**File**: `scripts/test-hot-reload.ts` (CREATE NEW)

```typescript
#!/usr/bin/env tsx
/**
 * Hot Reload Test
 * Verifies that file changes trigger browser updates
 */

import fs from "fs";
import path from "path";

const TEST_FILE = path.join(process.cwd(), "src/app/page.tsx");
const TEST_MARKER = "<!-- HOT_RELOAD_TEST -->";

async function testHotReload() {
  console.log("🔥 Testing Hot Reload...\n");

  // Read original content
  const original = fs.readFileSync(TEST_FILE, "utf-8");

  // Check if dev server is running
  try {
    await fetch("http://localhost:3001/api/health");
  } catch {
    console.error("❌ Dev server not running. Start with: npm run dev");
    process.exit(1);
  }

  console.log("1️⃣  Adding test marker to page.tsx...");
  const modified = original.replace("</main>", `  ${TEST_MARKER}\n  </main>`);
  fs.writeFileSync(TEST_FILE, modified);

  console.log("2️⃣  Waiting 3 seconds for hot reload...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log("3️⃣  Restoring original content...");
  fs.writeFileSync(TEST_FILE, original);

  console.log("\n✅ Hot reload test complete!");
  console.log("💡 Check browser - page should have updated automatically");
}

testHotReload();
```

**Usage**:

```bash
# With dev server running:
tsx scripts/test-hot-reload.ts
```

**Impact**: Verify hot reload is working correctly

---

## 🔵 LOW PRIORITY (Future)

### 11. Add Performance Monitoring (1 hour)

**Goal**: Track dev server performance metrics

**Tools to Integrate**:

- Next.js build analyzer (already configured)
- Bundle size tracking
- Compilation time logging
- Memory usage monitoring

**Files to Create**:

- `scripts/monitor-dev-performance.ts`
- `scripts/analyze-bundle.ts`

---

### 12. Create Dev Server Dashboard (2 hours)

**Goal**: Visual dashboard showing dev server status

**Features**:

- Server uptime
- API response times
- Database connection status
- Hot reload events
- Build compilation times
- Memory usage graph

**Tech**: Simple Express server on port 3002

---

### 13. Add Docker Dev Environment (1 hour)

**Goal**: Containerized development for consistency

**Files to Create**:

- `docker-compose.dev.yml`
- `Dockerfile.dev`
- `.dockerignore`

**Benefits**:

- Consistent environment across machines
- No need to install PostgreSQL locally
- Easy onboarding for new developers

---

### 14. Implement Auto-Recovery (1.5 hours)

**Goal**: Automatically restart dev server on crashes

**Tool**: PM2 with ecosystem config

**File**: `ecosystem.dev.js` (CREATE NEW)

```javascript
module.exports = {
  apps: [
    {
      name: "farmers-market-dev",
      script: "npm",
      args: "run dev",
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: "10s",
      env: {
        NODE_ENV: "development",
        PORT: 3001,
      },
    },
  ],
};
```

**Usage**:

```bash
pm2 start ecosystem.dev.js
pm2 logs farmers-market-dev
```

---

## 📋 Implementation Plan

### Week 1 (Critical + High)

**Day 1** (1 hour):

- [ ] Fix API route parameter naming (30 min)
- [ ] Verify database connection (5 min)
- [ ] Clear build cache (1 min)
- [ ] Add env validation (20 min)

**Day 2** (1 hour):

- [ ] Exclude mobile app from TS check (15 min)
- [ ] Add dev server health check (15 min)
- [ ] Update documentation (30 min)

### Week 2 (Medium Priority)

**Day 3** (1 hour):

- [ ] Add pre-commit hook (15 min)
- [ ] Create database reset script (20 min)
- [ ] Add hot reload test (10 min)
- [ ] Test all changes (15 min)

### Future (Low Priority)

- Implement as needed based on team requirements
- Consider after core functionality is stable

---

## 🎯 Success Metrics

### After Implementing Critical Items:

- ✅ Zero blocking TypeScript errors
- ✅ All API endpoints functional
- ✅ Database connects on first try
- ✅ Dev server starts in <5 seconds

### After Implementing High Priority:

- ✅ Clean `npm run type-check` output
- ✅ Environment variables validated
- ✅ Automated health checks pass
- ✅ Developer onboarding <10 minutes

### After Implementing Medium Priority:

- ✅ Consistent documentation
- ✅ Pre-commit hooks prevent bad commits
- ✅ Easy database resets
- ✅ Hot reload verified automatically

---

## 🔄 Maintenance Schedule

### Daily (Before Starting Work):

```bash
git pull
npm install          # If package.json changed
npm run db:push      # If schema.prisma changed
rm -rf .next         # If experiencing issues
npm run dev
```

### Weekly:

```bash
npm run quality      # Type check + lint + format
npm run test         # Run test suite
npm outdated         # Check for updates
```

### Monthly:

```bash
npm update           # Update dependencies
npm audit            # Security check
npm run build        # Test production build
```

---

## 📞 Support & Resources

### Quick Reference:

- **Full Analysis**: `DEV_SERVER_ANALYSIS_CHECKLIST.md`
- **Quick Start**: `QUICK_START_CHECKLIST.md`
- **Project Status**: `PROJECT_STATUS.md`
- **Divine Rules**: `.cursorrules`

### Common Commands:

```bash
# Fix most issues:
rm -rf .next && npm run dev

# Reset everything:
npm run clean:all && npm install && npm run dev

# Database issues:
npm run db:push && npm run db:seed:basic

# Type errors:
npm run type-check
```

---

## ✅ Completion Checklist

Track your progress:

### Critical (Do Now)

- [ ] Fixed API route parameters
- [ ] Verified database connection
- [ ] Cleared build cache
- [ ] Tested dev server starts

### High Priority (This Week)

- [ ] Excluded mobile app from TS
- [ ] Added env validation
- [ ] Created health check script
- [ ] Tested all changes

### Medium Priority (As Needed)

- [ ] Updated documentation
- [ ] Added pre-commit hooks
- [ ] Created DB reset script
- [ ] Verified hot reload

### Low Priority (Future)

- [ ] Performance monitoring
- [ ] Dev dashboard
- [ ] Docker dev environment
- [ ] Auto-recovery system

---

**Document Version**: 1.0  
**Last Updated**: December 3, 2024  
**Status**: Ready for Implementation ✅

_"Incremental improvements lead to divine excellence"_ 🌾⚡
