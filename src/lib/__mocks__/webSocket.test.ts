import { jest } from '@jest/globals';
import { MockWebSocket, MockSocketIO, MockSocketIOServer, createMockSocketIOServer } from '../__mocks__/webSocketUtils';

describe('WebSocket Mock Implementation', () => {
  describe('MockWebSocket', () => {
    let ws: MockWebSocket;

    beforeEach(() => {
      ws = new MockWebSocket('wss://test.example/socket');
    });

    test('establishes connection with quantum state tracking', (done) => {
      ws.on('open', () => {
        const state = ws.getQuantumState();
        expect(state.connectionAttempts).toBe(1);
        expect(state.lastConnected).toBeTruthy();
        done();
      });
    });

    test('handles message sending with quantum awareness', (done) => {
      const testData = { type: 'test', value: 42 };
      
      ws.on('open', () => {
        ws.on('message', (message) => {
          expect(message.data).toEqual(testData);
          expect(message.quantumId).toBeTruthy();
          expect(message.timestamp).toBeLessThanOrEqual(Date.now());
          done();
        });

        ws.send(testData);
      });
    });

    test('tracks state transitions correctly', (done) => {
      ws.on('close', () => {
        const state = ws.getQuantumState();
        expect(state.stateTransitions).toHaveLength(3); // CONNECTING -> OPEN -> CLOSING -> CLOSED
        expect(state.stateTransitions[0].to).toBe(MockWebSocket.CONNECTING);
        expect(state.stateTransitions[1].to).toBe(MockWebSocket.OPEN);
        expect(state.stateTransitions[2].to).toBe(MockWebSocket.CLOSED);
        done();
      });

      ws.on('open', () => ws.close());
    });
  });

  describe('MockSocketIO', () => {
    let socket: MockSocketIO;

    beforeEach(() => {
      socket = new MockSocketIO('/test');
    });

    test('manages rooms with quantum state tracking', () => {
      socket.join('room1');
      socket.join('room2');
      
      const state = socket.getQuantumState();
      expect(state.currentRooms).toContain('room1');
      expect(state.currentRooms).toContain('room2');
      expect(state.roomHistory).toHaveLength(2);
      expect(state.roomHistory[0].action).toBe('join');
    });

    test('handles message emission with quantum tracking', (done) => {
      const testEvent = 'test-event';
      const testData = { value: 42 };

      socket.on(testEvent, (data) => {
        expect(data).toEqual(testData);
        const state = socket.getQuantumState();
        expect(state.messagesSent).toBe(1);
        expect(state.messagesReceived).toBe(1);
        done();
      });

      socket.emit(testEvent, testData);
    });

    test('tracks room-specific messages', (done) => {
      socket.join('test-room');
      
      socket.on('room-event', (data) => {
        expect(data.value).toBe(42);
        const state = socket.getQuantumState();
        expect(state.messagesSent).toBe(1);
        done();
      });

      socket.to('test-room').emit('room-event', { value: 42 });
    });
  });

  describe('MockSocketIOServer', () => {
    let server: MockSocketIOServer;

    beforeEach(() => {
      server = new MockSocketIOServer();
    });

    test('handles socket connections with quantum awareness', () => {
      const socket1 = server.createSocket('/ns1');
      const socket2 = server.createSocket('/ns2');

      expect(server.getConnectedSockets()).toHaveLength(2);
      expect(server.getNamespaceSockets('/ns1')).toHaveLength(1);
      expect(server.getNamespaceSockets('/ns2')).toHaveLength(1);
    });

    test('manages room broadcasts', (done) => {
      const socket1 = server.createSocket();
      const socket2 = server.createSocket();
      const testRoom = 'test-room';

      socket1.join(testRoom);
      socket2.join(testRoom);

      let receivedCount = 0;
      const handler = () => {
        receivedCount++;
        if (receivedCount === 2) done();
      };

      socket1.on('broadcast', handler);
      socket2.on('broadcast', handler);

      server.to(testRoom).emit('broadcast', { value: 'test' });
    });
  });

  describe('SocketIO Server', () => {
    test('handles disconnection and reconnection', (done) => {
      const server = createMockSocketIOServer();
      const socket = server.createSocket('/test');
      let reconnectAttempts = 0;

      socket.on('disconnect', () => {
        const connectedSockets = server.getConnectedSockets();
        expect(connectedSockets.length).toBe(0);
        
        if (reconnectAttempts === 1) {
          done();
        } else {
          reconnectAttempts++;
          const newSocket = server.createSocket('/test');
          expect(server.getNamespaceSockets('/test').length).toBe(1);
          server.disconnect(newSocket.id);
        }
      });

      server.disconnect(socket.id);
    });

    test('maintains socket tracking across namespaces', () => {
      const server = createMockSocketIOServer();
      const socket1 = server.createSocket('/ns1');
      const socket2 = server.createSocket('/ns2');

      expect(server.getConnectedSockets()).toHaveLength(2);
      expect(server.getNamespaceSockets('/ns1')).toHaveLength(1);
      expect(server.getNamespaceSockets('/ns2')).toHaveLength(1);

      // Test disconnection cleanup
      server.disconnect(socket1.id);
      expect(server.getConnectedSockets()).toHaveLength(1);
      expect(server.getNamespaceSockets('/ns1')).toHaveLength(0);
      expect(server.getNamespaceSockets('/ns2')).toHaveLength(1);
    });
  });
});