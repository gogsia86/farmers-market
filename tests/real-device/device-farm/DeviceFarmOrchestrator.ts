/**
 * 📱 Device Farm Orchestrator - Divine Multi-Device Testing
 *
 * Orchestrates parallel testing across multiple real devices
 * Manages device pools, test distribution, and result aggregation
 *
 * @module DeviceFarmOrchestrator
 * @version 1.0.0
 * @divine-pattern AGRICULTURAL_DEVICE_MASTERY
 */

import { EventEmitter } from 'events';
import type { RealDeviceConfig, TestSession, RealDeviceTestResult } from '../RealDeviceTestManager';

// ============================================================================
// Type Definitions
// ============================================================================

export interface DevicePool {
  id: string;
  name: string;
  devices: DeviceInfo[];
  maxConcurrent: number;
  currentlyInUse: number;
  priority: number;
  tags: string[];
  location?: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  model: string;
  os: string;
  osVersion: string;
  manufacturer: string;
  screenResolution: string;
  status: 'available' | 'in-use' | 'maintenance' | 'offline';
  lastUsed?: Date;
  totalTestsRun: number;
  successRate: number;
  avgTestDuration: number;
  capabilities: DeviceCapabilities;
  location?: string;
  cost?: number; // Cost per hour
}

export interface DeviceCapabilities {
  touchScreen: boolean;
  camera: boolean;
  gps: boolean;
  accelerometer: boolean;
  gyroscope: boolean;
  nfc: boolean;
  bluetooth: boolean;
  wifi: boolean;
  cellular: boolean;
  fingerprint: boolean;
  faceId: boolean;
  battery: boolean;
}

export interface TestDistributionStrategy {
  type: 'round-robin' | 'least-loaded' | 'priority' | 'random' | 'capability-based';
  maxRetries?: number;
  timeout?: number;
  parallelism?: number;
  devicePreferences?: DevicePreference[];
}

export interface DevicePreference {
  os?: string;
  osVersion?: string;
  manufacturer?: string;
  model?: string;
  capabilities?: Partial<DeviceCapabilities>;
  location?: string;
  maxCost?: number;
}

export interface TestJob {
  id: string;
  name: string;
  description?: string;
  testSuite: string;
  deviceRequirements: DevicePreference[];
  priority: number;
  maxDuration?: number;
  retryCount: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  assignedDevices: string[];
  results: TestJobResult[];
  metadata?: Record<string, any>;
}

export interface TestJobResult {
  deviceId: string;
  deviceName: string;
  status: 'passed' | 'failed' | 'error' | 'timeout';
  duration: number;
  startTime: Date;
  endTime: Date;
  errorMessage?: string;
  screenshots: string[];
  logs: string[];
  videoUrl?: string;
  reportUrl?: string;
}

export interface OrchestratorMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalDevices: number;
  availableDevices: number;
  inUseDevices: number;
  offlineDevices: number;
  avgJobDuration: number;
  avgWaitTime: number;
  deviceUtilization: number;
  successRate: number;
  costPerHour: number;
  totalTestsRun: number;
}

export interface DeviceAllocation {
  jobId: string;
  deviceId: string;
  allocatedAt: Date;
  expectedDuration: number;
  actualDuration?: number;
}

// ============================================================================
// Device Farm Orchestrator
// ============================================================================

export class DeviceFarmOrchestrator extends EventEmitter {
  private devicePools: Map<string, DevicePool> = new Map();
  private devices: Map<string, DeviceInfo> = new Map();
  private jobs: Map<string, TestJob> = new Map();
  private activeAllocations: Map<string, DeviceAllocation> = new Map();
  private jobQueue: TestJob[] = [];
  private distributionStrategy: TestDistributionStrategy = { type: 'round-robin' };
  private metrics: OrchestratorMetrics;
  private jobCounter = 0;

  constructor() {
    super();
    this.metrics = this.initializeMetrics();
  }

  // ============================================================================
  // Device Pool Management
  // ============================================================================

  /**
   * Register a device pool
   */
  registerDevicePool(pool: DevicePool): void {
    this.devicePools.set(pool.id, pool);

    // Add devices to global device map
    pool.devices.forEach(device => {
      this.devices.set(device.id, device);
      this.metrics.totalDevices++;
      if (device.status === 'available') {
        this.metrics.availableDevices++;
      } else if (device.status === 'offline') {
        this.metrics.offlineDevices++;
      }
    });

    this.emit('pool:registered', pool);
  }

  /**
   * Add device to pool
   */
  addDevice(poolId: string, device: DeviceInfo): void {
    const pool = this.devicePools.get(poolId);
    if (!pool) {
      throw new Error(`Device pool ${poolId} not found`);
    }

    pool.devices.push(device);
    this.devices.set(device.id, device);
    this.metrics.totalDevices++;

    if (device.status === 'available') {
      this.metrics.availableDevices++;
    }

    this.emit('device:added', device);
  }

  /**
   * Remove device from pool
   */
  removeDevice(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    // Remove from all pools
    for (const pool of this.devicePools.values()) {
      pool.devices = pool.devices.filter(d => d.id !== deviceId);
    }

    this.devices.delete(deviceId);
    this.metrics.totalDevices--;

    if (device.status === 'available') {
      this.metrics.availableDevices--;
    } else if (device.status === 'offline') {
      this.metrics.offlineDevices--;
    }

    this.emit('device:removed', device);
  }

  /**
   * Update device status
   */
  updateDeviceStatus(deviceId: string, status: DeviceInfo['status']): void {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    const oldStatus = device.status;
    device.status = status;

    // Update metrics
    if (oldStatus === 'available' && status !== 'available') {
      this.metrics.availableDevices--;
    } else if (oldStatus !== 'available' && status === 'available') {
      this.metrics.availableDevices++;
    }

    if (oldStatus === 'in-use' && status !== 'in-use') {
      this.metrics.inUseDevices--;
    } else if (oldStatus !== 'in-use' && status === 'in-use') {
      this.metrics.inUseDevices++;
    }

    if (oldStatus === 'offline' && status !== 'offline') {
      this.metrics.offlineDevices--;
    } else if (oldStatus !== 'offline' && status === 'offline') {
      this.metrics.offlineDevices++;
    }

    this.emit('device:status-changed', { device, oldStatus, newStatus: status });
  }

  /**
   * Get available devices matching requirements
   */
  getAvailableDevices(requirements?: DevicePreference[]): DeviceInfo[] {
    let availableDevices = Array.from(this.devices.values()).filter(
      d => d.status === 'available'
    );

    if (!requirements || requirements.length === 0) {
      return availableDevices;
    }

    // Filter by requirements
    return availableDevices.filter(device => {
      return requirements.some(req => this.deviceMatchesRequirement(device, req));
    });
  }

  /**
   * Check if device matches requirement
   */
  private deviceMatchesRequirement(device: DeviceInfo, requirement: DevicePreference): boolean {
    if (requirement.os && device.os !== requirement.os) {
      return false;
    }

    if (requirement.osVersion && device.osVersion !== requirement.osVersion) {
      return false;
    }

    if (requirement.manufacturer && device.manufacturer !== requirement.manufacturer) {
      return false;
    }

    if (requirement.model && device.model !== requirement.model) {
      return false;
    }

    if (requirement.location && device.location !== requirement.location) {
      return false;
    }

    if (requirement.maxCost && device.cost && device.cost > requirement.maxCost) {
      return false;
    }

    if (requirement.capabilities) {
      for (const [cap, required] of Object.entries(requirement.capabilities)) {
        if (required && !device.capabilities[cap as keyof DeviceCapabilities]) {
          return false;
        }
      }
    }

    return true;
  }

  // ============================================================================
  // Job Management
  // ============================================================================

  /**
   * Submit a test job
   */
  async submitJob(job: Omit<TestJob, 'id' | 'status' | 'createdAt' | 'results' | 'assignedDevices'>): Promise<string> {
    const testJob: TestJob = {
      ...job,
      id: this.generateJobId(),
      status: 'pending',
      createdAt: new Date(),
      results: [],
      assignedDevices: [],
    };

    this.jobs.set(testJob.id, testJob);
    this.jobQueue.push(testJob);
    this.metrics.totalJobs++;

    this.emit('job:submitted', testJob);

    // Try to execute immediately
    await this.processJobQueue();

    return testJob.id;
  }

  /**
   * Process job queue
   */
  private async processJobQueue(): Promise<void> {
    // Sort queue by priority
    this.jobQueue.sort((a, b) => b.priority - a.priority);

    for (const job of [...this.jobQueue]) {
      if (job.status !== 'pending') {
        continue;
      }

      const availableDevices = this.getAvailableDevices(job.deviceRequirements);

      if (availableDevices.length > 0) {
        // Allocate devices and start job
        await this.executeJob(job, availableDevices);

        // Remove from queue
        this.jobQueue = this.jobQueue.filter(j => j.id !== job.id);
      }
    }
  }

  /**
   * Execute a test job
   */
  private async executeJob(job: TestJob, availableDevices: DeviceInfo[]): Promise<void> {
    job.status = 'running';
    job.startedAt = new Date();

    // Select devices based on distribution strategy
    const selectedDevices = this.selectDevices(availableDevices, job);

    if (selectedDevices.length === 0) {
      job.status = 'failed';
      job.completedAt = new Date();
      this.emit('job:failed', { job, reason: 'No suitable devices available' });
      return;
    }

    this.emit('job:started', { job, devices: selectedDevices });

    // Allocate devices
    selectedDevices.forEach(device => {
      job.assignedDevices.push(device.id);
      this.allocateDevice(job.id, device.id, job.maxDuration || 3600000);
      this.updateDeviceStatus(device.id, 'in-use');
    });

    // Execute tests in parallel
    const testPromises = selectedDevices.map(device =>
      this.executeTestOnDevice(job, device)
    );

    try {
      const results = await Promise.allSettled(testPromises);

      // Process results
      results.forEach((result, index) => {
        const device = selectedDevices[index];

        if (result.status === 'fulfilled') {
          job.results.push(result.value);
          device.totalTestsRun++;
          device.lastUsed = new Date();

          if (result.value.status === 'passed') {
            device.successRate = (device.successRate * (device.totalTestsRun - 1) + 100) / device.totalTestsRun;
          }
        } else {
          job.results.push({
            deviceId: device.id,
            deviceName: device.name,
            status: 'error',
            duration: 0,
            startTime: new Date(),
            endTime: new Date(),
            errorMessage: result.reason?.message || 'Unknown error',
            screenshots: [],
            logs: [],
          });
        }

        // Release device
        this.releaseDevice(device.id);
        this.updateDeviceStatus(device.id, 'available');
      });

      // Determine job status
      const allPassed = job.results.every(r => r.status === 'passed');
      job.status = allPassed ? 'completed' : 'failed';
      job.completedAt = new Date();

      this.metrics.completedJobs++;
      if (!allPassed) {
        this.metrics.failedJobs++;
      }

      // Update metrics
      const jobDuration = job.completedAt.getTime() - job.startedAt!.getTime();
      this.metrics.avgJobDuration = (this.metrics.avgJobDuration * (this.metrics.completedJobs - 1) + jobDuration) / this.metrics.completedJobs;

      this.emit('job:completed', job);
    } catch (error) {
      job.status = 'failed';
      job.completedAt = new Date();
      this.metrics.failedJobs++;

      // Release all allocated devices
      selectedDevices.forEach(device => {
        this.releaseDevice(device.id);
        this.updateDeviceStatus(device.id, 'available');
      });

      this.emit('job:failed', { job, error });
    }

    // Process next jobs in queue
    await this.processJobQueue();
  }

  /**
   * Execute test on specific device
   */
  private async executeTestOnDevice(job: TestJob, device: DeviceInfo): Promise<TestJobResult> {
    const startTime = new Date();

    try {
      // Simulate test execution
      await this.sleep(Math.random() * 5000 + 2000);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Update device metrics
      device.avgTestDuration = (device.avgTestDuration * (device.totalTestsRun - 1) + duration) / device.totalTestsRun;

      this.metrics.totalTestsRun++;

      return {
        deviceId: device.id,
        deviceName: device.name,
        status: Math.random() > 0.1 ? 'passed' : 'failed',
        duration,
        startTime,
        endTime,
        screenshots: [],
        logs: [],
      };
    } catch (error) {
      const endTime = new Date();

      return {
        deviceId: device.id,
        deviceName: device.name,
        status: 'error',
        duration: endTime.getTime() - startTime.getTime(),
        startTime,
        endTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        screenshots: [],
        logs: [],
      };
    }
  }

  /**
   * Select devices based on distribution strategy
   */
  private selectDevices(availableDevices: DeviceInfo[], job: TestJob): DeviceInfo[] {
    const maxDevices = this.distributionStrategy.parallelism || availableDevices.length;
    let selectedDevices: DeviceInfo[] = [];

    switch (this.distributionStrategy.type) {
      case 'round-robin':
        selectedDevices = availableDevices.slice(0, maxDevices);
        break;

      case 'least-loaded':
        selectedDevices = [...availableDevices]
          .sort((a, b) => a.totalTestsRun - b.totalTestsRun)
          .slice(0, maxDevices);
        break;

      case 'priority':
        // Prefer devices with higher success rate
        selectedDevices = [...availableDevices]
          .sort((a, b) => b.successRate - a.successRate)
          .slice(0, maxDevices);
        break;

      case 'random':
        selectedDevices = this.shuffleArray([...availableDevices]).slice(0, maxDevices);
        break;

      case 'capability-based':
        // Select devices that best match requirements
        selectedDevices = availableDevices.slice(0, maxDevices);
        break;

      default:
        selectedDevices = availableDevices.slice(0, maxDevices);
    }

    return selectedDevices;
  }

  /**
   * Allocate device to job
   */
  private allocateDevice(jobId: string, deviceId: string, expectedDuration: number): void {
    const allocation: DeviceAllocation = {
      jobId,
      deviceId,
      allocatedAt: new Date(),
      expectedDuration,
    };

    this.activeAllocations.set(deviceId, allocation);
    this.emit('device:allocated', allocation);
  }

  /**
   * Release device from job
   */
  private releaseDevice(deviceId: string): void {
    const allocation = this.activeAllocations.get(deviceId);
    if (allocation) {
      allocation.actualDuration = Date.now() - allocation.allocatedAt.getTime();
      this.activeAllocations.delete(deviceId);
      this.emit('device:released', allocation);
    }
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status === 'completed' || job.status === 'failed') {
      throw new Error(`Job ${jobId} is already ${job.status}`);
    }

    job.status = 'cancelled';
    job.completedAt = new Date();

    // Release allocated devices
    job.assignedDevices.forEach(deviceId => {
      this.releaseDevice(deviceId);
      this.updateDeviceStatus(deviceId, 'available');
    });

    // Remove from queue
    this.jobQueue = this.jobQueue.filter(j => j.id !== jobId);

    this.emit('job:cancelled', job);
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Set distribution strategy
   */
  setDistributionStrategy(strategy: TestDistributionStrategy): void {
    this.distributionStrategy = strategy;
    this.emit('strategy:changed', strategy);
  }

  /**
   * Get orchestrator metrics
   */
  getMetrics(): OrchestratorMetrics {
    // Calculate device utilization
    this.metrics.deviceUtilization = this.metrics.totalDevices > 0
      ? (this.metrics.inUseDevices / this.metrics.totalDevices) * 100
      : 0;

    // Calculate success rate
    this.metrics.successRate = this.metrics.completedJobs > 0
      ? ((this.metrics.completedJobs - this.metrics.failedJobs) / this.metrics.completedJobs) * 100
      : 0;

    return { ...this.metrics };
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): TestJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): TestJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get device info
   */
  getDeviceInfo(deviceId: string): DeviceInfo | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Get all devices
   */
  getAllDevices(): DeviceInfo[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get device pool
   */
  getDevicePool(poolId: string): DevicePool | undefined {
    return this.devicePools.get(poolId);
  }

  /**
   * Get all device pools
   */
  getAllDevicePools(): DevicePool[] {
    return Array.from(this.devicePools.values());
  }

  /**
   * Generate job ID
   */
  private generateJobId(): string {
    return `job-${Date.now()}-${++this.jobCounter}`;
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): OrchestratorMetrics {
    return {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      totalDevices: 0,
      availableDevices: 0,
      inUseDevices: 0,
      offlineDevices: 0,
      avgJobDuration: 0,
      avgWaitTime: 0,
      deviceUtilization: 0,
      successRate: 0,
      costPerHour: 0,
      totalTestsRun: 0,
    };
  }

  /**
   * Shuffle array utility
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate comprehensive report
   */
  generateReport(): DeviceFarmReport {
    const jobs = this.getAllJobs();
    const devices = this.getAllDevices();

    return {
      timestamp: new Date(),
      metrics: this.getMetrics(),
      deviceStatus: {
        total: this.metrics.totalDevices,
        available: this.metrics.availableDevices,
        inUse: this.metrics.inUseDevices,
        offline: this.metrics.offlineDevices,
        maintenance: devices.filter(d => d.status === 'maintenance').length,
      },
      jobSummary: {
        total: this.metrics.totalJobs,
        completed: this.metrics.completedJobs,
        failed: this.metrics.failedJobs,
        pending: jobs.filter(j => j.status === 'pending').length,
        running: jobs.filter(j => j.status === 'running').length,
      },
      topDevices: this.getTopDevices(5),
      recentJobs: jobs.slice(-10),
      recommendations: this.generateOptimizationRecommendations(),
    };
  }

  /**
   * Get top performing devices
   */
  private getTopDevices(limit: number): DeviceInfo[] {
    return [...this.devices.values()]
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, limit);
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getMetrics();

    if (metrics.deviceUtilization < 30) {
      recommendations.push('Device utilization is low. Consider reducing device pool size to optimize costs.');
    }

    if (metrics.deviceUtilization > 90) {
      recommendations.push('Device utilization is very high. Consider adding more devices to the pool.');
    }

    if (metrics.successRate < 80) {
      recommendations.push('Success rate is below 80%. Review failed tests and device stability.');
    }

    if (metrics.avgWaitTime > 300000) {
      recommendations.push('Average wait time exceeds 5 minutes. Consider increasing parallelism or device count.');
    }

    const offlinePercent = (metrics.offlineDevices / metrics.totalDevices) * 100;
    if (offlinePercent > 10) {
      recommendations.push('More than 10% of devices are offline. Check device connectivity and maintenance.');
    }

    return recommendations;
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.devicePools.clear();
    this.devices.clear();
    this.jobs.clear();
    this.activeAllocations.clear();
    this.jobQueue = [];
    this.metrics = this.initializeMetrics();
    this.jobCounter = 0;
    this.emit('cleared');
  }
}

// ============================================================================
// Report Types
// ============================================================================

export interface DeviceFarmReport {
  timestamp: Date;
  metrics: OrchestratorMetrics;
  deviceStatus: {
    total: number;
    available: number;
    inUse: number;
    offline: number;
    maintenance: number;
  };
  jobSummary: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    running: number;
  };
  topDevices: DeviceInfo[];
  recentJobs: TestJob[];
  recommendations: string[];
}

// ============================================================================
// Exports
// ============================================================================

export default DeviceFarmOrchestrator;
