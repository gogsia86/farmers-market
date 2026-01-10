# 🐛 Production Bugs - Comprehensive Fix Plan

**Date:** January 10, 2025  
**Priority:** 🔴 **CRITICAL** - Multiple production issues affecting core functionality  
**Status:** 📋 Analysis Complete - Ready for Implementation

---

## 📊 Executive Summary

**Total Issues Found:** 10  
**Critical (P0):** 4 issues - Block core user flows  
**High (P1):** 3 issues - Missing pages/features  
**Medium (P2):** 3 issues - Data/UX improvements

**Estimated Fix Time:** 2-3 hours  
**Deployment Strategy:** Single comprehensive fix commit

---

## 🔴 CRITICAL ISSUES (P0) - Fix Immediately

### 1. 🛒 Product Pages - Shopping Experience Error

**URL:** https://farmers-market-platform.vercel.app/products/cherry-tomatoes  
**Issue:** All product detail pages throw "Shopping Experience Interrupted" error  
**Impact:** ❌ **BLOCKS ALL PURCHASES** - Users cannot view products or add to cart  
**Error ID:** 570256176

**Root Cause Analysis:**
- Likely a data fetching error in product detail page
- Could be missing product data, relations, or invalid query
- Might be cart/favorites loading issue

**Files to Check:**
```
src/app/(customer)/products/[slug]/page.tsx
src/lib/services/product.service.ts
src/app/(customer)/products/[slug]/error.tsx
```

**Fix Strategy:**
1. Add try-catch error handling with detailed logging
2. Check for missing product relations in Prisma query
3. Validate product data exists before rendering
4. Add fallback UI for missing data
5. Fix cart/favorites initialization

**Expected Fix:**
```typescript
// src/app/(customer)/products/[slug]/page.tsx
export default async function ProductPage({ params }: { params: { slug: string } }) {
  try {
    const product = await productService.getProductBySlug(params.slug, {
      include: {
        farm: { include: { owner: true } },
        category: true,
        reviews: { take: 5, include: { user: true } },
        inventory: true
      }
    });

    if (!product) {
      notFound();
    }

    return <ProductDetail product={product} />;
  } catch (error) {
    console.error('Product page error:', error);
    throw error; // Let error boundary handle it
  }
}
```

---

### 2. 📝 Register Form - Name Field Blocks Spaces

**URL:** https://farmers-market-platform.vercel.app/register  
**Issue:** Full name input doesn't allow space character  
**Impact:** ❌ **BLOCKS NEW USER REGISTRATION** - Users cannot enter first + last name  

**Root Cause:**
- Input validation or regex pattern blocking spaces
- Likely in client-side form component

**Files to Check:**
```
src/app/(auth)/register/page.tsx
src/components/auth/RegisterForm.tsx (if exists)
```

**Fix Strategy:**
```typescript
// WRONG (current):
<input
  type="text"
  pattern="[A-Za-z]+"  // ❌ Blocks spaces
  onChange={(e) => e.target.value.replace(/[^A-Za-z]/g, '')}  // ❌ Removes spaces
/>

// CORRECT (fix):
<input
  type="text"
  pattern="[A-Za-z\s]+"  // ✅ Allows letters and spaces
  minLength={2}
  maxLength={100}
  onChange={(e) => {
    // Allow letters, spaces, hyphens, apostrophes
    const cleaned = e.target.value.replace(/[^A-Za-z\s\-']/g, '');
    e.target.value = cleaned;
  }}
/>
```

**Validation Schema Fix:**
```typescript
// Zod schema for name validation
export const RegisterSchema = z.object({
  fullName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .regex(/^[A-Za-z\s\-']+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
    .refine(val => val.trim().includes(' '), "Please enter your full name (first and last)")
});
```

---

### 3. 🚪 Sign Out - Wrong Redirect URL

**Issue:** Sign out redirects to deployment URL instead of custom domain  
**Redirect:** `https://farmers-market-platform-4clvahg9p-gogsias-projects.vercel.app/`  
**Expected:** `https://farmers-market-platform.vercel.app/`  
**Impact:** ❌ **CONFUSING UX** - Users see technical deployment URL

**Root Cause:**
- NextAuth callback using deployment URL instead of production domain
- Missing environment variable or incorrect auth configuration

**Files to Check:**
```
src/lib/auth/index.ts
src/app/api/auth/[...nextauth]/route.ts
.env.production (Vercel environment variables)
```

**Fix Strategy:**
```typescript
// src/lib/auth/index.ts
export const authOptions: NextAuthOptions = {
  // ... other config
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Always use production domain
      const productionUrl = process.env.NEXTAUTH_URL || 'https://farmers-market-platform.vercel.app';
      
      // If url starts with '/', prepend production domain
      if (url.startsWith('/')) {
        return `${productionUrl}${url}`;
      }
      
      // If url is on same origin, allow it
      if (new URL(url).origin === productionUrl) {
        return url;
      }
      
      // Default to home page
      return productionUrl;
    }
  }
};
```

**Environment Variables (Vercel Dashboard):**
```bash
NEXTAUTH_URL=https://farmers-market-platform.vercel.app
NEXTAUTH_URL_INTERNAL=https://farmers-market-platform.vercel.app
NEXT_PUBLIC_APP_URL=https://farmers-market-platform.vercel.app
```

---

### 4. ⚙️ Settings Page - Failed to Save

**URL:** https://farmers-market-platform.vercel.app/settings  
**Issue:** "Failed to save settings" error on save attempt  
**Impact:** ❌ **BLOCKS USER PREFERENCES** - Cannot update profile/notifications

**Root Cause:**
- Server action failing
- Database constraint violation
- Missing authentication check
- Invalid form data

**Files to Check:**
```
src/app/(customer)/settings/page.tsx
src/app/actions/user.actions.ts (or settings.actions.ts)
src/lib/services/user.service.ts
```

**Fix Strategy:**
1. Add proper error handling in server action
2. Validate user authentication
3. Check database constraints (unique email, etc.)
4. Add detailed error logging
5. Return user-friendly error messages

**Expected Fix:**
```typescript
// src/app/actions/settings.actions.ts
"use server";

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SettingsSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean()
  })
});

export async function updateSettings(formData: FormData) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Parse and validate
    const data = SettingsSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      notifications: {
        email: formData.get("emailNotifications") === "on",
        sms: formData.get("smsNotifications") === "on"
      }
    });

    // Check email uniqueness
    if (data.email !== session.user.email) {
      const existing = await database.user.findUnique({
        where: { email: data.email }
      });
      if (existing) {
        return { success: false, error: "Email already in use" };
      }
    }

    // Update user
    await database.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        emailNotifications: data.notifications.email,
        smsNotifications: data.notifications.sms
      }
    });

    revalidatePath("/settings");
    return { success: true, message: "Settings updated successfully" };

  } catch (error) {
    console.error("Settings update error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid form data", details: error.errors };
    }
    return { success: false, error: "Failed to update settings. Please try again." };
  }
}
```

---

## 🟡 HIGH PRIORITY (P1) - Missing Pages

### 5. 📬 Admin Notifications - 404

**URL:** https://farmers-market-platform.vercel.app/admin/notifications  
**Issue:** Page doesn't exist  
**Impact:** Admins cannot manage platform notifications

**Fix:** Create admin notifications page
```
src/app/(admin)/admin/notifications/page.tsx
```

**Quick Implementation:**
```typescript
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { redirect } from "next/navigation";

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');

  const notifications = await database.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: true }
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      {/* Add notification list UI */}
    </div>
  );
}
```

---

### 6. 📦 Admin Orders - 404

**URL:** https://farmers-market-platform.vercel.app/admin/orders  
**Issue:** Page doesn't exist  
**Impact:** Admins cannot view/manage all orders

**Fix:** Create admin orders page
```
src/app/(admin)/admin/orders/page.tsx
```

**Quick Implementation:**
```typescript
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { redirect } from "next/navigation";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');

  const orders = await database.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      items: { include: { product: true } }
    },
    take: 100
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">All Orders</h1>
      {/* Add orders table UI */}
    </div>
  );
}
```

---

### 7. 🚚 Shipping Page - 404

**URL:** https://farmers-market-platform.vercel.app/shipping  
**Issue:** Page doesn't exist (linked from footer)  
**Impact:** Users cannot view shipping information

**Fix:** Create shipping information page
```
src/app/(customer)/shipping/page.tsx
```

**Quick Implementation:**
```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Information | Farmers Market",
  description: "Learn about our shipping policies and delivery options"
};

export default function ShippingPage() {
  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Shipping Information</h1>
      
      <div className="prose max-w-none">
        <h2>Delivery Options</h2>
        <ul>
          <li><strong>Farm Pickup:</strong> Free - Pick up directly from the farm</li>
          <li><strong>Local Delivery:</strong> $5-15 - Within 20 miles of farm</li>
          <li><strong>Standard Shipping:</strong> $10-25 - 3-5 business days</li>
        </ul>

        <h2>Shipping Policy</h2>
        <p>All perishable items are shipped with appropriate cooling methods...</p>

        <h2>Delivery Areas</h2>
        <p>We currently deliver to the following states...</p>
      </div>
    </div>
  );
}
```

---

## 🟢 MEDIUM PRIORITY (P2) - Data & UX Issues

### 8. 👥 Admin Users - Shows 0 Users

**URL:** https://farmers-market-platform.vercel.app/admin/users  
**Issue:** Displays "0" for all user counts despite having users  
**Impact:** Admin cannot see actual user statistics

**Root Cause:**
- Query returning empty results
- Wrong database table or relation
- Missing data aggregation

**Files to Check:**
```
src/app/(admin)/admin/users/page.tsx
src/lib/services/user.service.ts
```

**Fix Strategy:**
```typescript
// Correct user count query
const [totalUsers, activeUsers, farmers, consumers] = await Promise.all([
  database.user.count(),
  database.user.count({ where: { status: 'ACTIVE' } }),
  database.user.count({ where: { role: 'FARMER' } }),
  database.user.count({ where: { role: 'CUSTOMER' } })
]);
```

---

### 9. 👨‍💼 Admin Dashboard - Generic Error

**URL:** https://farmers-market-platform.vercel.app/admin  
**Issue:** "We encountered an issue with the admin dashboard"  
**Impact:** Admin cannot access main dashboard

**Root Cause:**
- Data fetching error
- Missing authentication
- Database query failure

**Files to Check:**
```
src/app/(admin)/admin/page.tsx
```

**Fix Strategy:**
1. Add detailed error logging
2. Check authentication properly
3. Add fallback UI for missing data
4. Validate all database queries
5. Add error boundary with specific error messages

---

### 10. 🔗 Footer Links - Various 404s

**Issue:** Multiple footer links lead to non-existent pages  
**Impact:** Poor UX, broken navigation

**Missing Pages to Create:**
- `/shipping` (covered in #7)
- `/privacy` (if missing)
- `/terms` (if missing)
- `/returns` (if missing)

---

## 🎯 Implementation Plan

### Phase 1: Critical Fixes (Today - 2 hours)

**Priority Order:**
1. **Product pages error** (30 min) - Highest impact
2. **Register name validation** (15 min) - Quick fix
3. **Sign out redirect** (15 min) - Environment variables
4. **Settings save failure** (30 min) - Server action fix

### Phase 2: Missing Pages (Tomorrow - 1 hour)

5. **Admin notifications page** (15 min)
6. **Admin orders page** (15 min)
7. **Shipping info page** (15 min)
8. **Admin users count fix** (15 min)

### Phase 3: Polish (As needed)

9. **Admin dashboard error** (30 min)
10. **Additional info pages** (30 min)

---

## 🔧 Testing Checklist

### Before Deployment
- [ ] Test product page with multiple slugs
- [ ] Test registration with "John Doe", "Mary-Jane Smith", "O'Brien"
- [ ] Test sign out redirect from different pages
- [ ] Test settings update with email change
- [ ] Verify all admin pages load
- [ ] Check footer links work

### After Deployment
- [ ] Visit https://farmers-market-platform.vercel.app/products/cherry-tomatoes
- [ ] Register new test user with full name
- [ ] Sign out and verify redirect to custom domain
- [ ] Update settings and verify success message
- [ ] Check all admin pages (as admin user)
- [ ] Test shipping page loads

---

## 📝 File Changes Required

### Files to Modify
```
src/app/(customer)/products/[slug]/page.tsx           # Fix product error
src/app/(auth)/register/page.tsx                      # Fix name validation
src/lib/auth/index.ts                                 # Fix sign out redirect
src/app/actions/settings.actions.ts                   # Fix settings save
src/app/(admin)/admin/users/page.tsx                  # Fix user counts
src/app/(admin)/admin/page.tsx                        # Fix dashboard error
```

### Files to Create
```
src/app/(admin)/admin/notifications/page.tsx          # New page
src/app/(admin)/admin/orders/page.tsx                 # New page
src/app/(customer)/shipping/page.tsx                  # New page
src/app/(customer)/privacy/page.tsx                   # New page (optional)
src/app/(customer)/terms/page.tsx                     # New page (optional)
```

---

## 🚀 Deployment Strategy

### Single Comprehensive Commit

```bash
git checkout -b fix/production-bugs
# Fix all critical issues
git add .
git commit -m "fix: resolve critical production bugs

Critical fixes (P0):
- Fix product pages shopping experience error
- Allow spaces in registration name field
- Fix sign out redirect to use custom domain
- Fix settings save with proper error handling

High priority (P1):
- Add admin notifications page
- Add admin orders page
- Add shipping information page
- Fix admin users count display

Medium priority (P2):
- Fix admin dashboard error handling
- Add missing footer pages

Resolves: #production-bugs-jan-2025"

git push origin fix/production-bugs
# Create PR and merge to main
```

---

## 🔍 Monitoring & Validation

### Error Tracking
```typescript
// Add to all fixed pages
import * as Sentry from "@sentry/nextjs";

try {
  // ... code
} catch (error) {
  Sentry.captureException(error, {
    tags: { page: 'product-detail' },
    extra: { slug: params.slug }
  });
  throw error;
}
```

### Success Metrics
- ✅ Product pages load without errors (target: 100%)
- ✅ User registrations increase (target: >0 per day)
- ✅ Settings updates succeed (target: >95%)
- ✅ All admin pages accessible (target: 100%)
- ✅ All footer links work (target: 100%)

---

## 📚 Related Documentation

- **Deployment Status:** `DEPLOYMENT_STATUS.md`
- **Database Setup:** `DATABASE_SETUP_COMPLETE.md`
- **Photos Implementation:** `PHOTOS_COMPLETE.md`
- **Coding Standards:** `.cursorrules`

---

## 💬 Support & Questions

If you encounter issues during fixes:
1. Check Vercel deployment logs for specific errors
2. Review Sentry error tracking for stack traces
3. Test locally with production database connection
4. Verify environment variables in Vercel dashboard

---

**Created:** January 10, 2025  
**Status:** 📋 Ready for Implementation  
**Estimated Time:** 2-3 hours total  
**Priority:** 🔴 CRITICAL - Start immediately

---

**Next Steps:**
1. Review this plan
2. Start with Phase 1 (critical fixes)
3. Test locally before deployment
4. Deploy as single comprehensive fix
5. Monitor production for 24 hours
6. Mark issues as resolved

**Let's fix these bugs and get the platform production-ready!** 🚀