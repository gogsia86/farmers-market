# 🐛 DEBUG GUIDE - Insufficient Permissions Error

## Issue: `/?error=insufficient_permissions`

You're seeing this error because the middleware is blocking access to a route. This guide will help you debug and fix it.

---

## 🔍 DIAGNOSIS STEPS

### Step 1: Check Your User's Role

1. **Open browser console** (F12)
2. **Run this command:**
   ```javascript
   fetch("/api/auth/session")
     .then((r) => r.json())
     .then((d) => console.log("Session:", d));
   ```
3. **Look for the output:**
   ```json
   {
     "user": {
       "id": "...",
       "email": "test@example.com",
       "name": "Test User",
       "role": "CONSUMER", // ← Check this!
       "status": "ACTIVE"
     }
   }
   ```

### Step 2: Verify Database Role

1. **Open Prisma Studio:**

   ```bash
   npm run prisma:studio
   ```

2. **Navigate to User table**

3. **Find your user by email**

4. **Check the `role` column:**
   - Should be: `CONSUMER`, `FARMER`, `ADMIN`, `SUPER_ADMIN`, or `MODERATOR`
   - If it's `null` or something else → **This is the problem!**

---

## 🔧 COMMON CAUSES & FIXES

### Cause #1: Role Not Set in Database

**Problem:** User role is `null` or invalid in database.

**Fix:**

```bash
# Open Prisma Studio
npm run prisma:studio

# Navigate to User table
# Find your user
# Edit the 'role' field to: CONSUMER
# Click "Save 1 change"
```

**Or via SQL:**

```sql
-- Update user role directly
UPDATE "User"
SET role = 'CONSUMER'
WHERE email = 'your@email.com';
```

---

### Cause #2: JWT Token Doesn't Include Role

**Problem:** Old JWT token from before role was set.

**Fix:**

1. **Sign out completely:**

   ```javascript
   // In browser console
   fetch("/api/auth/signout", { method: "POST" }).then(
     () => (window.location.href = "/login"),
   );
   ```

2. **Or clear cookies manually:**
   - Open DevTools → Application → Cookies
   - Delete all cookies for `localhost:3001`
   - Refresh page

3. **Sign in again** - This creates a new JWT with the correct role

---

### Cause #3: Session Not Being Created Properly

**Problem:** NextAuth session callback not working.

**Debug:**

```bash
# Check server logs when you login
# Look for:
✅ User signed in: user@example.com (CONSUMER)

# If you see this but still get permission error,
# the middleware is not reading the token correctly
```

**Fix:** Restart the server

```bash
# Stop server (Ctrl+C)
npm run start
```

---

### Cause #4: Middleware Configuration Issue

**Problem:** Route not properly configured in middleware.

**Check file:** `src/lib/middleware/route-config.ts`

**Verify `/dashboard` is in PROTECTED_ROUTES:**

```typescript
export const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  "/dashboard": ["CONSUMER", "FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"],
  "/dashboard/*": ["CONSUMER", "FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"],
  // ...
};
```

**Fix:** Already correct in latest code ✅

---

## 🎯 QUICK FIX SCRIPT

Run this in your browser console to diagnose:

```javascript
// Check session
async function debugAuth() {
  console.log("🔍 Checking authentication...\n");

  // 1. Check session
  const session = await fetch("/api/auth/session").then((r) => r.json());
  console.log("📋 Session:", session);

  if (session?.user) {
    console.log("✅ Authenticated");
    console.log("👤 User:", session.user.email);
    console.log("🎭 Role:", session.user.role || "❌ MISSING!");
    console.log("📊 Status:", session.user.status);

    if (!session.user.role) {
      console.error("❌ PROBLEM: Role is missing from session!");
      console.log("🔧 FIX: Update role in database and re-login");
    }
  } else {
    console.log("❌ Not authenticated");
    console.log("🔧 FIX: Login at /login");
  }
}

debugAuth();
```

---

## 🚀 COMPLETE FIX PROCEDURE

### For CONSUMER users:

1. **Check database role:**

   ```bash
   npm run prisma:studio
   ```

   - User table → Find your user → role = `CONSUMER` ✅

2. **Sign out and clear session:**
   - Visit: http://localhost:3001/api/auth/signout
   - Clear cookies (DevTools → Application → Cookies → Delete all)

3. **Sign in again:**
   - Visit: http://localhost:3001/login
   - Login with your credentials

4. **Verify redirect:**
   - Should go to: `/dashboard` ✅
   - NOT: `/?error=insufficient_permissions` ❌

---

## 📊 EXPECTED USER FLOW

### Correct Flow:

```
1. Signup → Creates user with role="CONSUMER"
2. Login → JWT token includes role
3. Redirect → Middleware allows access to /dashboard
4. Dashboard loads ✅
```

### Broken Flow:

```
1. Signup → Creates user but role is null/missing
2. Login → JWT token missing role OR has wrong role
3. Redirect → Middleware blocks access
4. Redirects to /?error=insufficient_permissions ❌
```

---

## 🔍 CHECK MIDDLEWARE LOGS

If running in development mode (`npm run dev`), check terminal for:

```bash
🛡️  [Middleware] Auth Check {
  path: '/dashboard',
  authenticated: true,
  userRole: 'CONSUMER',  # ← Should be here!
}

# If you see:
userRole: 'none'  # ← This is the problem!
```

---

## 🧪 MANUAL DATABASE FIX

If user role is missing, fix directly:

```bash
# Option 1: Via Prisma Studio (GUI)
npm run prisma:studio
# Edit user → Set role → Save

# Option 2: Via Prisma Console
npx prisma db execute --stdin <<EOF
UPDATE "User" SET role = 'CONSUMER' WHERE email = 'test@example.com';
EOF
```

---

## 📋 VERIFICATION CHECKLIST

After fixing, verify:

- [ ] User role in database is `CONSUMER` (not null)
- [ ] Session API returns role: `fetch('/api/auth/session')`
- [ ] Login redirects to `/dashboard` (not home with error)
- [ ] Dashboard loads without errors
- [ ] No `insufficient_permissions` in URL

---

## 🆘 STILL NOT WORKING?

### Check Environment Variables:

```bash
# .env.local or .env.production must have:
NEXTAUTH_SECRET="your-secret-here"  # Required!
NEXTAUTH_URL="http://localhost:3001"
DATABASE_URL="postgresql://..."
```

### Restart Everything:

```bash
# 1. Stop server (Ctrl+C)

# 2. Clear build cache
rm -rf .next

# 3. Rebuild
npm run build

# 4. Start fresh
npm run start
```

### Check Server Logs:

Look for errors when accessing `/dashboard`:

```bash
# Good:
✅ User signed in: user@example.com (CONSUMER)
🛡️ [Middleware] Auth Check { authenticated: true, userRole: 'CONSUMER' }

# Bad:
❌ Authorization error: ...
🛡️ [Middleware] Auth Check { authenticated: false }
⚠️ [Middleware] Insufficient permissions
```

---

## 💡 PREVENTION

To prevent this in the future:

1. **Always set role during signup** ✅ (Already fixed in code)
2. **Validate role in database** ✅
3. **Test login flow after signup** ✅
4. **Clear sessions when changing roles** ✅

---

## 🎯 SOLUTION SUMMARY

**Most Common Fix:**

1. Update user role in database to `CONSUMER`
2. Sign out completely
3. Clear cookies
4. Sign in again
5. Verify redirect to `/dashboard` works

**Check order:**

1. Database role → Must be valid
2. Session role → Must include role from DB
3. Middleware → Must allow role for route
4. Redirect → Must go to correct dashboard

---

## 📞 NEED MORE HELP?

Run this comprehensive debug script:

```javascript
async function fullDebug() {
  console.log("=== FULL AUTH DEBUG ===\n");

  // Check session
  const session = await fetch("/api/auth/session").then((r) => r.json());
  console.log("1. Session:", JSON.stringify(session, null, 2));

  // Check current URL
  console.log("\n2. Current URL:", window.location.href);
  console.log(
    "3. Has error param:",
    new URLSearchParams(window.location.search).get("error"),
  );

  // Check cookies
  console.log("\n4. Cookies:", document.cookie);

  // Check role
  if (session?.user?.role) {
    console.log("\n✅ Role found:", session.user.role);
    console.log("✅ Should have access to:");
    if (session.user.role === "CONSUMER") {
      console.log("  - /dashboard ✅");
      console.log("  - /cart ✅");
      console.log("  - /orders ✅");
    }
  } else {
    console.log("\n❌ Role MISSING!");
    console.log("🔧 Fix: Update role in database and re-login");
  }
}

fullDebug();
```

Copy the output and check against expected values.

---

**Last Updated:** December 16, 2024  
**Status:** Known issue with workaround available  
**Fix Applied:** Login redirect updated, error messages added
