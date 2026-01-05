#!/bin/bash

# 🌟 Divine Root Directory Cleanup Script
# Farmers Market Platform - Organization & Deep Clean
# This script moves progress/summary files to .project-docs/

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║ 🌾 DIVINE ROOT DIRECTORY CLEANUP                          ║"
echo "║ Organizing progress, session, and summary files           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Create .project-docs structure if it doesn't exist
echo "📁 Creating .project-docs structure..."
mkdir -p .project-docs/{progress,sessions,summaries,quick-refs,archives}

# Add .project-docs to .gitignore if not already there
if ! grep -q "^\.project-docs/$" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Project documentation and progress tracking" >> .gitignore
    echo ".project-docs/" >> .gitignore
    echo "✅ Added .project-docs/ to .gitignore"
fi

echo ""
echo "🔄 Moving files to organized structure..."
echo ""

# Counter for moved files
MOVED_COUNT=0

# Function to move file with logging
move_file() {
    local file="$1"
    local destination="$2"
    if [ -f "$file" ]; then
        mv "$file" "$destination"
        echo "  ✓ Moved: $(basename "$file")"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    fi
}

# ============================================================
# PROGRESS & STATUS FILES
# ============================================================
echo "📊 Moving progress and status files..."

progress_files=(
    "ANALYSIS_SUMMARY.md"
    "IMPLEMENTATION_PROGRESS_REPORT.md"
    "IMPLEMENTATION_ROADMAP.md"
    "PROJECT_ROADMAP.md"
    "PROJECT_STATUS_90_PERCENT.md"
    "CONTINUOUS_DEVELOPMENT_PROGRESS.md"
    "FIXES_PROGRESS.md"
    "WEEK_2_PROGRESS_TRACKER.md"
    "START_HERE_DAY_13_STATUS.md"
    "WEEK_1_IMPLEMENTATION_STATUS.md"
    "WEEK_2_DAY_1_IMPLEMENTATION_STATUS.md"
    "WEEK_2_DAY_2_IMPLEMENTATION_STATUS.md"
    "WEEK_2_DAY_3_IMPLEMENTATION_STATUS.md"
    "PHASE_3_PRODUCT_MANAGEMENT_COMPLETE.md"
)

for file in "${progress_files[@]}"; do
    move_file "$file" ".project-docs/progress/"
done

# ============================================================
# SESSION SUMMARIES
# ============================================================
echo ""
echo "📝 Moving session summaries..."

session_files=(
    "BUILD_SUCCESS_SESSION_SUMMARY.md"
    "SESSION_COMPLETE.md"
    "SESSION_INTEGRATION_SUMMARY.md"
    "SESSION_SUMMARY_CHECKOUT_UI.md"
    "SESSION_SUMMARY_PHASE_3.md"
    "SESSION_SUMMARY_PHASE_4_CART_CHECKOUT.md"
    "CONTINUOUS_MODE_SESSION_02.md"
    "CONTINUOUS_MODE_SESSION_03_COMPLETION_PUSH.md"
    "CONTINUOUS_SESSION_ADMIN_COMPLETE.md"
    "CONTINUOUS_SESSION_SUMMARY.md"
    "WEEK_1_CONTINUOUS_MODE_SESSION.md"
    "WEEK_2_SESSION_SUMMARY.md"
    "WEEK_2_DAY_2_SESSION_SUMMARY.md"
    "WEEK_2_DAY_3_SESSION_SUMMARY.md"
    "✨_SESSION_COMPLETE_FINAL_SUMMARY.md"
    "🏆_SESSION_COMPLETE_ZERO_ERRORS.md"
)

for file in "${session_files[@]}"; do
    move_file "$file" ".project-docs/sessions/"
done

# ============================================================
# COMPLETION SUMMARIES
# ============================================================
echo ""
echo "🎯 Moving completion summaries..."

summary_files=(
    "BUILD_SUCCESS.md"
    "CLEANUP_COMPLETE.md"
    "CLEAN_SLATE_READY.md"
    "CLEAN_SLATE_SUCCESS.md"
    "CONTINUATION_SUCCESS.md"
    "DEPLOYMENT_READY.md"
    "EMAIL_INTEGRATION_COMPLETE.md"
    "FEATURE_BUILD_COMPLETE.md"
    "FEATURES_COMPLETED_SUMMARY.md"
    "INTEGRATION_COMPLETED.md"
    "PHASE_4_SHOPPING_CART_CHECKOUT_COMPLETE.md"
    "REMAINING_FEATURES_COMPLETION.md"
    "SCHEMA_FIXES_DONE.md"
    "SCHEMA_FIX_COMPLETE.md"
    "TYPESCRIPT_CLEANUP_STATUS.md"
    "WEB_FIXES_SUMMARY.md"
    "CODE_ANALYSIS_CLEANUP_PLAN.md"
    "ANIMATION_SYSTEM_AUDIT_COMPLETE.md"
    "READ_ME_FIRST_DAY_3_COMPLETE.md"
    "READ_ME_FIRST_DAY_4_COMPLETE.md"
    "START_HERE_DAY_14_COMPLETE.md"
    "START_HERE_WEEK_1_COMPLETE.md"
    "WEEK_1_COMPLETION_CERTIFICATE.md"
    "WEEK_2_DAY_1_COMPLETION_CERTIFICATE.md"
    "WEEK_2_DAY_2_COMPLETION_CERTIFICATE.md"
    "WEEK_2_DAY_3_COMPLETION_CERTIFICATE.md"
    "WEEK_2_DAY_5_COMPLETION_ANALYSIS.md"
    "WEEK_2_DAY_7_COMPLETION_CERTIFICATE.md"
    "✅_ALL_TYPESCRIPT_ERRORS_FIXED.md"
)

for file in "${summary_files[@]}"; do
    move_file "$file" ".project-docs/summaries/"
done

# ============================================================
# QUICK REFERENCE & GUIDES
# ============================================================
echo ""
echo "📚 Moving quick reference files..."

quick_ref_files=(
    "CART_CHECKOUT_QUICK_START.md"
    "CHECKOUT_QUICK_START.md"
    "CHECKOUT_UI_IMPLEMENTATION.md"
    "DEPLOYMENT_QUICK_START.md"
    "INTEGRATION_QUICK_START.md"
    "QUICK_IMPLEMENTATION_GUIDE.md"
    "QUICK_REFERENCE.md"
    "QUICK_START.md"
    "PAGE_STATUS_QUICK_REFERENCE.md"
    "STATUS_QUICK_REF.md"
    "START_HERE_WEEK_2_DAY_2.md"
    "START_HERE_WEEK_2_DAY_3.md"
    "START_HERE_WEEK_2_DAY_4.md"
    "START_HERE_WEEK_2_DAY_5.md"
    "START_HERE_WEEK_2_DAY_13.md"
    "WEEK_2_QUICK_START.md"
    "READ_ME_FIRST_WEEK_2.md"
    "NEXT_SESSION_START_HERE.md"
    "PHASE_4_KICKOFF.md"
    "🎯_CONTINUE_FROM_HERE.md"
    "🎯_TEST_RESULTS_FINAL_SUMMARY.md"
    "🎯_TYPESCRIPT_FIXES_QUICK_REFERENCE.md"
    "📋_QUICK_REFERENCE_CARD.md"
    "🚀_START_HERE.md"
    "🧪_TEST_SUITE_ANALYSIS.md"
)

for file in "${quick_ref_files[@]}"; do
    move_file "$file" ".project-docs/quick-refs/"
done

# ============================================================
# ANALYSIS & TROUBLESHOOTING FILES
# ============================================================
echo ""
echo "🔍 Moving analysis and troubleshooting files..."

analysis_files=(
    "COMPLETE_WEBSITE_STRUCTURE.md"
    "DATABASE_MIGRATION_GUIDE.md"
    "FRESH_START_STRATEGY.md"
    "INTEGRATION_CHECKLIST.md"
    "REALTIME_ARCHITECTURE_GUIDE.md"
    "REBUILD_GUIDE.md"
    "SERVER_STATUS.md"
    "SERVER_TROUBLESHOOTING.md"
    "SITE_MAP_VISUAL.md"
    "TEST_RESULTS_AND_FIXES.md"
    "TYPESCRIPT_FIXES_GUIDE.md"
    "TYPE_FIXES_NEEDED.md"
    "VERCEL_DEPLOY_GUIDE.md"
    "VERCEL_DEPLOY_STEPS.md"
    "WEBSITE_ANALYSIS_AND_REBUILD_RECOMMENDATION.md"
    "WEBSITE_ANALYSIS_REPORT.md"
)

for file in "${analysis_files[@]}"; do
    move_file "$file" ".project-docs/archives/"
done

# ============================================================
# TEMPORARY & LOG FILES TO DELETE
# ============================================================
echo ""
echo "🗑️  Removing temporary and log files..."

temp_files=(
    "build-output.log"
    "dev-server.log"
    "dev-server.pid"
    "dev.log"
    "test-file.backup"
    ".vercel-trigger"
)

for file in "${temp_files[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Deleted: $file"
    fi
done

# ============================================================
# REDUNDANT RULES FILES
# ============================================================
echo ""
echo "📋 Handling redundant rules files..."

# Keep only .cursorrules, move others to archives
if [ -f ".cursorrules-no-old-code" ]; then
    move_file ".cursorrules-no-old-code" ".project-docs/archives/"
fi

if [ -f ".refactoring-rules" ]; then
    move_file ".refactoring-rules" ".project-docs/archives/"
fi

# ============================================================
# EMPTY ARCHIVE FOLDERS
# ============================================================
echo ""
echo "📦 Cleaning up empty archive folders..."

if [ -d ".archive" ] && [ -z "$(ls -A .archive)" ]; then
    rmdir .archive
    echo "  ✓ Removed empty .archive folder"
fi

if [ -d ".archive-old-implementation" ] && [ -z "$(ls -A .archive-old-implementation)" ]; then
    rmdir .archive-old-implementation
    echo "  ✓ Removed empty .archive-old-implementation folder"
fi

# ============================================================
# CREATE INDEX FILES
# ============================================================
echo ""
echo "📖 Creating index files for .project-docs..."

# Main index
cat > .project-docs/README.md << 'EOF'
# 📚 Project Documentation Archive

This directory contains organized project documentation, progress tracking, and historical records.

## 📁 Structure

```
.project-docs/
├── progress/          # Progress reports and status updates
├── sessions/          # Session summaries and completion reports
├── summaries/         # Feature completion and milestone summaries
├── quick-refs/        # Quick reference guides and start here docs
└── archives/          # Historical analysis and troubleshooting docs
```

## 🎯 Current Working Documents

For current project documentation, refer to:
- `README.md` - Main project readme
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history
- `docs/` - Active technical documentation

## 📝 Note

Files in `.project-docs/` are **excluded from git** to keep the repository clean.
They serve as local reference and historical records.

---
*This directory is auto-managed by cleanup scripts*
EOF

# Progress index
cat > .project-docs/progress/README.md << 'EOF'
# 📊 Progress Tracking

Historical progress reports and status updates for the Farmers Market Platform.

## Purpose

This directory contains snapshots of project progress at various milestones.
Files are organized chronologically and by feature/phase.

## Latest Status

For the most current status, check:
- Main `README.md` in project root
- `docs/project/` for active roadmaps
EOF

# Sessions index
cat > .project-docs/sessions/README.md << 'EOF'
# 📝 Development Sessions

Records of development sessions, including work completed, issues resolved, and next steps.

## Purpose

Session summaries help track:
- Daily/weekly development progress
- Feature completions
- Bug fixes and improvements
- Team coordination
EOF

# Summaries index
cat > .project-docs/summaries/README.md << 'EOF'
# 🎯 Feature & Milestone Summaries

Completion summaries for major features and project milestones.

## Purpose

Track completed work and celebrate achievements:
- Feature completions
- Phase completions
- Major refactorings
- Quality improvements
EOF

# Quick refs index
cat > .project-docs/quick-refs/README.md << 'EOF'
# 📚 Quick Reference Guides

Quick start guides, checklists, and reference cards for rapid development.

## Purpose

Quick access to:
- Getting started guides
- Implementation checklists
- Status references
- Next steps guides

## Active Guides

For current quick references, see `docs/quick-start/` and `docs/guides/`
EOF

echo "  ✓ Created index files"

# ============================================================
# SUMMARY
# ============================================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║ ✅ CLEANUP COMPLETE                                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Summary:"
echo "  • Files moved: $MOVED_COUNT"
echo "  • New structure: .project-docs/"
echo "  • Temporary files cleaned"
echo "  • Empty archives removed"
echo ""
echo "📁 New Organization:"
echo "  .project-docs/"
echo "  ├── progress/      - Progress reports"
echo "  ├── sessions/      - Session summaries"
echo "  ├── summaries/     - Completion reports"
echo "  ├── quick-refs/    - Quick references"
echo "  └── archives/      - Historical docs"
echo ""
echo "🎯 Root directory is now clean!"
echo "   Only essential config and active docs remain."
echo ""
echo "💡 Note: .project-docs/ is git-ignored for local use only"
echo ""
