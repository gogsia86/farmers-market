#!/bin/bash

# 🗂️ Workspace Organization Script
# Farmers Market Platform - Organize files by type and purpose
# This script helps maintain a clean, organized workspace structure

set -e

echo "🗂️ Starting workspace organization..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# 1. CREATE ORGANIZED DIRECTORY STRUCTURE
# ============================================
echo -e "${BLUE}📁 Creating organized directory structure...${NC}"

# Documentation directories
mkdir -p "docs/architecture"
mkdir -p "docs/api"
mkdir -p "docs/deployment"
mkdir -p "docs/development"
mkdir -p "docs/quick-start"
mkdir -p "docs/testing"
mkdir -p "docs/troubleshooting"
mkdir -p "docs/guides"

# Scripts directories
mkdir -p "scripts/database"
mkdir -p "scripts/deployment"
mkdir -p "scripts/development"
mkdir -p "scripts/testing"
mkdir -p "scripts/maintenance"
mkdir -p "scripts/monitoring"

# Backup directory
mkdir -p ".backups"

echo -e "${GREEN}✅ Directory structure created${NC}"
echo ""

# ============================================
# 2. ORGANIZE DOCUMENTATION FILES
# ============================================
echo -e "${BLUE}📚 Organizing documentation files...${NC}"

# Move any remaining docs to appropriate folders
if [ -f "API_DOCUMENTATION.md" ]; then
  mv "API_DOCUMENTATION.md" "docs/api/"
  echo "  → Moved API_DOCUMENTATION.md"
fi

if [ -f "ARCHITECTURE.md" ]; then
  mv "ARCHITECTURE.md" "docs/architecture/"
  echo "  → Moved ARCHITECTURE.md"
fi

if [ -f "TESTING_GUIDE.md" ]; then
  mv "TESTING_GUIDE.md" "docs/testing/"
  echo "  → Moved TESTING_GUIDE.md"
fi

if [ -f "DEVELOPMENT_GUIDE.md" ]; then
  mv "DEVELOPMENT_GUIDE.md" "docs/development/"
  echo "  → Moved DEVELOPMENT_GUIDE.md"
fi

if [ -f "TROUBLESHOOTING.md" ]; then
  mv "TROUBLESHOOTING.md" "docs/troubleshooting/"
  echo "  → Moved TROUBLESHOOTING.md"
fi

echo -e "${GREEN}✅ Documentation organized${NC}"
echo ""

# ============================================
# 3. CREATE INDEX FILES FOR DOCUMENTATION
# ============================================
echo -e "${BLUE}📑 Creating documentation index files...${NC}"

# Main docs README
cat > "docs/README.md" << 'EOL'
# 📚 Farmers Market Platform Documentation

Welcome to the comprehensive documentation for the Farmers Market Platform!

## 📖 Documentation Structure

### 🚀 [Quick Start](./quick-start/)
Get up and running in minutes:
- [START HERE](./quick-start/START_HERE.md) - First steps guide
- [Quick Start Guide](./quick-start/QUICK_START_GUIDE.md) - Full setup walkthrough
- [Quick Start](./quick-start/QUICK_START.md) - TL;DR version

### 🚢 [Deployment](./deployment/)
Production deployment guides:
- [Deployment Checklist](./deployment/DEPLOYMENT_CHECKLIST.md)
- [Deployment Summary](./deployment/DEPLOYMENT_SUMMARY.md)
- [Vercel Deployment Analysis](./deployment/VERCEL_DEPLOYMENT_ANALYSIS.md)
- [Vercel Troubleshooting](./deployment/VERCEL_TROUBLESHOOTING.md)
- [Deploy Quick Reference](./deployment/DEPLOY_QUICK_REFERENCE.md)

### 🏗️ [Architecture](./architecture/)
System design and architecture documentation

### 🔌 [API](./api/)
API documentation and reference guides

### 💻 [Development](./development/)
Development guides and best practices

### 🧪 [Testing](./testing/)
Testing strategies and guides

### 🔧 [Troubleshooting](./troubleshooting/)
Common issues and solutions

### 📖 [Guides](./guides/)
Step-by-step tutorials and how-to guides

---

## 🎯 Quick Links

- [Main README](../README.md)
- [Contributing Guidelines](../.github/CONTRIBUTING.md)
- [Pull Request Template](../.github/PULL_REQUEST_TEMPLATE.md)

## 🌟 Documentation Standards

All documentation follows:
- Clear, concise writing
- Code examples with syntax highlighting
- Step-by-step instructions where applicable
- Agricultural consciousness and divine patterns
- Regular updates and maintenance

---

**Last Updated:** $(date +%Y-%m-%d)
**Platform Version:** 1.0.0
🌾 **"Clean code, clear docs, divine deployment."** ⚡
EOL

echo "  → Created docs/README.md"

# Quick Start README
cat > "docs/quick-start/README.md" << 'EOL'
# 🚀 Quick Start Documentation

Get your Farmers Market Platform development environment up and running!

## 📚 Available Guides

1. **[START HERE](./START_HERE.md)** - New to the project? Start here!
2. **[Quick Start Guide](./QUICK_START_GUIDE.md)** - Comprehensive setup walkthrough
3. **[Quick Start](./QUICK_START.md)** - TL;DR quick reference

## ⚡ Super Quick Start

```bash
# Clone and install
git clone <repo-url>
cd farmers-market-platform
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# Setup database
npm run db:setup

# Start development server
npm run dev
```

Visit http://localhost:3000

## 🆘 Need Help?

- Check [Troubleshooting](../troubleshooting/)
- Review [Development Guide](../development/)
- See [Main Documentation](../README.md)

---

🌾 **Happy Coding!** ⚡
EOL

echo "  → Created docs/quick-start/README.md"

# Deployment README
cat > "docs/deployment/README.md" << 'EOL'
# 🚢 Deployment Documentation

Everything you need to deploy the Farmers Market Platform to production.

## 📚 Deployment Guides

1. **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
2. **[Deployment Summary](./DEPLOYMENT_SUMMARY.md)** - Overview and quick steps
3. **[Vercel Deployment Analysis](./VERCEL_DEPLOYMENT_ANALYSIS.md)** - Detailed Vercel guide
4. **[Deploy Quick Reference](./DEPLOY_QUICK_REFERENCE.md)** - Commands and configs
5. **[Vercel Troubleshooting](./VERCEL_TROUBLESHOOTING.md)** - Common issues and fixes

## ⚡ Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 📋 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Prisma client generated
- [ ] Build successful locally
- [ ] Dependencies up to date

## 🔒 Security Checklist

- [ ] NEXTAUTH_SECRET set (min 32 chars)
- [ ] Database credentials secure
- [ ] API keys in environment variables
- [ ] CORS configured properly
- [ ] Rate limiting enabled

## 🆘 Deployment Issues?

See [Vercel Troubleshooting](./VERCEL_TROUBLESHOOTING.md) for solutions.

---

🌾 **Deploy with confidence!** ⚡
EOL

echo "  → Created docs/deployment/README.md"

echo -e "${GREEN}✅ Documentation index files created${NC}"
echo ""

# ============================================
# 4. ORGANIZE EXISTING SCRIPTS
# ============================================
echo -e "${BLUE}🔧 Organizing existing scripts...${NC}"

# Check if scripts directory has files and organize them
if [ -d "scripts" ]; then
  # Move database scripts
  if ls scripts/*db* 1> /dev/null 2>&1; then
    mv scripts/*db* "scripts/database/" 2>/dev/null || true
    echo "  → Organized database scripts"
  fi

  # Move test scripts
  if ls scripts/*test* 1> /dev/null 2>&1; then
    mv scripts/*test* "scripts/testing/" 2>/dev/null || true
    echo "  → Organized test scripts"
  fi

  # Move deployment scripts
  if ls scripts/*deploy* 1> /dev/null 2>&1; then
    mv scripts/*deploy* "scripts/deployment/" 2>/dev/null || true
    echo "  → Organized deployment scripts"
  fi
fi

echo -e "${GREEN}✅ Scripts organized${NC}"
echo ""

# ============================================
# 5. CREATE WORKSPACE INDEX
# ============================================
echo -e "${BLUE}📋 Creating workspace index...${NC}"

cat > "WORKSPACE_INDEX.md" << 'EOL'
# 🗂️ Workspace Index
**Farmers Market Platform - File Organization Reference**

Last Updated: $(date +%Y-%m-%d %H:%M:%S)

---

## 📁 Project Structure

```
farmers-market-platform/
├── 📂 .github/              # GitHub templates & workflows
├── 📂 .husky/               # Git hooks
├── 📂 .vscode/              # VSCode settings
├── 📂 docs/                 # 📚 ALL DOCUMENTATION
│   ├── api/                # API documentation
│   ├── architecture/       # System architecture docs
│   ├── deployment/         # 🚢 Deployment guides
│   ├── development/        # Development guides
│   ├── guides/             # How-to guides
│   ├── quick-start/        # 🚀 Getting started
│   ├── testing/            # Testing documentation
│   └── troubleshooting/    # Problem solving
├── 📂 prisma/              # Database schema & migrations
├── 📂 public/              # Static assets
├── 📂 scripts/             # 🔧 Utility scripts
│   ├── database/          # Database scripts
│   ├── deployment/        # Deployment scripts
│   ├── development/       # Dev helper scripts
│   ├── maintenance/       # Maintenance scripts
│   ├── monitoring/        # Monitoring scripts
│   └── testing/           # Test helper scripts
├── 📂 src/                 # 💻 Source code
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/               # Core libraries
│   ├── types/             # TypeScript types
│   └── hooks/             # React hooks
├── 📂 tests/               # Test files
├── 📂 types/               # Shared type definitions
├── 📄 .cursorrules         # Cursor AI rules
├── 📄 .dockerignore        # Docker ignore patterns
├── 📄 .gitignore           # Git ignore patterns
├── 📄 .vercelignore        # Vercel ignore patterns
├── 📄 docker-compose.yml   # Docker configuration
├── 📄 eslint.config.mjs    # ESLint configuration
├── 📄 jest.config.js       # Jest configuration
├── 📄 next.config.mjs      # Next.js configuration
├── 📄 package.json         # Dependencies & scripts
├── 📄 playwright.config.ts # Playwright configuration
├── 📄 README.md            # Main project README
├── 📄 tailwind.config.ts   # Tailwind configuration
├── 📄 tsconfig.json        # TypeScript configuration
└── 📄 vercel.json          # Vercel deployment config
```

---

## 🚀 Quick Access

### Documentation
- **Start Here**: [`docs/quick-start/START_HERE.md`](./docs/quick-start/START_HERE.md)
- **Main Docs**: [`docs/README.md`](./docs/README.md)
- **Deploy Guide**: [`docs/deployment/README.md`](./docs/deployment/README.md)

### Configuration Files
- **Next.js**: `next.config.mjs`
- **TypeScript**: `tsconfig.json`
- **Database**: `prisma/schema.prisma`
- **Tests**: `jest.config.js`, `playwright.config.ts`
- **Deployment**: `vercel.json`

### Scripts (npm run)
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run test             # Run tests
npm run db:setup         # Setup database
npm run db:migrate       # Run migrations
npm run quality          # Run all quality checks
```

---

## 📚 Documentation Categories

### 🚀 Getting Started
- Quick Start guides in `docs/quick-start/`
- Development setup in `docs/development/`

### 🚢 Deployment
- All deployment docs in `docs/deployment/`
- Vercel-specific guides included
- Environment variable references

### 🏗️ Architecture
- System design in `docs/architecture/`
- Database schema documentation
- API architecture

### 🧪 Testing
- Testing guides in `docs/testing/`
- Test organization patterns
- Quality assurance docs

### 🔧 Troubleshooting
- Common issues in `docs/troubleshooting/`
- Debug guides
- FAQ sections

---

## 🔧 Utility Scripts

All utility scripts are organized in `scripts/` by category:

- **Database**: `scripts/database/` - DB setup, migrations, seeds
- **Deployment**: `scripts/deployment/` - Deploy helpers, configs
- **Development**: `scripts/development/` - Dev environment tools
- **Testing**: `scripts/testing/` - Test utilities
- **Maintenance**: `scripts/maintenance/` - Cleanup, optimization
- **Monitoring**: `scripts/monitoring/` - Health checks, logs

---

## 📖 File Naming Conventions

- **Docs**: UPPERCASE with underscores (e.g., `QUICK_START.md`)
- **Code**: camelCase or kebab-case (e.g., `farmService.ts`, `farm-card.tsx`)
- **Scripts**: kebab-case with `.sh` or `.ps1` (e.g., `setup-db.sh`)
- **Config**: lowercase with dots (e.g., `next.config.mjs`)

---

## 🗄️ Archive Policy

Outdated files are moved to `.backups/` with timestamp:
- Session reports
- Temporary files
- Deprecated configs
- Old documentation versions

---

## 🆘 Need Help?

1. Check `docs/quick-start/START_HERE.md`
2. Review `docs/troubleshooting/`
3. See `README.md` for project overview
4. Open an issue on GitHub

---

**Last Updated**: $(date +%Y-%m-%d)
**Maintained By**: Development Team
🌾 **"Organized code, organized mind, divine productivity."** ⚡
EOL

echo "  → Created WORKSPACE_INDEX.md"

echo -e "${GREEN}✅ Workspace index created${NC}"
echo ""

# ============================================
# 6. CREATE CLEANUP UTILITIES
# ============================================
echo -e "${BLUE}🧹 Creating cleanup utilities...${NC}"

# Create scripts/maintenance directory content
cat > "scripts/maintenance/clean-artifacts.sh" << 'EOL'
#!/bin/bash
# Clean build artifacts and temporary files

echo "🧹 Cleaning build artifacts..."

rm -rf .next
rm -rf .jest-cache
rm -rf coverage
rm -rf dist
rm -rf node_modules/.cache

echo "✅ Build artifacts cleaned"
EOL

chmod +x "scripts/maintenance/clean-artifacts.sh"
echo "  → Created clean-artifacts.sh"

cat > "scripts/maintenance/clean-logs.sh" << 'EOL'
#!/bin/bash
# Clean log files

echo "🧹 Cleaning log files..."

find . -name "*.log" -type f -delete
rm -rf logs/*.log 2>/dev/null || true

echo "✅ Log files cleaned"
EOL

chmod +x "scripts/maintenance/clean-logs.sh"
echo "  → Created clean-logs.sh"

echo -e "${GREEN}✅ Cleanup utilities created${NC}"
echo ""

# ============================================
# 7. SUMMARY
# ============================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✨ WORKSPACE ORGANIZATION COMPLETE!                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Organization Summary:${NC}"
echo "  ✅ Created organized directory structure"
echo "  ✅ Moved documentation to docs/"
echo "  ✅ Created documentation index files"
echo "  ✅ Organized utility scripts"
echo "  ✅ Created workspace index"
echo "  ✅ Added cleanup utilities"
echo ""
echo -e "${BLUE}📁 New Structure:${NC}"
echo "  → docs/            (all documentation)"
echo "  → scripts/         (organized utilities)"
echo "  → WORKSPACE_INDEX.md (quick reference)"
echo ""
echo -e "${BLUE}📚 Key Files:${NC}"
echo "  → docs/README.md"
echo "  → docs/quick-start/README.md"
echo "  → docs/deployment/README.md"
echo "  → WORKSPACE_INDEX.md"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "  1. Review WORKSPACE_INDEX.md"
echo "  2. Check docs/README.md for documentation index"
echo "  3. Update any internal links in documentation"
echo "  4. Commit organized structure"
echo ""
echo -e "${GREEN}🌾 Workspace is now beautifully organized! ⚡${NC}"
