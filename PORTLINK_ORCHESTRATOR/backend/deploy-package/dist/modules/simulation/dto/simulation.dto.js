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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetMaintenanceScenarioDto = exports.ShipDelayScenarioDto = exports.SimulationResultDto = exports.RecommendationDto = exports.ConflictDetailDto = exports.CreateSimulationDto = exports.ScenarioChangeDto = exports.SimulationStatus = exports.ScenarioType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const ApiProperty = (options) => (target, propertyKey) => { };
var ScenarioType;
(function (ScenarioType) {
    ScenarioType["SHIP_DELAY"] = "SHIP_DELAY";
    ScenarioType["ASSET_MAINTENANCE"] = "ASSET_MAINTENANCE";
    ScenarioType["CUSTOM"] = "CUSTOM";
})(ScenarioType || (exports.ScenarioType = ScenarioType = {}));
var SimulationStatus;
(function (SimulationStatus) {
    SimulationStatus["PENDING"] = "PENDING";
    SimulationStatus["RUNNING"] = "RUNNING";
    SimulationStatus["COMPLETED"] = "COMPLETED";
    SimulationStatus["FAILED"] = "FAILED";
})(SimulationStatus || (exports.SimulationStatus = SimulationStatus = {}));
class ScenarioChangeDto {
}
exports.ScenarioChangeDto = ScenarioChangeDto;
__decorate([
    ApiProperty({ enum: ['ship_visit', 'asset', 'task'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ScenarioChangeDto.prototype, "entityType", void 0);
__decorate([
    ApiProperty({ description: 'Identifier of the entity to change' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ScenarioChangeDto.prototype, "entityId", void 0);
__decorate([
    ApiProperty({ description: 'Field to modify (e.g., etaActual, status)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ScenarioChangeDto.prototype, "field", void 0);
__decorate([
    ApiProperty({ description: 'Current value' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ScenarioChangeDto.prototype, "oldValue", void 0);
__decorate([
    ApiProperty({ description: 'New value to apply' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], ScenarioChangeDto.prototype, "newValue", void 0);
class CreateSimulationDto {
}
exports.CreateSimulationDto = CreateSimulationDto;
__decorate([
    ApiProperty({ description: 'Name of the simulation' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSimulationDto.prototype, "name", void 0);
__decorate([
    ApiProperty({ description: 'Description of what-if scenario', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSimulationDto.prototype, "description", void 0);
__decorate([
    ApiProperty({ description: 'Base schedule ID to clone from' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSimulationDto.prototype, "baseScheduleId", void 0);
__decorate([
    ApiProperty({ enum: ScenarioType, description: 'Type of scenario to run' }),
    (0, class_validator_1.IsEnum)(ScenarioType),
    __metadata("design:type", String)
], CreateSimulationDto.prototype, "scenarioType", void 0);
__decorate([
    ApiProperty({
        type: [ScenarioChangeDto],
        description: 'List of changes to apply in scenario',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ScenarioChangeDto),
    __metadata("design:type", Array)
], CreateSimulationDto.prototype, "changes", void 0);
class ConflictDetailDto {
}
exports.ConflictDetailDto = ConflictDetailDto;
__decorate([
    ApiProperty({ description: 'Type of conflict detected' }),
    __metadata("design:type", String)
], ConflictDetailDto.prototype, "type", void 0);
__decorate([
    ApiProperty({ enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] }),
    __metadata("design:type", String)
], ConflictDetailDto.prototype, "severity", void 0);
__decorate([
    ApiProperty({ description: 'Description of the conflict' }),
    __metadata("design:type", String)
], ConflictDetailDto.prototype, "description", void 0);
__decorate([
    ApiProperty({ description: 'IDs of affected tasks' }),
    __metadata("design:type", Array)
], ConflictDetailDto.prototype, "affectedTaskIds", void 0);
__decorate([
    ApiProperty({ description: 'Affected resources (berth, crane, etc.)' }),
    __metadata("design:type", Array)
], ConflictDetailDto.prototype, "affectedResources", void 0);
__decorate([
    ApiProperty({ description: 'Time range of conflict' }),
    __metadata("design:type", Object)
], ConflictDetailDto.prototype, "timeRange", void 0);
class RecommendationDto {
}
exports.RecommendationDto = RecommendationDto;
__decorate([
    ApiProperty({ description: 'Type of recommendation' }),
    __metadata("design:type", String)
], RecommendationDto.prototype, "type", void 0);
__decorate([
    ApiProperty({ description: 'Detailed recommendation description' }),
    __metadata("design:type", String)
], RecommendationDto.prototype, "description", void 0);
__decorate([
    ApiProperty({ description: 'Estimated impact of applying this recommendation' }),
    __metadata("design:type", String)
], RecommendationDto.prototype, "estimatedImpact", void 0);
__decorate([
    ApiProperty({ description: 'Alternative asset ID (if applicable)' }),
    __metadata("design:type", String)
], RecommendationDto.prototype, "alternativeAssetId", void 0);
__decorate([
    ApiProperty({ description: 'Suggested time adjustment in hours' }),
    __metadata("design:type", Number)
], RecommendationDto.prototype, "timeAdjustmentHours", void 0);
__decorate([
    ApiProperty({ description: 'Affected task IDs if recommendation applied' }),
    __metadata("design:type", Array)
], RecommendationDto.prototype, "affectedTaskIds", void 0);
class SimulationResultDto {
}
exports.SimulationResultDto = SimulationResultDto;
__decorate([
    ApiProperty({ description: 'Simulation ID' }),
    __metadata("design:type", String)
], SimulationResultDto.prototype, "id", void 0);
__decorate([
    ApiProperty({ description: 'Simulation name' }),
    __metadata("design:type", String)
], SimulationResultDto.prototype, "name", void 0);
__decorate([
    ApiProperty({ description: 'Simulation status' }),
    __metadata("design:type", String)
], SimulationResultDto.prototype, "status", void 0);
__decorate([
    ApiProperty({ description: 'Base schedule ID' }),
    __metadata("design:type", String)
], SimulationResultDto.prototype, "baseScheduleId", void 0);
__decorate([
    ApiProperty({ description: 'Result schedule ID (cloned with changes)' }),
    __metadata("design:type", String)
], SimulationResultDto.prototype, "resultScheduleId", void 0);
__decorate([
    ApiProperty({ description: 'Scenario type' }),
    __metadata("design:type", String)
], SimulationResultDto.prototype, "scenarioType", void 0);
__decorate([
    ApiProperty({ description: 'Execution time in milliseconds' }),
    __metadata("design:type", Number)
], SimulationResultDto.prototype, "executionTimeMs", void 0);
__decorate([
    ApiProperty({ description: 'Number of conflicts detected' }),
    __metadata("design:type", Number)
], SimulationResultDto.prototype, "conflictsDetected", void 0);
__decorate([
    ApiProperty({ type: [ConflictDetailDto], description: 'List of detected conflicts' }),
    __metadata("design:type", Array)
], SimulationResultDto.prototype, "conflicts", void 0);
__decorate([
    ApiProperty({ type: [RecommendationDto], description: 'Recommended solutions' }),
    __metadata("design:type", Array)
], SimulationResultDto.prototype, "recommendations", void 0);
__decorate([
    ApiProperty({ description: 'Summary metrics' }),
    __metadata("design:type", Object)
], SimulationResultDto.prototype, "metrics", void 0);
__decorate([
    ApiProperty({ description: 'Timestamp when simulation started' }),
    __metadata("design:type", Date)
], SimulationResultDto.prototype, "startedAt", void 0);
__decorate([
    ApiProperty({ description: 'Timestamp when simulation completed' }),
    __metadata("design:type", Date)
], SimulationResultDto.prototype, "completedAt", void 0);
__decorate([
    ApiProperty({ description: 'Created at' }),
    __metadata("design:type", Date)
], SimulationResultDto.prototype, "createdAt", void 0);
class ShipDelayScenarioDto {
}
exports.ShipDelayScenarioDto = ShipDelayScenarioDto;
__decorate([
    ApiProperty({ description: 'Ship visit ID to delay' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ShipDelayScenarioDto.prototype, "shipVisitId", void 0);
__decorate([
    ApiProperty({ description: 'Delay duration in hours' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ShipDelayScenarioDto.prototype, "delayHours", void 0);
class AssetMaintenanceScenarioDto {
}
exports.AssetMaintenanceScenarioDto = AssetMaintenanceScenarioDto;
__decorate([
    ApiProperty({ description: 'Asset ID (berth or crane) for maintenance' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssetMaintenanceScenarioDto.prototype, "assetId", void 0);
__decorate([
    ApiProperty({ description: 'Maintenance start time' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AssetMaintenanceScenarioDto.prototype, "maintenanceStartTime", void 0);
__decorate([
    ApiProperty({ description: 'Maintenance duration in hours' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AssetMaintenanceScenarioDto.prototype, "maintenanceDurationHours", void 0);
//# sourceMappingURL=simulation.dto.js.map