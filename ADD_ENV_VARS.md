# 🔐 Add Environment Variables to Vercel

**Generated**: December 26, 2024
**Status**: 🚨 CRITICAL - All 3 required variables are missing!

---

## 🎯 What You Need to Do

You need to add environment variables to your Vercel project. Follow these steps **in order**:

---

## 📋 Step-by-Step Instructions

### 1️⃣ Add NEXTAUTH_SECRET (REQUIRED)

```bash
npx vercel env add NEXTAUTH_SECRET production
```

When prompted, paste this value:
```
oBeAjncE3rO5Jp6bEDTS5/0WFj7FhLS78f5/PJXQPD4=
```

✅ **What this does**: Encrypts JWT tokens for user authentication

---

### 2️⃣ Add DATABASE_URL (REQUIRED)

```bash
npx vercel env add DATABASE_URL production
```

**You need to get this from your database provider:**

#### If using Neon.tech:
1. Go to: https://console.neon.tech/
2. Select your project
3. Copy the connection string
4. Format: `postgresql://user:password@host/database?sslmode=require`

#### If using Supabase:
1. Go to: https://app.supabase.com/
2. Project Settings → Database → Connection String (URI)
3. Copy the connection string

#### If using another provider:
- Make sure it includes `?sslmode=require` at the end
- Format: `postgresql://username:password@hostname:5432/database?sslmode=require`

**Example**:
```
postgresql://myuser:mypassword@ep-cool-name-123456.us-east-1.aws.neon.tech/farmersmarket?sslmode=require
```

---

### 3️⃣ Add NEXTAUTH_URL (REQUIRED)

```bash
npx vercel env add NEXTAUTH_URL production
```

When prompted, enter your Vercel deployment URL:
```
https://farmers-market-platform-3g0pqr60f-gogsias-projects.vercel.app
```

Or if you have a custom domain:
```
https://yourdomain.com
```

✅ **What this does**: Tells NextAuth where your app is deployed

---

### 4️⃣ Add ENABLE_TRACING (RECOMMENDED)

```bash
npx vercel env add ENABLE_TRACING production
```

When prompted, enter:
```
false
```

✅ **What this does**: Disables OpenTelemetry tracing (not configured yet)

---

### 5️⃣ Add NODE_ENV (RECOMMENDED)

```bash
npx vercel env add NODE_ENV production
```

When prompted, enter:
```
production
```

---

### 6️⃣ Add NEXT_PUBLIC_APP_URL (RECOMMENDED)

```bash
npx vercel env add NEXT_PUBLIC_APP_URL production
```

When prompted, enter your deployment URL:
```
https://farmers-market-platform-3g0pqr60f-gogsias-projects.vercel.app
```

---

## 🚀 After Adding Variables

### Verify Everything is Set

```bash
npx vercel env ls production
```

You should see:
- ✅ DATABASE_URL
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL
- ✅ ENABLE_TRACING
- ✅ NODE_ENV
- ✅ NEXT_PUBLIC_APP_URL

---

### Redeploy to Apply Changes

```bash
# Commit code fixes
git add -A
git commit -m "fix: deployment warnings and environment configuration"
git push origin master
```

Or trigger a redeploy manually:
```bash
npx vercel --prod
```

---

### Monitor the Deployment

```bash
# Watch logs in real-time
npx vercel logs --follow
```

---

### Test the Health Endpoint

After deployment completes (wait ~2 minutes):

```bash
curl https://farmers-market-platform-3g0pqr60f-gogsias-projects.vercel.app/api/health
```

**Expected response**:
```json
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

## 🆘 Troubleshooting

### If DATABASE_URL fails:

**Error**: "Can't reach database server"

**Solution**:
1. Check if connection string is correct
2. Ensure `?sslmode=require` is included
3. Check IP allowlist in your database provider
4. For Vercel, usually need to allow `0.0.0.0/0` (all IPs)

**Test locally**:
```bash
DATABASE_URL="your-connection-string" npx prisma db pull
```

---

### If NEXTAUTH_SECRET fails:

**Error**: "NEXTAUTH_SECRET is required"

**Solution**:
- Make sure you copied the entire base64 string including the `=` at the end
- Regenerate if needed: `openssl rand -base64 32`

---

### If deployment still fails:

1. **Check the logs**:
   ```bash
   npx vercel logs https://your-deployment-url.vercel.app
   ```

2. **Run diagnostics**:
   ```bash
   ./scripts/diagnose-deployment.sh
   ```

3. **Test health endpoint**:
   ```bash
   curl https://your-domain.vercel.app/api/health | jq
   ```

---

## 📊 Quick Checklist

Before proceeding, make sure you have:

- [ ] Access to Vercel CLI (`npx vercel whoami` works)
- [ ] Database connection string ready
- [ ] Deployment URL from Vercel dashboard
- [ ] Generated NEXTAUTH_SECRET (provided above)

---

## 🎯 Expected Timeline

- Adding environment variables: **5 minutes**
- Committing and pushing code: **2 minutes**
- Vercel build and deployment: **2 minutes**
- Testing health endpoint: **1 minute**

**Total**: ~10 minutes to fully working deployment! 🚀

---

## 📞 Next Steps After Success

Once your health endpoint returns `"status": "healthy"`:

1. **Test the homepage**:
   ```bash
   curl https://your-domain.vercel.app/
   ```

2. **Test authentication**:
   ```bash
   curl https://your-domain.vercel.app/api/auth/session
   ```

3. **Test API endpoints**:
   ```bash
   curl https://your-domain.vercel.app/api/farms
   ```

4. **Visit in browser**:
   - Homepage: https://your-domain.vercel.app
   - Login: https://your-domain.vercel.app/login
   - Health: https://your-domain.vercel.app/api/health

---

## 🎉 Success Indicators

You'll know everything works when:

✅ Build completes without errors
✅ Deployment shows "Ready"
✅ Health endpoint returns `"status": "healthy"`
✅ Homepage loads without "Application error"
✅ No runtime errors in Vercel logs

---

**Generated Secret** (save this!):
```
oBeAjncE3rO5Jp6bEDTS5/0WFj7FhLS78f5/PJXQPD4=
```

**Start with this command**:
```bash
npx vercel env add NEXTAUTH_SECRET production
```

Then paste the secret above when prompted! 🔐
