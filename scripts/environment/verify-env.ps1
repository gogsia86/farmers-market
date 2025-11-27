#!/usr/bin/env pwsh
# ============================================
# ENVIRONMENT VERIFICATION SCRIPT
# Ensures all required variables are set
# ============================================

param(
  [switch]$Fix,
  [switch]$Build
)

Write-Host "🔍 Verifying Environment Variables..." -ForegroundColor Cyan

# Required variables for Next.js ISR
$requiredVars = @{
  "PORT"                = "3001"
  "APP_URL"             = "http://localhost:3000"
  "NEXT_PUBLIC_APP_URL" = "http://localhost:3000"
  "NEXT_PUBLIC_API_URL" = "http://localhost:3000/api"
}

$missing = @()
$incorrect = @()

# Check each variable
foreach ($var in $requiredVars.Keys) {
  $value = [Environment]::GetEnvironmentVariable($var)

  if (-not $value) {
    $missing += $var
    Write-Host "   ❌ Missing: $var" -ForegroundColor Red
  }
  elseif ($value -ne $requiredVars[$var]) {
    $incorrect += "$var (expected: $($requiredVars[$var]), got: $value)"
    Write-Host "   ⚠️  Incorrect: $var = $value" -ForegroundColor Yellow
  }
  else {
    Write-Host "   ✅ Valid: $var = $value" -ForegroundColor Green
  }
}

# Check .env file
if (Test-Path ".env") {
  Write-Host "`n📄 Checking .env file..." -ForegroundColor Cyan
  $envContent = Get-Content ".env" -Raw

  foreach ($var in $requiredVars.Keys) {
    if ($envContent -match "$var=") {
      Write-Host "   ✅ .env has $var" -ForegroundColor Green
    }
    else {
      Write-Host "   ❌ .env missing $var" -ForegroundColor Red
    }
  }
}
else {
  Write-Host "   ❌ .env file not found!" -ForegroundColor Red
}

# Fix option
if ($Fix) {
  Write-Host "`n🔧 Fixing environment variables..." -ForegroundColor Yellow

  foreach ($var in $requiredVars.Keys) {
    $env:$var = $requiredVars[$var]
    Write-Host "   ✅ Set $var = $($requiredVars[$var])" -ForegroundColor Green
  }

  Write-Host "`n✅ Environment variables fixed for this session!" -ForegroundColor Green
  Write-Host "   NOTE: These are temporary. For permanent fix, update your .env file." -ForegroundColor Yellow
}

# Build option
if ($Build) {
  Write-Host "`n🏗️  Setting variables and running build..." -ForegroundColor Cyan

  # Set all required variables
  foreach ($var in $requiredVars.Keys) {
    $env:$var = $requiredVars[$var]
  }

  # Run build
  Write-Host "`n🚀 Starting build with verified environment..." -ForegroundColor Green
  npm run build
}
elseif ($missing.Count -gt 0 -or $incorrect.Count -gt 0) {
  Write-Host "`n⚠️  Issues found! Fix with:" -ForegroundColor Yellow
  Write-Host "   .\scripts\verify-env.ps1 -Fix" -ForegroundColor White
  Write-Host "   Or to fix and build:" -ForegroundColor White
  Write-Host "   .\scripts\verify-env.ps1 -Build" -ForegroundColor White
  exit 1
}
else {
  Write-Host "`n✅ All environment variables are correctly configured!" -ForegroundColor Green
}
