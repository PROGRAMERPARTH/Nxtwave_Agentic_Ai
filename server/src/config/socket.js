const { Server } = require('socket.io');
const config = require('./env');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join execution-specific rooms for targeted event broadcasting
    socket.on('join:execution', (executionId) => {
      socket.join(`execution:${executionId}`);
      console.log(`📡 Socket ${socket.id} joined execution:${executionId}`);
    });

    socket.on('leave:execution', (executionId) => {
      socket.leave(`execution:${executionId}`);
    });

    // Join user-specific room for notifications
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`📡 Socket ${socket.id} joined user:${userId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket(httpServer) first.');
  }
  return io;
};

// Emit an event to all clients subscribed to a specific execution
const emitExecutionEvent = (executionId, event, data) => {
  if (io) {
    io.to(`execution:${executionId}`).emit(event, { executionId, ...data });
  }
};

// Emit a notification to a specific user
const emitUserNotification = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', notification);
  }
};

module.exports = { initSocket, getIO, emitExecutionEvent, emitUserNotification };
