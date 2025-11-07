/**
 * Simulation API Service
 * Handles all HTTP requests to simulation endpoints
 */

import axiosInstance from './axios.config';
import type {
  CreateSimulationDto,
  SimulationResultDto,
} from '@/types/simulation.types';

export const simulationApi = {
  /**
   * Run a new simulation
   * POST /api/v1/simulation/run
   */
  runSimulation: async (dto: CreateSimulationDto): Promise<SimulationResultDto> => {
    const response = await axiosInstance.post<{
      success: boolean;
      data: SimulationResultDto;
    }>('/simulation/run', dto);
    return response.data.data;
  },

  /**
   * Get simulation result by ID (cached)
   * GET /api/v1/simulation/:id
   */
  getSimulation: async (id: string): Promise<SimulationResultDto> => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: SimulationResultDto;
    }>(`/simulation/${id}`);
    return response.data.data;
  },

  /**
   * Apply simulation (activate result schedule)
   * POST /api/v1/simulation/:id/apply
   */
  applySimulation: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
    }>(`/simulation/${id}/apply`);
    return response.data;
  },

  /**
   * Delete simulation
   * DELETE /api/v1/simulation/:id
   */
  deleteSimulation: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/simulation/${id}`);
  },

  /**
   * Get list of recent simulations (optional endpoint)
   * GET /api/v1/simulation
   */
  listSimulations: async (limit = 10): Promise<SimulationResultDto[]> => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: SimulationResultDto[];
    }>('/simulation', {
      params: { limit },
    });
    return response.data.data || [];
  },
};

export default simulationApi;
