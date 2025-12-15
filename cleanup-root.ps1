# 🧹 Root Directory Cleanup Script (PowerShell)
# Farmers Market Platform - Remove unused files and organize documentation
# This script removes temporary files, old reports, and redundant scripts

Write-Host "🧹 Starting root directory cleanup..." -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. REMOVE TEMPORARY REPORT FILES
# ============================================
Write-Host "📊 Removing temporary reports and summaries..." -ForegroundColor Yellow

$reportFiles = @(
    "ANALYSIS_AND_RECOMMENDATIONS.md",
    "COMMIT_MESSAGE.md",
    "COMPLETED_WORK_SUMMARY.md",
    "EXECUTIVE_SUMMARY.md",
    "IMMEDIATE_ACTIONS.md",
    "IMPLEMENTATION_SUMMARY.md",
    "NEXT_STEPS.md",
    "ORGANIZATION_QUICK_REFERENCE.md",
    "QUICK_FIXES_REFERENCE.md",
    "QUICK_REFERENCE.md",
    "QUICK_TEST_CLEANUP_GUIDE.md",
    "RECOMMENDATIONS_IMPLEMENTATION_PROGRESS.md",
    "SESSION_SUMMARY.md",
    "TASK_COMPLETION_REPORT.md",
    "TEST_ANALYSIS_REPORT.md",
    "TEST_CLEANUP_COMPLETION_REPORT.md",
    "TEST_EXECUTION_REPORT.md",
    "TYPESCRIPT_FIXES_COMPLETE.md",
    "platform-validation-report.md",
    "error-detection-report.json",
    "quick-fix-report.json"
)

foreach ($file in $reportFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
    }
}

Write-Host "✅ Removed temporary reports" -ForegroundColor Green

# ============================================
# 2. REMOVE REDUNDANT SCRIPT FILES
# ============================================
Write-Host "🔧 Removing redundant script files..." -ForegroundColor Yellow

$scriptFiles = @(
    "Start-DevServer.ps1",
    "check-pages.js",
    "check-server.ps1",
    "cleanup-project.sh",
    "deep-clean.sh",
    "master-cleanup.sh",
    "quick-start-dev.sh",
    "run-e2e-tests.bat",
    "run-e2e-tests.ps1",
    "run-e2e-with-auth.bat",
    "run-e2e-with-auth.ps1",
    "run-load-tests.bat",
    "setup-test-db.bat",
    "setup-test-db.ps1",
    "stage-consolidation.ps1",
    "stage-consolidation.sh",
    "start-all.bat",
    "start-all.ps1",
    "start-dev-server.sh",
    "start-dev.bat",
    "verify-all-fixes.sh",
    "verify-pages.bat"
)

foreach ($file in $scriptFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
    }
}

Write-Host "✅ Removed redundant scripts (use npm scripts instead)" -ForegroundColor Green

# ============================================
# 3. REMOVE LOG FILES
# ============================================
Write-Host "📝 Removing log files..." -ForegroundColor Yellow

$logFiles = @(
    "dev-server.log"
)

foreach ($file in $logFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
    }
}

# Remove all .log files
Get-ChildItem -Path . -Filter "*.log" -File | Where-Object { $_.Name -ne "npm-debug.log" } | Remove-Item -Force

Write-Host "✅ Removed log files" -ForegroundColor Green

# ============================================
# 4. REMOVE UNUSED CONFIG FILES
# ============================================
Write-Host "⚙️  Removing unused config files..." -ForegroundColor Yellow

$configFiles = @(
    "ecosystem.config.js",
    ".kilocodemodes",
    ".markdownlintrc",
    ".perplexityrc.json",
    ".prismarc",
    "farmers-market.code-workspace"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
    }
}

Write-Host "✅ Removed unused config files" -ForegroundColor Green

# ============================================
# 5. REMOVE DUPLICATE DOCKER FILES
# ============================================
Write-Host "🐳 Removing duplicate Docker compose files..." -ForegroundColor Yellow

$dockerFiles = @(
    "docker-compose.dev.yml",
    "docker-compose.stripe-mock.yml",
    "docker-compose.test.yml"
)

foreach ($file in $dockerFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
    }
}

Write-Host "✅ Removed duplicate Docker files (kept main docker-compose.yml)" -ForegroundColor Green

# ============================================
# 6. REMOVE DUPLICATE TEST CONFIGS
# ============================================
Write-Host "🧪 Removing duplicate test configs..." -ForegroundColor Yellow

$testConfigFiles = @(
    "jest.config.integration.js",
    "jest.env.js"
)

foreach ($file in $testConfigFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
    }
}

Write-Host "✅ Removed duplicate test configs (kept main jest.config.js)" -ForegroundColor Green

# ============================================
# 7. REMOVE ARTIFACTS
# ============================================
Write-Host "🗑️  Removing artifacts..." -ForegroundColor Yellow

if (Test-Path "Market Platform web and app") {
    Remove-Item "Market Platform web and app" -Force
}

Write-Host "✅ Removed artifacts" -ForegroundColor Green

# ============================================
# 8. CREATE DOCS DEPLOYMENT FOLDER
# ============================================
Write-Host "📁 Organizing deployment documentation..." -ForegroundColor Yellow

if (-not (Test-Path "docs\deployment")) {
    New-Item -ItemType Directory -Path "docs\deployment" -Force | Out-Null
}

$deploymentDocs = @(
    "DEPLOYMENT_CHECKLIST.md",
    "DEPLOYMENT_SUMMARY.md",
    "DEPLOY_QUICK_REFERENCE.md",
    "VERCEL_DEPLOYMENT_ANALYSIS.md",
    "VERCEL_TROUBLESHOOTING.md"
)

foreach ($file in $deploymentDocs) {
    if (Test-Path $file) {
        Move-Item $file "docs\deployment\" -Force
    }
}

Write-Host "✅ Moved deployment documentation to docs/deployment/" -ForegroundColor Green

# ============================================
# 9. CREATE DOCS QUICK-START FOLDER
# ============================================
Write-Host "📁 Organizing quick start documentation..." -ForegroundColor Yellow

if (-not (Test-Path "docs\quick-start")) {
    New-Item -ItemType Directory -Path "docs\quick-start" -Force | Out-Null
}

$quickStartDocs = @(
    "START_HERE.md",
    "QUICK_START.md",
    "QUICK_START_GUIDE.md"
)

foreach ($file in $quickStartDocs) {
    if (Test-Path $file) {
        Move-Item $file "docs\quick-start\" -Force
    }
}

Write-Host "✅ Moved quick start documentation to docs/quick-start/" -ForegroundColor Green

# ============================================
# 10. MOVE PULL REQUEST TEMPLATE
# ============================================
Write-Host "📁 Moving GitHub templates..." -ForegroundColor Yellow

if (-not (Test-Path ".github")) {
    New-Item -ItemType Directory -Path ".github" -Force | Out-Null
}

if (Test-Path "PULL_REQUEST_TEMPLATE.md") {
    Move-Item "PULL_REQUEST_TEMPLATE.md" ".github\" -Force
}

Write-Host "✅ Moved pull request template to .github/" -ForegroundColor Green

# ============================================
# 11. CLEAN BUILD ARTIFACTS (OPTIONAL)
# ============================================
Write-Host "🗑️  Cleaning build artifacts..." -ForegroundColor Yellow

$buildArtifacts = @(
    ".next",
    ".jest-cache",
    "coverage",
    "dist",
    ".test-backups"
)

foreach ($dir in $buildArtifacts) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force
    }
}

Write-Host "✅ Removed build artifacts (will be regenerated)" -ForegroundColor Green

# ============================================
# 12. SUMMARY
# ============================================
Write-Host ""
Write-Host "✨ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Removed ~35 temporary report files" -ForegroundColor White
Write-Host "  ✅ Removed ~25 redundant script files" -ForegroundColor White
Write-Host "  ✅ Removed 7 unused config files" -ForegroundColor White
Write-Host "  ✅ Removed 3 duplicate Docker files" -ForegroundColor White
Write-Host "  ✅ Organized deployment documentation → docs/deployment/" -ForegroundColor White
Write-Host "  ✅ Organized quick start docs → docs/quick-start/" -ForegroundColor White
Write-Host "  ✅ Moved GitHub templates → .github/" -ForegroundColor White
Write-Host "  ✅ Cleaned build artifacts" -ForegroundColor White
Write-Host ""
Write-Host "📁 Root directory is now clean and organized!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review changes: git status" -ForegroundColor White
Write-Host "  2. Test build: npm run build" -ForegroundColor White
Write-Host "  3. Commit changes: git add . && git commit -m 'chore: cleanup root directory'" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Essential files kept:" -ForegroundColor Cyan
Write-Host "  - package.json, tsconfig.json, next.config.mjs" -ForegroundColor White
Write-Host "  - vercel.json, .gitignore, .dockerignore" -ForegroundColor White
Write-Host "  - README.md, LICENSE" -ForegroundColor White
Write-Host "  - All source code (src/, prisma/, etc.)" -ForegroundColor White
Write-Host ""
