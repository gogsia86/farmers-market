# 🤖 Unified Bot Framework - CLI Guide

> Comprehensive guide to using the UBF command-line interface for running tests, generating reports, and monitoring the Farmers Market Platform.

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Commands](#commands)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Filters and Selection](#filters-and-selection)
- [Reports](#reports)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Show help
npm run bot help

# List available modules
npm run bot:list

# Run health checks
npm run bot:test:health

# Run all tests
npm run bot:test:all

# Run with headed browser (visible)
npm run bot test health -- --headed

# Run critical tests in CI mode
npm run bot:test:critical -- --preset=ci
```

---

## Installation

The CLI is included with the Unified Bot Framework. No additional installation is required.

### Prerequisites

- Node.js 18+
- npm 9+
- Playwright browsers installed: `npx playwright install`

### Verify Installation

```bash
npm run bot:info
```

This will display the framework version, status, and available features.

---

## Commands

### Core Commands

#### `bot help`
Display comprehensive help information.

```bash
npm run bot:help
```

#### `bot info`
Show framework information, version, and status.

```bash
npm run bot:info
```

#### `bot list [modules|suites]`
List all available test modules or suites.

```bash
# List modules
npm run bot:list

# List suites
npm run bot:list:suites
```

#### `bot test <module|suite>`
Run a specific test module or suite.

```bash
# Run health checks module
npm run bot test health

# Run marketplace suite
npm run bot test marketplace
```

#### `bot test:all`
Run all registered test modules.

```bash
npm run bot:test:all
```

#### `bot test:health`
Quick command to run health checks (alias).

```bash
npm run bot:test:health
```

#### `bot test:critical`
Run only critical priority tests.

```bash
npm run bot:test:critical
```

#### `bot monitor <suite>`
Start continuous monitoring mode.

```bash
# Monitor health checks every 60 seconds
npm run bot monitor health

# Custom interval (30 seconds)
npm run bot monitor health -- --interval=30
```

#### `bot report [latest|<path>]`
View or generate test reports.

```bash
npm run bot:report
```

---

## Configuration

### Configuration Presets

The CLI supports multiple configuration presets optimized for different scenarios:

#### `quick` - Fast Validation
- 1 retry on failure
- Short timeouts (15s)
- Minimal logging
- Best for: Quick smoke tests

```bash
npm run bot test health -- --preset=quick
```

#### `mvp` - MVP Validation (Default)
- 2 retries on failure
- Standard timeouts (30s)
- Balanced logging
- Best for: Standard validation

```bash
npm run bot test health -- --preset=mvp
```

#### `ci` - CI/CD Optimized
- Headless mode
- 2 retries
- Continue on failure
- Artifact collection enabled
- Best for: Automated pipelines

```bash
npm run bot test:all -- --preset=ci
```

#### `debug` - Debug Mode
- Headed browser (visible)
- No retries
- Verbose logging
- Slow motion enabled
- Best for: Investigating failures

```bash
npm run bot test health -- --preset=debug
```

#### `monitoring` - Continuous Monitoring
- Alert notifications enabled
- Health check optimized
- Graceful degradation
- Best for: Production monitoring

```bash
npm run bot monitor health -- --preset=monitoring
```

### Environment Variables

Configure the framework using environment variables:

```bash
# Base URL
export BASE_URL=http://localhost:3000

# Browser mode
export HEADLESS=true

# Timeouts
export TIMEOUT=30000
export NAVIGATION_TIMEOUT=60000

# Output directories
export SCREENSHOT_DIR=./screenshots
export REPORT_DIR=./reports

# Logging
export LOG_LEVEL=info
export VERBOSE=false

# Retries
export MAX_RETRIES=2

# Continue on failure
export CONTINUE_ON_FAILURE=true
```

### Command-Line Flags

Override configuration with CLI flags:

| Flag | Type | Description |
|------|------|-------------|
| `--preset=<name>` | string | Configuration preset |
| `--headless` | boolean | Run in headless mode |
| `--headed` | boolean | Run with visible browser |
| `--verbose` | boolean | Enable verbose logging |
| `--quiet` | boolean | Suppress non-essential output |
| `--filter=<json>` | string | Filter tests (JSON) |
| `--tags=<list>` | string | Filter by tags (comma-separated) |
| `--category=<cat>` | string | Filter by category |
| `--format=<fmt>` | string | Report format |
| `--output=<dir>` | string | Output directory |
| `--interval=<sec>` | number | Monitoring interval |
| `--continue-on-failure` | boolean | Continue after failures |

---

## Usage Examples

### Basic Test Execution

#### Run a Single Module

```bash
# Health checks
npm run bot test health

# Marketplace browsing
npm run bot test marketplace

# Cart and checkout
npm run bot test checkout

# Authentication
npm run bot test auth
```

#### Run a Test Suite

```bash
# Critical tests (health + auth)
npm run bot test critical

# Smoke tests (health + marketplace)
npm run bot test smoke

# Full suite (all modules)
npm run bot test full
```

### Advanced Execution

#### Headed Mode (Visible Browser)

```bash
# Watch tests execute
npm run bot test health -- --headed

# Debug mode with slow motion
npm run bot test marketplace -- --preset=debug
```

#### Filter by Tags

```bash
# Run only smoke tests
npm run bot test:all -- --tags=smoke

# Run critical and smoke tests
npm run bot test:all -- --tags=critical,smoke

# Exclude integration tests
npm run bot test:all -- --filter='{"exclude":{"tags":["integration"]}}'
```

#### Filter by Category

```bash
# Run only CRITICAL tests
npm run bot test:all -- --category=CRITICAL

# Run IMPORTANT tests
npm run bot test:all -- --category=IMPORTANT
```

#### Custom Configuration

```bash
# CI mode with continue on failure
npm run bot test:all -- --preset=ci --continue-on-failure

# Custom timeout and retries
BASE_URL=https://staging.example.com \
TIMEOUT=60000 \
MAX_RETRIES=3 \
npm run bot test health
```

### Monitoring Mode

#### Start Monitoring

```bash
# Monitor health checks (60s interval)
npm run bot monitor health

# Custom interval (30 seconds)
npm run bot monitor health -- --interval=30

# Monitor with alerts
npm run bot monitor health -- --preset=monitoring
```

#### Stop Monitoring

Press `Ctrl+C` to gracefully stop monitoring.

### Report Generation

Reports are automatically generated after each test run:

```bash
# Generate JSON report
npm run bot test health -- --format=json

# Generate Markdown report
npm run bot test health -- --format=markdown

# Generate HTML report
npm run bot test health -- --format=html

# Generate all formats
npm run bot test health -- --format=json,markdown,html

# Custom output directory
npm run bot test health -- --output=./test-results
```

---

## Filters and Selection

### Filter Syntax

Filters can be specified using JSON or convenience flags.

#### JSON Filter Structure

```json
{
  "moduleIds": ["health-checks", "auth-login"],
  "suiteIds": ["critical", "smoke"],
  "tags": ["smoke", "critical"],
  "categories": ["CRITICAL", "IMPORTANT"],
  "exclude": {
    "moduleIds": ["slow-module"],
    "tags": ["skip-ci"]
  }
}
```

#### Using JSON Filters

```bash
npm run bot test:all -- --filter='{"tags":["smoke"],"categories":["CRITICAL"]}'
```

#### Using Convenience Flags

```bash
# Filter by tags
npm run bot test:all -- --tags=smoke,critical

# Filter by category
npm run bot test:all -- --category=CRITICAL

# Combine filters
npm run bot test:all -- --tags=smoke --category=CRITICAL
```

### Available Tags

- `smoke` - Quick smoke tests
- `critical` - Critical functionality
- `integration` - Integration tests
- `e2e` - End-to-end tests
- `health` - Health checks
- `auth` - Authentication tests
- `marketplace` - Marketplace functionality
- `cart` - Shopping cart tests
- `checkout` - Checkout flow tests
- `payment` - Payment processing

### Available Categories

- `CRITICAL` - Must-pass tests for production
- `IMPORTANT` - Important functionality tests
- `OPTIONAL` - Nice-to-have tests

---

## Reports

### Report Formats

#### Console Report

Real-time output during test execution:

```
======================================================================
  Test Run Summary
======================================================================

Started:  2025-01-15 10:30:00
Finished: 2025-01-15 10:32:45
Duration: 165.23s

Results:
  ✓ Passed:  12/15
  ✗ Failed:  2/15
  ○ Skipped: 1/15

Success Rate: 80.00%
Avg Duration: 11006ms

Failed Tests:

  ✗ Cart & Checkout - Add Product to Cart
    Timeout waiting for cart button selector
    Screenshot: ./screenshots/cart-checkout-1673780400000.png

======================================================================
```

#### JSON Report

Machine-readable format for CI/CD integration:

```json
{
  "summary": {
    "total": 15,
    "passed": 12,
    "failed": 2,
    "skipped": 1,
    "successRate": 80.00,
    "avgDuration": 11006,
    "totalDuration": 165230
  },
  "results": [...],
  "startTime": "2025-01-15T10:30:00.000Z",
  "endTime": "2025-01-15T10:32:45.230Z",
  "duration": 165230,
  "config": {...}
}
```

#### Markdown Report

Human-readable format for documentation:

```markdown
# Test Run Report

**Date:** 2025-01-15 10:30:00
**Duration:** 165.23s

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | 15 |
| Passed | 12 |
| Failed | 2 |
| Skipped | 1 |
| Success Rate | 80.00% |

## Failed Tests

### Cart & Checkout - Add Product to Cart
- **Status:** Failed
- **Error:** Timeout waiting for cart button selector
- **Screenshot:** [View](./screenshots/cart-checkout-1673780400000.png)
```

#### HTML Report

Visual dashboard with charts and details:

```html
<!DOCTYPE html>
<html>
<head><title>Test Report</title></head>
<body>
  <div class="summary">
    <h1>Test Run Report</h1>
    <div class="metrics">
      <div class="metric success">
        <h2>12</h2>
        <p>Passed</p>
      </div>
      <!-- More metrics -->
    </div>
    <canvas id="chart"></canvas>
  </div>
  <!-- Test details -->
</body>
</html>
```

### Report Location

Reports are saved to the configured report directory (default: `./reports`):

```
reports/
├── test-run-1673780400000.json
├── test-run-1673780400000.md
├── test-run-1673780400000.html
└── latest.json -> test-run-1673780400000.json
```

---

## CI/CD Integration

### GitHub Actions

#### Basic Workflow

```yaml
name: UBF Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run critical tests
        run: npm run bot:test:critical -- --preset=ci
        env:
          BASE_URL: http://localhost:3000

      - name: Upload test reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-reports
          path: reports/

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: screenshots/
```

#### Advanced Workflow with Matrix

```yaml
name: UBF Full Suite

on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        suite: [health, marketplace, checkout, auth]
      fail-fast: false

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run ${{ matrix.suite }} tests
        run: npm run bot test ${{ matrix.suite }} -- --preset=ci
        env:
          BASE_URL: ${{ secrets.TEST_BASE_URL }}

      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: reports-${{ matrix.suite }}
          path: reports/

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: screenshots-${{ matrix.suite }}
          path: screenshots/

  notify:
    needs: test
    runs-on: ubuntu-latest
    if: failure()

    steps:
      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "UBF Tests Failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "❌ UBF test suite failed on ${{ github.ref }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### GitLab CI

```yaml
stages:
  - test
  - report

variables:
  BASE_URL: "http://localhost:3000"

test:critical:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  script:
    - npm ci
    - npm run bot:test:critical -- --preset=ci
  artifacts:
    when: always
    paths:
      - reports/
      - screenshots/
    reports:
      junit: reports/junit.xml

test:full:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  script:
    - npm ci
    - npm run bot:test:all -- --preset=ci
  artifacts:
    when: always
    paths:
      - reports/
  only:
    - schedules
    - main
```

### Jenkins

```groovy
pipeline {
    agent any

    environment {
        BASE_URL = 'http://localhost:3000'
        HEADLESS = 'true'
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Test: Critical') {
            steps {
                sh 'npm run bot:test:critical -- --preset=ci'
            }
        }

        stage('Test: Full Suite') {
            when {
                branch 'main'
            }
            steps {
                sh 'npm run bot:test:all -- --preset=ci'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
            archiveArtifacts artifacts: 'screenshots/**/*', allowEmptyArchive: true

            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'reports',
                reportFiles: '*.html',
                reportName: 'UBF Test Report'
            ])
        }

        failure {
            emailext(
                subject: "UBF Tests Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Check console output at ${env.BUILD_URL}",
                to: "team@example.com"
            )
        }
    }
}
```

---

## Troubleshooting

### Common Issues

#### Playwright Not Installed

**Error:**
```
browserType.launch: Executable doesn't exist at /path/to/chromium
```

**Solution:**
```bash
npx playwright install --with-deps
```

#### Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find and kill process using port 3000
npx kill-port 3000

# Or use different port
BASE_URL=http://localhost:3001 npm run bot test health
```

#### Timeout Errors

**Error:**
```
Timeout 30000ms exceeded waiting for selector
```

**Solution:**
```bash
# Increase timeout
TIMEOUT=60000 npm run bot test health

# Or use debug preset
npm run bot test health -- --preset=debug
```

#### Module Not Found

**Error:**
```
Cannot find module 'health-checks'
```

**Solution:**
```bash
# List available modules
npm run bot:list

# Use correct module ID
npm run bot test health-checks
```

### Debug Mode

Run tests in debug mode for detailed troubleshooting:

```bash
# Debug preset (headed, verbose, no retries)
npm run bot test health -- --preset=debug

# Manual debug configuration
npm run bot test health -- --headed --verbose
```

### Verbose Logging

Enable verbose logging for detailed output:

```bash
# CLI flag
npm run bot test health -- --verbose

# Environment variable
VERBOSE=true npm run bot test health

# Debug log level
LOG_LEVEL=debug npm run bot test health
```

### Screenshot Analysis

Screenshots are automatically captured on failures:

```bash
# Location
./screenshots/

# Naming pattern
<module-id>-<timestamp>.png

# Example
health-checks-1673780400000.png
```

### Log Files

Check log files for detailed execution information:

```bash
# Application logs
tail -f logs/app.log

# Test execution logs
tail -f logs/test-runner.log

# Browser console logs
cat logs/browser-console.log
```

---

## Best Practices

### Test Execution

1. **Start with health checks** - Always run health checks first
2. **Use appropriate presets** - Match preset to use case (quick, ci, debug)
3. **Filter strategically** - Use tags and categories to run relevant tests
4. **Continue on failure in CI** - Use `--continue-on-failure` for comprehensive results

### Monitoring

1. **Set reasonable intervals** - Balance between coverage and load (60-300s)
2. **Monitor critical paths** - Focus on business-critical functionality
3. **Enable alerts** - Configure notifications for production monitoring
4. **Review trends** - Analyze historical data for patterns

### CI/CD Integration

1. **Run critical tests on every PR** - Fast feedback loop
2. **Run full suite on merge** - Comprehensive validation
3. **Schedule periodic runs** - Catch regressions early
4. **Archive artifacts** - Keep reports and screenshots for analysis
5. **Fail builds on critical failures** - Maintain quality gates

### Reporting

1. **Generate multiple formats** - JSON for machines, HTML for humans
2. **Store historical data** - Track trends over time
3. **Include screenshots** - Visual evidence of failures
4. **Share reports** - Make results accessible to team

---

## Next Steps

- [Phase 3 Implementation Guide](./PHASE_3_IMPLEMENTATION.md)
- [Test Module Development](./MODULE_DEVELOPMENT.md)
- [CI/CD Setup Guide](./CICD_SETUP.md)
- [API Reference](./API_REFERENCE.md)

---

**Version:** 1.0.0
**Last Updated:** January 2025
**Status:** ✅ Production Ready
