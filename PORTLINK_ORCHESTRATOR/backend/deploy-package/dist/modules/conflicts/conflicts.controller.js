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
exports.ConflictsController = void 0;
const common_1 = require("@nestjs/common");
const conflicts_service_1 = require("./conflicts.service");
const create_conflict_dto_1 = require("./dto/create-conflict.dto");
const update_conflict_dto_1 = require("./dto/update-conflict.dto");
const get_conflicts_dto_1 = require("./dto/get-conflicts.dto");
const resolve_conflict_dto_1 = require("./dto/resolve-conflict.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let ConflictsController = class ConflictsController {
    constructor(conflictsService) {
        this.conflictsService = conflictsService;
    }
    create(createConflictDto) {
        return this.conflictsService.create(createConflictDto);
    }
    findAll(query) {
        return this.conflictsService.findAll(query);
    }
    stats(simulationRunId) {
        return this.conflictsService.getStats(simulationRunId);
    }
    unresolved(limit, simulationRunId) {
        const parsedLimit = limit ? parseInt(limit, 10) : undefined;
        const safeLimit = parsedLimit && parsedLimit > 0 ? parsedLimit : 20;
        return this.conflictsService.getUnresolved(safeLimit, simulationRunId);
    }
    findOne(id) {
        return this.conflictsService.findOne(id);
    }
    update(id, updateConflictDto) {
        return this.conflictsService.update(id, updateConflictDto);
    }
    resolve(id, resolveDto) {
        return this.conflictsService.resolve(id, resolveDto);
    }
    remove(id) {
        return this.conflictsService.remove(id);
    }
};
exports.ConflictsController = ConflictsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_conflict_dto_1.CreateConflictDto]),
    __metadata("design:returntype", void 0)
], ConflictsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_conflicts_dto_1.GetConflictsDto]),
    __metadata("design:returntype", void 0)
], ConflictsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Query)('simulationRunId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConflictsController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('unresolved'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('simulationRunId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ConflictsController.prototype, "unresolved", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConflictsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_conflict_dto_1.UpdateConflictDto]),
    __metadata("design:returntype", void 0)
], ConflictsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.OPERATIONS),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, resolve_conflict_dto_1.ResolveConflictDto]),
    __metadata("design:returntype", void 0)
], ConflictsController.prototype, "resolve", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConflictsController.prototype, "remove", null);
exports.ConflictsController = ConflictsController = __decorate([
    (0, common_1.Controller)('conflicts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [conflicts_service_1.ConflictsService])
], ConflictsController);
//# sourceMappingURL=conflicts.controller.js.map