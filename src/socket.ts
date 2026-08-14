import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from './config/env';

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'destructive';
  timestamp: string;
  link?: string;
}

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

export const emitNotification = (
  payload: Omit<NotificationPayload, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
) => {
  if (!io) return;

  const fullPayload: NotificationPayload = {
    id: payload.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: payload.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ...payload,
  };

  io.emit('notification:new', fullPayload);
};
