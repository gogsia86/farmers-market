# 🌾 FARMERS MARKET PLATFORM - QUICK START GUIDE

## 🚀 STARTING THE DEVELOPMENT SERVER

### ✅ Prerequisites Check

Before starting, verify these services are running:

```bash
docker ps
```

You should see:

- ✅ `farmers-market-db-dev` (PostgreSQL with PostGIS)
- ✅ `farmers-market-redis-dev` (Redis cache)
- ✅ `farmers-market-mailhog` (Email testing)

---

## 🎯 THREE WAYS TO START THE SERVER

### Option 1: Double-Click START.bat (Easiest) ⭐

1. Navigate to project root folder
2. Double-click `START.bat`
3. Wait for the server to start
4. Open browser to `http://localhost:3000`

### Option 2: Run PowerShell Script

```powershell
.\start-dev-simple.ps1
```

### Option 3: Direct NPM Command

```bash
npm run dev:omen
```

Or standard mode:

```bash
npm run dev
```

---

## 🌐 ACCESS YOUR APPLICATION

Once started, open your browser:

### Main Application

```
http://localhost:3000
```

### Development Tools

- **MailHog UI** (Email testing): `http://localhost:8025`
- **Prisma Studio** (Database viewer): Run `npx prisma studio`

### Database Connections

- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

---

## 📊 WHAT YOU'LL SEE

After starting successfully, your terminal will show:

```
✓ Ready in [time]ms
○ Compiling / ...
GET / 200 in [time]ms
```

**Key indicator**: Look for `200` status (not `404`) - this means success! ✅

---

## 🔧 RECENT FIX APPLIED

### Issue Fixed: Middleware Configuration ✅

**Problem:** The app was returning 404 errors because:

- Middleware file was incorrectly named `proxy.ts`
- Function was named `proxy()` instead of `middleware()`

**Solution Applied:**

- ✅ Renamed `src/proxy.ts` → `src/middleware.ts`
- ✅ Renamed function `proxy()` → `middleware()`

This fix enables proper routing and internationalization handling.

---

## 🛠️ TROUBLESHOOTING

### Problem: "ERR_CONNECTION_REFUSED"

**Solution:** The dev server isn't running. Start it using one of the methods above.

### Problem: Docker services not running

```bash
# Start all dev services
docker compose -f docker-compose.dev.yml up -d

# Or start specific services
docker compose -f docker-compose.dev.yml up -d db redis mailhog
```

### Problem: Port 3001 already in use

```bash
# Find the process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID [PID] /F
```

### Problem: "Module not found" errors

```bash
# Reinstall dependencies
npm install

# Regenerate Prisma client
npx prisma generate
```

### Problem: Database connection errors

Check your `.env.local` file has:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmers_market_dev?schema=public"
```

---

## 📁 PROJECT STRUCTURE

```
Farmers Market Platform web and app/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx        # Homepage (root /)
│   │   ├── layout.tsx      # Root layout
│   │   ├── middleware.ts   # ✨ Fixed middleware file
│   │   └── ...
│   ├── components/          # React components
│   ├── lib/                 # Business logic & utilities
│   └── types/               # TypeScript types
├── prisma/                  # Database schema & migrations
├── public/                  # Static assets
├── START.bat               # ⭐ Quick start script
├── start-dev-simple.ps1    # PowerShell start script
├── docker-compose.dev.yml  # Dev services config
└── package.json            # Dependencies & scripts
```

---

## 🎨 HOMEPAGE FEATURES

When you navigate to `http://localhost:3000`, you'll see:

- 🌾 **Hero Section** with search autocomplete
- 🚜 **Featured Farms** grid with real data
- 📊 **Platform Statistics** (real-time)
- 🌱 **Product Categories** navigation
- 🏆 **How It Works** section
- 💬 **Testimonials** from users
- 📞 **Call-to-Action** sections

---

## 🔐 AUTHENTICATION ROUTES

- **Customer Login**: `/login`
- **Customer Signup**: `/signup`
- **Admin Login**: `/admin-login`
- **Farmer Dashboard**: `/farmer-dashboard` (requires auth)
- **Admin Panel**: `/admin` (requires admin role)

---

## 📦 AVAILABLE NPM SCRIPTS

```bash
npm run dev              # Standard dev server (port 3001)
npm run dev:omen         # HP OMEN optimized (32GB memory)
npm run dev:turbo        # Turbopack enabled
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run test             # Run tests
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Run database migrations
```

---

## 🌟 DIVINE DEVELOPMENT TIPS

### 1. Hot Reload is Enabled

Changes to files automatically reload - no server restart needed!

### 2. Turbopack Speed

Using `dev:omen` enables Turbopack for ultra-fast compilation.

### 3. Database Inspection

Use Prisma Studio (`npx prisma studio`) to view/edit database records visually.

### 4. Email Testing

All emails sent in dev mode go to MailHog - check `http://localhost:8025`

### 5. Agricultural Consciousness

The app uses "divine agricultural patterns" - check `.cursorrules` for coding standards.

---

## 🐛 KNOWN ISSUES & SOLUTIONS

### Prisma Client Out of Sync

```bash
npx prisma generate
```

### TypeScript Errors

```bash
npm run type-check
```

### Build Errors

```bash
# Clean build cache
rm -rf .next
npm run build
```

---

## 📚 DOCUMENTATION LOCATIONS

- **Project Instructions**: `.github/instructions/` (16 comprehensive guides)
- **Cursor Rules**: `.cursorrules` (AI coding standards)
- **Docker Deployment**: `DOCKER-SUCCESS-SUMMARY.md`
- **API Documentation**: Check `/api` routes in `src/app/api/`

---

## 🎯 NEXT STEPS

1. ✅ Start the dev server using `START.bat`
2. ✅ Open `http://localhost:3000` in your browser
3. ✅ Explore the homepage and navigation
4. ✅ Try the search functionality
5. ✅ Check MailHog at `http://localhost:8025`
6. ✅ Open Prisma Studio to view database

---

## 💡 NEED HELP?

### Check These Resources:

- `START-HERE.md` - Project overview
- `DEPLOYMENT-QUICK-START.md` - Deployment guide
- `.github/instructions/` - Comprehensive coding guides
- Docker services: `docker compose -f docker-compose.dev.yml logs`

### Common Commands:

```bash
# View logs for all services
docker compose -f docker-compose.dev.yml logs -f

# Restart a specific service
docker compose -f docker-compose.dev.yml restart db

# Stop all services
docker compose -f docker-compose.dev.yml down

# View app logs (when running)
npm run dev:omen 2>&1 | tee dev.log
```

---

## ✨ SUCCESS INDICATORS

You know everything is working when:

- ✅ Browser shows the homepage (not 404)
- ✅ Search functionality works
- ✅ No console errors in browser DevTools
- ✅ Terminal shows `GET / 200` responses
- ✅ Docker services all show "healthy" status
- ✅ Database connections work (check Prisma Studio)

---

**Happy Coding! 🌾⚡**

_"Code with agricultural consciousness, architect with divine precision."_

---

**Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Status**: FULLY OPERATIONAL
