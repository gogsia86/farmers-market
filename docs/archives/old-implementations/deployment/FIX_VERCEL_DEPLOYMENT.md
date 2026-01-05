# 🔧 FIX VERCEL DEPLOYMENT - 404 & AUTH ISSUES

**Problem:** Getting 404 on /farms and cannot login/register  
**Cause:** Database not initialized + possible environment variable issues  
**Solution:** Follow these steps in order  
**Time Required:** 10-15 minutes

---

## 🎯 ISSUE DIAGNOSIS

You're experiencing these problems:

- ❌ 404 error on https://farmers-market-psi.vercel.app/farms
- ❌ Cannot register new account
- ❌ Cannot login

**Root Causes:**

1. **Database tables don't exist** (Prisma migrations not run)
2. **NEXTAUTH_URL might be incorrect**
3. **Database connection might not be configured**

---

## ✅ SOLUTION: 3-STEP FIX

### STEP 1: Verify Environment Variables in Vercel

1. **Go to:** https://vercel.com/gogsias-projects/farmers-market/settings/environment-variables

2. **Check these variables exist:**

   | Variable        | Should Look Like                      | Environment                      |
   | --------------- | ------------------------------------- | -------------------------------- |
   | DATABASE_URL    | postgres://...vercel-storage.com...   | Production, Preview, Development |
   | NEXTAUTH_SECRET | Long random string                    | Production, Preview, Development |
   | NEXTAUTH_URL    | https://farmers-market-psi.vercel.app | Production only                  |

3. **Fix NEXTAUTH_URL if needed:**
   - Click "Edit" on NEXTAUTH_URL
   - Change to: `https://farmers-market-psi.vercel.app`
   - Make sure it's ONLY checked for "Production"
   - Click "Save"

4. **After making changes:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait 3-5 minutes

---

### STEP 2: Run Database Migrations (CRITICAL!)

Your database is empty - you need to create the tables.

#### Option A: Using Vercel CLI (Recommended)

```bash
# 1. Navigate to project folder
cd "Farmers Market Platform web and app"

# 2. Pull production environment variables
vercel env pull .env.production.local

# 3. Run migrations
npx dotenv -e .env.production.local -- npx prisma migrate deploy

# 4. Verify migration worked
npx dotenv -e .env.production.local -- npx prisma db push
```

#### Option B: Manual with DATABASE_URL

If CLI doesn't work:

```bash
# 1. Get your DATABASE_URL from Vercel
# Go to: https://vercel.com/gogsias-projects/farmers-market/settings/environment-variables
# Copy the DATABASE_URL value

# 2. Run migrations manually
DATABASE_URL="postgres://your-connection-string-here" npx prisma migrate deploy

# 3. Push schema
DATABASE_URL="postgres://your-connection-string-here" npx prisma db push
```

#### Option C: Using Vercel Postgres Dashboard

1. Go to: https://vercel.com/gogsias-projects
2. Click "Storage" tab
3. Click your database
4. Click "Data" tab
5. Click "Query" button
6. You should see tables listed (User, Farm, Product, etc.)
7. If NO tables exist, run Option A or B above

---

### STEP 3: Test Authentication

After running migrations:

1. **Clear browser cache and cookies**
   - Press F12 (Developer Tools)
   - Right-click refresh button → "Empty Cache and Hard Reload"
   - Or use Incognito/Private window

2. **Go to signup page:**

   ```
   https://farmers-market-psi.vercel.app/signup
   ```

3. **Try to create account:**
   - Fill in email and password
   - Submit form
   - Should redirect to dashboard

4. **If still failing:**
   - Check browser console (F12) for errors
   - Look for specific error messages

---

## 🔍 DETAILED TROUBLESHOOTING

### Problem: "Prisma Client did not initialize yet"

**Solution:**

```bash
# Regenerate Prisma client
npx prisma generate

# Redeploy to Vercel
vercel --prod
```

### Problem: "No such table: User" or "relation does not exist"

**Solution:** Database migrations weren't run. Go back to STEP 2 above.

### Problem: "Invalid connection string"

**Solution:**

1. Check DATABASE_URL format:
   ```
   postgres://username:password@host.vercel-storage.com/database?sslmode=require
   ```
2. Must include `?sslmode=require` at the end
3. No spaces or line breaks in the URL

### Problem: "CSRF token mismatch"

**Solution:**

1. Verify NEXTAUTH_URL matches your exact Vercel URL
2. Clear browser cookies
3. Try incognito mode

### Problem: "Database connection failed"

**Solution:**

1. Check if Vercel Postgres database is running:
   - Go to Storage tab in Vercel
   - Database should show "Active"
2. Test connection locally:
   ```bash
   DATABASE_URL="your-url" npx prisma db pull
   ```

---

## 📋 VERIFICATION CHECKLIST

After applying fixes, test these:

### Database Check

- [ ] Can connect to database
- [ ] Tables exist (run `npx prisma studio` to view)
- [ ] Migrations are applied

### Environment Variables Check

- [ ] DATABASE_URL is set correctly
- [ ] NEXTAUTH_SECRET is set (any environment)
- [ ] NEXTAUTH_URL matches: https://farmers-market-psi.vercel.app
- [ ] All variables have correct environments checked

### Application Check

- [ ] Homepage loads: https://farmers-market-psi.vercel.app
- [ ] /signup page loads
- [ ] /login page loads
- [ ] /farms page loads (might be empty but shouldn't 404)
- [ ] /marketplace page loads

### Authentication Check

- [ ] Can access signup form
- [ ] Can submit signup form
- [ ] Receives confirmation/redirect
- [ ] Can login with created account
- [ ] Can logout
- [ ] Can access protected routes when logged in

---

## 🚨 COMMON ERRORS & FIXES

### Error: "PrismaClientInitializationError"

```
Error in Prisma Client:
Can't reach database server at `...`
```

**Fix:**

1. DATABASE_URL is wrong or database doesn't exist
2. Go to Vercel → Storage → Create Postgres database
3. Copy new DATABASE_URL to environment variables
4. Redeploy

---

### Error: "P2021: The table does not exist"

```
Error: P2021: The table `main.User` does not exist in the current database.
```

**Fix:**

```bash
# Run migrations
DATABASE_URL="your-url" npx prisma migrate deploy

# Or push schema
DATABASE_URL="your-url" npx prisma db push
```

---

### Error: "Invalid `prisma.user.findUnique()` invocation"

```
Invalid `prisma.user.findUnique()` invocation:
The table `main.User` does not exist in the current database.
```

**Fix:** Same as above - run migrations

---

### Error: 404 on specific routes

**Possible causes:**

1. Dynamic routes not generated during build
2. Middleware blocking routes
3. Routes actually don't exist

**Fix:**

1. Check if route exists in code:
   ```bash
   # Check if farms route exists
   ls -la "src/app/farms"
   ```
2. If exists, might be protected route requiring authentication
3. Try logging in first, then accessing /farms

---

## 🔧 EMERGENCY FIX: Complete Reset

If nothing works, do a complete reset:

### 1. Delete and Recreate Database

```bash
# 1. Go to Vercel → Storage
# 2. Delete existing Postgres database
# 3. Create new Postgres database
# 4. Copy new DATABASE_URL
```

### 2. Update Environment Variables

```bash
# Update DATABASE_URL with new value
# Go to: Settings → Environment Variables → Edit DATABASE_URL
```

### 3. Run Fresh Migrations

```bash
# Pull new DATABASE_URL
vercel env pull .env.production.local

# Deploy schema from scratch
npx dotenv -e .env.production.local -- npx prisma db push

# Run migrations
npx dotenv -e .env.production.local -- npx prisma migrate deploy
```

### 4. Redeploy

```bash
# Force redeploy
vercel --prod --force
```

---

## 📊 DATABASE VERIFICATION

To verify your database has tables:

### Method 1: Prisma Studio

```bash
# Pull production env
vercel env pull .env.production.local

# Open Prisma Studio
npx dotenv -e .env.production.local -- npx prisma studio

# Browser opens at http://localhost:5555
# You should see: User, Farm, Product, Order tables
```

### Method 2: Direct SQL Query

```bash
# Connect and list tables
npx dotenv -e .env.production.local -- npx prisma db execute --stdin
```

Then paste:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

**Expected output:**

```
User
Account
Session
Farm
Product
Order
OrderItem
Review
Category
...etc
```

---

## 🎯 QUICK FIX COMMAND SEQUENCE

Copy and paste these commands in order:

```bash
# 1. Navigate to project
cd "Farmers Market Platform web and app"

# 2. Pull environment from Vercel
vercel env pull .env.production.local

# 3. Generate Prisma client
npx prisma generate

# 4. Push database schema
npx dotenv -e .env.production.local -- npx prisma db push --accept-data-loss

# 5. Deploy migrations
npx dotenv -e .env.production.local -- npx prisma migrate deploy

# 6. Verify with Prisma Studio
npx dotenv -e .env.production.local -- npx prisma studio
```

**Expected result:**

- Prisma Studio opens in browser
- Shows all database tables
- Tables are empty (no data yet)

---

## ✅ SUCCESS INDICATORS

### You've successfully fixed the issues when:

1. **Homepage loads** ✅

   ```
   https://farmers-market-psi.vercel.app
   ```

2. **Signup works** ✅

   ```
   https://farmers-market-psi.vercel.app/signup
   Can create account, redirects to dashboard
   ```

3. **Login works** ✅

   ```
   https://farmers-market-psi.vercel.app/login
   Can login, redirects appropriately
   ```

4. **Protected routes work** ✅

   ```
   https://farmers-market-psi.vercel.app/farms
   Either shows farms or "No farms yet" message (not 404!)
   ```

5. **No console errors** ✅
   ```
   Press F12, check Console tab
   No red errors about database or authentication
   ```

---

## 📞 STILL STUCK?

### Get Logs from Vercel

1. Go to: https://vercel.com/gogsias-projects/farmers-market
2. Click "Logs" tab
3. Look for errors in real-time
4. Common errors to look for:
   - "PrismaClient" errors → Database issue
   - "NEXTAUTH" errors → Auth config issue
   - "404" errors → Route doesn't exist

### Check Build Logs

1. Go to: https://vercel.com/gogsias-projects/farmers-market
2. Click "Deployments" tab
3. Click latest deployment
4. Check "Building" tab for errors during build

### Local Testing

Test everything locally first:

```bash
# 1. Use production environment locally
cp .env.production.local .env

# 2. Start dev server
npm run dev

# 3. Test at http://localhost:3000
# 4. Try signup, login, /farms route
# 5. If works locally but not on Vercel → environment variable issue
```

---

## 🎉 POST-FIX STEPS

Once everything works:

### 1. Seed Sample Data (Optional)

```bash
# Add some test data
DATABASE_URL="your-url" npm run seed
```

### 2. Test All Features

- [ ] User registration
- [ ] User login
- [ ] Farm creation
- [ ] Product listing
- [ ] Shopping cart
- [ ] Checkout (if Stripe configured)

### 3. Monitor Logs

Check Vercel logs occasionally:

```
https://vercel.com/gogsias-projects/farmers-market/logs
```

### 4. Set Up Custom Domain (Optional)

Once stable:

- Vercel → Settings → Domains
- Add your custom domain
- Update NEXTAUTH_URL to new domain

---

## 📝 PREVENTION: Avoid This In Future

### Before Deploying:

1. **Always run migrations locally first**

   ```bash
   npx prisma migrate dev
   ```

2. **Test authentication locally**

   ```bash
   npm run dev
   Test signup/login at localhost:3000
   ```

3. **Verify environment variables**

   ```bash
   # Check all required vars exist
   grep -E "DATABASE_URL|NEXTAUTH" .env
   ```

4. **Run build locally**
   ```bash
   npm run build
   npm start
   Test at localhost:3000
   ```

### After Deploying:

1. **Run migrations immediately**

   ```bash
   vercel env pull
   npx prisma migrate deploy
   ```

2. **Test authentication immediately**
   - Try signup
   - Try login
   - Check protected routes

3. **Monitor logs for 10 minutes**
   - Watch for errors
   - Fix issues immediately

---

## 🔗 USEFUL COMMANDS REFERENCE

```bash
# Pull environment variables from Vercel
vercel env pull .env.production.local

# Generate Prisma client
npx prisma generate

# View database schema
npx prisma db pull

# Push schema to database
npx prisma db push

# Deploy migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Redeploy to Vercel
vercel --prod --force

# View logs
vercel logs https://farmers-market-psi.vercel.app

# Check deployment status
vercel inspect https://farmers-market-psi.vercel.app
```

---

## 📊 FINAL CHECKLIST

Before considering this fixed:

- [ ] Database exists and is accessible
- [ ] All database tables created (check with Prisma Studio)
- [ ] Environment variables correct in Vercel
- [ ] NEXTAUTH_URL matches deployment URL
- [ ] Can load homepage without errors
- [ ] Can access /signup page
- [ ] Can create new account successfully
- [ ] Can login with created account
- [ ] Can access /farms without 404
- [ ] No errors in browser console
- [ ] No errors in Vercel logs

---

**Generated:** December 20, 2025  
**Issue:** 404 on /farms & authentication failure  
**Platform:** Farmers Market - Vercel Deployment  
**Status:** 🔧 FIXABLE - Follow steps above

🌾 **Your platform will be working perfectly in minutes!** ✨
