#!/bin/bash
# ╔════════════════════════════════════════════════════════════════════╗
# ║ 🧹 FARMERS MARKET PLATFORM - DOCUMENTATION CLEANUP SCRIPT         ║
# ║ Consolidates 100+ scattered documentation files into organized    ║
# ║ structure with historical archival                                 ║
# ╚════════════════════════════════════════════════════════════════════╝

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║ 🧹 Starting Documentation Cleanup                                 ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# STEP 1: Create Directory Structure
# ============================================================================
echo -e "${BLUE}📁 Creating directory structure...${NC}"

mkdir -p docs/archive/2024/{phases,sessions,reports}
mkdir -p docs/archive/2025/january
mkdir -p docs/current
mkdir -p docs/deployment
mkdir -p docs/guides

echo -e "${GREEN}✅ Directory structure created${NC}"
echo ""

# ============================================================================
# STEP 2: Move Phase Reports
# ============================================================================
echo -e "${BLUE}📦 Moving phase reports...${NC}"

# Move PHASE1-5 files
mv PHASE1_*.md docs/archive/2024/phases/ 2>/dev/null || true
mv PHASE2_*.md docs/archive/2024/phases/ 2>/dev/null || true
mv PHASE3_*.md docs/archive/2024/phases/ 2>/dev/null || true
mv PHASE_3_*.md docs/archive/2024/phases/ 2>/dev/null || true
mv PHASE_4_*.md docs/archive/2024/phases/ 2>/dev/null || true
mv PHASE_5_*.md docs/archive/2024/phases/ 2>/dev/null || true
mv REFACTORING_PHASE*.md docs/archive/2024/phases/ 2>/dev/null || true

PHASE_COUNT=$(find docs/archive/2024/phases/ -name "*.md" 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Moved ${PHASE_COUNT} phase reports${NC}"
echo ""

# ============================================================================
# STEP 3: Move Session Reports
# ============================================================================
echo -e "${BLUE}📝 Moving session reports...${NC}"

mv SESSION_*.md docs/archive/2024/sessions/ 2>/dev/null || true
mv CONTINUATION_COMPLETE.md docs/archive/2024/sessions/ 2>/dev/null || true
mv CONTINUATION_SESSION_*.md docs/archive/2024/sessions/ 2>/dev/null || true
mv FINAL_SESSION_*.md docs/archive/2024/sessions/ 2>/dev/null || true
mv CHECKOUT_SESSION_*.md docs/archive/2024/sessions/ 2>/dev/null || true

SESSION_COUNT=$(find docs/archive/2024/sessions/ -name "*.md" 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Moved ${SESSION_COUNT} session reports${NC}"
echo ""

# ============================================================================
# STEP 4: Move Completion/Summary Reports
# ============================================================================
echo -e "${BLUE}📊 Moving completion and status reports...${NC}"

mv API_DOCS_GENERATION_COMPLETE.md docs/archive/2024/reports/ 2>/dev/null || true
mv BUILD_COMPLETE.md docs/archive/2024/reports/ 2>/dev/null || true
mv BUILD_VERIFICATION_EXECUTIVE_SUMMARY.md docs/archive/2024/reports/ 2>/dev/null || true
mv CHECKOUT_SERVICE_FINAL_STATUS.md docs/archive/2024/reports/ 2>/dev/null || true
mv CHECKOUT_SERVICE_MIGRATION_COMPLETE.md docs/archive/2024/reports/ 2>/dev/null || true
mv CHECKOUT_TEST_COMPLETION_REPORT.md docs/archive/2024/reports/ 2>/dev/null || true
mv CHECKOUT_TEST_MIGRATION_STATUS.md docs/archive/2024/reports/ 2>/dev/null || true
mv CONTROLLER_VICTORY_SUMMARY.md docs/archive/2024/reports/ 2>/dev/null || true
mv FARM_SERVICE_FIX_COMPLETE.md docs/archive/2024/reports/ 2>/dev/null || true
mv FINAL_CONTROLLER_STATUS_REPORT.md docs/archive/2024/reports/ 2>/dev/null || true
mv FIX_COMPLETION_REPORT.md docs/archive/2024/reports/ 2>/dev/null || true
mv ORDER_CONTROLLER_COMPLETION_SUMMARY.md docs/archive/2024/reports/ 2>/dev/null || true
mv PAYMENT_SERVICE_MIGRATION_SUMMARY.md docs/archive/2024/reports/ 2>/dev/null || true
mv PROJECT_COMPLETE.md docs/archive/2024/reports/ 2>/dev/null || true
mv PROJECT_COMPLETION_SUMMARY.md docs/archive/2024/reports/ 2>/dev/null || true
mv PROJECT_STATUS_SUMMARY.md docs/archive/2024/reports/ 2>/dev/null || true
mv REPOSITORY_CLEANUP_SUMMARY.md docs/archive/2024/reports/ 2>/dev/null || true
mv DEPENDENCY_UPDATE_*.md docs/archive/2024/reports/ 2>/dev/null || true
mv REFACTORING_DAY1_SUMMARY.md docs/archive/2024/reports/ 2>/dev/null || true
mv REFACTORING_PHASE1_PROGRESS.md docs/archive/2024/reports/ 2>/dev/null || true
mv REFACTORING_PHASE2_PROGRESS.md docs/archive/2024/reports/ 2>/dev/null || true
mv REFACTORING_PHASE3_PROGRESS.md docs/archive/2024/reports/ 2>/dev/null || true
mv IMMEDIATE_ACTION_REQUIRED.md docs/archive/2024/reports/ 2>/dev/null || true
mv IMMEDIATE_BUILD_FIX.md docs/archive/2024/reports/ 2>/dev/null || true
mv DOCKER_CLEANUP_REPORT.md docs/archive/2024/reports/ 2>/dev/null || true
mv WHAT_TO_DO_NEXT.md docs/archive/2024/reports/ 2>/dev/null || true

REPORT_COUNT=$(find docs/archive/2024/reports/ -name "*.md" 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Moved ${REPORT_COUNT} completion/status reports${NC}"
echo ""

# ============================================================================
# STEP 5: Move Active Documentation
# ============================================================================
echo -e "${BLUE}📚 Moving active documentation...${NC}"

mv DEPLOYMENT_READINESS_CHECKLIST.md docs/current/ 2>/dev/null || true
mv DEPLOYMENT_RUNBOOK.md docs/current/ 2>/dev/null || true
mv DEVELOPER_QUICK_REFERENCE.md docs/current/ 2>/dev/null || true
mv DOCUMENTATION_INDEX.md docs/current/ 2>/dev/null || true
mv EXECUTIVE_SUMMARY.md docs/current/ 2>/dev/null || true
mv FRONTEND_INTEGRATION_GUIDE.md docs/current/ 2>/dev/null || true
mv INTEGRATION_TEST_SCENARIOS.md docs/current/ 2>/dev/null || true
mv LAUNCH_DAY_RUNBOOK.md docs/current/ 2>/dev/null || true
mv TECHNICAL_DEBT.md docs/current/ 2>/dev/null || true
mv ARCHITECTURE_DIAGRAM.md docs/current/ 2>/dev/null || true
mv FULL_ARCHITECTURE_DIAGRAM.md docs/current/ 2>/dev/null || true
mv FULL_ARCHITECTURE_DIAGRAM.pdf docs/current/ 2>/dev/null || true

CURRENT_COUNT=$(find docs/current/ -name "*.md" -o -name "*.pdf" 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Moved ${CURRENT_COUNT} active documents${NC}"
echo ""

# ============================================================================
# STEP 6: Move Deployment Documentation
# ============================================================================
echo -e "${BLUE}🚀 Moving deployment documentation...${NC}"

mv DOCKER_DEPLOYMENT.md docs/deployment/ 2>/dev/null || true
mv DEPLOY_TO_STAGING_NOW.md docs/deployment/ 2>/dev/null || true
mv STAGING_DEPLOYMENT_QUICKSTART.md docs/deployment/ 2>/dev/null || true
mv VERCEL_*.md docs/deployment/ 2>/dev/null || true
mv PRODUCTION_DEPLOYMENT_FINAL.md docs/deployment/ 2>/dev/null || true
mv UPLOAD_TO_VERCEL_NOW.md docs/deployment/ 2>/dev/null || true

DEPLOY_COUNT=$(find docs/deployment/ -name "*.md" 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Moved ${DEPLOY_COUNT} deployment documents${NC}"
echo ""

# ============================================================================
# STEP 7: Move Guides and Reference Documentation
# ============================================================================
echo -e "${BLUE}📖 Moving guides and reference docs...${NC}"

mv CONTINUATION_GUIDE.md docs/guides/ 2>/dev/null || true
mv REFACTORING_PLAN.md docs/guides/ 2>/dev/null || true
mv REFACTORING_QUICK_REFERENCE.md docs/guides/ 2>/dev/null || true
mv REFACTORING_PHASE1_KICKOFF.md docs/guides/ 2>/dev/null || true
mv REFACTORING_PHASE2_KICKOFF.md docs/guides/ 2>/dev/null || true
mv REFACTORING_PHASE3_KICKOFF.md docs/guides/ 2>/dev/null || true
mv REFACTORING_PHASE3_ANALYSIS.md docs/guides/ 2>/dev/null || true
mv REFACTORING_PHASE3_DAY1_COMPLETE.md docs/guides/ 2>/dev/null || true
mv RESTRUCTURE_*.md docs/guides/ 2>/dev/null || true
mv SERVICE_RESPONSE_QUICK_REFERENCE.md docs/guides/ 2>/dev/null || true
mv ZOD_MIGRATION_NOTES.md docs/guides/ 2>/dev/null || true
mv WEBSITE_RESTRUCTURE_ANALYSIS.md docs/guides/ 2>/dev/null || true

GUIDE_COUNT=$(find docs/guides/ -name "*.md" 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Moved ${GUIDE_COUNT} guide documents${NC}"
echo ""

# ============================================================================
# STEP 8: Rename Current Status
# ============================================================================
echo -e "${BLUE}🔄 Renaming current status file...${NC}"

if [ -f "CURRENT_STATUS_JANUARY_2025.md" ]; then
    mv CURRENT_STATUS_JANUARY_2025.md STATUS.md
    echo -e "${GREEN}✅ Renamed CURRENT_STATUS_JANUARY_2025.md → STATUS.md${NC}"
else
    echo -e "${YELLOW}⚠️  CURRENT_STATUS_JANUARY_2025.md not found${NC}"
fi
echo ""

# ============================================================================
# STEP 9: Create Documentation Index
# ============================================================================
echo -e "${BLUE}📋 Creating documentation index...${NC}"

cat > docs/INDEX.md << 'EOF'
# 📚 Farmers Market Platform - Documentation Index

Welcome to the Farmers Market Platform documentation! This index helps you navigate all available documentation.

---

## 🚀 Getting Started

Essential documents to get you up and running:

- [**README**](../README.md) - Project overview and main documentation
- [**Quick Start Guide**](../QUICK_START.md) - Get started in minutes
- [**Contributing Guidelines**](../CONTRIBUTING.md) - How to contribute
- [**Current Status**](../STATUS.md) - Latest project status (Updated: January 2025)

---

## 📊 Current Project Status

- **Latest Status**: [STATUS.md](../STATUS.md) - Comprehensive current state
- **Changelog**: [CHANGELOG.md](../CHANGELOG.md) - Version history and updates

---

## 📚 Active Documentation

Essential documentation for current development:

### 👨‍💻 For Developers
- [Developer Quick Reference](current/DEVELOPER_QUICK_REFERENCE.md) - Quick command reference
- [Frontend Integration Guide](current/FRONTEND_INTEGRATION_GUIDE.md) - Frontend integration patterns
- [Integration Test Scenarios](current/INTEGRATION_TEST_SCENARIOS.md) - Testing strategies
- [Technical Debt Tracker](current/TECHNICAL_DEBT.md) - Known issues and improvements

### 🏗️ Architecture
- [Architecture Overview](current/ARCHITECTURE_DIAGRAM.md) - System architecture
- [Full Architecture Diagram](current/FULL_ARCHITECTURE_DIAGRAM.md) - Detailed architecture

### 📋 Project Management
- [Executive Summary](current/EXECUTIVE_SUMMARY.md) - High-level project overview
- [Launch Day Runbook](current/LAUNCH_DAY_RUNBOOK.md) - Production launch procedures
- [Deployment Readiness Checklist](current/DEPLOYMENT_READINESS_CHECKLIST.md) - Pre-deployment checklist

---

## 🚢 Deployment Documentation

Everything you need to deploy the platform:

- [**Docker Deployment Guide**](deployment/DOCKER_DEPLOYMENT.md) - Containerized deployment
- [**Staging Deployment Quickstart**](deployment/STAGING_DEPLOYMENT_QUICKSTART.md) - Deploy to staging in 30 minutes
- [**Vercel Deployment Guide**](deployment/VERCEL_DEPLOYMENT_GUIDE.md) - Deploy to Vercel
- [**Production Deployment**](deployment/PRODUCTION_DEPLOYMENT_FINAL.md) - Production deployment procedures
- [Deployment Runbook](current/DEPLOYMENT_RUNBOOK.md) - Operations runbook

---

## 📖 API Documentation

Complete API reference and integration guides:

- [**API Reference**](api/API_REFERENCE.md) - Quick API reference
- [**Getting Started with API**](api/GETTING_STARTED.md) - Complete API usage guide
- [**OpenAPI Specification**](api/openapi.json) - OpenAPI 3.0 spec
- [**Swagger UI**](api/index.html) - Interactive API explorer (open in browser)
- [**Postman Collection**](api/postman-collection.json) - Import for testing

### Using the API Documentation
```bash
# View Swagger UI locally
npx serve docs/api
# Then open: http://localhost:3000/api

# Import Postman collection
# File → Import → docs/api/postman-collection.json
```

---

## 📖 Guides & Tutorials

How-to guides and best practices:

- [Continuation Guide](guides/CONTINUATION_GUIDE.md) - Session continuation patterns
- [Refactoring Plan](guides/REFACTORING_PLAN.md) - Refactoring strategies
- [Quick Reference](guides/REFACTORING_QUICK_REFERENCE.md) - Quick refactoring patterns
- [Service Response Pattern](guides/SERVICE_RESPONSE_QUICK_REFERENCE.md) - API response patterns
- [Zod Migration Notes](guides/ZOD_MIGRATION_NOTES.md) - Validation migration guide

---

## 📦 Historical Archive

Historical reports and session summaries (for reference):

### 2024 Development History
- [**Phase Reports**](archive/2024/phases/) - All phase completion reports (Phases 1-5)
- [**Session Reports**](archive/2024/sessions/) - Daily session summaries
- [**Completion Reports**](archive/2024/reports/) - Feature completion reports

### 2025 Development
- [**January 2025**](archive/2025/january/) - Latest session archives

---

## 🔧 Quick Command Reference

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run test             # Run tests
npm run lint             # Lint code
```

### Docker
```bash
npm run docker:up        # Start production Docker
npm run docker:up-dev    # Start development Docker
npm run docker:down      # Stop all containers
npm run docker:logs      # View logs
```

### Database
```bash
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
```

---

## 📞 Getting Help

- **Issues**: Check [Technical Debt Tracker](current/TECHNICAL_DEBT.md)
- **Questions**: See [Contributing Guidelines](../CONTRIBUTING.md)
- **API Help**: Read [API Getting Started](api/GETTING_STARTED.md)

---

## 🗺️ Documentation Navigation Tips

1. **Start with [README.md](../README.md)** for project overview
2. **Use [Quick Start](../QUICK_START.md)** to get running quickly
3. **Check [STATUS.md](../STATUS.md)** for current project state
4. **Browse [API docs](api/)** for backend integration
5. **Refer to [guides](guides/)** for specific patterns
6. **Archive is read-only** - for historical reference only

---

## 📊 Documentation Statistics

- **Total Documentation Files**: 100+ files
- **Active Documents**: ~20 files
- **API Endpoints Documented**: 19+ endpoints
- **Archived Reports**: 80+ historical files
- **Last Updated**: January 2025

---

**Navigation Tip**: Use your editor's file search (Ctrl+P / Cmd+P) to quickly find documents by name!

---

*Documentation organized with agricultural consciousness* 🌾📚✨
EOF

echo -e "${GREEN}✅ Created docs/INDEX.md${NC}"
echo ""

# ============================================================================
# STEP 10: Summary Report
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║ ✅ DOCUMENTATION CLEANUP COMPLETE!                                ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}📊 Summary:${NC}"
echo "   ├─ Phase reports:      ${PHASE_COUNT} files → docs/archive/2024/phases/"
echo "   ├─ Session reports:    ${SESSION_COUNT} files → docs/archive/2024/sessions/"
echo "   ├─ Status reports:     ${REPORT_COUNT} files → docs/archive/2024/reports/"
echo "   ├─ Active docs:        ${CURRENT_COUNT} files → docs/current/"
echo "   ├─ Deployment docs:    ${DEPLOY_COUNT} files → docs/deployment/"
echo "   ├─ Guides:             ${GUIDE_COUNT} files → docs/guides/"
echo "   └─ API docs:           Already in docs/api/"
echo ""
echo -e "${GREEN}📁 New structure:${NC}"
echo "   ├─ docs/"
echo "   │  ├─ INDEX.md              ← Start here for navigation"
echo "   │  ├─ api/                  ← API documentation"
echo "   │  ├─ current/              ← Active documentation"
echo "   │  ├─ deployment/           ← Deployment guides"
echo "   │  ├─ guides/               ← How-to guides"
echo "   │  └─ archive/              ← Historical reports"
echo "   └─ Root *.md files          ← Only 6 essential files"
echo ""
echo -e "${BLUE}📖 Next steps:${NC}"
echo "   1. Review the new structure: ls -la docs/"
echo "   2. Check navigation index: cat docs/INDEX.md"
echo "   3. Verify root is clean: ls -la *.md"
echo "   4. Commit changes: git add -A && git commit -m 'Organize documentation'"
echo ""
echo -e "${GREEN}🎉 Your documentation is now organized and maintainable!${NC}"
echo ""
