# 🚀 Vercel Deployment Guide - Farmers Market Platform

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Deployment Steps](#deployment-steps)
4. [Common Issues & Solutions](#common-issues--solutions)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Rollback Procedures](#rollback-procedures)

---

## ✅ Prerequisites

Before deploying to Vercel, ensure you have:

- [ ] Vercel account with appropriate permissions
- [ ] GitHub repository connected to Vercel
- [ ] PostgreSQL database (Vercel Postgres, Supabase, or external)
- [ ] All required API keys and secrets
- [ ] Local build tested successfully

---

## 🔐 Environment Variables

### Required Variables (CRITICAL)

These MUST be set in Vercel Dashboard → Settings → Environment Variables:

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth (REQUIRED)
NEXTAUTH_SECRET="your-secret-key-min-32-characters-long"
NEXTAUTH_URL="https://your-domain.vercel.app"

# App Configuration (REQUIRED)
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NODE_ENV="production"
```

### Payment Integration (Required for checkout)

```bash
# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Connect (for farmer payouts)
STRIPE_CONNECT_CLIENT_ID="ca_..."
```

### Email Service (Required for notifications)

```bash
# SendGrid
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# OR Nodemailer
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourdomain.com"
```

### File Storage (Required for images)

```bash
# Cloudinary (Recommended)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"

# OR AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

### Optional but Recommended

```bash
# Monitoring & Analytics
SENTRY_AUTH_TOKEN="your-sentry-token"
SENTRY_DSN="https://...@sentry.io/..."
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="your-analytics-id"

# Redis (for caching)
REDIS_URL="redis://...@redis-provider.com:6379"
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# AI Features (if using)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."

# SMS Notifications
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"
```

### Development vs Production

Set environment variables for different environments:

- **Production**: Required for `vercel.app` domain and custom domains
- **Preview**: Used for PR deployments and branch previews
- **Development**: Local development environment (use `.env.local`)

---

## 🚀 Deployment Steps

### Method 1: Automatic Deployment (Recommended)

1. **Connect GitHub Repository**

   ```bash
   # Visit: https://vercel.com/new
   # Select your GitHub repository
   # Click "Import"
   ```

2. **Configure Project**
   - Framework Preset: **Next.js**
   - Build Command: `prisma generate && next build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm ci --legacy-peer-deps`

3. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add all required variables listed above
   - Select appropriate environment (Production/Preview/Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (5-10 minutes)

### Method 2: Vercel CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project (first time only)
vercel link

# Set environment variables via CLI
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... repeat for all variables

# Deploy to production
vercel --prod

# OR deploy to preview
vercel
```

### Method 3: Git Push Deployment

```bash
# Push to main branch for production deployment
git push origin main

# Push to any branch for preview deployment
git push origin feature-branch
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Build Fails - "DATABASE_URL not found"

**Symptom:**

```
Error: Environment variable not found: DATABASE_URL
```

**Solution:**

1. Add `DATABASE_URL` in Vercel Dashboard → Settings → Environment Variables
2. Ensure it's set for "Production" environment
3. Redeploy: `vercel --prod` or push to main branch

**Alternative Fix:**
The build script automatically handles missing DATABASE_URL with a placeholder. If you still see this error, check:

```bash
# In vercel.json, ensure:
{
  "env": {
    "SKIP_ENV_VALIDATION": "true"
  }
}
```

---

### Issue 2: Build Fails - "Turbopack not supported"

**Symptom:**

```
Error: `turbo.createProject` is not supported by the wasm bindings
```

**Solution:**
✅ Already fixed in `next.config.mjs`:

```javascript
experimental: {
  turbo: false,  // Disabled for Vercel
}
```

If still occurring:

1. Clear build cache: Vercel Dashboard → Deployments → Three dots → Clear Cache
2. Redeploy

---

### Issue 3: Build Fails - "Out of Memory"

**Symptom:**

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solution:**

1. Optimize bundle size (already configured in `webpack.config.mjs`)
2. Add build override in `vercel.json`:
   ```json
   {
     "build": {
       "env": {
         "NODE_OPTIONS": "--max-old-space-size=4096"
       }
     }
   }
   ```

---

### Issue 4: Runtime Error - "Prisma Client not generated"

**Symptom:**

```
Error: @prisma/client did not initialize yet
```

**Solution:**
✅ Already fixed in build command:

```json
{
  "buildCommand": "prisma generate && next build"
}
```

If still occurring:

1. Check `package.json` postinstall script:
   ```json
   {
     "scripts": {
       "postinstall": "prisma generate || true"
     }
   }
   ```

---

### Issue 5: NextAuth Session Issues

**Symptom:**

- Users can't log in
- Session expires immediately
- "Invalid credentials" on valid login

**Solution:**

1. Verify `NEXTAUTH_SECRET` is at least 32 characters:

   ```bash
   # Generate a secure secret:
   openssl rand -base64 32
   ```

2. Verify `NEXTAUTH_URL` matches your domain:

   ```bash
   # For production
   NEXTAUTH_URL="https://your-domain.vercel.app"

   # For custom domain
   NEXTAUTH_URL="https://yourdomain.com"
   ```

3. Check allowed callback URLs in OAuth providers (Google, etc.)

---

### Issue 6: API Routes Return 500 Error

**Symptom:**

```
Internal Server Error
```

**Solution:**

1. Check Vercel Function Logs:
   - Dashboard → Deployments → Click deployment → Functions tab
   - Look for detailed error messages

2. Common causes:
   - Missing environment variables
   - Database connection issues
   - Invalid API keys

3. Enable debug logging temporarily:
   ```bash
   # Add to environment variables
   LOG_LEVEL="debug"
   ```

---

### Issue 7: Images Not Loading

**Symptom:**

- Product images show broken
- Upload fails

**Solution:**

1. Configure image domains in `next.config.mjs`:

   ```javascript
   images: {
     remotePatterns: [
       { protocol: "https", hostname: "*.cloudinary.com" },
       { protocol: "https", hostname: "*.vercel-storage.com" },
     ];
   }
   ```

2. Check Cloudinary/S3 credentials in environment variables

3. Verify image URLs in database are accessible

---

### Issue 8: Stripe Webhooks Not Working

**Symptom:**

- Orders stuck in pending
- Payments not confirming

**Solution:**

1. Update webhook endpoint in Stripe Dashboard:

   ```
   https://your-domain.vercel.app/api/webhooks/stripe
   ```

2. Copy webhook signing secret to environment variables:

   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

3. Test webhook:
   ```bash
   stripe listen --forward-to https://your-domain.vercel.app/api/webhooks/stripe
   ```

---

### Issue 9: Slow Cold Starts

**Symptom:**

- First request takes 10+ seconds
- API routes timeout

**Solution:**

1. Enable Edge Runtime for API routes (where possible):

   ```typescript
   // app/api/your-route/route.ts
   export const runtime = "edge";
   ```

2. Implement caching:

   ```typescript
   export const revalidate = 60; // Cache for 60 seconds
   ```

3. Use Vercel Pro for faster cold starts

---

### Issue 10: Database Connection Limit Exceeded

**Symptom:**

```
Error: Too many database connections
```

**Solution:**

1. Use connection pooling (already configured):

   ```typescript
   // lib/database/index.ts
   export const database = new PrismaClient({
     connectionLimit: 10,
   });
   ```

2. Upgrade database plan for more connections

3. Use Prisma Data Proxy (recommended for serverless):
   ```bash
   # In DATABASE_URL
   DATABASE_URL="prisma://..."
   ```

---

## ✅ Post-Deployment Verification

After successful deployment, verify:

### 1. Homepage Loads

```bash
curl -I https://your-domain.vercel.app
# Should return 200 OK
```

### 2. API Health Check

```bash
curl https://your-domain.vercel.app/api/health
# Should return: {"status":"ok"}
```

### 3. Database Connection

```bash
curl https://your-domain.vercel.app/api/health/db
# Should return: {"database":"connected"}
```

### 4. Authentication

- Navigate to `/login`
- Test login with valid credentials
- Verify session persists after refresh

### 5. Core Features

- [ ] Browse products
- [ ] Add to cart
- [ ] Complete checkout (test mode)
- [ ] Upload images (farmer dashboard)
- [ ] Create new farm

### 6. Monitoring

- Check Vercel Analytics Dashboard
- Verify Sentry error tracking
- Monitor function execution times

---

## 🔄 Rollback Procedures

### Instant Rollback (Vercel Dashboard)

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click three dots → "Promote to Production"
4. Confirm rollback

### Git Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# OR reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

### Emergency Rollback (CLI)

```bash
# List recent deployments
vercel ls

# Promote specific deployment to production
vercel promote <deployment-url> --prod
```

---

## 📊 Performance Optimization

### Recommended Settings

```json
// vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 10,
      "memory": 1024
    },
    "src/app/api/ai/**/*.ts": {
      "maxDuration": 30,
      "memory": 3008
    }
  },
  "regions": ["iad1"],
  "crons": [
    {
      "path": "/api/cron/cleanup-sessions",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Bundle Optimization

Already configured in `webpack.config.mjs`:

- ✅ Code splitting by route
- ✅ Vendor chunk separation
- ✅ Tree shaking enabled
- ✅ Minification active

### Caching Strategy

```typescript
// Static pages - Cache for 1 hour
export const revalidate = 3600;

// Dynamic pages - Cache for 5 minutes
export const revalidate = 300;

// API routes - No cache
export const dynamic = "force-dynamic";
```

---

## 🔒 Security Checklist

Before going to production:

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] CSP headers configured (in `next.config.mjs`)
- [ ] Rate limiting enabled (via middleware)
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] XSS protection (React automatic escaping)
- [ ] CSRF tokens for state-changing operations
- [ ] Input validation (Zod schemas)
- [ ] Authentication required for protected routes
- [ ] API routes have proper authorization checks

---

## 📞 Support & Resources

### Vercel Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js 15 Guide](https://nextjs.org/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### Project-Specific

- Check `DEPLOYMENT_CHECKLIST.md` for pre-deployment tasks
- Review `QUICK_START_GUIDE.md` for local setup
- See `README.md` for architecture overview

### Getting Help

1. Check Vercel Function Logs first
2. Review Sentry error tracking
3. Search GitHub issues
4. Contact project maintainers

---

## 🎯 Success Metrics

Monitor these after deployment:

| Metric       | Target      | Critical     |
| ------------ | ----------- | ------------ |
| Build Time   | < 5 minutes | < 10 minutes |
| Cold Start   | < 2 seconds | < 5 seconds  |
| Page Load    | < 3 seconds | < 5 seconds  |
| API Response | < 500ms     | < 2 seconds  |
| Error Rate   | < 0.1%      | < 1%         |
| Uptime       | > 99.9%     | > 99%        |

---

## 🌟 Quick Reference

### Essential Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>

# Clear build cache
vercel --force

# Set environment variable
vercel env add VARIABLE_NAME production
```

### Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Deployment Logs**: Dashboard → Deployments → Select deployment
- **Environment Variables**: Dashboard → Settings → Environment Variables
- **Custom Domains**: Dashboard → Settings → Domains
- **Analytics**: Dashboard → Analytics

---

## ✅ Final Checklist

Before marking deployment as complete:

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Build completes successfully
- [ ] Homepage loads without errors
- [ ] Authentication works
- [ ] Payment processing functional (test mode)
- [ ] Image uploads working
- [ ] Email notifications sending
- [ ] Monitoring/analytics configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Backup/rollback plan documented
- [ ] Team notified of deployment

---

**🎉 Deployment Complete!**

Your Farmers Market Platform is now live on Vercel!

Monitor the first 24 hours closely and check:

- Error rates in Sentry
- Function execution times in Vercel
- User feedback for any issues

**Last Updated**: January 2025
**Version**: 1.0.0
**Agricultural Consciousness**: ACTIVE ✨
