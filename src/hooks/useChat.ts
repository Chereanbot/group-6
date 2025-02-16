import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export function useChat(chatId: string | null, userId: string) {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const socketInstance = io();
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('user-typing', (data) => {
      if (data.userId !== userId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && chatId) {
      socket.emit('join-chat', chatId, userId);
    }
  }, [socket, chatId, userId]);

  const sendMessage = (message: any) => {
    if (socket) {
      socket.emit('send-message', message);
    }
  };

  const emitTyping = (chatId: string) => {
    if (socket) {
      socket.emit('typing', { chatId, userId });
    }
  };

  return { sendMessage, emitTyping, isTyping, isConnected };
} 