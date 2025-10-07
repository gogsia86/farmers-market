import { QuantumContextObserver } from './quantumContextObserver';

describe('QuantumContextObserver', () => {
  let observer: QuantumContextObserver;

  beforeEach(() => {
    observer = new QuantumContextObserver();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockContext = {
    entropy: 0.5,
    coherence: 0.8,
    dimensionalShift: 0.3,
    temporalStability: 0.9,
    resonanceField: [0.8, 0.7],
  };

  it('should observe and store significant context changes', () => {
    const observation = observer.observe(mockContext);
    
    expect(observation.context).toEqual(mockContext);
    expect(observation.significance).toBeGreaterThan(0);
    expect(observation.timestamp).toBeDefined();
  });

  it('should prune old observations based on time window', () => {
    // Add some observations
    observer.observe(mockContext);
    
    // Move time forward beyond the window
    jest.advanceTimersByTime(61000); // 61 seconds
    
    observer.observe({
      ...mockContext,
      entropy: 0.6,
    });

    const observations = observer.getObservations();
    expect(observations.length).toBe(1);
  });

  it('should maintain maximum observation limit', () => {
    const observer = new QuantumContextObserver({
      maxObservations: 2,
    });

    // Add three observations
    observer.observe(mockContext);
    observer.observe({
      ...mockContext,
      entropy: 0.6,
    });
    observer.observe({
      ...mockContext,
      entropy: 0.7,
    });

    const observations = observer.getObservations();
    expect(observations.length).toBe(2);
  });

  it('should notify subscribers of significant changes', () => {
    const mockSubscriber = jest.fn();
    observer.subscribe(mockSubscriber);

    const observation = observer.observe(mockContext);

    expect(mockSubscriber).toHaveBeenCalledWith(observation);
  });

  it('should calculate correct statistics', () => {
    observer.observe(mockContext);
    observer.observe({
      ...mockContext,
      entropy: 0.7,
    });

    const stats = observer.getStatistics();
    expect(stats).toHaveProperty('averageSignificance');
    expect(stats).toHaveProperty('maxSignificance');
    expect(stats).toHaveProperty('minSignificance');
    expect(stats).toHaveProperty('observationCount', 2);
  });

  it('should properly unsubscribe observers', () => {
    const mockSubscriber = jest.fn();
    const unsubscribe = observer.subscribe(mockSubscriber);

    unsubscribe();
    observer.observe(mockContext);

    expect(mockSubscriber).not.toHaveBeenCalled();
  });

  it('should reset observer state', () => {
    observer.observe(mockContext);
    observer.reset();

    expect(observer.getObservations()).toHaveLength(0);
    expect(observer.getStatistics()).toBeNull();
  });
});