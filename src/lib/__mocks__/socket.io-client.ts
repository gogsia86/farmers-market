import { MockSocketIO, MockSocketIOServer } from './webSocketUtils';

const mockSocketManager = {
  server: new MockSocketIOServer(),
  defaultOptions: {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false,
    path: '/socket.io'
  }
};

function io(uri: string, options: any = {}) {
  const mergedOptions = { ...mockSocketManager.defaultOptions, ...options };
  const socket = mockSocketManager.server.createSocket(options.nsp || '/');
  
  // Set socket properties from options
  socket.handshake = {
    query: options.query || {},
    headers: options.headers || {}
  };

  // Set transport
  socket.transport = {
    name: mergedOptions.transports[0],
    readyState: 'open'
  };

  // Simulate connection
  process.nextTick(() => {
    socket.simulateReconnect();
  });

  return socket;
}

// Export io as both default and named export to match socket.io-client
export default io;
export { io };