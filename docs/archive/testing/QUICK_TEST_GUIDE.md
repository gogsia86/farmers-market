# 🧪 QUICK TEST GUIDE - Routing Fixes

## 📋 5-Minute Quick Test

### Prerequisites

- ✅ Server running locally or on Vercel
- ✅ Test farmer account with NO farm profile
- ✅ Test farmer account WITH farm profile
- ✅ Browser with DevTools open

---

## ⚡ QUICK TEST CHECKLIST

### Test 1: Farmer Without Farm (2 minutes)

```
1. Login as farmer without farm profile
2. Go to /farmer/dashboard
   Expected: See "Create Your Farm" button

3. Click "Create Your Farm" button
   Expected: Redirected to /register-farm
   Result: ✅ PASS / ❌ FAIL

4. Go back, then visit /farmer/orders
   Expected: See "Set up farm" message with link
   Result: ✅ PASS / ❌ FAIL

5. Click "Set up farm →" link
   Expected: Redirected to /register-farm
   Result: ✅ PASS / ❌ FAIL

6. Directly type /farmer/analytics in URL
   Expected: Redirected to /register-farm
   Result: ✅ PASS / ❌ FAIL

7. Directly type /farmer/settings in URL
   Expected: Redirected to /register-farm
   Result: ✅ PASS / ❌ FAIL
```

### Test 2: Public Navigation (1 minute)

```
1. Login as farmer WITH farm profile
2. From /farmer/dashboard, look at top navigation
   Expected: See Home, Marketplace, Farms, Products links
   Result: ✅ PASS / ❌ FAIL

3. Click "Home" link
   Expected: Go to / (homepage)
   Result: ✅ PASS / ❌ FAIL

4. Click "Marketplace" link from navbar
   Expected: Go to /marketplace
   Result: ✅ PASS / ❌ FAIL

5. Click "Farms" link
   Expected: Go to /farms
   Result: ✅ PASS / ❌ FAIL

6. Navigate back to /farmer/dashboard
   Expected: Works smoothly
   Result: ✅ PASS / ❌ FAIL
```

### Test 3: Language Routes (1 minute)

```
1. Type /fr in URL bar
   Expected: Redirected to /
   Check cookies: NEXT_LOCALE=fr should be set
   Result: ✅ PASS / ❌ FAIL

2. Type /es/marketplace in URL bar
   Expected: Redirected to /marketplace
   Check cookies: NEXT_LOCALE=es should be set
   Result: ✅ PASS / ❌ FAIL

3. Type /de/farms in URL bar
   Expected: Redirected to /farms
   No 404 error
   Result: ✅ PASS / ❌ FAIL
```

### Test 4: Mobile Navigation (1 minute)

```
1. Open DevTools → Toggle device toolbar (mobile view)
2. Login as farmer
3. Check mobile navigation at bottom
   Expected: See Home, Market icons | Dashboard, Products, Orders, Analytics
   Result: ✅ PASS / ❌ FAIL

4. Scroll horizontal navigation if needed
   Expected: All icons visible, scrollable
   Result: ✅ PASS / ❌ FAIL

5. Tap each icon
   Expected: Navigate correctly
   Result: ✅ PASS / ❌ FAIL
```

---

## 🚨 CRITICAL ISSUES TO CHECK

### ❌ If These Return 404, FAIL:

- `/register-farm` (must exist and work)
- Any redirect from farmer pages when no farm exists

### ❌ If These Are Inaccessible, FAIL:

- Public pages from farmer dashboard (Home, Marketplace, Farms, Products)
- Farmer dashboard from public pages (when logged in)

### ❌ If These Don't Redirect, FAIL:

- `/fr` → should redirect to `/`
- `/es/marketplace` → should redirect to `/marketplace`
- Language routes should set `NEXT_LOCALE` cookie

---

## 📊 QUICK RESULTS SUMMARY

| Test                          | Status | Notes |
| ----------------------------- | ------ | ----- |
| Farmer without farm redirects | ⬜     |       |
| Public navigation visible     | ⬜     |       |
| Public navigation works       | ⬜     |       |
| Language routes redirect      | ⬜     |       |
| Mobile navigation works       | ⬜     |       |

**Overall Status:** ⬜ PASS / ⬜ FAIL

---

## 🔍 DETAILED TESTING (If Issues Found)

### Debug Farmer Redirects

```bash
# Check all redirect locations
grep -r "redirect" src/app/(farmer)

# Should ALL point to /register-farm, not:
# - /onboarding/farm
# - /farmer/onboarding
# - /farmer/setup
```

### Debug Navigation

```bash
# Check farmer layout for public links
cat src/app/(farmer)/layout.tsx | grep -A 5 "Public Pages"

# Should see links to:
# - /
# - /marketplace
# - /farms
# - /products
```

### Debug Language Routes

```bash
# Check middleware for language handling
cat src/middleware.ts | grep -A 20 "LANGUAGE ROUTES"

# Should see:
# - Locale detection
# - Cookie setting
# - Redirect logic
```

### Check Browser Console

```
Open DevTools Console and look for:
❌ 404 errors
❌ Failed redirects
❌ Unhandled route errors
❌ TypeScript errors
```

---

## 🛠️ COMMON ISSUES & FIXES

### Issue: "Create Your Farm" button doesn't work

**Fix:** Check if `/register-farm` route exists at `src/app/(public)/register-farm/page.tsx`

### Issue: No public navigation visible

**Fix:** Check `src/app/(farmer)/layout.tsx` has been updated with public links

### Issue: Language routes still 404

**Fix:** Check middleware.ts has language handling code before PUBLIC ROUTES section

### Issue: Mobile navigation broken

**Fix:** Check layout.tsx has `overflow-x-auto` on mobile nav container

---

## ✅ SUCCESS CRITERIA

All tests must PASS for deployment:

- [x] Zero 404 errors on legitimate routes
- [x] All redirects work correctly
- [x] Public navigation accessible from farmer area
- [x] Language routes redirect gracefully
- [x] Mobile navigation fully functional
- [x] No console errors
- [x] No TypeScript compilation errors

---

## 📞 QUICK HELP

**404 on /register-farm?**
→ Route might not exist, check `src/app/(public)/register-farm/page.tsx`

**Can't see public links?**
→ Layout not updated, check `src/app/(farmer)/layout.tsx`

**Language routes still 404?**
→ Middleware not updated, check `src/middleware.ts`

**Mobile nav broken?**
→ Check responsive classes in layout.tsx mobile section

---

## 🚀 DEPLOYMENT TEST

After deploying to Vercel:

1. Test all scenarios on production URL
2. Check Vercel logs for middleware errors
3. Test on real mobile devices (not just DevTools)
4. Verify cookies are set correctly
5. Check all redirect chains work

**Production URL:** https://farmers-market-b7fjr9aqk-gogsias-projects.vercel.app

---

**Test Version:** 1.0
**Last Updated:** January 2025
**Estimated Time:** 5 minutes for quick test, 15 minutes for detailed debugging
