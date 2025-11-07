"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpisModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const kpis_controller_1 = require("./kpis.controller");
const kpis_service_1 = require("./kpis.service");
const ship_visit_entity_1 = require("../ship-visits/entities/ship-visit.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const asset_entity_1 = require("../assets/entities/asset.entity");
const schedule_entity_1 = require("../schedules/entities/schedule.entity");
let KpisModule = class KpisModule {
};
exports.KpisModule = KpisModule;
exports.KpisModule = KpisModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([ship_visit_entity_1.ShipVisit, task_entity_1.Task, asset_entity_1.Asset, schedule_entity_1.Schedule])],
        controllers: [kpis_controller_1.KpisController],
        providers: [kpis_service_1.KpisService],
        exports: [kpis_service_1.KpisService],
    })
], KpisModule);
//# sourceMappingURL=kpis.module.js.map