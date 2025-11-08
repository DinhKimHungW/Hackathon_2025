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

    // Enable CORS - Support multiple origins
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : ['http://localhost:5173'];

    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // Heroku assigns a random port via PORT env variable
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0'); // Listen on all interfaces for Heroku

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
