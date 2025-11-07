"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const conflicts_controller_1 = require("./conflicts.controller");
const conflicts_service_1 = require("./conflicts.service");
const conflict_entity_1 = require("./entities/conflict.entity");
let ConflictsModule = class ConflictsModule {
};
exports.ConflictsModule = ConflictsModule;
exports.ConflictsModule = ConflictsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([conflict_entity_1.Conflict])],
        controllers: [conflicts_controller_1.ConflictsController],
        providers: [conflicts_service_1.ConflictsService],
        exports: [conflicts_service_1.ConflictsService],
    })
], ConflictsModule);
//# sourceMappingURL=conflicts.module.js.map