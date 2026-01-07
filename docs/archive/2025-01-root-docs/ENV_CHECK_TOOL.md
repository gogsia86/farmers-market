# 🔍 Environment Variables Check Tool

## Quick Access

### Local Development
```bash
# Start your dev server
npm run dev

# Visit the env check page
http://localhost:3001/debug/env-check
```

### Vercel Production
```
https://your-domain.vercel.app/debug/env-check
```

**⚠️ Note:** This tool only works in `NODE_ENV=development` by default for security.

---

## What This Tool Does

The Environment Check Tool shows you:
- ✅ Which environment variables are **set**
- ❌ Which environment variables are **missing**
- 🔒 **Masked values** (first 4 and last 4 chars only - secure!)
- 💡 **Recommendations** for missing variables
- 📊 **Statistics** (total, percentage, critical status)

**Security:** Never shows full values, only confirms if they exist.

---

## Screenshots of What You'll See

### ✅ All Variables Set (Green)
```
┌─────────────────────────────────────────┐
│ 🔍 Environment Variables Check          │
│                                          │
│ Environment: production                  │
│                                          │
│ ┌─────────┬──────┬─────────┬──────────┐│
│ │ Checked │ Set  │ Missing │ Complete ││
│ │   30    │  30  │    0    │   100%   ││
│ └─────────┴──────┴─────────┴──────────┘│
│                                          │
│ ✅ All critical variables are set!      │
│                                          │
│ 🔐 Authentication                        │
│ ✅ NEXTAUTH_SECRET     SET               │
│ ✅ NEXTAUTH_URL        SET               │
│                                          │
│ 🗄️ Database                             │
│ ✅ DATABASE_URL        SET               │
└─────────────────────────────────────────┘
```

### ⚠️ Missing Variables (Red/Yellow)
```
┌─────────────────────────────────────────┐
│ 🔍 Environment Variables Check          │
│                                          │
│ ⚠️ Critical Variables Missing           │
│ NEXTAUTH_SECRET, DATABASE_URL           │
│                                          │
│ 💡 Recommendations:                     │
│ • Generate NEXTAUTH_SECRET: node -e ... │
│ • Set DATABASE_URL to PostgreSQL        │
│                                          │
│ 🔐 Authentication                        │
│ ❌ NEXTAUTH_SECRET     MISSING           │
│ ✅ NEXTAUTH_URL        SET               │
└─────────────────────────────────────────┘
```

---

## How to Use

### Step 1: Access the Tool

**Local:**
```bash
npm run dev
# Open browser to: http://localhost:3001/debug/env-check
```

**Vercel:**
- Just visit: `https://your-domain.vercel.app/debug/env-check`
- If blocked (production), see "Security" section below

### Step 2: Review the Results

Look at these sections:

1. **Summary Stats** (top cards)
   - Total variables checked
   - How many are set
   - How many are missing
   - Completion percentage

2. **Critical Status** (red or green box)
   - Shows if required variables are missing
   - Lists missing critical variables

3. **Recommendations** (yellow box)
   - Actionable steps to fix issues
   - Copy-paste commands

4. **Variable Categories**
   - 🔐 Authentication (Required)
   - 🗄️ Database (Required)
   - 🔧 Build Configuration
   - 📊 Sentry (Optional)
   - ⚡ Redis (Optional)
   - 💳 Stripe (Optional)

### Step 3: Fix Missing Variables

Based on recommendations, set missing variables:

**Local (.env.local):**
```bash
# Create or edit .env.local
NEXTAUTH_SECRET="generated-secret-here"
NEXTAUTH_URL="http://localhost:3001"
DATABASE_URL="postgresql://..."
```

**Vercel (Dashboard):**
1. Go to: Project → Settings → Environment Variables
2. Click "Add New"
3. Enter variable name and value
4. Select environments (Production, Preview, Development)
5. Click "Save"
6. Redeploy

### Step 4: Verify the Fix

Refresh the env-check page:
```
http://localhost:3001/debug/env-check
```

You should see:
- ✅ Green checkmarks on previously missing variables
- ✅ Updated completion percentage
- ✅ "All critical variables are set!" message

---

## Variable Categories Explained

### 🔐 Authentication (Required)
These are **critical** for login to work:
- `NEXTAUTH_SECRET` - 32+ character secret (generate with crypto)
- `NEXTAUTH_URL` - Your app URL (e.g., http://localhost:3001)
- `NEXT_PUBLIC_APP_URL` - Public app URL

**Without these:** Login page will show blank or error

### 🗄️ Database (Required)
- `DATABASE_URL` - PostgreSQL connection string

**Without this:** App won't start, API routes fail

### 🔧 Build Configuration
- `NODE_ENV` - Environment (development/production)
- `TURBOPACK` - Set to "0" to use webpack
- `SENTRY_UPLOAD_DRY_RUN` - Disable Sentry uploads
- `NEXT_DISABLE_SOURCEMAPS` - Disable source maps

**Impact:** Build behavior and optimizations

### 📊 Sentry (Optional)
- `SENTRY_DSN` - Error tracking (server)
- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking (client)
- `SENTRY_AUTH_TOKEN` - Source map uploads

**Without these:** No error tracking (but app works)

### ⚡ Redis (Optional)
- `REDIS_HOST` - Redis server hostname
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password

**Without these:** No caching (slower, but works)

### 💳 Stripe (Optional)
- `STRIPE_SECRET_KEY` - Stripe API key (server)
- `STRIPE_PUBLISHABLE_KEY` - Stripe API key (client)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Public key

**Without these:** Payment features won't work

---

## Security Features

### 1. Masked Values
Full values are **never shown**. Only displays:
```
NEXTAUTH_SECRET: "AbCd...XyZ9" (48 chars)
```

### 2. Development Only
By default, only works when:
- `NODE_ENV=development`, OR
- Special header `x-debug-token` is provided

### 3. Production Access
If you need to check Vercel production variables:

**Option A:** Set DEBUG_TOKEN in Vercel
```bash
# In Vercel dashboard, add:
DEBUG_TOKEN="your-secret-token"
```

Then use:
```bash
curl -H "x-debug-token: your-secret-token" \
  https://your-domain.vercel.app/api/debug/env-check
```

**Option B:** Temporarily set NODE_ENV=development in Vercel
- Settings → Environment Variables
- Add: `NODE_ENV=development` (only for debugging)
- Visit: `https://your-domain.vercel.app/debug/env-check`
- **Remember to remove** `NODE_ENV=development` after checking!

---

## Common Issues

### Issue: "This endpoint is only available in development mode"

**Cause:** Running in production without debug token

**Fix:**
1. Check if running locally: `npm run dev`
2. If on Vercel, set `DEBUG_TOKEN` environment variable
3. Or temporarily set `NODE_ENV=development` (remember to remove!)

### Issue: Tool shows "0% complete"

**Cause:** No environment variables are being loaded

**Fix:**
1. Check if `.env.local` exists (local)
2. Restart dev server after creating/editing `.env.local`
3. On Vercel, verify variables are set in dashboard
4. Check variable names match exactly (case-sensitive)

### Issue: Critical variables show as "set" but login still fails

**Cause:** Variables are set but values might be incorrect

**Fix:**
1. Check the masked value length matches expected
2. Verify `NEXTAUTH_SECRET` is at least 32 characters
3. Verify `NEXTAUTH_URL` matches your actual URL
4. Test `DATABASE_URL` connection separately

---

## API Endpoint

You can also access the raw JSON data:

```bash
# GET request
curl http://localhost:3001/api/debug/env-check

# Response
{
  "success": true,
  "timestamp": "2025-01-XX...",
  "environment": "development",
  "vercel": {
    "isVercel": false,
    "env": null,
    "url": "not set"
  },
  "summary": {
    "totalChecked": 30,
    "totalSet": 25,
    "totalMissing": 5,
    "percentageSet": 83
  },
  "critical": {
    "allCriticalSet": true,
    "missingCritical": []
  },
  "variables": {
    "NEXTAUTH_SECRET": {
      "exists": true,
      "masked": "AbCd...XyZ9",
      "length": 48
    },
    "DATABASE_URL": {
      "exists": false
    }
  },
  "recommendations": [...]
}
```

---

## Automated Checks

You can integrate this into CI/CD:

```bash
#!/bin/bash
# check-env.sh

# Fetch env check
response=$(curl -s http://localhost:3001/api/debug/env-check)

# Parse critical status
all_set=$(echo $response | jq -r '.critical.allCriticalSet')

if [ "$all_set" != "true" ]; then
  echo "❌ Critical environment variables missing!"
  echo $response | jq -r '.critical.missingCritical[]'
  exit 1
fi

echo "✅ All critical environment variables are set"
```

---

## Disable in Production

**Important:** For security, disable this tool in production.

**Option 1:** Add middleware check

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/debug') &&
      process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
```

**Option 2:** Remove the routes entirely before deploying to production

```bash
# Before production build
rm -rf src/app/debug
rm -rf src/app/api/debug
```

---

## Related Documentation

- **BLANK_PAGE_FIX.md** - Fixing blank login page issue
- **VERCEL_DEPLOYMENT_GUIDE.md** - Full deployment guide
- **.env.local** - Create this file for local environment variables

---

## Quick Checklist

Use this to verify your setup:

### Local Development
- [ ] `.env.local` file exists in project root
- [ ] `NEXTAUTH_SECRET` is set (32+ chars)
- [ ] `NEXTAUTH_URL` is set to `http://localhost:3001`
- [ ] `DATABASE_URL` is set (valid connection string)
- [ ] Dev server restarted after adding variables
- [ ] Visit `/debug/env-check` shows green checkmarks
- [ ] Visit `/login` shows login form (not blank)

### Vercel Production
- [ ] All variables set in Vercel dashboard
- [ ] Applied to Production, Preview, Development
- [ ] `NEXTAUTH_URL` matches production domain
- [ ] Deployment successful
- [ ] Visit `/debug/env-check` confirms variables
- [ ] Login page works on production

---

## Quick Commands

```bash
# Check env vars locally
npm run dev
# Visit: http://localhost:3001/debug/env-check

# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Check API endpoint
curl http://localhost:3001/api/debug/env-check | jq

# Test if critical vars are set
curl -s http://localhost:3001/api/debug/env-check | \
  jq -r '.critical.allCriticalSet'
```

---

**Last Updated:** 2025-01-XX
**Status:** Active Development Tool
**Security:** Development only by default
