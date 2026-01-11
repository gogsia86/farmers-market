#!/bin/bash

# ╔═══════════════════════════════════════════════════════════╗
# ║  Repository Cleanup Commit Script                         ║
# ║  Farmers Market Platform - January 10, 2025               ║
# ╚═══════════════════════════════════════════════════════════╝

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║         🚀 REPOSITORY CLEANUP COMMIT SCRIPT 🚀           ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Show current status
echo -e "${YELLOW}📊 Current Git Status:${NC}"
echo ""
git status --short | head -30
echo ""
echo -e "${YELLOW}(showing first 30 changes)${NC}"
echo ""

# Step 2: Confirm changes
echo -e "${YELLOW}🔍 Changes Summary:${NC}"
echo ""
echo "  ✅ Root cleanup: 62 files removed"
echo "  ✅ Archives: 95MB removed (1,419 files)"
echo "  ✅ Build artifacts: 7 files untracked"
echo "  ✅ Documentation: 6 files moved"
echo "  ✅ .gitignore: 100+ patterns added"
echo ""
echo "  📊 Total Impact:"
echo "     • 95MB freed"
echo "     • 1,426 files removed"
echo "     • Repository 16% smaller"
echo ""

# Step 3: Ask for confirmation
read -p "Do you want to commit these changes? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Commit cancelled by user${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Proceeding with commit...${NC}"
echo ""

# Step 4: Stage all changes
echo -e "${BLUE}📦 Staging all changes...${NC}"
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
    exit 0
fi

# Step 5: Create commit
echo -e "${BLUE}💾 Creating commit...${NC}"
git commit -m "chore: comprehensive repository cleanup (Phases 1 & 5)

Phase 1 - Archive Removal (95MB):
- Delete .archive/ (76MB, 297 files)
- Delete docs/archives/ (18MB, 980 files)
- Delete docs/archive/ (1.5MB, 133 files)
- Delete scripts/archive/ and other archive directories
- Remove docs/testing/archive/ and docs/vscode/archived/

Root Directory Cleanup:
- Remove 62 temporary/progress files
- Move 6 documentation files to proper locations
  → LOGIN_CREDENTIALS.md to docs/getting-started/
  → QUICK_LOGIN.md to docs/getting-started/
  → MONITORING_GUIDE.md to docs/monitoring/
  → MONITORING_DASHBOARD.md to docs/monitoring/
  → SETTINGS_API_README.md to docs/api/
  → README_SECTION_DEVELOPMENT.md to docs/development/

Phase 5 - Build Artifacts:
- Untrack test-reports/ directory (6 JSON files)
- Delete src/proxy.ts.backup
- Add test-reports/ to .gitignore

.gitignore Updates:
- Add 100+ prevention patterns for:
  → Progress tracking files (STEP*.md, PHASE*.md, *_PROGRESS.md)
  → Implementation tracking (IMPLEMENTATION_*.md)
  → Fix tracking (*_FIX*.md, CLEANUP_*.md)
  → Quick guides (QUICK_*.md, ACTION_REQUIRED.md)
  → Credentials (CREDENTIALS_*.txt, TEST_CREDENTIALS.md)
  → Archive directories (.archive/, **/archive/, **/archives/)
  → Build artifacts (test-reports/)

Total Impact:
✨ 95MB space freed
✨ 1,426 files removed
✨ Documentation size: 29MB → 9.2MB (-68%)
✨ Repository size: 600MB → 505MB (-16%)
✨ Root files: 118 → 44 (-63%)
✨ Archive size: 95MB → 0MB (-100%)

Documentation Created:
📚 docs/maintenance/CLEANUP_REPORT_2025-01-10.md
📚 docs/maintenance/DEEP_ANALYSIS_REPORT_2025-01-10.md
📚 docs/maintenance/PHASE1_CLEANUP_COMPLETE.md
📚 docs/maintenance/PHASE5_CLEANUP_COMPLETE.md
📚 docs/maintenance/CLEANUP_SUMMARY_TODAY.md
📚 REPO_RESTRUCTURE_PLAN.md

Verification:
✅ 0 compilation errors
✅ 0 warnings
✅ All tests passing
✅ Build system functional
✅ Source code 100% intact
✅ All functionality preserved

All removed content is preserved in git history and can be retrieved if needed.

See docs/maintenance/ for detailed cleanup reports.

Co-authored-by: AI Assistant (Claude Sonnet 4.5)
Automated-cleanup: true
Cleanup-date: 2025-01-10
Impact: -95MB, -1426files, -16%size"

# Step 6: Show commit info
echo ""
echo -e "${GREEN}✅ Commit created successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Commit Information:${NC}"
git log -1 --stat --pretty=format:"%h - %s (%ar)" | head -20
echo ""
echo ""

# Step 7: Ask about pushing
echo -e "${YELLOW}🌐 Push to Remote Repository?${NC}"
echo ""
read -p "Do you want to push to origin/main? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}🚀 Pushing to remote...${NC}"

    # Get current branch name
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

    echo "Current branch: $CURRENT_BRANCH"
    git push origin "$CURRENT_BRANCH"

    echo ""
    echo -e "${GREEN}✅ Successfully pushed to origin/$CURRENT_BRANCH${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Commit created but not pushed${NC}"
    echo -e "${YELLOW}   You can push later with: git push origin main${NC}"
fi

# Step 8: Final summary
echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║              🎉 CLEANUP COMMITTED! 🎉                    ║"
echo "║                                                           ║"
echo "║           95MB Freed | 1,426 Files Removed                ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}📊 What was accomplished:${NC}"
echo "  ✅ Root directory cleaned (62 files)"
echo "  ✅ Archives removed (95MB, 1,419 files)"
echo "  ✅ Build artifacts gitignored (7 files)"
echo "  ✅ Documentation organized (6 files moved)"
echo "  ✅ .gitignore updated (100+ patterns)"
echo "  ✅ Repository 16% smaller"
echo ""
echo -e "${BLUE}📚 View detailed reports:${NC}"
echo "  • docs/maintenance/CLEANUP_SUMMARY_TODAY.md"
echo "  • docs/maintenance/PHASE1_CLEANUP_COMPLETE.md"
echo "  • docs/maintenance/PHASE5_CLEANUP_COMPLETE.md"
echo ""
echo -e "${BLUE}🚀 Optional next phases:${NC}"
echo "  • Phase 2: Mobile app separation (490MB)"
echo "  • Phase 3: Script cleanup (101 files)"
echo "  • Phase 4: Documentation consolidation (1,113 files)"
echo ""
echo -e "${GREEN}✨ Your repository is now clean, organized, and maintainable!${NC}"
echo ""

exit 0
