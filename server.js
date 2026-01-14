/* global global */
// 🧠 DIVINE PATTERN: Custom Next.js Server with Socket.io
// 📚 Reference: Real-time Communication Infrastructure
// 🌾 Domain: WebSocket Server Integration
// ⚡ Performance: Optimized HTTP/WebSocket dual protocol server

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

// Environment configuration
const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3001", 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Socket.io event types
const SocketEvent = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  ERROR: "error",
  JOIN_USER_ROOM: "join-user-room",
  JOIN_ORDER_ROOM: "join-order-room",
  JOIN_FARM_ROOM: "join-farm-room",
  LEAVE_ROOM: "leave-room",
  ORDER_UPDATE: "order-update",
  ORDER_STATUS_CHANGE: "order-status-change",
  NOTIFICATION: "notification",
  FARM_UPDATE: "farm-update",
  PRODUCT_UPDATE: "product-update",
  SEASONAL_UPDATE: "seasonal-update",
  HARVEST_ALERT: "harvest-alert",
};

// Global Socket.io instance
let io = null;

// Logger helper
const log = {
  info: (message, data = {}) => {
    console.log(
      `[INFO] ${message}`,
      data.data ? JSON.stringify(data.data) : "",
    );
  },
  warn: (message, data = {}) => {
    console.warn(
      `[WARN] ${message}`,
      data.data ? JSON.stringify(data.data) : "",
    );
  },
  error: (message, data = {}) => {
    console.error(
      `[ERROR] ${message}`,
      data.data ? JSON.stringify(data.data) : "",
    );
  },
};

/**
 * Initialize Socket.io server with agricultural consciousness
 */
function initializeSocketIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6, // 1MB
    allowEIO3: true, // Support older clients
  });

  // Connection handler
  io.on(SocketEvent.CONNECTION, (socket) => {
    log.info("🌾 Client connected:", { data: socket.id });

    // Agricultural consciousness metadata
    socket.data.agriculturalConsciousness = "active";
    socket.data.connectedAt = new Date().toISOString();

    // Join user room
    socket.on(SocketEvent.JOIN_USER_ROOM, (userId) => {
      if (!userId) {
        socket.emit(SocketEvent.ERROR, { message: "User ID required" });
        return;
      }

      const roomName = `user:${userId}`;
      socket.join(roomName);
      socket.data.userId = userId;

      log.info(`🌾 User ${userId} joined room: ${roomName}`);
      socket.emit("room-joined", { room: roomName, userId, success: true });
    });

    // Join order room
    socket.on(SocketEvent.JOIN_ORDER_ROOM, (orderId) => {
      if (!orderId) {
        socket.emit(SocketEvent.ERROR, { message: "Order ID required" });
        return;
      }

      const roomName = `order:${orderId}`;
      socket.join(roomName);

      log.info(`📦 Joined order room: ${roomName}`);
      socket.emit("room-joined", { room: roomName, orderId, success: true });
    });

    // Join farm room
    socket.on(SocketEvent.JOIN_FARM_ROOM, (farmId) => {
      if (!farmId) {
        socket.emit(SocketEvent.ERROR, { message: "Farm ID required" });
        return;
      }

      const roomName = `farm:${farmId}`;
      socket.join(roomName);

      log.info(`🌾 Joined farm room: ${roomName}`);
      socket.emit("room-joined", { room: roomName, farmId, success: true });
    });

    // Leave room
    socket.on(SocketEvent.LEAVE_ROOM, (roomName) => {
      socket.leave(roomName);
      log.info(`👋 Left room: ${roomName}`);
      socket.emit("room-left", { room: roomName, success: true });
    });

    // Disconnect handler
    socket.on(SocketEvent.DISCONNECT, (reason) => {
      log.info(`🌾 Client disconnected: ${socket.id} (${reason})`);
    });

    // Error handler
    socket.on(SocketEvent.ERROR, (error) => {
      log.error("⚠️ Socket error:", {
        data: error instanceof Error ? error.message : String(error),
      });
    });

    // Send welcome message
    socket.emit("connected", {
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      agriculturalConsciousness: "active",
      message: "🌾 Welcome to Farmers Market Platform",
    });
  });

  log.info("⚡ Socket.io server initialized with agricultural consciousness");
  log.info(`🌾 Socket.io listening on: ws://localhost:${port}`);

  return io;
}

/**
 * Export Socket.io emitter functions for use in API routes
 */
function getSocketIO() {
  return io;
}

// Make Socket.io available globally
global.io = null;
global.getSocketIO = getSocketIO;

/**
 * Start the server
 */
app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  // Initialize Socket.io
  const socketIO = initializeSocketIO(httpServer);
  global.io = socketIO;

  // Start listening
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(
      "\n🌾 ═══════════════════════════════════════════════════════════",
    );
    console.log("🌾 Farmers Market Platform - Divine Agricultural Server");
    console.log(
      "🌾 ═══════════════════════════════════════════════════════════",
    );
    console.log(`🌾 Next.js ready on: http://${hostname}:${port}`);
    console.log(`⚡ Socket.io ready on: ws://${hostname}:${port}`);
    console.log(`🌾 Environment: ${dev ? "DEVELOPMENT" : "PRODUCTION"}`);
    console.log(`⚡ Agricultural Consciousness: ACTIVE`);
    console.log(
      "🌾 ═══════════════════════════════════════════════════════════\n",
    );
  });

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    console.log(`\n🌾 Received ${signal}, closing server gracefully...`);

    // Close Socket.io connections
    if (io) {
      io.close(() => {
        console.log("⚡ Socket.io connections closed");
      });
    }

    // Close HTTP server
    httpServer.close(() => {
      console.log("🌾 HTTP server closed");
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error("⚠️ Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
});
