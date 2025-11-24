# Archive Historical Documentation - Phase 2 Cleanup
# This script moves historical docs to archive/docs-historical/

$archiveBase = "archive/docs-historical"

Write-Host "`n🌾 Farmers Market Platform - Documentation Archive Script" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

# Achievement Reports
Write-Host "`n📊 Archiving achievement reports..." -ForegroundColor Yellow
$achievementFiles = @(
    "100_PERCENT_TEST_VICTORY.md",
    "100_PERFECTION_ACHIEVED.txt",
    "FINAL_100_PERCENT_ACHIEVEMENT.md",
    "PLATFORM_100_ACHIEVEMENT.md",
    "OPERATION_100_ACHIEVEMENT.md",
    "OPERATION_100_FINAL_STATUS.md",
    "OPERATION_100_PERFECTION.md",
    "OPERATION_100_PROGRESS.md",
    "ULTIMATE_VICTORY_REPORT.md",
    "VICTORY_REPORT.txt",
    "HALL_OF_FAME.md",
    "MISSION_COMPLETE_REPORT.md",
    "MISSION_SUCCESS_SUMMARY.txt",
    "LETS_GOOOOO.txt"
)

foreach ($file in $achievementFiles) {
    if (Test-Path $file) {
        Move-Item $file "$archiveBase/achievement-reports/" -Force
        Write-Host "  ✓ Archived: $file" -ForegroundColor Green
    }
}

# Test Coverage Sessions
Write-Host "`n🧪 Archiving test coverage session reports..." -ForegroundColor Yellow
$testSessionFiles = @(
    "EPIC_COVERAGE_SESSION_2.md",
    "EPIC_JOURNEY_SUMMARY.txt",
    "EPIC_TEST_COVERAGE_PUSH.md",
    "EPIC_TEST_COVERAGE_SESSION_3.md",
    "EPIC_TEST_COVERAGE_SESSION_4.md",
    "PUSH_TO_100_FINAL_REPORT.md",
    "PUSH_TO_100_REPORT.md",
    "TEST_COVERAGE_CONTINUATION_COMPLETE.md",
    "NEXT_STEPS_TEST_COVERAGE.md"
)

foreach ($file in $testSessionFiles) {
    if (Test-Path $file) {
        Move-Item $file "$archiveBase/test-coverage-sessions/" -Force
        Write-Host "  ✓ Archived: $file" -ForegroundColor Green
    }
}

# Status Reports (keep only latest)
Write-Host "`n📋 Archiving historical status reports..." -ForegroundColor Yellow
$statusFiles = @(
    "PROJECT_STATUS.txt",
    "QUICK_STATUS.md",
    "TEST_STATUS.txt",
    "TEST_STATUS.md",
    "TEST_STATUS_CONTINUATION.md",
    "FINAL_STATUS_REPORT.md",
    "GOING_FINAL_STATUS.md",
    "E2E_AND_CICD_STATUS_REPORT.md",
    "INTEGRATION_STATUS_SUMMARY.md",
    "PERPLEXITY_INTEGRATION_STATUS.md",
    "TYPESCRIPT_STATUS.md"
)

foreach ($file in $statusFiles) {
    if (Test-Path $file) {
        Move-Item $file "$archiveBase/status-reports/" -Force
        Write-Host "  ✓ Archived: $file" -ForegroundColor Green
    }
}

# Optimization Guides (keep consolidated versions only)
Write-Host "`n⚡ Archiving optimization guides..." -ForegroundColor Yellow
$optimizationFiles = @(
    "HP_OMEN_OPTIMIZATION_COMPLETE.md",
    "HP_OMEN_ULTIMATE_OPTIMIZATION.md",
    "GPU_OPTIMIZATION_GUIDE.md",
    "NVIDIA_PROFILING_GUIDE.md",
    "NVIDIA_PROFILING_TEST_RESULTS.md",
    "PROFILING_DEV_SERVER_GUIDE.md",
    "QUICK_OPTIMIZATION_GUIDE.md"
)

foreach ($file in $optimizationFiles) {
    if (Test-Path $file) {
        Move-Item $file "$archiveBase/optimization-guides/" -Force
        Write-Host "  ✓ Archived: $file" -ForegroundColor Green
    }
}

# Deployment Guides (keep only primary ones)
Write-Host "`n🚢 Archiving redundant deployment guides..." -ForegroundColor Yellow
$deploymentFiles = @(
    "DEPLOY.md",
    "DOCKER_DEPLOYMENT.md",
    "DOCKER_GUIDE.md",
    "DEPLOYMENT_CHECKLIST.md",
    "DEPLOYMENT_GUIDE_NEW_FEATURES.md",
    "KUBERNETES_MIGRATION_GUIDE.md",
    "VERCEL_ENVIRONMENT_SETUP.md",
    "VERCEL_QUICK_START.md",
    "SERVER_MANAGEMENT_GUIDE.md"
)

foreach ($file in $deploymentFiles) {
    if (Test-Path $file) {
        Move-Item $file "$archiveBase/deployment-guides/" -Force
        Write-Host "  ✓ Archived: $file" -ForegroundColor Green
    }
}

# Comprehensive Reviews & Summaries (historical)
Write-Host "`n📊 Archiving historical comprehensive reports..." -ForegroundColor Yellow
$reviewFiles = @(
    "ALL_FIXES_SUMMARY.txt",
    "CLEANUP_SUCCESS_SUMMARY.txt",
    "CLEANUP_FINAL_REPORT.md",
    "COMPLETED_TASKS_SUMMARY.md",
    "COMPLETE_INTEGRATION_SUMMARY.md",
    "COMPREHENSIVE_PLATFORM_REVIEW.md",
    "COMPREHENSIVE_REVIEW_AND_NEXT_STEPS.md",
    "COMPREHENSIVE_UPGRADE_ANALYSIS_2025.md",
    "FINAL_ANALYSIS_REPORT.md",
    "FINAL_ANALYSIS_SUMMARY.txt",
    "FIXES_SUMMARY.md",
    "IMMEDIATE_ACTIONS.md",
    "INTEGRATION_ANALYSIS_REPORT.md",
    "INTEGRATION_DASHBOARD.txt",
    "INTEGRATION_FIXES_COMPLETE.md",
    "PROJECT_REVIEW_2025.md",
    "REPOSITORY_CLEANUP_COMPLETE.md",
    "REPOSITORY_CLEANUP_PLAN.md",
    "TODAYS_ACHIEVEMENTS.md"
)

foreach ($file in $reviewFiles) {
    if (Test-Path $file) {
        Move-Item $file "$archiveBase/status-reports/" -Force
        Write-Host "  ✓ Archived: $file" -ForegroundColor Green
    }
}

# Testing & Quality Reports (historical)
Write-Host "`n🧪 Archiving historical test reports..." -ForegroundColor Yellow
$testReports = @(
    "TEST_EXECUTION_REPORT.md",
    "TEST_FIXES_DOCUMENTATION.md",
    "TEST_FIXES_README.md",
    "TEST_FIXES_SUMMARY.md",
    "TEST_RESULTS_SUMMARY.md",
    "TEST_SUMMARY_VISUAL.txt",
    "TEST_WORKFLOW_ANALYSIS.md",
    "QUALITY_WORKFLOW_VISUAL.txt",
    "QUALITY_SETUP_COMPLETE.md"
)

foreach ($file in $testReports) {
    if (Test-Path $file) {
        Move-Item $file "$archiveBase/test-coverage-sessions/" -Force
        Write-Host "  ✓ Archived: $file" -ForegroundColor Green
    }
}

# Setup & Integration Guides (superseded)
Write-Host "`n🔧 Archiving superseded setup guides..." -ForegroundColor Yellow
$setupFiles = @(
    "OLLAMA_INTEGRATION_COMPLETE.md",
    "OLLAMA_SETUP_GUIDE.md",
    "OPENTELEMETRY_TRACING_FIX_COMPLETE.md",
    "TRACING_MOCK_FIX_COMPLETE.md",
    "TRACING_MOCK_SOLUTION.md",
    "TRACING_SETUP_GUIDE.md",
    "TYPESCRIPT_CLEANUP_SUMMARY.md",
    "QUICK_WINS_COMPLETED.md"
)

foreach ($file in $setupFiles) {
    if (Test-Path $file) {
        Move-Item $file "$archiveBase/status-reports/" -Force
        Write-Host "  ✓ Archived: $file" -ForegroundColor Green
    }
}

# Upgrade & Planning (historical)
Write-Host "`n📦 Archiving historical upgrade documentation..." -ForegroundColor Yellow
$upgradeFiles = @(
    "UPGRADE_PROGRESS_TODAY.md",
    "UPGRADE_QUICK_START.md",
    "UPGRADE_RECOMMENDATIONS_2025.md",
    "UPGRADE_SUMMARY.md"
)

foreach ($file in $upgradeFiles) {
    if (Test-Path $file) {
        Move-Item $file "$archiveBase/status-reports/" -Force
        Write-Host "  ✓ Archived: $file" -ForegroundColor Green
    }
}

# Index files (consolidate into main index)
Write-Host "`n📚 Archiving old index files..." -ForegroundColor Yellow
$indexFiles = @(
    "DOCUMENTATION_MASTER_INDEX.md",
    "PLANNING_DOCS_MASTER_INDEX.md",
    "TYPESCRIPT_DOCS_INDEX.md"
)

foreach ($file in $indexFiles) {
    if (Test-Path $file) {
        Move-Item $file "$archiveBase/status-reports/" -Force
        Write-Host "  ✓ Archived: $file" -ForegroundColor Green
    }
}

# Quick reference guides (keep only main one)
Write-Host "`n📋 Archiving redundant quick reference files..." -ForegroundColor Yellow
$quickRefFiles = @(
    "TESTING_QUICK_REFERENCE.md",
    "QUICKSTART_API_TESTING.md",
    "HOMEPAGE_500_ERROR_GUIDE.md"
)

foreach ($file in $quickRefFiles) {
    if (Test-Path $file) {
        Move-Item $file "$archiveBase/status-reports/" -Force
        Write-Host "  ✓ Archived: $file" -ForegroundColor Green
    }
}

Write-Host "`n✅ Phase 2 Documentation Cleanup Complete!" -ForegroundColor Green
Write-Host "`nEssential docs remaining in root:" -ForegroundColor Cyan
Write-Host "  - README.md" -ForegroundColor White
Write-Host "  - PROJECT_STATUS_2025.md (NEW)" -ForegroundColor White
Write-Host "  - DOCUMENTATION_INDEX.md (UPDATED)" -ForegroundColor White
Write-Host "  - CLEANUP_AND_IMPROVEMENTS_PLAN.md" -ForegroundColor White
Write-Host "  - CLEANUP_COMPLETED_SUMMARY.md" -ForegroundColor White
Write-Host "  - QUICK_CLEANUP_STATUS.md" -ForegroundColor White
Write-Host "  - TEST_FIX_SUCCESS_SUMMARY.md" -ForegroundColor White
Write-Host "  - E2E_TESTING_GUIDE.md" -ForegroundColor White
Write-Host "  - DOCKER_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host "  - PRODUCTION_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host "  - QUICK_REFERENCE.md" -ForegroundColor White
Write-Host "  - OLLAMA_QUICK_START.md" -ForegroundColor White
Write-Host "  - LICENSE" -ForegroundColor White
Write-Host "`nHistorical docs archived to: archive/docs-historical/" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Cyan
