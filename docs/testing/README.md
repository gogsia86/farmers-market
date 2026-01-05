# 🧪 Testing Documentation

Testing strategies, guidelines, and best practices.

## Test Types

- **unit/**: Unit tests with Jest/Vitest
- **integration/**: Integration tests
- **e2e/**: End-to-end tests with Playwright

## Running Tests

```bash
npm test              # All tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests
npm run test:coverage # With coverage
```

## Testing Standards

- Aim for 80%+ code coverage
- Test business logic thoroughly
- Mock external dependencies
- Follow AAA pattern (Arrange, Act, Assert)
