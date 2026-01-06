# 🚀 Deployment Fix Checklist - IMMEDIATE ACTIONS

**Date**: December 26, 2024
**Status**: ⚠️ RUNTIME ERROR - Build succeeds but app crashes
**Priority**: 🔴 CRITICAL

---

## ⚡ QUICK FIX STEPS (Do This First!)

### 1️⃣ Apply Code Fixes (5 minutes)

```bash
# Install correct nodemailer version
npm install nodemailer@^6.9.16 @types/nodemailer@^6.4.16

# Commit changes
git add package.json package-lock.json vercel.json VERCEL_BUILD_FIXES.md
git commit -m "fix: resolve Vercel build warnings and dependency conflicts"
git push origin master
```

### 2️⃣ Check Vercel Environment Variables (2 minutes)

```bash
# List current variables
npx vercel env ls production

# Required variables (MUST have these):
# ✅ DATABASE_URL
# ✅ NEXTAUTH_SECRET
# ✅ NEXTAUTH_URL

# Add missing variables:
npx vercel env add DATABASE_URL production
npx vercel env add NEXTAUTH_SECRET production
npx vercel env add NEXTAUTH_URL production
```

### 3️⃣ Add Safety Variables (1 minute)

```bash
# Disable tracing if not configured
npx vercel env add ENABLE_TRACING production
# Enter: false

# Optional: Disable Sentry warnings
npx vercel env add SENTRY_DSN production
# Enter: (leave empty, press Enter)
```

### 4️⃣ Test Health Endpoint (After deployment)

```bash
# Wait for deployment to complete, then:
curl https://your-domain.vercel.app/api/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "checks": { ... }
# }
```

---

## 🔍 Diagnose Runtime Error

### Get Logs from Vercel

```bash
# Real-time logs
npx vercel logs --follow

# Or visit Vercel Dashboard:
# https://vercel.com/[your-team]/farmers-market-platform/deployments
# → Click latest deployment → "Runtime Logs" tab
```

### Common Errors & Solutions

| Error Message | Cause | Fix |
|---------------|-------|-----|
| `Can't reach database server` | DATABASE_URL missing/wrong | Check connection string format |
| `NEXTAUTH_SECRET is required` | Missing auth secret | Add to environment variables |
| `Failed to initialize tracing` | OpenTelemetry misconfigured | Set `ENABLE_TRACING=false` |
| `Prisma Client not generated` | Build issue | Redeploy (should fix automatically) |
| `Module not found: @/lib/database` | Import path issue | Check `tsconfig.json` paths |

---

## 📋 Environment Variables Checklist

### ✅ Required (App won't start without these)

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

### 🟡 Recommended (Prevents warnings)

```bash
ENABLE_TRACING="false"
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

### 🟢 Optional (Features work without these)

```bash
SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
GOOGLE_MAPS_API_KEY=""
```

---

## 🧪 Local Testing Before Deploy

```bash
# 1. Use production DATABASE_URL locally
export DATABASE_URL="your-production-url"

# 2. Generate Prisma Client
npx prisma generate

# 3. Build for production
npm run build

# 4. Start production server
npm start

# 5. Test in browser
open http://localhost:3001

# 6. Test health endpoint
curl http://localhost:3001/api/health
```

---

## 🚨 If Still Failing

### Database Connection Issues (Most Common)

**Symptom**: "Can't reach database server" or "Connection timeout"

**Solutions**:

1. **Check SSL mode**:
   ```
   DATABASE_URL="postgresql://...?sslmode=require"
   ```

2. **Use connection pooling** (Vercel Postgres/Supabase):
   ```bash
   # Add pooling parameter
   DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1"
   ```

3. **Test connection**:
   ```bash
   # Locally with production URL
   DATABASE_URL="your-url" npx prisma db pull
   ```

4. **Check IP allowlist** (if using managed database):
   - Go to database provider dashboard
   - Allow connections from: `0.0.0.0/0` (all IPs) for Vercel

### Middleware/Instrumentation Crash

**Symptom**: "Application error" with no specific message

**Quick fix**:
```typescript
// instrumentation.ts - Simplify to minimal version
export async function register() {
  console.log("✅ Instrumentation registered");
  // Remove all imports and tracing code temporarily
}
```

### NextAuth Configuration Error

**Symptom**: "Invalid configuration" or auth-related errors

**Check** `src/lib/auth/config.ts`:
```typescript
// Ensure these are set
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET must be set");
}

if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === "production") {
  throw new Error("NEXTAUTH_URL must be set in production");
}
```

---

## 📊 Verification Steps

After deploying fixes:

- [ ] Build completes without errors
- [ ] Build warnings reduced (node version, nodemailer, memory)
- [ ] Deployment succeeds
- [ ] Homepage loads (`GET /`)
- [ ] Health check passes (`GET /api/health`)
- [ ] Auth endpoints work (`GET /api/auth/session`)
- [ ] Database queries work (`GET /api/farms`)

---

## 🎯 Success Criteria

```json
// GET /api/health should return:
{
  "status": "healthy",
  "checks": {
    "database": { "status": "pass" },
    "environment": { "status": "pass" },
    "prisma": { "status": "pass" },
    "nextAuth": { "status": "pass" },
    "tracing": { "status": "pass" }
  }
}
```

---

## 📞 Next Steps if Still Blocked

1. **Share logs**:
   ```bash
   npx vercel logs [deployment-url] > logs.txt
   ```

2. **Check health endpoint**:
   ```bash
   curl https://your-domain.vercel.app/api/health | jq
   ```

3. **Test database separately**:
   ```bash
   DATABASE_URL="your-url" npx prisma studio
   ```

4. **Rollback if needed**:
   ```bash
   # In Vercel dashboard: Deployments → Previous → "Promote to Production"
   ```

---

## 📝 Changes Made

### Files Modified:
- ✅ `package.json` - Fixed node version, downgraded nodemailer
- ✅ `vercel.json` - Removed memory settings
- ✅ `VERCEL_BUILD_FIXES.md` - Comprehensive troubleshooting guide

### Files Created:
- ✅ `src/app/api/health/route.ts` - Health check endpoint
- ✅ `DEPLOYMENT_FIX_CHECKLIST.md` - This file

### Commands to Run:
```bash
npm install
git add -A
git commit -m "fix: deployment warnings and add health check"
git push origin master
```

---

## ⏱️ Timeline

| Step | Time | Status |
|------|------|--------|
| Apply code fixes | 5 min | ⏳ Pending |
| Check environment variables | 2 min | ⏳ Pending |
| Deploy to Vercel | 2 min | ⏳ Pending |
| Verify deployment | 1 min | ⏳ Pending |
| **Total** | **~10 min** | |

---

**Remember**: The build succeeds ✅, so the issue is runtime environment configuration, not code!

**Most likely fix**: Add missing `NEXTAUTH_SECRET` and set `ENABLE_TRACING=false`

---

*Last Updated: December 26, 2024*
*Reference: VERCEL_BUILD_FIXES.md for detailed explanations*
