# ⚡ Vercel Deployment - Quick Reference Card

**Farmers Market Platform - Copy & Paste Commands**

---

## 🚀 Deploy in 3 Steps (GitHub Method)

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy to Vercel"
git push origin main

# 2. Go to https://vercel.com/new
# 3. Select repository → Add env vars → Deploy
```

---

## 🔐 Essential Environment Variables

```env
# Copy these to Vercel Dashboard → Environment Variables

# Database (REQUIRED)
DATABASE_URL="postgresql://USER:PASS@HOST:5432/DB?pgbouncer=true&connection_limit=1"

# Auth (REQUIRED)
NEXTAUTH_SECRET="[run: openssl rand -base64 32]"
NEXTAUTH_URL="https://your-app.vercel.app"

# Node
NODE_ENV="production"

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 💻 CLI Deployment

```bash
# Install & login
npm i -g vercel
vercel login

# Deploy
vercel --prod
```

---

## 🗄️ Database Options (Pick One)

### Vercel Postgres (Easiest)

```
Dashboard → Storage → Create Database → Postgres
✅ Automatic DATABASE_URL configuration
```

### Supabase (Free Tier)

```
1. Create project at supabase.com
2. Get connection string (pooled mode)
3. Add ?pgbouncer=true&connection_limit=1
```

### Neon (Serverless)

```
1. Create project at neon.tech
2. Copy connection string
3. Add ?pgbouncer=true&connection_limit=1
```

---

## 🔄 Post-Deploy: Run Migrations

```bash
# Pull env vars
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run db:seed:basic
```

---

## ✅ Test Checklist

```bash
# Visit these URLs after deployment:
https://your-app.vercel.app              # Homepage
https://your-app.vercel.app/api/health   # Health check (should be 200)
https://your-app.vercel.app/signup       # User registration
https://your-app.vercel.app/farms        # Browse farms
```

---

## 🌐 Add Custom Domain

```bash
# In Vercel Dashboard:
Project → Domains → Add → yourdomain.com

# Update DNS (at your domain registrar):
Type: A,     Name: @,   Value: 76.76.21.21
Type: CNAME, Name: www, Value: cname.vercel-dns.com

# Update env var:
NEXTAUTH_URL="https://yourdomain.com"

# Redeploy:
vercel --prod
```

---

## 🚨 Quick Troubleshooting

### Build Fails

```bash
# Test locally first
npm run build
npm run start
```

### Database Connection Error

```bash
# Verify connection string includes:
?pgbouncer=true&connection_limit=1
```

### Auth Not Working

```bash
# Verify NEXTAUTH_SECRET is 32+ characters
openssl rand -base64 32

# Verify NEXTAUTH_URL matches deployment URL
echo "NEXTAUTH_URL=https://your-app.vercel.app"
```

### Stripe Payments Fail

```bash
# Verify webhook endpoint in Stripe Dashboard:
https://your-app.vercel.app/api/webhooks/stripe

# Events: payment_intent.succeeded, checkout.session.completed
```

---

## 📊 Performance Check

```bash
# After deployment:
1. Open Chrome DevTools → Lighthouse
2. Run audit on production URL
3. Target: All scores >85

# Check Vercel Dashboard:
- Analytics (page views, performance)
- Functions (execution time)
- Logs (errors)
```

---

## 🔑 Generate Secrets

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# Or online:
# https://generate-secret.vercel.app/32
```

---

## 📞 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Add Env Vars**: Project → Settings → Environment Variables
- **View Logs**: Project → Deployments → [Latest] → Logs
- **Domain Setup**: Project → Settings → Domains
- **Analytics**: Project → Analytics

---

## 🎯 Success Indicators

✅ Build completes in <5 minutes
✅ Homepage loads in <2 seconds
✅ `/api/health` returns `{"status":"healthy"}`
✅ User can sign up and log in
✅ No console errors
✅ Lighthouse score >85

---

## 💡 Pro Tips

```bash
# Preview deployments (test before production)
git checkout -b feature/new-feature
git push origin feature/new-feature
# Vercel creates preview URL automatically

# Roll back deployment
# Vercel Dashboard → Deployments → Previous → Promote to Production

# Environment-specific variables
# Set different values for Production/Preview/Development

# Function timeout (if needed)
# vercel.json → functions → maxDuration: 30
```

---

## 📦 What's Already Configured

✅ Next.js 16.0.7 (latest)
✅ Serverless functions optimized
✅ Database connection pooling
✅ Image optimization
✅ Bundle size optimization
✅ Security headers
✅ Rate limiting ready
✅ Error tracking (Sentry)
✅ Analytics (Vercel)

---

## 🎉 Deploy Now!

```bash
vercel --prod
```

**Total Time: 30-45 minutes** (including database setup)

---

_Status: ✅ PRODUCTION READY_
_Last Updated: 2025-01-XX_

🌾 **"Code with consciousness, deploy with confidence."** ⚡
