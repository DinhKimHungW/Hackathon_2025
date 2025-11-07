"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationController = void 0;
const common_1 = require("@nestjs/common");
const simulation_service_1 = require("./simulation.service");
const simulation_dto_1 = require("./dto/simulation.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let SimulationController = class SimulationController {
    constructor(simulationService) {
        this.simulationService = simulationService;
    }
    async runSimulation(dto) {
        return this.handleRunSimulation(dto);
    }
    async runSimulationLegacy(dto) {
        return this.handleRunSimulation(dto);
    }
    async listSimulations(limit) {
        return this.handleListSimulations(limit);
    }
    async listSimulationsLegacy(limit) {
        return this.handleListSimulations(limit);
    }
    async getSimulationResult(id) {
        return this.handleGetSimulation(id);
    }
    async getSimulationResultLegacy(id) {
        return this.handleGetSimulation(id);
    }
    async applySimulation(id) {
        return this.simulationService.applySimulation(id);
    }
    async applySimulationLegacy(id) {
        return this.simulationService.applySimulation(id);
    }
    async deleteSimulation(id) {
        return this.simulationService.deleteSimulation(id);
    }
    async deleteSimulationLegacy(id) {
        return this.simulationService.deleteSimulation(id);
    }
    async handleRunSimulation(dto) {
        const result = await this.simulationService.runSimulation(dto);
        return {
            success: true,
            message: `Simulation completed in ${result.executionTimeMs}ms. ${result.conflictsDetected} conflicts detected.`,
            data: result,
        };
    }
    async handleListSimulations(limit) {
        const parsedLimit = Number(limit);
        const simulations = await this.simulationService.listRecentSimulations(Number.isFinite(parsedLimit) ? parsedLimit : 10);
        return {
            success: true,
            data: simulations,
        };
    }
    async handleGetSimulation(id) {
        const result = await this.simulationService.getSimulationResult(id);
        return {
            success: true,
            data: result,
        };
    }
};
exports.SimulationController = SimulationController;
__decorate([
    (0, common_1.Post)('simulations'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [simulation_dto_1.CreateSimulationDto]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "runSimulation", null);
__decorate([
    (0, common_1.Post)('simulation/run'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [simulation_dto_1.CreateSimulationDto]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "runSimulationLegacy", null);
__decorate([
    (0, common_1.Get)('simulation'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "listSimulations", null);
__decorate([
    (0, common_1.Get)('simulations'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "listSimulationsLegacy", null);
__decorate([
    (0, common_1.Get)('simulation/:id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "getSimulationResult", null);
__decorate([
    (0, common_1.Get)('simulations/:id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "getSimulationResultLegacy", null);
__decorate([
    (0, common_1.Post)('simulation/:id/apply'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "applySimulation", null);
__decorate([
    (0, common_1.Post)('simulations/:id/apply'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "applySimulationLegacy", null);
__decorate([
    (0, common_1.Delete)('simulation/:id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "deleteSimulation", null);
__decorate([
    (0, common_1.Delete)('simulations/:id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "deleteSimulationLegacy", null);
exports.SimulationController = SimulationController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [simulation_service_1.SimulationService])
], SimulationController);
//# sourceMappingURL=simulation.controller.js.map