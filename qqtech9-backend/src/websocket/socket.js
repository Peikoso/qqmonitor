import { Server } from 'socket.io';
import { config } from '../config/index.js';
import { WebSocketError } from '../utils/errors.js';
import { AuthService } from '../services/auth.js';

let io;

export const initWebSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: { 
            origin: config.CORS_ORIGIN, 
            methods: ['GET', 'POST'] 
        }
    });

    io.on('connection', async (socket) => {
        try{
            const token = socket.handshake.auth.token;
            const decodedUser = await AuthService.verifyToken(token);
            const userId = decodedUser.uid;
    
            if(!userId){
                throw new WebSocketError('Authentication failed.');
            }
    
            socket.join(`user_${userId}`);
            console.log('User connected to room:', `user_${userId}`);

        } catch(error){
            console.error('Error during socket authentication:', error.message);
            socket.disconnect();
        }

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