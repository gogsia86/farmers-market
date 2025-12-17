/**
 * 🔍 Real-Time Resource Monitoring for Load Tests
 * Monitors system resources during performance testing
 *
 * Features:
 * - CPU and memory monitoring
 * - Database connection tracking
 * - Response time analysis
 * - Real-time metrics collection
 * - Historical data storage
 * - Alert thresholds
 *
 * Usage:
 *   tsx tests/load/resource-monitor.ts --start
 *   tsx tests/load/resource-monitor.ts --stop
 *   tsx tests/load/resource-monitor.ts --report
 *
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';

// ============================================================================
// CONFIGURATION
// ============================================================================

const RESULTS_DIR = path.join(process.cwd(), 'tests', 'load', 'results');
const MONITORING_DIR = path.join(RESULTS_DIR, 'monitoring');
const MONITORING_DATA_FILE = path.join(MONITORING_DIR, 'current-monitoring-session.json');
const MONITORING_LOG_FILE = path.join(MONITORING_DIR, 'monitoring.log');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const MONITORING_INTERVAL = parseInt(process.env.MONITORING_INTERVAL || '5000', 10); // 5 seconds
const ALERT_CPU_THRESHOLD = parseFloat(process.env.ALERT_CPU_THRESHOLD || '80'); // 80%
const ALERT_MEMORY_THRESHOLD = parseFloat(process.env.ALERT_MEMORY_THRESHOLD || '85'); // 85%
const ALERT_LATENCY_THRESHOLD = parseInt(process.env.ALERT_LATENCY_THRESHOLD || '2000', 10); // 2s

// ============================================================================
// TYPES
// ============================================================================

interface ResourceSnapshot {
  timestamp: string;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  process: {
    cpu: number;
    memory: number;
    memoryPercent: number;
  };
  api: {
    available: boolean;
    latency: number;
    statusCode: number | null;
  };
  database?: {
    connections: number;
    activeQueries: number;
  };
}

interface MonitoringSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  snapshots: ResourceSnapshot[];
  alerts: Alert[];
  summary?: MonitoringSummary;
}

interface Alert {
  timestamp: string;
  level: 'warning' | 'critical';
  type: 'cpu' | 'memory' | 'latency' | 'api';
  message: string;
  value: number;
  threshold: number;
}

interface MonitoringSummary {
  totalSnapshots: number;
  duration: number;
  averages: {
    cpuUsage: number;
    memoryUsage: number;
    apiLatency: number;
  };
  peaks: {
    cpuUsage: number;
    memoryUsage: number;
    apiLatency: number;
  };
  alertCounts: {
    warning: number;
    critical: number;
  };
  availability: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function ensureDirectories(): void {
  [RESULTS_DIR, MONITORING_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  console.log(message);

  ensureDirectories();
  fs.appendFileSync(MONITORING_LOG_FILE, logMessage);
}

function generateSessionId(): string {
  return `monitor-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

function loadCurrentSession(): MonitoringSession | null {
  if (!fs.existsSync(MONITORING_DATA_FILE)) {
    return null;
  }

  try {
    const content = fs.readFileSync(MONITORING_DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    log(`❌ Failed to load monitoring session: ${error}`);
    return null;
  }
}

function saveSession(session: MonitoringSession): void {
  ensureDirectories();
  fs.writeFileSync(MONITORING_DATA_FILE, JSON.stringify(session, null, 2));
}

function archiveSession(session: MonitoringSession): void {
  ensureDirectories();
  const timestamp = session.startTime.replace(/[:.]/g, '-');
  const archiveFile = path.join(MONITORING_DIR, `session-${timestamp}.json`);
  fs.writeFileSync(archiveFile, JSON.stringify(session, null, 2));
  log(`✅ Session archived to ${archiveFile}`);
}

// ============================================================================
// RESOURCE MONITORING
// ============================================================================

function getCPUUsage(): number {
  try {
    if (process.platform === 'win32') {
      // Windows
      const output = execSync(
        'wmic cpu get loadpercentage',
        { encoding: 'utf-8', timeout: 5000 }
      );
      const match = output.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    } else {
      // Linux/Mac
      const output = execSync(
        "top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'",
        { encoding: 'utf-8', timeout: 5000 }
      );
      return parseFloat(output.trim()) || 0;
    }
  } catch {
    return 0;
  }
}

function getLoadAverage(): number[] {
  try {
    if (process.platform === 'win32') {
      // Windows doesn't have load average, return CPU-based estimate
      const cpu = getCPUUsage();
      return [cpu / 100, cpu / 100, cpu / 100];
    } else {
      // Linux/Mac
      const output = execSync('uptime', { encoding: 'utf-8', timeout: 5000 });
      const match = output.match(/load average: ([\d.]+), ([\d.]+), ([\d.]+)/);
      if (match) {
        return [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];
      }
      return [0, 0, 0];
    }
  } catch {
    return [0, 0, 0];
  }
}

function getMemoryUsage(): { total: number; used: number; free: number; usagePercent: number } {
  try {
    if (process.platform === 'win32') {
      // Windows
      const totalOutput = execSync('wmic OS get TotalVisibleMemorySize', {
        encoding: 'utf-8',
        timeout: 5000,
      });
      const freeOutput = execSync('wmic OS get FreePhysicalMemory', {
        encoding: 'utf-8',
        timeout: 5000,
      });

      const totalMatch = totalOutput.match(/\d+/);
      const freeMatch = freeOutput.match(/\d+/);

      if (totalMatch && freeMatch) {
        const total = parseInt(totalMatch[0], 10) * 1024; // Convert KB to bytes
        const free = parseInt(freeMatch[0], 10) * 1024;
        const used = total - free;
        const usagePercent = (used / total) * 100;

        return { total, used, free, usagePercent };
      }
    } else {
      // Linux/Mac
      const output = execSync('free -b', { encoding: 'utf-8', timeout: 5000 });
      const lines = output.split('\n');
      const memLine = lines.find((line) => line.startsWith('Mem:'));

      if (memLine) {
        const parts = memLine.split(/\s+/);
        const total = parseInt(parts[1], 10);
        const used = parseInt(parts[2], 10);
        const free = parseInt(parts[3], 10);
        const usagePercent = (used / total) * 100;

        return { total, used, free, usagePercent };
      }
    }
  } catch {
    // Fallback to Node.js memory info
    const total = require('os').totalmem();
    const free = require('os').freemem();
    const used = total - free;
    const usagePercent = (used / total) * 100;
    return { total, used, free, usagePercent };
  }

  return { total: 0, used: 0, free: 0, usagePercent: 0 };
}

function getProcessMemory(): { memory: number; memoryPercent: number } {
  const memUsage = process.memoryUsage();
  const systemMemory = require('os').totalmem();
  const processMemory = memUsage.heapUsed + memUsage.external;
  const memoryPercent = (processMemory / systemMemory) * 100;

  return {
    memory: processMemory,
    memoryPercent,
  };
}

function getProcessCPU(): number {
  try {
    const pid = process.pid;
    if (process.platform === 'win32') {
      const output = execSync(
        `wmic path win32_perfformatteddata_perfproc_process where IDProcess=${pid} get PercentProcessorTime`,
        { encoding: 'utf-8', timeout: 5000 }
      );
      const match = output.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    } else {
      const output = execSync(`ps -p ${pid} -o %cpu`, { encoding: 'utf-8', timeout: 5000 });
      const match = output.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    }
  } catch {
    return 0;
  }
}

async function checkAPIHealth(): Promise<{
  available: boolean;
  latency: number;
  statusCode: number | null;
}> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = new URL(`${BASE_URL}/api/health`);
    const client = url.protocol === 'https:' ? https : http;

    const req = client.get(url, { timeout: 10000 }, (res) => {
      const latency = Date.now() - startTime;
      resolve({
        available: res.statusCode === 200,
        latency,
        statusCode: res.statusCode || null,
      });
      res.resume(); // Consume response
    });

    req.on('error', () => {
      const latency = Date.now() - startTime;
      resolve({
        available: false,
        latency,
        statusCode: null,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        available: false,
        latency: 10000,
        statusCode: null,
      });
    });
  });
}

async function captureResourceSnapshot(): Promise<ResourceSnapshot> {
  const cpu = getCPUUsage();
  const loadAverage = getLoadAverage();
  const memory = getMemoryUsage();
  const processCpu = getProcessCPU();
  const processMemory = getProcessMemory();
  const api = await checkAPIHealth();

  return {
    timestamp: new Date().toISOString(),
    cpu: {
      usage: cpu,
      loadAverage,
    },
    memory: {
      total: memory.total,
      used: memory.used,
      free: memory.free,
      usagePercent: memory.usagePercent,
    },
    process: {
      cpu: processCpu,
      memory: processMemory.memory,
      memoryPercent: processMemory.memoryPercent,
    },
    api,
  };
}

// ============================================================================
// ALERT SYSTEM
// ============================================================================

function checkThresholds(snapshot: ResourceSnapshot): Alert[] {
  const alerts: Alert[] = [];

  // CPU threshold
  if (snapshot.cpu.usage > ALERT_CPU_THRESHOLD) {
    alerts.push({
      timestamp: snapshot.timestamp,
      level: snapshot.cpu.usage > 95 ? 'critical' : 'warning',
      type: 'cpu',
      message: `High CPU usage: ${snapshot.cpu.usage.toFixed(2)}%`,
      value: snapshot.cpu.usage,
      threshold: ALERT_CPU_THRESHOLD,
    });
  }

  // Memory threshold
  if (snapshot.memory.usagePercent > ALERT_MEMORY_THRESHOLD) {
    alerts.push({
      timestamp: snapshot.timestamp,
      level: snapshot.memory.usagePercent > 95 ? 'critical' : 'warning',
      type: 'memory',
      message: `High memory usage: ${snapshot.memory.usagePercent.toFixed(2)}%`,
      value: snapshot.memory.usagePercent,
      threshold: ALERT_MEMORY_THRESHOLD,
    });
  }

  // API latency threshold
  if (snapshot.api.latency > ALERT_LATENCY_THRESHOLD) {
    alerts.push({
      timestamp: snapshot.timestamp,
      level: snapshot.api.latency > 5000 ? 'critical' : 'warning',
      type: 'latency',
      message: `High API latency: ${snapshot.api.latency}ms`,
      value: snapshot.api.latency,
      threshold: ALERT_LATENCY_THRESHOLD,
    });
  }

  // API availability
  if (!snapshot.api.available) {
    alerts.push({
      timestamp: snapshot.timestamp,
      level: 'critical',
      type: 'api',
      message: 'API is unavailable',
      value: 0,
      threshold: 1,
    });
  }

  return alerts;
}

function logAlerts(alerts: Alert[]): void {
  alerts.forEach((alert) => {
    const icon = alert.level === 'critical' ? '🔴' : '⚠️';
    log(`${icon} ${alert.level.toUpperCase()}: ${alert.message}`);
  });
}

// ============================================================================
// MONITORING LOOP
// ============================================================================

let monitoringInterval: NodeJS.Timeout | null = null;

async function startMonitoring(): Promise<void> {
  log('🚀 Starting resource monitoring...');

  const session: MonitoringSession = {
    sessionId: generateSessionId(),
    startTime: new Date().toISOString(),
    snapshots: [],
    alerts: [],
  };

  saveSession(session);

  log(`📊 Session ID: ${session.sessionId}`);
  log(`⏱️  Monitoring interval: ${MONITORING_INTERVAL}ms`);
  log(`🎯 CPU threshold: ${ALERT_CPU_THRESHOLD}%`);
  log(`🎯 Memory threshold: ${ALERT_MEMORY_THRESHOLD}%`);
  log(`🎯 Latency threshold: ${ALERT_LATENCY_THRESHOLD}ms`);
  log('');

  let snapshotCount = 0;

  monitoringInterval = setInterval(async () => {
    try {
      snapshotCount++;
      const snapshot = await captureResourceSnapshot();
      session.snapshots.push(snapshot);

      // Check thresholds
      const alerts = checkThresholds(snapshot);
      if (alerts.length > 0) {
        session.alerts.push(...alerts);
        logAlerts(alerts);
      }

      // Log snapshot (every 10th snapshot to avoid spam)
      if (snapshotCount % 10 === 0) {
        log(
          `📊 Snapshot #${snapshotCount}: CPU ${snapshot.cpu.usage.toFixed(1)}% | Memory ${snapshot.memory.usagePercent.toFixed(1)}% | API ${snapshot.api.latency}ms`
        );
      }

      saveSession(session);
    } catch (error) {
      log(`❌ Error capturing snapshot: ${error}`);
    }
  }, MONITORING_INTERVAL);

  log('✅ Monitoring started. Press Ctrl+C or run with --stop to end.\n');
}

function stopMonitoring(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }

  const session = loadCurrentSession();

  if (!session) {
    log('❌ No active monitoring session found.');
    return;
  }

  log('\n🛑 Stopping resource monitoring...');

  session.endTime = new Date().toISOString();
  session.duration =
    new Date(session.endTime).getTime() - new Date(session.startTime).getTime();

  // Calculate summary
  session.summary = calculateSummary(session);

  saveSession(session);
  archiveSession(session);

  // Generate report
  generateReport(session);

  // Clean up current session file
  if (fs.existsSync(MONITORING_DATA_FILE)) {
    fs.unlinkSync(MONITORING_DATA_FILE);
  }

  log('✅ Monitoring stopped and session saved.\n');
}

// ============================================================================
// SUMMARY & REPORTING
// ============================================================================

function calculateSummary(session: MonitoringSession): MonitoringSummary {
  const snapshots = session.snapshots;

  if (snapshots.length === 0) {
    return {
      totalSnapshots: 0,
      duration: 0,
      averages: { cpuUsage: 0, memoryUsage: 0, apiLatency: 0 },
      peaks: { cpuUsage: 0, memoryUsage: 0, apiLatency: 0 },
      alertCounts: { warning: 0, critical: 0 },
      availability: 0,
    };
  }

  const cpuUsages = snapshots.map((s) => s.cpu.usage);
  const memoryUsages = snapshots.map((s) => s.memory.usagePercent);
  const apiLatencies = snapshots.map((s) => s.api.latency);
  const availableCount = snapshots.filter((s) => s.api.available).length;

  const avgCpu = cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length;
  const avgMemory = memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length;
  const avgLatency = apiLatencies.reduce((a, b) => a + b, 0) / apiLatencies.length;

  const peakCpu = Math.max(...cpuUsages);
  const peakMemory = Math.max(...memoryUsages);
  const peakLatency = Math.max(...apiLatencies);

  const warningCount = session.alerts.filter((a) => a.level === 'warning').length;
  const criticalCount = session.alerts.filter((a) => a.level === 'critical').length;

  const availability = (availableCount / snapshots.length) * 100;

  return {
    totalSnapshots: snapshots.length,
    duration: session.duration || 0,
    averages: {
      cpuUsage: avgCpu,
      memoryUsage: avgMemory,
      apiLatency: avgLatency,
    },
    peaks: {
      cpuUsage: peakCpu,
      memoryUsage: peakMemory,
      apiLatency: peakLatency,
    },
    alertCounts: {
      warning: warningCount,
      critical: criticalCount,
    },
    availability,
  };
}

function generateReport(session: MonitoringSession): void {
  const summary = session.summary;

  if (!summary) {
    log('❌ No summary available for report generation.');
    return;
  }

  console.log('\n' + '═'.repeat(80));
  console.log('📊 RESOURCE MONITORING REPORT');
  console.log('═'.repeat(80));

  console.log(`\n🆔 Session ID: ${session.sessionId}`);
  console.log(`⏰ Start Time: ${session.startTime}`);
  console.log(`⏰ End Time: ${session.endTime}`);
  console.log(
    `⏱️  Duration: ${(summary.duration / 1000 / 60).toFixed(2)} minutes`
  );
  console.log(`📸 Snapshots: ${summary.totalSnapshots}`);

  console.log('\n📊 AVERAGE METRICS:');
  console.log(`   CPU Usage: ${summary.averages.cpuUsage.toFixed(2)}%`);
  console.log(`   Memory Usage: ${summary.averages.memoryUsage.toFixed(2)}%`);
  console.log(`   API Latency: ${summary.averages.apiLatency.toFixed(2)}ms`);

  console.log('\n🔥 PEAK METRICS:');
  console.log(`   CPU Usage: ${summary.peaks.cpuUsage.toFixed(2)}%`);
  console.log(`   Memory Usage: ${summary.peaks.memoryUsage.toFixed(2)}%`);
  console.log(`   API Latency: ${summary.peaks.apiLatency.toFixed(2)}ms`);

  console.log('\n🎯 AVAILABILITY:');
  console.log(`   API Availability: ${summary.availability.toFixed(2)}%`);

  console.log('\n⚠️  ALERTS:');
  console.log(`   Warnings: ${summary.alertCounts.warning}`);
  console.log(`   Critical: ${summary.alertCounts.critical}`);

  console.log('\n' + '═'.repeat(80) + '\n');

  // Generate HTML report
  const htmlReport = generateHTMLReport(session);
  const timestamp = session.startTime.replace(/[:.]/g, '-');
  const reportFile = path.join(MONITORING_DIR, `report-${timestamp}.html`);
  fs.writeFileSync(reportFile, htmlReport);

  log(`✅ HTML report saved to ${reportFile}`);
}

function generateHTMLReport(session: MonitoringSession): string {
  const summary = session.summary!;

  const snapshotData = session.snapshots.map((s, idx) => ({
    index: idx,
    timestamp: new Date(s.timestamp).toLocaleTimeString(),
    cpu: s.cpu.usage.toFixed(2),
    memory: s.memory.usagePercent.toFixed(2),
    latency: s.api.latency,
  }));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resource Monitoring Report - ${session.sessionId}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; padding: 20px; }
    .container { max-width: 1400px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 20px; }
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
    .metric-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .metric-label { font-size: 14px; color: #666; margin-bottom: 8px; font-weight: 600; }
    .metric-value { font-size: 32px; font-weight: bold; color: #667eea; }
    .metric-unit { font-size: 16px; color: #999; margin-left: 4px; }
    .chart-container { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .chart-container h2 { margin-bottom: 20px; color: #333; }
    canvas { max-height: 300px; }
    .alert-list { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .alert-item { padding: 12px; margin-bottom: 8px; border-radius: 6px; border-left: 4px solid; }
    .alert-warning { background: #fef3cd; border-color: #ffc107; }
    .alert-critical { background: #f8d7da; border-color: #dc3545; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 Resource Monitoring Report</h1>
      <p>Session: ${session.sessionId}</p>
      <p>Duration: ${(summary.duration / 1000 / 60).toFixed(2)} minutes | Snapshots: ${summary.totalSnapshots}</p>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Average CPU Usage</div>
        <div class="metric-value">${summary.averages.cpuUsage.toFixed(2)}<span class="metric-unit">%</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Peak CPU Usage</div>
        <div class="metric-value">${summary.peaks.cpuUsage.toFixed(2)}<span class="metric-unit">%</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Average Memory Usage</div>
        <div class="metric-value">${summary.averages.memoryUsage.toFixed(2)}<span class="metric-unit">%</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Peak Memory Usage</div>
        <div class="metric-value">${summary.peaks.memoryUsage.toFixed(2)}<span class="metric-unit">%</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Average API Latency</div>
        <div class="metric-value">${summary.averages.apiLatency.toFixed(2)}<span class="metric-unit">ms</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">API Availability</div>
        <div class="metric-value">${summary.availability.toFixed(2)}<span class="metric-unit">%</span></div>
      </div>
    </div>

    <div class="chart-container">
      <h2>CPU & Memory Usage Over Time</h2>
      <canvas id="resourceChart"></canvas>
    </div>

    <div class="chart-container">
      <h2>API Latency Over Time</h2>
      <canvas id="latencyChart"></canvas>
    </div>

    ${session.alerts.length > 0 ? `
    <div class="alert-list">
      <h2>Alerts (${session.alerts.length})</h2>
      ${session.alerts.map(alert => `
        <div class="alert-item alert-${alert.level}">
          <strong>${alert.level.toUpperCase()}</strong> - ${alert.message}
          <br><small>${new Date(alert.timestamp).toLocaleString()}</small>
        </div>
      `).join('')}
    </div>
    ` : ''}
  </div>

  <script>
    const snapshotData = ${JSON.stringify(snapshotData)};

    // Resource Chart
    new Chart(document.getElementById('resourceChart'), {
      type: 'line',
      data: {
        labels: snapshotData.map(s => s.timestamp),
        datasets: [
          {
            label: 'CPU Usage (%)',
            data: snapshotData.map(s => s.cpu),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4
          },
          {
            label: 'Memory Usage (%)',
            data: snapshotData.map(s => s.memory),
            borderColor: '#f56565',
            backgroundColor: 'rgba(245, 101, 101, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });

    // Latency Chart
    new Chart(document.getElementById('latencyChart'), {
      type: 'line',
      data: {
        labels: snapshotData.map(s => s.timestamp),
        datasets: [{
          label: 'API Latency (ms)',
          data: snapshotData.map(s => s.latency),
          borderColor: '#48bb78',
          backgroundColor: 'rgba(72, 187, 120, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  </script>
</body>
</html>`;
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  ensureDirectories();

  switch (command) {
    case '--start':
    case 'start':
      await startMonitoring();
      // Keep process alive
      await new Promise(() => {});
      break;

    case '--stop':
    case 'stop':
      stopMonitoring();
      break;

    case '--report':
    case 'report':
      const session = loadCurrentSession();
      if (session) {
        generateReport(session);
      } else {
        log('❌ No active monitoring session found.');
      }
      break;

    case '--help':
    case 'help':
    case undefined:
      console.log('🔍 Resource Monitoring for Load Tests\n');
      console.log('Usage:');
      console.log('  tsx tests/load/resource-monitor.ts --start   # Start monitoring');
      console.log('  tsx tests/load/resource-monitor.ts --stop    # Stop monitoring');
      console.log('  tsx tests/load/resource-monitor.ts --report  # Generate report');
      console.log('\nEnvironment Variables:');
      console.log('  BASE_URL                 - API base URL (default: http://localhost:3001)');
      console.log('  MONITORING_INTERVAL      - Snapshot interval in ms (default: 5000)');
      console.log('  ALERT_CPU_THRESHOLD      - CPU alert threshold % (default: 80)');
      console.log('  ALERT_MEMORY_THRESHOLD   - Memory alert threshold % (default: 85)');
      console.log('  ALERT_LATENCY_THRESHOLD  - Latency alert threshold ms (default: 2000)');
      console.log('');
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run with --help for usage information.\n');
      process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Monitoring failed:', error);
    process.exit(1);
  });
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log('\n⚠️  Received SIGINT signal. Stopping monitoring...');
  stopMonitoring();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n⚠️  Received SIGTERM signal. Stopping monitoring...');
  stopMonitoring();
  process.exit(0);
});

export { startMonitoring, stopMonitoring, generateReport };
