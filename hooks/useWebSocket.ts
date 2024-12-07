import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/lib/contexts/AuthContext';

export function useWebSocket(onConnectionAccepted: (userId: string) => void) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io({
      path: "/api/socket",
      transports: ["websocket"],
      upgrade: false,
    });

    socketRef.current.emit('join', user.id);

    socketRef.current.on('connection_accepted', (data) => {
      onConnectionAccepted(data.userId);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, onConnectionAccepted]);

  return socketRef.current;
} 