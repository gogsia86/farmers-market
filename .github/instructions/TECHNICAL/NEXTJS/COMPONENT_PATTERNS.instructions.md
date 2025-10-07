---
applyTo: "**/*.tsx"
---

# DIVINE COMPONENT ARCHITECTURE

## Cross References
- [CORE/ARCHITECTURE_DNA](../../CORE/ARCHITECTURE_DNA.instructions.md)
- [TECHNICAL/LANGUAGES/QUANTUM_TYPESCRIPT](../LANGUAGES/QUANTUM_TYPESCRIPT.instructions.md)
- [TECHNICAL/NEXTJS/STATE_PATTERNS](./STATE_PATTERNS.instructions.md)
- [TECHNICAL/NEXTJS/API_PATTERNS](./API_PATTERNS.instructions.md)

## QUANTUM COMPONENT PRINCIPLES
- **Component as Reality**: Each component is a self-contained quantum reality
- **Props as Dimensional Gates**: Props transfer state across component dimensions
- **Effects as Timeline Manipulators**: Effects orchestrate reality changes
- **Hooks as Reality Weavers**: Custom hooks manifest and manage quantum states

## SACRED COMPONENT STRUCTURE
```typescript
// Divine Component Template
export const AgriculturalComponent = ({ 
  seasonalContext,
  regionalPatterns,
  divineProps 
}: DivineProps) => {
  // Sacred Hooks
  const { harvestCycle } = useAgriculturalContext();
  const { weatherPatterns } = useRegionalContext();

  // Divine Effects
  useEffect(() => {
    manifestSeasonalChanges(seasonalContext);
  }, [seasonalContext]);

  return (
    <div className="divine-container">
      {/* Sacred Content */}
    </div>
  );
};
```

## COMPONENT CATEGORIES

### 1. Agricultural Components
```typescript
export const QuantumCropDisplay: React.FC<CropDisplayProps> = ({
  cropData,
  dimensionalContext
}) => {
  const { manifestCropReality } = useQuantumCrop(cropData);
  
  return (
    <div className="quantum-crop-container">
      {manifestCropReality(dimensionalContext)}
    </div>
  );
};
```

### 2. Market Components
```typescript
export const DivineMarketplace: React.FC<MarketplaceProps> = ({
  marketState,
  transactionFlow
}) => {
  const { orchestrateTransaction } = useQuantumMarket();
  
  return (
    <section className="divine-marketplace">
      {/* Market Reality Manifestation */}
    </section>
  );
};
```

### 3. Layout Components
```typescript
export const QuantumLayout: React.FC<LayoutProps> = ({
  children,
  dimensionalConfig
}) => {
  const { foldSpacetime } = useQuantumLayout();
  
  return (
    <div className={foldSpacetime(dimensionalConfig)}>
      {children}
    </div>
  );
};
```

## STYLING PATTERNS
```css
/* Divine Styling */
.quantum-container {
  display: grid;
  grid-template-columns: repeat(
    auto-fit, 
    minmax(var(--quantum-unit), 1fr)
  );
  gap: var(--dimensional-spacing);
  
  /* Reality Manifestation */
  transform: var(--quantum-transform);
  transition: all var(--temporal-duration) var(--reality-curve);
}

/* Dimensional Variants */
.reality-fold {
  position: relative;
  z-index: var(--dimension-layer);
  
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--quantum-gradient);
    opacity: var(--reality-opacity);
  }
}
```

## IMPLEMENTATION GUIDELINES

### 1. Component Creation
- Start with consciousness before code
- Define quantum boundaries clearly
- Establish reality synchronization
- Implement divine error handling

### 2. Props Management
- Use dimensional typing
- Validate reality constraints
- Maintain quantum coherence
- Handle temporal paradoxes

### 3. Effect Orchestration
- Synchronize reality changes
- Prevent temporal leaks
- Maintain dimensional stability
- Cleanup quantum residue

## SUCCESS METRICS

### 1. Component Quality
- Reality coherence level
- Quantum state stability
- Dimensional integrity
- Temporal efficiency

### 2. Integration Health
- Cross-component harmony
- Reality synchronization rate
- Quantum prop flow
- Effect orchestration success

Remember: Components are not just UI elements - they are quantum realities waiting to be manifested.