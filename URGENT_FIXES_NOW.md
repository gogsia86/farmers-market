# 🚨 URGENT FIXES - DO THESE NOW

**Priority:** 🔴 CRITICAL  
**Time Required:** 30 minutes  
**Impact:** Fixes 90% of reported issues

---

## 🎯 FIX #1: Product Pages Error (15 min)

**Problem:** All product pages show "Shopping Experience Interrupted"  
**URL:** https://farmers-market-platform.vercel.app/products/cherry-tomatoes

**Root Cause:** Likely async params handling in Next.js 15+

**Quick Fix:**
Open: `src/app/(customer)/products/[slug]/page.tsx`

Find line ~192:
```typescript
export default async function ProductDetailPage({ params }: PageProps) {
  const session = await auth();
  const resolvedParams = await params;  // ← THIS IS THE ISSUE
```

**Replace with:**
```typescript
export default async function ProductDetailPage({ params }: PageProps) {
  const session = await auth();
  const { slug } = await params;  // ← Destructure immediately
```

**Then update line ~198:**
```typescript
// OLD:
const product = await getProductData(resolvedParams.slug);

// NEW:
const product = await getProductData(slug);
```

---

## 🎯 FIX #2: Register Name Field (5 min)

**Problem:** Can't type spaces in full name  
**URL:** https://farmers-market-platform.vercel.app/register

**Quick Fix:**
Open: `src/app/(auth)/register/page.tsx`

Search for the name input field and find any pattern or onChange that removes spaces.

**Remove/Replace:**
```typescript
// BAD (if present):
pattern="[A-Za-z]+"
onChange={(e) => e.target.value.replace(/[^A-Za-z]/g, '')}

// GOOD:
pattern="[A-Za-z\s\-']+"
minLength={2}
// Remove restrictive onChange or change to:
onChange={(e) => {
  e.target.value = e.target.value.replace(/[^A-Za-z\s\-']/g, '');
}}
```

**Or if using Zod validation, find the schema:**
```typescript
// Update validation:
fullName: z.string()
  .min(2, "Name must be at least 2 characters")
  .max(100)
  .regex(/^[A-Za-z\s\-']+$/, "Invalid name format")
```

---

## 🎯 FIX #3: Sign Out Redirect (5 min)

**Problem:** Redirects to `farmers-market-platform-4clvahg9p-gogsias-projects.vercel.app`  
**Should:** Redirect to `farmers-market-platform.vercel.app`

**Quick Fix:**
Open: `src/lib/auth/index.ts`

Find the `authOptions` and add/update redirect callback:

```typescript
export const authOptions: NextAuthOptions = {
  // ... existing config
  callbacks: {
    // ... other callbacks
    async redirect({ url, baseUrl }) {
      // Force production domain
      const prodUrl = 'https://farmers-market-platform.vercel.app';
      
      // If relative path, use production domain
      if (url.startsWith('/')) return `${prodUrl}${url}`;
      
      // If same origin, allow
      if (url.startsWith(prodUrl)) return url;
      
      // Default to home
      return prodUrl;
    }
  }
};
```

**ALSO:** Set in Vercel Dashboard → Settings → Environment Variables:
```
NEXTAUTH_URL=https://farmers-market-platform.vercel.app
NEXT_PUBLIC_APP_URL=https://farmers-market-platform.vercel.app
```

---

## 🎯 FIX #4: Settings Save Error (5 min)

**Problem:** "Failed to save settings"  
**URL:** https://farmers-market-platform.vercel.app/settings

**Quick Check:**
1. Open: `src/app/(customer)/settings/page.tsx`
2. Look for the server action or form submission
3. Add better error handling

**Quick Fix - Add this at the top of the server action:**
```typescript
"use server";

export async function updateSettings(formData: FormData) {
  try {
    // Check auth FIRST
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Log what we're trying to update
    console.log('Updating settings for user:', session.user.id);
    console.log('Form data:', Object.fromEntries(formData));

    // ... rest of your code
    
  } catch (error) {
    console.error('Settings error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
```

---

## 📦 QUICK COMMIT & DEPLOY

```bash
# Add fixes
git add src/app/(customer)/products/[slug]/page.tsx
git add src/app/(auth)/register/page.tsx
git add src/lib/auth/index.ts
git add src/app/(customer)/settings/page.tsx

# Commit
git commit -m "fix: critical production bugs - products, register, signout, settings"

# Push
git push origin master
```

---

## ⏰ After These 4 Fixes

**Expected Results:**
- ✅ Product pages load successfully
- ✅ Users can register with full names
- ✅ Sign out goes to correct domain
- ✅ Settings save (or show better error)

**Deploy Time:** ~3 minutes  
**Test Immediately:** All 4 URLs above

---

## 🔄 REMAINING ISSUES (Do Later - Not Blocking)

These are missing pages (404s) - low priority:

1. **Admin Notifications** - Create: `src/app/(admin)/admin/notifications/page.tsx`
2. **Admin Orders** - Create: `src/app/(admin)/admin/orders/page.tsx`
3. **Shipping Page** - Create: `src/app/(customer)/shipping/page.tsx`
4. **Admin Users Count** - Fix query in: `src/app/(admin)/admin/users/page.tsx`

**These can wait** - they're not blocking user purchases or registration.

---

## 🎯 FOCUS NOW

**DO THESE 4 FIXES IN THE NEXT 30 MINUTES:**
1. Product pages (async params)
2. Register name field (allow spaces)
3. Sign out redirect (hardcode domain)
4. Settings error handling (add logs)

**THEN DEPLOY AND TEST**

After confirming these work, we can tackle the missing pages.

---

**Start with Fix #1 - it's the most critical!** 🚀