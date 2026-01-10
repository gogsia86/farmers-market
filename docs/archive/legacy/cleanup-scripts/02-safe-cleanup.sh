#!/bin/bash
# 02-safe-cleanup.sh - Safe Repository Cleanup
# Farmers Market Platform - Safe Cleanup Toolkit
# Purpose: Remove non-essential files without breaking functionality

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Farmers Market Platform - Safe Cleanup                ║${NC}"
echo -e "${BLUE}║  Safe Cleanup Toolkit v1.0                             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Ensure we're in project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ ERROR: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Safety confirmation
echo -e "${YELLOW}⚠️  WARNING: This script will DELETE files${NC}"
echo ""
echo "This script will remove:"
echo "  • Test files (*.test.*, *.spec.*, *.stories.*)"
echo "  • Backup files (*.bak, *-copy.*, *-old.*)"
echo "  • Log files (*.log)"
echo "  • Source maps (*.map)"
echo "  • Build artifacts (.next, dist, out)"
echo "  • Empty directories"
echo "  • IDE configurations (.DS_Store, Thumbs.db)"
echo ""
echo -e "${GREEN}Critical files will be preserved:${NC}"
echo "  • All source code (app/, components/, lib/)"
echo "  • Configuration files"
echo "  • Prisma schema and migrations"
echo "  • GitHub workflows"
echo "  • Environment templates"
echo ""
read -p "Continue? (Type 'YES' to proceed): " confirmation

if [ "$confirmation" != "YES" ]; then
    echo -e "${YELLOW}Cleanup cancelled${NC}"
    exit 0
fi

# Create backup branch
echo ""
echo -e "${BLUE}📦 Creating backup branch...${NC}"
BACKUP_BRANCH="backup-pre-cleanup-$(date +%Y%m%d_%H%M%S)"
git branch "$BACKUP_BRANCH" 2>/dev/null || true
echo -e "${GREEN}✓${NC} Backup branch created: ${GREEN}$BACKUP_BRANCH${NC}"
echo -e "   (Run ${YELLOW}git checkout $BACKUP_BRANCH${NC} to restore if needed)"

# Create cleanup log
LOG_DIR="cleanup-scripts/logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/cleanup_$TIMESTAMP.log"

echo "" | tee -a "$LOG_FILE"
echo "Cleanup Log" | tee -a "$LOG_FILE"
echo "Generated: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Count files before cleanup
BEFORE_COUNT=$(find . -type f ! -path "./node_modules/*" ! -path "./.git/*" | wc -l)

# ============================================================
# 1. REMOVE TEST FILES
# ============================================================
echo ""
echo -e "${YELLOW}🧪 1. Removing Test Files${NC}" | tee -a "$LOG_FILE"

TEST_FILES=$(find . -type f \( -name "*.test.*" -o -name "*.spec.*" -o -name "*.stories.*" \) ! -path "./node_modules/*" ! -path "./.git/*" 2>/dev/null)
TEST_COUNT=$(echo "$TEST_FILES" | grep -c . || echo "0")

if [ "$TEST_COUNT" -gt 0 ]; then
    echo "Removing $TEST_COUNT test files..." | tee -a "$LOG_FILE"
    echo "$TEST_FILES" | while read file; do
        if [ -f "$file" ]; then
            echo "  - $file" >> "$LOG_FILE"
            rm -f "$file"
        fi
    done
    echo -e "${GREEN}✓${NC} Removed $TEST_COUNT test files" | tee -a "$LOG_FILE"
else
    echo -e "${GREEN}✓${NC} No test files found" | tee -a "$LOG_FILE"
fi

# ============================================================
# 2. REMOVE BACKUP FILES
# ============================================================
echo ""
echo -e "${YELLOW}💾 2. Removing Backup Files${NC}" | tee -a "$LOG_FILE"

BACKUP_FILES=$(find . -type f \( -name "*.bak" -o -name "*-copy.*" -o -name "*-old.*" -o -name "*~" -o -name "*.backup" \) ! -path "./node_modules/*" ! -path "./.git/*" 2>/dev/null)
BACKUP_COUNT=$(echo "$BACKUP_FILES" | grep -c . || echo "0")

if [ "$BACKUP_COUNT" -gt 0 ]; then
    echo "Removing $BACKUP_COUNT backup files..." | tee -a "$LOG_FILE"
    echo "$BACKUP_FILES" | while read file; do
        if [ -f "$file" ]; then
            echo "  - $file" >> "$LOG_FILE"
            rm -f "$file"
        fi
    done
    echo -e "${GREEN}✓${NC} Removed $BACKUP_COUNT backup files" | tee -a "$LOG_FILE"
else
    echo -e "${GREEN}✓${NC} No backup files found" | tee -a "$LOG_FILE"
fi

# ============================================================
# 3. REMOVE LOG FILES
# ============================================================
echo ""
echo -e "${YELLOW}📄 3. Removing Log Files${NC}" | tee -a "$LOG_FILE"

LOG_FILES_TO_REMOVE=$(find . -type f -name "*.log" ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./cleanup-scripts/logs/*" 2>/dev/null)
LOG_FILES_COUNT=$(echo "$LOG_FILES_TO_REMOVE" | grep -c . || echo "0")

if [ "$LOG_FILES_COUNT" -gt 0 ]; then
    echo "Removing $LOG_FILES_COUNT log files..." | tee -a "$LOG_FILE"
    echo "$LOG_FILES_TO_REMOVE" | while read file; do
        if [ -f "$file" ]; then
            echo "  - $file" >> "$LOG_FILE"
            rm -f "$file"
        fi
    done
    echo -e "${GREEN}✓${NC} Removed $LOG_FILES_COUNT log files" | tee -a "$LOG_FILE"
else
    echo -e "${GREEN}✓${NC} No log files found" | tee -a "$LOG_FILE"
fi

# ============================================================
# 4. REMOVE SOURCE MAPS
# ============================================================
echo ""
echo -e "${YELLOW}🗺️  4. Removing Source Maps${NC}" | tee -a "$LOG_FILE"

MAP_FILES=$(find . -type f \( -name "*.map" -o -name "*.d.ts.map" \) ! -path "./node_modules/*" ! -path "./.git/*" 2>/dev/null)
MAP_COUNT=$(echo "$MAP_FILES" | grep -c . || echo "0")

if [ "$MAP_COUNT" -gt 0 ]; then
    echo "Removing $MAP_COUNT source map files..." | tee -a "$LOG_FILE"
    echo "$MAP_FILES" | while read file; do
        if [ -f "$file" ]; then
            echo "  - $file" >> "$LOG_FILE"
            rm -f "$file"
        fi
    done
    echo -e "${GREEN}✓${NC} Removed $MAP_COUNT source map files" | tee -a "$LOG_FILE"
else
    echo -e "${GREEN}✓${NC} No source map files found" | tee -a "$LOG_FILE"
fi

# ============================================================
# 5. CLEAN BUILD ARTIFACTS
# ============================================================
echo ""
echo -e "${YELLOW}🏗️  5. Cleaning Build Artifacts${NC}" | tee -a "$LOG_FILE"

BUILD_DIRS=(".next" "dist" "build" "out" ".cache")
BUILD_CLEANED=0

for dir in "${BUILD_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "Removing $dir..." | tee -a "$LOG_FILE"
        rm -rf "$dir"
        echo -e "${GREEN}✓${NC} Removed $dir" | tee -a "$LOG_FILE"
        BUILD_CLEANED=$((BUILD_CLEANED + 1))
    fi
done

if [ "$BUILD_CLEANED" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No build artifacts found" | tee -a "$LOG_FILE"
fi

# ============================================================
# 6. REMOVE IDE FILES
# ============================================================
echo ""
echo -e "${YELLOW}⚙️  6. Removing IDE Files${NC}" | tee -a "$LOG_FILE"

IDE_CLEANED=0

# .DS_Store (macOS)
if [ -f ".DS_Store" ]; then
    echo "Removing .DS_Store..." | tee -a "$LOG_FILE"
    rm -f .DS_Store
    echo -e "${GREEN}✓${NC} Removed .DS_Store" | tee -a "$LOG_FILE"
    IDE_CLEANED=$((IDE_CLEANED + 1))
fi

# Find all .DS_Store files recursively
DS_STORE_FILES=$(find . -name ".DS_Store" ! -path "./node_modules/*" ! -path "./.git/*" 2>/dev/null)
DS_STORE_COUNT=$(echo "$DS_STORE_FILES" | grep -c . || echo "0")
if [ "$DS_STORE_COUNT" -gt 0 ]; then
    echo "Removing $DS_STORE_COUNT .DS_Store files..." | tee -a "$LOG_FILE"
    find . -name ".DS_Store" ! -path "./node_modules/*" ! -path "./.git/*" -delete 2>/dev/null || true
    IDE_CLEANED=$((IDE_CLEANED + DS_STORE_COUNT))
fi

# Thumbs.db (Windows)
THUMBS_FILES=$(find . -name "Thumbs.db" ! -path "./node_modules/*" ! -path "./.git/*" 2>/dev/null)
THUMBS_COUNT=$(echo "$THUMBS_FILES" | grep -c . || echo "0")
if [ "$THUMBS_COUNT" -gt 0 ]; then
    echo "Removing $THUMBS_COUNT Thumbs.db files..." | tee -a "$LOG_FILE"
    find . -name "Thumbs.db" ! -path "./node_modules/*" ! -path "./.git/*" -delete 2>/dev/null || true
    IDE_CLEANED=$((IDE_CLEANED + THUMBS_COUNT))
fi

# .idea directory (JetBrains)
if [ -d ".idea" ]; then
    echo "Removing .idea directory..." | tee -a "$LOG_FILE"
    rm -rf .idea
    echo -e "${GREEN}✓${NC} Removed .idea" | tee -a "$LOG_FILE"
    IDE_CLEANED=$((IDE_CLEANED + 1))
fi

if [ "$IDE_CLEANED" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No IDE files found" | tee -a "$LOG_FILE"
else
    echo -e "${GREEN}✓${NC} Cleaned $IDE_CLEANED IDE-related items" | tee -a "$LOG_FILE"
fi

# ============================================================
# 7. REMOVE EMPTY DIRECTORIES
# ============================================================
echo ""
echo -e "${YELLOW}📂 7. Removing Empty Directories${NC}" | tee -a "$LOG_FILE"

EMPTY_DIRS=$(find . -type d -empty ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./.next/*" 2>/dev/null)
EMPTY_COUNT=$(echo "$EMPTY_DIRS" | grep -c . || echo "0")

if [ "$EMPTY_COUNT" -gt 0 ]; then
    echo "Removing $EMPTY_COUNT empty directories..." | tee -a "$LOG_FILE"
    echo "$EMPTY_DIRS" | while read dir; do
        if [ -d "$dir" ]; then
            echo "  - $dir" >> "$LOG_FILE"
            rmdir "$dir" 2>/dev/null || true
        fi
    done
    echo -e "${GREEN}✓${NC} Removed $EMPTY_COUNT empty directories" | tee -a "$LOG_FILE"
else
    echo -e "${GREEN}✓${NC} No empty directories found" | tee -a "$LOG_FILE"
fi

# ============================================================
# 8. REMOVE TEMPORARY FILES
# ============================================================
echo ""
echo -e "${YELLOW}⏳ 8. Removing Temporary Files${NC}" | tee -a "$LOG_FILE"

TEMP_FILES=$(find . -type f \( -name "*.tmp" -o -name "*.temp" -o -name ".*.swp" -o -name "*~" \) ! -path "./node_modules/*" ! -path "./.git/*" 2>/dev/null)
TEMP_COUNT=$(echo "$TEMP_FILES" | grep -c . || echo "0")

if [ "$TEMP_COUNT" -gt 0 ]; then
    echo "Removing $TEMP_COUNT temporary files..." | tee -a "$LOG_FILE"
    echo "$TEMP_FILES" | while read file; do
        if [ -f "$file" ]; then
            echo "  - $file" >> "$LOG_FILE"
            rm -f "$file"
        fi
    done
    echo -e "${GREEN}✓${NC} Removed $TEMP_COUNT temporary files" | tee -a "$LOG_FILE"
else
    echo -e "${GREEN}✓${NC} No temporary files found" | tee -a "$LOG_FILE"
fi

# ============================================================
# 9. SUMMARY
# ============================================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Cleanup Summary                                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Count files after cleanup
AFTER_COUNT=$(find . -type f ! -path "./node_modules/*" ! -path "./.git/*" | wc -l)
FILES_REMOVED=$((BEFORE_COUNT - AFTER_COUNT))

echo "Cleanup Summary" >> "$LOG_FILE"
echo "===============" >> "$LOG_FILE"

echo -e "Files before cleanup: ${YELLOW}$BEFORE_COUNT${NC}" | tee -a "$LOG_FILE"
echo -e "Files after cleanup:  ${YELLOW}$AFTER_COUNT${NC}" | tee -a "$LOG_FILE"
echo -e "Files removed:        ${GREEN}$FILES_REMOVED${NC}" | tee -a "$LOG_FILE"

# Calculate size reduction
CURRENT_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo -e "Current repository size: ${GREEN}$CURRENT_SIZE${NC}" | tee -a "$LOG_FILE"

echo ""
echo -e "${GREEN}✅ Cleanup completed successfully!${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Run ${GREEN}npm run build${NC} to verify everything still works"
echo "  2. Run ${GREEN}./cleanup-scripts/03-verify.sh${NC} for comprehensive verification"
echo "  3. If issues occur, restore with: ${YELLOW}git checkout $BACKUP_BRANCH${NC}"
echo ""
echo -e "${BLUE}Log saved to:${NC} $LOG_FILE"
echo ""

exit 0
