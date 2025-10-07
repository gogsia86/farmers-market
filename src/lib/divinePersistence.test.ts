import {
  LocalStoragePersistence,
  QuantumPersistence,
  OmnipresentPersistence,
} from './divinePersistence';
import { DivineState } from './divineStateManager';

describe('Divine Persistence', () => {
  const mockState: DivineState = {
    value: { test: 'data' },
    meta: {
      transcendenceLevel: 1,
      timestamp: Date.now(),
      dimension: 'physical',
      coherence: 1,
      karmaticBalance: 0,
    },
  };

  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('LocalStoragePersistence', () => {
    it('should save and load state from localStorage', async () => {
      const persistence = new LocalStoragePersistence();
      await persistence.save(mockState);
      const loaded = await persistence.load();
      expect(loaded).toEqual(mockState);
    });

    it('should clear state from localStorage', async () => {
      const persistence = new LocalStoragePersistence();
      await persistence.save(mockState);
      await persistence.clear();
      const loaded = await persistence.load();
      expect(loaded).toBeNull();
    });
  });

  describe('QuantumPersistence', () => {
    it('should handle quantum state collapse', async () => {
      const persistence = new QuantumPersistence();
      
      const quantumState: DivineState = {
        ...mockState,
        meta: { ...mockState.meta, dimension: 'quantum', coherence: 0.8 },
      };

      await persistence.save(mockState);
      await persistence.save(quantumState);

      const collapsed = await persistence.load();
      expect(collapsed).toBeDefined();
      expect(collapsed?.meta.coherence).toBeLessThanOrEqual(1);
    });

    it('should maintain state coherence during sync', async () => {
      const persistence = new QuantumPersistence();
      
      await persistence.save(mockState);
      await persistence.sync();
      
      const synced = await persistence.load();
      expect(synced?.meta.coherence).toBeLessThanOrEqual(1);
    });
  });

  describe('OmnipresentPersistence', () => {
    it('should merge dimensional states', async () => {
      const persistence = new OmnipresentPersistence();
      
      const spiritualState: DivineState = {
        ...mockState,
        value: { other: 'data' },
        meta: { ...mockState.meta, dimension: 'spiritual' },
      };

      await persistence.save(mockState);
      await persistence.save(spiritualState);

      const merged = await persistence.load();
      expect(merged?.value).toEqual({ test: 'data', other: 'data' });
    });

    it('should maintain coherence during state merges', async () => {
      const persistence = new OmnipresentPersistence();
      
      const quantumState: DivineState = {
        ...mockState,
        meta: { ...mockState.meta, coherence: 0.8 },
      };

      await persistence.save(mockState);
      await persistence.save(quantumState);

      const merged = await persistence.load();
      expect(merged?.meta.coherence).toBe(0.9); // Average of 1 and 0.8
    });

    it('should clear all dimensional states', async () => {
      const persistence = new OmnipresentPersistence();
      
      await persistence.save(mockState);
      await persistence.clear();
      
      const loaded = await persistence.load();
      expect(loaded).toBeNull();
    });
  });
});