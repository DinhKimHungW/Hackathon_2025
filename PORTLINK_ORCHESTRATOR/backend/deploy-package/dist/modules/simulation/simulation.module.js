"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const simulation_service_1 = require("./simulation.service");
const simulation_controller_1 = require("./simulation.controller");
const conflict_detection_service_1 = require("./conflict-detection.service");
const recommendation_service_1 = require("./recommendation.service");
const websocket_module_1 = require("../websocket/websocket.module");
const schedule_entity_1 = require("../schedules/entities/schedule.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const asset_entity_1 = require("../assets/entities/asset.entity");
const ship_visit_entity_1 = require("../ship-visits/entities/ship-visit.entity");
const redis_config_1 = require("../../config/redis.config");
let SimulationModule = class SimulationModule {
};
exports.SimulationModule = SimulationModule;
exports.SimulationModule = SimulationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([schedule_entity_1.Schedule, task_entity_1.Task, asset_entity_1.Asset, ship_visit_entity_1.ShipVisit]),
            websocket_module_1.WebSocketModule,
            cache_manager_1.CacheModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: redis_config_1.redisConfig,
            }),
        ],
        controllers: [simulation_controller_1.SimulationController],
        providers: [simulation_service_1.SimulationService, conflict_detection_service_1.ConflictDetectionService, recommendation_service_1.RecommendationService],
        exports: [simulation_service_1.SimulationService],
    })
], SimulationModule);
//# sourceMappingURL=simulation.module.js.map