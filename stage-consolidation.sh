#!/bin/bash

# ============================================================================
# STAGE ORDER SERVICE CONSOLIDATION CHANGES
# Helper script to stage only consolidation-related files
# ============================================================================

set -e

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║         📦 STAGING ORDER SERVICE CONSOLIDATION CHANGES                      ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Function to stage file if it exists
stage_if_exists() {
    local file="$1"
    if [ -f "$file" ] || [ -d "$file" ]; then
        git add "$file"
        echo "  ✅ Staged: $file"
    else
        echo "  ⚠️  Not found: $file"
    fi
}

echo "📁 Staging core consolidation files..."
echo ""

# Core service files
echo "1️⃣  Core Service Files:"
stage_if_exists "src/lib/services/order.service.ts"
stage_if_exists "src/lib/controllers/order.controller.ts"
stage_if_exists "src/features/order-management/index.ts"
echo ""

# Test files
echo "2️⃣  Test Files:"
stage_if_exists "src/__tests__/services/order.service.test.ts"
stage_if_exists "src/__tests__/services/order.service.consolidated.test.ts"
stage_if_exists "src/__tests__/integration/order-workflow.integration.test.ts"
stage_if_exists "src/lib/controllers/__tests__/order.controller.test.ts"
echo ""

# Backups
echo "3️⃣  Backup Files:"
stage_if_exists "consolidation-backup/"
echo ""

# Documentation
echo "4️⃣  Documentation Files:"
stage_if_exists "CONSOLIDATION_PROGRESS.md"
stage_if_exists "PHASE_4_COMPLETION_SUMMARY.md"
stage_if_exists "PHASE_4_FINAL_REPORT.md"
stage_if_exists "PHASE_5_COMPLETION_REPORT.md"
stage_if_exists "PHASE_6_FINAL_COMPLETION_REPORT.md"
stage_if_exists "ORDER_SERVICE_CONSOLIDATION_COMPLETE.md"
stage_if_exists "PHASE_6_VERIFICATION_STATUS.md"
stage_if_exists "PHASE_6_VISUAL_SUMMARY.txt"
stage_if_exists "PHASE_6_STATUS_QUICK_CHECK.txt"
stage_if_exists "ORDER_SERVICE_DETAILED_COMPARISON.md"
stage_if_exists "ORDER_SERVICE_CONSOLIDATION_PLAN.md"
stage_if_exists "ORDER_SERVICE_COMPARISON_VISUAL.md"
stage_if_exists "DUPLICATE_FILES_ANALYSIS.md"
stage_if_exists "DUPLICATES_EXECUTIVE_SUMMARY.md"
stage_if_exists "NEXT_STEPS_ORDER_CONSOLIDATION.md"
echo ""

# Show status
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                        📊 STAGING COMPLETE                                   ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Changes staged for commit. Review with:"
echo "  git status"
echo ""
echo "To commit these changes, run:"
echo "  git commit -m \"feat: consolidate order service implementations\""
echo ""
echo "Or use the detailed commit message:"
echo "  cat commit-message.txt | git commit -F -"
echo ""
