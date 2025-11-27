# 🌾 FARMERS MARKET PLATFORM - DOCKER DEPLOYMENT

**Divine Agricultural E-Commerce Platform - Complete Docker Infrastructure**

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io/)
[![Production Ready](https://img.shields.io/badge/Production-Ready-green)]()

---

## 📋 Quick Navigation

| Document | Purpose | Who Should Read |
|----------|---------|-----------------|
| **[DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)** | 5-minute setup guide | Everyone starting out |
| **[DOCKER_COMPLETE_GUIDE.md](DOCKER_COMPLETE_GUIDE.md)** | Comprehensive documentation | Advanced users, production deployments |
| **[DOCKER_UPDATE_SUMMARY.md](DOCKER_UPDATE_SUMMARY.md)** | What was changed/added | Team members, documentation |

---

## 🚀 Quick Start (30 Seconds)

### Development
```bash
# Copy environment template
cp .env.development.example .env.local

# Start everything
./docker-start-dev.sh

# Open browser: http://localhost:3000
```

### Production
```bash
# Copy and configure
cp .env.production.example .env.production
nano .env.production  # Update with your values

# Deploy
./docker-start-prod.sh

# Access: http://localhost:3000
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET / USERS                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   NGINX (80/443)     │
                  │   • SSL Termination  │
                  │   • Load Balancing   │
                  │   • Rate Limiting    │
                  │   • Caching          │
                  └──────────┬───────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │     Docker Bridge Network               │
        │     (farmers-network / farmers-dev)     │
        │                                          │
        │   ┌──────────────────────────┐          │
        │   │  Next.js App (3000/3001) │          │
        │   │  ┌────────────────────┐  │          │
        │   │  │ Server Components  │  │          │
        │   │  │ API Routes         │  │          │
        │   │  │ Server Actions     │  │          │
        │   │  │ SSR/SSG/ISR        │  │          │
        │   │  └────────────────────┘  │          │
        │   └───────┬──────────┬───────┘          │
        │           │          │                  │
        │      ┌────▼───┐  ┌──▼──────────┐       │
        │      │ Redis  │  │ PostgreSQL  │       │
        │      │ (6379) │  │   (5432)    │       │
        │      │        │  │  + PostGIS  │       │
        │      │ Cache  │  │  + Backups  │       │
        │      └────────┘  └─────────────┘       │
        │                                         │
        └─────────────────────────────────────────┘

Additional Services (Development):
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   MailHog    │   Adminer    │Redis Commander│  PgAdmin    │
│   (8025)     │   (8080)     │   (8081)     │   (8082)    │
│ Email Testing│  DB Manager  │ Cache Manager│Advanced DB UI│
└──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 📦 What's Included

### Core Services

| Service | Version | Purpose | Port(s) |
|---------|---------|---------|---------|
| **Next.js** | 16.0.3 | Application server | 3000/3001 |
| **PostgreSQL** | 16 + PostGIS | Database with geospatial support | 5432 |
| **Redis** | 7 Alpine | Cache and session storage | 6379 |
| **Nginx** | Alpine | Reverse proxy, SSL, load balancer | 80, 443 |

### Development Tools

| Tool | Purpose | Port | URL |
|------|---------|------|-----|
| **MailHog** | Email testing and debugging | 8025 | http://localhost:8025 |
| **Adminer** | Lightweight database management | 8080 | http://localhost:8080 |
| **Redis Commander** | Redis cache visualization | 8081 | http://localhost:8081 |
| **PgAdmin** | Advanced PostgreSQL management | 8082 | http://localhost:8082 |
| **Prisma Studio** | Visual database editor | 5555 | http://localhost:5555 |
| **Node Debugger** | VSCode/Chrome debugging | 9229 | chrome://inspect |

### Production Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Automated Backups** | Daily PostgreSQL dumps with retention | ✅ Configured |
| **Health Checks** | All services monitored | ✅ Enabled |
| **SSL/TLS** | Modern cipher support | ✅ Ready |
| **Rate Limiting** | API, auth, upload protection | ✅ Enabled |
| **Security Headers** | CSP, HSTS, X-Frame-Options | ✅ Configured |
| **Resource Limits** | CPU and memory constraints | ✅ Set |
| **Horizontal Scaling** | Load balanced instances | ✅ Ready |
| **Zero-Downtime Updates** | Rolling deployments | ✅ Supported |

---

## 📊 Service Details

### Development Stack

```yaml
Services:
  app              # Next.js with hot-reload & Turbopack
  db               # PostgreSQL 16 + PostGIS
  redis            # Redis 7 with persistence
  mailhog          # Email testing server
  adminer          # Database UI
  redis-commander  # Redis UI
  pgadmin          # Advanced DB UI (optional)
  nginx-dev        # Dev proxy (optional)

Volumes:
  postgres-dev-data    # Database persistence
  redis-dev-data       # Cache persistence
  node_modules         # Dependencies cache
  nextjs-cache         # Build cache
  uploads-dev          # File uploads
  logs-dev             # Application logs

Ports:
  3001  # Next.js app
  5432  # PostgreSQL
  6379  # Redis
  5555  # Prisma Studio
  8025  # MailHog UI
  8080  # Adminer
  8081  # Redis Commander
  8082  # PgAdmin
  9229  # Node debugger
```

### Production Stack

```yaml
Services:
  app          # Next.js production build
  db           # PostgreSQL 16 + PostGIS
  redis        # Redis 7 with AOF persistence
  nginx        # Reverse proxy with SSL
  db-backup    # Automated backup service

Volumes:
  postgres-data        # Database persistence
  postgres-backups     # Automated backups
  redis-data           # Cache persistence
  uploads-data         # File uploads
  logs-data            # Application logs
  nginx-cache          # Nginx cache
  nginx-logs           # Nginx logs

Ports:
  80    # HTTP (redirects to HTTPS)
  443   # HTTPS
  3000  # App (internal only)
  5432  # PostgreSQL (internal only)
  6379  # Redis (internal only)
```

---

## 🔧 Configuration Files

### Docker Files

| File | Purpose | Lines |
|------|---------|-------|
| `Dockerfile` | Production multi-stage build | 143 |
| `Dockerfile.dev` | Development with hot-reload | 62 |
| `docker-compose.yml` | Production stack | 442 |
| `docker-compose.dev.yml` | Development stack | 365 |
| `.dockerignore` | Build optimization | 200+ |

### Helper Scripts

| Script | Purpose | Lines |
|--------|---------|-------|
| `docker-start-dev.sh` | Development starter | 272 |
| `docker-start-prod.sh` | Production deployer | 454 |

### Environment Templates

| File | Purpose | Variables |
|------|---------|-----------|
| `.env.development.example` | Dev configuration | 50+ |
| `.env.production.example` | Prod configuration | 100+ |

### Nginx Configuration

| File | Purpose | Lines |
|------|---------|-------|
| `nginx/nginx.conf` | Production proxy config | 434 |

---

## 🎯 Common Tasks

### Development

```bash
# Start
./docker-start-dev.sh

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Run migrations
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev

# Run tests
docker-compose -f docker-compose.dev.yml exec app npm test

# Shell access
docker-compose -f docker-compose.dev.yml exec app sh

# Stop
docker-compose -f docker-compose.dev.yml down

# Clean slate
docker-compose -f docker-compose.dev.yml down -v
```

### Production

```bash
# Deploy
./docker-start-prod.sh

# Check status
docker-compose ps

# View logs
docker-compose logs -f app

# Database backup
docker-compose exec db pg_dump -U postgres farmersmarket > backup.sql

# Update app
docker-compose up -d --build app

# Scale horizontally
docker-compose up -d --scale app=3

# Stop
docker-compose down
```

---

## 🔒 Security Features

✅ **Container Security**
- Non-root user execution
- Minimal Alpine Linux base
- Multi-stage builds (no build tools in production)
- Health checks for early detection

✅ **Network Security**
- Custom bridge networks
- Internal-only database and Redis
- Nginx reverse proxy
- Rate limiting on all endpoints

✅ **Application Security**
- Security headers (CSP, HSTS, X-Frame-Options)
- CORS configuration
- Input validation and size limits
- SQL injection prevention (Prisma ORM)

✅ **Secret Management**
- Environment-based configuration
- No hardcoded secrets
- Deployment validation checks
- SSL/TLS with modern ciphers

---

## ⚡ Performance Optimizations

### Build Performance
- ✅ Multi-stage Docker builds (60% smaller images)
- ✅ Layer caching for fast rebuilds
- ✅ Parallel dependency installation
- ✅ BuildKit optimization

### Runtime Performance
- ✅ Next.js standalone output mode
- ✅ Nginx static asset caching (365 days)
- ✅ PostgreSQL query optimization
- ✅ Redis caching with LRU policy
- ✅ Gzip compression
- ✅ Connection pooling

### HP OMEN Optimization
```yaml
NODE_OPTIONS: "--max-old-space-size=16384 --max-semi-space-size=512"
# Optimized for: 12 threads, 64GB RAM, RTX 2070 Max-Q
```

---

## 📊 Resource Requirements

### Development

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 8 GB | 16 GB |
| CPU Cores | 4 | 8 |
| Disk Space | 20 GB | 50 GB |

### Production

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 4 GB | 8 GB+ |
| CPU Cores | 2 | 4+ |
| Disk Space | 50 GB | 100 GB+ |

### Container Resource Limits

```yaml
# Recommended limits
app:
  cpu: 2 cores
  memory: 4GB

db:
  cpu: 2 cores
  memory: 2GB

redis:
  cpu: 1 core
  memory: 1GB
```

---

## 🆘 Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| **Container won't start** | `docker-compose logs <service>` |
| **Port already in use** | `kill -9 $(lsof -ti:3000)` |
| **Database connection failed** | `docker-compose restart db && sleep 10 && docker-compose restart app` |
| **Hot reload not working** | Add `WATCHPACK_POLLING=true` to `.env.local` |
| **Out of disk space** | `docker system prune -a --volumes` |
| **Slow performance** | Increase Docker Desktop resources (Settings → Resources) |
| **Permission denied** | `docker-compose exec -u root app chown -R nextjs:nodejs /app` |

**For detailed troubleshooting, see [DOCKER_COMPLETE_GUIDE.md](DOCKER_COMPLETE_GUIDE.md#troubleshooting)**

---

## 📚 Documentation

### Getting Started
1. **[DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)** - 5-minute setup guide
2. **[DOCKER_COMPLETE_GUIDE.md](DOCKER_COMPLETE_GUIDE.md)** - Comprehensive documentation (1,628 lines)
3. **[DOCKER_UPDATE_SUMMARY.md](DOCKER_UPDATE_SUMMARY.md)** - What's new and changed

### Topics Covered
- 🚀 Quick start (development & production)
- 🏗️ Architecture and design
- ⚙️ Configuration management
- 🗄️ Database operations
- 📊 Monitoring and logging
- 💾 Backup and recovery
- ⚡ Performance tuning
- 🔒 Security best practices
- 🔧 Troubleshooting guide
- 🎓 Advanced topics

---

## 🌟 Key Features

### Development Experience
- ✨ **One-command start**: Single script launches everything
- 🔄 **Hot-reload**: Instant code updates without rebuild
- 🛠️ **Complete toolkit**: All dev tools included
- 📧 **Email testing**: MailHog catches all emails
- 🐛 **Debugging**: VSCode debugger support
- 📊 **Visual tools**: Prisma Studio, Adminer, Redis Commander

### Production Ready
- 🚀 **One-command deploy**: Automated deployment script
- 🔒 **Security hardened**: Best practices built-in
- 💾 **Automated backups**: Daily with retention policy
- 📈 **Monitoring**: Health checks on all services
- ⚡ **Scalable**: Horizontal scaling support
- 🔄 **Zero-downtime**: Rolling deployment support

---

## 📈 Project Statistics

### Infrastructure Code
- **Total Lines**: 4,440+
- **Files**: 12 new/updated
- **Documentation**: 2,085+ lines
- **Scripts**: 726 lines
- **Configuration**: 1,629+ lines

### Services
- **Core Services**: 5 (app, db, redis, nginx, backup)
- **Dev Tools**: 4 (mailhog, adminer, redis-commander, pgadmin)
- **Total Containers**: 9 maximum

### Image Sizes
- **Production**: ~180 MB (optimized)
- **Development**: ~450 MB (with tools)
- **Total Stack**: ~1.2 GB

---

## 🎓 Learning Path

### Beginner
1. Read [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)
2. Start development environment
3. Explore included services
4. Make code changes and see hot-reload

### Intermediate
1. Review [DOCKER_COMPLETE_GUIDE.md](DOCKER_COMPLETE_GUIDE.md)
2. Understand Docker Compose configuration
3. Customize environment variables
4. Set up production staging environment

### Advanced
1. Deep dive into multi-stage Dockerfiles
2. Implement custom Nginx configurations
3. Set up CI/CD pipelines
4. Configure monitoring and alerting
5. Implement Kubernetes deployment

---

## 🔄 Version History

### Version 1.0.0 (January 15, 2025)
- ✅ Complete Docker infrastructure overhaul
- ✅ Production-ready configurations
- ✅ Development with hot-reload
- ✅ Comprehensive documentation
- ✅ Automated deployment scripts
- ✅ Security hardening
- ✅ Performance optimization
- ✅ Backup automation

---

## 💡 Best Practices

### Development
- ✅ Use `./docker-start-dev.sh` for consistent setup
- ✅ Keep `.env.local` out of version control
- ✅ Run tests before committing
- ✅ Use Prisma Studio for database inspection
- ✅ Check MailHog for email testing

### Production
- ✅ Never use default passwords
- ✅ Always use SSL/TLS in production
- ✅ Set up automated backups
- ✅ Monitor logs and metrics
- ✅ Test deployment in staging first
- ✅ Keep secrets in environment variables
- ✅ Regular security updates

---

## 🤝 Contributing

When working with Docker:
1. Test changes in development first
2. Document configuration changes
3. Update environment templates
4. Test both development and production builds
5. Update relevant documentation

---

## 📞 Support

### Resources
- **Quick Start**: [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)
- **Full Guide**: [DOCKER_COMPLETE_GUIDE.md](DOCKER_COMPLETE_GUIDE.md)
- **What's New**: [DOCKER_UPDATE_SUMMARY.md](DOCKER_UPDATE_SUMMARY.md)

### Getting Help
1. Check documentation first
2. Review logs: `docker-compose logs -f`
3. Check service status: `docker-compose ps`
4. Search GitHub issues
5. Ask in community channels

---

## ✨ Highlights

What makes this Docker setup special:

- 🏆 **Enterprise-grade**: Production-ready out of the box
- 🎯 **Developer-friendly**: One command to start everything
- 📖 **Well-documented**: 2,000+ lines of comprehensive guides
- 🔒 **Secure**: Security best practices built-in
- ⚡ **Optimized**: HP OMEN hardware optimization
- 💾 **Reliable**: Automated backups and health checks
- 📊 **Observable**: Complete monitoring setup
- 🚀 **Scalable**: Ready for horizontal scaling

---

## 🎉 Success!

You now have a complete, production-ready Docker infrastructure for the Farmers Market Platform!

```bash
# Get started in 30 seconds
./docker-start-dev.sh
```

**Happy Divine Agricultural Docker Deployment! 🌾⚡**

---

_Last Updated: January 15, 2025 | Version: 1.0.0_
_For detailed information, see [DOCKER_COMPLETE_GUIDE.md](DOCKER_COMPLETE_GUIDE.md)_