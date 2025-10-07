import { MockWebSocket, MockSocketIO, createMockWebSocket, createMockSocketIOClient, createMockSocketIOServer } from './webSocketUtils';

describe('WebSocket Error Handling', () => {
  describe('WebSocket Error Scenarios', () => {
    let ws: MockWebSocket;

    beforeEach(() => {
      ws = createMockWebSocket('wss://test.example/quantum-socket', { latency: 10 });
    });

    test('handles connection errors', (done) => {
      ws.on('error', (error: Error) => {
        expect(error.message).toBe('Connection failed');
        
        const stats = ws.getConnectionStats();
        expect(stats.readyState).not.toBe(MockWebSocket.OPEN);
        done();
      });

      ws.simulateError(new Error('Connection failed'));
    });

    test('handles message send during disconnected state', () => {
      ws.simulateDisconnection();
      
      expect(() => {
        ws.send({ data: 'test' });
      }).toThrow('WebSocket is not open');

      const stats = ws.getConnectionStats();
      expect(stats.messageCount).toBe(0);
    });

    test('maintains message history during reconnection', (done) => {
      const messages = [
        { id: 1, data: 'first' },
        { id: 2, data: 'second' }
      ];

      ws.on('open', () => {
        messages.forEach(msg => ws.send(msg));
      });

      let messageCount = 0;
      ws.on('message', () => {
        messageCount++;
        if (messageCount === messages.length) {
          const state = ws.getQuantumState();
          expect(state.messageHistory.length).toBe(messages.length);

          // Simulate disconnection and reconnection
          ws.simulateDisconnection();
          ws.simulateReconnection();

          // Verify message history is preserved
          const newState = ws.getQuantumState();
          expect(newState.messageHistory.length).toBe(messages.length);
          done();
        }
      });
    });

    test('handles rapid connect/disconnect cycles', (done) => {
      const cycles = 5;
      let currentCycle = 0;

      function runCycle() {
        ws.simulateDisconnection();
        ws.simulateReconnection();
        currentCycle++;

        if (currentCycle === cycles) {
          const stats = ws.getConnectionStats();
          expect(stats.connectionAttempts).toBe(cycles + 1); // Initial + cycles
          expect(stats.stateTransitions.length).toBeGreaterThan(cycles * 2);
          done();
        } else {
          setTimeout(runCycle, 10);
        }
      }

      ws.on('open', () => {
        if (currentCycle === 0) {
          runCycle();
        }
      });
    });
  });

  describe('Socket.IO Error Scenarios', () => {
    let socket: MockSocketIO;
    let server: ReturnType<typeof createMockSocketIOServer>;

    beforeEach(() => {
      server = createMockSocketIOServer();
      socket = createMockSocketIOClient('/quantum-error');
    });

    test('handles error events', (done) => {
      socket.on('error', (error: Error) => {
        expect(error.message).toBe('Test error');
        
        const state = socket.getQuantumState();
        expect(state.lastActivity).toBeTruthy();
        done();
      });

      socket.simulateError(new Error('Test error'));
    });

    test('maintains room state during reconnection', (done) => {
      const room = 'error-test-room';
      socket.join(room);

      let disconnected = false;
      socket.on('disconnect', () => {
        disconnected = true;
        const state = socket.getQuantumState();
        expect(state.currentRooms).toContain(room);
      });

      socket.on('connect', () => {
        if (disconnected) {
          const state = socket.getQuantumState();
          expect(state.currentRooms).toContain(room);
          done();
        }
      });

      socket.simulateDisconnect();
      socket.simulateReconnect();
    });

    test('handles messages during disconnected state', () => {
      const room = 'error-test-room';
      socket.join(room);
      socket.simulateDisconnect();

      // Messages should still be tracked even in disconnected state
      socket.emit('test', { data: 'test' });
      
      const state = socket.getQuantumState();
      expect(state.messagesSent).toBe(1);
      expect(state.lastActivity).toBeTruthy();
    });

    test('recovers from server disconnection', (done) => {
      let reconnected = false;
      const socketId = socket.getQuantumState().socketId;

      socket.on('disconnect', () => {
        const state = socket.getQuantumState();
        expect(state.lastActivity).toBeTruthy();
        
        setTimeout(() => {
          // Server reconnects the socket
          const newSocket = server.createSocket('/quantum-error');
          reconnected = true;
          
          const newState = newSocket.getQuantumState();
          expect(newState.socketId).not.toBe(socketId);
          done();
        }, 10);
      });

      // Server disconnects the socket
      server.disconnect(socketId);
    });
  });
});