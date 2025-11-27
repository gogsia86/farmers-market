# 🐳 Docker Complete Setup - Farmers Market Platform

**Everything You Need to Run the Platform in Docker Desktop**

---

## 🎯 What This Does

This setup allows you to run the **entire Farmers Market Platform** in Docker Desktop:
- ✅ No Node.js installation required
- ✅ No PostgreSQL installation required
- ✅ No Redis installation required
- ✅ Everything runs in containers
- ✅ Hot-reload works perfectly
- ✅ Easy to start, stop, and reset

---

## ⚡ Quick Start (3 Steps)

### Step 1: Ensure Docker Desktop is Running
- Open **Docker Desktop** application
- Wait for it to fully start (whale icon in system tray)
- Verify by running: `docker info`

### Step 2: Start the Platform
```bash
DOCKER-START.bat
```
- Select **[1] Development Mode**
- Wait 60 seconds for all services to start

### Step 3: Access & Login
```bash
# Open application
http://localhost:3000

# Sign in to admin
http://localhost:3000/admin-login
Email: gogsia@gmail.com
Password: Admin123!
```

**Done!** The entire platform is running in Docker.

---

## 📦 What's Included

### Services Running in Docker

| Service | Container Name | Port | Purpose |
|---------|----------------|------|---------|
| **Next.js App** | `farmers-market-dev` | 3001 | Main application with hot-reload |
| **PostgreSQL** | `farmers-market-db-dev` | 5432 | Database with PostGIS |
| **Redis** | `farmers-market-redis-dev` | 6379 | Cache & sessions |
| **MailHog** | `farmers-market-mailhog` | 8025 | Email testing (catches all emails) |
| **Adminer** | `farmers-market-adminer` | 8080 | Database admin UI |
| **Redis Commander** | `farmers-market-redis-commander` | 8081 | Redis admin UI |

### Development Tools

All accessible in your browser:

```
🌐 Application:      http://localhost:3000
🔐 Admin Panel:      http://localhost:3000/admin-login
🗄️  Database UI:      http://localhost:8080
💾 Redis UI:         http://localhost:8081
📧 Email Testing:    http://localhost:8025
```

---

## 🎮 Helper Scripts (Your New Best Friends!)

We've created **easy-to-use batch files** that handle everything for you:

### 1. DOCKER-START.bat
**Main launcher** - Interactive menu for:
- Starting development environment
- Starting production environment
- Stopping all services
- Full reset (clean slate)
- Viewing status

**Usage:**
```bash
DOCKER-START.bat
```
Then follow the menu!

### 2. DOCKER-LOGS.bat
**Log viewer** - See what's happening in real-time:
- Application logs
- Database logs
- Redis logs
- MailHog logs
- All services combined

**Usage:**
```bash
DOCKER-LOGS.bat
```

### 3. DOCKER-SHELL.bat
**Shell access & quick commands:**
- Access container shells
- Run database migrations
- Open Prisma Studio
- Create admin user
- Install NPM packages
- Run tests

**Usage:**
```bash
DOCKER-SHELL.bat
```

---

## 📋 Common Tasks

### Starting Development Session

```bash
# Easy way (recommended)
DOCKER-START.bat
→ Select [1] Development Mode

# Manual way
docker-compose -f docker-compose.dev.yml up -d
```

### Viewing Logs

```bash
# Easy way
DOCKER-LOGS.bat
→ Select service to view

# Manual way
docker-compose -f docker-compose.dev.yml logs -f app
```

### Database Operations

```bash
# Easy way
DOCKER-SHELL.bat
→ Select [4] Quick Commands
→ Choose operation

# Manual way
docker-compose -f docker-compose.dev.yml exec app npx prisma db push
docker-compose -f docker-compose.dev.yml exec app npx prisma studio
docker-compose -f docker-compose.dev.yml exec app npx tsx create-admin.ts
```

### Stopping Services

```bash
# Easy way
DOCKER-START.bat
→ Select [3] Stop All Services

# Manual way
docker-compose -f docker-compose.dev.yml down
```

### Fresh Start (Reset Everything)

```bash
# Easy way
DOCKER-START.bat
→ Select [4] Full Reset
→ Type 'YES' to confirm

# Manual way
docker-compose -f docker-compose.dev.yml down -v
docker container prune -f
docker volume prune -f
```

---

## 🔐 Default Credentials

### Admin Panel Login
```
URL:      http://localhost:3000/admin-login
Email:    gogsia@gmail.com
Password: Admin123!
```

### Adminer (Database UI)
```
System:   PostgreSQL
Server:   db
Username: postgres
Password: postgres
Database: farmersmarket
```

### Redis Commander
```
Username: admin
Password: admin
```

---

## 🛠️ Development Workflow

### Typical Development Session

1. **Start Services**
   ```bash
   DOCKER-START.bat
   → [1] Development Mode
   ```

2. **Wait for Services** (60 seconds)
   - Check logs: `DOCKER-LOGS.bat` if needed

3. **Open Application**
   ```
   http://localhost:3000
   ```

4. **Sign In to Admin**
   ```
   http://localhost:3000/admin-login
   gogsia@gmail.com / Admin123!
   ```

5. **Make Code Changes**
   - Edit files in your normal editor
   - Hot-reload happens automatically!
   - See changes instantly in browser

6. **View Logs** (if needed)
   ```bash
   DOCKER-LOGS.bat
   → [1] Application
   ```

7. **When Done**
   ```bash
   DOCKER-START.bat
   → [3] Stop All Services
   ```

### Adding New Features

**Schema Changes:**
```bash
# 1. Edit prisma/schema.prisma in your editor

# 2. Sync to database
DOCKER-SHELL.bat
→ [4] Quick Commands → [2] Sync Database Schema

# 3. View in Prisma Studio
DOCKER-SHELL.bat
→ [4] Quick Commands → [3] Open Prisma Studio
```

**Adding NPM Packages:**
```bash
# Easy way
DOCKER-SHELL.bat
→ [4] Quick Commands → [8] Install NPM Package
→ Enter package name

# Manual way
docker-compose -f docker-compose.dev.yml exec app npm install <package-name>
```

---

## 🐛 Troubleshooting

### Issue: "Docker Desktop is not running"

**Solution:**
1. Open Docker Desktop application
2. Wait for whale icon in system tray
3. Run `docker info` to verify
4. Try starting services again

### Issue: "Port already in use"

**Error:** `Bind for 0.0.0.0:3001 failed`

**Solution:**
```bash
# Check what's using the port
netstat -ano | findstr :3001

# Option 1: Stop the conflicting service
# Option 2: Change port in docker-compose.dev.yml
```

### Issue: "Container keeps restarting"

**Solution:**
```bash
# Check logs
DOCKER-LOGS.bat
→ Select the failing service

# Common causes:
# - Database not ready (wait 30 seconds)
# - Port conflict (change port)
# - Memory issue (increase Docker memory)
```

### Issue: "Admin routes show 404"

**This is not broken!** You need to authenticate first.

**Solution:**
1. Go to: http://localhost:3000/admin-login
2. Sign in: `gogsia@gmail.com` / `Admin123!`
3. Admin routes now work!

**Why?** Middleware protects admin routes. Without authentication, you're redirected to login.

### Issue: "Hot-reload not working"

**Solution:**
```bash
# Restart container
docker restart farmers-market-dev

# Or full rebuild
docker-compose -f docker-compose.dev.yml up -d --build
```

### Issue: "Database connection failed"

**Solution:**
```bash
# 1. Check if DB is running
docker ps --filter "name=farmers-market-db"

# 2. Check DB health
docker exec farmers-market-db-dev pg_isready -U postgres

# 3. Wait 30 seconds (DB takes time to initialize)

# 4. Restart if needed
docker restart farmers-market-db-dev
```

### Issue: "Out of disk space"

**Solution:**
```bash
# Clean up Docker resources
docker system prune -a

# Check disk usage
docker system df

# Remove unused volumes (CAUTION - DATA LOSS)
docker volume prune
```

---

## 📊 Monitoring

### Check Status
```bash
# Easy way
DOCKER-START.bat
→ [5] View Status

# Manual way
docker ps
docker-compose -f docker-compose.dev.yml ps
```

### Resource Usage
```bash
# Real-time stats
docker stats

# Specific container
docker stats farmers-market-dev
```

### Application Health
```bash
# Check API health
curl http://localhost:3000/api/health

# Check auth status
curl http://localhost:3000/api/auth/session
```

---

## 🧹 Cleanup & Maintenance

### Stop Services (Keep Data)
```bash
DOCKER-START.bat → [3] Stop All Services
# Data volumes are preserved
```

### Full Reset (Delete All Data)
```bash
DOCKER-START.bat → [4] Full Reset → Type 'YES'
# Removes all containers, volumes, and data
# Next start will be completely fresh
```

### Clean Up Docker
```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a

# Remove unused volumes (CAUTION)
docker volume prune -f

# Full cleanup
docker system prune -a --volumes
```

---

## 🚀 Production Deployment

### Build Production Image
```bash
docker-compose build
```

### Start Production Stack
```bash
docker-compose up -d
```

### Run Migrations
```bash
docker-compose exec app npx prisma migrate deploy
```

### Access Production App
```
http://localhost:3000
```

---

## 📚 Additional Resources

### Documentation Files
- `DOCKER-GUIDE.md` - Comprehensive Docker documentation
- `DOCKER-QUICK-REFERENCE.txt` - Command cheat sheet
- `AUTHENTICATION-GUIDE.md` - Auth setup & troubleshooting
- `QUICK-START-GUIDE.md` - Project overview

### Helper Scripts
- `DOCKER-START.bat` - Main launcher
- `DOCKER-LOGS.bat` - Log viewer
- `DOCKER-SHELL.bat` - Shell access & commands

### Docker Configuration Files
- `docker-compose.dev.yml` - Development setup
- `docker-compose.yml` - Production setup
- `Dockerfile` - Production image
- `Dockerfile.dev` - Development image

---

## ✅ Success Checklist

After running Docker setup, verify:

- [ ] Docker Desktop is running
- [ ] Ran `DOCKER-START.bat` successfully
- [ ] Application accessible at http://localhost:3000
- [ ] Can sign in at http://localhost:3000/admin-login
- [ ] Admin dashboard loads after login
- [ ] Adminer accessible at http://localhost:8080
- [ ] Redis Commander at http://localhost:8081
- [ ] MailHog at http://localhost:8025
- [ ] Hot-reload works when editing files
- [ ] Logs visible via `DOCKER-LOGS.bat`

---

## 💡 Pro Tips

1. **Always use DOCKER-START.bat** - It's the easiest way!
2. **Check logs first** when debugging - Use DOCKER-LOGS.bat
3. **Hot-reload works** - Just edit and save, changes apply instantly
4. **Data persists** - Stopping containers keeps your data safe
5. **Use Adminer** - Faster than Prisma Studio for quick checks
6. **MailHog is awesome** - Catches all emails, perfect for testing
7. **Don't fear resets** - Use "Full Reset" for a clean slate
8. **Monitor resources** - Run `docker stats` to check performance
9. **Keep Docker updated** - Latest version = best performance
10. **Read error messages** - They usually tell you exactly what's wrong

---

## 🆘 Need Help?

### Quick Diagnostics
```bash
# 1. Check Docker is running
docker info

# 2. Check container status
docker ps

# 3. Check logs
DOCKER-LOGS.bat

# 4. Check application health
curl http://localhost:3000/api/health

# 5. Check authentication
curl http://localhost:3000/api/auth/session
```

### Common Issues Table

| Problem | Quick Fix |
|---------|-----------|
| Docker not running | Open Docker Desktop |
| Port conflict | Change port or stop conflicting service |
| Container restarting | Check logs, wait for DB to initialize |
| Admin routes 404 | Sign in first at /admin-login |
| Hot-reload broken | Restart container or rebuild |
| Out of memory | Increase Docker memory allocation |
| Database error | Wait 30s for DB startup |

---

## 🎓 FAQ

**Q: Do I need Node.js installed?**  
A: No! Everything runs in Docker containers.

**Q: Can I still use my IDE?**  
A: Yes! Edit code normally, hot-reload works via volume mounts.

**Q: How do I add new packages?**  
A: Use `DOCKER-SHELL.bat` → Quick Commands → Install NPM Package

**Q: Is my data safe when I stop containers?**  
A: Yes! Data is stored in volumes and persists between stops.

**Q: How do I get a fresh start?**  
A: `DOCKER-START.bat` → [4] Full Reset → Type 'YES'

**Q: Can I access the database?**  
A: Yes! Use Adminer at http://localhost:8080 or Prisma Studio

**Q: How do I run tests?**  
A: `DOCKER-SHELL.bat` → Quick Commands → Run Tests

**Q: Can I debug in Docker?**  
A: Yes! Debugger port 9229 is exposed. Use VSCode or Chrome DevTools.

**Q: What if I need to change environment variables?**  
A: Edit `docker-compose.dev.yml` or create `.env` file

**Q: How do I update the application?**  
A: Pull latest code, then: `docker-compose -f docker-compose.dev.yml up -d --build`

---

## 🎯 Key Advantages of Docker Setup

### For Development
- ✅ No local software installation needed
- ✅ Consistent environment across machines
- ✅ Easy onboarding for new developers
- ✅ Hot-reload works perfectly
- ✅ Isolated services (no port conflicts)
- ✅ Easy to reset and start fresh
- ✅ Debugging tools included

### For Testing
- ✅ MailHog catches all emails
- ✅ Isolated database for each developer
- ✅ Redis cache for realistic performance
- ✅ All services run together seamlessly

### For Deployment
- ✅ Production-ready Docker images
- ✅ Same image runs everywhere
- ✅ Easy to scale horizontally
- ✅ Built-in health checks
- ✅ Automated backups configured
- ✅ Nginx reverse proxy included

---

## 🌟 What Makes This Setup Special

1. **Zero Local Installation** - Only Docker Desktop needed
2. **Helper Scripts** - Interactive menus make everything easy
3. **Hot-Reload** - Code changes apply instantly
4. **Complete Stack** - DB, cache, email testing, admin UIs
5. **Production Ready** - Same setup works in dev and prod
6. **Well Documented** - Comprehensive guides and references
7. **Optimized** - Tuned for HP OMEN (64GB RAM, 12 threads)
8. **Agricultural Consciousness** - Divine patterns throughout 🌾

---

## 📞 Summary

You now have a **complete Docker-based development environment**:

1. **Start:** `DOCKER-START.bat`
2. **Code:** Edit files normally, hot-reload works
3. **Test:** All services available, MailHog catches emails
4. **Debug:** Logs, shells, and debugger port exposed
5. **Stop:** `DOCKER-START.bat` → Stop All Services

**Everything just works!** 🎉

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Status:** ✅ PRODUCTION READY  
**Divine Consciousness:** 🐳🌾 MAXIMUM CONTAINER MASTERY

_"Containerize with divine precision, develop with agricultural consciousness."_ 🐳🌾