"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TTL = exports.CACHE_KEYS = exports.redisConfig = void 0;
const cache_manager_redis_store_1 = require("cache-manager-redis-store");
const redisConfig = async (configService) => {
    try {
        const store = await (0, cache_manager_redis_store_1.redisStore)({
            socket: {
                host: configService.get('REDIS_HOST', 'localhost'),
                port: configService.get('REDIS_PORT', 6379),
                connectTimeout: 3000,
            },
            password: configService.get('REDIS_PASSWORD', undefined),
            database: configService.get('REDIS_DB', 0),
            ttl: configService.get('REDIS_TTL', 3600),
        });
        console.log('✅ Redis cache store connected');
        return {
            store: store,
            ttl: configService.get('REDIS_TTL', 3600),
            max: configService.get('REDIS_MAX_ITEMS', 100),
        };
    }
    catch (error) {
        console.warn('⚠️  Redis connection failed, falling back to in-memory cache');
        console.warn(`   Error: ${error.message}`);
        return {
            ttl: configService.get('REDIS_TTL', 3600),
            max: configService.get('REDIS_MAX_ITEMS', 100),
        };
    }
};
exports.redisConfig = redisConfig;
exports.CACHE_KEYS = {
    SIMULATION_RESULT: (id) => `sim:${id}:result`,
    CONFLICT_DETECTION: (scheduleId) => `conflict:${scheduleId}`,
    ASSET_AVAILABILITY: (assetId, startTime, endTime) => `asset:${assetId}:availability:${startTime}:${endTime}`,
    SCHEDULE_METRICS: (scheduleId) => `schedule:${scheduleId}:metrics`,
};
exports.CACHE_TTL = {
    SIMULATION_RESULT: 3600,
    CONFLICT_DETECTION: 1800,
    ASSET_AVAILABILITY: 600,
    SCHEDULE_METRICS: 900,
    SHORT: 300,
    LONG: 7200,
};
//# sourceMappingURL=redis.config.js.map