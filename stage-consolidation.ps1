# ============================================================================
# STAGE ORDER SERVICE CONSOLIDATION CHANGES
# Helper script to stage only consolidation-related files (PowerShell)
# ============================================================================

Write-Host "╔══════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         📦 STAGING ORDER SERVICE CONSOLIDATION CHANGES                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Function to stage file if it exists
function Stage-IfExists {
    param([string]$Path)

    if (Test-Path $Path) {
        git add $Path
        Write-Host "  ✅ Staged: $Path" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Not found: $Path" -ForegroundColor Yellow
    }
}

Write-Host "📁 Staging core consolidation files..." -ForegroundColor White
Write-Host ""

# Core service files
Write-Host "1️⃣  Core Service Files:" -ForegroundColor Cyan
Stage-IfExists "src/lib/services/order.service.ts"
Stage-IfExists "src/lib/controllers/order.controller.ts"
Stage-IfExists "src/features/order-management/index.ts"
Write-Host ""

# Test files
Write-Host "2️⃣  Test Files:" -ForegroundColor Cyan
Stage-IfExists "src/__tests__/services/order.service.test.ts"
Stage-IfExists "src/__tests__/services/order.service.consolidated.test.ts"
Stage-IfExists "src/__tests__/integration/order-workflow.integration.test.ts"
Stage-IfExists "src/lib/controllers/__tests__/order.controller.test.ts"
Write-Host ""

# Backups
Write-Host "3️⃣  Backup Files:" -ForegroundColor Cyan
Stage-IfExists "consolidation-backup/"
Write-Host ""

# Documentation
Write-Host "4️⃣  Documentation Files:" -ForegroundColor Cyan
Stage-IfExists "CONSOLIDATION_PROGRESS.md"
Stage-IfExists "PHASE_4_COMPLETION_SUMMARY.md"
Stage-IfExists "PHASE_4_FINAL_REPORT.md"
Stage-IfExists "PHASE_5_COMPLETION_REPORT.md"
Stage-IfExists "PHASE_6_FINAL_COMPLETION_REPORT.md"
Stage-IfExists "ORDER_SERVICE_CONSOLIDATION_COMPLETE.md"
Stage-IfExists "PHASE_6_VERIFICATION_STATUS.md"
Stage-IfExists "PHASE_6_VISUAL_SUMMARY.txt"
Stage-IfExists "PHASE_6_STATUS_QUICK_CHECK.txt"
Stage-IfExists "ORDER_SERVICE_DETAILED_COMPARISON.md"
Stage-IfExists "ORDER_SERVICE_CONSOLIDATION_PLAN.md"
Stage-IfExists "ORDER_SERVICE_COMPARISON_VISUAL.md"
Stage-IfExists "DUPLICATE_FILES_ANALYSIS.md"
Stage-IfExists "DUPLICATES_EXECUTIVE_SUMMARY.md"
Stage-IfExists "NEXT_STEPS_ORDER_CONSOLIDATION.md"
Write-Host ""

# Show status
Write-Host "╔══════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                        📊 STAGING COMPLETE                                   ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Changes staged for commit. Review with:" -ForegroundColor White
Write-Host "  git status" -ForegroundColor Yellow
Write-Host ""
Write-Host "To commit these changes, run:" -ForegroundColor White
Write-Host "  git commit -m `"feat: consolidate order service implementations`"" -ForegroundColor Yellow
Write-Host ""
Write-Host "Or use the detailed commit message:" -ForegroundColor White
Write-Host "  git commit -F commit-message.txt" -ForegroundColor Yellow
Write-Host ""
