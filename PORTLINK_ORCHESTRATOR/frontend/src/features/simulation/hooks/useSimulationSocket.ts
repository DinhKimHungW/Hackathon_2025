/**
 * Simulation WebSocket Hook
 * Listens to simulation events and updates Redux state
 */

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from '@/store/hooks';
import {
  updateProgress,
  resetProgress,
  addToRecentSimulations,
} from '../simulationSlice';
import { SimulationStatus, type SimulationResultDto } from '@/types/simulation.types';

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || import.meta.env.VITE_WS_URL || '';
const WEBSOCKET_PATH = import.meta.env.VITE_WEBSOCKET_PATH || '/socket.io';

export const useSimulationSocket = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!WEBSOCKET_URL) {
      console.warn('Simulation WebSocket URL is not configured. Skipping real-time updates.');
      return undefined;
    }

    // Create socket connection
    const socket: Socket = io(WEBSOCKET_URL, {
      path: WEBSOCKET_PATH,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    // Connection handlers
    socket.on('connect', () => {
      console.log('✅ Simulation WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('❌ Simulation WebSocket disconnected');
      dispatch(resetProgress());
    });

    socket.on('connect_error', (error) => {
      console.error('Simulation WebSocket connection error:', error);
    });

    // Simulation event handlers
    socket.on('simulation:started', (data: { name: string; scenarioType: string; timestamp: Date }) => {
      console.log('🚀 Simulation started:', data);
      dispatch(
        updateProgress({
          status: SimulationStatus.RUNNING,
          message: `Running simulation "${data.name}"...`,
        })
      );
    });

    socket.on('simulation:completed', (result: SimulationResultDto) => {
      console.log('✅ Simulation completed:', result);
      dispatch(
        updateProgress({
          status: SimulationStatus.COMPLETED,
          message: `Simulation "${result.name}" completed in ${result.executionTimeMs}ms`,
        })
      );
      
      // Add to recent simulations
      dispatch(addToRecentSimulations(result));

      // Reset progress after 5 seconds
      setTimeout(() => {
        dispatch(resetProgress());
      }, 5000);
    });

    socket.on('simulation:failed', (data: { name: string; error: string; timestamp: Date }) => {
      console.error('❌ Simulation failed:', data);
      dispatch(
        updateProgress({
          status: SimulationStatus.FAILED,
          message: `Simulation "${data.name}" failed: ${data.error}`,
        })
      );

      // Reset progress after 10 seconds
      setTimeout(() => {
        dispatch(resetProgress());
      }, 10000);
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting Simulation WebSocket');
      socket.disconnect();
    };
  }, [dispatch]);
};
