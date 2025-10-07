import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import 'whatwg-fetch';

let idCounter = 1;
Object.defineProperty(global.crypto, 'randomUUID', {
  value: () => `mock-uuid-${idCounter++}`
});

class MockTextEncoder {
  encode(str: string): Uint8Array {
    return new Uint8Array([...str].map(c => c.charCodeAt(0)));
  }
}

class MockTextDecoder {
  decode(arr: Uint8Array): string {
    return String.fromCharCode(...arr);
  }
}

(global as any).TextEncoder = MockTextEncoder;
(global as any).TextDecoder = MockTextDecoder;

// Mock BroadcastChannel
class MockBroadcastChannel {
  private listeners: { message: ((event: any) => void)[] } = { message: [] };

  constructor(public readonly name: string) {}

  postMessage(message: any) {
    this.listeners.message.forEach(listener => listener({ data: message }));
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (type === 'message') {
      this.listeners.message.push(listener);
    }
  }

  removeEventListener(type: string, listener: (event: any) => void) {
    if (type === 'message') {
      this.listeners.message = this.listeners.message.filter(l => l !== listener);
    }
  }

  close() {
    this.listeners.message = [];
  }
}

// Mock websocket implementation
global.WebSocket = class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) this.onopen({});
    }, 0);
  }

  send(data: any) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose({});
  }
} as any;

global.BroadcastChannel = MockBroadcastChannel as any;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress console.error during tests
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: Could not auto-detect a React renderer.'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};