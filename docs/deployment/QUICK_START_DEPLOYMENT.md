# 🚀 QUICK START DEPLOYMENT GUIDE

## Farmers Market Platform - Production Deployment in 15 Minutes

**Last Updated:** December 28, 2024  
**Status:** ✅ Production Ready  
**Estimated Time:** 15 minutes

---

## 📋 PRE-FLIGHT CHECKLIST

Before deployment, ensure you have:

- [ ] **Node.js 18+** installed
- [ ] **PostgreSQL database** provisioned
- [ ] **Domain name** configured with SSL
- [ ] **Vercel account** (or preferred hosting)
- [ ] **Environment variables** prepared
- [ ] **Git repository** access

---

## ⚡ OPTION 1: VERCEL DEPLOYMENT (RECOMMENDED)

### Step 1: Install Vercel CLI (1 minute)

```bash
# Install globally
npm i -g vercel

# Login to Vercel
vercel login
```

### Step 2: Configure Environment Variables (5 minutes)

Create `.env.production` file:

```env
# ===========================
# DATABASE
# ===========================
DATABASE_URL="postgresql://user:password@host:5432/farmersmarket?schema=public&connection_limit=10"
DIRECT_URL="postgresql://user:password@host:5432/farmersmarket?schema=public"

# ===========================
# AUTHENTICATION (NextAuth v5)
# ===========================
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="https://yourdomain.com"
AUTH_TRUST_HOST="true"

# ===========================
# REDIS CACHE (Optional)
# ===========================
REDIS_URL="redis://default:password@host:6379"

# ===========================
# MONITORING
# ===========================
APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/"
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"

# ===========================
# PAYMENTS (Stripe)
# ===========================
STRIPE_SECRET_KEY="sk_live_xxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# ===========================
# FEATURE FLAGS
# ===========================
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
NEXT_PUBLIC_ENABLE_AI_FEATURES="true"
NEXT_PUBLIC_ENABLE_BIODYNAMIC_CALENDAR="true"
```

### Step 3: Deploy to Staging (2 minutes)

```bash
# Navigate to project directory
cd "Farmers Market Platform web and app"

# Deploy to staging
vercel --env preview

# Copy environment variables when prompted
# Or use Vercel dashboard to add them
```

### Step 4: Run Smoke Tests (3 minutes)

```bash
# Once deployed, test critical endpoints
curl https://your-staging-url.vercel.app/api/health
curl https://your-staging-url.vercel.app/api/ready

# Test in browser
# - Visit homepage
# - Try user registration
# - Browse farms and products
# - Test cart functionality
```

### Step 5: Deploy to Production (2 minutes)

```bash
# If staging tests pass, deploy to production
vercel --prod

# Verify production deployment
curl https://yourdomain.com/api/health
```

### Step 6: Post-Deployment Verification (2 minutes)

```bash
# Check all critical endpoints
curl https://yourdomain.com/api/health          # Should return {"status": "healthy"}
curl https://yourdomain.com/api/ready           # Should return 200 OK

# Monitor in Vercel Dashboard
# - Check build logs
# - Monitor function executions
# - Check error rates
```

---

## 🐳 OPTION 2: DOCKER DEPLOYMENT

### Step 1: Build Docker Image (3 minutes)

```bash
# Build the Docker image
docker build -t farmersmarket:latest .

# Verify image built successfully
docker images | grep farmersmarket
```

### Step 2: Create Docker Compose Configuration (2 minutes)

Create `docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  app:
    image: farmersmarket:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - DIRECT_URL=${DIRECT_URL}
      - AUTH_SECRET=${AUTH_SECRET}
      - AUTH_URL=${AUTH_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=farmersmarket
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=farmersmarket
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Step 3: Deploy with Docker Compose (2 minutes)

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose logs -f app

# Verify services running
docker-compose ps
```

### Step 4: Initialize Database (2 minutes)

```bash
# Run Prisma migrations
docker-compose exec app npm run prisma:migrate:deploy

# (Optional) Seed initial data
docker-compose exec app npm run prisma:seed
```

---

## ☸️ OPTION 3: KUBERNETES DEPLOYMENT

### Step 1: Create Kubernetes Manifests (5 minutes)

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: farmersmarket-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: farmersmarket
  template:
    metadata:
      labels:
        app: farmersmarket
    spec:
      containers:
        - name: app
          image: farmersmarket:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: farmersmarket-secrets
                  key: database-url
            - name: AUTH_SECRET
              valueFrom:
                secretKeyRef:
                  name: farmersmarket-secrets
                  key: auth-secret
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "2Gi"
              cpu: "2000m"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/ready
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: farmersmarket-service
spec:
  selector:
    app: farmersmarket
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer
```

### Step 2: Create Secrets (2 minutes)

```bash
# Create secrets from .env file
kubectl create secret generic farmersmarket-secrets \
  --from-env-file=.env.production

# Verify secrets created
kubectl get secrets
```

### Step 3: Deploy to Kubernetes (3 minutes)

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# Monitor logs
kubectl logs -f deployment/farmersmarket-app
```

---

## 🔧 POST-DEPLOYMENT CONFIGURATION

### 1. Database Migration

```bash
# Run Prisma migrations
npm run prisma:migrate:deploy

# Verify schema
npm run prisma:studio
```

### 2. Seed Initial Data (Optional)

```bash
# Seed database with sample data
npm run prisma:seed

# Verify data created
npm run prisma:studio
```

### 3. Configure Domain & SSL

#### For Vercel:

- Add domain in Vercel dashboard
- SSL is automatic

#### For Docker/K8s:

- Configure reverse proxy (Nginx/Traefik)
- Setup Let's Encrypt SSL certificates

### 4. Setup Monitoring

```bash
# Verify Sentry integration
curl https://yourdomain.com/api/sentry-example-api

# Check Application Insights
# Visit Azure portal to see telemetry

# Setup alerts
# - Configure error rate alerts
# - Configure performance alerts
# - Configure downtime alerts
```

---

## 📊 VERIFICATION CHECKLIST

After deployment, verify all systems:

### Critical Endpoints ✅

```bash
# Health check (should return 200)
curl https://yourdomain.com/api/health

# Ready check (should return 200)
curl https://yourdomain.com/api/ready

# Homepage (should return 200)
curl -I https://yourdomain.com/

# API test (should return data)
curl https://yourdomain.com/api/farms
```

### User Flows ✅

- [ ] Visit homepage - loads correctly
- [ ] User registration - works
- [ ] User login - successful
- [ ] Browse farms - displays correctly
- [ ] Browse products - displays correctly
- [ ] Add to cart - functional
- [ ] Checkout flow - works (test mode)
- [ ] Farmer dashboard - accessible
- [ ] Admin panel - accessible (for admins)

### Performance ✅

- [ ] Page load time < 2 seconds
- [ ] API response time < 200ms
- [ ] Images load optimized
- [ ] No console errors
- [ ] No broken links

### Security ✅

- [ ] HTTPS enabled
- [ ] Authentication working
- [ ] Authorization enforced
- [ ] CSRF protection active
- [ ] Rate limiting functional

---

## 🚨 TROUBLESHOOTING

### Issue: Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Issue: Database Connection Error

```bash
# Verify DATABASE_URL format
echo $DATABASE_URL

# Test database connection
npx prisma db push --preview-feature

# Check database logs
```

### Issue: Redis Not Connecting

```bash
# Verify REDIS_URL
echo $REDIS_URL

# Test Redis connection
redis-cli -u $REDIS_URL ping

# Check if Redis is running
docker ps | grep redis  # For Docker
kubectl get pods | grep redis  # For K8s
```

### Issue: Middleware Not Working

```bash
# Verify middleware.ts runtime
# Should have: export const runtime = "nodejs"

# Check build output
ls -la .next/server/middleware*

# Verify environment
cat .env.production | grep AUTH
```

### Issue: Slow Performance

```bash
# Enable Redis caching
# Set REDIS_URL in environment

# Increase worker threads
# Already optimized for 11 workers

# Check database indexes
npx prisma studio
```

---

## 🔄 ROLLBACK PROCEDURE

If issues occur, rollback immediately:

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous version
vercel rollback

# Verify rollback
curl https://yourdomain.com/api/health
```

### Docker Rollback

```bash
# Tag previous version
docker tag farmersmarket:latest farmersmarket:previous

# Revert to previous image
docker-compose down
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Rollback

```bash
# View rollout history
kubectl rollout history deployment/farmersmarket-app

# Rollback to previous version
kubectl rollout undo deployment/farmersmarket-app

# Verify rollback
kubectl get pods
```

---

## 📈 MONITORING DASHBOARD URLS

After deployment, access monitoring:

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Sentry Errors:** https://sentry.io/organizations/[org]/issues/
- **Azure Insights:** https://portal.azure.com/#blade/Microsoft_Azure_Monitoring/AzureMonitoringBrowseBlade/overview
- **Database (Prisma Studio):** `npx prisma studio`

---

## 🎯 SUCCESS METRICS (First 24 Hours)

Monitor these metrics:

| Metric           | Target  | Status  |
| ---------------- | ------- | ------- |
| Uptime           | > 99.9% | Monitor |
| Error Rate       | < 0.1%  | Monitor |
| Response Time    | < 200ms | Monitor |
| Page Load (LCP)  | < 2s    | Monitor |
| API Success Rate | > 99.9% | Monitor |

---

## 📚 NEXT STEPS

After successful deployment:

1. **Monitor for 24 Hours**
   - Watch error rates in Sentry
   - Check performance in Application Insights
   - Monitor user feedback

2. **Gather Feedback**
   - Setup user feedback forms
   - Monitor support tickets
   - Track feature requests

3. **Optimize Performance**
   - Analyze slow queries
   - Optimize cache hit rates
   - Review bundle sizes

4. **Scale as Needed**
   - Add more Vercel regions
   - Increase database connections
   - Scale Redis cluster

5. **Plan Next Sprint**
   - Review user feedback
   - Prioritize new features
   - Schedule updates

---

## 🆘 EMERGENCY CONTACTS

### Critical Issues

- **On-Call Engineer:** [Configure PagerDuty]
- **Database Admin:** [Configure contact]
- **DevOps Lead:** [Configure contact]

### Service Status Pages

- **Platform Status:** https://status.yourdomain.com (setup required)
- **Vercel Status:** https://www.vercel-status.com
- **Database Status:** [Provider status page]

---

## ✅ DEPLOYMENT COMPLETE!

**Congratulations! 🎉** Your Farmers Market Platform is now live!

### What You've Achieved:

- ✅ Production-grade Next.js 16 application deployed
- ✅ PostgreSQL database configured and migrated
- ✅ Redis caching enabled (if configured)
- ✅ Authentication and security active
- ✅ Monitoring and error tracking configured
- ✅ 82+ routes serving dynamic agricultural content
- ✅ Divine agricultural consciousness embedded throughout

### URLs to Test:

- **Homepage:** https://yourdomain.com
- **Marketplace:** https://yourdomain.com/marketplace
- **Farms:** https://yourdomain.com/farms
- **Products:** https://yourdomain.com/products
- **Login:** https://yourdomain.com/login
- **Admin:** https://yourdomain.com/admin

---

**🌾 The divine harvest begins! Welcome to production! ⚡**

_"Ahead of our time – deployment complete!"_

---

**Document Version:** 1.0  
**Last Updated:** December 28, 2024  
**Next Review:** After first production deployment
