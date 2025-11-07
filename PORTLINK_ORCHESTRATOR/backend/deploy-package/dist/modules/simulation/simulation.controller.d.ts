import { SimulationService } from './simulation.service';
import { CreateSimulationDto, SimulationResultDto } from './dto/simulation.dto';
interface SimulationRunResponse {
    success: boolean;
    message: string;
    data: SimulationResultDto;
}
interface SimulationListResponse {
    success: boolean;
    data: SimulationResultDto[];
}
interface SimulationActionResponse {
    success: boolean;
    message: string;
}
export declare class SimulationController {
    private readonly simulationService;
    constructor(simulationService: SimulationService);
    runSimulation(dto: CreateSimulationDto): Promise<SimulationRunResponse>;
    runSimulationLegacy(dto: CreateSimulationDto): Promise<SimulationRunResponse>;
    listSimulations(limit?: string): Promise<SimulationListResponse>;
    listSimulationsLegacy(limit?: string): Promise<SimulationListResponse>;
    getSimulationResult(id: string): Promise<{
        success: boolean;
        data: SimulationResultDto;
    }>;
    getSimulationResultLegacy(id: string): Promise<{
        success: boolean;
        data: SimulationResultDto;
    }>;
    applySimulation(id: string): Promise<SimulationActionResponse>;
    applySimulationLegacy(id: string): Promise<SimulationActionResponse>;
    deleteSimulation(id: string): Promise<SimulationActionResponse>;
    deleteSimulationLegacy(id: string): Promise<SimulationActionResponse>;
    private handleRunSimulation;
    private handleListSimulations;
    private handleGetSimulation;
}
export {};
