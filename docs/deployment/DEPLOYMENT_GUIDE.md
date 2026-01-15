# 🚀 DEPLOYMENT GUIDE
## Farmers Market Platform - Production Deployment

**Last Updated**: January 14, 2025  
**Difficulty**: Intermediate  
**Time Required**: 30-60 minutes

---

## 📋 Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deployment Options](#deployment-options)
- [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This guide covers deploying the Farmers Market Platform to production. We support two primary deployment methods:

1. **Vercel** (Recommended) - Easiest, automatic scaling, serverless
2. **Docker** - Full control, self-hosted, traditional infrastructure

**Recommended for Most Users**: Vercel deployment

---

## ✅ Pre-Deployment Checklist

Before deploying to production, ensure:

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Production build works (`npm run build`)

### Database
- [ ] Production database provisioned
- [ ] Migrations tested on staging
- [ ] Seed data prepared (if needed)
- [ ] Backups configured
- [ ] Performance indexes applied

### Security
- [ ] All environment variables set
- [ ] No secrets in code
- [ ] Security audit passed
- [ ] SSL/TLS certificates ready
- [ ] Rate limiting configured

### Services
- [ ] Stripe account in production mode
- [ ] Email service configured (SendGrid, etc.)
- [ ] SMS service ready (Twilio)
- [ ] Redis cache provisioned (optional)
- [ ] Storage service ready (Cloudinary, etc.)

### Monitoring
- [ ] Sentry configured
- [ ] Error tracking tested
- [ ] Performance monitoring ready
- [ ] Alert notifications set up

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Pros**:
- ✅ Zero-config deployment
- ✅ Automatic scaling
- ✅ Global CDN
- ✅ Preview deployments for PRs
- ✅ Automatic HTTPS
- ✅ Built-in monitoring

**Cons**:
- ⚠️ Vendor lock-in
- ⚠️ Function timeout limits (10s on Pro)
- ⚠️ Less control over infrastructure

**Best For**: Quick deployment, automatic scaling, minimal DevOps

### Option 2: Docker

**Pros**:
- ✅ Full control
- ✅ Run anywhere (AWS, GCP, Azure, etc.)
- ✅ No vendor lock-in
- ✅ Customizable infrastructure

**Cons**:
- ⚠️ More complex setup
- ⚠️ Manual scaling
- ⚠️ More maintenance required

**Best For**: Enterprise deployments, specific infrastructure requirements

---

## 🌐 Vercel Deployment (Recommended)

### Prerequisites

- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)
- Production database URL

### Step 1: Prepare Repository

```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Add New Project"**
3. **Import your Git repository**
4. **Configure project**:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run vercel-build`
   - Output Directory: `.next`

### Step 3: Set Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://yourdomain.com

# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key

# Redis (optional but recommended)
REDIS_URL=redis://...

# Monitoring
SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=sntrys_...

# AI Services (optional)
OPENAI_API_KEY=sk-...

# Storage
CLOUDINARY_URL=cloudinary://...
```

**Important**: Set environment variables for all three environments:
- Production
- Preview
- Development

### Step 4: Deploy

```bash
# Install Vercel CLI (optional, for manual deploys)
npm i -g vercel

# Deploy to production
vercel --prod

# Or just push to main branch for automatic deployment
git push origin main
```

### Step 5: Configure Custom Domain

1. **Go to Project Settings → Domains**
2. **Add your domain** (e.g., `farmersmarket.com`)
3. **Update DNS records** as instructed by Vercel
4. **Wait for SSL certificate** (automatic, ~5 minutes)

### Step 6: Database Migrations

```bash
# Run migrations on production database
# Option 1: Using Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy

# Option 2: Set DATABASE_URL locally to production
export DATABASE_URL="your-production-database-url"
npx prisma migrate deploy
```

**⚠️ WARNING**: Always backup database before running migrations!

### Step 7: Seed Production Data (if needed)

```bash
# Seed initial data (farms, categories, etc.)
npm run seed:production

# Or use custom seeding script
npx tsx scripts/seed-vercel-production.ts
```

---

## 🐳 Docker Deployment

### Prerequisites

- Docker installed
- Docker Compose installed
- Server with SSH access
- Domain name configured

### Step 1: Build Docker Image

```bash
# Build production image
docker build -t farmers-market:latest -f docker/Dockerfile .

# Or use docker-compose
docker-compose build
```

### Step 2: Configure Environment

Create `.env.production`:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yourdomain.com
# ... (all other env vars)
```

### Step 3: Docker Compose Setup

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    image: farmers-market:latest
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: farmers_market
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

### Step 4: Deploy to Server

```bash
# Copy files to server
scp -r . user@your-server:/opt/farmers-market/

# SSH into server
ssh user@your-server

# Navigate to directory
cd /opt/farmers-market

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### Step 5: Set Up Nginx (if not using docker nginx)

```nginx
# /etc/nginx/sites-available/farmers-market
server {
    listen 80;
    server_name farmersmarket.com www.farmersmarket.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name farmersmarket.com www.farmersmarket.com;

    ssl_certificate /etc/letsencrypt/live/farmersmarket.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/farmersmarket.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔐 Environment Variables

### Required Variables

```env
# Core
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=random-32-char-string
NEXTAUTH_URL=https://yourdomain.com

# Stripe (Production Keys)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxx
```

### Optional but Recommended

```env
# Caching
REDIS_URL=redis://default:password@host:6379

# Monitoring
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx

# AI Features
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx

# Storage
CLOUDINARY_URL=cloudinary://xxx:xxx@xxx

# SMS
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx
```

### Security Best Practices

1. **Never commit `.env` files**
2. **Use strong, random secrets** (`openssl rand -base64 32`)
3. **Rotate secrets regularly** (every 90 days)
4. **Use different secrets per environment**
5. **Use secret management** (AWS Secrets Manager, etc.)

---

## 🗄️ Database Setup

### Option 1: Managed PostgreSQL (Recommended)

**Providers**:
- **Supabase** - Great free tier, automatic backups
- **Railway** - Simple, good DX
- **Neon** - Serverless Postgres, scale to zero
- **Render** - Integrated platform
- **AWS RDS** - Enterprise grade
- **Google Cloud SQL** - Enterprise grade

**Setup Steps**:
1. Create database instance
2. Get connection string
3. Add to environment variables
4. Run migrations
5. Configure backups

### Option 2: Self-Hosted PostgreSQL

```bash
# Using Docker
docker run -d \
  --name postgres \
  -e POSTGRES_DB=farmers_market \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=secure-password \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine

# Run migrations
npx prisma migrate deploy

# Seed data
npm run seed:production
```

### Database Performance Optimization

**Run optimization script** (IMPORTANT for performance):

```bash
# Apply performance indexes
npm run db:optimize

# Or manually run SQL script
psql $DATABASE_URL < scripts/quick-performance-fixes.sql
```

**Expected improvement**: 50-70% faster queries

### Backup Strategy

**Automated Backups**:
```bash
# Daily backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Compress
gzip backup-$(date +%Y%m%d).sql

# Upload to S3 (optional)
aws s3 cp backup-$(date +%Y%m%d).sql.gz s3://backups/
```

**Backup Retention**:
- Daily backups: Keep 7 days
- Weekly backups: Keep 4 weeks
- Monthly backups: Keep 12 months

---

## ✅ Post-Deployment

### Verification Checklist

```bash
# 1. Health Check
curl https://yourdomain.com/api/health

# 2. Database Connection
# Should return success

# 3. Authentication
# Try logging in with test account

# 4. Payment Processing
# Test with Stripe test card

# 5. Email Sending
# Trigger password reset email

# 6. Error Tracking
# Check Sentry dashboard
```

### Smoke Tests

Test these critical flows:
- [ ] User registration
- [ ] User login
- [ ] Farm creation
- [ ] Product listing
- [ ] Add to cart
- [ ] Checkout process
- [ ] Payment processing
- [ ] Order confirmation email
- [ ] Admin dashboard access
- [ ] API endpoints responding

### Configure Monitoring

1. **Sentry**:
   - Verify error tracking works
   - Set up alert rules
   - Configure user feedback

2. **Performance Monitoring**:
   - Enable Vercel Analytics
   - Set up custom metrics
   - Configure slow query alerts

3. **Uptime Monitoring**:
   - Use UptimeRobot or similar
   - Monitor critical endpoints
   - Set up SMS/email alerts

---

## 📊 Monitoring & Maintenance

### Daily Checks

```bash
# Check error rate
# Sentry dashboard

# Check performance
# Vercel Analytics / Custom metrics

# Check database health
npm run diagnose:db

# Check cache health (if using Redis)
npm run redis:health
```

### Weekly Tasks

- Review error logs
- Check slow queries
- Monitor database size
- Review user feedback
- Update dependencies (security patches)

### Monthly Tasks

- Full security audit
- Performance optimization
- Database maintenance (VACUUM, ANALYZE)
- Rotate secrets
- Review and update documentation

### Performance Monitoring

**Key Metrics to Track**:
- Page load time (target: <2s)
- API response time (target: <500ms)
- Database query time (target: <100ms)
- Error rate (target: <0.1%)
- Uptime (target: >99.9%)

**Tools**:
- Vercel Analytics
- Sentry Performance
- Custom CloudWatch metrics
- Grafana dashboards

---

## 🔄 Rollback Procedures

### Vercel Rollback

**Instant Rollback** (Vercel Dashboard):
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Confirm rollback

**CLI Rollback**:
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Docker Rollback

```bash
# Pull previous image
docker pull farmers-market:previous

# Stop current container
docker-compose down

# Start previous version
docker-compose up -d

# Or use git tags
git checkout v1.0.0
docker-compose build
docker-compose up -d
```

### Database Rollback

**⚠️ DANGEROUS - Use with extreme caution**

```bash
# Restore from backup
psql $DATABASE_URL < backup-20250114.sql

# Or use migration rollback
npx prisma migrate resolve --rolled-back <migration-name>
```

**Best Practice**: Test rollbacks on staging first!

---

## 🔧 Troubleshooting

### Application Won't Start

```bash
# Check logs
vercel logs        # Vercel
docker logs app    # Docker

# Common issues:
# 1. Missing environment variables
# 2. Database connection failed
# 3. Build errors
# 4. Port conflicts
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check connection limit
psql $DATABASE_URL -c "SHOW max_connections;"

# Check active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Solution: Use connection pooling (PgBouncer)
```

### Performance Issues

```bash
# Check slow queries
npm run db:check-slow-queries

# Apply performance indexes
npm run db:optimize

# Enable query logging
# In Prisma, set log: ['query']

# Check Redis cache hit rate
redis-cli INFO stats | grep keyspace
```

### Payment Processing Errors

```bash
# Verify Stripe keys
curl https://api.stripe.com/v1/charges \
  -u sk_live_xxx:

# Check webhook endpoint
curl https://yourdomain.com/api/webhooks/stripe

# View Stripe logs
# Stripe Dashboard → Developers → Logs
```

---

## 📞 Support & Resources

### Documentation
- [Architecture Overview](../architecture/ARCHITECTURE.md)
- [API Reference](../api/API_REFERENCE.md)
- [Database Schema](../database/SCHEMA.md)

### External Resources
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)
- [Stripe Production Checklist](https://stripe.com/docs/development/checklist)

### Getting Help
- 📖 Check documentation first
- 🐛 Search existing issues
- 💬 Ask in discussions
- 📧 Contact support team

---

## 🎯 Deployment Checklist

### Pre-Launch (1 Week Before)

- [ ] Load testing completed
- [ ] Security audit passed
- [ ] All tests passing
- [ ] Staging environment validated
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team trained on procedures

### Launch Day

- [ ] Final staging check
- [ ] Database backed up
- [ ] Deploy to production
- [ ] Run smoke tests
- [ ] Monitor for 2 hours
- [ ] Announce launch
- [ ] Watch metrics closely

### Post-Launch (1 Week After)

- [ ] Daily health checks
- [ ] Monitor user feedback
- [ ] Fix hot issues
- [ ] Optimize based on real usage
- [ ] Update documentation
- [ ] Retrospective meeting

---

**Congratulations on deploying to production!** 🎉

For ongoing support, refer to the [Operations Guide](../operations/OPERATIONS.md).

---

**Last Updated**: January 14, 2025  
**Next Review**: Monthly or after major changes