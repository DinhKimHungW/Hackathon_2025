-- Seed Conflicts Demo Data (Simplified)
\c portlink_db

-- Clear existing conflicts
TRUNCATE simulation.conflicts CASCADE;

-- Delete and re-insert simulation runs
DELETE FROM simulation.simulation_runs WHERE id IN (
    '11111111-1111-1111-1111-111111111111'::UUID,
    '22222222-2222-2222-2222-222222222222'::UUID,
    '33333333-3333-3333-3333-333333333333'::UUID
);

-- Insert simulation runs
INSERT INTO simulation.simulation_runs (
    id, "scenarioName", description, status, "inputParameters", 
    "startTime", "endTime", "conflictsDetected", "createdAt"
)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111'::UUID,
        'Demo Simulation - Current Operations',
        'Simulation of current port operations with realistic conflicts',
        'COMPLETED',
        '{"scenario": "current_operations"}'::jsonb,
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '30 minutes',
        3,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222222'::UUID,
        'Peak Hour Traffic Simulation',
        'Testing port capacity during peak traffic hours',
        'COMPLETED',
        '{"scenario": "peak_traffic"}'::jsonb,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '23 hours',
        4,
        NOW() - INTERVAL '1 day'
    ),
    (
        '33333333-3333-3333-3333-333333333333'::UUID,
        'Weekend Operations Test',
        'Simulation of weekend operations with reduced staff',
        'RUNNING',
        '{"scenario": "weekend_ops"}'::jsonb,
        NOW() - INTERVAL '15 minutes',
        NULL,
        3,
        NOW() - INTERVAL '15 minutes'
    );

-- Insert conflicts
INSERT INTO simulation.conflicts (
    "simulationRunId", "conflictType", severity, description,
    "affectedResources", "conflictTime", "suggestedResolution", resolved, "resolutionNotes"
)
VALUES
    -- CRITICAL #1: Resource Double-Booking
    (
        '33333333-3333-3333-3333-333333333333'::UUID,
        'RESOURCE_OVERLAP',
        'CRITICAL',
        'Quay Crane CRN-01 được lên lịch đồng thời cho 2 tàu khác nhau trong cùng khung giờ 14:00-16:00',
        '{
            "resourceId": "crane-01",
            "resourceName": "Quay Crane 01",
            "conflicts": [
                {"shipName": "MV Ocean Star", "berthLocation": "B-01"},
                {"shipName": "MV Pacific Pearl", "berthLocation": "B-02"}
            ]
        }'::jsonb,
        NOW() + INTERVAL '2 hours',
        '{
            "action": "RESCHEDULE",
            "suggestion": "Sử dụng Crane CRN-03 (đang available) cho MV Pacific Pearl hoặc dời lịch sang 16:00-18:00",
            "alternativeResources": ["CRN-03", "CRN-04"]
        }'::jsonb,
        false,
        NULL
    ),
    -- CRITICAL #2: Berth Capacity Exceeded
    (
        '33333333-3333-3333-3333-333333333333'::UUID,
        'CAPACITY_EXCEEDED',
        'CRITICAL',
        'Bến B-01 vượt quá công suất: 2 tàu được lên lịch cùng lúc',
        '{
            "berthId": "B-01",
            "maxCapacity": 1,
            "scheduledVessels": 2,
            "vessels": [
                {"vesselName": "MV Ocean Star"},
                {"vesselName": "MV Atlantic Queen"}
            ]
        }'::jsonb,
        NOW() + INTERVAL '30 minutes',
        '{
            "action": "REASSIGN_BERTH",
            "suggestion": "Chuyển MV Atlantic Queen sang bến B-03 (đang trống)",
            "alternativeBerths": ["B-03", "B-04", "B-05"]
        }'::jsonb,
        false,
        NULL
    ),
    -- HIGH #3: Time Collision
    (
        '33333333-3333-3333-3333-333333333333'::UUID,
        'TIME_OVERLAP',
        'HIGH',
        'Xung đột thời gian: Hoạt động "Container Loading" và "Container Unloading" cùng diễn ra tại Berth B-01',
        '{
            "berthId": "B-01",
            "overlappingOperations": [
                {"operation": "Container Loading", "timeRange": "15:00-17:00"},
                {"operation": "Container Unloading", "timeRange": "15:30-16:30"}
            ]
        }'::jsonb,
        NOW() + INTERVAL '1 hour',
        '{
            "action": "SEQUENCE_OPERATIONS",
            "suggestion": "Hoàn thành Unloading trước (15:00-16:00), sau đó Loading (16:00-17:30)"
        }'::jsonb,
        false,
        NULL
    ),
    -- HIGH #4: Location Overlap (RESOLVED)
    (
        '22222222-2222-2222-2222-222222222222'::UUID,
        'LOCATION_OVERLAP',
        'HIGH',
        'Container Yard Block A vượt quá công suất 85% trong giờ cao điểm',
        '{
            "yardBlock": "A",
            "capacity": 500,
            "currentUtilization": 475,
            "utilizationRate": 95
        }'::jsonb,
        NOW() - INTERVAL '23 hours',
        '{
            "action": "REDISTRIBUTE",
            "suggestion": "Di chuyển 50 container sang Yard Block B hoặc C"
        }'::jsonb,
        true,
        'Đã di chuyển 60 containers sang Yard Block B. Công suất hiện tại: 83%'
    ),
    -- HIGH #5: Resource Maintenance Conflict
    (
        '33333333-3333-3333-3333-333333333333'::UUID,
        'RESOURCE_OVERLAP',
        'HIGH',
        'Crane CRN-05 được lên lịch bảo trì nhưng vẫn có task được gán',
        '{
            "resourceName": "Quay Crane 05",
            "maintenanceWindow": "16:00-19:00",
            "conflictingTasks": [
                {"taskName": "Load Container MAEU9999999", "scheduledTime": "17:00-17:30"}
            ]
        }'::jsonb,
        NOW() + INTERVAL '4 hours',
        '{
            "action": "REASSIGN_RESOURCE",
            "suggestion": "Sử dụng Crane CRN-03 hoặc dời bảo trì sang 20:00-23:00"
        }'::jsonb,
        false,
        NULL
    ),
    -- MEDIUM #6: Personnel Shortage (RESOLVED)
    (
        '22222222-2222-2222-2222-222222222222'::UUID,
        'CAPACITY_EXCEEDED',
        'MEDIUM',
        'Thiếu nhân lực: Cần 25 công nhân nhưng chỉ có 18 người',
        '{
            "shift": "Night Shift (20:00-00:00)",
            "required": 25,
            "available": 18,
            "shortage": 7
        }'::jsonb,
        NOW() - INTERVAL '22 hours',
        '{
            "action": "ADJUST_SCHEDULE",
            "suggestion": "Kéo dài ca làm việc hoặc gọi thêm người từ ca sáng"
        }'::jsonb,
        true,
        'Đã gọi thêm 7 công nhân từ ca sáng làm overtime. Chi phí: 350 USD'
    ),
    -- MEDIUM #7: Equipment Utilization (RESOLVED)
    (
        '11111111-1111-1111-1111-111111111111'::UUID,
        'CAPACITY_EXCEEDED',
        'MEDIUM',
        'Reach Stacker RST-01 và RST-02 hoạt động quá tải (>90%)',
        '{
            "resources": [
                {"code": "RST-01", "utilization": 92},
                {"code": "RST-02", "utilization": 94}
            ]
        }'::jsonb,
        NOW() - INTERVAL '90 minutes',
        '{
            "action": "ADD_RESOURCE",
            "suggestion": "Đưa RST-03 vào hoạt động để phân tải"
        }'::jsonb,
        true,
        'Đã kích hoạt RST-03. Utilization trung bình giảm xuống 75%'
    ),
    -- LOW #8: Minor Schedule Delay (RESOLVED)
    (
        '11111111-1111-1111-1111-111111111111'::UUID,
        'TIME_OVERLAP',
        'LOW',
        'Lịch trình "Safety Check" bị trễ 15 phút',
        '{
            "delayedOperation": "Safety Check",
            "delay": "15 minutes",
            "impact": "Minor"
        }'::jsonb,
        NOW() - INTERVAL '45 minutes',
        '{
            "action": "MONITOR",
            "suggestion": "Theo dõi. Có đủ buffer time để hấp thụ delay"
        }'::jsonb,
        true,
        'Delay đã được hấp thụ trong buffer time'
    ),
    -- LOW #9: Weather Advisory
    (
        '33333333-3333-3333-3333-333333333333'::UUID,
        'TIME_OVERLAP',
        'LOW',
        'Cảnh báo thời tiết: Gió mạnh cấp 6 dự kiến từ 22:00-02:00',
        '{
            "weatherCondition": "Strong winds (Level 6)",
            "timeRange": "22:00-02:00",
            "affectedOperations": ["Crane operations"]
        }'::jsonb,
        NOW() + INTERVAL '8 hours',
        '{
            "action": "PREPARE_CONTINGENCY",
            "suggestion": "Hoàn thành crane ops trước 22:00 hoặc hoãn đến sáng mai"
        }'::jsonb,
        false,
        NULL
    ),
    -- LOW #10: Documentation Missing
    (
        '22222222-2222-2222-2222-222222222222'::UUID,
        'TIME_OVERLAP',
        'LOW',
        'Thiếu manifest document cho MV Baltic Breeze',
        '{
            "vesselName": "MV Baltic Breeze",
            "missingDocuments": ["Cargo Manifest", "Dangerous Goods Declaration"]
        }'::jsonb,
        NOW() + INTERVAL '6 hours',
        '{
            "action": "REQUEST_DOCUMENTS",
            "suggestion": "Liên hệ shipping agent để bổ sung documents"
        }'::jsonb,
        false,
        NULL
    );

-- Summary
SELECT 
    'Created ' || COUNT(*) || ' conflicts' as summary,
    SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical,
    SUM(CASE WHEN severity = 'HIGH' THEN 1 ELSE 0 END) as high,
    SUM(CASE WHEN severity = 'MEDIUM' THEN 1 ELSE 0 END) as medium,
    SUM(CASE WHEN severity = 'LOW' THEN 1 ELSE 0 END) as low,
    SUM(CASE WHEN resolved = true THEN 1 ELSE 0 END) as resolved,
    SUM(CASE WHEN resolved = false THEN 1 ELSE 0 END) as unresolved
FROM simulation.conflicts;

-- Show recent unresolved
SELECT 
    severity,
    "conflictType",
    LEFT(description, 60) || '...' as description,
    "conflictTime"
FROM simulation.conflicts
WHERE resolved = false
ORDER BY 
    CASE severity
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        WHEN 'LOW' THEN 4
    END,
    "conflictTime" ASC;
