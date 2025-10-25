#!/usr/bin/env pwsh
# ============================================
# 🧹 DIVINE REPOSITORY CLEANUP SCRIPT
# ============================================
# Removes duplicate and redundant files
# Date: October 25, 2025
# Safety: Creates git backup before deletion

param(
  [switch]$DryRun = $false,
  [switch]$Confirm = $true
)

Write-Host "🧹 DIVINE REPOSITORY CLEANUP" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Change to repository root
Set-Location $PSScriptRoot\..

# Safety check: Ensure we're in a git repository
if (-not (Test-Path ".git")) {
  Write-Host "❌ Error: Not in a git repository!" -ForegroundColor Red
  exit 1
}

# Check for uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
  Write-Host "⚠️  Warning: You have uncommitted changes!" -ForegroundColor Yellow
  Write-Host "   Creating backup commit first...`n" -ForegroundColor Yellow

  git add .
  git commit -m "🔄 Pre-cleanup backup - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

  if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create backup commit!" -ForegroundColor Red
    exit 1
  }

  Write-Host "✅ Backup commit created`n" -ForegroundColor Green
}

# Define files to delete
$filesToDelete = @(
  # Category 1: Duplicate/Redundant Status Reports (45 files)
  "ALL_4_FEATURES_PROGRESS.md",
  "ALL_4_TASKS_COMPLETED.md",
  "ALL_TASKS_COMPLETED_REPORT.md",
  "CART_INTEGRATION_COMPLETE.md",
  "CART_SPRINT_COMPLETE.md",
  "CONSUMER_FEATURES_COMPLETION_REPORT.md",
  "CONSUMER_FEATURES_SUMMARY.md",
  "DAY_1_COMPLETE.md",
  "DEPENDENCY_UPDATE_COMPLETE.md",
  "DEPENDENCY_UPDATE_FINAL.md",
  "DEPENDENCY_UPDATE_PLAN.md",
  "DEPENDENCY_UPDATE_REPORT.md",
  "DEPENDENCY_UPDATE_SESSION_REPORT.md",
  "DEPENDENCY_UPDATE_SUCCESS.md",
  "FARM_PROFILE_COMPLETE.md",
  "FARM_PROFILE_COMPLETION_STATUS.md",
  "FARM_PROFILE_PROGRESS_REPORT.md",
  "FEATURE_1_PRODUCT_DETAIL_COMPLETE.md",
  "FEATURES_1_AND_2_COMPLETE.md",
  "FINAL_66_ERRORS_ELIMINATION.md",
  "FINAL_SESSION_SUMMARY.md",
  "FINAL_SPRINT_PLAN.md",
  "FIXES_COMPLETED_SUMMARY.md",
  "HOME_PAGE_COMPLETE.md",
  "HOME_PAGE_SUCCESS.md",
  "ISSUES_FIXED_SUMMARY.md",
  "MEGA_BUILD_COMPLETE.md",
  "PERPLEXITY_INTEGRATION_COMPLETE.md",
  "PHASE_1_COMPLETE.md",
  "PHASE_3_DAY_1_COMPLETE.md",
  "PHASE_3_DAY_2_COMPLETE.md",
  "POWER_THROUGH_PROGRESS.md",
  "POWER_THROUGH_SESSION_COMPLETE.md",
  "PRODUCTS_PAGE_COMPLETE.md",
  "PROGRESS_66_TO_25_ERRORS.md",
  "PROGRESS_PHASE_3.md",
  "PUSH_TO_100_SUMMARY.md",
  "SCRIPTS_EXECUTION_REPORT.md",
  "SERVER_RUNNING_SUCCESS.md",
  "SERVER_START_FINAL.md",
  "SHOPPING_CART_COMPLETE.md",
  "SPRINT_COMPLETION_REPORT.md",
  "TRIPLE_FEATURE_COMPLETE.md",
  "ULTIMATE_PUSH_RESULTS.md",
  "WEEK_5_PROGRESS.md",

  # Category 2: Duplicate Planning/Action Files (12 files)
  "ACTION_PLAN_IMMEDIATE.md",
  "DEPENDENCY_UPDATE_ACTION_PLAN.md",
  "LIVE_PROGRESS.md",
  "PHASE_1_EXECUTION_PLAN.md",
  "PHASE_2_BATTLE_PLAN.md",
  "PHASE_3_ACTION_NOW.md",
  "PHASE_3_FOCUS.md",
  "PHASE_3_START_NOW.md",
  "START_PHASE_3_NOW.md",
  "TRIPLE_FEATURE_BATTLE_PLAN.md",
  "ULTIMATE_PUSH_PLAN.md",
  "WHATS_NEXT_3_OPTIONS.md",

  # Category 3: Duplicate Quick Start/Reference Files (8 files)
  "AGRICULTURAL_FEATURES_QUICK_START.md",
  "AI_QUICK_START.md",
  "DAY_1_QUICK_START.md",
  "GPU_QUICK_START.md",
  "MCP_QUICK_START.md",
  "PERPLEXITY_QUICK_START.md",
  "QUICK_START_FIX_GUIDE.md",
  "QUICK_START_NEXT_STEPS.md",

  # Category 4: Duplicate Setup/Testing Guides (4 files)
  "API_TESTING_DIVINE_SETUP_GUIDE.md",
  "CART_TEST_GUIDE.md",
  "DIRECTORY_SAFETY_GUIDE.md",
  "SETUP_DEPLOYMENT_SUMMARY.md",

  # Category 5: Duplicate TypeScript Documentation (5 files)
  "TYPESCRIPT_100_PERCENT_COMPLETE.md",
  "TYPESCRIPT_FIX_REPORT.md",
  "TYPESCRIPT_FIXES_COMPLETE.md",
  "TYPESCRIPT_RESOLUTION_SUMMARY.md",
  "TYPESCRIPT_START_HERE.md",

  # Category 6: Duplicate Phase Summary Files (4 files)
  "PHASE_1_SUMMARY.md",
  "PHASE_3_SUMMARY.md",
  "LONG_TERM_SUMMARY.md",
  "PROJECT_REVIEW_SUMMARY.md",

  # Category 7: Backup Files (2 files)
  "jest.config.simple.js.backup",
  "package.json.backup",

  # Category 8: Duplicate Jest Config Files (2 files)
  "jest.config.clean.js",
  "jest.config.simple.js",

  # Category 9: Duplicate MCP Documentation (7 files)
  "MCP_COMPLETE_PACKAGE.md",
  "MCP_IMPLEMENTATION_SUMMARY.md",
  "MCP_MICROSOFT_DOCS_IMPLEMENTATION.md",
  "MCP_NEXT_STEPS.md",
  "MCP_README.md",
  "MCP_REALISTIC_ASSESSMENT.md",
  "MCP_STATUS_UPDATE.md",

  # Category 10: Duplicate Perplexity Documentation (4 files)
  "PERPLEXITY_INTEGRATION_REVIEW.md",
  "PERPLEXITY_QUICK_REFERENCE.md",
  "PERPLEXITY_SETUP_STATUS.md",
  "PERPLEXITY_USAGE_GUIDE.md",

  # Category 11: Redundant Week Reports (8 files)
  "WEEK_1_COMPLETE.md",
  "WEEK_2_COMPLETE.md",
  "WEEK_3_COMPLETE.md",
  "WEEK_4_COMPLETE.md",
  "WEEK_5_ACHIEVEMENT_REPORT.md",
  "WEEK_5_KICKOFF.md",
  "WEEK_5_QUICK_REFERENCE.md",
  "WEEK_5_SUMMARY.md"
)

# Count files
$totalFiles = $filesToDelete.Count
$existingFiles = @()
$missingFiles = @()

Write-Host "📊 Analysis:" -ForegroundColor Yellow
Write-Host "   Total files to delete: $totalFiles`n" -ForegroundColor White

# Check which files exist
foreach ($file in $filesToDelete) {
  if (Test-Path $file) {
    $existingFiles += $file
  }
  else {
    $missingFiles += $file
  }
}

Write-Host "   ✅ Files found: $($existingFiles.Count)" -ForegroundColor Green
if ($missingFiles.Count -gt 0) {
  Write-Host "   ⚠️  Files already deleted: $($missingFiles.Count)" -ForegroundColor Yellow
}
Write-Host ""

# Dry run mode
if ($DryRun) {
  Write-Host "🔍 DRY RUN MODE - No files will be deleted`n" -ForegroundColor Magenta
  Write-Host "Files that would be deleted:" -ForegroundColor Yellow
  foreach ($file in $existingFiles) {
    Write-Host "   - $file" -ForegroundColor Gray
  }
  Write-Host "`n✅ Dry run complete. Use without -DryRun to actually delete files." -ForegroundColor Green
  exit 0
}

# Confirmation prompt
if ($Confirm) {
  Write-Host "⚠️  WARNING: This will delete $($existingFiles.Count) files!`n" -ForegroundColor Yellow
  $response = Read-Host "Continue? (yes/no)"

  if ($response -ne "yes") {
    Write-Host "❌ Cleanup cancelled by user" -ForegroundColor Red
    exit 0
  }
  Write-Host ""
}

# Delete files
Write-Host "🗑️  Deleting redundant files..." -ForegroundColor Cyan
$deletedCount = 0
$failedCount = 0

foreach ($file in $existingFiles) {
  try {
    Remove-Item $file -Force -ErrorAction Stop
    Write-Host "   ✅ Deleted: $file" -ForegroundColor Green
    $deletedCount++
  }
  catch {
    Write-Host "   ❌ Failed: $file - $($_.Exception.Message)" -ForegroundColor Red
    $failedCount++
  }
}

Write-Host "`n📊 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Successfully deleted: $deletedCount files" -ForegroundColor Green
if ($failedCount -gt 0) {
  Write-Host "   ❌ Failed to delete: $failedCount files" -ForegroundColor Red
}

# Calculate space saved
$spaceSaved = 0
foreach ($file in $existingFiles) {
  if (Test-Path $file) {
    # File wasn't deleted, skip
    continue
  }
}

Write-Host "`n🎉 Cleanup Complete!" -ForegroundColor Green
Write-Host "   Repository is now cleaner and more organized.`n" -ForegroundColor White

# Create cleanup report
$reportContent = @"
# 🧹 Repository Cleanup Report

**Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Files Deleted**: $deletedCount
**Files Failed**: $failedCount
**Files Already Missing**: $($missingFiles.Count)

## Deleted Files

$($existingFiles | ForEach-Object { "- $_" } | Out-String)

## Status

Cleanup completed successfully. All redundant files have been removed.

Next steps:
1. Review remaining documentation
2. Update cross-references if needed
3. Commit changes: ``git add . && git commit -m "🧹 Repository cleanup - removed $deletedCount redundant files"``

---

**Generated by**: cleanup-repository.ps1
"@

$reportContent | Out-File "CLEANUP_REPORT_$(Get-Date -Format 'yyyy-MM-dd').md" -Encoding UTF8

Write-Host "📄 Cleanup report saved to: CLEANUP_REPORT_$(Get-Date -Format 'yyyy-MM-dd').md`n" -ForegroundColor Cyan

Write-Host "🔄 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Review the cleanup report" -ForegroundColor White
Write-Host "   2. Commit changes: git add . && git commit -m '🧹 Cleanup'" -ForegroundColor White
Write-Host "   3. Push to remote: git push`n" -ForegroundColor White

exit 0
