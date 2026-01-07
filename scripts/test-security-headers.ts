#!/usr/bin/env tsx
/**
 * 🔒 SECURITY HEADERS TEST SCRIPT
 *
 * Comprehensive security headers validation for Farmers Market Platform
 * Tests all security headers against OWASP best practices
 *
 * Usage:
 *   npm run security:headers
 *   tsx scripts/test-security-headers.ts
 *   tsx scripts/test-security-headers.ts --url https://your-domain.com
 *
 * Features:
 * - Tests CSP (Content Security Policy)
 * - Validates HSTS configuration
 * - Checks all OWASP recommended headers
 * - Generates detailed report
 * - Exit code 1 if critical headers missing
 *
 * @created January 2025
 */

import * as http from 'http';
import * as https from 'https';

// ============================================================================
// CONFIGURATION
// ============================================================================

interface SecurityHeader {
  name: string;
  required: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  validate?: (value: string) => { valid: boolean; message?: string };
  description: string;
}

const SECURITY_HEADERS: SecurityHeader[] = [
  {
    name: 'Content-Security-Policy',
    required: true,
    severity: 'critical',
    validate: (value: string) => {
      const requiredDirectives = ['default-src', 'script-src', 'style-src', 'img-src'];
      const missingDirectives = requiredDirectives.filter(dir => !value.includes(dir));

      if (missingDirectives.length > 0) {
        return {
          valid: false,
          message: `Missing CSP directives: ${missingDirectives.join(', ')}`
        };
      }

      // Check for unsafe practices
      if (value.includes("'unsafe-eval'") && !value.includes('development')) {
        return {
          valid: false,
          message: "CSP contains 'unsafe-eval' - security risk!"
        };
      }

      return { valid: true };
    },
    description: 'Prevents XSS and code injection attacks'
  },
  {
    name: 'Strict-Transport-Security',
    required: true,
    severity: 'critical',
    validate: (value: string) => {
      const maxAge = value.match(/max-age=(\d+)/);
      const hasMaxAge = maxAge && parseInt(maxAge[1]) >= 31536000; // 1 year minimum
      const hasIncludeSubDomains = value.includes('includeSubDomains');

      if (!hasMaxAge) {
        return {
          valid: false,
          message: 'HSTS max-age should be at least 31536000 (1 year)'
        };
      }

      if (!hasIncludeSubDomains) {
        return {
          valid: false,
          message: 'HSTS should include "includeSubDomains"'
        };
      }

      return { valid: true };
    },
    description: 'Forces HTTPS connections'
  },
  {
    name: 'X-Frame-Options',
    required: true,
    severity: 'high',
    validate: (value: string) => {
      const validValues = ['DENY', 'SAMEORIGIN'];
      if (!validValues.includes(value.toUpperCase())) {
        return {
          valid: false,
          message: `X-Frame-Options should be DENY or SAMEORIGIN, got: ${value}`
        };
      }
      return { valid: true };
    },
    description: 'Prevents clickjacking attacks'
  },
  {
    name: 'X-Content-Type-Options',
    required: true,
    severity: 'high',
    validate: (value: string) => {
      if (value.toLowerCase() !== 'nosniff') {
        return {
          valid: false,
          message: `X-Content-Type-Options should be "nosniff", got: ${value}`
        };
      }
      return { valid: true };
    },
    description: 'Prevents MIME type sniffing'
  },
  {
    name: 'Referrer-Policy',
    required: true,
    severity: 'medium',
    validate: (value: string) => {
      const validPolicies = [
        'no-referrer',
        'no-referrer-when-downgrade',
        'strict-origin',
        'strict-origin-when-cross-origin',
        'same-origin'
      ];

      if (!validPolicies.includes(value.toLowerCase())) {
        return {
          valid: false,
          message: `Invalid Referrer-Policy: ${value}`
        };
      }

      return { valid: true };
    },
    description: 'Controls referrer information'
  },
  {
    name: 'Permissions-Policy',
    required: true,
    severity: 'medium',
    validate: (value: string) => {
      // Check that dangerous features are restricted
      const dangerousFeatures = ['camera', 'microphone', 'geolocation'];
      const restrictedFeatures = dangerousFeatures.filter(feature => {
        return value.includes(`${feature}=()`) || value.includes(`${feature}=(self)`);
      });

      if (restrictedFeatures.length < dangerousFeatures.length) {
        return {
          valid: false,
          message: 'Some dangerous features not restricted (camera, microphone, geolocation)'
        };
      }

      return { valid: true };
    },
    description: 'Controls browser features'
  },
  {
    name: 'X-XSS-Protection',
    required: false,
    severity: 'low',
    validate: (value: string) => {
      if (value !== '1; mode=block' && value !== '0') {
        return {
          valid: false,
          message: `X-XSS-Protection should be "1; mode=block" or "0", got: ${value}`
        };
      }
      return { valid: true };
    },
    description: 'Legacy XSS protection (use CSP instead)'
  },
  {
    name: 'Cross-Origin-Embedder-Policy',
    required: false,
    severity: 'medium',
    description: 'Prevents loading cross-origin resources'
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    required: false,
    severity: 'medium',
    description: 'Isolates browsing context'
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    required: false,
    severity: 'medium',
    description: 'Controls cross-origin resource sharing'
  }
];

// ============================================================================
// TEST RESULTS
// ============================================================================

interface TestResult {
  header: string;
  present: boolean;
  value?: string;
  valid: boolean;
  severity: string;
  message?: string;
  description: string;
}

// ============================================================================
// FETCH HEADERS
// ============================================================================

async function fetchHeaders(url: string): Promise<http.IncomingHttpHeaders> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, (response) => {
      resolve(response.headers);
    });

    request.on('error', (error) => {
      reject(error);
    });

    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// ============================================================================
// TEST HEADERS
// ============================================================================

function testHeaders(headers: http.IncomingHttpHeaders): TestResult[] {
  const results: TestResult[] = [];

  for (const headerDef of SECURITY_HEADERS) {
    const headerKey = Object.keys(headers).find(
      key => key.toLowerCase() === headerDef.name.toLowerCase()
    );

    const headerValue = headerKey ? headers[headerKey] as string : undefined;
    const isPresent = !!headerValue;

    let valid = true;
    let message: string | undefined;

    if (isPresent && headerDef.validate) {
      const validation = headerDef.validate(headerValue);
      valid = validation.valid;
      message = validation.message;
    } else if (!isPresent && headerDef.required) {
      valid = false;
      message = 'Header missing';
    }

    results.push({
      header: headerDef.name,
      present: isPresent,
      value: headerValue,
      valid: valid,
      severity: headerDef.severity,
      message: message,
      description: headerDef.description
    });
  }

  return results;
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateReport(results: TestResult[], url: string): void {
  console.log('\n🔒 ========================================');
  console.log('   SECURITY HEADERS TEST REPORT');
  console.log('========================================\n');
  console.log(`📍 URL: ${url}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

  // Summary
  const totalHeaders = results.length;
  const presentHeaders = results.filter(r => r.present).length;
  const validHeaders = results.filter(r => r.valid).length;
  const criticalIssues = results.filter(r => !r.valid && r.severity === 'critical').length;
  const highIssues = results.filter(r => !r.valid && r.severity === 'high').length;
  const mediumIssues = results.filter(r => !r.valid && r.severity === 'medium').length;

  console.log('📊 SUMMARY');
  console.log('─────────────────────────────────────────');
  console.log(`Total Headers Checked: ${totalHeaders}`);
  console.log(`Present: ${presentHeaders}/${totalHeaders}`);
  console.log(`Valid: ${validHeaders}/${presentHeaders}`);
  console.log('\n🚨 ISSUES');
  console.log(`Critical: ${criticalIssues}`);
  console.log(`High: ${highIssues}`);
  console.log(`Medium: ${mediumIssues}`);
  console.log('');

  // Detailed results
  console.log('📋 DETAILED RESULTS');
  console.log('─────────────────────────────────────────\n');

  // Group by severity
  const bySeverity: Record<string, TestResult[]> = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };

  results.forEach(result => {
    bySeverity[result.severity].push(result);
  });

  // Display results by severity
  for (const [severity, severityResults] of Object.entries(bySeverity)) {
    if (severityResults.length === 0) continue;

    const emoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '⚪'
    }[severity];

    console.log(`${emoji} ${severity.toUpperCase()} SEVERITY`);
    console.log('─────────────────────────────────────────');

    for (const result of severityResults) {
      const status = result.valid ? '✅' : '❌';
      const presence = result.present ? 'Present' : 'Missing';

      console.log(`\n${status} ${result.header}`);
      console.log(`   Status: ${presence}`);
      console.log(`   Description: ${result.description}`);

      if (result.value) {
        const truncatedValue = result.value.length > 100
          ? result.value.substring(0, 100) + '...'
          : result.value;
        console.log(`   Value: ${truncatedValue}`);
      }

      if (result.message) {
        console.log(`   ⚠️  ${result.message}`);
      }
    }

    console.log('');
  }

  // Score calculation
  const score = (validHeaders / totalHeaders) * 100;
  const scoreEmoji = score >= 90 ? '🏆' : score >= 70 ? '✅' : score >= 50 ? '⚠️' : '❌';

  console.log('─────────────────────────────────────────');
  console.log(`${scoreEmoji} SECURITY SCORE: ${score.toFixed(1)}%\n`);

  if (score >= 90) {
    console.log('🎉 Excellent! Security headers are properly configured.\n');
  } else if (score >= 70) {
    console.log('✅ Good! Most security headers are in place, but some improvements needed.\n');
  } else if (score >= 50) {
    console.log('⚠️  Warning! Several security headers are missing or misconfigured.\n');
  } else {
    console.log('❌ Critical! Major security headers are missing. Immediate action required!\n');
  }

  // Recommendations
  if (criticalIssues > 0 || highIssues > 0) {
    console.log('💡 RECOMMENDATIONS');
    console.log('─────────────────────────────────────────');

    results
      .filter(r => !r.valid && (r.severity === 'critical' || r.severity === 'high'))
      .forEach(result => {
        console.log(`\n• ${result.header}`);
        console.log(`  ${result.message || 'Missing header'}`);
        console.log(`  Impact: ${result.description}`);
      });

    console.log('');
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const urlArg = args.find(arg => arg.startsWith('--url='));
  const url = urlArg
    ? urlArg.split('=')[1]
    : process.env.TEST_URL || 'http://localhost:3000';

  console.log('\n🔍 Testing security headers...\n');
  console.log(`Target: ${url}`);

  try {
    const headers = await fetchHeaders(url);
    const results = testHeaders(headers);
    generateReport(results, url);

    // Exit with error if critical issues found
    const criticalIssues = results.filter(
      r => !r.valid && r.severity === 'critical'
    ).length;

    if (criticalIssues > 0) {
      console.log('❌ Critical security issues found!\n');
      process.exit(1);
    }

    console.log('✅ Security headers test completed!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR: Failed to fetch headers\n');
    if (error instanceof Error) {
      console.error(error.message);
    }
    console.error('\nMake sure the server is running and accessible.\n');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { fetchHeaders, generateReport, testHeaders };

