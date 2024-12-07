import { useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '@/lib/contexts/AuthContext';

export function useSocketConnection(onConnectionUpdate: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const socket = io();
    socket.emit('join', user.id);

    socket.on('connection_update', () => {
      onConnectionUpdate();
    });

    return () => {
      socket.disconnect();
    };
  }, [user, onConnectionUpdate]);
}
