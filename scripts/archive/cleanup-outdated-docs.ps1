# cleanup-outdated-docs.ps1
# Cleans up outdated documentation files by moving them to an archive

Write-Host "🧹 Cleaning up outdated documentation files..." -ForegroundColor Green
Write-Host ""

# Category 1: Old Fix/Error Reports
$oldFixReports = @(
    "ALL_ERRORS_FIXED_SUMMARY.md",
    "ALL_FIXES_APPLIED.md",
    "BUILD_FIXES_COMPLETE.md",
    "FINAL_CLEANUP_COMPLETE.md",
    "ISSUES_FIXED.md",
    "TEST_FIX_SUMMARY.md",
    "SIGNUP_FIX_COMPLETE.md",
    "DEBUG_PERMISSIONS.md",
    "PERMISSION_ERROR_FIX.txt",
    "FIX_INSTRUCTIONS.md"
)

# Category 2: Redundant Cleanup Reports
$cleanupReports = @(
    "CLEANUP_EXECUTION_REPORT.md",
    "CLEANUP_GUIDE.md",
    "CLEANUP_SUMMARY.md",
    "MARKDOWN_CLEANUP_REPORT.md"
)

# Category 3: Duplicate Quick Start Guides
$quickStartDupes = @(
    "QUICK_START.txt",
    "QUICK_START_PRODUCTION.md",
    "START_HERE_PRODUCTION.md",
    "RUN_SERVER_NOW.md",
    "FINAL_CHECKLIST.txt"
)

# Category 4: Redundant Production Guides
$productionDupes = @(
    "PRODUCTION_FIX_PLAN.md",
    "PRODUCTION_BUILD_REPORT.md",
    "PRODUCTION_RUNNING_STATUS.md",
    "PRODUCTION_COMMANDS_REFERENCE.md"
)

# Category 5: Old Bot Documentation
$botDupes = @(
    "BOT_QUICK_START.md",
    "COMPREHENSIVE_BOT_IMPLEMENTATION.md",
    "WORKFLOW_BOT_FINAL_SUMMARY.md"
)

# Category 6: Miscellaneous
$miscOldFiles = @(
    "GIT_AUTHENTICATION_GUIDE.md",
    "GIT_SCRIPTS_README.md",
    "SIGNUP_PAGE_GUIDE.md",
    "WORKSPACE_INDEX.md"
)

# Combine all files to delete
$allFilesToArchive = $oldFixReports + $cleanupReports + $quickStartDupes +
                     $productionDupes + $botDupes + $miscOldFiles

# Create backup directory with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$backupDir = ".\docs-archive-$timestamp"

Write-Host "📦 Creating archive directory: $backupDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host ""

# Move files to backup (safer than delete)
$movedCount = 0
$notFoundCount = 0

Write-Host "Moving files to archive..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $allFilesToArchive) {
    if (Test-Path $file) {
        try {
            Move-Item -Path $file -Destination $backupDir -Force -ErrorAction Stop
            Write-Host "  ✓ Moved: $file" -ForegroundColor Green
            $movedCount++
        } catch {
            Write-Host "  ✗ Error moving: $file - $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  - Not found: $file" -ForegroundColor Gray
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "   • Files moved: $movedCount" -ForegroundColor Cyan
Write-Host "   • Files not found: $notFoundCount" -ForegroundColor Gray
Write-Host "   • Archive location: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   • Archive is preserved for reference" -ForegroundColor White
Write-Host "   • You can safely delete the archive after review" -ForegroundColor White
Write-Host "   • All files remain in git history" -ForegroundColor White
Write-Host ""
Write-Host "📚 Active Documentation:" -ForegroundColor Green
Write-Host "   • README.md - Main project documentation" -ForegroundColor White
Write-Host "   • PRODUCTION_SETUP_GUIDE.md - Production deployment" -ForegroundColor White
Write-Host "   • DEPLOYMENT_CHECKLIST.md - Deployment steps" -ForegroundColor White
Write-Host "   • WORKFLOW_BOT_ANALYSIS.md - Bot documentation" -ForegroundColor White
Write-Host "   • WEBSITE_ANALYSIS_AND_RECOMMENDATIONS.md - Upgrade analysis" -ForegroundColor White
Write-Host "   • UPGRADE_ACTION_CHECKLIST.md - Implementation tasks" -ForegroundColor White
Write-Host "   • IMPLEMENTATION_PROGRESS.md - Progress tracking" -ForegroundColor White
Write-Host ""
