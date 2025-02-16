import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { prisma } from './prisma';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export const initSocket = (res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected');

      socket.on('join-chat', async (chatId: string, userId: string) => {
        socket.join(chatId);
        
        // Mark messages as read
        await prisma.message.updateMany({
          where: {
            chatId,
            NOT: {
              senderId: userId,
            },
            status: {
              not: 'READ',
            },
          },
          data: {
            status: 'READ',
          },
        });
      });

      socket.on('send-message', async (message) => {
        io.to(message.chatId).emit('new-message', message);
      });

      socket.on('typing', (data) => {
        socket.to(data.chatId).emit('user-typing', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  return res.socket.server.io;
}; 