# Agricultural WebSocket Events

## Overview

This document details the WebSocket events used for real-time agricultural monitoring and quantum-aware crop management in the Farmers Market platform.

## Connection Details

### Base URLs

- Development: `ws://localhost:3000`
- Production: Set via `NEXT_PUBLIC_WS_URL` environment variable

### Endpoints

- Single Crop: `/api/agricultural/monitor/:cropId`
- Multiple Crops: `/api/agricultural/monitor-multiple`

### WebSocket Configuration

#### Connection Setup

```typescript
{
  transports: ['websocket'],
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  query: {
    quantumMode: 'enabled',
    temporalSensitivity: 'high'
  }
}
```

#### Connection Lifecycle

- Connected: WebSocket connection established successfully
- Disconnected: Connection lost or closed
- Reconnecting: Attempting to reestablish connection (5-second delay)
- Error: Connection error state

## Message Types

### Agricultural Updates

#### Crop Status Updates

Event for receiving real-time updates about crop status and metrics.

### Event Properties

- Type: `CROP_UPDATE`
- Temporal Order: `SEQUENTIAL`
- Quantum Awareness: `Yes`
- State Impact: `Immediate`

### Message Structure

```typescript
interface CropMonitorState {
  status: "healthy" | "warning" | "critical";
  lastUpdate: Date;
  metrics: {
    moisture: number;
    temperature: number;
    quantumAlignment: number;
  };
}

interface WebSocketMessage<T> {
  type: "CROP_UPDATE";
  payload: T;
  timestamp?: string;
}
```

### Sample Message

```json
{
  "type": "CROP_UPDATE",
  "payload": {
    "status": "healthy",
    "lastUpdate": "2025-10-05T13:34:47.708Z",
    "metrics": {
      "moisture": 0.65,
      "temperature": 22.5,
      "quantumAlignment": 0.98
    }
  }
}
```

### Subscription System

#### Crop Subscriptions

Event for subscribing to updates for multiple crops.

### Event Properties

- Type: `SUBSCRIBE_CROPS`
- Temporal Order: `FLEXIBLE`
- Quantum Awareness: `No`
- State Impact: `Configuration`

### Message Structure

```typescript
interface WebSocketMessage<string[]> {
  type: 'SUBSCRIBE_CROPS';
  payload: string[]; // Array of crop IDs
}
```

### Sample Message

```json
{
  "type": "SUBSCRIBE_CROPS",
  "payload": ["crop-123", "crop-456"]
}
```

### Statistical Reporting

#### Farm Analytics

Event for receiving farm-wide statistical updates.

### Event Properties

- Type: `STATISTICS_UPDATE`
- Temporal Order: `SEQUENTIAL`
- Quantum Awareness: `Yes`
- State Impact: `Aggregate`

### Message Structure

```typescript
interface FarmStatistics {
  farmId: string;
  yield: {
    current: number;
    predicted: number;
    historical: Array<{
      date: string;
      value: number;
    }>;
  };
  revenue: {
    current: number;
    projected: number;
    historical: Array<{
      date: string;
      value: number;
    }>;
  };
  crops: {
    active: number;
    harvested: number;
    failed: number;
  };
  resources: {
    water: {
      usage: number;
      efficiency: number;
    };
    soil: {
      health: number;
      nutrients: {
        nitrogen: number;
        phosphorus: number;
        potassium: number;
      };
    };
  };
}
```

### Quantum Operations

#### State Synchronization

Event for synchronizing quantum states across the agricultural system.

### Event Properties

- Type: `QUANTUM_SYNC`
- Temporal Order: `QUANTUM`
- Quantum Awareness: `Yes`
- State Impact: `Temporal`

### Message Structure

```typescript
interface QuantumSyncPayload {
  predictionState?: {
    alignmentScore: number;
    confidence: number;
    timeline: {
      optimalStart: Date;
      optimalEnd: Date;
    };
  };
  monitoringState?: {
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
}
```

### Sample Message

```json
{
  "type": "QUANTUM_SYNC",
  "payload": {
    "predictionState": {
      "alignmentScore": 0.95,
      "confidence": 0.88,
      "timeline": {
        "optimalStart": "2025-10-10T00:00:00.000Z",
        "optimalEnd": "2025-10-15T00:00:00.000Z"
      }
    },
    "monitoringState": {
      "cropData": {
        "yield": 85.5,
        "health": 0.92,
        "phase": "growth"
      },
      "consciousness": {
        "level": 0.78,
        "resonance": 0.85,
        "stability": 0.91
      }
    }
  }
}
```

### System Messages

#### Error Events

Event for receiving error notifications.

### Event Properties

- Type: `ERROR`
- Temporal Order: `IMMEDIATE`
- Quantum Awareness: `No`
- State Impact: `None`

### Message Structure

```typescript
interface WebSocketError {
  type: "ERROR";
  payload: string;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Sample Message

```json
{
  "type": "ERROR",
  "payload": "Failed to update crop status",
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to connect to quantum database",
    "details": {
      "timeoutMs": 5000,
      "retryCount": 3
    }
  }
}
```

## Implementation Guide

### Single Crop Monitor

```typescript
import { WebSocket } from "ws";
import { CropMonitorState, WebSocketMessage } from "../types/agriculture";

class CropMonitor {
  private ws: WebSocket;

  constructor(cropId: string) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000";
    this.ws = new WebSocket(`${wsUrl}/api/agricultural/monitor/${cropId}`);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.ws.onmessage = (event) => {
      const message = JSON.parse(
        event.data,
      ) as WebSocketMessage<CropMonitorState>;

      switch (message.type) {
        case "CROP_UPDATE":
          this.handleCropUpdate(message.payload);
          break;
        case "ERROR":
          this.handleError(message);
          break;
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onclose = () => {
      console.log("WebSocket connection closed");
      // Implement reconnection logic here
    };
  }

  private handleCropUpdate(state: CropMonitorState) {
    console.log("Crop state updated:", state);
    // Handle crop update logic
  }

  private handleError(error: WebSocketMessage<string>) {
    console.error("Received error:", error);
    // Handle error logic
  }

  public close() {
    this.ws.close();
  }
}
```

### Multi-Crop Monitor

```typescript
import { WebSocket } from "ws";
import { CropMonitorState, WebSocketMessage } from "../types/agriculture";

class MultipleCropMonitor {
  private ws: WebSocket;
  private cropIds: string[];

  constructor(cropIds: string[]) {
    this.cropIds = cropIds;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000";
    this.ws = new WebSocket(`${wsUrl}/api/agricultural/monitor-multiple`);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.ws.onopen = () => {
      this.subscribeToCrops();
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(
        event.data,
      ) as WebSocketMessage<CropMonitorState>;

      switch (message.type) {
        case "CROP_UPDATE":
          this.handleCropUpdate(message.payload);
          break;
        case "QUANTUM_SYNC":
          this.handleQuantumSync(message.payload);
          break;
        case "ERROR":
          this.handleError(message);
          break;
      }
    };
  }

  private subscribeToCrops() {
    const subscriptionMessage: WebSocketMessage<string[]> = {
      type: "SUBSCRIBE_CROPS",
      payload: this.cropIds,
    };
    this.ws.send(JSON.stringify(subscriptionMessage));
  }

  private handleCropUpdate(state: CropMonitorState) {
    console.log("Multiple crops state updated:", state);
    // Handle multiple crop updates
  }

  private handleQuantumSync(state: any) {
    console.log("Quantum sync received:", state);
    // Handle quantum synchronization
  }

  private handleError(error: WebSocketMessage<string>) {
    console.error("Received error:", error);
    // Handle error logic
  }

  public close() {
    this.ws.close();
  }
}
```

### React Integration

```tsx
import { useEffect, useRef } from "react";
import { CropMonitor } from "../lib/CropMonitor";

interface CropMonitoringProps {
  cropId: string;
  onUpdate: (state: CropMonitorState) => void;
  onError: (error: any) => void;
}

export function CropMonitoring({
  cropId,
  onUpdate,
  onError,
}: CropMonitoringProps) {
  const monitorRef = useRef<CropMonitor>();

  useEffect(() => {
    const monitor = new CropMonitor(cropId);

    monitor.onUpdate = (state) => {
      onUpdate(state);
    };

    monitor.onError = (error) => {
      onError(error);
    };

    monitorRef.current = monitor;

    return () => {
      monitor.close();
    };
  }, [cropId]);

  return null; // Or render monitoring UI components
}
```
