import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export function initSocket(server: HttpServer) {
  const io = new Server(server);
  
  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      socket.join(userId);
    });
  });

  return io;
} 