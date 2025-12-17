# 🚀 NPM Scripts for Advanced Testing (Day 18)

Add these scripts to `package.json` in the `scripts` section:

```json
{
  "scripts": {
    // Advanced E2E Testing
    "test:e2e:advanced": "playwright test tests/e2e/advanced --workers=6",
    "test:e2e:advanced:ui": "playwright test tests/e2e/advanced --ui",
    "test:e2e:advanced:headed": "playwright test tests/e2e/advanced --headed --workers=2",
    "test:e2e:advanced:debug": "playwright test tests/e2e/advanced --debug",
    "test:e2e:advanced:multi-user": "playwright test tests/e2e/advanced/multi-user-scenarios.spec.ts",
    "test:e2e:advanced:ci": "cross-env CI=true playwright test tests/e2e/advanced --workers=4 --reporter=json",
    
    // API Integration Testing
    "test:api:integration": "playwright test tests/api --workers=6",
    "test:api:integration:ui": "playwright test tests/api --ui",
    "test:api:integration:headed": "playwright test tests/api --headed --workers=2",
    "test:api:integration:debug": "playwright test tests/api --debug",
    "test:api:integration:ci": "cross-env CI=true playwright test tests/api --workers=4 --reporter=json",
    "test:api:health": "playwright test tests/api --grep \"Health Check\"",
    "test:api:auth": "playwright test tests/api --grep \"Authentication\"",
    "test:api:farms": "playwright test tests/api --grep \"Farms API\"",
    "test:api:products": "playwright test tests/api --grep \"Products API\"",
    "test:api:orders": "playwright test tests/api --grep \"Orders API\"",
    "test:api:users": "playwright test tests/api --grep \"Users API\"",
    "test:api:performance": "playwright test tests/api --grep \"Performance\"",
    "test:api:errors": "playwright test tests/api --grep \"Error Handling\"",
    "test:api:ratelimit": "playwright test tests/api --grep \"Rate Limiting\"",
    "test:api:validation": "playwright test tests/api --grep \"Data Validation\"",
    
    // Database Testing
    "test:database:integration": "playwright test tests/database --workers=4",
    "test:database:integration:ui": "playwright test tests/database --ui",
    "test:database:integration:headed": "playwright test tests/database --headed --workers=2",
    "test:database:integration:debug": "playwright test tests/database --debug",
    "test:database:integration:ci": "cross-env CI=true playwright test tests/database --workers=2 --reporter=json",
    "test:database:crud": "playwright test tests/database --grep \"CRUD Operations\"",
    "test:database:transactions": "playwright test tests/database --grep \"Transaction\"",
    "test:database:performance": "playwright test tests/database --grep \"Performance\"",
    "test:database:integrity": "playwright test tests/database --grep \"Integrity\"",
    "test:database:bulk": "playwright test tests/database --grep \"Bulk Operations\"",
    "test:database:race": "playwright test tests/database --grep \"Race Conditions\"",
    
    // Combined Advanced Testing
    "test:advanced:all": "npm run test:e2e:advanced && npm run test:api:integration && npm run test:database:integration",
    "test:advanced:ci": "cross-env CI=true npm run test:advanced:all",
    "test:advanced:coverage": "npm run test:advanced:all -- --reporter=html",
    "test:advanced:report": "playwright show-report",
    
    // Performance Testing
    "test:performance:all": "npm run test:api:performance && npm run test:database:performance && npm run test:e2e:advanced -- --grep \"Performance\"",
    "test:performance:report": "npm run test:performance:all && npm run test:advanced:report",
    "test:performance:monitor": "npm run test:performance:all -- --reporter=json",
    "test:performance:baseline": "npm run test:performance:all -- --update-snapshots",
    "test:performance:compare": "npm run test:performance:all -- --reporter=html",
    
    // Utility Scripts
    "test:advanced:clean": "rm -rf test-results playwright-report",
    "test:advanced:setup": "npm run db:test:setup && npm run test:advanced:clean",
    "test:advanced:full": "npm run test:advanced:setup && npm run test:advanced:all && npm run test:advanced:report"
  }
}
```

## 📋 Quick Reference

### Running Tests

```bash
# Run all advanced E2E tests
npm run test:e2e:advanced

# Run specific multi-user scenarios
npm run test:e2e:advanced:multi-user

# Run all API integration tests
npm run test:api:integration

# Run specific API endpoint tests
npm run test:api:farms
npm run test:api:products
npm run test:api:orders

# Run database tests
npm run test:database:integration

# Run specific database test categories
npm run test:database:transactions
npm run test:database:performance
npm run test:database:integrity

# Run everything
npm run test:advanced:all
```

### Debug & Development

```bash
# Run with UI
npm run test:e2e:advanced:ui
npm run test:api:integration:ui
npm run test:database:integration:ui

# Run in headed mode
npm run test:e2e:advanced:headed
npm run test:api:integration:headed
npm run test:database:integration:headed

# Run with debugger
npm run test:e2e:advanced:debug
npm run test:api:integration:debug
npm run test:database:integration:debug
```

### CI/CD & Reporting

```bash
# Run in CI mode
npm run test:advanced:ci

# Generate coverage report
npm run test:advanced:coverage

# View test report
npm run test:advanced:report

# Performance monitoring
npm run test:performance:monitor
npm run test:performance:report
```

### Utilities

```bash
# Clean test artifacts
npm run test:advanced:clean

# Setup test environment
npm run test:advanced:setup

# Full test cycle (setup + run + report)
npm run test:advanced:full
```

## 🎯 Test Categories

### Advanced E2E Tests
- Multi-user scenarios
- Race condition testing
- Real-time updates
- Session management
- Network simulation
- Performance monitoring

### API Integration Tests
- Health checks
- Authentication flows
- CRUD operations (Farms, Products, Orders, Users)
- Performance testing
- Error handling
- Rate limiting
- Data validation

### Database Tests
- CRUD operations
- Transaction management
- Query performance
- Data integrity
- Bulk operations
- Race conditions
- Edge cases

## 📊 Performance Targets

| Test Type | Target | Command |
|-----------|--------|---------|
| E2E Page Load | < 3s | `npm run test:e2e:advanced` |
| API Response | < 1s | `npm run test:api:performance` |
| Database Query | < 500ms | `npm run test:database:performance` |
| Transaction | < 1s | `npm run test:database:transactions` |

## 🔧 Troubleshooting

### Common Issues

**Tests timeout:**
```bash
# Increase timeout in playwright.config.ts
timeout: 60000
```

**Database connection errors:**
```bash
npm run db:test:setup
```

**Port conflicts:**
```bash
npm run kill-server
npm run test:advanced:setup
```

**Flaky tests:**
```bash
# Run with retries
npm run test:e2e:advanced -- --retries=3
```

## 📚 Additional Resources

- Main README: `tests/e2e/advanced/README.md`
- Completion Summary: `tests/DAY_18_ADVANCED_TESTING_COMPLETE.md`
- Utilities Documentation: Inline JSDoc in `tests/utils/`

---

**Status**: Ready for Integration ✅  
**Version**: 3.0.0  
**Last Updated**: Day 18 - Advanced Testing Implementation