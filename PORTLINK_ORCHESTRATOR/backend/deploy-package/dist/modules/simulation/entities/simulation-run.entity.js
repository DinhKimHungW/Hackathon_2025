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
exports.SimulationRun = exports.SimulationStatus = void 0;
const typeorm_1 = require("typeorm");
const conflict_entity_1 = require("../../conflicts/entities/conflict.entity");
var SimulationStatus;
(function (SimulationStatus) {
    SimulationStatus["PENDING"] = "PENDING";
    SimulationStatus["RUNNING"] = "RUNNING";
    SimulationStatus["COMPLETED"] = "COMPLETED";
    SimulationStatus["FAILED"] = "FAILED";
})(SimulationStatus || (exports.SimulationStatus = SimulationStatus = {}));
let SimulationRun = class SimulationRun {
};
exports.SimulationRun = SimulationRun;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SimulationRun.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], SimulationRun.prototype, "scenarioName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SimulationRun.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SimulationStatus,
        default: SimulationStatus.PENDING,
    }),
    __metadata("design:type", String)
], SimulationRun.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], SimulationRun.prototype, "inputParameters", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SimulationRun.prototype, "outputResults", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SimulationRun.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SimulationRun.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], SimulationRun.prototype, "executionTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SimulationRun.prototype, "conflictsDetected", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], SimulationRun.prototype, "utilizationRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], SimulationRun.prototype, "estimatedCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SimulationRun.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SimulationRun.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SimulationRun.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conflict_entity_1.Conflict, (conflict) => conflict.simulationRun),
    __metadata("design:type", Array)
], SimulationRun.prototype, "conflicts", void 0);
exports.SimulationRun = SimulationRun = __decorate([
    (0, typeorm_1.Entity)({ schema: 'simulation', name: 'simulation_runs' }),
    (0, typeorm_1.Index)(['status', 'createdAt'])
], SimulationRun);
//# sourceMappingURL=simulation-run.entity.js.map