import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
export declare const redisConfig: (configService: ConfigService) => Promise<CacheModuleOptions>;
export declare const CACHE_KEYS: {
    SIMULATION_RESULT: (id: string) => string;
    CONFLICT_DETECTION: (scheduleId: string) => string;
    ASSET_AVAILABILITY: (assetId: string, startTime: string, endTime: string) => string;
    SCHEDULE_METRICS: (scheduleId: string) => string;
};
export declare const CACHE_TTL: {
    SIMULATION_RESULT: number;
    CONFLICT_DETECTION: number;
    ASSET_AVAILABILITY: number;
    SCHEDULE_METRICS: number;
    SHORT: number;
    LONG: number;
};
