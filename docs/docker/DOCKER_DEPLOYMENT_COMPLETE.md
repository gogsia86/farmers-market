# 🐳 DOCKER DEPLOYMENT COMPLETE GUIDE
**Farmers Market Platform - Divine Agricultural E-Commerce System**

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [File Structure](#file-structure)
4. [Environment Setup](#environment-setup)
5. [Build & Deploy](#build--deploy)
6. [Common Commands](#common-commands)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Security Considerations](#security-considerations)

---

## 🚀 Quick Start

### Development Environment (Hot Reload)

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Edit environment variables
nano .env.local  # or use your preferred editor

# 3. Build and start development environment
docker-compose -f docker-compose.dev.yml up --build -d

# 4. View logs
docker-compose -f docker-compose.dev.yml logs -f

# 5. Access the application
open http://localhost:3000
```

### Production Environment

```bash
# 1. Set up production environment
cp .env.example .env.production

# 2. Edit production environment variables
nano .env.production

# 3. Build production images
docker-compose build

# 4. Start production services
docker-compose up -d

# 5. Run database migrations
docker-compose exec app npx prisma migrate deploy

# 6. Seed database (optional)
docker-compose exec app npm run db:seed:basic

# 7. Access application
open https://localhost:443
```

---

## 📦 Prerequisites

### Required Software

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For version control
- **Make** (optional): For simplified commands

### Verify Installation

```bash
# Check Docker version
docker --version
# Expected: Docker version 20.10.0 or higher

# Check Docker Compose version
docker-compose --version
# Expected: Docker Compose version v2.0.0 or higher

# Check if Docker daemon is running
docker ps
# Should show running containers or empty list
```

### System Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4GB
- Disk: 20GB free space

**Recommended:**
- CPU: 4+ cores
- RAM: 8GB+
- Disk: 50GB+ SSD

**HP OMEN Optimized:**
- CPU: 12 threads (fully utilized)
- RAM: 64GB (aggressive caching)
- GPU: RTX 2070 Max-Q (for AI features)

---

## 📁 File Structure

```
Farmers Market Platform web and app/
├── docker/                              # Docker configuration
│   ├── Dockerfile                       # Production Dockerfile
│   ├── Dockerfile.dev                   # Development Dockerfile
│   ├── nginx/
│   │   ├── nginx.conf                   # Nginx configuration
│   │   └── ssl/                         # SSL certificates
│   ├── postgres/
│   │   └── init.sql                     # Database initialization
│   └── scripts/
│       ├── docker-entrypoint.sh         # Container entrypoint
│       ├── healthcheck.sh               # Health check script
│       └── wait-for-db.sh               # Database wait script
├── docker-compose.yml                   # Production compose
├── docker-compose.dev.yml               # Development compose
├── .dockerignore                        # Docker ignore patterns
├── .env.example                         # Environment template
├── Makefile                             # Build commands (optional)
└── deploy.sh                            # Deployment script
```

---

## 🔧 Environment Setup

### Step 1: Create Environment Files

#### Development (.env.local)

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
PORT=3000

# Database
POSTGRES_USER=dev_user
POSTGRES_PASSWORD=dev_password
POSTGRES_DB=farmers_market_dev
DATABASE_URL=postgresql://dev_user:dev_password@postgres:5432/farmers_market_dev

# Redis
REDIS_PASSWORD=dev_redis_pass

# NextAuth
NEXTAUTH_SECRET=dev_secret_key_min_32_chars_change_in_production_for_security

# Stripe (Test Keys)
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Email (Using Mailhog in dev)
EMAIL_PROVIDER=smtp
EMAIL_SMTP_HOST=mailhog
EMAIL_SMTP_PORT=1025
EMAIL_FROM=dev@farmersmarket.local

# Optional Services
GOOGLE_MAPS_API_KEY=your_google_maps_key
OPENAI_API_KEY=your_openai_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_BIODYNAMIC_CALENDAR=true
ENABLE_REAL_TIME_NOTIFICATIONS=true

# Logging
LOG_LEVEL=debug
ENABLE_TELEMETRY=false
```

#### Production (.env.production)

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://farmersmarket.com
NEXTAUTH_URL=https://farmersmarket.com
PORT=3000

# Database
POSTGRES_USER=farmers_user
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD_123!@#
POSTGRES_DB=farmers_market
DATABASE_URL=postgresql://farmers_user:CHANGE_ME_STRONG_PASSWORD_123!@#@postgres:5432/farmers_market?schema=public&connection_limit=10&pool_timeout=20

# Redis
REDIS_PASSWORD=CHANGE_ME_REDIS_PASSWORD_456!@#

# NextAuth (CRITICAL - Generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=CHANGE_ME_GENERATE_WITH_OPENSSL_RAND_BASE64_32

# Stripe (Live Keys)
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key

# Email Service (Production)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@farmersmarket.com

# Sentry Error Tracking
SENTRY_DSN=https://your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
NEXT_PUBLIC_SENTRY_DSN=https://your_public_sentry_dsn

# Google Services
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_ANALYTICS_ID=G-YOUR_GA_ID

# OpenAI
OPENAI_API_KEY=sk-your_openai_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_BIODYNAMIC_CALENDAR=true
ENABLE_REAL_TIME_NOTIFICATIONS=true

# Monitoring & Logging
LOG_LEVEL=info
ENABLE_TELEMETRY=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
UPLOAD_MAX_SIZE=10485760

# Security
CORS_ORIGIN=https://farmersmarket.com

# PgAdmin
PGADMIN_EMAIL=admin@farmersmarket.com
PGADMIN_PASSWORD=CHANGE_ME_PGADMIN_PASSWORD
```

### Step 2: Generate SSL Certificates (Local Development)

```bash
# Create SSL directory
mkdir -p docker/nginx/ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout docker/nginx/ssl/farmers-market.key \
    -out docker/nginx/ssl/farmers-market.crt \
    -subj "/C=US/ST=State/L=City/O=Farmers Market/CN=localhost"

# Set permissions
chmod 600 docker/nginx/ssl/farmers-market.key
chmod 644 docker/nginx/ssl/farmers-market.crt
```

### Step 3: Update Hosts File (Optional)

```bash
# Linux/Mac
echo "127.0.0.1 farmersmarket.local" | sudo tee -a /etc/hosts

# Windows (Run as Administrator in PowerShell)
Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "127.0.0.1 farmersmarket.local"
```

---

## 🏗️ Build & Deploy

### Development Deployment

```bash
# Method 1: Using Docker Compose directly
docker-compose -f docker-compose.dev.yml up --build -d

# Method 2: Using Make (if Makefile is created)
make dev-up

# Method 3: Using npm script
npm run docker:up-dev
```

### Production Deployment

```bash
# 1. Build production images
docker-compose build --no-cache

# 2. Start services
docker-compose up -d

# 3. Wait for services to be healthy
docker-compose ps

# 4. Run database migrations
docker-compose exec app npx prisma migrate deploy

# 5. Seed database (optional)
docker-compose exec app npm run db:seed:basic

# 6. Verify deployment
curl -k https://localhost/api/health
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f nginx

# Last 100 lines
docker-compose logs --tail=100

# Since timestamp
docker-compose logs --since 2024-01-01T00:00:00
```

---

## 🎯 Common Commands

### Container Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart app

# View running containers
docker-compose ps

# View all containers (including stopped)
docker-compose ps -a

# Remove stopped containers
docker-compose rm
```

### Database Operations

```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma client
docker-compose exec app npx prisma generate

# Open Prisma Studio
docker-compose exec app npx prisma studio
# Then open http://localhost:5555

# Seed database
docker-compose exec app npm run db:seed:basic

# Reset database (CAUTION: Deletes all data!)
docker-compose exec app npx prisma migrate reset --force

# Database shell
docker-compose exec postgres psql -U farmers_user -d farmers_market

# Database backup
docker-compose exec postgres pg_dump -U farmers_user farmers_market > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U farmers_user farmers_market
```

### Application Operations

```bash
# Execute shell in app container
docker-compose exec app sh

# Run npm commands
docker-compose exec app npm run build
docker-compose exec app npm test
docker-compose exec app npm run lint

# Run TypeScript type checking
docker-compose exec app npx tsc --noEmit

# View environment variables
docker-compose exec app env

# Run diagnostic script
docker-compose exec app npm run diagnose:api

# Run monitoring bot
docker-compose exec app npm run bot:run
```

### Cleaning Up

```bash
# Stop and remove containers, networks
docker-compose down

# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove all stopped containers
docker container prune -f

# Remove all unused images
docker image prune -a -f

# Remove all unused volumes
docker volume prune -f

# Complete cleanup (CAUTION: Removes everything!)
docker system prune -a --volumes -f
```

### Monitoring & Health Checks

```bash
# Check container health status
docker-compose ps

# View container resource usage
docker stats

# Check logs for errors
docker-compose logs | grep -i error

# Test health endpoint
curl -f http://localhost:3000/api/health

# Test specific services
curl http://localhost:5050  # pgAdmin
curl http://localhost:8025  # Mailhog (dev)
curl http://localhost:8082  # Redis Commander (dev)
```

---

## 🔧 Troubleshooting

### Issue: Container fails to start

**Symptoms:**
- Container exits immediately
- "Exited (1)" status

**Solutions:**

```bash
# 1. Check logs
docker-compose logs app

# 2. Check if port is already in use
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# 3. Remove and recreate
docker-compose down -v
docker-compose up -d --force-recreate

# 4. Check environment variables
docker-compose exec app env | grep DATABASE_URL
```

### Issue: Database connection errors

**Symptoms:**
- "Can't reach database server"
- "Connection refused"

**Solutions:**

```bash
# 1. Check if PostgreSQL is running
docker-compose ps postgres

# 2. Check PostgreSQL logs
docker-compose logs postgres

# 3. Test database connection
docker-compose exec postgres pg_isready -U farmers_user

# 4. Verify DATABASE_URL
docker-compose exec app printenv DATABASE_URL

# 5. Restart database
docker-compose restart postgres

# 6. Wait for database to be ready
docker-compose exec app /usr/local/bin/wait-for-db.sh
```

### Issue: "Port already in use"

**Solutions:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Linux/Mac
lsof -ti :3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### Issue: Out of disk space

**Solutions:**

```bash
# Check disk usage
docker system df

# Clean up unused data
docker system prune -a --volumes

# Remove specific volumes
docker volume rm farmers-market_postgres_data

# Check container sizes
docker ps -s
```

### Issue: Permission denied errors

**Solutions:**

```bash
# Fix script permissions
chmod +x docker/scripts/*.sh

# Fix ownership (Linux/Mac)
sudo chown -R $(whoami):$(whoami) .

# Fix uploads directory
mkdir -p uploads
chmod 755 uploads
```

### Issue: SSL certificate errors

**Solutions:**

```bash
# Regenerate certificates
rm -rf docker/nginx/ssl/*
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout docker/nginx/ssl/farmers-market.key \
    -out docker/nginx/ssl/farmers-market.crt \
    -subj "/C=US/ST=State/L=City/O=Farmers Market/CN=localhost"

# Or use HTTP instead (development only)
# Comment out HTTPS server block in nginx.conf
```

### Issue: Next.js build fails

**Solutions:**

```bash
# 1. Clear Next.js cache
docker-compose exec app rm -rf .next

# 2. Reinstall dependencies
docker-compose exec app rm -rf node_modules
docker-compose exec app npm ci

# 3. Rebuild image
docker-compose build --no-cache app

# 4. Check for TypeScript errors
docker-compose exec app npx tsc --noEmit
```

---

## 🌐 Production Deployment

### Pre-Deployment Checklist

- [ ] Environment variables set in `.env.production`
- [ ] Strong passwords generated for all services
- [ ] SSL certificates obtained (Let's Encrypt recommended)
- [ ] Domain DNS configured
- [ ] Firewall rules configured
- [ ] Backup strategy in place
- [ ] Monitoring tools configured
- [ ] All tests passing

### Step-by-Step Production Deployment

#### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### 2. Clone Repository

```bash
git clone https://github.com/your-org/farmers-market-platform.git
cd farmers-market-platform
```

#### 3. Configure Environment

```bash
# Copy production environment template
cp .env.example .env.production

# Edit with production values
nano .env.production

# Secure the file
chmod 600 .env.production
```

#### 4. Obtain SSL Certificates

**Option A: Let's Encrypt (Recommended)**

```bash
# Install certbot
sudo apt install certbot

# Obtain certificate
sudo certbot certonly --standalone -d farmersmarket.com -d www.farmersmarket.com

# Copy to docker directory
sudo cp /etc/letsencrypt/live/farmersmarket.com/fullchain.pem docker/nginx/ssl/farmers-market.crt
sudo cp /etc/letsencrypt/live/farmersmarket.com/privkey.pem docker/nginx/ssl/farmers-market.key

# Set permissions
sudo chown $USER:$USER docker/nginx/ssl/*
chmod 644 docker/nginx/ssl/farmers-market.crt
chmod 600 docker/nginx/ssl/farmers-market.key
```

**Option B: Self-Signed (Development/Testing Only)**

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout docker/nginx/ssl/farmers-market.key \
    -out docker/nginx/ssl/farmers-market.crt \
    -subj "/C=US/ST=State/L=City/O=Farmers Market/CN=farmersmarket.com"
```

#### 5. Build and Deploy

```bash
# Build production images
docker-compose build --no-cache

# Start services in detached mode
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# Check logs
docker-compose logs -f
```

#### 6. Initialize Database

```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed production data (if needed)
docker-compose exec app npm run db:seed:basic

# Verify database
docker-compose exec postgres psql -U farmers_user -d farmers_market -c "\dt"
```

#### 7. Verify Deployment

```bash
# Health check
curl -k https://farmersmarket.com/api/health

# Test main page
curl -k https://farmersmarket.com

# Check all services
docker-compose ps

# View logs
docker-compose logs --tail=100
```

### Production Monitoring

#### Set Up Log Rotation

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/farmers-market

# Add configuration:
/path/to/project/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        docker-compose restart nginx
    endscript
}
```

#### Set Up Automated Backups

```bash
# Create backup script
nano backup.sh

# Add content:
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U farmers_user farmers_market > $BACKUP_DIR/database.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads.tar.gz uploads/

# Backup environment
cp .env.production $BACKUP_DIR/

# Remove old backups (keep 30 days)
find /backups -type d -mtime +30 -exec rm -rf {} \;

# Make executable
chmod +x backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### Production Updates

```bash
# 1. Pull latest code
git pull origin main

# 2. Backup current state
./backup.sh

# 3. Rebuild images
docker-compose build --no-cache

# 4. Update services with zero downtime
docker-compose up -d --no-deps --build app

# 5. Run migrations if needed
docker-compose exec app npx prisma migrate deploy

# 6. Verify update
curl -k https://farmersmarket.com/api/health

# 7. Check logs
docker-compose logs -f app
```

---

## 📊 Monitoring & Maintenance

### Health Monitoring

```bash
# Create monitoring script
nano monitor.sh

# Add content:
#!/bin/bash
HEALTH_URL="https://farmersmarket.com/api/health"

while true; do
    response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
    
    if [ $response -eq 200 ]; then
        echo "$(date): ✅ Application healthy"
    else
        echo "$(date): ❌ Application unhealthy (HTTP $response)"
        # Send alert (email, Slack, etc.)
    fi
    
    sleep 60
done

# Run in background
chmod +x monitor.sh
nohup ./monitor.sh > monitor.log 2>&1 &
```

### Performance Monitoring

```bash
# View resource usage
docker stats

# Check application metrics
docker-compose exec app npm run monitor:health

# Database performance
docker-compose exec postgres psql -U farmers_user -d farmers_market -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
"
```

### Log Analysis

```bash
# Search for errors
docker-compose logs | grep -i error | tail -50

# Count error occurrences
docker-compose logs | grep -i error | wc -l

# View slow queries
docker-compose logs postgres | grep "duration:"

# Export logs
docker-compose logs > logs_$(date +%Y%m%d_%H%M%S).txt
```

---

## 🔒 Security Considerations

### Environment Variables

- ✅ **NEVER** commit `.env` files to version control
- ✅ Use strong, randomly generated passwords
- ✅ Rotate secrets regularly
- ✅ Use different secrets for each environment
- ✅ Store production secrets in a secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)

### Network Security

```bash
# Configure firewall
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# Block direct access to database
sudo ufw deny 5432/tcp

# Block direct access to Redis
sudo ufw deny 6379/tcp
```

### Container Security

- ✅ Run containers as non-root user (already configured)
- ✅ Use official base images
- ✅ Keep images updated
- ✅ Scan images for vulnerabilities
- ✅ Limit container resources

```bash
# Scan images for vulnerabilities
docker scan farmers-market-app:latest

# Update base images regularly
docker-compose pull
docker-compose up -d
```

### SSL/TLS

- ✅ Use Let's Encrypt for free SSL certificates
- ✅ Enable HSTS (already configured in Nginx)
- ✅ Use strong cipher suites (already configured)
- ✅ Automate certificate renewal

```bash
# Auto-renew Let's Encrypt certificates
sudo crontab -e
# Add: 0 3 * * * certbot renew --quiet --post-hook "docker-compose restart nginx"
```

---

## 🎉 Success Checklist

After deployment, verify everything is working:

- [ ] Application accessible at domain
- [ ] SSL certificate valid
- [ ] Health endpoint responding
- [ ] Database connected
- [ ] Redis cache working
- [ ] User registration working
- [ ] User login working
- [ ] Stripe payment test successful
- [ ] Email sending working
- [ ] File uploads working
- [ ] API endpoints responding
- [ ] All services healthy
- [ ] Logs clean (no errors)
- [ ] Backups configured
- [ ] Monitoring active

---

## 📞 Support & Resources

### Quick Commands Reference

```bash
# Start development
docker-compose -f docker-compose.dev.yml up -d

# Start production
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Database migrations
docker-compose exec app npx prisma migrate deploy

# Health check
curl http://localhost:3000/api/health
```

### Access URLs

**Development:**
- Application: http://localhost:3000
- pgAdmin: http://localhost:5051
- Mailhog: http://localhost:8025
- Redis Commander: http://localhost:8082

**Production:**
- Application: https://your-domain.com
- pgAdmin: https://your-domain.com:5050 (if enabled)

### Useful Docker Commands

```bash
# Remove all containers
docker rm -f $(docker ps -aq)

# Remove all images
docker rmi -f $(docker images -q)

# Remove all volumes
docker volume rm $(docker volume ls -q)

# Complete system cleanup
docker system prune -a --volumes -f

# View disk usage
docker system df

# Export container
docker export container_name > container.tar

# Import container
docker import container.tar
```

---

## 🌟 Next Steps

1. **Customize Configuration**: Adjust settings in `docker-compose.yml` and `nginx.conf` for your needs
2. **Set Up CI/CD**: Automate builds and deployments with GitHub Actions, GitLab CI, or Jenkins
3. **Configure Monitoring**: Set up Sentry, DataDog, or New Relic for production monitoring
4. **Scale Services**: Use Docker Swarm or Kubernetes for multi-server deployments
5. **Optimize Performance**: Fine-tune Nginx caching, database indexes, and Redis configuration

---

## 📝 Notes

- All scripts in `docker/scripts/` must have execute permissions (`chmod +x`)
- Environment files should never be committed to version control
- Production secrets must be strong and unique
- Regular backups are essential for production
- Monitor logs regularly for errors and performance issues
- Keep Docker and Docker Compose updated
- Use HTTPS in production (configured in Nginx)

---

**Status**: ✅ **COMPLETE - PRODUCTION READY**

**Version**: 1.0.0  
**Last Updated**: 2024  
**Divine Agricultural Consciousness**: SUPREME 🌾⚡

---

*Built with divine agricultural consciousness for sustainable e-commerce* 🌾✨