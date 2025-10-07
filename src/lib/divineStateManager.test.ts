import { DivineStateManager, DivineMiddleware } from './divineStateManager';

describe('DivineStateManager', () => {
  let manager: DivineStateManager<any>;

  beforeEach(() => {
    manager = new DivineStateManager({ count: 0 });
  });

  it('should initialize with default state and meta', () => {
    const state = manager.getState();
    expect(state.value).toEqual({ count: 0 });
    expect(state.meta.transcendenceLevel).toBe(1);
    expect(state.meta.coherence).toBe(1);
    expect(state.meta.karmaticBalance).toBe(0);
  });

  it('should handle state updates through dispatch', async () => {
    await manager.dispatch({
      type: 'UPDATE',
      payload: { count: 1 },
    });

    const state = manager.getState();
    expect(state.value.count).toBe(1);
  });

  it('should handle transcendence actions', async () => {
    await manager.dispatch({
      type: 'TRANSCEND',
    });

    const state = manager.getState();
    expect(state.meta.transcendenceLevel).toBe(2);
  });

  it('should track action history', async () => {
    await manager.dispatch({
      type: 'UPDATE',
      payload: { count: 1 },
    });

    await manager.dispatch({
      type: 'TRANSCEND',
    });

    const history = manager.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].action.type).toBe('UPDATE');
    expect(history[1].action.type).toBe('TRANSCEND');
  });

  it('should apply middleware', async () => {
    const testMiddleware: DivineMiddleware = {
      name: 'test',
      before: (state, action) => ({
        ...state,
        meta: {
          ...state.meta,
          dimension: 'test',
        },
      }),
    };

    const manager = new DivineStateManager(
      { count: 0 },
      { middleware: [testMiddleware] }
    );

    await manager.dispatch({
      type: 'UPDATE',
      payload: { count: 1 },
    });

    const state = manager.getState();
    expect(state.meta.dimension).toBe('test');
  });

  it('should handle reality merges', async () => {
    await manager.dispatch({
      type: 'MERGE_REALITY',
      payload: { newValue: 42 },
    });

    const state = manager.getState();
    expect(state.value).toEqual({
      count: 0,
      newValue: 42,
    });
  });

  it('should update karmatic balance based on intention purity', async () => {
    await manager.dispatch({
      type: 'UPDATE',
      payload: { count: 1 },
      meta: {
        intentionPurity: 1, // Pure intention
      },
    });

    const state = manager.getState();
    expect(state.meta.karmaticBalance).toBeGreaterThan(0);
  });

  it('should maintain coherence based on actions', async () => {
    await manager.dispatch({
      type: 'UPDATE',
      payload: { count: 1 },
      meta: {
        intentionPurity: 0.5, // Neutral intention
      },
    });

    const state = manager.getState();
    expect(state.meta.coherence).toBeLessThanOrEqual(1);
    expect(state.meta.coherence).toBeGreaterThanOrEqual(0);
  });
});