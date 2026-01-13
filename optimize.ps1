# Quick Start Script for Database Optimization (Windows PowerShell)
# Usage: .\optimize.ps1 [check|apply|test|compare|help]

param(
  [Parameter(Position=0)]
  [string]$Command = "help"
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success
{ Write-Host $args -ForegroundColor Green 
}
function Write-Warning
{ Write-Host $args -ForegroundColor Yellow 
}
function Write-Error
{ Write-Host $args -ForegroundColor Red 
}
function Write-Info
{ Write-Host $args -ForegroundColor Cyan 
}

# Banner
Write-Info "╔════════════════════════════════════════════════════════════════╗"
Write-Info "║    Farmers Market Platform - Database Optimization Tool       ║"
Write-Info "╚════════════════════════════════════════════════════════════════╝"
Write-Host ""

# Check if DATABASE_URL is set
function Check-DatabaseUrl
{
  if (-not $env:DATABASE_URL)
  {
    Write-Warning "⚠️  DATABASE_URL not found in environment"
    Write-Host ""
    Write-Host "Loading from .env.local..."

    if (Test-Path .env.local)
    {
      Get-Content .env.local | ForEach-Object {
        if ($_ -match '^DATABASE_URL=(.+)$')
        {
          $env:DATABASE_URL = $matches[1].Trim('"').Trim("'")
        }
      }

      if (-not $env:DATABASE_URL)
      {
        Write-Error "❌ DATABASE_URL not found in .env.local"
        Write-Host ""
        Write-Host "Please add DATABASE_URL to .env.local or set it in your environment:"
        Write-Host ""
        Write-Host '  $env:DATABASE_URL = "postgresql://username:password@host:port/database"'
        Write-Host ""
        exit 1
      }
      Write-Success "✅ Loaded DATABASE_URL from .env.local"
    } else
    {
      Write-Error "❌ .env.local not found"
      Write-Host ""
      Write-Host "Please create .env.local with DATABASE_URL or set it in your environment:"
      Write-Host ""
      Write-Host '  $env:DATABASE_URL = "postgresql://username:password@host:port/database"'
      Write-Host ""
      exit 1
    }
  } else
  {
    Write-Success "✅ DATABASE_URL is configured"
  }
  Write-Host ""
}

# Function to run readiness check
function Invoke-Check
{
  Write-Info "🔍 Running database readiness check..."
  Write-Host ""
  npx tsx scripts/check-db-readiness.ts
}

# Function to apply optimizations
function Invoke-Apply
{
  Write-Info "🚀 Applying database optimizations..."
  Write-Host ""
  Write-Warning "⚠️  This will create indexes and modify database objects"
  Write-Warning "   All changes are safe and reversible"
  Write-Host ""

  $confirmation = Read-Host "Continue? (y/N)"

  if ($confirmation -eq 'y' -or $confirmation -eq 'Y')
  {
    npx tsx scripts/apply-db-optimizations.ts
    Write-Host ""
    Write-Success "✅ Optimization complete!"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Run performance test: .\optimize.ps1 test"
    Write-Host "  2. Compare results: .\optimize.ps1 compare"
    Write-Host ""
  } else
  {
    Write-Warning "Cancelled by user"
    exit 0
  }
}

# Function to run performance test
function Invoke-Test
{
  Write-Info "📊 Running performance inspection..."
  Write-Host ""
  npm run inspect:v4:quick -- --mock-auth
  Write-Host ""
  Write-Success "✅ Inspection complete!"
  Write-Host ""
  Write-Host "Results saved to: inspection-reports/"
  Write-Host "Compare with baseline: .\optimize.ps1 compare"
  Write-Host ""
}

# Function to compare performance
function Invoke-Compare
{
  Write-Info "📈 Comparing performance metrics..."
  Write-Host ""
  npx tsx scripts/compare-performance.ts --latest
}

# Function to show help
function Show-Help
{
  Write-Host "Usage: .\optimize.ps1 [command]"
  Write-Host ""
  Write-Host "Commands:"
  Write-Host "  check      Run database readiness check (Step 1)"
  Write-Host "  apply      Apply database optimizations (Step 2)"
  Write-Host "  test       Run performance inspection (Step 3)"
  Write-Host "  compare    Compare before/after performance (Step 4)"
  Write-Host "  all        Run all steps (check → apply → test → compare)"
  Write-Host "  help       Show this help message"
  Write-Host ""
  Write-Host "Quick Start:"
  Write-Host "  1. Ensure DATABASE_URL is set in .env.local"
  Write-Host "  2. Run: .\optimize.ps1 all"
  Write-Host ""
  Write-Host "Step-by-Step:"
  Write-Host "  .\optimize.ps1 check    # Verify database readiness"
  Write-Host "  .\optimize.ps1 apply    # Apply optimizations"
  Write-Host "  .\optimize.ps1 test     # Run performance test"
  Write-Host "  .\optimize.ps1 compare  # View improvements"
  Write-Host ""
  Write-Host "Environment Variable (temporary):"
  Write-Host '  $env:DATABASE_URL = "postgresql://username:password@host:port/database"'
  Write-Host "  .\optimize.ps1 check"
  Write-Host ""
  Write-Host "Documentation:"
  Write-Host "  - Full guide: SETUP_DATABASE_OPTIMIZATION.md"
  Write-Host "  - Action plan: NEXT_STEPS_ACTION_PLAN.md"
  Write-Host "  - Technical details: DB_OPTIMIZATION_STATUS.md"
  Write-Host ""
}

# Function to run all steps
function Invoke-All
{
  Write-Info "🚀 Running complete optimization workflow..."
  Write-Host ""

  # Step 1: Check
  Write-Info "═══════════════════════════════════════════════════════════════"
  Write-Info "   STEP 1: Database Readiness Check"
  Write-Info "═══════════════════════════════════════════════════════════════"
  Write-Host ""
  Invoke-Check

  Write-Host ""
  Write-Success "✅ Readiness check passed"
  Write-Host ""

  $confirmation = Read-Host "Continue to Step 2? (y/N)"

  if ($confirmation -ne 'y' -and $confirmation -ne 'Y')
  {
    Write-Warning "Workflow stopped by user"
    exit 0
  }

  # Step 2: Apply
  Write-Host ""
  Write-Info "═══════════════════════════════════════════════════════════════"
  Write-Info "   STEP 2: Apply Database Optimizations"
  Write-Info "═══════════════════════════════════════════════════════════════"
  Write-Host ""

  Write-Warning "⚠️  This will create indexes and modify database objects"
  Write-Warning "   All changes are safe and reversible"
  Write-Host ""

  $confirmation = Read-Host "Continue? (y/N)"

  if ($confirmation -ne 'y' -and $confirmation -ne 'Y')
  {
    Write-Warning "Workflow stopped by user"
    exit 0
  }

  npx tsx scripts/apply-db-optimizations.ts

  Write-Host ""
  Write-Success "✅ Optimizations applied"
  Write-Host ""

  $confirmation = Read-Host "Continue to Step 3? (y/N)"

  if ($confirmation -ne 'y' -and $confirmation -ne 'Y')
  {
    Write-Warning "Workflow stopped by user"
    Write-Host ""
    Write-Host "You can run performance test later with: .\optimize.ps1 test"
    exit 0
  }

  # Step 3: Test
  Write-Host ""
  Write-Info "═══════════════════════════════════════════════════════════════"
  Write-Info "   STEP 3: Performance Testing"
  Write-Info "═══════════════════════════════════════════════════════════════"
  Write-Host ""
  Invoke-Test

  # Step 4: Compare
  Write-Host ""
  Write-Info "═══════════════════════════════════════════════════════════════"
  Write-Info "   STEP 4: Performance Comparison"
  Write-Info "═══════════════════════════════════════════════════════════════"
  Write-Host ""
  Invoke-Compare

  Write-Host ""
  Write-Success "╔════════════════════════════════════════════════════════════════╗"
  Write-Success "║              OPTIMIZATION WORKFLOW COMPLETE! 🎉                ║"
  Write-Success "╚════════════════════════════════════════════════════════════════╝"
  Write-Host ""
  Write-Host "Next steps:"
  Write-Host "  1. Review comparison results above"
  Write-Host "  2. Integrate optimized repository (see NEXT_STEPS_ACTION_PLAN.md)"
  Write-Host "  3. Deploy to staging for testing"
  Write-Host "  4. Monitor performance metrics"
  Write-Host ""
}

# Main script logic
Check-DatabaseUrl

switch ($Command.ToLower())
{
  "check"
  {
    Invoke-Check
  }
  "apply"
  {
    Invoke-Apply
  }
  "test"
  {
    Invoke-Test
  }
  "compare"
  {
    Invoke-Compare
  }
  "all"
  {
    Invoke-All
  }
  "help"
  {
    Show-Help
  }
  default
  {
    Write-Error "❌ Unknown command: $Command"
    Write-Host ""
    Show-Help
    exit 1
  }
}
