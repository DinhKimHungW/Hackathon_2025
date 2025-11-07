import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface PortMapUpdate {
  type: 'berth' | 'ship' | 'crane';
  action: 'update' | 'add' | 'remove';
  data: any;
}

interface UsePortMapSocketOptions {
  onBerthUpdate?: (berth: any) => void;
  onShipUpdate?: (ship: any) => void;
  onCraneUpdate?: (crane: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export const usePortMapSocket = (options: UsePortMapSocketOptions = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const {
    onBerthUpdate,
    onShipUpdate,
    onCraneUpdate,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Port Map WebSocket connected');
      
      // Join port-map room
      socket.emit('join-room', 'port-map');
      
      onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log('❌ Port Map WebSocket disconnected');
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      onError?.(error);
    });

    // Port map update events
    socket.on('berth:updated', (data) => {
      console.log('🚢 Berth updated:', data);
      onBerthUpdate?.(data);
    });

    socket.on('berth:status-changed', (data) => {
      console.log('🔄 Berth status changed:', data);
      onBerthUpdate?.(data);
    });

    socket.on('ship:moved', (data) => {
      console.log('🚢 Ship moved:', data);
      onShipUpdate?.(data);
    });

    socket.on('ship:arrived', (data) => {
      console.log('⚓ Ship arrived:', data);
      onShipUpdate?.(data);
    });

    socket.on('ship:departed', (data) => {
      console.log('🌊 Ship departed:', data);
      onShipUpdate?.(data);
    });

    socket.on('crane:updated', (data) => {
      console.log('🏗️ Crane updated:', data);
      onCraneUpdate?.(data);
    });

    socket.on('crane:status-changed', (data) => {
      console.log('🔧 Crane status changed:', data);
      onCraneUpdate?.(data);
    });

    socket.on('crane:task-assigned', (data) => {
      console.log('📋 Crane task assigned:', data);
      onCraneUpdate?.(data);
    });

    // Cleanup on unmount
    return () => {
      socket.emit('leave-room', 'port-map');
      socket.disconnect();
    };
  }, [onBerthUpdate, onShipUpdate, onCraneUpdate, onConnect, onDisconnect, onError]);

  // Manually emit events
  const emitBerthUpdate = (berthId: string, data: any) => {
    socketRef.current?.emit('berth:update', { berthId, ...data });
  };

  const emitShipUpdate = (shipId: string, data: any) => {
    socketRef.current?.emit('ship:update', { shipId, ...data });
  };

  const emitCraneUpdate = (craneId: string, data: any) => {
    socketRef.current?.emit('crane:update', { craneId, ...data });
  };

  return {
    socket: socketRef.current,
    emitBerthUpdate,
    emitShipUpdate,
    emitCraneUpdate,
    isConnected: socketRef.current?.connected || false,
  };
};
