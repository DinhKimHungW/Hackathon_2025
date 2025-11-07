import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

/**
 * Redis Cache Configuration
 * Used for simulation result caching to improve performance
 * Falls back to in-memory cache if Redis is unavailable
 */
export const redisConfig = async (
  configService: ConfigService,
): Promise<CacheModuleOptions> => {
  try {
    const store = await redisStore({
      socket: {
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        connectTimeout: 3000, // 3 second timeout
      },
      password: configService.get<string>('REDIS_PASSWORD', undefined),
      database: configService.get<number>('REDIS_DB', 0),
      ttl: configService.get<number>('REDIS_TTL', 3600), // 1 hour default
    });

    console.log('✅ Redis cache store connected');
    
    return {
      store: store as any, // Type workaround for cache-manager
      ttl: configService.get<number>('REDIS_TTL', 3600), // 1 hour
      max: configService.get<number>('REDIS_MAX_ITEMS', 100), // Max 100 items
    };
  } catch (error) {
    console.warn('⚠️  Redis connection failed, falling back to in-memory cache');
    console.warn(`   Error: ${error.message}`);
    
    // Fallback to in-memory cache
    return {
      ttl: configService.get<number>('REDIS_TTL', 3600), // 1 hour
      max: configService.get<number>('REDIS_MAX_ITEMS', 100), // Max 100 items
    };
  }
};

/**
 * Cache Key Patterns
 */
export const CACHE_KEYS = {
  // Simulation results - TTL: 1 hour
  SIMULATION_RESULT: (id: string) => `sim:${id}:result`,
  
  // Conflict detection results - TTL: 30 minutes
  CONFLICT_DETECTION: (scheduleId: string) => `conflict:${scheduleId}`,
  
  // Asset availability - TTL: 10 minutes (frequently changing)
  ASSET_AVAILABILITY: (assetId: string, startTime: string, endTime: string) => 
    `asset:${assetId}:availability:${startTime}:${endTime}`,
  
  // Schedule metrics - TTL: 15 minutes
  SCHEDULE_METRICS: (scheduleId: string) => `schedule:${scheduleId}:metrics`,
};

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  SIMULATION_RESULT: 3600, // 1 hour
  CONFLICT_DETECTION: 1800, // 30 minutes
  ASSET_AVAILABILITY: 600, // 10 minutes
  SCHEDULE_METRICS: 900, // 15 minutes
  SHORT: 300, // 5 minutes
  LONG: 7200, // 2 hours
};
