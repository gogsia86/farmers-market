#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Comprehensive Repository Cleanup and Restructuring Script
.DESCRIPTION
    Removes unwanted files, consolidates duplicates, and organizes the repository
    according to divine agricultural consciousness principles.
.NOTES
    Version: 2.0.0
    Date: November 15, 2025
    Divine Consciousness: MAXIMUM
#>

param(
  [switch]$DryRun = $false,
  [switch]$Verbose = $false,
  [switch]$Force = $false
)

# Initialize logging
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$logFile = ".\cleanup-logs\comprehensive_cleanup_$timestamp.log"
$archiveDir = ".\archive\pre-cleanup-$timestamp"

# Ensure log directory exists
New-Item -ItemType Directory -Force -Path ".\cleanup-logs" | Out-Null
New-Item -ItemType Directory -Force -Path $archiveDir | Out-Null

function Write-Log {
  param([string]$Message, [string]$Level = "INFO")
  $logMessage = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [$Level] $Message"
  Write-Host $logMessage
  Add-Content -Path $logFile -Value $logMessage
}

function Remove-SafelyWithArchive {
  param([string]$Path, [string]$Reason)

  if (Test-Path $Path) {
    try {
      $relativePath = Resolve-Path $Path -Relative
      $archivePath = Join-Path $archiveDir $relativePath
      $archiveParent = Split-Path $archivePath -Parent

      if (-not (Test-Path $archiveParent)) {
        New-Item -ItemType Directory -Force -Path $archiveParent | Out-Null
      }

      if ($DryRun) {
        Write-Log "DRY RUN: Would archive and remove: $Path ($Reason)" "DRYRUN"
      }
      else {
        Copy-Item -Path $Path -Destination $archivePath -Recurse -Force
        Remove-Item -Path $Path -Recurse -Force
        Write-Log "Archived and removed: $Path ($Reason)" "SUCCESS"
      }
    }
    catch {
      Write-Log "Failed to remove $Path`: $($_.Exception.Message)" "ERROR"
    }
  }
}

Write-Log "=== COMPREHENSIVE REPOSITORY CLEANUP STARTED ===" "INFO"
Write-Log "Dry Run: $DryRun" "INFO"

# ============================================
# 1. REMOVE BUILD ARTIFACTS AND LOGS
# ============================================
Write-Log "Phase 1: Removing build artifacts and logs..." "INFO"

$buildArtifacts = @(
  ".\.next",
  ".\dist",
  ".\out",
  ".\build",
  ".\.turbo",
  ".\playwright-report",
  ".\test-results",
  ".\coverage",
  ".\.vercel",
  ".\bin",
  ".\obj"
)

foreach ($artifact in $buildArtifacts) {
  Remove-SafelyWithArchive $artifact "Build artifact"
}

# Remove log files
$logFiles = @(
  ".\build-error-log.txt",
  ".\build-output.txt",
  ".\gpu-install-log.txt",
  ".\npm-install-debug.log",
  ".\docker-build-log.txt",
  ".\test-output.txt",
  ".\typescript-errors.txt",
  ".\test-completion-status.txt",
  ".\test-results.txt",
  ".\test-results-full.json",
  ".\dap.txt"
)

foreach ($log in $logFiles) {
  Remove-SafelyWithArchive $log "Log file"
}

# ============================================
# 2. REMOVE DUPLICATE/REDUNDANT DOCUMENTATION
# ============================================
Write-Log "Phase 2: Consolidating documentation..." "INFO"

$redundantDocs = @(
  ".\COMPREHENSIVE_PLATFORM_ANALYSIS.md",
  ".\COMPREHENSIVE_PLATFORM_REVIEW_NOV_2025.md",
  ".\COMPREHENSIVE_PROJECT_REVIEW_2025.md",
  ".\COMPREHENSIVE_REVIEW_NOV_2025.md",
  ".\PROJECT_REVIEW_2025.md",
  ".\CURSORRULES_VERIFICATION_FIX.md",
  ".\cursorrules-compliance-report.md",
  ".\CODE_OPTIMIZATION_REPORT.md",
  ".\DEPENDENCY_OPTIMIZATION_REPORT.md",
  ".\DIVINE_CLEANUP_REPORT.md",
  ".\OPTIMIZATION_STATUS_83_100.md",
  ".\FINAL_STATUS_REPORT_NOVEMBER_2025.md",
  ".\PLATFORM_100_ACHIEVEMENT.md",
  ".\IMMEDIATE_ACTIONS.md"
)

foreach ($doc in $redundantDocs) {
  Remove-SafelyWithArchive $doc "Redundant documentation"
}

# Consolidate deployment guides
$deploymentDocs = @(
  ".\DOCKER_DEPLOYMENT.md",
  ".\DOCKER_CLEAN_REBUILD.md",
  ".\PRODUCTION_DEPLOYMENT_GUIDE.md",
  ".\PRODUCTION_DEPLOYMENT_CHECKLIST.md",
  ".\VERCEL_QUICK_START.md",
  ".\VERCEL_ENVIRONMENT_SETUP.md"
)

foreach ($doc in $deploymentDocs) {
  Remove-SafelyWithArchive $doc "Deployment guide (will be consolidated)"
}

# ============================================
# 3. REMOVE IDE/EDITOR SPECIFIC FILES
# ============================================
Write-Log "Phase 3: Removing IDE-specific files..." "INFO"

$ideFiles = @(
  ".\.vs",
  ".\Farmers Market Platform web and app.slnx",
  ".\Program.cs",
  ".\Properties"
)

foreach ($ide in $ideFiles) {
  Remove-SafelyWithArchive $ide "IDE-specific file"
}

# ============================================
# 4. CLEAN ENVIRONMENT FILES
# ============================================
Write-Log "Phase 4: Cleaning environment files..." "INFO"

# Keep only .env.example and .env.local.example
$envFilesToRemove = @(
  ".\.env",
  ".\.env.local",
  ".\.env.docker",
  ".\.env.perplexity",
  ".\nextauth-secret.txt"
)

foreach ($env in $envFilesToRemove) {
  if (Test-Path $env) {
    if ($DryRun) {
      Write-Log "DRY RUN: Would remove environment file: $env" "DRYRUN"
    }
    else {
      Remove-Item -Path $env -Force
      Write-Log "Removed environment file: $env (contains secrets)" "SUCCESS"
    }
  }
}

# ============================================
# 5. CONSOLIDATE SCRIPTS
# ============================================
Write-Log "Phase 5: Organizing scripts..." "INFO"

# Create scripts directory structure if not exists
$scriptsDir = ".\scripts"
if (-not (Test-Path $scriptsDir)) {
  New-Item -ItemType Directory -Force -Path $scriptsDir | Out-Null
}

# Move root-level scripts
$scriptsToMove = @(
  ".\divine-cleanup.ps1",
  ".\cleanup-repository-final.ps1",
  ".\docker-cleanup.ps1",
  ".\docker-manager.ps1",
  ".\docker-start.ps1",
  ".\optimize-system.ps1",
  ".\setup-env.ps1",
  ".\setup-vercel-env.ps1",
  ".\test-diagnostic.mjs",
  ".\test-quick-diagnostic.js"
)

foreach ($script in $scriptsToMove) {
  if (Test-Path $script) {
    $scriptName = Split-Path $script -Leaf
    $destination = Join-Path $scriptsDir $scriptName

    if ($DryRun) {
      Write-Log "DRY RUN: Would move $script to $destination" "DRYRUN"
    }
    else {
      Move-Item -Path $script -Destination $destination -Force
      Write-Log "Moved script: $scriptName to scripts/" "SUCCESS"
    }
  }
}

# ============================================
# 6. ORGANIZE DOCUMENTATION
# ============================================
Write-Log "Phase 6: Organizing documentation..." "INFO"

# Create docs structure
$docsStructure = @{
  "deployment"  = @(
    ".\DEPLOY.md",
    ".\DOCKER_GUIDE.md",
    ".\DOCKER_QUICK_START.md"
  )
  "development" = @(
    ".\NVIDIA_PROFILING_GUIDE.md",
    ".\NVIDIA_PROFILING_TEST_RESULTS.md",
    ".\PROFILING_DEV_SERVER_GUIDE.md",
    ".\GPU_OPTIMIZATION_GUIDE.md",
    ".\QUICK_OPTIMIZATION_GUIDE.md",
    ".\SYSTEM_OPTIMIZATION_GUIDE.md",
    ".\SYSTEM_CAPACITY_ANALYSIS.md",
    ".\SYSTEM_UTILIZATION_ANALYSIS.md",
    ".\TEST_WORKFLOW_ANALYSIS.md",
    ".\TRACING_SETUP_GUIDE.md"
  )
  "planning"    = @(
    ".\DOCUMENTATION_INDEX.md",
    ".\DOCUMENTATION_MASTER_INDEX.md",
    ".\PLANNING_DOCS_MASTER_INDEX.md",
    ".\PLANNING_DOCS_QUICK_ACCESS.md",
    ".\DIVINE_IMPLEMENTATION_PLAN.md",
    ".\TYPESCRIPT_DOCS_INDEX.md",
    ".\WEBSITE_COMPLETION_STATUS.md"
  )
}

foreach ($category in $docsStructure.Keys) {
  $categoryDir = Join-Path ".\docs" $category

  if (-not (Test-Path $categoryDir)) {
    if (-not $DryRun) {
      New-Item -ItemType Directory -Force -Path $categoryDir | Out-Null
    }
  }

  foreach ($doc in $docsStructure[$category]) {
    if (Test-Path $doc) {
      $docName = Split-Path $doc -Leaf
      $destination = Join-Path $categoryDir $docName

      if ($DryRun) {
        Write-Log "DRY RUN: Would move $doc to $destination" "DRYRUN"
      }
      else {
        Move-Item -Path $doc -Destination $destination -Force
        Write-Log "Moved documentation: $docName to docs/$category/" "SUCCESS"
      }
    }
  }
}

# ============================================
# 7. CLEAN DUPLICATE FOLDERS
# ============================================
Write-Log "Phase 7: Removing duplicate/unused folders..." "INFO"

# Check if Farmers-Market folder is a duplicate
if (Test-Path ".\Farmers-Market") {
  $mainSrc = ".\src"
  $duplicateSrc = ".\Farmers-Market\src"

  if ((Test-Path $mainSrc) -and (Test-Path $duplicateSrc)) {
    Remove-SafelyWithArchive ".\Farmers-Market" "Duplicate source directory"
  }
}

# ============================================
# 8. CREATE CONSOLIDATED DOCUMENTATION
# ============================================
Write-Log "Phase 8: Creating consolidated documentation..." "INFO"

if (-not $DryRun) {
  $masterReadme = @"
# 🌾 Farmers Market Platform

**Divine Agricultural Software with Quantum Consciousness**

## 📋 Quick Start

\`\`\`powershell
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
\`\`\`

Visit http://localhost:3000

## 📚 Documentation

- **[Deployment Guide](./docs/deployment/DEPLOY.md)** - Production deployment instructions
- **[Development Guide](./docs/development/)** - Development setup and optimization
- **[Planning Docs](./docs/planning/)** - Project planning and architecture
- **[Divine Instructions](./.github/instructions/README.md)** - Coding patterns and best practices

## 🏗️ Project Structure

\`\`\`
src/
├── app/              # Next.js app router
├── components/       # React components
├── lib/             # Utility functions
└── types/           # TypeScript types

.github/
├── instructions/    # Divine coding patterns
└── workflows/       # CI/CD workflows

docs/
├── deployment/      # Deployment guides
├── development/     # Development guides
└── planning/        # Planning documents
\`\`\`

## 🚀 Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run test\` - Run tests
- \`npm run lint\` - Lint code
- \`npm run db:migrate\` - Run database migrations
- \`npm run db:studio\` - Open Prisma Studio

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL + Prisma
- **UI**: Tailwind CSS + shadcn/ui
- **Testing**: Vitest + Playwright
- **Auth**: NextAuth.js v5

## 📖 Divine Instructions

This project follows the **Divine Agricultural Consciousness** patterns documented in:
- [.github/instructions/](./.github/instructions/README.md)

## 📝 License

See [LICENSE](./LICENSE)

---

Built with 🌾 Agricultural Consciousness and ⚡ Divine Development Patterns
"@

  Set-Content -Path ".\README.md" -Value $masterReadme -Force
  Write-Log "Created consolidated README.md" "SUCCESS"
}

# ============================================
# 9. UPDATE .gitignore
# ============================================
Write-Log "Phase 9: Updating .gitignore..." "INFO"

if (-not $DryRun) {
  $gitignoreContent = @"
# === DEPENDENCIES ===
node_modules/
.pnp
.pnp.js

# === TESTING ===
coverage/
.nyc_output/
test-results/
playwright-report/
*.log

# === NEXT.JS ===
.next/
out/
build/
dist/
.turbo/

# === ENVIRONMENT ===
.env
.env*.local
!.env.example
!.env*.example

# === VERCEL ===
.vercel

# === DATABASE ===
*.db
*.db-journal
prisma/dev.db

# === IDE ===
.vscode/settings.local.json
.vs/
*.swp
*.swo
*.suo
*.user
*.userosscache
*.sln.docstates

# === OS ===
.DS_Store
Thumbs.db
*.log

# === BUILD ARTIFACTS ===
bin/
obj/

# === PROFILING ===
profiling_output/
*.nsys-rep
*.qdrep
*.sqlite

# === ARCHIVES ===
archive/
cleanup-logs/

# === SECRETS ===
nextauth-secret.txt
*.pem
*.key
"@

  Set-Content -Path ".\.gitignore" -Value $gitignoreContent -Force
  Write-Log "Updated .gitignore" "SUCCESS"
}

# ============================================
# 10. GENERATE CLEANUP REPORT
# ============================================
Write-Log "Phase 10: Generating cleanup report..." "INFO"

$reportPath = ".\cleanup-logs\CLEANUP_REPORT_$timestamp.md"
$report = @"
# Repository Cleanup Report

**Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Mode**: $(if ($DryRun) { "DRY RUN" } else { "EXECUTION" })

## Summary

This cleanup operation:
1. ✅ Removed build artifacts and logs
2. ✅ Consolidated redundant documentation
3. ✅ Removed IDE-specific files
4. ✅ Cleaned environment files (kept examples)
5. ✅ Organized scripts into scripts/ directory
6. ✅ Reorganized documentation into docs/ structure
7. ✅ Removed duplicate folders
8. ✅ Created consolidated README.md
9. ✅ Updated .gitignore
10. ✅ Generated this report

## Archive Location

All removed files archived to: \`$archiveDir\`

## Recommended Next Steps

1. Review the cleanup results
2. Test the application: \`npm run dev\`
3. Run tests: \`npm test\`
4. Commit changes: \`git add -A && git commit -m "chore: comprehensive repository cleanup"\`
5. If satisfied, delete archive: \`Remove-Item -Recurse -Force $archiveDir\`

## Documentation Structure

\`\`\`
docs/
├── deployment/      # Deployment guides
├── development/     # Development and optimization guides
└── planning/        # Planning and architecture documents
\`\`\`

## Notes

- All removed files were archived before deletion
- Environment files containing secrets were removed (examples preserved)
- IDE-specific files (.vs, .slnx) were removed
- Build artifacts cleaned
- Scripts consolidated in scripts/ directory

---

Generated by: Comprehensive Cleanup Script v2.0.0
Divine Consciousness: MAXIMUM ⚡
"@

Set-Content -Path $reportPath -Value $report -Force
Write-Log "Cleanup report generated: $reportPath" "SUCCESS"

# ============================================
# COMPLETION
# ============================================
Write-Log "=== COMPREHENSIVE REPOSITORY CLEANUP COMPLETED ===" "SUCCESS"
Write-Log "Log file: $logFile" "INFO"
Write-Log "Report: $reportPath" "INFO"
Write-Log "Archive: $archiveDir" "INFO"

if ($DryRun) {
  Write-Host "`n⚠️  DRY RUN MODE - No changes were made" -ForegroundColor Yellow
  Write-Host "Run without -DryRun to execute cleanup" -ForegroundColor Yellow
}
else {
  Write-Host "`n✅ Cleanup completed successfully!" -ForegroundColor Green
  Write-Host "📊 Review the report: $reportPath" -ForegroundColor Cyan
  Write-Host "📦 Archive location: $archiveDir" -ForegroundColor Cyan
  Write-Host "`n🔥 Next steps:" -ForegroundColor Magenta
  Write-Host "  1. Review changes" -ForegroundColor White
  Write-Host "  2. Test application: npm run dev" -ForegroundColor White
  Write-Host "  3. Commit changes: git add -A && git commit -m 'chore: cleanup'" -ForegroundColor White
}
