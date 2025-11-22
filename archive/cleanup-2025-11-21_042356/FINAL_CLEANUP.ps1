#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Final Repository Cleanup Script for Farmers Market Platform
.DESCRIPTION
    Removes temporary files, build artifacts, logs, and unnecessary documentation
    while preserving essential project files and creating organized archives.
.NOTES
    Created: November 15, 2025
    Purpose: Production-ready repository cleanup
#>

[CmdletBinding(SupportsShouldProcess)]
param(
  [switch]$DryRun,
  [switch]$ArchiveBeforeDelete,
  [switch]$Force
)

# Script configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors for output
$Colors = @{
  Header  = "Cyan"
  Success = "Green"
  Warning = "Yellow"
  Error   = "Red"
  Info    = "White"
}

# Banner
Write-Host @"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🧹 FARMERS MARKET PLATFORM - FINAL CLEANUP               ║
║                                                               ║
║     Removing temporary files and organizing repository       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor $Colors.Header

# Get repository root
$RepoRoot = $PSScriptRoot
$Timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$ArchiveDir = Join-Path $RepoRoot "archive\final-cleanup-$Timestamp"
$LogFile = Join-Path $RepoRoot "cleanup-logs\final_cleanup_$Timestamp.log"

# Statistics
$Stats = @{
  FilesDeleted  = 0
  FilesArchived = 0
  BytesFreed    = 0
  Errors        = 0
}

# Logging function
function Write-Log {
  param(
    [string]$Message,
    [string]$Level = "INFO"
  )

  $LogMessage = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [$Level] $Message"
  Add-Content -Path $LogFile -Value $LogMessage

  $Color = switch ($Level) {
    "ERROR" { $Colors.Error }
    "WARNING" { $Colors.Warning }
    "SUCCESS" { $Colors.Success }
    default { $Colors.Info }
  }

  Write-Host $LogMessage -ForegroundColor $Color
}

# Create log directory if it doesn't exist
$LogDir = Split-Path $LogFile
if (-not (Test-Path $LogDir)) {
  New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

Write-Log "Starting repository cleanup" "INFO"
Write-Log "Repository root: $RepoRoot" "INFO"
Write-Log "Dry run mode: $DryRun" "INFO"

# ============================================================================
# CLEANUP DEFINITIONS
# ============================================================================

# Files to delete (relative to repo root)
$FilesToDelete = @(
  # Security risks
  "nextauth-secret.txt"

  # Build artifacts & logs
  "build-output.txt"
  "build-error-log.txt"
  "docker-build-log.txt"
  "typescript-errors.txt"
  "gpu-install-log.txt"

  # Test output files
  "test-output.txt"
  "test-completion-status.txt"
  "test-results.txt"
  "test-results-full.json"

  # Debug logs
  "npm-install-debug.log"
  "dap.txt"

  # Temporary status reports (root level)
  "COMPREHENSIVE_REVIEW_NOV_2025.md"
  "COMPREHENSIVE_PROJECT_REVIEW_2025.md"
  "COMPREHENSIVE_PLATFORM_REVIEW_NOV_2025.md"
  "COMPREHENSIVE_PLATFORM_ANALYSIS.md"
  "OPTIMIZATION_STATUS_83_100.md"
  "WEBSITE_COMPLETION_STATUS.md"
  "FINAL_STATUS_REPORT_NOVEMBER_2025.md"
  "CODE_OPTIMIZATION_REPORT.md"
  "CURSORRULES_VERIFICATION_FIX.md"

  # Duplicate cleanup scripts (keep comprehensive-cleanup.ps1)
  "cleanup-repository-final.ps1"
  "divine-cleanup.ps1"
)

# Directories to delete
$DirectoriesToDelete = @(
  ".vs"           # Visual Studio cache
  "obj"           # .NET build artifacts
  "messages"      # Duplicate i18n (exists in src/i18n/messages)
)

# Files to archive (move to archive folder before cleanup)
$FilesToArchive = @(
  # Keep these for historical reference
  "COMPREHENSIVE_REVIEW_NOV_2025.md"
  "COMPREHENSIVE_PROJECT_REVIEW_2025.md"
  "FINAL_STATUS_REPORT_NOVEMBER_2025.md"
)

# ============================================================================
# CLEANUP FUNCTIONS
# ============================================================================

function Remove-Item-Safe {
  param(
    [string]$Path,
    [switch]$Recurse
  )

  if (-not (Test-Path $Path)) {
    Write-Log "Path does not exist (skipping): $Path" "INFO"
    return $true
  }

  try {
    $Item = Get-Item $Path -ErrorAction Stop
  }
  catch {
    Write-Log "Cannot access path (skipping): $Path" "INFO"
    return $true
  }
  $Size = if ($Item.PSIsContainer) {
    (Get-ChildItem -Path $Path -Recurse -File | Measure-Object -Property Length -Sum).Sum
  }
  else {
    $Item.Length
  }

  if ($DryRun) {
    Write-Log "[DRY RUN] Would delete: $Path ($([math]::Round($Size / 1KB, 2)) KB)" "INFO"
    return $true
  }

  try {
    if ($Recurse) {
      Remove-Item -Path $Path -Recurse -Force
    }
    else {
      Remove-Item -Path $Path -Force
    }

    $Stats.FilesDeleted++
    $Stats.BytesFreed += $Size
    Write-Log "Deleted: $Path ($([math]::Round($Size / 1KB, 2)) KB)" "SUCCESS"
    return $true
  }
  catch {
    $Stats.Errors++
    Write-Log "Failed to delete: $Path - $_" "ERROR"
    return $false
  }
}

function Archive-Item-Safe {
  param(
    [string]$SourcePath,
    [string]$DestinationPath
  )

  if (-not (Test-Path $SourcePath)) {
    Write-Log "Source does not exist: $SourcePath" "WARNING"
    return $false
  }

  if ($DryRun) {
    Write-Log "[DRY RUN] Would archive: $SourcePath -> $DestinationPath" "INFO"
    return $true
  }

  try {
    $DestDir = Split-Path $DestinationPath
    if (-not (Test-Path $DestDir)) {
      New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
    }

    Copy-Item -Path $SourcePath -Destination $DestinationPath -Force
    $Stats.FilesArchived++
    Write-Log "Archived: $SourcePath -> $DestinationPath" "SUCCESS"
    return $true
  }
  catch {
    $Stats.Errors++
    Write-Log "Failed to archive: $SourcePath - $_" "ERROR"
    return $false
  }
}

# ============================================================================
# MAIN CLEANUP LOGIC
# ============================================================================

Write-Host "`n🗂️  Phase 1: Archiving Important Files" -ForegroundColor $Colors.Header

if ($ArchiveBeforeDelete) {
  foreach ($File in $FilesToArchive) {
    $SourcePath = Join-Path $RepoRoot $File
    $DestPath = Join-Path $ArchiveDir "root-documents\$File"
    Archive-Item-Safe -SourcePath $SourcePath -DestinationPath $DestPath
  }
}

Write-Host "`n🗑️  Phase 2: Deleting Individual Files" -ForegroundColor $Colors.Header

foreach ($File in $FilesToDelete) {
  $FilePath = Join-Path $RepoRoot $File
  Remove-Item-Safe -Path $FilePath
}

Write-Host "`n📁 Phase 3: Deleting Directories" -ForegroundColor $Colors.Header

foreach ($Dir in $DirectoriesToDelete) {
  $DirPath = Join-Path $RepoRoot $Dir
  Remove-Item-Safe -Path $DirPath -Recurse
}

# ============================================================================
# SUMMARY REPORT
# ============================================================================

Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                    CLEANUP SUMMARY                            ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor $Colors.Header

Write-Host "Files Deleted:    $($Stats.FilesDeleted)" -ForegroundColor $Colors.Success
Write-Host "Files Archived:   $($Stats.FilesArchived)" -ForegroundColor $Colors.Info
Write-Host "Space Freed:      $([math]::Round($Stats.BytesFreed / 1MB, 2)) MB" -ForegroundColor $Colors.Success
Write-Host "Errors:           $($Stats.Errors)" -ForegroundColor $(if ($Stats.Errors -gt 0) { $Colors.Error } else { $Colors.Success })

if ($DryRun) {
  Write-Host "`n⚠️  DRY RUN MODE - No files were actually modified" -ForegroundColor $Colors.Warning
  Write-Host "Run without -DryRun to perform actual cleanup" -ForegroundColor $Colors.Info
}

Write-Host "`nLog file: $LogFile" -ForegroundColor $Colors.Info

Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                   ✅ CLEANUP COMPLETE                         ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor $Colors.Success

# ============================================================================
# NEXT STEPS
# ============================================================================

Write-Host "📝 Next Steps:" -ForegroundColor $Colors.Header
Write-Host "  1. Review the updated .gitignore file" -ForegroundColor $Colors.Info
Write-Host "  2. Commit the changes to Git" -ForegroundColor $Colors.Info
Write-Host "  3. Run 'git status' to verify cleanup" -ForegroundColor $Colors.Info
Write-Host "  4. Consider running 'git gc' to optimize repository" -ForegroundColor $Colors.Info

exit 0
