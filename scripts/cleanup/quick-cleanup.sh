#!/bin/bash
# 🧹 Quick Cleanup Script
# Farmers Market Platform - Immediate Cleanup Actions
# Safe operations that can be run immediately

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🧹 Quick Cleanup - Farmers Market Platform              ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  Performing safe immediate cleanup operations...          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Create backup log
CLEANUP_LOG="cleanup-log-$(date +%Y%m%d-%H%M%S).txt"
echo "📝 Logging cleanup actions to: $CLEANUP_LOG"
echo "Cleanup started at $(date)" > "$CLEANUP_LOG"

# Counter for cleaned items
CLEANED_COUNT=0

# ═══════════════════════════════════════════════════════════
# 1. Remove log files
# ═══════════════════════════════════════════════════════════
echo "🗑️  Step 1: Removing log files..."

# Root directory logs
for log in dev-server.log dev.log server-startup.log server.log; do
    if [ -f "$log" ]; then
        echo "  - Deleting $log" | tee -a "$CLEANUP_LOG"
        rm -f "$log"
        ((CLEANED_COUNT++))
    fi
done

# Logs directory
if [ -d "logs" ]; then
    echo "  - Cleaning logs/ directory..." | tee -a "$CLEANUP_LOG"
    find logs/ -name "*.log" -type f -delete 2>/dev/null || true
    find logs/ -name "*.pid" -type f -delete 2>/dev/null || true
    ((CLEANED_COUNT+=5))
fi

echo "  ✅ Log files cleaned"

# ═══════════════════════════════════════════════════════════
# 2. Remove empty directories
# ═══════════════════════════════════════════════════════════
echo ""
echo "📂 Step 2: Removing empty directories..."

# Check and remove monitoring-reports if empty
if [ -d "monitoring-reports" ]; then
    if [ -z "$(ls -A monitoring-reports)" ]; then
        echo "  - Removing empty monitoring-reports/" | tee -a "$CLEANUP_LOG"
        rmdir monitoring-reports/
        ((CLEANED_COUNT++))
    else
        echo "  - monitoring-reports/ not empty, skipping"
    fi
fi

echo "  ✅ Empty directories cleaned"

# ═══════════════════════════════════════════════════════════
# 3. Remove build artifacts (if not gitignored)
# ═══════════════════════════════════════════════════════════
echo ""
echo "🏗️  Step 3: Cleaning build artifacts..."

# Jest cache
if [ -d ".jest-cache" ]; then
    echo "  - Removing .jest-cache/" | tee -a "$CLEANUP_LOG"
    rm -rf .jest-cache/
    ((CLEANED_COUNT++))
fi

# Test results
if [ -d "test-results" ] && [ ! -f "test-results/.gitkeep" ]; then
    echo "  - Removing test-results/" | tee -a "$CLEANUP_LOG"
    rm -rf test-results/
    ((CLEANED_COUNT++))
fi

# Playwright report
if [ -d "playwright-report" ] && [ ! -f "playwright-report/.gitkeep" ]; then
    echo "  - Removing playwright-report/" | tee -a "$CLEANUP_LOG"
    rm -rf playwright-report/
    ((CLEANED_COUNT++))
fi

echo "  ✅ Build artifacts cleaned"

# ═══════════════════════════════════════════════════════════
# 4. Fix nested directory structure (CRITICAL)
# ═══════════════════════════════════════════════════════════
echo ""
echo "📁 Step 4: Checking for nested directory structure..."

NESTED_DIR="Farmers Market Platform web and app"
if [ -d "$NESTED_DIR" ]; then
    echo "  ⚠️  WARNING: Nested directory structure detected!"
    echo "  - Found: $NESTED_DIR/" | tee -a "$CLEANUP_LOG"

    # Check if there's content
    if [ -d "$NESTED_DIR/src" ]; then
        echo "  ❌ CRITICAL: Found src/ inside nested directory!"
        echo "  👉 Manual intervention required to move contents safely"
        echo "  👉 Run: mv '$NESTED_DIR'/* ./ && rmdir '$NESTED_DIR'"
        echo ""
        echo "  Skipping automatic fix to prevent data loss..."
    else
        # Safe to remove if only contains markdown files
        FILE_COUNT=$(find "$NESTED_DIR" -type f | wc -l)
        if [ "$FILE_COUNT" -lt 5 ]; then
            echo "  - Contains only $FILE_COUNT files, moving them..."
            mv "$NESTED_DIR"/* ./ 2>/dev/null || true
            rmdir "$NESTED_DIR" 2>/dev/null || true
            echo "  ✅ Nested directory cleaned"
            ((CLEANED_COUNT++))
        else
            echo "  - Contains $FILE_COUNT files, manual review needed"
        fi
    fi
else
    echo "  ✅ No nested directory structure found"
fi

# ═══════════════════════════════════════════════════════════
# 5. Clean old MVP validation reports (keep last 3)
# ═══════════════════════════════════════════════════════════
echo ""
echo "📊 Step 5: Cleaning old MVP validation reports..."

if [ -d "mvp-validation-reports" ]; then
    REPORT_COUNT=$(ls -1 mvp-validation-reports/ 2>/dev/null | wc -l)

    if [ "$REPORT_COUNT" -gt 6 ]; then
        echo "  - Found $REPORT_COUNT report files"
        echo "  - Keeping 6 most recent (3 pairs of JSON + MD)"

        cd mvp-validation-reports/
        ls -t | tail -n +7 | while read file; do
            echo "    - Deleting old report: $file" | tee -a "../$CLEANUP_LOG"
            rm -f "$file"
            ((CLEANED_COUNT++))
        done
        cd ..

        NEW_COUNT=$(ls -1 mvp-validation-reports/ 2>/dev/null | wc -l)
        echo "  ✅ Reduced from $REPORT_COUNT to $NEW_COUNT files"
    else
        echo "  ✅ Only $REPORT_COUNT reports, keeping all"
    fi
else
    echo "  ℹ️  No MVP validation reports directory found"
fi

# ═══════════════════════════════════════════════════════════
# 6. Remove temporary files
# ═══════════════════════════════════════════════════════════
echo ""
echo "🗑️  Step 6: Removing temporary files..."

# Remove common temp file patterns
find . -maxdepth 1 -name "*.tmp" -type f -delete 2>/dev/null && echo "  - Removed *.tmp files" || true
find . -maxdepth 1 -name "*.temp" -type f -delete 2>/dev/null && echo "  - Removed *.temp files" || true
find . -maxdepth 1 -name "*.bak" -type f -delete 2>/dev/null && echo "  - Removed *.bak files" || true
find . -maxdepth 1 -name "*.old" -type f -delete 2>/dev/null && echo "  - Removed *.old files" || true
find . -maxdepth 1 -name "*~" -type f -delete 2>/dev/null && echo "  - Removed backup files (*~)" || true

echo "  ✅ Temporary files cleaned"

# ═══════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ Quick Cleanup Complete!                               ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  Items cleaned: $CLEANED_COUNT                                     ║"
echo "║  Log saved to: $CLEANUP_LOG                                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Cleanup completed at $(date)" >> "$CLEANUP_LOG"

# Next steps
echo "📋 Next Steps:"
echo "  1. Review the cleanup log: $CLEANUP_LOG"
echo "  2. Test that your build still works: npm run build"
echo "  3. Commit changes: git add -A && git commit -m 'chore: quick cleanup'"
echo "  4. For deeper cleanup, run: ./scripts/cleanup/consolidate-docs.sh"
echo ""
echo "🌟 Divine Agricultural Consciousness: Repository cleaned and refreshed! 🌾"
