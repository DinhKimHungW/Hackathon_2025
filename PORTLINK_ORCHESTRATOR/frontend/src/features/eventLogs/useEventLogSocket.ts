import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addEventLogRealtime } from './eventLogsSlice';
import type { EventLog } from './eventLogsSlice';
import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useEventLogSocket = () => {
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

    // Join event logs room
    socket.emit('join:event-logs');

    // Event Log Created
    socket.on('event-log:created', (eventLog: EventLog) => {
      console.log('📝 Event log created:', eventLog);
      dispatch(addEventLogRealtime(eventLog));
    });

    // System Error Event (high priority)
    socket.on('event-log:system-error', (eventLog: EventLog) => {
      console.error('🚨 System error logged:', eventLog);
      dispatch(addEventLogRealtime(eventLog));
      
      // Optional: Browser notification for critical errors
      if (eventLog.severity === 'CRITICAL' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('System Error', {
          body: eventLog.description,
          icon: '/error-icon.png',
        });
      }
    });

    // User Activity Event
    socket.on('event-log:user-activity', (eventLog: EventLog) => {
      console.log('👤 User activity:', eventLog);
      dispatch(addEventLogRealtime(eventLog));
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leave:event-logs');
        socket.off('event-log:created');
        socket.off('event-log:system-error');
        socket.off('event-log:user-activity');
        socket.disconnect();
        socket = null;
      }
    };
  }, [access_token, dispatch]);
};

export default useEventLogSocket;
