#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Phase 1: Safe Archive - Repository Restructure Script

.DESCRIPTION
    Safely archives historical documents without deleting anything.
    This is the first phase of the repository restructure plan.

    What this script does:
    - Creates archive directory structure
    - Moves historical status reports to archives
    - Moves phase documents to archives
    - Moves cleanup reports to archives
    - Creates README files in archive directories
    - Commits changes to git

    SAFE: No files are deleted, only moved. Fully reversible with git.

.PARAMETER DryRun
    If specified, shows what would be done without actually doing it.

.PARAMETER NoCommit
    If specified, performs the restructure but doesn't commit to git.

.EXAMPLE
    .\restructure-phase1-archive.ps1
    Runs the full Phase 1 archive process

.EXAMPLE
    .\restructure-phase1-archive.ps1 -DryRun
    Shows what would be done without making changes

.EXAMPLE
    .\restructure-phase1-archive.ps1 -NoCommit
    Makes changes but doesn't commit to git

.NOTES
    Author: Farmers Market Platform Team
    Date: November 27, 2025
    Version: 1.0.0
    Risk Level: LOW (only moves files, no deletion)
    Estimated Time: 5-10 minutes
#>

[CmdletBinding()]
param(
    [Parameter()]
    [switch]$DryRun,

    [Parameter()]
    [switch]$NoCommit
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ArchiveRoot = Join-Path $RepoRoot "docs/09-archives"

# Colors for output
$ColorSuccess = "Green"
$ColorWarning = "Yellow"
$ColorInfo = "Cyan"
$ColorError = "Red"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $ColorInfo
    Write-Host "  $Message" -ForegroundColor $ColorInfo
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $ColorInfo
    Write-Host ""
}

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor $ColorInfo
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✅ $Message" -ForegroundColor $ColorSuccess
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  ⚠️  $Message" -ForegroundColor $ColorWarning
}

function Write-Info {
    param([string]$Message)
    Write-Host "  ℹ️  $Message" -ForegroundColor $ColorInfo
}

function Move-FileToArchive {
    param(
        [string]$SourcePath,
        [string]$DestinationPath,
        [switch]$DryRun
    )

    $sourceName = Split-Path $SourcePath -Leaf

    if (-not (Test-Path $SourcePath)) {
        Write-Warning "Source not found: $sourceName (skipping)"
        return $false
    }

    if ($DryRun) {
        Write-Info "[DRY RUN] Would move: $sourceName → $(Split-Path $DestinationPath -Leaf)"
        return $true
    }

    try {
        $destDir = Split-Path $DestinationPath -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }

        Move-Item -Path $SourcePath -Destination $DestinationPath -Force
        Write-Success "Moved: $sourceName"
        return $true
    }
    catch {
        Write-Warning "Failed to move $sourceName : $_"
        return $false
    }
}

function Create-ArchiveReadme {
    param(
        [string]$Path,
        [string]$Title,
        [string]$Description,
        [switch]$DryRun
    )

    if ($DryRun) {
        Write-Info "[DRY RUN] Would create README: $Path"
        return
    }

    $readmePath = Join-Path $Path "README.md"

    $content = @"
# $Title

$Description

## Archive Date

Documents archived: $(Get-Date -Format "MMMM dd, yyyy")

## Purpose

This directory contains historical documents that are no longer actively used but are kept for reference and historical purposes.

## Organization

Documents in this archive are organized by:
- Type (reports, phases, cleanup, etc.)
- Date of archival
- Original location

## Access

These documents are read-only. If you need to reference historical information, you can find it here. For current documentation, see the main `/docs/` directory.

## Maintenance

- Documents here should not be modified
- If a document is needed again, copy (don't move) it to the appropriate location
- Periodically review (every 6 months) for documents that can be permanently deleted

---

*Archived as part of Repository Restructure Phase 1 - November 2025*
"@

    try {
        Set-Content -Path $readmePath -Value $content -Encoding UTF8
        Write-Success "Created README: $(Split-Path $Path -Leaf)/README.md"
    }
    catch {
        Write-Warning "Failed to create README at $Path : $_"
    }
}

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================

Write-Header "PHASE 1: SAFE ARCHIVE - REPOSITORY RESTRUCTURE"

Write-Step "Running pre-flight checks..."

# Check if we're in the right directory
if (-not (Test-Path (Join-Path $RepoRoot "package.json"))) {
    Write-Host "❌ Error: Not in repository root directory!" -ForegroundColor $ColorError
    Write-Host "   Current: $RepoRoot" -ForegroundColor $ColorError
    Write-Host "   Please run this script from the repository root." -ForegroundColor $ColorError
    exit 1
}
Write-Success "Repository root confirmed"

# Check if git is available
try {
    $gitVersion = git --version 2>&1
    Write-Success "Git available: $gitVersion"
}
catch {
    Write-Warning "Git not available - will skip commit step"
    $NoCommit = $true
}

# Check for uncommitted changes
if (-not $DryRun) {
    try {
        $gitStatus = git status --porcelain 2>&1
        if ($gitStatus) {
            Write-Warning "You have uncommitted changes."
            Write-Info "It's recommended to commit or stash changes before restructuring."
            $response = Read-Host "Continue anyway? (y/N)"
            if ($response -ne 'y' -and $response -ne 'Y') {
                Write-Host "Aborted by user." -ForegroundColor $ColorWarning
                exit 0
            }
        }
    }
    catch {
        Write-Warning "Could not check git status"
    }
}

Write-Success "Pre-flight checks complete"
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor $ColorWarning
    Write-Host ""
}

# ============================================================================
# STEP 1: CREATE ARCHIVE DIRECTORY STRUCTURE
# ============================================================================

Write-Header "STEP 1: Creating Archive Directory Structure"

$archiveDirectories = @(
    "$ArchiveRoot",
    "$ArchiveRoot/reports",
    "$ArchiveRoot/reports/cleanup",
    "$ArchiveRoot/reports/optimization",
    "$ArchiveRoot/reports/status",
    "$ArchiveRoot/phases",
    "$ArchiveRoot/deprecated"
)

foreach ($dir in $archiveDirectories) {
    if ($DryRun) {
        Write-Info "[DRY RUN] Would create directory: $dir"
    }
    else {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Success "Created: $dir"
        }
        else {
            Write-Info "Already exists: $dir"
        }
    }
}

Write-Host ""

# ============================================================================
# STEP 2: MOVE STATUS REPORTS TO ARCHIVES
# ============================================================================

Write-Header "STEP 2: Archiving Status Reports"

$statusReports = @(
    @{
        Source = "100-PERCENT-READY.md"
        Dest = "reports/status/production-ready-certificate.md"
    },
    @{
        Source = "ACTION-NOW.md"
        Dest = "reports/status/action-now-archive.md"
    },
    @{
        Source = "PRODUCTION-READY-STATUS.md"
        Dest = "reports/status/production-status-archive.md"
    },
    @{
        Source = "READY-TO-DEPLOY.md"
        Dest = "reports/status/deployment-ready-archive.md"
    },
    @{
        Source = "OPTIMIZATION-PROGRESS.md"
        Dest = "reports/optimization/optimization-progress-archive.md"
    },
    @{
        Source = "PROJECT_REVIEW_SUMMARY.md"
        Dest = "reports/status/project-review-archive.md"
    }
)

$movedCount = 0
foreach ($report in $statusReports) {
    $sourcePath = Join-Path $RepoRoot $report.Source
    $destPath = Join-Path $ArchiveRoot $report.Dest

    if (Move-FileToArchive -SourcePath $sourcePath -DestinationPath $destPath -DryRun:$DryRun) {
        $movedCount++
    }
}

Write-Host ""
Write-Info "Archived $movedCount status report(s)"
Write-Host ""

# ============================================================================
# STEP 3: MOVE CLEANUP REPORTS TO ARCHIVES
# ============================================================================

Write-Header "STEP 3: Archiving Cleanup Reports"

$cleanupReports = @(
    @{
        Source = "CLEANUP_REPORT.md"
        Dest = "reports/cleanup/cleanup-report-archive.md"
    },
    @{
        Source = "CLEANUP_SUMMARY.md"
        Dest = "reports/cleanup/cleanup-summary-archive.md"
    },
    @{
        Source = "POST_CLEANUP_GUIDE.md"
        Dest = "reports/cleanup/post-cleanup-guide-archive.md"
    }
)

$movedCount = 0
foreach ($report in $cleanupReports) {
    $sourcePath = Join-Path $RepoRoot $report.Source
    $destPath = Join-Path $ArchiveRoot $report.Dest

    if (Move-FileToArchive -SourcePath $sourcePath -DestinationPath $destPath -DryRun:$DryRun) {
        $movedCount++
    }
}

Write-Host ""
Write-Info "Archived $movedCount cleanup report(s)"
Write-Host ""

# ============================================================================
# STEP 4: MOVE PHASE DOCUMENTS TO ARCHIVES
# ============================================================================

Write-Header "STEP 4: Archiving Phase Documents"

# Find all phase documents in docs directory
$docsPath = Join-Path $RepoRoot "docs"
$phaseFiles = Get-ChildItem -Path $docsPath -Filter "*PHASE*.md" -Recurse -File -ErrorAction SilentlyContinue

$movedCount = 0
if ($phaseFiles) {
    foreach ($file in $phaseFiles) {
        $relativePath = $file.FullName.Substring($docsPath.Length + 1)
        $destPath = Join-Path "$ArchiveRoot/phases" $file.Name

        if (Move-FileToArchive -SourcePath $file.FullName -DestinationPath $destPath -DryRun:$DryRun) {
            $movedCount++
        }
    }
}
else {
    Write-Info "No phase documents found in docs directory"
}

Write-Host ""
Write-Info "Archived $movedCount phase document(s)"
Write-Host ""

# ============================================================================
# STEP 5: CREATE README FILES IN ARCHIVE DIRECTORIES
# ============================================================================

Write-Header "STEP 5: Creating Archive README Files"

# Main archive README
Create-ArchiveReadme `
    -Path $ArchiveRoot `
    -Title "Archives - Historical Documents" `
    -Description "This directory contains historical documents from the Farmers Market Platform project that are no longer actively used but kept for reference." `
    -DryRun:$DryRun

# Reports archive README
Create-ArchiveReadme `
    -Path "$ArchiveRoot/reports" `
    -Title "Archived Reports" `
    -Description "Historical status reports, cleanup reports, and project reviews." `
    -DryRun:$DryRun

# Phases archive README
Create-ArchiveReadme `
    -Path "$ArchiveRoot/phases" `
    -Title "Phase Documents Archive" `
    -Description "Documents from various project phases (Phase 1-5) that tracked development progress." `
    -DryRun:$DryRun

Write-Host ""

# ============================================================================
# STEP 6: CREATE ARCHIVE INDEX
# ============================================================================

Write-Header "STEP 6: Creating Archive Index"

if (-not $DryRun) {
    $indexPath = Join-Path $ArchiveRoot "INDEX.md"

    $indexContent = @"
# Archive Index

Complete index of archived documents organized by category.

## 📊 Status Reports

Historical status reports from project milestones:

- [Production Ready Certificate](./reports/status/production-ready-certificate.md)
- [Production Status Archive](./reports/status/production-status-archive.md)
- [Deployment Ready Archive](./reports/status/deployment-ready-archive.md)
- [Action Now Archive](./reports/status/action-now-archive.md)
- [Project Review Archive](./reports/status/project-review-archive.md)

## 🧹 Cleanup Reports

Repository cleanup and maintenance reports:

- [Cleanup Report Archive](./reports/cleanup/cleanup-report-archive.md)
- [Cleanup Summary Archive](./reports/cleanup/cleanup-summary-archive.md)
- [Post Cleanup Guide Archive](./reports/cleanup/post-cleanup-guide-archive.md)

## ⚡ Optimization Reports

Performance and optimization documentation:

- [Optimization Progress Archive](./reports/optimization/optimization-progress-archive.md)

## 📅 Phase Documents

Project phase documentation (Phase 1-5):

$(if (Test-Path "$ArchiveRoot/phases") {
    Get-ChildItem "$ArchiveRoot/phases" -Filter "*.md" | ForEach-Object {
        "- [$($_.BaseName)](.\/phases\/$($_.Name))"
    }
} else {
    "No phase documents archived yet."
})

## 📝 Notes

- All documents are read-only historical references
- Last updated: $(Get-Date -Format "MMMM dd, yyyy HH:mm")
- Archived as part of Repository Restructure Phase 1

## 🔍 Search Tips

To find specific information in archived documents:

\`\`\`bash
# Search all archived documents
grep -r "search term" docs/09-archives/

# Find documents modified in a specific timeframe
find docs/09-archives/ -name "*.md" -mtime -30
\`\`\`

---

*For current documentation, see [/docs/README.md](../README.md)*
"@

    try {
        Set-Content -Path $indexPath -Value $indexContent -Encoding UTF8
        Write-Success "Created archive index: INDEX.md"
    }
    catch {
        Write-Warning "Failed to create archive index: $_"
    }
}
else {
    Write-Info "[DRY RUN] Would create archive INDEX.md"
}

Write-Host ""

# ============================================================================
# STEP 7: SUMMARY AND STATISTICS
# ============================================================================

Write-Header "SUMMARY"

if (-not $DryRun) {
    $totalFiles = (Get-ChildItem -Path $ArchiveRoot -Recurse -File -Filter "*.md" -ErrorAction SilentlyContinue).Count
    $totalDirs = (Get-ChildItem -Path $ArchiveRoot -Recurse -Directory -ErrorAction SilentlyContinue).Count

    Write-Success "Archive structure created successfully"
    Write-Info "Total archived files: $totalFiles"
    Write-Info "Total archive directories: $totalDirs"
}
else {
    Write-Info "This was a dry run - no changes were made"
}

Write-Host ""

# ============================================================================
# STEP 8: GIT COMMIT (OPTIONAL)
# ============================================================================

if (-not $NoCommit -and -not $DryRun) {
    Write-Header "STEP 8: Git Commit"

    $response = Read-Host "Would you like to commit these changes to git? (Y/n)"

    if ($response -ne 'n' -and $response -ne 'N') {
        try {
            Write-Step "Staging changes..."
            git add docs/09-archives/

            # Stage deleted files from root
            git add -u .

            Write-Step "Creating commit..."
            git commit -m "docs: Phase 1 - Archive historical documents and reports

- Created archive directory structure (docs/09-archives/)
- Moved status reports to archives/reports/status/
- Moved cleanup reports to archives/reports/cleanup/
- Moved optimization reports to archives/reports/optimization/
- Moved phase documents to archives/phases/
- Created README files in archive directories
- Created archive index for easy navigation

Part of repository restructure plan.
See: REPOSITORY-ANALYSIS-RESTRUCTURE.md

Risk: LOW (only moved files, no deletion)
Reversible: Yes (git revert)"

            Write-Success "Changes committed successfully!"
            Write-Host ""
            Write-Info "Commit message:"
            Write-Host "  docs: Phase 1 - Archive historical documents and reports" -ForegroundColor $ColorInfo
        }
        catch {
            Write-Warning "Git commit failed: $_"
            Write-Info "You can manually commit the changes later."
        }
    }
    else {
        Write-Info "Skipping git commit. Remember to commit manually!"
    }
}
elseif ($DryRun) {
    Write-Info "[DRY RUN] Git commit would be performed here"
}
else {
    Write-Info "Skipping git commit (use -NoCommit parameter to prevent this)"
}

# ============================================================================
# COMPLETION
# ============================================================================

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $ColorSuccess
Write-Host "  ✅ PHASE 1 COMPLETE: Safe Archive" -ForegroundColor $ColorSuccess
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $ColorSuccess
Write-Host ""

if (-not $DryRun) {
    Write-Host "✨ Results:" -ForegroundColor $ColorSuccess
    Write-Host "  • Archive structure created at: docs/09-archives/" -ForegroundColor $ColorSuccess
    Write-Host "  • Historical documents safely archived" -ForegroundColor $ColorSuccess
    Write-Host "  • README files created for navigation" -ForegroundColor $ColorSuccess
    Write-Host "  • Archive index created" -ForegroundColor $ColorSuccess
    Write-Host ""
    Write-Host "📂 Archive Location:" -ForegroundColor $ColorInfo
    Write-Host "  $ArchiveRoot" -ForegroundColor $ColorInfo
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor $ColorInfo
    Write-Host "  1. Review the archived documents: docs/09-archives/" -ForegroundColor $ColorInfo
    Write-Host "  2. Verify everything is in the right place" -ForegroundColor $ColorInfo
    Write-Host "  3. Run Phase 2: Documentation Restructure (when ready)" -ForegroundColor $ColorInfo
    Write-Host "  4. See REPOSITORY-ANALYSIS-RESTRUCTURE.md for full plan" -ForegroundColor $ColorInfo
}
else {
    Write-Host "🔍 This was a dry run!" -ForegroundColor $ColorWarning
    Write-Host "  To actually perform the changes, run without -DryRun parameter:" -ForegroundColor $ColorWarning
    Write-Host "  .\restructure-phase1-archive.ps1" -ForegroundColor $ColorWarning
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $ColorSuccess
Write-Host ""

# ============================================================================
# EXIT
# ============================================================================

exit 0
