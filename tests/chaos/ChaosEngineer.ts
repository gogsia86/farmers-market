/**
 * 🌪️ Chaos Engineer - Divine Chaos Engineering Framework
 *
 * Comprehensive chaos engineering system for testing system resilience
 * Implements Netflix Chaos Monkey patterns with agricultural consciousness
 *
 * @module ChaosEngineer
 * @version 1.0.0
 * @divine-pattern RESILIENCE_CHAOS_MASTERY
 */

import { EventEmitter } from 'events';

// ============================================================================
// Type Definitions
// ============================================================================

export type ChaosType =
  | 'network-latency'
  | 'network-partition'
  | 'network-packet-loss'
  | 'server-crash'
  | 'cpu-spike'
  | 'memory-leak'
  | 'disk-full'
  | 'database-failure'
  | 'cache-failure'
  | 'third-party-timeout'
  | 'random-errors'
  | 'slow-dependencies'
  | 'cascading-failures'
  | 'traffic-spike'
  | 'region-outage';

export type ChaosImpact = 'low' | 'medium' | 'high' | 'critical';

export type ChaosTarget =
  | 'api'
  | 'database'
  | 'cache'
  | 'network'
  | 'compute'
  | 'storage'
  | 'third-party'
  | 'all';

export type RecoveryStrategy =
  | 'immediate'
  | 'gradual'
  | 'exponential-backoff'
  | 'circuit-breaker'
  | 'bulkhead'
  | 'timeout'
  | 'retry'
  | 'fallback';

export interface ChaosExperiment {
  id: string;
  name: string;
  description: string;
  type: ChaosType;
  target: ChaosTarget;
  impact: ChaosImpact;
  duration: number; // milliseconds
  probability?: number; // 0-1, chance of triggering
  config: ChaosConfig;
  recoveryStrategy?: RecoveryStrategy;
  steadyStateHypothesis?: SteadyStateHypothesis;
  rollbackCriteria?: RollbackCriteria;
}

export interface ChaosConfig {
  // Network chaos
  latencyMs?: number;
  packetLossPercent?: number;
  bandwidthLimitKbps?: number;
  jitterMs?: number;

  // Server chaos
  crashProbability?: number;
  restartDelayMs?: number;

  // Resource chaos
  cpuLoadPercent?: number;
  memoryLeakMbPerSec?: number;
  diskFillMbPerSec?: number;

  // Database chaos
  queryTimeoutMs?: number;
  connectionPoolExhaustion?: boolean;
  deadlockSimulation?: boolean;

  // Error injection
  errorRate?: number; // 0-1
  errorTypes?: string[];
  timeoutMs?: number;

  // Traffic chaos
  trafficMultiplier?: number;
  requestsPerSecond?: number;
}

export interface SteadyStateHypothesis {
  description: string;
  probes: Array<{
    name: string;
    type: 'metric' | 'health-check' | 'custom';
    tolerance: {
      min?: number;
      max?: number;
      exact?: any;
    };
    checkInterval?: number;
  }>;
}

export interface RollbackCriteria {
  maxErrorRate?: number; // 0-1
  maxResponseTime?: number; // milliseconds
  minSuccessRate?: number; // 0-1
  maxCrashCount?: number;
  customChecks?: Array<() => Promise<boolean>>;
}

export interface ChaosExperimentResult {
  experimentId: string;
  experimentName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'completed' | 'rollback' | 'failed' | 'timeout';
  steadyStateMaintained: boolean;
  metrics: ChaosMetrics;
  observations: ChaosObservation[];
  recovery: RecoveryMetrics;
  recommendations: string[];
}

export interface ChaosMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
  availability: number;
  crashCount: number;
  recoveryTime?: number;
}

export interface ChaosObservation {
  timestamp: Date;
  type: 'metric' | 'event' | 'error' | 'recovery';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  data?: any;
}

export interface RecoveryMetrics {
  timeToDetect: number;
  timeToRecover: number;
  totalRecoveryTime: number;
  recoveryAttempts: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  automaticRecovery: boolean;
}

export interface ChaosSchedule {
  experimentId: string;
  schedule: 'once' | 'hourly' | 'daily' | 'weekly' | 'random';
  startTime?: Date;
  endTime?: Date;
  daysOfWeek?: number[];
  hoursOfDay?: number[];
  randomIntervalMin?: number;
  randomIntervalMax?: number;
}

// ============================================================================
// Chaos Engineer
// ============================================================================

export class ChaosEngineer extends EventEmitter {
  private experiments: Map<string, ChaosExperiment> = new Map();
  private activeExperiments: Map<string, NodeJS.Timeout> = new Map();
  private experimentResults: Map<string, ChaosExperimentResult> = new Map();
  private observationBuffer: ChaosObservation[] = [];
  private schedules: Map<string, ChaosSchedule> = new Map();
  private safetyEnabled = true;
  private blastRadius = 1.0; // 0-1, percentage of system to affect

  constructor() {
    super();
  }

  /**
   * Register a chaos experiment
   */
  registerExperiment(experiment: ChaosExperiment): void {
    this.experiments.set(experiment.id, experiment);
    this.emit('experiment:registered', experiment);
  }

  /**
   * Run a chaos experiment
   */
  async runExperiment(experimentId: string): Promise<ChaosExperimentResult> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    if (this.activeExperiments.has(experimentId)) {
      throw new Error(`Experiment ${experimentId} is already running`);
    }

    this.emit('experiment:starting', experiment);

    const startTime = new Date();
    const result: ChaosExperimentResult = {
      experimentId: experiment.id,
      experimentName: experiment.name,
      startTime,
      endTime: new Date(),
      duration: 0,
      status: 'completed',
      steadyStateMaintained: true,
      metrics: this.initializeMetrics(),
      observations: [],
      recovery: this.initializeRecoveryMetrics(),
      recommendations: [],
    };

    try {
      // Check steady state before experiment
      if (experiment.steadyStateHypothesis) {
        const steadyState = await this.checkSteadyState(experiment.steadyStateHypothesis);
        if (!steadyState) {
          throw new Error('System not in steady state before experiment');
        }
      }

      // Apply chaos
      await this.applyChaos(experiment, result);

      // Monitor during chaos
      await this.monitorExperiment(experiment, result);

      // Check rollback criteria
      if (experiment.rollbackCriteria) {
        const shouldRollback = await this.checkRollbackCriteria(
          experiment.rollbackCriteria,
          result
        );
        if (shouldRollback) {
          result.status = 'rollback';
          await this.rollbackChaos(experiment);
          this.observe(result, 'error', 'Rollback triggered due to criteria violation');
        }
      }

      // Verify steady state after experiment
      if (experiment.steadyStateHypothesis) {
        const steadyState = await this.checkSteadyState(experiment.steadyStateHypothesis);
        result.steadyStateMaintained = steadyState;
        if (!steadyState) {
          this.observe(result, 'critical', 'Steady state NOT maintained after chaos');
        }
      }

      // Cleanup chaos
      await this.cleanupChaos(experiment);

      // Generate recommendations
      result.recommendations = this.generateRecommendations(result);
    } catch (error) {
      result.status = 'failed';
      this.observe(result, 'critical', `Experiment failed: ${error.message}`, error);
      await this.emergencyRollback(experiment);
    } finally {
      const endTime = new Date();
      result.endTime = endTime;
      result.duration = endTime.getTime() - startTime.getTime();
      this.experimentResults.set(experimentId, result);
      this.activeExperiments.delete(experimentId);
      this.emit('experiment:completed', result);
    }

    return result;
  }

  /**
   * Apply chaos to the system
   */
  private async applyChaos(
    experiment: ChaosExperiment,
    result: ChaosExperimentResult
  ): Promise<void> {
    this.observe(result, 'info', `Applying ${experiment.type} chaos`);

    // Check probability
    if (experiment.probability !== undefined) {
      if (Math.random() > experiment.probability) {
        this.observe(result, 'info', 'Chaos not triggered due to probability');
        return;
      }
    }

    // Apply type-specific chaos
    switch (experiment.type) {
      case 'network-latency':
        await this.applyNetworkLatency(experiment.config, result);
        break;
      case 'network-partition':
        await this.applyNetworkPartition(experiment.config, result);
        break;
      case 'network-packet-loss':
        await this.applyPacketLoss(experiment.config, result);
        break;
      case 'server-crash':
        await this.applyServerCrash(experiment.config, result);
        break;
      case 'cpu-spike':
        await this.applyCPUSpike(experiment.config, result);
        break;
      case 'memory-leak':
        await this.applyMemoryLeak(experiment.config, result);
        break;
      case 'disk-full':
        await this.applyDiskFull(experiment.config, result);
        break;
      case 'database-failure':
        await this.applyDatabaseFailure(experiment.config, result);
        break;
      case 'cache-failure':
        await this.applyCacheFailure(experiment.config, result);
        break;
      case 'third-party-timeout':
        await this.applyThirdPartyTimeout(experiment.config, result);
        break;
      case 'random-errors':
        await this.applyRandomErrors(experiment.config, result);
        break;
      case 'slow-dependencies':
        await this.applySlowDependencies(experiment.config, result);
        break;
      case 'cascading-failures':
        await this.applyCascadingFailures(experiment.config, result);
        break;
      case 'traffic-spike':
        await this.applyTrafficSpike(experiment.config, result);
        break;
      case 'region-outage':
        await this.applyRegionOutage(experiment.config, result);
        break;
      default:
        throw new Error(`Unknown chaos type: ${experiment.type}`);
    }

    // Set timeout for automatic cleanup
    const timeout = setTimeout(async () => {
      await this.cleanupChaos(experiment);
    }, experiment.duration);

    this.activeExperiments.set(experiment.id, timeout);
  }

  /**
   * Apply network latency chaos
   */
  private async applyNetworkLatency(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    const latency = config.latencyMs || 1000;
    this.observe(result, 'info', `Injecting ${latency}ms network latency`);

    // Simulate by adding delay to all network requests
    // In real implementation, this would use network manipulation tools
    global.CHAOS_NETWORK_LATENCY = latency;
  }

  /**
   * Apply network partition chaos
   */
  private async applyNetworkPartition(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    this.observe(result, 'warning', 'Simulating network partition');
    global.CHAOS_NETWORK_PARTITION = true;
  }

  /**
   * Apply packet loss chaos
   */
  private async applyPacketLoss(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    const lossPercent = config.packetLossPercent || 10;
    this.observe(result, 'info', `Injecting ${lossPercent}% packet loss`);
    global.CHAOS_PACKET_LOSS = lossPercent;
  }

  /**
   * Apply server crash chaos
   */
  private async applyServerCrash(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    const crashProb = config.crashProbability || 0.1;
    this.observe(result, 'error', `Server crash probability set to ${crashProb * 100}%`);
    global.CHAOS_SERVER_CRASH_PROBABILITY = crashProb;
    result.metrics.crashCount++;
  }

  /**
   * Apply CPU spike chaos
   */
  private async applyCPUSpike(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    const cpuLoad = config.cpuLoadPercent || 90;
    this.observe(result, 'warning', `Inducing ${cpuLoad}% CPU load`);

    // Simulate CPU load with busy loop
    global.CHAOS_CPU_LOAD = cpuLoad;
    if (cpuLoad > 80) {
      this.startCPUStressTest(cpuLoad);
    }
  }

  /**
   * Apply memory leak chaos
   */
  private async applyMemoryLeak(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    const leakRate = config.memoryLeakMbPerSec || 10;
    this.observe(result, 'warning', `Memory leak: ${leakRate}MB/sec`);
    global.CHAOS_MEMORY_LEAK_RATE = leakRate;
    this.startMemoryLeak(leakRate);
  }

  /**
   * Apply disk full chaos
   */
  private async applyDiskFull(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    const fillRate = config.diskFillMbPerSec || 100;
    this.observe(result, 'error', `Disk filling at ${fillRate}MB/sec`);
    global.CHAOS_DISK_FULL = true;
  }

  /**
   * Apply database failure chaos
   */
  private async applyDatabaseFailure(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    this.observe(result, 'critical', 'Database failure simulated');

    if (config.connectionPoolExhaustion) {
      global.CHAOS_DB_POOL_EXHAUSTED = true;
    }
    if (config.deadlockSimulation) {
      global.CHAOS_DB_DEADLOCK = true;
    }
    if (config.queryTimeoutMs) {
      global.CHAOS_DB_TIMEOUT = config.queryTimeoutMs;
    }
  }

  /**
   * Apply cache failure chaos
   */
  private async applyCacheFailure(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    this.observe(result, 'warning', 'Cache failure simulated');
    global.CHAOS_CACHE_FAILURE = true;
  }

  /**
   * Apply third-party timeout chaos
   */
  private async applyThirdPartyTimeout(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    const timeout = config.timeoutMs || 30000;
    this.observe(result, 'warning', `Third-party services timing out after ${timeout}ms`);
    global.CHAOS_THIRD_PARTY_TIMEOUT = timeout;
  }

  /**
   * Apply random errors chaos
   */
  private async applyRandomErrors(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    const errorRate = config.errorRate || 0.1;
    this.observe(result, 'warning', `Random errors at ${errorRate * 100}% rate`);
    global.CHAOS_ERROR_RATE = errorRate;
  }

  /**
   * Apply slow dependencies chaos
   */
  private async applySlowDependencies(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    const latency = config.latencyMs || 5000;
    this.observe(result, 'warning', `Dependencies slowed to ${latency}ms`);
    global.CHAOS_SLOW_DEPENDENCIES = latency;
  }

  /**
   * Apply cascading failures chaos
   */
  private async applyCascadingFailures(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    this.observe(result, 'critical', 'Cascading failures initiated');
    global.CHAOS_CASCADING_FAILURES = true;

    // Simulate chain reaction
    setTimeout(() => global.CHAOS_DB_FAILURE = true, 1000);
    setTimeout(() => global.CHAOS_CACHE_FAILURE = true, 2000);
    setTimeout(() => global.CHAOS_API_FAILURE = true, 3000);
  }

  /**
   * Apply traffic spike chaos
   */
  private async applyTrafficSpike(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    const multiplier = config.trafficMultiplier || 10;
    this.observe(result, 'warning', `Traffic spike: ${multiplier}x normal load`);
    global.CHAOS_TRAFFIC_MULTIPLIER = multiplier;
  }

  /**
   * Apply region outage chaos
   */
  private async applyRegionOutage(
    config: ChaosConfig,
    result: ChaosExperimentResult
  ): Promise<void> {
    this.observe(result, 'critical', 'Region outage simulated');
    global.CHAOS_REGION_OUTAGE = true;
  }

  /**
   * Monitor experiment progress
   */
  private async monitorExperiment(
    experiment: ChaosExperiment,
    result: ChaosExperimentResult
  ): Promise<void> {
    const monitoringInterval = 1000; // 1 second
    const monitoringDuration = experiment.duration;
    const iterations = Math.floor(monitoringDuration / monitoringInterval);

    for (let i = 0; i < iterations; i++) {
      await this.sleep(monitoringInterval);

      // Collect metrics
      const metrics = await this.collectMetrics();
      this.updateResultMetrics(result, metrics);

      // Check steady state
      if (experiment.steadyStateHypothesis) {
        const steadyState = await this.checkSteadyState(experiment.steadyStateHypothesis);
        if (!steadyState) {
          this.observe(result, 'error', 'Steady state hypothesis violated');
          result.steadyStateMaintained = false;
        }
      }

      // Emergency rollback if critical
      if (this.safetyEnabled && this.isCriticalFailure(result)) {
        this.observe(result, 'critical', 'Critical failure detected, emergency rollback');
        result.status = 'rollback';
        await this.emergencyRollback(experiment);
        break;
      }
    }
  }

  /**
   * Check if should rollback
   */
  private async checkRollbackCriteria(
    criteria: RollbackCriteria,
    result: ChaosExperimentResult
  ): Promise<boolean> {
    if (criteria.maxErrorRate && result.metrics.errorRate > criteria.maxErrorRate) {
      return true;
    }

    if (criteria.maxResponseTime && result.metrics.avgResponseTime > criteria.maxResponseTime) {
      return true;
    }

    if (criteria.minSuccessRate) {
      const successRate = result.metrics.successfulRequests / result.metrics.totalRequests;
      if (successRate < criteria.minSuccessRate) {
        return true;
      }
    }

    if (criteria.maxCrashCount && result.metrics.crashCount > criteria.maxCrashCount) {
      return true;
    }

    if (criteria.customChecks) {
      for (const check of criteria.customChecks) {
        if (await check()) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check steady state hypothesis
   */
  private async checkSteadyState(hypothesis: SteadyStateHypothesis): Promise<boolean> {
    for (const probe of hypothesis.probes) {
      const value = await this.executeProbe(probe);

      if (probe.tolerance.min !== undefined && value < probe.tolerance.min) {
        return false;
      }
      if (probe.tolerance.max !== undefined && value > probe.tolerance.max) {
        return false;
      }
      if (probe.tolerance.exact !== undefined && value !== probe.tolerance.exact) {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute a probe
   */
  private async executeProbe(probe: any): Promise<number> {
    // Mock probe execution
    // In real implementation, this would check actual metrics
    return Math.random() * 100;
  }

  /**
   * Cleanup chaos
   */
  private async cleanupChaos(experiment: ChaosExperiment): Promise<void> {
    // Clear all chaos flags
    delete global.CHAOS_NETWORK_LATENCY;
    delete global.CHAOS_NETWORK_PARTITION;
    delete global.CHAOS_PACKET_LOSS;
    delete global.CHAOS_SERVER_CRASH_PROBABILITY;
    delete global.CHAOS_CPU_LOAD;
    delete global.CHAOS_MEMORY_LEAK_RATE;
    delete global.CHAOS_DISK_FULL;
    delete global.CHAOS_DB_POOL_EXHAUSTED;
    delete global.CHAOS_DB_DEADLOCK;
    delete global.CHAOS_DB_TIMEOUT;
    delete global.CHAOS_CACHE_FAILURE;
    delete global.CHAOS_THIRD_PARTY_TIMEOUT;
    delete global.CHAOS_ERROR_RATE;
    delete global.CHAOS_SLOW_DEPENDENCIES;
    delete global.CHAOS_CASCADING_FAILURES;
    delete global.CHAOS_TRAFFIC_MULTIPLIER;
    delete global.CHAOS_REGION_OUTAGE;

    // Stop CPU/memory stress
    this.stopCPUStressTest();
    this.stopMemoryLeak();

    // Clear timeout
    const timeout = this.activeExperiments.get(experiment.id);
    if (timeout) {
      clearTimeout(timeout);
    }
  }

  /**
   * Rollback chaos
   */
  private async rollbackChaos(experiment: ChaosExperiment): Promise<void> {
    await this.cleanupChaos(experiment);
  }

  /**
   * Emergency rollback
   */
  private async emergencyRollback(experiment: ChaosExperiment): Promise<void> {
    await this.cleanupChaos(experiment);
    this.emit('emergency:rollback', experiment);
  }

  /**
   * Check if critical failure
   */
  private isCriticalFailure(result: ChaosExperimentResult): boolean {
    return (
      result.metrics.errorRate > 0.5 ||
      result.metrics.availability < 0.5 ||
      result.metrics.crashCount > 5
    );
  }

  /**
   * Collect metrics
   */
  private async collectMetrics(): Promise<Partial<ChaosMetrics>> {
    // Mock metrics collection
    return {
      totalRequests: Math.floor(Math.random() * 1000),
      successfulRequests: Math.floor(Math.random() * 900),
      failedRequests: Math.floor(Math.random() * 100),
      avgResponseTime: Math.random() * 1000,
      availability: 0.9 + Math.random() * 0.1,
    };
  }

  /**
   * Update result metrics
   */
  private updateResultMetrics(
    result: ChaosExperimentResult,
    metrics: Partial<ChaosMetrics>
  ): void {
    result.metrics = { ...result.metrics, ...metrics };

    if (result.metrics.totalRequests > 0) {
      result.metrics.errorRate =
        result.metrics.failedRequests / result.metrics.totalRequests;
    }
  }

  /**
   * Add observation
   */
  private observe(
    result: ChaosExperimentResult,
    severity: ChaosObservation['severity'],
    message: string,
    data?: any
  ): void {
    const observation: ChaosObservation = {
      timestamp: new Date(),
      type: severity === 'error' || severity === 'critical' ? 'error' : 'event',
      severity,
      message,
      data,
    };

    result.observations.push(observation);
    this.emit('observation', observation);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(result: ChaosExperimentResult): string[] {
    const recommendations: string[] = [];

    if (result.metrics.errorRate > 0.1) {
      recommendations.push('Implement better error handling and retry logic');
    }

    if (result.metrics.avgResponseTime > 3000) {
      recommendations.push('Optimize response times with caching and async processing');
    }

    if (!result.steadyStateMaintained) {
      recommendations.push('Improve system resilience and recovery mechanisms');
    }

    if (result.metrics.crashCount > 0) {
      recommendations.push('Add health checks and automatic restart mechanisms');
    }

    if (result.recovery.timeToDetect > 60000) {
      recommendations.push('Improve monitoring and alerting for faster issue detection');
    }

    return recommendations;
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): ChaosMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      errorRate: 0,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      throughput: 0,
      availability: 1.0,
      crashCount: 0,
    };
  }

  /**
   * Initialize recovery metrics
   */
  private initializeRecoveryMetrics(): RecoveryMetrics {
    return {
      timeToDetect: 0,
      timeToRecover: 0,
      totalRecoveryTime: 0,
      recoveryAttempts: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      automaticRecovery: false,
    };
  }

  /**
   * Start CPU stress test
   */
  private startCPUStressTest(load: number): void {
    // Simulate CPU load
    const stressInterval = setInterval(() => {
      const endTime = Date.now() + (load / 100) * 100;
      while (Date.now() < endTime) {
        Math.random() * Math.random();
      }
    }, 100);

    (global as any).CHAOS_CPU_STRESS_INTERVAL = stressInterval;
  }

  /**
   * Stop CPU stress test
   */
  private stopCPUStressTest(): void {
    const interval = (global as any).CHAOS_CPU_STRESS_INTERVAL;
    if (interval) {
      clearInterval(interval);
      delete (global as any).CHAOS_CPU_STRESS_INTERVAL;
    }
  }

  /**
   * Start memory leak
   */
  private startMemoryLeak(rateMB: number): void {
    const leakData: any[] = [];
    const leakInterval = setInterval(() => {
      // Allocate memory
      const size = rateMB * 1024 * 1024;
      const leak = new Array(size).fill('LEAK');
      leakData.push(leak);
    }, 1000);

    (global as any).CHAOS_MEMORY_LEAK_INTERVAL = leakInterval;
    (global as any).CHAOS_MEMORY_LEAK_DATA = leakData;
  }

  /**
   * Stop memory leak
   */
  private stopMemoryLeak(): void {
    const interval = (global as any).CHAOS_MEMORY_LEAK_INTERVAL;
    if (interval) {
      clearInterval(interval);
      delete (global as any).CHAOS_MEMORY_LEAK_INTERVAL;
      delete (global as any).CHAOS_MEMORY_LEAK_DATA;
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get experiment result
   */
  getResult(experimentId: string): ChaosExperimentResult | undefined {
    return this.experimentResults.get(experimentId);
  }

  /**
   * Get all results
   */
  getAllResults(): ChaosExperimentResult[] {
    return Array.from(this.experimentResults.values());
  }

  /**
   * Enable/disable safety mode
   */
  setSafety(enabled: boolean): void {
    this.safetyEnabled = enabled;
    this.emit('safety:changed', enabled);
  }

  /**
   * Set blast radius
   */
  setBlastRadius(radius: number): void {
    if (radius < 0 || radius > 1) {
      throw new Error('Blast radius must be between 0 and 1');
    }
    this.blastRadius = radius;
    this.emit('blast-radius:changed', radius);
  }

  /**
   * Stop all active experiments
   */
  stopAllExperiments(): void {
    for (const [id, timeout] of this.activeExperiments) {
      clearTimeout(timeout);
      const experiment = this.experiments.get(id);
      if (experiment) {
        this.cleanupChaos(experiment);
      }
    }
    this.activeExperiments.clear();
    this.emit('experiments:stopped');
  }
}

// ============================================================================
// Exports
// ============================================================================

export default ChaosEngineer;
