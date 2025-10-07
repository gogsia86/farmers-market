import { describe, test, expect, beforeEach, jest, beforeAll, afterAll } from '@jest/globals';
import fs from 'fs/promises';
import { ProgressTracker } from './progressTracker';
import path from 'path';

type PathLike = Parameters<typeof fs.readFile>[0];

const mockFileContent = `# Progress Tracker
<!-- ACTIVE_TASK_START -->
Currently no active task
<!-- ACTIVE_TASK_END -->
<!-- METRICS_START -->
Old metrics
<!-- METRICS_END -->
<!-- ACTIVITY_LOG_START -->
Old activity
<!-- ACTIVITY_LOG_END -->
<!-- LAST_UPDATE_START -->
10/05/2025, 12:00:00
<!-- LAST_UPDATE_END -->`;

jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockImplementation(async () => mockFileContent),
  writeFile: jest.fn().mockImplementation(async () => undefined)
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('ProgressTracker', () => {
  const mockFilePath = path.join(process.cwd(), 'test/MOCK_PROGRESS.md');
  let tracker: ProgressTracker;

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-10-05T12:00:00'));
  });

  beforeEach(() => {
    mockFs.readFile.mockClear();
    mockFs.writeFile.mockClear();

    tracker = new ProgressTracker(mockFilePath);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    test('initializes with correct file content', async () => {
      await tracker.init();
      expect(mockFs.readFile).toHaveBeenCalledWith(mockFilePath, 'utf-8');
    });

    test('handles missing file gracefully', async () => {
      mockFs.readFile.mockRejectedValueOnce(new Error('File not found'));
      await expect(tracker.init()).rejects.toThrow('File not found');
    });
  });

  describe('Active Task Management', () => {
    beforeEach(async () => {
      await tracker.init();
      mockFs.writeFile.mockReset();
    });

    test('updates active task with timestamp', async () => {
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      await tracker.updateActiveTask('Test Task');
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('Currently working on: Test Task');
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('Started: 10/05/2025');
    });

    test('clears active task', async () => {
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      await tracker.updateActiveTask(null);
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('Currently no active task');
    });

    test('logs activity when updating task', async () => {
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      await tracker.updateActiveTask('Test Task');
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('Started task: Test Task');
    });
  });

  describe('Basic Metrics', () => {
    beforeEach(async () => {
      await tracker.init();
      mockFs.writeFile.mockReset();
    });

    const mockTasks = [
      { 
        id: 1, 
        title: 'Task 1', 
        status: 'completed' as const, 
        priority: 'High' as const, 
        dependencies: [], 
        progress: 100,
        quantumResonance: 0.95,
        dimensionalAlignment: true 
      },
      { 
        id: 2, 
        title: 'Task 2', 
        status: 'in-progress' as const, 
        priority: 'Medium' as const, 
        dependencies: [], 
        progress: 50,
        quantumResonance: 0.75,
        dimensionalAlignment: true 
      },
      { 
        id: 3, 
        title: 'Task 3', 
        status: 'not-started' as const, 
        priority: 'Low' as const, 
        dependencies: [], 
        progress: 0,
        quantumResonance: 0.5,
        dimensionalAlignment: true 
      }
    ];

    test('calculates metrics correctly', async () => {
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      await tracker.updateMetrics(mockTasks);
      expect(mockFs.writeFile).toHaveBeenCalled();
      const writeCall = mockFs.writeFile.mock.calls[0][1];
      expect(writeCall).toContain('Total Tasks: 3');
      expect(writeCall).toContain('Completed: 1');
      expect(writeCall).toContain('In Progress: 1');
      expect(writeCall).toContain('Not Started: 1');
      expect(writeCall).toContain('Overall Progress: 33.3%');
    });

    test('handles empty task list', async () => {
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      await tracker.updateMetrics([]);
      expect(mockFs.writeFile).toHaveBeenCalled();
      const writeCall = mockFs.writeFile.mock.calls[0][1];
      expect(writeCall).toContain('Total Tasks: 0');
      expect(writeCall).toContain('Overall Progress: 0.0%');
    });
  });

  describe('Activity Logging', () => {
    beforeEach(async () => {
      await tracker.init();
      mockFs.writeFile.mockReset();
    });

    test('adds new activity log entry with timestamp', async () => {
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      const message = 'Test activity';
      await tracker.addActivityLog(message);
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain(`10/05/2025, 12:00:00 - ${message}`);
    });

    test('preserves existing log entries', async () => {
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      await tracker.addActivityLog('New activity');
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('Old activity');
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('New activity');
    });
  });

  describe('Task Status Updates', () => {
    beforeEach(async () => {
      await tracker.init();
      mockFs.writeFile.mockReset();
    });

    test('logs task status updates', async () => {
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      await tracker.updateTaskStatus(1, 'completed', 100);
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('Updated task 1 - Status: completed, Progress: 100%');
    });

    test('logs task progress updates', async () => {
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      await tracker.updateTaskStatus(2, 'in-progress', 50);
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('Updated task 2 - Status: in-progress, Progress: 50%');
    });
  });

  describe('Quantum Metrics', () => {
    const quantumMockTasks = [
      { 
        id: 1, 
        title: 'Divine Task 1', 
        status: 'completed' as const, 
        priority: 'High' as const, 
        dependencies: [], 
        progress: 100,
        quantumResonance: 0.95,
        dimensionalAlignment: true 
      },
      { 
        id: 2, 
        title: 'Divine Task 2', 
        status: 'in-progress' as const, 
        priority: 'Medium' as const, 
        dependencies: [], 
        progress: 50,
        quantumResonance: 0.75,
        dimensionalAlignment: true 
      },
      { 
        id: 3, 
        title: 'Divine Task 3', 
        status: 'not-started' as const, 
        priority: 'Low' as const, 
        dependencies: [], 
        progress: 0,
        quantumResonance: 0.5,
        dimensionalAlignment: true 
      }
    ];

    beforeEach(async () => {
      await tracker.init();
    });

    test('calculates quantum metrics correctly', async () => {
      const result = await tracker.calculateMetrics(quantumMockTasks);
      const { quantumMetrics } = result;
      
      expect(quantumMetrics).toBeDefined();
      expect(quantumMetrics.resonance).toBeGreaterThan(0);
      expect(quantumMetrics.resonance).toBeLessThanOrEqual(1);
      expect(quantumMetrics.dimensionalAlignment).toBe(true);
      expect(quantumMetrics.consciousnessLevel).toBeGreaterThan(0);
      expect(quantumMetrics.temporalStability).toBeGreaterThan(0);
    });

    test('includes transcendence metrics', async () => {
      const result = await tracker.calculateMetrics(quantumMockTasks);
      const { quantumMetrics } = result;
      
      expect(quantumMetrics.transcendenceScore).toBeDefined();
      expect(quantumMetrics.transcendenceScore).toBeGreaterThan(0);
      expect(quantumMetrics.transcendenceScore).toBeLessThanOrEqual(1);
    });

    test('validates reality integration planes', async () => {
      const result = await tracker.calculateMetrics(quantumMockTasks);
      const { quantumMetrics } = result;
      
      expect(quantumMetrics.realityIntegration).toBeDefined();
      if (quantumMetrics.realityIntegration) {
        expect(quantumMetrics.realityIntegration.physicalPlane).toBeGreaterThan(0);
        expect(quantumMetrics.realityIntegration.physicalPlane).toBeLessThanOrEqual(1);
        expect(quantumMetrics.realityIntegration.quantumPlane).toBeGreaterThan(0);
        expect(quantumMetrics.realityIntegration.quantumPlane).toBeLessThanOrEqual(1);
        expect(quantumMetrics.realityIntegration.spiritualPlane).toBeGreaterThan(0);
        expect(quantumMetrics.realityIntegration.spiritualPlane).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('File Saving', () => {
    beforeEach(async () => {
      await tracker.init();
      mockFs.writeFile.mockReset();
    });

    test('updates last update timestamp when saving', async () => {
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      await tracker.save();
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('10/05/2025, 12:00:00');
    });

    test('preserves file structure when saving', async () => {
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      await tracker.save();
      expect(mockFs.writeFile).toHaveBeenCalled();
      const writeCall = mockFs.writeFile.mock.calls[0][1];
      expect(writeCall).toContain('# Progress Tracker');
      expect(writeCall).toMatch(/<!-- ACTIVE_TASK_START -->\s*.*\s*<!-- ACTIVE_TASK_END -->/);
      expect(writeCall).toMatch(/<!-- METRICS_START -->\s*.*\s*<!-- METRICS_END -->/);
      expect(writeCall).toMatch(/<!-- ACTIVITY_LOG_START -->\s*.*\s*<!-- ACTIVITY_LOG_END -->/);
    });
  });
});