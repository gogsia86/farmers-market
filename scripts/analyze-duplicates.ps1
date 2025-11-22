#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Advanced Duplicate File Analysis Script with Hash-Based Detection

.DESCRIPTION
    Analyzes files in the repository to find exact duplicates based on content hashing.
    Generates detailed reports including size savings and provides safe removal recommendations.

.PARAMETER RepoRoot
    The root directory of the repository to analyze

.PARAMETER MinFileSize
    Minimum file size in bytes to consider (default: 1KB to skip tiny files)

.PARAMETER OutputJson
    Path to save JSON analysis report

.PARAMETER OutputMarkdown
    Path to save Markdown analysis report

.PARAMETER ExcludePatterns
    Array of patterns to exclude from analysis

.EXAMPLE
    .\scripts\analyze-duplicates.ps1

.EXAMPLE
    .\scripts\analyze-duplicates.ps1 -MinFileSize 10KB -OutputJson "duplicates.json"
#>

param(
  [string]$RepoRoot = "m:\Repo\Farmers Market Platform web and app",
  [int]$MinFileSize = 1024,  # 1KB minimum
  [string]$OutputJson = "",
  [string]$OutputMarkdown = "",
  [string[]]$ExcludePatterns = @(
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    "coverage",
    "*.lock",
    "*.log"
  )
)

$ErrorActionPreference = "Stop"

Write-Host "🔍 Advanced Duplicate File Analysis" -ForegroundColor Cyan
Write-Host "Repository: $RepoRoot" -ForegroundColor Gray
Write-Host ""

# Initialize analysis structures
$fileHashes = @{}
$duplicateGroups = @()
$totalFiles = 0
$totalSize = 0
$duplicateSize = 0
$analysisStartTime = Get-Date

function Get-FileHashMD5 {
  param([string]$FilePath)

  try {
    $hash = Get-FileHash -Path $FilePath -Algorithm MD5 -ErrorAction Stop
    return $hash.Hash
  }
  catch {
    Write-Warning "Failed to hash: $FilePath - $($_.Exception.Message)"
    return $null
  }
}

function Should-ExcludeFile {
  param([string]$FilePath)

  foreach ($pattern in $ExcludePatterns) {
    if ($FilePath -like "*$pattern*") {
      return $true
    }
  }
  return $false
}

function Format-FileSize {
  param([long]$Bytes)

  if ($Bytes -ge 1GB) {
    return "{0:N2} GB" -f ($Bytes / 1GB)
  }
  elseif ($Bytes -ge 1MB) {
    return "{0:N2} MB" -f ($Bytes / 1MB)
  }
  elseif ($Bytes -ge 1KB) {
    return "{0:N2} KB" -f ($Bytes / 1KB)
  }
  else {
    return "$Bytes bytes"
  }
}

Write-Host "📊 Phase 1: Scanning files..." -ForegroundColor Yellow

# Get all files recursively
$allFiles = Get-ChildItem -Path $RepoRoot -File -Recurse -ErrorAction SilentlyContinue |
Where-Object {
  $_.Length -ge $MinFileSize -and
  -not (Should-ExcludeFile $_.FullName)
}

$totalFiles = $allFiles.Count
Write-Host "Found $totalFiles files to analyze" -ForegroundColor Green
Write-Host ""

Write-Host "🔐 Phase 2: Computing file hashes..." -ForegroundColor Yellow

$progress = 0
foreach ($file in $allFiles) {
  $progress++

  if ($progress % 100 -eq 0) {
    $percent = [math]::Round(($progress / $totalFiles) * 100, 1)
    Write-Host "  Progress: $progress/$totalFiles ($percent%)" -ForegroundColor Gray
  }

  $hash = Get-FileHashMD5 -FilePath $file.FullName

  if ($hash) {
    if (-not $fileHashes.ContainsKey($hash)) {
      $fileHashes[$hash] = @()
    }

    $fileHashes[$hash] += @{
      Path         = $file.FullName
      RelativePath = $file.FullName.Replace($RepoRoot, "").TrimStart('\', '/')
      Size         = $file.Length
      LastModified = $file.LastWriteTime
      Extension    = $file.Extension
      Directory    = $file.DirectoryName
    }

    $totalSize += $file.Length
  }
}

Write-Host "✅ Hashing complete" -ForegroundColor Green
Write-Host ""

Write-Host "🔎 Phase 3: Identifying duplicates..." -ForegroundColor Yellow

# Find duplicate groups (hashes with 2+ files)
foreach ($hash in $fileHashes.Keys) {
  $files = $fileHashes[$hash]

  if ($files.Count -gt 1) {
    # Sort by last modified (oldest first)
    $sortedFiles = $files | Sort-Object -Property LastModified

    $original = $sortedFiles[0]
    $duplicates = $sortedFiles[1..($sortedFiles.Count - 1)]

    $groupSize = $original.Size
    $duplicateCount = $duplicates.Count
    $wastedSpace = $groupSize * $duplicateCount

    $duplicateSize += $wastedSpace

    $duplicateGroups += @{
      Hash           = $hash
      FileSize       = $groupSize
      DuplicateCount = $duplicateCount
      WastedSpace    = $wastedSpace
      Original       = $original
      Duplicates     = $duplicates
      FileType       = $original.Extension
    }
  }
}

# Sort duplicate groups by wasted space (largest first)
$duplicateGroups = $duplicateGroups | Sort-Object -Property WastedSpace -Descending

Write-Host "Found $($duplicateGroups.Count) duplicate file groups" -ForegroundColor Green
Write-Host ""

# Generate analysis report
$analysisEndTime = Get-Date
$analysisDuration = $analysisEndTime - $analysisStartTime

$report = @{
  GeneratedAt      = $analysisEndTime.ToString("yyyy-MM-dd HH:mm:ss")
  AnalysisDuration = $analysisDuration.TotalSeconds
  Repository       = $RepoRoot
  Statistics       = @{
    TotalFilesScanned              = $totalFiles
    TotalSize                      = $totalSize
    TotalSizeFormatted             = Format-FileSize -Bytes $totalSize
    DuplicateGroups                = $duplicateGroups.Count
    TotalDuplicateFiles            = ($duplicateGroups | ForEach-Object { $_.DuplicateCount } | Measure-Object -Sum).Sum
    PotentialSpaceSavings          = $duplicateSize
    PotentialSpaceSavingsFormatted = Format-FileSize -Bytes $duplicateSize
    SavingsPercentage              = if ($totalSize -gt 0) { [math]::Round(($duplicateSize / $totalSize) * 100, 2) } else { 0 }
  }
  DuplicateGroups  = $duplicateGroups
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 DUPLICATE ANALYSIS REPORT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Files Scanned:        $totalFiles" -ForegroundColor White
Write-Host "Total Repository Size:      $(Format-FileSize -Bytes $totalSize)" -ForegroundColor White
Write-Host "Duplicate File Groups:      $($duplicateGroups.Count)" -ForegroundColor Yellow
Write-Host "Total Duplicate Files:      $($report.Statistics.TotalDuplicateFiles)" -ForegroundColor Yellow
Write-Host "Potential Space Savings:    $(Format-FileSize -Bytes $duplicateSize)" -ForegroundColor Green
Write-Host "Savings Percentage:         $($report.Statistics.SavingsPercentage)%" -ForegroundColor Green
Write-Host ""

# Show top 10 duplicate groups
Write-Host "🎯 Top 10 Duplicate Groups (by wasted space):" -ForegroundColor Yellow
Write-Host ""

$topGroups = $duplicateGroups | Select-Object -First 10
$groupNum = 1

foreach ($group in $topGroups) {
  Write-Host "Group #$groupNum - $($group.FileType) files" -ForegroundColor Cyan
  Write-Host "  Size per file:    $(Format-FileSize -Bytes $group.FileSize)" -ForegroundColor Gray
  Write-Host "  Duplicate count:  $($group.DuplicateCount)" -ForegroundColor Gray
  Write-Host "  Wasted space:     $(Format-FileSize -Bytes $group.WastedSpace)" -ForegroundColor Red
  Write-Host ""
  Write-Host "  📁 Original (keep):" -ForegroundColor Green
  Write-Host "     $($group.Original.RelativePath)" -ForegroundColor White
  Write-Host "     Modified: $($group.Original.LastModified)" -ForegroundColor Gray
  Write-Host ""
  Write-Host "  🗑️  Duplicates (can remove):" -ForegroundColor Red
  foreach ($dup in $group.Duplicates) {
    Write-Host "     $($dup.RelativePath)" -ForegroundColor White
    Write-Host "     Modified: $($dup.LastModified)" -ForegroundColor Gray
  }
  Write-Host ""

  $groupNum++
}

# Save JSON report if requested
if ($OutputJson) {
  $jsonPath = if ([System.IO.Path]::IsPathRooted($OutputJson)) {
    $OutputJson
  }
  else {
    Join-Path $RepoRoot $OutputJson
  }

  $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8
  Write-Host "💾 JSON report saved: $jsonPath" -ForegroundColor Green
}
else {
  # Default JSON output
  $defaultJsonPath = Join-Path $RepoRoot "duplicate-analysis.json"
  $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $defaultJsonPath -Encoding UTF8
  Write-Host "💾 JSON report saved: $defaultJsonPath" -ForegroundColor Green
}

# Save Markdown report if requested
if ($OutputMarkdown) {
  $mdPath = if ([System.IO.Path]::IsPathRooted($OutputMarkdown)) {
    $OutputMarkdown
  }
  else {
    Join-Path $RepoRoot $OutputMarkdown
  }

  $mdContent = @"
# 🔍 Duplicate File Analysis Report

**Generated:** $($report.GeneratedAt)
**Repository:** $($report.Repository)
**Analysis Duration:** $($report.AnalysisDuration.ToString("F2")) seconds

---

## 📊 Summary Statistics

| Metric | Value |
|--------|-------|
| Total Files Scanned | $($report.Statistics.TotalFilesScanned) |
| Total Repository Size | $($report.Statistics.TotalSizeFormatted) |
| Duplicate File Groups | $($report.Statistics.DuplicateGroups) |
| Total Duplicate Files | $($report.Statistics.TotalDuplicateFiles) |
| **Potential Space Savings** | **$($report.Statistics.PotentialSpaceSavingsFormatted)** |
| Savings Percentage | $($report.Statistics.SavingsPercentage)% |

---

## 🎯 Top Duplicate Groups

"@

  $groupNum = 1
  foreach ($group in $topGroups) {
    $mdContent += @"

### Group #$groupNum - $($group.FileType) Files

**File Size:** $(Format-FileSize -Bytes $group.FileSize)
**Duplicate Count:** $($group.DuplicateCount)
**Wasted Space:** $(Format-FileSize -Bytes $group.WastedSpace)

#### 📁 Original (Keep)
``````
$($group.Original.RelativePath)
``````
*Last Modified: $($group.Original.LastModified)*

#### 🗑️ Duplicates (Can Remove)
"@

    foreach ($dup in $group.Duplicates) {
      $mdContent += @"

``````
$($dup.RelativePath)
``````
*Last Modified: $($dup.LastModified)*
"@
    }

    $mdContent += "`n"
    $groupNum++
  }

  $mdContent | Out-File -FilePath $mdPath -Encoding UTF8
  Write-Host "📝 Markdown report saved: $mdPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Analysis Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review the duplicate groups above" -ForegroundColor White
Write-Host "2. Check the JSON/Markdown reports for full details" -ForegroundColor White
Write-Host "3. Manually review files before deleting" -ForegroundColor White
Write-Host "4. Use Remove-Item to delete confirmed duplicates" -ForegroundColor White
Write-Host ""

# Return report object for scripting
return $report
