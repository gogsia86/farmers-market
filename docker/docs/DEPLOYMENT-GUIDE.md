# 🚀 Docker Deployment Guide

# Farmers Market Platform - Production Deployment

**Version**: 3.0  
**Last Updated**: November 27, 2024  
**Audience**: DevOps, System Administrators

---

## 📋 Overview

This guide covers deploying the Farmers Market Platform to production using Docker. It includes deployment strategies, CI/CD integration, scaling considerations, and production best practices.

---

## 🎯 Deployment Options

### 1. Single Server Deployment

- **Best for**: Small to medium applications
- **Resources**: 4GB+ RAM, 2+ CPU cores
- **Complexity**: Low
- **Cost**: Low

### 2. Multi-Server Deployment

- **Best for**: High-traffic applications
- **Resources**: Multiple servers with load balancer
- **Complexity**: Medium
- **Cost**: Medium

### 3. Cloud Container Services

- **Platforms**: AWS ECS, Azure Container Instances, Google Cloud Run
- **Best for**: Auto-scaling, managed infrastructure
- **Complexity**: Medium to High
- **Cost**: Variable based on usage

### 4. Kubernetes Deployment

- **Best for**: Large-scale, multi-region deployments
- **Resources**: Kubernetes cluster
- **Complexity**: High
- **Cost**: High

---

## 🛠️ Pre-Deployment Checklist

### Infrastructure Requirements

- [ ] **Server**: Linux server (Ubuntu 20.04+ recommended)
- [ ] **RAM**: 8GB minimum (16GB+ recommended)
- [ ] **CPU**: 4 cores minimum (8+ recommended)
- [ ] **Storage**: 40GB+ SSD
- [ ] **Network**: Static IP address
- [ ] **Domain**: DNS configured and propagated
- [ ] **SSL/TLS**: Certificates ready (Let's Encrypt recommended)

### Software Requirements

- [ ] **Docker**: 24.0+ installed
- [ ] **Docker Compose**: v2.20+ installed
- [ ] **Git**: Installed for code deployment
- [ ] **Firewall**: UFW or iptables configured
- [ ] **Backup System**: Automated backup solution in place

### Security Checklist

- [ ] Strong passwords for all services (32+ random characters)
- [ ] SSH key-only authentication (disable password auth)
- [ ] Firewall configured (only necessary ports open)
- [ ] SSL/TLS certificates installed
- [ ] Environment variables secured (not in Git)
- [ ] Database backups automated
- [ ] Monitoring and alerting configured
- [ ] Fail2ban or similar intrusion prevention installed

---

## 🚀 Production Deployment

### Step 1: Server Preparation

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# 4. Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# 5. Verify installation
docker --version
docker compose version

# 6. Configure firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# 7. Install fail2ban (optional but recommended)
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Step 2: Clone and Configure

```bash
# 1. Create application directory
sudo mkdir -p /opt/farmersmarket
sudo chown $USER:$USER /opt/farmersmarket
cd /opt/farmersmarket

# 2. Clone repository
git clone <repository-url> .

# 3. Create production environment file
cp .env.example .env

# 4. Generate secure secrets
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env
echo "POSTGRES_PASSWORD=$(openssl rand -base64 16)" >> .env
echo "REDIS_PASSWORD=$(openssl rand -base64 16)" >> .env

# 5. Edit .env with production values
nano .env
```

### Step 3: Configure Environment Variables

```bash
# Edit .env file with production values
nano .env
```

**Required Production Variables:**

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generated-32-char-secret>

# Database
DATABASE_URL=postgresql://postgres:<password>@db:5432/farmersmarket
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<generated-secure-password>
POSTGRES_DB=farmersmarket

# Redis
REDIS_URL=redis://:<password>@redis:6379
REDIS_PASSWORD=<generated-secure-password>

# Email (SMTP - example: Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring (Optional)
SENTRY_DSN=https://...
SENTRY_ENVIRONMENT=production
APPLICATIONINSIGHTS_CONNECTION_STRING=...

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_ANALYTICS=true
```

### Step 4: SSL/TLS Configuration

#### Option A: Let's Encrypt (Free, Recommended)

```bash
# 1. Install certbot
sudo apt install certbot python3-certbot-nginx -y

# 2. Generate certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 3. Certificates will be at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# 4. Copy to project (or mount volume)
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/

# 5. Set up auto-renewal
sudo certbot renew --dry-run
```

#### Option B: Custom SSL Certificates

```bash
# 1. Place certificates in nginx/ssl/
cp your-certificate.crt nginx/ssl/fullchain.pem
cp your-private-key.key nginx/ssl/privkey.pem

# 2. Set proper permissions
chmod 600 nginx/ssl/privkey.pem
chmod 644 nginx/ssl/fullchain.pem
```

### Step 5: Build and Deploy

```bash
# Navigate to compose directory
cd /opt/farmersmarket/docker/compose

# 1. Build production images
docker compose build app

# 2. Start services (production stack)
docker compose up -d

# 3. Wait for services to be ready
docker compose ps

# 4. Run database migrations
docker compose exec app npx prisma migrate deploy

# 5. Verify application health
curl http://localhost:3000/api/health

# 6. Check logs
docker compose logs -f app
```

### Step 6: Verify Deployment

```bash
# 1. Check all services are running
docker compose ps

# Expected output:
# NAME                        STATUS              PORTS
# farmers-market-app          Up (healthy)        3000/tcp
# farmers-market-db           Up (healthy)        5432/tcp
# farmers-market-cache        Up (healthy)        6379/tcp
# farmers-market-proxy        Up (healthy)        80/tcp, 443/tcp

# 2. Check application health
curl https://yourdomain.com/api/health

# 3. Test database connection
docker compose exec db pg_isready -U postgres

# 4. Test Redis connection
docker compose exec redis redis-cli -a <password> ping

# 5. View resource usage
docker stats
```

---

## 📊 Monitoring & Logging

### Application Logs

```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f app

# Last 100 lines
docker compose logs --tail=100 app

# Since specific time
docker compose logs --since 2024-11-27T10:00:00 app

# Export logs to file
docker compose logs app > app-logs-$(date +%Y%m%d).log
```

### Health Monitoring

```bash
# Application health endpoint
curl https://yourdomain.com/api/health

# Database health
docker compose exec db pg_isready

# Redis health
docker compose exec redis redis-cli -a <password> ping

# Container health status
docker compose ps

# Resource usage monitoring
docker stats --no-stream
```

### Set Up Log Rotation

```bash
# Create log rotation config
sudo nano /etc/logrotate.d/docker-compose

# Add:
/opt/farmersmarket/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
}
```

---

## 🔄 Updates & Maintenance

### Updating Application

```bash
# 1. Navigate to project directory
cd /opt/farmersmarket

# 2. Backup database first
docker compose exec db pg_dump -U postgres farmersmarket > backup-$(date +%Y%m%d).sql

# 3. Pull latest code
git pull origin main

# 4. Rebuild images
cd docker/compose
docker compose build app

# 5. Stop old containers
docker compose down

# 6. Start new containers
docker compose up -d

# 7. Run migrations (if any)
docker compose exec app npx prisma migrate deploy

# 8. Verify deployment
docker compose ps
curl https://yourdomain.com/api/health
```

### Zero-Downtime Updates (Blue-Green)

```bash
# 1. Scale up (run old + new)
docker compose up -d --scale app=2

# 2. Wait for new instance to be healthy
docker compose ps

# 3. Update Nginx to point to new instance

# 4. Stop old instance
docker compose stop <old-container-id>

# 5. Verify and scale down
docker compose up -d --scale app=1
```

### Database Migrations

```bash
# Run migrations (production)
docker compose exec app npx prisma migrate deploy

# Check migration status
docker compose exec app npx prisma migrate status

# Rollback last migration (if needed)
docker compose exec app npx prisma migrate resolve --rolled-back <migration-name>
```

---

## 💾 Backup & Recovery

### Automated Database Backups

The production stack includes automated daily backups via `db-backup` service.

**Configuration:**

```yaml
# In docker-compose.yml
db-backup:
  environment:
    - SCHEDULE=@daily # Daily backups
    - BACKUP_KEEP_DAYS=7 # Keep 7 days
    - BACKUP_KEEP_WEEKS=4 # Keep 4 weeks
    - BACKUP_KEEP_MONTHS=6 # Keep 6 months
```

**Backup Location:**

```bash
# List backups
docker compose exec db-backup ls -lh /backups

# Copy backup to host
docker cp farmers-market-db-backup:/backups/backup-date.sql.gz ./backups/
```

### Manual Backup

```bash
# Full database backup
docker compose exec db pg_dump -U postgres farmersmarket > backup-$(date +%Y%m%d-%H%M%S).sql

# Compressed backup
docker compose exec db pg_dump -U postgres farmersmarket | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz

# Backup volumes
docker run --rm -v farmers-market-postgres-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/volume-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Database Restoration

```bash
# 1. Stop application
docker compose stop app

# 2. Restore from backup
docker compose exec -T db psql -U postgres farmersmarket < backup-20241127.sql

# 3. Restart application
docker compose start app

# 4. Verify
docker compose exec app npx prisma db push --skip-generate
```

---

## 📈 Scaling

### Horizontal Scaling (Multiple App Instances)

```bash
# Run multiple app instances
docker compose up -d --scale app=3

# Configure Nginx for load balancing
# Edit nginx/nginx.conf:
upstream app_servers {
    server app:3000;
    # Docker will automatically load balance across scaled instances
}
```

### Vertical Scaling (Resource Limits)

```yaml
# In docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: "4.0"
        reservations:
          memory: 1G
          cpus: "2.0"
```

### Database Connection Pooling

```bash
# In .env
DATABASE_URL="postgresql://postgres:password@db:5432/farmersmarket?connection_limit=100&pool_timeout=10"
```

---

## 🔒 Security Best Practices

### Production Security Checklist

- [ ] All default passwords changed
- [ ] Strong secrets (32+ random characters)
- [ ] SSL/TLS enabled and forced (HTTPS only)
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] SSH password authentication disabled
- [ ] Database not exposed to public internet
- [ ] Redis password protected
- [ ] Management tools (Adminer, Redis Commander) disabled in production
- [ ] Environment variables not in Git repository
- [ ] Docker socket not exposed to containers
- [ ] Regular security updates applied
- [ ] Vulnerability scanning enabled
- [ ] Log monitoring and alerting configured
- [ ] Backup system tested and verified
- [ ] Rate limiting configured in Nginx
- [ ] DDoS protection enabled (Cloudflare or similar)

### Hardening Docker

```bash
# 1. Run containers as non-root (already configured in Dockerfiles)

# 2. Use read-only file systems where possible
# In docker-compose.yml:
read_only: true

# 3. Enable Docker Content Trust
export DOCKER_CONTENT_TRUST=1

# 4. Scan images for vulnerabilities
docker scan farmers-market:latest

# 5. Limit resources
# Already configured in docker-compose.yml
```

---

## 🚨 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs app

# Check previous container logs
docker compose logs --tail=100 app

# Inspect container
docker inspect farmers-market-app

# Check disk space
df -h

# Check memory
free -h
```

### Database Connection Issues

```bash
# Check database is running
docker compose ps db

# Check database logs
docker compose logs db

# Test connection
docker compose exec app npx prisma db push --skip-generate

# Verify DATABASE_URL
docker compose exec app env | grep DATABASE_URL
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check logs for errors
docker compose logs --tail=100 app

# Restart services
docker compose restart app

# Check Nginx logs
docker compose exec nginx cat /var/log/nginx/error.log
```

For more troubleshooting, see `TROUBLESHOOTING.md`.

---

## 📞 Support & Resources

### Documentation

- **Setup Guide**: `SETUP-GUIDE.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Docker README**: `../README.md`
- **Main Documentation**: `../../docs/`

### Monitoring Tools

- **Application Health**: `https://yourdomain.com/api/health`
- **Docker Stats**: `docker stats`
- **Service Status**: `docker compose ps`

---

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] Firewall configured
- [ ] DNS configured and propagated

### Deployment

- [ ] Code pulled from repository
- [ ] Images built successfully
- [ ] Services started
- [ ] Database migrations ran
- [ ] Health checks passing
- [ ] SSL/TLS working
- [ ] Logs being captured

### Post-Deployment

- [ ] Application accessible via HTTPS
- [ ] All features tested
- [ ] Performance monitored
- [ ] Backup verified
- [ ] Team notified
- [ ] Documentation updated

---

**Deployment Guide Version**: 3.0  
**Last Updated**: November 27, 2024  
**Status**: ✅ Production Ready

_For setup instructions, see `SETUP-GUIDE.md`_
_For troubleshooting, see `TROUBLESHOOTING.md`_
