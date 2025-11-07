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
var WebSocketEventsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketEventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let WebSocketEventsGateway = WebSocketEventsGateway_1 = class WebSocketEventsGateway {
    constructor() {
        this.logger = new common_1.Logger(WebSocketEventsGateway_1.name);
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway initialized');
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        client.emit('connection', {
            message: 'Connected to PortLink Orchestrator WebSocket',
            clientId: client.id,
        });
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    broadcastAssetCreated(asset) {
        this.server.emit('asset:created', asset);
        this.logger.debug(`Broadcast asset:created - ${asset.id}`);
    }
    broadcastAssetUpdated(asset) {
        this.server.emit('asset:updated', asset);
        this.logger.debug(`Broadcast asset:updated - ${asset.id}`);
    }
    broadcastAssetStatusChanged(asset) {
        this.server.emit('asset:status-changed', asset);
        this.logger.debug(`Broadcast asset:status-changed - ${asset.id} to ${asset.status}`);
    }
    broadcastAssetDeleted(assetId) {
        this.server.emit('asset:deleted', { id: assetId });
        this.logger.debug(`Broadcast asset:deleted - ${assetId}`);
    }
    broadcastShipVisitCreated(shipVisit) {
        this.server.emit('ship-visit:created', shipVisit);
        this.logger.debug(`Broadcast ship-visit:created - ${shipVisit.id}`);
    }
    broadcastShipVisitUpdated(shipVisit) {
        this.server.emit('ship-visit:updated', shipVisit);
        this.logger.debug(`Broadcast ship-visit:updated - ${shipVisit.id}`);
    }
    broadcastShipVisitStatusChanged(shipVisit) {
        this.server.emit('ship-visit:status-changed', shipVisit);
        this.logger.debug(`Broadcast ship-visit:status-changed - ${shipVisit.id} to ${shipVisit.status}`);
    }
    broadcastShipVisitArrival(shipVisit) {
        this.server.emit('ship-visit:arrival', shipVisit);
        this.logger.debug(`Broadcast ship-visit:arrival - ${shipVisit.vesselName}`);
    }
    broadcastShipVisitDeparture(shipVisit) {
        this.server.emit('ship-visit:departure', shipVisit);
        this.logger.debug(`Broadcast ship-visit:departure - ${shipVisit.vesselName}`);
    }
    broadcastShipVisitDeleted(shipVisitId) {
        this.server.emit('ship-visit:deleted', { id: shipVisitId });
        this.logger.debug(`Broadcast ship-visit:deleted - ${shipVisitId}`);
    }
    broadcastScheduleCreated(schedule) {
        this.server.emit('schedule:created', schedule);
        this.logger.debug(`Broadcast schedule:created - ${schedule.id}`);
    }
    broadcastScheduleUpdated(schedule) {
        this.server.emit('schedule:updated', schedule);
        this.logger.debug(`Broadcast schedule:updated - ${schedule.id}`);
    }
    broadcastScheduleStatusChanged(schedule) {
        this.server.emit('schedule:status-changed', schedule);
        this.logger.debug(`Broadcast schedule:status-changed - ${schedule.id} to ${schedule.status}`);
    }
    broadcastScheduleConflict(conflict) {
        this.server.emit('schedule:conflict', conflict);
        this.logger.warn(`Broadcast schedule:conflict - ${conflict.schedules.length} conflicts`);
    }
    broadcastScheduleDeleted(scheduleId) {
        this.server.emit('schedule:deleted', { id: scheduleId });
        this.logger.debug(`Broadcast schedule:deleted - ${scheduleId}`);
    }
    broadcastTaskCreated(task) {
        this.server.emit('task:created', task);
        this.logger.debug(`Broadcast task:created - ${task.id}`);
    }
    broadcastTaskUpdated(task) {
        this.server.emit('task:updated', task);
        this.logger.debug(`Broadcast task:updated - ${task.id}`);
    }
    broadcastTaskStatusChanged(task) {
        this.server.emit('task:status-changed', task);
        this.logger.debug(`Broadcast task:status-changed - ${task.id} to ${task.status}`);
    }
    broadcastTaskProgressUpdated(task) {
        this.server.emit('task:progress-updated', task);
        this.logger.debug(`Broadcast task:progress-updated - ${task.id} to ${task.completionPercentage}%`);
    }
    broadcastTaskAssigned(task) {
        this.server.emit('task:assigned', task);
        this.logger.debug(`Broadcast task:assigned - ${task.id} to ${task.assignedTo}`);
    }
    broadcastTaskDeleted(taskId) {
        this.server.emit('task:deleted', { id: taskId });
        this.logger.debug(`Broadcast task:deleted - ${taskId}`);
    }
    broadcastSystemAlert(alert) {
        this.server.emit('system:alert', alert);
        this.logger.warn(`Broadcast system:alert - ${alert.type}: ${alert.message}`);
    }
    broadcastSystemNotification(notification) {
        this.server.emit('system:notification', notification);
        this.logger.log(`Broadcast system:notification - ${notification.message}`);
    }
};
exports.WebSocketEventsGateway = WebSocketEventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebSocketEventsGateway.prototype, "server", void 0);
exports.WebSocketEventsGateway = WebSocketEventsGateway = WebSocketEventsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/ws',
    })
], WebSocketEventsGateway);
//# sourceMappingURL=websocket.gateway.js.map