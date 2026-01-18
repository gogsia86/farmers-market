# 🚀 PRODUCTION LAUNCH CHECKLIST
## Croatian Farmers Market Platform

**Version**: 1.0.0  
**Date**: January 2025  
**Status**: Pre-Launch Verification

---

## ✅ PRE-LAUNCH CHECKLIST

Use this checklist to ensure 100% readiness before production launch.

---

## 🔧 PHASE 1: LOCAL VERIFICATION (30 minutes)

### Environment Setup
- [ ] Node.js 20.18.0+ installed (`node --version`)
- [ ] npm 10.0.0+ installed (`npm --version`)
- [ ] Git repository clean (`git status`)
- [ ] All dependencies installed (`npm install`)
- [ ] `.env` or `.env.local` file created
- [ ] Prisma client generated (`npx prisma generate`)

### Environment Variables (Local)
```bash
# Copy these to your .env file
- [ ] NEXTAUTH_SECRET=<random-32-chars>
- [ ] NEXTAUTH_URL=http://localhost:3001
- [ ] DATABASE_URL=postgresql://...
- [ ] STRIPE_SECRET_KEY=sk_test_... (test mode OK)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
- [ ] STRIPE_WEBHOOK_SECRET=whsec_... (optional for local)
```

### Database Setup
- [ ] PostgreSQL database created
- [ ] Database accessible from local machine
- [ ] Prisma schema validated (`npm run db:validate`)
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Croatian seed data loaded (`npm run seed:croatian`)

### Local Testing
```bash
# Run these commands
- [ ] npm run verify:local:quick  # Should pass all checks
- [ ] npm run dev                 # Should start on port 3001
- [ ] Visit http://localhost:3001 # Should load homepage
```

### Functional Testing (Local)
- [ ] **Homepage loads** correctly
- [ ] **Browse farms** page shows 50+ Croatian OPGs
- [ ] **Product listings** show Croatian products with Croatian names
- [ ] **Search** functionality works
- [ ] **Farm profiles** display correctly with images
- [ ] **Login** works with test credentials:
  - [ ] Admin: admin@hrvatski-tržnice.hr / Admin123!
  - [ ] Farmer: marko.horvat@opg.hr / Farmer123!
  - [ ] Customer: marija.kovac@gmail.com / Consumer123!

### User Flow Testing
- [ ] **Customer Journey**:
  - [ ] Browse farms and products
  - [ ] Add products to cart
  - [ ] Update cart quantities
  - [ ] Proceed to checkout
  - [ ] Enter shipping information
  - [ ] Complete Stripe payment (use test card: 4242 4242 4242 4242)
  - [ ] Receive order confirmation
  - [ ] View order in dashboard

- [ ] **Farmer Journey**:
  - [ ] Login as farmer
  - [ ] View farm dashboard
  - [ ] Add new product
  - [ ] Edit existing product
  - [ ] Upload product image
  - [ ] View orders
  - [ ] Update order status

- [ ] **Admin Journey**:
  - [ ] Login as admin
  - [ ] View all farms
  - [ ] Approve/verify farm
  - [ ] View all orders
  - [ ] Manage users
  - [ ] View analytics

### Croatian Content Verification
- [ ] **6 Croatian regions** present (Slavonija, Baranja, Dalmacija, Istra, Zagorje, Zagreb)
- [ ] **50+ OPG farms** with authentic Croatian names
- [ ] **200+ products** with Croatian names + English translations
- [ ] **HR-EKO certifications** visible on farm profiles
- [ ] **Market photos** display (Dolac, Split Pazar, etc.)
- [ ] **EUR pricing** on all products
- [ ] **Regional specialties** correct (truffles in Istra, wine in Baranja)

---

## 🌐 PHASE 2: STAGING DEPLOYMENT (1-2 hours)

### Vercel Setup
- [ ] Vercel account created
- [ ] Vercel CLI installed (`npm i -g vercel`)
- [ ] Logged into Vercel (`vercel login`)
- [ ] Project created (first `vercel` deploy creates it)

### Production Database
- [ ] Production PostgreSQL database provisioned
- [ ] Database accessible from internet (whitelist Vercel IPs)
- [ ] Database connection string secured
- [ ] Database backups configured
- [ ] Database user has correct permissions

### Environment Variables (Vercel)
Upload these to Vercel project settings:

#### Critical (Required)
- [ ] `NEXTAUTH_SECRET` (generate new: `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` (https://your-staging-url.vercel.app)
- [ ] `DATABASE_URL` (production database connection)
- [ ] `STRIPE_SECRET_KEY` (can use test key initially)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test key)
- [ ] `STRIPE_WEBHOOK_SECRET` (from Stripe webhook config)

#### Recommended
- [ ] `SENTRY_DSN` (error tracking)
- [ ] `SENDGRID_API_KEY` (email notifications)
- [ ] `OPENAI_API_KEY` (AI features)
- [ ] `NEXT_PUBLIC_APP_URL` (your staging URL)

#### Optional
- [ ] `REDIS_HOST` (caching)
- [ ] `REDIS_PORT`
- [ ] `REDIS_PASSWORD`
- [ ] `CLOUDINARY_URL` (image hosting)

### Staging Deployment
```bash
- [ ] vercel                      # Deploy to staging
- [ ] Deployment successful (note URL)
- [ ] Build completed without errors
- [ ] No environment variable errors in logs
```

### Seed Staging Database
```bash
- [ ] DATABASE_URL="production-url" npm run seed:croatian
- [ ] Verify 50+ farms created
- [ ] Verify 200+ products created
- [ ] Verify test users created
```

### Staging Testing
- [ ] **Visit staging URL** (https://your-app-xyz.vercel.app)
- [ ] Homepage loads correctly
- [ ] No console errors in browser
- [ ] All images display
- [ ] Login works
- [ ] Croatian farms visible
- [ ] Products load correctly
- [ ] Cart functionality works
- [ ] Checkout loads (don't complete payment yet)

### Stripe Staging Configuration
- [ ] Login to Stripe dashboard
- [ ] Navigate to Developers → Webhooks
- [ ] Add webhook endpoint:
  - **URL**: `https://your-staging-url.vercel.app/api/payments/webhook`
  - **Events**: Select these:
    - [ ] `checkout.session.completed`
    - [ ] `payment_intent.succeeded`
    - [ ] `payment_intent.payment_failed`
- [ ] Copy webhook signing secret
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel

### Integration Testing (Staging)
- [ ] **Sentry**: Trigger test error, check Sentry dashboard
- [ ] **Stripe**: Complete test checkout, verify webhook received
- [ ] **Email**: Verify order confirmation email sent
- [ ] **Database**: Check order created in production DB

### Performance Testing
- [ ] **Lighthouse audit** (score 90+ recommended):
  - [ ] Performance: 90+
  - [ ] Accessibility: 90+
  - [ ] Best Practices: 90+
  - [ ] SEO: 90+
- [ ] **Page load times** under 3 seconds
- [ ] **Mobile responsive** (test on phone)
- [ ] **Image optimization** (WebP/AVIF format)

### Security Testing
- [ ] **HTTPS** enabled (Vercel auto-configures)
- [ ] **Security headers** present (check browser dev tools)
- [ ] **No sensitive data** in console logs
- [ ] **API routes** protected (test without auth)
- [ ] **CSRF protection** active
- [ ] **Rate limiting** configured

---

## 🎯 PHASE 3: PRODUCTION DEPLOYMENT (30 minutes)

### Pre-Production Checklist
- [ ] Staging fully tested and verified
- [ ] All critical bugs fixed
- [ ] Production database ready
- [ ] Production Stripe account ready (if going live with payments)
- [ ] Custom domain purchased (optional)
- [ ] SSL certificate ready (Vercel auto-provides)

### Production Environment Variables
Update these in Vercel for production environment:

- [ ] `NEXTAUTH_URL` → Your production domain
- [ ] `STRIPE_SECRET_KEY` → Live key (if ready for payments)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → Live key
- [ ] `STRIPE_WEBHOOK_SECRET` → Production webhook secret
- [ ] All other variables same as staging

### Production Deployment
```bash
- [ ] vercel --prod               # Deploy to production
- [ ] Deployment successful
- [ ] Production URL noted
- [ ] Build logs reviewed (no errors)
```

### Custom Domain Setup (Optional)
- [ ] Domain purchased (e.g., hrvatski-trznice.hr)
- [ ] Add domain in Vercel dashboard
- [ ] Update DNS records (A/CNAME as instructed)
- [ ] Wait for DNS propagation (5-60 minutes)
- [ ] Verify domain accessible
- [ ] HTTPS certificate issued automatically

### Production Stripe Webhook
- [ ] Create new webhook in Stripe (live mode)
- [ ] URL: `https://yourdomain.com/api/payments/webhook`
- [ ] Same events as staging
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel

### Production Testing
- [ ] Visit production URL
- [ ] All pages load correctly
- [ ] Login with test credentials
- [ ] Browse farms and products
- [ ] Test complete checkout flow
- [ ] Verify order in database
- [ ] Check email notifications
- [ ] Test on mobile device
- [ ] Test in different browsers (Chrome, Firefox, Safari)

---

## 📊 PHASE 4: POST-LAUNCH MONITORING (First 24 hours)

### Immediate Monitoring
- [ ] **Vercel Dashboard**:
  - [ ] Check deployment status
  - [ ] Review real-time logs
  - [ ] Monitor bandwidth usage
  - [ ] Check for errors

- [ ] **Sentry Dashboard**:
  - [ ] Zero critical errors
  - [ ] Error rate < 1%
  - [ ] No performance issues

- [ ] **Stripe Dashboard**:
  - [ ] Webhooks delivering successfully
  - [ ] Payment flow working
  - [ ] No failed payments

- [ ] **Database**:
  - [ ] Connection pool healthy
  - [ ] Query performance good
  - [ ] No connection errors

### User Acceptance
- [ ] First customer order completed successfully
- [ ] First farmer can manage products
- [ ] Admin dashboard accessible
- [ ] No critical user-reported bugs

### Performance Metrics
- [ ] **Uptime**: 99.9%+
- [ ] **Response time**: < 2 seconds average
- [ ] **Error rate**: < 1%
- [ ] **Successful orders**: 100% completion rate

---

## 🛠️ PHASE 5: OPERATIONAL READINESS

### Documentation
- [ ] README.md up to date
- [ ] API documentation accessible
- [ ] User guides created (Croatian + English)
- [ ] Admin manual ready
- [ ] Troubleshooting guide available

### Support System
- [ ] Customer support email setup
- [ ] Support ticket system configured (optional)
- [ ] FAQ page created
- [ ] Contact form working
- [ ] Phone support number (optional)

### Legal & Compliance
- [ ] Terms & Conditions (Croatian)
- [ ] Privacy Policy (GDPR compliant)
- [ ] Cookie Policy
- [ ] Return/Refund Policy
- [ ] Data Processing Agreement (for farmers)

### Business Operations
- [ ] Payment processor account verified (Stripe live mode)
- [ ] Business bank account connected
- [ ] Invoicing system ready
- [ ] Tax compliance setup (Croatian VAT)
- [ ] Insurance coverage (if needed)

### Marketing Ready
- [ ] Social media accounts created
- [ ] Google Analytics configured
- [ ] Meta Pixel installed (optional)
- [ ] SEO optimization complete
- [ ] Launch announcement prepared
- [ ] Press release ready

---

## 🎯 GO/NO-GO DECISION

### GREEN LIGHT (Ready to Launch) ✅
All critical items checked:
- [ ] Local testing passed
- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] Stripe payments working
- [ ] Database stable
- [ ] No critical bugs
- [ ] Documentation complete

**Action**: Announce launch! 🎉

### YELLOW LIGHT (Minor Issues) ⚠️
Some non-critical issues:
- [ ] Minor UI bugs
- [ ] Optional features not ready
- [ ] Documentation incomplete
- [ ] Marketing materials pending

**Action**: Launch with known issues, fix quickly post-launch

### RED LIGHT (Not Ready) ❌
Critical issues found:
- [ ] Payments not working
- [ ] Database unstable
- [ ] Critical security issues
- [ ] Major functionality broken

**Action**: DO NOT LAUNCH. Fix critical issues first.

---

## 📞 EMERGENCY CONTACTS

### Technical Issues
- **Vercel Status**: https://vercel.com/status
- **Stripe Status**: https://status.stripe.com
- **Database Provider**: [Your provider support]

### Rollback Procedure
If critical issues after launch:
```bash
# Revert to previous deployment
vercel rollback

# Or redeploy specific version
vercel --prod [deployment-url]
```

### Support Escalation
1. Check error logs in Vercel
2. Check Sentry for exceptions
3. Review Stripe webhook logs
4. Check database connection
5. If unresolved, contact platform support

---

## 🎉 POST-LAUNCH CELEBRATION

Once all green:
- [ ] Announce on social media
- [ ] Email Croatian OPG associations
- [ ] Post in agricultural forums
- [ ] Submit to Croatian startup directories
- [ ] Celebrate with the team! 🍾

---

## 📋 QUICK REFERENCE

### Essential URLs
- **Production**: https://yourdomain.com
- **Admin Panel**: https://yourdomain.com/admin
- **API Docs**: https://yourdomain.com/api-docs
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Sentry Dashboard**: https://sentry.io

### Essential Commands
```bash
# Local development
npm run dev

# Verify everything
npm run verify:local

# Seed data
npm run seed:croatian

# Build production
npm run build

# Deploy staging
vercel

# Deploy production
vercel --prod

# Test integrations
npm run verify:all
```

### Test Credentials (Production)
```
Admin:    admin@hrvatski-tržnice.hr / Admin123!
Farmer:   marko.horvat@opg.hr / Farmer123!
Customer: marija.kovac@gmail.com / Consumer123!
```

### Stripe Test Card
```
Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any valid code
```

---

## ✅ FINAL SIGN-OFF

**Verified by**: _______________  
**Date**: _______________  
**Signature**: _______________

**Launch Approved**: YES / NO

---

**Remember**: Perfect is the enemy of good. Launch, learn, iterate! 🚀

**Sretno!** 🇭🇷