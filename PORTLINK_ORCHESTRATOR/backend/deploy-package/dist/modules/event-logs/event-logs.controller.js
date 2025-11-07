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
exports.EventLogsController = void 0;
const common_1 = require("@nestjs/common");
const event_logs_service_1 = require("./event-logs.service");
const event_log_dto_1 = require("./dto/event-log.dto");
const event_log_entity_1 = require("./entities/event-log.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let EventLogsController = class EventLogsController {
    constructor(eventLogsService) {
        this.eventLogsService = eventLogsService;
    }
    findAll(filterDto) {
        return this.eventLogsService.findAll(filterDto);
    }
    getStatistics() {
        return this.eventLogsService.getStatistics();
    }
    getRecentLogs(limit = 50) {
        return this.eventLogsService.getRecentLogs(limit);
    }
    findByEventType(eventType) {
        return this.eventLogsService.findByEventType(eventType);
    }
    findBySeverity(severity) {
        return this.eventLogsService.findBySeverity(severity);
    }
    findByUser(userId) {
        return this.eventLogsService.findByUser(userId);
    }
    findByEntity(entityType, entityId) {
        return this.eventLogsService.findByEntity(entityType, entityId);
    }
    cleanOldLogs(daysToKeep = 90) {
        return this.eventLogsService.cleanOldLogs(daysToKeep);
    }
};
exports.EventLogsController = EventLogsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [event_log_dto_1.EventLogFilterDto]),
    __metadata("design:returntype", void 0)
], EventLogsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EventLogsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('recent'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EventLogsController.prototype, "getRecentLogs", null);
__decorate([
    (0, common_1.Get)('by-event-type/:eventType'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('eventType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventLogsController.prototype, "findByEventType", null);
__decorate([
    (0, common_1.Get)('by-severity/:severity'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('severity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventLogsController.prototype, "findBySeverity", null);
__decorate([
    (0, common_1.Get)('by-user/:userId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventLogsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)('by-entity/:entityType/:entityId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EventLogsController.prototype, "findByEntity", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('days', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EventLogsController.prototype, "cleanOldLogs", null);
exports.EventLogsController = EventLogsController = __decorate([
    (0, common_1.Controller)('event-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [event_logs_service_1.EventLogsService])
], EventLogsController);
//# sourceMappingURL=event-logs.controller.js.map