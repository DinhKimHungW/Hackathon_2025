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
exports.KpisController = void 0;
const common_1 = require("@nestjs/common");
const kpis_service_1 = require("./kpis.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let KpisController = class KpisController {
    constructor(kpisService) {
        this.kpisService = kpisService;
    }
    async getSummary() {
        return this.kpisService.getSummary();
    }
    async getShipArrivals(days) {
        const numDays = days ? parseInt(days, 10) : 7;
        return this.kpisService.getShipArrivals(numDays);
    }
    async getTaskStatus() {
        return this.kpisService.getTaskStatus();
    }
    async getAssetUtilization() {
        return this.kpisService.getAssetUtilization();
    }
    async getScheduleTimeline(days) {
        const numDays = days ? parseInt(days, 10) : 7;
        return this.kpisService.getScheduleTimeline(numDays);
    }
    async refresh() {
        return this.kpisService.refresh();
    }
};
exports.KpisController = KpisController;
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('charts/ship-arrivals'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "getShipArrivals", null);
__decorate([
    (0, common_1.Get)('charts/task-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "getTaskStatus", null);
__decorate([
    (0, common_1.Get)('charts/asset-utilization'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "getAssetUtilization", null);
__decorate([
    (0, common_1.Get)('charts/schedule-timeline'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "getScheduleTimeline", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "refresh", null);
exports.KpisController = KpisController = __decorate([
    (0, common_1.Controller)('kpis'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [kpis_service_1.KpisService])
], KpisController);
//# sourceMappingURL=kpis.controller.js.map