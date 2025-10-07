# Testing Guidelines

## Overview
This document outlines the testing standards and practices for the Farmers Market project. We use Jest as our test runner and React Testing Library for component testing.

## Testing Infrastructure

### Core Testing Tools
- Jest: Test runner and assertion library
- React Testing Library: Component testing with user-centric approach
- Testing Library Jest DOM: Custom DOM matchers
- Node Mocks HTTP: HTTP request/response mocking
- Custom Test Utilities: Located in `src/test/utils.tsx`

### Directory Structure
```
src/
  test/
    utils.tsx      # Shared test utilities and mocks
    setup.ts      # Global test setup and configuration
    matchers.ts   # Custom Jest matchers
  components/
    *.test.tsx    # Component tests
  pages/
    api/
      *.test.ts   # API route tests
```

## Test Utilities

### Custom Render Function
```typescript
import { render } from '@/test/utils';

// Example usage with auth session
const { getByText } = render(<MyComponent />, {
  session: mockSession
});
```

### Mock Data
Pre-configured mock data is available in `src/test/utils.tsx`:
- `mockSession`: Next-Auth session data
- `mockProduct`: Product test data
- `mockFarm`: Farm test data
- `mockOrder`: Order test data

### Custom Matchers
- `toHaveBeenCalledWithMatch`: For partial object matching in function calls

## Testing Patterns

### Component Testing
1. Test the component's main functionality
2. Verify proper rendering of data
3. Test user interactions
4. Check conditional rendering
5. Verify accessibility features

Example:
```typescript
describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const { getByText } = render(
      <ProductCard product={mockProduct} />
    );
    expect(getByText(mockProduct.name)).toBeInTheDocument();
  });
});
```

### API Route Testing
1. Test successful operations
2. Verify error handling
3. Test input validation
4. Check authorization rules
5. Mock database operations

Example:
```typescript
describe('Products API', () => {
  it('creates a new product', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: mockProductInput
    });
    await productsHandler(req, res);
    expect(res._getStatusCode()).toBe(201);
  });
});
```

## Test Coverage
- Run coverage reports: `npm test:coverage`
- Required coverage thresholds:
  - Statements: 80%
  - Branches: 80%
  - Functions: 80%
  - Lines: 80%

## Best Practices
1. Test component behavior, not implementation
2. Use meaningful test descriptions
3. Group related tests using describe blocks
4. Mock external dependencies
5. Keep tests focused and isolated
6. Use setup and teardown when needed
7. Prefer user-centric queries
8. Test error states and edge cases

## Writing Tests

### Component Tests
1. Create a test file next to the component: `Component.test.tsx`
2. Import test utilities and mock data
3. Write tests focusing on user interaction
4. Test accessibility features
5. Verify error states

### API Tests
1. Create a test file next to the API route
2. Mock database operations using `mockPrisma`
3. Test all HTTP methods
4. Verify error handling
5. Test input validation

## Common Testing Scenarios

### Testing Protected Routes
```typescript
it('requires authentication', async () => {
  const { req, res } = createMocks({
    method: 'GET'
  });
  
  await protectedHandler(req, res);
  expect(res._getStatusCode()).toBe(401);
});
```

### Testing Form Submission
```typescript
it('submits form data correctly', async () => {
  const { getByRole, getByLabelText } = render(<MyForm />);
  
  await userEvent.type(getByLabelText('Name'), 'Test Name');
  await userEvent.click(getByRole('button', { name: /submit/i }));
  
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
    name: 'Test Name'
  }));
});
```

### Testing Loading States
```typescript
it('shows loading state', () => {
  const { getByRole } = render(<MyComponent loading={true} />);
  expect(getByRole('progressbar')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues
1. Test not finding elements
   - Check query methods (getBy, queryBy, findBy)
   - Verify element accessibility roles
   
2. Async test failures
   - Use await with async operations
   - Wrap in act() when needed
   - Use findBy queries for elements that appear asynchronously

3. Mock function not being called
   - Verify mock setup
   - Check function import path
   - Ensure proper cleanup between tests

### Debug Tips
1. Use screen.debug() to view rendered output
2. Console.log mock function calls
3. Use test.only() to run specific tests
4. Check jest.setup.js for global configuration