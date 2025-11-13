# Repository Cleanup Script - Final Version
# Removes identified redundant files and folders

Write-Host "Starting Repository Cleanup..."

# Function to safely remove items with confirmation
function Remove-Safe {
  param([string]$Path, [string]$Description)
  if (Test-Path $Path) {
    Write-Host "  Removing: $Description" -ForegroundColor Yellow
    try {
      Remove-Item -Path $Path -Recurse -Force
      Write-Host "  Removed: $Description" -ForegroundColor Green
    }
    catch {
      Write-Host "  Failed to remove: $Description - $($_.Exception.Message)" -ForegroundColor Red
    }
  }
  else {
    Write-Host "  Not found: $Description" -ForegroundColor Gray
  }
}

# Category 1: Redundant Documentation
Write-Host "`nRemoving redundant documentation..." -ForegroundColor Cyan
Remove-Safe -Path "docs/archive" -Description "docs/archive/ folder (200+ archived files)"
Remove-Safe -Path "docs/GOD-like-instructions" -Description "docs/GOD-like-instructions/ folder"
Remove-Safe -Path "docs/planning" -Description "docs/planning/ folder (outdated planning docs)"

# Category 2: Duplicate Configuration Files
Write-Host "`nRemoving duplicate configuration files..." -ForegroundColor Cyan
Remove-Safe -Path "jest.config.simple.js" -Description "jest.config.simple.js (duplicate)"
Remove-Safe -Path "jest.config.js" -Description "jest.config.js (root level duplicate)"
Remove-Safe -Path "next.config.simple.mjs" -Description "next.config.simple.mjs (unused)"
Remove-Safe -Path "tsconfig.base.json" -Description "tsconfig.base.json (unused)"
Remove-Safe -Path "tsconfig.prod.json" -Description "tsconfig.prod.json (unused)"

# Category 3: Backup Files
Write-Host "`nRemoving backup files..." -ForegroundColor Cyan
Remove-Safe -Path "prisma/schema.prisma.backup" -Description "prisma/schema.prisma.backup"
Remove-Safe -Path "prisma/schema.prisma.bak" -Description "prisma/schema.prisma.bak"
Remove-Safe -Path "docs/vscode-configuration/backups" -Description "docs/vscode-configuration/backups/"
Remove-Safe -Path "docs/archive/test-outputs" -Description "docs/archive/test-outputs/"
Remove-Safe -Path "docs/evaluation" -Description "docs/evaluation/ folder"

# Category 4: Temporary/Planning Files
Write-Host "`nRemoving temporary and planning files..." -ForegroundColor Cyan
Remove-Safe -Path "Mapa" -Description "Mapa/ folder (planning notes)"
Remove-Safe -Path "sistematic" -Description "sistematic/ folder (system specs)"
Remove-Safe -Path "serenade.go" -Description "serenade.go (unrelated Go file)"
Remove-Safe -Path "A comprehensive platform.txt" -Description "A comprehensive platform.txt"
Remove-Safe -Path "START_HERE_GODLIKE.md" -Description "START_HERE_GODLIKE.md"
Remove-Safe -Path "STRUCTURE_EVOLUTION_PLAN.md" -Description "STRUCTURE_EVOLUTION_PLAN.md"
Remove-Safe -Path "SYMBIOSIS_CONTROL_CENTER.md" -Description "SYMBIOSIS_CONTROL_CENTER.md"
Remove-Safe -Path "TASK_TRACKER.md" -Description "TASK_TRACKER.md"

# Category 5: Empty Directories
Write-Host "`nRemoving empty directories..." -ForegroundColor Cyan
Remove-Safe -Path "Farmers-Market/components/analytics" -Description "Farmers-Market/components/analytics/ (empty)"
Remove-Safe -Path "Farmers-Market/public/images/backgrounds" -Description "Farmers-Market/public/images/backgrounds/ (empty)"
Remove-Safe -Path "Farmers-Market/public/images/vendors" -Description "Farmers-Market/public/images/vendors/ (empty)"
Remove-Safe -Path "Farmers-Market/scripts/ai" -Description "Farmers-Market/scripts/ai/ (empty)"
Remove-Safe -Path "Farmers-Market/test-results/performance" -Description "Farmers-Market/test-results/performance/ (empty)"

# Category 6: Empty API Route Directories
Write-Host "`nRemoving empty API route directories..." -ForegroundColor Cyan
$emptyApiDirs = @(
  "Farmers-Market/src/app/api/auth/[...nextauth]",
  "Farmers-Market/src/app/api/cart/items/[id]",
  "Farmers-Market/src/app/api/crops/[id]",
  "Farmers-Market/src/app/api/crops/[id]/metrics",
  "Farmers-Market/src/app/api/crops/[id]/seasonal-cycles",
  "Farmers-Market/src/app/api/crops/[id]/soil",
  "Farmers-Market/src/app/api/farms/[id]",
  "Farmers-Market/src/app/api/orders/[id]",
  "Farmers-Market/src/app/api/products/[id]",
  "Farmers-Market/src/app/api/vendor/orders/[id]",
  "Farmers-Market/src/app/api/vendor/products/[id]",
  "Farmers-Market/src/app/farmers/[id]",
  "Farmers-Market/src/app/products/[id]",
  "Farmers-Market/src/app/shop/orders/[id]",
  "Farmers-Market/src/app/shop/orders/[id]/confirmation"
)

foreach ($dir in $emptyApiDirs) {
  Remove-Safe -Path $dir -Description "$dir (empty API route)"
}

# Category 7: Test and Diagnostic Files
Write-Host "`nRemoving test and diagnostic files..." -ForegroundColor Cyan
Remove-Safe -Path "diagnostics" -Description "diagnostics/ folder (15+ log files)"
Remove-Safe -Path "reports" -Description "reports/ folder (test reports)"
Remove-Safe -Path "profiling_scripts" -Description "profiling_scripts/ folder"
Remove-Safe -Path "Farmers-Market/coverage" -Description "Farmers-Market/coverage/ (test coverage)"

# Category 8: Development Artifacts
Write-Host "`nRemoving development artifacts..." -ForegroundColor Cyan
Remove-Safe -Path "scripts" -Description "scripts/ folder (14 PowerShell scripts)"
Remove-Safe -Path ".copilot" -Description ".copilot/ folder (AI assistant files)"
Remove-Safe -Path ".kilocode" -Description ".kilocode/ folder (code generation artifacts)"
Remove-Safe -Path "packages" -Description "packages/ folder (duplicate types)"

# Category 9: Build/Cache Directories
Write-Host "`nRemoving build/cache directories..." -ForegroundColor Cyan
Remove-Safe -Path "Farmers-Market/.next/cache" -Description "Farmers-Market/.next/cache/ (build cache)"
Remove-Safe -Path "Farmers-Market/.swc" -Description "Farmers-Market/.swc/ (SWC cache)"

# Category 10: Additional Root Files
Write-Host "`nRemoving additional root files..." -ForegroundColor Cyan
$additionalFiles = @(
  "check-directory.ps1",
  "test-api-endpoints.ps1",
  "verify-vscode-settings.ps1",
  "ADMIN_FEATURES_ROADMAP.md",
  "AGRICULTURAL_FEATURES_ROADMAP.md",
  "CICD_IMPROVEMENTS_GUIDE.md",
  "DEPLOYMENT_READY.md",
  "DIVINE_ADVICE_TYPESCRIPT_EXCELLENCE.md",
  "DIVINE_PROJECT_REVIEW_2025-10-25.md",
  "FINANCIAL_MANAGEMENT_QUANTUM_LEAP.md",
  "FIX_SERVER_START.md",
  "GITHUB_ACTIONS_FIX.md",
  "GPU_FEATURES_IMPLEMENTATION.md",
  "GPU_IMPLEMENTATION_SUMMARY.md",
  "HYPER_V_IMPLEMENTATION_GUIDE.md",
  "HYPER_V_VIRTUAL_MACHINE_IMPLEMENTATION.md",
  "INTEGRATION_MAP.md",
  "INTELLIGENCE_QUICK_REFERENCE.md",
  "ISSUE_CATALOG.md",
  "jest.nvtx-marker.js",
  "jest.nvtx-setup.js",
  "KILO_CODE_INTEGRATION_COMPLETE.md",
  "LONG_TERM_ROADMAP.md",
  "MCP_SUCCESS_SUMMARY.md",
  "nsight-systems-config.json",
  "PRISMA_SCHEMA_UPDATES_COPY_PASTE.md",
  "PRODUCT_CATALOG_QUICK_REFERENCE.md",
  "QUANTUM_LEAP_ROADMAP.md",
  "QUICK_REF.md",
  "REPOSITORY_ANALYSIS_COMPREHENSIVE.md",
  "REPOSITORY_INDEX.md",
  "ROADMAP_QUICK_REF.md",
  "SMART_PERPLEXITY_AUTO_USAGE.md",
  "VERCEL_DEPLOYMENT_GUIDE.md"
)

foreach ($file in $additionalFiles) {
  Remove-Safe -Path $file -Description $file
}

Write-Host "`nRepository cleanup completed!" -ForegroundColor Green
Write-Host "Repository size should now be significantly reduced." -ForegroundColor Green
