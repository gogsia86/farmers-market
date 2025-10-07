import { QuantumStateManager } from './quantumStateManager';

describe('QuantumStateManager', () => {
  let manager: QuantumStateManager;

  beforeEach(() => {
    manager = new QuantumStateManager();
  });

  it('should initialize with default state', () => {
    const state = manager.getCurrentState();
    expect(state.dimensionalState.physical).toBe(true);
    expect(state.dimensionalState.quantum).toBe(false);
    expect(state.coherenceLevel).toBe(1.0);
    expect(state.probabilityField).toEqual([1.0]);
  });

  it('should update dimensional state', () => {
    manager.updateState({
      dimension: 'quantum',
      value: true
    });

    const state = manager.getCurrentState();
    expect(state.dimensionalState.quantum).toBe(true);
  });

  it('should handle timeline variants', () => {
    manager.updateState({
      timeline: 'alternate-1'
    });

    const variant = manager.getTimelineVariant('alternate-1');
    expect(variant).toBeDefined();
    expect(manager.getProbabilityDistribution().length).toBe(2);
  });

  it('should adjust coherence level', () => {
    manager.updateState({
      coherenceAdjustment: -0.2
    });

    expect(manager.getCoherenceLevel()).toBe(0.8);
  });

  it('should notify subscribers of state changes', () => {
    const mockCallback = jest.fn();
    const unsubscribe = manager.subscribe(mockCallback);

    manager.updateState({
      dimension: 'spiritual',
      value: true
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
      dimensionalState: expect.objectContaining({
        spiritual: true
      })
    }));

    unsubscribe();
  });

  it('should properly distribute probabilities across timelines', () => {
    manager.updateState({ timeline: 'timeline-1' });
    manager.updateState({ timeline: 'timeline-2' });
    manager.updateState({ coherenceAdjustment: -0.4 }); // Set coherence to 0.6

    const probabilities = manager.getProbabilityDistribution();
    expect(probabilities.length).toBe(3);
    expect(probabilities[0]).toBeCloseTo(0.6); // Primary timeline
    expect(probabilities[1]).toBeCloseTo(0.2); // Timeline 1
    expect(probabilities[2]).toBeCloseTo(0.2); // Timeline 2
  });
});