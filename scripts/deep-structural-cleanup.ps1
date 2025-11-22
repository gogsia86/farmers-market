#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Deep Structural Cleanup - Removes duplicates, temporary files, and organizes repository

.DESCRIPTION
    Performs aggressive cleanup WITHOUT backup:
    - Removes ALL temporary/output files
    - Eliminates duplicate documentation
    - Consolidates scattered files
    - Removes redundant build artifacts
    - Cleans up test outputs and logs

.PARAMETER Execute
    Actually perform the cleanup (required for safety)

.EXAMPLE
    .\deep-structural-cleanup.ps1 -Execute
#>

param(
  [switch]$Execute = $false
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$Timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$CleanupReport = Join-Path $RepoRoot "DEEP_CLEANUP_REPORT_$Timestamp.md"

$Stats = @{
  FilesRemoved       = 0
  SizeSaved          = 0
  DirectoriesRemoved = 0
  DuplicatesRemoved  = 0
}

if (-not $Execute) {
  Write-Host "❌ ERROR: This script requires -Execute flag for safety" -ForegroundColor Red
  Write-Host "   This will DELETE files WITHOUT backup!" -ForegroundColor Yellow
  Write-Host "   Usage: .\deep-structural-cleanup.ps1 -Execute" -ForegroundColor Cyan
  exit 1
}

Write-Host "🔥 DEEP STRUCTURAL CLEANUP - NO BACKUP MODE" -ForegroundColor Red
Write-Host "⚠️  This will DELETE files PERMANENTLY!" -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 2

#region Helper Functions

function Remove-FilesSafely {
  param([string[]]$Patterns)

  foreach ($pattern in $Patterns) {
    $files = Get-ChildItem -Path $RepoRoot -Filter $pattern -Recurse -ErrorAction SilentlyContinue
    foreach ($file in $files) {
      try {
        $size = $file.Length
        Remove-Item $file.FullName -Force -ErrorAction Stop
        $Stats.FilesRemoved++
        $Stats.SizeSaved += $size
        Write-Host "  🗑️  $($file.Name)" -ForegroundColor DarkGray
      }
      catch {
        Write-Host "  ⚠️  Failed: $($file.Name)" -ForegroundColor Yellow
      }
    }
  }
}

function Remove-DirectorySafely {
  param([string]$Path)

  if (Test-Path $Path) {
    try {
      $size = (Get-ChildItem $Path -Recurse -File | Measure-Object -Property Length -Sum).Sum
      Remove-Item $Path -Recurse -Force -ErrorAction Stop
      $Stats.DirectoriesRemoved++
      $Stats.SizeSaved += $size
      Write-Host "  🗑️  $(Split-Path $Path -Leaf)/" -ForegroundColor DarkGray
    }
    catch {
      Write-Host "  ⚠️  Failed: $(Split-Path $Path -Leaf)" -ForegroundColor Yellow
    }
  }
}

function Remove-SpecificFiles {
  param([string[]]$Files)

  foreach ($file in $Files) {
    $fullPath = Join-Path $RepoRoot $file
    if (Test-Path $fullPath) {
      try {
        $size = (Get-Item $fullPath).Length
        Remove-Item $fullPath -Force -ErrorAction Stop
        $Stats.FilesRemoved++
        $Stats.SizeSaved += $size
        Write-Host "  🗑️  $file" -ForegroundColor DarkGray
      }
      catch {
        Write-Host "  ⚠️  Failed: $file" -ForegroundColor Yellow
      }
    }
  }
}

#endregion

Write-Host "🔍 Phase 1: Analyzing repository structure..." -ForegroundColor Cyan
Write-Host ""

#region Phase 1: Remove Build Artifacts and Outputs

Write-Host "📦 Removing build artifacts and outputs..." -ForegroundColor Yellow

Remove-SpecificFiles @(
  "build-error-log.txt",
  "build-errors.txt",
  "build-full-output.txt",
  "build-output.txt",
  "coverage-report.json",
  "coverage-summary.txt",
  "coverage-detailed-report.txt",
  "cleanup-analysis.json",
  "analysis-duplicates.txt",
  "analysis-file-types.txt",
  "analysis-large-files.txt"
)

Remove-FilesSafely @(
  "*-output.txt",
  "*-error*.txt",
  "*-log.txt",
  "build-*.txt",
  "test-*.txt",
  "coverage-*.txt",
  "analysis-*.txt",
  "*.log"
)

#endregion

#region Phase 2: Remove Duplicate Documentation

Write-Host ""
Write-Host "📄 Removing duplicate and consolidated documentation..." -ForegroundColor Yellow

# Remove duplicate deployment guides
Remove-SpecificFiles @(
  "DEPLOY.md",
  "DOCKER_DEPLOYMENT.md",
  "DOCKER_GUIDE.md",
  "VERCEL_QUICK_START.md"
)

# Remove duplicate optimization guides
Remove-SpecificFiles @(
  "QUICK_OPTIMIZATION_GUIDE.md",
  "GPU_OPTIMIZATION_GUIDE.md"
)

# Remove temporary planning docs
Remove-SpecificFiles @(
  "DIVINE_IMPLEMENTATION_PLAN.md",
  "REPOSITORY_CLEANUP_PLAN.md",
  "IMMEDIATE_ACTIONS.md",
  "COMPREHENSIVE_ANALYSIS_TODO.md",
  "TEST_WORKFLOW_ANALYSIS.md"
)

# Remove duplicate status reports
Remove-SpecificFiles @(
  "PERPLEXITY_INTEGRATION_STATUS.md",
  "NVIDIA_PROFILING_TEST_RESULTS.md",
  "PROJECT_REVIEW_2025.md",
  "PLATFORM_100_ACHIEVEMENT.md"
)

# Remove redundant configuration docs
Remove-SpecificFiles @(
  "DIVINE_CONFIGURATION_GUIDE.md",
  "DIVINE_DASHBOARD_SETUP.md",
  "DIVINE_SESSION_INIT.md",
  "CALENDAR_REMINDER.md"
)

#endregion

#region Phase 3: Remove Duplicate Scripts

Write-Host ""
Write-Host "🔧 Removing duplicate and obsolete scripts..." -ForegroundColor Yellow

$scriptsToRemove = @(
  "scripts/comprehensive-cleanup.ps1",
  "scripts/deep-cleanup-aggressive.ps1",
  "scripts/divine-cleanup.ps1",
  "docker-deploy-simple.ps1",
  "docker-start.ps1",
  "setup-env.ps1",
  "setup-vercel-env.ps1",
  "optimize-system.ps1"
)

Remove-SpecificFiles $scriptsToRemove

#endregion

#region Phase 4: Remove Temporary Directories

Write-Host ""
Write-Host "📁 Removing temporary directories..." -ForegroundColor Yellow

$dirsToRemove = @(
  "cleanup-logs",
  "archive/cleanup-*"
)

foreach ($dir in $dirsToRemove) {
  $fullPath = Join-Path $RepoRoot $dir
  if ($dir -like "*`**") {
    # Handle wildcard patterns
    $parent = Split-Path $fullPath -Parent
    $pattern = Split-Path $fullPath -Leaf
    if (Test-Path $parent) {
      Get-ChildItem -Path $parent -Directory -Filter $pattern | ForEach-Object {
        Remove-DirectorySafely $_.FullName
      }
    }
  }
  else {
    Remove-DirectorySafely $fullPath
  }
}

#endregion

#region Phase 5: Remove VS/Visual Studio Artifacts

Write-Host ""
Write-Host "🔨 Removing Visual Studio artifacts..." -ForegroundColor Yellow

Remove-SpecificFiles @(
  "Farmers Market Platform web and app.slnx",
  "Program.cs"
)

Remove-DirectorySafely (Join-Path $RepoRoot ".vs")
Remove-DirectorySafely (Join-Path $RepoRoot "Properties")
Remove-DirectorySafely (Join-Path $RepoRoot "bin")

#endregion

#region Phase 6: Clean Docker Files

Write-Host ""
Write-Host "🐳 Cleaning duplicate Docker files..." -ForegroundColor Yellow

Remove-SpecificFiles @(
  "Dockerfile.dev",
  "Dockerfile.simple",
  "docker-compose.dev.yml",
  "docker-deploy-simple.ps1",
  "docker-deploy.ps1",
  "docker-manager.ps1"
)

#endregion

#region Phase 7: Remove Deployment Reports

Write-Host ""
Write-Host "📊 Removing old cleanup reports..." -ForegroundColor Yellow

Remove-FilesSafely @(
  "CLEANUP_REPORT_*.md",
  "DIVINE_CLEANUP_*.md",
  "DEPENDENCY_OPTIMIZATION_*.md"
)

#endregion

#region Phase 8: Consolidate Environment Files

Write-Host ""
Write-Host "🔐 Cleaning environment file duplicates..." -ForegroundColor Yellow

# Keep .env.example and .env, remove others
Remove-SpecificFiles @(
  ".env.docker.example",
  ".env.perplexity.example",
  ".env.production"
)

#endregion

#region Phase 9: Remove Workspace Duplicates

Write-Host ""
Write-Host "💼 Removing duplicate workspace files..." -ForegroundColor Yellow

Remove-FilesSafely @(
  "*-layout*.code-workspace",
  "divine-*.code-workspace",
  "custom-*.code-workspace"
)

# Keep only main workspace file
$workspaceFiles = Get-ChildItem -Path $RepoRoot -Filter "*.code-workspace" -File
if ($workspaceFiles.Count -gt 1) {
  $workspaceFiles | Where-Object { $_.Name -ne "farmers-market.code-workspace" } | ForEach-Object {
    try {
      Remove-Item $_.FullName -Force
      $Stats.FilesRemoved++
      Write-Host "  🗑️  $($_.Name)" -ForegroundColor DarkGray
    }
    catch {
      Write-Host "  ⚠️  Failed: $($_.Name)" -ForegroundColor Yellow
    }
  }
}

#endregion

#region Phase 10: Remove Config File Duplicates

Write-Host ""
Write-Host "⚙️  Cleaning configuration duplicates..." -ForegroundColor Yellow

Remove-SpecificFiles @(
  "divine-context-manager.ps1",
  "divine-layout-settings.json",
  "divine-monitoring.json"
)

#endregion

#region Phase 11: Remove Test Artifacts

Write-Host ""
Write-Host "🧪 Cleaning test artifacts..." -ForegroundColor Yellow

Remove-DirectorySafely (Join-Path $RepoRoot "playwright-report")

Remove-FilesSafely @(
  "test-*.json",
  "*-test-*.txt"
)

#endregion

#region Phase 12: Clean Documentation Folder

Write-Host ""
Write-Host "📚 Organizing documentation folder..." -ForegroundColor Yellow

$docsRoot = Join-Path $RepoRoot "docs"
if (Test-Path $docsRoot) {
  # Remove duplicate guides
  Remove-SpecificFiles @(
    "docs/NVIDIA_PROFILING_GUIDE.md",
    "docs/PROFILING_DEV_SERVER_GUIDE.md",
    "docs/TRACING_SETUP_GUIDE.md"
  )
}

#endregion

Write-Host ""
Write-Host "✅ Deep cleanup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 CLEANUP STATISTICS:" -ForegroundColor Cyan
Write-Host "   Files Removed: $($Stats.FilesRemoved)" -ForegroundColor White
Write-Host "   Directories Removed: $($Stats.DirectoriesRemoved)" -ForegroundColor White
Write-Host "   Space Saved: $([Math]::Round($Stats.SizeSaved / 1MB, 2)) MB" -ForegroundColor White
Write-Host ""

# Generate report
$reportContent = @"
# Deep Structural Cleanup Report
**Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Summary
- **Files Removed**: $($Stats.FilesRemoved)
- **Directories Removed**: $($Stats.DirectoriesRemoved)
- **Space Saved**: $([Math]::Round($Stats.SizeSaved / 1MB, 2)) MB

## Cleanup Actions Performed

### 1. Build Artifacts
- Removed all `build-*.txt`, `*-output.txt`, `*-error*.txt` files
- Cleared coverage reports and analysis files

### 2. Duplicate Documentation
- Consolidated deployment guides
- Removed duplicate optimization guides
- Cleaned up temporary planning docs
- Removed redundant status reports

### 3. Duplicate Scripts
- Removed obsolete cleanup scripts
- Consolidated Docker deployment scripts

### 4. Temporary Directories
- Removed `cleanup-logs/`
- Removed `archive/cleanup-*` directories

### 5. Visual Studio Artifacts
- Removed `.vs/`, `Properties/`, `bin/` directories
- Removed `.slnx` and C# files

### 6. Docker Files
- Removed duplicate Dockerfiles
- Consolidated Docker Compose files

### 7. Environment Files
- Kept `.env.example` and `.env`
- Removed duplicate example files

### 8. Workspace Files
- Kept only `farmers-market.code-workspace`
- Removed duplicate layout files

### 9. Configuration Files
- Removed duplicate divine configuration files

### 10. Test Artifacts
- Cleaned up test output files
- Removed playwright reports

## Repository State
Repository is now cleaner and more organized with reduced duplication.

## Next Steps
1. Verify all functionality still works
2. Update documentation references if needed
3. Commit changes to git
"@

Set-Content -Path $CleanupReport -Value $reportContent -Encoding UTF8
Write-Host "📄 Report saved: DEEP_CLEANUP_REPORT_$Timestamp.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌾 Divine cleanup consciousness preserved! ✨" -ForegroundColor Magenta
