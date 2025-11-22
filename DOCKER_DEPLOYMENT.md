# 🐳 Docker Deployment Guide

## Divine Docker Infrastructure for Agricultural Platform

This guide covers deploying the Farmers Market platform using Docker with divine patterns and agricultural consciousness.

---

## 🚀 Quick Start

### Development Environment

```bash
# 1. Copy environment configuration
cp .env.docker .env

# 2. Edit .env with your actual values
# Especially NEXTAUTH_SECRET, STRIPE_SECRET_KEY, etc.

# 3. Start development stack
docker-compose -f docker-compose.dev.yml up -d

# 4. Run database migrations
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev

# 5. Seed database
docker-compose -f docker-compose.dev.yml exec app npx prisma db seed

# 6. Access the application
# http://localhost:3001
```

### Docker Deployment Configuration

## Production Setup

Production deployment configuration and best practices.

## Environment Configuration

Create production `.env` file:

````bash
# Production Environment
NODE_ENV=production

---

## 📦 Docker Services

### Application Service (`app`)

- **Image**: Next.js application (multi-stage build)
- **Port**: 3001
- **Dependencies**: PostgreSQL, Redis
- **Health Check**: `/api/health` endpoint

### Database Service (`postgres`)

- **Image**: PostgreSQL 16 Alpine
- **Port**: 5432
- **Volume**: Persistent data storage
- **Health Check**: `pg_isready`

### Cache Service (`redis`)

- **Image**: Redis 7 Alpine
- **Port**: 6379
- **Volume**: Persistent cache storage
- **Health Check**: Redis ping

### Reverse Proxy (`nginx`)

- **Image**: Nginx Alpine
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Features**: Rate limiting, compression, static file serving

---

## 🔧 Configuration

### Environment Variables

Required variables (set in `.env`):

```bash
# Database
DATABASE_URL="postgresql://user:password@postgres:5432/farmers_market"

# Authentication
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<generate-secure-random-string-min-32-chars>

# Payment (if using Stripe)
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
````

### Volume Mounts

Production volumes:

- `postgres-data`: Database persistence
- `redis-data`: Cache persistence
- `./uploads`: User-uploaded files
- `./logs`: Application logs

Development volumes:

- Source code mounted for hot reloading
- Node modules isolated in container

---

## 🎯 Common Commands

### Development

```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop services
docker-compose -f docker-compose.dev.yml down

# Rebuild application
docker-compose -f docker-compose.dev.yml up -d --build app

# Access application shell
docker-compose -f docker-compose.dev.yml exec app sh

# Run Prisma Studio
docker-compose -f docker-compose.dev.yml exec app npx prisma studio
```

### Production

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart specific service
docker-compose restart app

# Scale application (multiple instances)
docker-compose up -d --scale app=3

# Clean up everything (including volumes)
docker-compose down -v
```

### Database Management

```bash
# Run migrations (development)
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev

# Run migrations (production)
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npx prisma db seed

# Database backup
docker-compose exec postgres pg_dump -U divine_user farmers_market > backup.sql

# Database restore
cat backup.sql | docker-compose exec -T postgres psql -U divine_user farmers_market
```

---

## 🔒 Security Best Practices

### 1. Environment Secrets

```bash
# Generate secure NEXTAUTH_SECRET
openssl rand -base64 32

# Use Docker secrets for production
docker secret create nextauth_secret -
# Enter your secret and press Ctrl+D
```

### 2. Network Isolation

Services communicate through internal `divine-network`, not exposed externally except via Nginx.

### 3. Non-Root User

Application runs as non-root user (`nextjs:nodejs`) for security.

### 4. Health Checks

All services have health checks to ensure availability:

- App: HTTP health endpoint
- PostgreSQL: `pg_isready`
- Redis: Ping command

---

## 📊 Monitoring & Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# Logs since timestamp
docker-compose logs --since 2024-01-01T00:00:00 app
```

### Health Checks

```bash
# Check all service health
docker-compose ps

# Application health endpoint
curl http://localhost:3001/api/health

# Database health
docker-compose exec postgres pg_isready -U divine_user
```

### Resource Usage

```bash
# Container stats
docker stats

# Detailed container info
docker-compose top
```

---

## 🚀 Production Deployment

### 1. Prepare Environment

```bash
# Clone repository
git clone <repository-url>
cd Farmers-Market-platform

# Copy and configure environment
cp .env.docker .env
nano .env  # Edit with production values
```

### 2. Build Images

```bash
# Build production image
docker-compose build

# Or build with no cache
docker-compose build --no-cache
```

### 3. Database Setup

```bash
# Start database first
docker-compose up -d postgres redis

# Wait for health check
docker-compose ps

# Run migrations
docker-compose run --rm app npx prisma migrate deploy
```

### 4. Start Application

```bash
# Start all services
docker-compose up -d

# Verify health
curl http://localhost:3001/api/health
```

### 5. Configure Nginx SSL (Production)

```bash
# Generate SSL certificates (Let's Encrypt)
certbot certonly --standalone -d your-domain.com

# Copy certificates
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Uncomment HTTPS server block in nginx.conf

# Restart Nginx
docker-compose restart nginx
```

---

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build app

# Run any new migrations
docker-compose exec app npx prisma migrate deploy
```

### Database Backup Automation

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U divine_user farmers_market | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz
# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

---

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Verify database connection
docker-compose exec app npx prisma db pull

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Verify database is running
docker-compose exec postgres psql -U divine_user -d farmers_market -c "SELECT 1"

# Check environment variables
docker-compose exec app env | grep DATABASE_URL
```

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :3001

# Change port in docker-compose.yml
# ports:
#   - "3002:3001"  # External:Internal
```

### Out of Disk Space

```bash
# Clean up unused images
docker system prune -a

# Remove old volumes
docker volume prune

# Check disk usage
docker system df
```

---

## 📈 Performance Optimization

### 1. Multi-Stage Build

The Dockerfile uses multi-stage builds to minimize image size:

- Dependencies layer (cached)
- Build layer (compiles application)
- Runtime layer (minimal, production-ready)

### 2. Layer Caching

Order of COPY commands optimized for maximum cache utilization.

### 3. Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G
        reservations:
          cpus: "1"
          memory: 1G
```

### 4. Production Optimizations

```yaml
services:
  app:
    environment:
      - NODE_OPTIONS=--max-old-space-size=2048
      - UV_THREADPOOL_SIZE=12
```

---

## 🌟 Divine Patterns Applied

- **Multi-stage builds**: Quantum manifestation across build stages
- **Health checks**: Agricultural consciousness monitoring
- **Non-root user**: Security divinity principles
- **Volume persistence**: Soil memory preservation
- **Network isolation**: Quantum boundary enforcement
- **Graceful degradation**: Error as enlightenment

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)

---

_"Containerization is the manifestation of quantum isolation - each service in its own reality, yet harmoniously orchestrated."_ ⚡🌾
