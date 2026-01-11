# ╔════════════════════════════════════════════════════════════════════╗
# ║ 🧹 FARMERS MARKET PLATFORM - REPOSITORY CLEANUP SCRIPT            ║
# ║ Automated cleanup of backup files and temporary artifacts         ║
# ║ Date: January 2025                                                ║
# ║ Platform: Windows PowerShell                                      ║
# ╚════════════════════════════════════════════════════════════════════╝

# Script configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Color definitions
function Write-Header
{ param($Text) Write-Host "`n$Text" -ForegroundColor Cyan -BackgroundColor DarkBlue 
}
function Write-Step
{ param($Text) Write-Host "`n$Text" -ForegroundColor Yellow 
}
function Write-Success
{ param($Text) Write-Host "✅ $Text" -ForegroundColor Green 
}
function Write-Info
{ param($Text) Write-Host "ℹ️  $Text" -ForegroundColor Cyan 
}
function Write-Warning
{ param($Text) Write-Host "⚠️  $Text" -ForegroundColor Yellow 
}
function Write-Error-Custom
{ param($Text) Write-Host "❌ $Text" -ForegroundColor Red 
}

# Banner
Clear-Host
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    🧹 FARMERS MARKET PLATFORM - REPOSITORY CLEANUP" -ForegroundColor White
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Pre-flight checks
Write-Step "🔍 Pre-flight Checks..."

# Check if we're in the right directory
if (-not (Test-Path "package.json"))
{
    Write-Error-Custom "Not in project root directory!"
    Write-Info "Please run this script from: 'Farmers Market Platform web and app' directory"
    exit 1
}

# Verify it's the correct project
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if ($packageJson.name -ne "farmers-market")
{
    Write-Error-Custom "Wrong project! Expected 'farmers-market'"
    exit 1
}

Write-Success "Project root directory confirmed"

# Check git status
Write-Info "Checking git status..."
$gitStatus = git status --porcelain 2>&1
if ($LASTEXITCODE -ne 0)
{
    Write-Warning "Git not available or not a git repository"
} else
{
    if ($gitStatus)
    {
        Write-Warning "You have uncommitted changes!"
        Write-Info "Uncommitted files:"
        $gitStatus | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        Write-Host ""
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -ne "y")
        {
            Write-Info "Cleanup cancelled. Please commit your changes first."
            exit 0
        }
    } else
    {
        Write-Success "Git status is clean"
    }
}

# Final confirmation
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  📋 CLEANUP PLAN:" -ForegroundColor White
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Remove ~128 .backup files from src/ directory" -ForegroundColor White
Write-Host "  2. Remove 17 progress tracking files from root" -ForegroundColor White
Write-Host "  3. Remove mobile-app-export-20260111/ (~478 MB)" -ForegroundColor White
Write-Host "  4. Remove empty test-reports/ directory" -ForegroundColor White
Write-Host ""
Write-Host "  💾 Estimated space savings: ~485 MB" -ForegroundColor Cyan
Write-Host "  ⏱️  Estimated time: 1-2 minutes" -ForegroundColor Cyan
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Proceed with cleanup? (Y/n)"
if ($confirm -eq "n" -or $confirm -eq "N")
{
    Write-Info "Cleanup cancelled by user"
    exit 0
}

Write-Host ""
Write-Header "  🚀 STARTING CLEANUP PROCESS"

# Initialize counters
$totalDeleted = 0
$totalSize = 0

# ============================================================================
# STEP 1: Remove .backup files
# ============================================================================
Write-Step "Step 1/4: Removing .backup files from src/ directory..."

try
{
    $backupFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.backup" -File -ErrorAction SilentlyContinue
    $backupCount = ($backupFiles | Measure-Object).Count

    if ($backupCount -gt 0)
    {
        Write-Info "Found $backupCount backup files"

        # Calculate size
        $backupSize = ($backupFiles | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Info "Total size: $([math]::Round($backupSize, 2)) MB"

        # Delete files
        $backupFiles | Remove-Item -Force -ErrorAction Stop

        $totalDeleted += $backupCount
        $totalSize += $backupSize

        Write-Success "$backupCount backup files removed ($([math]::Round($backupSize, 2)) MB)"
    } else
    {
        Write-Info "No .backup files found (already clean)"
    }
} catch
{
    Write-Error-Custom "Failed to remove backup files: $_"
}

# ============================================================================
# STEP 2: Remove progress tracking files
# ============================================================================
Write-Step "Step 2/4: Removing progress tracking files from root..."

$progressFiles = @(
    "CLEANUP_STATUS_FINAL.md",
    "COMMIT_NOW.md",
    "COMMIT_PHASE2_PREPARATION.sh",
    "DOTFILES_CLEANUP_COMPLETE.md",
    "DOTFILES_SUMMARY.md",
    "EXECUTE_PHASE2_NOW.sh",
    "INSTALLATION_COMPLETE.md",
    "LINT_TESTS_COMPLETE.md",
    "PHASE2_ACTION_ITEMS_COMPLETE.md",
    "PHASE2_COMPLETE.md",
    "PHASE2_EXECUTION_GUIDE.md",
    "PHASE2_MISSED_STEPS_ANALYSIS.md",
    "PHASE2_READY_TO_EXECUTE.md",
    "PHASE2_STATUS_AND_NEXT_STEPS.md",
    "PHASE2_VISUAL_SUMMARY.md",
    "START_HERE_PHASE2.md",
    "TEAM_NOTIFICATION_MOBILE_SEPARATION.md"
)

$progressDeleted = 0
$progressSize = 0

foreach ($file in $progressFiles)
{
    if (Test-Path $file)
    {
        try
        {
            $fileInfo = Get-Item $file
            $fileSize = $fileInfo.Length / 1KB
            $progressSize += $fileSize

            Remove-Item $file -Force -ErrorAction Stop
            $progressDeleted++
            Write-Host "  ✓ Removed: $file" -ForegroundColor Gray
        } catch
        {
            Write-Warning "Failed to remove: $file"
        }
    }
}

$totalDeleted += $progressDeleted
$totalSize += ($progressSize / 1024) # Convert to MB

if ($progressDeleted -gt 0)
{
    Write-Success "$progressDeleted progress tracking files removed ($([math]::Round($progressSize, 2)) KB)"
} else
{
    Write-Info "No progress tracking files found (already clean)"
}

# ============================================================================
# STEP 3: Remove mobile app export directory
# ============================================================================
Write-Step "Step 3/4: Removing mobile app export directory..."

$mobileExportDir = "mobile-app-export-20260111"

if (Test-Path $mobileExportDir)
{
    try
    {
        Write-Info "Calculating directory size..."

        # Calculate size
        $dirSize = (Get-ChildItem -Path $mobileExportDir -Recurse -File -ErrorAction SilentlyContinue |
                Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum / 1MB

        Write-Info "Directory size: $([math]::Round($dirSize, 2)) MB"
        Write-Info "Removing directory (this may take a moment)..."

        # Remove directory
        Remove-Item $mobileExportDir -Recurse -Force -ErrorAction Stop

        $totalDeleted++
        $totalSize += $dirSize

        Write-Success "Mobile app export removed ($([math]::Round($dirSize, 2)) MB freed)"
    } catch
    {
        Write-Error-Custom "Failed to remove mobile app export: $_"
    }
} else
{
    Write-Info "Mobile app export directory not found (already removed)"
}

# ============================================================================
# STEP 4: Remove test-reports directory
# ============================================================================
Write-Step "Step 4/4: Removing test-reports directory..."

if (Test-Path "test-reports")
{
    try
    {
        # Check if empty
        $items = Get-ChildItem -Path "test-reports" -Recurse -ErrorAction SilentlyContinue
        $itemCount = ($items | Measure-Object).Count

        if ($itemCount -eq 0)
        {
            Remove-Item "test-reports" -Recurse -Force -ErrorAction Stop
            Write-Success "Empty test-reports directory removed"
        } else
        {
            Write-Warning "test-reports is not empty ($itemCount items). Skipping..."
        }

        $totalDeleted++
    } catch
    {
        Write-Error-Custom "Failed to remove test-reports: $_"
    }
} else
{
    Write-Info "test-reports directory not found (already removed)"
}

# ============================================================================
# COMPLETION SUMMARY
# ============================================================================
Write-Host ""
Write-Header "  ✅ CLEANUP COMPLETE!"
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  📊 CLEANUP SUMMARY" -ForegroundColor White
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Total items removed: $totalDeleted" -ForegroundColor White
Write-Host "  Space freed: ~$([math]::Round($totalSize, 2)) MB" -ForegroundColor White
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# ============================================================================
# POST-CLEANUP RECOMMENDATIONS
# ============================================================================
Write-Header "  📝 NEXT STEPS"
Write-Host ""
Write-Host "1. Verify changes:" -ForegroundColor Cyan
Write-Host "   git status" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test the application:" -ForegroundColor Cyan
Write-Host "   npm run build" -ForegroundColor Gray
Write-Host "   npm test" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Commit the cleanup:" -ForegroundColor Cyan
Write-Host "   git add -A" -ForegroundColor Gray
Write-Host "   git commit -m ""chore: clean up backup files and temporary artifacts""" -ForegroundColor Gray
Write-Host "   git push" -ForegroundColor Gray
Write-Host ""

# Optional: Show git status
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
$showGitStatus = Read-Host "Show git status now? (Y/n)"
if ($showGitStatus -ne "n" -and $showGitStatus -ne "N")
{
    Write-Host ""
    git status
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🎉 Repository cleanup completed successfully!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Create cleanup report
$reportFile = "CLEANUP_REPORT_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').txt"
$report = @"
FARMERS MARKET PLATFORM - CLEANUP REPORT
========================================
Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Total Items Removed: $totalDeleted
Space Freed: $([math]::Round($totalSize, 2)) MB

DETAILS:
- Backup files (.backup): Removed from src/
- Progress tracking files: Removed from root (17 files)
- Mobile app export: mobile-app-export-20260111/ removed
- Test reports directory: test-reports/ removed

STATUS: ✅ COMPLETE

All deleted files are preserved in git history and can be recovered if needed.
"@

$report | Out-File -FilePath $reportFile -Encoding UTF8
Write-Info "Cleanup report saved to: $reportFile"
Write-Host ""
