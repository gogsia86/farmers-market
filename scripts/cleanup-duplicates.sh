#!/bin/bash
# 🧹 DUPLICATE FILES CLEANUP SCRIPT
# Farmers Market Platform - Safe Cleanup Utility
# Generated: December 2024
#
# This script safely removes duplicate and conflicting files
# identified in the codebase audit.
#
# Usage: ./scripts/cleanup-duplicates.sh [--dry-run]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if dry-run mode
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  echo -e "${YELLOW}🔍 DRY RUN MODE - No files will be deleted${NC}"
  echo ""
fi

# Function to safely delete a file
safe_delete() {
  local file="$1"
  local reason="$2"

  if [ -f "$file" ]; then
    echo -e "${BLUE}📄 Found: ${NC}$file"
    echo -e "   ${YELLOW}Reason: ${NC}$reason"

    if [ "$DRY_RUN" = true ]; then
      echo -e "   ${YELLOW}[DRY RUN] Would delete${NC}"
    else
      rm "$file"
      echo -e "   ${GREEN}✅ Deleted${NC}"
    fi
    echo ""
  else
    echo -e "${YELLOW}⚠️  Not found: ${NC}$file (already deleted or never existed)"
    echo ""
  fi
}

# Function to safely delete a directory
safe_delete_dir() {
  local dir="$1"
  local reason="$2"

  if [ -d "$dir" ]; then
    if [ -z "$(ls -A "$dir")" ]; then
      echo -e "${BLUE}📁 Found empty directory: ${NC}$dir"
      echo -e "   ${YELLOW}Reason: ${NC}$reason"

      if [ "$DRY_RUN" = true ]; then
        echo -e "   ${YELLOW}[DRY RUN] Would delete${NC}"
      else
        rmdir "$dir"
        echo -e "   ${GREEN}✅ Deleted${NC}"
      fi
      echo ""
    else
      echo -e "${RED}❌ Directory not empty: ${NC}$dir"
      echo -e "   ${YELLOW}Contains:${NC}"
      ls -la "$dir" | head -5
      echo -e "   ${RED}Skipping for safety${NC}"
      echo ""
    fi
  else
    echo -e "${YELLOW}⚠️  Not found: ${NC}$dir (already deleted or never existed)"
    echo ""
  fi
}

# Function to create backup
create_backup() {
  local file="$1"
  if [ -f "$file" ]; then
    local backup="${file}.backup-$(date +%Y%m%d-%H%M%S)"
    if [ "$DRY_RUN" = false ]; then
      cp "$file" "$backup"
      echo -e "${GREEN}💾 Backup created: ${NC}$backup"
    fi
  fi
}

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🌾 Farmers Market Platform - Duplicate Files Cleanup     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# =============================================================================
# PRIORITY 0 - CRITICAL DUPLICATES
# =============================================================================

echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
echo -e "${RED}  PRIORITY 0 - CRITICAL DUPLICATES${NC}"
echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
echo ""

# 1. Temporary Playwright Config
echo -e "${BLUE}[1/5] Playwright Configuration${NC}"
safe_delete "playwright.config.temp.ts" "Temporary config no longer needed"

# 2. Duplicate JavaScript Seeds
echo -e "${BLUE}[2/5] Duplicate Seed Scripts (JS versions)${NC}"
safe_delete "prisma/seed-admin.js" "Duplicate of seed-admin.ts"
safe_delete "prisma/seed-comprehensive.js" "Duplicate of seed-comprehensive.ts"

# 3. Environment Backup
echo -e "${BLUE}[3/5] Environment Backup File${NC}"
if [ -f ".env.local.backup" ] && [ -f ".env.local" ]; then
  echo -e "${YELLOW}⚠️  Found .env.local.backup - Checking if it's identical to .env.local${NC}"

  if diff -q .env.local .env.local.backup > /dev/null 2>&1; then
    safe_delete ".env.local.backup" "Identical to .env.local"
  else
    echo -e "${YELLOW}⚠️  .env.local.backup differs from .env.local${NC}"
    echo -e "   ${YELLOW}Manual review recommended before deletion${NC}"
    echo -e "   ${YELLOW}Run: diff .env.local .env.local.backup${NC}"
    echo ""
  fi
else
  safe_delete ".env.local.backup" "Environment backup"
fi

# 4. Empty marketplace/farms directory
echo -e "${BLUE}[4/5] Empty Route Directories${NC}"
safe_delete_dir "src/app/marketplace/farms" "Empty orphaned directory"

# 5. Root marketplace page (OPTIONAL - requires confirmation)
echo -e "${BLUE}[5/5] Root Marketplace Route${NC}"
if [ -f "src/app/marketplace/page.tsx" ]; then
  echo -e "${YELLOW}⚠️  Found root-level marketplace page${NC}"
  echo -e "   ${YELLOW}This conflicts with (customer)/marketplace route${NC}"

  if [ "$DRY_RUN" = true ]; then
    echo -e "   ${YELLOW}[DRY RUN] Would create backup and offer to delete${NC}"
  else
    echo -e "   ${RED}⚠️  MANUAL ACTION REQUIRED${NC}"
    echo -e "   ${YELLOW}To remove, run:${NC}"
    echo -e "   ${GREEN}rm -rf src/app/marketplace${NC}"
    echo -e "   ${YELLOW}(This script will not auto-delete route pages for safety)${NC}"
  fi
  echo ""
fi

# =============================================================================
# PRIORITY 1 - HIGH PRIORITY CLEANUP
# =============================================================================

echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  PRIORITY 1 - HIGH PRIORITY (Optional)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check for other temporary/backup files
echo -e "${BLUE}Scanning for other temporary files...${NC}"
echo ""

TEMP_FILES=$(find . -type f \( -name "*.backup" -o -name "*.temp" -o -name "*.old" -o -name "*.bak" \) ! -path "./node_modules/*" ! -path "./.next/*" ! -path "./docs/archives/*" 2>/dev/null || true)

if [ -n "$TEMP_FILES" ]; then
  echo -e "${YELLOW}⚠️  Found additional temporary files:${NC}"
  echo "$TEMP_FILES" | while read -r file; do
    if [ -n "$file" ]; then
      echo -e "   - $file"
    fi
  done
  echo ""
  echo -e "${YELLOW}Review these files manually before deletion${NC}"
  echo ""
else
  echo -e "${GREEN}✅ No additional temporary files found${NC}"
  echo ""
fi

# =============================================================================
# VERIFICATION
# =============================================================================

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  VERIFICATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}[1/3] Checking for empty directories...${NC}"
EMPTY_DIRS=$(find src/app -type d -empty 2>/dev/null || true)
if [ -n "$EMPTY_DIRS" ]; then
  echo -e "${YELLOW}⚠️  Found empty directories:${NC}"
  echo "$EMPTY_DIRS"
  echo ""
else
  echo -e "${GREEN}✅ No empty directories found${NC}"
  echo ""
fi

echo -e "${BLUE}[2/3] Checking seed script consistency...${NC}"
JS_SEEDS=$(ls prisma/seed*.js 2>/dev/null | wc -l)
TS_SEEDS=$(ls prisma/seed*.ts 2>/dev/null | wc -l)
echo -e "   JavaScript seeds: $JS_SEEDS"
echo -e "   TypeScript seeds: $TS_SEEDS"
if [ "$JS_SEEDS" -gt 1 ]; then
  echo -e "${YELLOW}   ⚠️  Multiple JS seeds still present${NC}"
  ls -1 prisma/seed*.js 2>/dev/null | sed 's/^/   - /'
fi
echo ""

echo -e "${BLUE}[3/3] Checking environment files...${NC}"
ENV_FILES=$(ls -1 .env* 2>/dev/null | grep -v "node_modules" | wc -l)
echo -e "   Environment files at root: $ENV_FILES"
if [ "$ENV_FILES" -gt 5 ]; then
  echo -e "${YELLOW}   ⚠️  Many environment files present (consider cleanup)${NC}"
fi
echo ""

# =============================================================================
# SUMMARY
# =============================================================================

echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  CLEANUP SUMMARY${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}🔍 DRY RUN COMPLETED${NC}"
  echo ""
  echo -e "To actually perform cleanup, run:"
  echo -e "${GREEN}./scripts/cleanup-duplicates.sh${NC}"
  echo ""
else
  echo -e "${GREEN}✅ CLEANUP COMPLETED${NC}"
  echo ""
  echo -e "Next steps:"
  echo -e "1. Review the output above for any warnings"
  echo -e "2. Run tests to ensure nothing broke:"
  echo -e "   ${GREEN}npm run test${NC}"
  echo -e "3. Manually handle remaining items:"
  echo -e "   - Root marketplace page (if needed)"
  echo -e "   - Empty directories (if any)"
  echo -e "   - Additional temporary files (if any)"
  echo ""
fi

echo -e "${BLUE}📚 For full analysis, see:${NC}"
echo -e "   docs/DUPLICATE_FILES_ANALYSIS.md"
echo ""

echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Script Complete${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
