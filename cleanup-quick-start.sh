#!/bin/bash
# 🌾 Farmers Market Platform - Quick Cleanup Script
# Divine Agricultural Repository Optimization
# Version: 1.0
# Date: January 2025

set -e  # Exit on error

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🌾 DIVINE AGRICULTURAL PLATFORM - QUICK CLEANUP          ║"
echo "║  Farmers Market Repository Optimization Script            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Safety check - ensure we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo -e "${RED}❌ Error: Not in Farmers Market Platform root directory${NC}"
    echo "Please run this script from the repository root."
    exit 1
fi

echo -e "${BLUE}🔍 Verifying repository location...${NC}"
echo "Current directory: $(pwd)"
echo ""

# Confirmation prompt
echo -e "${YELLOW}⚠️  WARNING: This script will:${NC}"
echo "  1. Delete corrupted Git attribute files"
echo "  2. Clean build artifacts (.next, .jest-cache, coverage, logs)"
echo "  3. Remove nested/scattered .vscode directories"
echo "  4. Clean empty directories"
echo "  5. Create archive structure (but NOT move files - manual review needed)"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# PHASE 1: Delete Corrupted Files
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}🗑️  Phase 1: Removing corrupted Git attribute files...${NC}"

CORRUPTED_FILES=(
    "h text eol=lf"
    "on text eol=lf"
    "ql text eol=lf"
    "s text eol=lf"
    "t text eol=lf"
    "text eol=lf"
    "vg binary"
    "vg text eol=lf"
    "Market Platform web and app"
)

DELETED_COUNT=0
for file in "${CORRUPTED_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo -e "  ${GREEN}✓${NC} Deleted: $file"
        ((DELETED_COUNT++))
    fi
done

# Check for files with broken names containing emojis
if ls t\ 📝* 2>/dev/null | grep -q .; then
    rm -f t\ 📝*
    echo -e "  ${GREEN}✓${NC} Deleted emoji-named files (t 📝...)"
    ((DELETED_COUNT++))
fi

if ls t\ 🔄* 2>/dev/null | grep -q .; then
    rm -f t\ 🔄*
    echo -e "  ${GREEN}✓${NC} Deleted emoji-named files (t 🔄...)"
    ((DELETED_COUNT++))
fi

if ls t\ 🔍* 2>/dev/null | grep -q .; then
    rm -f t\ 🔍*
    echo -e "  ${GREEN}✓${NC} Deleted emoji-named files (t 🔍...)"
    ((DELETED_COUNT++))
fi

if ls t\ 🔧* 2>/dev/null | grep -q .; then
    rm -f t\ 🔧*
    echo -e "  ${GREEN}✓${NC} Deleted emoji-named files (t 🔧...)"
    ((DELETED_COUNT++))
fi

if [ $DELETED_COUNT -eq 0 ]; then
    echo -e "  ${BLUE}ℹ${NC}  No corrupted files found (already clean)"
else
    echo -e "  ${GREEN}✅ Removed $DELETED_COUNT corrupted file(s)${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# PHASE 2: Clean Build Artifacts
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}🧹 Phase 2: Cleaning build artifacts...${NC}"

CLEANED_SIZE=0

# Function to get directory size (cross-platform)
get_size() {
    if [ -d "$1" ]; then
        du -sh "$1" 2>/dev/null | cut -f1 || echo "0"
    else
        echo "0"
    fi
}

# Clean .next
if [ -d ".next" ]; then
    SIZE=$(get_size ".next")
    rm -rf .next
    echo -e "  ${GREEN}✓${NC} Cleaned .next/ ($SIZE)"
fi

# Clean .jest-cache
if [ -d ".jest-cache" ]; then
    SIZE=$(get_size ".jest-cache")
    rm -rf .jest-cache
    echo -e "  ${GREEN}✓${NC} Cleaned .jest-cache/ ($SIZE)"
fi

# Clean coverage
if [ -d "coverage" ]; then
    SIZE=$(get_size "coverage")
    rm -rf coverage
    echo -e "  ${GREEN}✓${NC} Cleaned coverage/ ($SIZE)"
fi

# Clean playwright-report
if [ -d "playwright-report" ]; then
    SIZE=$(get_size "playwright-report")
    rm -rf playwright-report
    echo -e "  ${GREEN}✓${NC} Cleaned playwright-report/ ($SIZE)"
fi

# Clean .turbo
if [ -d ".turbo" ]; then
    SIZE=$(get_size ".turbo")
    rm -rf .turbo
    echo -e "  ${GREEN}✓${NC} Cleaned .turbo/ ($SIZE)"
fi

# Clean log files
LOG_COUNT=$(find . -maxdepth 1 -name "*.log" -type f 2>/dev/null | wc -l)
if [ $LOG_COUNT -gt 0 ]; then
    rm -f *.log
    echo -e "  ${GREEN}✓${NC} Cleaned $LOG_COUNT log file(s)"
fi

# Clean specific text files
TEXT_FILES=(
    "build-output.txt"
    "build-output.log"
    "test-results-final.txt"
    "coverage-baseline.txt"
    "phase4-bundle-analysis.log"
    "cleanup-log-20251122_101535.txt"
)

for file in "${TEXT_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo -e "  ${GREEN}✓${NC} Deleted: $file"
    fi
done

echo -e "  ${GREEN}✅ Build artifacts cleaned${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# PHASE 3: Clean .vscode Clutter
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}💻 Phase 3: Cleaning .vscode clutter...${NC}"

VSCODE_CLEANED=0

# Remove nested .vscode in root
if [ -d ".vscode/.vscode" ]; then
    rm -rf .vscode/.vscode
    echo -e "  ${GREEN}✓${NC} Removed .vscode/.vscode/ (nested)"
    ((VSCODE_CLEANED++))
fi

# Remove .vscode in src
if [ -d "src/.vscode" ]; then
    rm -rf src/.vscode
    echo -e "  ${GREEN}✓${NC} Removed src/.vscode/"
    ((VSCODE_CLEANED++))
fi

# Remove .vscode in docs
if [ -d "docs/.vscode" ]; then
    rm -rf docs/.vscode
    echo -e "  ${GREEN}✓${NC} Removed docs/.vscode/"
    ((VSCODE_CLEANED++))
fi

# Remove .vscode in .github/instructions
if [ -d ".github/instructions/.vscode" ]; then
    rm -rf .github/instructions/.vscode
    echo -e "  ${GREEN}✓${NC} Removed .github/instructions/.vscode/"
    ((VSCODE_CLEANED++))
fi

if [ $VSCODE_CLEANED -eq 0 ]; then
    echo -e "  ${BLUE}ℹ${NC}  No scattered .vscode directories found"
else
    echo -e "  ${GREEN}✅ Cleaned $VSCODE_CLEANED .vscode director(ies)${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# PHASE 4: Clean Empty Directories
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}📁 Phase 4: Removing empty directories...${NC}"

EMPTY_CLEANED=0

# Remove cleanup-logs if empty
if [ -d "cleanup-logs" ] && [ -z "$(ls -A cleanup-logs)" ]; then
    rmdir cleanup-logs
    echo -e "  ${GREEN}✓${NC} Removed empty cleanup-logs/"
    ((EMPTY_CLEANED++))
fi

if [ $EMPTY_CLEANED -eq 0 ]; then
    echo -e "  ${BLUE}ℹ${NC}  No empty directories to clean"
else
    echo -e "  ${GREEN}✅ Removed $EMPTY_CLEANED empty director(y/ies)${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# PHASE 5: Create Archive Structure
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}📦 Phase 5: Creating archive structure...${NC}"

mkdir -p archive/2024-Q4/phases
mkdir -p archive/2024-Q4/sessions
mkdir -p archive/2024-Q4/reports
mkdir -p archive/2025-Q1/phase-5
mkdir -p archive/2025-Q1/sessions
mkdir -p archive/2025-Q1/status
mkdir -p archive/2025-Q1/reports

echo -e "  ${GREEN}✓${NC} Created archive/2024-Q4/{phases,sessions,reports}"
echo -e "  ${GREEN}✓${NC} Created archive/2025-Q1/{phase-5,sessions,status,reports}"
echo -e "  ${GREEN}✅ Archive structure ready${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# PHASE 6: Documentation Analysis (DRY RUN)
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}📚 Phase 6: Documentation Analysis (DRY RUN)...${NC}"
echo -e "  ${YELLOW}⚠️  The following files SHOULD be archived (manual review needed):${NC}"
echo ""

echo -e "  ${BLUE}PHASE Documentation (for archive/2024-Q4/phases/):${NC}"
ls -1 PHASE_[2-4]*.md 2>/dev/null | head -5 | sed 's/^/    - /' || echo "    (none found)"

echo ""
echo -e "  ${BLUE}PHASE 5 Documentation (for archive/2025-Q1/phase-5/):${NC}"
ls -1 PHASE_5_*.md 2>/dev/null | grep -v "PHASE_5_README.md" | head -5 | sed 's/^/    - /' || echo "    (none found)"

echo ""
echo -e "  ${BLUE}Session Summaries (for archive/2025-Q1/sessions/):${NC}"
ls -1 SESSION_*.md SESSION_*.txt CONTINUATION_*.md 2>/dev/null | head -5 | sed 's/^/    - /' || echo "    (none found)"

echo ""
echo -e "  ${BLUE}Status Reports (for archive/2025-Q1/status/):${NC}"
ls -1 *_STATUS*.md PROJECT_STATUS.txt INTEGRATION_STATUS*.md 2>/dev/null | head -5 | sed 's/^/    - /' || echo "    (none found)"

echo ""
echo -e "  ${BLUE}Completion Reports (for archive/2025-Q1/reports/):${NC}"
ls -1 *_COMPLETE*.md EPIC_*.md VICTORY_*.md MISSION_*.md 2>/dev/null | head -5 | sed 's/^/    - /' || echo "    (none found)"

echo ""
echo -e "  ${YELLOW}ℹ${NC}  Total .md files in root: $(ls -1 *.md 2>/dev/null | wc -l)"
echo -e "  ${YELLOW}ℹ${NC}  Target: <10 .md files in root"
echo ""

# ═══════════════════════════════════════════════════════════════
# COMPLETION SUMMARY
# ═══════════════════════════════════════════════════════════════
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ CLEANUP COMPLETE!                                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${GREEN}Automated Cleanup Completed:${NC}"
echo "  ✓ Corrupted files removed"
echo "  ✓ Build artifacts cleaned"
echo "  ✓ .vscode clutter removed"
echo "  ✓ Empty directories cleaned"
echo "  ✓ Archive structure created"
echo ""

echo -e "${YELLOW}Manual Steps Required:${NC}"
echo "  1. Review documentation in root directory"
echo "  2. Move PHASE_* files to archive/2024-Q4/phases/"
echo "  3. Move SESSION_* files to archive/2025-Q1/sessions/"
echo "  4. Move *_STATUS* files to archive/2025-Q1/status/"
echo "  5. Move *_COMPLETE* files to archive/2025-Q1/reports/"
echo "  6. Keep only: README.md, QUICKSTART.md, CURRENT_STATUS.md, CHANGELOG.md, CONTRIBUTING.md"
echo "  7. Evaluate Farmers-Market/ directory (check for duplicates)"
echo "  8. Review jest.config.clean.js (compare with jest.config.js, delete if redundant)"
echo ""

echo -e "${BLUE}Testing Steps:${NC}"
echo "  1. Run: npm run build"
echo "  2. Run: npm test"
echo "  3. Verify all tests pass"
echo "  4. Commit changes: git add . && git commit -m 'chore: repository cleanup and optimization'"
echo ""

echo -e "${GREEN}📖 For detailed analysis, see: REPOSITORY_DEEP_ANALYSIS_2025.md${NC}"
echo ""

echo -e "${BLUE}Next Actions:${NC}"
echo "  • Review archive/ directory"
echo "  • Update dependencies (npm update)"
echo "  • Consolidate test directories (see REPOSITORY_DEEP_ANALYSIS_2025.md)"
echo "  • Standardize Docker scripts"
echo ""

echo "🌾 Divine repository consciousness restored! ✨"
echo ""

exit 0
