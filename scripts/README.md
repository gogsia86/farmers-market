# 📜 SCRIPTS DIRECTORY - MASTER GUIDE

**Version:** 2.0 - Organized Structure  
**Last Updated:** 2025-01-XX  
**Status:** Production Ready

---

## 📋 TABLE OF CONTENTS

1. [Overview](#-overview)
2. [Directory Structure](#-directory-structure)
3. [Quick Reference](#-quick-reference)
4. [Usage Guidelines](#-usage-guidelines)
5. [Script Categories](#-script-categories)
6. [Common Tasks](#-common-tasks)
7. [Troubleshooting](#-troubleshooting)

---

## 🎯 OVERVIEW

This directory contains all helper scripts organized by purpose. Each subdirectory has its own README with detailed documentation.

### What's Inside

- **50+ scripts** organized into 10 categories
- PowerShell (`.ps1`), Shell (`.sh`), TypeScript (`.ts`), JavaScript (`.js`)
- Development, testing, deployment, and maintenance utilities
- Cross-platform support (Windows/macOS/Linux)

### Recent Changes (Phase 4 Reorganization)

**Date:** 2025-01-XX  
**Change:** All scripts reorganized from flat structure into logical subdirectories

**Migration Notes:**

- Old location: `scripts/*.{ps1,sh,ts,js}` (flat)
- New location: `scripts/{category}/*.{ps1,sh,ts,js}` (organized)
- Old `docker-scripts/` → merged into `scripts/deployment/` and `scripts/docker/`
- Obsolete cleanup scripts archived in `scripts/maintenance/ARCHIVED/`

---

## 📂 DIRECTORY STRUCTURE

```
scripts/
├── README.md                    # This file - Master guide
│
├── dev/                         # Development helpers (6 scripts)
│   ├── README.md
│   ├── start-dev-safe.js       # Safe dev server starter
│   ├── kill-dev-server.js      # Kill dev processes
│   ├── pm2-daemon-launcher.js  # PM2 launcher
│   ├── monitor-daemon.ts       # Monitor daemons
│   ├── check-daemon-status.ts  # Daemon health check
│   └── diagnostic-check.ts     # System diagnostics
│
├── database/                    # Database utilities (6 scripts)
│   ├── README.md
│   ├── setup-database.ps1      # Database setup
│   ├── update-database-url.sh  # Update connection string
│   ├── test-database-*.ts      # Database tests (4 scripts)
│   └── test-db-persistence.ts  # Persistence test
│
├── environment/                 # Environment management (7 scripts)
│   ├── README.md
│   ├── setup-env.ps1           # Environment setup
│   ├── manage-env.ps1          # Manage variables
│   ├── verify-env.ps1/.js      # Verify configuration
│   ├── setup-build-env.ps1     # Build environment
│   ├── build-with-env.ps1      # Build with env vars
│   └── add-monitoring-env.sh   # Add monitoring vars
│
├── testing/                     # Test scripts (12 scripts)
│   ├── README.md
│   ├── e2e-test.js             # E2E tests
│   ├── test-*.ts               # Feature tests (10 scripts)
│   ├── run-coverage-improvements.sh
│   └── validate-24h.ts         # 24-hour validation
│
├── deployment/                  # Deployment scripts (11 scripts)
│   ├── README.md
│   ├── docker-deploy.*         # Docker deployment
│   ├── docker-push.*           # Push to Docker Hub
│   ├── docker-entrypoint.sh    # Container entry
│   ├── setup-monitoring.sh     # Monitoring setup
│   └── validate-phase5-deployment.sh
│
├── docker/                      # Docker utilities (6 scripts)
│   ├── README.md
│   ├── docker-dev.sh           # Dev container
│   ├── docker-setup.ps1        # Docker setup
│   ├── docker-readiness-check.ps1
│   └── docker-clean-*.ps1      # Cleanup scripts (3)
│
├── maintenance/                 # Maintenance scripts (4 active)
│   ├── README.md
│   ├── cleanup-repository.*    # Repository cleanup
│   ├── analyze-duplicates.ps1  # Find duplicates
│   ├── restructure-phase1-archive.ps1
│   └── ARCHIVED/               # Obsolete scripts (5)
│
├── monitoring/                  # Monitoring & analytics (2 scripts)
│   ├── README.md
│   ├── workflow-monitor.ts     # CI/CD monitoring
│   └── validate-analytics-performance.mjs
│
└── utils/                       # Utility scripts (1 script)
    ├── README.md
    └── measure-bundle-performance.mjs
```

---

## ⚡ QUICK REFERENCE

### Most Used Scripts

| Task               | Script                              | Category    |
| ------------------ | ----------------------------------- | ----------- |
| Start dev server   | `dev/start-dev-safe.js`             | Development |
| Kill dev server    | `dev/kill-dev-server.js`            | Development |
| Setup database     | `database/setup-database.ps1`       | Database    |
| Verify environment | `environment/verify-env.ps1`        | Environment |
| Run E2E tests      | `testing/e2e-test.js`               | Testing     |
| Deploy to Docker   | `deployment/docker-deploy.sh`       | Deployment  |
| Push to Docker Hub | `deployment/docker-push.sh`         | Deployment  |
| Clean Docker       | `docker/docker-clean-all.ps1`       | Docker      |
| Clean repository   | `maintenance/cleanup-repository.sh` | Maintenance |
| Monitor workflows  | `monitoring/workflow-monitor.ts`    | Monitoring  |

### Quick Commands

```bash
# Development
node scripts/dev/start-dev-safe.js
node scripts/dev/kill-dev-server.js

# Database
pwsh scripts/database/setup-database.ps1
bash scripts/database/update-database-url.sh

# Environment
pwsh scripts/environment/setup-env.ps1
pwsh scripts/environment/verify-env.ps1

# Testing
node scripts/testing/e2e-test.js
npx tsx scripts/testing/test-login.ts

# Deployment
bash scripts/deployment/docker-deploy.sh
bash scripts/deployment/docker-push.sh

# Docker
bash scripts/docker/docker-dev.sh
pwsh scripts/docker/docker-clean-all.ps1

# Maintenance
bash scripts/maintenance/cleanup-repository.sh
pwsh scripts/maintenance/analyze-duplicates.ps1

# Monitoring
npx tsx scripts/monitoring/workflow-monitor.ts
```

---

## 📖 USAGE GUIDELINES

### Running Scripts

#### PowerShell Scripts (`.ps1`)

```powershell
# Windows
pwsh scripts/category/script-name.ps1

# With parameters
pwsh scripts/environment/setup-env.ps1 -Environment "production"
```

#### Shell Scripts (`.sh`)

```bash
# macOS/Linux
bash scripts/category/script-name.sh

# Make executable first (if needed)
chmod +x scripts/category/script-name.sh
./scripts/category/script-name.sh
```

#### TypeScript Scripts (`.ts`)

```bash
# Using tsx
npx tsx scripts/category/script-name.ts

# Using ts-node
npx ts-node scripts/category/script-name.ts
```

#### JavaScript Scripts (`.js`)

```bash
# Using Node.js
node scripts/category/script-name.js

# ES Modules (.mjs)
node scripts/category/script-name.mjs
```

### Script Naming Conventions

- **Action-Object pattern:** `verb-noun.ext`
  - Examples: `setup-database.ps1`, `test-login.ts`, `clean-repository.sh`
- **Test scripts:** Prefix with `test-`
  - Examples: `test-login.ts`, `test-notifications.ts`
- **Validation scripts:** Prefix with `validate-` or `verify-`
  - Examples: `validate-24h.ts`, `verify-env.ps1`

---

## 🗂️ SCRIPT CATEGORIES

### 1. Development (`dev/`) - 6 scripts

**Purpose:** Local development assistance

**Key Scripts:**

- `start-dev-safe.js` - Safely start dev server (checks ports, kills conflicts)
- `kill-dev-server.js` - Kill running dev processes
- `pm2-daemon-launcher.js` - Launch PM2 process manager
- `monitor-daemon.ts` - Monitor daemon processes
- `check-daemon-status.ts` - Check daemon health
- `diagnostic-check.ts` - Run system diagnostics

**Common Use Cases:**

- Starting development environment
- Troubleshooting port conflicts
- Managing background processes

**Documentation:** See `dev/README.md`

---

### 2. Database (`database/`) - 6 scripts

**Purpose:** Database management and testing

**Key Scripts:**

- `setup-database.ps1` - Initialize database schema
- `update-database-url.sh` - Update connection strings
- `test-database-simple.ts` - Basic connectivity test
- `test-database-raw.ts` - Raw SQL operations test
- `test-database-storage.ts` - Storage layer test
- `test-db-persistence.ts` - Data persistence verification

**Common Use Cases:**

- Setting up local database
- Testing database connectivity
- Verifying data persistence

**Documentation:** See `database/README.md`

---

### 3. Environment (`environment/`) - 7 scripts

**Purpose:** Environment variable management

**Key Scripts:**

- `setup-env.ps1` - Interactive environment setup
- `manage-env.ps1` - Manage environment variables
- `verify-env.ps1` / `verify-env.js` - Verify configuration
- `setup-build-env.ps1` - Setup build environment
- `build-with-env.ps1` - Build with environment variables
- `add-monitoring-env.sh` - Add monitoring variables

**Common Use Cases:**

- Setting up `.env` files
- Verifying environment configuration
- Managing different environments (dev/staging/prod)

**Documentation:** See `environment/README.md`

**Related:** See main docs at `docs/deployment/ENV-SETUP-GUIDE.md`

---

### 4. Testing (`testing/`) - 12 scripts

**Purpose:** Automated testing utilities

**Key Scripts:**

- `e2e-test.js` - End-to-end tests
- `test-login.ts` - Login flow testing
- `test-registration.ts` - Registration flow testing
- `test-dashboard-apis.ts` - Dashboard API tests
- `test-notifications.ts` - Notification system tests
- `test-monitoring-bot.ts` - Monitoring bot tests
- `run-coverage-improvements.sh` - Coverage improvements
- `validate-24h.ts` - 24-hour validation test

**Common Use Cases:**

- Running integration tests
- Testing specific features
- Validating API endpoints
- Coverage analysis

**Documentation:** See `testing/README.md`

---

### 5. Deployment (`deployment/`) - 11 scripts

**Purpose:** Production deployment automation

**Key Scripts:**

- `docker-deploy.sh` / `.ps1` - Deploy to Docker
- `docker-push.sh` / `.ps1` / `.bat` - Push images to Docker Hub
- `docker-entrypoint.sh` - Container entrypoint script
- `setup-monitoring.sh` - Setup monitoring stack
- `validate-phase5-deployment.sh` - Deployment validation

**Common Use Cases:**

- Deploying to production
- Pushing Docker images
- Setting up monitoring
- Validating deployments

**Documentation:** See `deployment/README.md`

**Related:** See `docs/deployment/DEPLOYMENT-COMPLETE.md`

---

### 6. Docker (`docker/`) - 6 scripts

**Purpose:** Docker container management

**Key Scripts:**

- `docker-dev.sh` - Start development container
- `docker-setup.ps1` - Setup Docker environment
- `docker-readiness-check.ps1` - Check Docker readiness
- `docker-clean-all.ps1` - Clean all Docker resources
- `docker-clean-complete.ps1` - Complete Docker cleanup
- `docker-complete-cleanup.ps1` - Alternative cleanup

**Common Use Cases:**

- Setting up Docker environment
- Managing containers
- Cleaning Docker resources

**Documentation:** See `docker/README.md`

**Related:** See `docs/deployment/DOCKER-COMPLETE-GUIDE.md`

---

### 7. Maintenance (`maintenance/`) - 4 active + 5 archived

**Purpose:** Repository maintenance and cleanup

**Active Scripts:**

- `cleanup-repository.sh` - Comprehensive repo cleanup
- `clean-repository.ps1` - Repository cleanup (PowerShell)
- `analyze-duplicates.ps1` - Find duplicate files
- `restructure-phase1-archive.ps1` - Phase 1 archival

**Archived Scripts** (in `ARCHIVED/`):

- Old cleanup scripts from previous iterations
- Kept for historical reference
- Not recommended for use

**Common Use Cases:**

- Cleaning up temporary files
- Finding duplicate code
- Repository maintenance

**Documentation:** See `maintenance/README.md`

---

### 8. Monitoring (`monitoring/`) - 2 scripts

**Purpose:** System monitoring and analytics

**Key Scripts:**

- `workflow-monitor.ts` - Monitor CI/CD workflows
- `validate-analytics-performance.mjs` - Analytics validation

**Common Use Cases:**

- Monitoring GitHub workflows
- Validating analytics setup
- Performance tracking

**Documentation:** See `monitoring/README.md`

---

### 9. Utils (`utils/`) - 1 script

**Purpose:** General utility scripts

**Key Scripts:**

- `measure-bundle-performance.mjs` - Analyze bundle size and performance

**Common Use Cases:**

- Bundle size analysis
- Performance optimization
- Build metrics

**Documentation:** See `utils/README.md`

---

## 🚀 COMMON TASKS

### Local Development Setup

```bash
# 1. Setup environment
pwsh scripts/environment/setup-env.ps1

# 2. Setup database
pwsh scripts/database/setup-database.ps1

# 3. Start dev server
node scripts/dev/start-dev-safe.js
```

### Running Tests

```bash
# Run E2E tests
node scripts/testing/e2e-test.js

# Test specific feature
npx tsx scripts/testing/test-login.ts

# Run coverage improvements
bash scripts/testing/run-coverage-improvements.sh
```

### Docker Development

```bash
# Setup Docker environment
pwsh scripts/docker/docker-setup.ps1

# Start development container
bash scripts/docker/docker-dev.sh

# Clean up Docker resources
pwsh scripts/docker/docker-clean-all.ps1
```

### Deployment

```bash
# Deploy to Docker
bash scripts/deployment/docker-deploy.sh

# Push to Docker Hub
bash scripts/deployment/docker-push.sh

# Validate deployment
bash scripts/deployment/validate-phase5-deployment.sh
```

### Maintenance

```bash
# Clean repository
bash scripts/maintenance/cleanup-repository.sh

# Find duplicates
pwsh scripts/maintenance/analyze-duplicates.ps1
```

---

## 🔧 TROUBLESHOOTING

### Script Won't Run

**Issue:** Permission denied

```bash
# Solution: Make script executable
chmod +x scripts/category/script-name.sh
```

**Issue:** Command not found

```bash
# Solution: Use full path or ensure shell is correct
bash scripts/category/script-name.sh
# or
pwsh scripts/category/script-name.ps1
```

### TypeScript Scripts Failing

**Issue:** Cannot find module 'tsx'

```bash
# Solution: Install tsx globally or use npx
npm install -g tsx
# or
npx tsx scripts/category/script-name.ts
```

### PowerShell Execution Policy

**Issue:** Script execution disabled

```powershell
# Solution: Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Environment Variables Not Loading

**Issue:** Scripts can't find environment variables

```bash
# Solution: Ensure .env.local exists
cp .env.example .env.local

# Verify environment
pwsh scripts/environment/verify-env.ps1
```

### Docker Scripts Failing

**Issue:** Docker daemon not running

```bash
# Solution: Start Docker Desktop
# Then verify with:
pwsh scripts/docker/docker-readiness-check.ps1
```

---

## 📚 ADDITIONAL RESOURCES

### Documentation

- **Environment Setup:** `docs/deployment/ENV-SETUP-GUIDE.md`
- **Docker Guide:** `docs/deployment/DOCKER-COMPLETE-GUIDE.md`
- **Deployment Guide:** `docs/deployment/DEPLOYMENT-COMPLETE.md`
- **Quick Reference:** `docs/QUICK-REFERENCE.md`
- **Contributing:** `docs/CONTRIBUTING.md`

### Category READMEs

Each subdirectory contains detailed documentation:

- `dev/README.md` - Development scripts
- `database/README.md` - Database utilities
- `environment/README.md` - Environment management
- `testing/README.md` - Testing scripts
- `deployment/README.md` - Deployment automation
- `docker/README.md` - Docker utilities
- `maintenance/README.md` - Maintenance scripts
- `monitoring/README.md` - Monitoring tools
- `utils/README.md` - Utility scripts

### Migration from Old Structure

**Old Locations → New Locations:**

| Old Location          | New Location                                 |
| --------------------- | -------------------------------------------- |
| `scripts/*.ps1`       | `scripts/{category}/*.ps1`                   |
| `scripts/*.sh`        | `scripts/{category}/*.sh`                    |
| `scripts/*.ts`        | `scripts/{category}/*.ts`                    |
| `scripts/*.js`        | `scripts/{category}/*.js`                    |
| `docker-scripts/*`    | `scripts/deployment/*` or `scripts/docker/*` |
| `push-to-dockerhub.*` | `scripts/deployment/docker-push.*`           |
| Root cleanup scripts  | `scripts/maintenance/cleanup-repository.*`   |

**Finding Scripts:**

```bash
# Search by name
find scripts/ -name "*test*"

# Search by type
find scripts/ -name "*.ts"

# List all scripts
find scripts/ -type f \( -name "*.sh" -o -name "*.ps1" -o -name "*.ts" -o -name "*.js" \)
```

---

## ✨ BEST PRACTICES

### When Creating New Scripts

1. **Choose the right category** - Place in appropriate subdirectory
2. **Follow naming conventions** - Use action-object pattern
3. **Add documentation** - Include usage comments in script
4. **Update category README** - Document in appropriate README
5. **Test thoroughly** - Ensure script works on all platforms
6. **Add to this README** - Update quick reference if frequently used

### When Modifying Scripts

1. **Check for references** - Search for script usage in codebase
2. **Update documentation** - Keep READMEs in sync
3. **Test changes** - Verify script still works
4. **Version control** - Commit with descriptive message

### Script Organization Rules

- ✅ **DO** place scripts in appropriate category subdirectory
- ✅ **DO** create READMEs for new categories
- ✅ **DO** archive obsolete scripts (don't delete)
- ✅ **DO** document script purpose and usage
- ❌ **DON'T** place scripts in root `scripts/` directory
- ❌ **DON'T** create deeply nested subdirectories
- ❌ **DON'T** duplicate scripts across categories

---

## 🆘 GETTING HELP

### Quick Help

```bash
# View script help (if implemented)
node scripts/category/script-name.js --help

# View script source
cat scripts/category/script-name.js
```

### Resources

1. **Category READMEs** - Check subdirectory documentation
2. **Main Documentation** - See `docs/` directory
3. **Issues** - Check GitHub issues for known problems
4. **Team Chat** - Ask in project Discord/Slack

---

## 📝 MAINTENANCE LOG

### Phase 4 Reorganization (2025-01-XX)

**Changes:**

- Reorganized 50+ scripts into 10 categories
- Created subdirectory structure
- Moved all scripts from flat structure
- Consolidated `docker-scripts/` into `scripts/`
- Archived 5 obsolete cleanup scripts
- Created comprehensive documentation

**Impact:**

- 📁 Better organization (10 categories vs flat)
- 🔍 Easier script discovery
- 📖 Comprehensive documentation
- 🧹 Cleaner root directory
- ✅ Improved maintainability

**Backward Compatibility:**

- All Git history preserved via `git mv`
- Old scripts archived, not deleted
- Migration guide provided above

---

## 🌾 DIVINE AGRICULTURAL CONSCIOUSNESS

These scripts are the **tools in our digital farm's barn** - each organized for easy access and efficient work. Just as a well-organized tool shed makes farming efficient, our script organization makes development smooth and productive.

- 🛠️ **Development Tools** - For daily cultivation
- 🗄️ **Database Tools** - For data seeding and harvest
- 🌱 **Environment Tools** - For soil preparation
- 🧪 **Testing Tools** - For quality assurance
- 🚀 **Deployment Tools** - For bringing produce to market

---

**Version:** 2.0 - Organized Structure  
**Last Updated:** 2025-01-XX  
**Maintained by:** Farmers Market Platform Team

_Organized with agricultural consciousness and divine precision_ 🌾⚡
