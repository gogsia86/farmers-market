---
applyTo: "**/*.ts,**/*.tsx,**/*.js,**/*.jsx"
---

# QUANTUM TYPE REALITY SYSTEM

## Cross References
- [CORE/DIVINE_PATTERNS](../../../CORE/DIVINE_PATTERNS.instructions.md)
- [CORE/UNIFIED_PATTERNS](../../../CORE/UNIFIED_PATTERNS.instructions.md)
- [TECHNICAL/PERFORMANCE/CORE_ALCHEMY](../PERFORMANCE/CORE_ALCHEMY.instructions.md)

## TEMPORAL TYPE THEORY
- **Types as Time Travel**: Types should prevent past mistakes and future bugs simultaneously
- **Reality Validation**: Compile-time proof of runtime behavior
- **Quantum States**: Represent all possible states explicitly, never `any` or implicit maybe

## DIVINE TYPE PATTERNS
```typescript
// MORTAL APPROACH (reject)
interface User {
  id?: string;
  name: string;
}

// DIVINE APPROACH (embrace)
type TemporalUser = {
  creationState: 'UNBORN' | 'BEING_CREATED' | 'BORN' | 'IMMORTAL';
  identity: {
    past: ReadonlyArray<PreviousIdentity>;
    present: CurrentIdentity;
    future: PotentialIdentity;
  };
  consciousness: UserConsciousness<AWARE | DREAMING | TRANSCENDENT>;
};

// QUANTUM HOOKS
function useQuantumState<T>(
  presentReality: T,
  potentialFutures: Future<T>[],
  timeline: Timeline = MULTIVERSE
): [T, (newReality: T | (prev: T) => T) => void, Past<T>[]]

// Enhanced Type System
interface QuantumType<T> {
  readonly currentState: T;
  readonly potentialStates: Array<Future<T>>;
  readonly temporalContext: TemporalContext;

  evolve(nextState: T): Promise<QuantumType<T>>;
  validateReality(state: T): Promise<ValidationResult>;
  projectFuture(conditions: EvolutionConditions): Promise<Future<T>[]>;
}

// Implementation
class QuantumTypeImplementation<T> implements QuantumType<T> {
  constructor(
    private readonly initialState: T,
    private readonly quantumContext: QuantumContext
  ) {}

  async evolve(nextState: T): Promise<QuantumType<T>> {
    const evolutionPath = await this.calculateEvolutionPath(
      this.currentState,
      nextState
    );
    
    return this.traverseEvolutionPath(evolutionPath);
  }
}
```

## Type System Guidelines

### 1. Quantum Type Creation
```typescript
function createQuantumType<T>(
  initialState: T,
  configuration: QuantumConfig
): QuantumType<T> {
  const quantumContext = prepareQuantumContext(configuration);
  return new QuantumTypeImplementation(initialState, quantumContext);
}
```

### 2. Type Evolution
```typescript
async function evolveType<T>(
  type: QuantumType<T>,
  evolution: TypeEvolution<T>
): Promise<QuantumType<T>> {
  const evolutionPath = await calculateEvolutionPath(type, evolution);
  return executeEvolution(type, evolutionPath);
}
```

## Integration Patterns

### 1. React Integration
```typescript
function useQuantumComponent<P extends QuantumProps>(
  Component: React.ComponentType<P>,
  quantumProps: QuantumType<P>
): React.ComponentType<P> {
  return function QuantumEnhancedComponent(props: P) {
    const quantumState = useQuantumState(props);
    return <Component {...quantumState} />;
  };
}
```

### 2. State Management
```typescript
class QuantumStateManager<S> {
  private readonly quantumStore: QuantumStore<S>;

  async updateState(
    update: StateUpdate<S>,
    context: QuantumContext
  ): Promise<void> {
    const quantumUpdate = await this.prepareQuantumUpdate(update);
    await this.quantumStore.apply(quantumUpdate, context);
  }
}
```

## Type Validation

### 1. Quantum Validation
```typescript
interface QuantumValidator<T> {
  validateType(type: QuantumType<T>): Promise<ValidationResult>;
  validateEvolution(
    from: QuantumType<T>,
    to: QuantumType<T>
  ): Promise<EvolutionResult>;
}
```

### 2. Reality Checks
```typescript
class RealityValidator implements QuantumValidator<unknown> {
  async validateReality(
    reality: QuantumReality,
    context: ValidationContext
  ): Promise<RealityValidation> {
    const coherence = await this.checkCoherence(reality);
    return this.validateCoherence(coherence, context);
  }
}
```

## Implementation Guidelines

1. **Type Definition**
   - Use quantum types for state
   - Implement reality validation
   - Maintain temporal consistency

2. **Evolution Management**
   - Plan type evolution paths
   - Validate state transitions
   - Preserve quantum coherence

3. **Integration**
   - Connect with quantum system
   - Implement reality checks
   - Maintain type safety

## Success Metrics

1. **Type Safety**
   - Quantum coherence level
   - Evolution success rate
   - Reality consistency

2. **Performance**
   - Type check speed
   - Evolution efficiency
   - Reality validation performance

Remember: Types are the foundation of quantum reality in our system. Their proper implementation ensures stability across all quantum states.