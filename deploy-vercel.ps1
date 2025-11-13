# ============================================
# VERCEL DEPLOYMENT SCRIPT
# Quick deployment to Vercel
# ============================================

param(
  [Parameter(Mandatory = $false)]
  [ValidateSet("preview", "production")]
  [string]$Environment = "preview"
)

Write-Host "🚀 Deploying Farmers Market Platform to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
  npm install -g vercel
}

# Check if project is linked
if (-not (Test-Path ".vercel")) {
  Write-Host "⚠️  Project not linked to Vercel. Running vercel link..." -ForegroundColor Yellow
  vercel link
}

Write-Host ""
Write-Host "📋 Pre-Deployment Checklist:" -ForegroundColor Cyan
Write-Host "  ✓ Vercel CLI installed" -ForegroundColor Green
Write-Host "  ✓ Project linked" -ForegroundColor Green
Write-Host ""

# Build check
Write-Host "🔍 Checking if build passes locally..." -ForegroundColor Cyan
$env:SKIP_ENV_VALIDATION = "1"
npm run build

if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "❌ Build failed! Fix errors before deploying." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Deploy
if ($Environment -eq "production") {
  Write-Host "🚀 Deploying to PRODUCTION..." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "⚠️  WARNING: This will deploy to production!" -ForegroundColor Yellow
  $confirm = Read-Host "Are you sure? (yes/no)"

  if ($confirm -ne "yes") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
  }

  vercel --prod
}
else {
  Write-Host "🚀 Deploying to PREVIEW..." -ForegroundColor Cyan
  vercel
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Run database migrations: vercel env pull && npm run db:migrate" -ForegroundColor White
Write-Host "  2. Seed database: npm run db:seed" -ForegroundColor White
Write-Host "  3. Configure environment variables in Vercel Dashboard" -ForegroundColor White
Write-Host "  4. Test your deployment" -ForegroundColor White
Write-Host ""
Write-Host "🌐 View Deployment: https://vercel.com/medicis-projects/farmers_market" -ForegroundColor Cyan
