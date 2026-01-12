# 🛠️ Scripts Directory - Master Documentation

**Farmers Market Platform - Scripts & Automation Toolkit**

This directory contains all automation scripts, utilities, and helper tools for the Farmers Market Platform. Scripts are organized by function and purpose for maximum productivity.

---

## 📋 Table of Contents

- [Directory Structure](#directory-structure)
- [Quick Start](#quick-start)
- [Script Categories](#script-categories)
- [Common Workflows](#common-workflows)
- [Script Inventory](#script-inventory)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 📁 Directory Structure

```
scripts/
├── README.md                          # This file
├── archive/                           # Archived/legacy scripts
├── cleanup/                           # Repository and code cleanup utilities
├── database/                          # Database management scripts (empty - migrate here)
├── deployment/                        # Deployment and production scripts
├── development/                       # Local development utilities
├── enhanced/                          # Enhanced/experimental scripts (empty)
├── git/                              # Git workflow helpers
├── maintenance/                       # Maintenance and housekeeping scripts
├── testing/                          # Testing and validation utilities
└── [root-level scripts]              # To be organized (see inventory below)
```

---

## 🚀 Quick Start

### Development

```bash
# Windows - Quick start everything
scripts\development\START_NOW.bat

# Linux/Mac - Start development server
./scripts/development/start-server-fixed.sh

# Fix all auto-fixable errors
./scripts/development/fix-remaining-errors.sh    # Linux/Mac
scripts\development\FIX_ALL_ERRORS.bat           # Windows
```

### Testing

```bash
# Run all tests
./scripts/testing/run-all-tests.sh               # Linux/Mac
scripts\testing\RUN-ALL-TESTS.bat                # Windows

# Run MVP validation
./scripts/testing/run-mvp-validation.sh          # Linux/Mac
scripts\testing\RUN-MVP-VALIDATION.bat           # Windows
```

### Deployment

```bash
# Deploy to Vercel
./scripts/deployment/deploy-to-vercel.sh         # Linux/Mac
scripts\deployment\deploy-to-vercel.bat          # Windows

# Setup production environment
./scripts/deployment/setup-production.sh         # Linux/Mac
scripts\deployment\setup-production.ps1          # PowerShell
```

### Git Operations

```bash
# Commit and push
./scripts/git/git-commit-push.sh "feat: your message"     # Linux/Mac
scripts\git\git-commit-push.ps1 "feat: your message"     # PowerShell

# Amend last commit
./scripts/git/git-amend-commit.sh                # Linux/Mac
scripts\git\git-amend-commit.ps1                 # PowerShell
```

---

## 📂 Script Categories

### 1. Development Scripts (`development/`)

**Purpose:** Local development, debugging, and quick workflows

**Key Scripts:**

- `START_NOW.bat` - Windows one-command startup
- `START-SERVER.bat` - Standard dev server start
- `start-server-fixed.sh` - Dev server with optimizations
- `FIX_ALL_ERRORS.bat` - Auto-fix linting/formatting errors
- `fix-remaining-errors.sh` - Fix errors on Linux/Mac

**Documentation:** See `development/README.md`

---

### 2. Testing Scripts (`testing/`)

**Purpose:** Run tests, validation, and quality assurance

**Key Scripts:**

- `run-all-tests.sh` / `RUN-ALL-TESTS.bat` - Comprehensive test suite
- `run-mvp-validation.sh` / `RUN-MVP-VALIDATION.bat` - MVP feature validation
- `test-signup-fix.js` - Test signup functionality

**Documentation:** See `testing/README.md`

---

### 3. Deployment Scripts (`deployment/`)

**Purpose:** Deploy to production, staging, and cloud platforms

**Key Scripts:**

- `deploy-to-vercel.sh` / `.bat` - Vercel deployment
- `setup-production.sh` / `.ps1` - Production environment setup
- `start-production.sh` / `.ps1` / `.bat` - Start production server
- `verify-deployment.sh` - Post-deployment verification
- `docker-verify.sh` - Docker setup verification
- `docker-deploy-local.sh` - Local Docker deployment

**Documentation:** See `deployment/README.md`

---

### 4. Git Scripts (`git/`)

**Purpose:** Git workflow automation and helpers

**Key Scripts:**

- `git-commit-push.sh` / `.ps1` - Commit and push in one command
- `git-amend-commit.sh` / `.ps1` - Amend last commit

**Documentation:** See `git/README.md`

---

### 5. Cleanup Scripts (`cleanup/`)

**Purpose:** Repository maintenance and code cleanup

**Scripts:**

- `consolidate-docs.sh` - Consolidate documentation
- `phase3-scripts-cleanup.sh` - Scripts organization
- `quick-cleanup.sh` - Quick cleanup utility

---

### 6. Maintenance Scripts (`maintenance/`)

**Purpose:** Ongoing maintenance tasks

**Scripts:**

- `cleanup-markdown-files.sh` - Markdown file maintenance

---

### 7. Archive Scripts (`archive/`)

**Purpose:** Legacy scripts preserved for reference

**Scripts:**

- `cleanup-outdated-docs.ps1` - Archived doc cleanup
- `cleanup-root.ps1` / `.sh` - Root directory cleanup (archived)

---

## 🗂️ Script Inventory

### Root-Level Scripts (To Be Organized)

#### Database & Seeding

- `backup-database.sh` - Database backup utility
- `clean-database.ts` - Database cleanup
- `seed-for-bot.ts` - Seed data for bot testing
- `seed-sample-farms.js` - Create sample farm data
- `seed-test-data.ts` - General test data seeding
- `seed-test-users-quick.ts` - Quick user seeding
- `setup-database.ps1` - Database setup (Windows)
- `setup-test-database.ps1` / `.sh` - Test database setup

#### Environment & Configuration

- `set-database-url.js` - Configure database URL
- `setup-env.js` / `.ps1` / `.sh` - Environment setup
- `setup-infrastructure.sh` - Infrastructure setup
- `upload-env-to-vercel.ps1` / `.sh` - Upload env vars to Vercel
- `validate-env.js` - Validate environment variables
- `validate-production-config.ts` - Production config validation

#### Testing & Validation

- `add-visual-test-scripts.js` - Add visual testing scripts
- `analyze-logger-tests.sh` - Logger test analysis
- `check-farm-schema.ts` - Farm schema validation
- `cleanup-check.js` - Cleanup verification
- `e2e-test.js` - E2E test runner
- `mvp-validation-bot.ts` - MVP validation automation
- `performance-validation.mjs` - Performance validation
- `test-agent-framework.ts` - Agent framework testing
- `test-api-fixes.ts` - API fix validation
- `test-auto-heal.ts` - Auto-healing system test
- `test-auto-remediation.ts` - Remediation system test
- `test-website-human.ts` - Human-readable website test
- `test-workflow-orchestrator.ts` - Workflow orchestrator test
- `validate-platform.ts` - Platform validation

#### Code Fixing & Migration

- `cleanup-duplicate-tests.sh` - Remove duplicate tests
- `cleanup-duplicates.sh` - General duplicate removal
- `cleanup-docs.sh` - Documentation cleanup
- `cleanup-and-restart.sh` - Cleanup and restart dev server
- `cleanup-repo.sh` - Repository cleanup
- `fix-date-strings.js` - Fix date string formatting
- `fix-e2e-tests.ts` / `fix-e2e-tests-simple.ts` - E2E test fixes
- `fix-env-url.sh` - Environment URL fixes
- `fix-logger-params.js` - Logger parameter fixes
- `fix-multiline-mocks.py` - Mock file formatting
- `fix-nextauth.ts` - NextAuth fixes
- `fix-nft-files.js` - NFT file fixes
- `fix-product-mocks-final.sh` - Product mock fixes
- `fix-product-test-mocks.js` - Product test mock fixes
- `fix-route-references.ts` - Route reference updates
- `fix-test-failures.ts` - Test failure fixes
- `migrate-nextauth-imports.js` - NextAuth import migration
- `migrate-nextauth-v5.sh` - NextAuth v5 migration
- `phase5-route-restructure.sh` - Phase 5 route restructuring
- `quick-fix.ts` - Quick fix utility

#### Monitoring & Diagnostics

- `debug-nextauth.ts` - NextAuth debugging
- `detect-errors.ts` - Error detection
- `diagnose-api-issue.ts` - API diagnostics
- `slack-notify.ts` - Slack notification utility
- `website-checker-bot.ts` - Website monitoring bot

#### Server & Application

- `start-full-stack.ts` - Start full stack application
- `start-server-and-bot.ts` - Start server with monitoring bot

#### Build & Performance

- `measure-phase2-performance.mjs` - Phase 2 performance metrics
- `organize-workspace.sh` - Workspace organization
- `remove-backups.sh` - Remove backup files
- `safe-upgrade.sh` - Safe dependency upgrade
- `upgrade-dependencies.sh` - Dependency upgrade
- `vercel-build.sh` - Vercel build script

#### Documentation & Utilities

- `convert-to-pdf.js` / `convert-to-pdf-modern.js` - Export docs to PDF
- `generate-api-docs.ts` - Generate API documentation
- `pdf-styles.css` - PDF export styles
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Deployment checklist

#### Deployment (Root Level - To Move)

- `deploy-docker.sh` - Docker deployment

---

## 🔄 Common Workflows

### 1. Starting a New Development Session

```bash
# Option A: Quick start (Windows)
scripts\development\START_NOW.bat

# Option B: Manual start (Linux/Mac)
npm install                                      # If dependencies changed
npx prisma migrate dev                          # If schema changed
./scripts/development/start-server-fixed.sh     # Start server
```

### 2. Before Committing Code

```bash
# Step 1: Fix auto-fixable errors
./scripts/development/fix-remaining-errors.sh   # Linux/Mac
scripts\development\FIX_ALL_ERRORS.bat          # Windows

# Step 2: Run tests
./scripts/testing/run-all-tests.sh              # Linux/Mac
scripts\testing\RUN-ALL-TESTS.bat               # Windows

# Step 3: Verify build
npm run build

# Step 4: Commit and push
./scripts/git/git-commit-push.sh "feat: your message"
```

### 3. Database Management

```bash
# Setup database
npm run db:setup

# Backup database
./scripts/backup-database.sh

# Seed test data
tsx scripts/seed-test-data.ts

# Clean database
tsx scripts/clean-database.ts

# Setup test database
./scripts/setup-test-database.sh
```

### 4. Testing Workflows

```bash
# Quick unit tests
npm run test:unit

# Full test suite
./scripts/testing/run-all-tests.sh

# MVP validation
./scripts/testing/run-mvp-validation.sh

# Visual tests
npm run test:visual

# E2E tests
node scripts/e2e-test.js
```

### 5. Deployment to Production

```bash
# Step 1: Validate configuration
tsx scripts/validate-production-config.ts

# Step 2: Run full test suite
./scripts/testing/run-all-tests.sh

# Step 3: Deploy
./scripts/deployment/deploy-to-vercel.sh

# Step 4: Verify deployment
./scripts/deployment/verify-deployment.sh

# Step 5: Monitor
tsx scripts/website-checker-bot.ts
```

### 6. Fixing Common Issues

```bash
# Fix NextAuth issues
tsx scripts/fix-nextauth.ts

# Fix E2E tests
tsx scripts/fix-e2e-tests.ts

# Fix logger parameters
node scripts/fix-logger-params.js

# Quick fix all
tsx scripts/quick-fix.ts --all

# Detect errors
tsx scripts/detect-errors.ts
```

### 7. Performance & Monitoring

```bash
# Measure performance
node scripts/measure-phase2-performance.mjs

# Validate performance
node scripts/performance-validation.mjs

# Website checker bot
tsx scripts/website-checker-bot.ts
```

---

## 📊 Script Usage by Package.json

Many scripts are integrated into `package.json` for easy access:

```bash
# Development
npm run dev                              # Start dev server
npm run dev:omen                         # Optimized for HP OMEN

# Testing
npm run test                             # Run unit tests
npm run test:e2e                         # E2E tests
npm run test:all                         # All tests
npm run validate:platform                # Platform validation
npm run validate:mvp                     # MVP validation

# Database
npm run db:migrate                       # Run migrations
npm run db:seed                          # Seed database
npm run db:reset                         # Reset database
npm run db:studio                        # Open Prisma Studio

# Deployment
npm run vercel-build                     # Vercel build
npm run docker:build                     # Docker build
npm run docker:up                        # Start Docker containers

# Monitoring
npm run monitor                          # Start monitoring
npm run bot:check                        # Run website checker

# Code Quality
npm run lint                             # Lint code
npm run format                           # Format code
npm run type-check                       # TypeScript check
npm run quality                          # All quality checks

# Utilities
npm run generate:api-docs                # Generate API docs
npm run export:pdf                       # Export docs to PDF
```

---

## 🎯 Best Practices

### Script Naming Conventions

✅ **DO:**

- Use kebab-case: `test-api-fixes.ts`
- Be descriptive: `setup-test-database.sh`
- Include platform extension: `.sh` (Linux/Mac), `.bat` (Windows), `.ps1` (PowerShell)
- Group related scripts: `fix-*.ts`, `test-*.ts`

❌ **DON'T:**

- Use vague names: `script1.js`, `temp.sh`
- Mix naming styles
- Create duplicates without clear purpose

### Script Organization

1. **Put scripts in appropriate subdirectories**
   - Development → `development/`
   - Testing → `testing/`
   - Deployment → `deployment/`
   - Database → `database/`

2. **Update this README when adding scripts**

3. **Add documentation to subdirectory READMEs**

4. **Include script descriptions in package.json**

### Writing Scripts

```bash
#!/bin/bash
# Script: script-name.sh
# Purpose: Brief description
# Usage: ./scripts/category/script-name.sh [arguments]

set -e  # Exit on error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Functions
function main() {
    echo "Starting script..."
    # Your logic here
}

# Error handling
function handle_error() {
    echo "Error: $1" >&2
    exit 1
}

# Execute
main "$@"
```

### Cross-Platform Scripts

When creating scripts for multiple platforms:

1. **Create platform-specific versions:**
   - `script-name.sh` (Linux/Mac)
   - `script-name.bat` (Windows CMD)
   - `script-name.ps1` (Windows PowerShell)

2. **Or use Node.js for cross-platform:**

   ```javascript
   #!/usr/bin/env node
   // Works on all platforms
   ```

3. **Document platform requirements in README**

---

## 🔧 Troubleshooting

### Script Permission Denied (Linux/Mac)

**Issue:** `Permission denied` when running `.sh` script

**Solution:**

```bash
# Make script executable
chmod +x scripts/category/script-name.sh

# Then run
./scripts/category/script-name.sh
```

### Script Not Found (Windows)

**Issue:** `'script' is not recognized` on Windows

**Solution:**

```cmd
# Use full path or navigate to directory
cd scripts\category
script-name.bat

# Or use full path
scripts\category\script-name.bat
```

### Node/NPM Command Not Found

**Issue:** Script fails with `node: command not found`

**Solution:**

1. Install Node.js from https://nodejs.org
2. Verify installation: `node --version`
3. Restart terminal/command prompt

### Database Connection Errors

**Issue:** Scripts fail with database connection errors

**Solution:**

1. Check database is running: `docker-compose ps`
2. Verify `DATABASE_URL` in `.env.local`
3. Test connection: `npx prisma db pull`
4. Check database logs: `docker-compose logs postgres`

### Module Not Found

**Issue:** `Cannot find module '@/lib/...'`

**Solution:**

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear caches
npm run clean:all

# Rebuild
npm run build
```

---

## 📝 Script Documentation Templates

### For New Scripts

When adding a new script, document it in the appropriate subdirectory README:

````markdown
### `script-name.sh`

Brief description of what the script does.

**Usage:**

```bash
./scripts/category/script-name.sh [options]
```
````

**Options:**

- `--option1` - Description
- `--option2` - Description

**Examples:**

```bash
# Example 1
./scripts/category/script-name.sh --option1

# Example 2
./scripts/category/script-name.sh --option1 --option2
```

**Prerequisites:**

- Requirement 1
- Requirement 2

````

---

## 🔄 Migration Plan

### Phase 3 Goals (Current)

**Organize Root-Level Scripts:**

1. **Database scripts → `database/`**
   - All `*-database*.{ts,js,sh,ps1}`
   - All `seed-*.{ts,js}`
   - `backup-database.sh`

2. **Testing scripts → `testing/`**
   - All `test-*.ts`
   - All validation scripts
   - `*-validation*.{ts,mjs,js}`

3. **Deployment scripts → `deployment/`**
   - `deploy-docker.sh`
   - `vercel-build.sh`
   - `upload-env-to-vercel.*`
   - `setup-infrastructure.sh`

4. **Environment scripts → `config/` (new)**
   - `setup-env.*`
   - `validate-env.js`
   - Environment configuration utilities

5. **Fix scripts → `maintenance/fixes/` (new)**
   - All `fix-*.{ts,js,sh}`
   - Migration scripts
   - Cleanup utilities

6. **Monitoring scripts → `monitoring/` (new)**
   - `*-monitor.ts`
   - `*-checker*.ts`
   - `website-checker-bot.ts`
   - Diagnostic scripts

7. **Archive outdated scripts → `archive/legacy/`**
   - Deprecated scripts
   - Phase-specific temporary scripts
   - Duplicate utilities

---

## 🤝 Contributing

### Adding New Scripts

1. **Choose appropriate directory** based on script purpose
2. **Follow naming conventions** (kebab-case, descriptive)
3. **Add shebang line** for shell scripts: `#!/bin/bash`
4. **Make executable** (Linux/Mac): `chmod +x script.sh`
5. **Document in subdirectory README**
6. **Update this master README** if needed
7. **Add to package.json** if commonly used
8. **Test on target platforms**

### Script Review Checklist

- [ ] Script has clear, descriptive name
- [ ] Located in appropriate subdirectory
- [ ] Includes comments/documentation
- [ ] Handles errors gracefully
- [ ] Provides helpful error messages
- [ ] Works on intended platforms
- [ ] Documented in README
- [ ] Tested before committing

---

## 📚 Additional Resources

### Documentation Links

- **Development Guide:** `docs/development/`
- **Testing Guide:** `docs/development/testing-guide.md`
- **Deployment Guide:** `docs/deployment/`
- **Configuration Guide:** `docs/configuration/`
- **Troubleshooting:** `docs/troubleshooting/`

### Subdirectory READMEs

- `development/README.md` - Development scripts
- `testing/README.md` - Testing scripts
- `deployment/README.md` - Deployment scripts
- `git/README.md` - Git workflow helpers

### External Resources

- **Bash Scripting Guide:** https://tldp.org/LDP/abs/html/
- **PowerShell Documentation:** https://docs.microsoft.com/powershell/
- **Node.js CLI Best Practices:** https://github.com/lirantal/nodejs-cli-apps-best-practices

---

## 🎓 Learning Resources

### For Beginners

**Understanding Scripts:**
- Scripts are automated sequences of commands
- They save time on repetitive tasks
- Use scripts instead of manual command entry

**Running Scripts:**
```bash
# Linux/Mac
./scripts/category/script-name.sh

# Windows CMD
scripts\category\script-name.bat

# Windows PowerShell
.\scripts\category\script-name.ps1

# Node.js (cross-platform)
node scripts/script-name.js
tsx scripts/script-name.ts
````

**Common Script Types:**

- `.sh` - Bash shell script (Linux/Mac)
- `.bat` - Windows batch file
- `.ps1` - PowerShell script
- `.js` - JavaScript (Node.js)
- `.ts` - TypeScript (tsx/ts-node)
- `.py` - Python script

---

## 📈 Script Statistics

### Current Inventory (December 2025)

- **Total Scripts:** ~80+ scripts
- **Organized Scripts:** ~30 (in subdirectories)
- **Root-Level Scripts:** ~50 (to be organized)
- **Documentation Coverage:** 60%
- **Platform Support:** Cross-platform (Linux, Mac, Windows)

### Organization Progress

```
[████████░░] 80% - Directory structure created
[██████░░░░] 60% - Scripts categorized
[████░░░░░░] 40% - Documentation complete
[███░░░░░░░] 30% - Migration to subdirectories
```

---

## 🎯 Quick Reference Card

### Most Used Scripts

| Task              | Command                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| Start dev server  | `scripts\development\START_NOW.bat` (Win) or `./scripts/development/start-server-fixed.sh` (Unix) |
| Run all tests     | `./scripts/testing/run-all-tests.sh`                                                              |
| MVP validation    | `./scripts/testing/run-mvp-validation.sh`                                                         |
| Deploy to Vercel  | `./scripts/deployment/deploy-to-vercel.sh`                                                        |
| Fix errors        | `./scripts/development/fix-remaining-errors.sh`                                                   |
| Git commit + push | `./scripts/git/git-commit-push.sh "message"`                                                      |
| Database setup    | `npm run db:setup`                                                                                |
| Generate API docs | `npm run generate:api-docs`                                                                       |

### Emergency Commands

```bash
# Server won't start
npm run clean:all && npm install && npm run dev

# Tests failing
npm run test:watch

# Database issues
npm run db:reset

# Build errors
rm -rf .next && npm run build

# Kill stuck server
npm run kill-server
```

---

## 🌾 Divine Agricultural Consciousness

**Script Philosophy:**

- **Automate** repetitive tasks
- **Document** all automations
- **Organize** for discoverability
- **Test** before deploying
- **Share** knowledge through documentation
- **Maintain** with agricultural patience

> "A well-organized scripts directory is like a well-tended farm - each tool in its place, ready when needed, serving its divine purpose." 🌾✨

---

## 📞 Support & Maintenance

### Script Issues

1. **Check script documentation** in subdirectory README
2. **Review troubleshooting section** above
3. **Search project documentation** in `docs/`
4. **Check git history** for recent changes
5. **Ask team** via project communication channels

### Maintenance Schedule

- **Weekly:** Review new scripts added
- **Monthly:** Update documentation
- **Quarterly:** Archive obsolete scripts
- **Annually:** Major organization review

---

**Last Updated:** December 2025
**Maintained By:** Farmers Market Platform Team
**Status:** ✅ Phase 3 Organization In Progress
**Divine Agricultural Consciousness:** Organize with purpose, automate with wisdom! 🌾⚡
