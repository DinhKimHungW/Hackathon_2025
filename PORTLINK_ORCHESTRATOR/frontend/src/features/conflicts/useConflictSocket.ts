import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addConflictRealtime, updateConflictRealtime, removeConflictRealtime } from './conflictsSlice';
import type { Conflict } from './conflictsSlice';
import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useConflictSocket = () => {
  const dispatch = useAppDispatch();
  const { access_token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!access_token) {
      return;
    }

    // Connect to WebSocket
    socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
      auth: { token: access_token },
      transports: ['websocket'],
    });

    // Join conflicts room
    socket.emit('join:conflicts');

    // Conflict Created
    socket.on('conflict:created', (conflict: Conflict) => {
      console.log('⚠️ Conflict created:', conflict);
      dispatch(addConflictRealtime(conflict));
    });

    // Conflict Updated
    socket.on('conflict:updated', (conflict: Conflict) => {
      console.log('🔄 Conflict updated:', conflict);
      dispatch(updateConflictRealtime(conflict));
    });

    // Conflict Resolved
    socket.on('conflict:resolved', (conflict: Conflict) => {
      console.log('✅ Conflict resolved:', conflict);
      dispatch(updateConflictRealtime(conflict));
    });

    // Conflict Deleted
    socket.on('conflict:deleted', (conflictId: string) => {
      console.log('🗑️ Conflict deleted:', conflictId);
      dispatch(removeConflictRealtime(conflictId));
    });

    // Critical Conflict Alert
    socket.on('conflict:critical', (conflict: Conflict) => {
      console.log('🚨 CRITICAL CONFLICT:', conflict);
      dispatch(addConflictRealtime(conflict));
      // Could trigger browser notification here
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Critical Conflict Detected!', {
          body: conflict.description,
          icon: '/alert-icon.png',
        });
      }
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leave:conflicts');
        socket.off('conflict:created');
        socket.off('conflict:updated');
        socket.off('conflict:resolved');
        socket.off('conflict:deleted');
        socket.off('conflict:critical');
        socket.disconnect();
        socket = null;
      }
    };
  }, [access_token, dispatch]);
};

export default useConflictSocket;
