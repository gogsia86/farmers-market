# ⚡ Quick Deployment Checklist

## Fresh Vercel Deployment - Fast Track Guide

**Time Required**: 30-45 minutes  
**Status**: Ready to Deploy ✅

---

## 📋 Phase 1: Pre-Deployment (5 minutes)

### ✅ Repository Status

- [ ] On `master` branch
- [ ] All changes committed and pushed
- [ ] `src/proxy.ts` exports `proxy` function (Next.js 16 compatible)
- [ ] `next.config.mjs` configured correctly
- [ ] No critical errors in last commit

**Quick Check:**

```bash
git status
git log --oneline -1
```

### ✅ Environment Variables Ready

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `DIRECT_URL` - Direct database connection
- [ ] `NEXTAUTH_SECRET` - Generated (32+ chars)
- [ ] `NEXTAUTH_URL` - Will be Vercel URL
- [ ] `STRIPE_SECRET_KEY` - Production key
- [ ] `STRIPE_PUBLISHABLE_KEY` - Production key
- [ ] `STRIPE_WEBHOOK_SECRET` - Will generate after deploy
- [ ] `RESEND_API_KEY` or email service key
- [ ] `EMAIL_FROM` - Verified sender email
- [ ] `OPENAI_API_KEY` - (Optional) AI features

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

---

## 🗑️ Phase 2: Remove Old Deployment (5 minutes)

### Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Settings → Scroll to bottom → "Delete Project"
4. Type project name to confirm
5. Click Delete

### Confirmation

- [ ] Project no longer visible in dashboard
- [ ] Old deployment URL returns 404
- [ ] Ready for fresh start

---

## 🚀 Phase 3: Fresh Deployment (15 minutes)

### Step 1: Import Repository

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select "Farmers Market Platform web and app"
4. Click "Import"

### Step 2: Configure Project

**Basic Settings:**

```yaml
Project Name: farmers-market-platform
Framework: Next.js
Root Directory: ./
Build Command: npm run vercel-build
Output Directory: .next
Install Command: npm install
Node Version: 20.x
```

**Region:**

- [ ] Select closest to your users (e.g., Washington D.C. - iad1)

### Step 3: Add Environment Variables

**Quick Import Method:**

1. Click "Environment Variables"
2. Click "Import .env"
3. Paste all your variables
4. Select: ✅ Production ✅ Preview ✅ Development
5. Click "Import"

**Critical Variables Checklist:**

- [ ] `DATABASE_URL`
- [ ] `NEXTAUTH_SECRET`
- [ ] `NEXTAUTH_URL` (use Vercel preview URL for now)
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Email service keys

### Step 4: Deploy

1. Review all settings
2. Click "Deploy"
3. Wait 3-5 minutes
4. Watch build logs for errors

---

## ✅ Phase 4: Verification (10 minutes)

### Build Status

- [ ] Deployment shows "Ready" with green checkmark
- [ ] No build errors in logs
- [ ] Got deployment URL: `https://farmers-market-platform-xxx.vercel.app`

### Quick Tests

**1. Homepage Test:**

```bash
curl https://your-deployment-url.vercel.app/
```

- [ ] Returns 200 OK
- [ ] No errors in response

**2. Health Check:**

```bash
curl https://your-deployment-url.vercel.app/api/health
```

- [ ] Returns `{"status":"ok"}`

**3. Browser Tests:**

- [ ] Visit homepage - loads correctly
- [ ] Visit `/login` - login page appears
- [ ] Check browser console - no errors
- [ ] Images load properly

**4. Authentication Test:**

- [ ] Visit protected route (e.g., `/admin`)
- [ ] Should redirect to login
- [ ] Middleware working ✓

---

## 🗄️ Phase 5: Database Setup (5-10 minutes)

### Run Migrations

**Option A: Via API Route (if you have one):**

```bash
curl -X POST https://your-deployment-url.vercel.app/api/admin/migrate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Option B: Local with Production DB:**

```bash
# Pull production env vars
vercel env pull .env.production.local

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma db pull
```

### Verify Database

- [ ] Tables created
- [ ] Schema matches local
- [ ] Connection pool working

---

## 🎯 Phase 6: Final Configuration (5 minutes)

### Update Environment Variables

**1. Update NEXTAUTH_URL:**

- Go to Vercel → Settings → Environment Variables
- Edit `NEXTAUTH_URL` to your actual deployment URL
- Save changes

**2. Configure Stripe Webhook:**

- Go to Stripe Dashboard → Webhooks
- Add endpoint: `https://your-url.vercel.app/api/webhooks/stripe`
- Copy webhook signing secret
- Add to Vercel as `STRIPE_WEBHOOK_SECRET`

**3. Redeploy with New Variables:**

- Go to Deployments
- Click "..." on latest deployment
- Click "Redeploy"

---

## 🎉 Success Criteria

Your deployment is successful when ALL are checked:

- [ ] ✅ Vercel dashboard shows "Ready"
- [ ] ✅ Homepage loads without errors
- [ ] ✅ Login page works
- [ ] ✅ Protected routes require auth
- [ ] ✅ API routes respond correctly
- [ ] ✅ Database connection works
- [ ] ✅ No console errors
- [ ] ✅ Images load properly
- [ ] ✅ Stripe integration configured
- [ ] ✅ Email service connected

---

## 🐛 Quick Troubleshooting

### Build Failed

```bash
# Check: TypeScript errors ignored?
# File: next.config.mjs
typescript: {
  ignoreBuildErrors: true,
}
```

### Environment Variable Missing

1. Vercel → Settings → Environment Variables
2. Add missing variable
3. Select all environments (Production, Preview, Development)
4. Redeploy

### Middleware Not Working

1. Verify `src/proxy.ts` exports `proxy` (not `middleware`)
2. Check `config.matcher` at bottom of file
3. Commit and push if changed
4. Redeploy

### Database Connection Fails

```bash
# Format check:
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connect_timeout=15"

# Test locally:
npx prisma db pull
```

### Images Not Loading

1. Check `next.config.mjs` → `images.remotePatterns`
2. Verify image URLs are accessible
3. Check Network tab in browser DevTools

---

## 📞 Need Help?

### Vercel Logs

- Dashboard → Your Project → Logs
- Check "Function Logs" for runtime errors
- Check "Build Logs" for deployment issues

### Local Testing

```bash
# Test production build locally
npm run build
npm start

# Visit http://localhost:3000
```

### Support Resources

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Your detailed guide: `FRESH_VERCEL_DEPLOYMENT_GUIDE.md`

---

## 🎯 Next Actions After Deployment

### Immediate (Today)

- [ ] Test all user flows
- [ ] Verify payment system (test mode first)
- [ ] Check mobile responsiveness
- [ ] Set up error monitoring (Sentry)

### Short Term (This Week)

- [ ] Add custom domain
- [ ] Configure SSL
- [ ] Set up analytics
- [ ] Enable performance monitoring
- [ ] Create backup strategy

### Long Term (This Month)

- [ ] Load testing
- [ ] Security audit
- [ ] SEO optimization
- [ ] User acceptance testing
- [ ] Production launch plan

---

## 📊 Performance Targets

After deployment, aim for:

- ✅ Lighthouse Score: >90
- ✅ First Contentful Paint: <1.5s
- ✅ Time to Interactive: <3.5s
- ✅ Cumulative Layout Shift: <0.1
- ✅ Core Web Vitals: All Green

---

**🌾 Agricultural Consciousness: ACTIVE**  
**⚡ Divine Patterns: ENABLED**  
**🚀 Deployment Status: READY**

---

**Estimated Total Time**: 30-45 minutes  
**Difficulty**: Intermediate  
**Status**: Production Ready ✅

_Last Updated: 2025_
