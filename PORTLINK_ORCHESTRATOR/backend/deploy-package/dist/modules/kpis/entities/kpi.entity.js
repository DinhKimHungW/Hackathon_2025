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
exports.KPI = exports.KPICategory = void 0;
const typeorm_1 = require("typeorm");
var KPICategory;
(function (KPICategory) {
    KPICategory["EFFICIENCY"] = "EFFICIENCY";
    KPICategory["UTILIZATION"] = "UTILIZATION";
    KPICategory["PERFORMANCE"] = "PERFORMANCE";
    KPICategory["COST"] = "COST";
    KPICategory["QUALITY"] = "QUALITY";
})(KPICategory || (exports.KPICategory = KPICategory = {}));
let KPI = class KPI {
};
exports.KPI = KPI;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], KPI.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], KPI.prototype, "kpiName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: KPICategory,
    }),
    __metadata("design:type", String)
], KPI.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], KPI.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], KPI.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], KPI.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], KPI.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], KPI.prototype, "calculatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], KPI.prototype, "periodStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], KPI.prototype, "periodEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], KPI.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], KPI.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], KPI.prototype, "createdAt", void 0);
exports.KPI = KPI = __decorate([
    (0, typeorm_1.Entity)({ schema: 'analytics', name: 'kpis' }),
    (0, typeorm_1.Index)(['category', 'calculatedAt']),
    (0, typeorm_1.Index)(['entityType', 'entityId'])
], KPI);
//# sourceMappingURL=kpi.entity.js.map