import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addAssetRealtime, updateAssetRealtime, removeAssetRealtime } from './assetsSlice';
import type { Asset } from './assetsSlice';
import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useAssetSocket = () => {
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

    // Join assets room
    socket.emit('join:assets');

    // Asset Created
    socket.on('asset:created', (asset: Asset) => {
      console.log('📦 Asset created:', asset);
      dispatch(addAssetRealtime(asset));
    });

    // Asset Updated
    socket.on('asset:updated', (asset: Asset) => {
      console.log('🔄 Asset updated:', asset);
      dispatch(updateAssetRealtime(asset));
    });

    // Asset Deleted
    socket.on('asset:deleted', (assetId: string) => {
      console.log('🗑️ Asset deleted:', assetId);
      dispatch(removeAssetRealtime(assetId));
    });

    // Asset Status Changed
    socket.on('asset:status-changed', (data: { assetId: number; status: string; asset: Asset }) => {
      console.log('🔧 Asset status changed:', data);
      dispatch(updateAssetRealtime(data.asset));
    });

    // Asset Maintenance Scheduled
    socket.on('asset:maintenance-scheduled', (data: { assetId: number; maintenanceDate: string; asset: Asset }) => {
      console.log('🛠️ Asset maintenance scheduled:', data);
      dispatch(updateAssetRealtime(data.asset));
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leave:assets');
        socket.off('asset:created');
        socket.off('asset:updated');
        socket.off('asset:deleted');
        socket.off('asset:status-changed');
        socket.off('asset:maintenance-scheduled');
        socket.disconnect();
        socket = null;
      }
    };
  }, [access_token, dispatch]);
};

export default useAssetSocket;
