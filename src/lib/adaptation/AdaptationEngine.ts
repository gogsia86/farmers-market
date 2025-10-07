import { QuantumState, QuantumTransition } from '../types/quantum';
import { ContextSnapshot } from './ContextSensingSystem';

interface AdaptationRule {
  id: string;
  priority: number;
  condition: (context: ContextSnapshot) => boolean;
  adaptation: (context: ContextSnapshot) => Partial<AdaptationState>;
}

interface AdaptationState {
  layout: LayoutAdaptation;
  style: StyleAdaptation;
  behavior: BehaviorAdaptation;
  accessibility: AccessibilityAdaptation;
  performance: PerformanceAdaptation;
}

interface LayoutAdaptation {
  density: number; // 0-1: How compact the layout should be
  hierarchy: number; // 0-1: How strongly to emphasize hierarchy
  flow: 'linear' | 'organic' | 'quantum';
  dimensionality: number; // Number of active layout dimensions
}

interface StyleAdaptation {
  contrast: number; // 0-1: Visual contrast level
  motion: number; // 0-1: Amount of motion/animation
  scale: number; // Base scale factor
  colorIntensity: number; // 0-1: Color saturation/intensity
}

interface BehaviorAdaptation {
  anticipation: number; // 0-1: Level of predictive behavior
  responsiveness: number; // 0-1: Speed of response
  assistance: number; // 0-1: Level of user assistance
  autonomy: number; // 0-1: Degree of autonomous behavior
}

interface AccessibilityAdaptation {
  textSize: number; // Base text size multiplier
  spacing: number; // Space between elements multiplier
  interactions: 'normal' | 'simplified' | 'assisted';
  feedback: 'visual' | 'auditory' | 'haptic' | 'all';
}

interface PerformanceAdaptation {
  caching: 'aggressive' | 'balanced' | 'minimal';
  prefetching: boolean;
  optimization: 'speed' | 'memory' | 'battery';
  qualityLevel: number; // 0-1: Visual quality level
}

export class AdaptationEngine {
  private rules: AdaptationRule[] = [];
  private currentState: AdaptationState;
  private observers: Set<(state: AdaptationState) => void> = new Set();

  constructor() {
    this.currentState = this.getDefaultState();
    this.initializeRules();
  }

  private getDefaultState(): AdaptationState {
    return {
      layout: {
        density: 0.5,
        hierarchy: 0.5,
        flow: 'linear',
        dimensionality: 1
      },
      style: {
        contrast: 0.5,
        motion: 0.5,
        scale: 1,
        colorIntensity: 0.5
      },
      behavior: {
        anticipation: 0.5,
        responsiveness: 0.5,
        assistance: 0.5,
        autonomy: 0.5
      },
      accessibility: {
        textSize: 1,
        spacing: 1,
        interactions: 'normal',
        feedback: 'visual'
      },
      performance: {
        caching: 'balanced',
        prefetching: true,
        optimization: 'speed',
        qualityLevel: 1
      }
    };
  }

  private initializeRules() {
    // Quantum coherence rules
    this.addRule({
      id: 'quantum-coherence',
      priority: 10,
      condition: (context) => context.quantum.coherence < 0.5,
      adaptation: (context) => ({
        style: {
          motion: context.quantum.coherence,
          contrast: Math.max(0.6, context.quantum.coherence)
        },
        performance: {
          qualityLevel: context.quantum.coherence,
          optimization: 'speed'
        }
      })
    });

    // Environmental adaptation rules
    this.addRule({
      id: 'lighting-adaptation',
      priority: 8,
      condition: (context) => context.environment.lighting < 0.3,
      adaptation: () => ({
        style: {
          contrast: 0.8,
          colorIntensity: 0.7
        }
      })
    });

    // Performance optimization rules
    this.addRule({
      id: 'performance-optimization',
      priority: 9,
      condition: (context) => context.device.performance.cpu < 0.5,
      adaptation: () => ({
        performance: {
          caching: 'aggressive',
          prefetching: false,
          qualityLevel: 0.7
        },
        style: {
          motion: 0.3
        }
      })
    });

    // Accessibility enhancement rules
    this.addRule({
      id: 'accessibility-enhancement',
      priority: 7,
      condition: (context) => context.user.fatigue > 0.7,
      adaptation: () => ({
        accessibility: {
          textSize: 1.2,
          spacing: 1.3,
          interactions: 'simplified',
          feedback: 'all'
        }
      })
    });

    // Quantum resonance rules
    this.addRule({
      id: 'quantum-resonance',
      priority: 10,
      condition: (context) => context.quantum.resonance < 0.3,
      adaptation: (context) => ({
        layout: {
          flow: 'quantum',
          dimensionality: Math.max(1, Math.floor(context.quantum.dimensionality))
        },
        behavior: {
          anticipation: context.quantum.resonance,
          autonomy: 1 - context.quantum.resonance
        }
      })
    });
  }

  public addRule(rule: AdaptationRule) {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  public adapt(context: ContextSnapshot): AdaptationState {
    let newState = this.getDefaultState();

    // Apply matching rules in priority order
    this.rules.forEach(rule => {
      if (rule.condition(context)) {
        const adaptation = rule.adaptation(context);
        newState = this.mergeStates(newState, adaptation);
      }
    });

    // Quantum state influences
    newState = this.applyQuantumInfluence(newState, context.quantum);

    // Update current state and notify observers
    this.currentState = newState;
    this.notifyObservers();

    return newState;
  }

  private applyQuantumInfluence(
    state: AdaptationState,
    quantum: QuantumState
  ): AdaptationState {
    return {
      ...state,
      layout: {
        ...state.layout,
        dimensionality: Math.max(1, Math.floor(quantum.dimensionality)),
        flow: quantum.coherence > 0.7 ? 'quantum' : state.layout.flow
      },
      style: {
        ...state.style,
        motion: state.style.motion * quantum.coherence,
        scale: 1 + (quantum.resonance - 0.5) * 0.2
      },
      behavior: {
        ...state.behavior,
        anticipation: Math.max(state.behavior.anticipation, quantum.resonance),
        autonomy: state.behavior.autonomy * quantum.entanglement
      }
    };
  }

  private mergeStates(
    base: AdaptationState,
    overlay: Partial<AdaptationState>
  ): AdaptationState {
    return {
      layout: { ...base.layout, ...(overlay.layout || {}) },
      style: { ...base.style, ...(overlay.style || {}) },
      behavior: { ...base.behavior, ...(overlay.behavior || {}) },
      accessibility: { ...base.accessibility, ...(overlay.accessibility || {}) },
      performance: { ...base.performance, ...(overlay.performance || {}) }
    };
  }

  public observe(callback: (state: AdaptationState) => void) {
    this.observers.add(callback);
    callback(this.currentState);
    return () => this.observers.delete(callback);
  }

  private notifyObservers() {
    this.observers.forEach(observer => observer(this.currentState));
  }

  public getCurrentState(): AdaptationState {
    return this.currentState;
  }
}