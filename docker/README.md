# 🐳 Docker Configuration

# Farmers Market Platform - Containerized Deployment

**Version**: 3.0  
**Last Updated**: November 27, 2024  
**Status**: Production Ready

---

## 📋 Overview

This directory contains all Docker-related configuration for the Farmers Market Platform, organized for clarity and ease of use. The setup supports both development and production environments with optimized configurations for each.

### Directory Structure

```
docker/
├── README.md                           # This file - Master Docker documentation
├── .dockerignore                       # Docker ignore patterns
│
├── dockerfiles/                        # Container definitions
│   ├── Dockerfile                      # Production (multi-stage, optimized)
│   ├── Dockerfile.dev                  # Development (hot-reload enabled)
│   └── Dockerfile.simple               # Simple variant (legacy/testing)
│
├── compose/                            # Docker Compose configurations
│   ├── docker-compose.yml              # Production stack
│   └── docker-compose.dev.yml          # Development stack
│
└── docs/                               # Detailed Docker documentation
    ├── SETUP-GUIDE.md                  # Complete setup instructions
    ├── DEPLOYMENT-GUIDE.md             # Production deployment guide
    ├── TROUBLESHOOTING.md              # Common issues & solutions
    └── REFERENCE.md                    # Technical reference
```

---

## 🚀 Quick Start

### Development Environment

**Prerequisites:**

- Docker Desktop 24.0+ installed
- Docker Compose v2.20+
- 8GB+ RAM available
- 20GB+ disk space

**Start Development Stack:**

```bash
# Navigate to compose directory
cd docker/compose

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Access application
# - App: http://localhost:3001
# - Prisma Studio: http://localhost:5555
# - Adminer: http://localhost:8082
# - Redis Commander: http://localhost:8081
```

**Stop Development Stack:**

```bash
cd docker/compose
docker-compose -f docker-compose.dev.yml down
```

### Production Environment

**Start Production Stack:**

```bash
# Navigate to compose directory
cd docker/compose

# Start all services (including management tools)
docker-compose --profile management up -d

# View logs
docker-compose logs -f app

# Access application
# - App: http://localhost:3000
# - Adminer: http://localhost:8082 (management profile)
# - Redis Commander: http://localhost:8081 (management profile)
```

**Production without management tools:**

```bash
cd docker/compose
docker-compose up -d
```

---

## 📦 Dockerfiles

### Production Dockerfile (`dockerfiles/Dockerfile`)

**Purpose**: Optimized multi-stage build for production deployment

**Features**:

- ✅ Multi-stage build (minimal final image)
- ✅ Next.js standalone output mode
- ✅ Node.js 20 Alpine (small footprint)
- ✅ Non-root user for security
- ✅ Production dependencies only
- ✅ Build cache optimization
- ✅ Health checks included

**Build Locally**:

```bash
cd docker/dockerfiles
docker build -f Dockerfile -t farmers-market:latest ../..
```

**Image Size**: ~350MB (optimized)

### Development Dockerfile (`dockerfiles/Dockerfile.dev`)

**Purpose**: Fast iteration with hot-reloading and debugging tools

**Features**:

- ✅ Hot module replacement (HMR)
- ✅ Turbopack for faster builds
- ✅ Node.js debugger on port 9229
- ✅ Prisma Studio included
- ✅ Source code volume mounted
- ✅ Development dependencies included
- ✅ Optimized for HP OMEN specs (12 threads, 64GB RAM)

**Build Locally**:

```bash
cd docker/dockerfiles
docker build -f Dockerfile.dev -t farmers-market:dev ../..
```

**Image Size**: ~800MB (includes dev tools)

### Simple Dockerfile (`dockerfiles/Dockerfile.simple`)

**Purpose**: Simplified build for testing and legacy compatibility

**Features**:

- ✅ Single-stage build
- ✅ Minimal configuration
- ✅ Quick to build
- ✅ Good for debugging build issues

**Build Locally**:

```bash
cd docker/dockerfiles
docker build -f Dockerfile.simple -t farmers-market:simple ../..
```

---

## 🐙 Docker Compose Configurations

### Production Stack (`compose/docker-compose.yml`)

**Services Included**:

1. **app** - Next.js application (production mode)
2. **db** - PostgreSQL 16 with PostGIS
3. **redis** - Redis 7 cache
4. **nginx** - Reverse proxy with SSL
5. **db-backup** - Automated database backups
6. **redis-commander** - Redis management UI (optional, `--profile management`)
7. **adminer** - Database management UI (optional, `--profile management`)

**Persistent Volumes**:

- `postgres-data` - Database storage
- `postgres-backups` - Automated backups
- `redis-data` - Cache persistence
- `uploads-data` - User uploads
- `logs-data` - Application logs
- `nginx-cache` - Nginx cache
- `nginx-logs` - Nginx logs

**Resource Limits**:

- App: 768MB memory, 2 CPUs (max), 384MB (min)
- Optimized for production workloads

### Development Stack (`compose/docker-compose.dev.yml`)

**Services Included**:

1. **app** - Next.js dev server with hot-reload
2. **db** - PostgreSQL with PostGIS
3. **redis** - Redis cache
4. **prisma-studio** - Database GUI (via app service)

**Volume Mounts** (for hot-reload):

- Source code mounted at `/app`
- Node modules in named volume (performance)
- Uploads and logs persisted

**Developer Ports**:

- 3001 - Next.js dev server
- 5555 - Prisma Studio
- 9229 - Node.js debugger
- 8082 - Adminer
- 8081 - Redis Commander

**HP OMEN Optimizations**:

- 12-thread parallelization enabled
- 16GB Node.js heap allocation
- Turbopack for faster builds
- Polling-based file watching for Docker compatibility

---

## 🎯 Common Commands

### Building Images

```bash
# Build production image
cd docker/compose
docker-compose build app

# Build with no cache (clean build)
docker-compose build --no-cache app

# Build development image
docker-compose -f docker-compose.dev.yml build app
```

### Managing Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d app

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ DATA LOSS)
docker-compose down -v

# Restart service
docker-compose restart app

# View service status
docker-compose ps

# View resource usage
docker stats
```

### Viewing Logs

```bash
# Follow all logs
docker-compose logs -f

# Follow specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# Since timestamp
docker-compose logs --since 2024-11-27T10:00:00 app
```

### Database Operations

```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npx prisma db seed

# Open Prisma Studio
docker-compose exec app npx prisma studio

# Database shell
docker-compose exec db psql -U postgres -d farmersmarket

# Create database backup
docker-compose exec db pg_dump -U postgres farmersmarket > backup.sql

# Restore database backup
docker-compose exec -T db psql -U postgres farmersmarket < backup.sql
```

### Debugging & Inspection

```bash
# Execute command in running container
docker-compose exec app sh

# Execute command in new container
docker-compose run --rm app sh

# Inspect container
docker inspect farmers-market-app

# View container logs location
docker inspect --format='{{.LogPath}}' farmers-market-app

# Check health status
docker-compose ps
```

### Scaling (Production)

```bash
# Run multiple app instances (with load balancer)
docker-compose up -d --scale app=3

# Note: Requires Nginx load balancing configuration
```

---

## 🔧 Configuration

### Environment Variables

**Required for Production**:

- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - Auth secret (min 32 chars)
- `NEXTAUTH_URL` - Public app URL
- `REDIS_PASSWORD` - Redis password

**Optional but Recommended**:

- `STRIPE_SECRET_KEY` - Payment processing
- `OPENAI_API_KEY` - AI features
- `SMTP_*` - Email configuration
- `SENTRY_DSN` - Error monitoring

**Configuration Files**:

- Production: Create `.env` in project root
- Development: Use `.env.local` or `.env.development`
- Reference: See `.env.example` in project root

See `docs/deployment/ENV-SETUP-GUIDE.md` for complete environment variable documentation.

### Docker Compose Override

Create `docker-compose.override.yml` for local customizations:

```yaml
# docker/compose/docker-compose.override.yml
services:
  app:
    ports:
      - "3002:3000" # Custom port
    environment:
      - CUSTOM_VAR=value
```

This file is gitignored and won't affect other developers.

---

## 🏗️ Building for Different Platforms

### Multi-Platform Builds (ARM64 + AMD64)

```bash
# Create builder (one-time setup)
docker buildx create --name multiplatform --use

# Build for multiple platforms
cd docker/dockerfiles
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f Dockerfile \
  -t farmersmarket/app:latest \
  --push \
  ../..
```

### Platform-Specific Builds

```bash
# For ARM64 (Apple Silicon, ARM servers)
docker build --platform linux/arm64 -f Dockerfile -t farmers-market:arm64 ../..

# For AMD64 (Intel/AMD servers)
docker build --platform linux/amd64 -f Dockerfile -t farmers-market:amd64 ../..
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoints

**Application Health**:

```bash
curl http://localhost:3000/api/health
```

**Docker Health Status**:

```bash
docker-compose ps
```

**Service-Specific Health**:

```bash
# Check database
docker-compose exec db pg_isready -U postgres

# Check Redis
docker-compose exec redis redis-cli -a [password] ping

# Check app
curl http://localhost:3000/api/health
```

### Logs & Debugging

**Log Locations** (inside containers):

- App logs: `/app/logs/`
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: `/var/lib/postgresql/data/log/`

**Access logs from host**:

```bash
# Application logs
docker-compose exec app cat logs/app.log

# Nginx access logs
docker-compose exec nginx cat /var/log/nginx/access.log

# Database logs
docker-compose logs db
```

---

## 🔒 Security Best Practices

### Production Security Checklist

- [ ] Change all default passwords (PostgreSQL, Redis, Adminer)
- [ ] Set strong `NEXTAUTH_SECRET` (min 32 random characters)
- [ ] Use environment-specific `.env` files (not committed to Git)
- [ ] Disable management tools in production (`--profile management` only for maintenance)
- [ ] Configure SSL/TLS in Nginx
- [ ] Set up firewall rules (only expose necessary ports)
- [ ] Enable Docker content trust: `export DOCKER_CONTENT_TRUST=1`
- [ ] Run containers as non-root users (already configured in Dockerfiles)
- [ ] Regularly update base images and dependencies
- [ ] Scan images for vulnerabilities: `docker scan farmers-market:latest`

### Network Security

**Exposed Ports (Production)**:

- 80 (HTTP) - Nginx
- 443 (HTTPS) - Nginx

**Internal Ports** (not exposed to host):

- 3000 - Next.js app
- 5432 - PostgreSQL
- 6379 - Redis

---

## 🚀 Deployment

### Local Development Deployment

```bash
cd docker/compose
docker-compose -f docker-compose.dev.yml up -d
```

### Staging Deployment

```bash
cd docker/compose
docker-compose -f docker-compose.yml up -d --build
```

### Production Deployment

See detailed deployment guides:

- **Complete Guide**: `docs/deployment/DOCKER-COMPLETE-GUIDE.md`
- **Docker-Specific**: `docker/docs/DEPLOYMENT-GUIDE.md`
- **Setup Instructions**: `docker/docs/SETUP-GUIDE.md`

**Quick Production Deploy**:

```bash
# 1. Configure environment
cp .env.example .env
nano .env  # Edit with production values

# 2. Build and start
cd docker/compose
docker-compose build app
docker-compose up -d

# 3. Run migrations
docker-compose exec app npx prisma migrate deploy

# 4. Verify
docker-compose ps
curl http://localhost:3000/api/health
```

---

## 🛠️ Troubleshooting

### Common Issues

**Issue**: Container won't start

```bash
# Check logs
docker-compose logs app

# Check container status
docker-compose ps

# Rebuild container
docker-compose build --no-cache app
docker-compose up -d app
```

**Issue**: Database connection failed

```bash
# Verify database is healthy
docker-compose exec db pg_isready -U postgres

# Check DATABASE_URL environment variable
docker-compose exec app env | grep DATABASE_URL

# Restart database
docker-compose restart db
```

**Issue**: Hot reload not working (development)

```bash
# Ensure polling is enabled in docker-compose.dev.yml:
WATCHPACK_POLLING=true
CHOKIDAR_USEPOLLING=true

# Restart dev server
docker-compose -f docker-compose.dev.yml restart app
```

**Issue**: Out of disk space

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes (⚠️ careful - may delete data)
docker volume prune

# Full cleanup (⚠️ destructive)
docker system prune -a --volumes
```

**Issue**: Port already in use

```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Change port in docker-compose.yml or .env
APP_PORT=3002
```

For more troubleshooting, see `docker/docs/TROUBLESHOOTING.md`.

---

## 📚 Additional Documentation

### Detailed Guides

- **Complete Setup**: `docker/docs/SETUP-GUIDE.md`
- **Deployment Guide**: `docker/docs/DEPLOYMENT-GUIDE.md`
- **Troubleshooting**: `docker/docs/TROUBLESHOOTING.md`
- **Technical Reference**: `docker/docs/REFERENCE.md`

### Project Documentation

- **Main README**: `../../README.md`
- **Quick Start**: `../../docs/QUICK-START.md`
- **Deployment Complete**: `../../docs/deployment/DOCKER-COMPLETE-GUIDE.md`
- **Environment Setup**: `../../docs/deployment/ENV-SETUP-GUIDE.md`

### Docker Scripts

- **Docker Utilities**: `../../scripts/docker/`
- **Deployment Scripts**: `../../scripts/deployment/`

---

## 🔗 Useful Links

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)

---

## 📞 Support

### Getting Help

1. **Check documentation** in `docker/docs/`
2. **Review troubleshooting guide** for common issues
3. **Check Docker logs** for specific error messages
4. **Inspect container health** with `docker-compose ps`
5. **Review main project README** for general setup

### Reporting Issues

When reporting Docker-related issues, include:

- Docker version: `docker --version`
- Docker Compose version: `docker-compose --version`
- Container logs: `docker-compose logs [service]`
- Container status: `docker-compose ps`
- System resources: `docker stats`

---

## 📝 Version History

- **v3.0** (2024-11-27) - Docker file reorganization, comprehensive documentation
- **v2.x** - Production compose configurations
- **v1.x** - Initial Docker setup

---

## 🎯 Quick Reference Card

```bash
# START
docker-compose up -d                              # Production
docker-compose -f docker-compose.dev.yml up -d    # Development

# STOP
docker-compose down                               # Production
docker-compose -f docker-compose.dev.yml down     # Development

# LOGS
docker-compose logs -f app                        # Follow app logs

# BUILD
docker-compose build app                          # Build app image

# DATABASE
docker-compose exec app npx prisma migrate deploy # Run migrations
docker-compose exec app npx prisma db seed        # Seed data
docker-compose exec app npx prisma studio         # Open Prisma Studio

# SHELL
docker-compose exec app sh                        # App shell
docker-compose exec db psql -U postgres           # Database shell

# HEALTH
docker-compose ps                                 # Service status
curl http://localhost:3000/api/health            # Health check

# CLEANUP
docker-compose down -v                            # Remove everything (⚠️ DATA LOSS)
```

---

**Docker Configuration Version**: 3.0  
**Last Updated**: November 27, 2024  
**Status**: ✅ Production Ready

_For the most up-to-date information, always refer to the latest documentation._
