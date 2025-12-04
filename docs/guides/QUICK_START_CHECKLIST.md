# ⚡ Quick Start Checklist
**Farmers Market Platform - 5-Minute Dev Server Setup**

---

## 🚦 Status Check (30 seconds)

Run these commands to verify readiness:

```bash
# Check versions
node -v        # Should be: v22.21.0 or higher
npm -v         # Should be: 10.9.4 or higher

# Check PostgreSQL
psql -U postgres -l | grep farmersmarket

# Check port availability
netstat -ano | findstr :3001 || echo "Port 3001 is FREE ✅"
```

**Results**:
- ✅ Node.js v22.21.0 installed
- ✅ npm v10.9.4 installed
- ⚠️ PostgreSQL: ___ (running/stopped)
- ✅ Port 3001 available

---

## 🔧 Pre-Flight Setup (2 minutes)

### 1. Environment Variables
```bash
# Copy and configure (if not done):
cp .env.example .env.local

# Verify critical variables:
cat .env.local | grep -E "DATABASE_URL|PORT|NEXT_PUBLIC"
```

**Required in `.env.local`**:
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/farmersmarket
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3001
```

### 2. Database Setup
```bash
# Start PostgreSQL (if not running)
# Windows: services.msc → PostgreSQL → Start
# Or: net start postgresql-x64-14

# Verify connection:
psql -U postgres -c "SELECT version();"

# Push schema (if needed):
npm run db:push

# Seed basic data (optional):
npm run db:seed:basic
```

### 3. Dependencies
```bash
# Install (if node_modules missing):
npm install

# Generate Prisma client:
npx prisma generate
```

### 4. Clear Cache (if issues)
```bash
# Remove stale build:
rm -rf .next

# Clear jest cache:
rm -rf .jest-cache
```

---

## 🚀 Start Dev Server (10 seconds)

```bash
# RECOMMENDED: Turbo mode
npm run dev

# Alternative options:
# npm run dev:omen     # HP OMEN optimized (32GB RAM)
# npm run dev:logger   # With debug logging
# npm run dev:safe     # Safe mode with error recovery
```

**Expected Output**:
```
▲ Next.js 16.0.3
- Local:        http://localhost:3001
✓ Ready in 3.2s
✓ Database connection established successfully
```

---

## ✅ Verification (1 minute)

### Browser Check
- [ ] Open: http://localhost:3001
- [ ] Homepage loads (no white screen)
- [ ] Header/navigation visible
- [ ] Search bar present
- [ ] Featured farms section loads
- [ ] No hydration errors in console (F12)

### API Check
```bash
# Quick API tests:
curl http://localhost:3001/api/health
# Expected: {"status":"ok"}

curl http://localhost:3001/api/platform/stats
# Expected: {"farms":X,"products":Y,"orders":Z}
```

### Hot Reload Test
1. Open `src/app/page.tsx`
2. Change any text string
3. Save file (Ctrl+S)
4. Browser updates in 2-3 seconds ✅

---

## 🐛 Common Issues & Quick Fixes

### Issue: Port already in use
```bash
# Solution:
npm run kill-server
# Or:
netstat -ano | findstr :3001
taskkill /PID [PID_NUMBER] /F
```

### Issue: Database connection failed
```bash
# Check if PostgreSQL is running:
psql -U postgres

# If not running (Windows):
net start postgresql-x64-14

# Verify DATABASE_URL in .env.local
```

### Issue: Prisma Client not found
```bash
npx prisma generate
npm run postinstall
```

### Issue: Stale changes not showing
```bash
rm -rf .next
npm run dev
```

### Issue: TypeScript errors blocking
```bash
# TypeScript errors don't block dev server
# But if you want to check:
npm run type-check

# Known issues (safe to ignore for dev):
# - mobile-app/* (22 errors - separate app)
# - orders API parameter naming (4 errors - non-breaking)
```

---

## 🎯 Success Indicators

### ✅ Dev Server is Running When:
- [x] Server console shows "Ready in X seconds"
- [x] No red fatal errors in terminal
- [x] Homepage loads at http://localhost:3001
- [x] Database connection established (or gracefully degraded)
- [x] Hot reload works (file changes appear)
- [x] API endpoints respond (health check passes)

### ⚠️ Known Non-Critical Issues:
- TypeScript warnings in mobile-app (doesn't affect web)
- Some console logs (development mode)
- Initial database retry attempts (normal behavior)

---

## 📊 Latest Features to Test

### New in Latest Build:
1. **Search Autocomplete** - Type in homepage search bar
2. **Platform Stats** - Real-time numbers on homepage
3. **Featured Farms** - Farm cards with images
4. **Repository Layer** - New data access pattern
5. **Monitoring Dashboard** - Visit `/monitoring`

### Quick Feature Tests:
```bash
# Homepage sections:
✓ Hero with search
✓ Featured products
✓ Featured farms
✓ Categories grid
✓ How it works
✓ Testimonials

# Key pages:
✓ /auth/signin - Login page
✓ /marketplace - Browse products
✓ /farms - Farm directory
✓ /cart - Shopping cart
```

---

## 🎊 You're Ready!

If you see this, your dev server is running! 🚀

```
✅ Server: http://localhost:3001
✅ API: http://localhost:3001/api
✅ Database: Connected
✅ Hot Reload: Active
```

### Next Steps:
1. **Start coding** - Changes will auto-reload
2. **Check console** - Monitor for errors
3. **Use API** - Test endpoints via curl/Postman
4. **Run tests** - `npm run test:watch` in another terminal
5. **Monitor quality** - `npm run lint` before committing

---

## 📞 Quick Reference Commands

```bash
# Development
npm run dev                   # Start server (RECOMMENDED)
npm run kill-server           # Stop server
npm run dev:logger            # Debug mode

# Database
npm run db:push               # Sync schema
npm run db:studio             # Open Prisma Studio
npm run db:seed:basic         # Add test data

# Quality
npm run type-check            # Check TypeScript
npm run lint                  # Run linter
npm run test                  # Run tests

# Debugging
rm -rf .next                  # Clear build cache
npx prisma generate           # Regenerate Prisma client
npm install                   # Reinstall dependencies
```

---

## 📚 Full Documentation

For comprehensive analysis, see: **DEV_SERVER_ANALYSIS_CHECKLIST.md**

For project overview: **PROJECT_STATUS.md**

For getting started: **START_HERE.md**

---

**Status**: ✅ READY FOR DEVELOPMENT  
**Version**: 1.0  
**Last Updated**: December 3, 2024

_"Get coding in under 5 minutes!"_ ⚡🌾