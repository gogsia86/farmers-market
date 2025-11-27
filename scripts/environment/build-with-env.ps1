#!/usr/bin/env pwsh
# ============================================
# BUILD WITH ENVIRONMENT VARIABLES
# Ensures environment is properly configured before building
# ============================================

Write-Host "🌟 Divine Build Process Starting..." -ForegroundColor Magenta
Write-Host ""

# Step 1: Load .env file
Write-Host "📋 Loading .env file..." -ForegroundColor Cyan
if (Test-Path ".env") {
  $envContent = Get-Content ".env"
  foreach ($line in $envContent) {
    if ($line -match '^([^#][^=]+)=(.+)$') {
      $name = $matches[1].Trim()
      $value = $matches[2].Trim().Trim('"')
      [Environment]::SetEnvironmentVariable($name, $value, "Process")
      Write-Host "   ✅ Loaded: $name" -ForegroundColor Green
    }
  }
}
else {
  Write-Host "   ❌ .env file not found!" -ForegroundColor Red
  exit 1
}

# Step 2: Set critical ISR variables if missing
$criticalVars = @{
  "PORT"    = "3001"
  "APP_URL" = "http://localhost:3000"
}

Write-Host "`n🔧 Verifying critical ISR variables..." -ForegroundColor Cyan
foreach ($var in $criticalVars.Keys) {
  if (-not $env:$var) {
    $env:$var = $criticalVars[$var]
    Write-Host "   ⚠️  Added missing: $var = $($criticalVars[$var])" -ForegroundColor Yellow
  }
  else {
    Write-Host "   ✅ Valid: $var = $($env:$var)" -ForegroundColor Green
  }
}

# Step 3: Display build environment
Write-Host "`n📊 Build Environment:" -ForegroundColor Cyan
Write-Host "   PORT: $env:PORT" -ForegroundColor White
Write-Host "   APP_URL: $env:APP_URL" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_APP_URL: $env:NEXT_PUBLIC_APP_URL" -ForegroundColor White
Write-Host "   NODE_ENV: $env:NODE_ENV" -ForegroundColor White

# Step 4: Run build
Write-Host "`n🚀 Starting Next.js build..." -ForegroundColor Green
Write-Host ""

try {
  npm run build
  $exitCode = $LASTEXITCODE

  if ($exitCode -eq 0) {
    Write-Host "`n✅ Build completed successfully!" -ForegroundColor Green
    Write-Host "🌟 Divine agricultural consciousness preserved!" -ForegroundColor Magenta
  }
  else {
    Write-Host "`n❌ Build failed with exit code: $exitCode" -ForegroundColor Red
    exit $exitCode
  }
}
catch {
  Write-Host "`n❌ Build failed with error: $_" -ForegroundColor Red
  exit 1
}
