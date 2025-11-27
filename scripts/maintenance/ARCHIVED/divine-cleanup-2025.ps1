#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Divine Repository Cleanup Script - November 2025

.DESCRIPTION
    Comprehensive cleanup with safety backups and agricultural consciousness.
    Removes duplicate files, consolidates documentation, organizes structure.

.PARAMETER DryRun
    Preview changes without executing them

.PARAMETER SkipBackup
    Skip creating backup archive (NOT RECOMMENDED)

.EXAMPLE
    .\divine-cleanup-2025.ps1 -DryRun
    .\divine-cleanup-2025.ps1
#>

param(
  [switch]$DryRun = $false,
  [switch]$SkipBackup = $false
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$BackupDate = Get-Date -Format "yyyy-MM-dd_HHmmss"
$BackupDir = Join-Path $RepoRoot "archive\cleanup-$BackupDate"
$CleanupLog = Join-Path $RepoRoot "CLEANUP_REPORT_$BackupDate.md"

# Cleanup statistics
$Stats = @{
  FilesRemoved       = 0
  SizeSaved          = 0
  FilesConsolidated  = 0
  DirectoriesCreated = 0
  BackupCreated      = $false
}

Write-Host "🌾 DIVINE REPOSITORY CLEANUP - Starting..." -ForegroundColor Cyan
Write-Host "📅 Date: $BackupDate" -ForegroundColor Gray
Write-Host "📂 Repository: $RepoRoot" -ForegroundColor Gray
Write-Host ""

if ($DryRun) {
  Write-Host "⚠️  DRY RUN MODE - No files will be modified" -ForegroundColor Yellow
  Write-Host ""
}

#region Helper Functions

function Write-CleanupLog {
  param([string]$Message, [string]$Level = "INFO")

  $timestamp = Get-Date -Format "HH:mm:ss"
  $logEntry = "[$timestamp] [$Level] $Message"

  Add-Content -Path $CleanupLog -Value $logEntry

  switch ($Level) {
    "SUCCESS" { Write-Host "✅ $Message" -ForegroundColor Green }
    "WARNING" { Write-Host "⚠️  $Message" -ForegroundColor Yellow }
    "ERROR" { Write-Host "❌ $Message" -ForegroundColor Red }
    default { Write-Host "   $Message" -ForegroundColor Gray }
  }
}

function Get-FileSize {
  param([string]$Path)

  if (Test-Path $Path) {
    return (Get-Item $Path).Length
  }
  return 0
}

function Remove-FileWithBackup {
  param([string]$FilePath, [string]$Reason)

  if (-not (Test-Path $FilePath)) {
    return
  }

  $fileSize = Get-FileSize $FilePath
  $relativePath = $FilePath.Replace($RepoRoot, "").TrimStart('\', '/')

  Write-CleanupLog "Removing: $relativePath ($Reason)"

  if (-not $DryRun) {
    if (-not $SkipBackup) {
      # Create backup
      $backupPath = Join-Path $BackupDir $relativePath
      $backupParent = Split-Path $backupPath -Parent

      if (-not (Test-Path $backupParent)) {
        New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
      }

      Copy-Item $FilePath $backupPath -Force
    }

    Remove-Item $FilePath -Force
    $Stats.FilesRemoved++
    $Stats.SizeSaved += $fileSize
  }
}

function Remove-DirectoryWithBackup {
  param([string]$DirPath, [string]$Reason)

  if (-not (Test-Path $DirPath)) {
    return
  }

  $relativePath = $DirPath.Replace($RepoRoot, "").TrimStart('\', '/')
  Write-CleanupLog "Removing directory: $relativePath ($Reason)"

  if (-not $DryRun) {
    if (-not $SkipBackup) {
      $backupPath = Join-Path $BackupDir $relativePath
      $backupParent = Split-Path $backupPath -Parent

      if (-not (Test-Path $backupParent)) {
        New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
      }

      Copy-Item $DirPath $backupPath -Recurse -Force
    }

    Remove-Item $DirPath -Recurse -Force
    $Stats.FilesRemoved++
  }
}

function Move-FileToArchive {
  param([string]$FilePath, [string]$ArchiveSubDir)

  if (-not (Test-Path $FilePath)) {
    return
  }

  $archiveDir = Join-Path $RepoRoot "docs\archives\$ArchiveSubDir"
  $fileName = Split-Path $FilePath -Leaf
  $destination = Join-Path $archiveDir $fileName

  Write-CleanupLog "Archiving: $fileName -> archives/$ArchiveSubDir"

  if (-not $DryRun) {
    if (-not (Test-Path $archiveDir)) {
      New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
      $Stats.DirectoriesCreated++
    }

    Move-Item $FilePath $destination -Force
    $Stats.FilesConsolidated++
  }
}

#endregion

#region Backup Creation

Write-Host "📦 Creating safety backup..." -ForegroundColor Cyan

if (-not $DryRun -and -not $SkipBackup) {
  New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
  Write-CleanupLog "Backup directory created: $BackupDir" "SUCCESS"
  $Stats.BackupCreated = $true
}
else {
  Write-CleanupLog "Backup skipped (DryRun: $DryRun, SkipBackup: $SkipBackup)" "WARNING"
}

#endregion

#region Initialize Cleanup Log

$logHeader = @"
# 🌾 DIVINE REPOSITORY CLEANUP REPORT
**Date:** $(Get-Date -Format "MMMM dd, yyyy HH:mm:ss")
**Mode:** $(if ($DryRun) { "DRY RUN (Preview Only)" } else { "LIVE CLEANUP" })
**Backup:** $(if ($SkipBackup) { "Disabled" } else { "Enabled" })

---

## Cleanup Operations

"@

Set-Content -Path $CleanupLog -Value $logHeader

#endregion

#region PHASE 1: Remove Log Files

Write-Host ""
Write-Host "🗑️  PHASE 1: Removing temporary log files..." -ForegroundColor Cyan

$logPatterns = @(
  "build-debug.log",
  "build-error-log.txt",
  "build-errors.txt",
  "build-full-output.txt",
  "build-output.log",
  "build-output.txt",
  "dev-server-debug.log",
  "docker-build-clean.log",
  "docker-build-final.log",
  "docker-build.log",
  "test-results.log",
  "test-output.log",
  "test-errors-full.txt",
  "test-errors.txt",
  "test-failures.txt",
  "test-full-output.txt",
  "test-output-full.txt",
  "test-output-latest.txt",
  "test-output.txt",
  "test-results.txt",
  "lint-full-output.txt",
  "error-boundary-test-output.txt",
  "test-coverage-detailed.txt",
  "test-coverage-output.txt",
  "test-coverage-report.txt",
  "coverage-detailed-report.txt",
  "coverage-summary.txt"
)

foreach ($pattern in $logPatterns) {
  $file = Join-Path $RepoRoot $pattern
  Remove-FileWithBackup $file "Temporary log file"
}

#endregion

#region PHASE 2: Consolidate Docker Documentation

Write-Host ""
Write-Host "🐳 PHASE 2: Consolidating Docker documentation..." -ForegroundColor Cyan

# Create consolidated Docker guide location
$dockerDocsDir = Join-Path $RepoRoot "docs\deployment"
if (-not (Test-Path $dockerDocsDir) -and -not $DryRun) {
  New-Item -ItemType Directory -Path $dockerDocsDir -Force | Out-Null
  $Stats.DirectoriesCreated++
}

# Files to archive
$dockerArchiveFiles = @(
  "DOCKER_BUILD_FIXES.md",
  "DOCKER_BUILD_SUCCESS.md",
  "DOCKER_CLEAN_REBUILD.md",
  "DOCKER_QUICK_START.md",
  "DOCKER_READINESS_ANALYSIS.md"
)

foreach ($file in $dockerArchiveFiles) {
  $filePath = Join-Path $RepoRoot $file
  Move-FileToArchive $filePath "docker-old"
}

# Keep these files (just log)
$dockerKeepFiles = @(
  "DOCKER_GUIDE.md",
  "docs\deployment\DOCKER_DEPLOYMENT.md"
)

Write-CleanupLog "Keeping consolidated Docker docs: DOCKER_GUIDE.md, docs/deployment/DOCKER_DEPLOYMENT.md" "SUCCESS"

#endregion

#region PHASE 3: Consolidate I18N Documentation

Write-Host ""
Write-Host "🌐 PHASE 3: Consolidating I18N documentation..." -ForegroundColor Cyan

$i18nFiles = @(
  "I18N_CROATIAN_SERBIAN_UPDATE.md",
  "I18N_QUICK_REFERENCE.md",
  "I18N_QUICK_START.md",
  "I18N_SUMMARY.md"
)

foreach ($file in $i18nFiles) {
  $filePath = Join-Path $RepoRoot "docs\$file"
  if (Test-Path $filePath) {
    Move-FileToArchive $filePath "i18n-old"
  }
}

Write-CleanupLog "Keeping: docs/I18N_IMPLEMENTATION_GUIDE.md as master I18N reference" "SUCCESS"

#endregion

#region PHASE 4: Consolidate Testing Documentation

Write-Host ""
Write-Host "🧪 PHASE 4: Consolidating testing documentation..." -ForegroundColor Cyan

$testingArchiveFiles = @(
  "E2E_TEST_FIXES_NEEDED.md",
  "E2E_TEST_FIXES_SUMMARY.md",
  "E2E_TEST_INVESTIGATION.md"
)

foreach ($file in $testingArchiveFiles) {
  $filePath = Join-Path $RepoRoot $file
  Move-FileToArchive $filePath "testing-old"
}

#endregion

#region PHASE 5: Consolidate Production Deployment Docs

Write-Host ""
Write-Host "🚀 PHASE 5: Consolidating production deployment docs..." -ForegroundColor Cyan

# Keep only the comprehensive guide
$prodArchiveFiles = @(
  "PRODUCTION_DEPLOYMENT_CHECKLIST.md"
)

foreach ($file in $prodArchiveFiles) {
  $filePath = Join-Path $RepoRoot $file
  Move-FileToArchive $filePath "deployment-old"
}

Write-CleanupLog "Keeping: PRODUCTION_DEPLOYMENT_GUIDE.md, docs/PRODUCTION_READINESS_HUB.md" "SUCCESS"

#endregion

#region PHASE 6: Clean Up Temporary Scripts

Write-Host ""
Write-Host "🔧 PHASE 6: Organizing temporary scripts..." -ForegroundColor Cyan

$scriptsMaintenanceDir = Join-Path $RepoRoot "scripts\maintenance"
if (-not (Test-Path $scriptsMaintenanceDir) -and -not $DryRun) {
  New-Item -ItemType Directory -Path $scriptsMaintenanceDir -Force | Out-Null
  $Stats.DirectoriesCreated++
}

$tempScripts = @(
  "comprehensive-cleanup.ps1",
  "docker-cleanup.ps1",
  "docker-complete-cleanup.ps1",
  "docker-clean-build.ps1",
  "FINAL_CLEANUP.ps1"
)

foreach ($script in $tempScripts) {
  $scriptPath = Join-Path $RepoRoot $script
  if (Test-Path $scriptPath) {
    Remove-FileWithBackup $scriptPath "Obsolete temporary script"
  }
}

#endregion

#region PHASE 7: Archive Analysis Reports

Write-Host ""
Write-Host "📊 PHASE 7: Archiving analysis reports..." -ForegroundColor Cyan

$analysisFiles = @(
  "cursorrules-compliance-report.md",
  "DEPENDENCY_OPTIMIZATION_REPORT.md",
  "DIVINE_CLEANUP_REPORT.md",
  "SYSTEM_CAPACITY_ANALYSIS.md",
  "SYSTEM_OPTIMIZATION_GUIDE.md",
  "SYSTEM_UTILIZATION_ANALYSIS.md"
)

foreach ($file in $analysisFiles) {
  $filePath = Join-Path $RepoRoot $file
  Move-FileToArchive $filePath "analysis-reports"
}

#endregion

#region PHASE 8: Clean Up Duplicate ENV Templates

Write-Host ""
Write-Host "🔐 PHASE 8: Consolidating environment templates..." -ForegroundColor Cyan

$envDuplicates = @(
  ".env.docker",
  ".env.local.example",
  ".env.production.template"
)

foreach ($file in $envDuplicates) {
  $envPath = Join-Path $RepoRoot $file
  Remove-FileWithBackup $envPath "Duplicate env template"
}

Write-CleanupLog "Keeping: .env.example (master template with all variables)" "SUCCESS"

#endregion

#region PHASE 9: Remove Backup Files

Write-Host ""
Write-Host "🗄️  PHASE 9: Removing backup files..." -ForegroundColor Cyan

$backupFiles = @(
  "instrumentation.ts.bak",
  "test-diagnostic.mjs",
  "test-quick-diagnostic.js"
)

foreach ($file in $backupFiles) {
  $filePath = Join-Path $RepoRoot $file
  Remove-FileWithBackup $filePath "Old backup file"
}

#endregion

#region PHASE 10: Consolidate Index Files

Write-Host ""
Write-Host "📑 PHASE 10: Consolidating index/master files..." -ForegroundColor Cyan

$indexFiles = @(
  "DOCUMENTATION_INDEX.md",
  "PLANNING_DOCS_QUICK_ACCESS.md"
)

foreach ($file in $indexFiles) {
  $filePath = Join-Path $RepoRoot $file
  Move-FileToArchive $filePath "old-indexes"
}

Write-CleanupLog "Keeping: DOCUMENTATION_MASTER_INDEX.md, PLANNING_DOCS_MASTER_INDEX.md" "SUCCESS"

#endregion

#region PHASE 11: Update .gitignore

Write-Host ""
Write-Host "📝 PHASE 11: Updating .gitignore..." -ForegroundColor Cyan

$gitignorePath = Join-Path $RepoRoot ".gitignore"
$gitignoreAdditions = @"

# === DIVINE CLEANUP ADDITIONS (2025-11-21) ===
# Temporary log files
*-output.txt
*-errors.txt
*-debug.log
*-full-output.txt
build-*.log
test-*.log
coverage-*.txt

# Cleanup reports
CLEANUP_REPORT_*.md
DIVINE_CLEANUP_REPORT.md

# Temporary scripts
*-cleanup.ps1
FINAL_CLEANUP.ps1

# Analysis reports (archive these, don't track)
*_ANALYSIS.md
*_OPTIMIZATION_REPORT.md
cursorrules-compliance-report.md

# Archive backups
archive/cleanup-*/
"@

if (-not $DryRun) {
  if (Test-Path $gitignorePath) {
    $currentContent = Get-Content $gitignorePath -Raw
    if ($currentContent -notlike "*DIVINE CLEANUP ADDITIONS*") {
      Add-Content -Path $gitignorePath -Value $gitignoreAdditions
      Write-CleanupLog ".gitignore updated with cleanup patterns" "SUCCESS"
    }
    else {
      Write-CleanupLog ".gitignore already contains cleanup patterns" "INFO"
    }
  }
}

#endregion

#region Generate Final Report

Write-Host ""
Write-Host "📋 Generating final cleanup report..." -ForegroundColor Cyan

$reportFooter = @"

---

## Summary Statistics

- **Files Removed:** $($Stats.FilesRemoved)
- **Files Archived:** $($Stats.FilesConsolidated)
- **Space Saved:** $([math]::Round($Stats.SizeSaved / 1MB, 2)) MB
- **Directories Created:** $($Stats.DirectoriesCreated)
- **Backup Created:** $(if ($Stats.BackupCreated) { "✅ Yes - $BackupDir" } else { "❌ No" })
- **Mode:** $(if ($DryRun) { "DRY RUN (Preview)" } else { "LIVE CLEANUP" })

---

## Kept Files (Consolidated Masters)

### Documentation
- ✅ `DOCKER_GUIDE.md` - Master Docker reference
- ✅ `docs/deployment/DOCKER_DEPLOYMENT.md` - Deployment procedures
- ✅ `docs/I18N_IMPLEMENTATION_GUIDE.md` - Master I18N guide
- ✅ `PRODUCTION_DEPLOYMENT_GUIDE.md` - Production deployment
- ✅ `docs/PRODUCTION_READINESS_HUB.md` - Production readiness
- ✅ `DOCUMENTATION_MASTER_INDEX.md` - Documentation index
- ✅ `PLANNING_DOCS_MASTER_INDEX.md` - Planning docs index

### Configuration
- ✅ `.env.example` - Master environment template
- ✅ `.env.perplexity.example` - Perplexity API template

### Scripts
- ✅ `scripts/` - All active utility scripts
- ✅ `scripts/divine-cleanup-2025.ps1` - This cleanup script

---

## Next Steps

1. **Review Archives:** Check `docs/archives/` for moved files
2. **Verify Backup:** If needed, restore from `$BackupDir`
3. **Update Documentation:** Review consolidated master docs
4. **Commit Changes:**
   ```bash
   git add .
   git commit -m "🧹 Divine cleanup: Remove duplicates, consolidate docs"
   ```

---

## Restore Instructions

If you need to restore files:

``````powershell
# Restore from backup
Copy-Item "$BackupDir\*" "$RepoRoot\" -Recurse -Force

# Or restore specific file
Copy-Item "$BackupDir\path\to\file.ext" "$RepoRoot\path\to\file.ext"
``````

---

**Cleanup completed at:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Agricultural Consciousness:** Preserved ✨
**Repository Health:** Optimal 🌾
"@

Add-Content -Path $CleanupLog -Value $reportFooter

#endregion

#region Display Final Summary

Write-Host ""
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🌟 DIVINE CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   Files Removed:    $($Stats.FilesRemoved)" -ForegroundColor White
Write-Host "   Files Archived:   $($Stats.FilesConsolidated)" -ForegroundColor White
Write-Host "   Space Saved:      $([math]::Round($Stats.SizeSaved / 1MB, 2)) MB" -ForegroundColor White
Write-Host "   Mode:             $(if ($DryRun) { 'DRY RUN (Preview)' } else { 'LIVE CLEANUP' })" -ForegroundColor $(if ($DryRun) { 'Yellow' } else { 'Green' })
Write-Host ""

if ($Stats.BackupCreated) {
  Write-Host "💾 Backup Location: $BackupDir" -ForegroundColor Green
}

Write-Host "📋 Detailed Report: $CleanupLog" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
  Write-Host "⚠️  This was a DRY RUN. Run without -DryRun to execute cleanup." -ForegroundColor Yellow
}
else {
  Write-Host "✅ Cleanup executed successfully!" -ForegroundColor Green
  Write-Host "🌾 Agricultural consciousness preserved!" -ForegroundColor Magenta
}

Write-Host ""

#endregion

# Exit with success
exit 0
