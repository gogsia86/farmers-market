#!/usr/bin/env tsx
/**
 * OpenTelemetry Tracing Test Script
 * Tests OpenTelemetry instrumentation, tracing, and span management
 *
 * Usage: npm run test:telemetry (or tsx scripts/test-telemetry.ts)
 */

import {
  initializeTelemetry,
  shutdownTelemetry,
  getTelemetryConfig,
  getTracer,
  withSpan,
  traceSync,
  addSpanAttributes,
  recordSpanEvent,
  traceDatabaseOperation,
  traceApiRoute,
  traceAgentInvocation,
  traceFarmOperation,
  extractTraceContext,
  injectTraceContext,
} from '../src/lib/monitoring/telemetry';

// ============================================================================
// Console Utilities
// ============================================================================

function logSection(title: string): void {
  console.log('\n' + '='.repeat(80));
  console.log(`  ${title}`);
  console.log('='.repeat(80) + '\n');
}

function logSuccess(message: string): void {
  console.log(`✅ ${message}`);
}

function logError(message: string): void {
  console.error(`❌ ${message}`);
}

function logWarning(message: string): void {
  console.warn(`⚠️  ${message}`);
}

function logInfo(message: string): void {
  console.log(`ℹ️  ${message}`);
}

// ============================================================================
// Mock Functions for Testing
// ============================================================================

async function mockDatabaseQuery(query: string): Promise<any> {
  // Simulate database operation
  await new Promise((resolve) => setTimeout(resolve, 50));
  return { rows: [{ id: 1, name: 'Test Farm' }] };
}

async function mockApiCall(endpoint: string): Promise<any> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { status: 200, data: { success: true } };
}

// ============================================================================
// Test Functions
// ============================================================================

/**
 * Test 1: Configuration
 */
async function testConfiguration(): Promise<boolean> {
  logSection('Test 1: Telemetry Configuration');

  try {
    const config = getTelemetryConfig();

    logInfo('Configuration:');
    logInfo(`  - Service Name: ${config.serviceName}`);
    logInfo(`  - Service Version: ${config.serviceVersion}`);
    logInfo(`  - Environment: ${config.environment}`);
    logInfo(`  - OTLP Endpoint: ${config.otlpEndpoint}`);
    logInfo(`  - Enabled: ${config.enabled}`);
    logInfo(`  - Sample Rate: ${config.sampleRate}`);

    if (!config.serviceName) {
      logError('Service name is missing');
      return false;
    }

    logSuccess('Configuration test passed');
    return true;
  } catch (error) {
    logError(`Configuration test failed: ${error}`);
    return false;
  }
}

/**
 * Test 2: SDK Initialization
 */
async function testSDKInitialization(): Promise<boolean> {
  logSection('Test 2: SDK Initialization');

  try {
    logInfo('Initializing OpenTelemetry SDK...');
    const sdk = initializeTelemetry();

    if (!sdk) {
      logError('SDK initialization returned null');
      return false;
    }

    logSuccess('SDK initialized successfully');
    return true;
  } catch (error) {
    logError(`SDK initialization failed: ${error}`);
    return false;
  }
}

/**
 * Test 3: Tracer Access
 */
async function testTracerAccess(): Promise<boolean> {
  logSection('Test 3: Tracer Access');

  try {
    const tracer = getTracer('test-component', '1.0.0');

    if (!tracer) {
      logError('Failed to get tracer');
      return false;
    }

    logInfo('Tracer obtained successfully');
    logSuccess('Tracer access test passed');
    return true;
  } catch (error) {
    logError(`Tracer access test failed: ${error}`);
    return false;
  }
}

/**
 * Test 4: Basic Span Creation
 */
async function testBasicSpan(): Promise<boolean> {
  logSection('Test 4: Basic Span Creation');

  try {
    logInfo('Creating basic span with withSpan...');

    const result = await withSpan(
      'test.basic.span',
      async (span) => {
        span.setAttributes({
          'test.attribute': 'test-value',
          'test.number': 42,
        });

        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 50));

        return 'test-result';
      },
      {
        'initial.attribute': 'initial-value',
      }
    );

    if (result !== 'test-result') {
      logError('Span did not return expected result');
      return false;
    }

    logSuccess('Basic span test passed');
    return true;
  } catch (error) {
    logError(`Basic span test failed: ${error}`);
    return false;
  }
}

/**
 * Test 5: Synchronous Tracing
 */
async function testSyncTracing(): Promise<boolean> {
  logSection('Test 5: Synchronous Tracing');

  try {
    logInfo('Testing synchronous tracing...');

    const result = traceSync(
      'test.sync.operation',
      (span) => {
        span.setAttributes({
          'sync.test': true,
        });

        // Synchronous operation
        const sum = Array.from({ length: 1000 }, (_, i) => i).reduce(
          (a, b) => a + b,
          0
        );

        return sum;
      }
    );

    if (result !== 499500) {
      logError('Sync trace returned unexpected result');
      return false;
    }

    logSuccess('Synchronous tracing test passed');
    return true;
  } catch (error) {
    logError(`Synchronous tracing test failed: ${error}`);
    return false;
  }
}

/**
 * Test 6: Nested Spans
 */
async function testNestedSpans(): Promise<boolean> {
  logSection('Test 6: Nested Spans');

  try {
    logInfo('Creating nested spans...');

    await withSpan('test.parent.span', async (parentSpan) => {
      parentSpan.setAttribute('span.level', 'parent');

      await withSpan('test.child.span.1', async (childSpan1) => {
        childSpan1.setAttribute('span.level', 'child-1');
        await new Promise((resolve) => setTimeout(resolve, 30));
      });

      await withSpan('test.child.span.2', async (childSpan2) => {
        childSpan2.setAttribute('span.level', 'child-2');
        await new Promise((resolve) => setTimeout(resolve, 30));
      });
    });

    logSuccess('Nested spans test passed');
    return true;
  } catch (error) {
    logError(`Nested spans test failed: ${error}`);
    return false;
  }
}

/**
 * Test 7: Database Operation Tracing
 */
async function testDatabaseTracing(): Promise<boolean> {
  logSection('Test 7: Database Operation Tracing');

  try {
    logInfo('Tracing database operations...');

    const result = await traceDatabaseOperation(
      'find',
      'farm',
      async (span) => {
        span.setAttribute('db.query', 'SELECT * FROM farms WHERE id = ?');
        return await mockDatabaseQuery('SELECT * FROM farms WHERE id = 1');
      },
      {
        'farm.id': '1',
      }
    );

    if (!result.rows || result.rows.length === 0) {
      logError('Database trace returned no results');
      return false;
    }

    logSuccess('Database tracing test passed');
    return true;
  } catch (error) {
    logError(`Database tracing test failed: ${error}`);
    return false;
  }
}

/**
 * Test 8: API Route Tracing
 */
async function testApiRouteTracing(): Promise<boolean> {
  logSection('Test 8: API Route Tracing');

  try {
    logInfo('Tracing API route...');

    const result = await traceApiRoute(
      'GET',
      '/api/farms/[id]',
      async (span) => {
        span.setAttribute('farm.id', '123');
        return await mockApiCall('/api/farms/123');
      },
      {
        'user.id': 'test-user-001',
      }
    );

    if (result.status !== 200) {
      logError('API route trace returned unexpected status');
      return false;
    }

    logSuccess('API route tracing test passed');
    return true;
  } catch (error) {
    logError(`API route tracing test failed: ${error}`);
    return false;
  }
}

/**
 * Test 9: Agent Invocation Tracing
 */
async function testAgentTracing(): Promise<boolean> {
  logSection('Test 9: Agent Invocation Tracing');

  try {
    logInfo('Tracing AI agent invocation...');

    const result = await traceAgentInvocation(
      'FarmAnalyst',
      'analyze_farm_performance',
      async (span) => {
        span.setAttribute('agent.model', 'gpt-4o');
        span.setAttribute('agent.temperature', 0.3);

        // Simulate agent work
        await new Promise((resolve) => setTimeout(resolve, 150));

        return {
          success: true,
          confidence: 0.85,
          response: 'Farm analysis complete',
        };
      },
      {
        'farm.id': 'test-farm-001',
      }
    );

    if (!result.success) {
      logError('Agent trace returned failure');
      return false;
    }

    logSuccess('Agent invocation tracing test passed');
    return true;
  } catch (error) {
    logError(`Agent invocation tracing test failed: ${error}`);
    return false;
  }
}

/**
 * Test 10: Farm Operation Tracing
 */
async function testFarmOperationTracing(): Promise<boolean> {
  logSection('Test 10: Farm Operation Tracing');

  try {
    logInfo('Tracing farm operation...');

    const result = await traceFarmOperation(
      'createProduct',
      'farm-123',
      async (span) => {
        span.setAttribute('product.name', 'Organic Tomatoes');
        span.setAttribute('product.price', 5.99);

        // Simulate product creation
        await new Promise((resolve) => setTimeout(resolve, 80));

        return {
          id: 'product-456',
          name: 'Organic Tomatoes',
          farmId: 'farm-123',
        };
      },
      {
        'season': 'summer',
      }
    );

    if (!result.id) {
      logError('Farm operation trace returned invalid result');
      return false;
    }

    logSuccess('Farm operation tracing test passed');
    return true;
  } catch (error) {
    logError(`Farm operation tracing test failed: ${error}`);
    return false;
  }
}

/**
 * Test 11: Error Handling in Spans
 */
async function testSpanErrorHandling(): Promise<boolean> {
  logSection('Test 11: Span Error Handling');

  try {
    logInfo('Testing error handling in spans...');

    try {
      await withSpan('test.error.span', async (span) => {
        span.setAttribute('will.fail', true);
        throw new Error('Intentional test error');
      });

      logError('Should have thrown an error');
      return false;
    } catch (error) {
      if (error instanceof Error && error.message === 'Intentional test error') {
        logSuccess('Error was correctly propagated and recorded');
      } else {
        logError('Unexpected error type');
        return false;
      }
    }

    logSuccess('Span error handling test passed');
    return true;
  } catch (error) {
    logError(`Span error handling test failed: ${error}`);
    return false;
  }
}

/**
 * Test 12: Span Attributes and Events
 */
async function testSpanAttributesAndEvents(): Promise<boolean> {
  logSection('Test 12: Span Attributes and Events');

  try {
    logInfo('Testing span attributes and events...');

    await withSpan('test.attributes.events', async (span) => {
      // Add attributes
      addSpanAttributes({
        'test.string': 'value',
        'test.number': 123,
        'test.boolean': true,
      });

      // Record events
      recordSpanEvent('test.event.1', {
        'event.type': 'milestone',
      });

      await new Promise((resolve) => setTimeout(resolve, 20));

      recordSpanEvent('test.event.2', {
        'event.type': 'completion',
      });
    });

    logSuccess('Span attributes and events test passed');
    return true;
  } catch (error) {
    logError(`Span attributes and events test failed: ${error}`);
    return false;
  }
}

/**
 * Test 13: Context Propagation
 */
async function testContextPropagation(): Promise<boolean> {
  logSection('Test 13: Context Propagation');

  try {
    logInfo('Testing context propagation...');

    // Test extract
    const mockHeaders = {
      'traceparent': '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01',
      'tracestate': 'congo=t61rcWkgMzE',
    };

    const context = extractTraceContext(mockHeaders);

    if (!context.traceId || !context.spanId) {
      logError('Failed to extract trace context');
      return false;
    }

    logInfo(`Extracted traceId: ${context.traceId}`);
    logInfo(`Extracted spanId: ${context.spanId}`);

    // Test inject
    await withSpan('test.context.inject', async (span) => {
      const headers = {};
      const injectedHeaders = injectTraceContext(headers);

      if (!injectedHeaders.traceparent) {
        logError('Failed to inject trace context');
        return false;
      }

      logInfo(`Injected traceparent: ${injectedHeaders.traceparent}`);
    });

    logSuccess('Context propagation test passed');
    return true;
  } catch (error) {
    logError(`Context propagation test failed: ${error}`);
    return false;
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runAllTests(): Promise<void> {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       OPENTELEMETRY TRACING TEST SUITE                   ║');
  console.log('║       Farmers Market Platform - Phase 6 Day 4            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results: { name: string; passed: boolean }[] = [];

  // Run all tests
  const tests = [
    { name: 'Configuration', fn: testConfiguration },
    { name: 'SDK Initialization', fn: testSDKInitialization },
    { name: 'Tracer Access', fn: testTracerAccess },
    { name: 'Basic Span', fn: testBasicSpan },
    { name: 'Synchronous Tracing', fn: testSyncTracing },
    { name: 'Nested Spans', fn: testNestedSpans },
    { name: 'Database Tracing', fn: testDatabaseTracing },
    { name: 'API Route Tracing', fn: testApiRouteTracing },
    { name: 'Agent Tracing', fn: testAgentTracing },
    { name: 'Farm Operation Tracing', fn: testFarmOperationTracing },
    { name: 'Span Error Handling', fn: testSpanErrorHandling },
    { name: 'Span Attributes/Events', fn: testSpanAttributesAndEvents },
    { name: 'Context Propagation', fn: testContextPropagation },
  ];

  for (const test of tests) {
    const passed = await test.fn();
    results.push({ name: test.name, passed });
  }

  // Shutdown telemetry
  logSection('Cleanup');
  logInfo('Shutting down telemetry SDK...');
  await shutdownTelemetry();
  logSuccess('Telemetry SDK shutdown complete');

  // Summary
  logSection('Test Summary');

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  console.log('\nResults:');
  for (const result of results) {
    console.log(`  ${result.passed ? '✅' : '❌'} ${result.name}`);
  }

  console.log(`\n${passed}/${total} tests passed`);

  if (passed === total) {
    logSuccess('\n🎉 All tests passed! OpenTelemetry tracing is operational.');
  } else {
    logError(
      `\n❌ ${total - passed} test(s) failed. Please review the output above.`
    );
    process.exit(1);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       TEST SUITE COMPLETE                                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

// ============================================================================
// Execute Tests
// ============================================================================

runAllTests().catch((error) => {
  console.error('\n❌ Test suite failed with error:', error);
  process.exit(1);
});
