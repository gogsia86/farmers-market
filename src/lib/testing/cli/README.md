# 🤖 Unified Bot Framework CLI

Command-line interface for the Unified Bot Framework testing system.

## Quick Start

```bash
# Show available commands
npm run bot:help

# List available test modules
npm run bot:list

# Run health checks
npm run bot:test:health

# Run all tests
npm run bot:test:all
```

## Architecture

```
cli/
├── index.ts          # Main CLI implementation
└── README.md         # This file
```

## Key Features

### Command Execution

- Single module/suite execution
- Batch execution with filters
- Continuous monitoring mode
- Manual workflow dispatch

### Configuration

- Multiple presets (quick, mvp, ci, debug, monitoring)
- Environment variable support
- CLI flag overrides
- Filter system (tags, categories, modules)

### Reporting

- Multiple formats (JSON, Markdown, HTML, Console)
- Automatic generation after runs
- Artifact storage for CI/CD
- Historical data tracking

### CI/CD Integration

- GitHub Actions workflow included
- Matrix testing strategy
- Artifact upload (reports, screenshots)
- PR comments with results

## CLI Implementation

### Main Entry Point

```typescript
// scripts/bot-cli.js
const { spawn } = require("child_process");
const cliPath = path.join(
  __dirname,
  "..",
  "src",
  "lib",
  "testing",
  "cli",
  "index.ts",
);
spawn("npx", ["tsx", cliPath, ...args], { stdio: "inherit", shell: true });
```

### Command Parser

```typescript
parseArgs() {
  // Parses positional args and flags
  // Supports --flag=value and -f formats
}
```

### Configuration Builder

```typescript
getConfig(options: CLIOptions): BotConfig {
  const preset = options.flags.preset || 'mvp';
  const config = createConfig(preset);
  // Override with CLI flags
  return config;
}
```

### Test Execution

```typescript
async runTest(options: CLIOptions) {
  const runner = createTestRunner(config, filter);
  runner.registerModules(getAvailableModules());
  const report = await runner.runModule(target);
  printReportSummary(report);
}
```

## Available Commands

### Core Commands

- `bot help` - Show help information
- `bot info` - Show framework information
- `bot list [modules|suites]` - List available tests

### Test Execution

- `bot test <module|suite>` - Run specific test
- `bot test:all` - Run all tests
- `bot test:health` - Run health checks
- `bot test:critical` - Run critical tests

### Monitoring

- `bot monitor <suite>` - Start continuous monitoring

### Reporting

- `bot report` - View/generate reports

## Configuration Presets

### Quick

Fast validation with minimal retries:

```bash
npm run bot test health -- --preset=quick
```

### MVP (Default)

Balanced validation with standard settings:

```bash
npm run bot test health -- --preset=mvp
```

### CI

CI/CD optimized (headless, retries, continue on failure):

```bash
npm run bot:test:all -- --preset=ci
```

### Debug

Debug mode (headed, verbose, no retries):

```bash
npm run bot test health -- --preset=debug
```

### Monitoring

Continuous monitoring with alerts:

```bash
npm run bot monitor health -- --preset=monitoring
```

## CLI Flags

### Execution Flags

- `--preset=<name>` - Configuration preset
- `--headless` - Run in headless mode
- `--headed` - Run with visible browser
- `--verbose` - Enable verbose logging
- `--quiet` - Suppress non-essential output

### Filter Flags

- `--filter=<json>` - Filter tests (JSON)
- `--tags=<list>` - Filter by tags (comma-separated)
- `--category=<cat>` - Filter by category

### Output Flags

- `--format=<fmt>` - Report format (json, markdown, html, console)
- `--output=<dir>` - Output directory for reports

### Behavior Flags

- `--interval=<sec>` - Monitoring interval (default: 60)
- `--continue-on-failure` - Continue after failures

## Examples

### Basic Execution

```bash
# Run health checks
npm run bot test health

# Run marketplace tests
npm run bot test marketplace

# Run with headed browser
npm run bot test health -- --headed
```

### Advanced Filtering

```bash
# Filter by tags
npm run bot test:all -- --tags=smoke,critical

# Filter by category
npm run bot test:all -- --category=CRITICAL

# JSON filter
npm run bot test:all -- --filter='{"tags":["smoke"],"exclude":{"moduleIds":["slow-test"]}}'
```

### Monitoring

```bash
# Start monitoring (60s interval)
npm run bot monitor health

# Custom interval (30 seconds)
npm run bot monitor health -- --interval=30
```

### CI/CD

```bash
# Run in CI mode
npm run bot:test:critical -- --preset=ci

# Generate all report formats
npm run bot test health -- --format=json,markdown,html
```

## Output

### Console Output

```
🤖 Starting test run...

Target: health
Preset: mvp
Mode:   headless

[TestRunner] Running suite: health (mode: sequential)
[TestRunner] ✓ Homepage Availability (1234ms)
[TestRunner] ✓ Database Connectivity (567ms)
[TestRunner] ✗ API Endpoints - /api/farms (timeout)

======================================================================
  Test Run Summary
======================================================================

Results:
  ✓ Passed:  12/13
  ✗ Failed:  1/13
  ○ Skipped: 0/13

Success Rate: 92.31%
```

### Report Files

```
reports/
├── test-run-1673780400000.json      # Machine-readable
├── test-run-1673780400000.md        # Human-readable
├── test-run-1673780400000.html      # Visual dashboard
└── latest.json -> test-run-1673780400000.json
```

### Screenshots

```
screenshots/
├── health-checks-1673780400000.png
├── marketplace-browse-1673780500000.png
└── cart-checkout-1673780600000.png
```

## Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed
- `2` - CLI error (invalid command, missing args)

## Error Handling

### Graceful Failures

- Catches and logs execution errors
- Generates reports even on failure
- Cleanup resources properly
- Meaningful error messages

### Timeout Handling

- Per-test timeouts configurable
- Global timeout override via environment
- Screenshot capture on timeout

### Retry Logic

- Configurable retry count (preset-dependent)
- Exponential backoff supported
- Retry logging and tracking

## Integration

### GitHub Actions

```yaml
- name: Run UBF tests
  run: npm run bot:test:critical -- --preset=ci

- name: Upload reports
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: test-reports
    path: reports/
```

### GitLab CI

```yaml
test:
  script:
    - npm run bot:test:critical -- --preset=ci
  artifacts:
    paths:
      - reports/
      - screenshots/
```

### Jenkins

```groovy
stage('Test') {
    steps {
        sh 'npm run bot:test:critical -- --preset=ci'
    }
}
```

## Development

### Adding Commands

```typescript
// cli/index.ts
switch (options.command) {
  case "my-command":
    await myCommandHandler(options);
    break;
}
```

### Adding Flags

```typescript
if (options.flags["my-flag"]) {
  config.myOption = options.flags["my-flag"];
}
```

### Adding Presets

```typescript
// config/bot-config.ts
export const MY_PRESET_CONFIG: BotConfig = {
  // Configuration
};
```

## Testing

### Manual Testing

```bash
# Test help
npm run bot:help

# Test list
npm run bot:list

# Test execution
npm run bot test health -- --preset=debug
```

### Validation

```bash
# Verify all commands work
npm run bot:help
npm run bot:info
npm run bot:list
npm run bot:list:suites
npm run bot:test:health
```

## Troubleshooting

### Command Not Found

```bash
# Ensure bot-cli.js is executable
chmod +x scripts/bot-cli.js

# Verify npm scripts
npm run bot:help
```

### Module Not Found

```bash
# List available modules
npm run bot:list

# Use correct module ID
npm run bot test health-checks
```

### Timeout Errors

```bash
# Increase timeout
TIMEOUT=60000 npm run bot test health

# Or use debug preset
npm run bot test health -- --preset=debug
```

## Documentation

- [CLI Guide](../../../docs/testing/CLI_GUIDE.md) - Comprehensive usage guide
- [Phase 3 Implementation](../../../docs/testing/PHASE_3_IMPLEMENTATION.md) - Architecture details
- [API Reference](../../../docs/testing/API_REFERENCE.md) - Framework API

## Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Contact the testing team
- See [CONTRIBUTING.md](../../../CONTRIBUTING.md)

---

**Version:** 1.0.0
**Status:** ✅ Production Ready
**Last Updated:** January 2025
