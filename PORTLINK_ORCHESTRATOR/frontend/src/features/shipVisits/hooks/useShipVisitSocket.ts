import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import {
  addShipVisit,
  updateShipVisitRealtime,
  removeShipVisit,
} from '../shipVisitsSlice';
import type { ShipVisit } from '../shipVisitsSlice';
import { useSnackbar } from 'notistack';
import { io, Socket } from 'socket.io-client';

// ============================================================================
// SOCKET.IO HOOK FOR SHIP VISITS
// ============================================================================

interface UseShipVisitSocketOptions {
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

const SOCKET_URL = 'http://localhost:3000'; // Socket.IO connects directly to backend port
const SOCKET_NAMESPACE = '/ws'; // Backend WebSocket namespace

export const useShipVisitSocket = (options: UseShipVisitSocketOptions = {}) => {
  const {
    enabled = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Handle ship visit created event
  const handleShipVisitCreated = useCallback(
    (data: ShipVisit) => {
      console.log('Ship visit created:', data);
      dispatch(addShipVisit(data));
      enqueueSnackbar(`New ship visit: ${data.shipName}`, {
        variant: 'info',
        autoHideDuration: 3000,
      });
    },
    [dispatch, enqueueSnackbar]
  );

  // Handle ship visit updated event
  const handleShipVisitUpdated = useCallback(
    (data: ShipVisit) => {
      console.log('Ship visit updated:', data);
      dispatch(updateShipVisitRealtime(data));
      enqueueSnackbar(`Ship visit updated: ${data.shipName}`, {
        variant: 'success',
        autoHideDuration: 3000,
      });
    },
    [dispatch, enqueueSnackbar]
  );

  // Handle ship visit status changed event
  const handleShipVisitStatusChanged = useCallback(
    (data: ShipVisit) => {
      console.log('Ship visit status changed:', data);
      dispatch(updateShipVisitRealtime(data));
      enqueueSnackbar(`${data.shipName} status: ${data.status}`, {
        variant: 'warning',
        autoHideDuration: 4000,
      });
    },
    [dispatch, enqueueSnackbar]
  );

  // Handle ship visit arrival event
  const handleShipVisitArrival = useCallback(
    (data: ShipVisit) => {
      console.log('Ship visit arrival:', data);
      dispatch(updateShipVisitRealtime(data));
      enqueueSnackbar(`${data.shipName} has arrived!`, {
        variant: 'success',
        autoHideDuration: 5000,
      });
    },
    [dispatch, enqueueSnackbar]
  );

  // Handle ship visit departure event
  const handleShipVisitDeparture = useCallback(
    (data: ShipVisit) => {
      console.log('Ship visit departure:', data);
      dispatch(updateShipVisitRealtime(data));
      enqueueSnackbar(`${data.shipName} has departed`, {
        variant: 'info',
        autoHideDuration: 5000,
      });
    },
    [dispatch, enqueueSnackbar]
  );

  // Handle ship visit deleted event
  const handleShipVisitDeleted = useCallback(
    (data: { id: string }) => {
      console.log('Ship visit deleted:', data);
      dispatch(removeShipVisit(data.id));
      enqueueSnackbar('Ship visit deleted', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    },
    [dispatch, enqueueSnackbar]
  );

  // Connect to Socket.IO
  const connect = useCallback(() => {
    if (!enabled || socketRef.current?.connected) return;

    console.log(`Connecting to Socket.IO namespace: ${SOCKET_URL}${SOCKET_NAMESPACE}`);

    // Socket.IO connection with namespace in URL
    // Backend: @WebSocketGateway({ namespace: '/ws' })
    // Frontend: io('http://localhost:3000/ws') connects to /ws namespace
    const socket = io(`${SOCKET_URL}${SOCKET_NAMESPACE}`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: 5,
      // Don't override path - use default /socket.io
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
      setIsConnected(true);
      onConnect?.();
      
      enqueueSnackbar('Live updates connected', {
        variant: 'success',
        autoHideDuration: 2000,
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      setIsConnected(false);
      onDisconnect?.();
      
      enqueueSnackbar('Live updates disconnected', {
        variant: 'warning',
        autoHideDuration: 3000,
      });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setIsConnected(false);
      onError?.(error);
    });

    // Ship visit event listeners
    socket.on('ship-visit:created', handleShipVisitCreated);
    socket.on('ship-visit:updated', handleShipVisitUpdated);
    socket.on('ship-visit:status-changed', handleShipVisitStatusChanged);
    socket.on('ship-visit:arrival', handleShipVisitArrival);
    socket.on('ship-visit:departure', handleShipVisitDeparture);
    socket.on('ship-visit:deleted', handleShipVisitDeleted);

    // Backend sends a welcome message on connection
    socket.on('connection', (data) => {
      console.log('Connection message:', data);
    });

  }, [
    enabled,
    onConnect,
    onDisconnect,
    onError,
    handleShipVisitCreated,
    handleShipVisitUpdated,
    handleShipVisitStatusChanged,
    handleShipVisitArrival,
    handleShipVisitDeparture,
    handleShipVisitDeleted,
    enqueueSnackbar,
  ]);

  // Disconnect from Socket.IO
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting Socket.IO...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Send message to Socket.IO server
  const sendMessage = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      console.log(`Sent message: ${event}`, data);
    } else {
      console.warn('Socket.IO not connected, cannot send message');
    }
  }, []);

  // Effect: Connect/disconnect based on enabled option
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
};
