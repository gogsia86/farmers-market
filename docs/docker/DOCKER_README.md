# 🐳 Docker Deployment - Farmers Market Platform

**Divine Agricultural E-Commerce System**

---

## 🎯 What This Is

Complete Docker containerization for the Farmers Market Platform, allowing you to:
- ✅ Run the entire application stack with a single command
- ✅ Develop locally with hot reload
- ✅ Deploy to production with optimized builds
- ✅ Easily manage database, cache, and services

---

## 🚀 Quick Start (5 Minutes)

### Development Environment

```bash
# 1. Copy environment file
cp .env.docker.example .env.local

# 2. Start everything
npm run docker:up-build-dev

# 3. Wait ~30 seconds, then access
open http://localhost:3000
```

**That's it! You're running! 🎉**

### Production Environment

```bash
# 1. Setup production environment
cp .env.docker.example .env.production
# Edit .env.production with secure values

# 2. Build and start
npm run docker:up-build

# 3. Initialize database
npm run docker:migrate
npm run docker:seed

# 4. Access application
open https://localhost:443
```

---

## 📚 Documentation

- **[DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md)** - Quick reference guide
- **[DOCKER_DEPLOYMENT_COMPLETE.md](./DOCKER_DEPLOYMENT_COMPLETE.md)** - Full deployment guide (1000+ lines)
- **[DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md)** - Complete setup summary

---

## 🎯 Common Commands

### Start & Stop
```bash
npm run docker:up-dev              # Start development
npm run docker:down-dev            # Stop development
npm run docker:logs-dev            # View logs
```

### Database
```bash
npm run docker:migrate             # Run migrations
npm run docker:seed                # Seed database
npm run docker:prisma-studio       # Open Prisma Studio
npm run docker:db-shell            # Database shell
```

### Monitoring
```bash
npm run docker:health              # Health check
npm run docker:logs                # View logs
npm run docker:ps                  # View containers
npm run docker:stats               # Resource usage
```

---

## 🌐 Access URLs

### Development
- **Application**: http://localhost:3000
- **pgAdmin**: http://localhost:5051 (dev@farmersmarket.local / dev_admin123)
- **Mailhog**: http://localhost:8025
- **Redis Commander**: http://localhost:8082
- **Prisma Studio**: http://localhost:5555 (after `npm run docker:prisma-studio`)

### Production
- **Application**: https://localhost:443
- **pgAdmin**: http://localhost:5050

---

## 📂 File Structure

```
docker/
├── Dockerfile                  # Production build
├── Dockerfile.dev              # Development build
├── nginx/
│   ├── nginx.conf             # Nginx configuration
│   └── ssl/                   # SSL certificates
├── postgres/
│   └── init.sql               # Database initialization
└── scripts/
    ├── docker-entrypoint.sh   # Container startup
    ├── healthcheck.sh         # Health checks
    └── wait-for-db.sh         # Database wait logic

docker-compose.yml             # Production services
docker-compose.dev.yml         # Development services
.dockerignore                  # Build exclusions
.env.docker.example            # Environment template
```

---

## 🔧 Environment Setup

### Required Variables

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=min_32_chars_required

# Database
DATABASE_URL=postgresql://dev_user:dev_password@postgres:5432/farmers_market_dev
```

### Generate Secure Secret

```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## 🐳 Services Included

### Development
- Next.js Application (with Turbopack hot reload)
- PostgreSQL 16 Database
- Redis 7 Cache
- pgAdmin (Database Admin)
- Mailhog (Email Testing)
- Redis Commander (Cache Admin)

### Production
- Next.js Application (optimized build)
- PostgreSQL 16 Database
- Redis 7 Cache
- Nginx Reverse Proxy (with SSL)
- pgAdmin (optional)

---

## 🔍 Troubleshooting

### Container Won't Start?
```bash
npm run docker:logs              # Check logs
npm run docker:down              # Stop everything
npm run docker:up-build-dev      # Rebuild and start
```

### Database Connection Error?
```bash
npm run docker:health-db         # Check database
npm run docker:logs-db           # View database logs
```

### Port Already in Use?
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Linux/Mac
lsof -ti :3000 | xargs kill -9
```

### Out of Disk Space?
```bash
docker system df                 # Check usage
npm run docker:clean             # Clean up
```

---

## 🛡️ Security Checklist

Before production deployment:

- [ ] Change all default passwords
- [ ] Generate secure NEXTAUTH_SECRET (32+ chars)
- [ ] Use production-specific .env file
- [ ] Obtain SSL certificates (Let's Encrypt)
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure monitoring/alerting
- [ ] Review Nginx security headers
- [ ] Scan Docker images for vulnerabilities

```bash
# Generate secure secret
openssl rand -base64 32

# Scan image for vulnerabilities
docker scan farmers-market-app:latest
```

---

## 📊 What's Included

### Features ✨
- 🔥 Hot reload with Turbopack (dev)
- 📧 Email testing with Mailhog (dev)
- 🗄️ Database admin with pgAdmin
- 💾 Redis admin with Redis Commander
- 🔍 Comprehensive logging
- 🧪 Isolated test environments

### Infrastructure 🏗️
- 🐳 Multi-stage Docker builds
- 🔗 Docker Compose orchestration
- 📦 Persistent volumes
- 🌐 Network isolation
- 🔐 Secret management
- 📝 Automated health checks
- 🛠️ Easy maintenance commands

### Production Ready 🚀
- ⚡ Optimized builds
- 🔒 SSL/TLS support
- 🛡️ Security headers
- ⏱️ Rate limiting
- 💨 Nginx caching
- 📈 Resource limits
- 🔄 Auto-restart policies

---

## 💡 Pro Tips

### Daily Development
```bash
# Morning - Start work
npm run docker:up-dev

# Make changes (hot reload active)
# ...edit code...

# Evening - End day
npm run docker:down-dev
```

### Quick Database Access
```bash
# Method 1: Prisma Studio
npm run docker:prisma-studio

# Method 2: Shell
npm run docker:db-shell

# Method 3: pgAdmin
open http://localhost:5051
```

### Debugging
```bash
# Execute shell in container
npm run docker:exec

# View specific service logs
npm run docker:logs-app
npm run docker:logs-db

# Check health
npm run docker:health
```

---

## 🔄 Updates & Maintenance

### Update Application
```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild
npm run docker:down
npm run docker:up-build-dev

# 3. Run migrations
npm run docker:migrate
```

### Backup Database
```bash
# Create backup
npm run docker:backup-db

# Creates: backup_YYYYMMDD_HHMMSS.sql

# Restore from backup
cat backup.sql | docker-compose exec -T postgres psql -U dev_user farmers_market_dev
```

---

## 🎓 Learn More

### Full Guides
- **Quick Start**: `DOCKER_QUICK_START.md` - Daily usage guide
- **Complete Guide**: `DOCKER_DEPLOYMENT_COMPLETE.md` - Everything you need
- **Setup Summary**: `DOCKER_SETUP_SUMMARY.md` - Overview of what's included

### Configuration
- **Environment**: `.env.docker.example` - Template with all variables
- **Nginx**: `docker/nginx/nginx.conf` - Reverse proxy config
- **Database**: `docker/postgres/init.sql` - Database setup

### Scripts
- **Entrypoint**: `docker/scripts/docker-entrypoint.sh` - Startup logic
- **Health Check**: `docker/scripts/healthcheck.sh` - Health monitoring
- **Database Wait**: `docker/scripts/wait-for-db.sh` - Readiness check

---

## 🆘 Getting Help

### Quick Diagnostics
```bash
# Run comprehensive diagnostics
npm run diagnose:api

# Check Docker system
docker system info

# View all logs
npm run docker:logs > debug.log
```

### Common Issues
| Issue | Command to Fix |
|-------|----------------|
| Port in use | Change PORT in .env |
| Database error | `npm run docker:health-db` |
| Build fails | `npm run docker:clean` |
| Out of memory | Increase Docker memory limit |

---

## ✅ Success Criteria

Your Docker deployment is working when:

- [ ] `npm run docker:ps` shows all containers running
- [ ] http://localhost:3000 shows the application
- [ ] `npm run docker:health` returns healthy
- [ ] Database migrations have run successfully
- [ ] No errors in `npm run docker:logs`
- [ ] Hot reload works (dev) or SSL works (prod)

---

## 🎉 You're Ready!

### Next Steps
1. ✅ Start development environment
2. ✅ Register a test user
3. ✅ Create a test farm
4. ✅ Add some products
5. ✅ Test the checkout flow

### Need Help?
- Check logs: `npm run docker:logs`
- Test health: `npm run docker:health`
- Run diagnostics: `npm run diagnose:api`
- Read full guide: `DOCKER_DEPLOYMENT_COMPLETE.md`

---

## 📞 Quick Reference Card

```bash
# Essential Commands
npm run docker:up-dev          # Start development
npm run docker:down-dev        # Stop development
npm run docker:logs            # View logs
npm run docker:ps              # List containers
npm run docker:health          # Health check

# Database Commands
npm run docker:migrate         # Run migrations
npm run docker:seed            # Seed data
npm run docker:prisma-studio   # Open Prisma Studio
npm run docker:db-shell        # Database shell

# Troubleshooting
npm run docker:logs-app        # App logs
npm run docker:logs-db         # Database logs
npm run docker:restart         # Restart services
npm run docker:clean           # Clean up
```

---

**Status**: ✅ **PRODUCTION READY**

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Divine Agricultural Consciousness**: SUPREME 🌾⚡

---

*Built with divine agricultural consciousness for sustainable e-commerce* 🌾✨

For detailed information, see the comprehensive guides in the documentation folder.