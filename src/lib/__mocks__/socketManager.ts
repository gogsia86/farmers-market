import { EventEmitter } from 'events';
import { MockSocketIO } from './webSocketUtils';

interface ManagerOptions {
  path?: string;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
}

/**
 * Quantum-aware Socket.io Manager mock implementation
 */
export class MockSocketIOManager extends EventEmitter {
  private sockets: Map<string, MockSocketIO>;
  private options: Required<ManagerOptions>;
  private reconnectAttempts: number;
  private quantumState: {
    initialized: number;
    totalConnections: number;
    reconnections: number;
    lastError: Error | null;
    connectionStates: { state: string; timestamp: number }[];
  };

  constructor(options: ManagerOptions = {}) {
    super();
    this.sockets = new Map();
    this.options = {
      path: options.path ?? '/socket.io',
      reconnection: options.reconnection ?? true,
      reconnectionAttempts: options.reconnectionAttempts ?? Infinity,
      reconnectionDelay: options.reconnectionDelay ?? 1000,
      timeout: options.timeout ?? 20000
    };
    this.reconnectAttempts = 0;
    this.quantumState = {
      initialized: Date.now(),
      totalConnections: 0,
      reconnections: 0,
      lastError: null,
      connectionStates: []
    };
  }

  socket(nsp: string = '/'): MockSocketIO {
    const existingSocket = Array.from(this.sockets.values()).find(s => s.namespace === nsp);
    if (existingSocket) return existingSocket;

    const socket = new MockSocketIO(nsp);
    this.sockets.set(socket.id, socket);
    this.quantumState.totalConnections++;
    this.updateConnectionState('connected');

    socket.on('disconnect', (reason: string) => {
      this.handleDisconnect(socket.id, reason);
    });

    socket.on('error', (error: Error) => {
      this.handleError(socket.id, error);
    });

    return socket;
  }

  private handleDisconnect(socketId: string, reason: string): void {
    this.updateConnectionState('disconnected');
    
    if (this.options.reconnection && this.reconnectAttempts < this.options.reconnectionAttempts) {
      this.attemptReconnection(socketId);
    } else {
      this.sockets.delete(socketId);
      this.emit('disconnect', { reason });
    }
  }

  private handleError(socketId: string, error: Error): void {
    this.quantumState.lastError = error;
    this.updateConnectionState('error');
    this.emit('error', error);
  }

  private attemptReconnection(socketId: string): void {
    this.reconnectAttempts++;
    this.quantumState.reconnections++;
    this.updateConnectionState('reconnecting');

    setTimeout(() => {
      const socket = this.sockets.get(socketId);
      if (socket) {
        socket.simulateReconnect();
        this.reconnectAttempts = 0;
        this.updateConnectionState('reconnected');
      }
    }, this.options.reconnectionDelay);
  }

  private updateConnectionState(state: string): void {
    this.quantumState.connectionStates.push({
      state,
      timestamp: Date.now()
    });
  }

  // Testing utilities
  disconnect(): void {
    this.sockets.forEach(socket => {
      socket.simulateDisconnect();
    });
    this.sockets.clear();
    this.updateConnectionState('disconnected_all');
  }

  reconnect(): void {
    this.updateConnectionState('reconnecting_all');
    setTimeout(() => {
      const nsp = '/';
      this.socket(nsp);
      this.updateConnectionState('reconnected_all');
    }, this.options.reconnectionDelay);
  }

  simulateError(error: Error): void {
    this.sockets.forEach(socket => {
      socket.simulateError(error);
    });
  }

  getSocket(id: string): MockSocketIO | undefined {
    return this.sockets.get(id);
  }

  getConnectedSockets(): MockSocketIO[] {
    return Array.from(this.sockets.values());
  }

  getQuantumState(): any {
    return {
      ...this.quantumState,
      currentSockets: this.getConnectedSockets().map(s => ({
        id: s.id,
        namespace: s.namespace,
        state: s.getQuantumState()
      })),
      options: this.options,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

export function createMockSocketIOManager(options?: ManagerOptions): MockSocketIOManager {
  return new MockSocketIOManager(options);
}