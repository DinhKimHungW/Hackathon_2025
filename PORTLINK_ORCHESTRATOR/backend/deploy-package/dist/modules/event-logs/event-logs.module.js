"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLogsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_logs_service_1 = require("./event-logs.service");
const event_logs_controller_1 = require("./event-logs.controller");
const event_log_entity_1 = require("./entities/event-log.entity");
let EventLogsModule = class EventLogsModule {
};
exports.EventLogsModule = EventLogsModule;
exports.EventLogsModule = EventLogsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([event_log_entity_1.EventLog])],
        controllers: [event_logs_controller_1.EventLogsController],
        providers: [event_logs_service_1.EventLogsService],
        exports: [event_logs_service_1.EventLogsService],
    })
], EventLogsModule);
//# sourceMappingURL=event-logs.module.js.map