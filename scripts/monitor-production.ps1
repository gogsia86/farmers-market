#!/usr/bin/env pwsh
# 📊 PRODUCTION MONITORING DASHBOARD
# Real-time monitoring script for production deployment

param(
    [int]$RefreshInterval = 30,
    [switch]$Continuous = $false
)

$ErrorActionPreference = "Stop"

# Configuration
$AppUrl = $env:NEXT_PUBLIC_APP_URL ?? "https://farmersmarket.app"
$HealthEndpoint = "$AppUrl/api/health"
$ReadyEndpoint = "$AppUrl/api/health/ready"

function Get-ColoredStatus {
    param([string]$Status)

    switch ($Status) {
        "healthy" { return Write-Host "✅ HEALTHY" -ForegroundColor Green -NoNewline }
        "degraded" { return Write-Host "⚠️  DEGRADED" -ForegroundColor Yellow -NoNewline }
        "unhealthy" { return Write-Host "❌ UNHEALTHY" -ForegroundColor Red -NoNewline }
        default { return Write-Host "❓ UNKNOWN" -ForegroundColor Gray -NoNewline }
    }
}

function Get-HealthStatus {
    try {
        $response = Invoke-RestMethod -Uri $HealthEndpoint -Method Get -TimeoutSec 10
        return $response
    }
    catch {
        return @{
            status = "unhealthy"
            error = $_.Exception.Message
        }
    }
}

function Get-ReadinessStatus {
    try {
        $response = Invoke-RestMethod -Uri $ReadyEndpoint -Method Get -TimeoutSec 5
        return $response
    }
    catch {
        return @{
            ready = $false
            reason = $_.Exception.Message
        }
    }
}

function Show-Dashboard {
    Clear-Host

    Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║       🌾 FARMERS MARKET - PRODUCTION MONITOR 🌾          ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

    Write-Host "`n🌐 Application URL: " -NoNewline -ForegroundColor White
    Write-Host $AppUrl -ForegroundColor Cyan

    Write-Host "⏰ Last Check: " -NoNewline -ForegroundColor White
    Write-Host (Get-Date -Format "yyyy-MM-dd HH:mm:ss") -ForegroundColor Cyan

    Write-Host "`n─────────────────────────────────────────────────────────────" -ForegroundColor Gray

    # Get health status
    Write-Host "`n📊 SYSTEM HEALTH" -ForegroundColor Yellow
    $health = Get-HealthStatus

    if ($health.error) {
        Write-Host "  Status: " -NoNewline -ForegroundColor White
        Write-Host "❌ ERROR" -ForegroundColor Red
        Write-Host "  Error: $($health.error)" -ForegroundColor Red
    }
    else {
        Write-Host "  Overall Status: " -NoNewline -ForegroundColor White
        Get-ColoredStatus -Status $health.status
        Write-Host ""

        Write-Host "  Version: " -NoNewline -ForegroundColor White
        Write-Host $health.version -ForegroundColor Cyan

        Write-Host "  Uptime: " -NoNewline -ForegroundColor White
        $uptimeHours = [math]::Round($health.uptime / 3600, 2)
        Write-Host "$uptimeHours hours" -ForegroundColor Cyan

        Write-Host "  Response Time: " -NoNewline -ForegroundColor White
        $responseColor = if ($health.responseTime -lt 100) { "Green" }
                        elseif ($health.responseTime -lt 500) { "Yellow" }
                        else { "Red" }
        Write-Host "$($health.responseTime)ms" -ForegroundColor $responseColor

        # Database status
        Write-Host "`n  📦 Database:" -ForegroundColor Yellow
        if ($health.checks.database.status -eq "up") {
            Write-Host "    Status: " -NoNewline -ForegroundColor White
            Write-Host "✅ UP" -ForegroundColor Green
            Write-Host "    Response Time: " -NoNewline -ForegroundColor White
            Write-Host "$($health.checks.database.responseTime)ms" -ForegroundColor Cyan
        }
        else {
            Write-Host "    Status: " -NoNewline -ForegroundColor White
            Write-Host "❌ DOWN" -ForegroundColor Red
            if ($health.checks.database.error) {
                Write-Host "    Error: $($health.checks.database.error)" -ForegroundColor Red
            }
        }

        # Memory status
        Write-Host "`n  💾 Memory:" -ForegroundColor Yellow
        $memoryColor = if ($health.checks.memory.percentage -lt 70) { "Green" }
                      elseif ($health.checks.memory.percentage -lt 90) { "Yellow" }
                      else { "Red" }
        Write-Host "    Used: " -NoNewline -ForegroundColor White
        Write-Host "$($health.checks.memory.used)MB / $($health.checks.memory.total)MB " -NoNewline -ForegroundColor Cyan
        Write-Host "($($health.checks.memory.percentage)%)" -ForegroundColor $memoryColor

        # Environment
        Write-Host "`n  🌍 Environment:" -ForegroundColor Yellow
        Write-Host "    Mode: " -NoNewline -ForegroundColor White
        Write-Host $health.checks.environment -ForegroundColor Cyan
    }

    # Get readiness status
    Write-Host "`n─────────────────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "`n🔍 READINESS CHECK" -ForegroundColor Yellow
    $ready = Get-ReadinessStatus

    Write-Host "  Status: " -NoNewline -ForegroundColor White
    if ($ready.ready) {
        Write-Host "✅ READY" -ForegroundColor Green
    }
    else {
        Write-Host "❌ NOT READY" -ForegroundColor Red
        Write-Host "  Reason: $($ready.reason)" -ForegroundColor Red
    }

    # Quick stats
    Write-Host "`n─────────────────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "`n📈 QUICK STATS" -ForegroundColor Yellow

    # Check homepage
    try {
        $homepageStart = Get-Date
        $homepageResponse = Invoke-WebRequest -Uri $AppUrl -Method Get -TimeoutSec 10
        $homepageDuration = ((Get-Date) - $homepageStart).TotalMilliseconds

        Write-Host "  Homepage: " -NoNewline -ForegroundColor White
        Write-Host "✅ $($homepageResponse.StatusCode) " -NoNewline -ForegroundColor Green
        Write-Host "($([math]::Round($homepageDuration, 0))ms)" -ForegroundColor Cyan
    }
    catch {
        Write-Host "  Homepage: " -NoNewline -ForegroundColor White
        Write-Host "❌ ERROR" -ForegroundColor Red
    }

    Write-Host "`n─────────────────────────────────────────────────────────────" -ForegroundColor Gray

    if ($Continuous) {
        Write-Host "`n🔄 Next refresh in $RefreshInterval seconds..." -ForegroundColor Gray
        Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
    }
}

# Main execution
if ($Continuous) {
    Write-Host "🚀 Starting continuous monitoring..." -ForegroundColor Green
    Write-Host "   Refresh interval: $RefreshInterval seconds" -ForegroundColor Cyan
    Write-Host "   Press Ctrl+C to stop`n" -ForegroundColor Gray

    while ($true) {
        Show-Dashboard
        Start-Sleep -Seconds $RefreshInterval
    }
}
else {
    Show-Dashboard
    Write-Host "`n💡 Tip: Use -Continuous flag for real-time monitoring" -ForegroundColor Gray
    Write-Host "   Example: .\monitor-production.ps1 -Continuous -RefreshInterval 30`n" -ForegroundColor Gray
}
