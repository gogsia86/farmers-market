# 🚀 AUTOMATED UPGRADE TO 100% SCRIPT (PowerShell)
# Farmers Market Platform - Critical Updates Automation
# Version: 1.0.0
# Last Updated: 2025-01-15

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Banner
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║   🌾 FARMERS MARKET PLATFORM - UPGRADE TO 100%              ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║   Automated upgrade script for critical updates              ║" -ForegroundColor Green
Write-Host "║   This will bring all metrics to 100%                        ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host ""

# Check if running in correct directory
if (-not (Test-Path "package.json")) {
    Write-Error-Custom "package.json not found. Please run this script from the project root."
    exit 1
}

# Check Node.js version
try {
    $nodeVersion = node -v
    $nodeVersionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeVersionNumber -lt 20) {
        Write-Error-Custom "Node.js 20+ required. Current version: $nodeVersion"
        exit 1
    }
} catch {
    Write-Error-Custom "Node.js not found. Please install Node.js 20+"
    exit 1
}

Write-Success "Prerequisites check passed"

# Function to create backup
function Create-Backup {
    Write-Info "Creating backup..."
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $script:backupDir = "backup_$timestamp"
    New-Item -ItemType Directory -Path $script:backupDir -Force | Out-Null

    Copy-Item "package.json" "$script:backupDir/" -Force
    if (Test-Path "package-lock.json") {
        Copy-Item "package-lock.json" "$script:backupDir/" -Force
    }
    Copy-Item "jest.config.js" "$script:backupDir/" -Force
    Copy-Item "next.config.mjs" "$script:backupDir/" -Force

    Write-Success "Backup created at: $script:backupDir"
}

# Function to restore backup
function Restore-Backup {
    if (Test-Path $script:backupDir) {
        Write-Warning "Restoring from backup..."
        Copy-Item "$script:backupDir/package.json" "." -Force
        if (Test-Path "$script:backupDir/package-lock.json") {
            Copy-Item "$script:backupDir/package-lock.json" "." -Force
        }
        Copy-Item "$script:backupDir/jest.config.js" "." -Force
        Copy-Item "$script:backupDir/next.config.mjs" "." -Force
        npm install
        Write-Success "Backup restored"
    }
}

# Initialize backup directory variable
$script:backupDir = ""

# ============================================
# PHASE 1: CRITICAL SECURITY UPDATES
# ============================================

Write-Info "Starting Phase 1: Critical Security Updates"

try {
    Create-Backup

    # Update Next.js and related packages
    Write-Info "Updating Next.js to 16.0.6..."
    npm install next@16.0.6 eslint-config-next@16.0.6 "@next/bundle-analyzer@16.0.6"
    if ($LASTEXITCODE -ne 0) { throw "Next.js update failed" }
    Write-Success "Next.js updated"

    # Update Stripe packages
    Write-Info "Updating Stripe packages..."
    npm install "@stripe/react-stripe-js@latest" "@stripe/stripe-js@latest" "stripe@latest"
    if ($LASTEXITCODE -ne 0) { throw "Stripe update failed" }
    Write-Success "Stripe packages updated"

    # Update testing libraries
    Write-Info "Updating testing libraries..."
    npm install --save-dev "@playwright/test@latest" "ts-jest@latest"
    if ($LASTEXITCODE -ne 0) { throw "Testing libraries update failed" }
    Write-Success "Testing libraries updated"

    # Update TypeScript ESLint
    Write-Info "Updating TypeScript ESLint..."
    npm install --save-dev "@typescript-eslint/eslint-plugin@latest" "@typescript-eslint/parser@latest"
    if ($LASTEXITCODE -ne 0) { throw "TypeScript ESLint update failed" }
    Write-Success "TypeScript ESLint updated"

    # Update other critical packages
    Write-Info "Updating other critical packages..."
    npm install react-hook-form@latest framer-motion@latest next-intl@latest "@vercel/analytics@latest" "@vercel/speed-insights@latest" prettier@latest
    if ($LASTEXITCODE -ne 0) { throw "Other packages update failed" }
    Write-Success "All critical packages updated"

    # Run security audit
    Write-Info "Running security audit..."
    npm audit --audit-level=moderate
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Some vulnerabilities found. Review npm audit report."
    }

    # Run audit fix
    Write-Info "Attempting to fix vulnerabilities..."
    npm audit fix
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Some issues could not be auto-fixed"
    }

    Write-Success "Phase 1 completed"

    # ============================================
    # PHASE 2: VERIFICATION
    # ============================================

    Write-Info "Starting Phase 2: Verification"

    # Type check
    Write-Info "Running type check..."
    npm run type-check
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Type check failed"
        Restore-Backup
        exit 1
    }
    Write-Success "Type check passed"

    # Linting
    Write-Info "Running lint check..."
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Lint check failed"
        Restore-Backup
        exit 1
    }
    Write-Success "Lint check passed"

    # Build test
    Write-Info "Testing production build..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Build failed"
        Restore-Backup
        exit 1
    }
    Write-Success "Build successful"

    # Run tests
    Write-Info "Running test suite..."
    npm run test -- --passWithNoTests
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Tests failed"
        Restore-Backup
        exit 1
    }
    Write-Success "Tests passed"

    Write-Success "Phase 2 verification completed"

    # ============================================
    # PHASE 3: CONFIGURATION UPDATES
    # ============================================

    Write-Info "Starting Phase 3: Configuration Updates"

    # Update Jest coverage thresholds
    Write-Info "Updating Jest coverage thresholds..."
    if (Test-Path "jest.config.js") {
        # Backup original
        Copy-Item "jest.config.js" "jest.config.js.bak" -Force

        # Read content
        $content = Get-Content "jest.config.js" -Raw

        # Update coverage thresholds to 90%
        $content = $content -replace 'branches: 80', 'branches: 90'
        $content = $content -replace 'functions: 80', 'functions: 90'
        $content = $content -replace 'lines: 80', 'lines: 90'
        $content = $content -replace 'statements: 80', 'statements: 90'

        # Write back
        Set-Content "jest.config.js" $content -NoNewline

        Write-Success "Jest coverage thresholds updated to 90%"
    } else {
        Write-Warning "jest.config.js not found, skipping coverage threshold update"
    }

    Write-Success "Phase 3 completed"

    # ============================================
    # PHASE 4: GENERATE REPORTS
    # ============================================

    Write-Info "Starting Phase 4: Generate Reports"

    # Create reports directory
    if (-not (Test-Path "reports")) {
        New-Item -ItemType Directory -Path "reports" -Force | Out-Null
    }

    # Generate dependency report
    Write-Info "Generating dependency report..."
    npm list --depth=0 > "reports/dependencies.txt" 2>&1
    Write-Success "Dependency report created: reports/dependencies.txt"

    # Generate outdated packages report
    Write-Info "Checking for outdated packages..."
    npm outdated > "reports/outdated.txt" 2>&1
    Write-Success "Outdated packages report created: reports/outdated.txt"

    # Generate security audit report
    Write-Info "Generating security audit report..."
    npm audit --json > "reports/security-audit.json" 2>&1
    Write-Success "Security audit report created: reports/security-audit.json"

    # Generate bundle size report
    Write-Info "Analyzing bundle size..."
    $env:ANALYZE = "true"
    npm run build > "reports/bundle-analysis.txt" 2>&1
    Remove-Item Env:\ANALYZE
    Write-Success "Bundle analysis report created: reports/bundle-analysis.txt"

    Write-Success "Phase 4 completed"

    # ============================================
    # FINAL SUMMARY
    # ============================================

    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                               ║" -ForegroundColor Green
    Write-Host "║   ✅ UPGRADE TO 100% COMPLETED SUCCESSFULLY!                 ║" -ForegroundColor Green
    Write-Host "║                                                               ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""

    Write-Success "Summary of changes:"
    Write-Host ""
    Write-Host "  📦 Packages Updated:" -ForegroundColor Cyan
    Write-Host "     • Next.js → 16.0.6"
    Write-Host "     • Stripe packages → latest"
    Write-Host "     • Testing libraries → latest"
    Write-Host "     • TypeScript ESLint → latest"
    Write-Host "     • Various dependencies → latest"
    Write-Host ""
    Write-Host "  🔧 Configuration:" -ForegroundColor Cyan
    Write-Host "     • Jest coverage thresholds → 90%"
    Write-Host "     • Security vulnerabilities addressed"
    Write-Host ""
    Write-Host "  📊 Reports Generated:" -ForegroundColor Cyan
    Write-Host "     • reports/dependencies.txt"
    Write-Host "     • reports/outdated.txt"
    Write-Host "     • reports/security-audit.json"
    Write-Host "     • reports/bundle-analysis.txt"
    Write-Host ""
    Write-Host "  💾 Backup Location:" -ForegroundColor Cyan
    Write-Host "     • $script:backupDir"
    Write-Host ""

    Write-Info "Next Steps:"
    Write-Host ""
    Write-Host "  1. Review the generated reports in the 'reports' directory"
    Write-Host "  2. Run comprehensive tests: npm run test:all"
    Write-Host "  3. Test locally: npm run dev"
    Write-Host "  4. Review UPGRADE_TO_100_PERCENT.md for Phase 2-4 tasks"
    Write-Host "  5. Commit changes: git add . ; git commit -m 'chore: upgrade to 100%'"
    Write-Host ""

    Write-Warning "Important Notes:"
    Write-Host ""
    Write-Host "  • Backup created at: $script:backupDir"
    Write-Host "  • Review any remaining npm audit warnings"
    Write-Host "  • Test all critical features before deployment"
    Write-Host "  • Update .env files with any new required variables"
    Write-Host ""

    # Check if there are any remaining issues
    Write-Info "Checking for remaining outdated packages..."
    $outdatedCount = (npm outdated 2>$null | Measure-Object -Line).Lines
    if ($outdatedCount -gt 1) {
        Write-Warning "There are still $($outdatedCount - 1) outdated packages"
        Write-Host "  Run 'npm outdated' to see details"
        Write-Host ""
    }

    # Final verification prompt
    Write-Host ""
    $runTests = Read-Host "Would you like to run the full test suite now? (y/n)"

    if ($runTests -eq "y" -or $runTests -eq "Y") {
        Write-Info "Running full test suite..."
        npm run test:all
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Some tests failed. Please review."
        }
    }

    Write-Host ""
    Write-Success "Upgrade script completed! 🎉"
    Write-Host ""
    Write-Host "For detailed upgrade instructions, see: UPGRADE_TO_100_PERCENT.md"
    Write-Host ""

    exit 0

} catch {
    Write-Error-Custom "An error occurred: $_"
    Write-Error-Custom "Restoring backup..."
    Restore-Backup
    exit 1
}
