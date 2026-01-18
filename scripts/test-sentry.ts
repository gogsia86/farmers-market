#!/usr/bin/env tsx
/**
 * 🔍 SENTRY VERIFICATION SCRIPT
 *
 * Tests Sentry integration and error tracking
 * Part of Wave 2: Integration Verification
 *
 * Usage:
 *   npm run sentry:test           # Basic test
 *   npm run sentry:test:verbose   # Verbose output
 *   npm run sentry:send-test      # Send test error
 */

import * as Sentry from '@sentry/nextjs';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

class SentryTester {
  private results: TestResult[] = [];
  private verbose: boolean = false;
  private sendTest: boolean = false;

  constructor() {
    // Parse command line arguments
    this.verbose = process.argv.includes('--verbose');
    this.sendTest = process.argv.includes('--send-test-error');
  }

  private log(message: string, data?: any) {
    if (this.verbose || data) {
      console.log(message);
      if (data) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  private addResult(result: TestResult) {
    this.results.push(result);

    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.test}: ${result.message}`);

    if (this.verbose && result.details) {
      console.log('   Details:', JSON.stringify(result.details, null, 2));
    }
  }

  private checkEnvironmentVariables(): void {
    console.log('\n🔐 Checking Environment Variables...\n');

    // Check SENTRY_DSN
    const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (sentryDsn) {
      this.addResult({
        test: 'SENTRY_DSN',
        status: 'pass',
        message: `Sentry DSN is configured`,
        details: this.verbose ? {
          dsn: sentryDsn.slice(0, 30) + '...',
          length: sentryDsn.length
        } : undefined
      });
    } else {
      this.addResult({
        test: 'SENTRY_DSN',
        status: 'fail',
        message: 'SENTRY_DSN or NEXT_PUBLIC_SENTRY_DSN not found in environment',
        details: {
          hint: 'Get your DSN from https://sentry.io/settings/YOUR_ORG/projects/YOUR_PROJECT/keys/',
          example: 'SENTRY_DSN=https://public@sentry.io/project-id'
        }
      });
      return;
    }

    // Check SENTRY_AUTH_TOKEN (optional, for source maps)
    const authToken = process.env.SENTRY_AUTH_TOKEN;
    if (authToken) {
      this.addResult({
        test: 'SENTRY_AUTH_TOKEN',
        status: 'pass',
        message: 'Auth token configured (source maps enabled)',
        details: this.verbose ? { length: authToken.length } : undefined
      });
    } else {
      this.addResult({
        test: 'SENTRY_AUTH_TOKEN',
        status: 'warning',
        message: 'Auth token not set (source maps will not be uploaded)',
        details: {
          hint: 'Generate token at https://sentry.io/settings/account/api/auth-tokens/',
          impact: 'Stack traces will show minified code'
        }
      });
    }

    // Check environment
    const nodeEnv = process.env.NODE_ENV || 'development';
    this.addResult({
      test: 'NODE_ENV',
      status: 'pass',
      message: `Environment: ${nodeEnv}`,
      details: { nodeEnv }
    });
  }

  private async initializeSentry(): Promise<boolean> {
    console.log('\n🚀 Initializing Sentry Client...\n');

    const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

    if (!sentryDsn) {
      this.addResult({
        test: 'Sentry Initialization',
        status: 'fail',
        message: 'Cannot initialize - DSN not configured'
      });
      return false;
    }

    try {
      Sentry.init({
        dsn: sentryDsn,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 1.0,
        debug: this.verbose,
        beforeSend(event) {
          // Log event being sent (if verbose)
          if (process.argv.includes('--verbose')) {
            console.log('📤 Sending event to Sentry:', {
              eventId: event.event_id,
              level: event.level,
              message: event.message,
              exception: event.exception?.values?.[0]?.type
            });
          }
          return event;
        }
      });

      this.addResult({
        test: 'Sentry Initialization',
        status: 'pass',
        message: 'Sentry client initialized successfully'
      });

      return true;
    } catch (error) {
      this.addResult({
        test: 'Sentry Initialization',
        status: 'fail',
        message: `Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
      return false;
    }
  }

  private async sendTestError(): Promise<void> {
    console.log('\n📤 Sending Test Error to Sentry...\n');

    try {
      // Capture a test exception
      const testError = new Error('🧪 Test error from Sentry verification script');
      testError.stack = `Error: 🧪 Test error from Sentry verification script
    at SentryTester.sendTestError (scripts/test-sentry.ts:150:25)
    at SentryTester.run (scripts/test-sentry.ts:200:12)`;

      const eventId = Sentry.captureException(testError, {
        tags: {
          test: 'sentry-verification',
          source: 'test-script'
        },
        level: 'error',
        extra: {
          timestamp: new Date().toISOString(),
          nodeVersion: process.version,
          platform: process.platform
        }
      });

      // Also send a test message
      const messageId = Sentry.captureMessage('🧪 Test message from Sentry verification', {
        level: 'info',
        tags: {
          test: 'sentry-verification',
          type: 'message'
        }
      });

      // Flush to ensure events are sent
      await Sentry.flush(2000);

      this.addResult({
        test: 'Send Test Error',
        status: 'pass',
        message: 'Test error and message sent successfully',
        details: {
          errorEventId: eventId,
          messageEventId: messageId,
          instruction: 'Check your Sentry dashboard at https://sentry.io/'
        }
      });

      console.log('\n📊 Check Sentry Dashboard:');
      console.log('   🔗 https://sentry.io/');
      console.log(`   📝 Event IDs: ${eventId} (error), ${messageId} (message)`);
      console.log('   ⏱️  Events may take a few seconds to appear\n');

    } catch (error) {
      this.addResult({
        test: 'Send Test Error',
        status: 'fail',
        message: `Failed to send test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }
  }

  private async testBreadcrumbs(): Promise<void> {
    console.log('\n🍞 Testing Breadcrumbs...\n');

    try {
      // Add some breadcrumbs
      Sentry.addBreadcrumb({
        category: 'test',
        message: 'User clicked submit button',
        level: 'info',
        data: {
          buttonId: 'submit-form',
          formName: 'checkout'
        }
      });

      Sentry.addBreadcrumb({
        category: 'database',
        message: 'Database query executed',
        level: 'info',
        data: {
          query: 'SELECT * FROM farms WHERE status = ?',
          duration: 45
        }
      });

      Sentry.addBreadcrumb({
        category: 'navigation',
        message: 'User navigated to /checkout',
        level: 'info'
      });

      this.addResult({
        test: 'Breadcrumbs',
        status: 'pass',
        message: 'Breadcrumbs added (will appear with next error)',
        details: {
          note: 'Breadcrumbs help track user actions before an error'
        }
      });

    } catch (error) {
      this.addResult({
        test: 'Breadcrumbs',
        status: 'fail',
        message: `Failed to add breadcrumbs: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private async testTags(): Promise<void> {
    console.log('\n🏷️  Testing Tags...\n');

    try {
      // Set tags
      Sentry.setTag('test_run', 'verification');
      Sentry.setTag('environment_test', process.env.NODE_ENV || 'development');
      Sentry.setTag('script_version', '1.0.0');

      // Set user context
      Sentry.setUser({
        id: 'test-user',
        email: 'test@farmers-market.com',
        username: 'test-admin'
      });

      this.addResult({
        test: 'Tags & Context',
        status: 'pass',
        message: 'Tags and user context set successfully',
        details: {
          note: 'Tags help filter and search errors in Sentry'
        }
      });

    } catch (error) {
      this.addResult({
        test: 'Tags & Context',
        status: 'fail',
        message: `Failed to set tags: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SENTRY VERIFICATION SUMMARY');
    console.log('='.repeat(60) + '\n');

    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%\n`);

    if (failed > 0) {
      console.log('🚨 FAILED TESTS:\n');
      this.results
        .filter(r => r.status === 'fail')
        .forEach(result => {
          console.log(`   ❌ ${result.test}: ${result.message}`);
          if (result.details?.hint) {
            console.log(`      💡 ${result.details.hint}`);
          }
        });
      console.log();
    }

    if (warnings > 0) {
      console.log('⚠️  WARNINGS:\n');
      this.results
        .filter(r => r.status === 'warning')
        .forEach(result => {
          console.log(`   ⚠️  ${result.test}: ${result.message}`);
          if (result.details?.hint) {
            console.log(`      💡 ${result.details.hint}`);
          }
        });
      console.log();
    }

    // Next steps
    console.log('📋 NEXT STEPS:\n');

    if (failed === 0) {
      console.log('   ✅ Sentry is properly configured!');
      console.log('   📊 Monitor errors at: https://sentry.io/');
      console.log('   🔍 View event details in Sentry dashboard');
      console.log('   📈 Set up alerts for critical errors');
    } else {
      console.log('   1. Fix the failed tests above');
      console.log('   2. Get Sentry DSN: https://sentry.io/settings/');
      console.log('   3. Add to .env.local: SENTRY_DSN=your-dsn-here');
      console.log('   4. Run this script again: npm run sentry:test');
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  public async run(): Promise<void> {
    console.log('🔍 Sentry Verification Script');
    console.log('================================\n');

    // Step 1: Check environment variables
    this.checkEnvironmentVariables();

    // Step 2: Initialize Sentry
    const initialized = await this.initializeSentry();

    if (!initialized) {
      this.printSummary();
      process.exit(1);
    }

    // Step 3: Test breadcrumbs
    await this.testBreadcrumbs();

    // Step 4: Test tags
    await this.testTags();

    // Step 5: Send test error (if requested)
    if (this.sendTest) {
      await this.sendTestError();
    } else {
      console.log('\n💡 To send a test error to Sentry, run:');
      console.log('   npm run sentry:send-test\n');
    }

    // Summary
    this.printSummary();

    // Exit code based on results
    const failed = this.results.filter(r => r.status === 'fail').length;
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run the tester
const tester = new SentryTester();
tester.run().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
