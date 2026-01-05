# 🚀 Quick Start: Repository Cleanup & Docker Restart

## Farmers Market Platform - 5-Minute Execution Guide

**Last Updated**: January 2025  
**Estimated Time**: 5-10 minutes  
**Risk Level**: Low (with git backup)

---

## ⚡ FASTEST PATH (One Command)

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run master cleanup script (interactive)
./scripts/cleanup-and-restart.sh
```

**That's it!** The script will:

1. ✅ Create git safety branch
2. ✅ Organize 100+ docs into folders
3. ✅ Remove backup files
4. ✅ Clean build caches
5. ✅ Stop and clean Docker
6. ✅ Restart Docker environment
7. ✅ Run database migrations

---

## 🎯 STEP-BY-STEP (Manual Control)

### 1. Prepare (1 minute)

```bash
# Commit current work
git add -A
git commit -m "Pre-cleanup checkpoint"

# Create backup branch
git branch backup-before-cleanup

# Make scripts executable
chmod +x scripts/*.sh
```

### 2. Clean Documentation (2 minutes)

```bash
# Organize 100+ MD files into structured folders
./scripts/cleanup-docs.sh
```

**Result**:

- Root directory: 6 essential MD files only
- docs/ directory: Organized by purpose
- docs/archive/: Historical reports preserved

### 3. Remove Backups (1 minute)

```bash
# Remove backup files (will prompt for confirmation)
./scripts/remove-backups.sh
```

**Result**:

- All _.backup_ files removed
- All \*.old files removed
- Backup directories removed
- Clean source tree

### 4. Restart Docker (3 minutes)

```bash
# Stop all containers
docker-compose down -v

# Development environment
docker-compose -f docker-compose.dev.yml up --build -d

# OR Production environment
docker-compose up --build -d

# Wait for services (30 seconds)
sleep 30

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Verify health
curl http://localhost:3000/api/health
```

### 5. Commit Changes (1 minute)

```bash
# Check what changed
git status

# Commit cleanup
git add -A
git commit -m "Repository cleanup and consolidation

- Organized 100+ docs into structured folders
- Removed backup files
- Consolidated Docker configs
- Created navigation indexes
- Improved developer experience"
```

---

## 🔍 WHAT GETS CLEANED

### Documentation (Root → docs/)

```
BEFORE: 100+ MD files in root
AFTER:  6 MD files in root + organized docs/ folder

ROOT (Keep):
✅ README.md
✅ CONTRIBUTING.md
✅ LICENSE
✅ CHANGELOG.md
✅ STATUS.md (renamed from CURRENT_STATUS_JANUARY_2025.md)
✅ QUICK_START.md

docs/
├── INDEX.md                    # Navigation
├── api/                        # API documentation
├── current/                    # Active docs
│   ├── DEVELOPER_QUICK_REFERENCE.md
│   ├── DEPLOYMENT_READINESS_CHECKLIST.md
│   ├── ARCHITECTURE_DIAGRAM.md
│   └── ...
├── deployment/                 # Deployment guides
│   ├── DOCKER_DEPLOYMENT.md
│   ├── STAGING_DEPLOYMENT_QUICKSTART.md
│   ├── VERCEL_DEPLOYMENT_GUIDE.md
│   └── ...
├── guides/                     # How-to guides
│   ├── REFACTORING_PLAN.md
│   ├── SERVICE_RESPONSE_QUICK_REFERENCE.md
│   └── ...
└── archive/                    # Historical (read-only)
    ├── 2024/
    │   ├── phases/             # Phase reports
    │   ├── sessions/           # Session reports
    │   └── reports/            # Completion reports
    └── 2025/
```

### Backup Files (Removed)

```
❌ .env.backup.2025-12-18T02-22-41
❌ prisma/schema.prisma.backup_before_run4
❌ src/app.backup.phase5/
❌ src/lib/controllers/__tests__/*.backup-*
❌ src/lib/services/cart.service.backup.ts
❌ All *.backup* files
❌ All *.old files
```

### Build Artifacts (Cleaned)

```
🧹 .next/                       # Build cache (374MB)
🧹 .jest-cache/                 # Test cache (2.1MB)
🧹 dist/                        # Compiled output (5.1MB)
🧹 *.tmp files                  # Temporary files
🧹 .DS_Store                    # macOS files
🧹 Thumbs.db                    # Windows files
```

### Docker (Reset)

```
🐳 Stop all containers
🐳 Remove volumes
🐳 Clean images
🐳 Rebuild from scratch
🐳 Fresh database
```

---

## ✅ VERIFICATION

### After Cleanup

```bash
# Check root is clean (should be ~6 files)
ls -la *.md

# Check docs structure
ls -la docs/

# Check no backups remain
find . -name "*.backup*" -o -name "*.old"

# Should return nothing
```

### After Docker Restart

```bash
# All services healthy
docker-compose ps

# Health check passes
curl http://localhost:3000/api/health
# Expected: {"status":"ok"}

# Database connected
docker-compose exec postgres psql -U farmers_user -d farmers_market -c "SELECT 1;"
# Expected: 1

# Redis working
docker-compose exec redis redis-cli ping
# Expected: PONG
```

---

## 🔄 ROLLBACK (If Needed)

### Option 1: Git Rollback

```bash
# Switch to backup branch
git checkout backup-before-cleanup

# Or reset specific changes
git checkout HEAD -- docs/
```

### Option 2: Docker Rollback

```bash
# Stop current containers
docker-compose down -v

# Rebuild from previous state
docker-compose up --build -d
```

---

## 📊 EXPECTED RESULTS

### File Count

```
BEFORE:
- Root MD files:        100+
- Total files:          5,485
- Documentation:        Scattered
- Navigation:           Difficult

AFTER:
- Root MD files:        6 (94% reduction)
- Total files:          ~5,400
- Documentation:        Organized
- Navigation:           Clear INDEX.md
```

### Disk Space

```
BEFORE:
- Build artifacts:      2.6GB
- Backup files:         ~50MB
- Total:                2.65GB

AFTER:
- Build artifacts:      0MB (cleaned, will rebuild)
- Backup files:         0MB (removed)
- Recovery:             50MB
```

### Developer Experience

```
BEFORE:
❌ 100+ files to navigate
❌ Unclear which docs are current
❌ Backup files in source
❌ Scattered information

AFTER:
✅ 6 essential files in root
✅ Clear docs/INDEX.md navigation
✅ Clean source tree
✅ Organized by purpose
✅ Historical archive preserved
```

---

## 🆘 TROUBLESHOOTING

### "Permission denied" on scripts

```bash
chmod +x scripts/*.sh
```

### "Port already in use"

```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port in docker-compose.yml
```

### "Docker build failed"

```bash
# Clean Docker cache
docker builder prune -a -f

# Rebuild without cache
docker-compose build --no-cache
```

### "Database migration failed"

```bash
# Reset database (development only!)
docker-compose down -v
docker-compose up -d postgres
sleep 10
docker-compose exec app npx prisma migrate reset
```

---

## 📚 POST-CLEANUP NAVIGATION

### Finding Documentation

```bash
# Main navigation
cat docs/INDEX.md

# Current project status
cat STATUS.md

# Quick start
cat QUICK_START.md

# API documentation
open docs/api/index.html
```

### Using New Structure

```
Need deployment guide?
→ docs/deployment/

Need API reference?
→ docs/api/

Need development guide?
→ docs/current/DEVELOPER_QUICK_REFERENCE.md

Need historical context?
→ docs/archive/
```

---

## ⏱️ TIME ESTIMATES

| Task                  | Manual     | Automated |
| --------------------- | ---------- | --------- |
| Documentation cleanup | 15 min     | 2 min     |
| Backup removal        | 10 min     | 1 min     |
| Docker restart        | 5 min      | 3 min     |
| Verification          | 5 min      | 1 min     |
| **TOTAL**             | **35 min** | **7 min** |

---

## 🎯 QUICK COMMANDS REFERENCE

```bash
# Full cleanup (interactive)
./scripts/cleanup-and-restart.sh

# Documentation only
./scripts/cleanup-docs.sh

# Backups only
./scripts/remove-backups.sh

# Docker dev
npm run docker:up-build-dev

# Docker prod
npm run docker:up-build

# View logs
npm run docker:logs

# Stop all
npm run docker:down

# Health check
curl http://localhost:3000/api/health
```

---

## 🚀 NEXT STEPS

After successful cleanup:

1. **Explore New Structure**

   ```bash
   # View documentation index
   cat docs/INDEX.md

   # Check current status
   cat STATUS.md
   ```

2. **Deploy to Staging**

   ```bash
   # See deployment guide
   cat docs/deployment/STAGING_DEPLOYMENT_QUICKSTART.md
   ```

3. **Run Tests**

   ```bash
   npm run test:unit
   npm run test:integration
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

---

## ✨ SUCCESS INDICATORS

You'll know cleanup was successful when:

- ✅ Only 6 MD files in root directory
- ✅ docs/INDEX.md exists and navigable
- ✅ No _.backup_ files found
- ✅ Docker services all "Up (healthy)"
- ✅ http://localhost:3000/api/health returns 200
- ✅ Build completes without errors
- ✅ Tests pass

---

## 📞 SUPPORT

### Need Help?

- **Documentation**: Check `docs/INDEX.md`
- **API Issues**: See `docs/api/GETTING_STARTED.md`
- **Docker Issues**: See `DOCKER_RESTART_GUIDE.md`
- **Technical Debt**: See `docs/current/TECHNICAL_DEBT.md`

### Scripts Not Working?

1. Ensure you're in project root
2. Make scripts executable: `chmod +x scripts/*.sh`
3. Check git is clean: `git status`
4. Verify Docker is running: `docker ps`

---

**Status**: ✅ READY TO EXECUTE  
**Risk**: Low (with git backup)  
**Impact**: High (better DX)  
**Time**: 5-10 minutes

---

_"From chaos to order in 5 minutes - the divine cleanup way!"_ 🌾✨🧹
