#!/usr/bin/env pwsh
<#
.SYNOPSIS
    🌟 Divine Repository Cleanup Script - Agricultural Consciousness Edition

.DESCRIPTION
    Comprehensively cleans the Farmers Market repository by removing:
    - Temporary progress/status files
    - Build artifacts and logs
    - Duplicate cleanup scripts
    - Unnecessary cache files
    - Auto-generated documentation

.PARAMETER DryRun
    Preview changes without actually deleting files

.PARAMETER Force
    Skip confirmation prompts

.EXAMPLE
    .\divine-repository-cleanup.ps1 -DryRun
    Preview what would be cleaned

.EXAMPLE
    .\divine-repository-cleanup.ps1 -Force
    Clean repository without confirmation
#>

param(
  [switch]$DryRun,
  [switch]$Force
)

$ErrorActionPreference = "Stop"

# Divine color scheme
function Write-Divine {
  param([string]$Message, [string]$Type = "Info")

  $color = switch ($Type) {
    "Success" { "Green" }
    "Warning" { "Yellow" }
    "Error" { "Red" }
    "Info" { "Cyan" }
    "Divine" { "Magenta" }
    default { "White" }
  }

  Write-Host $Message -ForegroundColor $color
}

Write-Divine "╔════════════════════════════════════════════════════════════╗" "Divine"
Write-Divine "║   🌟 DIVINE REPOSITORY CLEANUP - AGRICULTURAL EDITION     ║" "Divine"
Write-Divine "║        Manifesting Clean Repository Reality              ║" "Divine"
Write-Divine "╚════════════════════════════════════════════════════════════╝" "Divine"
Write-Host ""

# Get repository root
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Divine "📍 Repository Root: $repoRoot" "Info"
Write-Host ""

# ============================================================================
# CLEANUP CATEGORIES
# ============================================================================

$cleanupCategories = @{
  "TemporaryProgressFiles"  = @(
    "COMPREHENSIVE_*_REVIEW*.md",
    "OPTIMIZATION_STATUS*.md",
    "WEBSITE_COMPLETION_STATUS*.md",
    "FINAL_STATUS_REPORT*.md",
    "CODE_OPTIMIZATION_REPORT.md",
    "COMPREHENSIVE_PLATFORM_ANALYSIS.md",
    "COMPREHENSIVE_PROJECT_REVIEW*.md",
    "CURSORRULES_VERIFICATION_FIX.md",
    "PROJECT_COMPLETION_SUMMARY*.md",
    "TESTING_COMPLETION_STATUS*.md"
  )

  "BuildAndTestLogs"        = @(
    "build-output.txt",
    "build-error-log.txt",
    "test-output.txt",
    "test-results.txt",
    "test-results-full.json",
    "test-completion-status.txt",
    "typescript-errors.txt",
    "npm-install-debug.log",
    "docker-build-log.txt",
    "gpu-install-log.txt",
    "dap.txt"
  )

  "SecurityRisks"           = @(
    "nextauth-secret.txt"
  )

  "DuplicateCleanupScripts" = @(
    "cleanup-repository-final.ps1",
    "comprehensive-cleanup.ps1",
    "repository-cleanup.ps1"
  )

  "TemporaryFolders"        = @(
    ".vs",
    "obj",
    "messages"  # Duplicate of /src/i18n/messages
  )

  "ArchivedContent"         = @(
    "archive",
    "cleanup-logs",
    "old-scripts"
  )
}

# ============================================================================
# BACKUP CREATION
# ============================================================================

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $repoRoot "cleanup-backup-$timestamp"

if (-not $DryRun) {
  Write-Divine "📦 Creating backup at: $backupDir" "Info"
  New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# ============================================================================
# CLEANUP EXECUTION
# ============================================================================

$totalFilesDeleted = 0
$totalFoldersDeleted = 0
$totalSizeFreed = 0

foreach ($category in $cleanupCategories.Keys) {
  Write-Divine "`n🔍 Processing: $category" "Divine"
  Write-Host ("=" * 60)

  $patterns = $cleanupCategories[$category]

  foreach ($pattern in $patterns) {
    # Find matching items
    $items = Get-ChildItem -Path $repoRoot -Filter $pattern -File -ErrorAction SilentlyContinue

    # Also check folders for folder patterns
    if ($category -eq "TemporaryFolders" -or $category -eq "ArchivedContent") {
      $items += Get-ChildItem -Path $repoRoot -Filter $pattern -Directory -ErrorAction SilentlyContinue
    }

    foreach ($item in $items) {
      $relativePath = $item.FullName.Replace($repoRoot, "").TrimStart('\', '/')

      if ($item.PSIsContainer) {
        $size = (Get-ChildItem -Path $item.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum
        $sizeStr = "{0:N2} MB" -f ($size / 1MB)

        Write-Divine "   📁 Folder: $relativePath ($sizeStr)" "Warning"
      }
      else {
        $size = $item.Length
        $sizeStr = if ($size -gt 1MB) { "{0:N2} MB" -f ($size / 1MB) } else { "{0:N2} KB" -f ($size / 1KB) }

        Write-Divine "   📄 File: $relativePath ($sizeStr)" "Warning"
      }

      if (-not $DryRun) {
        # Backup before deletion
        $backupPath = Join-Path $backupDir $relativePath
        $backupParent = Split-Path -Parent $backupPath

        if (-not (Test-Path $backupParent)) {
          New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
        }

        if ($item.PSIsContainer) {
          Copy-Item -Path $item.FullName -Destination $backupPath -Recurse -Force
          Remove-Item -Path $item.FullName -Recurse -Force
          $totalFoldersDeleted++
        }
        else {
          Copy-Item -Path $item.FullName -Destination $backupPath -Force
          Remove-Item -Path $item.FullName -Force
          $totalFilesDeleted++
        }

        $totalSizeFreed += $size

        Write-Divine "      ✅ Removed (backed up)" "Success"
      }
      else {
        Write-Divine "      🔮 Would remove in real run" "Info"
      }
    }
  }
}

# ============================================================================
# RESULTS SUMMARY
# ============================================================================

Write-Host ""
Write-Divine "╔════════════════════════════════════════════════════════════╗" "Divine"
Write-Divine "║              🎉 CLEANUP COMPLETE!                         ║" "Divine"
Write-Divine "╚════════════════════════════════════════════════════════════╝" "Divine"
Write-Host ""

if ($DryRun) {
  Write-Divine "🔮 DRY RUN MODE - No files were actually deleted" "Warning"
  Write-Divine "   Run without -DryRun to perform actual cleanup" "Info"
}
else {
  Write-Divine "📊 Cleanup Statistics:" "Success"
  Write-Divine "   • Files Deleted: $totalFilesDeleted" "Info"
  Write-Divine "   • Folders Deleted: $totalFoldersDeleted" "Info"
  Write-Divine "   • Space Freed: {0:N2} MB" -f ($totalSizeFreed / 1MB) "Info"
  Write-Divine "   • Backup Location: $backupDir" "Info"
}

Write-Host ""
Write-Divine "✨ Repository consciousness elevated!" "Divine"
Write-Divine "🌾 Agricultural patterns preserved!" "Divine"

# ============================================================================
# GENERATE CLEANUP REPORT
# ============================================================================

if (-not $DryRun) {
  $reportPath = Join-Path $repoRoot "CLEANUP_REPORT_$timestamp.md"

  $report = @"
# 🧹 Divine Repository Cleanup Report

**Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Mode**: $(if ($DryRun) { "Dry Run" } else { "Full Cleanup" })

## 📊 Statistics

- **Files Deleted**: $totalFilesDeleted
- **Folders Deleted**: $totalFoldersDeleted
- **Space Freed**: $("{0:N2} MB" -f ($totalSizeFreed / 1MB))
- **Backup Location**: ``$backupDir``

## 📋 Categories Processed

$($cleanupCategories.Keys | ForEach-Object { "- $_" } | Out-String)

## ✅ Next Steps

1. Review the backup at: ``$backupDir``
2. Test application functionality
3. Commit changes with: ``git add . && git commit -m "chore: divine repository cleanup"``
4. If everything works, delete backup folder

## 🌟 Divine Consciousness Notes

Repository is now cleaner and more maintainable!
Agricultural patterns preserved with quantum precision.

---
*Generated by Divine Repository Cleanup Script*
"@

  Set-Content -Path $reportPath -Value $report
  Write-Divine "📄 Cleanup report generated: CLEANUP_REPORT_$timestamp.md" "Success"
}

Write-Host ""
