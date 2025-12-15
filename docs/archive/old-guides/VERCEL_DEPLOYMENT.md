# 🚀 Vercel Deployment Guide - Farmers Market Platform

## Pre-Deployment Checklist

Before deploying to Vercel, ensure you have:

- ✅ Vercel account at https://vercel.com
- ✅ PostgreSQL database (Vercel Postgres, Supabase, or external)
- ✅ Redis instance (Upstash recommended for Vercel)
- ✅ Environment variables configured
- ✅ GitHub repository connected

---

## Quick Deploy (Automated)

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub Integration

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin master
   ```

2. **Import on Vercel**
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Configure environment variables (see below)
   - Click "Deploy"

---

## Environment Variables Configuration

### Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

#### Database Configuration

```bash
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
```

**Recommended Database Providers:**

- **Vercel Postgres** (easiest integration)
- **Supabase** (free tier available)
- **Railway** (PostgreSQL hosting)
- **Neon** (serverless PostgreSQL)

#### Redis Configuration

```bash
REDIS_URL="redis://default:password@host:6379"
```

**Recommended Redis Providers:**

- **Upstash** (serverless Redis, perfect for Vercel)
- **Redis Labs** (free tier available)

#### Authentication (NextAuth)

```bash
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

Generate secret:

```bash
openssl rand -base64 32
```

#### Payment Integration (Optional)

```bash
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID="your_client_id"
PAYPAL_CLIENT_SECRET="your_secret"
```

#### Email Service (Optional)

```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.your-sendgrid-api-key"
SMTP_FROM="noreply@yourdomain.com"
```

#### AI Integration (Optional)

```bash
PERPLEXITY_API_KEY="pplx-your-api-key"
```

#### Application URLs

```bash
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_API_URL="https://your-domain.vercel.app/api"
```

---

## Step-by-Step Deployment

### Step 1: Set Up Database

#### Using Vercel Postgres (Recommended)

1. Go to https://vercel.com/dashboard/stores
2. Click "Create Database"
3. Select "Postgres"
4. Copy the `DATABASE_URL` connection string
5. Add to environment variables

#### Using Supabase (Free Alternative)

1. Create account at https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string (Session mode)
5. Add to Vercel environment variables

### Step 2: Set Up Redis (Upstash)

1. Create account at https://upstash.com
2. Create Redis database
3. Select region close to your Vercel deployment
4. Copy `REDIS_URL`
5. Add to Vercel environment variables

### Step 3: Configure Vercel Project

1. Go to https://vercel.com/medicis-projects
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm ci`

### Step 4: Add Environment Variables

In Vercel Dashboard:

1. Go to Settings → Environment Variables
2. Add all required variables (listed above)
3. Select environments: Production, Preview, Development
4. Click "Save"

### Step 5: Run Database Migrations

After first deployment:

```bash
# Install Vercel CLI
npm install -g vercel

# Link to your project
vercel link

# Run migrations on production database
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

Or use Vercel CLI:

```bash
vercel env pull
npm run db:migrate
npm run db:seed
```

### Step 6: Deploy!

```bash
# Deploy to production
vercel --prod

# Or push to GitHub (if connected)
git push origin master
```

---

## Post-Deployment Setup

### 1. Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Domains
2. Click "Add"
3. Enter your domain
4. Update DNS records as instructed
5. Wait for SSL certificate (automatic)

### 2. Set Up Stripe Webhooks

If using Stripe payments:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Events: Select payment events
5. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 3. Monitor Deployment

- **Analytics**: https://vercel.com/medicis-projects/analytics
- **Logs**: https://vercel.com/medicis-projects/logs
- **Performance**: Check Core Web Vitals

### 4. Test Production

Visit your deployment:

- Homepage: `https://your-domain.vercel.app`
- Admin: `https://your-domain.vercel.app/admin-login`
- API Health: `https://your-domain.vercel.app/api/health`

---

## Vercel CLI Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Open project in browser
vercel open

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add

# Link local project
vercel link

# Get deployment URL
vercel inspect
```

---

## Database Providers Comparison

### Vercel Postgres

- ✅ **Best integration** with Vercel
- ✅ Automatic scaling
- ✅ Built-in connection pooling
- ⚠️ Pay-as-you-go pricing
- 📍 Region: Choose closest to deployment

### Supabase

- ✅ **Free tier**: 500MB database
- ✅ PostgreSQL + PostGIS
- ✅ Real-time subscriptions
- ✅ Built-in auth (optional)
- 📍 Multiple regions available

### Railway

- ✅ **$5/month** PostgreSQL
- ✅ Easy setup
- ✅ Automatic backups
- ✅ High availability
- 📍 US, EU regions

### Neon

- ✅ **Serverless PostgreSQL**
- ✅ Generous free tier
- ✅ Branching databases
- ✅ Scale to zero
- 📍 Multiple regions

---

## Troubleshooting

### Build Fails

**Error: Out of memory**

```bash
# Solution: Increase Node memory in vercel.json
{
  "build": {
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=4096"
    }
  }
}
```

**Error: Module not found**

```bash
# Solution: Ensure all dependencies in package.json
npm install <missing-package>
git commit -am "Add missing dependency"
git push
```

### Database Connection Issues

**Error: Can't reach database**

- ✅ Check `DATABASE_URL` is correct
- ✅ Ensure database allows connections from Vercel IPs
- ✅ Use connection pooling (Prisma Accelerate)
- ✅ Check SSL mode: `?sslmode=require`

### Environment Variables Not Working

**Variables not found in build**

- ✅ Ensure variables are added in Vercel Dashboard
- ✅ Check variable names match exactly
- ✅ Redeploy after adding variables
- ✅ Use `NEXT_PUBLIC_` prefix for client-side variables

### 500 Internal Server Error

Check logs:

```bash
vercel logs --follow
```

Common causes:

- Database not migrated
- Missing environment variables
- API route errors

---

## Performance Optimization

### 1. Enable Edge Functions (Optional)

For API routes that need low latency:

```typescript
// app/api/health/route.ts
export const runtime = "edge";
```

### 2. Configure Image Optimization

Already configured in `next.config.mjs`:

- WebP and AVIF formats
- Remote image domains
- Automatic optimization

### 3. Enable Caching

Use Redis for:

- Session storage
- API response caching
- Rate limiting

### 4. Monitor Performance

- Core Web Vitals in Vercel Dashboard
- Real User Monitoring (RUM)
- Error tracking with Sentry

---

## Security Checklist

Before going live:

- [ ] Change all default credentials
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set secure headers (already in vercel.json)
- [ ] Enable rate limiting
- [ ] Configure CSP headers
- [ ] Set up WAF (Vercel Enterprise)
- [ ] Regular security updates

---

## Scaling Considerations

### Vercel Limits (Free Tier)

- **Bandwidth**: 100GB/month
- **Function Duration**: 10 seconds
- **Function Memory**: 1GB
- **Deployments**: Unlimited

### Upgrade to Pro ($20/month)

- **Bandwidth**: 1TB/month
- **Function Duration**: 60 seconds
- **Function Memory**: 3GB
- **Custom domains**: Unlimited
- **Team members**: Unlimited

### Database Scaling

- Use connection pooling (PgBouncer)
- Consider Prisma Accelerate
- Implement caching layer (Redis)
- Monitor query performance

---

## Continuous Deployment

### Automatic Deployments

Once connected to GitHub:

- ✅ **Push to main** → Production deployment
- ✅ **Push to branch** → Preview deployment
- ✅ **Pull request** → Preview URL in PR

### Preview Deployments

Every PR gets a unique URL:

```
https://farmers-market-git-feature-branch-medicis-projects.vercel.app
```

### Rollback

If something goes wrong:

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback <deployment-url>
```

---

## Monitoring & Analytics

### Built-in Vercel Analytics

- Page views
- Core Web Vitals
- Real User Monitoring
- Error tracking

### Custom Monitoring

- Sentry for error tracking
- LogRocket for session replay
- PostHog for product analytics

---

## Cost Estimation

### Vercel

- **Free tier**: Good for development/testing
- **Pro ($20/month)**: Recommended for production
- **Enterprise**: Custom pricing

### Database (Supabase Free Tier)

- **Storage**: 500MB
- **Bandwidth**: 5GB
- **API requests**: Unlimited
- **Upgrade**: $25/month for more

### Redis (Upstash)

- **Free tier**: 10,000 commands/day
- **Pay-as-you-go**: $0.20 per 100k commands
- **Upgrade**: Starting at $10/month

### Total Monthly (Small Scale)

- Vercel Pro: $20
- Database: $0 (free tier)
- Redis: $0 (free tier)
- **Total**: $20/month

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Vercel Discord**: https://vercel.com/discord
- **GitHub Issues**: Your repository issues page

---

## Quick Deploy Command

```bash
# One-command deploy
npx vercel --prod
```

That's it! Your Farmers Market Platform will be live on Vercel! 🎉

---

**Last Updated**: November 12, 2025  
**Platform Version**: 1.0.0  
**Deployment Target**: Vercel (https://vercel.com/medicis-projects)
