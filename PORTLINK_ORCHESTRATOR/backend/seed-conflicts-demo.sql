-- PortLink Orchestrator - Demo Conflicts Data
-- Creates realistic conflict scenarios for testing

\c portlink_db

-- First, ensure we have simulation runs to link conflicts to
-- Check if simulation schema and table exist
DO $$
BEGIN
    -- Create simulation schema if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'simulation') THEN
        CREATE SCHEMA simulation;
    END IF;

    -- Create simulation_runs table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'simulation' 
                   AND table_name = 'simulation_runs') THEN
        CREATE TABLE simulation.simulation_runs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "scenarioName" VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
            "inputParameters" JSONB NOT NULL DEFAULT '{}'::jsonb,
            "outputResults" JSONB,
            "startTime" TIMESTAMP,
            "endTime" TIMESTAMP,
            "executionTimeMs" INT,
            "conflictsDetected" INT DEFAULT 0,
            "utilizationRate" DECIMAL(5, 2),
            "estimatedCost" DECIMAL(10, 2),
            "createdBy" VARCHAR(100),
            "errorMessage" TEXT,
            "createdAt" TIMESTAMP DEFAULT NOW()
        );
    END IF;

    -- Create conflicts table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'simulation' 
                   AND table_name = 'conflicts') THEN
        CREATE TABLE simulation.conflicts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "simulationRunId" UUID NOT NULL,
            "conflictType" VARCHAR(50) NOT NULL,
            severity VARCHAR(20) NOT NULL,
            description TEXT NOT NULL,
            "affectedResources" JSONB NOT NULL,
            "conflictTime" TIMESTAMP NOT NULL,
            "suggestedResolution" JSONB,
            resolved BOOLEAN DEFAULT FALSE,
            "resolutionNotes" TEXT,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            FOREIGN KEY ("simulationRunId") REFERENCES simulation.simulation_runs(id) ON DELETE CASCADE
        );
        
        CREATE INDEX idx_conflicts_simulation_severity 
        ON simulation.conflicts("simulationRunId", severity);
        
        CREATE INDEX idx_conflicts_type_severity 
        ON simulation.conflicts("conflictType", severity);
    END IF;
END $$;

-- Clear existing demo conflicts
TRUNCATE simulation.conflicts RESTART IDENTITY CASCADE;

-- Insert demo simulation runs if they don't exist
INSERT INTO simulation.simulation_runs (id, "scenarioName", description, status, "inputParameters", "startTime", "endTime", "conflictsDetected", "createdAt")
VALUES 
    ('11111111-1111-1111-1111-111111111111'::UUID, 'Demo Simulation - Current Operations', 'Simulation of current port operations with realistic conflicts', 'COMPLETED', '{"scenario": "current_operations"}'::jsonb, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes', 3, NOW()),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'Peak Hour Traffic Simulation', 'Testing port capacity during peak traffic hours', 'COMPLETED', '{"scenario": "peak_traffic"}'::jsonb, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 4, NOW() - INTERVAL '1 day'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'Weekend Operations Test', 'Simulation of weekend operations with reduced staff', 'RUNNING', '{"scenario": "weekend_ops"}'::jsonb, NOW() - INTERVAL '15 minutes', NULL, 3, NOW() - INTERVAL '15 minutes')
ON CONFLICT (id) DO UPDATE SET
    "scenarioName" = EXCLUDED."scenarioName",
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    "inputParameters" = EXCLUDED."inputParameters",
    "startTime" = EXCLUDED."startTime",
    "endTime" = EXCLUDED."endTime",
    "conflictsDetected" = EXCLUDED."conflictsDetected";

-- Get IDs for schedules and assets to reference in conflicts
DO $$
DECLARE
    sim_run_1 UUID := '11111111-1111-1111-1111-111111111111';
    sim_run_2 UUID := '22222222-2222-2222-2222-222222222222';
    sim_run_3 UUID := '33333333-3333-3333-3333-333333333333';
    crane_1_id UUID;
    crane_2_id UUID;
    berth_b01 VARCHAR(50) := 'B-01';
    berth_b02 VARCHAR(50) := 'B-02';
    ship_ocean_star UUID;
    ship_pacific_pearl UUID;
BEGIN
    -- Get some asset IDs
    SELECT id INTO crane_1_id FROM operations.assets WHERE "assetCode" = 'CRN-01' LIMIT 1;
    SELECT id INTO crane_2_id FROM operations.assets WHERE "assetCode" = 'CRN-02' LIMIT 1;
    
    -- Get some ship IDs
    SELECT id INTO ship_ocean_star FROM operations.ship_visits WHERE "vesselName" = 'MV Ocean Star' LIMIT 1;
    SELECT id INTO ship_pacific_pearl FROM operations.ship_visits WHERE "vesselName" = 'MV Pacific Pearl' LIMIT 1;

    -- ============================================
    -- CRITICAL CONFLICTS (Immediate attention required)
    -- ============================================
    
    -- 1. Resource Double-Booking - CRITICAL
    INSERT INTO simulation.conflicts 
        ("simulationRunId", "conflictType", severity, description, "affectedResources", "conflictTime", "suggestedResolution", resolved, "resolutionNotes")
    VALUES
        (sim_run_3, 'RESOURCE_OVERLAP', 'CRITICAL', 
         'Quay Crane CRN-01 được lên lịch đồng thời cho 2 tàu khác nhau trong cùng khung giờ 14:00-16:00',
         jsonb_build_object(
             'resourceId', crane_1_id,
             'resourceName', 'Quay Crane 01',
             'conflicts', jsonb_build_array(
                 jsonb_build_object('shipId', ship_ocean_star, 'shipName', 'MV Ocean Star', 'berthLocation', 'B-01'),
                 jsonb_build_object('shipId', ship_pacific_pearl, 'shipName', 'MV Pacific Pearl', 'berthLocation', 'B-02')
             )
         ),
         NOW() + INTERVAL '2 hours',
         jsonb_build_object(
             'action', 'RESCHEDULE',
             'suggestion', 'Sử dụng Crane CRN-03 (đang available) cho MV Pacific Pearl hoặc dời lịch sang 16:00-18:00',
             'alternativeResources', jsonb_build_array('CRN-03', 'CRN-04')
         ),
         false,
         NULL);

    -- 2. Berth Capacity Exceeded - CRITICAL
    INSERT INTO simulation.conflicts 
        ("simulationRunId", "conflictType", severity, description, "affectedResources", "conflictTime", "suggestedResolution", resolved)
    VALUES
        (sim_run_3, 'CAPACITY_EXCEEDED', 'CRITICAL',
         'Bến B-01 vượt quá công suất: 2 tàu được lên lịch cùng lúc (MV Ocean Star và MV Atlantic Queen)',
         jsonb_build_object(
             'berthId', 'B-01',
             'maxCapacity', 1,
             'scheduledVessels', 2,
             'vessels', jsonb_build_array(
                 jsonb_build_object('vesselName', 'MV Ocean Star', 'eta', NOW() - INTERVAL '1 hour'),
                 jsonb_build_object('vesselName', 'MV Atlantic Queen', 'eta', NOW() + INTERVAL '30 minutes')
             )
         ),
         NOW() + INTERVAL '30 minutes',
         jsonb_build_object(
             'action', 'REASSIGN_BERTH',
             'suggestion', 'Chuyển MV Atlantic Queen sang bến B-03 (đang trống)',
             'alternativeBerths', jsonb_build_array('B-03', 'B-04', 'B-05')
         ),
         false);

    -- 3. Time Collision - HIGH
    INSERT INTO simulation.conflicts 
        ("simulationRunId", "conflictType", severity, description, "affectedResources", "conflictTime", "suggestedResolution", resolved)
    VALUES
        (sim_run_3, 'TIME_OVERLAP', 'HIGH',
         'Xung đột thời gian: Hoạt động "Container Loading" và "Container Unloading" cùng diễn ra tại Berth B-01 (15:00-17:00)',
         jsonb_build_object(
             'berthId', 'B-01',
             'overlappingOperations', jsonb_build_array(
                 jsonb_build_object('operation', 'Container Loading', 'timeRange', '15:00-17:00', 'shipName', 'MV Ocean Star'),
                 jsonb_build_object('operation', 'Container Unloading', 'timeRange', '15:30-16:30', 'shipName', 'MV Ocean Star')
             )
         ),
         NOW() + INTERVAL '1 hour',
         jsonb_build_object(
             'action', 'SEQUENCE_OPERATIONS',
             'suggestion', 'Hoàn thành Unloading trước (15:00-16:00), sau đó Loading (16:00-17:30)',
             'revisedSchedule', jsonb_build_object(
                 'unloading', '15:00-16:00',
                 'loading', '16:00-17:30'
             )
         ),
         false);

    -- ============================================
    -- HIGH SEVERITY CONFLICTS
    -- ============================================

    -- 4. Location Overlap - HIGH
    INSERT INTO simulation.conflicts 
        ("simulationRunId", "conflictType", severity, description, "affectedResources", "conflictTime", "suggestedResolution", resolved)
    VALUES
        (sim_run_2, 'LOCATION_OVERLAP', 'HIGH',
         'Container Yard Block A vượt quá công suất 85% trong giờ cao điểm (18:00-19:00)',
         jsonb_build_object(
             'yardBlock', 'A',
             'capacity', 500,
             'currentUtilization', 475,
             'utilizationRate', 95,
             'threshold', 85
         ),
         NOW() - INTERVAL '23 hours',
         jsonb_build_object(
             'action', 'REDISTRIBUTE',
             'suggestion', 'Di chuyển 50 container sang Yard Block B hoặc C',
             'alternativeLocations', jsonb_build_array('Yard Block B', 'Yard Block C')
         ),
         true,
         'Đã di chuyển 60 containers sang Yard Block B. Công suất hiện tại: 83%');

    -- 5. Resource Maintenance Conflict - HIGH
    INSERT INTO simulation.conflicts 
        ("simulationRunId", "conflictType", severity, description, "affectedResources", "conflictTime", "suggestedResolution", resolved)
    VALUES
        (sim_run_3, 'RESOURCE_OVERLAP', 'HIGH',
         'Crane CRN-05 được lên lịch bảo trì (16:00-19:00) nhưng vẫn có task được gán trong khoảng thời gian này',
         jsonb_build_object(
             'resourceId', crane_2_id,
             'resourceName', 'Quay Crane 05',
             'maintenanceWindow', '16:00-19:00',
             'conflictingTasks', jsonb_build_array(
                 jsonb_build_object('taskName', 'Load Container MAEU9999999', 'scheduledTime', '17:00-17:30')
             )
         ),
         NOW() + INTERVAL '4 hours',
         jsonb_build_object(
             'action', 'REASSIGN_RESOURCE',
             'suggestion', 'Sử dụng Crane CRN-03 hoặc dời bảo trì sang 20:00-23:00',
             'options', jsonb_build_array(
                 jsonb_build_object('option', 1, 'action', 'Use CRN-03'),
                 jsonb_build_object('option', 2, 'action', 'Reschedule maintenance to 20:00-23:00')
             )
         ),
         false);

    -- ============================================
    -- MEDIUM SEVERITY CONFLICTS
    -- ============================================

    -- 6. Personnel Shortage - MEDIUM
    INSERT INTO simulation.conflicts 
        ("simulationRunId", "conflictType", severity, description, "affectedResources", "conflictTime", "suggestedResolution", resolved)
    VALUES
        (sim_run_2, 'CAPACITY_EXCEEDED', 'MEDIUM',
         'Thiếu nhân lực: Cần 25 công nhân nhưng chỉ có 18 người có sẵn cho ca 20:00-00:00',
         jsonb_build_object(
             'shift', 'Night Shift (20:00-00:00)',
             'required', 25,
             'available', 18,
             'shortage', 7,
             'operations', jsonb_build_array('Bulk Cargo Unloading', 'Container Restowage')
         ),
         NOW() - INTERVAL '22 hours',
         jsonb_build_object(
             'action', 'ADJUST_SCHEDULE',
             'suggestion', 'Kéo dài ca làm việc hoặc gọi thêm người từ ca sáng (overtime)',
             'alternatives', jsonb_build_array(
                 'Extend shift to 02:00',
                 'Call 7 workers from morning shift for overtime',
                 'Postpone non-critical operations to next day'
             )
         ),
         true,
         'Đã gọi thêm 7 công nhân từ ca sáng làm overtime. Chi phí phát sinh: 350 USD');

    -- 7. Equipment Utilization - MEDIUM
    INSERT INTO simulation.conflicts 
        ("simulationRunId", "conflictType", severity, description, "affectedResources", "conflictTime", "suggestedResolution", resolved)
    VALUES
        (sim_run_1, 'CAPACITY_EXCEEDED', 'MEDIUM',
         'Reach Stacker RST-01 và RST-02 hoạt động quá tải (>90% trong 4 giờ liên tục)',
         jsonb_build_object(
             'resources', jsonb_build_array(
                 jsonb_build_object('code', 'RST-01', 'utilization', 92, 'duration', '4 hours'),
                 jsonb_build_object('code', 'RST-02', 'utilization', 94, 'duration', '4 hours')
             ),
             'recommendedMax', 85,
             'risk', 'Equipment breakdown, maintenance issues'
         ),
         NOW() - INTERVAL '90 minutes',
         jsonb_build_object(
             'action', 'ADD_RESOURCE',
             'suggestion', 'Đưa RST-03 vào hoạt động để phân tải công việc',
             'additionalResources', jsonb_build_array('RST-03')
         ),
         true,
         'Đã kích hoạt RST-03. Utilization trung bình giảm xuống 75%');

    -- ============================================
    -- LOW SEVERITY CONFLICTS (Warnings)
    -- ============================================

    -- 8. Minor Schedule Delay - LOW
    INSERT INTO simulation.conflicts 
        ("simulationRunId", "conflictType", severity, description, "affectedResources", "conflictTime", "suggestedResolution", resolved)
    VALUES
        (sim_run_1, 'TIME_OVERLAP', 'LOW',
         'Lịch trình "Safety Check" bị trễ 15 phút, có thể ảnh hưởng đến "Bulk Cargo Unloading"',
         jsonb_build_object(
             'delayedOperation', 'Safety Check',
             'delay', '15 minutes',
             'dependentOperation', 'Bulk Cargo Unloading',
             'impact', 'Minor - can be absorbed in buffer time'
         ),
         NOW() - INTERVAL '45 minutes',
         jsonb_build_object(
             'action', 'MONITOR',
             'suggestion', 'Theo dõi. Có đủ buffer time (30 phút) để hấp thụ delay này',
             'bufferTime', '30 minutes'
         ),
         true,
         'Delay đã được hấp thụ trong buffer time. Không ảnh hưởng đến lịch tổng thể');

    -- 9. Weather Advisory - LOW
    INSERT INTO simulation.conflicts 
        ("simulationRunId", "conflictType", severity, description, "affectedResources", "conflictTime", "suggestedResolution", resolved)
    VALUES
        (sim_run_3, 'TIME_OVERLAP', 'LOW',
         'Cảnh báo thời tiết: Gió mạnh cấp 6 dự kiến từ 22:00-02:00 có thể ảnh hưởng crane operations',
         jsonb_build_object(
             'weatherCondition', 'Strong winds (Level 6)',
             'timeRange', '22:00-02:00',
             'affectedOperations', jsonb_build_array('Crane operations', 'Container loading'),
             'safetyThreshold', 'Wind speed > 50 km/h requires crane shutdown'
         ),
         NOW() + INTERVAL '8 hours',
         jsonb_build_object(
             'action', 'PREPARE_CONTINGENCY',
             'suggestion', 'Chuẩn bị kế hoạch dự phòng: hoàn thành crane ops trước 22:00 hoặc hoãn đến sáng mai',
             'options', jsonb_build_array(
                 'Accelerate crane operations to finish before 22:00',
                 'Postpone to 06:00 tomorrow morning'
             )
         ),
         false);

    -- 10. Documentation Missing - LOW  
    INSERT INTO simulation.conflicts 
        ("simulationRunId", "conflictType", severity, description, "affectedResources", "conflictTime", "suggestedResolution", resolved)
    VALUES
        (sim_run_2, 'TIME_OVERLAP', 'LOW',
         'Thiếu manifest document cho MV Baltic Breeze - chưa ảnh hưởng đến operations nhưng cần xử lý trước khi tàu cập cảng',
         jsonb_build_object(
             'vesselName', 'MV Baltic Breeze',
             'missingDocuments', jsonb_build_array('Cargo Manifest', 'Dangerous Goods Declaration'),
             'eta', NOW() + INTERVAL '6 hours',
             'currentStatus', 'PLANNED'
         ),
         NOW() + INTERVAL '6 hours',
         jsonb_build_object(
             'action', 'REQUEST_DOCUMENTS',
             'suggestion', 'Liên hệ shipping agent để bổ sung documents trong vòng 4 giờ',
             'deadline', '4 hours before ETA',
             'contact', 'Coastal Shipping - +84 xxx xxx xxx'
         ),
         false);

END $$;

-- Summary of created conflicts
SELECT 
    'Created conflicts summary:' as info,
    COUNT(*) as total_conflicts,
    SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical,
    SUM(CASE WHEN severity = 'HIGH' THEN 1 ELSE 0 END) as high,
    SUM(CASE WHEN severity = 'MEDIUM' THEN 1 ELSE 0 END) as medium,
    SUM(CASE WHEN severity = 'LOW' THEN 1 ELSE 0 END) as low,
    SUM(CASE WHEN resolved = true THEN 1 ELSE 0 END) as resolved,
    SUM(CASE WHEN resolved = false THEN 1 ELSE 0 END) as unresolved
FROM simulation.conflicts;

-- Show conflicts by type
SELECT 
    "conflictType",
    COUNT(*) as count,
    SUM(CASE WHEN resolved = true THEN 1 ELSE 0 END) as resolved,
    SUM(CASE WHEN resolved = false THEN 1 ELSE 0 END) as unresolved
FROM simulation.conflicts
GROUP BY "conflictType"
ORDER BY count DESC;

-- Show recent unresolved conflicts
SELECT 
    severity,
    "conflictType",
    LEFT(description, 80) || '...' as description_preview,
    "conflictTime",
    resolved
FROM simulation.conflicts
WHERE resolved = false
ORDER BY 
    CASE severity
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        WHEN 'LOW' THEN 4
    END,
    "conflictTime" ASC
LIMIT 10;
