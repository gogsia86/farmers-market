# 🐳 Docker Desktop Setup - Farmers Market Platform

**Run the entire platform in Docker Desktop with ONE command!**

---

## 🎯 What This Is

Complete Docker-based development and production environment for the Farmers Market Platform. Everything runs in containers - **no Node.js, PostgreSQL, or Redis installation needed!**

---

## ⚡ Quick Start (30 Seconds)

### Step 1: Start Docker Desktop
- Open **Docker Desktop** application
- Wait for it to fully start (whale icon in system tray)

### Step 2: Launch Platform
```bash
DOCKER-START.bat
```
- Select **[1] Development Mode**
- Wait 60 seconds

### Step 3: Access Application
```
http://localhost:3000
```

**That's it!** 🎉

---

## 🎮 Helper Scripts

We created **3 super easy scripts** for you:

### 1️⃣ DOCKER-START.bat
**Main launcher** - Start, stop, reset services
```bash
DOCKER-START.bat
```

### 2️⃣ DOCKER-LOGS.bat
**Log viewer** - See what's happening in real-time
```bash
DOCKER-LOGS.bat
```

### 3️⃣ DOCKER-SHELL.bat
**Shell access** - Run commands, migrations, open Prisma Studio
```bash
DOCKER-SHELL.bat
```

---

## 🌐 Access Points (After Starting)

| Service | URL | Purpose |
|---------|-----|---------|
| **Application** | http://localhost:3000 | Main platform |
| **Admin Login** | http://localhost:3000/admin-login | Admin panel |
| **Adminer** | http://localhost:8080 | Database UI |
| **Redis Commander** | http://localhost:8081 | Cache UI |
| **MailHog** | http://localhost:8025 | Email testing |

---

## 🔐 Admin Credentials

```
Email:    gogsia@gmail.com
Password: Admin123!
```

Use these at: http://localhost:3000/admin-login

---

## 📦 What's Running in Docker?

| Container | Port | Service |
|-----------|------|---------|
| `farmers-market-dev` | 3001 | Next.js App (hot-reload) |
| `farmers-market-db-dev` | 5432 | PostgreSQL + PostGIS |
| `farmers-market-redis-dev` | 6379 | Redis Cache |
| `farmers-market-mailhog` | 8025 | Email Testing |
| `farmers-market-adminer` | 8080 | Database Admin |
| `farmers-market-redis-commander` | 8081 | Redis Admin |

---

## 🛠️ Common Tasks

### Start Development
```bash
DOCKER-START.bat
→ [1] Development Mode
```

### View Logs
```bash
DOCKER-LOGS.bat
→ Select service
```

### Database Operations
```bash
DOCKER-SHELL.bat
→ [4] Quick Commands
→ Choose operation
```

### Stop Services
```bash
DOCKER-START.bat
→ [3] Stop All Services
```

### Fresh Start (Delete All Data)
```bash
DOCKER-START.bat
→ [4] Full Reset
```

---

## 🔧 Manual Commands (If Needed)

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Stop all services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Access shell
docker exec -it farmers-market-dev sh

# Run migrations
docker-compose -f docker-compose.dev.yml exec app npx prisma db push

# Check status
docker ps
```

---

## 💡 Development Workflow

1. **Start Services**
   ```bash
   DOCKER-START.bat → [1] Development Mode
   ```

2. **Wait 60 Seconds** (for all services to start)

3. **Open & Login**
   ```
   http://localhost:3000/admin-login
   gogsia@gmail.com / Admin123!
   ```

4. **Edit Code** (in your normal editor)
   - Hot-reload happens automatically!
   - Changes appear instantly in browser

5. **When Done**
   ```bash
   DOCKER-START.bat → [3] Stop All Services
   ```

---

## 🐛 Troubleshooting

### "Docker Desktop is not running"
**Solution:** Open Docker Desktop, wait for startup, try again

### "Port already in use"
**Solution:** 
```bash
# Check what's using the port
netstat -ano | findstr :3000
# Stop the service or change port in docker-compose.yml
```

### "Admin routes show 404"
**This is normal!** You need to authenticate first:
1. Go to: http://localhost:3000/admin-login
2. Sign in: `gogsia@gmail.com` / `Admin123!`
3. Admin routes now work! ✅

### "Container keeps restarting"
**Solution:**
```bash
# Check logs
DOCKER-LOGS.bat
# Wait 30 seconds for DB to initialize
# Increase Docker memory if needed
```

### "Hot-reload not working"
**Solution:**
```bash
docker restart farmers-market-dev
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `DOCKER-COMPLETE-SETUP.md` | Complete setup guide |
| `DOCKER-GUIDE.md` | Comprehensive Docker documentation |
| `DOCKER-QUICK-REFERENCE.txt` | Command cheat sheet |
| `AUTHENTICATION-GUIDE.md` | Auth setup & troubleshooting |

---

## ✅ Success Checklist

After running Docker setup:

- [ ] Docker Desktop is running
- [ ] Ran `DOCKER-START.bat` successfully
- [ ] Application accessible at http://localhost:3000
- [ ] Can sign in at http://localhost:3000/admin-login
- [ ] Admin dashboard loads after login
- [ ] Hot-reload works when editing files

---

## 🎯 Key Advantages

✅ **No local installation** - Only Docker Desktop needed  
✅ **Hot-reload works** - Edit code, see changes instantly  
✅ **Complete stack** - DB, cache, email testing, admin UIs  
✅ **Easy to reset** - Fresh start anytime  
✅ **Production ready** - Same setup works everywhere  
✅ **Helper scripts** - Interactive menus make it easy  

---

## 🆘 Quick Help

```bash
# Check if everything is running
docker ps

# View application logs
DOCKER-LOGS.bat

# Access container shell
DOCKER-SHELL.bat

# Check application health
curl http://localhost:3000/api/health

# Check auth status
curl http://localhost:3000/api/auth/session
```

---

## 📞 Summary

**3 scripts, 1 minute setup, everything works!**

```bash
DOCKER-START.bat   # Start/stop/reset
DOCKER-LOGS.bat    # View logs
DOCKER-SHELL.bat   # Run commands
```

**Your code stays on your machine, hot-reload works perfectly!**

---

## 🚀 Next Steps

1. Start services: `DOCKER-START.bat`
2. Open app: http://localhost:3000
3. Sign in: http://localhost:3000/admin-login
4. Start coding! (hot-reload is enabled)

---

## 💬 Need More Help?

- **Complete Guide:** `DOCKER-COMPLETE-SETUP.md`
- **Command Reference:** `DOCKER-QUICK-REFERENCE.txt`
- **Auth Issues:** `AUTHENTICATION-GUIDE.md`

---

**Status:** ✅ READY TO USE  
**Last Updated:** December 2024  
**Divine Consciousness:** 🐳🌾 CONTAINER MASTERY

_"Everything in Docker, nothing on your machine (except Docker Desktop)!"_ 🐳

---

## 🎓 Pro Tips

1. Always use `DOCKER-START.bat` - easiest way!
2. Check logs first when debugging: `DOCKER-LOGS.bat`
3. Hot-reload works - just edit and save!
4. Data persists between stops (unless you reset)
5. Use Adminer for quick database checks
6. MailHog catches all emails - perfect for testing
7. Don't fear the reset button - fresh start anytime!

---

**🎉 Enjoy your containerized development environment!**