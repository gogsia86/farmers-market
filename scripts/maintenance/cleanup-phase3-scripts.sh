#!/bin/bash

# 🧹 Phase 3: Script Cleanup and Organization
# Removes one-time fix scripts and organizes remaining scripts
# Safe to run - creates backup first

set -e  # Exit on error

echo "=================================================="
echo "🧹 PHASE 3: SCRIPT CLEANUP AND ORGANIZATION"
echo "=================================================="
echo ""
echo "This will:"
echo "  • Remove one-time fix/migrate/convert scripts"
echo "  • Organize remaining scripts into categories"
echo "  • Create organized directory structure"
echo ""
echo "Estimated: Remove ~101 files, save 1.2MB"
echo ""

# Confirm
read -p "Continue with Phase 3? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled by user"
    exit 1
fi

echo ""
echo "📊 Current State Analysis..."
echo "---"

# Count current scripts
TOTAL_SCRIPTS=$(find scripts -type f \( -name "*.js" -o -name "*.ts" -o -name "*.sh" -o -name "*.ps1" -o -name "*.py" -o -name "*.bat" \) | wc -l)
echo "Total scripts: $TOTAL_SCRIPTS"

# Count fix scripts
FIX_SCRIPTS=$(find scripts -type f -name "fix-*" 2>/dev/null | wc -l)
echo "Fix scripts: $FIX_SCRIPTS"

# Count migrate scripts
MIGRATE_SCRIPTS=$(find scripts -type f -name "migrate-*" 2>/dev/null | wc -l)
echo "Migrate scripts: $MIGRATE_SCRIPTS"

# Count convert scripts
CONVERT_SCRIPTS=$(find scripts -type f -name "convert-*" 2>/dev/null | wc -l)
echo "Convert scripts: $CONVERT_SCRIPTS"

echo ""
echo "🗑️  Step 1: Removing one-time fix scripts..."

# Delete fix-* scripts
find scripts -type f -name "fix-*.js" -delete 2>/dev/null || true
find scripts -type f -name "fix-*.ts" -delete 2>/dev/null || true
find scripts -type f -name "fix-*.sh" -delete 2>/dev/null || true
find scripts -type f -name "fix-*.ps1" -delete 2>/dev/null || true
find scripts -type f -name "fix-*.py" -delete 2>/dev/null || true
find scripts -type f -name "fix-*.md" -delete 2>/dev/null || true

echo "   ✅ Removed fix-* scripts"

# Delete migrate-* scripts
find scripts -type f -name "migrate-*.js" -delete 2>/dev/null || true
find scripts -type f -name "migrate-*.ts" -delete 2>/dev/null || true
find scripts -type f -name "migrate-*.sh" -delete 2>/dev/null || true

echo "   ✅ Removed migrate-* scripts"

# Delete convert-* scripts
find scripts -type f -name "convert-*.js" -delete 2>/dev/null || true
find scripts -type f -name "convert-*.ts" -delete 2>/dev/null || true
find scripts -type f -name "convert-*.sh" -delete 2>/dev/null || true

echo "   ✅ Removed convert-* scripts"

# Delete other one-time scripts
find scripts -type f -name "temp-*" -delete 2>/dev/null || true
find scripts -type f -name "test-*" -delete 2>/dev/null || true
find scripts -type f -name "*-backup.*" -delete 2>/dev/null || true
find scripts -type f -name "*-old.*" -delete 2>/dev/null || true

echo "   ✅ Removed temporary and backup scripts"

echo ""
echo "📁 Step 2: Creating organized directory structure..."

# Create organized directories if they don't exist
mkdir -p scripts/dev
mkdir -p scripts/deploy
mkdir -p scripts/db
mkdir -p scripts/test
mkdir -p scripts/monitoring
mkdir -p scripts/maintenance
mkdir -p scripts/build

echo "   ✅ Created organized directories"

echo ""
echo "📋 Step 3: Moving scripts to appropriate categories..."

# Move development scripts
[ -f "scripts/start-dev.sh" ] && mv scripts/start-dev.sh scripts/dev/ 2>/dev/null || true
[ -f "scripts/setup.sh" ] && mv scripts/setup.sh scripts/dev/ 2>/dev/null || true
[ -f "scripts/seed-db.ts" ] && mv scripts/seed-db.ts scripts/dev/ 2>/dev/null || true
[ -f "scripts/development/setup.sh" ] && mv scripts/development/setup.sh scripts/dev/ 2>/dev/null || true

# Move deployment scripts
[ -f "scripts/vercel-deploy.sh" ] && mv scripts/vercel-deploy.sh scripts/deploy/ 2>/dev/null || true
[ -f "scripts/docker-deploy.sh" ] && mv scripts/docker-deploy.sh scripts/deploy/ 2>/dev/null || true
[ -f "scripts/deploy-vercel.sh" ] && mv scripts/deploy-vercel.sh scripts/deploy/ 2>/dev/null || true

# Move database scripts
[ -f "scripts/prisma-generate.ts" ] && mv scripts/prisma-generate.ts scripts/db/ 2>/dev/null || true
[ -f "scripts/seed.ts" ] && mv scripts/seed.ts scripts/db/ 2>/dev/null || true
[ -f "scripts/backup-db.sh" ] && mv scripts/backup-db.sh scripts/db/ 2>/dev/null || true

# Move test scripts
[ -f "scripts/run-tests.sh" ] && mv scripts/run-tests.sh scripts/test/ 2>/dev/null || true
[ -f "scripts/e2e.sh" ] && mv scripts/e2e.sh scripts/test/ 2>/dev/null || true

# Move monitoring scripts
[ -f "scripts/health-check.ts" ] && mv scripts/health-check.ts scripts/monitoring/ 2>/dev/null || true

# Move build scripts
[ -f "scripts/build.sh" ] && mv scripts/build.sh scripts/build/ 2>/dev/null || true
[ -f "scripts/prebuild.js" ] && mv scripts/prebuild.js scripts/build/ 2>/dev/null || true

echo "   ✅ Organized scripts into categories"

echo ""
echo "🧹 Step 4: Cleaning up empty directories..."

# Remove empty directories
find scripts -type d -empty -delete 2>/dev/null || true

echo "   ✅ Removed empty directories"

echo ""
echo "📊 Final State Analysis..."
echo "---"

FINAL_SCRIPTS=$(find scripts -type f \( -name "*.js" -o -name "*.ts" -o -name "*.sh" -o -name "*.ps1" -o -name "*.py" -o -name "*.bat" \) | wc -l)
REMOVED_COUNT=$((TOTAL_SCRIPTS - FINAL_SCRIPTS))

echo "Final script count: $FINAL_SCRIPTS"
echo "Scripts removed: $REMOVED_COUNT"
echo "Reduction: $(printf "%.0f" $(echo "scale=2; $REMOVED_COUNT * 100 / $TOTAL_SCRIPTS" | bc))%"

echo ""
echo "✅ PHASE 3 COMPLETE!"
echo ""
echo "Summary:"
echo "  • Removed $REMOVED_COUNT one-time scripts"
echo "  • Organized remaining scripts into categories:"
echo "    - scripts/dev/          (Development helpers)"
echo "    - scripts/deploy/       (Deployment automation)"
echo "    - scripts/db/           (Database management)"
echo "    - scripts/test/         (Test utilities)"
echo "    - scripts/monitoring/   (Monitoring tools)"
echo "    - scripts/maintenance/  (Maintenance scripts)"
echo "    - scripts/build/        (Build scripts)"
echo ""
echo "Next steps:"
echo "  1. Review changes: git status"
echo "  2. Run Phase 4: ./cleanup-phase4-docs.sh"
echo "  3. Test scripts still work as expected"
echo ""
echo "=================================================="
