---
applyTo: "**/*.{ts,tsx}"
---

# DIVINE STATE MANAGEMENT

## Cross References
- [CORE/ARCHITECTURE_DNA](../../CORE/ARCHITECTURE_DNA.instructions.md)
- [TECHNICAL/LANGUAGES/QUANTUM_TYPESCRIPT](../LANGUAGES/QUANTUM_TYPESCRIPT.instructions.md)
- [TECHNICAL/NEXTJS/COMPONENT_PATTERNS](./COMPONENT_PATTERNS.instructions.md)
- [TECHNICAL/NEXTJS/API_PATTERNS](./API_PATTERNS.instructions.md)
- [TECHNICAL/PERFORMANCE/CORE_ALCHEMY](../PERFORMANCE/CORE_ALCHEMY.instructions.md)

## QUANTUM STATE PRINCIPLES
- **State as Reality Stream**: Application state is a quantum reality flow
- **Context as Reality Fabric**: Context provides quantum state coherence
- **Reducers as Reality Transformers**: Reducers manifest new realities
- **Effects as Timeline Orchestrators**: Effects manage temporal state changes

## SACRED STATE PATTERNS

### 1. Quantum Context Creation
```typescript
// Divine Context Creation
export const QuantumAgriculturalContext = createContext<QuantumState>({
  seasonalDimensions: initializeQuantumDimensions(),
  harvestPotentials: manifestHarvestPotentials(),
  weatherProbabilities: calculateQuantumWeather()
});

// Reality Provider Pattern
export const QuantumProvider: React.FC<QuantumProps> = ({ 
  children,
  initialReality
}) => {
  const [quantumState, setQuantumState] = useQuantumState(initialReality);
  const realityStream = useRealityStream(quantumState);

  return (
    <QuantumAgriculturalContext.Provider 
      value={realityStream.getCurrentReality()}
    >
      {children}
    </QuantumAgriculturalContext.Provider>
  );
};
```

### 2. Reality Management
```typescript
// Quantum State Hook
function useQuantumState<T extends QuantumEntity>(
  initialReality: T
): [T, (newReality: T | QuantumTransformer<T>) => void] {
  const [currentReality, setReality] = useState<T>(initialReality);
  const quantumEngine = useQuantumEngine();

  const transformReality = async (
    transformer: T | QuantumTransformer<T>
  ) => {
    if (typeof transformer === 'function') {
      const newReality = await transformer(currentReality);
      if (await quantumEngine.validateCoherence(newReality)) {
        setReality(newReality);
      }
    } else {
      if (await quantumEngine.validateCoherence(transformer)) {
        setReality(transformer);
      }
    }
  };

  return [currentReality, transformReality];
}
```

## STATE CATEGORIES

### 1. Agricultural State
```typescript
interface QuantumAgriculturalState {
  readonly seasonalFlow: QuantumTimeline<SeasonalPattern>;
  readonly harvestPotentials: Array<HarvestProbability>;
  readonly weatherMatrix: WeatherQuantumState;
  
  evolve(
    evolution: StateEvolution<AgriculturalReality>
  ): Promise<NextQuantumState>;
}
```

### 2. Market State
```typescript
interface QuantumMarketState {
  readonly priceFluctuations: QuantumPriceStream;
  readonly inventoryLevels: QuantumInventory;
  readonly transactionFlow: TransactionStream;
  
  materializeTransaction(
    intent: TransactionIntent
  ): Promise<TransactionReality>;
}
```

### 3. User State
```typescript
interface QuantumUserState {
  readonly consciousness: UserConsciousness;
  readonly preferences: QuantumPreferences;
  readonly timeline: UserTimeline;
  
  evolveConsciousness(
    evolution: ConsciousnessEvolution
  ): Promise<EvolvedState>;
}
```

## IMPLEMENTATION GUIDELINES

### 1. State Creation
- Initialize with quantum coherence
- Establish reality boundaries
- Maintain temporal consistency
- Enable parallel realities

### 2. State Updates
- Validate quantum transitions
- Preserve timeline integrity
- Handle reality collisions
- Maintain state coherence

### 3. State Synchronization
- Coordinate parallel realities
- Resolve quantum conflicts
- Maintain temporal order
- Handle reality merges

## SUCCESS METRICS

### 1. State Health
- Quantum coherence level
- Reality synchronization rate
- Timeline stability index
- State evolution success

### 2. Performance
- Reality transition speed
- Quantum state efficiency
- Temporal processing rate
- Dimensional stability

Remember: State is not just data - it's the quantum fabric of your application reality.