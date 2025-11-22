# 🐳 DOCKER DEPLOYMENT GUIDE

## Complete Guide to Containerized Deployment

This guide provides comprehensive instructions for deploying the Farmers Market Platform
using Docker containers in various environments.

## 📋 Prerequisites

- Docker Desktop installed and running
- 16GB+ RAM recommended
- 20GB+ free disk space

## 🚀 Quick Start

### 1. **Environment Setup**

```powershell
# Copy environment template
Copy-Item .env.example .env

# Edit .env and add your secrets
code .env
```

**Required Environment Variables:**

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `STRIPE_SECRET_KEY` - Stripe API key
- `OPENAI_API_KEY` - OpenAI API key (optional)

### 2. **Start Services**

```powershell
# Simple start
docker-compose up -d

# Or use the helper script
.\docker-start.ps1

# Fresh deployment (clean start)
.\docker-start.ps1 -Fresh -Build

# With live logs
.\docker-start.ps1 -Logs
```

### 3. **Verify Deployment**

```powershell
# Check service status
docker-compose ps

# Check logs
docker-compose logs -f app

# Test health endpoint
curl http://localhost:3001/api/health
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         NGINX Reverse Proxy             │
│     (Port 80/443 → Port 3001)           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        Next.js Application              │
│     (farmers-market-app:3001)           │
└─────────────────────────────────────────┘
          ↓                    ↓
┌──────────────────┐  ┌──────────────────┐
│   PostgreSQL     │  │      Redis       │
│   Database       │  │      Cache       │
│   (Port 5432)    │  │   (Port 6379)    │
└──────────────────┘  └──────────────────┘
```

## 📦 Services

### **Application (`app`)**

- **Image**: Custom Next.js build
- **Port**: 3001
- **Purpose**: Main application server
- **Dependencies**: PostgreSQL, Redis
- **Health Check**: `/api/health`

### **PostgreSQL (`postgres`)**

- **Image**: postgres:16-alpine
- **Port**: 5432
- **Purpose**: Primary database
- **Volume**: `postgres-data`
- **Performance**: Optimized for SSD

### **Redis (`redis`)**

- **Image**: redis:7-alpine
- **Port**: 6379
- **Purpose**: Caching & sessions
- **Volume**: `redis-data`
- **Max Memory**: 2GB with LRU eviction

### **NGINX (`nginx`)** (Optional)

- **Image**: nginx:alpine
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Purpose**: Reverse proxy & SSL termination
- **Features**: Rate limiting, compression, caching

## 🔧 Configuration

### **Docker Compose Override**

Create `docker-compose.override.yml` for local customizations:

```yaml
version: "3.9"

services:
  app:
    ports:
      - "3002:3001" # Different port
    environment:
      - DEBUG=true
```

### **Resource Limits**

For production, add resource constraints:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 4G
        reservations:
          cpus: "1.0"
          memory: 2G
```

## 📊 Monitoring & Logs

### **View Logs**

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# Follow new logs only
docker-compose logs -f --since 1m
```

### **Service Status**

```powershell
# Quick status
docker-compose ps

# Detailed stats
docker stats

# Health checks
docker-compose ps --filter "health=healthy"
```

## 🔄 Database Management

### **Run Migrations**

```powershell
# Apply migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma Client
docker-compose exec app npx prisma generate

# Open Prisma Studio
docker-compose exec app npx prisma studio
```

### **Backup Database**

```powershell
# Create backup
docker-compose exec postgres pg_dump -U divine_user farmers_market > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U divine_user farmers_market < backup.sql
```

## 🧹 Maintenance

### **Update Services**

```powershell
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build

# Restart specific service
docker-compose restart app
```

### **Clean Up**

```powershell
# Stop all services
docker-compose down

# Remove volumes (⚠️ DATA LOSS)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Clean Docker system
docker system prune -a --volumes
```

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` to version control
   - Use strong passwords for database and Redis
   - Rotate secrets regularly

2. **Network Security**
   - Use internal networks for service communication
   - Expose only necessary ports
   - Enable NGINX rate limiting

3. **Container Security**
   - Run as non-root user (already configured)
   - Keep images updated
   - Scan for vulnerabilities: `docker scan farmers-market-app`

## 🐛 Troubleshooting

### **Service Won't Start**

```powershell
# Check logs
docker-compose logs app

# Inspect container
docker-compose exec app sh

# Check environment variables
docker-compose exec app env
```

### **Database Connection Issues**

```powershell
# Test database connection
docker-compose exec postgres psql -U divine_user -d farmers_market -c "SELECT 1"

# Check database logs
docker-compose logs postgres

# Verify DATABASE_URL
docker-compose exec app echo $DATABASE_URL
```

### **Port Already in Use**

```powershell
# Find process using port
netstat -ano | findstr :3001

# Kill process
taskkill /PID <process_id> /F

# Or change port in docker-compose.yml
```

### **Out of Memory**

```powershell
# Check Docker resources
docker system df

# Increase Docker memory limit in Docker Desktop settings
# Clean up unused resources
docker system prune -a
```

## 📈 Performance Optimization

### **Build Optimization**

```dockerfile
# Enable BuildKit for faster builds
$env:DOCKER_BUILDKIT=1
docker-compose build
```

### **Layer Caching**

```powershell
# Build with cache
docker-compose build

# Force rebuild without cache
docker-compose build --no-cache
```

### **Multi-stage Builds**

The Dockerfile uses multi-stage builds to minimize final image size:

- Stage 1: Install dependencies
- Stage 2: Build application
- Stage 3: Production runtime (Alpine Linux, ~200MB)

## 🚀 Production Deployment

### **Pre-deployment Checklist**

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Configure production database
- [ ] Set up SSL certificates for NGINX
- [ ] Enable monitoring (Sentry, logs)
- [ ] Configure backups
- [ ] Test health checks
- [ ] Set up CI/CD pipeline

### **SSL/TLS Setup**

1. Obtain SSL certificates (Let's Encrypt recommended)
2. Place certificates in `nginx/ssl/`
3. Update `nginx/nginx.conf` with certificate paths
4. Restart NGINX: `docker-compose restart nginx`

### **Scaling**

```powershell
# Scale application containers
docker-compose up -d --scale app=3

# With load balancing (requires NGINX configuration)
docker-compose up -d --scale app=5
```

## 📞 Support

- **Documentation**: See `docs/` folder
- **Issues**: Check logs and error messages
- **Community**: GitHub Issues

## 🎯 Next Steps

1. Configure environment variables
2. Run database migrations
3. Set up monitoring
4. Configure backups
5. Enable SSL in production
6. Set up CI/CD pipeline

---

**Divine Agricultural Platform** - Built with quantum consciousness 🌾
