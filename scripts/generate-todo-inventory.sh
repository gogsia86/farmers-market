#!/bin/bash
# 📝 TODO INVENTORY GENERATION SCRIPT
# Farmers Market Platform - Technical Debt Tracking
# Version: 1.0
# Description: Generates comprehensive TODO/FIXME/HACK inventory with categorization

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  📝 TODO INVENTORY GENERATOR                              ║"
echo "║  Farmers Market Platform - Technical Debt Tracker         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Output files
TODO_FILE="TODO_INVENTORY.txt"
SUMMARY_FILE="TODO_SUMMARY.txt"
CATEGORIZED_FILE="TODO_CATEGORIZED.txt"
PRIORITY_FILE="TODO_HIGH_PRIORITY.txt"

echo "📋 Scan Configuration:"
echo "  • Patterns: TODO, FIXME, XXX, HACK"
echo "  • Directories: src/"
echo "  • File types: .ts, .tsx, .js, .jsx"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "🔍 STEP 1: Scanning Source Code..."
echo "════════════════════════════════════════════════════════════"
echo ""

# Find all TODO comments
grep -rn "TODO\|FIXME\|XXX\|HACK" src/ \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  --color=never \
  > "$TODO_FILE" 2>/dev/null || true

TOTAL_COUNT=$(wc -l < "$TODO_FILE" 2>/dev/null || echo "0")

if [ "$TOTAL_COUNT" -eq "0" ]; then
  echo -e "${GREEN}✅ No TODOs found! Codebase is clean!${NC}"
  echo -e "${GREEN}🎉 All technical debt resolved!${NC}"
  rm -f "$TODO_FILE"
  exit 0
fi

echo -e "${YELLOW}📊 Found $TOTAL_COUNT TODO items${NC}"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "📊 STEP 2: Analyzing and Categorizing..."
echo "════════════════════════════════════════════════════════════"
echo ""

# Count by type
TODO_COUNT=$(grep -c "TODO" "$TODO_FILE" 2>/dev/null || echo "0")
FIXME_COUNT=$(grep -c "FIXME" "$TODO_FILE" 2>/dev/null || echo "0")
XXX_COUNT=$(grep -c "XXX" "$TODO_FILE" 2>/dev/null || echo "0")
HACK_COUNT=$(grep -c "HACK" "$TODO_FILE" 2>/dev/null || echo "0")

# Count by category (keyword matching)
DB_COUNT=$(grep -ci "database\|schema\|model\|prisma\|table" "$TODO_FILE" 2>/dev/null || echo "0")
API_COUNT=$(grep -ci "api\|endpoint\|route\|request\|response" "$TODO_FILE" 2>/dev/null || echo "0")
UI_COUNT=$(grep -ci "ui\|component\|button\|form\|toast\|notification\|alert" "$TODO_FILE" 2>/dev/null || echo "0")
AUTH_COUNT=$(grep -ci "auth\|login\|permission\|security\|token" "$TODO_FILE" 2>/dev/null || echo "0")
PAYMENT_COUNT=$(grep -ci "payment\|stripe\|payout\|refund\|charge" "$TODO_FILE" 2>/dev/null || echo "0")
EMAIL_COUNT=$(grep -ci "email\|notification\|send" "$TODO_FILE" 2>/dev/null || echo "0")
TEST_COUNT=$(grep -ci "test\|spec\|coverage" "$TODO_FILE" 2>/dev/null || echo "0")

# Count by directory
APP_COUNT=$(grep -c "src/app" "$TODO_FILE" 2>/dev/null || echo "0")
LIB_COUNT=$(grep -c "src/lib" "$TODO_FILE" 2>/dev/null || echo "0")
COMPONENTS_COUNT=$(grep -c "src/components" "$TODO_FILE" 2>/dev/null || echo "0")
FEATURES_COUNT=$(grep -c "src/features" "$TODO_FILE" 2>/dev/null || echo "0")

# Generate summary
{
  echo "════════════════════════════════════════════════════════════"
  echo "📊 TODO INVENTORY SUMMARY"
  echo "════════════════════════════════════════════════════════════"
  echo ""
  echo "Generated: $(date)"
  echo "Repository: Farmers Market Platform"
  echo ""
  echo "TOTAL TODO ITEMS: $TOTAL_COUNT"
  echo ""
  echo "By Type:"
  echo "  • TODO:  $TODO_COUNT"
  echo "  • FIXME: $FIXME_COUNT"
  echo "  • XXX:   $XXX_COUNT"
  echo "  • HACK:  $HACK_COUNT"
  echo ""
  echo "By Category:"
  echo "  • Database/Schema:     $DB_COUNT"
  echo "  • API/Endpoints:       $API_COUNT"
  echo "  • UI/Components:       $UI_COUNT"
  echo "  • Auth/Security:       $AUTH_COUNT"
  echo "  • Payment/Stripe:      $PAYMENT_COUNT"
  echo "  • Email/Notifications: $EMAIL_COUNT"
  echo "  • Testing:             $TEST_COUNT"
  echo ""
  echo "By Directory:"
  echo "  • src/app:        $APP_COUNT"
  echo "  • src/lib:        $LIB_COUNT"
  echo "  • src/components: $COMPONENTS_COUNT"
  echo "  • src/features:   $FEATURES_COUNT"
  echo ""
  echo "════════════════════════════════════════════════════════════"
} > "$SUMMARY_FILE"

cat "$SUMMARY_FILE"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "🎯 STEP 3: Identifying High-Priority Items..."
echo "════════════════════════════════════════════════════════════"
echo ""

# Extract high-priority TODOs
{
  echo "════════════════════════════════════════════════════════════"
  echo "🔥 HIGH PRIORITY TODOs"
  echo "════════════════════════════════════════════════════════════"
  echo ""
  echo "CRITICAL: Database Schema Issues"
  echo "────────────────────────────────────────────────────────────"
  grep -i "database\|schema\|model\|prisma" "$TODO_FILE" 2>/dev/null | head -10 || echo "  None found"
  echo ""
  echo "CRITICAL: Payment Integration"
  echo "────────────────────────────────────────────────────────────"
  grep -i "payment\|stripe\|payout\|refund" "$TODO_FILE" 2>/dev/null | head -10 || echo "  None found"
  echo ""
  echo "CRITICAL: Security/Authentication"
  echo "────────────────────────────────────────────────────────────"
  grep -i "auth\|security\|permission\|token" "$TODO_FILE" 2>/dev/null | head -10 || echo "  None found"
  echo ""
  echo "IMPORTANT: API Implementation"
  echo "────────────────────────────────────────────────────────────"
  grep -i "api\|endpoint" "$TODO_FILE" 2>/dev/null | head -15 || echo "  None found"
  echo ""
  echo "ALL FIXME Items (Bugs/Issues)"
  echo "────────────────────────────────────────────────────────────"
  grep "FIXME" "$TODO_FILE" 2>/dev/null || echo "  None found"
  echo ""
  echo "ALL HACK Items (Technical Debt)"
  echo "────────────────────────────────────────────────────────────"
  grep "HACK" "$TODO_FILE" 2>/dev/null || echo "  None found"
  echo ""
  echo "════════════════════════════════════════════════════════════"
} > "$PRIORITY_FILE"

cat "$PRIORITY_FILE"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "📁 STEP 4: Categorizing by Feature Area..."
echo "════════════════════════════════════════════════════════════"
echo ""

{
  echo "════════════════════════════════════════════════════════════"
  echo "📁 TODOs CATEGORIZED BY FEATURE AREA"
  echo "════════════════════════════════════════════════════════════"
  echo ""

  echo "🗄️  DATABASE & SCHEMA"
  echo "────────────────────────────────────────────────────────────"
  grep -i "database\|schema\|model\|prisma\|table" "$TODO_FILE" 2>/dev/null || echo "  None"
  echo ""

  echo "🌐 API & ENDPOINTS"
  echo "────────────────────────────────────────────────────────────"
  grep -i "api\|endpoint\|route" "$TODO_FILE" 2>/dev/null | head -20 || echo "  None"
  echo ""

  echo "💳 PAYMENT & STRIPE"
  echo "────────────────────────────────────────────────────────────"
  grep -i "payment\|stripe\|payout\|refund\|charge" "$TODO_FILE" 2>/dev/null || echo "  None"
  echo ""

  echo "📧 EMAIL & NOTIFICATIONS"
  echo "────────────────────────────────────────────────────────────"
  grep -i "email\|notification\|send\|websocket" "$TODO_FILE" 2>/dev/null || echo "  None"
  echo ""

  echo "🔐 AUTHENTICATION & SECURITY"
  echo "────────────────────────────────────────────────────────────"
  grep -i "auth\|security\|permission\|token" "$TODO_FILE" 2>/dev/null || echo "  None"
  echo ""

  echo "🎨 UI & COMPONENTS"
  echo "────────────────────────────────────────────────────────────"
  grep -i "ui\|component\|button\|form\|toast" "$TODO_FILE" 2>/dev/null | head -20 || echo "  None"
  echo ""

  echo "🧪 TESTING & COVERAGE"
  echo "────────────────────────────────────────────────────────────"
  grep -i "test\|spec\|coverage\|e2e" "$TODO_FILE" 2>/dev/null || echo "  None"
  echo ""

  echo "📊 BUSINESS LOGIC & CALCULATIONS"
  echo "────────────────────────────────────────────────────────────"
  grep -i "calculate\|change\|stats\|metric" "$TODO_FILE" 2>/dev/null || echo "  None"
  echo ""

  echo "════════════════════════════════════════════════════════════"
} > "$CATEGORIZED_FILE"

echo -e "${GREEN}✅ Categorization complete${NC}"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "📊 STATISTICS & HEALTH METRICS"
echo "════════════════════════════════════════════════════════════"
echo ""

# Calculate health score (lower TODOs = better)
if [ "$TOTAL_COUNT" -le "10" ]; then
  HEALTH_SCORE="🟢 EXCELLENT"
  HEALTH_COLOR=$GREEN
elif [ "$TOTAL_COUNT" -le "30" ]; then
  HEALTH_SCORE="🟡 GOOD"
  HEALTH_COLOR=$YELLOW
elif [ "$TOTAL_COUNT" -le "50" ]; then
  HEALTH_SCORE="🟠 MODERATE"
  HEALTH_COLOR=$YELLOW
else
  HEALTH_SCORE="🔴 NEEDS ATTENTION"
  HEALTH_COLOR=$RED
fi

echo -e "Technical Debt Health: ${HEALTH_COLOR}${HEALTH_SCORE}${NC}"
echo ""

# Priority breakdown
CRITICAL_COUNT=$((FIXME_COUNT + HACK_COUNT + DB_COUNT + PAYMENT_COUNT))
echo "Priority Breakdown:"
echo -e "  ${RED}🔥 Critical (FIXME/HACK/DB/Payment): $CRITICAL_COUNT${NC}"
echo -e "  ${YELLOW}🟡 High (API/Auth/Email): $((API_COUNT + AUTH_COUNT + EMAIL_COUNT))${NC}"
echo -e "  ${BLUE}🔵 Medium (UI/Testing): $((UI_COUNT + TEST_COUNT))${NC}"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "📄 GENERATED FILES"
echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "${CYAN}✅ $TODO_FILE${NC}"
echo "   Complete list of all TODO items (line-by-line)"
echo ""
echo -e "${CYAN}✅ $SUMMARY_FILE${NC}"
echo "   Summary statistics and counts"
echo ""
echo -e "${CYAN}✅ $CATEGORIZED_FILE${NC}"
echo "   TODOs organized by feature area"
echo ""
echo -e "${CYAN}✅ $PRIORITY_FILE${NC}"
echo "   High-priority items requiring immediate attention"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "🎯 RECOMMENDED ACTIONS"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ "$TOTAL_COUNT" -gt "50" ]; then
  echo -e "${RED}🚨 CRITICAL: $TOTAL_COUNT TODOs found!${NC}"
  echo ""
  echo "Immediate Actions Required:"
  echo "  1. Review $PRIORITY_FILE for critical database/payment TODOs"
  echo "  2. Create GitHub issues for all FIXME and HACK items"
  echo "  3. Schedule cleanup sprint to address top 20 items"
  echo "  4. Block new features until critical TODOs resolved"
  echo ""
elif [ "$TOTAL_COUNT" -gt "30" ]; then
  echo -e "${YELLOW}⚠️  MODERATE: $TOTAL_COUNT TODOs found${NC}"
  echo ""
  echo "Recommended Actions:"
  echo "  1. Review high-priority items in $PRIORITY_FILE"
  echo "  2. Create issues for database and payment TODOs"
  echo "  3. Allocate 20% of sprint capacity to TODO cleanup"
  echo "  4. Set target: reduce to <20 TODOs within 2 sprints"
  echo ""
elif [ "$TOTAL_COUNT" -gt "10" ]; then
  echo -e "${GREEN}🟢 GOOD: $TOTAL_COUNT TODOs (manageable)${NC}"
  echo ""
  echo "Maintenance Actions:"
  echo "  1. Review and prioritize remaining TODOs"
  echo "  2. Create issues for high-priority items"
  echo "  3. Address 2-3 TODOs per sprint"
  echo "  4. Maintain current level or reduce further"
  echo ""
else
  echo -e "${GREEN}🎉 EXCELLENT: Only $TOTAL_COUNT TODOs!${NC}"
  echo ""
  echo "Maintenance:"
  echo "  1. Review remaining items"
  echo "  2. Document legitimate TODOs as future features"
  echo "  3. Keep count below 10"
  echo ""
fi

echo "════════════════════════════════════════════════════════════"
echo "📋 TODO MANAGEMENT BEST PRACTICES"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "1. TODO Guidelines:"
echo "   • Use TODO for future features/enhancements"
echo "   • Use FIXME for bugs that need fixing"
echo "   • Use HACK for temporary solutions"
echo "   • Use XXX for critical issues"
echo ""
echo "2. Format Standards:"
echo "   // TODO: [ISSUE-123] Add email notification support"
echo "   // FIXME: Handle edge case when user has no products"
echo ""
echo "3. Management Process:"
echo "   • Review TODOs monthly"
echo "   • Convert TODOs to issues after 30 days"
echo "   • Maximum 20 TODOs allowed in codebase"
echo "   • All FIXMEs must be resolved before release"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "🔧 NEXT STEPS"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "1. Review priority file:"
echo "   ${CYAN}cat $PRIORITY_FILE${NC}"
echo ""
echo "2. Create GitHub issues for critical TODOs"
echo ""
echo "3. Add to sprint planning:"
echo "   • Address all FIXME items"
echo "   • Resolve database schema TODOs"
echo "   • Complete payment integration TODOs"
echo ""
echo "4. Track progress:"
echo "   • Re-run this script weekly"
echo "   • Target: <20 TODOs within 2 sprints"
echo "   • Goal: <10 TODOs for production launch"
echo ""
echo "5. Prevent accumulation:"
echo "   • Add PR review checklist item for TODOs"
echo "   • Set up Git hook to warn on new TODOs"
echo "   • Include TODO count in CI/CD metrics"
echo ""
echo "📚 Full cleanup guide: REPOSITORY_ANALYSIS_AND_CLEANUP.md"
echo ""
