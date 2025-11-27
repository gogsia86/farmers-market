# 🚀 QUICK START GUIDE - Farmers Market Platform

**Divine Agricultural E-Commerce Platform - Get Running in 5 Minutes**

**Last Updated:** January 2025  
**Version:** 3.0 - Consolidated Edition  
**Status:** ✅ READY TO USE

---

## 📋 TABLE OF CONTENTS

- [Prerequisites](#-prerequisites)
- [5-Minute Local Setup](#-5-minute-local-setup)
- [Docker Quick Start](#-docker-quick-start)
- [Vercel Quick Start](#-vercel-quick-start)
- [Verification Steps](#-verification-steps)
- [Common Issues](#-common-issues)
- [Next Steps](#-next-steps)
- [Platform-Specific Guides](#-platform-specific-guides)

---

## ⚡ PREREQUISITES

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| **Node.js** | 20.x or higher | https://nodejs.org/ |
| **npm** | 10.x or higher | (included with Node.js) |
| **Git** | Latest | https://git-scm.com/ |

### Optional (Choose One)

**Option A: Local Database**
- **PostgreSQL** 15+ | https://www.postgresql.org/download/

**Option B: Docker (Recommended)**
- **Docker Desktop** Latest | https://docs.docker.com/desktop/

**Option C: Managed Database**
- Neon (https://neon.tech) - Free tier available
- Supabase (https://supabase.com) - Free tier available
- Vercel Postgres - Integrated with Vercel

---

## 🏃 5-MINUTE LOCAL SETUP

### Step 1: Clone Repository (30 seconds)

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/farmers-market-platform.git
cd farmers-market-platform

# Or if you already have it
cd farmers-market-platform
git pull origin main
```

### Step 2: Install Dependencies (2 minutes)

```bash
# Install all packages
npm install

# This installs:
# - Next.js 16
# - React 18
# - Prisma ORM
# - NextAuth v5
# - Testing tools
# - And all dependencies (~1,200+ packages)
```

**Expected output:**
```
added 1200 packages in 2m
```

### Step 3: Configure Environment (1 minute)

```bash
# Copy environment template
cp .env.example .env.local

# The defaults work out of the box for local development (SQLite)!
# For full configuration options, see: docs/deployment/ENV-SETUP-GUIDE.md
```

**Quick start (uses defaults):**

```env
# No changes needed! The defaults in .env.example work immediately.
# Uses SQLite database: file:./dev.db

# Option B: Neon (serverless)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/farmersmarket?sslmode=require"

# Option C: Supabase
DATABASE_URL="postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32

# Optional but recommended
REDIS_URL="redis://localhost:6379"  # For caching
```

**Generate NEXTAUTH_SECRET:**

```bash
# Mac/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Node.js (any platform)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 4: Setup Database (1 minute)

```bash
# Generate Prisma Client
npx prisma generate

# Push database schema (creates all tables)
npx prisma db push

# Seed with sample data (optional but recommended)
npx prisma db seed
```

**Expected output:**
```
✓ Generated Prisma Client
✓ Database schema pushed successfully
✓ Seeded 10 farms, 50 products, 5 users
```

### Step 5: Start Development Server (30 seconds)

```bash
# Start Next.js development server
npm run dev

# Server starts on http://localhost:3000
```

**Expected output:**
```
▲ Next.js 16.0.3
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000

✓ Ready in 2.1s
```

### 🎉 SUCCESS!

Open your browser: **http://localhost:3000**

You should see:
- ✅ Homepage loads
- ✅ Product listings appear
- ✅ Navigation works
- ✅ No console errors

---

## 🐳 DOCKER QUICK START

**Best for:** No local setup, everything in containers

### Step 1: Install Docker Desktop (5 minutes)

Download and install Docker Desktop:
- **Windows/Mac:** https://docs.docker.com/desktop/
- **Linux:** https://docs.docker.com/engine/install/

Start Docker Desktop and wait for it to fully start (whale icon turns green).

### Step 2: Clone Repository

```bash
git clone https://github.com/YOUR-USERNAME/farmers-market-platform.git
cd farmers-market-platform
```

### Step 3: Start with Helper Script

**Windows:**
```bash
DOCKER-START.bat
# Select [1] Development Mode
```

**Mac/Linux:**
```bash
./docker-start-dev.sh
# Select [1] Development Mode
```

### Step 4: Wait for Services (60 seconds)

The script will:
1. Start PostgreSQL database
2. Start Redis cache
3. Start Next.js app
4. Start development tools (Adminer, MailHog, etc.)

### Step 5: Access Application

**Main Application:**
- http://localhost:3000

**Development Tools:**
- http://localhost:8080 - Adminer (Database UI)
- http://localhost:8081 - Redis Commander (Cache UI)
- http://localhost:8025 - MailHog (Email testing)

**Admin Login:**
- URL: http://localhost:3000/admin-login
- Email: `gogsia@gmail.com`
- Password: `Admin123!`

### Docker Commands

```bash
# View logs
DOCKER-LOGS.bat  # Windows
./docker-logs.sh  # Mac/Linux

# Stop services
docker-compose -f docker-compose.dev.yml down

# Restart services
docker-compose -f docker-compose.dev.yml restart

# Fresh start (deletes all data)
docker-compose -f docker-compose.dev.yml down -v
DOCKER-START.bat  # or ./docker-start-dev.sh
```

---

## ☁️ VERCEL QUICK START

**Best for:** Cloud deployment, production-ready

### Step 1: Prerequisites

- GitHub account
- Vercel account (https://vercel.com - free tier available)

### Step 2: Push to GitHub

```bash
# Create repository on GitHub: https://github.com/new

# Push code
git remote add origin https://github.com/YOUR-USERNAME/farmers-market-platform.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Visit https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your repository
4. Framework: **Next.js** (auto-detected)
5. Click **"Deploy"**

⚠️ **First deployment will fail** - environment variables needed

### Step 4: Configure Database

**Option A: Vercel Postgres (Easiest)**
1. Dashboard → Storage → Create Database → Postgres
2. Automatic environment variable integration

**Option B: Neon (Recommended)**
1. Sign up: https://neon.tech
2. Create project and database
3. Copy connection string
4. Add to Vercel environment variables

### Step 5: Add Environment Variables

Vercel Dashboard → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-project.vercel.app
AUTH_TRUST_HOST=true
```

### Step 6: Redeploy

1. Go to **Deployments** tab
2. Click latest deployment → **⋮** → **Redeploy**
3. Wait 2-3 minutes
4. ✅ Live at: https://your-project.vercel.app

### Step 7: Run Migrations

```bash
# Install Vercel CLI
npm install -g vercel

# Link to project
vercel link

# Pull environment variables
vercel env pull

# Run migrations
npx prisma migrate deploy
```

---

## ✅ VERIFICATION STEPS

### 1. Application Health

```bash
# Test homepage
curl http://localhost:3000

# Test API health endpoint
curl http://localhost:3000/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Test database connection
curl http://localhost:3000/api/health/db
# Expected: {"database":"connected"}
```

### 2. Run Tests

```bash
# All tests
npm test

# Expected output:
# Test Suites: 414 passed, 414 total
# Tests:       414 passed, 414 total
# Time:        7.72 s

# Type check
npm run type-check
# Expected: No errors

# Linting
npm run lint
# Expected: No errors
```

### 3. Build Verification

```bash
# Production build
npm run build

# Expected output:
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# ✓ Creating an optimized production build
# ✓ Collecting page data
# Route (app)                              Size     First Load JS
# ├ ○ /                                    1.5 kB          85 kB
# └ ... (more routes)
```

### 4. Manual Checks

Visit http://localhost:3000 and verify:

- [ ] Homepage loads without errors
- [ ] Navigation menu works
- [ ] Product listings display (if seeded)
- [ ] Search functionality works
- [ ] Admin login accessible (/admin-login)
- [ ] Database queries succeed
- [ ] No console errors in browser DevTools
- [ ] Hot-reload works (edit a file and save)

---

## 🆘 COMMON ISSUES

### Issue: Port 3000 Already in Use

**Solution:**

```bash
# Find what's using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Issue: Database Connection Failed

**Error:** `Can't reach database server`

**Solutions:**

```bash
# 1. Check PostgreSQL is running
# Mac: brew services list
# Windows: Services → PostgreSQL

# 2. Verify connection string
echo $DATABASE_URL  # Mac/Linux
echo %DATABASE_URL%  # Windows

# 3. Test connection
psql -h localhost -U postgres -d farmersmarket

# 4. Use Docker database instead
docker-compose -f docker-compose.dev.yml up -d db
```

### Issue: Module Not Found Errors

**Solution:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Issue: Prisma Client Not Generated

**Error:** `@prisma/client did not initialize yet`

**Solution:**

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Restart dev server
npm run dev
```

### Issue: Hot Reload Not Working

**Solutions:**

```bash
# 1. Restart dev server
# Ctrl+C to stop, then:
npm run dev

# 2. Clear Next.js cache
rm -rf .next

# 3. Check file watcher limits (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 4. Use polling (slower but works)
CHOKIDAR_USEPOLLING=true npm run dev
```

### Issue: Environment Variables Not Loading

**Reference:** `docs/deployment/ENV-SETUP-GUIDE.md` for comprehensive troubleshooting

**Solution:**

```bash
# 1. Check file name (must be .env.local for development)
ls -la .env*

# 2. Restart dev server (required after env changes)
npm run dev

# 3. Verify variables are loaded
# Add to any page:
console.log('DB URL:', process.env.DATABASE_URL?.substring(0, 20))

# 4. For Vercel: Check Settings → Environment Variables
```

---

## 🎯 NEXT STEPS

### For Development

1. **Explore the codebase:**
   ```bash
   src/
   ├── app/          # Next.js App Router (pages, layouts, API)
   ├── components/   # React components
   ├── lib/          # Core business logic
   └── types/        # TypeScript definitions
   ```

2. **Read documentation:**
   - [Development Guide](docs/DEVELOPMENT_GUIDE.md)
   - [Quick Reference](docs/QUICK-REFERENCE.md)
   - [API Documentation](docs/API_DOCUMENTATION.md)
   - [Divine Instructions](.github/instructions/)

3. **Setup development tools:**
   ```bash
   # Open Prisma Studio (Database GUI)
   npx prisma studio
   # Access: http://localhost:5555

   # Enable VS Code extensions (recommended)
   # - Prisma
   # - ESLint
   # - Prettier
   # - Tailwind CSS IntelliSense
   ```

4. **Start coding:**
   - Create feature branch: `git checkout -b feature/your-feature`
   - Make changes (hot-reload automatic)
   - Run tests: `npm test`
   - Commit: `git commit -m "feat: your feature"`
   - Push: `git push origin feature/your-feature`

### For Deployment

1. **Choose platform:**
   - **Vercel** (recommended for Next.js)
   - **Docker** (self-hosted)
   - **AWS/Azure** (enterprise)

2. **Read deployment guide:**
   - [Deployment Complete Guide](docs/deployment/DEPLOYMENT-COMPLETE.md)
   - [Docker Complete Guide](docs/deployment/DOCKER-COMPLETE-GUIDE.md)

3. **Configure production environment:**
   - Set strong secrets
   - Use managed database
   - Enable monitoring (Sentry)
   - Setup automated backups

4. **Deploy:**
   - Follow platform-specific instructions
   - Run migrations
   - Verify deployment
   - Monitor for errors

---

## 📚 PLATFORM-SPECIFIC GUIDES

### Docker Complete Setup
- **Guide:** [docs/deployment/DOCKER-COMPLETE-GUIDE.md](docs/deployment/DOCKER-COMPLETE-GUIDE.md)
- **Topics:** Development, production, Docker Hub, troubleshooting

### Vercel Deployment
- **Guide:** [docs/deployment/DEPLOYMENT-COMPLETE.md](docs/deployment/DEPLOYMENT-COMPLETE.md)
- **Topics:** Environment setup, database options, custom domains

### Local Development
- **Guide:** [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md)
- **Topics:** Architecture, coding standards, testing, workflows

### Performance Optimization
- **Guide:** [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md)
- **Topics:** HP OMEN optimization, caching, build performance

---

## 💡 PRO TIPS

### Speed Up Development

```bash
# Use Turbopack (faster hot-reload)
npm run dev:turbo

# Skip telemetry
export NEXT_TELEMETRY_DISABLED=1

# Use aliases (add to shell config)
alias dev='npm run dev'
alias test='npm test'
alias build='npm run build'
```

### Database Management

```bash
# Open Prisma Studio (GUI)
npx prisma studio

# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# View database in terminal
docker exec -it farmers-market-db psql -U postgres -d farmersmarket
```

### Quick Health Check

```bash
# One-liner to check everything
npm run type-check && npm test && npm run build && curl http://localhost:3000/api/health
```

---

## 📊 EXPECTED PERFORMANCE

### Development
- **First install:** 2-3 minutes
- **Dev server startup:** 2-3 seconds
- **Hot reload:** < 1 second
- **Test suite:** 5-7 seconds

### Production
- **Build time:** 35-45 seconds
- **Page load (cold start):** < 2 seconds
- **Page load (cached):** < 500ms
- **API response:** < 100ms

---

## 🎓 LEARNING PATH

### Beginner (Week 1)
1. Complete this Quick Start guide
2. Explore homepage and admin panel
3. Read [README.md](README.md)
4. Browse codebase structure
5. Make small UI changes

### Intermediate (Week 2-4)
1. Read [Development Guide](docs/DEVELOPMENT_GUIDE.md)
2. Create new API endpoint
3. Add new React component
4. Write tests for your code
5. Deploy to Vercel

### Advanced (Month 2+)
1. Study [Divine Instructions](.github/instructions/)
2. Implement new feature end-to-end
3. Optimize database queries
4. Setup CI/CD pipeline
5. Contribute to architecture

---

## 🆘 GETTING HELP

### Documentation
- **Quick Reference:** [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) - Daily commands
- **Documentation Index:** [docs/DOCUMENTATION-INDEX.md](docs/DOCUMENTATION-INDEX.md) - All docs
- **API Docs:** [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) - API reference

### Troubleshooting
- Check [Common Issues](#-common-issues) above
- View logs: `npm run dev` (console output)
- Search GitHub Issues
- Check Sentry (if configured)

### Community
- GitHub Discussions
- Team Slack/Discord
- Stack Overflow (tag: farmers-market-platform)

---

## ✅ SUCCESS CHECKLIST

After completing Quick Start:

- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Environment configured (`.env.local`) - See `docs/deployment/ENV-SETUP-GUIDE.md`
- [ ] Database setup (`npx prisma db push`)
- [ ] Dev server running (`npm run dev`)
- [ ] Homepage accessible (http://localhost:3000)
- [ ] Tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Hot-reload working
- [ ] No console errors

**All checked?** 🎉 **You're ready to develop!**

---

**Status:** ✅ READY FOR DEVELOPMENT  
**Time to Complete:** 5-10 minutes  
**Support:** Full documentation available  
**Next:** [Development Guide](docs/DEVELOPMENT_GUIDE.md)

_"Fast setup, faster development, divine agricultural consciousness."_ ⚡🌾

---

**Built with 💚 by farmers, for farmers, optimized for instant productivity**