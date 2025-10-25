# 🚀 Vercel Deployment Guide - Complete Setup

**Purpose**: Deploy your Farmers Market platform to production
**Time Required**: 30-45 minutes
**Skill Level**: Intermediate
**Success Rate**: 90%

---

## 🎯 Why Vercel
### Benefits

✅ **Zero-configuration Next.js hosting** - Built by Next.js creators
✅ **Automatic HTTPS** - SSL certificates included
✅ **Global CDN** - Fast loading worldwide
✅ **Serverless functions** - API routes scale automatically
✅ **Preview deployments** - Test before going live
✅ **Free tier** - Perfect for MVP launch

### What You'll Get

- 🌐 Live URL: `<https://your-app.vercel.app`>
- 🔒 HTTPS encryption (automatic)
- 🚀 Fast global delivery
- 📊 Analytics dashboard
- 🔄 Automatic deployments from Git

---

## 📋 Prerequisites

### Required Accounts

1. **Vercel Account** (free)

   - Sign up: <<https://vercel.com/signu>p>
   - Use your GitHub account for easy integration

2. **Production Database** (choose one):

   - [Neon](<https://neon.tec>h) - Free PostgreSQL (recommended)
   - [Supabase](<https://supabase.co>m) - Free PostgreSQL + more
   - [Railway](<https://railway.ap>p) - Free tier with PostgreSQL
   - [Vercel Postgres](<https://vercel.com/storage/postgre>s) - $0.30/GB

3. **Stripe Account** (for payments)
   - Already set up ✅
   - You'll need your production API keys

---

## 🗄️ Step 1: Set Up Production Database

### Option A: Neon (Recommended - Easiest)

1. **Create Account**

   - Go to: <<https://neon.tec>h>
   - Sign up with GitHub

2. **Create Database**

   ```
   Project name: farmers-market-prod
   Region: Choose closest to your users
   Database name: farmers_market
   ```

3. **Get Connection String**

   ```
   Click "Connection String"
   Copy the PostgreSQL connection string
   Format: postgresql://user:pass@host/farmers_market?sslmode=require
   ```

4. **Save for later** - You'll need this for Vercel env vars

### Option B: Supabase (More Features)

1. **Create Project**

   - Go to: <<https://supabase.co>m>
   - New Project → "farmers-market-prod"

2. **Get Connection String**

   ```
   Settings → Database
   Connection string → URI format
   Copy the connection string
   ```

3. **Enable Connection Pooling**
   ```
   Settings → Database → Connection Pooling
   Enable "Transaction" mode
   ```

### Option C: Railway (Developer-Friendly)

1. **Create Project**

   - Go to: <<https://railway.ap>p>
   - New Project → PostgreSQL

2. **Get Connection String**
   ```
   PostgreSQL → Connect tab
   Copy DATABASE_URL
   ```

---

## 🚀 Step 2: Prepare Your Project

### Update Environment Variables

Create `.env.production.local` (don't commit this!):

```env
# Database (from Step 1)
DATABASE_URL="postgresql://user:pass@host/farmers_market?sslmode=require"

# NextAuth
NEXTAUTH_URL="<https://your-app.vercel.app">
NEXTAUTH_SECRET="your-super-secret-key-32-chars-minimum"

# Stripe (Production Keys!)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Optional
REDIS_URL="redis://..."
```

### Generate NextAuth Secret

```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or use this command
openssl rand -base64 32
```

### Update `next.config.js`

Ensure it's optimized for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: ["your-cdn.com", "uploadthing.com"],
    formats: ["image/avif", "image/webp"],
  },

  // Environment variables that can be exposed to client
  env: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  },
};

module.exports = nextConfig;
```

---

## 📦 Step 3: Deploy to Vercel

### Method A: Deploy via Vercel CLI (Recommended)

#### Install Vercel CLI

```bash
# Install globally
npm i -g vercel

# Or use with npx
npx vercel
```

#### Login to Vercel

```bash
vercel login

# Follow the email verification link
```

#### Deploy

```bash
# Navigate to your project
cd V:\Projects\Farmers-Market\farmers-market

# Deploy (first time)
vercel

# Follow the prompts:
# Set up and deploy? Yes
# Which scope? Your username
# Link to existing project? No
# Project name? farmers-market
# Directory? ./
# Override settings? No
```
### Output
```
✅  Production: <https://farmers-market-xxx.vercel.app> [copied to clipboard]
```

### Method B: Deploy via GitHub Integration

#### 1. Push to GitHub (Already Done! ✅)

Your code is already on GitHub: <https://github.com/Gogzia/farmers-market>

#### 2. Import to Vercel

1. Go to: <https://vercel.com/new>
2. Click "Import Git Repository"
3. Select your GitHub repository: `Gogzia/farmers-market`
4. Configure project:

   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

5. Click "Deploy"

#### 3. Wait for Deployment

- ⏱️ First build takes 3-5 minutes
- 📊 Watch the build logs
- ✅ Success! You'll get a live URL

---

## 🔐 Step 4: Configure Environment Variables

### In Vercel Dashboard

1. Go to your project on Vercel
2. Click "Settings" → "Environment Variables"
3. Add each variable:

#### Production Environment Variables

```plaintext
DATABASE_URL
postgresql://user:pass@host/farmers_market?sslmode=require

NEXTAUTH_URL
<https://your-app.vercel.app>

NEXTAUTH_SECRET
[your-generated-secret-from-step-2]

STRIPE_SECRET_KEY
sk_live_[your-production-key]

STRIPE_PUBLISHABLE_KEY
pk_live_[your-production-key]

STRIPE_WEBHOOK_SECRET
whsec_[created-in-next-step]
```
### For each variable
1. Click "Add New"
2. Enter Key (e.g., `DATABASE_URL`)
3. Enter Value
4. Select Environments: `Production`, `Preview`, `Development`
5. Click "Save"

### Redeploy After Adding Variables

```bash
# Trigger a new deployment
vercel --prod

# Or from dashboard: Deployments → ... → Redeploy
```

---

## 🗄️ Step 5: Initialize Production Database

### Run Migrations

```bash
# Set DATABASE_URL locally (temporarily)
$env:DATABASE_URL="postgresql://user:pass@host/farmers_market?sslmode=require"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run seed

# Or use Prisma Studio to add data manually
npx prisma studio
```

### Verify Database Connection

```bash
# Test connection
npx prisma db pull

# Should show: "Introspected X models and wrote them into prisma/schema.prisma"
```

---

## 💳 Step 6: Configure Stripe Webhooks

### Create Webhook Endpoint

1. Go to: <https://dashboard.stripe.com/webhooks>
2. Click "+ Add endpoint"
3. Endpoint URL:

   ```
   <https://your-app.vercel.app/api/webhooks/stripe>
   ```

4. Events to listen for:

   ```
   ✅ checkout.session.completed
   ✅ payment_intent.succeeded
   ✅ payment_intent.payment_failed
   ✅ charge.succeeded
   ```

5. Click "Add endpoint"

6. **Copy Signing Secret**

   ```
   Signing secret: whsec_xxx...
   ```

7. Add to Vercel environment variables:

   ```
   Key: STRIPE_WEBHOOK_SECRET
   Value: whsec_xxx...
   ```

8. Redeploy Vercel for webhook to work

---

## 🧪 Step 7: Test Your Deployment

### Health Check

```bash
# Check if API is working
curl <https://your-app.vercel.app/api/health>

# Should return: {"status": "ok", ...}
```

### Test User Registration

1. Go to: `<https://your-app.vercel.app/auth/register`>
2. Create a test account
3. Verify email works (if configured)

### Test Login

1. Go to: `<https://your-app.vercel.app/auth/login`>
2. Login with test account
3. Should redirect to dashboard

### Test Shopping Flow

1. Browse products
2. Add to cart
3. Go to checkout
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete purchase
6. Check order in dashboard

---

## 📊 Step 8: Set Up Analytics & Monitoring

### Vercel Analytics (Built-in)

1. Go to project → "Analytics" tab
2. Enable Vercel Analytics
3. View real-time performance metrics

### Error Tracking with Sentry (Optional)

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs

# Follow prompts to configure
```

Add to environment variables:

```
NEXT_PUBLIC_SENTRY_DSN=<https://xxx@sentry.io/xxx>
SENTRY_AUTH_TOKEN=your_auth_token
```

---

## 🌐 Step 9: Custom Domain (Optional)

### Add Custom Domain

1. Go to project → "Settings" → "Domains"
2. Click "Add"
3. Enter your domain: `farmersmarket.com`
4. Follow DNS configuration instructions

### DNS Configuration

Add these records to your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Wait 24-48 hours for DNS propagation.

---

## 🔄 Step 10: Set Up Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub!

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Runs build
# 3. Deploys to production
# 4. Updates your live site
```

### Preview Deployments

Every Pull Request gets a preview URL:

```bash
# Create feature branch
git checkout -b feature/new-design

# Make changes, commit, push
git push origin feature/new-design

# Create PR on GitHub
# Vercel creates preview: <https://farmers-market-git-feature-new-design.vercel.app>
```

---

## 🔍 Monitoring & Maintenance

### Check Deployment Status

```bash
# View deployments
vercel list

# View logs
vercel logs

# View specific deployment
vercel inspect [deployment-url]
```

### Monitor Performance

1. **Vercel Analytics**

   - Page load times
   - Web Vitals (LCP, FID, CLS)
   - Traffic sources

2. **Function Logs**

   - Go to: Deployments → [latest] → Functions
   - View API route execution logs
   - Monitor errors

3. **Build Logs**
   - Check build output
   - Identify build failures
   - Optimize build times

---

## 🐛 Troubleshooting

### Build Fails

**Issue**: "Build failed with exit code 1"

**Solution**:

```bash
# Test build locally first
npm run build

# Fix any TypeScript errors
npm run type-check

# Fix any linting errors
npm run lint

# Then push again
```

### Environment Variables Not Working

**Issue**: `process.env.VARIABLE is undefined`

**Solution**:

1. Verify variables are set in Vercel dashboard
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding variables
4. For client-side access, prefix with `NEXT_PUBLIC_`

### Database Connection Fails

**Issue**: "Can't reach database server"

**Solution**:

```bash
# Verify connection string format
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Ensure SSL mode is included
?sslmode=require

# Check database is accessible from internet
# Test from local machine first
```

### Stripe Webhook Not Working

**Issue**: Webhook events not received

**Solution**:

1. Verify webhook URL is correct: `<https://your-app.vercel.app/api/webhooks/stripe`>
2. Check webhook signing secret matches
3. Test with Stripe CLI:
   ```bash
   stripe listen --forward-to <https://your-app.vercel.app/api/webhooks/stripe>
   ```

---

## 📈 Performance Optimization

### Image Optimization

```javascript
// Use Next.js Image component
import Image from "next/image";

<Image
  src="/images/product.jpg"
  alt="Product"
  width={800}
  height={600}
  priority={true}
/>;
```

### Enable Edge Runtime (Optional)

```typescript
// app/api/route.ts
export const runtime = "edge";
```

### Configure Caching

```typescript
// app/page.tsx
export const revalidate = 3600; // Revalidate every hour
```

---

## ✅ Post-Deployment Checklist

### Essential Checks

- [ ] Site loads at production URL
- [ ] Database connection works
- [ ] User registration works
- [ ] Login/logout works
- [ ] Shopping cart functions
- [ ] Checkout with Stripe works
- [ ] Farmer dashboard accessible
- [ ] All pages render correctly
- [ ] Images load properly
- [ ] API routes respond
- [ ] Forms submit successfully
- [ ] Error pages display correctly (404, 500)

### Security Checks

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Environment variables secured
- [ ] API routes protected with authentication
- [ ] CORS configured properly
- [ ] Rate limiting considered
- [ ] Sensitive data not exposed in client code

### Performance Checks

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Images optimized
- [ ] Code split appropriately
- [ ] Database queries optimized

---

## 🎯 Next Steps

After successful deployment:

1. **Monitor Usage**

   - Check Vercel Analytics daily
   - Monitor error rates
   - Track user signups

2. **Gather Feedback**

   - Share with friends/family
   - Get beta testers
   - Iterate based on feedback

3. **Scale Up**

   - Upgrade Vercel plan if needed
   - Optimize database queries
   - Add caching layer (Redis)

4. **Marketing**
   - Share on social media
   - Create landing page
   - Start SEO optimization

---

## 💰 Costs

### Free Tier Limits

**Vercel**:

- ✅ Unlimited personal projects
- ✅ 100GB bandwidth/month
- ✅ Serverless function execution
- ✅ Preview deployments
- ✅ Custom domains

**Neon Database**:

- ✅ 3 GB storage
- ✅ 1 project
- ✅ Auto-scaling

**Total**: $0/month for MVP! 🎉

### When to Upgrade

Upgrade when you exceed:

- 100GB bandwidth/month → Vercel Pro ($20/month)
- 3GB database → Neon paid plan ($10/month)
- Heavy traffic → Consider CDN optimizations

---

## 📚 Useful Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployments
vercel list

# View logs
vercel logs [deployment-url]

# Promote deployment to production
vercel promote [deployment-url]

# Remove deployment
vercel remove [deployment-name]

# Link local project to Vercel
vercel link

# Pull environment variables
vercel env pull
```

---

## 🆘 Getting Help

### Resources

- **Vercel Docs**: <<https://vercel.com/doc>s>
- **Next.js Deployment**: <<https://nextjs.org/docs/deploymen>t>
- **Vercel Support**: <<https://vercel.com/suppor>t>
- **Community**: <<https://github.com/vercel/vercel/discussion>s>

### Common Issues

Check Vercel's status page: <https://www.vercel-status.com>

---

## 🎉 Success
**Your Farmers Market platform is now LIVE!** 🚀

**Share your URL**: `<https://your-app.vercel.app`>

**What you achieved**:

- ✅ Production-grade deployment
- ✅ Automatic HTTPS
- ✅ Global CDN distribution
- ✅ Continuous deployment from Git
- ✅ Professional web presence

**Congratulations!** You're now running a real business online! 🌟

---

_Last Updated: October 21, 2025_
_Questions? Check troubleshooting or ask for help!_
