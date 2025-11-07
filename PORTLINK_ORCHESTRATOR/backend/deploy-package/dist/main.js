"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        app.enableCors({
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            credentials: true,
        });
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
    }
    catch (error) {
        console.error('❌ Fatal error during bootstrap:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map