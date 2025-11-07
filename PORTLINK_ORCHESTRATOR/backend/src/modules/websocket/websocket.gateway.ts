import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws',
})
export class WebSocketEventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketEventsGateway.name);

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection', {
      message: 'Connected to PortLink Orchestrator WebSocket',
      clientId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Asset Events
  broadcastAssetCreated(asset: any) {
    this.server.emit('asset:created', asset);
    this.logger.debug(`Broadcast asset:created - ${asset.id}`);
  }

  broadcastAssetUpdated(asset: any) {
    this.server.emit('asset:updated', asset);
    this.logger.debug(`Broadcast asset:updated - ${asset.id}`);
  }

  broadcastAssetStatusChanged(asset: any) {
    this.server.emit('asset:status-changed', asset);
    this.logger.debug(`Broadcast asset:status-changed - ${asset.id} to ${asset.status}`);
  }

  broadcastAssetDeleted(assetId: string) {
    this.server.emit('asset:deleted', { id: assetId });
    this.logger.debug(`Broadcast asset:deleted - ${assetId}`);
  }

  // Ship Visit Events
  broadcastShipVisitCreated(shipVisit: any) {
    this.server.emit('ship-visit:created', shipVisit);
    this.logger.debug(`Broadcast ship-visit:created - ${shipVisit.id}`);
  }

  broadcastShipVisitUpdated(shipVisit: any) {
    this.server.emit('ship-visit:updated', shipVisit);
    this.logger.debug(`Broadcast ship-visit:updated - ${shipVisit.id}`);
  }

  broadcastShipVisitStatusChanged(shipVisit: any) {
    this.server.emit('ship-visit:status-changed', shipVisit);
    this.logger.debug(`Broadcast ship-visit:status-changed - ${shipVisit.id} to ${shipVisit.status}`);
  }

  broadcastShipVisitArrival(shipVisit: any) {
    this.server.emit('ship-visit:arrival', shipVisit);
    this.logger.debug(`Broadcast ship-visit:arrival - ${shipVisit.vesselName}`);
  }

  broadcastShipVisitDeparture(shipVisit: any) {
    this.server.emit('ship-visit:departure', shipVisit);
    this.logger.debug(`Broadcast ship-visit:departure - ${shipVisit.vesselName}`);
  }

  broadcastShipVisitDeleted(shipVisitId: string) {
    this.server.emit('ship-visit:deleted', { id: shipVisitId });
    this.logger.debug(`Broadcast ship-visit:deleted - ${shipVisitId}`);
  }

  // Schedule Events
  broadcastScheduleCreated(schedule: any) {
    this.server.emit('schedule:created', schedule);
    this.logger.debug(`Broadcast schedule:created - ${schedule.id}`);
  }

  broadcastScheduleUpdated(schedule: any) {
    this.server.emit('schedule:updated', schedule);
    this.logger.debug(`Broadcast schedule:updated - ${schedule.id}`);
  }

  broadcastScheduleStatusChanged(schedule: any) {
    this.server.emit('schedule:status-changed', schedule);
    this.logger.debug(`Broadcast schedule:status-changed - ${schedule.id} to ${schedule.status}`);
  }

  broadcastScheduleConflict(conflict: any) {
    this.server.emit('schedule:conflict', conflict);
    this.logger.warn(`Broadcast schedule:conflict - ${conflict.schedules.length} conflicts`);
  }

  broadcastScheduleDeleted(scheduleId: string) {
    this.server.emit('schedule:deleted', { id: scheduleId });
    this.logger.debug(`Broadcast schedule:deleted - ${scheduleId}`);
  }

  // Task Events
  broadcastTaskCreated(task: any) {
    this.server.emit('task:created', task);
    this.logger.debug(`Broadcast task:created - ${task.id}`);
  }

  broadcastTaskUpdated(task: any) {
    this.server.emit('task:updated', task);
    this.logger.debug(`Broadcast task:updated - ${task.id}`);
  }

  broadcastTaskStatusChanged(task: any) {
    this.server.emit('task:status-changed', task);
    this.logger.debug(`Broadcast task:status-changed - ${task.id} to ${task.status}`);
  }

  broadcastTaskProgressUpdated(task: any) {
    this.server.emit('task:progress-updated', task);
    this.logger.debug(`Broadcast task:progress-updated - ${task.id} to ${task.completionPercentage}%`);
  }

  broadcastTaskAssigned(task: any) {
    this.server.emit('task:assigned', task);
    this.logger.debug(`Broadcast task:assigned - ${task.id} to ${task.assignedTo}`);
  }

  broadcastTaskDeleted(taskId: string) {
    this.server.emit('task:deleted', { id: taskId });
    this.logger.debug(`Broadcast task:deleted - ${taskId}`);
  }

  // System Events
  broadcastSystemAlert(alert: any) {
    this.server.emit('system:alert', alert);
    this.logger.warn(`Broadcast system:alert - ${alert.type}: ${alert.message}`);
  }

  broadcastSystemNotification(notification: any) {
    this.server.emit('system:notification', notification);
    this.logger.log(`Broadcast system:notification - ${notification.message}`);
  }
}
