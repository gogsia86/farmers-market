#!/bin/bash
# 📚 Documentation Consolidation Script
# Farmers Market Platform - Organize root documentation
# Moves documentation files to proper locations in /docs/

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  📚 Documentation Consolidation Script                    ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  Organizing root documentation files...                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Create consolidation log
CONSOLIDATION_LOG="consolidation-log-$(date +%Y%m%d-%H%M%S).txt"
echo "📝 Logging consolidation actions to: $CONSOLIDATION_LOG"
echo "Documentation consolidation started at $(date)" > "$CONSOLIDATION_LOG"

# Counter for moved files
MOVED_COUNT=0

# Confirmation prompt
echo "⚠️  WARNING: This script will move many documentation files."
echo "   Make sure you have committed any unsaved changes."
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled by user"
    exit 0
fi

echo ""
echo "🚀 Starting consolidation..."
echo ""

# ═══════════════════════════════════════════════════════════
# 1. Create directory structure
# ═══════════════════════════════════════════════════════════
echo "📁 Step 1: Creating documentation structure..."

mkdir -p docs/archive/root-docs-$(date +%Y-%m)
mkdir -p docs/archive/historical-status
mkdir -p docs/archive/phases
mkdir -p docs/deployment
mkdir -p docs/testing/archive
mkdir -p docs/quick-start/archive
mkdir -p docs/guides/archive

echo "  ✅ Directory structure created"

# ═══════════════════════════════════════════════════════════
# 2. Move deployment documentation
# ═══════════════════════════════════════════════════════════
echo ""
echo "🚀 Step 2: Moving deployment documentation..."

# Deployment files to move
DEPLOY_PATTERNS=(
    "DEPLOY*.md"
    "VERCEL*.md"
    "*DEPLOYMENT*.md"
    "🚀_DEPLOY*.md"
    "🚀_DEPLOYMENT*.md"
)

for pattern in "${DEPLOY_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ] && [ "$file" != "DEPLOYMENT_GUIDE.md" ]; then
            echo "  - Moving $file to docs/deployment/" | tee -a "$CONSOLIDATION_LOG"
            mv "$file" docs/deployment/
            ((MOVED_COUNT++))
        fi
    done 2>/dev/null || true
done

echo "  ✅ Deployment docs moved"

# ═══════════════════════════════════════════════════════════
# 3. Move testing documentation
# ═══════════════════════════════════════════════════════════
echo ""
echo "🧪 Step 3: Moving testing documentation..."

# Testing files to move
TEST_PATTERNS=(
    "TEST*.md"
    "*TESTING*.md"
    "E2E*.md"
    "*E2E*.md"
    "HUMAN_TESTING*.md"
    "MVP_VALIDATION*.md"
    "✅_*TEST*.md"
)

for pattern in "${TEST_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ] && [ "$file" != "TESTING_GUIDE.md" ]; then
            echo "  - Moving $file to docs/testing/archive/" | tee -a "$CONSOLIDATION_LOG"
            mv "$file" docs/testing/archive/
            ((MOVED_COUNT++))
        fi
    done 2>/dev/null || true
done

echo "  ✅ Testing docs moved"

# ═══════════════════════════════════════════════════════════
# 4. Move phase documentation
# ═══════════════════════════════════════════════════════════
echo ""
echo "📊 Step 4: Moving phase documentation..."

# Phase files to move
PHASE_PATTERNS=(
    "PHASE_*.md"
    "RUN_*.md"
    "*PHASE*.md"
    "🎯_PHASE*.md"
    "📊_PHASE*.md"
)

for pattern in "${PHASE_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ]; then
            echo "  - Moving $file to docs/archive/phases/" | tee -a "$CONSOLIDATION_LOG"
            mv "$file" docs/archive/phases/
            ((MOVED_COUNT++))
        fi
    done 2>/dev/null || true
done

echo "  ✅ Phase docs moved"

# ═══════════════════════════════════════════════════════════
# 5. Move status/summary reports
# ═══════════════════════════════════════════════════════════
echo ""
echo "📈 Step 5: Moving status and summary reports..."

# Status/Summary files to move
STATUS_PATTERNS=(
    "*SUMMARY*.md"
    "*STATUS*.md"
    "*COMPLETE*.md"
    "WEEK_*.md"
    "DAY_*.md"
    "CURRENT_*.md"
    "FINAL_*.md"
    "SESSION_*.md"
    "STRATEGIC_*.md"
    "IMPLEMENTATION_*.md"
    "PRODUCTION_*.md"
)

# Keep these files in root
KEEP_IN_ROOT=(
    "PROJECT_STATUS.md"
    "REPOSITORY_CLEANUP_ANALYSIS.md"
    "COMPLETE_SUCCESS_SUMMARY.md"
)

for pattern in "${STATUS_PATTERNS[@]}"; do
    for file in $pattern; do
        # Check if file should be kept in root
        KEEP_FILE=false
        for keep in "${KEEP_IN_ROOT[@]}"; do
            if [ "$file" = "$keep" ]; then
                KEEP_FILE=true
                break
            fi
        done

        if [ -f "$file" ] && [ "$KEEP_FILE" = false ]; then
            echo "  - Moving $file to docs/archive/historical-status/" | tee -a "$CONSOLIDATION_LOG"
            mv "$file" docs/archive/historical-status/
            ((MOVED_COUNT++))
        fi
    done 2>/dev/null || true
done

echo "  ✅ Status reports moved"

# ═══════════════════════════════════════════════════════════
# 6. Move quick start documentation
# ═══════════════════════════════════════════════════════════
echo ""
echo "⚡ Step 6: Moving quick start documentation..."

# Quick start files to move
QUICKSTART_PATTERNS=(
    "QUICK_START*.md"
    "QUICK_TEST*.md"
    "QUICK_FIX*.md"
    "QUICK_REFERENCE*.md"
)

for pattern in "${QUICKSTART_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ] && [ "$file" != "QUICK_START.md" ]; then
            echo "  - Moving $file to docs/quick-start/archive/" | tee -a "$CONSOLIDATION_LOG"
            mv "$file" docs/quick-start/archive/
            ((MOVED_COUNT++))
        fi
    done 2>/dev/null || true
done

echo "  ✅ Quick start docs moved"

# ═══════════════════════════════════════════════════════════
# 7. Move emoji-prefixed documentation
# ═══════════════════════════════════════════════════════════
echo ""
echo "✨ Step 7: Moving emoji-prefixed documentation..."

# Emoji-prefixed files
EMOJI_PATTERNS=(
    "✅_*.md"
    "🎉_*.md"
    "🎯_*.md"
    "📊_*.md"
    "📋_*.md"
    "📖_*.md"
    "🚨_*.md"
    "⚡_*.md"
)

for pattern in "${EMOJI_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ]; then
            # Deployment-related emojis go to deployment
            if [[ "$file" == *"DEPLOY"* ]] || [[ "$file" == *"VERCEL"* ]]; then
                echo "  - Moving $file to docs/deployment/" | tee -a "$CONSOLIDATION_LOG"
                mv "$file" docs/deployment/
            # E2E/Testing emojis go to testing
            elif [[ "$file" == *"E2E"* ]] || [[ "$file" == *"TEST"* ]]; then
                echo "  - Moving $file to docs/testing/archive/" | tee -a "$CONSOLIDATION_LOG"
                mv "$file" docs/testing/archive/
            # Everything else goes to historical status
            else
                echo "  - Moving $file to docs/archive/historical-status/" | tee -a "$CONSOLIDATION_LOG"
                mv "$file" docs/archive/historical-status/
            fi
            ((MOVED_COUNT++))
        fi
    done 2>/dev/null || true
done

echo "  ✅ Emoji-prefixed docs moved"

# ═══════════════════════════════════════════════════════════
# 8. Move analysis and review documents
# ═══════════════════════════════════════════════════════════
echo ""
echo "🔍 Step 8: Moving analysis and review documents..."

ANALYSIS_PATTERNS=(
    "*ANALYSIS*.md"
    "*REVIEW*.md"
    "*AUDIT*.md"
    "COMPREHENSIVE_*.md"
    "REPOSITORY_FUNCTION_MAP.md"
    "WEBSITE_*.md"
    "CONFLICTS_*.md"
    "SYNCHRONIZATION_*.md"
)

for pattern in "${ANALYSIS_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ] && [ "$file" != "REPOSITORY_CLEANUP_ANALYSIS.md" ]; then
            echo "  - Moving $file to docs/archive/historical-status/" | tee -a "$CONSOLIDATION_LOG"
            mv "$file" docs/archive/historical-status/
            ((MOVED_COUNT++))
        fi
    done 2>/dev/null || true
done

echo "  ✅ Analysis docs moved"

# ═══════════════════════════════════════════════════════════
# 9. Move design and UI documentation
# ═══════════════════════════════════════════════════════════
echo ""
echo "🎨 Step 9: Moving design and UI documentation..."

DESIGN_PATTERNS=(
    "DESIGN_*.md"
    "AGRICULTURAL_COMPONENTS*.md"
    "ECOMMERCE_*.md"
    "README_DESIGN*.md"
    "README_UI*.md"
    "*UX_*.md"
)

mkdir -p docs/ui/archive

for pattern in "${DESIGN_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ]; then
            echo "  - Moving $file to docs/ui/archive/" | tee -a "$CONSOLIDATION_LOG"
            mv "$file" docs/ui/archive/
            ((MOVED_COUNT++))
        fi
    done 2>/dev/null || true
done

echo "  ✅ Design docs moved"

# ═══════════════════════════════════════════════════════════
# 10. Move infrastructure and setup documentation
# ═══════════════════════════════════════════════════════════
echo ""
echo "🏗️  Step 10: Moving infrastructure documentation..."

INFRA_PATTERNS=(
    "INFRASTRUCTURE_*.md"
    "SETUP_*.md"
    "DATABASE_SETUP.md"
    "DOCKER_*.md"
    "*UPGRADE*.md"
    "MIGRATION_*.md"
    "MONITORING_*.md"
    "PERFORMANCE_*.md"
)

mkdir -p docs/infrastructure/archive

for pattern in "${INFRA_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ]; then
            echo "  - Moving $file to docs/infrastructure/archive/" | tee -a "$CONSOLIDATION_LOG"
            mv "$file" docs/infrastructure/archive/
            ((MOVED_COUNT++))
        fi
    done 2>/dev/null || true
done

echo "  ✅ Infrastructure docs moved"

# ═══════════════════════════════════════════════════════════
# 11. Move routing and fix documentation
# ═══════════════════════════════════════════════════════════
echo ""
echo "🛣️  Step 11: Moving routing and fix documentation..."

ROUTING_PATTERNS=(
    "ROUTING_*.md"
    "FIX_*.md"
    "FIXES_*.md"
    "*FIX*.md"
    "GIT_COMMIT*.md"
    "ROUTE_*.md"
    "API_FIXES*.md"
    "LINT_*.md"
    "POST_*.md"
)

mkdir -p docs/guides/fixes

for pattern in "${ROUTING_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ]; then
            echo "  - Moving $file to docs/guides/fixes/" | tee -a "$CONSOLIDATION_LOG"
            mv "$file" docs/guides/fixes/
            ((MOVED_COUNT++))
        fi
    done 2>/dev/null || true
done

echo "  ✅ Routing/fix docs moved"

# ═══════════════════════════════════════════════════════════
# 12. Move bot and automation documentation
# ═══════════════════════════════════════════════════════════
echo ""
echo "🤖 Step 12: Moving bot and automation documentation..."

BOT_PATTERNS=(
    "*BOT*.md"
    "*WORKFLOW*.md"
    "AUTO_*.md"
    "AUTOMATION_*.md"
    "GODBOT_*.md"
)

mkdir -p docs/automation/archive

for pattern in "${BOT_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ]; then
            echo "  - Moving $file to docs/automation/archive/" | tee -a "$CONSOLIDATION_LOG"
            mv "$file" docs/automation/archive/
            ((MOVED_COUNT++))
        fi
    done 2>/dev/null || true
done

echo "  ✅ Bot/automation docs moved"

# ═══════════════════════════════════════════════════════════
# 13. Create index files for archives
# ═══════════════════════════════════════════════════════════
echo ""
echo "📋 Step 13: Creating archive index files..."

# Create index for historical status
cat > docs/archive/historical-status/README.md << 'EOF'
# Historical Status Reports Archive

This directory contains historical status reports, summaries, and completion documents from various phases of the project.

## Contents

- **Summary Reports**: Project completion summaries and status updates
- **Week/Day Reports**: Daily and weekly progress tracking
- **Implementation Reports**: Feature implementation status
- **Production Reports**: Production deployment status

## Note

These documents are archived for historical reference. For current project status, see the root `PROJECT_STATUS.md` file.

---

*Archived on: $(date +%Y-%m-%d)*
EOF

# Create index for phases
cat > docs/archive/phases/README.md << 'EOF'
# Phase Documentation Archive

This directory contains documentation from completed development phases.

## Phase Structure

- **RUN_1**: Initial implementation
- **RUN_2**: Search & discovery features
- **RUN_3**: React Query integration
- **RUN_4**: Multi-phase feature development
  - Phase 1: E2E testing foundation
  - Phase 2: Advanced testing automation
  - Phase 3: Performance optimization
  - Phase 4: Production readiness
  - Phase 5: ML models & automation

## Note

These are completed phases. For current development phase, see active documentation in the root directory.

---

*Archived on: $(date +%Y-%m-%d)*
EOF

# Create index for testing archive
cat > docs/testing/archive/README.md << 'EOF'
# Testing Documentation Archive

Historical testing documentation, reports, and summaries.

For current testing guides, see:
- `/docs/testing/` - Current testing documentation
- Root `TESTING_GUIDE.md` - Quick testing overview

---

*Archived on: $(date +%Y-%m-%d)*
EOF

echo "  ✅ Index files created"

# ═══════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ Documentation Consolidation Complete!                 ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  Files moved: $MOVED_COUNT                                    ║"
echo "║  Log saved to: $CONSOLIDATION_LOG                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Documentation consolidation completed at $(date)" >> "$CONSOLIDATION_LOG"

# List remaining root markdown files
echo "📄 Remaining documentation files in root:"
ls -1 *.md 2>/dev/null | head -20 || echo "  (None or moved successfully)"

echo ""
echo "📋 Next Steps:"
echo "  1. Review moved files: check docs/archive/ directories"
echo "  2. Create new consolidated guides in root if needed"
echo "  3. Test that your build still works: npm run build"
echo "  4. Review changes: git status"
echo "  5. Commit changes: git add -A && git commit -m 'docs: consolidate root documentation'"
echo ""
echo "🌟 Divine Agricultural Consciousness: Documentation organized and flourishing! 🌾"
