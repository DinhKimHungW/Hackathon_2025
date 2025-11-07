import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    // Heroku provides DATABASE_URL in format: postgres://user:password@host:port/database
    const databaseUrl = process.env.DATABASE_URL;
    
    if (databaseUrl) {
      const url = new URL(databaseUrl);
      return {
        type: 'postgres',
        host: url.hostname,
        port: parseInt(url.port || '5432', 10),
        username: url.username,
        password: url.password,
        database: url.pathname.slice(1), // Remove leading '/'
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
        synchronize: false, // Always false in production
        logging: process.env.NODE_ENV !== 'production',
        autoLoadEntities: true,
        ssl: { rejectUnauthorized: false },
      };
    }

    // Fallback to individual environment variables
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'portlink_db',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      autoLoadEntities: true,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  },
);
