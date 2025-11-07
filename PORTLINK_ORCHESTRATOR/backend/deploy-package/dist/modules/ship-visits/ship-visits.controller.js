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
exports.ShipVisitsController = void 0;
const common_1 = require("@nestjs/common");
const ship_visits_service_1 = require("./ship-visits.service");
const ship_visit_dto_1 = require("./dto/ship-visit.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let ShipVisitsController = class ShipVisitsController {
    constructor(shipVisitsService) {
        this.shipVisitsService = shipVisitsService;
    }
    create(createShipVisitDto) {
        return this.shipVisitsService.create(createShipVisitDto);
    }
    findAll(filterDto) {
        return this.shipVisitsService.findAll(filterDto);
    }
    getStatistics() {
        return this.shipVisitsService.getStatistics();
    }
    findUpcoming(days) {
        return this.shipVisitsService.findUpcoming(days);
    }
    findActive() {
        return this.shipVisitsService.findActive();
    }
    findByStatus(status) {
        return this.shipVisitsService.findByStatus(status);
    }
    findOne(id) {
        return this.shipVisitsService.findOne(id);
    }
    update(id, updateShipVisitDto) {
        return this.shipVisitsService.update(id, updateShipVisitDto);
    }
    updateStatus(id, status) {
        return this.shipVisitsService.updateStatus(id, status);
    }
    recordArrival(id, ata) {
        return this.shipVisitsService.recordArrival(id, ata);
    }
    recordDeparture(id, atd) {
        return this.shipVisitsService.recordDeparture(id, atd);
    }
    remove(id) {
        return this.shipVisitsService.remove(id);
    }
};
exports.ShipVisitsController = ShipVisitsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ship_visit_dto_1.CreateShipVisitDto]),
    __metadata("design:returntype", void 0)
], ShipVisitsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS, user_entity_1.UserRole.DRIVER),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ship_visit_dto_1.ShipVisitFilterDto]),
    __metadata("design:returntype", void 0)
], ShipVisitsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShipVisitsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS, user_entity_1.UserRole.DRIVER),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ShipVisitsController.prototype, "findUpcoming", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS, user_entity_1.UserRole.DRIVER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShipVisitsController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('by-status/:status'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS, user_entity_1.UserRole.DRIVER),
    __param(0, (0, common_1.Param)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShipVisitsController.prototype, "findByStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS, user_entity_1.UserRole.DRIVER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShipVisitsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ship_visit_dto_1.UpdateShipVisitDto]),
    __metadata("design:returntype", void 0)
], ShipVisitsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ShipVisitsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/arrival'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('ata')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date]),
    __metadata("design:returntype", void 0)
], ShipVisitsController.prototype, "recordArrival", null);
__decorate([
    (0, common_1.Patch)(':id/departure'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('atd')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date]),
    __metadata("design:returntype", void 0)
], ShipVisitsController.prototype, "recordDeparture", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShipVisitsController.prototype, "remove", null);
exports.ShipVisitsController = ShipVisitsController = __decorate([
    (0, common_1.Controller)('ship-visits'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [ship_visits_service_1.ShipVisitsService])
], ShipVisitsController);
//# sourceMappingURL=ship-visits.controller.js.map