"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const database_config_1 = __importDefault(require("./config/database.config"));
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const assets_module_1 = require("./modules/assets/assets.module");
const ship_visits_module_1 = require("./modules/ship-visits/ship-visits.module");
const schedules_module_1 = require("./modules/schedules/schedules.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const websocket_module_1 = require("./modules/websocket/websocket.module");
const event_logs_module_1 = require("./modules/event-logs/event-logs.module");
const simulation_module_1 = require("./modules/simulation/simulation.module");
const kpis_module_1 = require("./modules/kpis/kpis.module");
const conflicts_module_1 = require("./modules/conflicts/conflicts.module");
const chatbot_module_1 = require("./modules/chatbot/chatbot.module");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const health_controller_1 = require("./health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.default],
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => configService.get('database'),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            assets_module_1.AssetsModule,
            ship_visits_module_1.ShipVisitsModule,
            schedules_module_1.SchedulesModule,
            tasks_module_1.TasksModule,
            websocket_module_1.WebSocketModule,
            event_logs_module_1.EventLogsModule,
            simulation_module_1.SimulationModule,
            kpis_module_1.KpisModule,
            conflicts_module_1.ConflictsModule,
            chatbot_module_1.ChatbotModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: transform_interceptor_1.TransformInterceptor,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map