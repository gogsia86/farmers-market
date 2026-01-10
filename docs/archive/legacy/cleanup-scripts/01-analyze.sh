#!/bin/bash
# 01-analyze.sh - Non-Destructive Repository Analysis
# Farmers Market Platform - Safe Cleanup Toolkit
# Purpose: Identify cleanup opportunities without modifying anything

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Farmers Market Platform - Repository Analysis        ║${NC}"
echo -e "${BLUE}║  Safe Cleanup Toolkit v1.0                             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Ensure we're in project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ ERROR: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Create reports directory
REPORT_DIR="cleanup-scripts/reports"
mkdir -p "$REPORT_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/analysis_$TIMESTAMP.txt"

echo -e "${GREEN}✓${NC} Running analysis... (this may take a minute)"
echo ""
echo "Analysis Report" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "========================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# ============================================================
# 1. PROJECT SIZE ANALYSIS
# ============================================================
echo -e "${YELLOW}📊 1. Project Size Analysis${NC}"
echo "" >> "$REPORT_FILE"
echo "1. PROJECT SIZE" >> "$REPORT_FILE"
echo "===============" >> "$REPORT_FILE"

# Total size
TOTAL_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo -e "   Total size: ${GREEN}$TOTAL_SIZE${NC}"
echo "Total size: $TOTAL_SIZE" >> "$REPORT_FILE"

# Node modules size
if [ -d "node_modules" ]; then
    NODE_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    echo -e "   node_modules: ${GREEN}$NODE_SIZE${NC}"
    echo "node_modules: $NODE_SIZE" >> "$REPORT_FILE"
fi

# Next build size
if [ -d ".next" ]; then
    NEXT_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    echo -e "   .next build: ${GREEN}$NEXT_SIZE${NC}"
    echo ".next build: $NEXT_SIZE" >> "$REPORT_FILE"
fi

# Source files size
SOURCE_SIZE=$(du -sh app components lib 2>/dev/null | awk '{sum+=$1} END {print sum}')
echo "Source files size: $SOURCE_SIZE bytes" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"

# ============================================================
# 2. FILE COUNT ANALYSIS
# ============================================================
echo ""
echo -e "${YELLOW}📁 2. File Count Analysis${NC}"
echo "" >> "$REPORT_FILE"
echo "2. FILE COUNTS" >> "$REPORT_FILE"
echo "==============" >> "$REPORT_FILE"

# Total files (excluding node_modules and .git)
TOTAL_FILES=$(find . -type f ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./.next/*" | wc -l)
echo -e "   Total files (excluding node_modules): ${GREEN}$TOTAL_FILES${NC}"
echo "Total files: $TOTAL_FILES" >> "$REPORT_FILE"

# TypeScript/JavaScript files
TS_FILES=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./.next/*" | wc -l)
echo -e "   TypeScript/JavaScript files: ${GREEN}$TS_FILES${NC}"
echo "TypeScript/JavaScript files: $TS_FILES" >> "$REPORT_FILE"

# Test files
TEST_FILES=$(find . -type f \( -name "*.test.*" -o -name "*.spec.*" -o -name "*.stories.*" \) ! -path "./node_modules/*" ! -path "./.git/*" | wc -l)
echo -e "   Test files: ${YELLOW}$TEST_FILES${NC} (can be removed)"
echo "Test files: $TEST_FILES (removable)" >> "$REPORT_FILE"

# Backup files
BACKUP_FILES=$(find . -type f \( -name "*.bak" -o -name "*-copy.*" -o -name "*-old.*" -o -name "*~" \) ! -path "./node_modules/*" ! -path "./.git/*" | wc -l)
echo -e "   Backup files: ${YELLOW}$BACKUP_FILES${NC} (can be removed)"
echo "Backup files: $BACKUP_FILES (removable)" >> "$REPORT_FILE"

# Log files
LOG_FILES=$(find . -type f -name "*.log" ! -path "./node_modules/*" ! -path "./.git/*" | wc -l)
echo -e "   Log files: ${YELLOW}$LOG_FILES${NC} (can be removed)"
echo "Log files: $LOG_FILES (removable)" >> "$REPORT_FILE"

# Source maps
MAP_FILES=$(find . -type f -name "*.map" ! -path "./node_modules/*" ! -path "./.git/*" | wc -l)
echo -e "   Source map files: ${YELLOW}$MAP_FILES${NC} (can be removed)"
echo "Source map files: $MAP_FILES (removable)" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"

# ============================================================
# 3. LARGE FILES (>500KB)
# ============================================================
echo ""
echo -e "${YELLOW}📦 3. Large Files (>500KB)${NC}"
echo "" >> "$REPORT_FILE"
echo "3. LARGE FILES (>500KB)" >> "$REPORT_FILE"
echo "=======================" >> "$REPORT_FILE"

find . -type f -size +500k ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./.next/*" -exec ls -lh {} \; 2>/dev/null | while read line; do
    SIZE=$(echo "$line" | awk '{print $5}')
    FILE=$(echo "$line" | awk '{print $9}')
    echo -e "   ${YELLOW}$SIZE${NC} - $FILE"
    echo "$SIZE - $FILE" >> "$REPORT_FILE"
done

LARGE_FILE_COUNT=$(find . -type f -size +500k ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./.next/*" 2>/dev/null | wc -l)
if [ "$LARGE_FILE_COUNT" -eq 0 ]; then
    echo -e "   ${GREEN}No large files found${NC}"
    echo "No large files found" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"

# ============================================================
# 4. REMOVABLE FILES DETAILED LIST
# ============================================================
echo ""
echo -e "${YELLOW}🗑️  4. Removable Files (Detailed)${NC}"
echo "" >> "$REPORT_FILE"
echo "4. REMOVABLE FILES - DETAILED LIST" >> "$REPORT_FILE"
echo "===================================" >> "$REPORT_FILE"

# Test files
if [ "$TEST_FILES" -gt 0 ]; then
    echo -e "   ${BLUE}Test Files:${NC}"
    echo "" >> "$REPORT_FILE"
    echo "Test Files:" >> "$REPORT_FILE"
    find . -type f \( -name "*.test.*" -o -name "*.spec.*" -o -name "*.stories.*" \) ! -path "./node_modules/*" ! -path "./.git/*" | while read file; do
        echo -e "     • $file"
        echo "  - $file" >> "$REPORT_FILE"
    done
fi

# Backup files
if [ "$BACKUP_FILES" -gt 0 ]; then
    echo ""
    echo -e "   ${BLUE}Backup Files:${NC}"
    echo "" >> "$REPORT_FILE"
    echo "Backup Files:" >> "$REPORT_FILE"
    find . -type f \( -name "*.bak" -o -name "*-copy.*" -o -name "*-old.*" -o -name "*~" \) ! -path "./node_modules/*" ! -path "./.git/*" | while read file; do
        echo -e "     • $file"
        echo "  - $file" >> "$REPORT_FILE"
    done
fi

# Log files
if [ "$LOG_FILES" -gt 0 ]; then
    echo ""
    echo -e "   ${BLUE}Log Files:${NC}"
    echo "" >> "$REPORT_FILE"
    echo "Log Files:" >> "$REPORT_FILE"
    find . -type f -name "*.log" ! -path "./node_modules/*" ! -path "./.git/*" | while read file; do
        echo -e "     • $file"
        echo "  - $file" >> "$REPORT_FILE"
    done
fi

# Source maps
if [ "$MAP_FILES" -gt 0 ]; then
    echo ""
    echo -e "   ${BLUE}Source Maps:${NC}"
    echo "" >> "$REPORT_FILE"
    echo "Source Maps:" >> "$REPORT_FILE"
    find . -type f -name "*.map" ! -path "./node_modules/*" ! -path "./.git/*" | while read file; do
        echo -e "     • $file"
        echo "  - $file" >> "$REPORT_FILE"
    done
fi

echo "" >> "$REPORT_FILE"

# ============================================================
# 5. EMPTY DIRECTORIES
# ============================================================
echo ""
echo -e "${YELLOW}📂 5. Empty Directories${NC}"
echo "" >> "$REPORT_FILE"
echo "5. EMPTY DIRECTORIES" >> "$REPORT_FILE"
echo "====================" >> "$REPORT_FILE"

EMPTY_DIRS=$(find . -type d -empty ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./.next/*" 2>/dev/null | wc -l)
echo -e "   Empty directories: ${YELLOW}$EMPTY_DIRS${NC}"
echo "Empty directories: $EMPTY_DIRS" >> "$REPORT_FILE"

if [ "$EMPTY_DIRS" -gt 0 ]; then
    echo "" >> "$REPORT_FILE"
    find . -type d -empty ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./.next/*" 2>/dev/null | while read dir; do
        echo -e "     • $dir"
        echo "  - $dir" >> "$REPORT_FILE"
    done
fi

echo "" >> "$REPORT_FILE"

# ============================================================
# 6. DEPENDENCY ANALYSIS
# ============================================================
echo ""
echo -e "${YELLOW}📦 6. Package Dependencies${NC}"
echo "" >> "$REPORT_FILE"
echo "6. PACKAGE DEPENDENCIES" >> "$REPORT_FILE"
echo "=======================" >> "$REPORT_FILE"

if [ -f "package.json" ]; then
    # Count dependencies
    if command -v jq &> /dev/null; then
        DEP_COUNT=$(cat package.json | jq '.dependencies | length' 2>/dev/null || echo "N/A")
        DEV_DEP_COUNT=$(cat package.json | jq '.devDependencies | length' 2>/dev/null || echo "N/A")

        echo -e "   Dependencies: ${GREEN}$DEP_COUNT${NC}"
        echo -e "   devDependencies: ${GREEN}$DEV_DEP_COUNT${NC}"
        echo "Dependencies: $DEP_COUNT" >> "$REPORT_FILE"
        echo "devDependencies: $DEV_DEP_COUNT" >> "$REPORT_FILE"

        # List dependencies
        echo "" >> "$REPORT_FILE"
        echo "Production Dependencies:" >> "$REPORT_FILE"
        cat package.json | jq -r '.dependencies | keys[]' 2>/dev/null | while read dep; do
            echo "  - $dep" >> "$REPORT_FILE"
        done

        echo "" >> "$REPORT_FILE"
        echo "Development Dependencies:" >> "$REPORT_FILE"
        cat package.json | jq -r '.devDependencies | keys[]' 2>/dev/null | while read dep; do
            echo "  - $dep" >> "$REPORT_FILE"
        done
    else
        echo -e "   ${YELLOW}⚠ jq not installed - skipping detailed dependency analysis${NC}"
        echo "jq not installed - skipping detailed analysis" >> "$REPORT_FILE"
    fi
fi

echo "" >> "$REPORT_FILE"

# ============================================================
# 7. BUILD ARTIFACTS
# ============================================================
echo ""
echo -e "${YELLOW}🏗️  7. Build Artifacts${NC}"
echo "" >> "$REPORT_FILE"
echo "7. BUILD ARTIFACTS" >> "$REPORT_FILE"
echo "==================" >> "$REPORT_FILE"

BUILD_DIRS=(".next" "dist" "build" "out" ".cache")
for dir in "${BUILD_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        DIR_SIZE=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo -e "   ${GREEN}✓${NC} $dir exists (${DIR_SIZE})"
        echo "$dir exists ($DIR_SIZE) - can be regenerated" >> "$REPORT_FILE"
    fi
done

echo "" >> "$REPORT_FILE"

# ============================================================
# 8. IDE CONFIGURATIONS
# ============================================================
echo ""
echo -e "${YELLOW}⚙️  8. IDE Configurations${NC}"
echo "" >> "$REPORT_FILE"
echo "8. IDE CONFIGURATIONS" >> "$REPORT_FILE"
echo "=====================" >> "$REPORT_FILE"

IDE_DIRS=(".vscode" ".idea" ".DS_Store")
for dir in "${IDE_DIRS[@]}"; do
    if [ -d "$dir" ] || [ -f "$dir" ]; then
        echo -e "   ${YELLOW}Found:${NC} $dir"
        echo "Found: $dir (consider removing if not used)" >> "$REPORT_FILE"
    fi
done

echo "" >> "$REPORT_FILE"

# ============================================================
# 9. CRITICAL FILES CHECK
# ============================================================
echo ""
echo -e "${YELLOW}✅ 9. Critical Files Verification${NC}"
echo "" >> "$REPORT_FILE"
echo "9. CRITICAL FILES" >> "$REPORT_FILE"
echo "=================" >> "$REPORT_FILE"

CRITICAL_FILES=(
    "package.json"
    "next.config.js"
    "prisma/schema.prisma"
    "app/layout.tsx"
    "app/page.tsx"
    "app/api/health/route.ts"
    ".github/workflows/deploy.yml"
    ".env.example"
    "README.md"
)

ALL_CRITICAL_PRESENT=true
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ${GREEN}✓${NC} $file"
        echo "✓ $file" >> "$REPORT_FILE"
    else
        echo -e "   ${RED}✗${NC} $file (MISSING)"
        echo "✗ $file (MISSING)" >> "$REPORT_FILE"
        ALL_CRITICAL_PRESENT=false
    fi
done

echo "" >> "$REPORT_FILE"

# ============================================================
# 10. SUMMARY AND RECOMMENDATIONS
# ============================================================
echo ""
echo -e "${YELLOW}📋 10. Summary & Recommendations${NC}"
echo "" >> "$REPORT_FILE"
echo "10. SUMMARY & RECOMMENDATIONS" >> "$REPORT_FILE"
echo "=============================" >> "$REPORT_FILE"

# Calculate potential space savings
POTENTIAL_SAVINGS=0
SAVINGS_DETAILS=""

if [ "$TEST_FILES" -gt 0 ]; then
    SAVINGS_DETAILS="${SAVINGS_DETAILS}\n   • Remove $TEST_FILES test files"
    echo "• Remove $TEST_FILES test files" >> "$REPORT_FILE"
fi

if [ "$BACKUP_FILES" -gt 0 ]; then
    SAVINGS_DETAILS="${SAVINGS_DETAILS}\n   • Remove $BACKUP_FILES backup files"
    echo "• Remove $BACKUP_FILES backup files" >> "$REPORT_FILE"
fi

if [ "$LOG_FILES" -gt 0 ]; then
    SAVINGS_DETAILS="${SAVINGS_DETAILS}\n   • Remove $LOG_FILES log files"
    echo "• Remove $LOG_FILES log files" >> "$REPORT_FILE"
fi

if [ "$MAP_FILES" -gt 0 ]; then
    SAVINGS_DETAILS="${SAVINGS_DETAILS}\n   • Remove $MAP_FILES source map files"
    echo "• Remove $MAP_FILES source map files" >> "$REPORT_FILE"
fi

if [ "$EMPTY_DIRS" -gt 0 ]; then
    SAVINGS_DETAILS="${SAVINGS_DETAILS}\n   • Remove $EMPTY_DIRS empty directories"
    echo "• Remove $EMPTY_DIRS empty directories" >> "$REPORT_FILE"
fi

if [ -d ".next" ]; then
    SAVINGS_DETAILS="${SAVINGS_DETAILS}\n   • Clean .next build directory (regenerated on build)"
    echo "• Clean .next build directory" >> "$REPORT_FILE"
fi

if [ -z "$SAVINGS_DETAILS" ]; then
    echo -e "${GREEN}✅ Repository is already clean!${NC}"
    echo "Repository is already clean!" >> "$REPORT_FILE"
else
    echo -e "${YELLOW}Recommended cleanups:${NC}"
    echo -e "$SAVINGS_DETAILS"
    echo ""
    echo -e "${GREEN}Run 02-safe-cleanup.sh to perform these cleanups${NC}"
    echo "" >> "$REPORT_FILE"
    echo "Run 02-safe-cleanup.sh to perform these cleanups" >> "$REPORT_FILE"
fi

# ============================================================
# FINAL OUTPUT
# ============================================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Analysis Complete                                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓${NC} Detailed report saved to: ${BLUE}$REPORT_FILE${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review the analysis report above"
echo "  2. Run ${GREEN}02-safe-cleanup.sh${NC} to perform safe cleanup"
echo "  3. Run ${GREEN}03-verify.sh${NC} after cleanup to verify everything works"
echo ""

# Return status based on critical files
if [ "$ALL_CRITICAL_PRESENT" = false ]; then
    echo -e "${RED}⚠ WARNING: Some critical files are missing!${NC}"
    exit 1
fi

exit 0
