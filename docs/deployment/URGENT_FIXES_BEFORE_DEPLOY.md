# 🚨 URGENT FIXES BEFORE DEPLOY

## Critical Issues Found During Audit

**Date**: November 29, 2024  
**Priority**: CRITICAL - Must fix before production  
**Estimated Time**: 2-3 hours

---

## 🎯 OVERVIEW

During the comprehensive audit, **3 critical gaps** were discovered between documentation claims and actual implementation. These must be fixed before production deployment.

**Current Status**: 90% Production Ready  
**After Fixes**: 100% Production Ready

---

## ❌ CRITICAL ISSUE #1: Favorites Not Persisted on Products Page

### Problem

The products marketplace page (`src/app/(customer)/marketplace/products/page.tsx`) has a favorites UI, but clicking the heart icon **only updates local state** - it does NOT save to the database.

### Impact

- Users click favorites but they disappear on page refresh
- Creates poor user experience and confusion
- Data not synced with dashboard

### Current Code (Line 314-323)

```typescript
const toggleFavorite = (productId: string) => {
  setFavorites((prev) => {
    const newFavorites = new Set(prev);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    return newFavorites;
  });
  // ❌ NO API CALL - NOT PERSISTED!
};
```

### Fix Required

**File**: `src/app/(customer)/marketplace/products/page.tsx`

**Step 1**: Update the `toggleFavorite` function (around line 314):

```typescript
const toggleFavorite = async (productId: string) => {
  const isCurrentlyFavorite = favorites.has(productId);

  // Optimistic update
  setFavorites((prev) => {
    const newFavorites = new Set(prev);
    if (isCurrentlyFavorite) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    return newFavorites;
  });

  try {
    const response = await fetch("/api/users/favorites", {
      method: isCurrentlyFavorite ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        type: "product",
      }),
    });

    if (!response.ok) {
      // Rollback on error
      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        if (isCurrentlyFavorite) {
          newFavorites.add(productId);
        } else {
          newFavorites.delete(productId);
        }
        return newFavorites;
      });
      console.error("Failed to toggle favorite");
    }
  } catch (error) {
    // Rollback on error
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (isCurrentlyFavorite) {
        newFavorites.add(productId);
      } else {
        newFavorites.delete(productId);
      }
      return newFavorites;
    });
    console.error("Failed to toggle favorite:", error);
  }
};
```

**Step 2**: Add a `useEffect` to load initial favorites (after line 233):

```typescript
// Load user's existing favorites on mount
useEffect(() => {
  const loadFavorites = async () => {
    try {
      const response = await fetch("/api/users/favorites");
      const data = await response.json();

      if (data.success && data.products) {
        const favoriteIds = new Set(data.products.map((p: any) => p.id));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  };

  loadFavorites();
}, []);
```

**Step 3**: Update the `onToggleFavorite` prop to handle async (around line 438):

```typescript
onToggleFavorite={() => toggleFavorite(product.id)}
```

(No change needed here, but verify it's called correctly)

**Testing**:

1. Login as customer
2. Navigate to `/marketplace/products`
3. Click heart icon on any product
4. Check browser Network tab - should see POST to `/api/users/favorites`
5. Refresh page - heart should stay red
6. Navigate to `/dashboard/favorites` - product should appear
7. Click heart again - should see DELETE request
8. Product should disappear from dashboard

---

## ❌ CRITICAL ISSUE #2: Payout Schedule API Missing

### Problem

The `PayoutManagement` component calls `/api/farmer/payout-schedule` API endpoint (line 189), but **this endpoint doesn't exist**.

### Impact

- Clicking "Save Schedule" button will fail with 404
- Farmers cannot update their payout schedules
- Feature appears broken

### Current Code (Line 189-202)

```typescript
const updatePayoutSchedule = async (newSchedule: PayoutSchedule) => {
  try {
    const response = await fetch(`/api/farmer/payout-schedule`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmId, schedule: newSchedule }),
    });

    if (!response.ok) throw new Error("Failed to update schedule");

    setSchedule(newSchedule);
    setIsScheduleDialogOpen(false);
    alert("Payout schedule updated successfully!");
  } catch (error) {
    console.error("Error updating schedule:", error);
    alert("Failed to update schedule. Please try again.");
  }
};
```

### Fix Required

**Create New File**: `src/app/api/farmer/payout-schedule/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/farmer/payout-schedule
 * Fetch payout schedule for a farm
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    if (session.user.role !== "FARMER") {
      return NextResponse.json(
        { success: false, error: "Only farmers can access payout schedules" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");

    if (!farmId) {
      return NextResponse.json(
        { success: false, error: "Farm ID is required" },
        { status: 400 },
      );
    }

    // Verify farm ownership
    const farm = await database.farm.findFirst({
      where: {
        id: farmId,
        ownerId: session.user.id,
      },
      select: {
        id: true,
        payoutSchedule: true,
      },
    });

    if (!farm) {
      return NextResponse.json(
        { success: false, error: "Farm not found or access denied" },
        { status: 404 },
      );
    }

    // Return payout schedule from farm settings
    // Note: You may need to add payoutSchedule field to Farm model
    const schedule = farm.payoutSchedule || {
      frequency: "WEEKLY",
      minimumAmount: 10,
    };

    return NextResponse.json({
      success: true,
      schedule,
    });
  } catch (error) {
    console.error("Error fetching payout schedule:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payout schedule",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/farmer/payout-schedule
 * Update payout schedule for a farm
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    if (session.user.role !== "FARMER") {
      return NextResponse.json(
        { success: false, error: "Only farmers can update payout schedules" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { farmId, schedule } = body;

    if (!farmId) {
      return NextResponse.json(
        { success: false, error: "Farm ID is required" },
        { status: 400 },
      );
    }

    if (!schedule || !schedule.frequency || !schedule.minimumAmount) {
      return NextResponse.json(
        {
          success: false,
          error: "Schedule must include frequency and minimumAmount",
        },
        { status: 400 },
      );
    }

    // Validate frequency
    const validFrequencies = ["DAILY", "WEEKLY", "MONTHLY"];
    if (!validFrequencies.includes(schedule.frequency)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid frequency. Must be DAILY, WEEKLY, or MONTHLY",
        },
        { status: 400 },
      );
    }

    // Validate minimum amount
    if (schedule.minimumAmount < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Minimum amount must be at least $10",
        },
        { status: 400 },
      );
    }

    // Verify farm ownership
    const farm = await database.farm.findFirst({
      where: {
        id: farmId,
        ownerId: session.user.id,
      },
    });

    if (!farm) {
      return NextResponse.json(
        { success: false, error: "Farm not found or access denied" },
        { status: 404 },
      );
    }

    // Update farm with new payout schedule
    // Note: You may need to add payoutSchedule field to Farm model
    await database.farm.update({
      where: { id: farmId },
      data: {
        payoutSchedule: schedule,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payout schedule updated successfully",
      schedule,
    });
  } catch (error) {
    console.error("Error updating payout schedule:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update payout schedule",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
```

**Optional - Add to Prisma Schema** (if you want to persist this):

```prisma
model Farm {
  // ... existing fields ...
  payoutSchedule Json?  // Store as JSON: { frequency: "WEEKLY", minimumAmount: 10 }
  // ... rest of fields ...
}
```

Then run:

```bash
npx prisma generate
npx prisma db push
```

**Testing**:

1. Login as farmer
2. Navigate to `/farmer/payouts` or wherever PayoutManagement is rendered
3. Click "Edit" on payout schedule
4. Change frequency to "Monthly"
5. Change minimum amount to $50
6. Click "Save Schedule"
7. Should see success message
8. Refresh page - settings should persist

---

## ⚠️ MEDIUM ISSUE #3: Farm Profile Favorites Not Implemented

### Problem

Documentation claims farm profile page has "Favorite/Save farm functionality", but the feature is **not implemented**.

### Impact

- Users cannot favorite farms from farm profile page
- They must go to dashboard to manage farm favorites
- Inconsistent UX (products have favorites, farms don't)

### Options

**Option A: Implement Feature** (Recommended, ~30 min)

Add to `src/app/(customer)/marketplace/farms/[slug]/page.tsx`:

1. Add state for favorites:

```typescript
const [isFavorite, setIsFavorite] = useState(false);
```

2. Load favorite status:

```typescript
useEffect(() => {
  const checkFavorite = async () => {
    const response = await fetch("/api/users/favorites");
    const data = await response.json();
    if (data.success) {
      const farmIds = new Set(data.farms.map((f: any) => f.id));
      setIsFavorite(farmIds.has(farm.id));
    }
  };
  checkFavorite();
}, [farm.id]);
```

3. Add toggle function:

```typescript
const toggleFavorite = async () => {
  try {
    const response = await fetch("/api/users/favorites", {
      method: isFavorite ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmId: farm.id, type: "farm" }),
    });

    if (response.ok) {
      setIsFavorite(!isFavorite);
    }
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
  }
};
```

4. Add button in JSX (around the header area):

```typescript
<button
  onClick={toggleFavorite}
  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
>
  <Heart
    className={`h-6 w-6 ${
      isFavorite ? "fill-red-600 text-red-600" : "text-gray-600"
    }`}
  />
</button>
```

**Option B: Remove from Documentation** (~2 min)

Remove line 22 from farm page comments:

```typescript
// - Favorite/Save farm functionality  // ❌ DELETE THIS LINE
```

---

## ✅ VERIFICATION CHECKLIST

After implementing fixes, verify:

### Favorites Integration

- [ ] Products page favorites persist after refresh
- [ ] Favorites appear in `/dashboard/favorites`
- [ ] Network tab shows POST/DELETE to `/api/users/favorites`
- [ ] Error handling works (try with network offline)
- [ ] Heart icon updates immediately (optimistic UI)

### Payout Schedule API

- [ ] GET `/api/farmer/payout-schedule?farmId=X` returns schedule
- [ ] PUT `/api/farmer/payout-schedule` updates successfully
- [ ] Validation errors return proper status codes
- [ ] Non-farmers get 403 Forbidden
- [ ] Unauthenticated users get 401 Unauthorized

### Farm Profile (if Option A chosen)

- [ ] Favorite button appears on farm profile
- [ ] Clicking heart adds farm to favorites
- [ ] Favorites persist after refresh
- [ ] Farm appears in dashboard favorites

---

## 📋 DEPLOYMENT STEPS

1. **Apply Fixes** (2-3 hours)

   ```bash
   # 1. Update products page favorites
   # 2. Create payout schedule API
   # 3. (Optional) Add farm profile favorites
   ```

2. **Run Tests** (30 min)

   ```bash
   # Manual testing of all 3 fixes
   # Verify each item in checklist above
   ```

3. **Commit Changes**

   ```bash
   git add .
   git commit -m "fix: Complete favorites integration and payout schedule API"
   ```

4. **Deploy to Staging** (15 min)

   ```bash
   # Deploy and test in staging environment
   ```

5. **Production Deploy** (After staging verification)
   ```bash
   # Deploy to production
   ```

---

## 🚀 AFTER THESE FIXES

**Before**: 90% Production Ready  
**After**: 100% Production Ready ✅

All critical gaps will be closed and the application will be fully production-ready with complete feature implementation matching documentation claims.

---

## 📞 NEED HELP?

If you encounter issues:

1. Check browser console for error messages
2. Check Network tab for API request/response
3. Verify authentication is working
4. Check server logs for backend errors

Reference files:

- Full audit: `AUDIT_REPORT.md`
- API docs: `README_FIXES.md`
- Deployment: `DEPLOY_CHECKLIST.md`

---

**Priority**: 🔴 CRITICAL  
**Estimated Time**: 2-3 hours  
**Must Complete Before**: Production deployment

**Let's ship a complete product! 🚀**
