# ⚡ Testing Quick Reference

> **Fast Command Reference for Farmers Market Platform Testing**

---

## 📋 Overview

This directory contains quick reference guides and cheat sheets for common testing tasks. Perfect for daily development when you need a quick command or pattern without diving into full guides.

---

## 📚 Available Quick References

### 🎯 [Testing Quick Reference](testing-quick-reference.md)

**Most Commonly Used**  
Essential commands and patterns for daily testing

- Quick test commands
- Common test patterns
- Coverage commands
- Debugging tests

---

### 🚀 [Test Commands](test-commands.md)

**Complete Command List**  
All available npm test scripts with descriptions

- Unit test commands
- Integration test commands
- E2E test commands
- Coverage commands
- CI/CD commands

---

### 🎭 [E2E Quick Reference](e2e-quick-reference.md)

**End-to-End Testing Cheat Sheet**  
Playwright commands and patterns

- Running E2E tests
- Debug mode
- Test selectors
- Common patterns
- Visual testing

---

### 📊 [Load Testing Quick Reference](load-testing-quick-reference.md)

**Performance Testing Commands**  
k6 and performance testing quick guide

- Running load tests
- Performance benchmarks
- Metrics interpretation
- Threshold configuration

---

### 💳 [Stripe Testing Commands](stripe-testing-commands.md)

**Payment Testing Reference**  
Stripe integration testing essentials

- Test card numbers
- Webhook testing
- Payment flow commands
- Error scenarios

---

### 💳 [Stripe Testing Commands Now](stripe-testing-commands-now.md)

**Updated Payment Testing**  
Latest Stripe testing procedures

- Current test card numbers
- Updated webhook flows
- Latest Stripe API patterns

---

### 💰 [Stripe Testing Now](stripe-testing-now.md)

**Current Stripe Testing Guide**  
Most recent Stripe testing documentation

- Active payment flows
- Current webhook endpoints
- Latest test scenarios

---

### 🔬 [Advanced Testing Quick Reference](advanced-testing-quick-reference.md)

**Advanced Patterns & Techniques**  
Complex testing scenarios and patterns

- Chaos testing
- Contract testing
- Performance profiling
- Visual regression
- AI-powered testing

---

### 📦 [NPM Scripts - Day 18](npm-scripts-day-18.md)

**Day 18 Test Scripts**  
NPM scripts available as of Day 18

- Advanced test commands
- Chaos testing scripts
- Performance scripts

---

### 📦 [NPM Scripts - Day 20](npm-scripts-day-20.md)

**Latest Test Scripts**  
Most recent NPM scripts configuration

- Visual testing scripts
- AI testing scripts
- Latest additions

---

## 🚀 Most Used Commands

### Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific type
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Daily Development

```bash
# Test current file
npm test -- path/to/file.test.ts

# Test with pattern
npm test -- --testNamePattern="Farm"

# Debug mode
npm run test:debug

# E2E with UI
npm run test:e2e:ui
```

### Coverage

```bash
# Generate coverage
npm run test:coverage

# Open coverage report
npm run coverage:open

# Coverage for specific file
npm test -- --coverage path/to/file.ts
```

### CI/CD

```bash
# CI test suite
npm run test:ci

# Pre-deploy validation
npm run validate

# Coverage for CI
npm run coverage:ci
```

---

## 📖 Quick Reference Matrix

| **Task**        | **Command**             | **Reference**                                                              |
| --------------- | ----------------------- | -------------------------------------------------------------------------- |
| Run all tests   | `npm test`              | [testing-quick-reference.md](testing-quick-reference.md)                   |
| Run E2E tests   | `npm run test:e2e`      | [e2e-quick-reference.md](e2e-quick-reference.md)                           |
| Load testing    | `npm run test:load`     | [load-testing-quick-reference.md](load-testing-quick-reference.md)         |
| Test payments   | `npm run test:stripe`   | [stripe-testing-commands.md](stripe-testing-commands.md)                   |
| Coverage report | `npm run test:coverage` | [testing-quick-reference.md](testing-quick-reference.md)                   |
| Debug tests     | `npm run test:debug`    | [testing-quick-reference.md](testing-quick-reference.md)                   |
| Visual tests    | `npm run test:visual`   | [advanced-testing-quick-reference.md](advanced-testing-quick-reference.md) |
| Watch mode      | `npm run test:watch`    | [testing-quick-reference.md](testing-quick-reference.md)                   |

---

## 🎯 Command Categories

### Unit Testing

```bash
npm run test:unit              # All unit tests
npm run test:unit:watch        # Watch mode
npm run test:unit:coverage     # With coverage
```

### Integration Testing

```bash
npm run test:integration       # All integration tests
npm run test:api               # API tests only
npm run test:db                # Database tests only
```

### E2E Testing

```bash
npm run test:e2e               # All E2E tests
npm run test:e2e:ui            # With Playwright UI
npm run test:e2e:debug         # Debug mode
npm run test:e2e:headed        # Show browser
npm run test:e2e:chrome        # Chrome only
npm run test:e2e:firefox       # Firefox only
npm run test:e2e:webkit        # WebKit only
```

### Performance Testing

```bash
npm run test:load              # Load tests (k6)
npm run test:perf              # Performance benchmarks
npm run test:stress            # Stress tests
```

### Coverage

```bash
npm run test:coverage          # Generate coverage
npm run coverage:open          # Open in browser
npm run coverage:ci            # CI coverage report
npm run coverage:json          # JSON format
```

### Specialized Testing

```bash
npm run test:a11y              # Accessibility tests
npm run test:visual            # Visual regression
npm run test:security          # Security tests
npm run test:chaos             # Chaos engineering
npm run test:contract          # Contract tests
```

---

## 🔍 Common Patterns

### Test a Specific File

```bash
npm test -- src/lib/services/farm.service.test.ts
```

### Test with Name Pattern

```bash
npm test -- --testNamePattern="should create farm"
```

### Run Single Test Suite

```bash
npm test -- --testPathPattern="farm"
```

### Debug Specific Test

```bash
npm run test:debug -- path/to/test.test.ts
```

### E2E Specific Spec

```bash
npm run test:e2e -- tests/e2e/customer-journey.spec.ts
```

### Watch Specific Directory

```bash
npm run test:watch -- src/lib/services/
```

---

## 🐛 Debugging Quick Reference

### Jest/Vitest Debugging

```bash
# Node inspector
npm run test:debug

# VS Code debugger
# Set breakpoint, press F5, select "Jest/Vitest"

# Chrome DevTools
node --inspect-brk node_modules/.bin/jest --runInBand
# Open chrome://inspect
```

### Playwright Debugging

```bash
# Debug mode (pauses before each action)
npm run test:e2e:debug

# Show browser (headed mode)
npm run test:e2e:headed

# Playwright Inspector
PWDEBUG=1 npm run test:e2e

# Trace viewer
npm run test:e2e -- --trace on
npx playwright show-trace trace.zip
```

---

## 📊 Coverage Quick Reference

### View Coverage

```bash
# Generate HTML report
npm run test:coverage

# Open in browser (after generation)
npm run coverage:open

# Or manually
open coverage/lcov-report/index.html  # macOS
start coverage/lcov-report/index.html # Windows
```

### Coverage Thresholds

```javascript
// Configured thresholds:
{
  statements: 80,
  branches: 75,
  functions: 80,
  lines: 80
}
```

### Coverage for Specific Files

```bash
# Single file
npm test -- --coverage path/to/file.ts

# Directory
npm test -- --coverage src/lib/services/
```

---

## 🎓 Quick Tips

### Speed Up Tests

```bash
# Run in parallel (default)
npm test

# Run in band (sequential, for debugging)
npm test -- --runInBand

# Limit workers
npm test -- --maxWorkers=4
```

### Test Isolation

```bash
# Clear cache before running
npm run test:clear-cache
npm test

# Reset test database
npm run db:reset:test
```

### CI/CD Best Practices

```bash
# Always use CI command in pipelines
npm run test:ci

# Pre-commit hook
npm run test:changed

# Pre-push hook
npm run validate
```

---

## 🔧 Environment Setup

### Test Environment Variables

```bash
# Copy example env
cp .env.example .env.test

# Essential variables
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=test-secret
STRIPE_SECRET_KEY=sk_test_...
```

### Database Setup

```bash
# Create test database
npm run db:create:test

# Run migrations
npm run db:migrate:test

# Seed test data
npm run db:seed:test

# Reset everything
npm run db:reset:test
```

---

## 📱 Stripe Test Cards

**Most Used**:

```
Success:        4242 4242 4242 4242
Decline:        4000 0000 0000 0002
Insufficient:   4000 0000 0000 9995
3D Secure:      4000 0025 0000 3155
```

**Any CVV**: Any 3 digits  
**Any Expiry**: Any future date

See [stripe-testing-commands.md](stripe-testing-commands.md) for complete list.

---

## 🚨 Troubleshooting Cheat Sheet

### Tests Won't Run

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run test:clear-cache
npm test
```

### Database Issues

```bash
# Reset test database
npm run db:reset:test

# Check connection
npm run db:status:test
```

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port for tests
TEST_PORT=3001 npm test
```

### Memory Issues

```bash
# Increase Node memory
export NODE_OPTIONS=--max_old_space_size=4096
npm test
```

---

## 📖 Related Documentation

- **Parent**: [../README.md](../README.md) - Testing hub
- **Guides**: [../guides/](../guides/) - Detailed testing guides
- **Reports**: [../reports/](../reports/) - Test analysis
- **Progress**: [../daily-progress/](../daily-progress/) - Testing milestones

---

## 🔄 Keep Updated

Update these references when:

- New test commands are added to `package.json`
- Testing tools are upgraded
- Common patterns change
- New testing types are introduced

---

## 📞 Need Help?

- **Quick Answer**: Check the reference files in this directory
- **Detailed Guide**: See [../guides/](../guides/)
- **Team Help**: Ask in #testing Slack channel
- **Report Issue**: Create GitHub issue with `testing` label

---

**Version**: 1.0  
**Last Updated**: December 2024  
**Purpose**: Fast reference for daily testing tasks  
**Maintained By**: Testing Team

_Keep this handy - you'll use it every day!_ ⚡
