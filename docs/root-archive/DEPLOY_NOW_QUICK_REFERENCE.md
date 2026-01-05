# 🚀 DEPLOY NOW - Quick Reference Card

**Farmers Market Platform - Vercel Deployment**

---

## ⚡ 5-Minute Deployment (GitHub Method)

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy to production"
git push origin main

# 2. Go to Vercel
https://vercel.com/new

# 3. Import Repository
- Click "Import Git Repository"
- Select your repo
- Framework: Next.js (auto-detected)

# 4. Add Environment Variables (REQUIRED)
DATABASE_URL=postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1
NEXTAUTH_SECRET=[run: openssl rand -base64 32]
NEXTAUTH_URL=https://your-domain.vercel.app
NODE_ENV=production

# 5. Deploy
Click "Deploy" button

# 6. Run Migrations
vercel env pull .env.local
npx prisma migrate deploy
```

---

## 🔧 Alternative: CLI Method

```bash
# Install & Deploy
npm i -g vercel
vercel login
cd "Farmers Market Platform web and app"
vercel --prod

# Add environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Redeploy
vercel --prod
```

---

## 🔐 Required Environment Variables

### Critical (Must Have)

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"
NEXTAUTH_SECRET="[min 32 chars - use: openssl rand -base64 32]"
NEXTAUTH_URL="https://your-domain.vercel.app"
NODE_ENV="production"
```

### E-Commerce (If Using Payments)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### File Upload (Recommended)

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Monitoring (Recommended)

```env
SENTRY_DSN="https://...@sentry.io/..."
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
```

---

## 🗄️ Database Quick Setup

### Option 1: Vercel Postgres (Easiest)

```bash
1. Vercel Dashboard → Storage → Create Database → Postgres
2. DATABASE_URL automatically added ✅
3. Done!
```

### Option 2: Supabase (Free Tier)

```bash
1. https://supabase.com → New Project
2. Settings → Database → Copy Connection String (Pooling Mode)
3. Add ?pgbouncer=true&connection_limit=1 to end
4. Add to Vercel as DATABASE_URL
```

### Option 3: Neon (Serverless)

```bash
1. https://neon.tech → New Project
2. Copy connection string
3. Add ?pgbouncer=true&connection_limit=1 to end
4. Add to Vercel as DATABASE_URL
```

---

## ✅ Post-Deployment Checklist

```bash
# 1. Health Check
curl https://your-app.vercel.app/api/health
# Expected: 200 OK

# 2. Visit Site
https://your-app.vercel.app
# Expected: Homepage loads

# 3. Test Authentication
- Go to /signup
- Create account
- Login
- Verify session works

# 4. Run Migrations
vercel env pull .env.local
npx prisma migrate deploy

# 5. Seed Data (Optional)
npm run db:seed:basic
```

---

## 🚨 Common Issues & Fixes

### Build Fails

```bash
# Check locally first
npm run build

# Fix TypeScript errors
npm run type-check

# Fix lint errors
npm run lint
```

### Database Connection Fails

```bash
# Verify DATABASE_URL format includes:
?pgbouncer=true&connection_limit=1

# Test locally
vercel env pull .env.local
npm run dev
```

### Environment Variables Missing

```bash
# Check Vercel Dashboard
Settings → Environment Variables

# Ensure variables are set for:
- Production ✅
- Preview ✅
- Development ✅

# Redeploy after adding
vercel --prod
```

---

## 🎯 Success Indicators

✅ Homepage loads (< 2s)
✅ /api/health returns 200
✅ Can signup/login
✅ No console errors
✅ Vercel Analytics tracking

---

## 📞 Quick Help

**Vercel Docs**: https://vercel.com/docs
**Project Docs**:

- VERCEL_DEPLOYMENT_ANALYSIS.md (full guide)
- DEPLOYMENT_RUNBOOK.md (detailed procedures)
- DEPLOYMENT_CHECKLIST.md (step-by-step)

**Support**:

- Vercel Discord: https://vercel.com/discord
- Vercel Help: https://vercel.com/help

---

## 🔄 Redeploy

```bash
# GitHub Method (Automatic)
git push origin main

# CLI Method (Manual)
vercel --prod

# Rollback (If Needed)
vercel rollback [deployment-url]
```

---

## 🌐 Custom Domain (After Deployment)

```bash
1. Vercel Dashboard → Domains → Add Domain
2. Enter: yourdomain.com
3. Configure DNS:
   - A Record: @ → 76.76.21.21
   - CNAME: www → cname.vercel-dns.com
4. Wait for SSL (2-5 minutes)
5. Update NEXTAUTH_URL=https://yourdomain.com
6. Redeploy
```

---

## 📊 Performance Targets

- First Load: < 2s
- API Response: < 500ms
- Lighthouse Score: > 85
- Error Rate: < 0.1%
- Uptime: > 99.9%

---

## 🎉 You're Ready!

**Estimated Time**: 45-60 minutes (first time)
**Future Deploys**: 3-5 minutes (automatic)

**Deploy Now**:

```bash
vercel --prod
```

---

_"Deploy with confidence, scale with grace!"_ 🚀🌾
