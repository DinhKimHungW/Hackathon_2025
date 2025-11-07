import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addScheduleRealtime,
  updateScheduleRealtime,
  removeScheduleRealtime,
} from './schedulesSlice';
import type { Schedule } from './types/index';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Custom hook for WebSocket real-time schedule updates
 * Connects to Socket.IO server and listens for schedule events
 * Automatically dispatches Redux actions when events are received
 */
export const useScheduleSocket = () => {
  const dispatch = useAppDispatch();
  const { access_token } = useAppSelector((state) => state.auth);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!access_token) {
      console.log('[ScheduleSocket] No token, skipping connection');
      return;
    }

    console.log('[ScheduleSocket] Initializing connection to:', SOCKET_URL);

    // Initialize socket connection with authentication
    const socket = io(SOCKET_URL, {
      auth: {
        token: access_token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('[ScheduleSocket] Connected successfully. Socket ID:', socket.id);
      
      // Join schedule room for real-time updates
      socket.emit('join:schedules');
    });

    socket.on('connect_error', (error) => {
      console.error('[ScheduleSocket] Connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[ScheduleSocket] Disconnected. Reason:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, manually reconnect
        socket.connect();
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[ScheduleSocket] Reconnected after', attemptNumber, 'attempts');
      
      // Rejoin schedule room after reconnection
      socket.emit('join:schedules');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[ScheduleSocket] Reconnection attempt', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('[ScheduleSocket] Reconnection error:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('[ScheduleSocket] Reconnection failed after all attempts');
    });

    // ==================== SCHEDULE EVENT HANDLERS ====================

    /**
     * Handle new schedule created
     */
    socket.on('schedule:created', (schedule: Schedule) => {
      console.log('[ScheduleSocket] Schedule created:', schedule.id, schedule.name);
      dispatch(addScheduleRealtime(schedule));
    });

    /**
     * Handle schedule updated
     */
    socket.on('schedule:updated', (schedule: Schedule) => {
      console.log('[ScheduleSocket] Schedule updated:', schedule.id, schedule.name);
      dispatch(updateScheduleRealtime(schedule));
    });

    /**
     * Handle schedule deleted
     */
    socket.on('schedule:deleted', (data: { id: string }) => {
      console.log('[ScheduleSocket] Schedule deleted:', data.id);
      dispatch(removeScheduleRealtime(data.id));
    });

    /**
     * Handle schedule started
     */
    socket.on('schedule:started', (schedule: Schedule) => {
      console.log('[ScheduleSocket] Schedule started:', schedule.id, schedule.name);
      dispatch(updateScheduleRealtime(schedule));
    });

    /**
     * Handle schedule completed
     */
    socket.on('schedule:completed', (schedule: Schedule) => {
      console.log('[ScheduleSocket] Schedule completed:', schedule.id, schedule.name);
      dispatch(updateScheduleRealtime(schedule));
    });

    /**
     * Handle schedule cancelled
     */
    socket.on('schedule:cancelled', (schedule: Schedule) => {
      console.log('[ScheduleSocket] Schedule cancelled:', schedule.id, schedule.name);
      dispatch(updateScheduleRealtime(schedule));
    });

    /**
     * Handle bulk schedule updates (e.g., after recurrence generation)
     */
    socket.on('schedules:bulk-update', (schedules: Schedule[]) => {
      console.log('[ScheduleSocket] Bulk update:', schedules.length, 'schedules');
      schedules.forEach((schedule) => {
        dispatch(updateScheduleRealtime(schedule));
      });
    });

    /**
     * Handle error events from server
     */
    socket.on('error', (error: { message: string; code?: string }) => {
      console.error('[ScheduleSocket] Server error:', error.message, error.code);
    });

    // Cleanup function
    return () => {
      console.log('[ScheduleSocket] Cleaning up connection');
      
      if (socketRef.current) {
        // Leave schedule room before disconnecting
        socketRef.current.emit('leave:schedules');
        
        // Remove all event listeners
        socketRef.current.off('connect');
        socketRef.current.off('connect_error');
        socketRef.current.off('disconnect');
        socketRef.current.off('reconnect');
        socketRef.current.off('reconnect_attempt');
        socketRef.current.off('reconnect_error');
        socketRef.current.off('reconnect_failed');
        socketRef.current.off('schedule:created');
        socketRef.current.off('schedule:updated');
        socketRef.current.off('schedule:deleted');
        socketRef.current.off('schedule:started');
        socketRef.current.off('schedule:completed');
        socketRef.current.off('schedule:cancelled');
        socketRef.current.off('schedules:bulk-update');
        socketRef.current.off('error');
        
        // Disconnect socket
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [access_token, dispatch]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
  };
};

/**
 * Hook to emit schedule events to server
 * Use this for client-initiated actions that need to be broadcast
 */
export const useScheduleEmit = () => {
  const socketRef = useRef<Socket | null>(null);
  const { access_token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (access_token) {
      socketRef.current = io(SOCKET_URL, {
        auth: { token: access_token },
        transports: ['websocket', 'polling'],
      });
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [access_token]);

  const emitScheduleAction = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      console.log('[ScheduleEmit] Emitting event:', event, data);
      socketRef.current.emit(event, data);
    } else {
      console.warn('[ScheduleEmit] Socket not connected, cannot emit:', event);
    }
  };

  return {
    emitScheduleAction,
  };
};
