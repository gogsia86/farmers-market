# WebSocket Metrics Events

## Core Events

### Event: `quantum-metric-update`

#### Event Overview

Core event for quantum metric updates in the agricultural system. Provides real-time updates about quantum alignment, confidence levels, and temporal shifts in the agricultural prediction system.

#### Quantum Properties

- Coherence Level: `HIGH`
- Temporal Order: `STRICT`
- State Dependency: `Yes`
- Quantum ID Required: `Yes`

#### Event Payload Structure

```typescript
interface QuantumMetricUpdate {
  type: 'METRIC_UPDATE' | 'ALIGNMENT_UPDATE' | 'TEMPORAL_SHIFT';
  timestamp: number;
  metrics: {
    quantumAlignmentScore?: number;
    confidence?: number;
    temporalShift?: number;
    resonance?: {
      current: number;
      trend: number;
    };
    energy?: {
      current: number;
      trend: number;
    };
    consciousness?: {
      current: number;
      trend: number;
    };
  };
}
```

#### Example Metric Message

```json
{
  "type": "METRIC_UPDATE",
  "timestamp": 1696685400000,
  "metrics": {
    "quantumAlignmentScore": 0.95,
    "confidence": 0.87,
    "temporalShift": 0.02,
    "resonance": {
      "current": 0.89,
      "trend": 0.03
    },
    "energy": {
      "current": 0.92,
      "trend": 0.01
    },
    "consciousness": {
      "current": 0.85,
      "trend": 0.04
    }
  }
}
```

#### Metric State Impact

Affects the quantum state of the system through metric updates:

```typescript
interface StateChange {
  previousMetrics: WebSocketMetrics;
  newMetrics: WebSocketMetrics;
  delta: {
    alignmentDelta: number;
    confidenceDelta: number;
    temporalShift: number;
  };
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}
```

#### Metric Temporal Flow

- Message Order: `SEQUENTIAL`
- Timing Dependencies:
  - Must process metrics in chronological order
  - Maximum latency threshold: 200ms
  - Batch window: 50-200ms (adaptive)
- Coherence Window: 1000ms (1 second) for related metric updates

#### Metric Error Handling

| Error Code | Description | Recovery Strategy |
|------------|-------------|-------------------|
| `TEMPORAL_DRIFT` | Metrics out of temporal order | Buffer and reorder within coherence window |
| `COHERENCE_LOSS` | Quantum state decoherence | Initiate quantum resync protocol |
| `BATCH_OVERFLOW` | Too many updates in batch | Drop oldest updates, adjust batch size |

#### Metric Update Implementation

```typescript
// Client-side subscription
socket.on('quantum-metric-update', (update: QuantumMetricUpdate) => {
  // Process the update
  processQuantumMetricUpdate(update);
  
  // Update local state
  updateQuantumState(update);
  
  // Trigger UI updates
  refreshQuantumDisplay();
});

// Server-side emission
socket.emit('quantum-metric-update', {
  type: 'METRIC_UPDATE',
  timestamp: Date.now(),
  metrics: {
    quantumAlignmentScore: calculateAlignment(),
    confidence: calculateConfidence(),
    // ... other metrics
  }
});
```

#### Related Metric Types

- [QuantumSocketConfig](../types/README.md#QuantumSocketConfig)
- [WebSocketMetrics](../types/README.md#WebSocketMetrics)
- [QuantumState](../types/README.md#QuantumState)

#### Metric Evolution Track

- Current State: `FLOWERING`
- Last Evolution: 2025-10-05
- Next Evolution: Expected 2025-11-01

### Event: `heartbeat`

#### Heartbeat Overview

System heartbeat event for maintaining quantum coherence and monitoring connection health.

#### Heartbeat Properties

- Coherence Level: `MEDIUM`
- Temporal Order: `FLEXIBLE`
- State Dependency: `No`
- Quantum ID Required: `No`

#### Heartbeat Payload Structure

```typescript
interface HeartbeatPayload {
  timestamp: number;
  latency: number;
  quantumState: {
    coherence: number;
    alignment: number;
  };
}
```

#### Example Heartbeat Message

```json
{
  "timestamp": 1696685400000,
  "latency": 45,
  "quantumState": {
    "coherence": 0.95,
    "alignment": 0.92
  }
}
```

#### Heartbeat State Impact

Updates connection health metrics and quantum coherence:

```typescript
interface HeartbeatStateChange {
  previousLatency: number;
  newLatency: number;
  coherenceDelta: number;
  connectionHealth: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
}
```

#### Heartbeat Temporal Flow

- Message Order: `FLEXIBLE`
- Timing Dependencies:
  - Sent every 30 seconds
  - Maximum acceptable delay: 5 seconds
- Coherence Window: 5000ms (5 seconds)

#### Heartbeat Error Handling

| Error Code | Description | Recovery Strategy |
|------------|-------------|-------------------|
| `HEARTBEAT_TIMEOUT` | No heartbeat received | Attempt reconnection |
| `HIGH_LATENCY` | Latency above threshold | Adjust batch parameters |

#### Heartbeat Implementation

```typescript
// Client-side handling
socket.on('heartbeat', (payload: HeartbeatPayload) => {
  updateConnectionHealth(payload);
  adjustQuantumCoherence(payload.quantumState);
});

// Server-side emission
setInterval(() => {
  socket.emit('heartbeat', {
    timestamp: Date.now(),
    latency: calculateLatency(),
    quantumState: getCurrentQuantumState()
  });
}, 30000);
```

#### Related Heartbeat Types

- [WebSocketMetrics](../types/README.md#WebSocketMetrics)
- [QuantumState](../types/README.md#QuantumState)

#### Heartbeat Evolution Track

- Current State: `GROWING`
- Last Evolution: 2025-10-05
- Next Evolution: Expected 2025-10-15
