#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Repository Cleanup Script - Safe and Comprehensive

.DESCRIPTION
    Cleans temporary files, consolidates documentation, and organizes repository structure.
    Creates backup before any destructive operations.

.PARAMETER DryRun
    Preview changes without executing them

.PARAMETER Force
    Skip backup creation (use with caution)

.EXAMPLE
    .\clean-repository.ps1 -DryRun
    .\clean-repository.ps1
    .\clean-repository.ps1 -Force
#>

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$BackupDate = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = Join-Path $RepoRoot "archive\cleanup-backup-$BackupDate"
$LogFile = Join-Path $RepoRoot "cleanup-log-$BackupDate.txt"

$Stats = @{
    FilesRemoved = 0
    SizeSaved = 0
    FilesArchived = 0
    DirectoriesCreated = 0
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")

    $timestamp = Get-Date -Format "HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"

    try {
        Add-Content -Path $LogFile -Value $logEntry -ErrorAction SilentlyContinue
    } catch {
        # Ignore file lock errors for logging
    }

    switch ($Level) {
        "SUCCESS" { Write-Host "[OK] $Message" -ForegroundColor Green }
        "WARNING" { Write-Host "[WARN] $Message" -ForegroundColor Yellow }
        "ERROR" { Write-Host "[ERROR] $Message" -ForegroundColor Red }
        default { Write-Host "[INFO] $Message" -ForegroundColor Gray }
    }
}

function Remove-SafeFile {
    param([string]$FilePath, [string]$Reason)

    if (-not (Test-Path $FilePath)) {
        return $false
    }

    $fileSize = (Get-Item $FilePath).Length
    $relativePath = $FilePath.Replace($RepoRoot, "").TrimStart('\', '/')

    Write-Log "Removing: $relativePath - $Reason"

    if (-not $DryRun) {
        if (-not $Force) {
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
        return $true
    }

    return $true
}

function Remove-SafeDirectory {
    param([string]$DirPath, [string]$Reason)

    if (-not (Test-Path $DirPath)) {
        return $false
    }

    $relativePath = $DirPath.Replace($RepoRoot, "").TrimStart('\', '/')
    Write-Log "Removing directory: $relativePath - $Reason"

    if (-not $DryRun) {
        if (-not $Force) {
            $backupPath = Join-Path $BackupDir $relativePath
            Copy-Item $DirPath $backupPath -Recurse -Force
        }

        Remove-Item $DirPath -Recurse -Force
        $Stats.FilesRemoved++
        return $true
    }

    return $true
}

# Header
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " FARMERS MARKET PLATFORM - REPOSITORY CLEANUP" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Date: $BackupDate" -ForegroundColor Gray
Write-Host "Mode: $(if ($DryRun) { 'DRY RUN (Preview)' } else { 'LIVE CLEANUP' })" -ForegroundColor $(if ($DryRun) { 'Yellow' } else { 'Green' })
Write-Host "Backup: $(if ($Force) { 'DISABLED' } else { 'ENABLED' })" -ForegroundColor $(if ($Force) { 'Red' } else { 'Green' })
Write-Host ""

if (-not $Force -and -not $DryRun) {
    Write-Log "Creating backup directory: $BackupDir"
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# PHASE 1: Remove temporary log files
Write-Host "[PHASE 1] Removing temporary log files..." -ForegroundColor Cyan

$logFiles = @(
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
    "coverage-summary.txt",
    "npm-install-debug.log",
    "gpu-install-log.txt",
    "typescript-errors.txt"
)

foreach ($file in $logFiles) {
    Remove-SafeFile (Join-Path $RepoRoot $file) "Temporary log file" | Out-Null
}

# PHASE 2: Clean build artifacts and cache
Write-Host ""
Write-Host "[PHASE 2] Cleaning build artifacts and cache..." -ForegroundColor Cyan

$buildDirs = @(
    ".next",
    ".jest-cache",
    "coverage",
    "playwright-report",
    "test-results"
)

foreach ($dir in $buildDirs) {
    $dirPath = Join-Path $RepoRoot $dir
    if (Test-Path $dirPath) {
        Write-Log "Cache directory found: $dir (will be regenerated)" "INFO"
    }
}

# PHASE 3: Remove duplicate documentation
Write-Host ""
Write-Host "[PHASE 3] Consolidating documentation..." -ForegroundColor Cyan

$archiveDir = Join-Path $RepoRoot "docs\archives\cleanup-$BackupDate"

if (-not (Test-Path $archiveDir) -and -not $DryRun) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
    $Stats.DirectoriesCreated++
}

$oldDocs = @(
    "CLEANUP_REPORT_*.md",
    "cursorrules-compliance-report.md",
    "analysis-duplicates.txt",
    "analysis-file-types.txt",
    "duplicate-analysis.json"
)

foreach ($pattern in $oldDocs) {
    $files = Get-ChildItem -Path $RepoRoot -Filter $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        Remove-SafeFile $file.FullName "Old report/analysis file" | Out-Null
    }
}

# PHASE 4: Clean temporary scripts
Write-Host ""
Write-Host "[PHASE 4] Organizing temporary scripts..." -ForegroundColor Cyan

$tempScripts = @(
    "comprehensive-cleanup.ps1",
    "FINAL_CLEANUP.ps1"
)

foreach ($script in $tempScripts) {
    Remove-SafeFile (Join-Path $RepoRoot $script) "Obsolete cleanup script" | Out-Null
}

# PHASE 5: Remove backup files
Write-Host ""
Write-Host "[PHASE 5] Removing backup files..." -ForegroundColor Cyan

$backupFiles = @(
    "instrumentation.ts.bak",
    "test-diagnostic.mjs",
    "test-quick-diagnostic.js",
    "cleanup-backup-list-*.txt",
    "cleanup-log-*.txt"
)

foreach ($pattern in $backupFiles) {
    $files = Get-ChildItem -Path $RepoRoot -Filter $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        # Skip the current log file
        if ($file.FullName -ne $LogFile -and $file.Name -ne (Split-Path $LogFile -Leaf)) {
            Remove-SafeFile $file.FullName "Old backup file" | Out-Null
        }
    }
}

# PHASE 6: Clean Visual Studio artifacts
Write-Host ""
Write-Host "[PHASE 6] Cleaning Visual Studio artifacts..." -ForegroundColor Cyan

$vsArtifacts = @(
    ".vs",
    "obj",
    "bin"
)

foreach ($dir in $vsArtifacts) {
    $dirPath = Join-Path $RepoRoot $dir
    if (Test-Path $dirPath) {
        Write-Log "Found Visual Studio artifact: $dir" "INFO"
        # Don't auto-remove these, just report
    }
}

# PHASE 7: Update .gitignore
Write-Host ""
Write-Host "[PHASE 7] Updating .gitignore..." -ForegroundColor Cyan

$gitignorePath = Join-Path $RepoRoot ".gitignore"
$gitignoreAdditions = @"

# === Cleanup Script Additions ===
# Temporary log files
*-output.txt
*-errors.txt
*-debug.log
*-full-output.txt
build-*.log
test-*.log
coverage-*.txt
cleanup-log-*.txt
cleanup-backup-list-*.txt

# Cleanup reports
CLEANUP_REPORT_*.md
cleanup-report-*.md

# Temporary scripts
*-cleanup.ps1

# Analysis reports
*_ANALYSIS.md
*_OPTIMIZATION_REPORT.md
cursorrules-compliance-report.md
analysis-*.txt
analysis-*.json

# Archive backups
archive/cleanup-backup-*/
archive/cleanup-*/
"@

if (-not $DryRun) {
    if (Test-Path $gitignorePath) {
        $currentContent = Get-Content $gitignorePath -Raw
        if ($currentContent -notlike "*Cleanup Script Additions*") {
            Add-Content -Path $gitignorePath -Value $gitignoreAdditions
            Write-Log ".gitignore updated" "SUCCESS"
        } else {
            Write-Log ".gitignore already contains cleanup patterns" "INFO"
        }
    }
}

# Summary
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files Removed:    $($Stats.FilesRemoved)" -ForegroundColor White
Write-Host "Space Saved:      $([math]::Round($Stats.SizeSaved / 1MB, 2)) MB" -ForegroundColor White
Write-Host "Files Archived:   $($Stats.FilesArchived)" -ForegroundColor White
Write-Host "Directories:      $($Stats.DirectoriesCreated) created" -ForegroundColor White
Write-Host ""

if ($DryRun) {
    Write-Host "[PREVIEW] This was a dry run. No files were modified." -ForegroundColor Yellow
    Write-Host "Run without -DryRun to execute cleanup." -ForegroundColor Yellow
} else {
    Write-Host "[COMPLETE] Cleanup executed successfully!" -ForegroundColor Green

    if (-not $Force) {
        Write-Host ""
        Write-Host "Backup Location: $BackupDir" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "To restore files:" -ForegroundColor Yellow
        Write-Host "  Copy-Item '$BackupDir\*' '$RepoRoot\' -Recurse -Force" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Log File: $LogFile" -ForegroundColor Cyan
Write-Host ""

# Recommendations
Write-Host "RECOMMENDED NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Review changes and test the application" -ForegroundColor Gray
Write-Host "  2. Run: npm run test" -ForegroundColor Gray
Write-Host "  3. Run: npm run build" -ForegroundColor Gray
Write-Host "  4. Commit changes: git add . && git commit -m 'chore: repository cleanup'" -ForegroundColor Gray
Write-Host ""

exit 0
