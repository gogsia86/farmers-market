# 🚀 Deployment Quick Start Guide

**Farmers Market Platform - Fast Deployment Reference**  
**Version:** 1.0  
**Last Updated:** January 2025

---

## 📋 Quick Commands

### Test Deployment Locally

```bash
# Full test suite (bash)
bash scripts/test-deployment.sh

# Node.js verification
node scripts/verify-deployment.js

# Quick verification
npm run test:vercel:quick

# Full verification with all checks
npm run test:vercel:full
```

### Deploy to Vercel

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# With environment variables
vercel --env DATABASE_URL="postgresql://..." --prod
```

### Health Check

```bash
# Check health endpoint
curl https://farmers-market-platform.vercel.app/api/health

# Pretty print JSON
curl https://farmers-market-platform.vercel.app/api/health | jq

# HEAD request (lightweight)
curl -I https://farmers-market-platform.vercel.app/api/health
```

---

## 🔧 Environment Variables Checklist

Set these in Vercel Dashboard → Settings → Environment Variables:

### Required ✅
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=your-secure-secret-minimum-32-characters
NEXTAUTH_URL=https://your-app.vercel.app
```

### Email (Required for notifications)
```bash
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@yourdomain.com
```

### Payments (Required for checkout)
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

### Storage (Required for images)
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Monitoring (Optional but recommended)
```bash
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## ⚡ Quick Fixes

### Build Failed?

```bash
# Clean everything
rm -rf node_modules package-lock.json .next
npm install --legacy-peer-deps
npm run build

# If still fails, check:
npm run type-check  # Fix TypeScript errors
npx prisma generate # Regenerate Prisma client
npx prisma validate # Validate schema
```

### Platform Dependency Issues?

```bash
# Remove lock file (let Vercel generate it)
git rm package-lock.json
echo "package-lock.json" >> .gitignore
git add .gitignore
git commit -m "chore: remove lock file for cross-platform"
git push
```

### Database Connection Failed?

```bash
# Verify connection string format
# PostgreSQL: postgresql://user:password@host:5432/database?sslmode=require

# Test connection locally
npx prisma db pull

# Check if database is accessible from Vercel IPs
# Add Vercel IPs to database firewall if needed
```

### 500 Errors After Deployment?

```bash
# Check Vercel logs
vercel logs

# Check health endpoint
curl https://your-app.vercel.app/api/health

# Check Sentry for detailed errors
# Visit your Sentry dashboard
```

---

## 🧪 Testing Checklist

### Manual Tests (5 minutes)

1. **Homepage** - `https://your-app.vercel.app`
   - [ ] Page loads
   - [ ] Images display
   - [ ] Navigation works

2. **Authentication** - `/login`
   - [ ] Login form displays
   - [ ] Can log in
   - [ ] Can log out

3. **Farmer Dashboard** - `/farmer/dashboard`
   - [ ] Dashboard loads (after login)
   - [ ] Can create farm
   - [ ] Can add products

4. **Customer Flow**
   - [ ] Browse farms - `/farms`
   - [ ] View products - `/products`
   - [ ] Add to cart - `/cart`

5. **API Health** - `/api/health`
   - [ ] Returns 200 OK
   - [ ] Shows healthy status

### Automated Tests

```bash
# Run all deployment tests
bash scripts/test-deployment.sh

# Expected output:
# ✅ All tests passed
# Success Rate: 100%
```

---

## 🔄 Emergency Rollback (< 1 minute)

### Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select project
3. Click "Deployments"
4. Find last working deployment
5. Click "⋯" → "Promote to Production"
6. Confirm

### Via CLI

```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url>
```

---

## 📊 Monitor After Deployment

### First 5 Minutes

```bash
# Check health continuously
watch -n 5 'curl -s https://your-app.vercel.app/api/health | jq'

# Check error rate in Sentry
# Visit Sentry dashboard → Check error count

# Check Vercel Analytics
# Visit Vercel dashboard → Analytics tab
```

### Key Metrics to Watch

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Response Time | < 1s | 1-3s | > 3s |
| Error Rate | < 0.1% | 0.1-1% | > 1% |
| Database Latency | < 50ms | 50-200ms | > 200ms |

---

## 🆘 When Things Go Wrong

### Decision Tree

```
Deployment Failed?
├─ Build Error?
│  ├─ TypeScript errors → npm run type-check
│  ├─ Dependency issues → Remove lock file
│  └─ Prisma errors → npx prisma generate
│
├─ Runtime Error (500)?
│  ├─ Check Vercel logs → vercel logs
│  ├─ Check Sentry → Review errors
│  └─ Database issue? → Verify DATABASE_URL
│
├─ Slow Performance?
│  ├─ Check response times
│  ├─ Review database queries
│  └─ Check Vercel Analytics
│
└─ Complete Failure?
   └─ ROLLBACK IMMEDIATELY
      └─ Vercel Dashboard → Promote last working deployment
```

---

## 📞 Support

### Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Sentry Dashboard:** https://sentry.io
- **Documentation:** `docs/DEPLOYMENT_WORKFLOW.md`
- **Build Fixes:** `docs/BUILD_FIX_SUMMARY.md`

### Commands Reference

```bash
# Deployment
vercel                          # Preview
vercel --prod                   # Production
vercel logs                     # View logs
vercel ls                       # List deployments
vercel env ls                   # List environment variables

# Testing
npm run test:vercel:quick       # Quick test
npm run test:vercel:full        # Full test suite
bash scripts/test-deployment.sh # Complete workflow test
node scripts/verify-deployment.js # Node.js verification

# Local Development
npm run dev                     # Start dev server
npm run build                   # Test build
npm run type-check              # Check types
npm run lint                    # Check code quality

# Database
npx prisma generate             # Generate client
npx prisma migrate dev          # Run migrations
npx prisma db push              # Push schema changes
npx prisma studio               # Open Prisma Studio

# Monitoring
npm run monitor:daemon          # Start monitoring
npm run monitor:health          # Health check
vercel logs --follow            # Follow logs
```

---

## ✅ Pre-Deployment Checklist

**Before deploying to production:**

- [ ] All tests pass locally (`npm test`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Prisma schema valid (`npx prisma validate`)
- [ ] Environment variables set in Vercel
- [ ] Database migrations ready
- [ ] Health endpoint works locally
- [ ] Manual testing completed
- [ ] Rollback plan ready

**Deployment confidence: 🟢 High | 🟡 Medium | 🔴 Low**

---

## 🎯 Success Indicators

**Deployment is successful when:**

✅ Build completes in < 5 minutes  
✅ Health endpoint returns 200 OK  
✅ Homepage loads in < 2 seconds  
✅ No errors in first 5 minutes  
✅ All critical flows work  
✅ Database connections stable  

---

## 💡 Pro Tips

1. **Always test preview deployments first**
   - Every PR gets a preview URL
   - Test thoroughly before merging to main

2. **Use health endpoint for monitoring**
   - `/api/health` shows system status
   - Set up uptime monitoring (UptimeRobot, Pingdom)

3. **Enable Vercel Analytics**
   - Real User Monitoring (RUM)
   - Core Web Vitals tracking

4. **Set up Sentry early**
   - Catch errors before users report them
   - Track performance issues

5. **Remove package-lock.json**
   - Prevents cross-platform issues
   - Let Vercel generate it on Linux

6. **Use GitHub Actions**
   - Automated testing on every PR
   - Consistent deployment process

7. **Monitor first hour closely**
   - Most issues appear immediately
   - Quick rollback if needed

---

## 📅 Regular Maintenance

### Daily
- [ ] Check error rates in Sentry
- [ ] Review Vercel Analytics

### Weekly
- [ ] Review performance metrics
- [ ] Check for dependency updates
- [ ] Test critical user flows

### Monthly
- [ ] Security audit (`npm audit`)
- [ ] Database backup verification
- [ ] Update dependencies
- [ ] Review and update documentation

---

**Need more details?** See `docs/DEPLOYMENT_WORKFLOW.md`

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready