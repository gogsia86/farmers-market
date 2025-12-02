#!/bin/bash
# 🔍 CONSOLE.LOG AUDIT SCRIPT
# Farmers Market Platform - Code Quality Analysis
# Version: 1.0
# Description: Audits console.log statements in production code

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔍 CONSOLE.LOG AUDIT - Production Code Analysis         ║"
echo "║  Farmers Market Platform - Quality Assurance              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Output files
OUTPUT_FILE="console_audit.txt"
SUMMARY_FILE="console_audit_summary.txt"
PRODUCTION_FILE="console_audit_production.txt"

echo "📋 Audit Configuration:"
echo "  • Source directories: src/lib, src/app, src/features, src/repositories"
echo "  • Excluded: __tests__, node_modules, .next"
echo "  • Output file: $OUTPUT_FILE"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "🔍 STEP 1: Scanning for console.log statements..."
echo "════════════════════════════════════════════════════════════"
echo ""

# Find all console.log in source code
grep -rn "console\\.log\\|console\\.warn\\|console\\.error\\|console\\.debug\\|console\\.info" \
  src/lib src/app src/features src/repositories \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir="__tests__" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  --color=never \
  > "$OUTPUT_FILE" 2>/dev/null || true

TOTAL_COUNT=$(wc -l < "$OUTPUT_FILE" 2>/dev/null || echo "0")

if [ "$TOTAL_COUNT" -eq "0" ]; then
  echo -e "${GREEN}✅ No console statements found in production code!${NC}"
  echo -e "${GREEN}🎉 Code is clean and production-ready!${NC}"
  rm -f "$OUTPUT_FILE"
  exit 0
fi

echo -e "${YELLOW}⚠️  Found $TOTAL_COUNT console statements in production code${NC}"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "📊 STEP 2: Categorizing console statements..."
echo "════════════════════════════════════════════════════════════"
echo ""

# Count by type
LOG_COUNT=$(grep -c "console\\.log" "$OUTPUT_FILE" 2>/dev/null || echo "0")
WARN_COUNT=$(grep -c "console\\.warn" "$OUTPUT_FILE" 2>/dev/null || echo "0")
ERROR_COUNT=$(grep -c "console\\.error" "$OUTPUT_FILE" 2>/dev/null || echo "0")
DEBUG_COUNT=$(grep -c "console\\.debug" "$OUTPUT_FILE" 2>/dev/null || echo "0")
INFO_COUNT=$(grep -c "console\\.info" "$OUTPUT_FILE" 2>/dev/null || echo "0")

# Count by directory
LIB_COUNT=$(grep -c "src/lib" "$OUTPUT_FILE" 2>/dev/null || echo "0")
APP_COUNT=$(grep -c "src/app" "$OUTPUT_FILE" 2>/dev/null || echo "0")
FEATURES_COUNT=$(grep -c "src/features" "$OUTPUT_FILE" 2>/dev/null || echo "0")
REPO_COUNT=$(grep -c "src/repositories" "$OUTPUT_FILE" 2>/dev/null || echo "0")

# Generate summary
{
  echo "════════════════════════════════════════════════════════════"
  echo "📊 CONSOLE AUDIT SUMMARY"
  echo "════════════════════════════════════════════════════════════"
  echo ""
  echo "Generated: $(date)"
  echo ""
  echo "TOTAL CONSOLE STATEMENTS: $TOTAL_COUNT"
  echo ""
  echo "By Type:"
  echo "  • console.log:   $LOG_COUNT"
  echo "  • console.warn:  $WARN_COUNT"
  echo "  • console.error: $ERROR_COUNT"
  echo "  • console.debug: $DEBUG_COUNT"
  echo "  • console.info:  $INFO_COUNT"
  echo ""
  echo "By Directory:"
  echo "  • src/lib:          $LIB_COUNT"
  echo "  • src/app:          $APP_COUNT"
  echo "  • src/features:     $FEATURES_COUNT"
  echo "  • src/repositories: $REPO_COUNT"
  echo ""
  echo "════════════════════════════════════════════════════════════"
} > "$SUMMARY_FILE"

# Display summary
cat "$SUMMARY_FILE"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "🎯 STEP 3: Identifying High-Priority Files..."
echo "════════════════════════════════════════════════════════════"
echo ""

# Find files with most console statements
echo "Top 10 Files with Most Console Statements:" > "$PRODUCTION_FILE"
echo "════════════════════════════════════════════════════════════" >> "$PRODUCTION_FILE"
echo "" >> "$PRODUCTION_FILE"

awk -F: '{print $1}' "$OUTPUT_FILE" | sort | uniq -c | sort -rn | head -10 | \
  awk '{printf "  %3d statements: %s\n", $1, $2}' >> "$PRODUCTION_FILE"

echo "" >> "$PRODUCTION_FILE"
echo "════════════════════════════════════════════════════════════" >> "$PRODUCTION_FILE"
echo "CRITICAL PRODUCTION FILES (Services & API Routes):" >> "$PRODUCTION_FILE"
echo "════════════════════════════════════════════════════════════" >> "$PRODUCTION_FILE"
echo "" >> "$PRODUCTION_FILE"

# Filter production code (services and API routes)
grep -E "src/lib/services|src/app/api|src/features.*service" "$OUTPUT_FILE" | \
  head -20 >> "$PRODUCTION_FILE" 2>/dev/null || true

cat "$PRODUCTION_FILE"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "📝 STEP 4: Generating Detailed Report..."
echo "════════════════════════════════════════════════════════════"
echo ""

echo -e "${GREEN}✅ Audit complete!${NC}"
echo ""
echo "📄 Generated Files:"
echo -e "  ${CYAN}• $OUTPUT_FILE${NC}          - Full console statement list"
echo -e "  ${CYAN}• $SUMMARY_FILE${NC} - Summary statistics"
echo -e "  ${CYAN}• $PRODUCTION_FILE${NC} - High-priority production files"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "🔧 RECOMMENDED ACTIONS"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ "$TOTAL_COUNT" -gt "100" ]; then
  echo -e "${RED}🔥 CRITICAL: $TOTAL_COUNT console statements found!${NC}"
  echo ""
  echo "Priority Actions:"
  echo "  1. Review $PRODUCTION_FILE for critical files"
  echo "  2. Replace console.log with proper logger in services"
  echo "  3. Remove debug console statements from API routes"
  echo "  4. Add pre-commit hooks to prevent new console.log"
  echo ""
elif [ "$TOTAL_COUNT" -gt "50" ]; then
  echo -e "${YELLOW}⚠️  MODERATE: $TOTAL_COUNT console statements found${NC}"
  echo ""
  echo "Recommended Actions:"
  echo "  1. Focus on files in $PRODUCTION_FILE"
  echo "  2. Gradually replace with proper logging"
  echo "  3. Set up linting rules to catch new instances"
  echo ""
elif [ "$TOTAL_COUNT" -gt "10" ]; then
  echo -e "${YELLOW}🟡 LOW: $TOTAL_COUNT console statements found${NC}"
  echo ""
  echo "Suggested Actions:"
  echo "  1. Review and clean up remaining statements"
  echo "  2. Document legitimate use cases"
  echo "  3. Add ESLint rules to prevent growth"
  echo ""
else
  echo -e "${GREEN}✅ EXCELLENT: Only $TOTAL_COUNT console statements${NC}"
  echo ""
  echo "Final Steps:"
  echo "  1. Review remaining statements in $OUTPUT_FILE"
  echo "  2. Document any legitimate console usage"
  echo "  3. Maintain this standard going forward"
  echo ""
fi

echo "════════════════════════════════════════════════════════════"
echo "💡 PROPER LOGGING PATTERN"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Replace console.log with proper logging:"
echo ""
echo -e "${RED}❌ BAD:${NC}"
echo '  console.log("User logged in:", userId);'
echo ""
echo -e "${GREEN}✅ GOOD:${NC}"
echo '  import { logger } from "@/lib/logger";'
echo '  logger.info("User logged in", { userId, timestamp: new Date() });'
echo ""

echo "════════════════════════════════════════════════════════════"
echo "📖 NEXT STEPS"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "1. Review the audit files:"
echo "   cat $SUMMARY_FILE"
echo "   cat $PRODUCTION_FILE"
echo ""
echo "2. Create cleanup issues for high-priority files"
echo ""
echo "3. Set up automated checks:"
echo "   • Add ESLint rule: no-console"
echo "   • Add pre-commit hook to block console.log"
echo ""
echo "4. Track progress:"
echo "   • Re-run this script weekly"
echo "   • Target: 0 console statements in production code"
echo ""
echo "📚 See REPOSITORY_ANALYSIS_AND_CLEANUP.md for full guide"
echo ""
