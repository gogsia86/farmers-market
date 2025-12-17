# 🔧 FIX INSTRUCTIONS - Complete Setup Guide

## Date: December 16, 2024

## Issues: Signup/Dashboard Flow + Farms 404 + Build Errors

---

## ✅ FIXES ALREADY APPLIED

I've already made the following code changes:

1. **✅ Login Redirect Fixed** - `src/app/(auth)/login/page.tsx`
   - CONSUMER users now redirect to `/dashboard` (was redirecting to `/`)

2. **✅ Stripe Build Error Fixed** - `src/lib/stripe.ts`
   - Stripe now uses lazy initialization (no build-time errors)

---

## 🚀 STEPS TO FIX EVERYTHING

### Step 1: Add Missing Environment Variables

You need to add Stripe keys to your `.env.production` or `.env.local` file:

```bash
# Open your .env.local or .env.production file and add:

# Stripe Test Keys (for development/testing)
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz

# Or use fake keys for testing (payment won't work but build will succeed)
STRIPE_SECRET_KEY=sk_test_fake_key_for_testing_only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_fake_key_for_testing_only
```

**Where to get real Stripe keys:**

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key" → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Click "Reveal test key" → Copy "Secret key" → `STRIPE_SECRET_KEY`

---

### Step 2: Clean Build Cache

```bash
cd "M:\Repo\Farmers Market Platform web and app"

# Delete build cache
rm -rf .next

# Or on Windows PowerShell:
Remove-Item -Recurse -Force .next
```

---

### Step 3: Rebuild Production

```bash
npm run build
```

**Expected Output:**

- ✅ Should succeed without Stripe errors
- ✅ Should compile all pages including /farms
- ✅ Should show "Compiled successfully"

If build fails, check:

- DATABASE_URL is set in .env
- NEXTAUTH_SECRET is set in .env
- STRIPE_SECRET_KEY is set (even a fake one)

---

### Step 4: Start Production Server

```bash
npm run start
```

**Expected Output:**

```
> farmers-market@1.0.0 start
> cross-env NODE_OPTIONS='--max-old-space-size=8192' next start -p 3001

  ▲ Next.js 16.0.10
  - Local:        http://localhost:3001
  - Network:      http://192.168.x.x:3001

✓ Ready in XXXms
```

---

### Step 5: Test Signup Flow

**Open browser:** http://localhost:3001/signup

1. **Fill signup form:**
   - Name: Test User
   - Email: test@example.com
   - Password: Test1234 (must have uppercase, lowercase, number)
   - Confirm Password: Test1234
   - Account Type: Buy Products (CONSUMER)
   - ✅ Check "I agree to terms"

2. **Click "Create Account"**
   - Should redirect to `/login?registered=true`

3. **Login with credentials:**
   - Email: test@example.com
   - Password: Test1234

4. **Verify redirect:**
   - ✅ Should now go to `/dashboard` (NOT home page)

5. **Check dashboard loads:**
   - Shows "Welcome Back, Test!"
   - Shows stats cards (may be 0)
   - Shows "Recent Orders" section
   - Shows "Quick Actions"

---

### Step 6: Test Farms Route

**Open browser:** http://localhost:3001/farms

**If you see 404:**

#### Fix Option A: Check Database Connection

```bash
# Open Prisma Studio to check data
npm run prisma:studio

# This opens http://localhost:5555
# Navigate to "Farm" table
# Check if any farms exist
```

**If NO farms exist:**

- The page should show "No Farms Available Yet" (not 404)
- If you see 404, continue to Fix Option B

**If farms exist but page shows 404:**

- Continue to Fix Option B

#### Fix Option B: Verify Route Files

```bash
# Check if file exists
ls "src/app/(public)/farms/page.tsx"

# Should output: src/app/(public)/farms/page.tsx

# If file doesn't exist, something went wrong
```

#### Fix Option C: Check Middleware

```bash
# Search for farms in middleware config
grep -n "farms" src/lib/middleware/route-config.ts

# Should show farms in PUBLIC_ROUTES
```

#### Fix Option D: Debug Logs

```bash
# Stop server (Ctrl+C)
# Restart with verbose logging
npm run dev

# Try accessing http://localhost:3001/farms
# Watch terminal for errors
```

---

### Step 7: Create Test Farm (If Needed)

If database is empty and you need test data:

```bash
# Option 1: Via Prisma Studio
npm run prisma:studio

# Navigate to Farm table
# Click "+ Add record"
# Fill in minimum required fields:
#   - name: "Green Valley Farm"
#   - slug: "green-valley-farm"
#   - description: "Fresh organic produce"
#   - status: "ACTIVE"
#   - verificationStatus: "VERIFIED"
#   - ownerId: (select existing user ID)
# Click "Save 1 change"

# Option 2: Via seed script (if available)
npm run prisma:seed
```

---

## 🧪 COMPLETE TEST CHECKLIST

### Authentication & Dashboard

- [ ] Can sign up as CONSUMER
- [ ] Redirects to /login after signup
- [ ] Can log in with new account
- [ ] Redirects to /dashboard (NOT /)
- [ ] Dashboard loads without errors
- [ ] Stats cards visible
- [ ] Quick actions work

### Farms Route

- [ ] http://localhost:3001/farms loads (no 404)
- [ ] If farms exist, they display in grid
- [ ] If no farms, shows empty state (not 404)
- [ ] Can click farm card → farm detail page
- [ ] Farm detail page loads

### Build & Production

- [ ] `npm run build` succeeds
- [ ] No Stripe errors
- [ ] No TypeScript errors
- [ ] `npm run start` works
- [ ] All routes accessible

---

## 🐛 TROUBLESHOOTING

### Issue: Build Still Fails with Stripe Error

**Solution:**

```bash
# Verify .env.local exists
ls .env.local

# Check if STRIPE_SECRET_KEY is set
grep STRIPE_SECRET_KEY .env.local

# If not set, add it:
echo "STRIPE_SECRET_KEY=sk_test_fake_key_for_testing" >> .env.local
```

### Issue: Dashboard Shows Auth Error

**Symptoms:** Redirects back to login, or shows "Authentication required"

**Solution:**

```bash
# Check NEXTAUTH_SECRET is set
grep NEXTAUTH_SECRET .env.local

# If not set, generate one:
# On Linux/Mac:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Add to .env.local:
NEXTAUTH_SECRET=<generated-value>
```

### Issue: Farms Route Still Shows 404

**Debug Steps:**

1. **Check server mode:**

   ```bash
   # Are you running dev or production?
   # Dev: npm run dev
   # Prod: npm run build && npm run start
   ```

2. **Check route group:**

   ```bash
   # Verify file structure
   ls -la "src/app/(public)/farms/"

   # Should show:
   # page.tsx
   # [slug]/ (directory)
   ```

3. **Check middleware logs:**

   ```bash
   # In src/middleware.ts, search for:
   middlewareLog.debug

   # These should show request processing
   ```

4. **Test API directly:**

   ```bash
   # Check if farm data is accessible
   curl http://localhost:3001/api/farms

   # Should return JSON with farms data
   ```

5. **Check database:**

   ```bash
   # Verify DATABASE_URL is correct
   grep DATABASE_URL .env.local

   # Test connection
   npm run prisma:db:pull
   ```

### Issue: "Module not found" Errors

**Solution:**

```bash
# Reinstall dependencies
npm install

# Clear cache
rm -rf node_modules/.cache
rm -rf .next

# Rebuild
npm run build
```

---

## 📋 REQUIRED ENV VARIABLES

Make sure these are in your `.env.local` or `.env.production`:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"

# NextAuth (REQUIRED)
NEXTAUTH_SECRET="your-secret-minimum-32-characters-long"
NEXTAUTH_URL="http://localhost:3001"

# Stripe (REQUIRED for build after fix)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# App URL (OPTIONAL but recommended)
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

---

## 🎯 EXPECTED RESULTS AFTER FIXES

### ✅ Signup Flow

```
/signup → Fill form → Create Account
  ↓
/login?registered=true → Login
  ↓
/dashboard ← ✅ CONSUMER lands here
```

### ✅ Dashboard

```
/dashboard
  ├── Welcome message: "Welcome Back, [Name]!"
  ├── Stats: Active Orders, Total Orders, Favorites, Reviews
  ├── Recent Orders (empty state if no orders)
  ├── Favorite Farms (hidden if no favorites)
  └── Quick Actions buttons
```

### ✅ Farms Route

```
/farms
  ├── Hero section with stats
  ├── Farms grid (or empty state)
  ├── Search/filter options
  └── Individual farm cards
```

---

## 🚀 RUNNING BOTH SERVER & BOT

After everything works:

### Option 1: Two Terminal Tabs

**Tab 1 - Production Server:**

```bash
cd "M:\Repo\Farmers Market Platform web and app"
npm run start
```

**Tab 2 - Workflow Bot:**

```bash
cd "M:\Repo\Farmers Market Platform web and app"
npm run bot:run          # All workflows
# OR
npm run bot:critical     # Critical only
# OR
npm run bot:health       # Health monitoring
```

### Option 2: Combined Start

```bash
npm run start:full-stack
```

This starts:

- Next.js production server
- Divine Workflow Monitoring Bot
- Auto-remediation system
- Orchestrator-monitoring bridge

---

## 📞 STILL HAVING ISSUES?

If problems persist after following ALL steps:

1. **Capture Error Details:**

   ```bash
   # Run with debug logging
   DEBUG=* npm run start 2>&1 | tee error.log

   # Try accessing the failing route
   # Check error.log file
   ```

2. **Check System Requirements:**
   - Node.js: >=20.19.0
   - npm: >=10.0.0
   - PostgreSQL: Running and accessible
   - RAM: At least 8GB available

3. **Verify Database:**

   ```bash
   # Check if Prisma can connect
   npx prisma db pull

   # Should succeed without errors
   ```

4. **Check Port Conflicts:**

   ```bash
   # On Windows:
   netstat -ano | findstr :3001

   # On Linux/Mac:
   lsof -i :3001

   # Kill existing process if needed
   ```

---

## ✨ SUCCESS INDICATORS

You'll know everything is working when:

- [x] `npm run build` completes successfully
- [x] `npm run start` runs without errors
- [x] Sign up creates account
- [x] Login redirects to `/dashboard`
- [x] Dashboard shows user info and stats
- [x] http://localhost:3001/farms loads (no 404)
- [x] Bot runs without errors
- [x] No console errors in browser

---

**Good luck! 🌾**

If you complete all steps and still have issues, please provide:

1. Exact error message
2. Which step failed
3. Content of error.log
4. Output of `npm run build`
