#!/usr/bin/env pwsh
# Divine Environment Setup for Next.js Builds
# Ensures all required environment variables are set before building

param(
  [string]$Environment = "development"
)

Write-Host "🔧 Divine Environment Setup Starting..." -ForegroundColor Cyan
Write-Host "   Environment: $Environment" -ForegroundColor Gray

# Define required environment variables
$requiredVars = @{
  "PORT"                = "3000"
  "NEXT_PUBLIC_API_URL" = if ($Environment -eq "production") {
    "https://api.farmersmarket.com"
  }
  else {
    "http://localhost:3000"
  }
  "APP_URL"             = if ($Environment -eq "production") {
    "https://farmersmarket.com"
  }
  else {
    "http://localhost:3000"
  }
  "NODE_ENV"            = $Environment
}

# Load existing .env file
$envFile = if ($Environment -eq "production") { ".env.production" } else { ".env" }
$envPath = Join-Path $PSScriptRoot ".." $envFile

Write-Host "   📄 Loading environment from: $envFile" -ForegroundColor Yellow

if (Test-Path $envPath) {
  Get-Content $envPath | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.*)$') {
      $key = $matches[1].Trim()
      $value = $matches[2].Trim()
      if (-not [string]::IsNullOrWhiteSpace($key)) {
        Set-Item -Path "env:$key" -Value $value -Force
      }
    }
  }
  Write-Host "   ✅ Environment file loaded" -ForegroundColor Green
}
else {
  Write-Host "   ⚠️  Warning: $envFile not found" -ForegroundColor Yellow
}

# Set required variables (override if necessary)
Write-Host "   🌟 Setting required build variables..." -ForegroundColor Yellow
foreach ($var in $requiredVars.GetEnumerator()) {
  Set-Item -Path "env:$($var.Key)" -Value $var.Value -Force
  Write-Host "      ✓ $($var.Key) = $($var.Value)" -ForegroundColor Gray
}

# Verify all required variables are set
Write-Host "`n   🔍 Verifying environment setup..." -ForegroundColor Yellow
$allSet = $true
foreach ($var in $requiredVars.Keys) {
  $value = [Environment]::GetEnvironmentVariable($var)
  if ([string]::IsNullOrWhiteSpace($value)) {
    Write-Host "      ❌ Missing: $var" -ForegroundColor Red
    $allSet = $false
  }
  else {
    Write-Host "      ✓ $var is set" -ForegroundColor Green
  }
}

if ($allSet) {
  Write-Host "`n✅ Divine Environment Setup Complete!" -ForegroundColor Green
  Write-Host "   🚀 Ready for Next.js build" -ForegroundColor Magenta
  exit 0
}
else {
  Write-Host "`n❌ Environment setup incomplete!" -ForegroundColor Red
  Write-Host "   Please check missing variables above" -ForegroundColor Yellow
  exit 1
}
