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
exports.Conflict = exports.ConflictSeverity = exports.ConflictType = void 0;
const typeorm_1 = require("typeorm");
const simulation_run_entity_1 = require("../../simulation/entities/simulation-run.entity");
var ConflictType;
(function (ConflictType) {
    ConflictType["RESOURCE_OVERLAP"] = "RESOURCE_OVERLAP";
    ConflictType["TIME_OVERLAP"] = "TIME_OVERLAP";
    ConflictType["LOCATION_OVERLAP"] = "LOCATION_OVERLAP";
    ConflictType["CAPACITY_EXCEEDED"] = "CAPACITY_EXCEEDED";
})(ConflictType || (exports.ConflictType = ConflictType = {}));
var ConflictSeverity;
(function (ConflictSeverity) {
    ConflictSeverity["LOW"] = "LOW";
    ConflictSeverity["MEDIUM"] = "MEDIUM";
    ConflictSeverity["HIGH"] = "HIGH";
    ConflictSeverity["CRITICAL"] = "CRITICAL";
})(ConflictSeverity || (exports.ConflictSeverity = ConflictSeverity = {}));
let Conflict = class Conflict {
};
exports.Conflict = Conflict;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Conflict.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Conflict.prototype, "simulationRunId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ConflictType,
    }),
    __metadata("design:type", String)
], Conflict.prototype, "conflictType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ConflictSeverity,
    }),
    __metadata("design:type", String)
], Conflict.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Conflict.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Conflict.prototype, "affectedResources", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Conflict.prototype, "conflictTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Conflict.prototype, "suggestedResolution", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Conflict.prototype, "resolved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Conflict.prototype, "resolutionNotes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Conflict.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => simulation_run_entity_1.SimulationRun, (simulationRun) => simulationRun.conflicts, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'simulationRunId' }),
    __metadata("design:type", simulation_run_entity_1.SimulationRun)
], Conflict.prototype, "simulationRun", void 0);
exports.Conflict = Conflict = __decorate([
    (0, typeorm_1.Entity)({ schema: 'simulation', name: 'conflicts' }),
    (0, typeorm_1.Index)(['simulationRunId', 'severity']),
    (0, typeorm_1.Index)(['conflictType', 'severity'])
], Conflict);
//# sourceMappingURL=conflict.entity.js.map