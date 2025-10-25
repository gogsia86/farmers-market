# # Agricultural Types System

## Core Types

### Crop Types

#### `CropEntity`

The foundational crop representation in the quantum agricultural system.

````typescript
interface CropEntity {
  id: string;
  name: string;
  type: string;
  quantumSignature: string;
  growthPhase: GrowthPhase;
  energyField: EnergySignature;
  dimensionalLocation: Vector4D;
}
```System

This document outlines the core agricultural type system used throughout the Farmers Market platform. The type system encompasses both traditional agricultural data structures and quantum-aware farming concepts.

## Core Types

### Crop Types

#### `CropEntity`
The foundational crop representation in the quantum agricultural system.
```typescript
interface CropEntity {
  id: string;
  name: string;
  type: string;
  quantumSignature: string;
  growthPhase: GrowthPhase;
  energyField: EnergySignature;
  dimensionalLocation: Vector4D;
}
````

#### `CropData`

Basic crop monitoring data structure.

```typescript
interface CropData {
  id: string;
  currentYield: number;
  phase: string;
  health: number;
  moistureLevel: number;
  soilQuality: number;
}
```

#### `CropFormData`

Data structure for crop creation and updates.

```typescript
interface CropFormData {
  name: string;
  variety?: string;
  plantingDate: Date;
  fieldId: string;
  biodynamicPhase?: BiodynamicPhase;
  expectedYield?: number;
  notes?: string;
  weatherData?: {
    temperature: number;
    humidity: number;
    rainfall: number;
    solarRadiation: number;
  };
  soilData?: {
    pH: number;
    moisture: number;
    organicMatter: number;
    minerals: Record<string, number>;
  };
}
```

### Growth & Development Types

#### `BiodynamicPhase`

Represents the biodynamic growth phases of crops.

```typescript
type BiodynamicPhase =
  | "seedTime"
  | "growth"
  | "flowering"
  | "fruiting"
  | "harvest"
  | "rest";
```

#### `GrowthPhase`

Detailed growth stages including transcendent state.

```typescript
type GrowthPhase =
  | "dormant"
  | "germination"
  | "vegetative"
  | "reproductive"
  | "maturation"
  | "transcendent";
```

### Monitoring Types

#### `CropHealthStatus`

Indicates the current health state of a crop.

```typescript
type CropHealthStatus = "healthy" | "warning" | "critical";
```

#### `CropMetrics`

Core metrics tracked for each crop.

```typescript
interface CropMetrics {
  soilMoisture: number;
  growthRate: number;
  healthScore: number;
  quantumResonance: number;
}
```

#### `MonitoringAlert`

Structure for crop monitoring alerts.

```typescript
interface MonitoringAlert {
  message: string;
  severity: AlertSeverity;
  timestamp?: Date;
}
```

### Quantum Agricultural Types

#### `QuantumAgriculturalState`

Comprehensive state representation including physical, quantum, and spiritual dimensions.

```typescript
interface QuantumAgriculturalState {
  dimensionalState: {
    physical: {
      crops: Array<CropEntity>;
      fields: Array<FieldEntity>;
      weather: WeatherState;
    };
    quantum: {
      probabilityFields: Map<string, number>;
      energyHarmonics: Array<EnergySignature>;
      resonancePatterns: ResonanceMatrix;
    };
    spiritual: {
      celestialAlignment: CelestialState;
      biorhythms: BiodynamicCycles;
      consciousness: ConsciousnessLevel;
    };
  };
  temporalState: {
    currentCycle: BiodynamicPhase;
    projectedStates: Array<FutureState>;
    timelineCoherence: number;
  };
}
```

#### `ConsciousnessData`

Tracks the consciousness metrics of crops.

```typescript
interface ConsciousnessData {
  level: number;
  resonance: number;
  stability: number;
  energyField: number;
}
```

## Real-Time Monitoring

### `RealTimeCropUpdate`

Structure for real-time crop monitoring updates.

```typescript
interface RealTimeCropUpdate {
  cropData: CropData;
  consciousness: ConsciousnessData;
  biodynamicPhase: BiodynamicPhase;
  lastUpdate: Date;
}
```

### `QuantumSyncEvent`

Structure for quantum synchronization events.

```typescript
interface QuantumSyncEvent {
  predictionState: {
    alignmentScore: number;
    confidence: number;
    timeline: {
      optimalStart: Date;
      optimalEnd: Date;
    };
  };
  monitoringState: {
    cropData: {
      yield: number;
      health: number;
      phase: string;
    };
    consciousness: {
      level: number;
      resonance: number;
      stability: number;
    };
  };
  timestamp: number;
}
```

## Type Utilities

### Phase Information Types

#### `BiodynamicPhaseInfo`

Metadata for biodynamic phases.

```typescript
type BiodynamicPhaseInfo = {
  [key in BiodynamicPhase]: {
    label: string;
    description: string;
    color: string;
    icon: string;
  };
};
```

#### `GrowthPhaseInfo`

Metadata for growth phases.

```typescript
type GrowthPhaseInfo = {
  [key in GrowthPhase]: {
    label: string;
    description: string;
    color: string;
    icon: string;
  };
};
```

## Integration Points

1. The type system integrates with Prisma for database operations
2. Types are used in WebSocket events for real-time monitoring
3. Form handling uses specialized form data types
4. Quantum-aware types enable spiritual and consciousness tracking
5. All types support temporal awareness for time-based operations

## Best Practices

1. Always use the most specific type available
2. Include consciousness data when working with quantum-aware operations
3. Ensure temporal consistency in state updates
4. Validate biodynamic phases against celestial alignments
5. Maintain dimensional coherence in quantum operations
