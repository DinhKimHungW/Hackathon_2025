import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import databaseConfig from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AssetsModule } from './modules/assets/assets.module';
import { ShipVisitsModule } from './modules/ship-visits/ship-visits.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { EventLogsModule } from './modules/event-logs/event-logs.module';
import { SimulationModule } from './modules/simulation/simulation.module';
import { KpisModule } from './modules/kpis/kpis.module';
import { ConflictsModule } from './modules/conflicts/conflicts.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { HealthModule } from './health/health.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('database'),
      inject: [ConfigService],
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    AssetsModule,
    ShipVisitsModule,
    SchedulesModule,
    TasksModule,
    WebSocketModule,
    EventLogsModule,
    SimulationModule,
    KpisModule,
    ConflictsModule,
    ChatbotModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
