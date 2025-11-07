import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { CreateSimulationDto, SimulationResultDto } from './dto/simulation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

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

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  // ====== Run Simulation ======

  @Post('simulations')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  async runSimulation(@Body() dto: CreateSimulationDto): Promise<SimulationRunResponse> {
    return this.handleRunSimulation(dto);
  }

  @Post('simulation/run')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  async runSimulationLegacy(@Body() dto: CreateSimulationDto): Promise<SimulationRunResponse> {
    return this.handleRunSimulation(dto);
  }

  // ====== List Simulations ======

  @Get('simulation')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  async listSimulations(@Query('limit') limit?: string): Promise<SimulationListResponse> {
    return this.handleListSimulations(limit);
  }

  @Get('simulations')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  async listSimulationsLegacy(@Query('limit') limit?: string): Promise<SimulationListResponse> {
    return this.handleListSimulations(limit);
  }

  // ====== Get Simulation Result ======

  @Get('simulation/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  async getSimulationResult(@Param('id') id: string): Promise<{ success: boolean; data: SimulationResultDto }> {
    return this.handleGetSimulation(id);
  }

  @Get('simulations/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  async getSimulationResultLegacy(@Param('id') id: string): Promise<{ success: boolean; data: SimulationResultDto }> {
    return this.handleGetSimulation(id);
  }

  // ====== Apply Simulation ======

  @Post('simulation/:id/apply')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async applySimulation(@Param('id') id: string): Promise<SimulationActionResponse> {
    return this.simulationService.applySimulation(id);
  }

  @Post('simulations/:id/apply')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async applySimulationLegacy(@Param('id') id: string): Promise<SimulationActionResponse> {
    return this.simulationService.applySimulation(id);
  }

  // ====== Delete Simulation ======

  @Delete('simulation/:id')
  @Roles(UserRole.ADMIN)
  async deleteSimulation(@Param('id') id: string): Promise<SimulationActionResponse> {
    return this.simulationService.deleteSimulation(id);
  }

  @Delete('simulations/:id')
  @Roles(UserRole.ADMIN)
  async deleteSimulationLegacy(@Param('id') id: string): Promise<SimulationActionResponse> {
    return this.simulationService.deleteSimulation(id);
  }

  // ====== Helpers ======

  private async handleRunSimulation(dto: CreateSimulationDto): Promise<SimulationRunResponse> {
    const result = await this.simulationService.runSimulation(dto);

    return {
      success: true,
      message: `Simulation completed in ${result.executionTimeMs}ms. ${result.conflictsDetected} conflicts detected.`,
      data: result,
    };
  }

  private async handleListSimulations(limit?: string): Promise<SimulationListResponse> {
    const parsedLimit = Number(limit);
    const simulations = await this.simulationService.listRecentSimulations(
      Number.isFinite(parsedLimit) ? parsedLimit : 10,
    );

    return {
      success: true,
      data: simulations,
    };
  }

  private async handleGetSimulation(id: string): Promise<{ success: boolean; data: SimulationResultDto }> {
    const result = await this.simulationService.getSimulationResult(id);

    return {
      success: true,
      data: result,
    };
  }
}
