"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSchema1730577600000 = void 0;
class InitialSchema1730577600000 {
    constructor() {
        this.name = 'InitialSchema1730577600000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "auth"`);
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "operations"`);
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "simulation"`);
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "analytics"`);
        await queryRunner.query(`
      CREATE TYPE "auth"."user_role_enum" AS ENUM('ADMIN', 'MANAGER', 'OPERATIONS', 'DRIVER')
    `);
        await queryRunner.query(`
      CREATE TYPE "operations"."asset_type_enum" AS ENUM('CRANE', 'TRUCK', 'REACH_STACKER', 'FORKLIFT', 'YARD_TRACTOR', 'OTHER')
    `);
        await queryRunner.query(`
      CREATE TYPE "operations"."asset_status_enum" AS ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OFFLINE')
    `);
        await queryRunner.query(`
      CREATE TYPE "operations"."ship_visit_status_enum" AS ENUM('PLANNED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'DEPARTED', 'CANCELLED')
    `);
        await queryRunner.query(`
      CREATE TYPE "operations"."schedule_status_enum" AS ENUM('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    `);
        await queryRunner.query(`
      CREATE TYPE "operations"."task_type_enum" AS ENUM('LOADING', 'UNLOADING', 'TRANSFER', 'INSPECTION', 'MAINTENANCE', 'OTHER')
    `);
        await queryRunner.query(`
      CREATE TYPE "operations"."task_status_enum" AS ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED')
    `);
        await queryRunner.query(`
      CREATE TYPE "simulation"."simulation_status_enum" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')
    `);
        await queryRunner.query(`
      CREATE TYPE "simulation"."conflict_type_enum" AS ENUM('RESOURCE_OVERLAP', 'TIME_OVERLAP', 'LOCATION_OVERLAP', 'CAPACITY_EXCEEDED')
    `);
        await queryRunner.query(`
      CREATE TYPE "simulation"."conflict_severity_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
    `);
        await queryRunner.query(`
      CREATE TYPE "analytics"."kpi_category_enum" AS ENUM('EFFICIENCY', 'UTILIZATION', 'PERFORMANCE', 'COST', 'QUALITY')
    `);
        await queryRunner.query(`
      CREATE TYPE "analytics"."event_type_enum" AS ENUM('USER_LOGIN', 'USER_LOGOUT', 'ASSET_UPDATE', 'SCHEDULE_CREATE', 'SCHEDULE_UPDATE', 'TASK_CREATE', 'TASK_UPDATE', 'SIMULATION_START', 'SIMULATION_COMPLETE', 'CONFLICT_DETECTED', 'CONFLICT_RESOLVED', 'SYSTEM_ERROR', 'DATA_EXPORT', 'DATA_IMPORT')
    `);
        await queryRunner.query(`
      CREATE TYPE "analytics"."event_severity_enum" AS ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL')
    `);
        console.log('Database schemas and enum types created successfully');
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TYPE IF EXISTS "analytics"."event_severity_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "analytics"."event_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "analytics"."kpi_category_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "simulation"."conflict_severity_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "simulation"."conflict_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "simulation"."simulation_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "operations"."task_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "operations"."task_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "operations"."schedule_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "operations"."ship_visit_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "operations"."asset_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "operations"."asset_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "auth"."user_role_enum"`);
        await queryRunner.query(`DROP SCHEMA IF EXISTS "analytics" CASCADE`);
        await queryRunner.query(`DROP SCHEMA IF EXISTS "simulation" CASCADE`);
        await queryRunner.query(`DROP SCHEMA IF EXISTS "operations" CASCADE`);
        await queryRunner.query(`DROP SCHEMA IF EXISTS "auth" CASCADE`);
    }
}
exports.InitialSchema1730577600000 = InitialSchema1730577600000;
//# sourceMappingURL=1730577600000-InitialSchema.js.map