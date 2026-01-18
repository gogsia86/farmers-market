# 🚀 DEPLOY TO PRODUCTION - STEP-BY-STEP GUIDE

**Croatian Farmers Market Platform**  
**Deployment Target:** Vercel  
**Estimated Time:** 30-45 minutes  
**Difficulty:** Easy ⭐

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before deploying, ensure you have:

- [ ] **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
- [ ] **GitHub Repository** - Code pushed to GitHub
- [ ] **Production Database** - PostgreSQL instance (Neon, Railway, Supabase, or Vercel Postgres)
- [ ] **Stripe Account** - Production keys ready
- [ ] **Email Service** - SendGrid/Resend API keys
- [ ] **Domain Name** (Optional) - e.g., `hrvatski-trznice.hr`

---

## 🎯 DEPLOYMENT METHOD 1: VERCEL CLI (RECOMMENDED)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate (email link or GitHub).

### Step 3: Link Project (First Time Only)

```bash
# Run from project root
vercel link
```

Answer the prompts:
- **Set up and deploy?** → Yes
- **Scope?** → Select your account/team
- **Link to existing project?** → No (first time) or Yes (if exists)
- **Project name?** → `croatian-farmers-market` (or your choice)
- **Directory?** → `.` (current directory)

### Step 4: Set Environment Variables

Create `.env.production.local` with your production values:

```bash
# Copy template
cp .env.production.example .env.production.local

# Edit with your production values
nano .env.production.local  # or use your editor
```

**Critical Variables to Set:**

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"

# Auth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secret-here"  # Generate: openssl rand -base64 32

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."  # Set after webhook creation

# Email
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="noreply@your-domain.com"

# Sentry (optional)
SENTRY_DSN="https://...@sentry.io/..."
```

### Step 5: Push Environment Variables to Vercel

```bash
# Add each variable one by one
vercel env add DATABASE_URL production
# Paste value when prompted

vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add SENDGRID_API_KEY production
vercel env add SENDGRID_FROM_EMAIL production
# ... continue for all variables
```

**OR** use the Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables from `.env.production.local`

### Step 6: Deploy to Production

```bash
# Deploy to production
vercel --prod
```

Wait for deployment to complete (2-5 minutes).

### Step 7: Verify Deployment

Once deployed, Vercel will output your production URL:

```
✅ Production: https://your-project.vercel.app
```

Visit the URL and test:
- ✅ Homepage loads
- ✅ Login works
- ✅ Can browse products

---

## 🎯 DEPLOYMENT METHOD 2: VERCEL DASHBOARD (ALTERNATIVE)

### Step 1: Import from GitHub

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Project**
3. Select **GitHub**
4. Choose your repository
5. Click **Import**

### Step 2: Configure Project

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `.` (default)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### Step 3: Add Environment Variables

In the **Environment Variables** section, add all variables from `.env.production.example`:

| Key | Value | Environment |
|-----|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Production |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
| `NEXTAUTH_SECRET` | `[your-secret]` | Production |
| ... | ... | Production |

### Step 4: Deploy

Click **Deploy** button and wait 2-5 minutes.

---

## 🔧 POST-DEPLOYMENT CONFIGURATION

### 1. Run Database Migrations

After first deployment, run migrations:

```bash
# Set production database URL locally
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Seed Croatian data (if needed)
npm run seed:croatian
```

**OR** use Vercel CLI:

```bash
vercel env pull .env.production.local
npx prisma migrate deploy
npm run seed:croatian
```

### 2. Configure Stripe Webhooks

**Create Production Webhook:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. **Endpoint URL:** `https://your-domain.vercel.app/api/payments/webhook`
4. **Events to send:**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

**Add Webhook Secret to Vercel:**

```bash
vercel env add STRIPE_WEBHOOK_SECRET production
# Paste the whsec_... value
```

**Redeploy** to apply:

```bash
vercel --prod
```

### 3. Configure Custom Domain (Optional)

**Add Domain in Vercel:**

1. Go to Project → Settings → Domains
2. Click **Add Domain**
3. Enter your domain: `hrvatski-trznice.hr`
4. Follow DNS configuration instructions

**Update DNS Records:**

Add these records with your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Update Environment Variable:**

```bash
vercel env add NEXTAUTH_URL production
# Value: https://hrvatski-trznice.hr
```

Redeploy:

```bash
vercel --prod
```

### 4. Warm Cache (First Time)

After deployment, warm the cache:

```bash
# Using curl
curl https://your-domain.vercel.app/
curl https://your-domain.vercel.app/api/health

# OR use npm script (if configured)
npm run cache:warm:production
```

---

## ✅ VERIFICATION CHECKLIST

Test these critical flows on your production site:

### Basic Functionality
- [ ] Homepage loads (< 2 seconds)
- [ ] Products page displays Croatian farms
- [ ] Product details page works
- [ ] Search functionality works
- [ ] Images load properly

### Authentication
- [ ] Can login as admin: `admin@hrvatski-tržnice.hr`
- [ ] Can login as farmer: `marko.horvat@opg.hr`
- [ ] Can login as customer: `marija.kovac@gmail.com`
- [ ] Password reset flow works
- [ ] Email verification works

### Customer Flow
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Can proceed to checkout
- [ ] Can enter delivery address
- [ ] Stripe checkout loads
- [ ] **Test payment works** (use test card in prod: 4242 4242 4242 4242)
- [ ] Order confirmation email received
- [ ] Order appears in dashboard

### Farmer Flow
- [ ] Farmer dashboard accessible
- [ ] Can create new product
- [ ] Can upload product image
- [ ] Can update inventory
- [ ] Can view orders
- [ ] Can mark order as fulfilled

### Admin Flow
- [ ] Admin dashboard accessible
- [ ] Can view all farms
- [ ] Can verify farm
- [ ] Can view analytics
- [ ] Can manage users

### Monitoring
- [ ] Health check endpoint: `/api/health`
- [ ] Sentry receiving errors (test by triggering an error)
- [ ] Logs visible in Vercel dashboard

---

## 📊 MONITORING & MAINTENANCE

### Daily Checks (Week 1)

```bash
# Check health endpoint
curl https://your-domain.vercel.app/api/health

# Check Vercel logs
vercel logs --prod

# Check Sentry for errors
# Visit: https://sentry.io/organizations/your-org/issues/
```

### Weekly Checks

1. **Performance**
   - Check Vercel Analytics
   - Review response times
   - Monitor error rates

2. **Database**
   - Check connection pool usage
   - Review slow queries
   - Verify backups

3. **Business Metrics**
   - Orders completed
   - New farmer signups
   - Customer registrations

### Monthly Maintenance

- Update dependencies: `npm update`
- Review and rotate API keys
- Check for security updates
- Optimize database indexes
- Review and archive logs

---

## 🐛 TROUBLESHOOTING

### Build Fails

**Error:** `Build failed with exit code 1`

**Solutions:**
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Run `npm run build` locally to reproduce
4. Check TypeScript errors: `npm run type-check`

### Database Connection Issues

**Error:** `Can't reach database server`

**Solutions:**
1. Verify `DATABASE_URL` is correct
2. Check database allows connections from Vercel IPs
3. Ensure `sslmode=require` in connection string
4. Test connection: `npx prisma db pull`

### Stripe Webhook Failures

**Error:** `Webhook signature verification failed`

**Solutions:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
2. Check webhook endpoint URL is correct
3. Ensure webhook events are selected
4. Test webhook: Stripe Dashboard → Webhooks → Send test webhook

### Environment Variable Not Working

**Solutions:**
1. Redeploy after adding variables: `vercel --prod`
2. Check variable name is exact (case-sensitive)
3. For `NEXT_PUBLIC_` vars, must rebuild: `vercel --prod --force`
4. Check scope: production vs preview vs development

### 404 on API Routes

**Solutions:**
1. Check file structure: `app/api/[route]/route.ts`
2. Verify build output includes API routes
3. Clear Vercel cache: `vercel --prod --force`

---

## 🔒 SECURITY CHECKLIST

Before going public:

- [ ] All secrets stored as environment variables (not in code)
- [ ] `NEXTAUTH_SECRET` is strong (32+ characters)
- [ ] Stripe keys are live keys (not test keys)
- [ ] Database connection uses SSL (`sslmode=require`)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled for APIs
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using Prisma)
- [ ] XSS prevention (React auto-escapes)
- [ ] CSRF protection enabled (NextAuth)

---

## 📈 SCALING CONSIDERATIONS

### When Traffic Grows

**Vercel Automatically Handles:**
- ✅ Load balancing
- ✅ Edge caching
- ✅ Global CDN
- ✅ Auto-scaling

**You Need to Scale:**
- 🔧 **Database** - Upgrade plan or add read replicas
- 🔧 **Redis** - Add Redis for caching (Upstash)
- 🔧 **File Storage** - Use Cloudinary/S3 for images
- 🔧 **Email** - Upgrade SendGrid plan

### Performance Optimization

```bash
# Enable Redis caching
vercel env add REDIS_URL production
# Value: redis://...

# Enable image optimization
# Already configured in next.config.js

# Monitor with Vercel Analytics
# Automatically enabled in dashboard
```

---

## 💰 COST ESTIMATION

### Vercel Costs
- **Hobby Plan:** Free (good for testing)
- **Pro Plan:** $20/month (recommended for production)
  - Includes: Analytics, priority support, better performance

### Database Costs (Neon/Railway/Supabase)
- **Free Tier:** $0/month (good for MVP)
- **Paid Tier:** $10-25/month (recommended)

### Additional Services
- **Stripe:** 2.9% + $0.30 per transaction (standard)
- **SendGrid:** Free for 100 emails/day, $15/mo for 40k
- **Sentry:** Free for 5k errors/month, $26/mo for 50k
- **Redis (Upstash):** Free tier available, $10/mo paid

**Total Estimated Monthly Cost:** $45-80/month

---

## 🎉 DEPLOYMENT COMPLETE!

Your Croatian Farmers Market Platform is now live! 🇭🇷

### Next Steps:

1. **Test Everything** - Run through verification checklist above
2. **Monitor Closely** - Check logs daily for first week
3. **Onboard Farmers** - Start recruiting real Croatian OPG farms
4. **Marketing** - Announce launch on social media
5. **Iterate** - Gather feedback and improve

### Useful Links:

- **Production Site:** https://your-domain.vercel.app
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Sentry Dashboard:** https://sentry.io

### Support:

- **Documentation:** See `LAUNCH_READY.md`, `TESTING_GUIDE_NOW.md`
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

**🇭🇷 Sretno! (Good luck!)** 🚀

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Author:** Croatian Farmers Market Platform Team