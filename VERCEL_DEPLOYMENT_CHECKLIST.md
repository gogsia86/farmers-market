# 🚀 VERCEL DEPLOYMENT CHECKLIST

## ✅ Pre-Deployment Fixes Applied

### 1. **Fixed `.npmrc` Configuration**

- ❌ **Before**: `script-shell=powershell` (Windows-only)
- ✅ **After**: Removed PowerShell-specific config for cross-platform compatibility
- **Why**: Vercel runs on Linux servers without PowerShell

### 2. **Fixed TypeScript/ESLint Issues**

- ✅ Fixed `middleware.ts` regex escape warning using `String.raw`
- **Why**: Strict type checking in Vercel builds

### 3. **Optimized Build Configuration**

- ✅ Added Vercel region configuration
- ✅ `vercel-build` script properly generates Prisma client
- ✅ `.vercelignore` excludes local development files

---

## 🔧 Required Vercel Dashboard Configuration

### **Environment Variables** (Add in Vercel Dashboard → Settings → Environment Variables)

```env
# ============================================
# CRITICAL - REQUIRED FOR DEPLOYMENT
# ============================================
DATABASE_URL="postgresql://username:password@host:5432/database"
NEXTAUTH_SECRET="generate-random-32-char-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"

# ============================================
# STRIPE PAYMENT (Required if using payments)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ============================================
# OPTIONAL - RECOMMENDED
# ============================================
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_API_URL="https://your-domain.vercel.app/api"
NODE_ENV="production"

# SENTRY (Error Tracking)
SENTRY_DSN="https://..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="farmers-market"

# EMAIL (SMTP)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@yourdomain.com"

# AI SERVICES (Optional)
OPENAI_API_KEY="sk-..."
PERPLEXITY_API_KEY="pplx-..."
```

---

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Recommended)

```bash
# In Vercel Dashboard
1. Go to Storage → Add Database → Postgres
2. Copy DATABASE_URL to environment variables
3. Vercel will automatically configure the connection
```

### Option 2: External PostgreSQL (Neon, Supabase, etc.)

```bash
# Get your DATABASE_URL from your provider
# Format: postgresql://username:password@host:5432/database
# Add to Vercel environment variables
```

### Run Migrations

```bash
# After first deployment, run from local:
npx prisma migrate deploy --preview-feature

# Or add to Vercel build command:
# "npm run vercel-build && npx prisma migrate deploy"
```

---

## 🚀 Deployment Steps

### 1. **Push to GitHub**

```bash
git add .
git commit -m "fix: Vercel deployment configuration"
git push origin master
```

### 2. **Import Project in Vercel**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework Preset: **Next.js** (auto-detected)
4. Root Directory: **Leave empty** (uses root)
5. Build Command: `npm run vercel-build` (from vercel.json)
6. Output Directory: `.next` (from vercel.json)

### 3. **Configure Environment Variables**

1. Settings → Environment Variables
2. Add ALL variables from section above
3. Apply to: **Production, Preview, Development**

### 4. **Deploy**

- Click **Deploy**
- Wait 2-5 minutes for build
- Check build logs for errors

---

## 🔍 Troubleshooting Common Issues

### ❌ **Error: `spawn powershell ENOENT`**

**Solution**: ✅ Fixed in `.npmrc` - removed PowerShell config

### ❌ **Error: Prisma Client not generated**

**Solution**: ✅ Fixed in `vercel.json` - runs `npx prisma generate` in installCommand

### ❌ **Error: Environment variable missing**

**Solution**: Add missing variables in Vercel Dashboard → Settings → Environment Variables

### ❌ **Error: Database connection failed**

**Solution**:

1. Verify `DATABASE_URL` is correct
2. Ensure database accepts connections from Vercel IPs
3. Check if database requires SSL: Add `?sslmode=require` to connection string

### ❌ **Error: Build timeout**

**Solution**:

1. Vercel has 15-minute build limit
2. Optimize build by removing large dependencies
3. Consider using Vercel Pro for longer build times

### ❌ **Error: Module not found after deployment**

**Solution**:

1. Clear Vercel cache: Settings → Delete Cache
2. Redeploy
3. Check `package.json` dependencies are correct

---

## 📊 Post-Deployment Verification

### 1. **Check Build Logs**

```
Vercel Dashboard → Deployments → Latest → View Function Logs
```

### 2. **Test Critical Endpoints**

```bash
# Homepage
curl https://your-domain.vercel.app

# Health check (if implemented)
curl https://your-domain.vercel.app/api/health

# Test API endpoint
curl https://your-domain.vercel.app/api/farms
```

### 3. **Monitor Performance**

- Vercel Dashboard → Analytics
- Check response times
- Monitor error rates

### 4. **Test Database Connection**

```bash
# From Vercel Dashboard → Deployments → Latest → Functions
# Check if Prisma is connecting successfully
```

---

## ⚡ Performance Optimization

### Enable Edge Functions (Optional)

```typescript
// In specific API routes
export const runtime = "edge";
export const preferredRegion = "iad1"; // US East
```

### Configure Caching

```typescript
// In page components
export const revalidate = 3600; // Revalidate every hour
```

### Image Optimization

```typescript
// Already configured in next.config.mjs
// Vercel automatically optimizes images
```

---

## 🛡️ Security Checklist

- ✅ NEXTAUTH_SECRET is random and secure (32+ characters)
- ✅ Environment variables are in Vercel Dashboard (not in code)
- ✅ DATABASE_URL connection uses SSL
- ✅ CORS configured properly in next.config.mjs
- ✅ API routes have proper authentication
- ✅ Rate limiting enabled (if applicable)

---

## 📱 Custom Domain Setup

### 1. **Add Domain in Vercel**

```
Settings → Domains → Add Domain
```

### 2. **Update DNS Records**

```
Type: CNAME
Name: www (or @)
Value: cname.vercel-dns.com
```

### 3. **Update Environment Variables**

```env
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### 4. **Redeploy**

```bash
git push origin master
# Or trigger redeploy in Vercel Dashboard
```

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

- ✅ **Production**: Deploys on push to `master` branch
- ✅ **Preview**: Deploys on pull requests
- ⚙️ **Configure**: Settings → Git → Production Branch

### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from command line
vercel --prod
```

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma on Vercel**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- **Vercel Discord**: https://vercel.com/discord

---

## ✅ Final Checklist

- [ ] All environment variables added to Vercel Dashboard
- [ ] Database accessible from Vercel (check connection string)
- [ ] `vercel.json` configured correctly
- [ ] `.npmrc` doesn't have Windows-specific configs
- [ ] Pushed latest code to GitHub
- [ ] Triggered deployment in Vercel
- [ ] Verified build logs show success
- [ ] Tested deployed site works
- [ ] Checked error tracking (Sentry)
- [ ] Custom domain configured (if applicable)

---

**🎉 Your Farmers Market platform should now be live on Vercel!**

If issues persist, check build logs in Vercel Dashboard for specific error messages.
