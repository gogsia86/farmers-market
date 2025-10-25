#!/usr/bin/env pwsh
# ============================================================================
# TEST SUITE PROFILING SCRIPT - HP OMEN RTX 2070 DIVINE TESTING PROFILER
# ============================================================================
# Purpose: Profile test suite execution for performance optimization
# Hardware: RTX 2070 Max-Q + 64GB RAM + 12 threads
# Updated: October 22, 2025
# ============================================================================

param(
  [string]$TestType = "all",
  [string]$OutputDir = "profiling_output"
)

Write-Host "🧪 Starting Test Suite Divine Profiling..." -ForegroundColor Blue
Write-Host "Test Type: $TestType" -ForegroundColor Cyan
Write-Host "Output Directory: $OutputDir" -ForegroundColor Cyan

# Create output directory
if (!(Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
  Write-Host "📁 Created output directory: $OutputDir" -ForegroundColor Yellow
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Ensure we're in the correct directory
if (!(Test-Path "package.json")) {
  Write-Warning "⚠️  Not in project root. Changing to Farmers-Market directory..."
  Set-Location "Farmers-Market" -ErrorAction SilentlyContinue
  if (!(Test-Path "package.json")) {
    Write-Error "❌ Cannot find package.json. Please run from project root."
    exit 1
  }
}

# Test suite profiling function
function Profile-TestSuite {
  param(
    [string]$TestCommand,
    [string]$TestName,
    [string]$OutputFile
  )

  Write-Host "🎯 Profiling: $TestName..." -ForegroundColor Green

  $startTime = Get-Date

  try {
    # Profile the test execution
    $measureResult = Measure-Command {
      & npm run $TestCommand 2>&1 | Tee-Object -FilePath "$OutputFile.log"
    }

    $endTime = Get-Date

    # Collect performance metrics
    $metrics = @{
      TestName    = $TestName
      Command     = $TestCommand
      StartTime   = $startTime
      EndTime     = $endTime
      Duration    = $measureResult.TotalSeconds
      ExitCode    = $LASTEXITCODE
      MemoryUsage = (Get-Process -Name "node" -ErrorAction SilentlyContinue | Measure-Object WorkingSet -Sum).Sum
    }

    # Save metrics to JSON
    $metrics | ConvertTo-Json | Out-File -FilePath "$OutputFile.json" -Encoding UTF8

    Write-Host "✅ $TestName completed in $([math]::Round($measureResult.TotalSeconds, 2)) seconds" -ForegroundColor Green

    return $metrics
  }
  catch {
    Write-Warning "⚠️  $TestName failed: $_"
    return $null
  }
}

# Profile different test types
$allMetrics = @()

switch ($TestType.ToLower()) {
  "unit" {
    Write-Host "🔬 Profiling Unit Tests..." -ForegroundColor Blue
    $metrics = Profile-TestSuite -TestCommand "test:unit" -TestName "Unit Tests" -OutputFile "$OutputDir\unit_tests_$timestamp"
    if ($metrics) { $allMetrics += $metrics }
  }
  "integration" {
    Write-Host "🔗 Profiling Integration Tests..." -ForegroundColor Blue
    $metrics = Profile-TestSuite -TestCommand "test:integration" -TestName "Integration Tests" -OutputFile "$OutputDir\integration_tests_$timestamp"
    if ($metrics) { $allMetrics += $metrics }
  }
  "e2e" {
    Write-Host "🎭 Profiling E2E Tests..." -ForegroundColor Blue
    $metrics = Profile-TestSuite -TestCommand "test:e2e" -TestName "E2E Tests" -OutputFile "$OutputDir\e2e_tests_$timestamp"
    if ($metrics) { $allMetrics += $metrics }
  }
  "all" {
    Write-Host "🎯 Profiling All Test Suites..." -ForegroundColor Blue

    # Unit Tests
    $unitMetrics = Profile-TestSuite -TestCommand "test:unit" -TestName "Unit Tests" -OutputFile "$OutputDir\unit_tests_$timestamp"
    if ($unitMetrics) { $allMetrics += $unitMetrics }

    # Integration Tests
    $integrationMetrics = Profile-TestSuite -TestCommand "test:integration" -TestName "Integration Tests" -OutputFile "$OutputDir\integration_tests_$timestamp"
    if ($integrationMetrics) { $allMetrics += $integrationMetrics }

    # E2E Tests
    $e2eMetrics = Profile-TestSuite -TestCommand "test:e2e" -TestName "E2E Tests" -OutputFile "$OutputDir\e2e_tests_$timestamp"
    if ($e2eMetrics) { $allMetrics += $e2eMetrics }

    # Coverage Tests
    $coverageMetrics = Profile-TestSuite -TestCommand "test:coverage" -TestName "Coverage Tests" -OutputFile "$OutputDir\coverage_tests_$timestamp"
    if ($coverageMetrics) { $allMetrics += $coverageMetrics }
  }
  "coverage" {
    Write-Host "📊 Profiling Coverage Tests..." -ForegroundColor Blue
    $metrics = Profile-TestSuite -TestCommand "test:coverage" -TestName "Coverage Tests" -OutputFile "$OutputDir\coverage_tests_$timestamp"
    if ($metrics) { $allMetrics += $metrics }
  }
  default {
    Write-Error "❌ Unknown test type: $TestType. Use: unit, integration, e2e, coverage, or all"
    exit 1
  }
}

# Generate comprehensive test performance report
$reportFile = "$OutputDir\test_performance_report_$timestamp.md"

try {
  $totalDuration = ($allMetrics | Measure-Object Duration -Sum).Sum
  $averageDuration = if ($allMetrics.Count -gt 0) { $totalDuration / $allMetrics.Count } else { 0 }
  $totalMemory = ($allMetrics | Measure-Object MemoryUsage -Sum).Sum / 1MB

  @"
# 🧪 Test Suite Performance Report
**Generated:** $(Get-Date)
**Hardware:** HP OMEN i7-9750H + RTX 2070 Max-Q + 64GB RAM
**Project:** Farmers Market Platform
**Test Type:** $TestType

## 📊 Performance Summary

- **Total Test Duration:** $([math]::Round($totalDuration, 2)) seconds
- **Average Test Duration:** $([math]::Round($averageDuration, 2)) seconds
- **Total Memory Usage:** $([math]::Round($totalMemory, 2)) MB
- **Tests Executed:** $($allMetrics.Count)

## 📋 Individual Test Results

$(foreach ($metric in $allMetrics) {
    @"
### $($metric.TestName)
- **Command:** ``npm run $($metric.Command)``
- **Duration:** $([math]::Round($metric.Duration, 2)) seconds
- **Memory Usage:** $([math]::Round($metric.MemoryUsage / 1MB, 2)) MB
- **Exit Code:** $($metric.ExitCode)
- **Status:** $(if ($metric.ExitCode -eq 0) { "✅ PASSED" } else { "❌ FAILED" })

"@
})

## 🎯 Performance Insights

$(if ($totalDuration -lt 30) {
    "✅ **Excellent:** Test suite execution is very fast (< 30 seconds)"
} elseif ($totalDuration -lt 60) {
    "🟡 **Good:** Test suite execution is acceptable (30-60 seconds)"
} else {
    "🔴 **Slow:** Test suite execution is slow (> 60 seconds) - consider optimization"
})

$(if ($totalMemory -lt 500) {
    "✅ **Excellent:** Memory usage is efficient (< 500 MB)"
} elseif ($totalMemory -lt 1000) {
    "🟡 **Good:** Memory usage is acceptable (500-1000 MB)"
} else {
    "🔴 **High:** Memory usage is high (> 1000 MB) - check for memory leaks"
})

## 🔧 Optimization Recommendations

### Performance Optimizations
1. **Parallel Test Execution:** Use Jest's ``--maxWorkers`` option
2. **Test Isolation:** Ensure tests don't interfere with each other
3. **Mock Heavy Operations:** Mock database and external API calls
4. **Cache Dependencies:** Use test result caching when possible

### Memory Optimizations
1. **Clean Up Resources:** Ensure proper cleanup in test teardown
2. **Limit Concurrent Tests:** Reduce memory pressure by limiting parallelism
3. **Mock Large Objects:** Use lightweight mocks instead of real objects
4. **Monitor Memory Leaks:** Check for growing memory usage over time

### Hardware Utilization
- **CPU:** Utilize all 12 logical processors with ``--maxWorkers=12``
- **Memory:** Leverage 64GB RAM for extensive test caching
- **GPU:** Consider GPU-accelerated testing for computational tests

## 📈 Monitoring Commands

```powershell
# Run tests with profiling
npm run test:coverage -- --detectOpenHandles --forceExit

# Monitor memory during tests
Get-Process node | Select-Object Name, WorkingSet, CPU

# Profile specific test files
npm test -- --testNamePattern="YourTestName" --verbose
```

**Report generated by Divine Test Profiling System v1.0**
"@ | Out-File -FilePath $reportFile -Encoding UTF8

  Write-Host "✅ Test performance report generated!" -ForegroundColor Green
  Write-Host "📊 Report: $reportFile" -ForegroundColor Cyan
}
catch {
  Write-Warning "⚠️  Report generation failed: $_"
}

Write-Host ""
Write-Host "🌟 TEST SUITE PROFILING COMPLETE! 🌟" -ForegroundColor Blue
Write-Host "📁 All files saved to: $OutputDir" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Yellow
foreach ($metric in $allMetrics) {
  $status = if ($metric.ExitCode -eq 0) { "✅" } else { "❌" }
  Write-Host "  $status $($metric.TestName): $([math]::Round($metric.Duration, 2))s" -ForegroundColor White
}
Write-Host ""
