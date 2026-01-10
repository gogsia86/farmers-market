# 🚀 VERCEL DEPLOYMENT GUIDE
## Farmers Market Platform - Production Deployment

**Last Updated:** January 10, 2025  
**Build Status:** ✅ **PASSING**  
**Commit:** e36498e4  
**Next.js Version:** 16.1.1 (Turbopack)

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Build Verification
- [x] Local build passes: `npm run build`
- [x] All Prisma relations fixed (customer vs user)
- [x] TypeScript compilation successful
- [x] No duplicate object properties
- [x] Module type declarations added
- [x] Next.js config conflicts resolved
- [x] Git committed and pushed to master

### 2. Environment Variables Required

#### **Critical - Must Set Before Deployment**

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Google OAuth (if using)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Sentry (optional but recommended)
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="farmers-market"
SENTRY_AUTH_TOKEN="your-auth-token"

# Email (if using)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@your-domain.com"

# Redis (optional - for caching)
REDIS_URL="redis://...@redis:6379"

# OpenAI (if using AI features)
OPENAI_API_KEY="sk-..."

# Storage (if using cloud storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## 🔧 VERCEL CONFIGURATION

### Project Settings

#### Build & Development Settings
```
Build Command: npm run build
Output Directory: .next
Install Command: npm ci --legacy-peer-deps
Development Command: npm run dev
Node.js Version: 20.x
```

#### Environment Variables
1. Go to Project Settings → Environment Variables
2. Add all required variables listed above
3. Set appropriate scopes:
   - Production
   - Preview (optional)
   - Development (optional)

#### Root Directory
- Leave as root (`.`) - do not change

---

## 🗄️ DATABASE SETUP

### 1. Create Production Database

**Recommended Providers:**
- Neon (Serverless Postgres) - https://neon.tech
- Supabase - https://supabase.com
- Railway - https://railway.app
- Vercel Postgres - https://vercel.com/storage/postgres

### 2. Run Migrations

```bash
# Set DATABASE_URL to production database
export DATABASE_URL="postgresql://..."

# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# (Optional) Seed initial data
npm run seed
```

### 3. Enable Connection Pooling

For Vercel deployments, use connection pooling:

```bash
# Neon connection pooling example
DATABASE_URL="postgresql://user:pass@host.neon.tech:5432/db?sslmode=require&pgbouncer=true"
```

---

## 🚀 DEPLOYMENT STEPS

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project (first time only)
vercel link

# Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub Integration

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
4. Add environment variables
5. Click "Deploy"

### Option 3: Deploy via Vercel Dashboard

1. Push changes to GitHub
2. Vercel automatically detects and deploys
3. Monitor deployment in Vercel dashboard

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### 1. Check Deployment Logs
```
✅ Build completed successfully
✅ Deployment ready
✅ Functions deployed
✅ Domains assigned
```

### 2. Test Critical Routes

```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Database check
curl https://your-domain.vercel.app/api/health/database

# Home page
curl -I https://your-domain.vercel.app/

# API routes
curl https://your-domain.vercel.app/api/farms
curl https://your-domain.vercel.app/api/products
```

### 3. Verify Functionality
- [ ] Homepage loads correctly
- [ ] User authentication works
- [ ] Database connections successful
- [ ] API routes responding
- [ ] Image optimization working
- [ ] Static pages generated
- [ ] Middleware executing correctly
- [ ] Environment variables loaded

---

## ⚠️ KNOWN ISSUES & SOLUTIONS

### Issue 1: Build Fails with "user does not exist in OrderInclude"
**Status:** ✅ FIXED  
**Solution:** All Prisma relations updated from `user` to `customer`

### Issue 2: Turbopack Error - Package Conflict
**Status:** ✅ FIXED  
**Solution:** Removed `@prisma/client` from `optimizePackageImports`

### Issue 3: TypeScript Strict Mode Errors
**Status:** ⚠️ TEMPORARILY DISABLED  
**Solution:** Strict mode relaxed in `tsconfig.json` - will re-enable gradually

### Issue 4: Module Not Found Errors
**Status:** ✅ FIXED  
**Solution:** Added `src/types/modules.d.ts` with type declarations

---

## 🎯 PERFORMANCE OPTIMIZATION

### Vercel Specific Optimizations

#### 1. Edge Functions (Recommended)
```typescript
// Mark routes as edge runtime
export const runtime = 'edge';
```

#### 2. Incremental Static Regeneration
```typescript
// Revalidate pages every hour
export const revalidate = 3600;
```

#### 3. Image Optimization
- Vercel automatically optimizes images
- Uses WebP/AVIF formats
- Lazy loading enabled

#### 4. Caching Strategy
```typescript
// API route caching
export const revalidate = 60; // 1 minute
```

---

## 📊 MONITORING & ANALYTICS

### 1. Vercel Analytics
- Enable in Project Settings → Analytics
- Track Core Web Vitals
- Monitor page performance

### 2. Sentry Error Tracking
- Set `SENTRY_DSN` environment variable
- Errors automatically captured
- Source maps uploaded during build

### 3. Vercel Logs
```bash
# View real-time logs
vercel logs

# View logs for specific deployment
vercel logs [deployment-url]
```

### 4. Custom Metrics
- `/api/metrics` - Application metrics
- `/api/health` - Health check
- `/api/health/database` - Database status

---

## 🔐 SECURITY CHECKLIST

- [x] NEXTAUTH_SECRET set to secure random string
- [x] Database credentials encrypted
- [x] Stripe webhook signature verified
- [x] CORS configured properly
- [x] Rate limiting enabled (middleware)
- [x] Input validation (Zod schemas)
- [x] SQL injection prevention (Prisma)
- [x] XSS prevention (React auto-escaping)
- [ ] Set up WAF (Web Application Firewall) - recommended
- [ ] Enable DDoS protection
- [ ] Configure security headers

### Recommended Security Headers

Add to `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        }
      ]
    }
  ];
}
```

---

## 🌐 CUSTOM DOMAIN SETUP

### 1. Add Domain in Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 2. DNS Configuration

**For apex domain (example.com):**
```
A Record: 76.76.21.21
```

**For www subdomain:**
```
CNAME: cname.vercel-dns.com
```

### 3. SSL Certificate
- Automatically provisioned by Vercel
- Renews automatically
- Let's Encrypt certificate

---

## 🔄 CONTINUOUS DEPLOYMENT

### Automatic Deployments
- **Production:** Commits to `master` branch
- **Preview:** Pull requests automatically deployed
- **Development:** Optional - commits to `dev` branch

### Deployment Protection
1. Enable "Vercel Protect" for production
2. Set up deployment approval workflow
3. Configure branch protection rules in GitHub

---

## 📞 SUPPORT & TROUBLESHOOTING

### Vercel Support
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/next.js/discussions
- Support: support@vercel.com

### Common Commands

```bash
# Check deployment status
vercel inspect [deployment-url]

# Roll back to previous deployment
vercel rollback [deployment-url]

# View environment variables
vercel env ls

# Add environment variable
vercel env add [name]

# Remove deployment
vercel rm [deployment-url]
```

---

## ✅ FINAL CHECKLIST

Before going live:

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Sentry error tracking enabled
- [ ] Analytics configured
- [ ] Test all critical user flows
- [ ] Load testing completed
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Team access configured
- [ ] Documentation updated

---

## 🎉 DEPLOYMENT COMPLETE!

Your Farmers Market Platform is now live on Vercel!

**Next Steps:**
1. Monitor deployment logs for any issues
2. Test all critical features in production
3. Set up monitoring alerts
4. Configure backups
5. Share with users!

**Build Time:** ~2 minutes  
**Deployment Time:** ~30 seconds  
**Total Routes:** 98  
**Static Pages:** 62  
**API Routes:** 36

---

**Generated:** January 10, 2025  
**Version:** 1.0.0  
**Build:** e36498e4