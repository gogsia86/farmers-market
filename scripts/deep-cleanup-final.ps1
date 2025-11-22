# Deep Cleanup Script - Final Version
# Removes unnecessary files, duplicates, and bloat from the repository
# Run with caution - creates backup before deletion

param(
  [switch]$DryRun = $false,
  [switch]$Force = $false
)

$ErrorActionPreference = "Continue"
$repoRoot = "m:\Repo\Farmers Market Platform web and app"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $repoRoot "cleanup-log-$timestamp.txt"
$backupList = Join-Path $repoRoot "cleanup-backup-list-$timestamp.txt"

function Write-Log {
  param($Message, $Color = "White")
  $logMessage = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
  Write-Host $logMessage -ForegroundColor $Color
  Add-Content -Path $logFile -Value $logMessage
}

function Get-FileSize {
  param($Bytes)
  if ($Bytes -gt 1GB) { return "{0:N2} GB" -f ($Bytes / 1GB) }
  elseif ($Bytes -gt 1MB) { return "{0:N2} MB" -f ($Bytes / 1MB) }
  elseif ($Bytes -gt 1KB) { return "{0:N2} KB" -f ($Bytes / 1KB) }
  else { return "$Bytes bytes" }
}

Write-Log "=== Deep Cleanup Script Started ===" "Cyan"
Write-Log "Repository: $repoRoot"
Write-Log "Dry Run Mode: $DryRun"
Write-Log "Force Mode: $Force"
Write-Log ""

$totalSaved = 0
$filesDeleted = 0
$dirsDeleted = 0

# Categories of files to clean
$cleanupPatterns = @{
  "Temporary Analysis Files" = @(
    "temp-file-analysis.json",
    "temp-file-analysis.csv",
    "file-analysis.json",
    "duplicate-analysis.json",
    "analysis-large-files.txt"
  )
  "Build Artifacts"          = @(
    "build-error-log.txt",
    "build-errors.txt",
    "build-full-output.txt",
    "build-output.txt"
  )
  "Coverage Reports"         = @(
    "coverage-detailed-report.txt",
    "coverage-report.json",
    "coverage-summary.txt"
  )
  "Duplicate Documentation"  = @(
    "DIVINE_CLEANUP_REPORT.md",
    "DIVINE_IMPLEMENTATION_PLAN.md",
    "cursorrules-compliance-report.md",
    "DEPENDENCY_OPTIMIZATION_REPORT.md"
  )
  "Redundant Config Files"   = @(
    "custom-layout.code-workspace",
    "divine-layout.code-workspace"
  )
}

# Patterns to match for cleanup
$patternMatches = @(
  @{ Pattern = "*-backup*"; Description = "Backup files" },
  @{ Pattern = "*.bak"; Description = "Backup files" },
  @{ Pattern = "*.old"; Description = "Old files" },
  @{ Pattern = "*~"; Description = "Temp editor files" },
  @{ Pattern = "*.swp"; Description = "Vim swap files" },
  @{ Pattern = "*.swo"; Description = "Vim swap files" },
  @{ Pattern = "*.log"; Description = "Log files (root only)" },
  @{ Pattern = "cleanup-*.ps1"; Description = "Old cleanup scripts" },
  @{ Pattern = "*-todo*.md"; Description = "Duplicate TODO files" },
  @{ Pattern = "*-report*.txt"; Description = "Report text files" },
  @{ Pattern = "*-analysis*.json"; Description = "Analysis JSON files" },
  @{ Pattern = "*-analysis*.txt"; Description = "Analysis text files" }
)

# Clean by category
foreach ($category in $cleanupPatterns.Keys) {
  Write-Log "`n--- Cleaning: $category ---" "Yellow"

  foreach ($file in $cleanupPatterns[$category]) {
    $filePath = Join-Path $repoRoot $file

    if (Test-Path $filePath) {
      $fileInfo = Get-Item $filePath
      $size = $fileInfo.Length
      $sizeStr = Get-FileSize $size

      Write-Log "Found: $file ($sizeStr)" "Gray"

      if (-not $DryRun) {
        try {
          Remove-Item $filePath -Force
          Write-Log "  Deleted: $file" "Green"
          Add-Content -Path $backupList -Value $filePath
          $totalSaved += $size
          $filesDeleted++
        }
        catch {
          Write-Log "  Error deleting: $file - $_" "Red"
        }
      }
      else {
        Write-Log "  Would delete: $file" "DarkGray"
        $totalSaved += $size
        $filesDeleted++
      }
    }
  }
}

# Clean by pattern (root directory only)
Write-Log "`n--- Cleaning by Patterns (Root Only) ---" "Yellow"

foreach ($patternInfo in $patternMatches) {
  $pattern = $patternInfo.Pattern
  $description = $patternInfo.Description

  $files = Get-ChildItem -Path $repoRoot -Filter $pattern -File -ErrorAction SilentlyContinue

  if ($files) {
    Write-Log "`nPattern: $pattern - $description" "Cyan"

    foreach ($file in $files) {
      # Skip if it's this script or essential files
      if ($file.Name -eq "deep-cleanup-final.ps1" -or
        $file.Name -like "*.config*" -or
        $file.Name -like "package*.json") {
        continue
      }

      $size = $file.Length
      $sizeStr = Get-FileSize $size

      Write-Log "Found: $($file.Name) ($sizeStr)" "Gray"

      if (-not $DryRun) {
        try {
          Remove-Item $file.FullName -Force
          Write-Log "  Deleted: $($file.Name)" "Green"
          Add-Content -Path $backupList -Value $file.FullName
          $totalSaved += $size
          $filesDeleted++
        }
        catch {
          Write-Log "  Error deleting: $($file.Name) - $_" "Red"
        }
      }
      else {
        Write-Log "  Would delete: $($file.Name)" "DarkGray"
        $totalSaved += $size
        $filesDeleted++
      }
    }
  }
}

# Clean empty directories in docs
Write-Log "`n--- Cleaning Empty Directories ---" "Yellow"

$emptyDirs = Get-ChildItem -Path $repoRoot -Directory -Recurse -ErrorAction SilentlyContinue |
Where-Object {
  $_.FullName -notlike "*node_modules*" -and
  $_.FullName -notlike "*.git*" -and
  $_.FullName -notlike "*.next*" -and
  (Get-ChildItem $_.FullName -Force -ErrorAction SilentlyContinue).Count -eq 0
} | Sort-Object FullName -Descending

if ($emptyDirs) {
  Write-Log "Found $($emptyDirs.Count) empty directories" "Cyan"

  foreach ($dir in $emptyDirs) {
    $relativePath = $dir.FullName.Replace($repoRoot, "")
    Write-Log "Empty: $relativePath" "Gray"

    if (-not $DryRun) {
      try {
        Remove-Item $dir.FullName -Force -Recurse
        Write-Log "  Deleted directory: $relativePath" "Green"
        $dirsDeleted++
      }
      catch {
        Write-Log "  Error deleting directory: $relativePath - $_" "Red"
      }
    }
    else {
      Write-Log "  Would delete directory: $relativePath" "DarkGray"
      $dirsDeleted++
    }
  }
}

# Clean duplicate documentation in root
Write-Log "`n--- Checking for Duplicate Documentation ---" "Yellow"

$docPatterns = @(
  @{ Files = @("README.md", "docs\README.md"); Keep = "README.md" },
  @{ Files = @("CONTRIBUTING.md", "docs\CONTRIBUTING.md"); Keep = "CONTRIBUTING.md" },
  @{ Files = @("DEPLOYMENT_GUIDE.md", "docs\DEPLOYMENT_GUIDE.md"); Keep = "docs\DEPLOYMENT_GUIDE.md" }
)

foreach ($docCheck in $docPatterns) {
  $existingFiles = $docCheck.Files | Where-Object { Test-Path (Join-Path $repoRoot $_) }

  if ($existingFiles.Count -gt 1) {
    $keepFile = $docCheck.Keep
    $deleteFiles = $existingFiles | Where-Object { $_ -ne $keepFile }

    foreach ($file in $deleteFiles) {
      $filePath = Join-Path $repoRoot $file
      $fileInfo = Get-Item $filePath
      $size = $fileInfo.Length
      $sizeStr = Get-FileSize $size

      Write-Log "Duplicate: $file ($sizeStr) - keeping $keepFile" "Gray"

      if (-not $DryRun) {
        try {
          Remove-Item $filePath -Force
          Write-Log "  Deleted duplicate: $file" "Green"
          Add-Content -Path $backupList -Value $filePath
          $totalSaved += $size
          $filesDeleted++
        }
        catch {
          Write-Log "  Error deleting: $file - $_" "Red"
        }
      }
      else {
        Write-Log "  Would delete duplicate: $file" "DarkGray"
        $totalSaved += $size
        $filesDeleted++
      }
    }
  }
}

# Summary
Write-Log "`n=== Cleanup Summary ===" "Cyan"
Write-Log "Files processed: $filesDeleted"
Write-Log "Directories cleaned: $dirsDeleted"
Write-Log "Total space saved: $(Get-FileSize $totalSaved)"

if ($DryRun) {
  Write-Log "`nDRY RUN MODE - No files were actually deleted" "Yellow"
  Write-Log "Run without -DryRun to perform actual cleanup" "Yellow"
}
else {
  Write-Log "`nCleanup completed successfully!" "Green"
  Write-Log "Backup list saved to: $backupList" "Cyan"
}

Write-Log "`nLog file: $logFile" "Cyan"
Write-Log "`n=== Cleanup Complete ===" "Cyan"

# Return summary object
return @{
  FilesDeleted        = $filesDeleted
  DirectoriesDeleted  = $dirsDeleted
  SpaceSaved          = $totalSaved
  SpaceSavedFormatted = Get-FileSize $totalSaved
  DryRun              = $DryRun
  LogFile             = $logFile
  BackupList          = $backupList
}
