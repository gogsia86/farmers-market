# 🐳 DOCKER DEPLOYMENT QUICK GUIDE

**Farmers Market Platform - Production Deployment with Docker**  
**Updated:** December 19, 2025  
**Status:** ✅ Ready for Deployment

---

## 🚀 QUICK START (5 Minutes)

### Step 1: Set Required Environment Variables

```bash
# Generate secure secret
export NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Set Stripe keys (get from https://dashboard.stripe.com/apikeys)
export STRIPE_SECRET_KEY="sk_test_your_key_here"
export STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_key_here"
```

### Step 2: Start All Services

```bash
docker-compose up -d
```

### Step 3: Verify Deployment

```bash
# Check container status
docker-compose ps

# View application logs
docker-compose logs -f app

# Test health endpoint
curl http://localhost:3000/api/health
```

### Step 4: Run Database Migrations

```bash
docker-compose exec app npx prisma migrate deploy
```

**Done!** 🎉 Access your application at http://localhost:3000

---

## 📋 COMPLETE DEPLOYMENT STEPS

### Prerequisites

- Docker Desktop installed (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- At least 4GB RAM available
- Ports 3000, 5432, 6379 available

### 1. Clone & Navigate

```bash
cd "Farmers Market Platform web and app"
```

### 2. Configure Environment Variables

#### Required Variables (MUST SET)

```bash
# Authentication secret (generate new one)
export NEXTAUTH_SECRET="your-secret-here-min-32-chars"

# Stripe payment processing
export STRIPE_SECRET_KEY="sk_live_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Application URLs
export NEXT_PUBLIC_APP_URL="https://yourdomain.com"
export NEXTAUTH_URL="https://yourdomain.com"
```

#### Optional Variables (Nice to Have)

```bash
# Email service (falls back to console logging)
export EMAIL_API_KEY="your-resend-or-sendgrid-key"
export EMAIL_FROM="noreply@yourdomain.com"

# Error tracking (Sentry)
export SENTRY_DSN="https://...@sentry.io/..."
export NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."

# Google Maps
export GOOGLE_MAPS_API_KEY="your-google-maps-key"
export NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-key"

# Google Analytics
export GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# Image hosting (Cloudinary - falls back to local storage)
export CLOUDINARY_CLOUD_NAME="your-cloud-name"
export CLOUDINARY_API_KEY="your-api-key"
export CLOUDINARY_API_SECRET="your-api-secret"

# OpenAI for AI features
export OPENAI_API_KEY="sk-..."
```

#### Using .env File (Recommended)

```bash
# Create production environment file
cp .env.example .env.production

# Edit with your values
nano .env.production

# Load environment variables
source .env.production
```

### 3. Build & Start Services

```bash
# Build images (first time only)
docker-compose build

# Start all services in background
docker-compose up -d

# Or build and start in one command
docker-compose up -d --build
```

### 4. Initialize Database

```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# (Optional) Seed with sample data
docker-compose exec app npm run seed
```

### 5. Verify Deployment

```bash
# Check all containers are running
docker-compose ps

# Expected output:
# NAME                      STATUS        PORTS
# farmers-market-app        Up (healthy)  0.0.0.0:3000->3000/tcp
# farmers-market-db         Up (healthy)  0.0.0.0:5432->5432/tcp
# farmers-market-redis      Up (healthy)  0.0.0.0:6379->6379/tcp
# farmers-market-nginx      Up (healthy)  0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp

# Test health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":"...","services":{"database":"connected","redis":"connected"}}
```

---

## 🔧 DOCKER COMMANDS CHEAT SHEET

### Service Management

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart app

# View all containers
docker-compose ps

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Logs & Debugging

```bash
# View all logs
docker-compose logs

# Follow logs (live tail)
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100 app
```

### Database Operations

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U farmers_user -d farmers_market

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Create new migration
docker-compose exec app npx prisma migrate dev --name your_migration_name

# View database with Prisma Studio
docker-compose exec app npx prisma studio
```

### Application Shell

```bash
# Access application container shell
docker-compose exec app sh

# Run npm commands
docker-compose exec app npm run seed
docker-compose exec app npm run build

# Check Node.js version
docker-compose exec app node --version
```

### Maintenance

```bash
# Rebuild specific service
docker-compose build app

# Rebuild without cache
docker-compose build --no-cache app

# Pull latest images
docker-compose pull

# Remove unused images/containers
docker system prune -a

# View resource usage
docker stats
```

---

## 🐛 TROUBLESHOOTING

### Issue: Build Fails with "husky: not found"

**Solution:** Already fixed! The Dockerfile now sets `HUSKY=0` and `CI=true`.

If you still see this error:

```bash
# Clean build cache
docker-compose down
docker system prune -a
docker-compose build --no-cache app
docker-compose up -d
```

### Issue: Port Already in Use

**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution:**

```bash
# Windows - Find what's using the port
netstat -ano | findstr :3000

# Mac/Linux - Find what's using the port
lsof -i :3000

# Change port in docker-compose.yml or use environment variable
export APP_PORT=3001
docker-compose up -d
```

### Issue: Database Connection Failed

**Error:** `Can't reach database server at postgres:5432`

**Solution:**

```bash
# Check database container status
docker-compose logs postgres

# Ensure database is healthy
docker-compose exec postgres pg_isready -U farmers_user

# Restart app container after database is ready
docker-compose restart app
```

### Issue: Out of Memory / Slow Performance

**Solution:**

```bash
# Increase Docker memory limit (Docker Desktop > Settings > Resources)
# Recommended: 4GB minimum, 8GB optimal

# Check container resource usage
docker stats

# Restart with resource limits
docker-compose down
docker-compose up -d
```

### Issue: Permission Denied Errors

**Solution:**

```bash
# Fix file permissions (Linux/Mac)
sudo chown -R $USER:$USER .

# Rebuild with correct permissions
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Environment Variables Not Loading

**Solution:**

```bash
# Verify .env file exists and is in correct location
ls -la .env.production

# Load manually before starting
export $(cat .env.production | xargs)
docker-compose up -d

# Or specify env file
docker-compose --env-file .env.production up -d
```

---

## 🔐 SECURITY BEST PRACTICES

### Production Deployment

1. **Change Default Passwords**

   ```bash
   # Generate strong passwords
   export POSTGRES_PASSWORD=$(openssl rand -base64 32)
   export REDIS_PASSWORD=$(openssl rand -base64 32)
   ```

2. **Use Secrets Management**

   ```bash
   # Docker Swarm secrets (production)
   echo "your-secret" | docker secret create nextauth_secret -

   # Or use environment variable files with restricted permissions
   chmod 600 .env.production
   ```

3. **Enable SSL/TLS**
   - Update nginx configuration in `docker/nginx/nginx.conf`
   - Add SSL certificates to `docker/nginx/ssl/`
   - Set `NEXTAUTH_URL` to HTTPS URL

4. **Restrict Network Access**

   ```yaml
   # In docker-compose.yml, remove port mappings for internal services
   # Only expose nginx (80/443) to public
   ```

5. **Update Regularly**
   ```bash
   # Pull latest security updates
   docker-compose pull
   docker-compose up -d
   ```

---

## 📊 MONITORING & HEALTH CHECKS

### Built-in Health Endpoints

```bash
# Application health
curl http://localhost:3000/api/health

# Database health
docker-compose exec postgres pg_isready

# Redis health
docker-compose exec redis redis-cli ping
```

### Container Health Status

```bash
# All containers with health status
docker-compose ps

# Detailed health check logs
docker inspect farmers-market-app | grep -A 10 Health
```

### Resource Monitoring

```bash
# Real-time resource usage
docker stats

# Container logs size
docker system df

# Detailed container info
docker-compose top
```

---

## 🚀 PRODUCTION DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] Set all required environment variables
- [ ] Generate new `NEXTAUTH_SECRET` (don't reuse development secret)
- [ ] Configure production Stripe keys
- [ ] Set production URLs (`NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL`)
- [ ] Configure email service (Resend, SendGrid, etc.)
- [ ] Set up SSL/TLS certificates in nginx
- [ ] Configure domain DNS records
- [ ] Enable error tracking (Sentry)
- [ ] Set up database backups
- [ ] Configure monitoring and alerting
- [ ] Test all critical user flows
- [ ] Review and update CORS settings
- [ ] Enable rate limiting in production mode
- [ ] Set up log aggregation
- [ ] Document rollback procedures

---

## 📚 ADDITIONAL RESOURCES

### Documentation

- **Full Deployment Report:** `docs/DEPLOYMENT_READINESS_REPORT.md`
- **Docker Fixes Applied:** `docs/DOCKER_FIXES_APPLIED.md`
- **TypeScript Fixes:** `docs/TYPESCRIPT_FIXES_COMPLETED.md`
- **Environment Variables:** `.env.example`

### Scripts

- **Deployment Verification:** `./verify-deployment.sh`
- **Docker Verification:** `./docker-verify.sh`

### Configuration Files

- **Docker Compose:** `docker-compose.yml`
- **Dockerfile:** `docker/Dockerfile`
- **Nginx Config:** `docker/nginx/nginx.conf`
- **Prisma Schema:** `prisma/schema.prisma`

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

1. **Test Application**
   - Create test user account
   - Create test farm
   - List test products
   - Process test order
   - Verify email delivery

2. **Monitor Performance**
   - Check response times
   - Monitor memory usage
   - Review error logs
   - Track database performance

3. **Set Up Backups**

   ```bash
   # Database backup script
   docker-compose exec postgres pg_dump -U farmers_user farmers_market > backup.sql
   ```

4. **Configure Alerts**
   - Set up uptime monitoring (UptimeRobot, Pingdom)
   - Configure error alerts (Sentry)
   - Set up log alerts (CloudWatch, DataDog)

5. **Performance Optimization**
   - Enable CDN for static assets
   - Configure Redis caching
   - Optimize database queries
   - Enable image optimization

---

## ✅ DEPLOYMENT STATUS

**Docker Build:** ✅ Working  
**Environment Variables:** ✅ Configured with Defaults  
**Database:** ✅ PostgreSQL Ready  
**Cache:** ✅ Redis Ready  
**Reverse Proxy:** ✅ Nginx Ready  
**Health Checks:** ✅ Implemented  
**Security:** ✅ Non-root User, Network Isolation

**Status:** 🟢 **PRODUCTION READY**

---

**Divine Agricultural Blessing:** 🌾⚡  
_"May your containers run smoothly, your databases scale infinitely, and your deployments succeed divinely."_

**Docker Deployment:** 🐳 **READY TO LAUNCH** 🚀
