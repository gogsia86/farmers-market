#!/bin/bash
# ╔════════════════════════════════════════════════════════════════════╗
# ║ 🗑️  FARMERS MARKET PLATFORM - BACKUP FILE REMOVAL SCRIPT          ║
# ║ Safely removes backup files from the codebase                      ║
# ╚════════════════════════════════════════════════════════════════════╝

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║ 🗑️  Backup File Removal                                           ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# STEP 1: Find Backup Files
# ============================================================================
echo -e "${BLUE}🔍 Searching for backup files...${NC}"
echo ""

echo -e "${YELLOW}Files with .backup extension:${NC}"
find . -name "*.backup*" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null || true
echo ""

echo -e "${YELLOW}Files with .old extension:${NC}"
find . -name "*.old" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null || true
echo ""

echo -e "${YELLOW}Backup directories:${NC}"
find . -type d -name "*.backup*" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null || true
echo ""

# Count backup files
BACKUP_FILES=$(find . -name "*.backup*" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | wc -l)
OLD_FILES=$(find . -name "*.old" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | wc -l)
BACKUP_DIRS=$(find . -type d -name "*.backup*" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | wc -l)

TOTAL=$((BACKUP_FILES + OLD_FILES + BACKUP_DIRS))

echo -e "${BLUE}📊 Summary:${NC}"
echo "   ├─ .backup* files:  ${BACKUP_FILES}"
echo "   ├─ .old files:      ${OLD_FILES}"
echo "   ├─ backup dirs:     ${BACKUP_DIRS}"
echo "   └─ Total:           ${TOTAL}"
echo ""

if [ $TOTAL -eq 0 ]; then
    echo -e "${GREEN}✅ No backup files found! Repository is clean.${NC}"
    exit 0
fi

# ============================================================================
# STEP 2: Confirm Removal
# ============================================================================
echo -e "${YELLOW}⚠️  WARNING: This will permanently delete these backup files.${NC}"
echo -e "${YELLOW}⚠️  Make sure you have committed your changes first!${NC}"
echo ""
echo -e "${BLUE}Git status:${NC}"
git status --short 2>/dev/null || echo "Not a git repository"
echo ""

read -p "$(echo -e ${RED}Are you sure you want to remove these backup files? [y/N]:${NC} )" -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Cleanup cancelled. No files were deleted.${NC}"
    exit 0
fi

# ============================================================================
# STEP 3: Create Safety Checkpoint
# ============================================================================
echo ""
echo -e "${BLUE}💾 Creating safety checkpoint...${NC}"

if git rev-parse --git-dir > /dev/null 2>&1; then
    # Create a backup branch
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_BRANCH="backup-before-cleanup-${TIMESTAMP}"

    git branch ${BACKUP_BRANCH} 2>/dev/null || true

    echo -e "${GREEN}✅ Created backup branch: ${BACKUP_BRANCH}${NC}"
    echo -e "${BLUE}   Rollback command: git checkout ${BACKUP_BRANCH}${NC}"
else
    echo -e "${YELLOW}⚠️  Not a git repository - no safety checkpoint created${NC}"
fi
echo ""

# ============================================================================
# STEP 4: Remove Backup Files
# ============================================================================
echo -e "${BLUE}🗑️  Removing backup files...${NC}"
echo ""

REMOVED=0

# Remove .backup* files
echo -e "${BLUE}Removing .backup* files...${NC}"
while IFS= read -r file; do
    if [ -f "$file" ]; then
        echo "  - Removing: $file"
        rm "$file"
        ((REMOVED++))
    fi
done < <(find . -name "*.backup*" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)

# Remove .old files
echo -e "${BLUE}Removing .old files...${NC}"
while IFS= read -r file; do
    if [ -f "$file" ]; then
        echo "  - Removing: $file"
        rm "$file"
        ((REMOVED++))
    fi
done < <(find . -name "*.old" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)

# Remove backup directories
echo -e "${BLUE}Removing backup directories...${NC}"
while IFS= read -r dir; do
    if [ -d "$dir" ]; then
        echo "  - Removing directory: $dir"
        rm -rf "$dir"
        ((REMOVED++))
    fi
done < <(find . -type d -name "*.backup*" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)

echo ""
echo -e "${GREEN}✅ Removed ${REMOVED} backup files/directories${NC}"
echo ""

# ============================================================================
# STEP 5: Remove Specific Known Backups
# ============================================================================
echo -e "${BLUE}🎯 Removing known backup locations...${NC}"

SPECIFIC_REMOVED=0

# Known backup file
if [ -f ".env.backup.2025-12-18T02-22-41" ]; then
    echo "  - Removing: .env.backup.2025-12-18T02-22-41"
    rm ".env.backup.2025-12-18T02-22-41"
    ((SPECIFIC_REMOVED++))
fi

# Known backup directory
if [ -d "src/app.backup.phase5" ]; then
    echo "  - Removing directory: src/app.backup.phase5"
    rm -rf "src/app.backup.phase5"
    ((SPECIFIC_REMOVED++))
fi

# Known backup service file
if [ -f "src/lib/services/cart.service.backup.ts" ]; then
    echo "  - Removing: src/lib/services/cart.service.backup.ts"
    rm "src/lib/services/cart.service.backup.ts"
    ((SPECIFIC_REMOVED++))
fi

# Prisma backup
if [ -f "prisma/schema.prisma.backup_before_run4" ]; then
    echo "  - Removing: prisma/schema.prisma.backup_before_run4"
    rm "prisma/schema.prisma.backup_before_run4"
    ((SPECIFIC_REMOVED++))
fi

if [ $SPECIFIC_REMOVED -gt 0 ]; then
    echo -e "${GREEN}✅ Removed ${SPECIFIC_REMOVED} known backup files${NC}"
else
    echo -e "${GREEN}✅ No known backup files found${NC}"
fi
echo ""

# ============================================================================
# STEP 6: Clean Temporary Files
# ============================================================================
echo -e "${BLUE}🧹 Cleaning temporary files...${NC}"

TEMP_REMOVED=0

# Remove .tmp files
find . -name "*.tmp" -not -path "./node_modules/*" -not -path "./.git/*" -delete 2>/dev/null && ((TEMP_REMOVED++)) || true

# Remove .swp files (Vim)
find . -name "*.swp" -not -path "./node_modules/*" -not -path "./.git/*" -delete 2>/dev/null && ((TEMP_REMOVED++)) || true
find . -name "*.swo" -not -path "./node_modules/*" -not -path "./.git/*" -delete 2>/dev/null && ((TEMP_REMOVED++)) || true

# Remove ~ files (editor backups)
find . -name "*~" -not -path "./node_modules/*" -not -path "./.git/*" -delete 2>/dev/null && ((TEMP_REMOVED++)) || true

# Remove .DS_Store (macOS)
find . -name ".DS_Store" -not -path "./node_modules/*" -not -path "./.git/*" -delete 2>/dev/null && ((TEMP_REMOVED++)) || true

# Remove Thumbs.db (Windows)
find . -name "Thumbs.db" -not -path "./node_modules/*" -not -path "./.git/*" -delete 2>/dev/null && ((TEMP_REMOVED++)) || true

echo -e "${GREEN}✅ Cleaned temporary files${NC}"
echo ""

# ============================================================================
# STEP 7: Verification
# ============================================================================
echo -e "${BLUE}🔍 Verifying cleanup...${NC}"

REMAINING_BACKUPS=$(find . -name "*.backup*" -o -name "*.old" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | wc -l)

if [ $REMAINING_BACKUPS -eq 0 ]; then
    echo -e "${GREEN}✅ All backup files successfully removed!${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: ${REMAINING_BACKUPS} backup files still remain${NC}"
    echo ""
    echo "Remaining files:"
    find . -name "*.backup*" -o -name "*.old" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null
fi
echo ""

# ============================================================================
# STEP 8: Summary
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║ ✅ BACKUP CLEANUP COMPLETE!                                       ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}📊 Cleanup Summary:${NC}"
echo "   ├─ Backup files removed:    ${REMOVED}"
echo "   ├─ Known backups removed:   ${SPECIFIC_REMOVED}"
echo "   ├─ Temp files cleaned:      ~${TEMP_REMOVED}"
echo "   └─ Remaining backups:       ${REMAINING_BACKUPS}"
echo ""

if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${BLUE}💡 Next steps:${NC}"
    echo "   1. Verify the cleanup: git status"
    echo "   2. Review changes: git diff"
    echo "   3. Commit if satisfied: git add -A && git commit -m 'Remove backup files'"
    echo "   4. If needed, rollback: git checkout ${BACKUP_BRANCH}"
    echo ""
fi

echo -e "${GREEN}🎉 Repository cleaned successfully!${NC}"
echo ""
