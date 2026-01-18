#!/usr/bin/env tsx
/**
 * 💳 STRIPE WEBHOOK VERIFICATION SCRIPT
 *
 * Tests Stripe webhook integration and configuration
 * Part of Wave 2: Integration Verification
 *
 * Usage:
 *   npm run stripe:test           # Basic test
 *   npm run stripe:webhook        # Start webhook listener
 *   npm run stripe:trigger        # Trigger test events
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

class StripeWebhookTester {
  private results: TestResult[] = [];
  private verbose: boolean = false;
  private stripe: Stripe | null = null;

  constructor() {
    // Parse command line arguments
    this.verbose = process.argv.includes('--verbose');
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

  private checkEnvironmentVariables(): boolean {
    console.log('\n🔐 Checking Stripe Configuration...\n');

    // Check STRIPE_SECRET_KEY
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      const keyType = secretKey.startsWith('sk_test_') ? 'test' :
                      secretKey.startsWith('sk_live_') ? 'live' : 'unknown';

      this.addResult({
        test: 'STRIPE_SECRET_KEY',
        status: 'pass',
        message: `Stripe secret key configured (${keyType} mode)`,
        details: this.verbose ? {
          keyType,
          keyPrefix: secretKey.slice(0, 12) + '...',
          length: secretKey.length
        } : undefined
      });
    } else {
      this.addResult({
        test: 'STRIPE_SECRET_KEY',
        status: 'fail',
        message: 'STRIPE_SECRET_KEY not found in environment',
        details: {
          hint: 'Get your key from https://dashboard.stripe.com/test/apikeys',
          example: 'STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx'
        }
      });
      return false;
    }

    // Check STRIPE_PUBLISHABLE_KEY
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey) {
      this.addResult({
        test: 'STRIPE_PUBLISHABLE_KEY',
        status: 'pass',
        message: 'Stripe publishable key configured'
      });
    } else {
      this.addResult({
        test: 'STRIPE_PUBLISHABLE_KEY',
        status: 'warning',
        message: 'Publishable key not set (needed for frontend)',
        details: {
          hint: 'Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local'
        }
      });
    }

    // Check STRIPE_WEBHOOK_SECRET
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      this.addResult({
        test: 'STRIPE_WEBHOOK_SECRET',
        status: 'pass',
        message: 'Webhook secret configured',
        details: this.verbose ? {
          secretPrefix: webhookSecret.slice(0, 12) + '...'
        } : undefined
      });
    } else {
      this.addResult({
        test: 'STRIPE_WEBHOOK_SECRET',
        status: 'warning',
        message: 'Webhook secret not set (needed for webhook verification)',
        details: {
          hint: 'Get it from Stripe CLI or dashboard webhooks section',
          cliCommand: 'stripe listen --print-secret'
        }
      });
    }

    return true;
  }

  private async initializeStripe(): Promise<boolean> {
    console.log('\n🚀 Initializing Stripe Client...\n');

    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      this.addResult({
        test: 'Stripe Initialization',
        status: 'fail',
        message: 'Cannot initialize - secret key not configured'
      });
      return false;
    }

    try {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2024-12-18.acacia',
        typescript: true,
      });

      // Test connection by retrieving account info
      const account = await this.stripe.accounts.retrieve();

      this.addResult({
        test: 'Stripe Initialization',
        status: 'pass',
        message: 'Stripe client initialized successfully',
        details: this.verbose ? {
          accountId: account.id,
          country: account.country,
          email: account.email,
          type: account.type
        } : undefined
      });

      return true;
    } catch (error) {
      this.addResult({
        test: 'Stripe Initialization',
        status: 'fail',
        message: `Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
      return false;
    }
  }

  private async testWebhookEndpoint(): Promise<void> {
    console.log('\n🔗 Testing Webhook Endpoint...\n');

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      const webhookPath = '/api/payments/webhook';
      const fullUrl = `${webhookUrl}${webhookPath}`;

      // Try to fetch the webhook endpoint
      try {
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'stripe-signature': 'test'
          },
          body: JSON.stringify({ type: 'ping' })
        });

        if (response.status === 400 || response.status === 401) {
          // Expected - webhook signature validation failed
          this.addResult({
            test: 'Webhook Endpoint',
            status: 'pass',
            message: 'Webhook endpoint is reachable (signature validation working)',
            details: {
              url: fullUrl,
              status: response.status,
              note: 'Signature validation is working as expected'
            }
          });
        } else if (response.ok) {
          this.addResult({
            test: 'Webhook Endpoint',
            status: 'warning',
            message: 'Webhook endpoint responded but may not be validating signatures',
            details: {
              url: fullUrl,
              status: response.status
            }
          });
        } else {
          this.addResult({
            test: 'Webhook Endpoint',
            status: 'warning',
            message: `Webhook endpoint returned status ${response.status}`,
            details: { url: fullUrl, status: response.status }
          });
        }
      } catch (fetchError: any) {
        if (fetchError.code === 'ECONNREFUSED') {
          this.addResult({
            test: 'Webhook Endpoint',
            status: 'warning',
            message: 'Development server not running',
            details: {
              hint: 'Start dev server with: npm run dev',
              url: fullUrl
            }
          });
        } else {
          throw fetchError;
        }
      }
    } catch (error) {
      this.addResult({
        test: 'Webhook Endpoint',
        status: 'fail',
        message: `Failed to test endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private async testWebhookEvents(): Promise<void> {
    console.log('\n📡 Testing Webhook Events...\n');

    if (!this.stripe) {
      this.addResult({
        test: 'Webhook Events',
        status: 'fail',
        message: 'Stripe client not initialized'
      });
      return;
    }

    try {
      // List recent webhook events
      const events = await this.stripe.events.list({
        limit: 5,
        types: ['payment_intent.succeeded', 'payment_intent.payment_failed', 'checkout.session.completed']
      });

      if (events.data.length > 0) {
        this.addResult({
          test: 'Recent Webhook Events',
          status: 'pass',
          message: `Found ${events.data.length} recent events`,
          details: this.verbose ? {
            events: events.data.map(e => ({
              id: e.id,
              type: e.type,
              created: new Date(e.created * 1000).toISOString()
            }))
          } : undefined
        });
      } else {
        this.addResult({
          test: 'Recent Webhook Events',
          status: 'warning',
          message: 'No recent webhook events found',
          details: {
            note: 'This is normal if you haven\'t processed any payments yet'
          }
        });
      }
    } catch (error) {
      this.addResult({
        test: 'Webhook Events',
        status: 'fail',
        message: `Failed to fetch events: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private async listWebhookEndpoints(): Promise<void> {
    console.log('\n🔍 Checking Configured Webhooks...\n');

    if (!this.stripe) {
      this.addResult({
        test: 'Webhook Endpoints',
        status: 'fail',
        message: 'Stripe client not initialized'
      });
      return;
    }

    try {
      const endpoints = await this.stripe.webhookEndpoints.list({ limit: 10 });

      if (endpoints.data.length > 0) {
        this.addResult({
          test: 'Webhook Endpoints',
          status: 'pass',
          message: `Found ${endpoints.data.length} configured webhook endpoint(s)`,
          details: {
            endpoints: endpoints.data.map(e => ({
              id: e.id,
              url: e.url,
              status: e.status,
              events: e.enabled_events.length,
              apiVersion: e.api_version
            }))
          }
        });

        // Check if our endpoint is configured
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
        const hasOurEndpoint = endpoints.data.some(e =>
          appUrl && e.url.includes(appUrl.replace(/^https?:\/\//, ''))
        );

        if (!hasOurEndpoint && appUrl) {
          this.addResult({
            test: 'Production Webhook',
            status: 'warning',
            message: 'Your production URL is not configured in Stripe webhooks',
            details: {
              hint: `Add ${appUrl}/api/payments/webhook to Stripe dashboard`,
              url: 'https://dashboard.stripe.com/webhooks'
            }
          });
        }
      } else {
        this.addResult({
          test: 'Webhook Endpoints',
          status: 'warning',
          message: 'No webhook endpoints configured in Stripe',
          details: {
            hint: 'For production, configure webhooks at https://dashboard.stripe.com/webhooks',
            forDevelopment: 'Use Stripe CLI: stripe listen --forward-to localhost:3001/api/payments/webhook'
          }
        });
      }
    } catch (error) {
      this.addResult({
        test: 'Webhook Endpoints',
        status: 'fail',
        message: `Failed to list endpoints: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private printInstructions(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📋 STRIPE WEBHOOK TESTING INSTRUCTIONS');
    console.log('='.repeat(60) + '\n');

    console.log('🔧 LOCAL DEVELOPMENT TESTING:\n');
    console.log('1. Install Stripe CLI:');
    console.log('   macOS: brew install stripe/stripe-cli/stripe');
    console.log('   Windows: scoop install stripe');
    console.log('   Linux: See https://stripe.com/docs/stripe-cli\n');

    console.log('2. Login to Stripe CLI:');
    console.log('   stripe login\n');

    console.log('3. Start webhook forwarding:');
    console.log('   stripe listen --forward-to localhost:3001/api/payments/webhook\n');

    console.log('4. Get webhook secret from CLI output and add to .env.local:');
    console.log('   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx\n');

    console.log('5. In a new terminal, trigger test events:');
    console.log('   stripe trigger payment_intent.succeeded');
    console.log('   stripe trigger payment_intent.payment_failed');
    console.log('   stripe trigger checkout.session.completed\n');

    console.log('6. Check your app logs to verify webhooks are received\n');

    console.log('🚀 PRODUCTION WEBHOOK SETUP:\n');
    console.log('1. Go to: https://dashboard.stripe.com/webhooks');
    console.log('2. Click "Add endpoint"');
    console.log('3. Enter URL: https://your-domain.com/api/payments/webhook');
    console.log('4. Select events to listen for:');
    console.log('   - checkout.session.completed');
    console.log('   - checkout.session.expired');
    console.log('   - payment_intent.succeeded');
    console.log('   - payment_intent.payment_failed');
    console.log('   - payment_intent.canceled');
    console.log('5. Copy the webhook signing secret');
    console.log('6. Add to production environment variables:');
    console.log('   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx\n');

    console.log('🧪 MANUAL TESTING:\n');
    console.log('1. Create a test payment in your app');
    console.log('2. Complete checkout with test card: 4242 4242 4242 4242');
    console.log('3. Check database for order status updates');
    console.log('4. Verify webhook events in Stripe dashboard\n');
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 STRIPE WEBHOOK VERIFICATION SUMMARY');
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
      console.log('   ✅ Stripe is properly configured!');
      console.log('   🔗 Set up webhook forwarding for local testing');
      console.log('   💳 Test payments with card: 4242 4242 4242 4242');
      console.log('   📊 Monitor webhooks in Stripe dashboard');
    } else {
      console.log('   1. Fix the failed tests above');
      console.log('   2. Get Stripe keys: https://dashboard.stripe.com/test/apikeys');
      console.log('   3. Add to .env.local: STRIPE_SECRET_KEY=sk_test_xxxxx');
      console.log('   4. Run this script again');
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  public async run(): Promise<void> {
    console.log('💳 Stripe Webhook Verification Script');
    console.log('=======================================\n');

    // Step 1: Check environment variables
    const hasKeys = this.checkEnvironmentVariables();

    if (!hasKeys) {
      this.printInstructions();
      this.printSummary();
      process.exit(1);
    }

    // Step 2: Initialize Stripe
    const initialized = await this.initializeStripe();

    if (!initialized) {
      this.printSummary();
      process.exit(1);
    }

    // Step 3: Test webhook endpoint
    await this.testWebhookEndpoint();

    // Step 4: Test webhook events
    await this.testWebhookEvents();

    // Step 5: List configured webhooks
    await this.listWebhookEndpoints();

    // Instructions
    this.printInstructions();

    // Summary
    this.printSummary();

    // Exit code based on results
    const failed = this.results.filter(r => r.status === 'fail').length;
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run the tester
const tester = new StripeWebhookTester();
tester.run().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
