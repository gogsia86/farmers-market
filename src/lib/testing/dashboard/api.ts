/**
 * 📊 Testing Dashboard API
 * Farmers Market Platform - Test Results API
 * Version: 1.0.0
 *
 * REST API for accessing test results, metrics, and analytics
 */

import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join } from "path";
import type { NextRequest } from "next/server";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TestResult {
  id: string;
  timestamp: string;
  duration: number;
  status: "passed" | "failed" | "error" | "skipped";
  testName: string;
  suiteName: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface TestSuite {
  id: string;
  name: string;
  timestamp: string;
  duration: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  passRate: number;
  results: TestResult[];
}

export interface TestRun {
  id: string;
  timestamp: string;
  duration: number;
  type: "mvp" | "visual" | "monitoring" | "unit" | "integration";
  status: "passed" | "failed" | "running";
  suites: TestSuite[];
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    errors: number;
    passRate: number;
  };
  environment?: {
    baseUrl: string;
    branch?: string;
    commit?: string;
    runner?: string;
  };
}

export interface TestMetrics {
  period: "day" | "week" | "month";
  totalRuns: number;
  averagePassRate: number;
  averageDuration: number;
  trendData: Array<{
    date: string;
    runs: number;
    passRate: number;
    duration: number;
  }>;
  flakyTests: Array<{
    testName: string;
    failureRate: number;
    occurrences: number;
  }>;
  slowestTests: Array<{
    testName: string;
    averageDuration: number;
    occurrences: number;
  }>;
}

export interface DashboardStats {
  currentStatus: "healthy" | "degraded" | "critical";
  lastRun: TestRun | null;
  totalRuns: number;
  totalTests: number;
  overallPassRate: number;
  averageDuration: number;
  criticalFailures: number;
  recentRuns: TestRun[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  reportsDir: "./bot-reports",
  mvpReportsDir: "./mvp-validation-reports",
  visualReportsDir: "./visual-tests/reports",
  monitoringReportsDir: "./monitoring-reports",
  maxRecentRuns: 20,
  maxStoredRuns: 1000,
};

// ============================================================================
// DATA ACCESS LAYER
// ============================================================================

export class TestDashboardAPI {
  /**
   * Get all test runs
   */
  static async getAllRuns(limit?: number): Promise<TestRun[]> {
    const runs: TestRun[] = [];

    // Load from all report directories
    const dirs = [
      CONFIG.reportsDir,
      CONFIG.mvpReportsDir,
      CONFIG.visualReportsDir,
      CONFIG.monitoringReportsDir,
    ];

    for (const dir of dirs) {
      if (existsSync(dir)) {
        const files = readdirSync(dir)
          .filter((f) => f.endsWith(".json"))
          .map((f) => join(dir, f));

        for (const file of files) {
          try {
            const content = readFileSync(file, "utf-8");
            const data = JSON.parse(content);
            const run = this.parseTestRun(data, file);
            if (run) runs.push(run);
          } catch (error) {
            console.error(`Failed to parse ${file}:`, error);
          }
        }
      }
    }

    // Sort by timestamp (newest first)
    runs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return limit ? runs.slice(0, limit) : runs;
  }

  /**
   * Get a specific test run by ID
   */
  static async getRunById(id: string): Promise<TestRun | null> {
    const runs = await this.getAllRuns();
    return runs.find((r) => r.id === id) || null;
  }

  /**
   * Get recent test runs
   */
  static async getRecentRuns(limit: number = 10): Promise<TestRun[]> {
    return await this.getAllRuns(limit);
  }

  /**
   * Get test runs by type
   */
  static async getRunsByType(
    type: TestRun["type"],
    limit?: number,
  ): Promise<TestRun[]> {
    const allRuns = await this.getAllRuns();
    const filtered = allRuns.filter((r) => r.type === type);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  /**
   * Get test runs by status
   */
  static async getRunsByStatus(
    status: TestRun["status"],
    limit?: number,
  ): Promise<TestRun[]> {
    const allRuns = await this.getAllRuns();
    const filtered = allRuns.filter((r) => r.status === status);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    const runs = await this.getRecentRuns(CONFIG.maxRecentRuns);
    const allRuns = await this.getAllRuns();

    const lastRun = runs[0] || null;
    const totalTests = allRuns.reduce(
      (sum, r) => sum + r.summary.totalTests,
      0,
    );
    const totalPassed = allRuns.reduce((sum, r) => sum + r.summary.passed, 0);
    const totalDuration = allRuns.reduce((sum, r) => sum + r.duration, 0);
    const criticalFailures = allRuns.filter(
      (r) => r.status === "failed" && r.summary.passRate < 50,
    ).length;

    const overallPassRate =
      totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
    const averageDuration =
      allRuns.length > 0 ? totalDuration / allRuns.length : 0;

    // Determine current status
    let currentStatus: DashboardStats["currentStatus"] = "healthy";
    if (lastRun) {
      if (lastRun.status === "failed" || lastRun.summary.passRate < 80) {
        currentStatus = "critical";
      } else if (lastRun.summary.passRate < 95) {
        currentStatus = "degraded";
      }
    }

    return {
      currentStatus,
      lastRun,
      totalRuns: allRuns.length,
      totalTests,
      overallPassRate,
      averageDuration,
      criticalFailures,
      recentRuns: runs,
    };
  }

  /**
   * Get test metrics for a period
   */
  static async getMetrics(period: TestMetrics["period"]): Promise<TestMetrics> {
    const allRuns = await this.getAllRuns();

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    // Filter runs in period
    const runsInPeriod = allRuns.filter(
      (r) => new Date(r.timestamp) >= startDate,
    );

    // Calculate metrics
    const totalRuns = runsInPeriod.length;
    const totalPassRate = runsInPeriod.reduce(
      (sum, r) => sum + r.summary.passRate,
      0,
    );
    const totalDuration = runsInPeriod.reduce((sum, r) => sum + r.duration, 0);
    const averagePassRate = totalRuns > 0 ? totalPassRate / totalRuns : 0;
    const averageDuration = totalRuns > 0 ? totalDuration / totalRuns : 0;

    // Build trend data
    const trendData = this.buildTrendData(runsInPeriod, period);

    // Find flaky tests
    const flakyTests = this.findFlakyTests(runsInPeriod);

    // Find slowest tests
    const slowestTests = this.findSlowestTests(runsInPeriod);

    return {
      period,
      totalRuns,
      averagePassRate,
      averageDuration,
      trendData,
      flakyTests,
      slowestTests,
    };
  }

  /**
   * Search test runs
   */
  static async searchRuns(query: string): Promise<TestRun[]> {
    const allRuns = await this.getAllRuns();
    const lowerQuery = query.toLowerCase();

    return allRuns.filter((run) => {
      // Search in run type
      if (run.type.toLowerCase().includes(lowerQuery)) return true;

      // Search in suite names
      if (run.suites.some((s) => s.name.toLowerCase().includes(lowerQuery)))
        return true;

      // Search in test names
      if (
        run.suites.some((s) =>
          s.results.some((r) => r.testName.toLowerCase().includes(lowerQuery)),
        )
      )
        return true;

      return false;
    });
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  private static parseTestRun(data: any, filePath: string): TestRun | null {
    try {
      // Determine run type from file path or data
      let type: TestRun["type"] = "mvp";
      if (filePath.includes("visual")) type = "visual";
      else if (filePath.includes("monitoring")) type = "monitoring";
      else if (filePath.includes("unit")) type = "unit";
      else if (filePath.includes("integration")) type = "integration";

      // Parse suites
      const suites: TestSuite[] = [];
      if (data.suites && Array.isArray(data.suites)) {
        for (const suiteData of data.suites) {
          const suite = this.parseTestSuite(suiteData);
          if (suite) suites.push(suite);
        }
      }

      // Calculate summary
      const summary = this.calculateSummary(suites);

      // Determine status
      const status: TestRun["status"] =
        data.status || (summary.failed > 0 ? "failed" : "passed");

      return {
        id: data.id || this.generateIdFromPath(filePath),
        timestamp: data.timestamp || new Date().toISOString(),
        duration: data.duration || data.totalDuration || 0,
        type,
        status,
        suites,
        summary,
        environment: data.environment,
      };
    } catch (error) {
      console.error("Failed to parse test run:", error);
      return null;
    }
  }

  private static parseTestSuite(data: any): TestSuite | null {
    try {
      const results: TestResult[] = [];

      if (data.results && Array.isArray(data.results)) {
        for (const resultData of data.results) {
          results.push({
            id: resultData.id || `test-${Date.now()}-${Math.random()}`,
            timestamp: resultData.timestamp || new Date().toISOString(),
            duration: resultData.duration || 0,
            status: resultData.passed
              ? "passed"
              : resultData.error
                ? "error"
                : "failed",
            testName: resultData.name || "Unknown Test",
            suiteName: data.name || "Unknown Suite",
            error: resultData.error,
            metadata: resultData.details || resultData.metadata,
          });
        }
      }

      const passed = results.filter((r) => r.status === "passed").length;
      const failed = results.filter((r) => r.status === "failed").length;
      const skipped = results.filter((r) => r.status === "skipped").length;
      const errors = results.filter((r) => r.status === "error").length;
      const totalTests = results.length;
      const passRate = totalTests > 0 ? (passed / totalTests) * 100 : 0;

      return {
        id: data.id || `suite-${Date.now()}-${Math.random()}`,
        name: data.name || "Unknown Suite",
        timestamp: data.startTime || new Date().toISOString(),
        duration: data.duration || 0,
        totalTests,
        passed,
        failed,
        skipped,
        errors,
        passRate,
        results,
      };
    } catch (error) {
      console.error("Failed to parse test suite:", error);
      return null;
    }
  }

  private static calculateSummary(suites: TestSuite[]) {
    const totalTests = suites.reduce((sum, s) => sum + s.totalTests, 0);
    const passed = suites.reduce((sum, s) => sum + s.passed, 0);
    const failed = suites.reduce((sum, s) => sum + s.failed, 0);
    const skipped = suites.reduce((sum, s) => sum + s.skipped, 0);
    const errors = suites.reduce((sum, s) => sum + s.errors, 0);
    const passRate = totalTests > 0 ? (passed / totalTests) * 100 : 0;

    return {
      totalTests,
      passed,
      failed,
      skipped,
      errors,
      passRate,
    };
  }

  private static buildTrendData(
    runs: TestRun[],
    period: TestMetrics["period"],
  ): TestMetrics["trendData"] {
    const trendMap = new Map<
      string,
      { runs: number; passRate: number; duration: number }
    >();

    for (const run of runs) {
      const date = new Date(run.timestamp).toISOString().split("T")[0];

      if (!trendMap.has(date)) {
        trendMap.set(date, { runs: 0, passRate: 0, duration: 0 });
      }

      const trend = trendMap.get(date)!;
      trend.runs++;
      trend.passRate += run.summary.passRate;
      trend.duration += run.duration;
    }

    return Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      runs: data.runs,
      passRate: data.passRate / data.runs,
      duration: data.duration / data.runs,
    }));
  }

  private static findFlakyTests(runs: TestRun[]): TestMetrics["flakyTests"] {
    const testStats = new Map<string, { total: number; failures: number }>();

    for (const run of runs) {
      for (const suite of run.suites) {
        for (const result of suite.results) {
          const key = `${suite.name}:${result.testName}`;

          if (!testStats.has(key)) {
            testStats.set(key, { total: 0, failures: 0 });
          }

          const stats = testStats.get(key)!;
          stats.total++;
          if (result.status === "failed") {
            stats.failures++;
          }
        }
      }
    }

    const flakyTests: TestMetrics["flakyTests"] = [];

    for (const [testName, stats] of testStats.entries()) {
      const failureRate = (stats.failures / stats.total) * 100;

      // Consider flaky if failure rate is between 1% and 50%
      if (failureRate > 1 && failureRate < 50 && stats.total >= 5) {
        flakyTests.push({
          testName,
          failureRate,
          occurrences: stats.total,
        });
      }
    }

    // Sort by failure rate descending
    return flakyTests
      .sort((a, b) => b.failureRate - a.failureRate)
      .slice(0, 10);
  }

  private static findSlowestTests(
    runs: TestRun[],
  ): TestMetrics["slowestTests"] {
    const testStats = new Map<
      string,
      { totalDuration: number; count: number }
    >();

    for (const run of runs) {
      for (const suite of run.suites) {
        for (const result of suite.results) {
          const key = `${suite.name}:${result.testName}`;

          if (!testStats.has(key)) {
            testStats.set(key, { totalDuration: 0, count: 0 });
          }

          const stats = testStats.get(key)!;
          stats.totalDuration += result.duration;
          stats.count++;
        }
      }
    }

    const slowestTests: TestMetrics["slowestTests"] = [];

    for (const [testName, stats] of testStats.entries()) {
      const averageDuration = stats.totalDuration / stats.count;

      slowestTests.push({
        testName,
        averageDuration,
        occurrences: stats.count,
      });
    }

    // Sort by average duration descending
    return slowestTests
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 10);
  }

  private static generateIdFromPath(filePath: string): string {
    const filename = filePath.split("/").pop() || "";
    return filename.replace(".json", "");
  }
}

// ============================================================================
// API ROUTE HANDLERS
// ============================================================================

/**
 * GET /api/testing/dashboard/stats
 */
export async function getDashboardStats() {
  try {
    const stats = await TestDashboardAPI.getDashboardStats();
    return { success: true, data: stats };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * GET /api/testing/dashboard/runs
 */
export async function getTestRuns(limit?: number) {
  try {
    const runs = await TestDashboardAPI.getRecentRuns(limit);
    return { success: true, data: runs };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * GET /api/testing/dashboard/runs/:id
 */
export async function getTestRunById(id: string) {
  try {
    const run = await TestDashboardAPI.getRunById(id);
    if (!run) {
      return { success: false, error: "Test run not found" };
    }
    return { success: true, data: run };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * GET /api/testing/dashboard/metrics
 */
export async function getTestMetrics(period: TestMetrics["period"] = "week") {
  try {
    const metrics = await TestDashboardAPI.getMetrics(period);
    return { success: true, data: metrics };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * GET /api/testing/dashboard/search
 */
export async function searchTestRuns(query: string) {
  try {
    const runs = await TestDashboardAPI.searchRuns(query);
    return { success: true, data: runs };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
