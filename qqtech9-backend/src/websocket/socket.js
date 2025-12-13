import { Server } from 'socket.io';
import { config } from '../config/index.js';
import { WebSocketError } from '../utils/errors.js';

let io;

export const initWebSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: { 
            origin: config.CORS_ORIGIN, 
            methods: ['GET', 'POST'] 
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;

};

export const getIO = () => {
  if (!io) {
    throw new WebSocketError('WebSocket not initialized..');
  }
  return io;
};