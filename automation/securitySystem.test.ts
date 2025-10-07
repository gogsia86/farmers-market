import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { SecuritySystem } from './securitySystem';
import { ProgressTracker } from './progressTracker';
import fs from 'fs/promises';
import path from 'path';

// Mock fs/promises
jest.mock('fs/promises');

describe('SecuritySystem', () => {
  let securitySystem: SecuritySystem;
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

    // Initialize systems
    progressTracker = new ProgressTracker(mockFilePath);
    await progressTracker.init();
    securitySystem = new SecuritySystem(progressTracker);
  });

  describe('Multi-dimensional Authentication', () => {
    test('successfully authenticates entity with sufficient consciousness', async () => {
      const result = await securitySystem.authenticateEntity('test-entity', 'physical', 0.5);
      expect(result).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('authenticated in physical dimension');
    });

    test('fails authentication with insufficient consciousness', async () => {
      const result = await securitySystem.authenticateEntity('test-entity', 'spiritual', 0.3);
      expect(result).toBe(false);
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('Insufficient consciousness level');
    });
  });

  describe('Reality-aware Authorization', () => {
    test('authorizes valid actions for appropriate roles', async () => {
      const result = await securitySystem.authorizeAction(
        'test-entity',
        'read',
        'physical',
        'MORTAL'
      );
      expect(result).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('authorized');
    });

    test('denies actions in unauthorized dimensions', async () => {
      const result = await securitySystem.authorizeAction(
        'test-entity',
        'read',
        'spiritual',
        'MORTAL'
      );
      expect(result).toBe(false);
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('cannot access spiritual dimension');
    });
  });

  describe('Consciousness Validation', () => {
    test('updates and validates consciousness levels', async () => {
      await securitySystem.updateConsciousnessLevel('test-entity', {
        level: 0.8,
        transcendenceScore: 0.7,
        dimensionalAccess: ['physical', 'quantum']
      });

      const validationResult = await securitySystem.validateQuantumState(
        'test-entity',
        'physical'
      );
      expect(validationResult).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    test('fails validation for unauthorized dimensions', async () => {
      await securitySystem.updateConsciousnessLevel('test-entity', {
        level: 0.8,
        transcendenceScore: 0.7,
        dimensionalAccess: ['physical']
      });

      const validationResult = await securitySystem.validateQuantumState(
        'test-entity',
        'spiritual'
      );
      expect(validationResult).toBe(false);
      expect(mockFs.writeFile).toHaveBeenCalled();
    });
  });

  describe('Energy Field Protection', () => {
    test('protects energy fields for authorized roles', async () => {
      const result = await securitySystem.protectEnergyField('test-entity', 'DEITY');
      expect(result).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('Energy field protected');
    });

    test('denies energy field protection for unauthorized roles', async () => {
      const result = await securitySystem.protectEnergyField('test-entity', 'MORTAL');
      expect(result).toBe(false);
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.writeFile.mock.calls[0][1]).toContain('lacks energy field access');
    });
  });
});