import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket && typeof window !== 'undefined') {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (s && !s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const joinExecution = (executionId) => {
  const s = getSocket();
  if (s?.connected) {
    s.emit('join:execution', executionId);
  }
};

export const leaveExecution = (executionId) => {
  const s = getSocket();
  if (s?.connected) {
    s.emit('leave:execution', executionId);
  }
};

export const joinUser = (userId) => {
  const s = getSocket();
  if (s?.connected) {
    s.emit('join:user', userId);
  }
};

export default { getSocket, connectSocket, disconnectSocket, joinExecution, leaveExecution, joinUser };
