#!/usr/bin/env pwsh
# ============================================
# DEEP CLEANUP SCRIPT - AGGRESSIVE MODE
# Divine Agricultural Platform Repository Cleaner
# ============================================

$ErrorActionPreference = "SilentlyContinue"
$rootPath = "m:\Repo\Farmers Market Platform web and app"

Write-Host "🌟 DEEP REPOSITORY CLEANUP - AGGRESSIVE MODE" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Initialize counters
$deletedFiles = 0
$deletedDirs = 0
$freedSpace = 0

# Function to delete items safely
function Remove-ItemSafe {
  param($Path, $Type = "File")

  if (Test-Path $Path) {
    try {
      $size = 0
      if ($Type -eq "File") {
        $size = (Get-Item $Path).Length
      }
      else {
        $size = (Get-ChildItem -Path $Path -Recurse -File | Measure-Object -Property Length -Sum).Sum
      }

      Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop

      if ($Type -eq "File") {
        $script:deletedFiles++
      }
      else {
        $script:deletedDirs++
      }
      $script:freedSpace += $size

      Write-Host "✓ Removed: $(Split-Path $Path -Leaf)" -ForegroundColor Green
      return $true
    }
    catch {
      Write-Host "✗ Failed: $(Split-Path $Path -Leaf) - $($_.Exception.Message)" -ForegroundColor Red
      return $false
    }
  }
  return $false
}

# ============================================
# PHASE 1: LOG FILES & TEMPORARY FILES
# ============================================
Write-Host "`n📋 PHASE 1: Cleaning log and temporary files..." -ForegroundColor Yellow

$logPatterns = @(
  "*.log",
  "*.tmp",
  "*-output.txt",
  "*-error*.txt",
  "build-*.txt",
  "coverage-*.txt",
  "*.bak",
  "*.old"
)

foreach ($pattern in $logPatterns) {
  Get-ChildItem -Path $rootPath -Filter $pattern -Recurse -File |
  Where-Object {
    $_.FullName -notlike "*node_modules\*" -and
    $_.FullName -notlike "*.git\*" -and
    $_.FullName -notlike "*.next\*"
  } | ForEach-Object {
    Remove-ItemSafe -Path $_.FullName -Type "File"
  }
}

# ============================================
# PHASE 2: BUILD ARTIFACTS & CACHE
# ============================================
Write-Host "`n🏗️  PHASE 2: Cleaning build artifacts and cache..." -ForegroundColor Yellow

$buildDirs = @(
  "$rootPath\.next",
  "$rootPath\out",
  "$rootPath\dist",
  "$rootPath\build",
  "$rootPath\.turbo",
  "$rootPath\node_modules\.cache",
  "$rootPath\.cache"
)

foreach ($dir in $buildDirs) {
  Remove-ItemSafe -Path $dir -Type "Directory"
}

# ============================================
# PHASE 3: CLEANUP REPORTS & ARCHIVES
# ============================================
Write-Host "`n📊 PHASE 3: Cleaning old reports and archives..." -ForegroundColor Yellow

# Old cleanup reports
Get-ChildItem -Path $rootPath -Filter "CLEANUP_REPORT*.md" -Recurse -File |
Where-Object { $_.FullName -notlike "*node_modules\*" } |
ForEach-Object {
  Remove-ItemSafe -Path $_.FullName -Type "File"
}

Get-ChildItem -Path $rootPath -Filter "DIVINE_CLEANUP*.md" -Recurse -File |
Where-Object { $_.FullName -notlike "*node_modules\*" } |
ForEach-Object {
  Remove-ItemSafe -Path $_.FullName -Type "File"
}

# Archive directories
Get-ChildItem -Path $rootPath -Filter "archive*" -Directory -Recurse |
Where-Object { $_.FullName -notlike "*node_modules\*" } |
ForEach-Object {
  Remove-ItemSafe -Path $_.FullName -Type "Directory"
}

# Cleanup logs directory
if (Test-Path "$rootPath\cleanup-logs") {
  Remove-ItemSafe -Path "$rootPath\cleanup-logs" -Type "Directory"
}

# ============================================
# PHASE 4: JSON REPORTS & ANALYSIS FILES
# ============================================
Write-Host "`n📈 PHASE 4: Cleaning analysis and report files..." -ForegroundColor Yellow

$reportPatterns = @(
  "*-report.json",
  "coverage-report.json",
  "cleanup-analysis.json",
  "analysis-*.json"
)

foreach ($pattern in $reportPatterns) {
  Get-ChildItem -Path $rootPath -Filter $pattern -File |
  Where-Object {
    $_.FullName -notlike "*node_modules\*" -and
    $_.Directory.Name -ne "test-results"
  } | ForEach-Object {
    Remove-ItemSafe -Path $_.FullName -Type "File"
  }
}

# ============================================
# PHASE 5: PROFILING OUTPUT
# ============================================
Write-Host "`n⚡ PHASE 5: Cleaning profiling data..." -ForegroundColor Yellow

if (Test-Path "$rootPath\profiling_output") {
  # Keep the directory but clean contents older than 7 days
  Get-ChildItem -Path "$rootPath\profiling_output" -File -Recurse |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
  ForEach-Object {
    Remove-ItemSafe -Path $_.FullName -Type "File"
  }
}

# ============================================
# PHASE 6: TEST ARTIFACTS
# ============================================
Write-Host "`n🧪 PHASE 6: Cleaning test artifacts..." -ForegroundColor Yellow

$testDirs = @(
  "$rootPath\test-results",
  "$rootPath\coverage",
  "$rootPath\.jest-cache",
  "$rootPath\playwright-report"
)

foreach ($dir in $testDirs) {
  if (Test-Path $dir) {
    Remove-ItemSafe -Path $dir -Type "Directory"
  }
}

# ============================================
# PHASE 7: DUPLICATE DOCUMENTATION
# ============================================
Write-Host "`n📄 PHASE 7: Removing duplicate documentation..." -ForegroundColor Yellow

# Check for duplicates between root and docs folder
if (Test-Path "$rootPath\docs") {
  $rootMdFiles = Get-ChildItem -Path $rootPath -Filter "*.md" -File | Select-Object Name, FullName
  $docsMdFiles = Get-ChildItem -Path "$rootPath\docs" -Filter "*.md" -File -Recurse | Select-Object Name, FullName

  foreach ($rootFile in $rootMdFiles) {
    $duplicate = $docsMdFiles | Where-Object { $_.Name -eq $rootFile.Name }
    if ($duplicate -and $rootFile.Name -ne "README.md") {
      # Keep docs version, remove root version
      Remove-ItemSafe -Path $rootFile.FullName -Type "File"
    }
  }
}

# ============================================
# PHASE 8: EMPTY DIRECTORIES
# ============================================
Write-Host "`n📁 PHASE 8: Removing empty directories..." -ForegroundColor Yellow

Get-ChildItem -Path $rootPath -Directory -Recurse |
Where-Object {
  $_.FullName -notlike "*node_modules\*" -and
  $_.FullName -notlike "*.git\*" -and
  (Get-ChildItem -Path $_.FullName -Recurse -File).Count -eq 0
} |
Sort-Object -Property FullName -Descending |
ForEach-Object {
  Remove-ItemSafe -Path $_.FullName -Type "Directory"
}

# ============================================
# FINAL REPORT
# ============================================
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "✨ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files Deleted:       $deletedFiles" -ForegroundColor White
Write-Host "Directories Deleted: $deletedDirs" -ForegroundColor White
Write-Host "Space Freed:         $([math]::Round($freedSpace/1MB, 2)) MB" -ForegroundColor White
Write-Host ""
Write-Host "🌾 Repository is now clean and optimized!" -ForegroundColor Green
Write-Host ""

# Create completion marker
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
@"
# DEEP CLEANUP COMPLETED
**Timestamp:** $timestamp
**Files Deleted:** $deletedFiles
**Directories Deleted:** $deletedDirs
**Space Freed:** $([math]::Round($freedSpace/1MB, 2)) MB

## Cleanup Actions Performed:
1. ✓ Removed all log files and temporary files
2. ✓ Cleaned build artifacts and cache directories
3. ✓ Removed old cleanup reports and archives
4. ✓ Cleaned JSON analysis reports
5. ✓ Cleaned old profiling data (>7 days)
6. ✓ Removed test artifacts
7. ✓ Removed duplicate documentation
8. ✓ Removed empty directories

**Agricultural Consciousness:** PRESERVED ✨
"@ | Out-File "$rootPath\LAST_CLEANUP_$timestamp.md"

Write-Host "Report saved: LAST_CLEANUP_$timestamp.md" -ForegroundColor Cyan
