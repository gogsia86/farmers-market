export interface QuantumMessage<T = any> {
  id: string;
  quantumId: string;
  data: T;
  timestamp: number;
  coherenceLevel?: number;
}

export interface QuantumState {
  messageOrder: string[];
  messageCount: number;
  coherenceLevel: number;
  currentState: string;
  streamCoherence: {
    [key: string]: string[];
  };
  queueProcessed: boolean;
}

export interface WebSocketEventData {
  type: string;
  payload?: any;
  quantumId?: string;
  timestamp?: number;
}