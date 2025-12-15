#!/bin/bash

# 🧪 DIVINE TEST CLEANUP SCRIPT
# Removes duplicate and redundant test files safely
# Version: 1.0.0
# Author: Divine Agricultural Test Auditor

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     🧪 DIVINE TEST CLEANUP - DUPLICATE REMOVAL            ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must be run from project root${NC}"
    exit 1
fi

if [ ! -d "src/__tests__" ]; then
    echo -e "${RED}❌ Error: src/__tests__ directory not found${NC}"
    exit 1
fi

# Function to backup a file
backup_file() {
    local file=$1
    if [ -f "$file" ]; then
        local backup_dir=".test-backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$backup_dir"
        cp "$file" "$backup_dir/$(basename $file)"
        echo -e "${GREEN}✅ Backed up: $file${NC}"
    fi
}

# Function to safely remove a file
safe_remove() {
    local file=$1
    local reason=$2

    if [ -f "$file" ]; then
        echo -e "${YELLOW}📋 Analyzing: $file${NC}"
        echo -e "   Reason: $reason"

        # Backup before removal
        backup_file "$file"

        # Remove the file
        rm "$file"
        echo -e "${GREEN}✅ Removed: $file${NC}"
        echo ""
    else
        echo -e "${YELLOW}⚠️  File not found (already removed?): $file${NC}"
        echo ""
    fi
}

# Create backup directory
BACKUP_DIR=".test-backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${BLUE}📦 Backup directory created: $BACKUP_DIR${NC}"
echo ""

# Count files to remove
echo -e "${BLUE}🔍 Scanning for duplicate tests...${NC}"
echo ""

DUPLICATES=(
    "src/__tests__/services/order.service.test.ts"
    "src/__tests__/setup.test.ts"
    "src/__tests__/setup-verification.test.ts"
    "src/lib/__tests__/cache.memory.test.ts"
)

FOUND_COUNT=0
for file in "${DUPLICATES[@]}"; do
    if [ -f "$file" ]; then
        ((FOUND_COUNT++))
    fi
done

echo -e "${YELLOW}Found $FOUND_COUNT duplicate test files to remove${NC}"
echo ""

# Ask for confirmation
if [ "$1" != "--yes" ] && [ "$1" != "-y" ]; then
    echo -e "${YELLOW}⚠️  This will remove the following files:${NC}"
    for file in "${DUPLICATES[@]}"; do
        if [ -f "$file" ]; then
            echo "   - $file"
        fi
    done
    echo ""
    echo -e "${YELLOW}Backups will be saved to: $BACKUP_DIR${NC}"
    echo ""
    read -p "Do you want to continue? (yes/no): " -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
        echo -e "${RED}❌ Cleanup cancelled${NC}"
        exit 0
    fi
fi

# Remove duplicates
echo -e "${BLUE}🧹 Starting cleanup...${NC}"
echo ""

# 1. Remove duplicate order service test
safe_remove \
    "src/__tests__/services/order.service.test.ts" \
    "Superseded by order.service.consolidated.test.ts (759 lines with advanced features)"

# 2. Remove basic setup test
safe_remove \
    "src/__tests__/setup.test.ts" \
    "Superseded by tests/example.test.ts (comprehensive test infrastructure validation)"

# 3. Remove setup verification test
safe_remove \
    "src/__tests__/setup-verification.test.ts" \
    "Superseded by tests/example.test.ts (comprehensive test infrastructure validation)"

# 4. Remove basic cache memory test
safe_remove \
    "src/lib/__tests__/cache.memory.test.ts" \
    "Superseded by src/lib/cache/__tests__/index.test.ts (700+ lines comprehensive cache testing)"

# Check for empty directories and offer to remove them
echo -e "${BLUE}🔍 Checking for empty test directories...${NC}"
echo ""

if [ -d "src/__tests__/services" ] && [ -z "$(ls -A src/__tests__/services)" ]; then
    echo -e "${YELLOW}📁 Empty directory: src/__tests__/services${NC}"
    rmdir "src/__tests__/services"
    echo -e "${GREEN}✅ Removed empty directory${NC}"
    echo ""
fi

# Summary
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    CLEANUP SUMMARY                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

REMOVED_COUNT=0
for file in "${DUPLICATES[@]}"; do
    if [ ! -f "$file" ]; then
        ((REMOVED_COUNT++))
    fi
done

echo -e "${GREEN}✅ Files removed: $REMOVED_COUNT${NC}"
echo -e "${BLUE}📦 Backups location: $BACKUP_DIR${NC}"
echo ""

# Calculate space saved (rough estimate)
echo -e "${GREEN}📊 Estimated reduction:${NC}"
echo "   - ~400 lines of redundant test code"
echo "   - ~4 test files removed"
echo "   - Improved maintainability"
echo ""

# Next steps
echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
echo ""
echo "1. Run tests to ensure nothing broke:"
echo -e "   ${BLUE}npm test${NC}"
echo ""
echo "2. Review test coverage:"
echo -e "   ${BLUE}npm run test:coverage${NC}"
echo ""
echo "3. Check for validation test duplicates:"
echo -e "   ${BLUE}# Compare src/__tests__/validations/ vs src/lib/validations/__tests__/${NC}"
echo ""
echo "4. Investigate logger test consolidation:"
echo -e "   ${BLUE}# Review src/lib/utils/__tests__/logger.test.ts vs src/lib/logger/__tests__/logger.test.ts${NC}"
echo ""
echo "5. If everything works, commit the changes:"
echo -e "   ${BLUE}git add -A${NC}"
echo -e "   ${BLUE}git commit -m \"chore: remove duplicate test files\"${NC}"
echo ""
echo "6. If something broke, restore from backups:"
echo -e "   ${BLUE}cp $BACKUP_DIR/* <original-location>${NC}"
echo ""

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           ✨ CLEANUP COMPLETE - TEST BLESSED ✨            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}🌾 May your tests be green and your coverage divine! ⚡${NC}"
echo ""

exit 0
