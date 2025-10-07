import { runTests } from '../core/testing/agriculturalTests';

describe('Agricultural Quantum System Tests', () => {
  it('runs agricultural quantum test suite', async () => {
    const results = await runTests();
    
    // Verify test results
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(r => r.success)).toBe(true);
    
    // Check metrics
    results.forEach(result => {
      expect(result.metrics.coherenceLevel).toBeGreaterThan(0.7);
      expect(result.metrics.stabilityScore).toBeGreaterThan(0.6);
      expect(result.metrics.executionTime).toBeLessThan(1000); // 1 second max
    });
  });
});