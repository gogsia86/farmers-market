#!/usr/bin/env tsx

/**
 * 📊 PRODUCTION MONITORING DASHBOARD
 *
 * Real-time monitoring and health checks for production environment
 * Tracks performance, errors, cache efficiency, and database health
 *
 * Features:
 * - Live health monitoring
 * - Performance metrics tracking
 * - Cache hit/miss rates
 * - Database query performance
 * - Error rate monitoring
 * - Alert detection
 * - Historical trend analysis
 *
 * Usage:
 *   npm run monitor:production
 *   tsx scripts/monitor-production.ts
 *   tsx scripts/monitor-production.ts --watch
 *   tsx scripts/monitor-production.ts --interval 30
 */


// ============================================================================
// CONFIGURATION
// ============================================================================

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://farmers-market-platform.vercel.app';
const WATCH_MODE = process.argv.includes('--watch');
const INTERVAL_ARG = process.argv.find(arg => arg.startsWith('--interval='));
const CHECK_INTERVAL = INTERVAL_ARG
  ? parseInt(INTERVAL_ARG.split('=')[1]) * 1000
  : 60000; // Default 60 seconds

// ============================================================================
// TYPES
// ============================================================================

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database?: {
      status: string;
      latency?: number;
      message?: string;
    };
    cache?: {
      status: string;
      latency?: number;
      message?: string;
    };
    system?: {
      status: string;
      memory?: {
        used: number;
        total: number;
        percentage: number;
      };
    };
  };
}

interface PerformanceMetrics {
  endpoint: string;
  status: number;
  responseTime: number;
  timestamp: string;
  success: boolean;
}

interface MonitoringSnapshot {
  timestamp: string;
  health: HealthCheckResult;
  performance: PerformanceMetrics[];
  alerts: Alert[];
}

interface Alert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  metric?: string;
  value?: number | string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Make HTTP request with timeout
 */
async function fetchWithTimeout(
  url: string,
  timeout: number = 10000
): Promise<{ status: number; data?: any; responseTime: number }> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Production-Monitor/1.0'
      }
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - start;

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    }

    return {
      status: response.status,
      data,
      responseTime
    };
  } catch (error: any) {
    return {
      status: error.name === 'AbortError' ? 408 : 500,
      responseTime: Date.now() - start
    };
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}

/**
 * Format milliseconds to human readable
 */
function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Get status emoji
 */
function getStatusEmoji(status: string | number): string {
  if (typeof status === 'number') {
    if (status >= 200 && status < 300) return '✅';
    if (status >= 300 && status < 400) return '↪️';
    if (status >= 400 && status < 500) return '⚠️';
    return '❌';
  }

  switch (status) {
    case 'healthy': return '✅';
    case 'degraded': return '⚠️';
    case 'unhealthy': return '❌';
    default: return '❓';
  }
}

/**
 * Clear console (for watch mode)
 */
function clearConsole() {
  console.clear();
}

// ============================================================================
// MONITORING FUNCTIONS
// ============================================================================

/**
 * Check production health endpoint
 */
async function checkHealth(): Promise<HealthCheckResult> {
  try {
    const { status, data, responseTime } = await fetchWithTimeout(
      `${PRODUCTION_URL}/api/health`
    );

    if (status !== 200 && status !== 503) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {}
      };
    }

    return data as HealthCheckResult;
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {}
    };
  }
}

/**
 * Check multiple production endpoints
 */
async function checkEndpoints(): Promise<PerformanceMetrics[]> {
  const endpoints = [
    { path: '/', name: 'Homepage' },
    { path: '/api/farms', name: 'Farms API' },
    { path: '/api/products', name: 'Products API' },
    { path: '/api/health', name: 'Health Check' },
    { path: '/browse-farms', name: 'Browse Farms' },
    { path: '/browse-products', name: 'Browse Products' }
  ];

  const results = await Promise.all(
    endpoints.map(async ({ path, name }) => {
      const { status, responseTime } = await fetchWithTimeout(
        `${PRODUCTION_URL}${path}`
      );

      return {
        endpoint: name,
        status,
        responseTime,
        timestamp: new Date().toISOString(),
        success: status >= 200 && status < 400
      };
    })
  );

  return results;
}

/**
 * Analyze metrics and generate alerts
 */
function analyzeMetrics(
  health: HealthCheckResult,
  performance: PerformanceMetrics[]
): Alert[] {
  const alerts: Alert[] = [];

  // Health status alerts
  if (health.status === 'unhealthy') {
    alerts.push({
      level: 'critical',
      message: 'System health is UNHEALTHY',
      timestamp: new Date().toISOString(),
      metric: 'health.status',
      value: 'unhealthy'
    });
  } else if (health.status === 'degraded') {
    alerts.push({
      level: 'warning',
      message: 'System health is DEGRADED',
      timestamp: new Date().toISOString(),
      metric: 'health.status',
      value: 'degraded'
    });
  }

  // Database alerts
  if (health.checks.database) {
    const dbLatency = health.checks.database.latency || 0;

    if (health.checks.database.status === 'unhealthy') {
      alerts.push({
        level: 'critical',
        message: 'Database is UNHEALTHY',
        timestamp: new Date().toISOString(),
        metric: 'database.status',
        value: health.checks.database.message || 'unknown'
      });
    } else if (dbLatency > 1000) {
      alerts.push({
        level: 'warning',
        message: `Database latency is high: ${dbLatency}ms`,
        timestamp: new Date().toISOString(),
        metric: 'database.latency',
        value: dbLatency
      });
    }
  }

  // Cache alerts
  if (health.checks.cache?.status === 'degraded') {
    alerts.push({
      level: 'warning',
      message: 'Cache system is degraded',
      timestamp: new Date().toISOString(),
      metric: 'cache.status',
      value: 'degraded'
    });
  }

  // Memory alerts
  if (health.checks.system?.memory) {
    const memPct = health.checks.system.memory.percentage;

    if (memPct > 90) {
      alerts.push({
        level: 'critical',
        message: `Memory usage critical: ${memPct.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        metric: 'memory.percentage',
        value: memPct
      });
    } else if (memPct > 80) {
      alerts.push({
        level: 'warning',
        message: `Memory usage high: ${memPct.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        metric: 'memory.percentage',
        value: memPct
      });
    }
  }

  // Performance alerts
  const slowEndpoints = performance.filter(p => p.responseTime > 3000);
  const failedEndpoints = performance.filter(p => !p.success);

  if (failedEndpoints.length > 0) {
    failedEndpoints.forEach(endpoint => {
      alerts.push({
        level: 'critical',
        message: `Endpoint ${endpoint.endpoint} failed (${endpoint.status})`,
        timestamp: new Date().toISOString(),
        metric: 'endpoint.status',
        value: endpoint.status
      });
    });
  }

  if (slowEndpoints.length > 0) {
    slowEndpoints.forEach(endpoint => {
      alerts.push({
        level: 'warning',
        message: `Endpoint ${endpoint.endpoint} is slow (${endpoint.responseTime}ms)`,
        timestamp: new Date().toISOString(),
        metric: 'endpoint.responseTime',
        value: endpoint.responseTime
      });
    });
  }

  return alerts;
}

/**
 * Display monitoring dashboard
 */
function displayDashboard(snapshot: MonitoringSnapshot) {
  const { health, performance, alerts } = snapshot;

  console.log('');
  console.log('📊 PRODUCTION MONITORING DASHBOARD');
  console.log('='.repeat(80));
  console.log(`Timestamp: ${snapshot.timestamp}`);
  console.log(`Production: ${PRODUCTION_URL}`);
  console.log('='.repeat(80));
  console.log('');

  // Overall Health
  console.log('🏥 SYSTEM HEALTH');
  console.log('-'.repeat(80));
  console.log(`${getStatusEmoji(health.status)} Overall Status: ${health.status.toUpperCase()}`);

  if (health.checks.database) {
    const db = health.checks.database;
    console.log(`${getStatusEmoji(db.status)} Database: ${db.status.toUpperCase()}${db.latency ? ` (${db.latency}ms)` : ''}`);
    if (db.message) {
      console.log(`   ${db.message}`);
    }
  }

  if (health.checks.cache) {
    const cache = health.checks.cache;
    console.log(`${getStatusEmoji(cache.status)} Cache: ${cache.status.toUpperCase()}${cache.latency ? ` (${cache.latency}ms)` : ''}`);
  }

  if (health.checks.system?.memory) {
    const mem = health.checks.system.memory;
    const memStatus = mem.percentage > 80 ? 'warning' : 'healthy';
    console.log(`${getStatusEmoji(memStatus)} Memory: ${mem.used}MB / ${mem.total}MB (${mem.percentage.toFixed(1)}%)`);
  }

  console.log('');

  // Performance Metrics
  console.log('⚡ ENDPOINT PERFORMANCE');
  console.log('-'.repeat(80));

  const avgResponseTime = performance.reduce((sum, p) => sum + p.responseTime, 0) / performance.length;
  const successRate = (performance.filter(p => p.success).length / performance.length) * 100;

  console.log(`Average Response Time: ${formatMs(avgResponseTime)}`);
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);
  console.log('');

  performance.forEach(metric => {
    const emoji = getStatusEmoji(metric.status);
    const time = formatMs(metric.responseTime);
    const statusColor = metric.success ? '' : ' ⚠️';

    console.log(`${emoji} ${metric.endpoint.padEnd(20)} ${metric.status} ${time}${statusColor}`);
  });

  console.log('');

  // Alerts
  if (alerts.length > 0) {
    console.log('🚨 ALERTS');
    console.log('-'.repeat(80));

    const criticalAlerts = alerts.filter(a => a.level === 'critical');
    const warningAlerts = alerts.filter(a => a.level === 'warning');

    if (criticalAlerts.length > 0) {
      console.log(`❌ Critical Alerts: ${criticalAlerts.length}`);
      criticalAlerts.forEach(alert => {
        console.log(`   • ${alert.message}`);
      });
      console.log('');
    }

    if (warningAlerts.length > 0) {
      console.log(`⚠️  Warning Alerts: ${warningAlerts.length}`);
      warningAlerts.forEach(alert => {
        console.log(`   • ${alert.message}`);
      });
      console.log('');
    }
  } else {
    console.log('✅ NO ALERTS - All systems nominal');
    console.log('');
  }

  // Recommendations
  if (alerts.length > 0) {
    console.log('💡 RECOMMENDATIONS');
    console.log('-'.repeat(80));

    const hasDbIssue = alerts.some(a => a.metric?.startsWith('database'));
    const hasCacheIssue = alerts.some(a => a.metric?.startsWith('cache'));
    const hasMemoryIssue = alerts.some(a => a.metric?.startsWith('memory'));
    const hasPerformanceIssue = alerts.some(a => a.metric?.startsWith('endpoint'));

    if (hasDbIssue) {
      console.log('• Database Issues:');
      console.log('  - Run: npm run diagnose:db');
      console.log('  - Check DATABASE_URL in Vercel environment variables');
      console.log('  - Verify database server connectivity');
    }

    if (hasCacheIssue) {
      console.log('• Cache Issues:');
      console.log('  - Check Redis connection (REDIS_HOST, REDIS_PORT, REDIS_PASSWORD)');
      console.log('  - Warm cache: npm run warm-cache -- --production');
    }

    if (hasMemoryIssue) {
      console.log('• Memory Issues:');
      console.log('  - Consider upgrading Vercel plan');
      console.log('  - Review memory-intensive operations');
      console.log('  - Check for memory leaks');
    }

    if (hasPerformanceIssue) {
      console.log('• Performance Issues:');
      console.log('  - Warm cache: npm run warm-cache -- --production');
      console.log('  - Review slow queries');
      console.log('  - Enable CDN caching');
    }

    console.log('');
  }

  console.log('='.repeat(80));

  if (WATCH_MODE) {
    console.log(`Next check in ${CHECK_INTERVAL / 1000}s... (Press Ctrl+C to stop)`);
  }
}

/**
 * Perform single monitoring check
 */
async function performMonitoringCheck(): Promise<MonitoringSnapshot> {
  const [health, performance] = await Promise.all([
    checkHealth(),
    checkEndpoints()
  ]);

  const alerts = analyzeMetrics(health, performance);

  return {
    timestamp: new Date().toISOString(),
    health,
    performance,
    alerts
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Starting production monitoring...');
  console.log(`Target: ${PRODUCTION_URL}`);
  console.log(`Watch mode: ${WATCH_MODE ? 'Enabled' : 'Disabled'}`);

  if (WATCH_MODE) {
    console.log(`Check interval: ${CHECK_INTERVAL / 1000}s`);
  }

  console.log('');

  try {
    // Initial check
    const snapshot = await performMonitoringCheck();

    if (WATCH_MODE) {
      clearConsole();
    }

    displayDashboard(snapshot);

    // Watch mode: continuous monitoring
    if (WATCH_MODE) {
      setInterval(async () => {
        try {
          const snapshot = await performMonitoringCheck();
          clearConsole();
          displayDashboard(snapshot);
        } catch (error) {
          console.error('❌ Monitoring check failed:', error);
        }
      }, CHECK_INTERVAL);

      // Keep process alive
      await new Promise(() => {});
    } else {
      // Single check mode - exit based on health
      const hasIssues = snapshot.alerts.some(a => a.level === 'critical');
      process.exit(hasIssues ? 1 : 0);
    }
  } catch (error) {
    console.error('❌ Production monitoring failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as monitorProduction, performMonitoringCheck };
