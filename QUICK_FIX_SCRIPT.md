# 🚀 Quick Fix Script - Production Issues

**Last Updated:** January 2025
**Status:** Ready to Execute

---

## 🎯 Execute These Fixes in Order

### Fix #1: Admin Dashboard Prisma Error (CRITICAL)

**Issue:** Admin dashboard fails with Prisma error about unknown field 'type'

**Root Cause:** Code might be referencing wrong field or Prisma client needs regeneration

**Steps:**

```bash
# 1. Regenerate Prisma client
cd "M:\Repo\Farmers Market Platform web and app"
npx prisma generate

# 2. Verify schema is valid
npx prisma validate

# 3. Check for any 'type' references that should be 'role'
grep -r "type: true" src/app/api/admin --include="*.ts" -B5 -A5
```

**Code Fix (if needed):**

If you find any code selecting `type` from User model in admin relations, change:

```typescript
// WRONG ❌
admin: {
  select: {
    id: true,
    email: true,
    type: true,  // This field doesn't exist on User
    firstName: true,
    lastName: true,
  },
}

// CORRECT ✅
admin: {
  select: {
    id: true,
    email: true,
    role: true,  // Use 'role' instead
    firstName: true,
    lastName: true,
  },
}
```

---

### Fix #2: Missing `/orders` Route (HIGH PRIORITY)

**Create:** `src/app/orders/page.tsx`

```typescript
/**
 * Orders Route - Smart Redirect based on User Role
 * Redirects to appropriate orders page based on user authentication and role
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OrdersRedirectPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await auth();

  // If not authenticated, redirect to login
  if (!session?.user) {
    const callbackUrl = searchParams.status 
      ? `/orders?status=${searchParams.status}`
      : '/orders';
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  // Construct query string if status is provided
  const queryString = searchParams.status ? `?status=${searchParams.status}` : '';

  // Redirect based on user role
  switch (session.user.role) {
    case 'ADMIN':
      redirect(`/admin/orders${queryString}`);
    case 'FARMER':
      redirect(`/farmer/orders${queryString}`);
    case 'CONSUMER':
    default:
      redirect(`/orders${queryString}`);
  }
}
```

**Alternative Quick Fix (Middleware):**

Add to `middleware.ts`:

```typescript
// In middleware.ts, add this redirect rule
if (req.nextUrl.pathname === '/orders') {
  const session = await auth();
  if (session?.user?.role === 'FARMER') {
    return NextResponse.redirect(new URL('/farmer/orders', req.url));
  } else if (session?.user?.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin/orders', req.url));
  }
  // Default to customer orders
  return NextResponse.redirect(new URL('/customer/orders', req.url));
}
```

---

### Fix #3: Customer Dashboard 404 (HIGH PRIORITY)

**Steps:**

1. **Verify layout exists:**
```bash
# Check if layout file exists
ls -la "src/app/(customer)/layout.tsx"
```

2. **Check dashboard page export:**

Edit `src/app/(customer)/customer/dashboard/page.tsx`:

```typescript
// At the bottom of the file, ensure default export exists:
export default function CustomerDashboardPage() {
  // ... existing code
}

// NOT:
// export { CustomerDashboard as default }
```

3. **Add error boundary:**

Create `src/app/(customer)/customer/dashboard/error.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            Dashboard Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            {error.message || 'Something went wrong loading your dashboard.'}
          </p>
          {error.digest && (
            <p className="text-sm text-gray-500 mb-4">
              Error ID: {error.digest}
            </p>
          )}
          <Button onClick={reset}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

4. **Verify middleware isn't blocking:**

Check `middleware.ts` - ensure customer routes are allowed:

```typescript
// Routes that don't require auth
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/about',
  // ...
];

// Customer routes should be protected but accessible
const customerRoutes = [
  '/customer/dashboard',
  '/orders',
  // ...
];
```

---

### Fix #4: Admin Notifications 404 (HIGH PRIORITY)

**Check:** `src/app/(admin)/admin/notifications/page.tsx`

1. **Ensure proper export:**

```typescript
// At the end of the file
export default function AdminNotificationsPage() {
  // Component code
}
```

2. **Add loading state:**

Create `src/app/(admin)/admin/notifications/loading.tsx`:

```typescript
export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}
```

3. **Add error boundary:**

Create `src/app/(admin)/admin/notifications/error.tsx`:

```typescript
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto py-8">
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <h2 className="text-red-800 font-bold">Error Loading Notifications</h2>
        <p className="text-red-600">{error.message}</p>
        <button onClick={reset} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">
          Retry
        </button>
      </div>
    </div>
  )
}
```

---

### Fix #5: Settings - Failed to Save Profile (HIGH PRIORITY)

**Location:** `src/app/api/user/settings/route.ts`

**Add Enhanced Error Logging:**

```typescript
// In the PATCH handler, update error handling:

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 },
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      logger.error("Failed to parse settings request body:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "Invalid request body",
          },
        },
        { status: 400 },
      );
    }

    // Validate data
    const validatedData = SettingsSchema.parse(body);

    // Rest of the code...
    
  } catch (error) {
    // Enhanced error logging
    if (error instanceof z.ZodError) {
      logger.error("Settings validation error:", {
        userId: session?.user?.id,
        errors: error.flatten(),
        inputData: body,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid settings data",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    // Prisma errors
    if (error.code === 'P2002') {
      logger.error("Unique constraint violation in settings:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_ERROR",
            message: "Settings already exist",
          },
        },
        { status: 409 },
      );
    }

    if (error.code?.startsWith('P')) {
      logger.error("Prisma error in settings update:", {
        code: error.code,
        message: error.message,
        meta: error.meta,
      });
    }

    logger.error("Failed to update user settings:", {
      userId: session?.user?.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_SETTINGS_ERROR",
          message: error instanceof Error ? error.message : "Failed to update settings",
        },
      },
      { status: 500 },
    );
  }
}
```

**Check Prisma Schema:**

```bash
# Verify UserSettings model exists and is properly configured
npx prisma format
npx prisma validate
npx prisma generate
```

---

### Fix #6: Farm Approval Error (MEDIUM PRIORITY)

**Location:** `src/app/api/admin/farms/verify/route.ts`

**Add Enhanced Error Logging:**

```typescript
// In the POST handler, update farm update section:

try {
  const updatedFarm = await database.farm.update({
    where: { id: farmId },
    data: {
      verificationStatus: "VERIFIED" as FarmVerificationStatus,
      verifiedBy: session.user.id,
      verifiedAt: now,
      rejectionReason: null,
      status: "ACTIVE",
      updatedAt: now,
    },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  
  // Rest of success logic...
  
} catch (error) {
  logger.error("Farm verification update failed:", {
    farmId,
    action,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    code: error.code,
    meta: error.meta,
  });
  
  // Return detailed error
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "FARM_UPDATE_ERROR",
        message: error instanceof Error ? error.message : "Failed to update farm",
        details: error.code ? `Prisma error: ${error.code}` : undefined,
      },
    },
    { status: 500 },
  );
}
```

**Verify Enum Values:**

```bash
# Check that enum values match in schema
grep -A5 "enum FarmVerificationStatus" prisma/schema.prisma
grep -A5 "enum FarmStatus" prisma/schema.prisma
```

---

### Fix #7: Admin Orders Error (MEDIUM PRIORITY)

**Location:** `src/app/api/admin/orders/route.ts`

**Add Comprehensive Error Handling:**

```typescript
// In GET handler:

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const errorId = Date.now().toString();
  
  try {
    // ... existing code ...
    
    // Log performance
    const duration = Date.now() - startTime;
    if (duration > 3000) {
      logger.warn("Slow admin orders query:", { duration, errorId });
    }
    
    return NextResponse.json({ success: true, data: /* ... */ });
    
  } catch (error) {
    logger.error("Admin orders fetch failed:", {
      errorId,
      url: request.url,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code: error.code,
      duration: Date.now() - startTime,
    });
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ORDERS_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch orders",
          errorId,
        },
      },
      { status: 500 },
    );
  }
}
```

---

## 🔄 Full Deployment Process

```bash
# 1. Navigate to project
cd "M:\Repo\Farmers Market Platform web and app"

# 2. Create a new branch
git checkout -b fix/production-issues

# 3. Apply all fixes above

# 4. Regenerate Prisma client
npx prisma generate

# 5. Validate everything
npx prisma validate
npm run lint
npm run type-check

# 6. Build locally to test
npm run build

# 7. Commit changes
git add .
git commit -m "fix: critical production issues

- Fix Prisma field references in admin analytics
- Add missing /orders redirect route
- Fix customer dashboard 404
- Fix admin notifications 404
- Enhanced error handling for settings API
- Enhanced error handling for farm verification
- Enhanced error handling for admin orders

Issues resolved:
- Admin dashboard Prisma error
- Missing routes (orders, customer/dashboard, admin/notifications)
- Settings save failure
- Farm approval errors
- Admin orders error (ID: 2958323098)"

# 8. Push to GitHub
git push origin fix/production-issues

# 9. Create pull request and merge

# 10. Deploy to production
git checkout main
git pull origin main
git push origin main

# Vercel will auto-deploy
```

---

## 🧪 Testing Checklist

After deployment, test these URLs:

- [ ] `https://farmers-market-platform.vercel.app/admin` - Admin dashboard loads
- [ ] `https://farmers-market-platform.vercel.app/orders?status=PROCESSING` - Redirects properly
- [ ] `https://farmers-market-platform.vercel.app/customer/dashboard` - Dashboard loads
- [ ] `https://farmers-market-platform.vercel.app/admin/notifications` - Notifications load
- [ ] `https://farmers-market-platform.vercel.app/settings` - Can save profile
- [ ] `https://farmers-market-platform.vercel.app/admin/farms` - Can approve farms
- [ ] `https://farmers-market-platform.vercel.app/admin/orders` - Orders list loads

---

## 📊 Monitoring After Deployment

1. **Check Vercel Logs:**
   ```
   https://vercel.com/[your-org]/farmers-market-platform/logs
   ```

2. **Check Sentry for Errors:**
   ```
   Filter by last 1 hour, check for new errors
   ```

3. **Test Each Endpoint:**
   Use the testing checklist above

4. **Monitor Performance:**
   Check response times for affected endpoints

---

## 🆘 Rollback Plan

If issues persist:

```bash
# 1. Revert the deployment in Vercel dashboard
# OR

# 2. Revert the git commit
git revert HEAD
git push origin main

# 3. Notify team
# 4. Investigate logs
# 5. Apply fixes
# 6. Redeploy
```

---

## 📞 Support

If issues persist after applying these fixes:

1. Check Vercel deployment logs
2. Check Sentry error tracking
3. Check database connection and schema
4. Verify environment variables are set correctly
5. Run `npx prisma migrate status` to check migrations

---

**End of Quick Fix Script**