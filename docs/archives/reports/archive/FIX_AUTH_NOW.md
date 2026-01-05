# 🚀 FIX NEXTAUTH NOW - Immediate Action Plan

**⏱️ Time to Fix: 5 minutes**  
**Status: Ready to Execute**

---

## ⚡ IMMEDIATE STEPS - DO THIS NOW

### Step 1: Run Automatic Fix (2 minutes)

```bash
# Open PowerShell in project root
cd "M:\Repo\Farmers Market Platform web and app"

# Run the automatic fix
npm run fix:auth
```

**What this does:**

- ✅ Generates NEXTAUTH_SECRET
- ✅ Creates/updates .env.test and .env.local
- ✅ Recreates test users with correct passwords
- ✅ Fixes auth config (CONSUMER role, login page)
- ✅ Creates auth storage directory

---

### Step 2: Verify Fix (1 minute)

```bash
# Run diagnostic to confirm everything works
npm run debug:auth
```

**Expected output:**

```
✅ Passed: 23
❌ Failed: 0
Success Rate: 100.0%

🎉 ALL CHECKS PASSED!
```

**If you see failures:**

- Read the error messages
- See "Common Issues" section below
- Check `docs/NEXTAUTH_DEBUG_GUIDE.md`

---

### Step 3: Start Dev Server (30 seconds)

```bash
# Terminal 1 - Start dev server
npm run dev
```

Wait for:

```
✓ Ready in 3.2s
○ Local:        http://localhost:3001
```

---

### Step 4: Test Manual Login (30 seconds)

1. Open browser: http://localhost:3001/login
2. Use credentials:
   - Email: `farmer@farmersmarket.app`
   - Password: `DivineFarmer123!`
3. Click "Sign In"
4. Should redirect to dashboard (NOT show error)

**✅ Success:** Redirected to /farmer/dashboard  
**❌ Failure:** Shows "Authentication Failed" → See troubleshooting below

---

### Step 5: Run E2E Auth Setup (1 minute)

```bash
# Terminal 2 - PowerShell
$env:BASE_URL = "http://localhost:3001"
npx playwright test tests/e2e/auth.setup.ts --config=playwright.config.temp.ts --project=setup
```

**Expected output:**

```
✅ Admin authenticated successfully
✅ Farmer authenticated successfully
✅ Customer authenticated successfully
✅ All authentication states verified successfully!
```

---

### Step 6: Run E2E Tests (5-10 minutes)

```bash
# Same terminal
$env:BASE_URL = "http://localhost:3001"
npm run test:e2e
```

**Expected results:**

- Pass rate: ~90% (390+ tests passing)
- Most auth-related failures resolved
- StorageState files generated in `tests/auth/.auth/`

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Database connection failed"

```bash
# Check if Docker is running
docker ps | grep postgres

# If not, start it
docker-compose up -d

# Wait 10 seconds, then retry
npm run fix:auth
```

---

### Issue: "NEXTAUTH_SECRET is missing"

```bash
# Generate secret manually
openssl rand -base64 32

# Add to .env.test and .env.local
# Create .env.test:
notepad .env.test

# Paste this (replace YOUR_SECRET with generated value):
DATABASE_URL=postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=YOUR_SECRET_HERE
NEXTAUTH_DEBUG=true
```

---

### Issue: "Port 3001 is already in use"

```bash
# Kill existing server
npm run kill-server

# Or manually find and kill process (PowerShell):
Get-Process -Name node | Where-Object {$_.Path -like "*node*"} | Stop-Process -Force

# Restart
npm run dev
```

---

### Issue: Manual login still fails after fix

**Check server logs in Terminal 1:**

- Look for error messages when you click "Sign In"
- Common errors:
  - "User not found" → Run `tsx tests/global-setup.ts`
  - "Invalid password" → Run `npm run fix:auth` again
  - "Invalid role" → Check `src/lib/auth/config.ts` includes "CONSUMER"

**Check browser console (F12):**

- Look for JavaScript errors
- Check Network tab for failed requests to `/api/auth/*`

**Test API directly (PowerShell):**

```powershell
$body = @{
    email = "farmer@farmersmarket.app"
    password = "DivineFarmer123!"
    redirect = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/callback/credentials" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

Should return: `{ok: true, url: "http://localhost:3001/farmer/dashboard"}`

---

## 📋 Quick Verification Checklist

Before running E2E tests:

- [ ] `npm run debug:auth` shows 100% pass rate
- [ ] `.env.test` exists with NEXTAUTH_SECRET set
- [ ] `docker ps` shows postgres container running
- [ ] `npm run dev` server running on port 3001
- [ ] Manual login at `/login` works (no error message)
- [ ] Browser redirects to dashboard after login

---

## 🎯 What Success Looks Like

### 1. Diagnostic Output

```
✅ ALL CHECKS PASSED!
Total Checks: 23
Success Rate: 100.0%
```

### 2. Manual Login

- ✅ No "Authentication Failed" error
- ✅ Redirects to appropriate dashboard
- ✅ User menu shows in top right

### 3. E2E Auth Setup

```
Running 4 tests using 1 worker
✓ [setup] › tests/e2e/auth.setup.ts:10:1 › authenticate as admin
✓ [setup] › tests/e2e/auth.setup.ts:35:1 › authenticate as farmer
✓ [setup] › tests/e2e/auth.setup.ts:60:1 › authenticate as customer
✓ [setup] › tests/e2e/auth.setup.ts:85:1 › verify auth states created

4 passed
```

### 4. E2E Tests

```
435 tests across 5 browser projects
390+ passed (~90% pass rate)
<50 failed
Authentication-related tests now passing
```

---

## 🆘 Still Stuck?

### 1. Run Full Diagnostic with Logs

```bash
npm run debug:auth > auth-debug.log 2>&1
notepad auth-debug.log
```

### 2. Check Documentation

- `docs/NEXTAUTH_DEBUG_GUIDE.md` - Comprehensive troubleshooting
- `NEXTAUTH_FIX_SUMMARY.md` - What was fixed and why

### 3. Reset Everything and Start Fresh

```bash
# 1. Kill all servers
npm run kill-server

# 2. Restart database
docker-compose down
docker-compose up -d

# Wait 10 seconds

# 3. Re-run fix
npm run fix:auth

# 4. Verify
npm run debug:auth

# 5. Restart dev server
npm run dev
```

---

## 📞 Need More Help?

If you're still having issues after trying all of the above:

1. **Collect logs:**
   - `npm run debug:auth > diagnostic.log`
   - Server logs from `npm run dev`
   - Browser console errors (F12)
   - Screenshots of error messages

2. **Check recent changes:**

   ```bash
   git log --oneline -5 -- "src/lib/auth/**"
   ```

3. **Review the fixes applied:**
   ```bash
   git diff HEAD~1 src/lib/auth/config.ts
   ```

---

## 🎉 You're Done When...

✅ Diagnostic shows 100% pass rate  
✅ Manual login works without errors  
✅ Auth setup creates 3 JSON files in `tests/auth/.auth/`  
✅ E2E tests run with ~90% pass rate  
✅ No more "Authentication Failed" messages

**Congratulations!** 🎊 NextAuth is now working correctly!

---

**Quick Reference:**

- Fix: `npm run fix:auth`
- Diagnose: `npm run debug:auth`
- Test: `npm run test:e2e`
- Docs: `docs/NEXTAUTH_DEBUG_GUIDE.md`

**Version:** 1.0  
**Status:** Ready to Execute ⚡
