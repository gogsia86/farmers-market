import { EventEmitter } from 'events';

/**
 * A quantum-aware mock implementation of a WebSocket connection
 */
export class MockWebSocket extends EventEmitter {
  private url: string;
  private readyState: number;
  private latency: number;
  private quantumState: {
    connectionAttempts: number;
    lastConnected: number | null;
    messageHistory: any[];
    stateTransitions: { from: number; to: number; timestamp: number }[];
    messageCount: number;
    coherenceLevel: number;
  };

  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  constructor(url: string, options: { latency?: number } = {}) {
    super();
    this.url = url;
    this.readyState = MockWebSocket.CLOSED;
    this.latency = options.latency ?? 50;
    this.quantumState = {
      connectionAttempts: 0,
      lastConnected: null,
      messageHistory: [],
      stateTransitions: [],
      messageCount: 0,
      coherenceLevel: 1
    };

    // Start connection process
    this.simulateConnection();
  }

  private simulateConnection(): void {
    if (this.readyState !== MockWebSocket.CLOSED) return;

    this.quantumState.connectionAttempts++;
    this.updateState(MockWebSocket.CONNECTING);

    setTimeout(() => {
      if (this.readyState === MockWebSocket.CONNECTING) {
        this.updateState(MockWebSocket.OPEN);
        this.quantumState.lastConnected = Date.now();
        this.emit('open');
      }
    }, this.latency);
  }

  private updateState(newState: number): void {
    const oldState = this.readyState;
    if (oldState === newState) return;

    this.readyState = newState;
    this.quantumState.stateTransitions.push({
      from: oldState,
      to: newState,
      timestamp: Date.now()
    });

    // Update coherence when state changes
    this.updateCoherence();
  }

  private updateCoherence(): void {
    const transitions = this.quantumState.stateTransitions;
    const messages = this.quantumState.messageHistory;
    
    if (transitions.length < 2) {
      this.quantumState.coherenceLevel = 1;
      return;
    }

    // Calculate average time between state transitions
    const transitionIntervals = [];
    for (let i = 1; i < transitions.length; i++) {
      transitionIntervals.push(transitions[i].timestamp - transitions[i - 1].timestamp);
    }

    // Calculate average time between messages
    const messageIntervals = [];
    for (let i = 1; i < messages.length; i++) {
      messageIntervals.push(messages[i].timestamp - messages[i - 1].timestamp);
    }

    // Calculate standard deviations
    const transitionStdDev = this.calculateStdDev(transitionIntervals);
    const messageStdDev = this.calculateStdDev(messageIntervals);

    // Coherence decreases with higher variance in intervals
    this.quantumState.coherenceLevel = Math.max(0.5, Math.min(1, 
      Math.exp(-(transitionStdDev + messageStdDev) / 1000)
    ));
  }

  private calculateStdDev(arr: number[]): number {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
  }

  send(data: any): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }

    const message = {
      data,
      timestamp: Date.now(),
      quantumId: Math.random().toString(36).substr(2, 9)
    };

    this.quantumState.messageHistory.push(message);
    this.quantumState.messageCount++;
    this.updateCoherence();

    setTimeout(() => {
      if (this.readyState === MockWebSocket.OPEN) {
        this.emit('message', message);
      }
    }, this.latency);
  }

  close(code: number = 1000, reason?: string): void {
    if (this.readyState === MockWebSocket.CLOSED) return;
    
    this.updateState(MockWebSocket.CLOSING);
    
    setTimeout(() => {
      this.updateState(MockWebSocket.CLOSED);
      this.emit('close', { code, reason });
    }, this.latency);
  }

  // Quantum-aware testing utilities
  simulateError(error: Error): void {
    this.emit('error', error);
  }

  simulateStateChange(newState: number): void {
    if (this.readyState === newState) return;
    this.updateState(newState);
  }

  getConnectionStats(): any {
    return {
      url: this.url,
      readyState: this.readyState,
      connectionAttempts: this.quantumState.connectionAttempts,
      lastConnected: this.quantumState.lastConnected,
      messageCount: this.quantumState.messageCount,
      stateTransitions: this.quantumState.stateTransitions
    };
  }

  simulateIncomingMessage(data: any): void {
    if (this.readyState === MockWebSocket.OPEN) {
      const message = {
        data,
        timestamp: Date.now(),
        quantumId: Math.random().toString(36).substr(2, 9)
      };
      
      this.quantumState.messageHistory.push(message);
      this.emit('message', message);
    }
  }

  simulateDisconnection(code: number = 1006, reason?: string): void {
    this.updateState(MockWebSocket.CLOSED);
    this.emit('close', { code, reason });
  }

  simulateReconnection(): void {
    this.simulateConnection();
  }

  getQuantumState(): any {
    return {
      ...this.quantumState,
      currentState: this.readyState,
      coherenceLevel: this.quantumState.coherenceLevel,
      messageCount: this.quantumState.messageCount,
      messageHistory: this.quantumState.messageHistory,
      stateTransitions: this.quantumState.stateTransitions
    };
  }
}

/**
 * Quantum-aware Socket.io mock implementation
 */
export class MockSocketIO extends EventEmitter {
  private rooms: Set<string>;
  readonly namespace: string;
  readonly id: string;
  handshake: { 
    query: Record<string, any>;
    headers: Record<string, any>;
  };
  transport: {
    name: string;
    readyState: string;
  };
  private quantumState: {
    joinedAt: number;
    messagesSent: number;
    messagesReceived: number;
    lastActivity: number;
    roomHistory: { room: string; action: 'join' | 'leave'; timestamp: number }[];
    messageHistory: {
      event?: string;
      data: any;
      id: string;
      timestamp: number;
      source?: string;
      target?: string;
      rooms?: string[];
      coherence: number;
    }[];
  };

  constructor(namespace: string = '/') {
    super();
    this.rooms = new Set();
    this.namespace = namespace;
    this.id = Math.random().toString(36).substr(2, 9);
    this.handshake = {
      query: {},
      headers: {}
    };
    this.transport = {
      name: 'websocket',
      readyState: 'closed'
    };
    this.quantumState = {
      joinedAt: Date.now(),
      messagesSent: 0,
      messagesReceived: 0,
      lastActivity: Date.now(),
      roomHistory: [],
      messageHistory: []
    };
  }

  join(room: string): void {
    this.rooms.add(room);
    this.quantumState.roomHistory.push({
      room,
      action: 'join',
      timestamp: Date.now()
    });
    this.updateActivity();
  }

  leave(room: string): void {
    this.rooms.delete(room);
    this.quantumState.roomHistory.push({
      room,
      action: 'leave',
      timestamp: Date.now()
    });
    this.updateActivity();
  }

  to(room: string): { emit: (event: string, data: any) => void } {
    return {
      emit: (event: string, data: any) => {
        if (this.rooms.has(room)) {
          this.emit(event, data);
          this.quantumState.messagesSent++;
          this.updateActivity();
        }
      }
    };
  }

  emit(event: string, data: any): boolean {
    const messageId = Math.random().toString(36).substr(2, 9);
    const message = {
      event,
      data,
      id: messageId,
      timestamp: Date.now(),
      source: this.id,
      rooms: Array.from(this.rooms),
      coherence: this.getQuantumCoherence()
    };

    this.quantumState.messagesSent++;
    this.updateActivity();
    
    const result = super.emit(event, data);
    
    this.quantumState.messageHistory.push(message);
    return result;
  }

  on(event: string, listener: (...args: any[]) => void): this {
    super.on(event, (...args) => {
      this.quantumState.messagesReceived++;
      this.updateActivity();
      
      // Track this event in the quantum state
      this.quantumState.messageHistory.push({
        event,
        data: args,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        target: this.id,
        coherence: this.getQuantumCoherence()
      });
      
      listener(...args);
    });
    return this;
  }

  private updateActivity(): void {
    this.quantumState.lastActivity = Date.now();
  }

  private getQuantumCoherence(): number {
    if (this.quantumState.messageHistory.length === 0) return 1;

    // Calculate coherence based on message timing and room membership
    const messageIntervals = [];
    for (let i = 1; i < this.quantumState.messageHistory.length; i++) {
      messageIntervals.push(
        this.quantumState.messageHistory[i].timestamp - 
        this.quantumState.messageHistory[i - 1].timestamp
      );
    }

    if (messageIntervals.length === 0) return 1;

    // Calculate standard deviation of message intervals
    const avgInterval = messageIntervals.reduce((a, b) => a + b) / messageIntervals.length;
    const variance = messageIntervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / messageIntervals.length;
    const stdDev = Math.sqrt(variance);

    // Coherence decreases with higher standard deviation in message timing
    const coherence = Math.min(1, Math.exp(-stdDev / 1000));
    
    return coherence;
  }

  // Quantum-aware testing utilities
  getQuantumState(): any {
    return {
      ...this.quantumState,
      currentRooms: Array.from(this.rooms),
      socketId: this.id,
      namespace: this.namespace
    };
  }

  simulateDisconnect(): void {
    this.emit('disconnect', { reason: 'client disconnect' });
  }

  simulateReconnect(): void {
    this.emit('connect', { timestamp: Date.now() });
  }

  simulateError(error: Error): void {
    this.emit('error', error);
  }
}

/**
 * Mock Socket.io Server implementation
 */
export class MockSocketIOServer extends EventEmitter {
  private _sockets: Map<string, MockSocketIO> = new Map();
  private namespaces: Map<string, Set<MockSocketIO>> = new Map();
  private rooms: Map<string, Set<string>> = new Map();
  private sids: Map<string, Set<string>> = new Map();

  public readonly sockets: {
    adapter: {
      rooms: Map<string, Set<string>>;
      sids: Map<string, Set<string>>;
      emit: (event: string, ...args: any[]) => boolean;
      on: (event: string, listener: (...args: any[]) => void) => void;
    };
  };

  constructor() {
    super();
    this.namespaces.set('/', new Set());

    this.sockets = {
      adapter: {
        rooms: this.rooms,
        sids: this.sids,
        emit: (event: string, ...args: any[]) => this.emit(event, ...args),
        on: (event: string, listener: (...args: any[]) => void) => this.on(event, listener)
      }
    };
  }

  createSocket(namespace: string = '/'): MockSocketIO {
    const socket = new MockSocketIO(namespace);
    this._sockets.set(socket.id, socket);
    
    const namespaceSet = this.namespaces.get(namespace) || new Set();
    namespaceSet.add(socket);
    this.namespaces.set(namespace, namespaceSet);

    // Set up join method to track rooms
    const originalJoin = socket.join.bind(socket);
    socket.join = (room: string) => {
      this.addSocketToRoom(socket, room);
      originalJoin(room);
      return socket;
    };

    // Set up leave method
    const originalLeave = socket.leave.bind(socket);
    socket.leave = (room: string) => {
      this.removeSocketFromRoom(socket, room);
      originalLeave(room);
      return socket;
    };

    // Track disconnection
    socket.on('disconnect', () => {
      this.clearSocketRooms(socket);
      this._sockets.delete(socket.id);
      this.namespaces.get(namespace)?.delete(socket);
    });

    // Track reconnection
    socket.on('connect', () => {
      this._sockets.set(socket.id, socket);
      this.namespaces.get(namespace)?.add(socket);
    });

    this.emit('connection', socket);
    return socket;
  }

  private addSocketToRoom(socket: MockSocketIO, room: string): void {
    // Add socket to room
    let roomSockets = this.rooms.get(room) || new Set();
    roomSockets.add(socket.id);
    this.rooms.set(room, roomSockets);

    // Add room to socket's set of rooms
    let socketRooms = this.sids.get(socket.id) || new Set();
    socketRooms.add(room);
    this.sids.set(socket.id, socketRooms);

    // Emit join-room event for testing
    this.sockets.adapter.emit('join-room', room, socket.id);
  }

  private removeSocketFromRoom(socket: MockSocketIO, room: string): void {
    // Remove socket from room
    const roomSockets = this.rooms.get(room);
    if (roomSockets) {
      roomSockets.delete(socket.id);
      if (roomSockets.size === 0) {
        this.rooms.delete(room);
      }
    }

    // Remove room from socket's set of rooms
    const socketRooms = this.sids.get(socket.id);
    if (socketRooms) {
      socketRooms.delete(room);
      if (socketRooms.size === 0) {
        this.sids.delete(socket.id);
      }
    }

    // Emit leave-room event for testing
    this.sockets.adapter.emit('leave-room', room, socket.id);
  }

  private clearSocketRooms(socket: MockSocketIO): void {
    // Get all rooms for this socket
    const socketRooms = this.sids.get(socket.id);
    if (socketRooms) {
      // Remove socket from each room
      for (const room of socketRooms) {
        this.removeSocketFromRoom(socket, room);
      }
      this.sids.delete(socket.id);
    }
  }

  to(room: string): { emit: (event: string, data: any) => void } {
    return {
      emit: (event: string, data: any) => {
        const socketsInRoom = this.rooms.get(room) || new Set();
        const quantumMessage = {
          event,
          data,
          room,
          timestamp: Date.now(),
          id: Math.random().toString(36).substr(2, 9)
        };

        socketsInRoom.forEach(socketId => {
          const socket = this._sockets.get(socketId);
          if (socket && this.isSocketInRoom(socket.id, room)) {
            socket.emit(event, data);
          }
        });
      }
    };
  }

  isSocketInRoom(socketId: string, room: string): boolean {
    const roomSockets = this.rooms.get(room);
    return roomSockets ? roomSockets.has(socketId) : false;
  }

  // Testing utilities
  disconnect(socketId: string): void {
    const socket = this._sockets.get(socketId);
    if (socket) {
      this.clearSocketRooms(socket);
      this._sockets.delete(socketId);
      socket.simulateDisconnect();
    }
  }

  getRoom(room: string): Set<string> {
    return this.rooms.get(room) || new Set();
  }

  getSocketRooms(socketId: string): Set<string> {
    return this.sids.get(socketId) || new Set();
  }

  getConnectedSockets(): MockSocketIO[] {
    return Array.from(this._sockets.values());
  }

  getNamespaceSockets(namespace: string): MockSocketIO[] {
    return Array.from(this.namespaces.get(namespace) || []);
  }

  getRoomSockets(room: string): MockSocketIO[] {
    const socketIds = Array.from(this.rooms.get(room) || []);
    return socketIds.map(id => this._sockets.get(id)).filter(Boolean) as MockSocketIO[];
  }
}

// Export factory functions for easy mock creation
export function createMockWebSocket(url: string, options?: { latency?: number }): MockWebSocket {
  return new MockWebSocket(url, options);
}

export function createMockSocketIOServer(): MockSocketIOServer {
  return new MockSocketIOServer();
}

export function createMockSocketIOClient(namespace: string = '/'): MockSocketIO {
  return new MockSocketIO(namespace);
}