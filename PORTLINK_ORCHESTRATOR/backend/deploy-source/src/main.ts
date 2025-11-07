import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Enable CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('api/v1');

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');

    console.log(`
    ╔═══════════════════════════════════════════════╗
    ║   PortLink Orchestrator API Server           ║
    ║   Server running on port: ${port.toString().padEnd(19)} ║
    ║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(32)} ║
    ╚═══════════════════════════════════════════════╝
  `);
  } catch (error) {
    console.error('❌ Fatal error during bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
