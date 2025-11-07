-- PortLink Orchestrator - Database Initialization Script
-- Run this script as postgres superuser

-- Create database (if not exists)
-- Note: Run this separately first: CREATE DATABASE portlink_db;

-- Connect to the database
\c portlink_db

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS operations;
CREATE SCHEMA IF NOT EXISTS simulation;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Grant permissions (adjust username if needed)
GRANT ALL PRIVILEGES ON SCHEMA auth TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA operations TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA simulation TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA analytics TO postgres;

-- Create enum types for auth schema
DO $$ BEGIN
    CREATE TYPE auth.user_role_enum AS ENUM('ADMIN', 'MANAGER', 'OPERATIONS', 'DRIVER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum types for operations schema
DO $$ BEGIN
    CREATE TYPE operations.asset_type_enum AS ENUM('CRANE', 'TRUCK', 'REACH_STACKER', 'FORKLIFT', 'YARD_TRACTOR', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE operations.asset_status_enum AS ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OFFLINE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE operations.ship_visit_status_enum AS ENUM('PLANNED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'DEPARTED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE operations.schedule_status_enum AS ENUM('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE operations.task_type_enum AS ENUM('LOADING', 'UNLOADING', 'TRANSFER', 'INSPECTION', 'MAINTENANCE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE operations.task_status_enum AS ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum types for simulation schema
DO $$ BEGIN
    CREATE TYPE simulation.simulation_status_enum AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE simulation.conflict_type_enum AS ENUM('RESOURCE_OVERLAP', 'TIME_OVERLAP', 'LOCATION_OVERLAP', 'CAPACITY_EXCEEDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE simulation.conflict_severity_enum AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum types for analytics schema
DO $$ BEGIN
    CREATE TYPE analytics.kpi_category_enum AS ENUM('EFFICIENCY', 'UTILIZATION', 'PERFORMANCE', 'COST', 'QUALITY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE analytics.event_type_enum AS ENUM('USER_LOGIN', 'USER_LOGOUT', 'ASSET_UPDATE', 'SCHEDULE_CREATE', 'SCHEDULE_UPDATE', 'TASK_CREATE', 'TASK_UPDATE', 'SIMULATION_START', 'SIMULATION_COMPLETE', 'CONFLICT_DETECTED', 'CONFLICT_RESOLVED', 'SYSTEM_ERROR', 'DATA_EXPORT', 'DATA_IMPORT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE analytics.event_severity_enum AS ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Success message
SELECT 'Database schemas and enum types created successfully!' as status;
