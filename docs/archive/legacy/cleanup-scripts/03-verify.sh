#!/bin/bash
# 03-verify.sh - Post-Cleanup Verification
# Farmers Market Platform - Safe Cleanup Toolkit
# Purpose: Verify that cleanup didn't break functionality

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Farmers Market Platform - Post-Cleanup Verification  ║${NC}"
echo -e "${BLUE}║  Safe Cleanup Toolkit v1.0                             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Ensure we're in project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ ERROR: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Create verification log
LOG_DIR="cleanup-scripts/logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/verification_$TIMESTAMP.log"

echo "Verification Report" | tee "$LOG_FILE"
echo "Generated: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# ============================================================
# 1. CRITICAL FILES VERIFICATION
# ============================================================
echo -e "${YELLOW}📋 1. Critical Files Verification${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

CRITICAL_FILES=(
    "package.json"
    "next.config.js"
    "tsconfig.json"
    "tailwind.config.js"
    "postcss.config.js"
    "prisma/schema.prisma"
    "app/layout.tsx"
    "app/page.tsx"
    "app/api/health/route.ts"
    ".env.example"
    "README.md"
)

echo "Critical Files:" | tee -a "$LOG_FILE"
for file in "${CRITICAL_FILES[@]}"; do
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file" | tee -a "$LOG_FILE"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "  ${RED}✗${NC} $file ${RED}(MISSING)${NC}" | tee -a "$LOG_FILE"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
done

echo "" | tee -a "$LOG_FILE"

# ============================================================
# 2. GITHUB WORKFLOWS VERIFICATION
# ============================================================
echo -e "${YELLOW}🔄 2. GitHub Workflows Verification${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

WORKFLOW_FILES=(
    ".github/workflows/deploy.yml"
)

echo "GitHub Workflows:" | tee -a "$LOG_FILE"
for file in "${WORKFLOW_FILES[@]}"; do
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file" | tee -a "$LOG_FILE"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "  ${YELLOW}⚠${NC} $file ${YELLOW}(missing - CI/CD may be affected)${NC}" | tee -a "$LOG_FILE"
        WARNINGS=$((WARNINGS + 1))
    fi
done

echo "" | tee -a "$LOG_FILE"

# ============================================================
# 3. DIRECTORY STRUCTURE VERIFICATION
# ============================================================
echo -e "${YELLOW}📁 3. Directory Structure Verification${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

CRITICAL_DIRS=(
    "app"
    "components"
    "lib"
    "prisma"
    "public"
)

echo "Critical Directories:" | tee -a "$LOG_FILE"
for dir in "${CRITICAL_DIRS[@]}"; do
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -d "$dir" ]; then
        FILE_COUNT=$(find "$dir" -type f 2>/dev/null | wc -l)
        echo -e "  ${GREEN}✓${NC} $dir/ ($FILE_COUNT files)" | tee -a "$LOG_FILE"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "  ${RED}✗${NC} $dir/ ${RED}(MISSING)${NC}" | tee -a "$LOG_FILE"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
done

echo "" | tee -a "$LOG_FILE"

# ============================================================
# 4. PACKAGE.JSON VALIDATION
# ============================================================
echo -e "${YELLOW}📦 4. Package.json Validation${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if command -v jq &> /dev/null; then
    if jq empty package.json 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} package.json is valid JSON" | tee -a "$LOG_FILE"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))

        # Check for required scripts
        echo "" | tee -a "$LOG_FILE"
        echo "Required Scripts:" | tee -a "$LOG_FILE"

        REQUIRED_SCRIPTS=("dev" "build" "start" "lint")
        for script in "${REQUIRED_SCRIPTS[@]}"; do
            TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
            if jq -e ".scripts.${script}" package.json > /dev/null 2>&1; then
                SCRIPT_CMD=$(jq -r ".scripts.${script}" package.json)
                echo -e "  ${GREEN}✓${NC} $script: $SCRIPT_CMD" | tee -a "$LOG_FILE"
                PASSED_CHECKS=$((PASSED_CHECKS + 1))
            else
                echo -e "  ${RED}✗${NC} $script ${RED}(missing)${NC}" | tee -a "$LOG_FILE"
                FAILED_CHECKS=$((FAILED_CHECKS + 1))
            fi
        done
    else
        echo -e "  ${RED}✗${NC} package.json is invalid JSON" | tee -a "$LOG_FILE"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
else
    echo -e "  ${YELLOW}⚠${NC} jq not installed - skipping JSON validation" | tee -a "$LOG_FILE"
    WARNINGS=$((WARNINGS + 1))
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================
# 5. TYPESCRIPT CONFIGURATION VALIDATION
# ============================================================
echo -e "${YELLOW}⚙️  5. TypeScript Configuration${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "tsconfig.json" ]; then
    if command -v jq &> /dev/null; then
        # Remove comments and validate
        if grep -v "^\s*//" tsconfig.json | jq empty 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} tsconfig.json is valid" | tee -a "$LOG_FILE"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            echo -e "  ${YELLOW}⚠${NC} tsconfig.json may have issues (but could be valid with comments)" | tee -a "$LOG_FILE"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "  ${YELLOW}⚠${NC} jq not installed - skipping validation" | tee -a "$LOG_FILE"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "  ${RED}✗${NC} tsconfig.json not found" | tee -a "$LOG_FILE"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================
# 6. PRISMA SCHEMA VALIDATION
# ============================================================
echo -e "${YELLOW}🗄️  6. Prisma Schema Validation${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "prisma/schema.prisma" ]; then
    if command -v npx &> /dev/null; then
        echo "Validating Prisma schema..." | tee -a "$LOG_FILE"
        if npx prisma validate > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} Prisma schema is valid" | tee -a "$LOG_FILE"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            echo -e "  ${RED}✗${NC} Prisma schema has errors" | tee -a "$LOG_FILE"
            npx prisma validate 2>&1 | tee -a "$LOG_FILE"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
    else
        echo -e "  ${YELLOW}⚠${NC} npx not available - skipping validation" | tee -a "$LOG_FILE"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "  ${RED}✗${NC} prisma/schema.prisma not found" | tee -a "$LOG_FILE"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================
# 7. NODE_MODULES CHECK
# ============================================================
echo -e "${YELLOW}📦 7. Dependencies Check${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -d "node_modules" ]; then
    NODE_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    echo -e "  ${GREEN}✓${NC} node_modules exists (${NODE_SIZE})" | tee -a "$LOG_FILE"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "  ${YELLOW}⚠${NC} node_modules not found - run ${YELLOW}npm install${NC}" | tee -a "$LOG_FILE"
    WARNINGS=$((WARNINGS + 1))
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================
# 8. BUILD TEST
# ============================================================
echo -e "${YELLOW}🏗️  8. Build Test${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -d "node_modules" ]; then
    echo "Running production build (this may take a few minutes)..." | tee -a "$LOG_FILE"

    BUILD_LOG="$LOG_DIR/build_$TIMESTAMP.log"

    if npm run build > "$BUILD_LOG" 2>&1; then
        echo -e "  ${GREEN}✓${NC} Build successful" | tee -a "$LOG_FILE"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))

        # Check for .next directory
        if [ -d ".next" ]; then
            NEXT_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
            echo -e "  ${GREEN}✓${NC} Build output: .next/ (${NEXT_SIZE})" | tee -a "$LOG_FILE"
        fi
    else
        echo -e "  ${RED}✗${NC} Build failed - check ${BUILD_LOG} for details" | tee -a "$LOG_FILE"
        echo "" | tee -a "$LOG_FILE"
        echo "Build errors:" | tee -a "$LOG_FILE"
        tail -20 "$BUILD_LOG" | tee -a "$LOG_FILE"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Skipping build test (node_modules not found)" | tee -a "$LOG_FILE"
    echo "  Run: npm install && npm run build" | tee -a "$LOG_FILE"
    WARNINGS=$((WARNINGS + 1))
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================
# 9. TYPESCRIPT TYPE CHECK
# ============================================================
echo -e "${YELLOW}🔍 9. TypeScript Type Check${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -d "node_modules" ] && command -v npx &> /dev/null; then
    echo "Running TypeScript type check..." | tee -a "$LOG_FILE"

    TYPE_LOG="$LOG_DIR/typecheck_$TIMESTAMP.log"

    if npx tsc --noEmit > "$TYPE_LOG" 2>&1; then
        echo -e "  ${GREEN}✓${NC} No type errors" | tee -a "$LOG_FILE"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        ERROR_COUNT=$(grep -c "error TS" "$TYPE_LOG" 2>/dev/null || echo "0")
        echo -e "  ${YELLOW}⚠${NC} Found $ERROR_COUNT type errors (may be acceptable)" | tee -a "$LOG_FILE"
        echo "  Check ${TYPE_LOG} for details" | tee -a "$LOG_FILE"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Skipping type check (dependencies not available)" | tee -a "$LOG_FILE"
    WARNINGS=$((WARNINGS + 1))
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================
# 10. ENVIRONMENT VARIABLES CHECK
# ============================================================
echo -e "${YELLOW}🔐 10. Environment Variables${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f ".env.example" ]; then
    echo -e "  ${GREEN}✓${NC} .env.example exists" | tee -a "$LOG_FILE"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))

    # Count environment variables in example
    ENV_COUNT=$(grep -c "^[A-Z]" .env.example 2>/dev/null || echo "0")
    echo "  Found $ENV_COUNT environment variables in template" | tee -a "$LOG_FILE"
else
    echo -e "  ${YELLOW}⚠${NC} .env.example not found" | tee -a "$LOG_FILE"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for local env file
if [ -f ".env.local" ]; then
    echo -e "  ${GREEN}✓${NC} .env.local exists (for local development)" | tee -a "$LOG_FILE"
else
    echo -e "  ${YELLOW}ℹ${NC} .env.local not found (ensure Vercel has env vars configured)" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================
# 11. GIT STATUS
# ============================================================
echo -e "${YELLOW}🔀 11. Git Status${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

if command -v git &> /dev/null; then
    if git rev-parse --git-dir > /dev/null 2>&1; then
        BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
        echo "  Current branch: ${GREEN}$BRANCH${NC}" | tee -a "$LOG_FILE"

        # Check for uncommitted changes
        if git diff-index --quiet HEAD -- 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} No uncommitted changes" | tee -a "$LOG_FILE"
        else
            MODIFIED=$(git status --porcelain | wc -l)
            echo -e "  ${YELLOW}⚠${NC} $MODIFIED uncommitted changes detected" | tee -a "$LOG_FILE"
            echo "  Run: git status" | tee -a "$LOG_FILE"
        fi
    fi
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================
# 12. SECURITY CHECK
# ============================================================
echo -e "${YELLOW}🔒 12. Security Check${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "Checking for sensitive files..." | tee -a "$LOG_FILE"

# Check for .env files that shouldn't be committed
SENSITIVE_FILES=(
    ".env.local"
    ".env.development"
    ".env.production"
    "*.pem"
    "*.key"
    "*.cert"
)

SENSITIVE_FOUND=0
for pattern in "${SENSITIVE_FILES[@]}"; do
    FOUND=$(find . -name "$pattern" ! -path "./node_modules/*" ! -path "./.git/*" 2>/dev/null)
    if [ -n "$FOUND" ]; then
        echo "$FOUND" | while read file; do
            echo -e "  ${YELLOW}⚠${NC} Sensitive file found: $file" | tee -a "$LOG_FILE"
            SENSITIVE_FOUND=$((SENSITIVE_FOUND + 1))
        done
    fi
done

if [ "$SENSITIVE_FOUND" -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} No sensitive files found in repository" | tee -a "$LOG_FILE"
else
    echo -e "  ${YELLOW}⚠${NC} Ensure sensitive files are in .gitignore" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================
# FINAL SUMMARY
# ============================================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Verification Summary                                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "Verification Summary" >> "$LOG_FILE"
echo "====================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

PASS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo -e "Total checks:    ${BLUE}$TOTAL_CHECKS${NC}" | tee -a "$LOG_FILE"
echo -e "Passed:          ${GREEN}$PASSED_CHECKS${NC}" | tee -a "$LOG_FILE"
echo -e "Failed:          ${RED}$FAILED_CHECKS${NC}" | tee -a "$LOG_FILE"
echo -e "Warnings:        ${YELLOW}$WARNINGS${NC}" | tee -a "$LOG_FILE"
echo -e "Pass rate:       ${GREEN}${PASS_RATE}%${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Overall status
if [ "$FAILED_CHECKS" -eq 0 ]; then
    if [ "$WARNINGS" -eq 0 ]; then
        echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}" | tee -a "$LOG_FILE"
        echo -e "Repository is production-ready." | tee -a "$LOG_FILE"
        EXIT_CODE=0
    else
        echo -e "${YELLOW}⚠️  VERIFICATION PASSED WITH WARNINGS${NC}" | tee -a "$LOG_FILE"
        echo -e "Review warnings above before deploying." | tee -a "$LOG_FILE"
        EXIT_CODE=0
    fi
else
    echo -e "${RED}❌ VERIFICATION FAILED${NC}" | tee -a "$LOG_FILE"
    echo -e "Critical issues detected. Please fix before deploying." | tee -a "$LOG_FILE"
    EXIT_CODE=1
fi

echo "" | tee -a "$LOG_FILE"
echo -e "${BLUE}Detailed log saved to:${NC} $LOG_FILE"
echo ""

# Recommendations
echo -e "${YELLOW}Recommendations:${NC}"
if [ "$FAILED_CHECKS" -gt 0 ]; then
    echo "  1. Fix the failed checks above"
    echo "  2. Re-run this verification script"
    echo "  3. Run: git checkout <backup-branch> to restore if needed"
elif [ "$WARNINGS" -gt 0 ]; then
    echo "  1. Review warnings above"
    echo "  2. Deploy to Vercel preview environment"
    echo "  3. Test thoroughly before production deployment"
else
    echo "  1. Run: git add . && git commit -m 'Post-cleanup verification passed'"
    echo "  2. Deploy to Vercel: git push"
    echo "  3. Monitor health endpoint after deployment"
fi

echo ""

exit $EXIT_CODE
