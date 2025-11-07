-- PortLink Orchestrator - Schedules Demo Data
-- Insert demo schedule data for testing

\c portlink_db

-- First, get or create ship visits (we'll use existing ones or create minimal data)
-- Check if ship visits exist, if not create sample ones
DO $$
DECLARE
    sv_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO sv_count FROM operations.ship_visits;
    
    IF sv_count = 0 THEN
        -- Create minimal ship visits for demo
        INSERT INTO operations.ship_visits (
            id, "vesselName", "vesselIMO", "voyageNumber", eta, etd, status, "createdAt", "updatedAt"
        ) VALUES 
            ('sv100000-0000-0000-0000-000000000001', 'MV Ocean Star', 'IMO9876543', 'VOY001', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '2 days', 'PLANNED', NOW(), NOW()),
            ('sv100000-0000-0000-0000-000000000002', 'MV Pacific Pearl', 'IMO9876544', 'VOY002', NOW() + INTERVAL '6 hours', NOW() + INTERVAL '3 days', 'PLANNED', NOW(), NOW()),
            ('sv100000-0000-0000-0000-000000000003', 'MV Atlantic Express', 'IMO9876545', 'VOY003', NOW() + INTERVAL '1 day', NOW() + INTERVAL '4 days', 'PLANNED', NOW(), NOW()),
            ('sv100000-0000-0000-0000-000000000004', 'MV Nordic Voyager', 'IMO9876546', 'VOY004', NOW() - INTERVAL '3 hours', NOW() + INTERVAL '1 day', 'ARRIVED', NOW(), NOW()),
            ('sv100000-0000-0000-0000-000000000005', 'MV Caribbean Queen', 'IMO9876547', 'VOY005', NOW() + INTERVAL '12 hours', NOW() + INTERVAL '2 days', 'PLANNED', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Created % demo ship visits', sv_count;
    END IF;
END $$;

-- Insert demo schedules using actual schema
INSERT INTO operations.schedules (
    id, 
    "shipVisitId", 
    "startTime", 
    "endTime", 
    status, 
    priority, 
    operation, 
    "completionPercentage",
    "actualStartTime",
    "actualEndTime",
    "estimatedDuration",
    "actualDuration",
    resources,
    notes,
    "createdAt",
    "updatedAt"
)
VALUES
    -- Active schedules
    (
        'sch10000-0000-4000-8000-000000000001',
        'sv100000-0000-4000-8000-000000000001',
        NOW() + INTERVAL '2 hours',
        NOW() + INTERVAL '6 hours',
        'SCHEDULED',
        10,
        'Ocean Star Arrival & Berthing',
        0,
        NULL,
        NULL,
        240,
        NULL,
        '{"berthId": "B1", "pilotRequired": true, "tugboatCount": 2}'::jsonb,
        'Pilot required at 06:00. Tugboats: 2 units. High priority vessel.',
        NOW(),
        NOW()
    ),
    (
        'sch10000-0000-4000-8000-000000000002',
        'sv100000-0000-4000-8000-000000000002',
        NOW() + INTERVAL '7 hours',
        NOW() + INTERVAL '30 hours',
        'SCHEDULED',
        8,
        'Pacific Pearl Unloading Operation',
        0,
        NULL,
        NULL,
        1380,
        NULL,
        '{"cranes": 3, "berthId": "B2", "cargoType": "BULK"}'::jsonb,
        'Requires 3 cranes. Weather dependent operation.',
        NOW(),
        NOW()
    ),
    (
        'sch10000-0000-0000-0000-000000000003',
        'sv100000-0000-0000-0000-000000000003',
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '2 days',
        'SCHEDULED',
        9,
        'Atlantic Express Container Loading',
        0,
        NULL,
        NULL,
        1440,
        NULL,
        '{"containers": 650, "cranes": 4, "berthId": "B3"}'::jsonb,
        '650 TEU to be loaded. Priority: High',
        NOW(),
        NOW()
    ),
    (
        'sch10000-0000-0000-0000-000000000004',
        'sv100000-0000-0000-0000-000000000004',
        NOW() - INTERVAL '2 hours',
        NOW() + INTERVAL '18 hours',
        'IN_PROGRESS',
        10,
        'Nordic Voyager Cargo Operations',
        60.5,
        NOW() - INTERVAL '2 hours',
        NULL,
        1200,
        NULL,
        '{"berthId": "B4", "cranes": 2, "personnel": 15}'::jsonb,
        'Currently in progress. 60% complete.',
        NOW(),
        NOW()
    ),
    (
        'sch10000-0000-0000-0000-000000000005',
        'sv100000-0000-0000-0000-000000000005',
        NOW() + INTERVAL '12 hours',
        NOW() + INTERVAL '15 hours',
        'SCHEDULED',
        7,
        'Caribbean Queen Arrival',
        0,
        NULL,
        NULL,
        180,
        NULL,
        '{"pilotRequired": true, "customsInspection": true}'::jsonb,
        'Customs inspection required.',
        NOW(),
        NOW()
    ),
    
    -- More schedules for the same ships (loading/unloading operations)
    (
        'sch10000-0000-0000-0000-000000000006',
        'sv100000-0000-0000-0000-000000000001',
        NOW() + INTERVAL '8 hours',
        NOW() + INTERVAL '20 hours',
        'PENDING',
        8,
        'Ocean Star Container Unloading',
        0,
        NULL,
        NULL,
        720,
        NULL,
        '{"containers": 450, "cranes": 3}'::jsonb,
        'Container discharge operation after berthing.',
        NOW(),
        NOW()
    ),
    (
        'sch10000-0000-0000-0000-000000000007',
        'sv100000-0000-0000-0000-000000000002',
        NOW() + INTERVAL '32 hours',
        NOW() + INTERVAL '48 hours',
        'PENDING',
        6,
        'Pacific Pearl Loading Operation',
        0,
        NULL,
        NULL,
        960,
        NULL,
        '{"cargoType": "GENERAL", "tonnage": 5000}'::jsonb,
        'General cargo loading after unloading complete.',
        NOW(),
        NOW()
    ),
    
    -- Completed schedules
    (
        'sch10000-0000-0000-0000-000000000008',
        'sv100000-0000-0000-0000-000000000004',
        NOW() - INTERVAL '24 hours',
        NOW() - INTERVAL '18 hours',
        'COMPLETED',
        5,
        'Nordic Voyager Arrival',
        100,
        NOW() - INTERVAL '24 hours',
        NOW() - INTERVAL '18 hours',
        360,
        360,
        '{"pilotRequired": true, "tugboatCount": 2}'::jsonb,
        'Successfully completed on time.',
        NOW(),
        NOW()
    ),
    (
        'sch10000-0000-0000-0000-000000000009',
        NULL,
        NOW() - INTERVAL '12 hours',
        NOW() - INTERVAL '6 hours',
        'COMPLETED',
        4,
        'Morning Cargo Transfer',
        100,
        NOW() - INTERVAL '12 hours',
        NOW() - INTERVAL '7 hours',
        360,
        300,
        '{"equipmentUsed": ["Forklift-01", "Forklift-02"]}'::jsonb,
        'Completed ahead of schedule.',
        NOW(),
        NOW()
    ),
    (
        'sch10000-0000-0000-0000-000000000010',
        NULL,
        NOW() - INTERVAL '48 hours',
        NOW() - INTERVAL '42 hours',
        'COMPLETED',
        3,
        'Berth Maintenance Check',
        100,
        NOW() - INTERVAL '48 hours',
        NOW() - INTERVAL '42 hours',
        360,
        360,
        '{"berthId": "B1", "maintenanceType": "INSPECTION"}'::jsonb,
        'Routine maintenance completed.',
        NOW(),
        NOW()
    ),
    
    -- Future schedules
    (
        'sch10000-0000-0000-0000-000000000011',
        'sv100000-0000-0000-0000-000000000001',
        NOW() + INTERVAL '24 hours',
        NOW() + INTERVAL '28 hours',
        'SCHEDULED',
        9,
        'Ocean Star Departure Preparation',
        0,
        NULL,
        NULL,
        240,
        NULL,
        '{"pilotRequired": true, "tugboatCount": 2}'::jsonb,
        'Departure preparation and pilot coordination.',
        NOW(),
        NOW()
    ),
    (
        'sch10000-0000-0000-0000-000000000012',
        NULL,
        NOW() + INTERVAL '3 days',
        NOW() + INTERVAL '3 days 8 hours',
        'SCHEDULED',
        5,
        'Weekly Equipment Inspection',
        0,
        NULL,
        NULL,
        480,
        NULL,
        '{"inspectionType": "SAFETY", "equipmentList": ["CRANE-01", "CRANE-02", "CRANE-03"]}'::jsonb,
        'Regular weekly equipment safety inspection.',
        NOW(),
        NOW()
    ),
    (
        'sch10000-0000-0000-0000-000000000013',
        'sv100000-0000-0000-0000-000000000005',
        NOW() + INTERVAL '16 hours',
        NOW() + INTERVAL '32 hours',
        'SCHEDULED',
        8,
        'Caribbean Queen Container Operations',
        0,
        NULL,
        NULL,
        960,
        NULL,
        '{"containers": 720, "cranes": 4, "operationType": "MIXED"}'::jsonb,
        'Mixed loading and unloading operations.',
        NOW(),
        NOW()
    ),
    (
        'sch10000-0000-0000-0000-000000000014',
        NULL,
        NOW() + INTERVAL '18 hours',
        NOW() + INTERVAL '26 hours',
        'SCHEDULED',
        6,
        'Night Shift Operations',
        0,
        NULL,
        NULL,
        480,
        NULL,
        '{"shift": "NIGHT", "personnel": 20, "lightingRequired": true}'::jsonb,
        'Night crew operations. Additional lighting deployed.',
        NOW(),
        NOW()
    ),
    
    -- Cancelled schedule
    (
        'sch10000-0000-0000-0000-000000000015',
        NULL,
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '2 days 4 hours',
        'CANCELLED',
        3,
        'Postponed Maintenance',
        0,
        NULL,
        NULL,
        240,
        NULL,
        '{"reason": "OPERATIONAL_PRIORITY"}'::jsonb,
        'Postponed due to urgent operational requirements.',
        NOW(),
        NOW()
    ),
    
    -- More diverse operations
    (
        'sch10000-0000-0000-0000-000000000016',
        'sv100000-0000-0000-0000-000000000003',
        NOW() + INTERVAL '28 hours',
        NOW() + INTERVAL '36 hours',
        'PENDING',
        7,
        'Atlantic Express Inspection',
        0,
        NULL,
        NULL,
        480,
        NULL,
        '{"inspectionType": "CUSTOMS", "cargoInspection": true}'::jsonb,
        'Customs and cargo inspection required.',
        NOW(),
        NOW()
    ),
    (
        'sch10000-0000-0000-0000-000000000017',
        NULL,
        NOW() + INTERVAL '4 days',
        NOW() + INTERVAL '4 days 6 hours',
        'SCHEDULED',
        8,
        'Hazmat Cargo Handling',
        0,
        NULL,
        NULL,
        360,
        NULL,
        '{"cargoType": "HAZMAT", "specialTeam": true, "safetyProtocol": "A1"}'::jsonb,
        'Certified hazmat team required. Full safety protocols.',
        NOW(),
        NOW()
    ),
    (
        'sch10000-0000-0000-0000-000000000018',
        NULL,
        NOW() + INTERVAL '5 days',
        NOW() + INTERVAL '5 days 4 hours',
        'SCHEDULED',
        4,
        'Monthly Crane Maintenance',
        0,
        NULL,
        NULL,
        240,
        NULL,
        '{"maintenanceType": "PREVENTIVE", "equipment": "CRANE-05"}'::jsonb,
        'Routine preventive maintenance for Crane #5.',
        NOW(),
        NOW()
    ),
    (
        'sch10000-0000-0000-0000-000000000019',
        NULL,
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '7 days 2 hours',
        'SCHEDULED',
        5,
        'Weekly Safety Drill',
        0,
        NULL,
        NULL,
        120,
        NULL,
        '{"drillType": "FIRE_EVACUATION", "allPersonnel": true}'::jsonb,
        'Weekly safety and evacuation drill.',
        NOW(),
        NOW()
    ),
    (
        'sch10000-0000-0000-0000-000000000020',
        'sv100000-0000-0000-0000-000000000003',
        NOW() + INTERVAL '50 hours',
        NOW() + INTERVAL '54 hours',
        'PENDING',
        9,
        'Atlantic Express Departure',
        0,
        NULL,
        NULL,
        240,
        NULL,
        '{"pilotRequired": true, "tugboatCount": 2, "priority": "HIGH"}'::jsonb,
        'High priority departure operation.',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

ON CONFLICT (id) DO NOTHING;

-- Display summary
SELECT 
    'Schedules Inserted' as info,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE status = 'SCHEDULED') as scheduled,
    COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
    COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed,
    COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled
FROM operations.schedules;

SELECT 
    'Time Distribution' as category,
    CASE 
        WHEN "startTime" < NOW() THEN 'Past'
        WHEN "startTime" < NOW() + INTERVAL '1 day' THEN 'Today/Tomorrow'
        WHEN "startTime" < NOW() + INTERVAL '7 days' THEN 'This Week'
        ELSE 'Future'
    END as time_range,
    COUNT(*) as count
FROM operations.schedules
GROUP BY time_range
ORDER BY 
    CASE time_range
        WHEN 'Past' THEN 1
        WHEN 'Today/Tomorrow' THEN 2
        WHEN 'This Week' THEN 3
        ELSE 4
    END;

-- Show sample schedules
SELECT 
    id,
    operation,
    status,
    priority,
    "startTime",
    "endTime",
    "completionPercentage",
    notes
FROM operations.schedules
ORDER BY "startTime"
LIMIT 10;

