# 🌾 Divine Repository Cleanup Script
# Organizes documentation and removes artifacts according to divine agricultural principles

Write-Host "Starting Divine Repository Cleanup..." -ForegroundColor Cyan
$ErrorActionPreference = "Continue"

# Define file categories
$fileOrganization = @{
    "docs/reports/completion" = @(
        "COMPLETION_ROADMAP_100_PERCENT.md",
        "CONGRATULATIONS_100_PERCENT.md",
        "DIVINE_100_PERCENT_ROADMAP.md",
        "FINAL_100_PERCENT_REPORT.md",
        "PRECISE_100_PERCENT_ROADMAP.md",
        "PROGRESS_REPORT_90_TO_100.md"
    )
    "docs/reports/features" = @(
        "COMPREHENSIVE_PAGE_CREATION_FINAL_REPORT.md",
        "FALL_REDESIGN_COMPLETE.md",
        "FARMER_PORTAL_COMPLETE_REPORT.md",
        "FARMER_PORTAL_IMPLEMENTATION_COMPLETE.md",
        "IMPLEMENTATION_COMPLETE_SUMMARY.md"
    )
    "docs/reports/sessions" = @(
        "PAGE_CREATION_SESSION_SUMMARY.md",
        "SESSION_SUMMARY_2025_11_08.md",
        "SESSION_SUMMARY_COMPLETE_2025_11_08.md"
    )
    "docs/reports/testing" = @(
        "TEST_COMPLETION_REPORT.md",
        "TEST_COVERAGE_ANALYSIS.md",
        "TEST_FIX_COMPLETE.md",
        "TEST_FIXING_SESSION_COMPLETE.md",
        "TEST_PROGRESS_SESSION_2025_11_08.md",
        "TESTING_CHECKLIST.md"
    )
    "docs/guides" = @(
        "CI_CD_QUICKSTART.md",
        "DIVINE_DEV_SETUP.md",
        "DOCKER_SETUP.md",
        "QA_TESTING_GUIDE.md",
        "QUICK_START_100.md"
    )
    "docs/status" = @(
        "CONTINUATION_STATUS.md",
        "PROJECT_STATUS.md",
        "TYPESCRIPT_FIXES_STATUS.md",
        "TYPESCRIPT_FIX_PROGRESS.md"
    )
    "docs/archives" = @(
        "404_ERROR_FIX.md",
        "COMPREHENSIVE_CODE_IMPROVEMENTS.md",
        "COMPREHENSIVE_CODE_IMPROVEMENTS_FORMATTED.md",
        "CSS_LOADING_FIX.md",
        "DESIGN_COMPARISON.md",
        "DUAL_AGENT_SYMBIOSIS_TODO.md",
        "DUPLICATE_ANALYSIS_AND_CLEANUP.md",
        "GODMODE_MIGRATION_PLAN.md",
        "WEBSITE_ANALYSIS_AND_UPGRADE_PLAN.md"
    )
}

# Create directories
Write-Host "`nCreating directory structure..." -ForegroundColor Yellow
foreach ($dir in $fileOrganization.Keys) {
    if (-not (Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
        Write-Host "  Created $dir" -ForegroundColor Green
    }
}

# Move files
Write-Host "`nOrganizing documentation files..." -ForegroundColor Yellow
$movedCount = 0
foreach ($destDir in $fileOrganization.Keys) {
    foreach ($file in $fileOrganization[$destDir]) {
        if (Test-Path $file) {
            $dest = Join-Path $destDir $file
            Move-Item -Path $file -Destination $dest -Force
            Write-Host "  Moved $file to $destDir" -ForegroundColor Green
            $movedCount++
        }
    }
}

Write-Host "`nMoved $movedCount files" -ForegroundColor Cyan

# Clean up empty markdown files
Write-Host "`nRemoving empty files..." -ForegroundColor Yellow
$emptyFiles = Get-ChildItem -Filter "*.md" -File | Where-Object { $_.Length -eq 0 }
foreach ($file in $emptyFiles) {
    Remove-Item $file.FullName -Force
    Write-Host "  Removed empty file: $($file.Name)" -ForegroundColor Green
}

# Update .gitignore
Write-Host "`nUpdating .gitignore..." -ForegroundColor Yellow
$gitignoreAdditions = @"

# Divine Cleanup - Build Artifacts
.jest-cache/
dist/
profiling_output/
test-results/
.vs/
.venv/
obj/
bin/

# Environment files (keep only examples)
.env
.env.local
.env.docker
.env.perplexity

# IDE and OS
.DS_Store
Thumbs.db
*.swp
*.swo
*~

"@

if (Test-Path ".gitignore") {
    $currentGitignore = Get-Content ".gitignore" -Raw
    if ($currentGitignore -notlike "*Divine Cleanup*") {
        Add-Content ".gitignore" $gitignoreAdditions
        Write-Host "  Updated .gitignore" -ForegroundColor Green
    } else {
        Write-Host "  .gitignore already updated" -ForegroundColor Cyan
    }
}

Write-Host "`n Divine Cleanup Complete! Repository is now organized." -ForegroundColor Green
Write-Host "`n Summary:" -ForegroundColor Cyan
Write-Host "  Organized $movedCount documentation files" -ForegroundColor White
Write-Host "  Removed $($emptyFiles.Count) empty files" -ForegroundColor White
Write-Host "  Updated .gitignore for better hygiene" -ForegroundColor White
Write-Host "`n May the agricultural consciousness guide your development!" -ForegroundColor Magenta
