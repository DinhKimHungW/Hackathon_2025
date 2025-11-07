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
exports.EventLog = exports.EventSeverity = exports.EventType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var EventType;
(function (EventType) {
    EventType["USER_LOGIN"] = "USER_LOGIN";
    EventType["USER_LOGOUT"] = "USER_LOGOUT";
    EventType["ASSET_UPDATE"] = "ASSET_UPDATE";
    EventType["SCHEDULE_CREATE"] = "SCHEDULE_CREATE";
    EventType["SCHEDULE_UPDATE"] = "SCHEDULE_UPDATE";
    EventType["TASK_CREATE"] = "TASK_CREATE";
    EventType["TASK_UPDATE"] = "TASK_UPDATE";
    EventType["SIMULATION_START"] = "SIMULATION_START";
    EventType["SIMULATION_COMPLETE"] = "SIMULATION_COMPLETE";
    EventType["CONFLICT_DETECTED"] = "CONFLICT_DETECTED";
    EventType["CONFLICT_RESOLVED"] = "CONFLICT_RESOLVED";
    EventType["SYSTEM_ERROR"] = "SYSTEM_ERROR";
    EventType["DATA_EXPORT"] = "DATA_EXPORT";
    EventType["DATA_IMPORT"] = "DATA_IMPORT";
})(EventType || (exports.EventType = EventType = {}));
var EventSeverity;
(function (EventSeverity) {
    EventSeverity["INFO"] = "INFO";
    EventSeverity["WARNING"] = "WARNING";
    EventSeverity["ERROR"] = "ERROR";
    EventSeverity["CRITICAL"] = "CRITICAL";
})(EventSeverity || (exports.EventSeverity = EventSeverity = {}));
let EventLog = class EventLog {
};
exports.EventLog = EventLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EventLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EventType,
    }),
    __metadata("design:type", String)
], EventLog.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EventSeverity,
        default: EventSeverity.INFO,
    }),
    __metadata("design:type", String)
], EventLog.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EventLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], EventLog.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], EventLog.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], EventLog.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], EventLog.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], EventLog.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EventLog.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EventLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.eventLogs, {
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], EventLog.prototype, "user", void 0);
exports.EventLog = EventLog = __decorate([
    (0, typeorm_1.Entity)({ schema: 'analytics', name: 'event_logs' }),
    (0, typeorm_1.Index)(['eventType', 'createdAt']),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['severity', 'createdAt'])
], EventLog);
//# sourceMappingURL=event-log.entity.js.map