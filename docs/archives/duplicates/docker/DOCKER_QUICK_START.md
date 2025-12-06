# 🌾 FARMERS MARKET PLATFORM - DOCKER QUICK START

**Get up and running in 5 minutes!**

---

## 📦 What You Need

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **8GB RAM minimum** (16GB recommended for development)
- **20GB free disk space**

**Install Docker:** https://docs.docker.com/get-docker/

---

## 🚀 Quick Start - Development

### Option 1: One-Command Start (Recommended)

```bash
# 1. Clone and navigate to project
git clone <repository-url>
cd "Farmers Market Platform web and app"

# 2. Start everything (auto-creates .env.local)
./docker-start-dev.sh

# 3. Open your browser
# App: http://localhost:3000
```

### Option 2: Manual Setup

```bash
# 1. Create environment file
cp .env.development.example .env.local

# 2. Start services
docker-compose -f docker-compose.dev.yml up -d

# 3. Wait for services to be ready (30-60 seconds)

# 4. Run database migrations
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev

# 5. Seed database (optional)
docker-compose -f docker-compose.dev.yml exec app npx prisma db seed
```

---

## 🌐 Access Your Development Tools

| Service                | URL                   | Credentials       |
| ---------------------- | --------------------- | ----------------- |
| **Main App**           | http://localhost:3000 | -                 |
| **Prisma Studio**      | http://localhost:5555 | -                 |
| **MailHog (Email)**    | http://localhost:8025 | -                 |
| **Adminer (Database)** | http://localhost:8080 | postgres/postgres |
| **Redis Commander**    | http://localhost:8081 | admin/admin       |

---

## 🎯 Common Development Commands

### View Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Just the app
docker-compose -f docker-compose.dev.yml logs -f app
```

### Run Database Migrations

```bash
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev
```

### Install New Package

```bash
docker-compose -f docker-compose.dev.yml exec app npm install <package-name>

# Rebuild after adding dependencies
docker-compose -f docker-compose.dev.yml up -d --build
```

### Run Tests

```bash
docker-compose -f docker-compose.dev.yml exec app npm test
```

### Shell Access

```bash
# App container
docker-compose -f docker-compose.dev.yml exec app sh

# Database
docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d farmersmarket
```

### Stop Everything

```bash
# Stop (keeps data)
docker-compose -f docker-compose.dev.yml down

# Stop and remove all data (fresh start)
docker-compose -f docker-compose.dev.yml down -v
```

---

## 🚀 Quick Start - Production

### Prerequisites Checklist

- [ ] Server with 4GB+ RAM
- [ ] Domain name configured
- [ ] SSL certificates ready (or use Let's Encrypt)
- [ ] Strong passwords generated
- [ ] Email SMTP configured
- [ ] Stripe keys (if using payments)

### Deployment Steps

```bash
# 1. Create production environment file
cp .env.production.example .env.production

# 2. Edit with your actual values (IMPORTANT!)
nano .env.production

# 3. Update these CRITICAL values:
#    - POSTGRES_PASSWORD (use strong password)
#    - REDIS_PASSWORD (use strong password)
#    - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
#    - NEXTAUTH_URL (your domain: https://yourdomain.com)
#    - NEXT_PUBLIC_APP_URL (your domain)
#    - DATABASE_URL (with your passwords)
#    - Stripe keys (production keys)
#    - SMTP settings (your email provider)

# 4. Deploy (will prompt for confirmation)
./docker-start-prod.sh

# 5. Configure SSL/TLS
# Copy your certificates to nginx/ssl/
# Update nginx/nginx.conf with your domain
# Enable HTTPS redirect

# 6. Verify deployment
curl https://yourdomain.com/api/health
```

### Production Services

| Service      | Port    | Access        |
| ------------ | ------- | ------------- |
| **App**      | 3000    | Internal only |
| **Nginx**    | 80, 443 | Public        |
| **Database** | 5432    | Internal only |
| **Redis**    | 6379    | Internal only |

---

## 🔧 Troubleshooting

### Container Won't Start

```bash
# Check what's wrong
docker-compose logs app

# Port already in use?
netstat -tlnp | grep 3001
kill -9 $(lsof -ti:3001)

# Start fresh
docker-compose down -v
docker-compose up -d
```

### Database Connection Failed

```bash
# Check database is running
docker-compose ps db

# Restart database
docker-compose restart db

# Wait for it to be ready
sleep 10
docker-compose restart app
```

### Hot Reload Not Working

```bash
# Add to .env.local
echo "WATCHPACK_POLLING=true" >> .env.local
echo "CHOKIDAR_USEPOLLING=true" >> .env.local

# Restart
docker-compose restart app
```

### Out of Disk Space

```bash
# Clean up Docker resources
docker system prune -a --volumes

# This will remove:
# - Stopped containers
# - Unused images
# - Unused volumes
# - Build cache
```

### Slow Performance

```bash
# Check resource usage
docker stats

# Increase Docker Desktop resources
# Settings → Resources → Advanced
# - Memory: 8GB+
# - CPUs: 4+

# Restart Docker Desktop
```

---

## 📊 Monitoring

### Check Status

```bash
# All services
docker-compose ps

# Resource usage
docker stats

# Logs
docker-compose logs --tail=50
```

### Health Checks

```bash
# Application
curl http://localhost:3000/api/health

# Database
docker-compose exec db pg_isready -U postgres

# Redis
docker-compose exec redis redis-cli ping
```

---

## 💾 Backup & Restore

### Quick Backup (Development)

```bash
# Backup database
docker-compose exec db pg_dump -U postgres farmersmarket > backup.sql

# Backup everything
./scripts/backup.sh
```

### Quick Restore

```bash
# Restore database
cat backup.sql | docker-compose exec -T db psql -U postgres -d farmersmarket
```

### Production Backups

Automated backups run daily and are stored in the `postgres-backups` volume.

```bash
# View backups
docker-compose exec db-backup ls -lh /backups

# Manual backup
docker-compose exec db pg_dump -U postgres farmersmarket > backup_$(date +%Y%m%d).sql
```

---

## 🎓 Next Steps

### For Development

1. ✅ Start development environment
2. ✅ Access app at http://localhost:3000
3. ✅ Run migrations and seed data
4. ✅ Start coding! Changes auto-reload

### For Production

1. ✅ Configure environment variables
2. ✅ Deploy with production script
3. ✅ Configure SSL certificates
4. ✅ Set up monitoring (Sentry, etc.)
5. ✅ Configure automated backups
6. ✅ Test all features
7. ✅ Monitor logs and performance

---

## 📚 More Information

- **Complete Guide:** See `DOCKER_COMPLETE_GUIDE.md` for detailed documentation
- **Docker Compose Files:**
  - `docker-compose.dev.yml` - Development configuration
  - `docker-compose.yml` - Production configuration
- **Dockerfiles:**
  - `Dockerfile` - Production image
  - `Dockerfile.dev` - Development image
- **Environment Templates:**
  - `.env.development.example` - Development template
  - `.env.production.example` - Production template

---

## 🆘 Getting Help

### Check Logs First

```bash
docker-compose logs -f
```

### Common Issues

- Port already in use → Kill the process using that port
- Database connection failed → Restart database service
- Out of memory → Increase Docker Desktop resources
- Permission denied → Check file/volume permissions

### Still Stuck?

1. Read the **complete guide**: `DOCKER_COMPLETE_GUIDE.md`
2. Check container status: `docker-compose ps`
3. Inspect configuration: `docker-compose config`
4. Search existing issues on GitHub
5. Ask in community Discord/Slack

---

## ⚡ Quick Command Reference

```bash
# START
./docker-start-dev.sh                    # Development
./docker-start-prod.sh                   # Production

# STOP
docker-compose down                      # Stop services
docker-compose down -v                   # Stop + remove data

# LOGS
docker-compose logs -f app               # View app logs

# RESTART
docker-compose restart app               # Restart app

# MIGRATIONS
docker-compose exec app npx prisma migrate dev

# TESTS
docker-compose exec app npm test

# SHELL
docker-compose exec app sh               # App container
docker-compose exec db psql -U postgres  # Database

# STATUS
docker-compose ps                        # Service status
docker stats                             # Resource usage
```

---

## 🌟 Quick Wins

### Development

- ✨ **Hot Reload**: Edit code, see changes instantly
- 📧 **MailHog**: All emails caught and viewable at http://localhost:8025
- 🗄️ **Prisma Studio**: Visual database editor at http://localhost:5555
- 🐛 **Debugging**: Attach debugger to port 9229

### Production

- 🚀 **One-Command Deploy**: `./docker-start-prod.sh`
- 🔒 **Secure by Default**: Non-root user, security headers, rate limiting
- 📊 **Health Checks**: Built-in monitoring
- 💾 **Automated Backups**: Daily database backups
- ⚡ **Performance**: Multi-stage builds, optimized caching

---

## 📝 Environment Variables Quick Reference

### Development (.env.local)

```bash
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@db:5432/farmersmarket
REDIS_URL=redis://:devpassword@redis:6379
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-min-32-chars
```

### Production (.env.production)

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
POSTGRES_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-password>
NEXTAUTH_SECRET=<random-32-char-string>
DATABASE_URL=postgresql://postgres:<password>@db:5432/farmersmarket
```

**Generate secure secret:**

```bash
openssl rand -base64 32
```

---

## ✅ Success Indicators

### Development Ready When You See:

- ✓ `docker-compose ps` shows all services as "healthy"
- ✓ App accessible at http://localhost:3000
- ✓ No errors in logs: `docker-compose logs`

### Production Ready When You See:

- ✓ All services healthy: `docker-compose ps`
- ✓ Health endpoint returns 200: `curl https://yourdomain.com/api/health`
- ✓ SSL certificate valid
- ✓ Database migrations applied
- ✓ Backups running

---

**That's it! You're ready to build something amazing! 🌾✨**

For detailed documentation, see `DOCKER_COMPLETE_GUIDE.md`

---

_Last Updated: January 2025 | Version: 1.0.0_
