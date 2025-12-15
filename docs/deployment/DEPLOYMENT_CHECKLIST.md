# 🚀 Vercel Deployment Checklist

**Farmers Market Platform - Quick Deployment Guide**

---

## 📋 Pre-Deployment Checklist

### ✅ Code Readiness

- [x] Next.js 16.0.7 configured
- [x] TypeScript strict mode enabled
- [x] All tests passing
- [x] Build successful locally (`npm run build`)
- [x] Production build tested (`npm run start`)
- [x] No console errors in production build
- [x] Git repository clean and pushed

### ✅ Configuration Files

- [x] `package.json` - `vercel-build` script present
- [x] `next.config.mjs` - Optimized for production
- [x] `tsconfig.json` - Proper path aliases
- [x] `prisma/schema.prisma` - Database configured
- [x] `.gitignore` - Secrets excluded
- [x] `.vercelignore` - Build artifacts excluded
- [x] `vercel.json` - Created (optional but recommended)

---

## 🔐 Environment Variables Setup

### Step 1: Prepare Environment Variables

Copy this template and fill in your values:

```env
# ============================================
# REQUIRED - Database
# ============================================
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?pgbouncer=true&connection_limit=1"

# ============================================
# REQUIRED - Authentication
# ============================================
NEXTAUTH_SECRET="[Generate with: openssl rand -base64 32]"
NEXTAUTH_URL="https://your-domain.vercel.app"

# ============================================
# REQUIRED - Node Environment
# ============================================
NODE_ENV="production"

# ============================================
# REQUIRED - Payments (for checkout to work)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ============================================
# RECOMMENDED - File Upload
# ============================================
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# ============================================
# RECOMMENDED - Email
# ============================================
EMAIL_SERVER="smtp://user:pass@smtp.provider.com:587"
EMAIL_FROM="noreply@yourdomain.com"

# ============================================
# RECOMMENDED - Error Tracking
# ============================================
SENTRY_DSN="https://...@sentry.io/..."
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."

# ============================================
# RECOMMENDED - Rate Limiting
# ============================================
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# ============================================
# OPTIONAL - AI Features
# ============================================
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
AZURE_OPENAI_API_KEY="..."
AZURE_OPENAI_ENDPOINT="https://..."

# ============================================
# OPTIONAL - Monitoring
# ============================================
ENABLE_TRACING="false"
AZURE_MONITOR_CONNECTION_STRING="..."
```

### Step 2: Add to Vercel

1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add each variable above
4. Select environment: **Production**, **Preview**, **Development**

---

## 🗄️ Database Setup

### Option A: Vercel Postgres (Recommended - Easiest)

```bash
# In Vercel Dashboard
1. Storage tab
2. Create Database → Postgres
3. DATABASE_URL automatically added to environment variables
4. No additional configuration needed!
```

### Option B: Supabase (Free Tier Available)

```bash
1. Create account at https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string (Connection Pooling mode)
5. Add ?pgbouncer=true&connection_limit=1 to the end
6. Add to Vercel environment variables as DATABASE_URL
```

### Option C: Neon (Serverless Postgres)

```bash
1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Add ?pgbouncer=true&connection_limit=1 to the end
5. Add to Vercel environment variables as DATABASE_URL
```

### Option D: Railway

```bash
1. Create account at https://railway.app
2. New Project → PostgreSQL
3. Copy connection string from Variables tab
4. Add ?pgbouncer=true&connection_limit=1 to the end
5. Add to Vercel environment variables as DATABASE_URL
```

---

## 🚀 Deployment Methods

### Method 1: GitHub Integration (Recommended)

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for production deployment"
git push origin main

# 2. Import in Vercel
# - Go to https://vercel.com/new
# - Select your repository
# - Vercel auto-detects Next.js
# - Add environment variables
# - Click Deploy

# 3. Done! 🎉
# Vercel will automatically deploy on every push to main
```

### Method 2: Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link project (first time only)
vercel link

# 4. Add environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add STRIPE_SECRET_KEY production
# ... add all required variables

# 5. Deploy to production
vercel --prod

# 6. Done! 🎉
```

---

## 🗃️ Post-Deployment: Database Migration

### After First Deployment

```bash
# Method 1: Local migration (recommended)
# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Method 2: Via Vercel CLI
vercel exec npx prisma migrate deploy

# Method 3: One-time serverless function
# Create src/app/api/migrate/route.ts (delete after use!)
```

### Seed Database (Optional)

```bash
# Pull environment variables
vercel env pull .env.local

# Seed basic data
npm run db:seed:basic

# Or comprehensive seed
npm run db:seed
```

---

## ✅ Post-Deployment Testing

### Immediate Tests (5 minutes)

- [ ] Visit deployment URL: `https://your-app.vercel.app`
- [ ] Check homepage loads
- [ ] Test navigation
- [ ] Check `/api/health` endpoint (should return 200)
- [ ] View browser console (no errors)

### Authentication Flow (10 minutes)

- [ ] Go to `/signup`
- [ ] Create test account
- [ ] Verify email sent (if configured)
- [ ] Login with credentials
- [ ] Check session persists
- [ ] Test logout

### Core Features (15 minutes)

- [ ] Browse farms page
- [ ] View farm details
- [ ] Browse products
- [ ] Add product to cart
- [ ] View cart
- [ ] Update cart quantities
- [ ] Start checkout process
- [ ] Test payment (use Stripe test card)

### Admin Panel (5 minutes)

- [ ] Login as admin (create admin via seed or database)
- [ ] Access `/admin` dashboard
- [ ] View metrics
- [ ] Test farm approval (if applicable)

### Performance Check (5 minutes)

- [ ] Run Lighthouse audit
- [ ] Check Vercel Analytics dashboard
- [ ] Review Speed Insights
- [ ] Check build logs for warnings

---

## 🔍 Monitoring Setup

### Vercel Analytics

```bash
# Already installed and configured
# View in Vercel Dashboard → Analytics
- Page views
- Top pages
- Traffic sources
- Real user metrics
```

### Sentry Error Tracking

```bash
# 1. Create Sentry account (if not done)
# 2. Create new project (Next.js)
# 3. Copy DSN
# 4. Add to Vercel environment variables:
#    - SENTRY_DSN
#    - NEXT_PUBLIC_SENTRY_DSN
# 5. Redeploy
# 6. Errors will appear in Sentry dashboard
```

### Health Check Monitoring

```bash
# Set up external monitoring (optional):
# - UptimeRobot (free)
# - Pingdom
# - Better Uptime

# Monitor: https://your-app.vercel.app/api/health
# Alert if response is not 200
```

---

## 🌐 Custom Domain Setup

### Steps:

1. **Purchase Domain**
   - Namecheap, Google Domains, Cloudflare, etc.

2. **Add to Vercel**

   ```
   Project Settings → Domains → Add Domain
   Enter: yourdomain.com
   ```

3. **Configure DNS**

   **Option A: Vercel Nameservers (Easiest)**

   ```
   Point your domain's nameservers to:
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

   **Option B: A/CNAME Records**

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Wait for SSL**
   - Automatic (2-5 minutes)
   - Let's Encrypt certificate

5. **Update Environment Variable**

   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   ```

6. **Redeploy**
   ```bash
   vercel --prod
   ```

---

## 🚨 Troubleshooting

### Build Fails

```bash
# Check build logs in Vercel Dashboard
# Common issues:

# 1. TypeScript errors
npm run type-check

# 2. Lint errors
npm run lint

# 3. Missing dependencies
npm install

# 4. Prisma generation fails
npx prisma generate

# 5. Environment variable missing
# Check Vercel dashboard → Environment Variables
```

### Database Connection Fails

```bash
# 1. Verify DATABASE_URL is set
vercel env ls

# 2. Check connection string format
# Should include: ?pgbouncer=true&connection_limit=1

# 3. Test connection locally
vercel env pull .env.local
npm run dev
# Try accessing /api/health

# 4. Check database is running and accessible
# Verify IP whitelist if using external DB
```

### Authentication Not Working

```bash
# 1. Verify NEXTAUTH_SECRET is set (32+ characters)
vercel env ls

# 2. Verify NEXTAUTH_URL matches deployment URL
echo $NEXTAUTH_URL  # Should be https://your-domain.vercel.app

# 3. Check callback URLs in external providers (Google, GitHub, etc.)

# 4. Clear browser cookies and try again
```

### Stripe Payments Fail

```bash
# 1. Verify Stripe keys are for correct mode
# Test: pk_test_... and sk_test_...
# Live: pk_live_... and sk_live_...

# 2. Verify webhook endpoint is configured
# Stripe Dashboard → Webhooks → Add endpoint
# URL: https://your-domain.vercel.app/api/webhooks/stripe
# Events: payment_intent.succeeded, checkout.session.completed

# 3. Verify STRIPE_WEBHOOK_SECRET matches webhook secret
```

### Images Not Loading

```bash
# 1. Check next.config.mjs → images.remotePatterns
# Add your image CDN domain

# 2. For Cloudinary, verify environment variables:
# - CLOUDINARY_CLOUD_NAME
# - CLOUDINARY_API_KEY
# - CLOUDINARY_API_SECRET

# 3. Check browser console for CSP errors
```

---

## 📊 Performance Optimization

### After Deployment, Check:

```bash
# 1. Run Lighthouse audit
# Target scores:
# - Performance: >90
# - Accessibility: >95
# - Best Practices: >95
# - SEO: >90

# 2. Check bundle size
npm run build
# Review .next/static/chunks/

# 3. Analyze with Vercel Analytics
# - Core Web Vitals
# - Page load times
# - Geographic distribution

# 4. Check function execution time
# Vercel Dashboard → Functions
# Target: <200ms for most routes
```

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Homepage loads in <2 seconds
- ✅ `/api/health` returns 200 with database status "up"
- ✅ User can sign up and log in
- ✅ Farms and products display correctly
- ✅ Cart functionality works
- ✅ Checkout creates orders (test mode)
- ✅ No console errors
- ✅ Lighthouse score >85
- ✅ Vercel Analytics tracking
- ✅ Errors appear in Sentry (if configured)

---

## 📞 Support Resources

### Official Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

### Project Documentation

- `README.md` - Quick start guide
- `VERCEL_DEPLOYMENT_ANALYSIS.md` - Detailed deployment analysis
- `docs/deployment/ENV-SETUP-GUIDE.md` - Environment variables

### Get Help

- **Vercel Support**: https://vercel.com/help
- **Vercel Discord**: https://vercel.com/discord
- **Next.js Discord**: https://nextjs.org/discord

---

## 🎉 You're Ready!

Run this final command when all checklist items are complete:

```bash
# Deploy to production
vercel --prod

# Or push to GitHub (if using GitHub integration)
git push origin main
```

**Estimated Total Time: 45-60 minutes**

---

**Good luck with your deployment! 🚀🌾**

_"Deploy with confidence, scale with grace."_
