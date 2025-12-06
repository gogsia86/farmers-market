#!/bin/bash
# 🌾 Farmers Market Platform - Master Repository Cleanup Script
# Version: 1.0
# Last Updated: December 2024
#
# This script performs a comprehensive cleanup of the repository:
# - Removes backup directories
# - Removes build artifacts
# - Removes temporary files
# - Reorganizes documentation
# - Updates .gitignore

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_header() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Main header
clear
echo "════════════════════════════════════════════════════════════"
echo "🌾 Farmers Market Platform - Repository Cleanup"
echo "════════════════════════════════════════════════════════════"
echo ""

# Backup timestamp
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
print_header "📅 Cleanup Session: $BACKUP_DATE"
echo ""

# Confirm before proceeding
print_warning "This script will:"
echo "  1. Delete backup directories (~200-500MB)"
echo "  2. Delete build artifacts (~500MB-1GB)"
echo "  3. Delete temporary files"
echo "  4. Reorganize documentation into /docs"
echo "  5. Update .gitignore"
echo ""
read -p "Continue with cleanup? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Cleanup cancelled by user"
    exit 1
fi

echo ""
print_header "Starting cleanup process..."
echo ""

# ═══════════════════════════════════════════════════════════
# PHASE 1: Remove Backup Directories
# ═══════════════════════════════════════════════════════════
print_header "🧹 Phase 1: Removing backup directories..."

backup_dirs=(
    ".import-fix-backups"
    ".migration-backups"
    "backup-route-cleanup-20251202-012226"
    "backup-route-cleanup-20251202-012232"
    "backup-route-cleanup-20251202-012423"
    "cleanup-backup-20251201-224538"
)

for dir in "${backup_dirs[@]}"; do
    if [ -d "$dir" ]; then
        rm -rf "$dir"
        echo "  Deleted: $dir"
    else
        echo "  Skipped: $dir (not found)"
    fi
done

print_success "Phase 1 complete - Backup directories removed"
echo ""

# ═══════════════════════════════════════════════════════════
# PHASE 2: Remove Build Artifacts
# ═══════════════════════════════════════════════════════════
print_header "🧹 Phase 2: Removing build artifacts..."

build_dirs=(
    ".next"
    "dist"
    ".jest-cache"
    ".stripe-cli"
    ".vs"
)

for dir in "${build_dirs[@]}"; do
    if [ -d "$dir" ]; then
        rm -rf "$dir"
        echo "  Deleted: $dir"
    else
        echo "  Skipped: $dir (not found)"
    fi
done

print_success "Phase 2 complete - Build artifacts removed"
echo ""

# ═══════════════════════════════════════════════════════════
# PHASE 3: Remove Temporary Files
# ═══════════════════════════════════════════════════════════
print_header "🧹 Phase 3: Removing temporary files..."

temp_files=(
    "lint-report.txt"
    "verification-report.json"
    "verification-report-enhanced.json"
    "Market Platform web and app"
    "nul"
)

for file in "${temp_files[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "  Deleted: $file"
    else
        echo "  Skipped: $file (not found)"
    fi
done

# Remove empty monitoring-reports directory
if [ -d "monitoring-reports" ]; then
    rm -rf "monitoring-reports"
    echo "  Deleted: monitoring-reports/"
fi

print_success "Phase 3 complete - Temporary files removed"
echo ""

# ═══════════════════════════════════════════════════════════
# PHASE 4: Reorganize Documentation
# ═══════════════════════════════════════════════════════════
print_header "📚 Phase 4: Reorganizing documentation..."

# Create directory structure
mkdir -p docs/status-reports/dec-2024
mkdir -p docs/implementation
mkdir -p docs/checklists
mkdir -p docs/archives
echo "  Created: docs/ directory structure"

# Move status reports
status_reports=(
    "ANALYSIS_SUMMARY_DEC2024.md"
    "BUILD_SUCCESS.md"
    "CLEANUP_COMPLETE.md"
    "FIXES_COMPLETE_DEC2024.md"
    "STATUS_REPORT.md"
    "📊_ANALYSIS_COMPLETE.md"
    "📊_TEST_AND_BOT_ANALYSIS_REPORT.md"
    "✅_ALL_FIXES_COMPLETE.md"
    "✅_MONITORING_BOT_V2_UPGRADE_COMPLETE.md"
    "🎉_FIX_SUMMARY_QUICK_REF.md"
)

for file in "${status_reports[@]}"; do
    if [ -f "$file" ]; then
        mv -f "$file" docs/status-reports/dec-2024/
        echo "  Moved: $file → docs/status-reports/dec-2024/"
    fi
done

# Move implementation docs
implementation_docs=(
    "FARM_DETAIL_API_IMPLEMENTATION.md"
    "IMPLEMENTATION_ROADMAP.md"
    "IMPLEMENTATION_SUMMARY.md"
    "✅_FARM_API_COMPLETE.md"
    "✅_FARM_PAGES_API_WIRED.md"
    "🤖_BOT_READY_SUMMARY.md"
    "🚀_QUICK_IMPLEMENTATION_GUIDE.md"
)

for file in "${implementation_docs[@]}"; do
    if [ -f "$file" ]; then
        mv -f "$file" docs/implementation/
        echo "  Moved: $file → docs/implementation/"
    fi
done

# Move checklists
checklists=(
    "QA_CHECKLIST.md"
    "🎯_RUN_BOT_CHECKLIST.md"
)

for file in "${checklists[@]}"; do
    if [ -f "$file" ]; then
        mv -f "$file" docs/checklists/
        echo "  Moved: $file → docs/checklists/"
    fi
done

# Keep deployment checklist at root, but copy to docs
if [ -f "DEPLOYMENT_CHECKLIST.md" ]; then
    cp "DEPLOYMENT_CHECKLIST.md" docs/checklists/
    echo "  Copied: DEPLOYMENT_CHECKLIST.md → docs/checklists/"
fi

# Move archives
archive_docs=(
    "COMPREHENSIVE_PAGE_AUDIT.md"
    "COMPREHENSIVE_STRUCTURE_ANALYSIS.md"
    "FINAL_ANALYSIS_AND_FIX.md"
    "FINAL_AUDIT_REPORT.md"
    "TYPESCRIPT_FIXES_SUMMARY.md"
    "WEBSITE_STRUCTURE_ANALYSIS_AND_RECOMMENDATIONS.md"
    "WEBSITE_STRUCTURE_UPGRADE_ANALYSIS.md"
    "WEBSITE_VISUAL_STRUCTURE.md"
    "100_PERCENT_ACHIEVEMENT_PLAN.md"
    "100_PERCENT_PRODUCTION_READY.md"
    "ACTION_PLAN_IMMEDIATE.md"
    "CURRENT_STATUS_AND_NEXT_STEPS.md"
    "DOCUMENTATION_REVIEW_COMPLETE.md"
    "HEADER_FOOTER_EMERGENCY_FIX.md"
    "IMPLEMENTATION_COMPLETE.md"
)

for file in "${archive_docs[@]}"; do
    if [ -f "$file" ]; then
        mv -f "$file" docs/archives/
        echo "  Moved: $file → docs/archives/"
    fi
done

# Move executive summaries to main docs
executive_docs=(
    "EXECUTIVE_PLATFORM_SUMMARY.md"
    "EXECUTIVE_SUMMARY.md"
    "🎯_EXECUTIVE_BRIEFING.md"
    "🎯_EXECUTIVE_SUMMARY.md"
)

for file in "${executive_docs[@]}"; do
    if [ -f "$file" ]; then
        mv -f "$file" docs/
        echo "  Moved: $file → docs/"
    fi
done

# Move feature and reference docs
reference_docs=(
    "FEATURE_MATRIX.md"
    "VISUAL_SITEMAP_DIAGRAM.md"
    "QUICK_FIX_GUIDE.md"
    "QUICK_REFERENCE.md"
    "📖_COMPLETE_AUDIT_INDEX.md"
    "📚_DOCUMENTATION_INDEX.md"
)

for file in "${reference_docs[@]}"; do
    if [ -f "$file" ]; then
        mv -f "$file" docs/
        echo "  Moved: $file → docs/"
    fi
done

# Move fixes directory
if [ -d "fixes" ]; then
    if [ "$(ls -A fixes)" ]; then
        mv fixes/*.md docs/implementation/ 2>/dev/null || true
        echo "  Moved: fixes/*.md → docs/implementation/"
    fi
    rmdir fixes 2>/dev/null || true
    echo "  Deleted: fixes/ directory"
fi

print_success "Phase 4 complete - Documentation reorganized"
echo ""

# ═══════════════════════════════════════════════════════════
# PHASE 5: Update .gitignore
# ═══════════════════════════════════════════════════════════
print_header "🔧 Phase 5: Updating .gitignore..."

# Check if the cleanup rules are already present
if ! grep -q "🧹 Additional Cleanup Rules" .gitignore; then
    cat >> .gitignore << 'EOF'

# ═══════════════════════════════════════════════════════════
# 🧹 Additional Cleanup Rules
# ═══════════════════════════════════════════════════════════
# Backup directories
*-backup*/
backup-*/
.import-fix-backups/
.migration-backups/

# Visual Studio Solution
*.slnx

# Verification reports
verification-report*.json

# Lint reports
lint-report.txt

# IDE workspace files
*.code-workspace
EOF
    print_success "Phase 5 complete - .gitignore updated"
else
    echo "  Cleanup rules already present in .gitignore"
    print_success "Phase 5 complete - .gitignore verified"
fi
echo ""

# ═══════════════════════════════════════════════════════════
# PHASE 6: Create Documentation Index
# ═══════════════════════════════════════════════════════════
print_header "📝 Phase 6: Creating documentation index..."

cat > docs/README.md << 'EOF'
# 📚 Farmers Market Platform - Documentation

Complete documentation for the Farmers Market Platform.

## 📖 Quick Navigation

### Essential Documentation (Root Level)
- [Main README](../README.md) - Project overview and getting started
- [Project Structure](../PROJECT_STRUCTURE.md) - Architecture overview
- [Quick Start Guide](../QUICK_START_GUIDE.md) - Setup instructions
- [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md) - Production deployment guide

### Implementation Guides
Located in `implementation/`:
- Farm API implementation details
- Monitoring bot setup
- Quick implementation guides
- Feature-specific implementations

### Status Reports
Located in `status-reports/dec-2024/`:
- December 2024 analysis reports
- Build success reports
- Fix completion reports
- Test and bot analysis

### Checklists
Located in `checklists/`:
- QA checklist
- Deployment checklist
- Bot run checklist

### Reference Documentation
- Executive summaries and briefings
- Feature matrix
- Visual sitemap
- Quick reference guides
- Complete audit index

### Archives
Located in `archives/`:
- Historical analysis reports
- Completed implementation plans
- Structure upgrade analysis
- TypeScript fixes summary

## 🗂️ Directory Structure

```
docs/
├── README.md                    # This file
├── status-reports/              # Build and analysis reports
│   └── dec-2024/               # December 2024 reports
├── implementation/              # Implementation guides
├── checklists/                  # QA and deployment checklists
├── archives/                    # Historical documentation
├── EXECUTIVE_PLATFORM_SUMMARY.md
├── FEATURE_MATRIX.md
├── QUICK_REFERENCE.md
└── ...
```

## 🔍 Finding Information

### For New Developers
1. Start with [Main README](../README.md)
2. Read [Quick Start Guide](../QUICK_START_GUIDE.md)
3. Review [Project Structure](../PROJECT_STRUCTURE.md)

### For Deployment
1. Check [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md)
2. Review `checklists/QA_CHECKLIST.md`

### For Feature Implementation
1. Check `implementation/` directory
2. Review [Feature Matrix](FEATURE_MATRIX.md)
3. Consult [Quick Reference](QUICK_REFERENCE.md)

### For Platform Overview
1. Read [Executive Summary](EXECUTIVE_PLATFORM_SUMMARY.md)
2. Review [Feature Matrix](FEATURE_MATRIX.md)
3. Check [Visual Sitemap](VISUAL_SITEMAP_DIAGRAM.md)

---

**Last Updated**: December 2024
**Status**: ✅ Complete and Organized
EOF

print_success "Phase 6 complete - Documentation index created"
echo ""

# ═══════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════
echo "════════════════════════════════════════════════════════════"
print_header "🎉 Cleanup Complete!"
echo "════════════════════════════════════════════════════════════"
echo ""
print_success "Summary of Changes:"
echo "  ✅ Removed 6 backup directories"
echo "  ✅ Removed build artifacts (.next, dist, .jest-cache)"
echo "  ✅ Removed temporary files"
echo "  ✅ Reorganized 40+ documentation files"
echo "  ✅ Updated .gitignore with cleanup rules"
echo "  ✅ Created documentation index"
echo ""
print_header "📊 Estimated Space Savings: 700MB - 1.5GB"
echo ""
print_warning "Next Steps:"
echo "  1. Review changes: git status"
echo "  2. Test build: npm run build"
echo "  3. Run tests: npm test"
echo "  4. Review docs: cat docs/README.md"
echo "  5. Commit: git add . && git commit -m 'chore: cleanup repository and reorganize documentation'"
echo ""
print_header "📁 Documentation Location: ./docs/"
echo ""
echo "════════════════════════════════════════════════════════════"
print_success "Repository cleanup completed successfully!"
echo "════════════════════════════════════════════════════════════"
echo ""
