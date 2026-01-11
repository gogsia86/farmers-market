# Production Bugs Analysis & Fix Plan

**Date:** 2025
**Environment:** Production (Vercel)
**Status:** Critical Issues Identified

---

## 🚨 Critical Issues Summary

| Issue | Severity | Route | Status |
|-------|----------|-------|--------|
| Prisma Schema Mismatch | **CRITICAL** | `/admin` | Blocking admin dashboard |
| Missing Routes | **HIGH** | `/orders?status=PROCESSING` | 404 |
| Missing Routes | **HIGH** | `/customer/dashboard` | 404 |
| Settings API Error | **HIGH** | `/settings` | Profile save failing |
| Farm Approval Error | **MEDIUM** | `/admin/farms` | Prisma validation |
| Admin Orders Error | **MEDIUM** | `/admin/orders` | Error ID: 2958323098 |

---

## 📋 Issue Details & Fixes

### Issue #1: Admin Dashboard - Prisma Field Error ⚠️ CRITICAL

**Error Message:**
```
Invalid `prisma.adminAction.findMany()` invocation
Unknown field `type` for select statement on model `User`
```

**Root Cause:**
The analytics API is trying to select `type` from the User model, but the correct field name is `role`.

**Location:** `src/app/api/admin/analytics/route.ts:173`

**Current Code (BROKEN):**
```typescript
database.adminAction.findMany({
  take: 20,
  orderBy: { createdAt: "desc" },
  include: {
    admin: {
      select: {
        id: true,
        email: true,
        type: true,  // ❌ WRONG - This field doesn't exist
        firstName: true,
        lastName: true,
      },
    },
  },
})
```

**Fix:**
```typescript
database.adminAction.findMany({
  take: 20,
  orderBy: { createdAt: "desc" },
  include: {
    admin: {
      select: {
        id: true,
        email: true,
        role: true,  // ✅ CORRECT - Use 'role' instead of 'type'
        firstName: true,
        lastName: true,
      },
    },
  },
})
```

**Impact:** Admin dashboard completely broken, cannot load analytics

**Priority:** P0 - Fix immediately

---

### Issue #2: Missing Route - Orders with Status Filter ⚠️ HIGH

**URL:** `https://farmers-market-platform.vercel.app/orders?status=PROCESSING`
**Status:** 404

**Root Cause:**
The route `/orders` doesn't exist at the root level. Orders are nested under customer/farmer routes.

**Available Routes:**
- `/(customer)/orders` - Customer orders page
- `/(farmer)/farmer/orders` - Farmer orders page
- `/api/orders` - API endpoint

**Fix Options:**

1. **Redirect to customer orders (Recommended):**
   Create a redirect in middleware or create a root orders page that checks user role:

   ```typescript
   // src/app/orders/page.tsx
   import { auth } from "@/lib/auth";
   import { redirect } from "next/navigation";

   export default async function OrdersRedirect() {
     const session = await auth();
     
     if (!session?.user) {
       redirect("/login?callbackUrl=/orders");
     }
     
     // Redirect based on role
     if (session.user.role === "FARMER") {
       redirect("/farmer/orders");
     } else if (session.user.role === "ADMIN") {
       redirect("/admin/orders");
     } else {
       redirect("/customer/orders");
     }
   }
   ```

2. **Update links across the application:**
   Search for hardcoded `/orders` links and update them to use the proper route based on user role.

**Priority:** P1 - Fix within 24 hours

---

### Issue #3: Missing Route - Customer Dashboard ⚠️ HIGH

**URL:** `https://farmers-market-platform.vercel.app/customer/dashboard`
**Status:** 404

**Root Cause:**
The customer dashboard exists but there might be an issue with the route structure or middleware.

**Investigation:**
- Route exists at: `src/app/(customer)/customer/dashboard/page.tsx`
- Need to check if middleware is blocking or if there's a layout issue

**Possible Causes:**
1. Middleware authentication blocking the route
2. Missing layout file in the route group
3. Server-side error causing 404 instead of proper error page

**Fix:**
1. Check middleware configuration:
   ```typescript
   // middleware.ts
   export const config = {
     matcher: [
       '/((?!api|_next/static|_next/image|favicon.ico).*)',
     ],
   }
   ```

2. Verify layout exists:
   - Check `src/app/(customer)/layout.tsx` exists
   - Ensure proper exports

3. Add error boundary:
   ```typescript
   // src/app/(customer)/customer/dashboard/error.tsx
   'use client'
   
   export default function Error({ error, reset }) {
     return (
       <div>
         <h2>Dashboard Error</h2>
         <p>{error.message}</p>
         <button onClick={reset}>Try again</button>
       </div>
     )
   }
   ```

**Priority:** P1 - Fix within 24 hours

---

### Issue #4: Admin Notifications 404 ⚠️ HIGH

**URL:** `https://farmers-market-platform-oboizb3yt-gogsias-projects.vercel.app/admin/notifications`
**Status:** 404

**Root Cause:**
The page exists at `src/app/(admin)/admin/notifications/page.tsx` but returns 404.

**Investigation Needed:**
1. Check if page component is properly exported
2. Verify middleware isn't blocking the route
3. Check if there's a server-side error

**Fix:**
```typescript
// src/app/(admin)/admin/notifications/page.tsx
// Ensure proper default export
export default function AdminNotificationsPage() {
  // Component code
}

// Or if using named export, add:
// export { AdminNotificationsPage as default }
```

**Priority:** P1 - Fix within 24 hours

---

### Issue #5: Farm Approval - Invalid Prisma Error ⚠️ MEDIUM

**Error Message:** "invalid prisma farm, investigate"

**Location:** `src/app/api/admin/farms/verify/route.ts`

**Possible Causes:**
1. **Prisma schema mismatch:** Farm model fields don't match database
2. **Missing required fields:** Trying to update fields that don't exist
3. **Type mismatch:** Enum values not matching schema

**Investigation:**
Check the Prisma schema for Farm model and compare with the verification update:

```typescript
// Current code in verify/route.ts
await database.farm.update({
  where: { id: farmId },
  data: {
    verificationStatus: "VERIFIED" as FarmVerificationStatus,
    verifiedBy: session.user.id,
    verifiedAt: now,
    rejectionReason: null,
    status: "ACTIVE",
    updatedAt: now,
  },
})
```

**Potential Issues:**
1. `verificationStatus` enum values might be different in database
2. `verifiedBy` might need to be nullable or have different type
3. Foreign key constraints might be failing

**Fix Steps:**
1. Run Prisma introspection to check schema:
   ```bash
   npx prisma db pull
   npx prisma generate
   ```

2. Compare schema with code and fix mismatches

3. Add detailed error logging:
   ```typescript
   try {
     const updatedFarm = await database.farm.update({...});
   } catch (error) {
     logger.error("Farm verification failed:", {
       error: error instanceof Error ? error.message : String(error),
       stack: error instanceof Error ? error.stack : undefined,
       farmId,
       action,
     });
     throw error;
   }
   ```

**Priority:** P2 - Fix within 48 hours

---

### Issue #6: Admin Orders Error ⚠️ MEDIUM

**Error:** "Admin Dashboard Issue, Error ID: 2958323098"
**Location:** `/admin/orders`

**Investigation Steps:**

1. **Check Sentry/logs for Error ID 2958323098:**
   ```bash
   # Search logs
   grep -r "2958323098" logs/
   ```

2. **Common causes:**
   - Prisma query timeout
   - Missing include relations
   - Null reference errors
   - Type mismatches

3. **Review the orders route:**
   - Check `src/app/api/admin/orders/route.ts`
   - Verify all Prisma relations exist
   - Check for pagination issues

**Temporary Fix:**
Add comprehensive error handling:

```typescript
export async function GET(request: NextRequest) {
  try {
    // ... existing code
  } catch (error) {
    logger.error("Admin orders fetch failed:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
    });
    
    return NextResponse.json({
      success: false,
      error: {
        code: "FETCH_ORDERS_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        errorId: Date.now().toString(),
      },
    }, { status: 500 });
  }
}
```

**Priority:** P2 - Fix within 48 hours

---

### Issue #7: Settings - Failed to Save Profile ⚠️ HIGH

**Error:** "Failed to save profile"
**Location:** `/settings` or `/api/user/settings`

**Possible Causes:**
1. **Validation error:** Data doesn't match schema
2. **Database constraint:** Unique constraint or foreign key violation
3. **Prisma relation error:** UserSettings relation not properly configured
4. **Missing fields:** Required fields not being sent

**Investigation:**
Check the settings API at `src/app/api/user/settings/route.ts:145`

**Common Issues:**

1. **UserSettings relation issue:**
   ```typescript
   // Schema should have:
   model User {
     id           String        @id @default(cuid())
     // ...
     userSettings UserSettings?
   }
   
   model UserSettings {
     id     String @id @default(cuid())
     userId String @unique
     user   User   @relation(fields: [userId], references: [id])
     // ...
   }
   ```

2. **Validation schema too strict:**
   Review `SettingsSchema` validation and make optional fields truly optional

**Fix:**
1. Add detailed error logging:
   ```typescript
   catch (error) {
     if (error instanceof z.ZodError) {
       logger.error("Settings validation failed:", error.flatten());
     } else if (error.code === 'P2002') {
       logger.error("Unique constraint failed:", error);
     }
     // ... rest of error handling
   }
   ```

2. Check Prisma schema matches:
   ```bash
   npx prisma validate
   npx prisma format
   ```

3. Test with minimal payload:
   ```typescript
   // Test with just one field
   PATCH /api/user/settings
   { "theme": "dark" }
   ```

**Priority:** P1 - Fix within 24 hours

---

## 🔧 Immediate Action Plan

### Phase 1: Critical Fixes (Today)
1. **Fix Admin Dashboard Prisma Error (Issue #1)**
   - [ ] Update `src/app/api/admin/analytics/route.ts` line 173
   - [ ] Change `type: true` to `role: true`
   - [ ] Test admin dashboard loads
   - [ ] Deploy to production

### Phase 2: High Priority Routes (24 hours)
2. **Fix Missing Routes (Issues #2, #3, #4)**
   - [ ] Create `/orders` redirect page
   - [ ] Debug customer dashboard 404
   - [ ] Fix admin notifications route
   - [ ] Test all routes
   - [ ] Deploy to production

3. **Fix Settings API (Issue #7)**
   - [ ] Add error logging
   - [ ] Test with minimal payload
   - [ ] Validate Prisma schema
   - [ ] Deploy to production

### Phase 3: Medium Priority (48 hours)
4. **Fix Farm Approval (Issue #5)**
   - [ ] Run Prisma introspection
   - [ ] Add error logging
   - [ ] Test farm approval flow
   - [ ] Deploy to production

5. **Fix Admin Orders Error (Issue #6)**
   - [ ] Find error in logs
   - [ ] Add comprehensive error handling
   - [ ] Test orders page
   - [ ] Deploy to production

---

## 🧪 Testing Checklist

Before deploying each fix:
- [ ] Local testing passes
- [ ] Prisma schema validated
- [ ] TypeScript compilation successful
- [ ] No new linting errors
- [ ] Error handling added
- [ ] Logging implemented
- [ ] Tested in preview deployment
- [ ] Verified in production

---

## 📊 Monitoring

After deployment, monitor:
1. **Error rates** in Sentry
2. **API response times** for affected endpoints
3. **User reports** for remaining issues
4. **Database query performance**

---

## 🔍 Root Cause Analysis

**Why did these issues occur?**

1. **Schema inconsistencies:** Code references fields that don't match Prisma schema
2. **Missing route structure:** Incomplete route implementation
3. **Insufficient error handling:** Errors not properly caught and logged
4. **Testing gaps:** Missing integration tests for these flows

**Prevention measures:**
1. Add Prisma schema validation to CI/CD
2. Implement integration tests for critical paths
3. Add route existence tests
4. Improve error logging and monitoring
5. Regular schema audits

---

## 📝 Notes

- All issues are in production environment
- Database schema may have drifted from code
- Need to run migrations in production after validation
- Consider running `prisma migrate diff` to check for schema drift

---

## 🚀 Quick Fix Commands

```bash
# 1. Fix admin dashboard (Issue #1)
# Edit file: src/app/api/admin/analytics/route.ts
# Change line 173: type: true → role: true

# 2. Validate Prisma schema
npx prisma validate
npx prisma format
npx prisma generate

# 3. Check for schema drift
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script

# 4. Deploy
git add .
git commit -m "fix: production bugs - prisma schema mismatches and missing routes"
git push origin main

# 5. Monitor
# Check Vercel deployment logs
# Check Sentry for errors
```

---

**Last Updated:** 2025
**Next Review:** After all fixes deployed