#!/bin/bash
# 🧹 PHASE 1: CRITICAL CLEANUP SCRIPT
# Farmers Market Platform - Repository Optimization
# Version: 1.0
# Description: Removes duplicate files, debug test files, and temporary artifacts

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🧹 PHASE 1: CRITICAL REPOSITORY CLEANUP                  ║"
echo "║  Farmers Market Platform - Divine Optimization            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counter for tracking changes
CHANGES=0

echo "📋 Cleanup Tasks:"
echo "  1. Remove duplicate test files"
echo "  2. Remove debug test files"
echo "  3. Remove backup files"
echo "  4. Archive deprecated files"
echo "  5. Verify tests still pass"
echo ""

# Function to safely remove file
safe_remove() {
  local file=$1
  if [ -f "$file" ]; then
    echo -e "${YELLOW}🗑️  Removing:${NC} $file"
    rm "$file"
    CHANGES=$((CHANGES + 1))
    echo -e "${GREEN}✅ Removed successfully${NC}"
  else
    echo -e "${BLUE}ℹ️  Not found (already clean):${NC} $file"
  fi
}

# Function to archive file
archive_file() {
  local file=$1
  local archive_dir=$2
  if [ -f "$file" ]; then
    echo -e "${YELLOW}📦 Archiving:${NC} $file → $archive_dir"
    mkdir -p "$archive_dir"
    mv "$file" "$archive_dir/"
    CHANGES=$((CHANGES + 1))
    echo -e "${GREEN}✅ Archived successfully${NC}"
  else
    echo -e "${BLUE}ℹ️  Not found:${NC} $file"
  fi
}

echo "════════════════════════════════════════════════════════════"
echo "🔧 STEP 1: Remove Duplicate Test Files"
echo "════════════════════════════════════════════════════════════"
echo ""

# Remove duplicate farm.service.test.ts (keep the one in __tests__)
safe_remove "src/lib/services/farm.service.test.ts"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "🔧 STEP 2: Remove Debug Test Files"
echo "════════════════════════════════════════════════════════════"
echo ""

safe_remove "src/app/api/farms/__tests__/route-debug.test.ts"
safe_remove "src/app/api/farms/__tests__/route-minimal-debug.test.ts"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "🔧 STEP 3: Remove Backup Files"
echo "════════════════════════════════════════════════════════════"
echo ""

# Remove .env backup files
if ls .env.backup.* 1> /dev/null 2>&1; then
  echo -e "${YELLOW}🗑️  Removing .env backup files...${NC}"
  rm .env.backup.*
  CHANGES=$((CHANGES + 1))
  echo -e "${GREEN}✅ Backup files removed${NC}"
else
  echo -e "${BLUE}ℹ️  No .env backup files found${NC}"
fi
echo ""

echo "════════════════════════════════════════════════════════════"
echo "🔧 STEP 4: Archive Deprecated Files"
echo "════════════════════════════════════════════════════════════"
echo ""

archive_file "docs/quantum-docs/websockets/agricultural-events.old.md" "docs/archives/deprecated"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "🔧 STEP 5: Clean Jest Cache"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ -d ".jest-cache" ]; then
  echo -e "${YELLOW}🗑️  Cleaning Jest cache...${NC}"
  rm -rf .jest-cache
  CHANGES=$((CHANGES + 1))
  echo -e "${GREEN}✅ Jest cache cleaned${NC}"
else
  echo -e "${BLUE}ℹ️  No Jest cache to clean${NC}"
fi
echo ""

echo "════════════════════════════════════════════════════════════"
echo "📊 CLEANUP SUMMARY"
echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ Changes made: $CHANGES${NC}"
echo ""

if [ $CHANGES -eq 0 ]; then
  echo -e "${GREEN}🎉 Repository already clean! No changes needed.${NC}"
  echo ""
  exit 0
fi

echo "════════════════════════════════════════════════════════════"
echo "🧪 STEP 6: Verify Tests Still Pass"
echo "════════════════════════════════════════════════════════════"
echo ""

read -p "Run tests to verify cleanup? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}Running test suite...${NC}"
  echo ""

  if npm test; then
    echo ""
    echo -e "${GREEN}✅ All tests passed! Cleanup successful.${NC}"
  else
    echo ""
    echo -e "${RED}❌ Tests failed! Please review changes.${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️  Skipping tests. Please run 'npm test' manually.${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "🎉 PHASE 1 CLEANUP COMPLETE!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📋 Next Steps:"
echo "  1. Review changes with: git status"
echo "  2. Commit changes with: git add -A && git commit -m 'chore: Phase 1 cleanup'"
echo "  3. Proceed to Phase 2 cleanup (console.log audit)"
echo ""
echo "📖 See REPOSITORY_ANALYSIS_AND_CLEANUP.md for details"
echo ""
