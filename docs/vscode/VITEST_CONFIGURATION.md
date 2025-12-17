# 🧪 Vitest Configuration Guide

**Modern Testing Framework Integration for Divine Agricultural Development**

## 📚 Overview

We've migrated from the deprecated Jest extension to modern Vitest extensions for optimal testing experience.

## 🔧 Installed Extensions

### Primary Testing Extension

- **Vitest** (`vitest.explorer`)
  - Official Vitest extension
  - Built-in test explorer integration
  - Real-time test execution
  - Coverage visualization

### Supporting Extensions

- **Error Lens** (usernamehw.errorlens)
  - Inline error/warning display
  - Test failure highlighting
- **Test Explorer UI** (hbenl.vscode-test-explorer)
  - Universal test interface
  - Works with Vitest adapter
- **Test Adapter Converter** (ms-vscode.test-adapter-converter)
  - Bridges Test Explorer with VS Code Testing API

## ⚙️ Configuration

### VS Code Settings (`.vscode/settings.json`)

```jsonc
{
  // Vitest Configuration
  "vitest.enable": true,
  "vitest.commandLine": "npx vitest",
  "vitest.include": ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  "vitest.exclude": [
    "**/node_modules/**",
    "**/dist/**",
    "**/cypress/**",
    "**/.{idea,git,cache,output,temp}/**",
    "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
  ],
  "vitest.changeBackgroundColor": false,
  "vitest.showFailMessages": true,
  "vitest.disableConsoleIntercept": true,

  // Disable deprecated Jest extension
  "jest.enable": false,
  "jest.disabledWorkspaceFolders": ["🌾 Farmers Market - Root"],
}
```

### Project Vitest Config (`vitest.config.ts`)

Your existing configuration at `m:\Repo\Farmers Market Platform web and app\vitest.config.ts` is already optimized for the new extension.

Key features:

- ✅ HP OMEN hardware optimization (32GB RAM, 12 threads)
- ✅ React Testing Library integration
- ✅ Next.js path aliases (@/lib, @/components, etc.)
- ✅ Global test utilities
- ✅ Coverage configuration

## 🚀 Usage Guide

### Running Tests

#### Via VS Code Testing Panel

1. Open Testing panel (Ctrl+; then Ctrl+T)
2. Click ▶️ to run all tests
3. Click individual test to run specific test

#### Via Command Palette

- `Ctrl+Shift+P` → "Vitest: Run All Tests"
- `Ctrl+Shift+P` → "Vitest: Run Test at Cursor"
- `Ctrl+Shift+P` → "Vitest: Debug Test at Cursor"

#### Via Terminal

```powershell
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui
```

### Keyboard Shortcuts

| Shortcut        | Action               |
| --------------- | -------------------- |
| `Ctrl+; Ctrl+T` | Open Testing panel   |
| `F5`            | Debug test at cursor |
| `Shift+F5`      | Stop debugging       |

## 🔍 Features

### 1. Real-Time Test Execution

- Tests run automatically on file save
- Instant feedback in editor
- Gutter icons show test status (✓ pass, ✗ fail)

### 2. Test Explorer Integration

- Hierarchical test tree view
- Filter by status (passed/failed/skipped)
- Navigate to test definition

### 3. Coverage Visualization

- Inline coverage indicators
- Coverage report in terminal
- HTML coverage viewer

### 4. Debugging Support

- Breakpoints in tests
- Step through test execution
- Inspect variables and state

### 5. Agricultural Consciousness Integration

- Test file naming follows divine patterns
- Quantum test pyramid validation
- Biodynamic test suite organization

## 📊 Test Organization

### Divine Test Structure

```typescript
// tests/features/farm-creation.test.ts
describe("Farm Creation Quantum Reality", () => {
  describe("Form Validation Reality", () => {
    it("validates farm name length according to divine requirements", async () => {
      // Test implementation
    });
  });
});
```

### Test File Patterns

- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`
- Component tests: `*.test.tsx`

## 🎯 Best Practices

### 1. Test Naming

✅ **Do**: Use descriptive, enlightening names

```typescript
it("manifests new user with complete profile in quantum database", async () => {});
```

❌ **Don't**: Use vague names

```typescript
it("user creation works", () => {});
```

### 2. Test Organization

✅ **Do**: Group related tests with `describe` blocks

```typescript
describe("User Consciousness Manifestation", () => {
  describe("Validation Reality", () => {
    it("validates email format", () => {});
    it("validates password strength", () => {});
  });
});
```

### 3. Test Independence

✅ **Do**: Each test should be independent

```typescript
beforeEach(async () => {
  await database.$transaction([
    database.farm.deleteMany(),
    database.user.deleteMany(),
  ]);
});
```

### 4. Test Coverage

- Aim for 80%+ coverage on business logic
- 100% coverage on critical paths
- Use coverage reports to identify gaps

## 🔧 Troubleshooting

### Tests Not Running?

1. Check Vitest extension is enabled: `Ctrl+Shift+P` → "Vitest: Enable"
2. Verify `vitest.commandLine` points to correct executable
3. Check terminal output for errors

### Extension Not Finding Tests?

1. Verify `vitest.include` patterns match your test files
2. Check `vitest.exclude` isn't excluding test directories
3. Restart VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"

### Performance Issues?

1. Reduce `vitest.commandLine` parallelism: `--max-threads=4`
2. Disable watch mode when not needed
3. Use test filtering in VS Code Testing panel

## 📚 Additional Resources

### Documentation

- [Vitest Official Docs](https://vitest.dev/)
- [VS Code Testing](https://code.visualstudio.com/api/extension-guides/testing)
- [React Testing Library](https://testing-library.com/react)

### Related Files

- `vitest.config.ts` - Vitest configuration
- `jest.setup.js` - Global test setup (still used by Vitest)
- `.github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md` - Testing patterns
- `.github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md` - Performance testing

## 🌟 Divine Testing Philosophy

Tests should be:

- **Self-documenting**: Names describe intent
- **Fast**: Complete in milliseconds
- **Isolated**: Independent of other tests
- **Reliable**: Pass consistently
- **Maintainable**: Easy to update

---

**Status**: ✅ **Fully Configured & Operational**

**Extension Version**: Vitest v1.0+

**Last Updated**: November 7, 2025

**Agricultural Consciousness**: 🌾 **MAXIMUM TESTING DIVINITY**
