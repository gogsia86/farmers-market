import { MockWebSocket, MockSocketIO, createMockWebSocket, createMockSocketIOClient } from './webSocketUtils';

describe('WebSocket Connection Lifecycle', () => {
  describe('WebSocket Connection States', () => {
    let ws: MockWebSocket;

    beforeEach(() => {
      ws = createMockWebSocket('wss://test.example/quantum-socket', { latency: 10 });
    });

    test('transitions through connection states correctly', (done) => {
      expect(ws.getConnectionStats().readyState).toBe(MockWebSocket.CONNECTING);

      ws.on('open', () => {
        expect(ws.getConnectionStats().readyState).toBe(MockWebSocket.OPEN);
        
        ws.close(1000, 'Normal closure');
      });

      ws.on('close', (event: { code: number; reason?: string }) => {
        expect(ws.getConnectionStats().readyState).toBe(MockWebSocket.CLOSED);
        expect(event.code).toBe(1000);
        expect(event.reason).toBe('Normal closure');
        done();
      });
    });

    test('tracks connection attempts and history', (done) => {
      ws.on('open', () => {
        const stats = ws.getConnectionStats();
        expect(stats.connectionAttempts).toBe(1);
        expect(stats.lastConnected).toBeTruthy();
        
        // Simulate disconnection and reconnection
        ws.simulateDisconnection();
        ws.simulateReconnection();
      });

      let reconnectCount = 0;
      ws.on('close', () => {
        const stats = ws.getConnectionStats();
        expect(stats.readyState).toBe(MockWebSocket.CLOSED);
        
        if (reconnectCount === 0) {
          reconnectCount++;
        } else {
          expect(stats.connectionAttempts).toBe(2);
          done();
        }
      });
    });

    test('maintains state transitions history', (done) => {
      ws.on('open', () => {
        const state = ws.getQuantumState();
        expect(state.stateTransitions.length).toBe(2); // CONNECTING -> OPEN
        expect(state.stateTransitions[0].from).toBe(MockWebSocket.CLOSED);
        expect(state.stateTransitions[0].to).toBe(MockWebSocket.CONNECTING);
        expect(state.stateTransitions[1].from).toBe(MockWebSocket.CONNECTING);
        expect(state.stateTransitions[1].to).toBe(MockWebSocket.OPEN);
        done();
      });
    });
  });

  describe('Socket.IO Connection States', () => {
    let socket: MockSocketIO;

    beforeEach(() => {
      socket = createMockSocketIOClient('/quantum');
    });

    test('tracks connection state and activity', (done) => {
      const state = socket.getQuantumState();
      expect(state.joinedAt).toBeTruthy();
      expect(state.lastActivity).toBeTruthy();
      expect(state.messagesSent).toBe(0);
      expect(state.messagesReceived).toBe(0);

      socket.emit('test', { data: 'test' });
      
      const updatedState = socket.getQuantumState();
      expect(updatedState.messagesSent).toBe(1);
      expect(updatedState.lastActivity).toBeGreaterThan(state.lastActivity);
      done();
    });

    test('handles room management correctly', () => {
      const room1 = 'room1';
      const room2 = 'room2';

      socket.join(room1);
      socket.join(room2);

      const state = socket.getQuantumState();
      expect(state.currentRooms).toContain(room1);
      expect(state.currentRooms).toContain(room2);
      expect(state.roomHistory.length).toBe(2);

      socket.leave(room1);
      
      const updatedState = socket.getQuantumState();
      expect(updatedState.currentRooms).not.toContain(room1);
      expect(updatedState.currentRooms).toContain(room2);
      expect(updatedState.roomHistory.length).toBe(3); // 2 joins + 1 leave
    });

    test('maintains connection throughout lifecycle events', (done) => {
      let eventCount = 0;
      const expectedEvents = 2; // disconnect + reconnect

      socket.on('disconnect', (data: { reason: string }) => {
        expect(data.reason).toBe('client disconnect');
        eventCount++;
        checkDone();
      });

      socket.on('connect', (data: { timestamp: number }) => {
        expect(data.timestamp).toBeTruthy();
        eventCount++;
        checkDone();
      });

      socket.simulateDisconnect();
      socket.simulateReconnect();

      function checkDone() {
        if (eventCount === expectedEvents) {
          done();
        }
      }
    });
  });
});