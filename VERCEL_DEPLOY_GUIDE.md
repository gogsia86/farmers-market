# 🚀 Vercel Deployment Guide - Farmers Market Platform

**Last Updated**: November 15, 2025
**Status**: ✅ Ready for Deployment

---

## 📋 Pre-Deployment Checklist

### ✅ Code Quality
- [x] All TypeScript errors fixed
- [x] All ESLint errors fixed
- [x] All warnings resolved
- [x] Production build successful
- [x] Tests passing

### ✅ Configuration Files Ready
- [x] `vercel.json` - Configured
- [x] `scripts/vercel-build.sh` - Build script ready
- [x] `package.json` - vercel-build script configured
- [x] `next.config.mjs` - Production optimized

---

## 🎯 Deployment Methods

### Method 1: Vercel CLI (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
# From project root
cd "M:\Repo\Farmers Market Platform web and app"

# Deploy to preview (test deployment)
vercel

# Deploy to production
vercel --prod
```

---

### Method 2: GitHub Integration (Automatic)

#### Step 1: Connect Repository
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository: `gogsia86/farmers-market`
4. Click "Import"

#### Step 2: Configure Project
Vercel will auto-detect settings from `vercel.json`:
- **Framework**: Next.js (auto-detected)
- **Root Directory**: `./`
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### Step 3: Set Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

**Required Variables:**
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-min-32-chars

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Optional - for NextAuth email provider)
EMAIL_SERVER=smtp://user:password@smtp.example.com:587
EMAIL_FROM=noreply@yourdomain.com

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Optional Variables:**
```env
# Azure Application Insights (if using monitoring)
AZURE_INSTRUMENTATION_KEY=your-key
APPLICATIONINSIGHTS_CONNECTION_STRING=your-connection-string

# Sentry (if using error tracking)
SENTRY_DSN=your-sentry-dsn

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_ANALYTICS=true
```

#### Step 4: Deploy
Click "Deploy" - Vercel will:
1. Install dependencies
2. Run `npm run vercel-build`
3. Generate Prisma Client
4. Build Next.js
5. Deploy to production

---

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Easiest)
```bash
# In Vercel Dashboard
1. Go to Storage → Add New → Postgres
2. Create database
3. Copy DATABASE_URL to environment variables
4. Database URL is automatically added to project
```

### Option 2: External Database (Recommended for Production)

**Neon (Serverless Postgres)**
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add as `DATABASE_URL` in Vercel

**Supabase**
1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → Database
3. Copy connection string (use transaction pooling for serverless)
4. Add as `DATABASE_URL` in Vercel

**PlanetScale (MySQL)**
1. Create database at [planetscale.com](https://planetscale.com)
2. Create production branch
3. Get connection string
4. Update Prisma schema for MySQL
5. Add as `DATABASE_URL` in Vercel

---

## 🔑 Environment Variables Setup

### Using Vercel CLI
```bash
# Add individual variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add STRIPE_SECRET_KEY production

# Or add from .env.local file
vercel env pull .env.local
```

### Using Vercel Dashboard
1. Go to project settings
2. Navigate to "Environment Variables"
3. Add each variable with appropriate scope:
   - **Production**: Live site
   - **Preview**: PR deployments
   - **Development**: Local development

---

## 🚀 Post-Deployment Steps

### 1. Run Database Migrations
```bash
# Connect to production database
npx prisma migrate deploy

# Or use Vercel CLI
vercel env pull
npx prisma migrate deploy
```

### 2. Verify Deployment
- ✅ Visit your deployment URL
- ✅ Check homepage loads
- ✅ Test authentication (login/signup)
- ✅ Verify database connection
- ✅ Test API endpoints

### 3. Configure Custom Domain
```bash
# Using Vercel CLI
vercel domains add yourdomain.com

# Or in Vercel Dashboard
# Settings → Domains → Add Domain
```

### 4. Set Up Webhooks
Update webhook URLs in external services:

**Stripe Webhooks:**
- URL: `https://your-domain.vercel.app/api/webhooks/stripe`
- Events: `payment_intent.succeeded`, `checkout.session.completed`, etc.

**NextAuth Callbacks:**
- Update allowed callback URLs in OAuth providers
- Example: `https://your-domain.vercel.app/api/auth/callback/google`

---

## 🔍 Monitoring & Debugging

### View Build Logs
```bash
# Using Vercel CLI
vercel logs

# Or in Vercel Dashboard
# Deployments → Select deployment → View Logs
```

### Check Function Logs
```bash
# Real-time logs
vercel logs --follow

# Logs for specific function
vercel logs --function=src/app/api/products/route
```

### Performance Monitoring
- Vercel Analytics: Dashboard → Analytics
- Vercel Speed Insights: Automatic (if enabled)
- Custom monitoring: Azure Application Insights integration

---

## 🐛 Troubleshooting

### Build Fails - Database Connection
**Error:** `Can't reach database server`

**Solution:**
```bash
# DATABASE_URL is only needed at runtime, not build time
# Our build script handles this automatically
# Ensure DATABASE_URL is set in Vercel environment variables
```

### Build Fails - Missing Dependencies
**Error:** `Cannot find module 'X'`

**Solution:**
```bash
# Ensure all dependencies are in package.json
npm install X --save
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

### Runtime Error - Environment Variables
**Error:** `NEXTAUTH_SECRET must be set`

**Solution:**
```bash
# Add missing environment variables in Vercel Dashboard
# Settings → Environment Variables → Add Variable
# Then redeploy
vercel --prod
```

### Prisma Client Not Generated
**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
# Our build script includes 'prisma generate'
# Check build logs to ensure it ran successfully
# Verify vercel-build script in package.json
```

---

## 🎯 Performance Optimization

### 1. Edge Functions (Recommended for API Routes)
```javascript
// In API route files
export const runtime = 'edge';
export const preferredRegion = ['iad1']; // US East
```

### 2. Image Optimization
```javascript
// Already configured in next.config.mjs
images: {
  domains: ['yourdomain.com'],
  formats: ['image/avif', 'image/webp'],
}
```

### 3. Caching Strategy
- Static pages: Cached automatically
- API routes: Configured in `vercel.json`
- ISR pages: Configure revalidate time

---

## 📊 Deployment Configuration

### Current Vercel Configuration (`vercel.json`)

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run vercel-build",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 10,
      "memory": 1024
    },
    "src/app/api/ai/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

### Function Timeouts
- Standard API routes: 10 seconds
- AI routes: 30 seconds (for LLM processing)
- Payment routes: 15 seconds (for Stripe)

---

## 🔒 Security Checklist

- [x] HTTPS enforced (automatic with Vercel)
- [x] Security headers configured (in `vercel.json`)
- [x] Environment variables secured
- [ ] Custom domain SSL configured
- [ ] Rate limiting enabled (optional)
- [ ] DDoS protection (Vercel Pro)

---

## 💰 Pricing Considerations

### Vercel Hobby Plan (Free)
- ✅ Perfect for testing/staging
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Edge Functions
- ⚠️ No commercial use

### Vercel Pro Plan ($20/month)
- ✅ Commercial use allowed
- ✅ 1TB bandwidth/month
- ✅ Advanced analytics
- ✅ Team collaboration
- ✅ Priority support

### Recommended Setup
- **Development**: Hobby plan
- **Production**: Pro plan (for commercial use)

---

## 📞 Support

### Vercel Support
- Documentation: [vercel.com/docs](https://vercel.com/docs)
- Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- Status: [vercel-status.com](https://vercel-status.com)

### Project Support
- GitHub Issues: [your-repo/issues](https://github.com/gogsia86/farmers-market/issues)
- Documentation: `/docs` folder

---

## ✅ Quick Deploy Checklist

1. [ ] Install Vercel CLI: `npm i -g vercel`
2. [ ] Login: `vercel login`
3. [ ] Set up database (Vercel Postgres, Neon, or Supabase)
4. [ ] Add environment variables in Vercel Dashboard
5. [ ] Deploy: `vercel --prod`
6. [ ] Run migrations: `npx prisma migrate deploy`
7. [ ] Verify deployment
8. [ ] Configure webhooks
9. [ ] Add custom domain (optional)
10. [ ] Monitor deployment

---

## 🎉 Ready to Deploy!

Your Farmers Market Platform is **fully configured and ready** for Vercel deployment.

**Deploy Now:**
```bash
cd "M:\Repo\Farmers Market Platform web and app"
vercel --prod
```

Good luck! 🚀🌾

---

_Last updated: November 15, 2025_
