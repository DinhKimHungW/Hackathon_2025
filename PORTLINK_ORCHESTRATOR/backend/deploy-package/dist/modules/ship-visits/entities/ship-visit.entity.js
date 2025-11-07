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
exports.ShipVisit = exports.ShipVisitStatus = void 0;
const typeorm_1 = require("typeorm");
const schedule_entity_1 = require("../../schedules/entities/schedule.entity");
var ShipVisitStatus;
(function (ShipVisitStatus) {
    ShipVisitStatus["PLANNED"] = "PLANNED";
    ShipVisitStatus["ARRIVED"] = "ARRIVED";
    ShipVisitStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ShipVisitStatus["COMPLETED"] = "COMPLETED";
    ShipVisitStatus["DEPARTED"] = "DEPARTED";
    ShipVisitStatus["CANCELLED"] = "CANCELLED";
})(ShipVisitStatus || (exports.ShipVisitStatus = ShipVisitStatus = {}));
let ShipVisit = class ShipVisit {
};
exports.ShipVisit = ShipVisit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ShipVisit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], ShipVisit.prototype, "vesselName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], ShipVisit.prototype, "vesselIMO", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], ShipVisit.prototype, "voyageNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ShipVisit.prototype, "eta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ShipVisit.prototype, "etd", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ShipVisit.prototype, "ata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ShipVisit.prototype, "atd", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ShipVisitStatus,
        default: ShipVisitStatus.PLANNED,
    }),
    __metadata("design:type", String)
], ShipVisit.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], ShipVisit.prototype, "berthLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ShipVisit.prototype, "totalContainers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ShipVisit.prototype, "containersLoaded", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ShipVisit.prototype, "containersUnloaded", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ShipVisit.prototype, "completionPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ShipVisit.prototype, "shippingLine", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ShipVisit.prototype, "agent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ShipVisit.prototype, "cargoDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ShipVisit.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ShipVisit.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ShipVisit.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => schedule_entity_1.Schedule, (schedule) => schedule.shipVisit),
    __metadata("design:type", Array)
], ShipVisit.prototype, "schedules", void 0);
exports.ShipVisit = ShipVisit = __decorate([
    (0, typeorm_1.Entity)({ schema: 'operations', name: 'ship_visits' }),
    (0, typeorm_1.Index)(['vesselName', 'eta']),
    (0, typeorm_1.Index)(['status'])
], ShipVisit);
//# sourceMappingURL=ship-visit.entity.js.map