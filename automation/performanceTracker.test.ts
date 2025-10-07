import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { PerformanceTracker } from './performanceTracker';
import { ProgressTracker } from './progressTracker';
import fs from 'fs/promises';
import path from 'path';

// Mock fs/promises
jest.mock('fs/promises');

describe('PerformanceTracker', () => {
  let performanceTracker: PerformanceTracker;
  let progressTracker: ProgressTracker;
  const mockFilePath = path.join(process.cwd(), 'test/MOCK_PROGRESS.md');

  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(async () => {
    // Reset all mocks
    mockFs.readFile.mockReset();
    mockFs.writeFile.mockReset();

    // Set up mock file content
    const mockFileContent = `# Progress Tracker
<!-- ACTIVE_TASK_START -->
Currently no active task
<!-- ACTIVE_TASK_END -->
<!-- ACTIVITY_LOG_START -->
<!-- ACTIVITY_LOG_END -->
<!-- LAST_UPDATE_START -->
10/07/2025, 12:00:00
<!-- LAST_UPDATE_END -->`;

    mockFs.readFile.mockResolvedValue(mockFileContent);
    mockFs.writeFile.mockResolvedValue(undefined);

    // Initialize trackers
    progressTracker = new ProgressTracker(mockFilePath);
    await progressTracker.init();
    performanceTracker = new PerformanceTracker(progressTracker);
  });

  describe('Quantum State Caching', () => {
    test('caches and retrieves quantum state', async () => {
      const testState = {
        coherence: 0.95,
        entanglement: 0.85,
        superposition: 0.75,
        dimension: 'physical'
      };

      await performanceTracker.cacheQuantumState('test-key', testState);
      const retrievedState = performanceTracker.getQuantumState('test-key');
      
      expect(retrievedState).toEqual(testState);
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('Cached quantum state for test-key');
    });

    test('returns undefined for non-existent cache key', () => {
      const state = performanceTracker.getQuantumState('non-existent');
      expect(state).toBeUndefined();
    });
  });

  describe('Reality Shift Handling', () => {
    test('handles reality shifts with proper logging', async () => {
      await performanceTracker.handleRealityShift('physical', 'quantum');
      
      expect(mockFs.writeFile).toHaveBeenCalled();
      const logContent = mockFs.writeFile.mock.calls[0][1];
      expect(logContent).toContain('Reality shift from physical to quantum completed');
      expect(logContent).toMatch(/completed in \d+(\.\d+)?ms/);
    });
  });

  describe('Performance Monitoring', () => {
    test('generates valid performance metrics', async () => {
      const metrics = await performanceTracker.monitorPerformance();

      expect(metrics).toHaveProperty('quantumState');
      expect(metrics).toHaveProperty('responseTime');
      expect(metrics).toHaveProperty('dimensionalStability');
      expect(metrics).toHaveProperty('energyEfficiency');
      expect(metrics).toHaveProperty('consciousnessLevel');
      expect(metrics).toHaveProperty('realityShiftLatency');

      expect(metrics.quantumState.coherence).toBeGreaterThanOrEqual(0);
      expect(metrics.quantumState.coherence).toBeLessThanOrEqual(1);
      expect(metrics.consciousnessLevel).toBeGreaterThanOrEqual(0);
      expect(metrics.consciousnessLevel).toBeLessThanOrEqual(1);
    });
  });

  describe('Resource Scaling', () => {
    test('scales quantum resources within bounds', async () => {
      await performanceTracker.scaleQuantumResources(150);
      
      expect(mockFs.writeFile).toHaveBeenCalled();
      const logContent = mockFs.writeFile.mock.calls[0][1];
      expect(logContent).toContain('Quantum resources scaled by factor');
      expect(logContent).toMatch(/factor [0-9.]+/);
    });
  });

  describe('Consciousness-Aware Loading', () => {
    test.each([
      [0.9, 'transcendent'],
      [0.6, 'awakened'],
      [0.3, 'basic']
    ])('implements correct loading priority for consciousness level %s', async (level, expected) => {
      await performanceTracker.implementConsciousnessAwareLoading(level);
      
      expect(mockFs.writeFile).toHaveBeenCalled();
      const logContent = mockFs.writeFile.mock.calls[0][1];
      expect(logContent).toContain(`priority: ${expected}`);
    });
  });
});