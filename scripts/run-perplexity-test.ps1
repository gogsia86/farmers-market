#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Run Perplexity test suite with environment variables loaded

.DESCRIPTION
    This script loads the .env file and runs the Perplexity test suite
#>

Write-Host "🔮 Loading Perplexity Test Environment..." -ForegroundColor Cyan

# Load .env file
if (Test-Path .env) {
  Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
      $name = $matches[1]
      $value = $matches[2]
      [Environment]::SetEnvironmentVariable($name, $value, "Process")
      Write-Host "   ✅ Loaded: $name" -ForegroundColor Green
    }
  }
}
else {
  Write-Host "   ⚠️  .env file not found" -ForegroundColor Yellow
}

Write-Host "`n🚀 Running Perplexity Test Suite...`n" -ForegroundColor Cyan

# Run test
npx tsx scripts/test-perplexity.ts

Write-Host "`n✨ Test complete!" -ForegroundColor Green
