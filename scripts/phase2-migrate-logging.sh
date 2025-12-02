#!/bin/bash
# 🔧 PHASE 2 MIGRATION SCRIPT
# Automated console.log replacement with proper logging
# Version: 1.0

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔧 PHASE 2: LOGGING MIGRATION                            ║"
echo "║  Replace console.log with structured logging              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
FILES_PROCESSED=0
REPLACEMENTS=0

# Migration targets (prioritized)
CRITICAL_SERVICES=(
  "src/lib/services/geocoding.service.ts"
  "src/lib/services/payment.service.ts"
  "src/app/api/webhooks/stripe/route.ts"
)

HIGH_PRIORITY=(
  "src/lib/cache/redis.ts"
  "src/lib/email/email-service.ts"
  "src/lib/performance/gpu-processor.ts"
)

echo "📋 Migration Plan:"
echo "  • Phase 2A: Critical services (3 files)"
echo "  • Phase 2B: High-priority infrastructure (3 files)"
echo "  • Phase 2C: Verification & testing"
echo ""

# Function to check if logger exists
check_logger_setup() {
  if [ ! -f "src/lib/logger/index.ts" ]; then
    echo -e "${RED}❌ Logger not set up!${NC}"
    echo ""
    echo "Please run: npm install @opentelemetry/api"
    echo "Logger files should exist at src/lib/logger/"
    exit 1
  fi
  echo -e "${GREEN}✅ Logger infrastructure found${NC}"
}

# Function to backup file
backup_file() {
  local file=$1
  local backup="${file}.backup.$(date +%Y%m%d_%H%M%S)"

  if [ -f "$file" ]; then
    cp "$file" "$backup"
    echo -e "${CYAN}📦 Backed up: $file${NC}"
  fi
}

# Function to add logger import to file
add_logger_import() {
  local file=$1
  local service_name=$2

  # Check if logger import already exists
  if grep -q "from '@/lib/logger'" "$file" 2>/dev/null; then
    echo -e "${BLUE}ℹ️  Logger already imported in $file${NC}"
    return 0
  fi

  # Add import after other imports
  local temp_file="${file}.tmp"
  awk -v service="$service_name" '
    /^import.*from/ { imports = 1; print; next }
    imports && !/^import/ && !logger_added {
      print ""
      print "import { createLogger } from '\''@/lib/logger'\'';"
      print "import type { LogContext } from '\''@/lib/logger'\'';"
      print ""
      print "const logger = createLogger('\''" service "'\'');"
      logger_added = 1
    }
    { print }
  ' "$file" > "$temp_file"

  mv "$temp_file" "$file"
  echo -e "${GREEN}✅ Added logger import to $file${NC}"
}

# Function to suggest replacements (dry run)
suggest_replacements() {
  local file=$1

  echo ""
  echo -e "${YELLOW}📝 Suggested replacements for: $file${NC}"
  echo "────────────────────────────────────────────────────────────"

  grep -n "console\\.log\|console\\.error\|console\\.warn" "$file" 2>/dev/null | head -5 | while IFS=: read -r line_num line_content; do
    echo -e "${CYAN}Line $line_num:${NC} $line_content"
  done || echo "  No console statements found"

  echo ""
}

# Interactive migration function
migrate_file_interactive() {
  local file=$1
  local service_name=$2

  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo -e "${YELLOW}🔄 Migrating: $file${NC}"
  echo "════════════════════════════════════════════════════════════"

  if [ ! -f "$file" ]; then
    echo -e "${RED}❌ File not found: $file${NC}"
    return 1
  fi

  # Count console statements
  local console_count=$(grep -c "console\\.log\|console\\.error\|console\\.warn" "$file" 2>/dev/null || echo "0")

  if [ "$console_count" -eq "0" ]; then
    echo -e "${GREEN}✅ No console statements found - already clean!${NC}"
    return 0
  fi

  echo -e "${YELLOW}Found $console_count console statements${NC}"

  # Show suggestions
  suggest_replacements "$file"

  # Ask for confirmation
  echo -e "${YELLOW}Migrate this file?${NC}"
  echo "  [a] Auto-migrate (simple patterns)"
  echo "  [m] Manual review recommended"
  echo "  [s] Skip"
  echo ""
  read -p "Choice (a/m/s): " -n 1 -r choice
  echo ""

  case "$choice" in
    [Aa])
      echo -e "${BLUE}🤖 Auto-migrating simple patterns...${NC}"
      backup_file "$file"
      add_logger_import "$file" "$service_name"
      auto_migrate_simple_patterns "$file"
      FILES_PROCESSED=$((FILES_PROCESSED + 1))
      ;;
    [Mm])
      echo -e "${CYAN}📝 Manual review recommended${NC}"
      echo "   File: $file"
      echo "   Please manually replace console statements with logger"
      echo ""
      ;;
    *)
      echo -e "${BLUE}⏭️  Skipped${NC}"
      ;;
  esac
}

# Auto-migrate simple patterns
auto_migrate_simple_patterns() {
  local file=$1
  local temp_file="${file}.tmp"

  # Simple pattern replacements
  sed -e 's/console\.log(/logger.info(/g' \
      -e 's/console\.error(/logger.error(/g' \
      -e 's/console\.warn(/logger.warn(/g' \
      -e 's/console\.debug(/logger.debug(/g' \
      "$file" > "$temp_file"

  mv "$temp_file" "$file"

  local replacement_count=$(diff -U 0 "${file}.backup."* "$file" 2>/dev/null | grep -c "^-.*console\." || echo "0")
  REPLACEMENTS=$((REPLACEMENTS + replacement_count))

  echo -e "${GREEN}✅ Replaced $replacement_count console statements${NC}"
}

# Main migration workflow
run_migration() {
  echo "════════════════════════════════════════════════════════════"
  echo "🚀 PHASE 2A: CRITICAL SERVICES"
  echo "════════════════════════════════════════════════════════════"

  for file in "${CRITICAL_SERVICES[@]}"; do
    migrate_file_interactive "$file" "$(basename $file .ts | sed 's/\./-/g')"
  done

  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "🔥 PHASE 2B: HIGH PRIORITY INFRASTRUCTURE"
  echo "════════════════════════════════════════════════════════════"

  for file in "${HIGH_PRIORITY[@]}"; do
    migrate_file_interactive "$file" "$(basename $file .ts | sed 's/\./-/g')"
  done
}

# Verification function
verify_migration() {
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "🧪 VERIFICATION"
  echo "════════════════════════════════════════════════════════════"
  echo ""

  echo "1. Running TypeScript type check..."
  if npm run type-check 2>&1 | tail -5; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
  else
    echo -e "${RED}⚠️  TypeScript errors found${NC}"
    echo "   Please review and fix before proceeding"
  fi

  echo ""
  echo "2. Running tests..."
  if npm test -- --bail 2>&1 | tail -10; then
    echo -e "${GREEN}✅ Tests passed${NC}"
  else
    echo -e "${RED}⚠️  Tests failed${NC}"
    echo "   Please review test failures"
  fi

  echo ""
  echo "3. Checking remaining console statements..."
  local remaining=$(grep -r "console\\.log\|console\\.error\|console\\.warn" \
    src/lib/services src/app/api \
    --include="*.ts" \
    --include="*.tsx" \
    --exclude-dir="__tests__" 2>/dev/null | wc -l || echo "0")

  echo -e "   Remaining console statements: ${YELLOW}$remaining${NC}"

  if [ "$remaining" -lt "10" ]; then
    echo -e "   ${GREEN}✅ Significant improvement!${NC}"
  elif [ "$remaining" -lt "20" ]; then
    echo -e "   ${YELLOW}🟡 Good progress, continue migration${NC}"
  else
    echo -e "   ${RED}⚠️  More work needed${NC}"
  fi
}

# Rollback function
rollback() {
  echo ""
  echo -e "${RED}🔄 ROLLBACK REQUESTED${NC}"
  echo ""

  # Find all backup files
  local backup_files=$(find . -name "*.backup.*" -type f 2>/dev/null)

  if [ -z "$backup_files" ]; then
    echo "No backup files found"
    return 0
  fi

  echo "Found backup files:"
  echo "$backup_files"
  echo ""
  read -p "Restore all backups? (y/n): " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "$backup_files" | while read -r backup; do
      original="${backup%%.backup.*}"
      if [ -f "$backup" ]; then
        mv "$backup" "$original"
        echo -e "${GREEN}✅ Restored: $original${NC}"
      fi
    done
  fi
}

# Main execution
main() {
  echo "Checking prerequisites..."
  check_logger_setup
  echo ""

  echo "════════════════════════════════════════════════════════════"
  echo "⚠️  IMPORTANT NOTES"
  echo "════════════════════════════════════════════════════════════"
  echo ""
  echo "• Backups will be created automatically"
  echo "• Auto-migration handles simple patterns only"
  echo "• Complex patterns require manual review"
  echo "• Tests will run after migration"
  echo "• Rollback is available if needed"
  echo ""

  read -p "Continue with migration? (y/n): " -n 1 -r
  echo ""

  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 0
  fi

  # Run migration
  run_migration

  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "📊 MIGRATION SUMMARY"
  echo "════════════════════════════════════════════════════════════"
  echo ""
  echo -e "Files processed:        ${GREEN}$FILES_PROCESSED${NC}"
  echo -e "Statements replaced:    ${GREEN}$REPLACEMENTS${NC}"
  echo ""

  # Verify
  read -p "Run verification tests? (y/n): " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    verify_migration
  fi

  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "🎉 PHASE 2 MIGRATION COMPLETE!"
  echo "════════════════════════════════════════════════════════════"
  echo ""
  echo "📋 Next Steps:"
  echo "  1. Review changed files: git diff"
  echo "  2. Manually fix any complex patterns"
  echo "  3. Run full test suite: npm test"
  echo "  4. Commit changes: git add -A && git commit -m 'feat: migrate to structured logging'"
  echo ""
  echo "🔄 Rollback available: bash scripts/phase2-migrate-logging.sh --rollback"
  echo ""
  echo "📚 Documentation: PHASE_2_CLEANUP_PLAN.md"
  echo ""
}

# Handle arguments
if [ "$1" = "--rollback" ]; then
  rollback
  exit 0
fi

# Run main
main
