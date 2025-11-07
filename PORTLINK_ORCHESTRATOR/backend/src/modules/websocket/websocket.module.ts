import { Module } from '@nestjs/common';
import { WebSocketEventsGateway } from './websocket.gateway';

@Module({
  providers: [WebSocketEventsGateway],
  exports: [WebSocketEventsGateway],
})
export class WebSocketModule {}
