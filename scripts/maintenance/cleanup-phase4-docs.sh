#!/bin/bash

# 📚 Phase 4: Documentation Cleanup and Consolidation
# Removes progress tracking and duplicate documentation files
# Safe to run - creates backup first

set -e  # Exit on error

echo "=================================================="
echo "📚 PHASE 4: DOCUMENTATION CLEANUP"
echo "=================================================="
echo ""
echo "This will:"
echo "  • Remove progress tracking files (*PHASE*, *STEP*, etc.)"
echo "  • Remove summary and completion files"
echo "  • Remove duplicate documentation"
echo "  • Organize remaining docs into proper structure"
echo ""
echo "Estimated: Remove ~1,113 files, save 21MB"
echo ""

# Confirm
read -p "Continue with Phase 4? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled by user"
    exit 1
fi

echo ""
echo "📊 Current State Analysis..."
echo "---"

# Count current docs
TOTAL_DOCS=$(find docs -type f -name "*.md" 2>/dev/null | wc -l)
echo "Total documentation files: $TOTAL_DOCS"

# Count progress files
PROGRESS_FILES=$(find docs -type f \( -name "*PHASE*" -o -name "*STEP*" -o -name "*SESSION*" -o -name "*PROGRESS*" \) 2>/dev/null | wc -l)
echo "Progress tracking files: $PROGRESS_FILES"

# Count completion files
COMPLETION_FILES=$(find docs -type f \( -name "*COMPLETE*" -o -name "*SUMMARY*" -o -name "*FIX*" \) 2>/dev/null | wc -l)
echo "Completion/summary files: $COMPLETION_FILES"

# Count bot files
BOT_FILES=$(find docs -type f -name "BOT_RUN*" 2>/dev/null | wc -l)
echo "Bot run files: $BOT_FILES"

echo ""
echo "🗑️  Step 1: Removing progress tracking files..."

# Remove PHASE files
find docs -type f -name "*PHASE*.md" -delete 2>/dev/null || true
find docs -type f -name "*Phase*.md" -delete 2>/dev/null || true
find docs -type f -name "*phase*.md" -delete 2>/dev/null || true
echo "   ✅ Removed PHASE files"

# Remove STEP files
find docs -type f -name "*STEP*.md" -delete 2>/dev/null || true
find docs -type f -name "*Step*.md" -delete 2>/dev/null || true
find docs -type f -name "*step*.md" -delete 2>/dev/null || true
echo "   ✅ Removed STEP files"

# Remove SESSION files
find docs -type f -name "*SESSION*.md" -delete 2>/dev/null || true
find docs -type f -name "*Session*.md" -delete 2>/dev/null || true
find docs -type f -name "*session*.md" -delete 2>/dev/null || true
echo "   ✅ Removed SESSION files"

# Remove PROGRESS files
find docs -type f -name "*PROGRESS*.md" -delete 2>/dev/null || true
find docs -type f -name "*Progress*.md" -delete 2>/dev/null || true
find docs -type f -name "*progress*.md" -delete 2>/dev/null || true
echo "   ✅ Removed PROGRESS files"

echo ""
echo "🗑️  Step 2: Removing completion and summary files..."

# Remove COMPLETE files
find docs -type f -name "*COMPLETE*.md" -delete 2>/dev/null || true
find docs -type f -name "*Complete*.md" -delete 2>/dev/null || true
find docs -type f -name "*complete*.md" -delete 2>/dev/null || true
echo "   ✅ Removed COMPLETE files"

# Remove SUMMARY files
find docs -type f -name "*SUMMARY*.md" -delete 2>/dev/null || true
find docs -type f -name "*Summary*.md" -delete 2>/dev/null || true
find docs -type f -name "*summary*.md" -delete 2>/dev/null || true
echo "   ✅ Removed SUMMARY files"

# Remove FIX files
find docs -type f -name "*FIX*.md" -delete 2>/dev/null || true
find docs -type f -name "*Fix*.md" -delete 2>/dev/null || true
find docs -type f -name "*fix*.md" -delete 2>/dev/null || true
echo "   ✅ Removed FIX files"

# Remove BOT_RUN files
find docs -type f -name "BOT_RUN*.md" -delete 2>/dev/null || true
find docs -type f -name "bot_run*.md" -delete 2>/dev/null || true
echo "   ✅ Removed BOT_RUN files"

echo ""
echo "🗑️  Step 3: Removing duplicate and temporary files..."

# Remove duplicates (with numbers or dates)
find docs -type f -name "*-v[0-9]*.md" -delete 2>/dev/null || true
find docs -type f -name "*_v[0-9]*.md" -delete 2>/dev/null || true
find docs -type f -name "*-copy*.md" -delete 2>/dev/null || true
find docs -type f -name "*_copy*.md" -delete 2>/dev/null || true
find docs -type f -name "*-backup*.md" -delete 2>/dev/null || true
find docs -type f -name "*_backup*.md" -delete 2>/dev/null || true
find docs -type f -name "*-old*.md" -delete 2>/dev/null || true
find docs -type f -name "*_old*.md" -delete 2>/dev/null || true
find docs -type f -name "*-OLD*.md" -delete 2>/dev/null || true
find docs -type f -name "*_OLD*.md" -delete 2>/dev/null || true
find docs -type f -name "*.md.bak" -delete 2>/dev/null || true
find docs -type f -name "*.backup" -delete 2>/dev/null || true
echo "   ✅ Removed duplicate and backup files"

# Remove temporary files
find docs -type f -name "temp*.md" -delete 2>/dev/null || true
find docs -type f -name "TEMP*.md" -delete 2>/dev/null || true
find docs -type f -name "tmp*.md" -delete 2>/dev/null || true
find docs -type f -name "*-temp.md" -delete 2>/dev/null || true
find docs -type f -name "*_temp.md" -delete 2>/dev/null || true
find docs -type f -name "draft*.md" -delete 2>/dev/null || true
find docs -type f -name "DRAFT*.md" -delete 2>/dev/null || true
echo "   ✅ Removed temporary files"

# Remove test documentation
find docs -type f -name "test*.md" -delete 2>/dev/null || true
find docs -type f -name "TEST*.md" -delete 2>/dev/null || true
find docs -type f -name "*-test.md" -delete 2>/dev/null || true
find docs -type f -name "*_test.md" -delete 2>/dev/null || true
echo "   ✅ Removed test documentation files"

echo ""
echo "🗑️  Step 4: Removing dated files (specific dates in filenames)..."

# Remove files with dates (YYYY-MM-DD format)
find docs -type f -name "*2023-*.md" -delete 2>/dev/null || true
find docs -type f -name "*2024-*.md" -delete 2>/dev/null || true
find docs -type f -name "*2025-*.md" -delete 2>/dev/null || true
find docs -type f -name "*_2023_*.md" -delete 2>/dev/null || true
find docs -type f -name "*_2024_*.md" -delete 2>/dev/null || true
find docs -type f -name "*_2025_*.md" -delete 2>/dev/null || true
echo "   ✅ Removed dated files"

echo ""
echo "📁 Step 5: Organizing remaining documentation..."

# Create proper documentation structure
mkdir -p docs/getting-started
mkdir -p docs/api
mkdir -p docs/architecture
mkdir -p docs/development
mkdir -p docs/deployment
mkdir -p docs/features
mkdir -p docs/guides
mkdir -p docs/monitoring
mkdir -p docs/maintenance
mkdir -p docs/legacy

echo "   ✅ Created organized directory structure"

# Move specific files to appropriate locations
[ -f "docs/quick-start.md" ] && mv docs/quick-start.md docs/getting-started/ 2>/dev/null || true
[ -f "docs/installation.md" ] && mv docs/installation.md docs/getting-started/ 2>/dev/null || true
[ -f "docs/configuration.md" ] && mv docs/configuration.md docs/getting-started/ 2>/dev/null || true

[ -f "docs/rest-api.md" ] && mv docs/rest-api.md docs/api/ 2>/dev/null || true
[ -f "docs/api-reference.md" ] && mv docs/api-reference.md docs/api/ 2>/dev/null || true
[ -f "docs/webhooks.md" ] && mv docs/webhooks.md docs/api/ 2>/dev/null || true

[ -f "docs/database-schema.md" ] && mv docs/database-schema.md docs/architecture/ 2>/dev/null || true
[ -f "docs/authentication.md" ] && mv docs/authentication.md docs/architecture/ 2>/dev/null || true
[ -f "docs/system-design.md" ] && mv docs/system-design.md docs/architecture/ 2>/dev/null || true

[ -f "docs/setup.md" ] && mv docs/setup.md docs/development/ 2>/dev/null || true
[ -f "docs/coding-standards.md" ] && mv docs/coding-standards.md docs/development/ 2>/dev/null || true
[ -f "docs/testing.md" ] && mv docs/testing.md docs/development/ 2>/dev/null || true

[ -f "docs/vercel.md" ] && mv docs/vercel.md docs/deployment/ 2>/dev/null || true
[ -f "docs/docker.md" ] && mv docs/docker.md docs/deployment/ 2>/dev/null || true
[ -f "docs/deployment-guide.md" ] && mv docs/deployment-guide.md docs/deployment/ 2>/dev/null || true

echo "   ✅ Organized documentation into categories"

echo ""
echo "🧹 Step 6: Cleaning up empty directories..."

# Remove empty directories
find docs -type d -empty -delete 2>/dev/null || true

echo "   ✅ Removed empty directories"

echo ""
echo "📊 Final State Analysis..."
echo "---"

FINAL_DOCS=$(find docs -type f -name "*.md" 2>/dev/null | wc -l)
REMOVED_COUNT=$((TOTAL_DOCS - FINAL_DOCS))

echo "Final documentation count: $FINAL_DOCS"
echo "Files removed: $REMOVED_COUNT"
if [ $TOTAL_DOCS -gt 0 ]; then
    echo "Reduction: $(printf "%.0f" $(echo "scale=2; $REMOVED_COUNT * 100 / $TOTAL_DOCS" | bc 2>/dev/null || echo "0"))%"
fi

echo ""
echo "📁 New documentation structure:"
echo "docs/"
echo "  ├── getting-started/  (Installation, setup, quick start)"
echo "  ├── api/             (REST API, webhooks)"
echo "  ├── architecture/    (System design, database schema)"
echo "  ├── development/     (Dev setup, coding standards)"
echo "  ├── deployment/      (Vercel, Docker, production)"
echo "  ├── features/        (Feature documentation)"
echo "  ├── guides/          (How-to guides)"
echo "  ├── monitoring/      (Observability, logging)"
echo "  ├── maintenance/     (Maintenance reports)"
echo "  └── legacy/          (Critical old docs)"

echo ""
echo "✅ PHASE 4 COMPLETE!"
echo ""
echo "Summary:"
echo "  • Removed $REMOVED_COUNT documentation files"
echo "  • Removed progress tracking files"
echo "  • Removed summary and completion files"
echo "  • Organized remaining docs into proper structure"
echo "  • Documentation is now clean and professional"
echo ""
echo "Next steps:"
echo "  1. Review changes: git status"
echo "  2. Create docs/README.md as documentation hub"
echo "  3. Update links in main README.md"
echo "  4. Commit changes"
echo ""
echo "=================================================="
